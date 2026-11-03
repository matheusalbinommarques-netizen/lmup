import { getEcoStageForTotalXp } from '$services/ecoConfig';
import { getGardenScene, TREE_SPRITES } from '$lib/scenes/gardenProof';
import type {
  SceneDefinition,
  SceneLayer,
  SceneHotspot,
  Point,
} from '$lib/scenes/sceneTypes';
export type CampSceneId =
  'center' | 'interior' | 'bestiary' | 'garden' | 'preparation';
export type CampScene = {
  id: CampSceneId;
  title: string;
  subtitle: string;
  canvas: SceneDefinition;
  points: SceneHotspot[];
};
const art = '/art/camp-modular/';
const full = { position: [0, 0] as Point, width: 100, anchor: [0, 0] as Point };
export const CENTER_ROOT: Point = [79.3, 65.1];
const centerWidths = { 1: 3.5, 2: 6.5, 3: 15.5, 4: 28 };
const point = (
  id: string,
  label: string,
  icon: SceneHotspot['icon'],
  x: number,
  y: number,
): SceneHotspot => ({ id, label, icon, position: [x, y] });
export function resolveCampScene(
  requested: string,
  built: boolean,
): CampSceneId {
  const aliases: Record<string, CampSceneId> = {
    exterior: 'interior',
    workshops: 'preparation',
    expansion: 'preparation',
  };
  const id = aliases[requested] ?? requested;
  if (!['center', 'interior', 'bestiary', 'garden', 'preparation'].includes(id))
    return 'center';
  if (!built && !['center', 'preparation'].includes(id)) return 'center';
  return id as CampSceneId;
}
export function campScene(
  id: CampSceneId,
  built: boolean,
  xp: number,
): CampScene {
  const stage = getEcoStageForTotalXp(xp);
  let points: SceneHotspot[];
  let canvas: SceneDefinition;
  if (id === 'center') {
    const layers: SceneLayer[] = [];
    if (built) {
      const sprite = TREE_SPRITES[stage.id];
      points = [
        point('bestiary', 'Bestiário', 'companion', 28.4, 43),
        point('caretaker', 'Caseiro', 'person', 42.7, 46.5),
        point('interior', 'Aposentos', 'house', 60.5, 32),
        point(
          'garden',
          'Jardim da Árvore',
          'tree',
          79.3,
          { 1: 59, 2: 48, 3: 38, 4: 33 }[stage.id],
        ),
        point('preparation', 'Outras áreas', 'map', 92.5, 59),
      ];
      layers.push(
        {
          id: 'vegetation',
          src: art + 'vegetation.png',
          position: [79.3, 67.8],
          width: [5.5, 9.5, 16.5, 22][stage.id - 1],
          anchor: [50, 85],
          depth: 3,
          cleanAlpha: true,
        },
        {
          id: 'contact-shadow',
          kind: 'shadow',
          position: CENTER_ROOT,
          width: [2, 5, 10, 17][stage.id - 1],
          height: [0.5, 0.8, 1.2, 1.7][stage.id - 1],
          anchor: [50, 45],
          depth: 4,
          opacity: 0.28,
        },
        {
          id: 'tree',
          src: art + sprite.src,
          position: CENTER_ROOT,
          width: centerWidths[stage.id],
          anchor: sprite.anchor,
          depth: 5,
          cleanAlpha: true,
        },
        {
          id: 'bed-foreground',
          src: art + 'center-built.webp',
          ...full,
          mask: art + 'center-bed-mask.svg',
          depth: 7,
        },
        {
          id: 'rune-light',
          src: art + 'center-runes.svg',
          ...full,
          depth: 8,
          opacity: [0, 0.12, 0.4, 0.85][stage.id - 1],
        },
      );
    } else {
      points = [
        point('caretaker', 'Caseiro', 'person', 42.7, 46.5),
        point('preparation', 'Outras áreas', 'map', 92.5, 59),
      ];
      layers.push({
        id: 'empty-footprints',
        src: art + 'center-empty.webp',
        ...full,
        mask: art + 'center-empty-mask.svg',
        depth: 1,
      });
    }
    canvas = {
      id: 'center-' + (built ? 'built-' + stage.id : 'empty'),
      label: 'Acampamento — Centro',
      width: 1620,
      height: 970,
      background: art + 'center-built.webp',
      layers,
      points,
      hotspot: { label: 'Jardim da Árvore', position: CENTER_ROOT },
    };
  } else if (id === 'garden') {
    canvas = getGardenScene(xp, {
      assetBase: art,
      plateFile: 'garden-clean-plate.webp',
    });
    points = [point('tree', 'Árvore de Evolução', 'tree', 51.2, 80.5)];
  } else {
    points =
      id === 'interior'
        ? [
            point('records', 'Registros', 'book', 35, 50),
            point('trophies', 'Troféus', 'trophy', 69, 40),
            point('equipment', 'Equipamentos', 'swords', 88, 25),
            point('collection', 'Coleção', 'chest', 86, 70),
          ]
        : id === 'bestiary'
          ? [
              point(
                'companions',
                'Companheiros descobertos',
                'companion',
                53,
                65,
              ),
            ]
          : [];
    canvas = {
      id,
      label: id === 'interior' ? 'Aposentos' : 'Bestiário',
      width: 836,
      height: 470,
      background: art + (id === 'interior' ? 'interior.png' : 'bestiary.webp'),
      layers: [],
      points,
      hotspot: { label: '', position: [50, 50] },
    };
  }
  return {
    id,
    title: {
      center: 'Acampamento — Centro',
      interior: 'Aposentos',
      bestiary: 'Bestiário',
      garden: 'Jardim da Árvore',
      preparation: 'Região em preparação',
    }[id],
    subtitle: {
      center: built
        ? 'Seu refúgio nos Ermos Centrais.'
        : 'Um terreno, uma fogueira e o começo da sua história.',
      interior: 'Um lugar para guardar o que a jornada trouxe.',
      bestiary: 'As companhias que você já encontrou pelo caminho.',
      garden: 'O crescimento acompanha a sua jornada.',
      preparation: 'Este caminho ainda está sendo preparado.',
    }[id],
    canvas,
    points,
  };
}
