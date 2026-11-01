import { fraction, progressTarget } from './productivityRules';
import type {
  ExecutionRecord,
  Occurrence,
  ProductivityAudit,
  Routine,
} from './productivityTypes';
import { addCalendarDays } from './calendar';
export function occurrenceSituation(row: Occurrence, now = new Date()) {
  if (['completed', 'excused', 'discarded'].includes(row.status))
    return row.status;
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (row.deadline && row.deadline < local) return 'expired';
  if (`${row.plannedDate}T${row.plannedTime ?? '23:59'}` < local) return 'late';
  return row.status;
}
export function freeSlot(
  rows: Occurrence[],
  day: string,
  duration: number,
  earliest = '08:00',
  latest = '22:00',
) {
  const number = (time: string) =>
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const blocks = rows
    .filter(
      (row) =>
        row.plannedTime && !['discarded', 'excused'].includes(row.status),
    )
    .map((row) => {
      const from =
        ((Date.parse(row.plannedDate + 'T12:00:00Z') -
          Date.parse(day + 'T12:00:00Z')) /
          86400000) *
          1440 +
        number(row.plannedTime!);
      return { from, to: from + (row.estimatedMinutes ?? 30) };
    })
    .filter(
      (block) => block.to > number(earliest) && block.from < number(latest),
    )
    .sort((a, b) => a.from - b.from);
  let cursor = number(earliest);
  for (const block of blocks) {
    if (cursor + duration <= block.from) break;
    if (block.to > cursor && block.from < cursor + duration)
      cursor = Math.ceil(block.to);
  }
  return cursor + duration <= number(latest)
    ? `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`
    : null;
}
export function recommendations(rows: Occurrence[], now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return rows
    .filter(
      (row) =>
        row.plannedDate <= today &&
        !['completed', 'discarded', 'excused'].includes(row.status),
    )
    .map((row) => {
      const state = occurrenceSituation(row, now);
      const score =
        (row.importance === 'high' ? 60 : row.importance === 'low' ? 0 : 20) +
        (state === 'expired' ? 100 : state === 'late' ? 40 : 0) +
        (row.value > 0 ? 15 : 0) +
        (row.estimatedMinutes && row.estimatedMinutes <= 20 ? 10 : 0);
      const reason =
        state === 'expired'
          ? 'O prazo final passou; execute ou revise seu plano.'
          : state === 'late'
            ? 'O início planejado passou; você pode executar agora ou reagendar.'
            : row.importance === 'high'
              ? 'É uma missão de alta importância.'
              : row.value > 0
                ? 'Você já avançou; retomar evita perder o fio.'
                : row.estimatedMinutes && row.estimatedMinutes <= 20
                  ? 'Cabe em um pequeno intervalo do dia.'
                  : 'Está prevista para hoje; você pode escolher começar por ela.';
      return { id: row.id, title: row.title, reason, score };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3);
}
export function consistency(rows: Occurrence[], today: string) {
  const days = new Map<string, Occurrence[]>();
  for (const row of rows.filter(
    (item) => item.originDate <= today && item.status !== 'discarded',
  ))
    days.set(row.originDate, [...(days.get(row.originDate) ?? []), row]);
  let streak = 0;
  let previous = 0;
  for (const [day, planned] of [...days].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const excused = planned.every((row) => row.status === 'excused');
    const completed = planned.every(
      (row) =>
        row.status === 'excused' ||
        (row.status === 'completed' && !row.recovered),
    );
    if (excused) continue;
    if (completed) streak++;
    else if (day < today) {
      previous = Math.max(previous, streak);
      streak = 0;
    }
  }
  return { streak, best: Math.max(previous, streak) };
}
export function productivityReport(
  rows: Occurrence[],
  records: ExecutionRecord[],
  audit: ProductivityAudit[],
  routines: Routine[],
  from: string,
  to: string,
) {
  const planned = rows.filter(
    (row) =>
      row.originDate >= from &&
      row.originDate <= to &&
      row.status !== 'discarded',
  );
  const expected = planned.filter((row) => row.status !== 'excused');
  const complete = expected.filter((row) => row.status === 'completed');
  // Actual minutes are cumulative deltas for time goals; corrections can remove time.
  const events = records.filter(
    (row) => row.localDate >= from && row.localDate <= to,
  );
  const byId = new Map(rows.map((row) => [row.id, row]));
  const minutesFor = (record: ExecutionRecord) =>
    record.minutes ??
    (byId.get(record.occurrenceId)?.tracking?.method === 'time'
      ? record.after - record.before
      : 0);
  const minutes = Math.max(
    0,
    events.reduce((sum, row) => sum + minutesFor(row), 0),
  );
  const byArea = new Map<
    number,
    { planned: number; completed: number; minutes: number }
  >();
  for (const row of expected) {
    const area = byArea.get(row.areaId) ?? {
      planned: 0,
      completed: 0,
      minutes: 0,
    };
    area.planned++;
    if (row.status === 'completed') area.completed++;
    byArea.set(row.areaId, area);
  }
  const hours = new Map<string, number>();
  for (const record of events) {
    const row = byId.get(record.occurrenceId);
    if (!row) continue;
    const area = byArea.get(row.areaId) ?? {
      planned: 0,
      completed: 0,
      minutes: 0,
    };
    area.minutes += minutesFor(record);
    byArea.set(row.areaId, area);
    if (!record.correction)
      hours.set(
        record.localTime.slice(0, 2),
        (hours.get(record.localTime.slice(0, 2)) ?? 0) +
          Math.max(0, record.after - record.before) /
            Math.max(1, progressTarget(row)),
      );
  }
  const routineProgress = routines.map((routine) => {
    const own = planned.filter((row) => row.routineId === routine.id);
    return {
      id: routine.id,
      name: routine.name,
      completion: own.length
        ? Math.round(
            (100 * own.reduce((sum, row) => sum + fraction(row), 0)) /
              own.length,
          )
        : 0,
      ...consistency(own, to),
    };
  });
  return {
    expected: expected.length,
    completed: complete.length,
    recovered: complete.filter((row) => row.recovered).length,
    excused: planned.length - expected.length,
    completionRate: expected.length
      ? Math.round((100 * complete.length) / expected.length)
      : null,
    minutes,
    estimatedMinutes: expected.reduce(
      (sum, row) => sum + (row.estimatedMinutes ?? 0),
      0,
    ),
    reschedules: audit.filter(
      (row) =>
        row.action === 'reschedule' &&
        row.recordedAt.slice(0, 10) >= from &&
        row.recordedAt.slice(0, 10) <= to,
    ).length,
    byArea: [...byArea].map(([id, stats]) => ({ id, ...stats })),
    neglected: [...byArea]
      .filter(
        ([, stats]) =>
          stats.planned >= 3 && stats.completed / stats.planned < 0.5,
      )
      .map(([id]) => id),
    productiveHours: [...hours]
      .sort((a, b) => b[1] - a[1])
      .map(([hour]) => hour),
    routineProgress,
    monthly: [...new Set(rows.map((row) => row.originDate.slice(0, 7)))]
      .sort()
      .slice(-6)
      .map((month) => ({
        month,
        completed: rows.filter(
          (row) =>
            row.originDate.startsWith(month) && row.status === 'completed',
        ).length,
      })),
    weekly: Array.from(
      {
        length:
          Math.ceil((Date.parse(to) - Date.parse(from)) / 86400000 / 7) + 1,
      },
      (_, index) => {
        const start = addCalendarDays(from, index * 7),
          end = addCalendarDays(start, 6);
        return {
          from: start,
          completed: complete.filter(
            (row) => row.originDate >= start && row.originDate <= end,
          ).length,
        };
      },
    ),
  };
}
