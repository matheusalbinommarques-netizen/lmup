import { db, type Task } from './db';
import { calendarDate } from './calendar';
import { progressTransaction } from './rewardService';
import { savePlanVersion } from './occurrenceService';
import { validateTime } from './productivityRules';
import type { Routine } from './productivityTypes';

type RoutineInput = {
  id: string;
  name: string;
  description?: string;
  days: number[];
  startDate: string;
  entries: { taskId: number; time: string | null }[];
  status?: Routine['status'];
  expectedRevision?: number;
  pauseQuota?: number;
  pausePeriodDays?: number;
};
function plan(task: Task): Record<string, unknown> {
  return {
    plannedDate: task.plannedDate ?? null,
    plannedTime: task.plannedTime ?? null,
    recurrence: task.recurrence ?? null,
    skippedDate: task.skippedDate ?? null,
    occurrenceOverride: task.occurrenceOverride ?? null,
    planningPaused: task.planningPaused ?? false,
  };
}
export async function saveRoutine(input: RoutineInput) {
  if (
    !/^[\w:-]{1,120}$/.test(input.id) ||
    !input.name.trim() ||
    input.name.length > 160 ||
    (input.description?.length ?? 0) > 10000
  )
    throw new Error('Informe nome e descrição válidos.');
  if (
    !input.days.length ||
    new Set(input.days).size !== input.days.length ||
    input.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  )
    throw new Error('Escolha os dias da rotina.');
  if (!calendarDate(input.startDate))
    throw new Error('Escolha uma data inicial.');
  if (
    !input.entries.length ||
    new Set(input.entries.map((entry) => entry.taskId)).size !==
      input.entries.length
  )
    throw new Error('Escolha missões diferentes para a rotina.');
  const pauseQuota = input.pauseQuota ?? 2,
    pausePeriodDays = input.pausePeriodDays ?? 30;
  if (
    !Number.isSafeInteger(pauseQuota) ||
    pauseQuota < 0 ||
    !Number.isSafeInteger(pausePeriodDays) ||
    pausePeriodDays < 1
  )
    throw new Error('Cota de pausas inválida.');
  const status = input.status ?? 'active';
  if (!['active', 'paused', 'archived'].includes(status))
    throw new Error('Estado da rotina inválido.');
  return progressTransaction(async () => {
    const current = await db.routines.get(input.id);
    if (current && current.revision !== input.expectedRevision)
      throw new Error('A rotina mudou em outra aba. Reabra para comparar.');
    const entries: Routine['entries'] = [];
    for (const entry of input.entries) {
      validateTime(entry.time);
      const task = await db.tasks.get(entry.taskId);
      if (!task || task.archived || task.reviewEnabled)
        throw new Error('Uma missão não pode ser vinculada a esta rotina.');
      if (task.routineId && task.routineId !== input.id)
        throw new Error('A missão já pertence a outra rotina.');
      const previousPlan =
        current?.entries.find((old) => old.taskId === entry.taskId)
          ?.previousPlan ?? plan(task);
      if (!(await db.planVersions.where('taskId').equals(task.id!).count()))
        await savePlanVersion(task);
      entries.push({ ...entry, previousPlan });
      await db.tasks.update(entry.taskId, {
        routineId: input.id,
        plannedTime: entry.time,
        recurrence: {
          kind: 'weekdays',
          startDate: input.startDate,
          days: [...input.days],
        },
        planningPaused: status !== 'active',
        skippedDate: null,
        occurrenceOverride: null,
        definitionRevision: (task.definitionRevision ?? 0) + 1,
      });
      await savePlanVersion((await db.tasks.get(entry.taskId))!);
    }
    for (const old of current?.entries ?? [])
      if (!entries.some((entry) => entry.taskId === old.taskId)) {
        const task = await db.tasks.get(old.taskId);
        if (task?.routineId === input.id) {
          await db.tasks.update(old.taskId, {
            ...old.previousPlan,
            routineId: null,
            definitionRevision: (task.definitionRevision ?? 0) + 1,
          });
          await savePlanVersion((await db.tasks.get(old.taskId))!);
        }
      }
    const row: Routine = {
      id: input.id,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      days: [...input.days],
      startDate: input.startDate,
      status,
      entries,
      pauseQuota,
      pausePeriodDays,
      revision: (current?.revision ?? 0) + 1,
      createdAt: current?.createdAt ?? new Date().toISOString(),
    };
    await db.routines.put(row);
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: row.id,
      action: 'routine-edit',
      recordedAt: new Date().toISOString(),
      before: current ?? null,
      after: row,
    });
    return row.id;
  });
}
export async function setRoutineStatus(
  id: string,
  status: Routine['status'],
  expectedRevision: number,
) {
  const row = await db.routines.get(id);
  if (!row) throw new Error('Rotina indisponível.');
  return saveRoutine({ ...row, status, expectedRevision });
}
export async function justifyPause(
  occurrenceIds: string[],
  reason: string,
  requestId: string,
) {
  if (!reason.trim() || reason.length > 500 || !occurrenceIds.length)
    throw new Error('Informe o motivo da pausa.');
  return progressTransaction(async () => {
    if (await db.productivityAudit.get(requestId)) return;
    const rows = await db.occurrences.bulkGet([...new Set(occurrenceIds)]);
    if (
      rows.some(
        (row) =>
          !row ||
          row.value > 0 ||
          row.status === 'completed' ||
          row.status === 'excused',
      )
    )
      throw new Error('A pausa exige ocorrências sem execução.');
    const routineId = rows[0]!.routineId;
    if (
      rows.some(
        (row) =>
          row!.routineId !== routineId ||
          row!.originDate !== rows[0]!.originDate,
      )
    )
      throw new Error('Justifique uma rotina e um dia por vez.');
    const routine = routineId ? await db.routines.get(routineId) : undefined;
    const quota = routine?.pauseQuota ?? 2,
      period = routine?.pausePeriodDays ?? 30;
    const origin = rows[0]!.originDate;
    const bucket = Math.floor(
      Date.parse(`${origin}T12:00:00Z`) / (period * 86400000),
    );
    const audit = await db.productivityAudit.toArray();
    const used = audit.filter(
      (entry) =>
        entry.action === 'excuse' &&
        (entry.after as { scope?: string; bucket?: number }).scope ===
          (routineId ?? `task:${rows[0]!.taskId}`) &&
        (entry.after as { bucket?: number }).bucket === bucket,
    );
    if (used.length >= quota)
      throw new Error('A cota de pausas deste período foi utilizada.');
    for (const row of rows)
      await db.occurrences.update(row!.id, {
        status: 'excused',
        revision: row!.revision + 1,
      });
    await db.productivityAudit.add({
      id: requestId,
      entityId: routineId ?? rows[0]!.id,
      action: 'excuse',
      recordedAt: new Date().toISOString(),
      before: rows,
      after: {
        scope: routineId ?? `task:${rows[0]!.taskId}`,
        bucket,
        reason: reason.trim(),
        occurrenceIds,
      },
    });
  });
}
