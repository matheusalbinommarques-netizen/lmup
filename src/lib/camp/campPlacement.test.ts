import { describe, expect, it } from 'vitest';
import {
  footprintCorners,
  footprintsOverlap,
  placementError,
  nextRotation,
  groundHeading,
} from './campPlacement';

const forge = { x: 400, y: 400, width: 192, height: 96 };
const world = { width: 1850, height: 1400 };

describe('mirrored ground orientation', () => {
  it('toggles two headings on the same square ground footprint', () => {
    const rotations = [0, 180] as const;
    expect(rotations.map(nextRotation)).toEqual([180, 0]);
    const headings = rotations.map((r) => groundHeading(r, 96));
    expect(new Set(headings.map((p) => `${p.x},${p.y}`)).size).toBe(2);
    for (const p of headings) {
      // All headings remain inside the occupied isometric square.
      expect(Math.abs(p.x) / 96 + Math.abs(p.y + 48) / 48).toBeLessThan(1);
    }
  });
});

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

describe('pointer placement at camera zoom', () => {
  it.each([0.45, 0.72, 1.5])(
    'keeps the grabbed ground offset at zoom %s',
    async (zoom) => {
      const { pointerWorldPoint, snapPlacement } =
        await import('./campPlacement');
      const view = { left: 25, top: 100, width: 390, height: 618 };
      const camera = { x: 1000, y: 980 };
      const anchor = { x: 1008, y: 976 };
      const offset = { x: 16, y: -40 };
      const screen = {
        x: view.left + view.width / 2 + (anchor.x + offset.x - camera.x) * zoom,
        y: view.top + view.height / 2 + (anchor.y + offset.y - camera.y) * zoom,
      };
      const grabbed = pointerWorldPoint(screen, view, camera, zoom);
      expect(grabbed.x - anchor.x).toBeCloseTo(offset.x);
      expect(grabbed.y - anchor.y).toBeCloseTo(offset.y);
      const moved = pointerWorldPoint(
        { x: screen.x + 96 * zoom, y: screen.y + 32 * zoom },
        view,
        camera,
        zoom,
      );
      expect(
        snapPlacement({ x: moved.x - offset.x, y: moved.y - offset.y }),
      ).toEqual({ x: 1104, y: 1008 });
    },
  );
});
