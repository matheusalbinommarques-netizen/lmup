import { db, type ActivityEvent, type Area, type Task } from './db';
import { addCalendarDays, calendarDate } from './calendar';
import { dateKey } from './rewardService';
import { EFFORTS, type Effort } from './effort';
import { staleDays } from './dayRow';
import { saveRoutine } from './routineService';
import type {
  ExecutionRecord,
  Occurrence,
  ProductivityAudit,
  Routine,
} from './productivityTypes';

/**
 * Revisão semanal (lote 6a, design "LMUP Fluxos" R1–R3 e "LMUP Evolução"
 * E3). Leitura pura da semana e registro opcional do que a pessoa decidiu.
 * Nada aqui cobra, conta atraso ou muda o plano sozinho: cada mudança vem
 * de uma ação confirmada, feita pelos serviços que já existem.
 *
 * Calendário (decisão do autor, 16/11): a semana vai de domingo a sábado.
 * No sábado, revisa-se a semana corrente com os dados até o momento; de
 * domingo a sexta, a última semana encerrada. Semanas perdidas não viram
 * fila: só existe a semana da vez.
 */

export type ReviewStep = 'week' | 'wheel' | 'next';
export const REVIEW_STEPS: ReviewStep[] = ['week', 'wheel', 'next'];

/** Aceitar executa uma ação confirmada; recusar só registra; ignorar não grava. */
export type ReviewDecision = {
  id: string;
  outcome: 'accepted' | 'declined';
  action?: string;
  at: string;
};
export type WeeklyReviewEntry = {
  /** Domingo que abre a semana revisada (yyyy-mm-dd): o identificador. */
  week: string;
  startedAt: string;
  doneAt?: string;
  skipped: ReviewStep[];
  decisions: ReviewDecision[];
  /** Números da semana no momento da conclusão, para comparar depois. */
  summary?: { completed: number; planned: number; activeDays: number };
};
export type WeeklyReviewState = {
  version: 1;
  reviews: WeeklyReviewEntry[];
};

const EMPTY: WeeklyReviewState = { version: 1, reviews: [] };
const MAX_REVIEWS = 1000;
const MAX_DECISIONS = 200;
const ID = /^[\w:-]{1,120}$/;

// --- Calendário -----------------------------------------------------------

const weekday = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay();

/** Domingo da semana de `day`. */
export function weekStart(day: string) {
  return addCalendarDays(day, -weekday(day));
}

/** Semana da vez: a corrente no sábado; a última encerrada nos outros dias. */
export function reviewWeek(today: string) {
  const start = weekStart(today);
  return weekday(today) === 6 ? start : addCalendarDays(start, -7);
}

export type ReviewStatus = {
  week: string;
  kind: 'never' | 'available' | 'done';
  /** Última revisão concluída, de qualquer semana. */
  last: WeeklyReviewEntry | null;
  /** Sábado em que a semana da vez ficou disponível. */
  availableSince: string;
  /** Sábado em que a próxima revisão abre. */
  nextFrom: string;
};

export function reviewStatus(
  state: WeeklyReviewState | undefined,
  today: string,
): ReviewStatus {
  const week = reviewWeek(today);
  const done = (state?.reviews ?? []).filter((entry) => entry.doneAt);
  const last =
    [...done].sort((a, b) => a.doneAt!.localeCompare(b.doneAt!)).at(-1) ?? null;
  return {
    week,
    kind: done.some((entry) => entry.week === week)
      ? 'done'
      : done.length
        ? 'available'
        : 'never',
    last,
    availableSince: addCalendarDays(week, 6),
    nextFrom: addCalendarDays(week, 13),
  };
}

// --- A semana (passo 1) ---------------------------------------------------

export type WeekInput = {
  tasks: Task[];
  events: ActivityEvent[];
  /** Ocorrências gravadas (para saber o que foi corrigido a zero). */
  occurrences: Occurrence[];
  /** `plannedOccurrences(semana)`: gravadas e projetadas da semana. */
  rows: Occurrence[];
  executionRecords: ExecutionRecord[];
  areas: Area[];
  routines: Routine[];
  audits: ProductivityAudit[];
};

const RESOLVED_OUT = ['discarded', 'excused'];

function range(week: string, today: string) {
  const end = addCalendarDays(week, 6);
  return { from: week, to: end < today ? end : today };
}

/**
 * Conclusões que contam, uma por ocorrência: sem estorno, completas e não
 * corrigidas a zero (a mesma regra da Evolução). A chave liga a conclusão à
 * ocorrência planejada, para não contar a mesma missão duas vezes.
 */
function completions(input: WeekInput, from: string, to: string) {
  const undone = new Set(
    input.occurrences.filter((row) => row.value === 0).map((row) => row.id),
  );
  const byKey = new Map<string, ActivityEvent>();
  for (const event of input.events) {
    if (
      !['task', 'review'].includes(event.kind) ||
      event.reversedAt ||
      event.executionComplete === false ||
      (event.occurrenceId && undone.has(event.occurrenceId)) ||
      event.date < from ||
      event.date > to
    )
      continue;
    const origin = event.occurrenceDate ?? event.date;
    const same = input.rows.filter((row) => row.taskId === event.taskId);
    // Sem ocorrência no evento: a linha do dia de origem ou, se remarcada,
    // a linha que estava planejada no dia da conclusão.
    const key =
      event.occurrenceId ??
      (
        same.find((row) => row.originDate === origin) ??
        same.find((row) => row.plannedDate === event.date)
      )?.id ??
      `task:${event.taskId}:${origin}`;
    if (!byKey.has(key)) byKey.set(key, event);
  }
  return byKey;
}

/** Linha que de fato ficou planejada no dia (sem pular, trocar ou remover). */
function planned(row: Occurrence, tasks: Map<number | undefined, Task>) {
  const task = tasks.get(row.taskId);
  return (
    !!task &&
    !row.skipped &&
    !row.supersededBy &&
    !RESOLVED_OUT.includes(row.status) &&
    !row.removedFromDays?.includes(row.plannedDate) &&
    (!task.archived || row.status === 'completed')
  );
}

export function weekSummary(input: WeekInput, week: string, today: string) {
  const { from, to } = range(week, today);
  const tasks = new Map(input.tasks.map((task) => [task.id, task]));
  const done = completions(input, from, to);
  const keys = new Set(done.keys());
  for (const row of input.rows)
    if (row.plannedDate >= from && row.plannedDate <= to && planned(row, tasks))
      keys.add(row.id);
  // Dia com ação: uma conclusão ou um progresso registrado, não um plano.
  const actions = (filter: (taskId: number) => boolean) => {
    const days = new Set<string>();
    for (const event of done.values())
      if (filter(event.taskId!)) days.add(event.date);
    const rowTask = new Map(input.occurrences.map((r) => [r.id, r.taskId]));
    for (const record of input.executionRecords) {
      const taskId = rowTask.get(record.occurrenceId);
      if (
        !record.correction &&
        record.after > record.before &&
        record.localDate >= from &&
        record.localDate <= to &&
        taskId !== undefined &&
        filter(taskId)
      )
        days.add(record.localDate);
    }
    return days;
  };
  const effort = new Map<Effort, number>();
  for (const event of done.values()) {
    const key = (tasks.get(event.taskId)?.effort ?? 'small') as Effort;
    effort.set(key, (effort.get(key) ?? 0) + 1);
  }
  // Destravada: avulsa concluída que, na véspera, estava parada (14 dias).
  let unlocked = 0;
  for (const event of done.values()) {
    const task = tasks.get(event.taskId);
    if (!task || task.recurrence || !task.plannedDate) continue;
    const before = addCalendarDays(event.date, -1);
    const stale = staleDays(
      { ...task, completed: false, status: 'available' },
      before,
      input.occurrences,
      input.executionRecords.filter((record) => record.localDate < event.date),
    );
    if (stale !== null) unlocked++;
  }
  const areaOf = (taskId: number) => tasks.get(taskId)?.areaId ?? 0;
  const areaIds = new Set(
    [...done.values()].map((event) => event.areaId ?? areaOf(event.taskId!)),
  );
  const byArea = [...areaIds]
    .map((areaId) => ({
      areaId,
      name:
        areaId === 0
          ? 'Geral'
          : (input.areas.find((area) => area.id === areaId)?.nome ?? 'Área'),
      completed: [...done.values()].filter(
        (event) => (event.areaId ?? areaOf(event.taskId!)) === areaId,
      ).length,
      activeDays: actions((taskId) => areaOf(taskId) === areaId).size,
    }))
    .sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name));
  return {
    from,
    to,
    days: Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1,
    completed: done.size,
    planned: keys.size,
    activeDays: actions(() => true).size,
    unlocked,
    effort: EFFORTS.filter(({ key }) => effort.get(key)).map(
      ({ key, label }) => ({ key, label, count: effort.get(key)! }),
    ),
    byArea,
  };
}
export type WeekSummary = ReturnType<typeof weekSummary>;

// --- A próxima semana (passo 3) -------------------------------------------

export type RoutineSuggestion = {
  id: string;
  routine: Routine;
  doneDays: number;
  scheduledDays: number;
  /** "Só dias úteis" só faz sentido se a rotina tem sábado ou domingo. */
  weekdaysOption: boolean;
};

/**
 * Rotina pouco feita: 3 ou mais dias agendados na semana, já encerrados, e
 * menos da metade concluída por inteiro. O dia de hoje não entra, porque
 * ainda pode ser feito.
 */
export function routineSuggestions(
  input: WeekInput,
  week: string,
  today: string,
): RoutineSuggestion[] {
  const { from, to } = range(week, today);
  const tasks = new Map(input.tasks.map((task) => [task.id, task]));
  const done = completions(input, from, to);
  const doneRows = new Set(done.keys());
  return input.routines
    .filter((routine) => routine.status === 'active' && !routine.mergedInto)
    .flatMap((routine) => {
      const byDay = new Map<string, Occurrence[]>();
      for (const row of input.rows)
        if (
          row.routineId === routine.id &&
          row.plannedDate >= from &&
          row.plannedDate <= to &&
          row.plannedDate < today &&
          planned(row, tasks)
        )
          byDay.set(row.plannedDate, [
            ...(byDay.get(row.plannedDate) ?? []),
            row,
          ]);
      const scheduledDays = byDay.size;
      const doneDays = [...byDay.values()].filter((rows) =>
        rows.every((row) => row.status === 'completed' || doneRows.has(row.id)),
      ).length;
      if (scheduledDays < 3 || doneDays * 2 >= scheduledDays) return [];
      return [
        {
          id: `routine:${routine.id}`,
          routine,
          doneDays,
          scheduledDays,
          weekdaysOption: routine.days.some((day) => day === 0 || day === 6),
        },
      ];
    });
}

export const RESCHEDULE_WINDOW = 28;
export const RESCHEDULE_LIMIT = 3;
const SAME_ACTION_MS = 5000;

const auditDay = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateKey(date);
};
type Change = { taskId: number; at: number };

/**
 * Remarcações registradas na auditoria: mudança de dia de uma ocorrência
 * ("reschedule"), de uma missão sem ocorrência ("today-reschedule") ou de
 * uma data para outra pelo Sem dia ("set-day"). Uma mesma ação pode gravar
 * duas entradas (o Hoje e a ocorrência): entradas da mesma missão com menos
 * de 5 s de diferença contam uma vez.
 */
function reschedules(audits: ProductivityAudit[]): Change[] {
  const changes: Change[] = [];
  for (const entry of audits) {
    const before = (entry.before ?? {}) as Record<string, unknown>;
    const after = (entry.after ?? {}) as Record<string, unknown>;
    const at = Date.parse(entry.recordedAt);
    if (!Number.isFinite(at)) continue;
    let taskId: number | undefined;
    if (entry.action === 'reschedule' || entry.action === 'set-day') {
      const moved =
        !!before.plannedDate &&
        !!after.plannedDate &&
        before.plannedDate !== after.plannedDate;
      if (!moved) continue;
      taskId =
        entry.action === 'set-day'
          ? Number(String(entry.entityId).replace('task:', ''))
          : Number(before.taskId);
    } else if (entry.action === 'today-reschedule') {
      taskId = Number(before.taskId ?? after.taskId ?? before.id);
    } else continue;
    if (Number.isSafeInteger(taskId)) changes.push({ taskId: taskId!, at });
  }
  changes.sort((a, b) => a.taskId - b.taskId || a.at - b.at);
  return changes.filter(
    (change, index) =>
      index === 0 ||
      changes[index - 1].taskId !== change.taskId ||
      change.at - changes[index - 1].at >= SAME_ACTION_MS,
  );
}

export type RescheduleSuggestion = {
  id: string;
  task: Task;
  count: number;
  /** "Algum dia" só para avulsa sem rotina, sem repetição e sem progresso. */
  somedayOption: boolean;
};

/** Missão remarcada 3 vezes ou mais nos 28 dias que terminam na semana. */
export function rescheduleSuggestions(
  input: WeekInput,
  week: string,
  today: string,
): RescheduleSuggestion[] {
  const { to } = range(week, today);
  const from = addCalendarDays(to, 1 - RESCHEDULE_WINDOW);
  const counts = new Map<number, number>();
  for (const change of reschedules(input.audits)) {
    const day = auditDay(new Date(change.at).toISOString());
    if (!day || day < from || day > to) continue;
    counts.set(change.taskId, (counts.get(change.taskId) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= RESCHEDULE_LIMIT)
    .flatMap(([taskId, count]) => {
      const task = input.tasks.find((item) => item.id === taskId);
      if (!task || task.archived || task.completed) return [];
      const progress = input.occurrences.some(
        (row) => row.taskId === taskId && row.value > 0,
      );
      return [
        {
          id: `reschedule:${taskId}`,
          task,
          count,
          somedayOption:
            !task.recurrence &&
            !task.routineId &&
            !task.reviewEnabled &&
            !progress,
        },
      ];
    })
    .sort((a, b) => b.count - a.count);
}

// --- Registro (profile.weeklyReview) --------------------------------------

export function validateWeeklyReview(
  value: unknown,
): asserts value is WeeklyReviewState {
  const state = value as Record<string, unknown> | null;
  const keysOk = (row: object, allowed: string[]) =>
    Object.keys(row).every((key) => allowed.includes(key));
  const iso = (text: unknown) =>
    typeof text === 'string' && Number.isFinite(Date.parse(text));
  const sunday = (text: unknown) =>
    typeof text === 'string' &&
    calendarDate(text) === text &&
    weekday(text) === 0;
  const count = (n: unknown) => Number.isSafeInteger(n) && (n as number) >= 0;
  const ok =
    !!state &&
    typeof state === 'object' &&
    keysOk(state, ['version', 'reviews']) &&
    state.version === 1 &&
    Array.isArray(state.reviews) &&
    state.reviews.length <= MAX_REVIEWS &&
    new Set(state.reviews.map((row) => (row as WeeklyReviewEntry)?.week))
      .size === state.reviews.length &&
    state.reviews.every((row: Record<string, unknown>) => {
      if (!row || typeof row !== 'object') return false;
      const summary = row.summary as Record<string, unknown> | undefined;
      const decisions = row.decisions as Record<string, unknown>[];
      return (
        keysOk(row, [
          'week',
          'startedAt',
          'doneAt',
          'skipped',
          'decisions',
          'summary',
        ]) &&
        sunday(row.week) &&
        iso(row.startedAt) &&
        (row.doneAt === undefined || iso(row.doneAt)) &&
        Array.isArray(row.skipped) &&
        new Set(row.skipped).size === row.skipped.length &&
        row.skipped.every((step) => REVIEW_STEPS.includes(step)) &&
        Array.isArray(decisions) &&
        decisions.length <= MAX_DECISIONS &&
        new Set(decisions.map((d) => d?.id)).size === decisions.length &&
        decisions.every(
          (decision) =>
            !!decision &&
            typeof decision === 'object' &&
            keysOk(decision, ['id', 'outcome', 'action', 'at']) &&
            typeof decision.id === 'string' &&
            ID.test(decision.id) &&
            ['accepted', 'declined'].includes(decision.outcome as string) &&
            (decision.action === undefined ||
              (typeof decision.action === 'string' &&
                decision.action.length <= 40)) &&
            iso(decision.at),
        ) &&
        (summary === undefined ||
          (!!summary &&
            typeof summary === 'object' &&
            keysOk(summary, ['completed', 'planned', 'activeDays']) &&
            count(summary.completed) &&
            count(summary.planned) &&
            count(summary.activeDays)))
      );
    });
  if (!ok)
    throw new Error('Revisão semanal inválida. Os dados foram preservados.');
}

async function update(
  week: string,
  change: (entry: WeeklyReviewEntry) => WeeklyReviewEntry,
) {
  if (calendarDate(week) !== week || weekday(week) !== 0)
    throw new Error('Semana inválida. Reabra a revisão.');
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Abra sua jornada primeiro.');
    const state = structuredClone(profile.weeklyReview ?? EMPTY);
    const index = state.reviews.findIndex((entry) => entry.week === week);
    const current = state.reviews[index] ?? {
      week,
      startedAt: new Date().toISOString(),
      skipped: [],
      decisions: [],
    };
    const next = change(structuredClone(current));
    if (index < 0) state.reviews.push(next);
    else state.reviews[index] = next;
    validateWeeklyReview(state);
    await db.profile.update(1, { weeklyReview: state });
    return next;
  });
}

/**
 * Registra uma decisão da semana. Uma decisão já registrada não é gravada
 * nem aplicada de novo: quem chama usa o requestId `review:<semana>:<id>`
 * na ação, e repetir não muda nada.
 */
export async function recordDecision(
  week: string,
  decision: Omit<ReviewDecision, 'at'>,
) {
  if (!ID.test(decision.id)) throw new Error('Sugestão inválida.');
  return update(week, (entry) =>
    entry.decisions.some((item) => item.id === decision.id)
      ? entry
      : {
          ...entry,
          decisions: [
            ...entry.decisions,
            { ...decision, at: new Date().toISOString() },
          ],
        },
  );
}

/** Conclui a revisão; pular os três passos é permitido. Repetir não duplica. */
export async function completeReview(
  week: string,
  skipped: ReviewStep[],
  summary?: WeeklyReviewEntry['summary'],
) {
  return update(week, (entry) => ({
    ...entry,
    doneAt: entry.doneAt ?? new Date().toISOString(),
    skipped: entry.doneAt ? entry.skipped : [...new Set(skipped)],
    ...(summary && !entry.summary ? { summary } : {}),
  }));
}

export const decisionRequestId = (week: string, id: string) =>
  `review:${week}:${id}`;

const weekdaysOnly = (days: number[]) =>
  days.filter((day) => day >= 1 && day <= 5);

/**
 * "Só dias úteis" (sugestão de rotina): a rotina e os dias próprios de cada
 * missão perdem sábado e domingo; uma missão que só tinha fim de semana
 * passa a seguir a rotina. Vale de hoje em diante pelo saveRoutine: o que
 * já aconteceu fica como está.
 */
export async function routineToWeekdays(routineId: string) {
  const current = await db.routines.get(routineId);
  if (!current) throw new Error('A rotina não está mais disponível.');
  const days = weekdaysOnly(current.days);
  return saveRoutine({
    ...current,
    days: days.length ? days : [1, 2, 3, 4, 5],
    entries: current.entries.map(({ taskId, time, days: own }) => ({
      taskId,
      time,
      days: own && weekdaysOnly(own).length ? weekdaysOnly(own) : null,
    })),
    expectedRevision: current.revision,
  });
}
