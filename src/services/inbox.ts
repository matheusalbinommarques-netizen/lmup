import { db, type Task } from './db';
import { calendarDate, addCalendarDays } from './calendar';
import { dateKey } from './rewardService';
import { occurrenceId, savePlanVersion } from './occurrenceService';
import { isOpenSession } from './sessionLifecycle';
import type { Occurrence, SavedMissionSession } from './productivityTypes';

/**
 * Sem dia (lote 5a): Caixa de entrada (capturadas, ainda sem decisão) e
 * Algum dia (sem prazo e sem cobrança). Nenhuma das duas entra no Hoje.
 */
export const TRIAGE_DAYS = 14;

export type InboxItem = { task: Task; ageDays: number; triage: boolean };

type Source = {
  tasks: Task[];
  occurrences: Occurrence[];
  sessions: SavedMissionSession[];
};

function daysBetween(from: string, to: string) {
  return Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) /
      86_400_000,
  );
}

function localDay(value: Task['createdAt']) {
  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? null : dateKey(date);
}

/** Missão avulsa, sem dia, sem recorrência e sem progresso em andamento. */
export function isUndated(task: Task, source: Source) {
  if (
    task.archived ||
    task.completed ||
    task.status === 'completed' ||
    task.recurrence ||
    task.reviewEnabled ||
    task.routineId ||
    task.plannedDate ||
    ['active', 'paused'].includes(task.executionState ?? '')
  )
    return false;
  const row = source.occurrences.find(
    (item) => item.id === occurrenceId(task, ''),
  );
  // Com progresso, ela já está no Dia (todayView a mostra lá).
  if (row && (row.value > 0 || row.status === 'completed')) return false;
  return !source.sessions.some(
    (session) =>
      isOpenSession(session) && !!row && session.occurrenceIds.includes(row.id),
  );
}

export function inboxView(source: Source, today = dateKey()) {
  const undated = source.tasks
    .filter((task) => isUndated(task, source))
    .sort(
      (a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt)) ||
        (b.id ?? 0) - (a.id ?? 0),
    );
  const inbox: InboxItem[] = undated
    .filter((task) => !task.someday)
    .map((task) => {
      const created = localDay(task.createdAt);
      const ageDays = created ? Math.max(0, daysBetween(created, today)) : 0;
      return { task, ageDays, triage: ageDays >= TRIAGE_DAYS };
    });
  return { inbox, someday: undated.filter((task) => task.someday) };
}

/** "capturada hoje", "capturada há 5 dias", "na caixa há 16 dias". */
export function ageLabel(item: InboxItem) {
  if (item.triage) return `na caixa há ${item.ageDays} dias`;
  if (item.ageDays === 0) return 'capturada hoje';
  if (item.ageDays === 1) return 'capturada ontem';
  return `capturada há ${item.ageDays} dias`;
}

/** Contagem por dia (missões avulsas com dia) para "Escolher dia". */
export function dayCounts(tasks: Task[], from: string, days = 7) {
  const result = new Map<string, number>();
  for (let index = 0; index < days; index++)
    result.set(addCalendarDays(from, index), 0);
  for (const task of tasks) {
    if (
      task.archived ||
      task.completed ||
      task.recurrence ||
      !task.plannedDate ||
      !result.has(task.plannedDate)
    )
      continue;
    result.set(task.plannedDate, result.get(task.plannedDate)! + 1);
  }
  return result;
}

export type DayTarget = { day: string } | 'inbox' | 'someday';

/**
 * Leva uma missão sem dia a um dia, de volta à caixa ou ao Algum dia.
 * Não mexe em progresso, recompensa nem histórico; só no plano.
 */
export async function setTaskDay(
  id: number,
  target: DayTarget,
  requestId: string,
) {
  if (!/^[\w:-]{1,120}$/.test(requestId))
    throw new Error('Reabra a ação para continuar.');
  const day = typeof target === 'object' ? calendarDate(target.day) : null;
  if (typeof target === 'object' && (!day || day < dateKey()))
    throw new Error('Escolha hoje ou um dia futuro.');
  await db.transaction('rw', db.tables, async () => {
    if (await db.productivityAudit.get(requestId)) return;
    const task = await db.tasks.get(id);
    if (!task || task.archived)
      throw new Error('Esta missão não está mais disponível.');
    if (task.completed || task.status === 'completed')
      throw new Error('Esta missão já foi concluída.');
    if (task.recurrence || task.reviewEnabled || task.routineId)
      throw new Error(
        'Rotinas e repetições têm dias próprios. Edite a missão para mudar.',
      );
    const row = await db.occurrences.get(occurrenceId(task, ''));
    if (row && (row.value > 0 || row.status === 'completed'))
      throw new Error(
        'Esta missão já tem progresso. Remarque pelo Dia para preservá-lo.',
      );
    const before = {
      plannedDate: task.plannedDate ?? null,
      someday: !!task.someday,
    };
    await db.tasks.update(id, {
      plannedDate: day,
      someday: target === 'someday' ? true : undefined,
      skippedDate: null,
      definitionRevision: (task.definitionRevision ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    });
    // savePlanVersion leva a ocorrência aberta hoje ao novo dia; uma aberta
    // num dia passado (sem progresso) fica de fora dela e é levada aqui.
    await savePlanVersion((await db.tasks.get(id))!);
    const opened = row && (await db.occurrences.get(row.id));
    if (opened && day && opened.plannedDate !== day)
      await db.occurrences.put({
        ...opened,
        plannedDate: day,
        removedFromDays: (opened.removedFromDays ?? []).filter(
          (item) => item !== day,
        ),
        revision: opened.revision + 1,
      });
    await db.productivityAudit.add({
      id: requestId,
      entityId: `task:${id}`,
      action: 'set-day',
      recordedAt: new Date().toISOString(),
      before,
      after: { plannedDate: day, someday: target === 'someday' },
    });
  });
}
