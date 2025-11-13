// src/services/xpService.ts
import { db, type Profile, type XpLog } from '$services/db';

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
  'Aventureiro Iniciante', // 1
  'Explorador Determinado', // 2
  'Guardião em Treinamento', // 3
  'Caçador de Metas', // 4
  'Aprendiz de Lendas', // 5
  'Herói da Rotina', // 6
  'Mestre da Disciplina', // 7
  'Guardião do Tempo', // 8
  'Arquiteto de Hábitos', // 9
  'Lenda da Consistência', // 10
  'Mentor da Jornada', // 11
  'Forjador de Rotinas', // 12
  'Domador de Procrastinação', // 13
  'Estrategista da Vida', // 14
  'Campeão do Foco', // 15
  'Arconte da Ordem', // 16
  'Guardião dos Objetivos', // 17
  'Sábio da Persistência', // 18
  'Lâmina do Progresso', // 19
  'Arquimago da Constância', // 20
  'Lorde das Rotinas', // 21
  'Lenda Viva', // 22
  'Herói Atemporal', // 23
  'Mestre das Mil Missões', // 24
  'Avatar da Disciplina', // 25
  'Guardião do Equilíbrio', // 26
  'Deus(a) do Hábito', // 27
  'Eterno da Jornada', // 28
  'Mito Imortal', // 29
  'Lenda Suprema', // 30+
];

export function getTitleForLevel(level: number): string {
  if (level < 1) level = 1;
  if (level >= LEVEL_TITLES.length) {
    return LEVEL_TITLES[LEVEL_TITLES.length - 1];
  }
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
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
      avatarUrl: '',
      currentStreak: 0,
      lastCompletionDate: null,
      activeCompanionId: null,
      createdAt: now,
      updatedAt: now,
    };
    await db.profile.add(profile);
  }

  return profile;
}

/**
 * Aplica uma variação de XP (positiva ou negativa),
 * recalcula nível, XP atual, XP do próximo nível, gold
 * e registra um XpLog com área.
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
  const dateKey = toDateKey(now);

  // --- XP total acumulado (não deixa ficar negativo) ---
  const currentTotal = profile.totalXpEarned ?? 0;
  const newTotal = Math.max(0, currentTotal + amount);

  // --- Estado de nível baseado no XP total ---
  const { level, xpIntoLevel, xpForNext } = getLevelStateFromTotalXp(newTotal);

  // --- Gold proporcional ao XP (0.5 por XP) ---
  const goldDelta = Math.floor(Math.abs(amount) * 0.5) * (amount >= 0 ? 1 : -1);
  const currentGold = profile.gold ?? 0;
  const newGold = Math.max(0, currentGold + goldDelta);

  // --- Streak (só mexe quando ganha XP positivo) ---
  let currentStreak = profile.currentStreak ?? 0;
  let lastCompletionDate = profile.lastCompletionDate ?? null;

  if (amount > 0) {
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
    updatedAt: now,
  };

  await db.profile.update(profile.id!, updated);

  // --- Log de XP (positivo ou negativo) para estatísticas ---
  const log: XpLog = {
    date: dateKey,
    amount,
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
  return applyXpDelta(amount, areaId ?? null);
}

async function removeXp(
  amount: number,
  areaId?: number | null,
): Promise<Profile> {
  if (!amount || amount <= 0) {
    return ensureProfile();
  }
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
