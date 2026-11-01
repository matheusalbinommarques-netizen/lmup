import { campSprites } from './campSprites';
import type { Point } from './campPlacement';
export type ConstructionPhase = 'site' | 'building' | 'ready';
export type CampBuilding = Point & {
  id: string;
  name: string;
  purpose: string;
  sprite: keyof typeof campSprites;
  status: ConstructionPhase;
};
export const constructionCatalog = {
  forge: {
    name: 'Forja',
    purpose: 'Equipamentos e melhorias. Demonstração sem custos.',
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
    purpose: 'Um futuro lugar para equipamentos e melhorias.',
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
  {
    id: 'plot',
    name: 'Terreno disponível',
    purpose: 'Uma área vazia para experimentar a construção.',
    x: 1330,
    y: 965,
    sprite: 'forge',
    status: 'site',
  },
];
// Operations return new arrays: a move proposal never mutates the occupied map.
export function moveBuilding(
  buildings: CampBuilding[],
  id: string,
  point: Point,
): CampBuilding[] {
  return buildings.map((b) => (b.id === id ? { ...b, ...point } : b));
}
export function completeBuilding(
  buildings: CampBuilding[],
  id: string,
): CampBuilding[] {
  return buildings.map((b) =>
    b.id === id && b.status === 'building' ? { ...b, status: 'ready' } : b,
  );
}
export function removeBuilding(
  buildings: CampBuilding[],
  id: string,
): CampBuilding[] {
  return buildings.filter((b) => b.id !== id);
}
