import type { Task } from './db';
import type { Occurrence, PlanVersion } from './productivityTypes';
import { addCalendarDays } from './calendar';
import { scheduledOn } from './recurrence';

/** Local calendar days, independent of the desired time and daily removals. */
export function cycleDate(
  task: Task,
  day: string,
  versions: PlanVersion[] = [],
): string | null {
  if (!task.recurrence || task.archived || task.planningPaused) return null;
  const plans = versions
    .filter((plan) => plan.taskId === task.id)
    .sort(
      (a, b) =>
        a.effectiveFrom.localeCompare(b.effectiveFrom) ||
        a.sequence - b.sequence,
    );
  for (let i = 0; i < 7; i++) {
    const origin = addCalendarDays(day, -i);
    const version = plans.filter((plan) => plan.effectiveFrom <= origin).at(-1);
    if (plans.length && !version) continue;
    const definition = (version?.definition ?? task) as unknown as Task;
    if (
      definition.recurrence &&
      scheduledOn({ ...definition, skippedDate: null }, origin)
    )
      return origin;
  }
  return null;
}

export function isSuperseded(
  row: Occurrence,
  task: Task,
  day: string,
  versions: PlanVersion[] = [],
) {
  const cycle = cycleDate(task, day, versions);
  return (
    !!row.supersededBy ||
    (!!task.recurrence && !!cycle && row.originDate < cycle)
  );
}

export function operationalRow(
  row: Occurrence,
  task: Task,
  day: string,
  versions: PlanVersion[] = [],
) {
  return (
    !task.archived &&
    !task.planningPaused &&
    !task.reviewEnabled &&
    !row.planningSuspended &&
    !(
      row.supersededBy ||
      (versions.length && isSuperseded(row, task, day, versions))
    ) &&
    !row.skipped &&
    !['discarded', 'excused'].includes(row.status) &&
    row.plannedDate <= day &&
    !row.removedFromDays?.includes(day) &&
    task.skippedDate !== day
  );
}
