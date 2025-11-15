// src/services/xpService.ts
import { db, type Profile, type XpLog } from '$services/db';
import { ECO_STAGES, getEcoStageForTotalXp } from '$services/ecoConfig';
import { getHeroModifiersOnce } from '$services/gearService';
import { getActiveCompanionBuffs } from '$services/companionService';

/**
 * XP necessário para subir de N -> N+1.
 * Index 0 é ignorado. Somando 1..29 = 250.000 XP (até nível 30).
 */
export const XP_PER_LEVEL: number[] = [
  0, // índice 0 (não usado)
  250,
  300,
  360,
  433,
  520,
  624,
  750,
  900,
  1081,
  1298,
  1559,
  1872,
  2248,
  2699,
  3241,
  3892,
  4674,
  5612,
  6739,
  8093,
  9718,
  11_670,
  14_014,
  16_828,
  20_208,
  24_266,
  29_140,
  34_992,
  42_019,
];

export const MAX_LEVEL = 30;

// cumulativo de XP para chegar em cada nível
// cumulative[1] = 0 (nível 1), cumulative[2] = xp pra chegar no 2, etc.
const XP_CUMULATIVE: number[] = (() => {
  const acc: number[] = [];
  let sum = 0;
  acc[0] = 0;
  acc[1] = 0; // nível 1 começa em 0
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    sum += XP_PER_LEVEL[lvl];
    acc[lvl + 1] = sum;
  }
  return acc;
})();

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getXpForNextLevel(level: number): number {
  if (level < 1) return XP_PER_LEVEL[1];
  if (level >= MAX_LEVEL) return 0;
  return XP_PER_LEVEL[level];
}

export type LevelState = {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
};

/**
 * Dado o XP total acumulado ao longo da jornada,
 * devolve nível atual, XP dentro do nível e XP necessário pro próximo nível.
 */
export function getLevelStateFromTotalXp(totalXp: number): LevelState {
  if (totalXp <= 0) {
    return {
      level: 1,
      xpIntoLevel: 0,
      xpForNext: getXpForNextLevel(1),
    };
  }

  let level = 1;

  for (let l = 1; l < MAX_LEVEL; l++) {
    const nextThreshold = XP_CUMULATIVE[l + 1]; // xp pra chegar no nível l+1
    if (totalXp >= nextThreshold) {
      level = l + 1;
    } else {
      break;
    }
  }

  const prevThreshold = XP_CUMULATIVE[level]; // xp acumulado ao entrar nesse nível
  const xpIntoLevel = Math.max(0, totalXp - prevThreshold);
  const xpForNext = level >= MAX_LEVEL ? 0 : getXpForNextLevel(level);

  return { level, xpIntoLevel, xpForNext };
}

// Títulos por nível (fica à vontade pra trocar os textos depois)
const LEVEL_TITLES: string[] = [
  '',
  'Estudante', // 1
  'Acólito', // 2
  'Acólito Mestre', // 3
  'Grão-Acólito Mestre', // 4
  'Iniciado', // 5
  'Mago', // 6
  'Grão-Mago', // 7
  'Grão-Mestre Mago', // 8
  'Arquimago', // 9
  'Arquimago Mestre', // 10
  'Arquimago Grão-Mestre', // 11
  'Arcanista', // 12
  'Erudito', // 13
  'Sábio', // 14
  'Mestre do Conhecimento', // 15
  'Grão-Mestre do Conhecimento', // 16
  'Rei do Conhecimento', // 17
  'Mestre dos Tempos', // 18
  'Grão-Mestre dos Tempos', // 19
  'Entidade do Tempo', // 20
  'Ancião', // 21
  'Grão-Ancião', // 22
  'Grão-Mestre Ancião', // 23
  'Profeta', // 24
  'Mestre Profeta', // 25
  'Grão-Mestre Profeta', // 26
  'Celestial', // 27
  'Semideus', // 28
  'Eterno', // 29
  'O Criador', // 30+,
];

export function getTitleForLevel(level: number): string {
  if (level < 1) level = 1;
  if (level >= LEVEL_TITLES.length) {
    return LEVEL_TITLES[LEVEL_TITLES.length - 1];
  }
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

/**
 * Conversão XP base -> COMIDA (sem buffs, sem Santuário).
 * Deve bater com o que é mostrado no Quadro de Missões.
 */
export function getFoodFromEffectiveXp(xpBase: number): number {
  if (!xpBase || xpBase <= 0) return 0;

  if (xpBase <= 25) return 1;
  if (xpBase <= 50) return 2;
  if (xpBase <= 75) return 3;
  if (xpBase <= 100) return 4;

  return 4 + Math.floor((xpBase - 100) / 50);
}

async function ensureProfile(): Promise<Profile> {
  let profile = await db.profile.get(1);

  if (!profile) {
    const now = new Date();
    profile = {
      id: 1,
      name: 'Herói sem nome',
      title: getTitleForLevel(1),
      level: 1,
      xpCurrent: 0,
      xpNext: getXpForNextLevel(1),
      totalXpEarned: 0,
      gold: 0,
      food: 0, // inicia sem comida
      avatarUrl: '',
      currentStreak: 0,
      lastCompletionDate: null,
      activeCompanionId: 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.profile.add(profile);
  } else {
    // Garantir campo food mesmo em perfis antigos
    if (typeof profile.food !== 'number') {
      profile.food = 0;
      await db.profile.update(profile.id!, { food: 0 });
    }
  }

  return profile;
}

/**
 * Aplica uma variação de XP (positiva ou negativa),
 * com bônus do Santuário (ajustado pelo ANEL), recalcula nível,
 * XP atual, XP do próximo nível,
 * GOLD (0.5 por XP base, com buff de gold do pet + gear),
 * COMIDA (em função do XP base da missão, com buff do companheiro),
 * e registra um XpLog com área.
 *
 * amount = XP base (antes dos bônus).
 */
async function applyXpDelta(
  amount: number,
  areaId: number | null,
): Promise<Profile> {
  const profile = await ensureProfile();
  if (!amount || amount === 0) {
    return profile;
  }

  const isPositive = amount > 0;

  // --- Modificadores do herói (gear equipado) ---
  let goldMultiplier = 1;
  let sanctuaryBonusExtraPercent = 0;

  try {
    const modifiers = await getHeroModifiersOnce();
    goldMultiplier = modifiers.goldMultiplier ?? 1;
    sanctuaryBonusExtraPercent = modifiers.sanctuaryBonusExtraPercent ?? 0;
  } catch (error) {
    console.error('Falha ao carregar HeroModifiers em xpService:', error);
  }

  // --- Buffs do companheiro ativo (XP / Gold / Comida / raridade) ---
  let companionBuffs = {
    xpBonusPercent: 0,
    goldBonusPercent: 0,
    foodBonusPercent: 0,
    raritySubtaskReduction: 0,
  };

  try {
    const buffs = await getActiveCompanionBuffs();
    if (buffs) {
      companionBuffs = {
        xpBonusPercent: buffs.xpBonusPercent ?? 0,
        goldBonusPercent: buffs.goldBonusPercent ?? 0,
        foodBonusPercent: buffs.foodBonusPercent ?? 0,
        raritySubtaskReduction: buffs.raritySubtaskReduction ?? 0,
      };
    }
  } catch (error) {
    console.error(
      'Falha ao carregar buffs do companheiro em xpService:',
      error,
    );
  }

  const now = new Date();
  const dateKey = toDateKey(now);

  // --- XP total acumulado ANTES do ganho/perda ---
  const currentTotal = profile.totalXpEarned ?? 0;

  // --- Bônus do Santuário: multiplicador baseado no estágio atual (ANTES do ganho) ---
  const ecoStageBefore = getEcoStageForTotalXp(currentTotal);
  const baseSanctuaryMultiplier = ecoStageBefore.xpBonusMultiplier ?? 1;

  // bônus extra do ANEL (ex.: 10% = 0.10)
  const extraFromRing =
    sanctuaryBonusExtraPercent > 0 ? sanctuaryBonusExtraPercent / 100 : 0;

  // Exemplo: 1.05 (5% base) + 0.10 (10% do anel) = 1.15 (15% total)
  const sanctuaryMultiplier = baseSanctuaryMultiplier + extraFromRing;

  // --- Fator de buff do pet para XP (apenas ganhos) ---
  const xpBuffFactor =
    isPositive && companionBuffs.xpBonusPercent > 0
      ? 1 + companionBuffs.xpBonusPercent / 100
      : 1;

  // XP efetivo considerando Santuário + Anel + Pet (apenas ganhos)
  const effectiveAmount =
    isPositive && sanctuaryMultiplier > 1
      ? Math.round(amount * sanctuaryMultiplier * xpBuffFactor)
      : isPositive
        ? Math.round(amount * xpBuffFactor)
        : amount;

  const newTotal = Math.max(0, currentTotal + effectiveAmount);

  // --- Estado de nível baseado no XP total pós-bônus ---
  const { level, xpIntoLevel, xpForNext } = getLevelStateFromTotalXp(newTotal);

  // --- Gold proporcional ao XP BASE da missão (0.5 por XP base) ---
  // Isso garante que o valor mostrado na missão (ex: +125 Gold) seja o gold "base"
  // antes dos buffs de pet/gear. Santuário não aumenta o gold direto.
  const baseGoldFromXp =
    Math.floor(Math.abs(amount) * 0.5) * (amount >= 0 ? 1 : -1);

  // Buff do pet em gold (apenas ganhos)
  const goldBuffFactor =
    isPositive && companionBuffs.goldBonusPercent > 0
      ? 1 + companionBuffs.goldBonusPercent / 100
      : 1;

  const goldDelta = Math.round(
    baseGoldFromXp * goldMultiplier * goldBuffFactor,
  );
  const currentGold = profile.gold ?? 0;

  // --- Comida proporcional ao XP base da missão (sem Santuário / XP pet) ---
  const currentFood = profile.food ?? 0;

  // usa *amount* (XP bruto da missão) pra bater com a UI
  const baseFoodDelta = isPositive ? getFoodFromEffectiveXp(amount) : 0;

  const foodBuffFactor =
    isPositive && companionBuffs.foodBonusPercent > 0
      ? 1 + companionBuffs.foodBonusPercent / 100
      : 1;

  // arredonda pra refletir o buff do Lich/Aberração (ex.: 7 * 1.1 -> 8)
  const foodDelta = Math.round(baseFoodDelta * foodBuffFactor);
  const newFood = Math.max(0, currentFood + foodDelta);

  // --- Recompensas de Gold por avanço de estágio do Santuário ---
  const ecoMeta = profile as any;
  let ecoGoldClaimedUpToStage: number = ecoMeta.ecoGoldClaimedUpToStage ?? 1;
  let extraGoldFromEco = 0;

  const ecoStageAfter = getEcoStageForTotalXp(newTotal);

  if (isPositive && ecoStageAfter.id > ecoGoldClaimedUpToStage) {
    // Garante que damos 200 (Brotinho), 500 (Árvore Jovem) e 1000 (Floresta),
    // sem repetir quando o usuário voltar depois.
    for (const stage of ECO_STAGES) {
      if (stage.id > ecoGoldClaimedUpToStage && stage.id <= ecoStageAfter.id) {
        extraGoldFromEco += stage.goldRewardOnEnter;
      }
    }
    ecoGoldClaimedUpToStage = ecoStageAfter.id;
  }

  const newGold = Math.max(0, currentGold + goldDelta + extraGoldFromEco);

  // --- Atualiza perfil (sem mexer em streak aqui) ---
  const updated: Partial<Profile> = {
    level,
    xpCurrent: xpIntoLevel,
    xpNext: xpForNext,
    totalXpEarned: newTotal,
    gold: newGold,
    food: newFood,
    title: getTitleForLevel(level),
    updatedAt: now,
  };

  // injeta metadado do santuário sem exigir campo no tipo Profile
  (updated as any).ecoGoldClaimedUpToStage = ecoGoldClaimedUpToStage;

  await db.profile.update(profile.id!, updated);

  // --- Log de XP (positivo ou negativo) para estatísticas ---
  const log: XpLog = {
    date: dateKey,
    amount: effectiveAmount, // loga o XP já com bônus aplicado (Santuário + Anel + Pet)
    areaId,
    createdAt: now,
  };

  await db.xpLogs.add(log);

  return { ...profile, ...updated } as Profile;
}

async function addXp(amount: number, areaId?: number | null): Promise<Profile> {
  if (!amount || amount <= 0) {
    return ensureProfile();
  }
  // amount = XP base; bônus é aplicado internamente
  return applyXpDelta(amount, areaId ?? null);
}

async function removeXp(
  amount: number,
  areaId?: number | null,
): Promise<Profile> {
  if (!amount || amount <= 0) {
    return ensureProfile();
  }
  // remoção ignora bônus do santuário e do pet (effectiveAmount cai no ramo negativo)
  // e, por enquanto, não remove comida; apenas XP/Gold.
  return applyXpDelta(-amount, areaId ?? null);
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
