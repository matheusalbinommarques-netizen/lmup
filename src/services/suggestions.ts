import { db, type Task } from './db';
import { addCalendarDays } from './calendar';
import { dateKey, progressTransaction } from './rewardService';
import { validStartedAt, validateTime } from './productivityRules';
import { saveTaskDefinition } from './taskDefinitionService';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import { recordDecision, type WeeklyReviewState } from './weeklyReview';

/**
 * Sugestões de horário e duração (lote 6b, decisões do autor de 17/11).
 * São observações a partir do que o cronômetro mediu: nada muda sozinho.
 * Aceitar grava a definição de hoje em diante; "Não sugerir mais" suprime
 * aquele tipo de sugestão para a missão; "Agora não" não grava nada.
 *
 * Só contam medições do cronômetro (lote 3): o registro de execução com
 * início real (`startedAt`). Conclusão pela linha, em lote ou com minutos
 * digitados não tem início real e fica de fora.
 */

export type SuggestionKind = 'time' | 'duration';

export type TimeSuggestion = {
  id: `time:${number}`;
  kind: 'time';
  task: Task;
  current: string | null;
  suggested: string;
  /** Inícios medidos (hh:mm), um por dia, do mais antigo ao mais recente. */
  samples: string[];
  /** Quantos ficam a até 30 min da mediana, e entre que horas. */
  close: { count: number; from: string; to: string };
};
export type DurationSuggestion = {
  id: `duration:${number}`;
  kind: 'duration';
  task: Task;
  current: number | null;
  suggested: number;
  /** Minutos medidos das últimas conclusões, da mais antiga à mais recente. */
  samples: number[];
};
export type Suggestion = TimeSuggestion | DurationSuggestion;

export const TIME_WINDOW = 21;
export const TIME_MIN_DAYS = 6;
export const TIME_STEP = 15;
export const TIME_SPREAD = 30;
export const TIME_MIN_CHANGE = 30;
export const DURATION_SAMPLES = 5;
export const DURATION_MIN_SAMPLES = 3;
export const DURATION_STEP = 5;
const DAY = 24 * 60;

export type SuggestionInput = {
  tasks: Task[];
  /** Ocorrências gravadas. */
  occurrences: Occurrence[];
  executionRecords: ExecutionRecord[];
  weeklyReview?: WeeklyReviewState;
};

// --- Horário em minutos do dia (circular) ---------------------------------

const toMinutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const formatTime = (minutes: number) => {
  const m = ((Math.round(minutes) % DAY) + DAY) % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
/** Distância no relógio: 23:50 e 00:10 estão a 20 min. */
export const clockDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % DAY;
  return Math.min(d, DAY - d);
};
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Mediana circular: corta o relógio no ponto oposto à média circular e tira
 * a mediana comum dali. Inícios em volta da meia-noite (23:50, 00:10) dão
 * 00:00, não meio-dia. Sem direção clara (inícios espalhados pelo dia),
 * não há mediana: devolve null.
 */
export function circularMedian(minutes: number[]): number | null {
  if (!minutes.length) return null;
  const angle = (m: number) => (m / DAY) * 2 * Math.PI;
  const x = minutes.reduce((sum, m) => sum + Math.cos(angle(m)), 0);
  const y = minutes.reduce((sum, m) => sum + Math.sin(angle(m)), 0);
  if (Math.hypot(x, y) / minutes.length < 1e-6) return null;
  const mean = ((Math.atan2(y, x) / (2 * Math.PI)) * DAY + DAY) % DAY;
  const cut = (mean + DAY / 2) % DAY;
  const shifted = minutes.map((m) => (m - cut + DAY) % DAY);
  return (median(shifted) + cut) % DAY;
}

// --- Medições ---------------------------------------------------------------

/** Hora local do início, pelo fuso gravado no registro. */
function localStart(record: ExecutionRecord) {
  const local = new Date(
    Date.parse(record.startedAt!) - record.offsetMinutes * 60000,
  );
  return {
    day: local.toISOString().slice(0, 10),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

/**
 * Registros que valem como medição: com início real válido, sem correção e
 * com progresso de fato. Uma ocorrência corrigida ou desfeita (valor zero)
 * perde todas as medições.
 */
function measuredRecords(input: SuggestionInput) {
  const occurrences = new Map(input.occurrences.map((row) => [row.id, row]));
  const corrected = new Set(
    input.executionRecords
      .filter((record) => record.correction)
      .map((record) => record.occurrenceId),
  );
  return input.executionRecords.filter((record) => {
    const row = occurrences.get(record.occurrenceId);
    return (
      !!row &&
      !record.correction &&
      !corrected.has(record.occurrenceId) &&
      row.value > 0 &&
      record.after > record.before &&
      validStartedAt(record.startedAt, record.executedAt) &&
      Number.isFinite(record.offsetMinutes)
    );
  });
}

const suppressed = (state: WeeklyReviewState | undefined, id: string) =>
  !!state?.reviews.some((review) =>
    review.decisions.some(
      (decision) => decision.id === id && decision.outcome === 'declined',
    ),
  );

const eligible = (task: Task) =>
  !!task.id && !task.archived && !task.completed && !task.reviewEnabled;

/** Fim do período: o último dia da semana revisada ou hoje. */
const periodEnd = (week: string, today: string) => {
  const end = addCalendarDays(week, 6);
  return end < today ? end : today;
};

/**
 * Horário: missão recorrente ou de rotina com 6 ou mais dias de início real
 * nos 21 dias que terminam na semana revisada. Vale o primeiro início de
 * cada ocorrência (retomar não soma) e um por dia. Sugere a mediana,
 * arredondada a 15 min, se 2/3 dos inícios ficam a até 30 min dela e se ela
 * está a 30 min ou mais da hora fixada (ou se não há hora).
 */
export function timeSuggestions(
  input: SuggestionInput,
  week: string,
  today: string,
): TimeSuggestion[] {
  const to = periodEnd(week, today);
  const from = addCalendarDays(to, 1 - TIME_WINDOW);
  const taskOf = new Map(input.occurrences.map((row) => [row.id, row.taskId]));
  // Primeiro início de cada ocorrência.
  const firstByOccurrence = new Map<string, ExecutionRecord>();
  for (const record of measuredRecords(input)) {
    const prior = firstByOccurrence.get(record.occurrenceId);
    if (!prior || Date.parse(record.startedAt!) < Date.parse(prior.startedAt!))
      firstByOccurrence.set(record.occurrenceId, record);
  }
  // Primeiro início por missão e dia.
  const byTask = new Map<
    number,
    Map<string, { at: number; minutes: number }>
  >();
  for (const record of firstByOccurrence.values()) {
    const taskId = taskOf.get(record.occurrenceId)!;
    const { day, minutes } = localStart(record);
    if (day < from || day > to) continue;
    const days = byTask.get(taskId) ?? new Map();
    const at = Date.parse(record.startedAt!);
    const prior = days.get(day);
    if (!prior || at < prior.at) days.set(day, { at, minutes });
    byTask.set(taskId, days);
  }
  const tasks = new Map(input.tasks.map((task) => [task.id, task]));
  return [...byTask]
    .flatMap(([taskId, days]): TimeSuggestion[] => {
      const task = tasks.get(taskId);
      if (!task || !eligible(task) || (!task.recurrence && !task.routineId))
        return [];
      if (days.size < TIME_MIN_DAYS) return [];
      if (suppressed(input.weeklyReview, `time:${taskId}`)) return [];
      const starts = [...days.values()].sort((a, b) => a.at - b.at);
      const minutes = starts.map((start) => start.minutes);
      const center = circularMedian(minutes);
      if (center === null) return [];
      // Desvio com sinal, para 23:50 ficar antes de 00:10.
      const offsets = minutes
        .map((m) => ((m - center + DAY + DAY / 2) % DAY) - DAY / 2)
        .filter((offset) => Math.abs(offset) <= TIME_SPREAD);
      if (offsets.length * 3 < minutes.length * 2) return [];
      const suggested = formatTime(Math.round(center / TIME_STEP) * TIME_STEP);
      const current = task.plannedTime ?? null;
      if (
        current &&
        clockDistance(toMinutes(current), toMinutes(suggested)) <
          TIME_MIN_CHANGE
      )
        return [];
      return [
        {
          id: `time:${taskId}`,
          kind: 'time',
          task,
          current,
          suggested,
          samples: minutes.map(formatTime),
          close: {
            count: offsets.length,
            from: formatTime(center + Math.min(...offsets)),
            to: formatTime(center + Math.max(...offsets)),
          },
        },
      ];
    })
    .sort(
      (a, b) =>
        (b.current
          ? clockDistance(toMinutes(b.current), toMinutes(b.suggested))
          : 0) -
          (a.current
            ? clockDistance(toMinutes(a.current), toMinutes(a.suggested))
            : 0) || a.task.title.localeCompare(b.task.title),
    );
}

/**
 * Duração: minutos do cronômetro em ocorrências concluídas. As partes da
 * mesma ocorrência somam; se alguma parte não foi medida, a ocorrência não
 * entra (a soma ficaria curta). Usa até as 5 conclusões mais recentes, com
 * no mínimo 3, e sugere a mediana arredondada a 5 min quando a missão não
 * tem duração ou quando a diferença é de 25% e de 5 min ou mais.
 */
export function durationSuggestions(
  input: SuggestionInput,
  today: string,
): DurationSuggestion[] {
  const measured = new Set(measuredRecords(input).map((record) => record.id));
  const byOccurrence = new Map<string, ExecutionRecord[]>();
  for (const record of input.executionRecords)
    if (!record.correction && record.after > record.before)
      byOccurrence.set(record.occurrenceId, [
        ...(byOccurrence.get(record.occurrenceId) ?? []),
        record,
      ]);
  const byTask = new Map<number, { at: number; minutes: number }[]>();
  for (const row of input.occurrences) {
    if (row.status !== 'completed') continue;
    const parts = byOccurrence.get(row.id) ?? [];
    if (
      !parts.length ||
      parts.some(
        (part) =>
          !measured.has(part.id) ||
          !Number.isFinite(part.minutes) ||
          (part.minutes ?? 0) <= 0 ||
          part.localDate > today,
      )
    )
      continue;
    const minutes = parts.reduce((sum, part) => sum + part.minutes!, 0);
    if (minutes > DAY) continue;
    const at = Math.max(...parts.map((part) => Date.parse(part.executedAt)));
    byTask.set(row.taskId, [
      ...(byTask.get(row.taskId) ?? []),
      { at, minutes },
    ]);
  }
  const tasks = new Map(input.tasks.map((task) => [task.id, task]));
  return [...byTask]
    .flatMap(([taskId, rows]): DurationSuggestion[] => {
      const task = tasks.get(taskId);
      if (!task || !eligible(task)) return [];
      if (suppressed(input.weeklyReview, `duration:${taskId}`)) return [];
      const recent = rows
        .sort((a, b) => a.at - b.at)
        .slice(-DURATION_SAMPLES)
        .map((row) => row.minutes);
      if (recent.length < DURATION_MIN_SAMPLES) return [];
      const suggested = Math.max(
        DURATION_STEP,
        Math.round(median(recent) / DURATION_STEP) * DURATION_STEP,
      );
      const current = task.estimatedMinutes ?? null;
      if (current !== null) {
        const diff = Math.abs(suggested - current);
        if (diff < 5 || diff < current * 0.25) return [];
      }
      return [
        {
          id: `duration:${taskId}`,
          kind: 'duration',
          task,
          current,
          suggested,
          samples: recent.map((m) => Math.round(m)),
        },
      ];
    })
    .sort((a, b) => a.task.title.localeCompare(b.task.title));
}

/** Horários primeiro, depois durações; a tela mostra uma por vez. */
export function suggestions(
  input: SuggestionInput,
  week: string,
  today: string,
): Suggestion[] {
  return [
    ...timeSuggestions(input, week, today),
    ...durationSuggestions(input, today),
  ];
}

// --- Aceitar e recusar -------------------------------------------------------

export type SuggestionChange =
  | { id: `time:${number}`; kind: 'time'; taskId: number; value: string }
  | {
      id: `duration:${number}`;
      kind: 'duration';
      taskId: number;
      value: number;
    };

const ID = /^(time|duration):(\d{1,15})$/;
function check(change: SuggestionChange) {
  const match = ID.exec(change.id);
  if (!match || match[1] !== change.kind || Number(match[2]) !== change.taskId)
    throw new Error('Sugestão inválida.');
  if (change.kind === 'time') validateTime(change.value);
  else if (
    !Number.isSafeInteger(change.value) ||
    change.value <= 0 ||
    change.value > DAY
  )
    throw new Error('Duração inválida.');
}

const decided = async (week: string, id: string) =>
  !!(await db.profile.get(1))?.weeklyReview?.reviews
    .find((review) => review.week === week)
    ?.decisions.some((decision) => decision.id === id);

/**
 * Aceita uma sugestão: muda a definição da missão de hoje em diante (pelo
 * mesmo caminho da edição, que leva a hora à rotina e grava a versão do
 * plano) e as ocorrências de hoje e futuras ainda intocadas, que seguiam o
 * valor antigo. O passado não muda. Tudo numa transação com o registro da
 * decisão: dois cliques, ou uma falha no meio, não gravam duas mudanças.
 */
export async function acceptSuggestion(week: string, change: SuggestionChange) {
  check(change);
  return progressTransaction(async () => {
    if (await decided(week, change.id)) return false;
    const task = await db.tasks.get(change.taskId);
    if (!task || task.archived)
      throw new Error('Esta missão não está mais disponível.');
    const field = change.kind === 'time' ? 'plannedTime' : 'estimatedMinutes';
    const before = task[field] ?? null;
    if (before !== change.value)
      await saveTaskDefinition({
        ...task,
        description: task.description ?? '',
        editId: task.id,
        expectedRevision: task.definitionRevision,
        [field]: change.value,
        requestId: `review:${week}:${change.id}`,
      });
    const today = dateKey();
    const rows = await db.occurrences
      .where('taskId')
      .equals(change.taskId)
      .toArray();
    for (const row of rows)
      if (
        row.plannedDate >= today &&
        row.status === 'planned' &&
        row.value === 0 &&
        (row[field] ?? null) === before &&
        before !== change.value
      ) {
        await db.occurrences.put({
          ...row,
          [field]: change.value,
          revision: row.revision + 1,
        });
        await db.productivityAudit.add({
          id: `review:${week}:${change.id}:${row.id}`,
          entityId: row.id,
          action: 'suggestion-accept',
          recordedAt: new Date().toISOString(),
          before: { [field]: before },
          after: { [field]: change.value },
        });
      }
    await recordDecision(week, {
      id: change.id,
      outcome: 'accepted',
      action: `${change.kind}:${change.value}`,
    });
    return true;
  });
}

/** "Não sugerir mais": só registra; vale para aquele tipo e aquela missão. */
export async function declineSuggestion(week: string, id: string) {
  const match = ID.exec(id);
  if (!match) throw new Error('Sugestão inválida.');
  return recordDecision(week, { id, outcome: 'declined' });
}
