import { getEcoStageForTotalXp } from '$services/ecoConfig';
import type { SceneDefinition, SceneLayer, Point } from './sceneTypes';
export const GARDEN_ROOT: Point = [51.2, 64.7];
export const GARDEN_HOTSPOT: Point = [51.2, 80.5];
export const TREE_SPRITES = {
  1: { src: 'tree-seed.png', width: 7.5, anchor: [49, 81] as Point },
  2: { src: 'tree-sapling.png', width: 12, anchor: [50, 89] as Point },
  3: { src: 'tree-young.png', width: 29, anchor: [51, 95] as Point },
  4: { src: 'tree-ancient.png', width: 54, anchor: [50, 95] as Point },
};
const fullCanvas = {
  position: [0, 0] as Point,
  width: 100,
  anchor: [0, 0] as Point,
};
/** Pure projection of synthetic XP. No database, rewards or mutation services. */
export function getGardenScene(
  xp: number,
  options: {
    tree?: boolean;
    vegetation?: boolean;
    assetBase?: string;
    plateFile?: string;
  } = {},
): SceneDefinition {
  const assets = options.assetBase ?? '/assets/';
  const stage = getEcoStageForTotalXp(
    Number.isFinite(xp) ? Math.max(0, xp) : 0,
  );
  const sprite = TREE_SPRITES[stage.id];
  const layers: SceneLayer[] = [
    {
      id: 'repair',
      src: assets + (options.plateFile ?? 'garden-clean-plate.png'),
      ...fullCanvas,
      depth: 1,
      mask: assets + 'repair-mask.svg',
    },
    {
      id: 'vegetation',
      src: assets + 'vegetation.png',
      position: [51.2, 69.8],
      width: [13, 25, 37, 45][stage.id - 1],
      anchor: [50, 85],
      depth: 3,
      cleanAlpha: true,
      opacity: options.vegetation === false ? 0 : 1,
    },
    {
      id: 'contact-shadow',
      kind: 'shadow',
      position: GARDEN_ROOT,
      width: [3, 9, 18, 30][stage.id - 1],
      height: [1, 1.8, 2.8, 4][stage.id - 1],
      anchor: [50, 42],
      depth: 4,
      opacity: options.tree === false ? 0 : 0.3,
    },
    {
      id: 'tree',
      src: assets + sprite.src,
      position: GARDEN_ROOT,
      width: sprite.width,
      anchor: sprite.anchor,
      depth: 5,
      cleanAlpha: true,
      opacity: options.tree === false ? 0 : 1,
    },
    {
      id: 'foreground',
      src: assets + 'approved-garden.png',
      ...fullCanvas,
      depth: 7,
      mask: assets + 'foreground-mask.svg',
    },
    {
      id: 'rune-stones',
      src: assets + 'approved-garden.png',
      ...fullCanvas,
      depth: 8,
      mask: assets + 'rune-stones-mask.svg',
      tone: 'saturate(.18) brightness(.78)',
    },
    {
      id: 'rune-light',
      src: assets + 'approved-garden.png',
      ...fullCanvas,
      depth: 9,
      mask: assets + 'rune-glyphs-mask.svg',
      opacity: [0, 0.12, 0.4, 1][stage.id - 1],
    },
  ];
  return {
    id: 'garden-' + stage.id,
    label: 'Jardim · ' + stage.label,
    width: 836,
    height: 470,
    background: assets + 'approved-garden.png',
    layers,
    hotspot: { label: 'Árvore · ' + stage.label, position: GARDEN_HOTSPOT },
  };
}
