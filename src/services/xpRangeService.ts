// src/services/xpRangeService.ts

export type ChartRange = '7d' | '30d' | '6m' | '1y';

type Listener = (range: ChartRange) => void;

let currentRange: ChartRange = '7d';
const listeners = new Set<Listener>();

export function getCurrentRange(): ChartRange {
  return currentRange;
}

export function setCurrentRange(range: ChartRange): void {
  if (currentRange === range) return;
  currentRange = range;
  for (const listener of listeners) {
    listener(currentRange);
  }
}

export function subscribeRange(listener: Listener): () => void {
  listeners.add(listener);
  // dispara o estado atual logo de cara
  listener(currentRange);
  return () => {
    listeners.delete(listener);
  };
}
