// src/services/ecoConfig.ts

export type EcoStageId = 1 | 2 | 3 | 4;

export interface EcoStageConfig {
  id: EcoStageId;
  label: string;
  image: string;
  minXp: number;
  maxXp: number | null; // limite superior; null = último estágio
  xpBonusMultiplier: number; // 1.00, 1.05, 1.10, 1.20...
  goldRewardOnEnter: number; // recompensa única ao entrar no estágio
}

/**
 * Configuração dos estágios do Santuário
 *
 * Faixas:
 *  - Semente:        0     →  2.500 XP
 *  - Brotinho:       2.500 →  7.500 XP
 *  - Árvore Jovem:   7.500 → 12.000 XP
 *  - Floresta Anciã: 12.000+ XP
 *
 * Bônus de XP:
 *  - Semente:        +0%
 *  - Brotinho:       +5%
 *  - Árvore Jovem:   +10%
 *  - Floresta Anciã: +20%
 *
 * Rewards de Gold ao entrar:
 *  - Brotinho:       +200
 *  - Árvore Jovem:   +500
 *  - Floresta Anciã: +1000
 */
export const ECO_STAGES: EcoStageConfig[] = [
  {
    id: 1,
    label: 'Semente',
    image: '/art/bg/eco-stage-1-seed.webp',
    minXp: 0,
    maxXp: 2500,
    xpBonusMultiplier: 1.0,
    goldRewardOnEnter: 0,
  },
  {
    id: 2,
    label: 'Brotinho',
    image: '/art/bg/eco-stage-2-sprout.webp',
    minXp: 2500,
    maxXp: 7500,
    xpBonusMultiplier: 1.05,
    goldRewardOnEnter: 200,
  },
  {
    id: 3,
    label: 'Árvore Jovem',
    image: '/art/bg/eco-stage-3-tree.webp',
    minXp: 7500,
    maxXp: 12000,
    xpBonusMultiplier: 1.1,
    goldRewardOnEnter: 500,
  },
  {
    id: 4,
    label: 'Floresta Anciã',
    image: '/art/bg/eco-stage-4-forest.webp',
    minXp: 12000,
    maxXp: null,
    xpBonusMultiplier: 1.2,
    goldRewardOnEnter: 1000,
  },
];

/**
 * Retorna o estágio correspondente a um total de XP.
 */
export function getEcoStageForTotalXp(totalXp: number): EcoStageConfig {
  let current = ECO_STAGES[0];

  for (const stage of ECO_STAGES) {
    if (totalXp >= stage.minXp) {
      current = stage;
    } else {
      break;
    }
  }

  return current;
}

/**
 * Retorna o estágio seguinte (se houver) dado um id.
 */
export function getNextEcoStage(currentId: EcoStageId): EcoStageConfig | null {
  const idx = ECO_STAGES.findIndex((s) => s.id === currentId);
  if (idx === -1 || idx === ECO_STAGES.length - 1) return null;
  return ECO_STAGES[idx + 1];
}

/**
 * Retorna o estágio por id (fallback para o primeiro se não achar).
 */
export function getEcoStageById(id: number): EcoStageConfig {
  return ECO_STAGES.find((s) => s.id === id) ?? ECO_STAGES[0];
}

/**
 * Progresso (%) dentro do estágio atual para um total de XP.
 *  - 0 a 100 para estágios com maxXp
 *  - 100 fixo para o último estágio (maxXp === null)
 */
export function getEcoProgressForTotalXp(totalXp: number): number {
  const stage = getEcoStageForTotalXp(totalXp);

  if (stage.maxXp == null) {
    return 100;
  }

  const clamped = Math.max(stage.minXp, Math.min(totalXp, stage.maxXp));
  const range = stage.maxXp - stage.minXp;

  if (range <= 0) return 100;

  const progress = ((clamped - stage.minXp) / range) * 100;
  return Math.max(0, Math.min(100, progress));
}
