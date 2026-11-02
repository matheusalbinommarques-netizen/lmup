import type { CampBuilding } from './campConstruction';

export const resourceNames = {
  wood: 'Madeira',
  stone: 'Pedra',
  iron: 'Ferro',
  gold: 'Ouro',
};
export type CampResource = keyof typeof resourceNames;
export type CampInventory = Record<CampResource, number> & {
  trainingSword: number;
  crafts: { forgeId: string; forgeName: string }[];
  timber?: { id: string; name: string; amount: number }[];
  minerals?: {
    id: string;
    name: string;
    amount: number;
    resource: 'stone' | 'iron';
  }[];
  events?: {
    id: string;
    name: string;
    kind: 'construction' | 'upgrade' | 'mission';
    delta: Record<CampResource, number>;
    discarded?: Record<CampResource, number>;
    xp?: number;
  }[];
  completedMissions?: string[];
  xp?: number;
  badges?: number;
  upgrades?: { id: string; name: string; cost: Record<CampResource, number> }[];
};
export const demoRecipe = {
  name: 'Espada de treino',
  cost: { wood: 2, stone: 1, iron: 3, gold: 0 } satisfies Record<
    CampResource,
    number
  >,
};
export function createCampInventory(): CampInventory {
  return {
    wood: 12,
    stone: 8,
    iron: 9,
    gold: 20,
    trainingSword: 0,
    crafts: [],
  };
}
export function craftingError(
  buildings: CampBuilding[],
  forgeId: string,
  inventory: CampInventory,
): string {
  const forge = buildings.find((building) => building.id === forgeId);
  if (!forge || forge.sprite !== 'forge') return 'Selecione uma forja.';
  if (forge.status !== 'ready') return 'Conclua a construção para fabricar.';
  const missing = (Object.keys(demoRecipe.cost) as CampResource[])
    .filter((resource) => inventory[resource] < demoRecipe.cost[resource])
    .map(
      (resource) =>
        `${resourceNames[resource].toLowerCase()} (${inventory[resource]}/${demoRecipe.cost[resource]})`,
    );
  return missing.length ? `Recursos insuficientes: ${missing.join(', ')}.` : '';
}
// A single synchronous transition: failed attempts keep the original inventory intact.
export function craftDemoItem(
  buildings: CampBuilding[],
  forgeId: string,
  inventory: CampInventory,
) {
  const error = craftingError(buildings, forgeId, inventory);
  if (error) return { ok: false as const, inventory, error };
  return {
    ok: true as const,
    inventory: {
      ...inventory,
      wood: inventory.wood - demoRecipe.cost.wood,
      stone: inventory.stone - demoRecipe.cost.stone,
      iron: inventory.iron - demoRecipe.cost.iron,
      trainingSword: inventory.trainingSword + 1,
      crafts: [
        ...inventory.crafts,
        {
          forgeId,
          forgeName: buildings.find((building) => building.id === forgeId)!
            .name,
        },
      ],
    },
    error: '',
  };
}
// Derived from the same stock and successful craft events, never component counters.
export function resourceDetails(
  inventory: CampInventory,
  resource: CampResource,
) {
  const gains =
    createCampInventory()[resource] +
    (inventory.events ?? []).reduce(
      (sum, event) => sum + Math.max(0, event.delta[resource]),
      0,
    );
  const cost = demoRecipe.cost[resource];
  const origins = new Map<
    string,
    { id: string; name: string; consumed: number }
  >();
  if (cost)
    for (const craft of inventory.crafts) {
      const origin = origins.get(craft.forgeId) ?? {
        id: craft.forgeId,
        name: craft.forgeName,
        consumed: 0,
      };
      origins.set(craft.forgeId, {
        ...origin,
        consumed: origin.consumed + cost,
      });
    }
  for (const upgrade of inventory.upgrades ?? []) {
    const amount = upgrade.cost[resource];
    if (!amount) continue;
    const origin = origins.get(upgrade.id) ?? {
      id: upgrade.id,
      name: upgrade.name,
      consumed: 0,
    };
    origins.set(upgrade.id, { ...origin, consumed: origin.consumed + amount });
  }
  for (const event of inventory.events ?? []) {
    const amount = -event.delta[resource];
    if (amount <= 0) continue;
    const origin = origins.get(event.id) ?? {
      id: event.id,
      name: event.name,
      consumed: 0,
    };
    origins.set(event.id, { ...origin, consumed: origin.consumed + amount });
  }
  const consumed = [...origins.values()].reduce(
    (sum, origin) => sum + origin.consumed,
    0,
  );
  const produced =
    resource === 'wood'
      ? (inventory.timber ?? []).reduce((sum, origin) => sum + origin.amount, 0)
      : (inventory.minerals ?? [])
          .filter((entry) => entry.resource === resource)
          .reduce((sum, entry) => sum + entry.amount, 0);
  return {
    stock: inventory[resource],
    gains,
    produced,
    consumed,
    net: gains + produced - consumed,
    origins: [...origins.values()],
  };
}
export function summarizeCamp(buildings: CampBuilding[]) {
  const labels = {
    hall: 'Salão',
    store: 'Armazém',
    forge: 'Forja',
    sawmill: 'Serraria',
    quarry: 'Pedreira',
    mine: 'Mina',
  };
  return (Object.keys(labels) as (keyof typeof labels)[]).map((type) => {
    const matching = buildings.filter(
      (building) => building.sprite === type && building.status !== 'site',
    );
    return {
      type,
      name: labels[type],
      ready: matching.filter((building) => building.status === 'ready').length,
      building: matching.filter((building) => building.status === 'building')
        .length,
      total: matching.length,
    };
  });
}
