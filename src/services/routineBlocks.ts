import { db, type Task } from './db';
import { dateKey, progressTransaction } from './rewardService';
import {
  changeOccurrence,
  ensureOccurrence,
  savePlanVersion,
} from './occurrenceService';
import { saveDayOrder } from './dayOrder';
import { validateTime } from './productivityRules';
import type {
  Occurrence,
  Routine,
  SavedMissionSession,
} from './productivityTypes';

type DayRef = Pick<
  Occurrence,
  'id' | 'taskId' | 'originDate' | 'reconstructed'
>;
export type Skipped = { taskId: number; title: string; reason: string };
export type InsertResult = { inserted: string[]; skipped: Skipped[] };

const RESOLVED = ['completed', 'excused', 'discarded'];

/**
 * Why a routine mission cannot join today's Dia now, or null when it can.
 * Rows already in the Dia stay where they are.
 */
async function blocked(
  task: Task | undefined,
  day: string,
  inDay: Set<number>,
): Promise<string | null> {
  if (!task || task.archived || task.reviewEnabled) return 'indisponível';
  if (inDay.has(task.id!)) return 'já está no Dia';
  const today = await db.occurrences
    .where('taskId')
    .equals(task.id!)
    .filter((row) => row.originDate === day && !row.supersededBy)
    .first();
  if (today && RESOLVED.includes(today.status)) return 'já resolvida hoje';
  if (today && today.plannedDate !== day) return 'remarcada para outro dia';
  // Same legacy guard as ensureOccurrence: an old completion keeps its record.
  const legacy =
    (!!task.recurrence &&
      task.lastOccurrenceDate === day &&
      !task.completionEventId) ||
    (await db.activityEvents.where('taskId').equals(task.id!).toArray()).some(
      (event) =>
        ['task', 'review'].includes(event.kind) &&
        !event.reversedAt &&
        !event.occurrenceId &&
        (event.occurrenceDate ?? event.date) === day,
    );
  return legacy ? 'já feita hoje' : null;
}

/**
 * Inserts a routine block into today's Dia (design P3). Each chosen mission
 * gets today's occurrence through the same one-day override as "Pôr no
 * dia": the routine, its days and the missions' repetition stay as they
 * are, and no progress, reward or event changes. `at` is the position in
 * `rows` (the Dia's order) where the block goes; `time`, when given, fixes
 * only today's time of the first inserted mission. Idempotent by request.
 */
export async function insertBlock(input: {
  routineId: string;
  taskIds: number[];
  day: string;
  rows: DayRef[];
  at: number;
  time?: string | null;
  requestId: string;
}): Promise<InsertResult> {
  if (!/^[\w:-]{1,120}$/.test(input.requestId))
    throw new Error('Reabra a ação para continuar.');
  const time = validateTime(input.time);
  if (
    !Number.isSafeInteger(input.at) ||
    input.at < 0 ||
    input.at > input.rows.length
  )
    throw new Error('Escolha onde o bloco entra.');
  if (
    !input.taskIds.length ||
    new Set(input.taskIds).size !== input.taskIds.length
  )
    throw new Error('Escolha ao menos uma missão do bloco.');
  const result = await progressTransaction(async () => {
    const prior = await db.productivityAudit.get(input.requestId);
    if (prior) {
      if (
        prior.action !== 'routine-insert' ||
        prior.entityId !== input.routineId
      )
        throw new Error('Identificador já utilizado.');
      return { ...(prior.after as InsertResult), repeated: true };
    }
    if (input.day !== dateKey())
      throw new Error('O dia mudou. Atualize o planejamento.');
    const routine = await db.routines.get(input.routineId);
    if (!routine || routine.status !== 'active')
      throw new Error(
        'Esta rotina não está ativa. Reative-a em Missões › Rotinas.',
      );
    const chosen = new Set(input.taskIds);
    if (
      input.taskIds.some(
        (id) => !routine.entries.some((entry) => entry.taskId === id),
      )
    )
      throw new Error('Uma missão não faz parte desta rotina.');
    const inDay = new Set(input.rows.map((row) => row.taskId));
    const inserted: string[] = [];
    const skipped: Skipped[] = [];
    for (const { taskId } of routine.entries.filter((entry) =>
      chosen.has(entry.taskId),
    )) {
      const task = await db.tasks.get(taskId);
      const reason = await blocked(task, input.day, inDay);
      if (reason) {
        skipped.push({ taskId, title: task?.title ?? 'Missão', reason });
        continue;
      }
      if (task!.occurrenceOverride !== input.day || task!.skippedDate) {
        await db.tasks.update(taskId, {
          occurrenceOverride: input.day,
          ...(task!.skippedDate === input.day ? { skippedDate: null } : {}),
        });
        await savePlanVersion((await db.tasks.get(taskId))!);
      }
      // A row removed from today comes back, like "Pôr no dia".
      await db.occurrences
        .where('taskId')
        .equals(taskId)
        .filter(
          (row) =>
            row.plannedDate === input.day &&
            !!row.removedFromDays?.includes(input.day),
        )
        .modify((row) => {
          row.removedFromDays = row.removedFromDays?.filter(
            (day) => day !== input.day,
          );
          row.revision++;
        });
      inserted.push((await ensureOccurrence(taskId, input.day)).id);
    }
    if (time && inserted.length) {
      const first = (await db.occurrences.get(inserted[0]))!;
      if ((first.plannedTime ?? null) !== time)
        await changeOccurrence(
          first.id,
          first.revision,
          { plannedTime: time },
          crypto.randomUUID(),
        );
    }
    const after: InsertResult = { inserted, skipped };
    await db.productivityAudit.add({
      id: input.requestId,
      entityId: routine.id,
      action: 'routine-insert',
      recordedAt: new Date().toISOString(),
      before: null,
      after: { ...after, day: input.day, at: input.at, time },
    });
    return { ...after, repeated: false };
  });
  // The order is saved after the block exists: a row that cannot be stored
  // (legacy completion) must not undo the insertion.
  if (!result.repeated && result.inserted.length) {
    const added = (await db.occurrences.bulkGet(result.inserted)).filter(
      (row): row is Occurrence => !!row,
    );
    await saveDayOrder(input.day, [
      ...input.rows.slice(0, input.at),
      ...added,
      ...input.rows.slice(input.at),
    ]);
  }
  return { inserted: result.inserted, skipped: result.skipped };
}

/**
 * A routine draft from a saved session ("Salvar como rotina"): its missions
 * in the session order, without time. Missions that cannot join a routine
 * are left out with the reason; nothing is saved until the routine is.
 */
export function routineDraftFromSession(
  session: Pick<SavedMissionSession, 'name' | 'occurrenceIds'>,
  occurrences: Pick<Occurrence, 'id' | 'taskId'>[],
  tasks: Task[],
  routines: Pick<Routine, 'id' | 'name'>[],
): {
  name: string;
  entries: { taskId: number; time: null }[];
  left: { title: string; reason: string }[];
} {
  const entries: { taskId: number; time: null }[] = [];
  const left: { title: string; reason: string }[] = [];
  const seen = new Set<number>();
  for (const id of session.occurrenceIds) {
    const taskId = occurrences.find((row) => row.id === id)?.taskId;
    if (taskId === undefined || seen.has(taskId)) continue;
    seen.add(taskId);
    const task = tasks.find((item) => item.id === taskId);
    const reason = !task
      ? 'não existe mais'
      : task.archived
        ? 'arquivada'
        : task.reviewEnabled
          ? 'é uma repetição'
          : task.routineId
            ? `já está na rotina ${routines.find((row) => row.id === task.routineId)?.name ?? 'outra rotina'}`
            : !task.recurrence && task.completed
              ? 'avulsa já concluída'
              : null;
    if (reason) left.push({ title: task?.title ?? 'Missão', reason });
    else entries.push({ taskId, time: null });
  }
  return { name: session.name.trim().slice(0, 160), entries, left };
}
