import type { Occurrence } from '$services/productivityTypes';
import type { JourneySnapshot } from '$services/journeyQuery';
import { makeOccurrence } from '$services/occurrenceService';
import { dateKey } from '$services/rewardService';

export function todayView(data: JourneySnapshot, day: string) {
  const byTask = new Map(data.tasks.map((task) => [task.id, task]));
  const all = new Map(data.plannedToday.map((row) => [row.taskId, row]));
  const completions = data.events.filter(
    (event) =>
      !event.deletedPersonalTask &&
      !event.reversedAt &&
      ['task', 'review'].includes(event.kind) &&
      event.date === day &&
      event.executionComplete !== false &&
      (!event.occurrenceId ||
        data.occurrences.some(
          (row) =>
            row.id === event.occurrenceId && row.completionEventId === event.id,
        )),
  );
  const completedEvents = [
    ...new Map(completions.map((event) => [event.taskId, event])).values(),
  ];
  const legacy = data.tasks.filter(
    (task) =>
      task.completed &&
      !task.archived &&
      !completedEvents.some((event) => event.taskId === task.id) &&
      ((task.completedAt && dateKey(new Date(task.completedAt)) === day) ||
        (!task.productivityVersion &&
          (task.recurrence
            ? task.lastOccurrenceDate === day
            : task.plannedDate === day))),
  );
  const completedIds = new Set([
    ...completedEvents.map((event) => event.taskId),
    ...legacy.map((task) => task.id),
  ]);
  for (const id of completedIds) {
    const task = byTask.get(id);
    if (!task || task.archived) continue;
    const row = all.get(id!) ?? makeOccurrence(task, day);
    all.set(id!, { ...row, status: 'completed' });
  }
  const active = [...all.values()].filter((row) => {
    const task = byTask.get(row.taskId);
    return (
      task &&
      !task.archived &&
      !task.planningPaused &&
      !row.planningSuspended &&
      !row.supersededBy &&
      !row.skipped &&
      !['discarded', 'excused'].includes(row.status) &&
      row.plannedDate <= day
    );
  });
  const removed = active.filter(
    (row) =>
      row.removedFromDays?.includes(day) ||
      byTask.get(row.taskId)?.skippedDate === day,
  );
  const current = active.filter(
    (row) =>
      !removed.includes(row) &&
      (row.status !== 'completed' || completedIds.has(row.taskId)),
  );
  const planned = current.filter((row) => {
    const task = byTask.get(row.taskId)!;
    return (
      !!task.recurrence ||
      !!task.plannedDate ||
      row.value > 0 ||
      completedIds.has(row.taskId) ||
      ['active', 'paused'].includes(task.executionState ?? '') ||
      data.sessions.some(
        (session) =>
          session.status !== 'ended' && session.occurrenceIds.includes(row.id),
      )
    );
  });
  const flexible = current.filter(
    (row) => !planned.includes(row) && row.status !== 'completed',
  );
  return {
    planned,
    pending: planned.filter((row) => row.status !== 'completed'),
    flexible,
    old: [] as Occurrence[],
    removed,
    completed: planned.filter((row) => row.status === 'completed').length,
    completedEvents,
    legacy,
  };
}
