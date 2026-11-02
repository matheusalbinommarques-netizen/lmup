import { describe, expect, it } from 'vitest';
import {
  initialBuildings,
  completeBuilding,
  type CampBuilding,
} from './campConstruction';
import {
  createCampInventory,
  craftDemoItem,
  summarizeCamp,
  resourceDetails,
  type CampResource,
} from './campWorkshop';

describe('demonstration workshop in memory', () => {
  it('creates independent fictitious inventories', () => {
    const first = createCampInventory();
    first.wood = 0;
    expect(createCampInventory()).toEqual({
      wood: 12,
      stone: 8,
      iron: 9,
      gold: 20,
      trainingSword: 0,
      crafts: [],
    });
  });
  it('consumes exactly one recipe and credits exactly one item without mutating its input', () => {
    const before = createCampInventory();
    const buildings = structuredClone(initialBuildings);
    const result = craftDemoItem(buildings, 'forge', before);
    expect(result.ok).toBe(true);
    expect(result.inventory).toEqual({
      wood: 10,
      stone: 7,
      iron: 6,
      gold: 20,
      trainingSword: 1,
      crafts: [{ forgeId: 'forge', forgeName: 'Forja' }],
    });
    expect(before).toEqual(createCampInventory());
    expect(buildings).toEqual(initialBuildings);
  });
  it.each<CampResource>(['wood', 'stone', 'iron'])(
    'rejects insufficient %s with no partial deduction or produced item',
    (resource) => {
      const before = { ...createCampInventory(), [resource]: 0 };
      const result = craftDemoItem(initialBuildings, 'forge', before);
      expect(result.ok).toBe(false);
      expect(result.inventory).toBe(before);
      expect(result.error).toContain('Recursos insuficientes');
      expect(before.trainingSword).toBe(0);
    },
  );
  it.each(['unknown', 'hall', 'store'])(
    'rejects a non-forge target %s without changing stock',
    (id) => {
      const before = createCampInventory();
      expect(craftDemoItem(initialBuildings, id, before)).toMatchObject({
        ok: false,
        inventory: before,
      });
      expect(before).toEqual(createCampInventory());
    },
  );
  it('blocks an unfinished forge, then permits crafting after completion', () => {
    const building: CampBuilding = {
      ...initialBuildings[1],
      id: 'new',
      status: 'building',
    };
    const buildings = [...initialBuildings, building];
    const inventory = createCampInventory();
    const blocked = craftDemoItem(buildings, 'new', inventory);
    expect(blocked).toMatchObject({
      ok: false,
      error: 'Conclua a construção para fabricar.',
    });
    expect(blocked.inventory).toBe(inventory);
    expect(
      craftDemoItem(completeBuilding(buildings, 'new'), 'new', inventory).ok,
    ).toBe(true);
    expect(building.status).toBe('building');
  });
  it('shares the stock across forges and repeated attempts cannot overspend or duplicate output', () => {
    let inventory = createCampInventory();
    for (const id of ['forge', 'forge-copy', 'forge']) {
      const result = craftDemoItem(initialBuildings, id, inventory);
      expect(result.ok).toBe(true);
      inventory = result.inventory;
    }
    expect(inventory).toEqual({
      wood: 6,
      stone: 5,
      iron: 0,
      gold: 20,
      trainingSword: 3,
      crafts: [
        { forgeId: 'forge', forgeName: 'Forja' },
        { forgeId: 'forge-copy', forgeName: 'Forja 2' },
        { forgeId: 'forge', forgeName: 'Forja' },
      ],
    });
    for (let i = 0; i < 5; i++) {
      const blocked = craftDemoItem(initialBuildings, 'forge-copy', inventory);
      expect(blocked.ok).toBe(false);
      expect(blocked.inventory).toBe(inventory);
    }
  });
  it('accepts exact recipe resources and reaches zero without negative balances', () => {
    const inventory = {
      ...createCampInventory(),
      wood: 2,
      stone: 1,
      iron: 3,
      trainingSword: 4,
    };
    expect(
      craftDemoItem(initialBuildings, 'forge', inventory).inventory,
    ).toEqual({
      wood: 0,
      stone: 0,
      iron: 0,
      gold: 20,
      trainingSword: 5,
      crafts: [{ forgeId: 'forge', forgeName: 'Forja' }],
    });
  });
  it('derives resource totals and per-building consumption from successful crafts only', () => {
    let inventory = createCampInventory();
    inventory = craftDemoItem(initialBuildings, 'forge', inventory).inventory;
    inventory = craftDemoItem(
      initialBuildings,
      'forge-copy',
      inventory,
    ).inventory;
    expect(resourceDetails(inventory, 'wood')).toEqual({
      stock: 8,
      gains: 12,
      produced: 0,
      consumed: 4,
      net: 8,
      origins: [
        { id: 'forge', name: 'Forja', consumed: 2 },
        { id: 'forge-copy', name: 'Forja 2', consumed: 2 },
      ],
    });
    expect(resourceDetails(inventory, 'gold')).toEqual({
      stock: 20,
      gains: 20,
      produced: 0,
      consumed: 0,
      net: 20,
      origins: [],
    });
    expect(resourceDetails(inventory, 'iron')).toMatchObject({
      stock: 3,
      consumed: 6,
      net: 3,
      produced: 0,
    });
    const blocked = craftDemoItem(initialBuildings, 'hall', inventory);
    expect(resourceDetails(blocked.inventory, 'wood')).toEqual(
      resourceDetails(inventory, 'wood'),
    );
  });
  it('updates counts by type and status after adding and completing a building', () => {
    const building: CampBuilding = {
      ...initialBuildings[1],
      id: 'new',
      status: 'building',
    };
    const buildings = [...initialBuildings, building];
    expect(summarizeCamp(buildings)).toEqual([
      { type: 'hall', name: 'Salão', ready: 1, building: 0, total: 1 },
      { type: 'store', name: 'Armazém', ready: 1, building: 0, total: 1 },
      { type: 'forge', name: 'Forja', ready: 2, building: 1, total: 3 },
      { type: 'sawmill', name: 'Serraria', ready: 0, building: 0, total: 0 },
      { type: 'quarry', name: 'Pedreira', ready: 0, building: 0, total: 0 },
      { type: 'mine', name: 'Mina', ready: 0, building: 0, total: 0 },
    ]);
    expect(summarizeCamp(completeBuilding(buildings, 'new'))[2]).toMatchObject({
      ready: 3,
      building: 0,
      total: 3,
    });
    expect(summarizeCamp([]).every((row) => row.total === 0)).toBe(true);
  });
});
