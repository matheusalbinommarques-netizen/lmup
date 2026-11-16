import { db, type Task } from './db';
import type { Occurrence, Routine } from './productivityTypes';
import { addCalendarDays, calendarDate } from './calendar';
import { dateKey } from './rewardService';
import { orderDay } from './dayOrder';
import { changeOccurrence, ensureOccurrence } from './occurrenceService';
import { setTaskDay } from './inbox';
import { isOpenSession } from './sessionLifecycle';
import { minutesLabel } from './capture';

// Missões › Semana (lote 5b, design P1/S1): sete dias a partir de `start`.

export type WeekItem = {
  row: Occurrence;
  done: boolean;
  /** Muda de dia e de ordem pela Semana. */
  movable: boolean;
  /** Pode voltar para a caixa de entrada ("Sem dia"). */
  toInbox: boolean;
};
export type WeekRoutine = {
  id: string;
  name: string;
  count: number;
  done: number;
  time: string | null;
};
export type WeekDay = {
  date: string;
  /** Todas as linhas do dia na ordem única (rotinas incluídas). */
  rows: Occurrence[];
  /** Missões avulsas: o que a Semana planeja. */
  items: WeekItem[];
  routines: WeekRoutine[];
  /** Repetições fora de rotina; aparecem com "Mostrar rotinas". */
  recurring: WeekItem[];
  /** Contagens e durações só das avulsas. */
  pending: number;
  done: number;
  /** Soma só das durações reais dos pendentes. */
  minutes: number;
  noDuration: number;
};

const closed = ['discarded', 'excused'];

/** Linhas que contam num dia (as mesmas que a Agenda mostrava). */
function visible(row: Occurrence, date: string, task: Task | undefined) {
  return (
    !!task &&
    !task.archived &&
    row.plannedDate === date &&
    !row.skipped &&
    !row.supersededBy &&
    !closed.includes(row.status) &&
    !row.removedFromDays?.includes(date) &&
    // Sem dia fica na caixa (lote 5a): só entra se já tem dia ou progresso.
    (row.value > 0 ||
      row.originDate !== row.plannedDate ||
      !!task.plannedDate ||
      !!task.recurrence)
  );
}

export function weekView(input: {
  start: string;
  today: string;
  /** Ocorrências do período (`plannedOccurrences`). */
  rows: Occurrence[];
  /** O Dia de hoje como o Hoje mostra (`todayView(...).planned`). */
  todayRows: Occurrence[];
  tasks: Task[];
  routines: Routine[];
  days?: number;
}): WeekDay[] {
  const byTask = new Map(input.tasks.map((task) => [task.id!, task]));
  const names = new Map(
    input.routines.map((routine) => [routine.id, routine.name]),
  );
  return Array.from({ length: input.days ?? 7 }, (_, index) => {
    const date = addCalendarDays(input.start, index);
    const rows =
      date === input.today
        ? input.todayRows
        : orderDay(
            input.rows.filter((row) =>
              visible(row, date, byTask.get(row.taskId)),
            ),
            date,
          );
    const items: WeekItem[] = [];
    const recurring: WeekItem[] = [];
    const routines = new Map<string, WeekRoutine>();
    for (const row of rows) {
      const task = byTask.get(row.taskId);
      const done = row.status === 'completed';
      if (row.routineId) {
        const block = routines.get(row.routineId) ?? {
          id: row.routineId,
          name: names.get(row.routineId) ?? 'Rotina',
          count: 0,
          done: 0,
          time: null,
        };
        block.count += 1;
        if (done) block.done += 1;
        if (row.plannedTime && (!block.time || row.plannedTime < block.time))
          block.time = row.plannedTime;
        routines.set(row.routineId, block);
        continue;
      }
      const open = !done && date >= input.today;
      const single = !!task && !task.recurrence && !task.reviewEnabled;
      (single ? items : recurring).push({
        row,
        done,
        movable: open && !task?.reviewEnabled,
        toInbox: open && single && row.value === 0,
      });
    }
    const pending = items.filter((item) => !item.done);
    return {
      date,
      rows,
      items,
      routines: [...routines.values()].sort((a, b) =>
        (a.time ?? '99:99').localeCompare(b.time ?? '99:99'),
      ),
      recurring,
      pending: pending.length,
      done: items.length - pending.length,
      minutes: pending.reduce(
        (sum, item) => sum + (item.row.estimatedMinutes ?? 0),
        0,
      ),
      noDuration: pending.filter((item) => !item.row.estimatedMinutes).length,
    };
  });
}

/** "3 pendentes · 2h10 com duração · 1 sem" (design P1). */
export function daySummary(day: WeekDay) {
  const parts: string[] = [];
  if (day.pending)
    parts.push(
      `${day.pending} ${day.pending === 1 ? 'pendente' : 'pendentes'}`,
    );
  if (day.minutes) parts.push(`${minutesLabel(day.minutes)} com duração`);
  if (day.noDuration)
    parts.push(
      day.minutes ? `${day.noDuration} sem` : `${day.noDuration} sem duração`,
    );
  if (!day.pending && day.done)
    parts.push(day.done === 1 ? '1 feita' : `${day.done} feitas`);
  return parts.join(' · ') || 'Livre';
}

/** Chip do dia (design P1): "↻ 2 rotinas · 6 recorrentes". */
export function routinesLabel(day: WeekDay) {
  const parts: string[] = [];
  const n = day.routines.length,
    r = day.recurring.length;
  if (n) parts.push(n === 1 ? '1 rotina' : `${n} rotinas`);
  if (r) parts.push(r === 1 ? '1 recorrente' : `${r} recorrentes`);
  return parts.join(' · ');
}

const at = (date: string) => new Date(`${date}T12:00:00`);
const weekdayShort = (date: string) => {
  const name = at(date).toLocaleDateString('pt-BR', { weekday: 'short' });
  return name.charAt(0).toUpperCase() + name.slice(1, 3);
};

/** "Seg 16"; hoje vira "Dom 15 · hoje". */
export function dayName(date: string, today: string) {
  const name = `${weekdayShort(date)} ${at(date).getDate()}`;
  return date === today ? `${name} · hoje` : name;
}

/** "15 a 21 de novembro" ou "29 de novembro a 5 de dezembro". */
export function rangeLabel(start: string, days = 7) {
  const end = addCalendarDays(start, days - 1);
  const month = (date: string) =>
    at(date).toLocaleDateString('pt-BR', { month: 'long' });
  const year = (date: string) => at(date).getFullYear();
  const tail = (date: string) =>
    `${at(date).getDate()} de ${month(date)}${
      year(date) !== year(dateKey()) ? ` de ${year(date)}` : ''
    }`;
  if (month(start) === month(end) && year(start) === year(end))
    return `${at(start).getDate()} a ${tail(end)}`;
  return `${year(start) === year(end) ? `${at(start).getDate()} de ${month(start)}` : tail(start)} a ${tail(end)}`;
}

/**
 * Leva uma linha da Semana para outro dia (hoje ou futuro). Missão avulsa
 * sem progresso muda o próprio dia (`setTaskDay`, igual ao Sem dia); o resto
 * (repetição, rotina ou avulsa com progresso) remarca só a ocorrência, que
 * guarda progresso e recompensas. Idempotente por `requestId`.
 */
export async function moveToDay(
  row: Pick<
    Occurrence,
    'id' | 'taskId' | 'originDate' | 'plannedDate' | 'reconstructed'
  >,
  target: string,
  requestId: string,
) {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw new Error('Reabra a ação para continuar.');
  const day = calendarDate(target);
  if (!day || day < dateKey())
    throw new Error('Escolha hoje ou um dia futuro.');
  if (await db.productivityAudit.get(requestId)) return;
  const task = await db.tasks.get(row.taskId);
  if (!task || task.archived)
    throw new Error('Esta missão não está mais disponível.');
  if (task.reviewEnabled)
    throw new Error('Repetições de revisão mudam de dia pela própria missão.');
  const stored = await db.occurrences.get(row.id);
  if (stored?.status === 'completed' || (!task.recurrence && task.completed))
    throw new Error('Missão concluída não muda de dia.');
  if (!task.recurrence && !task.routineId && !(stored && stored.value > 0)) {
    await setTaskDay(task.id!, { day }, requestId);
    return;
  }
  if (row.plannedDate === day) return;
  const sessions = await db.savedMissionSessions
    .filter(
      (session) =>
        isOpenSession(session) && session.occurrenceIds.includes(row.id),
    )
    .count();
  if (sessions)
    throw new Error(
      'Esta missão está numa sessão iniciada. Termine a sessão antes de mudar o dia.',
    );
  const occurrence =
    stored ??
    (await ensureOccurrence(task.id!, row.originDate, row.reconstructed));
  if (occurrence.status === 'completed')
    throw new Error('Missão concluída não muda de dia.');
  await changeOccurrence(
    occurrence.id,
    occurrence.revision,
    { plannedDate: day },
    requestId,
  );
}
