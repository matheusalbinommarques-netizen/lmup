import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { cycleDate } from './operationalPlanning';
import { reconcileProductivity } from './productivityLifecycle';

const monday = '2026-11-02';
const time = (day: string) => vi.setSystemTime(new Date(`${day}T12:00:00`));
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  time(monday);
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const weekly = (title: string) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: monday,
    effort: 'medium',
    tracking: { method: 'time', target: 40 },
    recurrence: { kind: 'weekly', startDate: monday, days: [1] },
  });
const progress = async (taskId: number, value: number) => {
  const row = await ensureOccurrence(taskId, monday);
  await recordProgress({
    occurrenceId: row.id,
    expectedRevision: row.revision,
    requestId: crypto.randomUUID(),
    value,
    executedAt: new Date().toISOString(),
  });
  return (await db.occurrences.get(row.id))!;
};

it('o ciclo semanal alcança o dia da semana ocorrido há seis dias, sem perder nenhum dia', async () => {
  const task = (await db.tasks.get(await weekly('Semanal')))!;
  const expected: Record<string, string> = {
    '2026-11-02': '2026-11-02',
    '2026-11-03': '2026-11-02',
    '2026-11-07': '2026-11-02',
    '2026-11-08': '2026-11-02',
    '2026-11-09': '2026-11-09',
    '2026-11-15': '2026-11-09',
  };
  for (const [day, cycle] of Object.entries(expected))
    expect(cycleDate(task, day)).toBe(cycle);
});

it('o ciclo não existe antes do início, para tarefa pausada nem para arquivada', async () => {
  const task = (await db.tasks.get(await weekly('Limites')))!;
  expect(cycleDate(task, '2026-11-01')).toBeNull();
  expect(cycleDate({ ...task, planningPaused: true }, '2026-11-08')).toBeNull();
  expect(cycleDate({ ...task, archived: true }, '2026-11-08')).toBeNull();
});

it('a reconciliação substitui execução parcial do ciclo antigo, mas nunca marca uma concluída', async () => {
  const done = await progress(await weekly('Concluída no ciclo'), 40);
  const partial = await progress(await weekly('Parcial no ciclo'), 20);
  expect(done.status).toBe('completed');
  expect(partial.status).not.toBe('completed');
  const profile = await db.profile.get(1);
  const events = await db.activityEvents.count();
  time('2026-11-09');
  await reconcileProductivity();
  const after = (id: string) => db.occurrences.get(id);
  expect((await after(done.id))!.supersededBy).toBeUndefined();
  expect((await after(done.id))!.revision).toBe(done.revision);
  expect((await after(partial.id))!.supersededBy).toBe('2026-11-09');
  expect(await db.profile.get(1)).toEqual(profile);
  expect(await db.activityEvents.count()).toBe(events);
  await reconcileProductivity();
  expect((await after(partial.id))!.revision).toBe(partial.revision + 1);
});
