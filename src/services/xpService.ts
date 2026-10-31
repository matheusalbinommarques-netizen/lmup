import { ensureProfile } from './profileService';
import { grantReward, removeManualXp } from './rewardService';
import {
  getLevelStateFromTotalXp,
  getXpForNextLevel,
  getTitleForLevel,
  getFoodFromEffectiveXp,
} from './progression';

export * from './progression';

async function addXp(amount: number, areaId?: number | null) {
  if (!Number.isFinite(amount)) throw new Error('XP inválido.');
  if (amount <= 0) return ensureProfile();
  return (
    await grantReward({
      id: `adjustment:${crypto.randomUUID()}`,
      kind: 'adjustment',
      baseXp: amount,
      areaId,
    })
  ).profile;
}

async function removeXp(amount: number, areaId?: number | null) {
  if (!Number.isFinite(amount)) throw new Error('XP inválido.');
  if (amount <= 0) return ensureProfile();
  return removeManualXp(amount, areaId);
}

export const xpService = {
  addXp,
  removeXp,
  ensureProfile,
  getLevelStateFromTotalXp,
  getXpForNextLevel,
  getTitleForLevel,
  getFoodFromEffectiveXp,
};
