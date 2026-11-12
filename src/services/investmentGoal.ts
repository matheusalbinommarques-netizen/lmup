import {
  db,
  type Companion,
  type InventoryItem,
  type OwnedShopItem,
  type Profile,
} from './db';
import { SHOP_ITEMS, getShopItemById } from '$lib/shop/types';
import { collectionSpace } from './shopService';
import {
  companionRequiredLevel,
  getCompanionEvolutionState,
} from './companionService';
import { SETTLEMENT_PRICE } from './campSettlementService';

/**
 * A chosen short-term investment. It is only a pointer: no gold is reserved,
 * nothing is blocked, and the distance is always recomputed from real balances.
 */
export type InvestmentGoal = { id: string; chosenAt: string };

const GOAL_ID = /^(shop:\d{1,6}|companion:\d{1,6}:\d{1,2}|camp:residence)$/;
export function isInvestmentGoal(value: unknown): value is InvestmentGoal {
  if (!value || typeof value !== 'object') return false;
  const goal = value as Record<string, unknown>;
  return (
    Object.keys(goal).every((key) => key === 'id' || key === 'chosenAt') &&
    typeof goal.id === 'string' &&
    GOAL_ID.test(goal.id) &&
    typeof goal.chosenAt === 'string' &&
    goal.chosenAt.length <= 40 &&
    !Number.isNaN(Date.parse(goal.chosenAt))
  );
}

export type GoalSnapshot = {
  profile?: Profile;
  owned: OwnedShopItem[];
  inventory: InventoryItem[];
  companions: Companion[];
};
export type GoalResource = {
  key: 'gold' | 'food';
  label: string;
  have: number;
  need: number;
};
export type GoalCondition = { key: string; label: string; met: boolean };
export type GoalOption = {
  id: string;
  kind: 'shop' | 'companion' | 'camp';
  title: string;
  href: string;
  resources: GoalResource[];
  conditions: GoalCondition[];
};
export type GoalStatus = GoalOption & {
  state: 'progress' | 'ready' | 'achieved' | 'unavailable';
  /** Share of the resource cost already held (0–100). Never counts conditions. */
  percent: number;
  missing: string;
};

const balance = (value: number | undefined) =>
  Number.isSafeInteger(value) && value! > 0 ? value! : 0;
const resource = (
  key: GoalResource['key'],
  need: number,
  profile: Profile | undefined,
): GoalResource => ({
  key,
  label: key === 'gold' ? 'Ouro' : 'Comida',
  need,
  have: balance(key === 'gold' ? profile?.gold : profile?.food),
});

function shopOption(itemId: number, data: GoalSnapshot): GoalOption | null {
  const item = getShopItemById(itemId);
  if (!item || item.status !== 'available') return null;
  const space = collectionSpace(data.owned, data.inventory);
  return {
    id: `shop:${item.id}`,
    kind: 'shop',
    title: item.name,
    href: '/loja',
    resources: [resource('gold', item.price, data.profile)],
    conditions:
      item.slot === 'bag'
        ? []
        : [
            {
              key: 'capacity',
              label: 'Espaço livre na coleção',
              met: space.used < space.limit,
            },
          ],
  };
}
function companionOption(
  companion: Companion,
  stage: number,
  data: GoalSnapshot,
): GoalOption | null {
  const state = getCompanionEvolutionState(companion);
  const target = state?.stages.find((row) => row.stage === stage);
  if (!state || !target) return null;
  const level = companionRequiredLevel(companion);
  return {
    id: `companion:${companion.id}:${stage}`,
    kind: 'companion',
    title: `${companion.name} · estágio ${stage}`,
    href: '/acampamento',
    resources: [
      resource(
        'food',
        Math.max(0, target.totalFoodRequired - state.foodInvested),
        data.profile,
      ),
    ],
    conditions: Number.isFinite(level)
      ? [
          {
            key: 'level',
            label: `Nível ${level} do personagem`,
            met: (data.profile?.level ?? 1) >= level,
          },
        ]
      : [],
  };
}
function campOption(data: GoalSnapshot): GoalOption {
  return {
    id: 'camp:residence',
    kind: 'camp',
    title: 'Construir o acampamento',
    href: '/acampamento',
    resources: [resource('gold', SETTLEMENT_PRICE, data.profile)],
    conditions: [
      {
        key: 'caretaker',
        label: 'Conversar com o caseiro',
        met: !!data.profile?.campSettlement?.caretakerMet,
      },
    ],
  };
}

/** Investments that can still be made, cheapest first inside each group. */
export function listGoalOptions(data: GoalSnapshot): GoalOption[] {
  const options: GoalOption[] = [];
  if (!data.profile?.campSettlement?.residenceBuilt)
    options.push(campOption(data));
  for (const companion of data.companions) {
    const next = getCompanionEvolutionState(companion)?.nextStage;
    const option = next && companionOption(companion, next.stage, data);
    if (option) options.push(option);
  }
  const owned = new Set(data.owned.map((row) => row.itemId));
  for (const item of [...SHOP_ITEMS].sort((a, b) => a.price - b.price)) {
    const option = !owned.has(item.id) && shopOption(item.id, data);
    if (option) options.push(option);
  }
  return options;
}

function achieved(id: string, data: GoalSnapshot) {
  const [kind, first, second] = id.split(':');
  if (kind === 'shop')
    return data.owned.some((row) => row.itemId === Number(first));
  if (kind === 'camp') return !!data.profile?.campSettlement?.residenceBuilt;
  const companion = data.companions.find((row) => row.id === Number(first));
  const state = getCompanionEvolutionState(companion);
  return !!state && state.currentStage.stage >= Number(second);
}
function optionFor(id: string, data: GoalSnapshot): GoalOption | null {
  const [kind, first, second] = id.split(':');
  if (kind === 'shop') return shopOption(Number(first), data);
  if (kind === 'camp') return campOption(data);
  const companion = data.companions.find((row) => row.id === Number(first));
  return companion ? companionOption(companion, Number(second), data) : null;
}

export function percentOf(resources: GoalResource[]) {
  const need = resources.reduce((sum, row) => sum + row.need, 0);
  if (!need) return 100;
  const have = resources.reduce(
    (sum, row) => sum + Math.min(row.have, row.need),
    0,
  );
  return Math.floor((have / need) * 100);
}
export function missingText(
  resources: GoalResource[],
  conditions: GoalCondition[],
) {
  const parts = [
    ...resources
      .filter((row) => row.have < row.need)
      .map((row) => `${row.need - row.have} ${row.label}`),
    ...conditions.filter((row) => !row.met).map((row) => row.label),
  ];
  return parts.length ? `Falta: ${parts.join(' · ')}` : '';
}

/** Distance to the chosen goal, from current balances only. */
export function evaluateGoal(
  goal: InvestmentGoal | undefined,
  data: GoalSnapshot,
): GoalStatus | null {
  if (!goal || !isInvestmentGoal(goal)) return null;
  const option = optionFor(goal.id, data);
  if (achieved(goal.id, data))
    return {
      ...(option ?? {
        id: goal.id,
        kind: goal.id.split(':')[0] as GoalOption['kind'],
        title: 'Objetivo',
        href: '/',
        resources: [],
        conditions: [],
      }),
      state: 'achieved',
      percent: 100,
      missing: '',
    };
  if (!option)
    return {
      id: goal.id,
      kind: goal.id.split(':')[0] as GoalOption['kind'],
      title: 'Objetivo indisponível',
      href: '/',
      resources: [],
      conditions: [],
      state: 'unavailable',
      percent: 0,
      missing: '',
    };
  const missing = missingText(option.resources, option.conditions);
  return {
    ...option,
    state: missing ? 'progress' : 'ready',
    percent: percentOf(option.resources),
    missing,
  };
}

/**
 * Stores or clears the goal. `expected` protects against a choice made in
 * another tab meanwhile. Balances, items and receipts are never touched.
 */
export async function chooseInvestmentGoal(
  id: string | null,
  expected: string | null,
) {
  if (id !== null && !GOAL_ID.test(id))
    throw new Error('Escolha um objetivo da lista.');
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw new Error('Abra sua jornada primeiro.');
    const current = profile.investmentGoal?.id ?? null;
    if (current === id) return profile.investmentGoal;
    if (current !== expected)
      throw new Error('Seu objetivo mudou em outra aba. Confira a escolha.');
    const goal = id ? { id, chosenAt: new Date().toISOString() } : undefined;
    await db.profile.update(1, { investmentGoal: goal });
    return goal;
  });
}
