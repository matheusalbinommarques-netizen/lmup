import type { SceneSpriteDefinition } from './campSprites';

export type TerrainTile = {
  u: number;
  v: number;
  frame: number;
  material: 'grass' | 'dirt';
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
  x: number;
  y: number;
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  sheets: Record<TerrainTile['material'], string>;
  tiles: TerrainTile[];
  decorations: RegionDecoration[];
};

const assetRoot = '/art/lab/camp/region';
const oak = (variant: 30 | 36): RegionDecoration['sprite'] => ({
  src: `${assetRoot}/tree-${variant}.png`,
  source: { width: 384, height: 768 },
  worldWidth: 256,
  pivot: variant === 30 ? { x: 194, y: 694 } : { x: 182, y: 730 },
});
const trees = { sparse: oak(30), leafy: oak(36) };
const side = 12;
const isPath = (u: number, v: number) =>
  (u >= 6 && u <= 7 && v >= 2 && v < side) ||
  (v >= 6 && v <= 7 && u >= 6 && u < side);
// Native atlas edge order is NE, SE, NW, SW (not compass rotation).
const edgeFrames = [20, 24, 32, 28]; // NE, SE, SW, NW neighbours
const tiles: TerrainTile[] = [];
for (let u = 0; u < side; u++) {
  for (let v = 0; v < side; v++) {
    const variation = (u * 7 + v * 11) % 20;
    tiles.push({ u, v, frame: variation, material: 'grass' });
    if (isPath(u, v)) {
      // The source atlas includes eroded alpha edges for each tile side.
      // Pick an exposed edge instead of painting a geometric road on top.
      const edges = [
        [u, v - 1],
        [u + 1, v],
        [u, v + 1],
        [u - 1, v],
      ];
      const edge = edges.findIndex(([a, b]) => !isPath(a, b));
      tiles.push({
        u,
        v,
        frame: edge < 0 ? variation : edgeFrames[edge] + (variation % 4),
        material: 'dirt',
      });
    }
  }
}

// One bounded evaluation region. Existing map coordinates and camera stay intact.
export const forgeRegion: TerrainRegionDefinition = {
  id: 'forge-clearing',
  x: 826,
  y: 490,
  columns: side,
  rows: side,
  tileWidth: 64,
  tileHeight: 32,
  sheets: {
    grass: `${assetRoot}/grass_medium_128x64.png`,
    dirt: `${assetRoot}/dirt_128x64.png`,
  },
  tiles,
  decorations: [
    { id: 'oak-back-west', x: 1040, y: 610, sprite: trees.sparse },
    { id: 'oak-back-east', x: 1360, y: 610, sprite: trees.leafy },
    { id: 'oak-front', x: 1360, y: 790, sprite: trees.sparse },
  ],
};
