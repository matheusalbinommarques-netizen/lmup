import { companionContent } from '$lib/content/world';
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
      {
        stage: 1,
        imagePath: companionContent.wolf.images[0],
        totalFoodRequired: 0,
      },
      {
        stage: 2,
        imagePath: companionContent.wolf.images[1],
        totalFoodRequired: 100,
      },
      {
        stage: 3,
        imagePath: companionContent.wolf.images[2],
        totalFoodRequired: 300,
      },
    ],
  },
  {
    key: 'lich',
    stages: [
      {
        stage: 1,
        imagePath: companionContent.lich.images[0],
        totalFoodRequired: 0,
      },
      {
        stage: 2,
        imagePath: companionContent.lich.images[1],
        totalFoodRequired: 100,
      },
      {
        stage: 3,
        imagePath: companionContent.lich.images[2],
        totalFoodRequired: 300,
      },
    ],
  },
  {
    key: 'dragon',
    stages: [
      {
        stage: 1,
        imagePath: companionContent.dragon.images[0],
        totalFoodRequired: 0,
      },
      {
        stage: 2,
        imagePath: companionContent.dragon.images[1],
        totalFoodRequired: 100,
      },
      {
        stage: 3,
        imagePath: companionContent.dragon.images[2],
        totalFoodRequired: 300,
      },
    ],
  },
  {
    key: 'aberration',
    stages: [
      {
        stage: 1,
        imagePath: companionContent.aberration.images[0],
        totalFoodRequired: 0,
      },
      {
        stage: 2,
        imagePath: companionContent.aberration.images[1],
        totalFoodRequired: 100,
      },
      {
        stage: 3,
        imagePath: companionContent.aberration.images[2],
        totalFoodRequired: 300,
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
  const evoStage = Math.max(
    companion.evolutionStage ?? 1,
    foodInvested >= 300 ? 3 : foodInvested >= 100 ? 2 : 1,
  );

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
      reason:
        | 'not_found'
        | 'max_stage'
        | 'not_enough_food'
        | 'no_config'
        | 'locked';
    };

/**
 * Tenta evoluir um pet específico, gastando COMIDA do perfil.
 * - Respeita a config de estágios (totalFoodRequired)
 * - Atualiza profile.food e Companion.evolutionStage/foodInvested
 */
export function companionAvailable(
  companion: Companion,
  level: number,
): boolean {
  return (
    !!getCompanionEvolutionState(companion) &&
    level >=
      (companion.requiredLevel ??
        { 1: 1, 2: 5, 3: 15, 4: 20 }[companion.id ?? 0] ??
        Infinity)
  );
}
export function careQuote(companion: Companion, amount: number) {
  const state = getCompanionEvolutionState(companion);
  if (!state || !Number.isSafeInteger(amount) || amount <= 0)
    throw new Error('Quantidade de comida inválida.');
  if (!state.nextStage)
    throw new Error('Este companheiro já alcançou a evolução máxima.');
  const cost = Math.min(amount, Math.max(0, 300 - state.foodInvested));
  const invested = state.foodInvested + cost;
  const stage = Math.max(
    state.currentStage.stage,
    invested >= 300 ? 3 : invested >= 100 ? 2 : 1,
  );
  return { cost, invested, stage };
}
export async function selectCompanion(companionId: number) {
  await db.transaction('rw', db.profile, db.companions, async () => {
    const profile = await db.profile.get(1),
      companion = await db.companions.get(companionId);
    if (!profile || !companion || !companionAvailable(companion, profile.level))
      throw new Error('Este companheiro ainda não está disponível.');
    await db.profile.update(1, { activeCompanionId: companionId });
  });
}
export async function feedCompanion(
  companionId: number,
  amount: number,
  options?: { requestId: string; expectedInvested: number },
): Promise<Companion> {
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new Error('Quantidade de comida inválida.');
  if (
    options &&
    (!options.requestId ||
      options.requestId.length > 100 ||
      !Number.isSafeInteger(options.expectedInvested) ||
      options.expectedInvested < 0)
  )
    throw new Error('Reabra a prévia de cuidado.');
  return db.transaction('rw', db.profile, db.companions, async () => {
    const profile = await db.profile.get(1),
      companion = await db.companions.get(companionId);
    if (!profile || !companion || !companionAvailable(companion, profile.level))
      throw new Error('Este companheiro ainda não está disponível.');
    if (
      options &&
      companion.careHistory?.some((entry) => entry.id === options.requestId)
    )
      return companion;
    if (options && (companion.foodInvested ?? 0) !== options.expectedInvested)
      throw new Error(
        'O investimento mudou em outra aba. Confira a nova prévia antes de alimentar.',
      );
    const quote = careQuote(companion, amount);
    if ((profile.food ?? 0) < quote.cost)
      throw new Error('Você não tem comida suficiente.');
    const updated = {
      ...companion,
      foodInvested: quote.invested,
      evolutionStage: quote.stage,
      careHistory: [
        ...(companion.careHistory ?? []),
        {
          id: options?.requestId ?? crypto.randomUUID(),
          occurredAt: new Date().toISOString(),
          amount: quote.cost,
          fromStage: getCompanionEvolutionState(companion)!.currentStage.stage,
          toStage: quote.stage,
        },
      ],
    };
    await db.profile.update(1, {
      food: (profile.food ?? 0) - quote.cost,
      updatedAt: new Date().toISOString(),
    });
    await db.companions.put(updated);
    return updated;
  });
}

export async function evolveCompanion(
  companionId: number,
  expectedStage?: number,
): Promise<EvolveResult> {
  return db.transaction('rw', db.profile, db.companions, async () => {
    const profile = await db.profile.get(1);
    const companion = await db.companions.get(companionId);
    if (!profile || !companion) return { ok: false, reason: 'not_found' };
    const required =
      companion.requiredLevel ??
      { 1: 1, 2: 5, 3: 15, 4: 20 }[companionId] ??
      Infinity;
    if (profile.level < required) return { ok: false, reason: 'locked' };
    const state = getCompanionEvolutionState(companion);
    if (!state) return { ok: false, reason: 'no_config' };
    if (!state.nextStage) return { ok: false, reason: 'max_stage' };
    if (expectedStage != null && state.currentStage.stage !== expectedStage)
      throw new Error('A evolução mudou em outra aba. Confira a nova prévia.');
    const amount = Math.max(
      0,
      state.nextStage.totalFoodRequired - (companion.foodInvested ?? 0),
    );
    if ((profile.food ?? 0) < amount)
      return { ok: false, reason: 'not_enough_food' };
    if (amount > 0) await feedCompanion(companionId, amount);
    else
      await db.companions.update(companionId, {
        evolutionStage: state.nextStage.stage,
      });
    return {
      ok: true,
      profile: (await db.profile.get(1))!,
      companion: (await db.companions.get(companionId))!,
      newStage: state.nextStage.stage,
    };
  });
}

/**
 * Buffs numéricos aplicados pelo companheiro ativo.
 */
export type CompanionBuffs = {
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  foodBonusPercent?: number;
};

/**
 * Mapeia o estado de evolução de um pet em buffs numéricos.
 */
export function getCompanionBuffsForState(
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
      //  - lvl 1 → 5% xp/gold/comida
      //  - lvl 2 → 10% xp/gold/comida
      //  - lvl 3 → 20% xp e 15% gold/comida

      return {
        xpBonusPercent: percent + (stage === 3 ? 5 : 0),
        goldBonusPercent: percent,
        foodBonusPercent: percent,
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
  if (!companion || !companionAvailable(companion, profile.level)) return null;
  const evo = getCompanionEvolutionState(companion);
  return getCompanionBuffsForState(evo);
}

export function companionBonusLabel(companion: Companion): string {
  const buffs = getCompanionBuffsForState(
    getCompanionEvolutionState(companion),
  );
  if (!buffs) return 'Sem bônus disponível';
  return [
    [buffs.xpBonusPercent, 'XP'],
    [buffs.goldBonusPercent, 'Gold'],
    [buffs.foodBonusPercent, 'Comida'],
  ]
    .filter(([value]) => value)
    .map(([value, label]) => '+' + value + '% ' + label)
    .join(' · ');
}
