// src/services/companionService.ts
import { db, type Companion, type Profile } from '$services/db';

/**
 * Cada estágio de evolução do pet:
 * - stage: 1, 2, 3...
 * - imagePath: arte correspondente (vamos usar no Bestiário / Taverna)
 * - totalFoodRequired: comida TOTAL investida naquele pet
 *   para chegar nesse estágio (não é custo incremental).
 */
export type PetEvolutionStage = {
  stage: number;
  imagePath: string;
  totalFoodRequired: number;
};

export type PetEvolutionConfig = {
  key: string;
  stages: PetEvolutionStage[];
};

// Mapeamento "canônico" dos pets (3 estágios cada, ajusta os números se quiser)
const PET_EVOLUTIONS: PetEvolutionConfig[] = [
  {
    key: 'wolf',
    stages: [
      { stage: 1, imagePath: '/art/pets/lobo-1.webp', totalFoodRequired: 0 },
      { stage: 2, imagePath: '/art/pets/lobo-2.webp', totalFoodRequired: 40 },
      { stage: 3, imagePath: '/art/pets/lobo-3.webp', totalFoodRequired: 120 },
    ],
  },
  {
    key: 'lich',
    stages: [
      { stage: 1, imagePath: '/art/pets/lich-1.webp', totalFoodRequired: 0 },
      { stage: 2, imagePath: '/art/pets/lich-2.webp', totalFoodRequired: 50 },
      { stage: 3, imagePath: '/art/pets/lich-3.webp', totalFoodRequired: 150 },
    ],
  },
  {
    key: 'dragon',
    stages: [
      { stage: 1, imagePath: '/art/pets/dragao-1.webp', totalFoodRequired: 0 },
      { stage: 2, imagePath: '/art/pets/dragao-2.webp', totalFoodRequired: 60 },
      {
        stage: 3,
        imagePath: '/art/pets/dragao-3.webp',
        totalFoodRequired: 180,
      },
    ],
  },
  {
    key: 'aberration',
    stages: [
      {
        stage: 1,
        imagePath: '/art/pets/aberracao-1.webp',
        totalFoodRequired: 0,
      },
      {
        stage: 2,
        imagePath: '/art/pets/aberracao-2.webp',
        totalFoodRequired: 60,
      },
      {
        stage: 3,
        imagePath: '/art/pets/aberracao-3.webp',
        totalFoodRequired: 180,
      },
    ],
  },
];

// Fallback por id (caso algum registro antigo não tenha "key" setada)
const PET_KEY_BY_ID: Record<number, string> = {
  1: 'wolf',
  2: 'lich',
  3: 'dragon',
  4: 'aberration',
};

function getPetConfigByKey(key: string | undefined): PetEvolutionConfig | null {
  if (!key) return null;
  return PET_EVOLUTIONS.find((cfg) => cfg.key === key) ?? null;
}

function inferPetKey(companion: Companion | null | undefined): string | null {
  if (!companion) return null;
  if (companion.key) return companion.key;
  if (companion.id && PET_KEY_BY_ID[companion.id]) {
    return PET_KEY_BY_ID[companion.id];
  }
  return null;
}

export type CompanionEvolutionState = {
  key: string;
  stages: PetEvolutionStage[];
  currentStage: PetEvolutionStage;
  currentIndex: number;
  maxStage: number;
  foodInvested: number;
  nextStage?: PetEvolutionStage;
  nextTotalFoodRequired?: number;
};

/**
 * Lê o estado de evolução de um pet a partir do registro de Companion.
 * Usa:
 *  - companion.evolutionStage (se existir) ou 1
 *  - companion.foodInvested (total já gasto naquele pet)
 */
export function getCompanionEvolutionState(
  companion: Companion | null | undefined,
): CompanionEvolutionState | null {
  if (!companion) return null;

  const key = inferPetKey(companion);
  if (!key) return null;

  const cfg = getPetConfigByKey(key);
  if (!cfg || cfg.stages.length === 0) return null;

  const foodInvested = companion.foodInvested ?? 0;
  const evoStage = companion.evolutionStage ?? 1;

  const maxStage = cfg.stages[cfg.stages.length - 1].stage;
  const idx = cfg.stages.findIndex((s) => s.stage === evoStage);
  const currentIndex = idx === -1 ? 0 : idx;
  const currentStage = cfg.stages[currentIndex];
  const nextStage = cfg.stages[currentIndex + 1];

  return {
    key,
    stages: cfg.stages,
    currentStage,
    currentIndex,
    maxStage,
    foodInvested,
    nextStage,
    nextTotalFoodRequired: nextStage?.totalFoodRequired,
  };
}

/**
 * Helper para UI: devolve a imagem correta do estágio atual do pet,
 * baseada em Companion.evolutionStage + configuração canônica.
 *
 * Se não houver config/companion válido, retorna null.
 */
export function getCompanionStageImage(
  companion: Companion | null | undefined,
): string | null {
  const evo = getCompanionEvolutionState(companion);
  if (!evo) return null;
  return evo.currentStage.imagePath || null;
}

// Resultado da tentativa de evolução (pra UI saber o que aconteceu)
export type EvolveResult =
  | {
      ok: true;
      profile: Profile;
      companion: Companion;
      newStage: number;
    }
  | {
      ok: false;
      reason: 'not_found' | 'max_stage' | 'not_enough_food' | 'no_config';
    };

/**
 * Tenta evoluir um pet específico, gastando COMIDA do perfil.
 * - Respeita a config de estágios (totalFoodRequired)
 * - Atualiza profile.food e Companion.evolutionStage/foodInvested
 */
export async function evolveCompanion(
  companionId: number,
): Promise<EvolveResult> {
  const [profile, companion] = await Promise.all([
    db.profile.get(1),
    db.companions.get(companionId),
  ]);

  if (!profile) {
    return { ok: false, reason: 'not_found' };
  }

  if (!companion || !companion.id) {
    return { ok: false, reason: 'not_found' };
  }

  const evoState = getCompanionEvolutionState(companion);
  if (!evoState) {
    return { ok: false, reason: 'no_config' };
  }

  const { currentStage, nextStage, foodInvested } = evoState;

  if (!nextStage) {
    // Já está no último estágio
    return { ok: false, reason: 'max_stage' };
  }

  const currentStageTotal = currentStage.totalFoodRequired;
  const nextStageTotal = nextStage.totalFoodRequired;

  // comida já investida pode ser maior que o total do estágio atual se você mudar
  // as configs no futuro — garantimos que não fique negativa
  const safeFoodInvested = Math.max(foodInvested, currentStageTotal);

  // custo adicional pra chegar no próximo estágio
  const additionalCost = Math.max(0, nextStageTotal - safeFoodInvested);

  const currentFood = profile.food ?? 0;
  if (currentFood < additionalCost) {
    return { ok: false, reason: 'not_enough_food' };
  }

  const newFood = currentFood - additionalCost;
  const newFoodInvested = safeFoodInvested + additionalCost;

  const now = new Date();

  await db.transaction('rw', db.profile, db.companions, async () => {
    await db.profile.update(profile.id!, {
      food: newFood,
      updatedAt: now,
    });

    await db.companions.update(companion.id!, {
      evolutionStage: nextStage.stage,
      foodInvested: newFoodInvested,
    } as any);
  });

  const updatedProfile: Profile = {
    ...profile,
    food: newFood,
    updatedAt: now,
  };

  const updatedCompanion: Companion = {
    ...companion,
    evolutionStage: nextStage.stage,
    foodInvested: newFoodInvested,
  };

  return {
    ok: true,
    profile: updatedProfile,
    companion: updatedCompanion,
    newStage: nextStage.stage,
  };
}

/**
 * Buffs numéricos aplicados pelo companheiro ativo.
 */
export type CompanionBuffs = {
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  foodBonusPercent?: number;
  /**
   * Número de "subtarefas virtuais" extras
   * usadas para calcular a raridade das missões.
   */
  raritySubtaskReduction?: number;
};

/**
 * Mapeia o estado de evolução de um pet em buffs numéricos.
 */
function getCompanionBuffsForState(
  evo: CompanionEvolutionState | null,
): CompanionBuffs | null {
  if (!evo) return null;

  const { key, currentStage } = evo;
  const stage = currentStage.stage;

  // helper p/ 5/10/15%
  const percent = stage === 1 ? 5 : stage === 2 ? 10 : 15;

  switch (key) {
    case 'wolf':
      // Lobo: só XP
      return {
        xpBonusPercent: percent,
      };

    case 'lich':
      // Lich: só comida
      return {
        foodBonusPercent: percent,
      };

    case 'dragon':
      // Dragão: só gold
      return {
        goldBonusPercent: percent,
      };

    case 'aberration': {
      // Aberração:
      //  - lvl 1 → 5% xp/gold/comida, 0 redução
      //  - lvl 2 → 10% xp/gold/comida, 0 redução
      //  - lvl 3 → 15% xp/gold/comida, 1 subtask a menos
      const rarityReduction = stage === 3 ? 1 : 0;

      return {
        xpBonusPercent: percent,
        goldBonusPercent: percent,
        foodBonusPercent: percent,
        raritySubtaskReduction: rarityReduction,
      };
    }

    default:
      return null;
  }
}

/**
 * Retorna os buffs do companheiro atualmente ativo no perfil.
 */
export async function getActiveCompanionBuffs(): Promise<CompanionBuffs | null> {
  const profile = await db.profile.get(1);
  if (!profile || !profile.activeCompanionId) {
    return null;
  }

  const companion = await db.companions.get(profile.activeCompanionId);
  const evo = getCompanionEvolutionState(companion);

  return getCompanionBuffsForState(evo);
}
