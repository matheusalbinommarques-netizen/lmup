import { db } from './db';
import { dateKey, progressTransaction } from './rewardService';
import type { SavedMissionSession } from './productivityTypes';
import { recordProgress } from './occurrenceService';
import { progressTarget } from './productivityRules';

export async function completeSessionOccurrence(input: {
  sessionId: string;
  expectedSessionRevision: number;
  occurrenceId: string;
  expectedOccurrenceRevision: number;
  requestId: string;
}) {
  return progressTransaction(async () => {
    const session = await db.savedMissionSessions.get(input.sessionId);
    if (!session) throw new Error('A sessão não está mais disponível.');
    const prior = await db.executionRecords.get(input.requestId);
    if (prior) {
      if (prior.occurrenceId !== input.occurrenceId)
        throw new Error('Identificador já utilizado.');
      return {
        session,
        event: await db.activityEvents.get(`progress:${input.requestId}`),
      };
    }
    if (
      session.status !== 'active' ||
      session.revision !== input.expectedSessionRevision ||
      session.occurrenceIds[session.cursor] !== input.occurrenceId
    )
      throw new Error(
        'A sessão mudou em outra aba. Confira a atividade selecionada.',
      );
    const row = await db.occurrences.get(input.occurrenceId);
    const task = row && (await db.tasks.get(row.taskId));
    if (
      !row ||
      !task ||
      task.archived ||
      task.reviewEnabled ||
      row.revision !== input.expectedOccurrenceRevision ||
      row.planningSuspended ||
      row.plannedDate > dateKey() ||
      ['completed', 'excused', 'discarded'].includes(row.status)
    )
      throw new Error(
        'Esta atividade não está disponível para conclusão rápida.',
      );
    if ((row.tracking?.method ?? 'direct') !== 'direct')
      throw new Error(
        'Registre o progresso desta atividade na execução detalhada.',
      );
    const event = await recordProgress({
      requestId: input.requestId,
      occurrenceId: row.id,
      expectedRevision: row.revision,
      value: progressTarget(row),
      executedAt: new Date().toISOString(),
    });
    const pending: number[] = [];
    for (const [index, id] of session.occurrenceIds.entries()) {
      const candidate = await db.occurrences.get(id);
      const definition = candidate && (await db.tasks.get(candidate.taskId));
      if (
        candidate &&
        definition &&
        !definition.archived &&
        !['completed', 'discarded', 'excused'].includes(candidate.status)
      )
        pending.push(index);
    }
    const cursor =
      pending.find((index) => index > session.cursor) ??
      pending[0] ??
      session.occurrenceIds.length;
    const saved = await saveSession({ ...session, cursor }, session.revision);
    return { session: saved, event };
  });
}
export async function saveSession(
  input: SavedMissionSession,
  expectedRevision?: number,
) {
  if (
    !input.id ||
    !input.name.trim() ||
    input.name.length > 160 ||
    (!input.occurrenceIds.length && input.status !== 'ended') ||
    new Set(input.occurrenceIds).size !== input.occurrenceIds.length ||
    !Number.isSafeInteger(input.cursor) ||
    input.cursor < 0 ||
    input.cursor > input.occurrenceIds.length ||
    !['active', 'paused', 'ended'].includes(input.status) ||
    !['focus', 'overview'].includes(input.mode)
  )
    throw new Error('Sessão inválida.');
  return progressTransaction(async () => {
    const current = await db.savedMissionSessions.get(input.id);
    if (current && current.revision !== expectedRevision)
      throw new Error('A sessão mudou em outra aba. Reabra para comparar.');
    if ((await db.occurrences.bulkGet(input.occurrenceIds)).some((row) => !row))
      throw new Error('Uma ocorrência não está disponível.');
    if (input.status === 'active')
      await db.savedMissionSessions
        .where('status')
        .equals('active')
        .modify((row) => {
          if (row.id !== input.id) {
            row.status = 'paused';
            row.revision++;
          }
        });
    const updated = {
      ...input,
      occurrenceIds: [...input.occurrenceIds],
      revision: (current?.revision ?? 0) + 1,
    };
    await db.savedMissionSessions.put(updated);
    return updated;
  });
}
export function newSavedSession(
  name: string,
  occurrenceIds: string[],
): SavedMissionSession {
  return {
    id: crypto.randomUUID(),
    name,
    occurrenceIds,
    cursor: 0,
    status: 'active',
    mode: 'focus',
    revision: 0,
    createdAt: new Date().toISOString(),
  };
}
