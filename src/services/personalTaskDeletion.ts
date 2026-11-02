import { db, type Task } from './db';

export type PersonalTaskDeletion = { key: string; deletedAt: string };
type Row = Record<string, any>;
const contentTables = [
  'tasks',
  'occurrences',
  'executionRecords',
  'planVersions',
  'routines',
  'savedMissionSessions',
  'activityEvents',
  'xpLogs',
  'productivityAudit',
] as const;

// Narrative objectives are profile.world / profile.rpgPilot records, never tasks.
// Missing source is the legacy personal-task format; unknown sources fail closed.
export function isPersonalTask(task: Task) {
  return task.source === undefined || task.source === 'personal';
}
export function personalTaskKey(task: Task) {
  return task.creationKey
    ? `creation:${task.creationKey}`
    : `legacy:${task.id}:${new Date(task.createdAt).toISOString()}`;
}
export function mergePersonalDeletions(
  ...groups: (PersonalTaskDeletion[] | undefined)[]
) {
  const result = new Map<string, PersonalTaskDeletion>();
  for (const entry of groups.flatMap((group) => group ?? [])) {
    const previous = result.get(entry.key);
    if (!previous || previous.deletedAt < entry.deletedAt)
      result.set(entry.key, entry);
  }
  return [...result.values()];
}
export function validPersonalDeletions(
  value: unknown,
): value is PersonalTaskDeletion[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry &&
        typeof entry.key === 'string' &&
        /^(creation|legacy):/.test(entry.key) &&
        entry.key.length <= 512 &&
        typeof entry.deletedAt === 'string' &&
        Number.isFinite(Date.parse(entry.deletedAt)),
    ) &&
    new Set(value.map((entry) => entry.key)).size === value.length
  );
}

/** Remove personal content from a current or historical dataset, retaining its balances. */
export function redactPersonalTasks(
  input: Row,
  deletions: PersonalTaskDeletion[],
): Row {
  const data = structuredClone(input),
    keys = new Set(deletions.map((entry) => entry.key));
  const tasks = (data.tasks ?? []) as Task[];
  const removed = tasks.filter(
    (task) => isPersonalTask(task) && keys.has(personalTaskKey(task)),
  );
  const taskIds = new Set(removed.map((task) => task.id));
  const byTask = new Map(
    removed.map((task) => [task.id, personalTaskKey(task)]),
  );
  const occurrences = (data.occurrences ?? []) as Row[];
  const occurrenceIds = new Set(
    occurrences.filter((row) => taskIds.has(row.taskId)).map((row) => row.id),
  );
  const byOccurrence = new Map(
    occurrences
      .filter((row) => taskIds.has(row.taskId))
      .map((row) => [row.id, byTask.get(row.taskId)!]),
  );
  const markedEvents = new Map<string, string>();
  data.activityEvents = ((data.activityEvents ?? []) as Row[]).map((event) => {
    const key =
      byTask.get(event.taskId) ?? byOccurrence.get(event.occurrenceId);
    if (!key) return event;
    markedEvents.set(event.id, key);
    const receipt: Row = { ...event, deletedPersonalTask: key };
    for (const field of [
      'taskId',
      'occurrenceId',
      'occurrenceDate',
      'taskTitle',
      'areaId',
      'areaName',
      'reviewStateBefore',
      'reviewOutcome',
    ])
      delete receipt[field];
    return receipt;
  });
  data.xpLogs = ((data.xpLogs ?? []) as Row[]).map((log) => {
    if (!taskIds.has(log.taskId) && !markedEvents.has(log.eventId)) return log;
    const clean = { ...log };
    for (const field of ['taskId', 'areaId', 'reason']) delete clean[field];
    return clean;
  });
  data.tasks = tasks.filter((task) => !taskIds.has(task.id));
  data.occurrences = occurrences.filter((row) => !occurrenceIds.has(row.id));
  data.executionRecords = ((data.executionRecords ?? []) as Row[]).filter(
    (row) => !occurrenceIds.has(row.occurrenceId),
  );
  data.planVersions = ((data.planVersions ?? []) as Row[]).filter(
    (row) => !taskIds.has(row.taskId),
  );
  data.routines = ((data.routines ?? []) as Row[]).map((routine) => {
    const entries = routine.entries.filter(
      (entry: Row) => !taskIds.has(entry.taskId),
    );
    return entries.length === routine.entries.length
      ? routine
      : {
          ...routine,
          entries,
          revision: routine.revision + 1,
          status:
            !entries.length && routine.status === 'active'
              ? 'paused'
              : routine.status,
        };
  });
  data.savedMissionSessions = ((data.savedMissionSessions ?? []) as Row[]).map(
    (session) => {
      const ids: string[] = session.occurrenceIds.filter(
        (id: string) => !occurrenceIds.has(id),
      );
      if (ids.length === session.occurrenceIds.length) return session;
      const current = session.occurrenceIds[session.cursor];
      const removedBefore = session.occurrenceIds
        .slice(0, session.cursor)
        .filter((id: string) => occurrenceIds.has(id)).length;
      return {
        ...session,
        occurrenceIds: ids,
        cursor: ids.includes(current)
          ? ids.indexOf(current)
          : Math.min(ids.length, session.cursor - removedBefore),
        status: ids.length ? session.status : 'ended',
        revision: session.revision + 1,
      };
    },
  );
  const scrub = (value: any): any => {
    if (Array.isArray(value))
      return value.map(scrub).filter((entry) => entry !== undefined);
    if (!value || typeof value !== 'object') return value;
    if (
      taskIds.has(value.taskId) ||
      occurrenceIds.has(value.occurrenceId) ||
      occurrenceIds.has(value.id) ||
      (taskIds.has(value.id) &&
        typeof value.xp === 'number' &&
        typeof value.title === 'string')
    )
      return undefined;
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, child]) => {
        const cleaned =
          key === 'occurrenceIds' && Array.isArray(child)
            ? child.filter((id) => !occurrenceIds.has(id))
            : key === 'taskIds' && Array.isArray(child)
              ? child.filter((id) => !taskIds.has(id))
              : scrub(child);
        return cleaned === undefined ? [] : [[key, cleaned]];
      }),
    );
  };
  data.productivityAudit = ((data.productivityAudit ?? []) as Row[]).flatMap(
    (audit) => {
      const correctionKey =
        audit.action === 'correction' &&
        (byOccurrence.get(audit.entityId) ??
          markedEvents.get(`debt:${audit.id.replace(/^progress:/, '')}`));
      // The debt validator needs only the cumulative monetary before/after values.
      if (correctionKey)
        return [
          {
            id: audit.id,
            action: audit.action,
            entityId: `ledger:${correctionKey}`,
            recordedAt: audit.recordedAt,
            before: { due: audit.before.due },
            after: { due: audit.after.due },
            deletedPersonalTask: correctionKey,
          },
        ];
      if (
        occurrenceIds.has(audit.entityId) ||
        removed.some((task) => audit.entityId === `task:${task.id}`)
      )
        return [];
      return [
        { ...audit, before: scrub(audit.before), after: scrub(audit.after) },
      ];
    },
  );
  const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile;
  if (profile)
    profile.personalTaskDeletions = mergePersonalDeletions(
      profile.personalTaskDeletions,
      deletions,
    );
  return data;
}

/** Called inside the removal transaction; no reward or project-completion service. */
export async function erasePersonalTask(task: Task) {
  if (!isPersonalTask(task))
    throw new Error(
      'Missões de história não podem ser excluídas definitivamente.',
    );
  const profile = await db.profile.get(1);
  if (!profile) throw new Error('Perfil indisponível. Reabra sua jornada.');
  const deletions = mergePersonalDeletions(profile.personalTaskDeletions, [
    { key: personalTaskKey(task), deletedAt: new Date().toISOString() },
  ]);
  const input: Row = {};
  for (const name of contentTables)
    input[name] = await db.table(name).toArray();
  const sanitized = redactPersonalTasks(input, deletions);
  for (const name of contentTables) {
    const before = input[name] as Row[],
      after = sanitized[name] as Row[];
    const retained = new Set(after.map((row) => row.id));
    const deleted = before
      .filter((row) => !retained.has(row.id))
      .map((row) => row.id);
    if (deleted.length) await db.table(name).bulkDelete(deleted);
    const old = new Map(before.map((row) => [row.id, JSON.stringify(row)]));
    const changed = after.filter(
      (row) => old.get(row.id) !== JSON.stringify(row),
    );
    if (changed.length) await db.table(name).bulkPut(changed);
  }
  await db.profile.update(1, { personalTaskDeletions: deletions });
  for (const recovery of await db.recoverySnapshots.toArray()) {
    const data = redactPersonalTasks(recovery.data, deletions);
    if (JSON.stringify(data) !== JSON.stringify(recovery.data))
      await db.recoverySnapshots.update(recovery.id, { data });
  }
}
