import { db } from './db';
import { ALL_ACHIEVEMENTS } from './achievementsCatalog';
import { collectionStats } from './collectionRules';
import { consistency } from './productivityInsights';
import {
  dateKey,
  progressTransaction,
  refreshCompletionStreak,
} from './rewardService';
import { plannedOccurrences } from './occurrenceService';
export async function readAchievementStats() {
  const profile = await db.profile.get(1);
  if (!profile) return null;
  const tasks = await db.tasks.toArray(),
    occurrences = await db.occurrences.toArray(),
    records = await db.executionRecords.toArray();
  const base = collectionStats(
    profile,
    tasks,
    await db.companions.toArray(),
    await db.ownedShopItems.toArray(),
  );
  const completed = occurrences.filter((row) => row.status === 'completed');
  const legacy = tasks.filter(
    (task) =>
      !task.productivityVersion &&
      task.completed &&
      !occurrences.some((row) => row.taskId === task.id),
  );
  const plans = await db.planVersions.toArray(),
    today = dateKey();
  const first = plans.map((row) => row.effectiveFrom).sort()[0] ?? today;
  const schedule = await plannedOccurrences(
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
    completedEpicOrLegendary:
      legacy.filter((task) => ['epic', 'legendary'].includes(task.rarity))
        .length + completed.filter((row) => row.baseXp >= 150).length,
    completedLegendary:
      legacy.filter((task) => task.rarity === 'legendary').length +
      completed.filter((row) => row.baseXp >= 250).length,
    streak: Math.max(
      base.streak,
      ...(await db.routines.toArray()).map(
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
            (occurrences.find((item) => item.id === row.occurrenceId)?.tracking
              ?.method === 'time'
              ? row.after - row.before
              : 0)),
        0,
      ),
    ),
    completedProjects: (await db.projects.toArray()).filter(
      (row) => row.status === 'concluido',
    ).length,
    returnedAfterBreak: dates.some(
      (day, index) =>
        index > 0 &&
        Date.parse(day) - Date.parse(dates[index - 1]) >= 7 * 86400000,
    ),
  };
}
export async function refreshAchievementReceipts() {
  return progressTransaction(async () => {
    await refreshCompletionStreak();
    const stats = await readAchievementStats();
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
