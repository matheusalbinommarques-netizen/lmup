import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import {
  completeSessionOccurrence,
  endSession,
  newSavedSession,
  saveSession,
} from './savedSessionService';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
async function setup(tracking = false) {
  const ids: string[] = [];
  for (let i = 0; i < 3; i++) {
    const taskId = await saveTaskDefinition({
      title: `Microação ${i}`,
      requestId: crypto.randomUUID(),
      effort: 'micro',
      plannedDate: '2026-11-02',
      ...(tracking
        ? { tracking: { method: 'percentage' as const, target: 100 } }
        : {}),
    });
    ids.push((await ensureOccurrence(taskId)).id);
  }
  return saveSession(newSavedSession('Cuidados', ids));
}
async function input(session: Awaited<ReturnType<typeof setup>>) {
  const row = (await db.occurrences.get(
    session.occurrenceIds[session.cursor],
  ))!;
  return {
    sessionId: session.id,
    expectedSessionRevision: session.revision,
    occurrenceId: row.id,
    expectedOccurrenceRevision: row.revision,
    requestId: crypto.randomUUID(),
  };
}
it('conclui com o motor existente, avança e não duplica ao repetir ou alternar modos', async () => {
  const session = await setup(),
    command = await input(session);
  const first = await completeSessionOccurrence(command);
  expect(first.session.cursor).toBe(1);
  expect(first.event?.reward).toMatchObject({ xp: 11, gold: 5 });
  const balance = await db.profile.get(1);
  await completeSessionOccurrence(command);
  const row = (await db.occurrences.get(command.occurrenceId))!;
  await recordProgress({
    occurrenceId: row.id,
    expectedRevision: row.revision,
    requestId: crypto.randomUUID(),
    value: 1,
    executedAt: new Date().toISOString(),
  });
  expect(await db.profile.get(1)).toEqual(balance);
  expect(
    (await db.activityEvents.toArray()).filter((e) => e.kind === 'task'),
  ).toHaveLength(1);
});
it('retoma a pendente anterior, chega ao fim e encerrar não concede bônus', async () => {
  let session = await setup();
  session = await saveSession({ ...session, cursor: 2 }, session.revision);
  session = (await completeSessionOccurrence(await input(session))).session;
  expect(session.cursor).toBe(0);
  session = (await completeSessionOccurrence(await input(session))).session;
  expect(session.cursor).toBe(1);
  const finalCommand = await input(session);
  session = (await completeSessionOccurrence(finalCommand)).session;
  expect(session).toMatchObject({
    status: 'ended',
    closedReason: 'completed',
    occurrenceIds: [],
    cursor: 0,
  });
  const before = await db.profile.get(1);
  expect(before).toMatchObject({ totalXpEarned: 33, gold: 15, food: 3 });
  const receipts = await db.activityEvents.toArray();
  expect(receipts).toHaveLength(3);
  await endSession(session.id, session.revision);
  await completeSessionOccurrence(finalCommand);
  expect(await db.profile.get(1)).toEqual(before);
  expect(await db.activityEvents.toArray()).toEqual(receipts);
});
it('recusa acompanhamento específico e comandos antigos de outra aba sem alterar saldos', async () => {
  const session = await setup(true),
    command = await input(session),
    before = await db.profile.get(1);
  await expect(completeSessionOccurrence(command)).rejects.toThrow(
    'execução detalhada',
  );
  await saveSession({ ...session, status: 'paused' }, session.revision);
  await expect(completeSessionOccurrence(command)).rejects.toThrow('outra aba');
  expect(await db.profile.get(1)).toEqual(before);
  expect(await db.executionRecords.count()).toBe(0);
});
it('usa a configuração congelada de uma sessão já iniciada após editar o cadastro', async () => {
  const session = await setup(),
    command = await input(session);
  const row = (await db.occurrences.get(command.occurrenceId))!,
    task = (await db.tasks.get(row.taskId))!;
  await saveTaskDefinition({
    ...task,
    description: task.description ?? undefined,
    title: 'Alterada',
    effort: 'deep',
    requestId: crypto.randomUUID(),
  });
  const result = await completeSessionOccurrence(command);
  expect(result.event?.reward.xp).toBe(11);
  expect((await db.occurrences.get(row.id))!.baseXp).toBe(10);
});
