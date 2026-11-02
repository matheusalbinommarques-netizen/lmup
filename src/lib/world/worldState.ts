import {
  locations,
  hotspots,
  clues,
  requiredClues,
  type SceneId,
  type ClueId,
  type LocationId,
  type HotspotId,
} from './content';
export const dialogueNodes = [
  'welcome',
  'briefing',
  'progress',
  'hint',
  'report',
  'evidence',
  'ending',
] as const;
export type DialogueNode = (typeof dialogueNodes)[number];
export type WorldState = {
  version: 1;
  epoch: string;
  revision: number;
  quest: 'new' | 'active' | 'solved';
  lastScene?: SceneId;
  focus?: HotspotId;
  dialogue?: DialogueNode;
  clues: ClueId[];
  discovered: LocationId[];
  visitedScenes: SceneId[];
  resolution?: 'rescue' | 'route';
  journal: { id: string; text: string; at: string }[];
  receipts: { id: string; signature: string }[];
};
export function createWorld(): WorldState {
  return {
    version: 1,
    epoch: crypto.randomUUID(),
    revision: 0,
    quest: 'new',
    clues: [],
    discovered: ['oasis'],
    visitedScenes: [],
    journal: [],
    receipts: [],
  };
}
export function evidenceComplete(state: WorldState) {
  return requiredClues.every((id) => state.clues.includes(id));
}
export function validateWorld(value: unknown): asserts value is WorldState {
  const fail = () => {
    throw Error(
      'Estado de Mundo inválido ou incompatível. Os dados anteriores foram preservados.',
    );
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const w = value as WorldState;
  const text = (v: unknown, max: number) =>
    typeof v === 'string' && v.length > 0 && v.length <= max;
  const list = (v: unknown, allowed: readonly string[]) =>
    Array.isArray(v) &&
    new Set(v).size === v.length &&
    v.every((x) => allowed.includes(x));
  if (
    w.version !== 1 ||
    !text(w.epoch, 100) ||
    !Number.isSafeInteger(w.revision) ||
    w.revision < 0 ||
    !['new', 'active', 'solved'].includes(w.quest)
  )
    fail();
  if (
    !list(w.clues, Object.keys(clues)) ||
    !list(
      w.discovered,
      locations.map((x) => x.id),
    ) ||
    !w.discovered.includes('oasis') ||
    !list(w.visitedScenes, ['settlement', 'outskirts'])
  )
    fail();
  if (
    w.lastScene !== undefined &&
    !['settlement', 'outskirts'].includes(w.lastScene)
  )
    fail();
  if (
    w.focus !== undefined &&
    !hotspots.some((x) => x.id === w.focus && x.scene === w.lastScene)
  )
    fail();
  if (
    w.dialogue !== undefined &&
    (!dialogueNodes.includes(w.dialogue) || w.lastScene !== 'settlement')
  )
    fail();
  if (w.resolution !== undefined && !['rescue', 'route'].includes(w.resolution))
    fail();
  if (
    (w.quest === 'solved') !== !!w.resolution ||
    (w.quest === 'solved' && !evidenceComplete(w))
  )
    fail();
  if (
    !Array.isArray(w.journal) ||
    w.journal.length > 200 ||
    new Set(w.journal.map((x) => x?.id)).size !== w.journal.length ||
    w.journal.some(
      (x) =>
        !text(x?.id, 120) ||
        !text(x?.text, 2000) ||
        !text(x?.at, 80) ||
        !Number.isFinite(Date.parse(x.at)),
    )
  )
    fail();
  if (
    !Array.isArray(w.receipts) ||
    w.receipts.length > 128 ||
    new Set(w.receipts.map((x) => x?.id)).size !== w.receipts.length ||
    w.receipts.some((x) => !text(x?.id, 120) || !text(x?.signature, 500))
  )
    fail();
}
