import { db } from './db';
import { dateKey } from './rewardService';
import { cycleDate, isSuperseded } from './operationalPlanning';
import { closeSessionRecord, isOpenSession } from './sessionLifecycle';

/** Additive and idempotent; never rewrites confirmed execution or economic records. */
export async function reconcileProductivity(day = dateKey()) {
  return db.transaction('rw', db.tables, async () => {
    const tasks = await db.tasks.toArray();
    const versions = await db.planVersions.toArray();
    const rows = await db.occurrences.toArray();
    const byTask = new Map(tasks.map((task) => [task.id, task]));
    for (const task of tasks) {
      if (!task.reviewEnabled) continue;
      await db.tasks.update(task.id!, {
        reviewEnabled: false,
        reviewRetiredAt: new Date().toISOString(),
      });
      await db.productivityAudit.add({
        id: crypto.randomUUID(),
        entityId: `task:${task.id}`,
        action: 'review-retired',
        recordedAt: new Date().toISOString(),
        before: task,
        after: { reviewEnabled: false },
      });
    }
    const obsolete = new Set<string>();
    for (const row of rows) {
      const task = byTask.get(row.taskId);
      if (!task || !isSuperseded(row, task, day, versions)) continue;
      obsolete.add(row.id);
      if (row.supersededBy || row.status === 'completed') continue;
      const cycle = cycleDate(task, day, versions)!;
      await db.occurrences.update(row.id, {
        supersededBy: cycle,
        revision: row.revision + 1,
      });
      await db.productivityAudit.put({
        id: `supersede:${row.id}`,
        entityId: row.id,
        action: 'superseded',
        recordedAt: new Date().toISOString(),
        before: row,
        after: { supersededBy: cycle },
      });
    }
    for (const session of await db.savedMissionSessions.toArray()) {
      if (!isOpenSession(session)) continue;
      const ids = session.occurrenceIds.filter((id) => !obsolete.has(id));
      if (ids.length === session.occurrenceIds.length) continue;
      if (!ids.length) await closeSessionRecord(session, 'ended');
      else {
        const chosen = session.occurrenceIds[session.cursor];
        const cursor = ids.includes(chosen)
          ? ids.indexOf(chosen)
          : Math.min(
              ids.length - 1,
              session.occurrenceIds
                .slice(0, session.cursor)
                .filter((id) => ids.includes(id)).length,
            );
        await db.savedMissionSessions.update(session.id, {
          occurrenceIds: ids,
          cursor,
          revision: session.revision + 1,
        });
      }
      await db.productivityAudit.add({
        id: crypto.randomUUID(),
        entityId: session.id,
        action: 'session-release-superseded',
        recordedAt: new Date().toISOString(),
        before: session,
        after: { occurrenceIds: ids },
      });
    }
  });
}
