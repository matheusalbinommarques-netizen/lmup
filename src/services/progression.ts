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
