import type { Task, TaskRecurrence } from './db';
import { addCalendarDays, calendarDate } from './calendar';
import { reviewDueDate } from './reviewRules';

export const WEEKDAYS = [
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
];

export function validateRecurrence(value: TaskRecurrence | null | undefined) {
  if (value == null) return null;
  if (
    typeof value !== 'object' ||
    !['daily', 'weekdays', 'weekly'].includes(value.kind)
  )
    throw new Error('Escolha uma recorrência válida.');
  if (!value.startDate || calendarDate(value.startDate) !== value.startDate)
    throw new Error('Escolha a data inicial da recorrência.');
  const days = value.days ?? [];
  if (
    !Array.isArray(days) ||
    days.some((day) => !Number.isInteger(day) || day < 0 || day > 6) ||
    new Set(days).size !== days.length ||
    (value.kind === 'weekly' && days.length !== 1) ||
    (value.kind === 'weekdays' && days.length === 0)
  )
    throw new Error('Escolha os dias da semana para repetir a missão.');
  return {
    kind: value.kind,
    startDate: value.startDate,
    ...(value.kind === 'daily' ? {} : { days: [...days].sort() }),
  } as TaskRecurrence;
}

export function scheduledOn(task: Task, day: string): boolean {
  if (task.archived || task.skippedDate === day) return false;
  if (task.recurrence) {
    if (day < task.recurrence.startDate) return false;
    return (
      task.occurrenceOverride === day ||
      task.recurrence.kind === 'daily' ||
      !!task.recurrence.days?.includes(new Date(`${day}T12:00:00Z`).getUTCDay())
    );
  }
  if (task.reviewEnabled)
    return task.plannedDate === day || reviewDueDate(task) <= day;
  return task.plannedDate === day;
}

export function nextPlannedDate(task: Task, day: string): string | null {
  if (task.archived) return null;
  if (!task.recurrence) {
    const planned =
      task.plannedDate && task.plannedDate > day ? task.plannedDate : null;
    const review =
      task.reviewEnabled && reviewDueDate(task) > day
        ? reviewDueDate(task)
        : null;
    return (
      [planned, review].filter((value): value is string => !!value).sort()[0] ??
      null
    );
  }
  const start =
    day < task.recurrence.startDate
      ? task.recurrence.startDate
      : addCalendarDays(day, 1);
  for (let offset = 0; offset < 7; offset++) {
    const candidate = addCalendarDays(start, offset);
    if (scheduledOn(task, candidate)) return candidate;
  }
  return null;
}

export function recurrenceLabel(
  task: Pick<Task, 'recurrence' | 'reviewEnabled'>,
): string {
  if (task.reviewEnabled) return 'Revisão espaçada';
  if (!task.recurrence) return 'Sem repetição';
  if (task.recurrence.kind === 'daily') return 'Diariamente';
  return `${task.recurrence.kind === 'weekly' ? 'Semanal · ' : ''}${WEEKDAYS.filter(
    (day) => task.recurrence?.days?.includes(day.value),
  )
    .map((day) => day.short)
    .join(' · ')}`;
}
