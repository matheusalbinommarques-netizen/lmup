import { liveQuery } from 'dexie';
import { db } from './db';
import { equippedItemsForOwned, modifiersForOwned } from './gearService';
import {
  getActiveCompanionBuffs,
  companionAvailable,
} from './companionService';
import { getShopItemById } from '$lib/shop/types';
import { calculateReward } from './rewardService';
import { getEcoStageForTotalXp } from './ecoConfig';
export function readProfileSnapshot() {
  return db.transaction(
    'r',
    db.profile,
    db.companions,
    db.ownedShopItems,
    async () => {
      const profile = await db.profile.get(1);
      if (!profile)
        throw new Error(
          'Seu perfil não está disponível. Reabra o aplicativo para tentar novamente.',
        );
      const companions = await db.companions.toArray(),
        owned = await db.ownedShopItems.toArray();
      const companion = companions.find(
        (row) => row.id === profile.activeCompanionId,
      );
      const active =
        !!companion && companionAvailable(companion, profile.level);
      const buffs = await getActiveCompanionBuffs(),
        mods = modifiersForOwned(owned);
      return {
        profile,
        companion,
        active,
        mods,
        buffs,
        equipped: equippedItemsForOwned(owned),
        unknownEquipment: owned.filter(
          (row) => row.equipped && !getShopItemById(row.itemId)?.slot,
        ).length,
        sanctuary: getEcoStageForTotalXp(profile.totalXpEarned),
        preview: calculateReward(100, profile, mods, buffs),
      };
    },
  );
}
export function profileQuery() {
  return liveQuery(readProfileSnapshot);
}
export type ProfileSnapshot = Awaited<ReturnType<typeof readProfileSnapshot>>;
