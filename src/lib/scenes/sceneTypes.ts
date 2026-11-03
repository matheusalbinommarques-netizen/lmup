import type { IconName } from '$lib/ui/Icon.svelte';
export type Point = readonly [number, number];
/** Scene coordinates are percentages of the intrinsic canvas, never of the viewport. */
export interface SceneLayer {
  id: string;
  src?: string;
  position: Point;
  width: number;
  anchor: Point;
  depth: number;
  opacity?: number;
  mask?: string;
  cleanAlpha?: boolean;
  kind?: 'image' | 'shadow';
  height?: number;
  tone?: string;
}
export interface SceneHotspot {
  id: string;
  label: string;
  icon?: IconName;
  position: Point;
  placement?: 'above' | 'below';
}
export interface SceneDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  background: string;
  layers: SceneLayer[];
  points?: SceneHotspot[];
  hotspot: { label: string; position: Point };
}
export function sortSceneLayers(layers: SceneLayer[]) {
  return [...layers].sort((a, b) => a.depth - b.depth);
}
