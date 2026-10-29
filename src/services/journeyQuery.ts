import { isAvailable } from './journeyService';
import { db } from './db';
import { liveQuery } from 'dexie';
import { buildHeroModifiersFromOwned } from './gearService';
import { getActiveCompanionBuffs } from './companionService';
import { calculateReward } from './rewardService';

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
      if (recorded && task.completed && !isAvailable(task))
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
      companion,
      rewards,
      mods,
      buffs,
    };
  });
}
export function journeyQuery() {
  return liveQuery(readJourneySnapshot);
}
export type JourneySnapshot = Awaited<ReturnType<typeof readJourneySnapshot>>;
