import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import type { Occurrence } from './productivityTypes';
import {
  dayTimeline,
  moveId,
  orderDay,
  saveDayOrder,
  setRowTime,
} from './dayOrder';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import {
  currentOccurrences,
  ensureOccurrence,
  recordProgress,
} from './occurrenceService';
import { completeTask, undoTask } from './taskService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const DAY = '2026-11-15';
const row = (id: string, extra: Partial<Occurrence> = {}) =>
  ({
    id,
    plannedTime: null,
    status: 'planned',
    value: 0,
    estimatedMinutes: null,
    ...extra,
  }) as Occurrence;
const ids = (rows: { id: string }[]) => rows.map((item) => item.id);
const at = (time: string) => new Date(`${DAY}T${time}:00`);

describe('ordem única do dia', () => {
  it('sem ordem manual segue o horário, sem horário no fim', () => {
    const rows = [
      row('livre'),
      row('dez', { plannedTime: '10:00' }),
      row('sete', { plannedTime: '07:00' }),
    ];
    expect(ids(orderDay(rows, DAY))).toEqual(['sete', 'dez', 'livre']);
  });
  it('a ordem manual vence o horário e vale só para o próprio dia', () => {
    const rows = [
      row('a', { plannedTime: '07:00', dayOrder: { day: DAY, rank: 30 } }),
      row('b', { dayOrder: { day: DAY, rank: 10 } }),
      row('c', { plannedTime: '09:00', dayOrder: { day: DAY, rank: 20 } }),
    ];
    expect(ids(orderDay(rows, DAY))).toEqual(['b', 'c', 'a']);
    expect(ids(orderDay(rows, '2026-11-16'))).toEqual(['a', 'c', 'b']);
  });
  it('item novo com hora entra antes da primeira hora maior; sem hora vai ao fim', () => {
    const rows = [
      row('manha', { plannedTime: '08:00', dayOrder: { day: DAY, rank: 10 } }),
      row('solta', { dayOrder: { day: DAY, rank: 20 } }),
      row('tarde', { plannedTime: '15:00', dayOrder: { day: DAY, rank: 30 } }),
      row('nova-hora', { plannedTime: '12:00' }),
      row('nova-livre'),
    ];
    expect(ids(orderDay(rows, DAY))).toEqual([
      'manha',
      'solta',
      'nova-hora',
      'tarde',
      'nova-livre',
    ]);
  });
  it('hoje, item sem hora entra antes da próxima hora fixa, não no fim do dia', () => {
    const rows = [
      row('cedo', { plannedTime: '07:00' }),
      row('dentista', { plannedTime: '16:00' }),
      row('livre'),
    ];
    expect(ids(orderDay(rows, DAY, '10:30'))).toEqual([
      'cedo',
      'livre',
      'dentista',
    ]);
    expect(ids(orderDay(rows, DAY, '17:00'))).toEqual([
      'cedo',
      'dentista',
      'livre',
    ]);
  });
  it('mover respeita os limites', () => {
    expect(moveId(['a', 'b', 'c'], 'c', -1)).toEqual(['a', 'c', 'b']);
    expect(moveId(['a', 'b', 'c'], 'a', -1)).toEqual(['a', 'b', 'c']);
    expect(moveId(['a', 'b', 'c'], 'c', 1)).toEqual(['a', 'b', 'c']);
    expect(moveId(['a', 'b', 'c'], 'x', 1)).toEqual(['a', 'b', 'c']);
  });
});

describe('horas do dia', () => {
  it('calcula a partir de agora com 15 min para quem não tem duração', () => {
    const { slots, conflicts } = dayTimeline(
      [
        row('a', { estimatedMinutes: 30 }),
        row('b'),
        row('c', { estimatedMinutes: 10 }),
      ],
      at('10:38'),
    );
    expect(
      slots.map((slot) => [slot.time, slot.kind, slot.defaultDuration]),
    ).toEqual([
      ['10:40', 'computed', false],
      ['11:10', 'computed', true],
      ['11:25', 'computed', false],
    ]);
    expect(conflicts).toEqual([]);
  });
  it('hora fixa reinicia o cálculo e avisa conflito só com durações reais', () => {
    const real = dayTimeline(
      [
        row('docs', { estimatedMinutes: 45 }),
        row('dentista', { plannedTime: '11:30', estimatedMinutes: 60 }),
        row('depois'),
      ],
      at('11:00'),
    );
    expect(real.slots.map((slot) => slot.time)).toEqual([
      '11:00',
      '11:30',
      '12:30',
    ]);
    expect(real.conflicts).toEqual([
      { id: 'docs', anchorId: 'dentista', end: '11:45', minutes: 15 },
    ]);
    const unknown = dayTimeline(
      [
        row('docs', { estimatedMinutes: 45 }),
        row('sem'),
        row('dentista', { plannedTime: '11:30' }),
      ],
      at('11:00'),
    );
    expect(unknown.conflicts).toEqual([]);
  });
  it('hora fixa que passou sem início fica esmaecida e não ocupa tempo; concluída fica no lugar', () => {
    const { slots } = dayTimeline(
      [
        row('feita', {
          status: 'completed',
          completedAt: `${DAY}T07:25:00`,
        }),
        row('passou', { plannedTime: '09:00', estimatedMinutes: 30 }),
        row('agora'),
      ],
      at('10:00'),
    );
    expect(slots.map((slot) => [slot.id, slot.time, slot.kind])).toEqual([
      ['feita', '07:25', 'done'],
      ['passou', '09:00', 'missed'],
      ['agora', '10:00', 'computed'],
    ]);
  });
});

describe('persistência da ordem e da hora', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${DAY}T09:00:00`));
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear();
    });
    invalidateHeroModifiersCache();
    await initializeJourney();
  });
  afterEach(() => vi.useRealTimers());

  const mission = (title: string, extra = {}) =>
    saveTaskDefinition({
      title,
      plannedDate: DAY,
      effort: 'small',
      tracking: { method: 'direct' },
      requestId: crypto.randomUUID(),
      ...extra,
    });

  it('grava só a ordem: progresso, recompensas e revisões ficam iguais; regravar não duplica', async () => {
    const a = await mission('Ler', {
      tracking: { method: 'time', target: 40 },
    });
    const b = await mission('Caminhar');
    const started = await ensureOccurrence(a);
    await recordProgress({
      occurrenceId: started.id,
      expectedRevision: started.revision,
      value: 10,
      executedAt: new Date().toISOString(),
      requestId: 'parcial-ordem',
    });
    const before = await db.occurrences.get(started.id);
    const profile = await db.profile.get(1);
    const events = await db.activityEvents.toArray();
    const rows = await currentOccurrences(DAY);
    const order = [...rows].sort((x) => (x.taskId === b ? -1 : 1));
    await saveDayOrder(DAY, order);
    await saveDayOrder(DAY, order);
    const stored = await db.occurrences.toArray();
    expect(stored).toHaveLength(2);
    const first = stored.find((item) => item.taskId === b)!;
    const second = (await db.occurrences.get(started.id))!;
    expect(first.dayOrder).toEqual({ day: DAY, rank: 10 });
    expect(second.dayOrder).toEqual({ day: DAY, rank: 20 });
    expect({ ...second, dayOrder: undefined }).toEqual({
      ...before,
      dayOrder: undefined,
    });
    expect(await db.profile.get(1)).toEqual(profile);
    expect(await db.activityEvents.toArray()).toEqual(events);
    expect(ids(orderDay(await currentOccurrences(DAY), DAY))).toEqual([
      first.id,
      second.id,
    ]);
  });

  it('concluir e desfazer mantêm a posição no dia', async () => {
    const a = await mission('Primeira');
    const b = await mission('Segunda');
    await saveDayOrder(
      DAY,
      [...(await currentOccurrences(DAY))].sort((x) =>
        x.taskId === b ? -1 : 1,
      ),
    );
    const event = await completeTask(b);
    expect(event).toBeTruthy();
    let rows = orderDay(await currentOccurrences(DAY), DAY);
    expect(rows.map((item) => [item.taskId, item.status])).toEqual([
      [b, 'completed'],
      [a, 'planned'],
    ]);
    await undoTask(b, event!.id);
    rows = orderDay(await currentOccurrences(DAY), DAY);
    expect(rows.map((item) => item.taskId)).toEqual([b, a]);
  });

  it('"só hoje" muda a ocorrência; "daqui para frente" muda a rotina e o dia seguinte', async () => {
    const a = await mission('Alongar');
    await saveRoutine({
      id: 'rotina-hora',
      name: 'Manhã',
      days: [0, 1, 2, 3, 4, 5, 6],
      startDate: DAY,
      entries: [{ taskId: a, time: '08:00' }],
    });
    const today = (await currentOccurrences(DAY)).find(
      (item) => item.taskId === a,
    )!;
    await setRowTime(today, '10:30', 'today');
    expect((await db.occurrences.get(today.id))?.plannedTime).toBe('10:30');
    expect((await db.tasks.get(a))?.plannedTime).toBe('08:00');
    expect((await db.routines.get('rotina-hora'))?.entries[0].time).toBe(
      '08:00',
    );

    await setRowTime(today, '07:15', 'forward');
    expect((await db.occurrences.get(today.id))?.plannedTime).toBe('07:15');
    expect((await db.tasks.get(a))?.plannedTime).toBe('07:15');
    expect((await db.routines.get('rotina-hora'))?.entries[0].time).toBe(
      '07:15',
    );

    // Reverter: tirar a hora fixa volta ao cálculo pela ordem.
    await setRowTime(today, null, 'today');
    expect((await db.occurrences.get(today.id))?.plannedTime).toBeNull();
    await expect(setRowTime(today, '25:00', 'today')).rejects.toThrow(
      'horário válido',
    );
    expect((await db.occurrences.get(today.id))?.plannedTime).toBeNull();
  });

  it('missão avulsa muda a própria hora, sem duplicar ocorrência', async () => {
    const a = await mission('Pagar conta');
    const today = (await currentOccurrences(DAY))[0];
    await setRowTime(today, '14:00', 'today');
    await setRowTime(today, '14:00', 'today');
    expect((await db.tasks.get(a))?.plannedTime).toBe('14:00');
    const stored = await db.occurrences.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].plannedTime).toBe('14:00');
  });

  it('a ordem sobrevive ao backup e uma ordem inválida é recusada', async () => {
    await mission('Ler');
    await saveDayOrder(DAY, await currentOccurrences(DAY));
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await restoreJourneyBackup(backup);
    expect((await db.occurrences.toArray())[0].dayOrder).toEqual({
      day: DAY,
      rank: 10,
    });
    const broken = structuredClone(backup);
    const tables = broken.data ?? broken;
    const list = (tables.occurrences ?? tables.tables?.occurrences) as {
      dayOrder: unknown;
    }[];
    list[0].dayOrder = { day: DAY, rank: -1 };
    expect(() => validateBackup(broken)).toThrow('ordem do dia');
  });
});
