import type { CampBuilding } from './campConstruction';
import type { CampInventory, CampResource } from './campWorkshop';
import {
  producerRules,
  isProducer,
  buildingLevel,
  materialCapacity,
} from './campEconomy';

export function producerRate(building: CampBuilding): number {
  if (
    !isProducer(building.sprite) ||
    building.status !== 'ready' ||
    !building.production
  )
    return 0;
  return (
    producerRules[building.sprite].rate *
    (1 + 0.5 * (buildingLevel(building) - 1)) *
    (building.production.workerId ? 2 : 1)
  );
}
export function productionRate(
  buildings: CampBuilding[],
  inventory: CampInventory,
  resource: CampResource,
): number {
  if (
    resource === 'gold' ||
    inventory[resource] >= materialCapacity(buildings, resource)
  )
    return 0;
  return buildings.reduce(
    (sum, b) =>
      sum +
      (isProducer(b.sprite) && producerRules[b.sprite].resource === resource
        ? producerRate(b)
        : 0),
    0,
  );
}
// Settle each interval once. Overflow is discarded, never banked.
export function settleProduction(
  buildings: CampBuilding[],
  inventory: CampInventory,
  now: number,
) {
  let stock = inventory;
  const updated = buildings.map((building) => {
    const rate = producerRate(building),
      state = building.production;
    if (!rate || !state || !isProducer(building.sprite) || now <= state.at)
      return building;
    const resource = producerRules[building.sprite].resource;
    const available = Math.max(
      0,
      materialCapacity(buildings, resource) - stock[resource],
    );
    const generated = state.carry + ((now - state.at) * rate) / 3_600_000;
    const credited = Math.min(available, Math.floor(generated));
    if (credited) {
      if (resource === 'wood') {
        const records = stock.timber ?? [],
          previous = records.find((r) => r.id === building.id);
        const record = {
          id: building.id,
          name: building.name,
          amount: (previous?.amount ?? 0) + credited,
        };
        stock = {
          ...stock,
          wood: stock.wood + credited,
          timber: previous
            ? records.map((r) => (r.id === building.id ? record : r))
            : [...records, record],
        };
      } else {
        const records = stock.minerals ?? [],
          previous = records.find((r) => r.id === building.id);
        const record = {
          id: building.id,
          name: building.name,
          resource,
          amount: (previous?.amount ?? 0) + credited,
        };
        stock = {
          ...stock,
          [resource]: stock[resource] + credited,
          minerals: previous
            ? records.map((r) => (r.id === building.id ? record : r))
            : [...records, record],
        };
      }
    }
    return {
      ...building,
      production: {
        ...state,
        at: now,
        carry: generated >= available ? 0 : generated - Math.floor(generated),
      },
    };
  });
  return { buildings: updated, inventory: stock };
}
