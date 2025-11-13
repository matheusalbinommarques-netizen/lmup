// src/services/xpService.ts
import { db, type Profile, type XpLog } from '$services/db';
import { BehaviorSubject, type Observable } from 'rxjs';

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
  'Arquimago Grão-Mestre ', // 11
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
  'O Criador', // 30+
];

export function getTitleForLevel(level: number): string {
  if (level < 1) level = 1;
  if (level >= LEVEL_TITLES.length) {
    return LEVEL_TITLES[LEVEL_TITLES.length - 1];
  }
  return LEVEL_TITLES[level] || LEVEL_TITLES[1];
}

/**
 * Versão "legacy" utilizada pelos painéis de conquistas.
 * É basicamente um alias para getLevelStateFromTotalXp.
 */
export function calcularNivel(totalXp: number): LevelState {
  return getLevelStateFromTotalXp(totalXp);
}

/* ------------------------------------------------------------------
 * Observables globais de XP total e Streak
 * ------------------------------------------------------------------ */

const totalXpSubject = new BehaviorSubject<number>(0);
const streakSubject = new BehaviorSubject<{ count: number }>({ count: 0 });

async function hydrateSubjectsFromProfile() {
  try {
    const profile = await ensureProfile();
    const totalXp = profile.totalXpEarned ?? 0;
    const streak = profile.currentStreak ?? 0;

    totalXpSubject.next(totalXp);
    streakSubject.next({ count: streak });
  } catch (error) {
    console.error(
      '[xpService] Erro ao hidratar subjects a partir do perfil:',
      error,
    );
  }
}

// Só hidrata no browser (IndexedDB não existe no SSR)
if (typeof window !== 'undefined') {
  void hydrateSubjectsFromProfile();
}

/**
 * Observable com o XP total acumulado do herói.
 * Usado em AvatarAchievementsPanel, AchievementsPanel, etc.
 */
export function getTotalXpObservable(): Observable<number> {
  // Garantia extra: se o valor ainda for 0, tenta sincronizar do perfil
  if (typeof window !== 'undefined') {
    void hydrateSubjectsFromProfile();
  }
  return totalXpSubject.asObservable();
}

/**
 * Observable com o streak atual (objeto { count }).
 */
export function getStreakObservable(): Observable<{ count: number }> {
  if (typeof window !== 'undefined') {
    void hydrateSubjectsFromProfile();
  }
  return streakSubject.asObservable();
}

/* ------------------------------------------------------------------
 * Perfil & Mutação de XP
 * ------------------------------------------------------------------ */

export async function ensureProfile(): Promise<Profile> {
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

  // Atualiza observables globais
  totalXpSubject.next(newTotal);
  streakSubject.next({ count: currentStreak ?? 0 });

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

/**
 * Interface principal usada pelo restante do app (missões, stats, etc.)
 */
export const xpService = {
  addXp,
  removeXp,
  ensureProfile,
  getLevelStateFromTotalXp,
  getXpForNextLevel,
  getTitleForLevel,
  calcularNivel,
  getTotalXpObservable,
  getStreakObservable,
};
