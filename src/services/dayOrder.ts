import { db } from './db';
import type { Occurrence } from './productivityTypes';
import { calendarDate } from './calendar';
import { changeOccurrence, ensureOccurrence } from './occurrenceService';
import { progressTransaction } from './rewardService';
import { saveTaskDefinition } from './taskDefinitionService';
import { validateTime } from './productivityRules';

/** Minutes counted for a mission without an estimate (design: "15 min*"). */
export const DEFAULT_MINUTES = 15;

type Ordered = Pick<Occurrence, 'id' | 'plannedTime' | 'dayOrder'>;

const rankOn = (row: Ordered, day: string) =>
  row.dayOrder?.day === day ? row.dayOrder.rank : null;
const byTime = (a: Ordered, b: Ordered) =>
  (a.plannedTime ?? '99:99').localeCompare(b.plannedTime ?? '99:99');

/**
 * The single order of a day. Rows the user has ordered keep that order;
 * the others (new or never moved) join it: a fixed time goes before the
 * first row with a later fixed time; a row without time goes before the
 * next fixed time still to come (`now`, "HH:MM", only for today) so its
 * calculated time starts now, or last when there is none.
 */
export function orderDay<T extends Ordered>(
  rows: T[],
  day: string,
  now?: string,
): T[] {
  const ordered = rows
    .filter((row) => rankOn(row, day) !== null)
    .sort((a, b) => rankOn(a, day)! - rankOn(b, day)! || byTime(a, b));
  const loose = rows
    .filter((row) => rankOn(row, day) === null)
    .sort((a, b) => byTime(a, b));
  const result = [...ordered];
  for (const row of loose) {
    const after = row.plannedTime ?? now;
    const at = after
      ? result.findIndex((other) =>
          row.plannedTime
            ? !!other.plannedTime && other.plannedTime > after
            : !!other.plannedTime && other.plannedTime >= after,
        )
      : -1;
    if (at < 0) result.push(row);
    else result.splice(at, 0, row);
  }
  return result;
}

/** Moves one id by `delta` positions; out-of-range moves keep the order. */
export function moveId(ids: string[], id: string, delta: number): string[] {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length || delta === 0) return ids;
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

export type TimeKind = 'anchor' | 'computed' | 'missed' | 'done' | 'none';
export type DaySlot = {
  id: string;
  time: string | null;
  kind: TimeKind;
  /** No estimate: counts {@link DEFAULT_MINUTES} for the times after it. */
  defaultDuration: boolean;
};
export type DayConflict = {
  /** Row whose calculated end runs into the fixed time. */
  id: string;
  anchorId: string;
  end: string;
  minutes: number;
};

const toMinutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const clock = (minutes: number) => {
  const value = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
};
const localClock = (iso?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : clock(date.getHours() * 60 + date.getMinutes());
};

type TimelineRow = Ordered &
  Pick<Occurrence, 'status' | 'value' | 'estimatedMinutes' | 'completedAt'>;

/**
 * Times of the day in its single order. A fixed time (◆) stays; the others
 * are calculated (≈) from "now" and the durations before them, counting
 * 15 min when there is no estimate. A conflict is only reported when every
 * row since the previous fixed time has a real duration (design F3).
 */
export function dayTimeline(
  rows: TimelineRow[],
  now: Date,
): { slots: DaySlot[]; conflicts: DayConflict[] } {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let cursor = Math.ceil(nowMinutes / 5) * 5;
  let stretch: { id: string; end: number }[] = [];
  let stretchReal = true;
  const slots: DaySlot[] = [];
  const conflicts: DayConflict[] = [];
  for (const row of rows) {
    const real = !!row.estimatedMinutes && row.estimatedMinutes > 0;
    const minutes = real ? row.estimatedMinutes! : DEFAULT_MINUTES;
    const base = { id: row.id, defaultDuration: !real };
    if (row.status === 'completed') {
      const time = row.plannedTime ?? localClock(row.completedAt);
      slots.push({ ...base, time, kind: time ? 'done' : 'none' });
      continue;
    }
    if (row.plannedTime) {
      const start = toMinutes(row.plannedTime);
      const untouched = row.status === 'planned' && !row.value;
      if (untouched && start + minutes <= nowMinutes) {
        slots.push({ ...base, time: row.plannedTime, kind: 'missed' });
        continue;
      }
      const last = stretch.at(-1);
      if (last && stretchReal && start >= nowMinutes && last.end > start)
        conflicts.push({
          id: last.id,
          anchorId: row.id,
          end: clock(last.end),
          minutes: last.end - start,
        });
      slots.push({ ...base, time: row.plannedTime, kind: 'anchor' });
      cursor = Math.max(cursor, start + minutes);
      stretch = [];
      stretchReal = true;
      continue;
    }
    slots.push({ ...base, time: clock(cursor), kind: 'computed' });
    cursor += minutes;
    stretch.push({ id: row.id, end: cursor });
    stretchReal &&= real;
  }
  return { slots, conflicts };
}

/**
 * Saves the order of the day. Rows that only exist as a projection are
 * stored first (same path as opening the execution); a row that cannot be
 * stored (legacy completion) keeps joining the order by time. Only
 * `dayOrder` changes: progress, rewards and revisions are untouched.
 */
export async function saveDayOrder(
  day: string,
  rows: Pick<Occurrence, 'id' | 'taskId' | 'originDate' | 'reconstructed'>[],
): Promise<void> {
  if (!calendarDate(day)) throw new Error('Data inválida.');
  const ids: string[] = [];
  for (const row of rows) {
    if (await db.occurrences.get(row.id)) {
      ids.push(row.id);
      continue;
    }
    try {
      ids.push(
        (await ensureOccurrence(row.taskId, row.originDate, row.reconstructed))
          .id,
      );
    } catch {
      // Legacy completions cannot become occurrences; they stay ordered by time.
    }
  }
  await progressTransaction(async () => {
    for (const [index, id] of ids.entries())
      await db.occurrences.update(id, {
        dayOrder: { day, rank: (index + 1) * 10 },
      });
  });
}

export type TimeScope = 'today' | 'forward';

/**
 * Fixes (or clears) the time of a row from the Hoje. "today" changes only
 * this occurrence; "forward" changes the mission (and its routine entry)
 * for the next days as well, plus today's occurrence. One-off missions
 * always use "forward": there is no other day to keep.
 */
export async function setRowTime(
  row: Pick<Occurrence, 'id' | 'taskId' | 'originDate' | 'reconstructed'>,
  time: string | null,
  scope: TimeScope,
): Promise<void> {
  const value = validateTime(time);
  await progressTransaction(async () => {
    const task = await db.tasks.get(row.taskId);
    if (!task || task.archived)
      throw new Error('Esta missão não está mais disponível.');
    if (scope === 'forward' || !task.recurrence) {
      if ((task.plannedTime ?? null) !== value)
        await saveTaskDefinition({
          ...task,
          description: task.description ?? '',
          editId: task.id,
          expectedRevision: task.definitionRevision,
          plannedTime: value,
          requestId: crypto.randomUUID(),
        });
    }
    const id = (await db.occurrences.get(row.id))
      ? row.id
      : (await ensureOccurrence(row.taskId, row.originDate, row.reconstructed))
          .id;
    const current = await db.occurrences.get(id);
    if (current && (current.plannedTime ?? null) !== value)
      await changeOccurrence(
        id,
        current.revision,
        { plannedTime: value },
        crypto.randomUUID(),
      );
  });
}
