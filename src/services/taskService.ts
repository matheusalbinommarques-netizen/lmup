import { db, type ActivityEvent, type Task } from './db';
import { initializeJourney } from './profileService';
import { taskSteps } from './journeyService';
import { scheduledOn } from './recurrence';
import {
  grantReward,
  progressTransaction,
  revokeRewards,
} from './rewardService';
import { buildHeroModifiersFromOwned } from './gearService';
import {
  getProjectBaseXp,
  getProjectDifficultyInfoForTasks,
  projectRewardTasks,
} from './projectRules';
import { addCalendarDays } from './calendar';
import { dateKey } from './rewardService';
import { reviewDueDate as dueDateForReview } from './reviewRules';

export async function completeProjectIfReady(
  projectId: number,
): Promise<ActivityEvent | null> {
  return progressTransaction(async () => {
    const project = await db.projects.get(projectId);
    if (
      !project ||
      project.rewardGranted ||
      ['pausado', 'arquivado'].includes(project.status)
    )
      return null;
    const tasks = (
      await db.tasks.where('projectId').equals(projectId).toArray()
    ).filter((task) => !task.archived);
    if (
      !tasks.length ||
      !tasks.every((task) => task.completed || task.status === 'completed')
    )
      return null;
    if (
      project.stages?.some(
        (stage) => !tasks.some((task) => task.projectStageId === stage.id),
      )
    )
      return null;
    const mods = await buildHeroModifiersFromOwned();
    const budgetTasks = projectRewardTasks(
      tasks,
      await db.activityEvents.toArray(),
    );
    const bonus = Math.floor(
      getProjectBaseXp(budgetTasks) *
        (getProjectDifficultyInfoForTasks(budgetTasks).bonusXpFraction +
          mods.projectBonusExtraFraction),
    );
    if (bonus <= 0) return null;
    const result = await grantReward({
      id: `project:${projectId}:${project.rewardRevision ?? 0}`,
      kind: 'project',
      projectId,
      baseXp: bonus,
    });
    await db.projects.update(projectId, {
      status: 'concluido',
      rewardGranted: true,
      rewardEventId: result.event.id,
      updatedAt: new Date(),
      revision: (project.revision ?? 0) + 1,
    });
    return result.event;
  });
}

export async function completeTask(
  taskId: number,
  options: {
    reviewOutcome?: 'recalled' | 'partial' | 'again';
    occurrenceDate?: string;
  } = {},
): Promise<ActivityEvent | null> {
  return progressTransaction(async () => {
    await initializeJourney();
    const task = await db.tasks.get(taskId);
    if (!task || task.archived)
      throw new Error('Esta missão não está disponível.');
    if (task.recurrence)
      return completeOccurrence(task, options.occurrenceDate);
    if (task.plannedDate && task.plannedDate > dateKey())
      throw new Error(
        'Esta missão está planejada para uma data futura. Altere a data antes de concluir.',
      );
    if (task.completed && !task.reviewEnabled) return null;
    if (
      taskSteps(task).some(
        (step) => !task.completedSubtasks?.includes(step.index),
      )
    )
      throw new Error(
        'Conclua os passos da missão antes de receber a recompensa.',
      );
    const now = new Date();
    if (
      options.reviewOutcome &&
      !['recalled', 'partial', 'again'].includes(options.reviewOutcome)
    )
      throw new Error('Escolha um resultado de revisão válido.');
    const base = new Date(task.reviewStartedAt ?? task.createdAt);
    if (task.reviewEnabled) {
      const interval = task.reviewIntervalDays ?? 7;
      if (
        !Number.isInteger(interval) ||
        interval < 1 ||
        Number.isNaN(base.getTime())
      )
        throw new Error('O intervalo de revisão é inválido.');
      if (dateKey(now) < dueDateForReview(task)) return null;
      const todaySession = (
        await db.activityEvents.where('taskId').equals(taskId).toArray()
      ).some(
        (event) =>
          (event.kind === 'review' || !!event.occurrenceDate) &&
          !event.reversedAt &&
          event.date === dateKey(now),
      );
      if (todaySession) return null;
      const expectedSession = `${base.toISOString()}:${task.completionRevision ?? 0}`;
      const legacyInProgress =
        task.reviewSession === base.toISOString() &&
        ['active', 'paused'].includes(task.executionState ?? '');
      if (
        taskSteps(task).length &&
        task.reviewSession !== expectedSession &&
        !legacyInProgress
      )
        throw new Error(
          'Abra a sessão de revisão e realize os passos desta prática.',
        );
    }
    const id = task.reviewEnabled
      ? `review:${taskId}:${base.toISOString()}:${task.completionRevision ?? 0}`
      : `task:${taskId}:${task.completionRevision ?? 0}`;
    const result = await grantReward({
      id,
      kind: task.reviewEnabled ? 'review' : 'task',
      taskId,
      projectId: task.projectId ?? undefined,
      areaId: task.areaId,
      baseXp: task.xp,
    });
    if (!result.applied) return null;
    result.event.taskTitle = task.title;
    result.event.areaId = task.areaId ?? 0;
    result.event.areaName = task.areaId
      ? ((await db.areas.get(task.areaId))?.nome ?? 'Geral')
      : 'Geral';
    await db.activityEvents.put(result.event);
    if (task.reviewEnabled) {
      result.event.reviewOutcome = options.reviewOutcome;
      result.event.reviewStateBefore = {
        completed: !!task.completed,
        status: task.status,
        completionEventId: task.completionEventId ?? null,
        completedAt: task.completedAt ?? null,
        reviewStartedAt: task.reviewStartedAt ?? null,
        reviewDueDate: task.reviewDueDate ?? null,
        lastReviewDate: task.lastReviewDate ?? null,
      };
      await db.activityEvents.put(result.event);
    }
    await db.tasks.update(taskId, {
      completed: true,
      status: task.reviewEnabled ? 'available' : 'completed',
      completionEventId: result.event.id,
      completedAt: now.toISOString(),
      updatedAt: now,
      executionState: 'idle',
      ...(task.reviewEnabled
        ? {
            completionRevision: (task.completionRevision ?? 0) + 1,
            reviewStartedAt: now.toISOString(),
            reviewDueDate: addCalendarDays(
              dateKey(now),
              task.reviewIntervalDays ?? 7,
            ),
            lastReviewDate: dateKey(now),
          }
        : {}),
    });
    if (task.projectId) await completeProjectIfReady(task.projectId);
    return result.event;
  });
}

export async function undoTask(
  taskId: number,
  eventId?: string,
): Promise<void> {
  await progressTransaction(async () => {
    const task = await db.tasks.get(taskId);
    if (!task) return;
    const requested = eventId ?? task.completionEventId;
    const occurrence = requested
      ? await db.activityEvents.get(requested)
      : undefined;
    if (occurrence?.taskId !== undefined && occurrence.taskId !== taskId)
      throw new Error('Este recibo pertence a outra missão.');
    if (occurrence?.occurrenceDate) {
      await undoOccurrence(task, occurrence);
      return;
    }
    if (eventId && eventId !== task.completionEventId)
      throw new Error(
        'Somente a última sessão de revisão pode ser desfeita nesta tela.',
      );
    if (!task.completed && task.status !== 'completed') return;
    if (!task.completionEventId)
      throw new Error(
        'Esta conclusão é anterior ao histórico detalhado. O estorno exato não está disponível; seus dados foram preservados.',
      );
    const source = await db.activityEvents.get(task.completionEventId);
    if (!source || source.reversedAt)
      throw new Error('A conclusão mudou. Reabra a missão antes de desfazer.');
    const reviewUndo = source.kind === 'review';
    const history = (
      await db.activityEvents.where('taskId').equals(taskId).toArray()
    )
      .filter(
        (event) =>
          ['task', 'review'].includes(event.kind) &&
          !event.reversedAt &&
          event.id !== source.id,
      )
      .sort((a, b) => b.sequence - a.sequence);
    const previous = reviewUndo ? history[0] : undefined;
    const before =
      source.kind === 'review' ? source.reviewStateBefore : undefined;
    const remainsCompleted = reviewUndo && (before?.completed ?? !!previous);
    const projectId = source.projectId ?? task.projectId;
    const project = projectId ? await db.projects.get(projectId) : undefined;
    const ids = [source.id];
    let reversedProject = false;
    if (!remainsCompleted && projectId) {
      if (project?.rewardGranted && !project.rewardEventId)
        throw new Error(
          'O bônus deste projeto é antigo e não tem registro suficiente para um estorno seguro.',
        );
      const bonus = (
        await db.activityEvents.where('projectId').equals(projectId).toArray()
      ).find((event) => event.kind === 'project' && !event.reversedAt);
      if (bonus) {
        ids.push(bonus.id);
        reversedProject = true;
      }
    }
    await revokeRewards(ids);
    const started = before
      ? (before.reviewStartedAt ?? task.createdAt)
      : (previous?.occurredAt ?? task.createdAt);
    await db.tasks.update(taskId, {
      completed: !!remainsCompleted,
      status: 'available',
      archived: false,
      completionRevision: (task.completionRevision ?? 0) + 1,
      executionState: 'paused',
      completionEventId: reviewUndo
        ? (before?.completionEventId ?? previous?.id ?? null)
        : null,
      completedAt: reviewUndo
        ? (before?.completedAt ?? previous?.occurredAt ?? null)
        : null,
      ...(reviewUndo
        ? {
            reviewStartedAt: started,
            reviewSession: `${new Date(started).toISOString()}:${(task.completionRevision ?? 0) + 1}`,
            reviewDueDate:
              before?.reviewDueDate ??
              dueDateForReview({
                ...task,
                reviewDueDate: null,
                reviewStartedAt: started,
              }),
            lastReviewDate: before
              ? (before.lastReviewDate ?? null)
              : (history.find((event) => event.kind === 'review')?.date ??
                null),
          }
        : {}),
      updatedAt: new Date(),
    });
    if (project && reversedProject)
      await db.projects.update(project.id!, {
        status: ['arquivado', 'pausado'].includes(project.status)
          ? project.status
          : 'em_andamento',
        rewardGranted: false,
        rewardEventId: null,
        rewardRevision: (project.rewardRevision ?? 0) + 1,
        revision: (project.revision ?? 0) + 1,
        updatedAt: new Date(),
      });
  });
}

async function completeOccurrence(
  task: Task,
  expected?: string,
): Promise<ActivityEvent | null> {
  const today = dateKey();
  if (expected && expected !== today)
    throw new Error('O dia mudou. Reabra a ocorrência antes de concluir.');
  if (!scheduledOn(task, today))
    throw new Error(
      'Esta rotina não está prevista para hoje. Altere o planejamento para realizá-la.',
    );
  const history = await db.activityEvents
    .where('taskId')
    .equals(task.id!)
    .toArray();
  if (
    history.some(
      (event) =>
        ['task', 'review'].includes(event.kind) &&
        !event.reversedAt &&
        (event.occurrenceDate ?? event.date) === today,
    )
  )
    return null;
  if (
    taskSteps(task).length &&
    (task.occurrenceSession !== today ||
      taskSteps(task).some(
        (step) => !task.completedSubtasks?.includes(step.index),
      ))
  )
    throw new Error(
      'Abra a ocorrência de hoje e conclua os passos antes de receber a recompensa.',
    );
  const result = await grantReward({
    id: `occurrence:${task.id}:${today}:${task.completionRevision ?? 0}`,
    kind: 'task',
    taskId: task.id,
    projectId: task.projectId ?? undefined,
    areaId: task.areaId,
    baseXp: task.xp,
  });
  if (!result.applied) return null;
  if (result.event.date !== today)
    throw new Error('O dia mudou. Reabra a ocorrência antes de concluir.');
  result.event.occurrenceDate = today;
  result.event.taskTitle = task.title;
  result.event.areaId = task.areaId ?? 0;
  result.event.areaName = task.areaId
    ? ((await db.areas.get(task.areaId))?.nome ?? 'Geral')
    : 'Geral';
  await db.activityEvents.put(result.event);
  await db.tasks.update(task.id!, {
    completed: true,
    status: 'completed',
    completionEventId: result.event.id,
    lastOccurrenceDate: today,
    occurrenceSession: today,
    completedAt: result.event.occurredAt,
    executionState: 'idle',
    updatedAt: new Date(),
  });
  if (task.projectId) await completeProjectIfReady(task.projectId);
  return result.event;
}

async function undoOccurrence(task: Task, source: ActivityEvent) {
  if (source.reversedAt) return;
  if (source.kind !== 'task')
    throw new Error('Este registro não é uma ocorrência de rotina.');
  const remaining = (
    await db.activityEvents.where('taskId').equals(task.id!).toArray()
  )
    .filter(
      (event) =>
        ['task', 'review'].includes(event.kind) &&
        !event.reversedAt &&
        event.id !== source.id,
    )
    .sort((a, b) => b.sequence - a.sequence);
  const projectId = source.projectId ?? task.projectId;
  const project = projectId ? await db.projects.get(projectId) : undefined;
  const ids = [source.id];
  if (!remaining.length && project?.rewardGranted) {
    if (!project.rewardEventId)
      throw new Error(
        'O bônus antigo deste projeto não permite estorno seguro.',
      );
    ids.push(project.rewardEventId);
  }
  await revokeRewards(ids);
  if (ids.length > 1 && project)
    await db.projects.update(project.id!, {
      rewardGranted: false,
      rewardEventId: null,
      rewardRevision: (project.rewardRevision ?? 0) + 1,
      revision: (project.revision ?? 0) + 1,
      status: ['arquivado', 'pausado'].includes(project.status)
        ? project.status
        : 'em_andamento',
    });
  const latest = remaining[0];
  await db.tasks.update(task.id!, {
    completed: !!latest,
    status: latest ? 'completed' : 'available',
    completionEventId: latest?.id ?? null,
    completedAt: latest?.occurredAt ?? null,
    lastOccurrenceDate:
      remaining
        .filter((event) => event.kind === 'task')
        .map((event) => event.occurrenceDate ?? event.date)
        .sort()
        .at(-1) ?? null,
    completionRevision: (task.completionRevision ?? 0) + 1,
    ...(source.id === task.completionEventId &&
    source.occurrenceDate === dateKey()
      ? { executionState: 'paused' as const }
      : {}),
    updatedAt: new Date(),
  });
}
