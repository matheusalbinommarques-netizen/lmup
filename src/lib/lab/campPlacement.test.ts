import { describe, expect, it } from 'vitest';
import {
  footprintCorners,
  footprintsOverlap,
  placementError,
} from './campPlacement';

const forge = { x: 400, y: 400, width: 192, height: 96 };
const world = { width: 1850, height: 1400 };

describe('occupied ground area', () => {
  it('uses the front contact as anchor and excludes transparent/roof pixels', () => {
    expect(footprintCorners(forge)).toEqual([
      { x: 400, y: 304 },
      { x: 496, y: 352 },
      { x: 400, y: 400 },
      { x: 304, y: 352 },
    ]);
    // Old center-distance rule rejected this free diagonal position.
    expect(footprintsOverlap(forge, { ...forge, x: 560, y: 480 })).toBe(false);
    expect(footprintsOverlap(forge, { ...forge, x: 480, y: 432 })).toBe(true);
  });
  it('handles unequal footprints, containment and shared edges', () => {
    expect(
      footprintsOverlap(forge, { x: 400, y: 370, width: 20, height: 10 }),
    ).toBe(true);
    expect(footprintsOverlap(forge, { ...forge, x: 592 })).toBe(false);
    expect(
      footprintsOverlap(forge, { x: 500, y: 400, width: 104, height: 52 }),
    ).toBe(true);
  });
  it('keeps every vertex inside the map and accepts an exact boundary', () => {
    for (const point of [
      { x: 95, y: 400 },
      { x: 1755, y: 400 },
      { x: 400, y: 95 },
      { x: 400, y: 1401 },
    ]) {
      expect(placementError({ ...forge, ...point }, [], world)).toContain(
        'dentro do mapa',
      );
    }
    expect(placementError({ ...forge, x: 96, y: 96 }, [], world)).toBe('');
    expect(placementError(forge, [forge], world)).toContain('sobrepõe');
  });
});
