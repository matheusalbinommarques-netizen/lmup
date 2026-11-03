import type { Occurrence } from './productivityTypes';
import type { Task } from './db';
import { db } from './db';
import { dateKey, progressTransaction } from './rewardService';
import {
  ensureOccurrence,
  changeOccurrence,
  savePlanVersion,
} from './occurrenceService';
import { calendarDate } from './calendar';

export function occurrenceEligibility(
  row: Occurrence,
  task: Task | undefined,
  day: string,
): string | null {
  if (!task || task.archived) return 'Missão arquivada ou indisponível';
  if (task.completed && !task.recurrence) return 'Missão já concluída';
  if (
    task.recurrence &&
    !task.productivityVersion &&
    task.lastOccurrenceDate === day
  )
    return 'Já concluída hoje';
  if (task.reviewEnabled) return 'Use a sessão de revisão desta atividade';
  if (row.removedFromDays?.includes(day) || task.skippedDate === day)
    return 'Removida deste dia';
  if (row.planningSuspended || task.planningPaused) return 'Rotina pausada';
  if (row.status === 'completed') return 'Ocorrência já concluída';
  if (['discarded', 'excused'].includes(row.status))
    return 'Fora do planejamento ativo';
  if (row.plannedDate !== day)
    return row.plannedDate > day
      ? 'Planejada para outra data'
      : 'Ocorrência de outro dia; retome a execução anterior';
  return null;
}
export async function dayChangeNeedsConfirmation(id: string) {
  const row = await db.occurrences.get(id);
  return (
    !!row &&
    (row.value > 0 ||
      !!(await db.savedMissionSessions
        .filter((session) => session.occurrenceIds.includes(id))
        .count()))
  );
}
export async function changeToday(input: {
  row: Occurrence;
  action: 'remove' | 'restore' | 'reschedule';
  day: string;
  targetDate?: string;
  time?: string | null;
  acknowledged?: boolean;
  requestId: string;
}) {
  if (calendarDate(input.day) !== input.day || input.day !== dateKey())
    throw new Error('O dia mudou. Atualize o planejamento.');
  if (!/^[\w:-]{1,120}$/.test(input.requestId))
    throw new Error('Reabra a ação para continuar.');
  if (
    input.action === 'reschedule' &&
    (!input.targetDate ||
      calendarDate(input.targetDate) !== input.targetDate ||
      input.targetDate === input.row.plannedDate)
  )
    throw new Error('Escolha outra data válida.');
  return progressTransaction(async () => {
    const prior = await db.productivityAudit.get(input.requestId);
    if (prior) {
      if (
        prior.entityId !== input.row.id ||
        prior.action !== `today-${input.action}`
      )
        throw new Error('Identificador já utilizado.');
      return;
    }
    const task = await db.tasks.get(input.row.taskId);
    if (!task || task.archived)
      throw new Error('A missão não está mais disponível.');
    if (task.reviewEnabled) {
      if (input.action === 'restore')
        await db.tasks.update(task.id!, { skippedDate: null });
      else if (input.action === 'remove')
        await db.tasks.update(task.id!, { skippedDate: input.day });
      else
        await db.tasks.update(task.id!, {
          plannedDate: input.targetDate,
          skippedDate: null,
          definitionRevision: (task.definitionRevision ?? 0) + 1,
        });
      await db.productivityAudit.add({
        id: input.requestId,
        entityId: input.row.id,
        action: `today-${input.action}`,
        recordedAt: new Date().toISOString(),
        before: {
          taskId: task.id,
          plannedDate: task.plannedDate,
          skippedDate: task.skippedDate,
        },
        after: {
          taskId: task.id,
          day: input.day,
          targetDate: input.targetDate,
        },
      });
      return;
    }
    const existing = await db.occurrences.get(input.row.id);
    if (
      !existing &&
      !task.recurrence &&
      task.plannedDate === input.row.originDate &&
      input.row.originDate < input.day &&
      input.action === 'reschedule'
    ) {
      if (
        input.row.definitionRevision !== undefined &&
        input.row.definitionRevision !== (task.definitionRevision ?? 0)
      )
        throw new Error('A missão mudou. Reabra a ação.');
      await db.tasks.update(task.id!, {
        plannedDate: input.targetDate,
        plannedTime: input.time ?? task.plannedTime,
        definitionRevision: (task.definitionRevision ?? 0) + 1,
      });
      await savePlanVersion((await db.tasks.get(task.id!))!);
      await db.productivityAudit.add({
        id: input.requestId,
        entityId: input.row.id,
        action: `today-${input.action}`,
        recordedAt: new Date().toISOString(),
        before: task,
        after: await db.tasks.get(task.id!),
      });
      return;
    }

    const row =
      existing ?? (await ensureOccurrence(task.id!, input.row.originDate));
    if (row.revision !== input.row.revision)
      throw new Error('A ocorrência mudou em outra aba. Reabra a ação.');
    if (
      input.action !== 'restore' &&
      ['completed', 'discarded', 'excused'].includes(row.status)
    )
      throw new Error('Esta ocorrência não pode ser alterada por esta ação.');
    const sessions = await db.savedMissionSessions
      .filter((session) => session.occurrenceIds.includes(row.id))
      .toArray();
    if (input.action === 'reschedule' && sessions.length)
      throw new Error(
        'Esta ocorrência pertence a uma sessão iniciada. Sua data foi preservada; organize uma próxima ocorrência pela Agenda.',
      );
    if (
      input.action !== 'restore' &&
      (row.value > 0 || sessions.length) &&
      !input.acknowledged
    )
      throw new Error(
        'Confirme a preservação do progresso e da sessão antes de continuar.',
      );
    if (input.action === 'restore' && task.skippedDate === input.day)
      await db.tasks.update(task.id!, { skippedDate: null });
    if (input.action === 'reschedule')
      await changeOccurrence(
        row.id,
        row.revision,
        {
          plannedDate: input.targetDate,
          plannedTime: input.time ?? row.plannedTime,
        },
        `${input.requestId}:move`,
      );
    else
      await db.occurrences.update(row.id, {
        removedFromDays:
          input.action === 'remove'
            ? [...new Set([...(row.removedFromDays ?? []), input.day])]
            : (row.removedFromDays ?? []).filter((day) => day !== input.day),
        revision: row.revision + 1,
      });
    await db.productivityAudit.add({
      id: input.requestId,
      entityId: row.id,
      action: `today-${input.action}`,
      recordedAt: new Date().toISOString(),
      before: row,
      after: await db.occurrences.get(row.id),
    });
  });
}
