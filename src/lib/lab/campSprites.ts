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
  forge: {
    src: '/art/lab/camp/forge-feudalwars.png',
    source: { width: 305, height: 259 },
    worldWidth: 200,
    pivot: { x: 152.5, y: 249 },
    footprint: { width: 192, height: 96 },
    shadow: 'embedded',
  },
} satisfies Record<string, SceneSpriteDefinition>;
