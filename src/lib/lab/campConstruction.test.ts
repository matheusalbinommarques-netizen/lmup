import { describe, expect, it } from 'vitest';
import {
  initialBuildings,
  moveBuilding,
  completeBuilding,
  removeBuilding,
  type CampBuilding,
} from './campConstruction';
import { campSprites } from './campSprites';
import { placementError } from './campPlacement';
import { CAMP_WORLD, campRegion } from './campRegion';
const placed: CampBuilding = {
  id: 'test',
  name: 'Forja 3',
  purpose: 'Teste',
  x: 1008,
  y: 976,
  sprite: 'forge',
  status: 'building',
};
describe('camp management in memory', () => {
  it('completes only the requested construction and leaves originals unchanged', () => {
    const before = [...initialBuildings, placed];
    const after = completeBuilding(before, 'test');
    expect(after.find((b) => b.id === 'test')?.status).toBe('ready');
    expect(placed.status).toBe('building');
    expect(after[0]).toBe(before[0]);
    expect(completeBuilding(after, 'test')).toEqual(after);
  });
  it('moves preserve identity/state and cancellation can keep the original array', () => {
    const before = [...initialBuildings, placed];
    const after = moveBuilding(before, 'test', { x: 1504, y: 1008 });
    expect(after.at(-1)).toEqual({ ...placed, x: 1504, y: 1008 });
    expect(before.at(-1)).toBe(placed);
    expect(before.at(-1)?.x).toBe(1008);
    const candidate = {
      ...campSprites.forge.footprint,
      x: placed.x,
      y: placed.y,
    };
    const others = before
      .filter((b) => b.id !== 'test' && b.status !== 'site')
      .map((b) => ({ ...campSprites[b.sprite].footprint, x: b.x, y: b.y }));
    expect(placementError(candidate, others, CAMP_WORLD)).toBe('');
    expect(placementError(candidate, [candidate], CAMP_WORLD)).toContain(
      'sobrepõe',
    );
  });
  it('removes only its target and keeps remaining identifiers stable', () => {
    const before = [...initialBuildings, placed];
    expect(removeBuilding(before, 'test')).toEqual(initialBuildings);
    expect(before).toHaveLength(initialBuildings.length + 1);
    expect(removeBuilding(before, 'unknown')).toEqual(before);
  });
  it('covers the full world with reusable tiles and leaves central building areas free of trees', () => {
    expect(campRegion.width).toBe(CAMP_WORLD.width);
    expect(campRegion.height).toBe(CAMP_WORLD.height);
    expect(Object.keys(campRegion.sheets)).toHaveLength(4);
    expect(campRegion.tiles.some((t) => t.x < 0)).toBe(true);
    expect(campRegion.tiles.some((t) => t.x > CAMP_WORLD.width)).toBe(true);
    expect(
      campRegion.decorations.every(
        (t) => Math.hypot(t.x - 1000, t.y - 980) > 200,
      ),
    ).toBe(true);
  });
});
