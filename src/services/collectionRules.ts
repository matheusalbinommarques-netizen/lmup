import type {
  ActivityEvent,
  Task,
  Companion,
  Profile,
  OwnedShopItem,
  InventoryItem,
} from './db';
import { ECO_STAGES } from './ecoConfig';
import { companionAvailable } from './companionService';
import { createAchievementStats } from './achievementsCatalog';
import { getShopItemById } from '$lib/shop/types';
export const slotLabels: Record<string, string> = {
  armor: 'Armadura',
  weapon: 'Arma',
  amulet: 'Amuleto',
  ring: 'Anel',
  bag: 'Mochila',
  helm: 'Elmo',
};
export type MilestoneRewardStatus =
  | 'initial'
  | 'recorded'
  | 'legacy'
  | 'reversed'
  | 'pending'
  | 'locked';
export function discoveryRows(profile: Profile, events: ActivityEvent[]) {
  return ECO_STAGES.map((stage) => {
    const sources = events
      .filter(
        (event) =>
          event.kind !== 'reversal' && event.awardedStages.includes(stage.id),
      )
      .sort((a, b) => b.sequence - a.sequence);
    const active = sources.find((event) => !event.reversedAt);
    const reached = profile.totalXpEarned >= stage.minXp;
    const markedReceived = (profile.ecoGoldClaimedUpToStage ?? 1) >= stage.id;
    const rewardStatus: MilestoneRewardStatus =
      stage.id === 1
        ? 'initial'
        : active
          ? 'recorded'
          : markedReceived
            ? 'legacy'
            : sources[0]?.reversedAt
              ? 'reversed'
              : reached
                ? 'pending'
                : 'locked';
    return {
      rewardStatus,
      markedReceived,
      inconsistent: stage.id > 1 && !!active && !markedReceived,
      stage,
      source: active ?? sources[0],
      reached,
      legacy:
        !sources.length && (profile.ecoGoldClaimedUpToStage ?? 1) >= stage.id,
    };
  });
}
export function collectionStats(
  profile: Profile,
  tasks: Task[],
  companions: Companion[],
  owned: OwnedShopItem[],
) {
  const completed = tasks.filter((task) => !task.archived && task.completed),
    active = tasks.filter((task) => !task.archived);
  const areas = new Map<number, { count: number; xp: number }>();
  for (const task of active)
    if (task.areaId) {
      const row = areas.get(task.areaId) ?? { count: 0, xp: 0 };
      row.count++;
      if (task.completed) row.xp += task.xp;
      areas.set(task.areaId, row);
    }
  const available = companions.filter((pet) =>
    companionAvailable(pet, profile.level),
  );
  return createAchievementStats({
    totalXp: profile.totalXpEarned,
    level: profile.level,
    streak: profile.currentStreak,
    completedMissions: completed.length,
    completedEpicOrLegendary: completed.filter((t) =>
      ['epic', 'legendary'].includes(t.rarity),
    ).length,
    completedLegendary: completed.filter((t) => t.rarity === 'legendary')
      .length,
    maxTasksInSingleArea: Math.max(
      0,
      ...[...areas.values()].map((r) => r.count),
    ),
    completedAreasCount: [...areas.values()].filter((r) => r.xp > 0).length,
    maxAreaLevel: Math.max(
      0,
      ...[...areas.values()].map((r) => Math.floor(r.xp / 100)),
    ),
    areasAtLeastLevel20: [...areas.values()].filter((r) => r.xp >= 2000).length,
    unlockedCompanionsCount: available.length,
    hasWolf: available.some((p) => p.id === 1),
    hasDragon: available.some((p) => p.id === 3),
    allCompanionsUnlocked: [1, 2, 3, 4].every((id) =>
      available.some((p) => p.id === id),
    ),
    purchaseCount: owned.length,
    savedGold: profile.gold,
    equipmentSlots: new Set(
      owned.map((row) => getShopItemById(row.itemId)?.slot).filter(Boolean),
    ).size,
  });
}
export function collectionCapacity(
  owned: OwnedShopItem[],
  inventory: InventoryItem[],
) {
  return {
    used:
      owned.length +
      inventory.filter((row) => row.owned && row.type !== 'gear').length,
    max:
      20 +
      (owned.some(
        (row) => row.equipped && getShopItemById(row.itemId)?.slot === 'bag',
      )
        ? 10
        : 0),
  };
}
