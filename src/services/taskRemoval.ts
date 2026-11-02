import { db } from './db';
import { dateKey } from './rewardService';
import { savePlanVersion } from './occurrenceService';

export type RemovalMode = 'delete' | 'archive';
export type RemovalPreview = {
  taskId: number;
  title: string;
  mode: RemovalMode;
  token: string;
  reasons: string[];
  routines: number;
  sessions: number;
  project: boolean;
};

function references(value: unknown, taskId: number): boolean {
  if (!value || typeof value !== 'object') return false;
  if ((value as { taskId?: number }).taskId === taskId) return true;
  return Object.values(value).some((child) => references(child, taskId));
}
async function inspect(taskId: number) {
  const task = await db.tasks.get(taskId);
  if (!task) throw Error('Esta missão não está mais disponível.');
  const occurrences = await db.occurrences
    .where('taskId')
    .equals(taskId)
    .toArray();
  const ids = new Set(occurrences.map((row) => row.id));
  const events = await db.activityEvents
    .where('taskId')
    .equals(taskId)
    .toArray();
  const logs = await db.xpLogs.filter((row) => row.taskId === taskId).toArray();
  const records = await db.executionRecords
    .filter((row) => ids.has(row.occurrenceId))
    .toArray();
  const routines = await db.routines
    .filter((row) => row.entries.some((entry) => entry.taskId === taskId))
    .toArray();
  const sessions = await db.savedMissionSessions
    .filter((row) => row.occurrenceIds.some((id) => ids.has(id)))
    .toArray();
  const versions = await db.planVersions
    .where('taskId')
    .equals(taskId)
    .toArray();
  const audit = await db.productivityAudit
    .filter(
      (row) =>
        ids.has(row.entityId) ||
        row.entityId === `task:${taskId}` ||
        references(row.before, taskId) ||
        references(row.after, taskId),
    )
    .toArray();
  const reasons: string[] = [];
  if (events.length || logs.length)
    reasons.push('Histórico de XP ou recompensas');
  if (
    records.length ||
    occurrences.some(
      (row) =>
        row.value > 0 ||
        row.modifiers ||
        row.status !== 'planned' ||
        row.originDate < dateKey(),
    )
  )
    reasons.push('Ocorrências ou execuções registradas');
  if (
    task.completed ||
    task.completionEventId ||
    task.lastOccurrenceDate ||
    task.lastReviewDate ||
    (task.completedSubtasks?.length ?? 0) > 0 ||
    task.executionNotes?.trim() ||
    ['active', 'paused'].includes(task.executionState ?? '')
  )
    reasons.push('Progresso, notas ou execução da missão');
  if (routines.length || task.routineId) reasons.push('Vínculo com rotina');
  if (sessions.length) reasons.push('Vínculo com sessão salva');
  if (task.projectId || occurrences.some((row) => row.projectId))
    reasons.push('Vínculo com projeto');
  if (versions.length > 1 || audit.length)
    reasons.push('Histórico de alterações');
  const preview: RemovalPreview = {
    taskId,
    title: task.title,
    mode: reasons.length || task.archived ? 'archive' : 'delete',
    token: JSON.stringify({
      task,
      occurrences,
      events,
      logs,
      records,
      routines,
      sessions,
      versions,
      audit,
    }),
    reasons,
    routines: routines.length,
    sessions: sessions.length,
    project: !!task.projectId,
  };
  return { preview, task, occurrences, routines, sessions, versions };
}
export function previewTaskRemoval(taskId: number) {
  return db.transaction(
    'r',
    db.tables,
    async () => (await inspect(taskId)).preview,
  );
}
export async function removeTask(
  taskId: number,
  token: string,
  requestId: string,
): Promise<RemovalMode> {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw Error('Reabra a confirmação para tentar novamente.');
  return db.transaction('rw', db.tables, async () => {
    const prior = await db.productivityAudit.get(requestId);
    if (prior) {
      if (
        prior.entityId !== `task:${taskId}` ||
        !['task-delete', 'task-archive'].includes(prior.action)
      )
        throw Error('Identificador de operação já utilizado.');
      return prior.action === 'task-delete' ? 'delete' : 'archive';
    }
    const state = await inspect(taskId),
      { preview, task } = state;
    if (task.archived) return 'archive';
    if (preview.token !== token)
      throw Error(
        'A missão mudou em outra aba. Feche e reabra a confirmação para revisar a operação.',
      );
    if (preview.mode === 'delete') {
      await db.occurrences.bulkDelete(state.occurrences.map((row) => row.id));
      await db.planVersions.bulkDelete(state.versions.map((row) => row.id));
      await db.tasks.delete(taskId);
    } else {
      for (const routine of state.routines) {
        const entries = routine.entries.filter(
          (entry) => entry.taskId !== taskId,
        );
        await db.routines.update(routine.id, {
          entries,
          revision: routine.revision + 1,
          status:
            !entries.length && routine.status === 'active'
              ? 'paused'
              : routine.status,
        });
      }
      const pending = new Set(
        state.occurrences
          .filter((row) => row.status !== 'completed')
          .map((row) => row.id),
      );
      for (const session of state.sessions.filter(
        (row) => row.status !== 'ended',
      )) {
        const occurrenceIds = session.occurrenceIds.filter(
          (id) => !pending.has(id),
        );
        if (occurrenceIds.length === session.occurrenceIds.length) continue;
        const current = session.occurrenceIds[session.cursor];
        await db.savedMissionSessions.update(session.id, {
          occurrenceIds,
          revision: session.revision + 1,
          cursor: occurrenceIds.includes(current)
            ? occurrenceIds.indexOf(current)
            : Math.min(session.cursor, occurrenceIds.length),
          status: occurrenceIds.length ? session.status : 'ended',
        });
      }
      await db.tasks.update(taskId, {
        archived: true,
        planningPaused: true,
        pinned: false,
        routineId: null,
        definitionRevision: (task.definitionRevision ?? 0) + 1,
      });
      await savePlanVersion((await db.tasks.get(taskId))!);
    }
    await db.productivityAudit.add({
      id: requestId,
      entityId: `task:${taskId}`,
      action: preview.mode === 'delete' ? 'task-delete' : 'task-archive',
      recordedAt: new Date().toISOString(),
      before:
        preview.mode === 'archive'
          ? { task, routines: state.routines, sessions: state.sessions }
          : { taskId, title: task.title },
      after: { taskId, mode: preview.mode },
    });
    return preview.mode;
  });
}
