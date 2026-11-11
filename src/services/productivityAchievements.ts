import { db } from './db';
import { ALL_ACHIEVEMENTS } from './achievementsCatalog';
import { collectionStats } from './collectionRules';
import { consistency } from './productivityInsights';
import {
  dateKey,
  progressTransaction,
  refreshCompletionStreak,
} from './rewardService';
import {
  projectPlannedOccurrences,
  readPlanningData,
  type PlanningData,
} from './occurrenceService';
import type { Companion, HeroProject, OwnedShopItem, Profile } from './db';
import type { ExecutionRecord, Routine } from './productivityTypes';

/** Every table the achievement rules read, so callers can share one read. */
export type AchievementData = PlanningData & {
  profile: Profile | undefined;
  records: ExecutionRecord[];
  companions: Companion[];
  owned: OwnedShopItem[];
  projects: HeroProject[];
  routines: Routine[];
};
export async function readAchievementData(
  planning?: PlanningData,
): Promise<AchievementData> {
  return {
    ...(planning ?? (await readPlanningData())),
    profile: await db.profile.get(1),
    records: await db.executionRecords.toArray(),
    companions: await db.companions.toArray(),
    owned: await db.ownedShopItems.toArray(),
    projects: await db.projects.toArray(),
    routines: await db.routines.toArray(),
  };
}
export async function readAchievementStats(data?: AchievementData) {
  data ??= await readAchievementData();
  const { profile, tasks, occurrences, records } = data;
  if (!profile) return null;
  const base = collectionStats(profile, tasks, data.companions, data.owned);
  const completed = occurrences.filter((row) => row.status === 'completed');
  // First row per id, as Array.find would return.
  const occurrenceById = new Map<string, (typeof occurrences)[number]>();
  for (const row of occurrences)
    if (!occurrenceById.has(row.id)) occurrenceById.set(row.id, row);
  const legacy = tasks.filter(
    (task) =>
      !task.productivityVersion &&
      task.completed &&
      !occurrences.some((row) => row.taskId === task.id),
  );
  const today = dateKey();
  const first =
    data.versions.map((row) => row.effectiveFrom).sort()[0] ?? today;
  const schedule = projectPlannedOccurrences(
    data,
    first > today ? today : first,
    today,
  );
  const dates = [
    ...new Set(
      records
        .filter((row) => row.after > row.before && !row.correction)
        .map((row) => row.localDate),
    ),
  ].sort();
  return {
    ...base,
    completedMissions: legacy.length + completed.length,
    recurringStreak: Math.max(
      0,
      ...tasks
        .filter((task) => task.recurrence)
        .map(
          (task) =>
            consistency(
              schedule.filter((row) => row.taskId === task.id),
              today,
            ).streak,
        ),
    ),
    completedProjectStages: data.projects.reduce(
      (sum, project) =>
        sum +
        (project.stages ?? []).filter((stage) => {
          const members = tasks.filter(
            (task) =>
              !task.archived &&
              task.projectId === project.id &&
              task.projectStageId === stage.id,
          );
          return members.length > 0 && members.every((task) => task.completed);
        }).length,
      0,
    ),
    completedEpicOrLegendary:
      legacy.filter((task) => ['epic', 'legendary'].includes(task.rarity))
        .length + completed.filter((row) => row.baseXp >= 150).length,
    completedLegendary:
      legacy.filter((task) => task.rarity === 'legendary').length +
      completed.filter((row) => row.baseXp >= 250).length,
    streak: Math.max(
      base.streak,
      ...data.routines.map(
        (routine) =>
          consistency(
            schedule.filter((row) => row.routineId === routine.id),
            today,
          ).streak,
      ),
    ),
    activityMinutes: Math.max(
      0,
      records.reduce(
        (sum, row) =>
          sum +
          (row.minutes ??
            (occurrenceById.get(row.occurrenceId)?.tracking?.method === 'time'
              ? row.after - row.before
              : 0)),
        0,
      ),
    ),
    completedProjects: data.projects.filter((row) => row.status === 'concluido')
      .length,
    returnedAfterBreak: dates.some(
      (day, index) =>
        index > 0 &&
        Date.parse(day) - Date.parse(dates[index - 1]) >= 7 * 86400000,
    ),
  };
}
export async function refreshAchievementReceipts() {
  return progressTransaction(async () => {
    // One read of the large tables serves the streak and every achievement rule;
    // the streak only rewrites the profile, which is read again afterwards.
    const planning = await readPlanningData();
    await refreshCompletionStreak(planning);
    const stats = await readAchievementStats(
      await readAchievementData(planning),
    );
    if (!stats) return;
    for (const achievement of ALL_ACHIEVEMENTS)
      if (
        !achievement.future &&
        achievement.condition(stats) &&
        !(await db.achievementReceipts.get(achievement.id))
      )
        await db.achievementReceipts.add({
          id: achievement.id,
          earnedAt: new Date().toISOString(),
        });
  });
}
export async function invalidateAchievement(id: string, reason: string) {
  if (!reason.trim()) throw new Error('Informe o motivo da correção.');
  return progressTransaction(async () => {
    const row = await db.achievementReceipts.get(id);
    if (!row) throw new Error('Conquista não encontrada.');
    await db.achievementReceipts.update(id, {
      invalidatedAt: new Date().toISOString(),
      reason: reason.trim(),
    });
    await db.productivityAudit.add({
      id: crypto.randomUUID(),
      entityId: id,
      action: 'achievement-invalidated',
      recordedAt: new Date().toISOString(),
      before: row,
      after: { reason },
    });
  });
}
