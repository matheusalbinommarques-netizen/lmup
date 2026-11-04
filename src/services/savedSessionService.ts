import { reconcileProductivity } from './productivityLifecycle';
import { db } from './db';
import {
  closeSessionRecord,
  isOpenSession,
  settleCompletedSessions,
} from './sessionLifecycle';
import { dateKey, progressTransaction } from './rewardService';
import type { SavedMissionSession } from './productivityTypes';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { occurrenceEligibility } from './dailyPlanningService';
import { progressTarget } from './productivityRules';

export async function completeSessionOccurrence(input: {
  sessionId: string;
  expectedSessionRevision: number;
  occurrenceId: string;
  expectedOccurrenceRevision: number;
  requestId: string;
}) {
  return progressTransaction(async () => {
    const session = await db.savedMissionSessions.get(input.sessionId);
    if (!session) throw new Error('A sessão não está mais disponível.');
    const prior = await db.executionRecords.get(input.requestId);
    if (prior) {
      if (
        prior.occurrenceId !== input.occurrenceId ||
        prior.sessionId !== input.sessionId
      )
        throw new Error('Identificador já utilizado.');
      return {
        session,
        event: await db.activityEvents.get(`progress:${input.requestId}`),
      };
    }
    if (
      session.status !== 'active' ||
      session.revision !== input.expectedSessionRevision ||
      session.occurrenceIds[session.cursor] !== input.occurrenceId
    )
      throw new Error(
        'A sessão mudou em outra aba. Confira a atividade selecionada.',
      );
    const row = await db.occurrences.get(input.occurrenceId);
    const task = row && (await db.tasks.get(row.taskId));
    if (
      !row ||
      !task ||
      task.archived ||
      task.reviewEnabled ||
      row.revision !== input.expectedOccurrenceRevision ||
      row.planningSuspended ||
      row.plannedDate > dateKey() ||
      ['completed', 'excused', 'discarded'].includes(row.status)
    )
      throw new Error(
        'Esta atividade não está disponível para conclusão rápida.',
      );
    if ((row.tracking?.method ?? 'direct') !== 'direct')
      throw new Error(
        'Registre o progresso desta atividade na execução detalhada.',
      );
    const event = await recordProgress({
      sessionId: session.id,
      requestId: input.requestId,
      occurrenceId: row.id,
      expectedRevision: row.revision,
      value: progressTarget(row),
      executedAt: new Date().toISOString(),
    });
    const settled = (await db.savedMissionSessions.get(session.id))!;
    if (!isOpenSession(settled)) return { session: settled, event };
    const pending: number[] = [];
    for (const [index, id] of session.occurrenceIds.entries()) {
      const candidate = await db.occurrences.get(id);
      const definition = candidate && (await db.tasks.get(candidate.taskId));
      if (
        candidate &&
        definition &&
        !definition.archived &&
        !['completed', 'discarded', 'excused'].includes(candidate.status)
      )
        pending.push(index);
    }
    const cursor =
      pending.find((index) => index > session.cursor) ??
      pending[0] ??
      session.occurrenceIds.length;
    const saved = await saveSession({ ...session, cursor }, session.revision);
    return { session: saved, event };
  });
}
export async function saveSession(
  input: SavedMissionSession,
  expectedRevision?: number,
) {
  if (
    !input.id ||
    !input.name.trim() ||
    input.name.length > 160 ||
    input.closedAt !== undefined ||
    input.closedReason !== undefined ||
    (!input.occurrenceIds.length && input.status !== 'ended') ||
    new Set(input.occurrenceIds).size !== input.occurrenceIds.length ||
    !Number.isSafeInteger(input.cursor) ||
    input.cursor < 0 ||
    input.cursor > input.occurrenceIds.length ||
    !['active', 'paused', 'ended'].includes(input.status) ||
    !['focus', 'overview'].includes(input.mode)
  )
    throw new Error('Sessão inválida.');
  return progressTransaction(async () => {
    await reconcileProductivity();
    const current = await db.savedMissionSessions.get(input.id);
    if (current && !isOpenSession(current))
      throw new Error(
        'Esta sessão foi encerrada. Monte uma nova sessão com as atividades pendentes.',
      );
    if (current && current.revision !== expectedRevision)
      throw new Error('A sessão mudou em outra aba. Reabra para comparar.');
    if (input.status === 'ended')
      return closeSessionRecord(current ?? input, 'ended');
    if ((await db.occurrences.bulkGet(input.occurrenceIds)).some((row) => !row))
      throw new Error('Uma ocorrência não está disponível.');
    const added = input.occurrenceIds.filter(
      (id) => !current?.occurrenceIds.includes(id),
    );
    for (const id of added) {
      const row = (await db.occurrences.get(id))!;
      const reason = occurrenceEligibility(
        row,
        await db.tasks.get(row.taskId),
        dateKey(),
      );
      if (
        reason &&
        !(
          row.status === 'completed' &&
          ['Ocorrência já concluída', 'Missão já concluída'].includes(reason)
        )
      )
        throw new Error(reason);
    }
    if (
      (await db.savedMissionSessions.toArray()).some(
        (session) =>
          session.id !== input.id &&
          isOpenSession(session) &&
          session.occurrenceIds.some((id) => input.occurrenceIds.includes(id)),
      )
    )
      throw new Error(
        'Uma atividade já pertence a outra sessão aberta. Retome essa sessão ou escolha outra atividade.',
      );
    if (input.status === 'active')
      await db.savedMissionSessions
        .where('status')
        .equals('active')
        .modify((row) => {
          if (row.id !== input.id) {
            row.status = 'paused';
            row.revision++;
          }
        });
    const updated = {
      ...input,
      occurrenceIds: [...input.occurrenceIds],
      revision: (current?.revision ?? 0) + 1,
    };
    await db.savedMissionSessions.put(updated);
    return updated;
  });
}
export function newSavedSession(
  name: string,
  occurrenceIds: string[],
): SavedMissionSession {
  return {
    id: crypto.randomUUID(),
    name,
    occurrenceIds,
    cursor: 0,
    status: 'active',
    mode: 'focus',
    revision: 0,
    createdAt: new Date().toISOString(),
  };
}

/** Atomic reuse prevents repeated starts (including concurrent tabs) from multiplying queues. */
export async function startOrResumeSession(
  name: string,
  occurrenceIds: string[],
  day = dateKey(),
  includeCompleted = false,
) {
  if (
    !occurrenceIds.length ||
    new Set(occurrenceIds).size !== occurrenceIds.length ||
    day !== dateKey()
  )
    throw new Error('Selecione ocorrências disponíveis hoje.');
  return progressTransaction(async () => {
    await settleCompletedSessions();
    const rows = await db.occurrences.bulkGet(occurrenceIds);
    if (rows.some((row) => !row))
      throw new Error('Uma ocorrência não está mais disponível.');
    for (const row of rows) {
      if (row!.plannedDate > day || row!.removedFromDays?.includes(day))
        throw new Error(
          'A seleção contém uma ocorrência indisponível para hoje.',
        );
    }
    const sessions = await db.savedMissionSessions.toArray();
    const existing = sessions.find(
      (session) =>
        isOpenSession(session) &&
        session.occurrenceIds.length === occurrenceIds.length &&
        session.occurrenceIds.every((id) => occurrenceIds.includes(id)),
    );
    if (existing)
      return saveSession({ ...existing, status: 'active' }, existing.revision);
    if (
      sessions.some(
        (session) =>
          session.status !== 'ended' &&
          session.occurrenceIds.some((id) => occurrenceIds.includes(id)),
      )
    )
      throw new Error(
        'Uma atividade já pertence a uma sessão em andamento. Retome essa sessão ou selecione atividades sem esse vínculo. A composição existente foi preservada.',
      );
    for (const row of rows) {
      const reason = occurrenceEligibility(
        row!,
        await db.tasks.get(row!.taskId),
        day,
      );
      if (
        reason &&
        !(
          includeCompleted &&
          row!.status === 'completed' &&
          ['Ocorrência já concluída', 'Missão já concluída'].includes(reason)
        )
      )
        throw new Error(reason);
    }
    const cursor = rows.findIndex((row) => row!.status !== 'completed');
    if (cursor < 0)
      throw new Error(
        'Todas as atividades já foram concluídas. Nenhuma nova sequência foi criada.',
      );
    return saveSession({ ...newSavedSession(name, occurrenceIds), cursor });
  });
}

export async function startSelectedSession(
  rows: import('./productivityTypes').Occurrence[],
  name = 'Sessão de Missões',
) {
  return progressTransaction(async () => {
    const ids: string[] = [];
    for (const selected of rows) {
      const task = await db.tasks.get(selected.taskId);
      const reason = occurrenceEligibility(selected, task, dateKey());
      if (reason) throw new Error(reason);
      const stored = await db.occurrences.get(selected.id);
      if (
        stored
          ? stored.revision !== selected.revision
          : selected.definitionRevision !== undefined &&
            selected.definitionRevision !== (task?.definitionRevision ?? 0)
      )
        throw new Error('Uma atividade mudou. Atualize a seleção.');
      const current = await ensureOccurrence(
        selected.taskId,
        selected.originDate,
      );
      const currentReason = occurrenceEligibility(current, task, dateKey());
      if (currentReason) throw new Error(currentReason);
      ids.push(current.id);
    }
    return startOrResumeSession(name, ids);
  });
}

export async function reconcileSessions() {
  return progressTransaction(async () => {
    await reconcileProductivity();
    await settleCompletedSessions();
  });
}

export async function endSession(id: string, expectedRevision: number) {
  return progressTransaction(async () => {
    const session = await db.savedMissionSessions.get(id);
    if (!session) throw new Error('A sessão não está mais disponível.');
    if (!isOpenSession(session)) return session;
    if (session.revision !== expectedRevision)
      throw new Error(
        'A sessão mudou em outra aba. Confira as atividades antes de encerrar.',
      );
    return closeSessionRecord(session, 'ended');
  });
}

export async function appendSessionOccurrences(
  id: string,
  expectedRevision: number,
  selected: import('./productivityTypes').Occurrence[],
) {
  return progressTransaction(async () => {
    const session = await db.savedMissionSessions.get(id);
    if (!session || !isOpenSession(session))
      throw new Error('Esta sessão foi encerrada. Monte uma nova sessão.');
    if (session.revision !== expectedRevision)
      throw new Error('A sessão mudou em outra aba. Atualize a seleção.');
    if (
      !selected.length ||
      new Set(selected.map((row) => row.id)).size !== selected.length
    )
      throw new Error('Selecione atividades diferentes para adicionar.');
    const ids: string[] = [];
    for (const selection of selected) {
      if (session.occurrenceIds.includes(selection.id))
        throw new Error('Esta atividade já está na sessão.');
      const task = await db.tasks.get(selection.taskId);
      const stored = await db.occurrences.get(selection.id);
      if (
        stored
          ? stored.revision !== selection.revision
          : selection.definitionRevision !== undefined &&
            selection.definitionRevision !== (task?.definitionRevision ?? 0)
      )
        throw new Error('Uma atividade mudou. Atualize a seleção.');
      const reason = occurrenceEligibility(selection, task, dateKey());
      if (reason) throw new Error(reason);
      const row = await ensureOccurrence(
        selection.taskId,
        selection.originDate,
      );
      const currentReason = occurrenceEligibility(row, task, dateKey());
      if (currentReason) throw new Error(currentReason);
      ids.push(row.id);
    }
    return saveSession(
      { ...session, occurrenceIds: [...session.occurrenceIds, ...ids] },
      session.revision,
    );
  });
}
