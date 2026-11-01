import { db, type ActivityEvent, type Task } from './db';
import { addCalendarDays, calendarDate } from './calendar';
import {
  calculateReward,
  dateKey,
  grantReward,
  progressTransaction,
} from './rewardService';
import { buildHeroModifiersFromOwned } from './gearService';
import { getActiveCompanionBuffs } from './companionService';
import { ensureProfile } from './profileService';
import { scheduledOn } from './recurrence';
import {
  executionContext,
  occurrenceDue,
  progressTarget,
  validatePlanning,
  validateTime,
} from './productivityRules';
import {
  ZERO_RESOURCES,
  type Occurrence,
  type Planning,
  type Resources,
} from './productivityTypes';
import { completeProjectIfReady } from './taskService';
import { reopenProjectForWork } from './projectLifecycle';
import { refreshAchievementReceipts } from './productivityAchievements';

export function occurrenceId(task: Task, origin: string) {
  return task.recurrence
    ? `mission:${task.id}:${origin}`
    : `mission:${task.id}:once`;
}
export function makeOccurrence(
  task: Task,
  origin: string,
  reconstructed = false,
): Occurrence {
  if (!calendarDate(origin)) throw new Error('Escolha uma data de origem.');
  const steps = [...(task.subtasks ?? [])];
  return {
    ...validatePlanning(task, steps),
    id: occurrenceId(task, origin),
    taskId: task.id!,
    originDate: origin,
    plannedDate: origin,
    originalTime: task.plannedTime ?? null,
    title: task.title,
    areaId: task.areaId ?? 0,
    projectId: task.projectId,
    routineId: task.routineId ?? undefined,
    baseXp: task.xp,
    steps,
    checkedSteps: [],
    value: 0,
    due: { ...ZERO_RESOURCES },
    status: 'planned',
    revision: 0,
    legacyCompletionOnly: !task.productivityVersion && steps.length > 0,
    reconstructed,
    createdAt: new Date().toISOString(),
  };
}
export async function savePlanVersion(task: Task, effectiveFrom = dateKey()) {
  const previous = await db.planVersions
    .where('taskId')
    .equals(task.id!)
    .toArray();
  await db.planVersions.add({
    sequence: Math.max(0, ...previous.map((row) => row.sequence ?? 0)) + 1,
    id: crypto.randomUUID(),
    taskId: task.id!,
    effectiveFrom,
    recordedAt: new Date().toISOString(),
    definition: structuredClone(task) as unknown as Record<string, unknown>,
  });
  const audit = await db.productivityAudit.toArray();
  for (const row of await db.occurrences
    .where('taskId')
    .equals(task.id!)
    .toArray()) {
    if (
      row.value > 0 ||
      row.modifiers ||
      row.originDate < dateKey() ||
      ['excused', 'discarded'].includes(row.status)
    )
      continue;
    const overridden = audit.some(
      (entry) => entry.entityId === row.id && entry.action === 'reschedule',
    );
    const planning = validatePlanning(task, task.subtasks ?? []);
    const updated: Occurrence = {
      ...row,
      ...planning,
      title: task.title,
      baseXp: task.xp,
      areaId: task.areaId ?? 0,
      projectId: task.projectId,
      routineId: task.routineId ?? undefined,
      steps: [...(task.subtasks ?? [])],
      checkedSteps: [],
      revision: row.revision + 1,
      planningSuspended: !!task.planningPaused,
      plannedDate: overridden
        ? row.plannedDate
        : task.recurrence
          ? row.originDate
          : (task.plannedDate ?? dateKey()),
      plannedTime: overridden ? row.plannedTime : task.plannedTime,
      status:
        row.id !== occurrenceId(task, row.originDate) ||
        (task.recurrence &&
          !scheduledOn(task, row.originDate) &&
          !task.planningPaused)
          ? 'discarded'
          : row.status,
    };
    await db.occurrences.put(updated);
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: row.id,
      action: 'definition-update',
      recordedAt: new Date().toISOString(),
      before: row,
      after: updated,
    });
  }
}
export async function plannedOccurrences(
  from: string,
  to: string,
): Promise<Occurrence[]> {
  if (!calendarDate(from) || !calendarDate(to) || from > to)
    throw new Error('Período inválido.');
  return db.transaction('r', db.tables, async () => {
    const tasks = await db.tasks.toArray(),
      versions = await db.planVersions.toArray();
    const stored = await db.occurrences.toArray(),
      events = await db.activityEvents.toArray();
    const result = new Map(
      stored
        .filter(
          (row) =>
            !row.planningSuspended &&
            row.plannedDate >= from &&
            row.plannedDate <= to,
        )
        .map((row) => [row.id, row]),
    );
    const storedIds = new Set(stored.map((row) => row.id));
    for (const current of tasks.filter((task) => !task.reviewEnabled)) {
      const plans = versions
        .filter((row) => row.taskId === current.id)
        .sort(
          (a, b) =>
            a.effectiveFrom.localeCompare(b.effectiveFrom) ||
            (a.sequence ?? 0) - (b.sequence ?? 0),
        );
      for (let day = from; day <= to; day = addCalendarDays(day, 1)) {
        const version = plans.filter((row) => row.effectiveFrom <= day).at(-1);
        // No inference of historical schedules before the first recorded version.
        if (!version && day < dateKey()) continue;
        const task = (version?.definition ?? current) as unknown as Task;
        if (
          task.archived ||
          task.planningPaused ||
          (!task.recurrence && task.completed)
        )
          continue;
        if (!(
          scheduledOn(task, day) ||
          (!task.recurrence && !task.plannedDate && day === dateKey())
        ))
          continue;
        const id = occurrenceId(task, day);
        if (storedIds.has(id)) continue;
        if (
          events.some(
            (event) =>
              event.taskId === task.id &&
              event.kind === 'task' &&
              !event.reversedAt &&
              !event.occurrenceId &&
              (task.recurrence
                ? (event.occurrenceDate ?? event.date) === day
                : true),
          )
        )
          continue;
        result.set(id, makeOccurrence(task, day));
      }
    }
    return [...result.values()].sort(
      (a, b) =>
        a.plannedDate.localeCompare(b.plannedDate) ||
        (a.plannedTime ?? '99:99').localeCompare(b.plannedTime ?? '99:99') ||
        a.id.localeCompare(b.id),
    );
  });
}
export async function ensureOccurrence(
  taskId: number,
  origin = dateKey(),
  reconstructed = false,
) {
  return progressTransaction(async () => {
    const task = await db.tasks.get(taskId);
    if (!task || task.archived || task.reviewEnabled)
      throw new Error('Esta missão não está disponível para ocorrência.');
    const existing = await db.occurrences.get(occurrenceId(task, origin));
    if (existing) return existing;
    const legacyReward = (
      await db.activityEvents.where('taskId').equals(taskId).toArray()
    ).some(
      (event) =>
        event.kind === 'task' &&
        !event.reversedAt &&
        !event.occurrenceId &&
        (!task.recurrence || (event.occurrenceDate ?? event.date) === origin),
    );
    if (
      legacyReward ||
      (!task.recurrence && task.completed && !task.completionEventId)
    )
      throw new Error(
        'Esta atividade já possui conclusão legada. O registro anterior foi preservado sem nova recompensa.',
      );
    const planned = (await plannedOccurrences(origin, origin)).find(
      (row) => row.taskId === taskId && row.originDate === origin,
    );
    if (!planned && !reconstructed)
      throw new Error(
        'Não há planejamento confiável nesta data. Use reconstrução explícita para atividade antiga.',
      );
    if (origin > dateKey() && reconstructed)
      throw new Error('Reconstrução é somente para atividades passadas.');
    const row = planned ?? makeOccurrence(task, origin, true);
    await db.occurrences.add(row);
    return row;
  });
}
export type ProgressInput = {
  requestId: string;
  occurrenceId: string;
  expectedRevision: number;
  value: number;
  executedAt: string;
  minutes?: number | null;
  checkedSteps?: number[];
  correction?: boolean;
  configuration?: Planning & { steps?: string[]; baseXp?: number };
};
function requestKey(value: string) {
  if (!/^[\w:-]{1,120}$/.test(value))
    throw new Error('Identificador da operação inválido. Reabra a ação.');
  return value;
}
export async function previewProgress(input: ProgressInput) {
  return db.transaction('r', db.tables, async () => {
    const current = await db.occurrences.get(input.occurrenceId);
    if (!current) throw new Error('Reabra a ocorrência.');
    const candidate = { ...current };
    if (input.configuration) {
      if (!input.correction)
        throw new Error('Altere a configuração pela ação de correção.');
      const steps = input.configuration.steps ?? current.steps;
      const baseXp = input.configuration.baseXp ?? current.baseXp;
      if (!Number.isSafeInteger(baseXp) || baseXp <= 0)
        throw new Error('XP-base inválido.');
      Object.assign(candidate, validatePlanning(input.configuration, steps), {
        steps,
        baseXp,
        legacyCompletionOnly: false,
      });
    }
    if (!candidate.modifiers && input.value > 0) {
      const profile = await db.profile.get(1);
      if (!profile) throw new Error('Perfil indisponível.');
      candidate.modifiers = calculateReward(
        candidate.baseXp,
        profile,
        await buildHeroModifiersFromOwned(),
        await getActiveCompanionBuffs(),
      ).modifiers;
    }
    const due = occurrenceDue(candidate, input.value);
    const delta = {
      xp: due.xp - current.due.xp,
      gold: due.gold - current.due.gold,
      food: due.food - current.due.food,
    };
    return {
      candidate,
      due,
      delta,
      debt: {
        xp: Math.max(0, -delta.xp),
        gold: Math.max(0, -delta.gold),
        food: Math.max(0, -delta.food),
      },
    };
  });
}
export async function recordProgress(
  input: ProgressInput,
): Promise<ActivityEvent | null> {
  requestKey(input.requestId);
  return progressTransaction(async () => {
    const prior = await db.executionRecords.get(input.requestId);
    if (prior) {
      if (
        prior.occurrenceId !== input.occurrenceId ||
        prior.after !== input.value
      )
        throw new Error('Este identificador já foi usado para outro registro.');
      return (
        (await db.activityEvents.get(`progress:${input.requestId}`)) ?? null
      );
    }
    const current = await db.occurrences.get(input.occurrenceId);
    if (!current || current.revision !== input.expectedRevision)
      throw new Error('A ocorrência mudou em outra aba. Reabra para comparar.');
    if (['discarded', 'excused'].includes(current.status))
      throw new Error('Restaure esta ocorrência antes de registrar progresso.');
    if (input.value < current.value && !input.correction)
      throw new Error('Use a ação de correção para reduzir progresso.');
    const context = executionContext(input.executedAt);
    const minutes = input.minutes ?? null;
    if (
      minutes !== null &&
      (!Number.isFinite(minutes) ||
        minutes < 0 ||
        !Number.isSafeInteger(Math.round(minutes * 1000)))
    )
      throw new Error('Tempo realizado inválido.');
    const { candidate, due, delta, debt } = await previewProgress(input);
    const checked = input.checkedSteps ?? current.checkedSteps;
    if (
      candidate.tracking?.method === 'steps' &&
      (checked.length !== input.value ||
        new Set(checked).size !== checked.length ||
        checked.some(
          (index) =>
            !Number.isInteger(index) ||
            index < 0 ||
            index >= candidate.steps.length,
        ))
    )
      throw new Error('As etapas não correspondem ao progresso.');
    const now = new Date().toISOString();
    let event: ActivityEvent | null = null;
    const profile = await ensureProfile();
    if (Object.values(debt).some((n) => n > 0)) {
      const rewardDebt = { ...(profile.rewardDebt ?? ZERO_RESOURCES) };
      for (const key of ['xp', 'gold', 'food'] as const) {
        rewardDebt[key] += debt[key];
        if (!Number.isSafeInteger(rewardDebt[key]))
          throw new Error('Débito fora do limite seguro.');
      }
      await db.profile.update(1, { rewardDebt });
      event = {
        id: `debt:${input.requestId}`,
        kind: 'adjustment',
        sequence:
          ((await db.activityEvents.orderBy('sequence').last())?.sequence ??
            0) + 1,
        occurredAt: now,
        date: dateKey(),
        taskId: current.taskId,
        projectId: current.projectId ?? undefined,
        occurrenceId: current.id,
        baseXp: 0,
        reward: { ...ZERO_RESOURCES },
        debtAdded: debt,
        modifiers: candidate.modifiers!,
        awardedStages: [],
        ecoClaimedBefore: profile.ecoGoldClaimedUpToStage ?? 1,
        protectionDays: 0,
      };
      await db.activityEvents.add(event);
      await db.xpLogs.add({
        date: event.date,
        amount: 0,
        eventId: event.id,
        kind: 'adjustment',
        goldDelta: 0,
        foodDelta: 0,
        createdAt: now,
      });
    }
    const completed = input.value >= progressTarget(candidate);
    const gross: Resources = {
      xp: Math.max(0, delta.xp),
      gold: Math.max(0, delta.gold),
      food: Math.max(0, delta.food),
    };
    if (
      Object.values(gross).some((n) => n > 0) ||
      (completed && current.status !== 'completed')
    ) {
      const result = await grantReward({
        id: `progress:${input.requestId}`,
        kind: 'task',
        baseXp: candidate.baseXp,
        taskId: current.taskId,
        areaId: candidate.areaId,
        projectId: candidate.projectId ?? undefined,
        fixedReward: gross,
        fixedModifiers: candidate.modifiers,
        occurrenceId: current.id,
        countsCompletion: completed && current.status !== 'completed',
        executedAt: context.executedAt,
      });
      event = result.event;
      event.occurrenceDate = current.originDate;
      event.taskTitle = candidate.title;
      event.areaId = candidate.areaId;
      event.areaName = (await db.areas.get(candidate.areaId))?.nome ?? 'Geral';
      await db.activityEvents.put(event);
    }
    const updated: Occurrence = {
      ...candidate,
      value: input.value,
      checkedSteps: checked,
      due,
      status: completed ? 'completed' : input.value > 0 ? 'partial' : 'planned',
      revision: current.revision + 1,
      recovered:
        (completed && current.status === 'completed' && !input.correction
          ? (current.completedLocalDate ?? context.localDate)
          : context.localDate) > current.originDate,
      completedAt: completed
        ? current.status === 'completed' && !input.correction
          ? current.completedAt
          : context.executedAt
        : undefined,
      completedLocalDate: completed
        ? current.status === 'completed' && !input.correction
          ? current.completedLocalDate
          : context.localDate
        : undefined,
      completionEventId: completed
        ? current.status === 'completed' && !input.correction
          ? current.completionEventId
          : (event?.id ?? current.completionEventId)
        : undefined,
    };
    await db.occurrences.put(updated);
    await db.executionRecords.add({
      id: input.requestId,
      occurrenceId: current.id,
      before: current.value,
      after: input.value,
      minutes,
      ...context,
      recordedAt: now,
      correction: !!input.correction,
      revision: updated.revision,
    });
    await db.productivityAudit.add({
      id: `progress:${input.requestId}`,
      entityId: current.id,
      action: input.correction ? 'correction' : 'progress',
      recordedAt: now,
      before: current,
      after: updated,
    });
    const others = await db.occurrences
      .where('taskId')
      .equals(current.taskId)
      .toArray();
    const remainsCompleted = others.some((row) => row.status === 'completed');
    await db.tasks.update(current.taskId, {
      completed: remainsCompleted,
      status: remainsCompleted ? 'completed' : 'available',
      executionState: completed ? 'idle' : 'paused',
      ...(completed
        ? {
            completionEventId: updated.completionEventId,
            completedAt: context.executedAt,
            lastOccurrenceDate: current.originDate,
          }
        : !remainsCompleted
          ? {
              completionEventId: null,
              completedAt: null,
              lastOccurrenceDate: null,
            }
          : {}),
    });
    if (candidate.projectId) {
      if (!remainsCompleted) {
        const project = await db.projects.get(candidate.projectId);
        if (project?.rewardGranted) {
          await reopenProjectForWork(candidate.projectId);
        }
      } else await completeProjectIfReady(candidate.projectId);
    }
    await refreshAchievementReceipts();
    return event;
  });
}
export async function changeOccurrence(
  id: string,
  expectedRevision: number,
  patch: {
    plannedDate?: string;
    plannedTime?: string | null;
    status?: Occurrence['status'];
  },
  requestId: string,
) {
  requestKey(requestId);
  return progressTransaction(async () => {
    if (await db.productivityAudit.get(requestId)) return;
    const current = await db.occurrences.get(id);
    if (!current || current.revision !== expectedRevision)
      throw new Error('A ocorrência mudou. Reabra para comparar.');
    if (current.status === 'completed' && patch.status)
      throw new Error('Use a correção para alterar uma conclusão.');
    if (patch.plannedDate && !calendarDate(patch.plannedDate))
      throw new Error('Data inválida.');
    if (patch.plannedTime !== undefined) validateTime(patch.plannedTime);
    if (
      patch.status &&
      !['planned', 'active', 'paused', 'discarded'].includes(patch.status)
    )
      throw new Error('Estado inválido.');
    if (patch.status === 'discarded' && current.value > 0)
      throw new Error(
        'O progresso não pode ser descartado. Pause a atividade.',
      );
    const updated = { ...current, ...patch, revision: current.revision + 1 };
    await db.occurrences.put(updated);
    await db.productivityAudit.add({
      id: requestId,
      entityId: id,
      action:
        patch.plannedDate || patch.plannedTime !== undefined
          ? 'reschedule'
          : 'state',
      recordedAt: new Date().toISOString(),
      before: current,
      after: updated,
    });
  });
}
