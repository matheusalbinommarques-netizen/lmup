import type { Area, Profile, Task } from './db';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import { isDomainKey } from '$lib/content/domains';

/** Days without any action before a dated mission is shown as "parada". */
export const STALE_DAYS = 14;

const DAY_MS = 86_400_000;
const localDay = (value: unknown): string | null => {
  if (typeof value !== 'string' && !(value instanceof Date)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const between = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS,
  );

/**
 * Days since a dated, one-off mission last moved: created, edited, planned
 * or progressed. Recurring missions and missions without a day are never
 * "paradas" (undated captures go to the weekly triage instead).
 */
export function staleDays(
  task: Task,
  today: string,
  occurrences: Occurrence[],
  records: ExecutionRecord[],
): number | null {
  if (task.completed || task.archived || task.recurrence || !task.plannedDate)
    return null;
  const own = new Set(
    occurrences.filter((row) => row.taskId === task.id).map((row) => row.id),
  );
  const moments = [
    localDay(task.createdAt),
    localDay(task.updatedAt),
    task.plannedDate,
    ...records
      .filter((record) => own.has(record.occurrenceId))
      .map((record) => record.localDate ?? localDay(record.executedAt)),
  ].filter((day): day is string => !!day && day <= today);
  if (!moments.length) return null;
  const last = moments.sort().at(-1)!;
  const days = between(last, today);
  return days >= STALE_DAYS ? days : null;
}

/** True when the mission's area belongs to a life domain in focus on the Roda. */
export function inFocus(
  areaId: number | undefined,
  areas: Area[],
  profile: Profile | undefined,
): boolean {
  const focus = profile?.lifeWheel?.focus;
  if (!focus) return false;
  const domain = areaId
    ? areas.find((area) => area.id === areaId)?.domain
    : profile?.generalAreaDomain;
  return isDomainKey(domain) && !!focus[domain];
}

/**
 * A mission can be concluded straight from its row when concluding needs no
 * extra input: direct tracking, no steps, no spaced review, and (for
 * routines) today's occurrence. Anything else opens the execution screen.
 */
export function canCompleteInline(
  task: Task | undefined,
  row: Occurrence,
  today: string,
): boolean {
  if (!task || task.archived || task.reviewEnabled) return false;
  if (['completed', 'discarded', 'excused'].includes(row.status)) return false;
  if ((row.tracking?.method ?? task.tracking?.method ?? 'direct') !== 'direct')
    return false;
  if (row.steps?.length || task.subtasks?.length) return false;
  if (task.recurrence && row.originDate !== today) return false;
  if (!task.recurrence && task.plannedDate && task.plannedDate > today)
    return false;
  return true;
}
