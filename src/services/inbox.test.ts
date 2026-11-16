import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ageLabel, dayCounts, inboxView, setTaskDay } from './inbox';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { readJourneySnapshot } from './journeyQuery';
import { todayView } from '$lib/journey/todayView';
import { createJourneyBackup, validateBackup } from './backupDataService';

const day = (date: string) => vi.setSystemTime(new Date(`${date}T12:00:00`));
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  day('2026-11-14');
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const create = (
  title: string,
  extra: Partial<Parameters<typeof saveTaskDefinition>[0]> = {},
) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    planToday: false,
    ...extra,
  });
const view = async () => {
  const snapshot = await readJourneySnapshot();
  return inboxView(snapshot, '2026-11-14');
};

describe('inboxView', () => {
  it('separates the inbox from someday and leaves dated work out', async () => {
    const inbox = await create('Ligar para o seguro');
    const someday = await create('Aprender a fazer pão', { someday: true });
    await create('Pagar luz', { plannedDate: '2026-11-14' });
    await create('Correr', {
      plannedDate: '2026-11-14',
      recurrence: { kind: 'daily', startDate: '2026-11-14' },
    });
    const result = await view();
    expect(result.inbox.map((item) => item.task.id)).toEqual([inbox]);
    expect(result.someday.map((task) => task.id)).toEqual([someday]);
  });

  it('marks items 14 days in the inbox for the weekly triage', async () => {
    day('2026-10-29');
    await create('Pesquisar plano de saúde');
    day('2026-11-11');
    await create('Organizar fotos');
    day('2026-11-14');
    const [recent, old] = (await view()).inbox;
    expect(ageLabel(recent)).toBe('capturada há 3 dias');
    expect(old.triage).toBe(true);
    expect(ageLabel(old)).toBe('na caixa há 16 dias');
  });

  it('keeps undated items out of the Hoje', async () => {
    await create('Ligar para o seguro');
    await create('Horta', { someday: true });
    const snapshot = await readJourneySnapshot();
    const today = todayView(snapshot, '2026-11-14');
    expect(today.planned).toEqual([]);
  });

  it('counts dated missions for the next seven days', async () => {
    await create('A', { plannedDate: '2026-11-16' });
    await create('B', { plannedDate: '2026-11-16' });
    await create('C', { plannedDate: '2026-11-30' });
    const counts = dayCounts((await readJourneySnapshot()).tasks, '2026-11-14');
    expect([...counts.values()]).toEqual([0, 0, 2, 0, 0, 0, 0]);
  });
});

describe('setTaskDay', () => {
  it('moves an inbox item to a day, to someday and back', async () => {
    const id = await create('Ligar para o seguro');
    await setTaskDay(id, { day: '2026-11-20' }, 'move-1');
    expect(await db.tasks.get(id)).toMatchObject({
      plannedDate: '2026-11-20',
    });
    expect((await db.tasks.get(id))!.someday).toBeUndefined();
    expect((await view()).inbox).toEqual([]);

    await setTaskDay(id, 'someday', 'move-2');
    expect(await db.tasks.get(id)).toMatchObject({
      plannedDate: null,
      someday: true,
    });
    expect((await view()).someday.map((task) => task.id)).toEqual([id]);

    await setTaskDay(id, 'inbox', 'move-3');
    expect((await db.tasks.get(id))!.someday).toBeUndefined();
    expect((await view()).inbox.map((item) => item.task.id)).toEqual([id]);
    expect(
      (await db.productivityAudit.toArray()).filter(
        (entry) => entry.action === 'set-day',
      ),
    ).toHaveLength(3);
  });

  it('puts an item in the Hoje when moved to today', async () => {
    const id = await create('Ligar para o seguro');
    await setTaskDay(id, { day: '2026-11-14' }, 'move-today');
    const today = todayView(await readJourneySnapshot(), '2026-11-14');
    expect(today.planned.map((row) => row.taskId)).toEqual([id]);
  });

  it('is idempotent per request and does not touch balances', async () => {
    const id = await create('Ligar para o seguro');
    const profile = await db.profile.get(1);
    await setTaskDay(id, { day: '2026-11-20' }, 'same-request');
    await setTaskDay(id, { day: '2026-11-21' }, 'same-request');
    expect((await db.tasks.get(id))!.plannedDate).toBe('2026-11-20');
    const after = await db.profile.get(1);
    expect([after!.gold, after!.xpCurrent, after!.food]).toEqual([
      profile!.gold,
      profile!.xpCurrent,
      profile!.food,
    ]);
    expect(await db.activityEvents.count()).toBe(0);
  });

  it('refuses past days, routines and items with progress', async () => {
    const id = await create('Ler 20 páginas', {
      tracking: { method: 'quantity', target: 20, unit: 'páginas' },
    });
    await expect(setTaskDay(id, { day: '2026-11-13' }, 'past')).rejects.toThrow(
      'Escolha hoje ou um dia futuro.',
    );
    const routine = await create('Correr', {
      plannedDate: '2026-11-14',
      recurrence: { kind: 'daily', startDate: '2026-11-14' },
    });
    await expect(setTaskDay(routine, 'someday', 'routine')).rejects.toThrow(
      'Rotinas e repetições',
    );
    const row = await ensureOccurrence(id, '2026-11-14');
    await recordProgress({
      occurrenceId: row.id,
      expectedRevision: row.revision,
      value: 5,
      executedAt: new Date().toISOString(),
      requestId: 'progress-1',
    });
    await expect(setTaskDay(id, 'someday', 'with-progress')).rejects.toThrow(
      'já tem progresso',
    );
    expect((await db.tasks.get(id))!.someday).toBeUndefined();
  });

  it('carries an opened occurrence without progress to the new day', async () => {
    const id = await create('Ligar para o seguro');
    const { id: rowId } = await ensureOccurrence(id, '2026-11-14');
    const stored = (await db.occurrences.get(rowId))!;
    await setTaskDay(id, { day: '2026-11-20' }, 'carry');
    const moved = await db.occurrences.get(rowId);
    expect(moved).toMatchObject({ plannedDate: '2026-11-20' });
    expect(moved!.revision).toBeGreaterThan(stored.revision);
  });

  it('carries an occurrence opened on a past day', async () => {
    const id = await create('Ligar para o seguro');
    const { id: rowId } = await ensureOccurrence(id, '2026-11-14');
    day('2026-11-16');
    await setTaskDay(id, { day: '2026-11-18' }, 'carry-past');
    expect(await db.occurrences.get(rowId)).toMatchObject({
      plannedDate: '2026-11-18',
    });
  });
});

describe('someday in the definition and backup', () => {
  it('drops someday when the mission gets a day or a routine', async () => {
    const id = await create('Horta', { someday: true });
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      title: 'Horta',
      requestId: crypto.randomUUID(),
      editId: id,
      expectedRevision: task.definitionRevision,
      plannedDate: '2026-11-20',
    });
    expect((await db.tasks.get(id))!.someday).toBeUndefined();
  });

  it('round-trips someday through the backup and rejects contradictions', async () => {
    await create('Horta', { someday: true });
    const backup = await createJourneyBackup();
    expect(() => validateBackup(backup)).not.toThrow();
    const broken = structuredClone(backup);
    const task = (broken.data.tasks as Record<string, unknown>[]).find(
      (row) => row.title === 'Horta',
    )!;
    task.plannedDate = '2026-11-20';
    expect(() => validateBackup(broken)).toThrow('algum dia');
    task.plannedDate = null;
    task.someday = 'sim';
    expect(() => validateBackup(broken)).toThrow('algum dia');
  });
});
