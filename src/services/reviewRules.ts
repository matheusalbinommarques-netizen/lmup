import type { Task } from './db';
import { addCalendarDays } from './calendar';
import { dateKey } from './rewardService';
export function reviewDueDate(task: Task): string {
  if (task.reviewDueDate) return task.reviewDueDate;
  const base = new Date(task.reviewStartedAt ?? task.createdAt);
  if (Number.isNaN(base.getTime())) return '9999-12-31';
  return addCalendarDays(dateKey(base), task.reviewIntervalDays ?? 7);
}
