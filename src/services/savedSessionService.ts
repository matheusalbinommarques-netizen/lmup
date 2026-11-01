import { db } from './db';
import { progressTransaction } from './rewardService';
import type { SavedMissionSession } from './productivityTypes';
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
