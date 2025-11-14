// src/services/xpService.ts
import { db, type Profile, type XpLog } from '$services/db';
import { ECO_STAGES, getEcoStageForTotalXp } from '$services/ecoConfig';

/**
 * XP necessário para subir de N -> N+1.
 * Index 0 é ignorado. Somando 1..29 ≈ 250.000 XP (até nível 30).
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
// XP_CUMULATIVE[1] = 0 (nível 1), XP_CUMULATIVE[2] = xp pra chegar no 2, etc.
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

// Títulos por nível
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
 * Garante que existe um Profile com id=1.
 */
async function ensureProfile(): Promise<Profile> {
  let profile = await db.profile.get(1);

  if (!profile) {
    const nowIso = new Date().toISOString();

    profile = {
      id: 1,
      name: 'Herói sem nome',
      title: getTitleForLevel(1),
      level: 1,
      xpCurrent: 0,
      xpNext: getXpForNextLevel(1),
      totalXpEarned: 0,
      gold: 0,
      avatarUrl: '',
      currentStreak: 0,
      lastCompletionDate: null,
      activeCompanionId: 1,
      updatedAt: nowIso,
    };

    // put() garante upsert seguro
    await db.profile.put(profile);
  }

  return profile;
}

/**
 * Aplica uma variação de XP (positiva ou negativa),
 * com bônus do Santuário, recalcula nível, XP atual, XP do próximo nível, gold
 * e registra um XpLog com área.
 *
 * amount = XP base (antes do bônus do Santuário).
 */
async function applyXpDelta(
  amount: number,
  areaId: number | null,
): Promise<Profile> {
  const profile = await ensureProfile();
  if (!amount || amount === 0) {
    return profile;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const dateKey = toDateKey(now);

  // --- XP total acumulado ANTES do ganho/perda ---
  const currentTotal = profile.totalXpEarned ?? 0;

  // --- Bônus do Santuário: multiplicador baseado no estágio atual (ANTES do ganho) ---
  const ecoStageBefore = getEcoStageForTotalXp(currentTotal);
  const bonusMultiplier = ecoStageBefore.xpBonusMultiplier ?? 1;
  const isPositive = amount > 0;

  // XP efetivo considerando o bônus de 5/10/20% (apenas para ganhos, não para perdas)
  const effectiveAmount =
    isPositive && bonusMultiplier > 1
      ? Math.round(amount * bonusMultiplier)
      : amount;

  const newTotal = Math.max(0, currentTotal + effectiveAmount);

  // --- Estado de nível baseado no XP total pós-bônus ---
  const { level, xpIntoLevel, xpForNext } = getLevelStateFromTotalXp(newTotal);

  // --- Gold proporcional ao XP efetivo (0.5 por XP) ---
  const goldDelta =
    Math.floor(Math.abs(effectiveAmount) * 0.5) *
    (effectiveAmount >= 0 ? 1 : -1);
  const currentGold = profile.gold ?? 0;

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

  // --- Streak (só mexe quando ganha XP positivo efetivo) ---
  let currentStreak = profile.currentStreak ?? 0;
  let lastCompletionDate = profile.lastCompletionDate ?? null;

  if (effectiveAmount > 0) {
    const today = dateKey;
    if (!lastCompletionDate) {
      currentStreak = 1;
      lastCompletionDate = today;
    } else {
      const last = new Date(lastCompletionDate);
      const todayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const lastDate = new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate(),
      );
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // mesmo dia, mantém streak
      } else if (diffDays === 1) {
        currentStreak = (currentStreak || 0) + 1;
      } else {
        currentStreak = 1;
      }
      lastCompletionDate = today;
    }
  }

  const updated: Partial<Profile> = {
    level,
    xpCurrent: xpIntoLevel,
    xpNext: xpForNext,
    totalXpEarned: newTotal,
    gold: newGold,
    currentStreak,
    lastCompletionDate,
    title: getTitleForLevel(level),
    updatedAt: nowIso,
  };

  // injeta metadado do santuário sem exigir campo no tipo Profile
  (updated as any).ecoGoldClaimedUpToStage = ecoGoldClaimedUpToStage;

  await db.profile.update(profile.id!, updated);

  // --- Log de XP (positivo ou negativo) para estatísticas ---
  const log: XpLog = {
    amount: effectiveAmount, // campo novo, usado pelo EcoPanel
    xp: effectiveAmount, // compat com código legado que lia `xp`
    reason: 'generic_xp_change',
    areaId: areaId ?? null,
    taskId: null,
    projectId: null,
    date: dateKey,
    createdAt: nowIso,
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
  // remoção ignora bônus do santuário (amount é tratado como delta negativo)
  return applyXpDelta(-amount, areaId ?? null);
}

export const xpService = {
  addXp,
  removeXp,
  ensureProfile,
  getLevelStateFromTotalXp,
  getXpForNextLevel,
  getTitleForLevel,
};
