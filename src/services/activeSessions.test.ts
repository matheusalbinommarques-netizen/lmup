import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import {
  appendSessionOccurrences,
  startOrResumeSession,
  endSession,
  saveSession,
  completeSessionOccurrence,
  reconcileSessions,
} from './savedSessionService';
import { isOpenSession } from './sessionLifecycle';
import { readJourneySnapshot } from './journeyQuery';
import {
  changeToday,
  dayChangeNeedsConfirmation,
} from './dailyPlanningService';
import { completeTask } from './taskService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
const day = '2026-11-02';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${day}T15:00:00`));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
it('adiciona em sessão pausada sem iniciar nem alterar sua posição atual', async () => {
  const first = await mission('Pausada'),
    next = await mission('Nova');
  const session = await startOrResumeSession('Pausada', [first.id]);
  const paused = await saveSession(
    { ...session, status: 'paused' },
    session.revision,
  );
  const result = await appendSessionOccurrences(paused.id, paused.revision, [
    next,
  ]);
  expect(result).toMatchObject({
    status: 'paused',
    cursor: paused.cursor,
    occurrenceIds: [first.id, next.id],
  });
  await expect(
    appendSessionOccurrences(paused.id, paused.revision, [next]),
  ).rejects.toThrow('outra aba');
});
async function mission(title: string, time = false, plannedDate = day) {
  const id = await saveTaskDefinition({
    title,
    plannedDate,
    effort: 'micro',
    requestId: crypto.randomUUID(),
    ...(time ? { tracking: { method: 'time' as const, target: 10 } } : {}),
  });
  return ensureOccurrence(id, plannedDate);
}
async function partial(id: string, value: number, sessionId?: string) {
  const row = (await db.occurrences.get(id))!;
  return recordProgress({
    occurrenceId: id,
    expectedRevision: row.revision,
    value,
    sessionId,
    requestId: crypto.randomUUID(),
    executedAt: new Date().toISOString(),
  });
}
it('adiciona ao fim sem alterar cursor, progresso, configuração congelada ou rotina', async () => {
  const a = await mission('Atual', true),
    b = await mission('Próxima'),
    c = await mission('Nova');
  const initial = await startOrResumeSession('Foco', [a.id, b.id]);
  await partial(a.id, 4, initial.id);
  const before = await readJourneySnapshot();
  const saved = await appendSessionOccurrences(initial.id, initial.revision, [
    c,
  ]);
  expect(saved.occurrenceIds).toEqual([a.id, b.id, c.id]);
  expect(saved.cursor).toBe(initial.cursor);
  const after = await readJourneySnapshot();
  expect(after.occurrences).toEqual(before.occurrences);
  expect(after.events).toEqual(before.events);
  expect(after.profile).toEqual(before.profile);
  expect(after.routines).toEqual(before.routines);
  await expect(
    appendSessionOccurrences(saved.id, saved.revision, [c]),
  ).rejects.toThrow('já está');
});
it('duas abas não conseguem reservar a mesma atividade em sessões diferentes', async () => {
  const a = await mission('A'),
    b = await mission('B'),
    c = await mission('Livre');
  const one = await startOrResumeSession('Uma', [a.id]);
  const two = await startOrResumeSession('Duas', [b.id]);
  const currentOne = (await db.savedMissionSessions.get(one.id))!;
  const attempts = await Promise.allSettled([
    appendSessionOccurrences(one.id, currentOne.revision, [c]),
    appendSessionOccurrences(two.id, two.revision, [c]),
  ]);
  expect(
    attempts.filter((result) => result.status === 'fulfilled'),
  ).toHaveLength(1);
  expect(
    (await db.savedMissionSessions.toArray()).filter(
      (session) =>
        isOpenSession(session) && session.occurrenceIds.includes(c.id),
    ),
  ).toHaveLength(1);
});
it('encerrar libera a ocorrência parcial e preserva recibos, saldos e sessões independentes', async () => {
  const a = await mission('Parcial', true),
    b = await mission('Concluída'),
    c = await mission('Outra');
  const session = await startOrResumeSession('Foco', [a.id, b.id]);
  await partial(a.id, 4, session.id);
  await partial(b.id, 1, session.id);
  const other = await startOrResumeSession('Outra', [c.id]);
  const current = (await db.savedMissionSessions.get(session.id))!;
  const before = await readJourneySnapshot();
  await endSession(current.id, current.revision);
  const closed = (await db.savedMissionSessions.get(current.id))!;
  expect(closed).toMatchObject({
    status: 'ended',
    occurrenceIds: [],
    cursor: 0,
    closedReason: 'ended',
  });
  expect(await db.savedMissionSessions.get(other.id)).toEqual(other);
  const after = await readJourneySnapshot();
  expect(after.occurrences).toEqual(before.occurrences);
  expect(after.events).toEqual(before.events);
  expect(after.profile).toEqual(before.profile);
  const next = await startOrResumeSession('Nova sessão', [a.id]);
  expect(next.id).not.toBe(session.id);
  expect((await db.occurrences.get(a.id))?.value).toBe(4);
  await partial(a.id, 10, next.id);
  const paid = (await db.occurrences.get(a.id))!;
  expect(paid.due.xp).toBeGreaterThan(0);
  expect(
    (await db.executionRecords.where('occurrenceId').equals(a.id).toArray())
      .map((row) => row.before)
      .sort((a, b) => a - b),
  ).toEqual([0, 4]);
});
it('a última conclusão encerra a fila e a repetição da mesma conclusão é idempotente', async () => {
  const row = await mission('Única');
  const session = await startOrResumeSession('Fim', [row.id]);
  const input = {
    sessionId: session.id,
    expectedSessionRevision: session.revision,
    occurrenceId: row.id,
    expectedOccurrenceRevision: row.revision,
    requestId: 'last',
  };
  const result = await completeSessionOccurrence(input);
  expect(result.session).toMatchObject({
    status: 'ended',
    occurrenceIds: [],
    closedReason: 'completed',
  });
  const before = await readJourneySnapshot();
  await completeSessionOccurrence(input);
  const after = await readJourneySnapshot();
  expect(after.events).toEqual(before.events);
  expect(after.profile).toEqual(before.profile);
  await expect(
    saveSession({ ...session, status: 'active' }, session.revision),
  ).rejects.toThrow('encerrada');
  await expect(
    appendSessionOccurrences(session.id, result.session.revision, [row]),
  ).rejects.toThrow('encerrada');
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
});
it('a conclusão individual e a detalhada também encerram a sessão, sem bônus final', async () => {
  const a = await mission('Direta'),
    b = await mission('Tempo', true);
  const session = await startOrResumeSession('Mista', [a.id, b.id]);
  await completeTask(a.taskId);
  expect((await db.savedMissionSessions.get(session.id))?.status).toBe(
    'active',
  );
  await partial(b.id, 10, session.id);
  expect((await db.savedMissionSessions.get(session.id))?.closedReason).toBe(
    'completed',
  );
  expect(
    (await readJourneySnapshot()).events.filter(
      (event) => event.kind === 'task',
    ),
  ).toHaveLength(2);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
});
it('encerramento persiste após backup antigo sem descartar atividades independentes', async () => {
  const a = await mission('Fila'),
    b = await mission('Independente');
  const session = await startOrResumeSession('Anterior', [a.id]);
  const old = JSON.parse(JSON.stringify(await createJourneyBackup()));
  await endSession(session.id, session.revision);
  await restoreJourneyBackup(old);
  expect(
    (await db.savedMissionSessions.get(session.id))?.occurrenceIds,
  ).toEqual([]);
  expect(isOpenSession((await db.savedMissionSessions.get(session.id))!)).toBe(
    false,
  );
  expect(await db.tasks.get(b.taskId)).toBeDefined();
  expect(await db.occurrences.get(a.id)).toEqual(a);
  const exported = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(exported)).not.toThrow();
  await restoreJourneyBackup(exported);
  expect(
    (await db.savedMissionSessions.get(session.id))?.occurrenceIds,
  ).toEqual([]);
});
it('normaliza sessões antigas encerradas ou completas e remove o bloqueio de reagendamento', async () => {
  const a = await mission('Antiga'),
    b = await mission('Completa');
  const session = await startOrResumeSession('Antiga', [a.id]);
  await db.savedMissionSessions.update(session.id, { status: 'ended' });
  await completeTask(b.taskId);
  await db.savedMissionSessions.put({
    ...session,
    id: 'completed-legacy',
    status: 'paused',
    occurrenceIds: [b.id],
  });
  await reconcileSessions();
  const once = await db.savedMissionSessions.toArray();
  await reconcileSessions();
  expect(await db.savedMissionSessions.toArray()).toEqual(once);
  expect(
    once.every(
      (session) => !isOpenSession(session) && !session.occurrenceIds.length,
    ),
  ).toBe(true);
  expect(await dayChangeNeedsConfirmation(a.id)).toBe(false);
  await changeToday({
    row: a,
    action: 'reschedule',
    day,
    targetDate: '2026-11-03',
    requestId: 'released',
  });
  expect((await db.occurrences.get(a.id))?.plannedDate).toBe('2026-11-03');
});
it('rejeita inclusão futura, revisão antiga e tentativa de retomar sessão encerrada por outra aba', async () => {
  const a = await mission('Atual'),
    b = await mission('Futura', false, '2026-11-03');
  const session = await startOrResumeSession('Foco', [a.id]);
  await expect(
    appendSessionOccurrences(session.id, session.revision, [b]),
  ).rejects.toThrow('outra data');
  await endSession(session.id, session.revision);
  await expect(
    saveSession({ ...session, status: 'active' }, session.revision),
  ).rejects.toThrow('encerrada');
  const fresh = await startOrResumeSession('Nova', [a.id]);
  expect(fresh.id).not.toBe(session.id);
  await expect(endSession(fresh.id, fresh.revision - 1)).rejects.toThrow(
    'outra aba',
  );
});
