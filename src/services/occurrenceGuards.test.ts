import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import {
  ensureOccurrence,
  previewProgress,
  recordProgress,
} from './occurrenceService';
import { skipMission } from './missionActions';
import { newSavedSession, saveSession } from './savedSessionService';

const today = '2026-11-02';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${today}T12:00:00`));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const create = (title: string, plannedDate = today) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate,
    effort: 'medium',
    tracking: { method: 'time', target: 40 },
  });
async function routineOccurrence(title: string) {
  const taskId = await create(title);
  await saveRoutine({
    id: `rotina-${taskId}`,
    name: title,
    days: [0, 1, 2, 3, 4, 5, 6],
    startDate: today,
    entries: [{ taskId, time: '19:30' }],
  });
  return ensureOccurrence(taskId, today);
}
const input = (
  row: { id: string; revision: number },
  extra: Record<string, unknown> = {},
) => ({
  occurrenceId: row.id,
  expectedRevision: row.revision,
  requestId: crypto.randomUUID(),
  value: 20,
  executedAt: new Date().toISOString(),
  ...extra,
});
async function snapshot(id: string) {
  return {
    profile: await db.profile.get(1),
    occurrence: await db.occurrences.get(id),
    events: await db.activityEvents.count(),
    records: await db.executionRecords.count(),
  };
}

it('não registra progresso em execução pulada e volta a aceitar depois de desfazer o pulo', async () => {
  const row = await routineOccurrence('Pulada');
  await skipMission(row.id, row.revision, true);
  const skipped = (await db.occurrences.get(row.id))!;
  const before = await snapshot(row.id);
  await expect(recordProgress(input(skipped))).rejects.toThrow(
    'Desfaça o pulo',
  );
  expect(await snapshot(row.id)).toEqual(before);
  await skipMission(skipped.id, skipped.revision, false);
  const restored = (await db.occurrences.get(row.id))!;
  await recordProgress(input(restored));
  expect((await db.occurrences.get(row.id))!.value).toBe(20);
});

it('não registra progresso em data futura e não altera saldo, eventos nem execução', async () => {
  const taskId = await create('Futura', '2026-11-05');
  const row = await ensureOccurrence(taskId, '2026-11-05');
  const before = await snapshot(row.id);
  await expect(recordProgress(input(row))).rejects.toThrow('data futura');
  expect(await snapshot(row.id)).toEqual(before);
});

it('recusa registrar por uma sessão que não contém a execução, sem efeitos', async () => {
  const inside = await ensureOccurrence(await create('Dentro'), today);
  const outside = await ensureOccurrence(await create('Fora'), today);
  const session = await saveSession(newSavedSession('Sessão', [inside.id]));
  const before = await snapshot(outside.id);
  await expect(
    recordProgress(input(outside, { sessionId: session.id })),
  ).rejects.toThrow('A sessão mudou');
  expect(await snapshot(outside.id)).toEqual(before);
  await recordProgress(input(inside, { sessionId: session.id }));
  expect((await db.occurrences.get(inside.id))!.value).toBe(20);
});

it('bloqueia o registro quando a prévia econômica diverge e aceita a prévia correta', async () => {
  const row = await ensureOccurrence(await create('Prévia'), today);
  const before = await snapshot(row.id);
  await expect(
    recordProgress(input(row, { expectedDue: { xp: 0, gold: 0, food: 0 } })),
  ).rejects.toThrow('impacto econômico');
  expect(await snapshot(row.id)).toEqual(before);
  await expect(
    recordProgress(
      input(row, { expectedProjectDebt: { xp: 99, gold: 99, food: 99 } }),
    ),
  ).rejects.toThrow('impacto econômico');
  expect(await snapshot(row.id)).toEqual(before);
  const preview = await previewProgress(input(row));
  await recordProgress(
    input(row, {
      expectedDue: preview.due,
      expectedProjectDebt: preview.projectDebt,
    }),
  );
  expect((await db.occurrences.get(row.id))!.value).toBe(20);
});

it('não pula uma execução já concluída e preserva o registro', async () => {
  const row = await routineOccurrence('Concluída');
  await recordProgress(input(row, { value: 40 }));
  const done = (await db.occurrences.get(row.id))!;
  expect(done.status).toBe('completed');
  const before = await snapshot(row.id);
  await expect(skipMission(done.id, done.revision, true)).rejects.toThrow(
    'não está disponível',
  );
  expect(await snapshot(row.id)).toEqual(before);
  expect((await db.occurrences.get(row.id))!.skipped).toBeFalsy();
});
