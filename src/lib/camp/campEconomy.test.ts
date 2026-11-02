import { describe, expect, it } from 'vitest';
import {
  initialBuildings,
  completeBuilding,
  removeBuilding,
  moveBuilding,
  type CampBuilding,
} from './campConstruction';
import {
  createCampInventory,
  resourceDetails,
  craftDemoItem,
} from './campWorkshop';
import {
  buildingRules,
  purchaseConstruction,
  missingResources,
  upgradeBuilding,
  assignWorker,
  completeDemoMission,
  missionError,
  materialCapacity,
} from './campEconomy';
import { producerRate } from './campProduction';
const world = { width: 1850, height: 1400 };
const site: CampBuilding = {
  id: 'new',
  name: 'Serraria',
  purpose: 'Teste',
  x: 1008,
  y: 976,
  sprite: 'sawmill',
  status: 'building',
};
const rich = () => ({
  ...createCampInventory(),
  wood: 99,
  stone: 99,
  iron: 99,
});
describe('integrated demo economy', () => {
  it('charges exactly once on valid confirmation and rejects duplicate IDs', () => {
    const before = createCampInventory();
    const result = purchaseConstruction(initialBuildings, before, site, world);
    expect(result.error).toBe('');
    expect(result.inventory).toMatchObject({ wood: 4, stone: 4, iron: 9 });
    expect(before).toEqual(createCampInventory());
    const duplicate = purchaseConstruction(
      result.buildings,
      result.inventory,
      site,
      world,
    );
    expect(duplicate.error).toContain('já');
    expect(duplicate.inventory).toBe(result.inventory);
    expect(result.inventory.events).toHaveLength(1);
    expect(resourceDetails(result.inventory, 'wood')).toMatchObject({
      consumed: 8,
      stock: 4,
      net: 4,
    });
  });
  it.each([
    { x: 0, y: 0 },
    { x: 830, y: 617 },
  ])('rejects invalid footprint %j without any debit', (point) => {
    const inventory = rich();
    const result = purchaseConstruction(
      initialBuildings,
      inventory,
      { ...site, ...point },
      world,
    );
    expect(result.error).not.toBe('');
    expect(result.inventory).toBe(inventory);
    expect(result.buildings).toBe(initialBuildings);
  });
  it.each(['wood', 'stone'] as const)(
    'rejects insufficient %s with exact shortfall',
    (resource) => {
      const inventory = { ...createCampInventory(), [resource]: 0 };
      const result = purchaseConstruction(
        initialBuildings,
        inventory,
        site,
        world,
      );
      expect(result.error).toContain(
        `faltam ${buildingRules.sawmill.build[resource]}`,
      );
      expect(result.inventory).toBe(inventory);
    },
  );
  it('level 2 is worker independent, level 3 mine requires a worker, and max level cannot debit again', () => {
    let buildings = completeBuilding([{ ...site, sprite: 'mine' }], site.id, 0);
    let result = upgradeBuilding(buildings, site.id, rich());
    expect(result.error).toBe('');
    expect(result.buildings[0].production?.workerId).toBe(null);
    expect(producerRate(result.buildings[0])).toBe(135);
    const blocked = upgradeBuilding(
      result.buildings,
      site.id,
      result.inventory,
    );
    expect(blocked.error).toContain('trabalhador');
    expect(blocked.inventory).toBe(result.inventory);
    buildings = assignWorker(result.buildings, site.id, 'lia').buildings;
    result = upgradeBuilding(buildings, site.id, result.inventory);
    expect(result.error).toBe('');
    expect(result.buildings[0].production?.level).toBe(3);
    expect(producerRate(result.buildings[0])).toBe(360);
    const again = upgradeBuilding(result.buildings, site.id, result.inventory);
    expect(again.error).toContain('máximo');
    expect(again.inventory).toBe(result.inventory);
    expect(result.inventory.events).toHaveLength(2);
  });
  it('warehouse max and exact missing upgrade resources are enforced', () => {
    const noWood = { ...rich(), wood: 0 };
    expect(upgradeBuilding(initialBuildings, 'store', noWood).error).toContain(
      'faltam 20',
    );
    const level2 = upgradeBuilding(initialBuildings, 'store', rich());
    const level3 = upgradeBuilding(level2.buildings, 'store', level2.inventory);
    expect(level3.error).toBe('');
    expect(materialCapacity(level3.buildings, 'stone')).toBe(350);
    expect(
      upgradeBuilding(level3.buildings, 'store', level3.inventory).inventory,
    ).toBe(level3.inventory);
    expect(missingResources(rich(), buildingRules.forge.build)).toBe('');
  });
  it('removal never refunds resources and frees the assigned worker; moves preserve assignment', () => {
    const ready = completeBuilding(
      [{ ...site }, { ...site, id: 'other', x: 1400 }],
      site.id,
      0,
    );
    const assigned = assignWorker(ready, site.id, 'lia').buildings;
    const moved = moveBuilding(assigned, site.id, { x: 1200, y: 1008 }, 180);
    expect(moved[0].production?.workerId).toBe('lia');
    const removed = removeBuilding(moved, site.id);
    const completed = completeBuilding(removed, 'other', 0);
    expect(assignWorker(completed, 'other', 'lia').error).toBe('');
    const purchase = purchaseConstruction(
      initialBuildings,
      createCampInventory(),
      site,
      world,
    );
    removeBuilding(purchase.buildings, site.id);
    expect(purchase.inventory.wood).toBe(4);
  });
  it('mission rewards are unique, gold/XP stay separate and RPG consumes the crafted item', () => {
    const explored = completeDemoMission(
      initialBuildings,
      createCampInventory(),
      'explore',
    );
    expect(explored.inventory).toMatchObject({
      wood: 42,
      stone: 28,
      iron: 19,
      gold: 24,
      xp: 10,
    });
    expect(
      completeDemoMission(initialBuildings, explored.inventory, 'explore')
        .inventory,
    ).toBe(explored.inventory);
    expect(missionError(explored.inventory, 'rpg')).toContain('espada');
    const crafted = craftDemoItem(
      initialBuildings,
      'forge',
      explored.inventory,
    );
    const rpg = completeDemoMission(initialBuildings, crafted.inventory, 'rpg');
    expect(rpg.inventory).toMatchObject({
      trainingSword: 0,
      badges: 1,
      gold: 36,
      xp: 35,
    });
    expect(
      completeDemoMission(initialBuildings, rpg.inventory, 'rpg').inventory,
    ).toBe(rpg.inventory);
    const life = completeDemoMission(initialBuildings, rpg.inventory, 'life');
    expect(life.inventory).toMatchObject({ gold: 51, xp: 75 });
    expect(resourceDetails(life.inventory, 'gold')).toMatchObject({
      stock: 51,
      gains: 51,
      produced: 0,
    });
  });
  it('mission material rewards respect each cap and record discarded overflow without later recovery', () => {
    const before = { ...createCampInventory(), wood: 99, stone: 100, iron: 95 };
    const result = completeDemoMission(initialBuildings, before, 'explore');
    expect(result.inventory).toMatchObject({
      wood: 100,
      stone: 100,
      iron: 100,
      gold: 24,
    });
    expect(result.inventory.events?.[0]).toMatchObject({
      delta: { wood: 1, stone: 0, iron: 5, gold: 4 },
      discarded: { wood: 29, stone: 20, iron: 5, gold: 0 },
    });
    const spent = { ...result.inventory, wood: 50 };
    expect(
      completeDemoMission(initialBuildings, spent, 'explore').inventory,
    ).toBe(spent);
  });
});
