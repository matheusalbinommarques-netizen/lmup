import type { CampBuilding } from './campConstruction';
import { campSprites } from './campSprites';
import { placementError } from './campPlacement';
import {
  resourceNames,
  type CampInventory,
  type CampResource,
} from './campWorkshop';

export type Material = Exclude<CampResource, 'gold'>;
export type Cost = Record<CampResource, number>;
const cost = (wood: number, stone: number, iron: number): Cost => ({
  wood,
  stone,
  iron,
  gold: 0,
});
// One table for construction, upgrades, rates and unlock requirements.
export const buildingRules = {
  hall: { name: 'Salão', build: cost(0, 0, 0), upgrades: [] as Cost[], max: 1 },
  forge: {
    name: 'Forja',
    build: cost(6, 4, 3),
    upgrades: [] as Cost[],
    max: 1,
  },
  sawmill: {
    name: 'Serraria',
    build: cost(8, 4, 0),
    upgrades: [cost(10, 5, 2)],
    max: 2,
  },
  quarry: {
    name: 'Pedreira',
    build: cost(6, 2, 2),
    upgrades: [cost(10, 8, 3)],
    max: 2,
  },
  mine: {
    name: 'Mina',
    build: cost(8, 6, 3),
    upgrades: [cost(12, 10, 5), cost(20, 15, 8)],
    max: 3,
  },
  store: {
    name: 'Armazém',
    build: cost(10, 6, 2),
    upgrades: [cost(20, 15, 5), cost(40, 30, 15)],
    max: 3,
  },
};
export const producerRules = {
  sawmill: { resource: 'wood' as const, rate: 360 },
  quarry: { resource: 'stone' as const, rate: 180 },
  mine: { resource: 'iron' as const, rate: 90 },
};
export const demoWorkers = [
  { id: 'lia', name: 'Lia' },
  { id: 'bento', name: 'Bento' },
  { id: 'iara', name: 'Iara' },
];
export function isProducer(
  type: CampBuilding['sprite'],
): type is keyof typeof producerRules {
  return type in producerRules;
}
export function buildingLevel(building: CampBuilding) {
  return building.production?.level ?? building.level ?? 1;
}
export function materialCapacity(
  buildings: CampBuilding[],
  resource: CampResource,
): number {
  if (resource === 'gold') return Infinity;
  return (
    50 +
    buildings
      .filter((b) => b.sprite === 'store' && b.status === 'ready')
      .reduce((sum, b) => sum + [0, 50, 150, 300][buildingLevel(b)], 0)
  );
}
export function missingResources(
  inventory: CampInventory,
  required: Cost,
): string {
  const missing = (Object.keys(required) as CampResource[])
    .filter((r) => inventory[r] < required[r])
    .map(
      (r) =>
        `${resourceNames[r].toLowerCase()}: faltam ${required[r] - inventory[r]} (tem ${inventory[r]}, precisa ${required[r]})`,
    );
  return missing.length
    ? `Recursos insuficientes — ${missing.join('; ')}.`
    : '';
}
export function describeCost(required: Cost): string {
  return (
    (Object.keys(required) as CampResource[])
      .filter((r) => required[r] > 0)
      .map((r) => `${required[r]} ${resourceNames[r].toLowerCase()}`)
      .join(' · ') || 'Sem custo'
  );
}
function spend(
  inventory: CampInventory,
  required: Cost,
  id: string,
  name: string,
  kind: 'construction' | 'upgrade',
): CampInventory {
  const delta = {
    wood: -required.wood,
    stone: -required.stone,
    iron: -required.iron,
    gold: -required.gold,
  };
  return {
    ...inventory,
    wood: inventory.wood + delta.wood,
    stone: inventory.stone + delta.stone,
    iron: inventory.iron + delta.iron,
    gold: inventory.gold + delta.gold,
    events: [...(inventory.events ?? []), { id, name, kind, delta }],
  };
}
export function purchaseConstruction(
  buildings: CampBuilding[],
  inventory: CampInventory,
  proposal: CampBuilding,
  world: { width: number; height: number },
) {
  if (buildings.some((b) => b.id === proposal.id))
    return {
      buildings,
      inventory,
      error: 'Esta construção já foi confirmada.',
    };
  if (!(proposal.sprite in buildingRules) || proposal.status !== 'building')
    return { buildings, inventory, error: 'Construção inválida.' };
  const error =
    placementError(
      { ...proposal, ...campSprites[proposal.sprite].footprint },
      buildings
        .filter((b) => b.status !== 'site')
        .map((b) => ({ ...b, ...campSprites[b.sprite].footprint })),
      world,
    ) || missingResources(inventory, buildingRules[proposal.sprite].build);
  if (error) return { buildings, inventory, error };
  return {
    buildings: [...buildings, proposal],
    inventory: spend(
      inventory,
      buildingRules[proposal.sprite].build,
      proposal.id,
      `${proposal.name} · construção`,
      'construction',
    ),
    error: '',
  };
}
export function upgradeError(
  buildings: CampBuilding[],
  id: string,
  inventory: CampInventory,
): string {
  const building = buildings.find((b) => b.id === id);
  if (!building || building.status !== 'ready')
    return 'Conclua a construção para melhorar.';
  const level = buildingLevel(building),
    rule = buildingRules[building.sprite];
  if (level >= rule.max) return 'Nível máximo atingido.';
  if (
    building.sprite === 'mine' &&
    level === 2 &&
    !building.production?.workerId
  )
    return 'Nível 3 da mina exige um trabalhador designado.';
  return missingResources(inventory, rule.upgrades[level - 1]);
}
export function upgradeBuilding(
  buildings: CampBuilding[],
  id: string,
  inventory: CampInventory,
) {
  const error = upgradeError(buildings, id, inventory);
  if (error) return { buildings, inventory, error };
  const building = buildings.find((b) => b.id === id)!,
    level = buildingLevel(building),
    required = buildingRules[building.sprite].upgrades[level - 1];
  return {
    buildings: buildings.map((b) =>
      b.id !== id
        ? b
        : {
            ...b,
            level: level + 1,
            ...(b.production
              ? { production: { ...b.production, level: level + 1 } }
              : {}),
          },
    ),
    inventory: spend(
      inventory,
      required,
      id,
      `${building.name} · melhoria N${level + 1}`,
      'upgrade',
    ),
    error: '',
  };
}
export function assignWorker(
  buildings: CampBuilding[],
  id: string,
  workerId: string | null,
) {
  const target = buildings.find((b) => b.id === id);
  if (
    !target ||
    !isProducer(target.sprite) ||
    target.status !== 'ready' ||
    !target.production
  )
    return { buildings, error: 'Selecione um edifício produtivo concluído.' };
  if (
    workerId &&
    (!demoWorkers.some((w) => w.id === workerId) ||
      buildings.some((b) => b.id !== id && b.production?.workerId === workerId))
  )
    return {
      buildings,
      error: 'Este trabalhador já está designado ou não está disponível.',
    };
  return {
    buildings: buildings.map((b) =>
      b.id === id ? { ...b, production: { ...b.production!, workerId } } : b,
    ),
    error: '',
  };
}
export const demoMissions = [
  {
    id: 'life',
    category: 'Vida real · exemplo',
    name: 'Organizar a mesa',
    description:
      'Marque este exemplo como concluído para simular uma atividade pessoal. Não altera missões reais.',
    reward: { wood: 0, stone: 0, iron: 0, gold: 15 },
    xp: 40,
    badge: 0,
    sword: false,
  },
  {
    id: 'explore',
    category: 'Exploração · simulação',
    name: 'Explorar a clareira',
    description:
      'Receba uma remessa de materiais demonstrativos. Não há combate ou mapa de exploração.',
    reward: { wood: 30, stone: 20, iron: 10, gold: 4 },
    xp: 10,
    badge: 0,
    sword: false,
  },
  {
    id: 'rpg',
    category: 'Missão secundária · RPG',
    name: 'Equipar a patrulha',
    description:
      'Entregue 1 espada de treino fabricada na forja. Receba ouro, XP e um emblema da patrulha.',
    reward: { wood: 0, stone: 0, iron: 0, gold: 12 },
    xp: 25,
    badge: 1,
    sword: true,
  },
];
export function missionError(inventory: CampInventory, id: string): string {
  const mission = demoMissions.find((m) => m.id === id);
  if (!mission) return 'Missão demonstrativa inválida.';
  if (inventory.completedMissions?.includes(id))
    return 'Recompensa já recebida.';
  if (mission.sword && inventory.trainingSword < 1)
    return 'Fabrique uma espada de treino na forja para entregar.';
  return '';
}
export function completeDemoMission(
  buildings: CampBuilding[],
  inventory: CampInventory,
  id: string,
) {
  const error = missionError(inventory, id);
  if (error) return { inventory, error };
  const mission = demoMissions.find((m) => m.id === id)!;
  const delta = { wood: 0, stone: 0, iron: 0, gold: 0 },
    discarded = { ...delta };
  for (const resource of Object.keys(delta) as CampResource[]) {
    delta[resource] = Math.min(
      mission.reward[resource],
      Math.max(0, materialCapacity(buildings, resource) - inventory[resource]),
    );
    discarded[resource] = mission.reward[resource] - delta[resource];
  }
  return {
    inventory: {
      ...inventory,
      wood: inventory.wood + delta.wood,
      stone: inventory.stone + delta.stone,
      iron: inventory.iron + delta.iron,
      gold: inventory.gold + delta.gold,
      trainingSword: inventory.trainingSword - (mission.sword ? 1 : 0),
      xp: (inventory.xp ?? 0) + mission.xp,
      badges: (inventory.badges ?? 0) + mission.badge,
      completedMissions: [...(inventory.completedMissions ?? []), id],
      events: [
        ...(inventory.events ?? []),
        {
          id: mission.id,
          name: mission.name,
          kind: 'mission' as const,
          delta,
          discarded,
          xp: mission.xp,
        },
      ],
    },
    error: '',
  };
}
