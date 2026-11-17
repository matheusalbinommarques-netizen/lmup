import type { Occurrence } from '$services/productivityTypes';
import { ensureOccurrence } from '$services/occurrenceService';
import { staleDays } from '$services/dayRow';
import { todayView } from './todayView';

/**
 * Queues of the single execution screen (lote 3). A queue never has its own
 * order: it is always a slice of the Dia, in the Dia's order.
 * - "dia": every row of the Dia except the stalled group;
 * - "bloco": consecutive rows of the same routine (2 or more) in the Dia;
 * - "selecao": the rows chosen in Missões (lote 5c, replaces new sessions).
 */
export type QueueKind = 'dia' | 'bloco' | 'selecao';
export type DayBlock = { routineId: string; ids: string[] };

type Snapshot = Parameters<typeof todayView>[0] & {
  executionRecords: Parameters<typeof staleDays>[3];
};

/** Rows of the Dia in its single order, as the Hoje lists them. */
export function dayRows(data: Snapshot, today: string, now: Date) {
  const view = todayView(data, today, now);
  return view.planned.filter((row) => {
    const task = data.tasks.find((item) => item.id === row.taskId);
    return (
      !task || !staleDays(task, today, data.occurrences, data.executionRecords)
    );
  });
}

type Row = Pick<Occurrence, 'id' | 'routineId'>;

/** Runs of 2+ consecutive rows of the same routine. */
export function dayBlocks(rows: Row[]): DayBlock[] {
  const blocks: DayBlock[] = [];
  let run: DayBlock | undefined;
  for (const row of rows) {
    if (row.routineId && run?.routineId === row.routineId) {
      run.ids.push(row.id);
      continue;
    }
    if (run && run.ids.length > 1) blocks.push(run);
    run = row.routineId
      ? { routineId: row.routineId, ids: [row.id] }
      : undefined;
  }
  if (run && run.ids.length > 1) blocks.push(run);
  return blocks;
}

export function blockOf(rows: Row[], id: string): DayBlock | undefined {
  return dayBlocks(rows).find((block) => block.ids.includes(id));
}

/** The queue that contains `currentId`, in the Dia's order. */
export function executionQueue<T extends Row>(
  rows: T[],
  kind: QueueKind,
  currentId: string,
  ids: string[] = [],
): T[] {
  if (kind === 'selecao') {
    const chosen = new Set(ids);
    return chosen.has(currentId)
      ? rows.filter((row) => chosen.has(row.id))
      : [];
  }
  if (kind === 'dia')
    return rows.some((row) => row.id === currentId) ? rows : [];
  const block = blockOf(rows, currentId);
  return block ? rows.filter((row) => block.ids.includes(row.id)) : [];
}

export const isPending = (
  row: Pick<Occurrence, 'status' | 'planningSuspended' | 'skipped'>,
) =>
  !row.planningSuspended &&
  !row.skipped &&
  !['completed', 'excused', 'discarded'].includes(row.status);

/**
 * Next pending row after `currentId`; when none is left after it, the first
 * pending one before it ("Pular para depois" leaves the order untouched).
 */
export function nextInQueue<T extends Row & Parameters<typeof isPending>[0]>(
  queue: T[],
  currentId: string,
): T | undefined {
  const index = queue.findIndex((row) => row.id === currentId);
  const after = queue.slice(index + 1).find(isPending);
  if (after) return after;
  return queue
    .slice(0, Math.max(index, 0))
    .find((row) => isPending(row) && row.id !== currentId);
}

/** "Iniciar dia" before anything happened today; "Continuar o dia" after. */
export function dayStartLabel(
  rows: Pick<Occurrence, 'status' | 'value'>[],
): 'Iniciar dia' | 'Continuar o dia' {
  return rows.some((row) => row.status === 'completed' || row.value > 0)
    ? 'Continuar o dia'
    : 'Iniciar dia';
}

export function executionHref(id: string, kind?: QueueKind, ids?: string[]) {
  const query = !kind
    ? ''
    : kind === 'selecao'
      ? `?fila=selecao&ids=${(ids ?? []).map(encodeURIComponent).join(',')}`
      : `?fila=${kind}`;
  return `/executar/${encodeURIComponent(id)}${query}`;
}

/**
 * Opening a selection (Missões): the rows get their occurrence and the
 * execution screen opens on the first pending one, with the others as its
 * queue in the Dia's order. Nothing else is created.
 */
export async function selectionHref(
  rows: Pick<
    Occurrence,
    | 'taskId'
    | 'originDate'
    | 'reconstructed'
    | 'status'
    | 'planningSuspended'
    | 'skipped'
  >[],
): Promise<string | null> {
  const ids: string[] = [];
  let first: string | null = null;
  for (const row of rows) {
    const stored = await ensureOccurrence(
      row.taskId,
      row.originDate,
      row.reconstructed,
    );
    ids.push(stored.id);
    if (!first && isPending(stored)) first = stored.id;
  }
  return first ? executionHref(first, 'selecao', ids) : null;
}
