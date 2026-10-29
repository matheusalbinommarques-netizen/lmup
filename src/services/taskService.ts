import { db, type ActivityEvent } from './db';
import { initializeJourney } from './profileService';
import {
  grantReward,
  progressTransaction,
  revokeRewards,
} from './rewardService';
import { buildHeroModifiersFromOwned } from './gearService';
import {
  getProjectBaseXp,
  getProjectDifficultyInfoForTasks,
} from './projectRules';

export async function completeProjectIfReady(
  projectId: number,
): Promise<ActivityEvent | null> {
  return progressTransaction(async () => {
    const project = await db.projects.get(projectId);
    if (!project || project.rewardGranted) return null;
    const tasks = (
      await db.tasks.where('projectId').equals(projectId).toArray()
    ).filter((task) => !task.archived);
    if (
      !tasks.length ||
      !tasks.every((task) => task.completed || task.status === 'completed')
    )
      return null;
    const mods = await buildHeroModifiersFromOwned();
    const bonus = Math.floor(
      getProjectBaseXp(tasks) *
        (getProjectDifficultyInfoForTasks(tasks).bonusXpFraction +
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
    });
    return result.event;
  });
}

export async function completeTask(
  taskId: number,
): Promise<ActivityEvent | null> {
  return progressTransaction(async () => {
    await initializeJourney();
    const task = await db.tasks.get(taskId);
    if (!task || task.archived)
      throw new Error('Esta missão não está disponível.');
    if (task.completed && !task.reviewEnabled) return null;
    const now = new Date();
    const base = new Date(task.reviewStartedAt ?? task.createdAt);
    if (task.reviewEnabled) {
      const interval = task.reviewIntervalDays ?? 7;
      if (
        !Number.isInteger(interval) ||
        interval < 1 ||
        Number.isNaN(base.getTime())
      )
        throw new Error('O intervalo de revisão é inválido.');
      const due = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate() + interval,
      );
      if (now < due) return null;
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
    await db.tasks.update(taskId, {
      completed: true,
      status: task.reviewEnabled ? 'available' : 'completed',
      completionEventId: result.event.id,
      completedAt: now,
      updatedAt: now,
      ...(task.reviewEnabled ? { reviewStartedAt: now } : {}),
    });
    if (task.projectId) await completeProjectIfReady(task.projectId);
    return result.event;
  });
}

export async function undoTask(taskId: number): Promise<void> {
  await progressTransaction(async () => {
    const task = await db.tasks.get(taskId);
    if (!task || (!task.completed && task.status !== 'completed')) return;
    if (!task.completionEventId)
      throw new Error(
        'Esta conclusão é anterior ao histórico detalhado. O estorno exato não está disponível; seus dados foram preservados.',
      );
    const ids = [task.completionEventId];
    const project = task.projectId
      ? await db.projects.get(task.projectId)
      : undefined;
    if (project?.rewardGranted) {
      if (!project.rewardEventId)
        throw new Error(
          'O bônus deste projeto é antigo e não tem registro suficiente para um estorno seguro.',
        );
      ids.push(project.rewardEventId);
    }
    await revokeRewards(ids);
    const previousReviews = (
      await db.activityEvents.where('taskId').equals(taskId).toArray()
    )
      .filter((event) => event.kind === 'review' && !event.reversedAt)
      .sort((a, b) => b.sequence - a.sequence);
    const previous = task.reviewEnabled ? previousReviews[0] : undefined;
    await db.tasks.update(taskId, {
      completed: !!previous,
      status: 'available',
      archived: false,
      completionRevision: (task.completionRevision ?? 0) + 1,
      completionEventId: previous?.id ?? null,
      completedAt: previous?.occurredAt ?? null,
      ...(task.reviewEnabled
        ? { reviewStartedAt: previous?.occurredAt ?? task.createdAt }
        : {}),
      updatedAt: new Date(),
    });
    if (project?.rewardGranted)
      await db.projects.update(project.id!, {
        status: 'em_andamento',
        rewardGranted: false,
        rewardEventId: null,
        rewardRevision: (project.rewardRevision ?? 0) + 1,
        updatedAt: new Date(),
      });
  });
}
