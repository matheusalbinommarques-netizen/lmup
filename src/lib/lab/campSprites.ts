export type SceneSpriteDefinition = {
  src: string;
  source: { width: number; height: number };
  worldWidth: number;
  pivot: { x: number; y: number };
  footprint: { width: number; height: number };
  shadow: 'embedded';
};

// Source pixels are kept intact. The pivot marks the front ground contact,
// not the center of the roof or the transparent image rectangle.
export const campSprites = {
  hall: {
    src: '/art/lab/camp/hall-feudalwars.png',
    source: { width: 178, height: 141 },
    worldWidth: 190,
    pivot: { x: 89, y: 133 },
    footprint: { width: 176, height: 88 },
    shadow: 'embedded',
  },
  store: {
    src: '/art/lab/camp/store-feudalwars.png',
    source: { width: 175, height: 140 },
    worldWidth: 165,
    pivot: { x: 87.5, y: 132 },
    footprint: { width: 152, height: 76 },
    shadow: 'embedded',
  },
  forge: {
    src: '/art/lab/camp/forge-feudalwars.png',
    source: { width: 305, height: 259 },
    worldWidth: 200,
    pivot: { x: 152.5, y: 249 },
    footprint: { width: 192, height: 96 },
    shadow: 'embedded',
  },
} satisfies Record<string, SceneSpriteDefinition>;
