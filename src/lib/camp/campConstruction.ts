import { campSprites } from './campSprites';
import type { Point, GroundRotation } from './campPlacement';
import { isProducer } from './campEconomy';
export type ConstructionPhase = 'site' | 'building' | 'ready';
export type CampBuilding = Point & {
  production?: {
    level: number;
    workerId: string | null;
    at: number;
    carry: number;
  };
  level?: number;
  rotation?: GroundRotation;
  id: string;
  name: string;
  purpose: string;
  sprite: keyof typeof campSprites;
  status: ConstructionPhase;
};
export const constructionCatalog = {
  quarry: {
    name: 'Pedreira',
    purpose: 'Produz pedra. Trabalhador opcional dobra a produção.',
    sprite: 'quarry' as const,
  },
  mine: {
    name: 'Mina',
    purpose: 'Produz ferro. Nível 3 exige trabalhador para desbloquear.',
    sprite: 'mine' as const,
  },
  store: {
    name: 'Armazém',
    purpose: 'Amplia o armazenamento compartilhado de materiais.',
    sprite: 'store' as const,
  },
  sawmill: {
    name: 'Serraria',
    purpose: 'Produz madeira ao concluir. Um trabalhador dobra a produção.',
    sprite: 'sawmill' as const,
  },
  forge: {
    name: 'Forja',
    purpose: 'Fabrique uma espada com materiais do armazém.',
    sprite: 'forge' as const,
  },
};
export const initialBuildings: CampBuilding[] = [
  {
    id: 'hall',
    name: 'Salão do acampamento',
    purpose: 'O coração do assentamento.',
    x: 830,
    y: 617,
    sprite: 'hall',
    status: 'ready',
  },
  {
    id: 'forge',
    name: 'Forja',
    purpose: 'Fabrique uma espada de treino com materiais do armazém.',
    x: 1170,
    y: 700,
    sprite: 'forge',
    status: 'ready',
  },
  {
    id: 'forge-copy',
    name: 'Forja 2',
    purpose: 'Segunda instância da mesma forja.',
    x: 1290,
    y: 760,
    sprite: 'forge',
    status: 'ready',
  },
  {
    id: 'store',
    name: 'Armazém',
    purpose: 'Um espaço para a comunidade.',
    x: 620,
    y: 932,
    sprite: 'store',
    status: 'ready',
  },
];
// Operations return new arrays: a move proposal never mutates the occupied map.
export function moveBuilding(
  buildings: CampBuilding[],
  id: string,
  point: Point,
  rotation?: GroundRotation,
): CampBuilding[] {
  return buildings.map((b) =>
    b.id === id
      ? { ...b, ...point, ...(rotation === undefined ? {} : { rotation }) }
      : b,
  );
}
export function completeBuilding(
  buildings: CampBuilding[],
  id: string,
  now = Date.now(),
): CampBuilding[] {
  return buildings.map((b) =>
    b.id === id && b.status === 'building'
      ? {
          ...b,
          status: 'ready',
          ...(isProducer(b.sprite)
            ? {
                production: {
                  level: 1 as const,
                  workerId: null,
                  at: now,
                  carry: 0,
                },
              }
            : {}),
        }
      : b,
  );
}
export function removeBuilding(
  buildings: CampBuilding[],
  id: string,
): CampBuilding[] {
  return buildings.filter((b) => b.id !== id);
}
