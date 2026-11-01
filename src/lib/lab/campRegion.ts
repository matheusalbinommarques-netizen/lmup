import type { SceneSpriteDefinition } from './campSprites';
export const CAMP_WORLD = { width: 1850, height: 1400 };
export type TerrainMaterial = 'grass' | 'dirt' | 'forest' | 'sand';
export type TerrainTile = {
  x: number;
  y: number;
  frame: number;
  material: TerrainMaterial;
};
export type RegionDecoration = {
  id: string;
  x: number;
  y: number;
  sprite: Pick<
    SceneSpriteDefinition,
    'src' | 'source' | 'worldWidth' | 'pivot'
  >;
};
export type TerrainRegionDefinition = {
  id: string;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  sheets: Record<TerrainMaterial, string>;
  tiles: TerrainTile[];
  decorations: RegionDecoration[];
};
const root = '/art/lab/camp/region';
const oak = (
  variant: 30 | 36,
  worldWidth = 256,
): RegionDecoration['sprite'] => ({
  src: `${root}/tree-${variant}.png`,
  source: { width: 384, height: 768 },
  worldWidth,
  pivot: variant === 30 ? { x: 194, y: 694 } : { x: 182, y: 730 },
});
const treePositions = [
  [1040, 610, 30],
  [1360, 610, 36],
  [1360, 790, 30],
  [120, 230, 30],
  [260, 170, 36],
  [375, 255, 30],
  [560, 190, 36],
  [755, 225, 30],
  [1040, 200, 36],
  [1250, 200, 30],
  [1410, 150, 36],
  [110, 530, 36],
  [220, 650, 30],
  [150, 900, 36],
  [320, 1110, 30],
  [190, 1290, 36],
  [460, 1290, 30],
  [690, 1260, 36],
  [1150, 1280, 30],
  [1430, 1240, 36],
  [1660, 1300, 30],
  [1750, 560, 36],
  [1710, 800, 30],
  [1760, 1090, 36],
];
export const lake = { x: 1620, y: 285, rx: 175, ry: 90 };
export function lakeRadius(x: number, y: number) {
  const dx = (x - lake.x) / lake.rx,
    dy = (y - lake.y) / lake.ry;
  const angle = Math.atan2(dy, dx);
  return (
    Math.hypot(dx, dy) /
    (1 + 0.09 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5))
  );
}
export const campRoads = [
  [
    [180, 920],
    [540, 800],
    [830, 700],
    [1110, 780],
    [1460, 935],
    [1690, 1110],
  ],
  [
    [830, 700],
    [790, 520],
    [900, 365],
    [1270, 360],
    [1460, 430],
  ],
  [
    [830, 700],
    [920, 900],
    [1060, 1120],
  ],
];
function onRoad(x: number, y: number) {
  return campRoads.some((points) =>
    points.slice(1).some((b, i) => {
      const a = points[i],
        dx = b[0] - a[0],
        dy = (b[1] - a[1]) * 2;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((x - a[0]) * dx + (y - a[1]) * 2 * dy) / (dx * dx + dy * dy),
        ),
      );
      return Math.hypot(x - a[0] - t * dx, (y - a[1]) * 2 - t * dy) < 44;
    }),
  );
}
const position = (u: number, v: number) => ({
  x: 925 + (u - v) * 32,
  y: 700 + (u + v) * 16,
});
function materialAt(u: number, v: number): TerrainMaterial {
  const { x, y } = position(u, v);
  if (lakeRadius(x, y) < 1.35) return 'sand';
  if (onRoad(x, y)) return 'dirt';
  if (
    x < 270 + 40 * Math.sin(y / 130) ||
    x > 1710 + 35 * Math.sin(y / 100) ||
    y < 210 + 30 * Math.cos(x / 130) ||
    y > 1250 + 30 * Math.sin(x / 180)
  )
    return 'forest';
  return 'grass';
}
const edges = [20, 24, 32, 28];
const tiles: TerrainTile[] = [];
for (let u = -55; u <= 55; u++)
  for (let v = -55; v <= 55; v++) {
    const p = position(u, v);
    if (
      p.x < -64 ||
      p.y < -32 ||
      p.x > CAMP_WORLD.width + 64 ||
      p.y > CAMP_WORLD.height + 32
    )
      continue;
    const variation = (((u * 7 + v * 11) % 20) + 20) % 20;
    tiles.push({ ...p, frame: variation, material: 'grass' });
    const material = materialAt(u, v);
    if (material === 'grass') continue;
    const neighbours = [
      [u, v - 1],
      [u + 1, v],
      [u, v + 1],
      [u - 1, v],
    ];
    const edge = neighbours.findIndex(
      ([a, b]) => materialAt(a, b) !== material,
    );
    tiles.push({
      ...p,
      material,
      frame: edge < 0 ? variation : edges[edge] + (variation % 4),
    });
  }
export const campRegion: TerrainRegionDefinition = {
  id: 'camp-ground',
  ...CAMP_WORLD,
  tileWidth: 64,
  tileHeight: 32,
  sheets: {
    grass: `${root}/grass_medium_128x64.png`,
    dirt: `${root}/dirt_128x64.png`,
    forest: `${root}/forest_ground_128x64.png`,
    sand: `${root}/sand_128x64.png`,
  },
  tiles,
  decorations: treePositions.map(([x, y, variant], i) => ({
    id: `oak-${i}`,
    x,
    y,
    sprite: oak(variant as 30 | 36, i < 3 ? 256 : 220),
  })),
};
export const campLandmarks = [
  { id: 'plaza', name: 'Praça', x: 830, y: 650 },
  { id: 'forges', name: 'Forjas', x: 1220, y: 730 },
  { id: 'lake', name: 'Lago', x: 1570, y: 360 },
  { id: 'meadow', name: 'Clareira sul', x: 1030, y: 1080 },
];
