export type Point = { x: number; y: number };
export type GroundFootprint = Point & { width: number; height: number };

// x/y is the front ground contact, exactly as in SceneSprite's selection ring.
export function footprintCorners({
  x,
  y,
  width,
  height,
}: GroundFootprint): Point[] {
  return [
    { x, y: y - height },
    { x: x + width / 2, y: y - height / 2 },
    { x, y },
    { x: x - width / 2, y: y - height / 2 },
  ];
}

// Separating-axis test on the occupied ground polygons, independent of image bounds.
export function footprintsOverlap(
  a: GroundFootprint,
  b: GroundFootprint,
): boolean {
  const first = footprintCorners(a);
  const second = footprintCorners(b);
  for (const polygon of [first, second]) {
    for (let i = 0; i < polygon.length; i++) {
      const next = polygon[(i + 1) % polygon.length];
      const axis = { x: -(next.y - polygon[i].y), y: next.x - polygon[i].x };
      const project = (points: Point[]) =>
        points.map((p) => p.x * axis.x + p.y * axis.y);
      const aa = project(first),
        bb = project(second);
      if (
        Math.max(...aa) <= Math.min(...bb) ||
        Math.max(...bb) <= Math.min(...aa)
      )
        return false;
    }
  }
  return true;
}

export function placementError(
  proposed: GroundFootprint,
  occupied: GroundFootprint[],
  world: { width: number; height: number },
): string {
  if (
    footprintCorners(proposed).some(
      (p) => p.x < 0 || p.y < 0 || p.x > world.width || p.y > world.height,
    )
  ) {
    return 'A base da forja precisa ficar inteira dentro do mapa.';
  }
  if (occupied.some((footprint) => footprintsOverlap(proposed, footprint))) {
    return 'A base da forja sobrepõe outra construção. Escolha uma área livre.';
  }
  return '';
}
