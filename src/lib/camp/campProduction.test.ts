import { describe, expect, it } from 'vitest';
import {
  initialBuildings,
  completeBuilding,
  type CampBuilding,
} from './campConstruction';
import { createCampInventory, resourceDetails } from './campWorkshop';
import {
  settleProduction,
  producerRate,
  productionRate,
} from './campProduction';
import {
  producerRules,
  materialCapacity,
  assignWorker,
  upgradeBuilding,
} from './campEconomy';
const mill = (
  type: 'sawmill' | 'quarry' | 'mine',
  id: string = type,
): CampBuilding => ({
  id,
  name: type,
  purpose: 'Test',
  x: 1008,
  y: 976,
  sprite: type,
  status: 'ready',
  production: { level: 1, workerId: null, at: 0, carry: 0 },
});
const map = (...producers: CampBuilding[]) => [
  ...initialBuildings,
  ...producers,
];
describe('shared elapsed-time production', () => {
  it.each(['sawmill', 'quarry', 'mine'] as const)(
    'produces %s without workers, preserves gold and cannot duplicate a settled interval',
    (type) => {
      const resource = producerRules[type].resource;
      const inventory = createCampInventory();
      const result = settleProduction(map(mill(type)), inventory, 40000);
      expect(result.inventory[resource]).toBe(
        inventory[resource] + { sawmill: 4, quarry: 2, mine: 1 }[type],
      );
      expect(result.inventory.gold).toBe(20);
      expect(
        settleProduction(result.buildings, result.inventory, 40000).inventory,
      ).toBe(result.inventory);
      expect(resourceDetails(result.inventory, resource).net).toBe(
        result.inventory[resource],
      );
      expect(inventory).toEqual(createCampInventory());
    },
  );
  it('starts only on completion and preserves fractional elapsed time', () => {
    const site = {
      ...mill('sawmill'),
      status: 'building' as const,
      production: undefined,
    };
    expect(
      settleProduction(map(site), createCampInventory(), 50000).inventory.wood,
    ).toBe(12);
    const ready = completeBuilding(map(site), site.id, 50000);
    const first = settleProduction(ready, createCampInventory(), 55000);
    expect(first.inventory.wood).toBe(12);
    const second = settleProduction(first.buildings, first.inventory, 60000);
    expect(second.inventory.wood).toBe(13);
    expect(
      settleProduction(second.buildings, second.inventory, 40000).inventory
        .wood,
    ).toBe(13);
  });
  it('caps every material independently, catches up absence and discards overflow', () => {
    const result = settleProduction(
      map(mill('sawmill'), mill('quarry'), mill('mine')),
      createCampInventory(),
      30 * 86400000,
    );
    expect(result.inventory).toMatchObject({
      wood: 100,
      stone: 100,
      iron: 100,
      gold: 20,
    });
    expect(productionRate(result.buildings, result.inventory, 'wood')).toBe(0);
    const spent = { ...result.inventory, wood: 90 };
    expect(
      settleProduction(result.buildings, spent, 30 * 86400000).inventory.wood,
    ).toBe(90);
    expect(
      settleProduction(result.buildings, spent, 30 * 86400000 + 10000).inventory
        .wood,
    ).toBe(91);
  });
  it('multiple producers share one capacity without banking duplicate output', () => {
    const result = settleProduction(
      map(mill('sawmill', 'a'), mill('sawmill', 'b')),
      { ...createCampInventory(), wood: 98 },
      60000,
    );
    expect(result.inventory.wood).toBe(100);
    expect(
      result.inventory.timber?.reduce((sum, entry) => sum + entry.amount, 0),
    ).toBe(2);
    expect(
      settleProduction(result.buildings, result.inventory, 60000).inventory,
    ).toBe(result.inventory);
  });
  it('worker reassignment doubles only future production and is exclusive', () => {
    let buildings = map(mill('sawmill', 'a'), mill('quarry', 'b'));
    let result = settleProduction(buildings, createCampInventory(), 10000);
    buildings = assignWorker(result.buildings, 'a', 'lia').buildings;
    expect(producerRate(buildings.find((b) => b.id === 'a')!)).toBe(720);
    expect(assignWorker(buildings, 'b', 'lia').error).not.toBe('');
    result = settleProduction(buildings, result.inventory, 20000);
    expect(result.inventory.wood).toBe(15);
    buildings = assignWorker(result.buildings, 'a', null).buildings;
    buildings = assignWorker(buildings, 'b', 'lia').buildings;
    expect(producerRate(buildings.find((b) => b.id === 'a')!)).toBe(360);
    expect(producerRate(buildings.find((b) => b.id === 'b')!)).toBe(360);
    expect(assignWorker(buildings, 'a', 'unknown').error).not.toBe('');
  });
  it('warehouse levels increase actual shared capacity and producers never increase storage', () => {
    const inventory = {
      ...createCampInventory(),
      wood: 90,
      stone: 90,
      iron: 90,
    };
    const upgrade = upgradeBuilding(map(mill('sawmill')), 'store', inventory);
    expect(upgrade.error).toBe('');
    for (const resource of ['wood', 'stone', 'iron'] as const)
      expect(materialCapacity(upgrade.buildings, resource)).toBe(200);
    expect(materialCapacity(upgrade.buildings, 'gold')).toBe(Infinity);
    const grown = settleProduction(
      upgrade.buildings,
      upgrade.inventory,
      7200000,
    );
    expect(grown.inventory.wood).toBe(200);
    expect(materialCapacity(map(mill('sawmill'), mill('quarry')), 'wood')).toBe(
      100,
    );
  });
});
