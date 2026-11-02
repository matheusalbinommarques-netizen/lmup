import { initialBuildings, type CampBuilding } from './campConstruction';
import {
  buildingLevel,
  buildingRules,
  demoWorkers,
  isProducer,
  materialCapacity,
} from './campEconomy';
import { campSprites } from './campSprites';
import { CAMP_WORLD } from './campRegion';
import { placementError } from './campPlacement';
import {
  createCampInventory,
  resourceDetails,
  demoRecipe,
  craftingError,
  type CampInventory,
} from './campWorkshop';
export type CampStock = Omit<
  CampInventory,
  'gold' | 'xp' | 'badges' | 'completedMissions' | 'upgrades'
>;
export type CampState = {
  format: 1;
  worldId: string;
  epoch: string;
  revision: number;
  nextBuilding: number;
  clock: number;
  buildings: CampBuilding[];
  inventory: CampStock;
};
export const MATERIALS = ['wood', 'stone', 'iron'] as const;
export function campVersion(state: CampState) {
  return `${state.epoch}:${state.revision}`;
}
export function storeInventory(inventory: CampInventory): CampStock {
  const {
    wood,
    stone,
    iron,
    trainingSword,
    crafts,
    timber = [],
    minerals = [],
    events = [],
  } = inventory;
  return { wood, stone, iron, trainingSword, crafts, timber, minerals, events };
}
export function viewInventory(state: CampState, gold = 0): CampInventory {
  return { ...state.inventory, gold };
}
export function createCampState(now: number): CampState {
  return {
    format: 1,
    worldId: crypto.randomUUID(),
    epoch: crypto.randomUUID(),
    revision: 0,
    nextBuilding: 3,
    clock: now,
    buildings: structuredClone(initialBuildings),
    inventory: storeInventory(createCampInventory()),
  };
}
export function bootstrapError(
  buildings: CampBuilding[],
  inventory: CampInventory,
) {
  const has = (sprite: CampBuilding['sprite']) =>
    buildings.some((b) => b.sprite === sprite && b.status !== 'site');
  const reserve = {
    wood: has('sawmill') ? 0 : 8,
    stone: (has('sawmill') ? 0 : 4) + (has('quarry') ? 0 : 2),
    iron: has('mine') ? 0 : 3 + (has('quarry') ? 0 : 2),
  };
  const missing = MATERIALS.filter((k) => inventory[k] < reserve[k]);
  return missing.length
    ? 'Esta ação impediria iniciar a produção. Construa primeiro a serraria e reserve materiais para pedreira e mina.'
    : '';
}
export function persistentCraftingError(
  buildings: CampBuilding[],
  forgeId: string,
  inventory: CampInventory,
) {
  return (
    craftingError(buildings, forgeId, inventory) ||
    bootstrapError(buildings, {
      ...inventory,
      wood: inventory.wood - demoRecipe.cost.wood,
      stone: inventory.stone - demoRecipe.cost.stone,
      iron: inventory.iron - demoRecipe.cost.iron,
    })
  );
}
export function validateCampState(value: unknown): asserts value is CampState {
  const fail = () => {
    throw new Error(
      'Acampamento inválido: confira estoque, construções, histórico e trabalhadores.',
    );
  };
  const obj = (v: unknown): v is Record<string, unknown> =>
    !!v &&
    typeof v === 'object' &&
    Object.getPrototypeOf(v) === Object.prototype;
  const integer = (v: unknown) => Number.isSafeInteger(v) && (v as number) >= 0;
  const text = (v: unknown) =>
    typeof v === 'string' && v.length > 0 && v.length <= 500;
  const time = (v: unknown) => integer(v) && (v as number) <= 8640000000000000;
  if (!obj(value)) fail();
  const s = value as CampState;
  if (
    s.format !== 1 ||
    !text(s.worldId) ||
    !text(s.epoch) ||
    !integer(s.revision) ||
    !integer(s.nextBuilding) ||
    s.nextBuilding < 3 ||
    !time(s.clock) ||
    !Array.isArray(s.buildings) ||
    s.buildings.length > 512 ||
    !obj(s.inventory)
  )
    fail();
  if (
    Object.keys(s).some(
      (k) =>
        ![
          'format',
          'worldId',
          'epoch',
          'revision',
          'nextBuilding',
          'clock',
          'buildings',
          'inventory',
        ].includes(k),
    )
  )
    fail();
  const stock = s.inventory;
  if (
    Object.keys(stock).some(
      (k) =>
        ![
          'wood',
          'stone',
          'iron',
          'trainingSword',
          'crafts',
          'timber',
          'minerals',
          'events',
        ].includes(k),
    )
  )
    fail();
  for (const k of [...MATERIALS, 'trainingSword'] as const)
    if (!integer(stock[k])) fail();
  if (
    !Array.isArray(stock.crafts) ||
    !Array.isArray(stock.timber) ||
    !Array.isArray(stock.minerals) ||
    !Array.isArray(stock.events)
  )
    fail();
  if (
    s.buildings.filter((b) => b.sprite === 'hall' && b.status === 'ready')
      .length !== 1
  )
    fail();
  const ids = new Set<string>(),
    workers = new Set<string>();
  for (const b of s.buildings) {
    if (
      !obj(b) ||
      !text(b.id) ||
      ids.has(b.id) ||
      !text(b.name) ||
      !text(b.purpose) ||
      !Object.hasOwn(campSprites, b.sprite) ||
      !['ready', 'building'].includes(b.status) ||
      ![0, 180].includes(b.rotation ?? 0) ||
      !Number.isFinite(b.x) ||
      !Number.isFinite(b.y)
    )
      fail();
    ids.add(b.id);
    const level = buildingLevel(b);
    if (b.level !== undefined && b.level !== level) fail();
    if (!integer(level) || level < 1 || level > buildingRules[b.sprite].max)
      fail();
    if (isProducer(b.sprite) && b.status === 'ready') {
      const p = b.production;
      if (
        !p ||
        !time(p.at) ||
        p.at > s.clock ||
        !integer(p.level) ||
        p.level !== level ||
        !Number.isFinite(p.carry) ||
        p.carry < 0 ||
        p.carry >= 1
      )
        fail();
      if (p!.workerId) {
        if (
          !demoWorkers.some((w) => w.id === p!.workerId) ||
          workers.has(p!.workerId)
        )
          fail();
        workers.add(p!.workerId);
      }
    } else if (b.production) fail();
    const occupied = s.buildings
      .filter((o) => o !== b)
      .map((o) => ({ ...o, ...campSprites[o.sprite]?.footprint }));
    if (
      placementError(
        { ...b, ...campSprites[b.sprite].footprint },
        occupied,
        CAMP_WORLD,
      )
    )
      fail();
  }
  for (const craft of stock.crafts)
    if (!obj(craft) || !text(craft.forgeId) || !text(craft.forgeName)) fail();
  if (stock.crafts.length !== stock.trainingSword) fail();
  for (const row of stock.timber!)
    if (!obj(row) || !text(row.id) || !text(row.name) || !integer(row.amount))
      fail();
  for (const row of stock.minerals!)
    if (
      !obj(row) ||
      !text(row.id) ||
      !text(row.name) ||
      !['stone', 'iron'].includes(row.resource) ||
      !integer(row.amount)
    )
      fail();
  for (const event of stock.events!) {
    if (
      !obj(event) ||
      !text(event.id) ||
      !text(event.name) ||
      !['construction', 'upgrade'].includes(event.kind) ||
      !obj(event.delta) ||
      event.delta.gold !== 0
    )
      fail();
    for (const k of MATERIALS) if (!integer(-event.delta[k])) fail();
  }
  for (const k of MATERIALS)
    if (
      stock[k] > materialCapacity(s.buildings, k) ||
      resourceDetails(viewInventory(s), k).net !== stock[k]
    )
      fail();
}
