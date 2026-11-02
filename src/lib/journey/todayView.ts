import type { JourneySnapshot } from '$services/journeyQuery';
import { makeOccurrence } from '$services/occurrenceService';
import { isAvailable } from '$services/journeyService';
import { dateKey } from '$services/rewardService';
import { reviewDueDate } from '$services/reviewRules';
import { progressTarget } from '$services/productivityRules';

export function todayView(data: JourneySnapshot, day: string) {
  const byTask = new Map(data.tasks.map((task) => [task.id, task]));
  const all = new Map(data.occurrences.map((row) => [row.id, row]));
  for (const row of data.plannedToday)
    if (!all.has(row.id)) all.set(row.id, row);
  for (const task of data.tasks) {
    if (task.archived || task.planningPaused) continue;
    if (
      !task.productivityVersion &&
      task.completed &&
      !task.reviewEnabled &&
      (task.recurrence
        ? task.lastOccurrenceDate === day
        : task.plannedDate === day) &&
      ![...all.values()].some((row) => row.taskId === task.id)
    ) {
      const row = makeOccurrence(task, day);
      all.set(row.id, { ...row, status: 'completed', value: 1 });
    }
    if (task.reviewEnabled && task.lastReviewDate === day) {
      const event = data.events.find(
        (event) =>
          event.taskId === task.id &&
          event.kind === 'review' &&
          event.date === day &&
          !event.reversedAt,
      );
      if (
        event &&
        (task.plannedDate === day ||
          event.reviewStateBefore?.reviewDueDate === day)
      ) {
        const row = makeOccurrence(task, day);
        all.set(row.id, { ...row, status: 'completed', value: 1 });
      }
    }
    if (task.reviewEnabled) {
      const origin = task.plannedDate ?? reviewDueDate(task);
      if (
        origin &&
        origin <= day &&
        isAvailable(task, new Date(`${day}T12:00:00`))
      ) {
        const row = makeOccurrence(task, origin);
        all.set(row.id, row);
      }
      continue;
    }
    if (
      !task.recurrence &&
      !task.completed &&
      !data.occurrences.some((row) => row.taskId === task.id)
    ) {
      const origin = task.plannedDate ?? day;
      if (origin <= day) {
        const row = makeOccurrence(task, origin);
        all.set(row.id, row);
      }
    }
  }
  const active = [...all.values()]
    .map((row) => {
      const task = byTask.get(row.taskId);
      if (
        task &&
        !task.productivityVersion &&
        !task.reviewEnabled &&
        task.completed &&
        (task.recurrence
          ? task.lastOccurrenceDate === row.originDate
          : task.plannedDate === row.plannedDate)
      )
        return {
          ...row,
          status: 'completed' as const,
          value: progressTarget(row),
        };
      return row.status === 'planned' &&
        task &&
        (!task.recurrence || task.occurrenceSession === row.originDate) &&
        ['active', 'paused'].includes(task.executionState ?? '')
        ? { ...row, status: task.executionState as 'active' | 'paused' }
        : row;
    })
    .filter((row) => {
      const task = byTask.get(row.taskId);
      return (
        task &&
        !task.archived &&
        !task.planningPaused &&
        !row.planningSuspended &&
        !['discarded', 'excused'].includes(row.status)
      );
    });
  const removed = active.filter(
    (row) =>
      row.removedFromDays?.includes(day) ||
      byTask.get(row.taskId)?.skippedDate === day,
  );
  const removedIds = new Set(removed.map((row) => row.id));
  const current = active.filter(
    (row) => !removedIds.has(row.id) && row.plannedDate === day,
  );
  const planned = current.filter((row) => {
    const task = byTask.get(row.taskId)!;
    return (
      !!task.recurrence ||
      !!task.plannedDate ||
      !!task.reviewEnabled ||
      row.originDate !== row.plannedDate
    );
  });
  const plannedIds = new Set(planned.map((row) => row.id));
  const flexible = active.filter((row) => {
    const task = byTask.get(row.taskId)!;
    return (
      !removedIds.has(row.id) &&
      !plannedIds.has(row.id) &&
      !task.recurrence &&
      !task.plannedDate &&
      !task.reviewEnabled &&
      !task.completed &&
      row.status !== 'completed'
    );
  });
  const flexibleIds = new Set(flexible.map((row) => row.id));
  const old = active.filter(
    (row) =>
      !removedIds.has(row.id) &&
      !flexibleIds.has(row.id) &&
      row.plannedDate < day &&
      row.status !== 'completed',
  );
  const pending = planned.filter((row) => row.status !== 'completed');
  const completions = data.events.filter(
    (event) =>
      !event.deletedPersonalTask &&
      !event.reversedAt &&
      ['task', 'review'].includes(event.kind) &&
      event.date === day &&
      event.executionComplete !== false,
  );
  const completedEvents = completions.filter(
    (event) =>
      !event.occurrenceId ||
      data.occurrences.find((row) => row.id === event.occurrenceId)
        ?.completionEventId === event.id,
  );
  const legacy = data.tasks.filter(
    (task) =>
      !task.productivityVersion &&
      task.completed &&
      !task.archived &&
      !completedEvents.some((event) => event.taskId === task.id) &&
      task.completedAt &&
      dateKey(new Date(task.completedAt)) === day,
  );
  return {
    planned,
    pending,
    flexible,
    old,
    removed,
    completed: planned.filter((row) => row.status === 'completed').length,
    completedEvents,
    legacy,
  };
}
