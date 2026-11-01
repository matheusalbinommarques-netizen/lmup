import { isAvailable } from './journeyService';
import { db } from './db';
import { liveQuery } from 'dexie';
import { buildHeroModifiersFromOwned } from './gearService';
import { getActiveCompanionBuffs } from './companionService';
import { calculateReward } from './rewardService';
import { readAchievementStats } from './productivityAchievements';
import { plannedOccurrences } from './occurrenceService';
import { dateKey } from './rewardService';
import { Observable } from 'rxjs';

export async function readJourneySnapshot() {
  return db.transaction('r', db.tables, async () => {
    const profile = await db.profile.get(1);
    const tasks = await db.tasks.toArray();
    const areas = await db.areas.toArray();
    const companions = await db.companions.toArray();
    const owned = await db.ownedShopItems.toArray();
    const inventory = await db.inventory.toArray();
    const projects = await db.projects.toArray();
    const events = await db.activityEvents.toArray();
    const logs = await db.xpLogs.toArray();
    const occurrences = await db.occurrences.toArray();
    const plannedToday = await plannedOccurrences(dateKey(), dateKey());
    const achievementReceipts = await db.achievementReceipts.toArray();
    const achievementStats = await readAchievementStats();
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const companion = profile?.activeCompanionId
      ? await db.companions.get(profile.activeCompanionId)
      : undefined;
    const mods = await buildHeroModifiersFromOwned();
    const buffs = await getActiveCompanionBuffs();
    const rewards: Record<number, { xp: number; gold: number; food: number }> =
      {};
    for (const task of tasks) {
      const candidate = task.completionEventId
        ? eventsById.get(task.completionEventId)
        : undefined;
      const recorded = candidate?.reversedAt ? undefined : candidate;
      if (recorded && !task.recurrence && task.completed && !isAvailable(task))
        rewards[task.id!] = recorded.reward;
      else if (profile) {
        try {
          rewards[task.id!] = calculateReward(task.xp, profile, mods, buffs);
        } catch {
          /* A malformed legacy reward remains editable in the original organizer. */
        }
      }
    }
    return {
      profile,
      companions,
      owned,
      inventory,
      tasks,
      areas,
      projects,
      events,
      logs,
      occurrences,
      plannedToday,
      achievementReceipts,
      achievementStats,
      companion,
      rewards,
      mods,
      buffs,
    };
  });
}
export function journeyQuery() {
  return new Observable<JourneySnapshot>((subscriber) => {
    let lastDay = dateKey();
    const subscription = liveQuery(readJourneySnapshot).subscribe({
      next: (value) => {
        lastDay = dateKey();
        subscriber.next(value);
      },
      error: (error) => subscriber.error(error),
    });
    const refresh = () => {
      if (lastDay === dateKey()) return;
      lastDay = dateKey();
      void readJourneySnapshot().then(
        (value) => subscriber.next(value),
        (error) => subscriber.error(error),
      );
    };
    const timer = setInterval(refresh, 15000);
    if (typeof window !== 'undefined')
      window.addEventListener('focus', refresh);
    return () => {
      subscription.unsubscribe();
      clearInterval(timer);
      if (typeof window !== 'undefined')
        window.removeEventListener('focus', refresh);
    };
  });
}
export type JourneySnapshot = Awaited<ReturnType<typeof readJourneySnapshot>>;
