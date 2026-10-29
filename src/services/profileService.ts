import { db, type Profile, type Companion } from './db';
import { getTitleForLevel, getXpForNextLevel } from './progression';

export function createDefaultProfile(): Profile {
  return {
    id: 1,
    name: 'Herói sem nome',
    title: getTitleForLevel(1),
    level: 1,
    xpCurrent: 0,
    xpNext: getXpForNextLevel(1),
    totalXpEarned: 0,
    gold: 0,
    food: 0,
    avatarUrl: '',
    currentStreak: 0,
    lastCompletionDate: null,
    activeCompanionId: 1,
    ecoGoldClaimedUpToStage: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function ensureProfile(): Promise<Profile> {
  return db.transaction('rw', db.profile, async () => {
    const existing = await db.profile.get(1);
    if (!existing) {
      const profile = createDefaultProfile();
      await db.profile.add(profile);
      return profile;
    }
    if (typeof existing.food !== 'number') {
      await db.profile.update(1, { food: 0 });
      return { ...existing, food: 0 };
    }
    return existing;
  });
}

const companions: Companion[] = [
  {
    id: 1,
    key: 'wolf',
    name: 'Lobo Etéreo',
    type: 'Caçador das Sombras',
    requiredLevel: 1,
    imagePath: '/art/pets/lobo-1.webp',
  },
  {
    id: 2,
    key: 'lich',
    name: 'Lorde Lich',
    type: 'Mago Imortal',
    requiredLevel: 5,
    imagePath: '/art/pets/lich-1.webp',
  },
  {
    id: 3,
    key: 'dragon',
    name: 'Dragão Ancião',
    type: 'Guardião de Chamas',
    requiredLevel: 15,
    imagePath: '/art/pets/dragao-1.webp',
  },
  {
    id: 4,
    key: 'aberration',
    name: 'Aberração Abissal',
    type: 'Eco do Vazio',
    requiredLevel: 20,
    imagePath: '/art/pets/aberracao-1.webp',
  },
];

export async function initializeJourney(): Promise<void> {
  await db.transaction('rw', db.profile, db.companions, async () => {
    const profile = await ensureProfile();
    for (const base of companions) {
      const existing = await db.companions.get(base.id!);
      if (!existing) {
        await db.companions.add({
          ...base,
          unlocked: profile.level >= base.requiredLevel!,
          evolutionStage: 1,
          foodInvested: 0,
        });
      } else {
        const patch: Partial<Companion> = {};
        if (!existing.key) patch.key = base.key;
        if (!existing.requiredLevel) patch.requiredLevel = base.requiredLevel;
        if (!existing.unlocked && profile.level >= base.requiredLevel!)
          patch.unlocked = true;
        if (Object.keys(patch).length)
          await db.companions.update(base.id!, patch);
      }
    }
  });
}
