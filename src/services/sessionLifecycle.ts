import { db } from './db';
import type { SavedMissionSession } from './productivityTypes';

export const isOpenSession = (session: SavedMissionSession) =>
  session.status !== 'ended' && !session.closedAt;

/** Keep only the reference required by execution records; release the queue. */
export async function closeSessionRecord(
  session: SavedMissionSession,
  reason: 'completed' | 'ended',
) {
  const closed: SavedMissionSession = {
    id: session.id,
    name: 'Sessão encerrada',
    occurrenceIds: [],
    cursor: 0,
    status: 'ended',
    mode: 'focus',
    revision: session.revision + 1,
    createdAt: session.createdAt,
    closedAt: session.closedAt ?? new Date().toISOString(),
    closedReason: session.closedReason ?? reason,
  };
  await db.savedMissionSessions.put(closed);
  return closed;
}

/** Also called by individual/detailed completion, within the reward transaction. */
export async function settleCompletedSessions(occurrenceId?: string) {
  for (const session of await db.savedMissionSessions.toArray()) {
    if (occurrenceId && !session.occurrenceIds.includes(occurrenceId)) continue;
    if (!isOpenSession(session)) {
      if (session.occurrenceIds.length || !session.closedAt)
        await closeSessionRecord(session, 'ended');
      continue;
    }
    const rows = await db.occurrences.bulkGet(session.occurrenceIds);
    if (rows.length && rows.every((row) => row?.status === 'completed'))
      await closeSessionRecord(session, 'completed');
  }
}
