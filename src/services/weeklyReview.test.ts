import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type ActivityEvent, type Task } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask, undoTask } from './taskService';
import { saveRoutine } from './routineService';
import {
  changeOccurrence,
  ensureOccurrence,
  plannedOccurrences,
} from './occurrenceService';
import { saveCheckin } from './lifeWheelService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import type {
  ExecutionRecord,
  Occurrence,
  ProductivityAudit,
  Routine,
} from './productivityTypes';
import {
  completeReview,
  recordDecision,
  rescheduleSuggestions,
  reviewStatus,
  reviewWeek,
  routineSuggestions,
  routineToWeekdays,
  weekStart,
  weekSummary,
  type WeekInput,
} from './weeklyReview';

// Semana de domingo, 8, a sábado, 14 de novembro de 2026.
const WEEK = '2026-11-08';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-16T10:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const task = (id: number, extra: Partial<Task> = {}) =>
  ({ id, title: `Missão ${id}`, areaId: 0, effort: 'small', ...extra }) as Task;
const row = (
  id: string,
  taskId: number,
  plannedDate: string,
  extra: Partial<Occurrence> = {},
) =>
  ({
    id,
    taskId,
    originDate: plannedDate,
    plannedDate,
    status: 'planned',
    value: 0,
    ...extra,
  }) as Occurrence;
const done = (
  id: string,
  taskId: number,
  date: string,
  extra: Partial<ActivityEvent> = {},
) => ({ id, kind: 'task', taskId, date, ...extra }) as ActivityEvent;
const input = (extra: Partial<WeekInput>): WeekInput => ({
  tasks: [],
  events: [],
  occurrences: [],
  rows: [],
  executionRecords: [],
  areas: [],
  routines: [],
  audits: [],
  ...extra,
});

describe('calendário', () => {
  it('sábado revisa a semana corrente; de domingo a sexta, a última encerrada', () => {
    expect(weekStart('2026-11-14')).toBe(WEEK);
    expect(reviewWeek('2026-11-14')).toBe(WEEK);
    expect(reviewWeek('2026-11-15')).toBe(WEEK);
    expect(reviewWeek('2026-11-20')).toBe(WEEK);
    expect(reviewWeek('2026-11-21')).toBe('2026-11-15');
  });

  it('nunca feita, disponível e em dia; semanas perdidas não viram fila', () => {
    expect(reviewStatus(undefined, '2026-11-16')).toMatchObject({
      kind: 'never',
      week: WEEK,
      availableSince: '2026-11-14',
      nextFrom: '2026-11-21',
    });
    const old = {
      week: '2026-10-18',
      startedAt: '2026-10-24T10:00:00.000Z',
      doneAt: '2026-10-24T10:05:00.000Z',
      skipped: [],
      decisions: [],
    };
    const later = reviewStatus({ version: 1, reviews: [old] }, '2026-11-16');
    expect(later).toMatchObject({ kind: 'available', week: WEEK });
    expect(later.last?.week).toBe('2026-10-18');
    const current = { ...old, week: WEEK, doneAt: '2026-11-15T09:00:00.000Z' };
    expect(
      reviewStatus({ version: 1, reviews: [old, current] }, '2026-11-16'),
    ).toMatchObject({ kind: 'done', nextFrom: '2026-11-21' });
  });
});

describe('a semana', () => {
  it('conta cada conclusão uma vez e ignora estorno, parcial e correção a zero', () => {
    const summary = weekSummary(
      input({
        tasks: [1, 2, 3, 4, 5].map((id) => task(id)),
        rows: [
          row('a', 1, '2026-11-09', { status: 'completed' }),
          row('b', 2, '2026-11-10'),
          row('c', 3, '2026-11-11', { value: 0 }),
          row('d', 4, '2026-11-12'),
          // Remarcada para fora da semana: não conta como planejada aqui.
          row('e', 5, '2026-11-20', { originDate: '2026-11-12' }),
        ],
        occurrences: [row('c', 3, '2026-11-11', { value: 0 })],
        events: [
          done('1', 1, '2026-11-09', { occurrenceId: 'a' }),
          // A mesma ocorrência concluída de novo depois de um estorno.
          done('2', 1, '2026-11-09', {
            occurrenceId: 'a',
            reversedAt: '2026-11-09T12:00:00.000Z',
          }),
          done('3', 2, '2026-11-10', { executionComplete: false }),
          done('4', 3, '2026-11-11', { occurrenceId: 'c' }),
          // Conclusão antiga, sem ocorrência: liga-se à linha planejada.
          done('5', 4, '2026-11-12'),
        ],
      }),
      WEEK,
      '2026-11-16',
    );
    expect(summary).toMatchObject({
      from: WEEK,
      to: '2026-11-14',
      days: 7,
      completed: 2,
      planned: 4,
    });
  });

  it('dia com ação é conclusão ou progresso registrado, não plano', () => {
    const summary = weekSummary(
      input({
        tasks: [task(1, { areaId: 2 }), task(2, { effort: 'micro' })],
        areas: [{ id: 2, nome: 'Casa' } as never],
        rows: [row('a', 1, '2026-11-09'), row('b', 2, '2026-11-13')],
        occurrences: [
          row('a', 1, '2026-11-09'),
          row('b', 2, '2026-11-13', { status: 'completed', value: 1 }),
        ],
        events: [done('1', 2, '2026-11-13', { occurrenceId: 'b' })],
        executionRecords: [
          {
            occurrenceId: 'a',
            before: 0,
            after: 10,
            localDate: '2026-11-10',
            correction: false,
          },
          // Correção não é ação.
          {
            occurrenceId: 'a',
            before: 10,
            after: 0,
            localDate: '2026-11-11',
            correction: true,
          },
        ] as ExecutionRecord[],
      }),
      WEEK,
      '2026-11-16',
    );
    expect(summary.activeDays).toBe(2);
    expect(summary.effort).toEqual([
      { key: 'micro', label: 'Microação', count: 1 },
    ]);
    expect(summary.byArea).toEqual([
      { areaId: 0, name: 'Geral', completed: 1, activeDays: 1 },
    ]);
  });

  it('no sábado usa os dados até hoje', () => {
    const summary = weekSummary(
      input({
        tasks: [task(1)],
        rows: [row('a', 1, '2026-11-14')],
      }),
      WEEK,
      '2026-11-14',
    );
    expect(summary).toMatchObject({ to: '2026-11-14', planned: 1 });
  });

  it('com os serviços reais: concluir e desfazer não duplicam nem somem', async () => {
    vi.setSystemTime(new Date('2026-11-10T10:00:00'));
    const a = await saveTaskDefinition({
      title: 'Pagar conta',
      requestId: crypto.randomUUID(),
      plannedDate: '2026-11-10',
      planToday: false,
    });
    const b = await saveTaskDefinition({
      title: 'Ler',
      requestId: crypto.randomUUID(),
      plannedDate: '2026-11-10',
      planToday: false,
    });
    await completeTask(a);
    await completeTask(b);
    await undoTask(b);
    vi.setSystemTime(new Date('2026-11-16T10:00:00'));
    const snapshot = {
      tasks: await db.tasks.toArray(),
      events: await db.activityEvents.toArray(),
      occurrences: await db.occurrences.toArray(),
      rows: await plannedOccurrences(WEEK, '2026-11-14'),
      executionRecords: await db.executionRecords.toArray(),
    };
    const summary = weekSummary(input(snapshot), WEEK, '2026-11-16');
    expect(summary).toMatchObject({ completed: 1, planned: 2, activeDays: 1 });
  });
});

describe('remarcação e conclusão não contam duas vezes', () => {
  it('remarcada duas vezes dentro da semana e concluída: 1 de 1', async () => {
    vi.setSystemTime(new Date('2026-11-09T09:00:00'));
    const id = await saveTaskDefinition({
      title: 'Ligar para o banco',
      requestId: crypto.randomUUID(),
      plannedDate: '2026-11-10',
      planToday: false,
    });
    const row = await ensureOccurrence(id, '2026-11-10');
    await changeOccurrence(
      row.id,
      (await db.occurrences.get(row.id))!.revision,
      { plannedDate: '2026-11-12' },
      'move-1',
    );
    await changeOccurrence(
      row.id,
      (await db.occurrences.get(row.id))!.revision,
      { plannedDate: '2026-11-13' },
      'move-2',
    );
    vi.setSystemTime(new Date('2026-11-13T18:00:00'));
    await completeTask(id);
    vi.setSystemTime(new Date('2026-11-16T10:00:00'));
    const summary = weekSummary(
      input({
        tasks: await db.tasks.toArray(),
        events: await db.activityEvents.toArray(),
        occurrences: await db.occurrences.toArray(),
        rows: await plannedOccurrences(WEEK, '2026-11-14'),
        executionRecords: await db.executionRecords.toArray(),
      }),
      WEEK,
      '2026-11-16',
    );
    expect(summary).toMatchObject({ completed: 1, planned: 1, activeDays: 1 });
  });

  it('conclusão antiga sem ocorrência liga-se à linha remarcada', () => {
    const summary = weekSummary(
      input({
        tasks: [task(1)],
        rows: [
          row('r', 1, '2026-11-12', {
            originDate: '2026-11-10',
            status: 'completed',
            value: 1,
          }),
        ],
        events: [done('1', 1, '2026-11-12')],
      }),
      WEEK,
      '2026-11-16',
    );
    expect(summary).toMatchObject({ completed: 1, planned: 1 });
  });
});

describe('a próxima semana', () => {
  const routine = (days: number[]) =>
    ({
      id: 'noite',
      name: 'Rotina da noite',
      days,
      status: 'active',
      entries: [{ taskId: 9, time: null, previousPlan: {} }],
    }) as unknown as Routine;
  const nights = (doneOn: string[]) =>
    ['09', '10', '11', '12', '13', '14', '08'].map((d) =>
      row(`n${d}`, 9, `2026-11-${d}`, {
        routineId: 'noite',
        status: doneOn.includes(d) ? 'completed' : 'planned',
      }),
    );

  it('rotina feita em menos da metade dos dias encerrados vira sugestão', () => {
    const [suggestion] = routineSuggestions(
      input({
        tasks: [task(9, { recurrence: { kind: 'daily' } as never })],
        routines: [routine([0, 1, 2, 3, 4, 5, 6])],
        rows: nights(['09', '12']),
      }),
      WEEK,
      '2026-11-16',
    );
    expect(suggestion).toMatchObject({
      id: 'routine:noite',
      doneDays: 2,
      scheduledDays: 7,
      weekdaysOption: true,
    });
    // Metade ou mais não gera sugestão; só dias úteis não oferece "dias úteis".
    expect(
      routineSuggestions(
        input({
          tasks: [task(9)],
          routines: [routine([0, 1, 2, 3, 4, 5, 6])],
          rows: nights(['09', '10', '11', '12']),
        }),
        WEEK,
        '2026-11-16',
      ),
    ).toEqual([]);
  });

  it('no sábado, o dia de hoje não conta contra a rotina', () => {
    const [suggestion] = routineSuggestions(
      input({
        tasks: [task(9)],
        routines: [routine([1, 2, 3, 4, 5, 6])],
        rows: nights(['09', '10']).filter((r) => r.plannedDate !== WEEK),
      }),
      WEEK,
      '2026-11-14',
    );
    expect(suggestion).toMatchObject({ scheduledDays: 5, doneDays: 2 });
  });

  it('remarcação: 3 ou mais em 28 dias, sem contar a mesma ação duas vezes', () => {
    const audit = (
      action: string,
      at: string,
      before: object,
      after: object,
      entityId = 'x',
    ) =>
      ({
        id: crypto.randomUUID(),
        action,
        entityId,
        recordedAt: at,
        before,
        after,
      }) as ProductivityAudit;
    const move = (at: string) =>
      audit(
        'reschedule',
        at,
        { taskId: 5, plannedDate: '2026-11-01' },
        { taskId: 5, plannedDate: '2026-11-02' },
      );
    const audits = [
      move('2026-10-30T10:00:00.000Z'),
      // O Hoje e a ocorrência gravam a mesma ação: conta uma vez.
      audit('today-reschedule', '2026-10-30T10:00:01.000Z', { taskId: 5 }, {}),
      move('2026-11-05T10:00:00.000Z'),
      // Só a hora mudou: não é remarcação.
      audit(
        'reschedule',
        '2026-11-06T10:00:00.000Z',
        { taskId: 5, plannedDate: '2026-11-06', plannedTime: '09:00' },
        { taskId: 5, plannedDate: '2026-11-06', plannedTime: '10:00' },
      ),
      audit(
        'set-day',
        '2026-11-12T10:00:00.000Z',
        { plannedDate: '2026-11-12' },
        { plannedDate: '2026-11-13' },
        'task:5',
      ),
      // Fora da janela de 28 dias.
      move('2026-10-01T10:00:00.000Z'),
    ];
    const tasks = [task(5, { title: 'Ligar para o seguro' })];
    const [suggestion] = rescheduleSuggestions(
      input({ tasks, audits }),
      WEEK,
      '2026-11-16',
    );
    expect(suggestion).toMatchObject({
      id: 'reschedule:5',
      count: 3,
      somedayOption: true,
    });
    expect(
      rescheduleSuggestions(
        input({ tasks, audits: audits.slice(0, 3) }),
        WEEK,
        '2026-11-16',
      ),
    ).toEqual([]);
  });
});

describe('ações aceitas', () => {
  it('"Só dias úteis" muda a rotina dali em diante e preserva o histórico', async () => {
    vi.setSystemTime(new Date('2026-11-01T09:00:00'));
    const make = (title: string) =>
      saveTaskDefinition({
        title,
        requestId: crypto.randomUUID(),
        plannedDate: '2026-11-01',
        planToday: false,
      });
    const walk = await make('Caminhar'),
      market = await make('Feira');
    await saveRoutine({
      id: 'manha',
      name: 'Manhã',
      days: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-01',
      entries: [
        { taskId: walk, time: '07:00' },
        { taskId: market, time: '08:00', days: [0, 6] },
      ],
    });
    // Sábado, 14: a caminhada foi feita.
    vi.setSystemTime(new Date('2026-11-14T09:00:00'));
    const [saturday] = (
      await plannedOccurrences('2026-11-14', '2026-11-14')
    ).filter((r) => r.taskId === walk);
    await completeTask(walk);
    const before = (await db.occurrences.get(saturday.id))!;
    expect(before.value).toBeGreaterThan(0);

    vi.setSystemTime(new Date('2026-11-16T10:00:00'));
    await routineToWeekdays('manha');
    const routine = (await db.routines.get('manha'))!;
    expect(routine.days).toEqual([1, 2, 3, 4, 5]);
    // Só tinha fim de semana: passa a seguir a rotina.
    expect(routine.entries.map((e) => e.days ?? null)).toEqual([null, null]);
    expect(await db.occurrences.get(saturday.id)).toEqual(before);
    const next = await plannedOccurrences('2026-11-16', '2026-11-22');
    const days = (taskId: number) =>
      next
        .filter((r) => r.taskId === taskId)
        .map((r) => new Date(`${r.plannedDate}T12:00:00`).getDay());
    expect(days(walk)).toEqual([1, 2, 3, 4, 5]);
    expect(days(market)).toEqual([1, 2, 3, 4, 5]);
    // Repetir não muda nada além da revisão da rotina.
    await routineToWeekdays('manha');
    expect((await db.routines.get('manha'))!.days).toEqual([1, 2, 3, 4, 5]);
    await expect(routineToWeekdays('sumiu')).rejects.toThrow('não está mais');
  });
});

describe('registro da revisão', () => {
  it('guarda o histórico por semana, sem duplicar decisões nem conclusões', async () => {
    await recordDecision(WEEK, {
      id: 'routine:noite',
      outcome: 'declined',
    });
    await recordDecision(WEEK, { id: 'routine:noite', outcome: 'accepted' });
    await completeReview(WEEK, ['wheel'], {
      completed: 2,
      planned: 4,
      activeDays: 2,
    });
    const first = (await db.profile.get(1))!.weeklyReview!.reviews[0];
    await completeReview(WEEK, [], { completed: 9, planned: 9, activeDays: 9 });
    await completeReview('2026-11-15', ['week', 'wheel', 'next']);
    const state = (await db.profile.get(1))!.weeklyReview!;
    expect(state.reviews).toHaveLength(2);
    expect(state.reviews[0]).toEqual(first);
    expect(state.reviews[0].decisions).toEqual([
      expect.objectContaining({ id: 'routine:noite', outcome: 'declined' }),
    ]);
    expect(state.reviews[0].summary).toEqual({
      completed: 2,
      planned: 4,
      activeDays: 2,
    });
    // Pular os três passos e concluir é permitido.
    expect(state.reviews[1].skipped).toEqual(['week', 'wheel', 'next']);
    await expect(completeReview('2026-11-10', [])).rejects.toThrow(
      'Semana inválida',
    );
  });

  it('recusar, ignorar e concluir a revisão não mexem na Roda, no progresso nem nas recompensas', async () => {
    const id = await saveTaskDefinition({
      title: 'Pagar conta',
      requestId: crypto.randomUUID(),
      plannedDate: '2026-11-16',
      planToday: false,
    });
    await completeTask(id);
    await saveCheckin({ home: 4 });
    const snapshot = async () => {
      const out: Record<string, unknown> = {};
      for (const table of db.tables) out[table.name] = await table.toArray();
      const [profile] = out.profile as Record<string, unknown>[];
      out.profile = { ...profile, weeklyReview: undefined };
      return out;
    };
    const before = await snapshot();
    await recordDecision(WEEK, { id: 'routine:noite', outcome: 'declined' });
    await recordDecision(WEEK, { id: 'reschedule:1', outcome: 'declined' });
    // Ignorar: nenhuma chamada. Concluir pulando a Roda.
    await completeReview(WEEK, ['wheel']);
    await completeReview(WEEK, []);
    expect(await snapshot()).toEqual(before);
    const [entry] = (await db.profile.get(1))!.weeklyReview!.reviews;
    expect(entry.decisions.map((d) => d.outcome)).toEqual([
      'declined',
      'declined',
    ]);
    expect(entry.skipped).toEqual(['wheel']);
  });

  it('backup leva o histórico, restaura e recusa formato inválido', async () => {
    await recordDecision(WEEK, {
      id: 'triage:4',
      outcome: 'accepted',
      action: 'someday',
    });
    await completeReview(WEEK, []);
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await db.profile.update(1, { weeklyReview: undefined });
    await restoreJourneyBackup(backup);
    const restored = (await db.profile.get(1))!.weeklyReview!;
    expect(restored.reviews[0]).toMatchObject({
      week: WEEK,
      decisions: [{ id: 'triage:4', outcome: 'accepted', action: 'someday' }],
    });
    backup.data.profile.weeklyReview.reviews[0].week = '2026-11-09';
    expect(() => validateBackup(backup)).toThrow('Revisão semanal');
    backup.data.profile.weeklyReview.reviews[0].week = WEEK;
    backup.data.profile.weeklyReview.reviews[0].decisions[0].outcome =
      'ignored';
    expect(() => validateBackup(backup)).toThrow('Revisão semanal');
  });
});
