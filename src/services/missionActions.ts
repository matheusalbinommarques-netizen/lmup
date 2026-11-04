import { db } from './db';
import { dateKey, progressTransaction } from './rewardService';
import { isSuperseded } from './operationalPlanning';
import { recordProgress, previewProgress } from './occurrenceService';
import { reconcileProductivity } from './productivityLifecycle';

export async function skipMission(id: string, revision: number, skip: boolean) {
  return progressTransaction(async () => {
    await reconcileProductivity();
    const row = await db.occurrences.get(id);
    const task = row && (await db.tasks.get(row.taskId));
    if (
      !row ||
      !task ||
      task.archived ||
      row.revision !== revision ||
      !row.routineId ||
      row.status === 'completed' ||
      row.plannedDate > dateKey() ||
      isSuperseded(row, task, dateKey(), await db.planVersions.toArray())
    )
      throw new Error('Esta execução não está disponível. Atualize a missão.');
    if (!!row.skipped === skip) return;
    await db.occurrences.update(id, {
      skipped: skip,
      revision: row.revision + 1,
    });
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: id,
      action: skip ? 'skip' : 'undo-skip',
      recordedAt: new Date().toISOString(),
      before: row,
      after: { skipped: skip },
    });
    if (skip)
      for (const session of await db.savedMissionSessions.toArray()) {
        if (session.status === 'ended' || !session.occurrenceIds.includes(id))
          continue;
        const ids = session.occurrenceIds.filter((item) => item !== id);
        await db.savedMissionSessions.update(session.id, {
          occurrenceIds: ids,
          cursor:
            session.occurrenceIds.indexOf(id) < session.cursor
              ? Math.max(0, session.cursor - 1)
              : Math.max(0, Math.min(session.cursor, ids.length - 1)),
          revision: session.revision + 1,
          ...(ids.length
            ? {}
            : {
                status: 'ended',
                closedAt: new Date().toISOString(),
                closedReason: 'ended',
              }),
        });
      }
  });
}

export async function restartPreview(id: string, revision: number) {
  const row = await db.occurrences.get(id);
  const task = row && (await db.tasks.get(row.taskId));
  if (
    !row ||
    !task ||
    task.recurrence ||
    task.archived ||
    row.status === 'completed' ||
    row.value <= 0
  )
    throw new Error(
      'Somente uma missão pontual parcialmente realizada pode ser reiniciada.',
    );
  const input = {
    occurrenceId: id,
    expectedRevision: revision,
    requestId: `restart:${id}:${revision}`,
    value: 0,
    minutes: 0,
    checkedSteps: [],
    correction: true,
    executedAt: new Date().toISOString(),
  };
  return { input, preview: await previewProgress(input) };
}
export async function restartMission(
  id: string,
  revision: number,
  expectedDue: { xp: number; gold: number; food: number },
  expectedProjectDebt: { xp: number; gold: number; food: number },
) {
  return progressTransaction(async () => {
    const { input } = await restartPreview(id, revision);
    await recordProgress({ ...input, expectedDue, expectedProjectDebt });
    const taskId = (await db.occurrences.get(id))!.taskId;
    await db.tasks.update(taskId, {
      completedSubtasks: [],
      executionState: 'active',
    });
  });
}
