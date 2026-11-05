import { makeOccurrence } from '$services/occurrenceService';
import { progressTarget } from '$services/productivityRules';
import type { Task } from '$services/db';
import { isAvailable } from '$services/journeyService';
import type { Occurrence } from '$services/productivityTypes';

// Timed rows first, earliest first; rows without a time keep their order at the end.
export function comparePlannedTime(
  a: { plannedTime?: string | null },
  b: { plannedTime?: string | null },
) {
  return (a.plannedTime ?? '99:99').localeCompare(b.plannedTime ?? '99:99');
}

export function selectNextOccurrence(
  rows: Occurrence[],
  pinnedTaskId: number | null = null,
) {
  return (
    rows
      .filter(
        (row) =>
          !row.planningSuspended &&
          !['completed', 'excused', 'discarded'].includes(row.status),
      )
      .sort(
        (a, b) =>
          Number(b.taskId === pinnedTaskId) -
            Number(a.taskId === pinnedTaskId) ||
          Number(['active', 'paused', 'partial'].includes(b.status)) -
            Number(['active', 'paused', 'partial'].includes(a.status)) ||
          comparePlannedTime(a, b) ||
          a.id.localeCompare(b.id),
      )[0] ?? null
  );
}

export const PRIORITY_KEY = 'lmup.home-priority.v1';

export function readPriority(): number | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(PRIORITY_KEY) ?? 'null',
    );
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
      ? value
      : null;
  } catch {
    return null;
  }
}

export function savePriority(id: number | null): boolean {
  try {
    if (id === null) window.localStorage.removeItem(PRIORITY_KEY);
    else window.localStorage.setItem(PRIORITY_KEY, JSON.stringify(id));
    return true;
  } catch {
    return false;
  }
}

export function priorityTask(
  tasks: Task[],
  id: number | null,
  today: string,
): Task | null {
  return (
    tasks.find(
      (task) =>
        task.id === id && isAvailable(task, new Date(`${today}T12:00:00`)),
    ) ?? null
  );
}

// Read-only presentation of the same records used by the original organizer.
// Legacy completions are displayed, never migrated or granted a reward here.
export function homeOccurrences(
  rows: Occurrence[],
  tasks: Task[],
  today: string,
): Occurrence[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const visible = rows
    .filter((row) => {
      const task = byId.get(row.taskId);
      return (
        task &&
        !task.archived &&
        !task.reviewEnabled &&
        !row.planningSuspended &&
        !['discarded', 'excused'].includes(row.status) &&
        !(task.completed && !task.recurrence && row.status !== 'completed')
      );
    })
    .map((row) => {
      const task = byId.get(row.taskId)!;
      const completedToday =
        !task.productivityVersion &&
        task.completed &&
        (task.recurrence
          ? task.lastOccurrenceDate === today
          : task.plannedDate === today);
      if (completedToday)
        return {
          ...row,
          status: 'completed' as const,
          value: progressTarget(row),
        };
      const current =
        !task.recurrence || task.occurrenceSession === row.originDate;
      return row.status === 'planned' &&
        current &&
        ['active', 'paused'].includes(task.executionState ?? '')
        ? { ...row, status: task.executionState as 'active' | 'paused' }
        : row;
    });
  for (const task of tasks) {
    if (task.archived || visible.some((row) => row.taskId === task.id))
      continue;
    const completedToday =
      !task.productivityVersion &&
      !task.reviewEnabled &&
      task.completed &&
      (task.recurrence
        ? task.lastOccurrenceDate === today
        : task.plannedDate === today);
    const reviewReady =
      task.reviewEnabled && isAvailable(task, new Date(today + 'T12:00:00'));
    if (!completedToday && !reviewReady) continue;
    const row = makeOccurrence(task, today);
    visible.push(
      completedToday
        ? { ...row, status: 'completed', value: progressTarget(row) }
        : row,
    );
  }
  return visible;
}

export function usesTaskExecution(
  task: Task,
  row: Occurrence,
  today: string,
): boolean {
  return (
    !task.productivityVersion ||
    !!task.reviewEnabled ||
    (row.originDate === today &&
      (!task.tracking ||
        ['direct', 'steps'].includes(task.tracking.method) ||
        !!task.executionNotes ||
        ['active', 'paused'].includes(task.executionState ?? '')))
  );
}
