import type { Material } from '$services/resourceLedger';

/**
 * Wave E — first camp circuit, numbers from V0.2 (approved 12/11/2026).
 * Only the levels whose costs use resources that already exist are open:
 * level 3 needs iron, which arrives with the foundry (Phase 6).
 * Names and texts are provisional.
 */
export type BuildingId = 'sawmill' | 'hunting';
export type Cost = { gold: number } & Partial<Record<Material, number>>;
export type Produce = Material | 'food';
export type BuildingLevel = { cost: Cost; perDay: number };
export type BuildingDef = {
  id: BuildingId;
  name: string;
  produces: Produce;
  worker: string;
  /** Text of the caretaker's recommendation when the building opens. */
  referral: string;
  requires?: BuildingId;
  levels: BuildingLevel[];
  /** Shown when the next level exists in V0.2 but is not open yet. */
  lockedNext?: string;
};

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Pending production and stock per material without a warehouse (V0.2). */
export const STORAGE_CAP = 60;

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'sawmill',
    name: 'Serraria',
    produces: 'wood',
    worker: 'lenhadora',
    referral:
      'O caseiro conhece uma lenhadora de confiança. Ela cuida da serraria enquanto você segue com as suas missões.',
    levels: [
      { cost: { gold: 150 }, perDay: 10 },
      { cost: { gold: 900, wood: 40, stone: 20 }, perDay: 15 },
    ],
    lockedNext: 'O nível 3 pede ferro, que chega com a fundição.',
  },
  {
    id: 'hunting',
    name: 'Campo de caça',
    produces: 'food',
    worker: 'caçador',
    referral:
      'Com madeira à mão, o caseiro indica um caçador para montar o campo e trazer comida aos companheiros.',
    requires: 'sawmill',
    levels: [
      { cost: { gold: 350, wood: 12 }, perDay: 4 },
      { cost: { gold: 1100, wood: 50, stone: 25 }, perDay: 6 },
    ],
    lockedNext: 'O nível 3 pede ferro, que chega com a fundição.',
  },
];

export const building = (id: BuildingId) =>
  BUILDINGS.find((row) => row.id === id)!;

export type BuildingState = {
  level: number;
  builtAt: string;
  /** Production is counted from this moment. */
  collectedAt: string;
};
export type CampBuildings = {
  version: 1;
  sawmill?: BuildingState;
  hunting?: BuildingState;
};

const ISO = (value: unknown) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

export function validateCampBuildings(
  value: unknown,
): asserts value is CampBuildings {
  const state = value as Record<string, unknown> | null;
  const ok =
    !!state &&
    typeof state === 'object' &&
    !Array.isArray(state) &&
    state.version === 1 &&
    Object.keys(state).every(
      (key) => key === 'version' || BUILDINGS.some((row) => row.id === key),
    ) &&
    BUILDINGS.every(({ id, levels }) => {
      const row = state[id] as Record<string, unknown> | undefined;
      if (row === undefined) return true;
      return (
        !!row &&
        typeof row === 'object' &&
        Object.keys(row).every((key) =>
          ['level', 'builtAt', 'collectedAt'].includes(key),
        ) &&
        Number.isSafeInteger(row.level) &&
        (row.level as number) >= 1 &&
        (row.level as number) <= levels.length &&
        ISO(row.builtAt) &&
        ISO(row.collectedAt)
      );
    });
  if (!ok)
    throw Error(
      'Construções do acampamento inválidas. Os dados foram preservados.',
    );
}

/**
 * Production waiting to be collected. Counts whole units since
 * `collectedAt`, never negative if the clock went back, and never more than
 * the free space up to the storage cap.
 */
export function pendingProduction(
  def: BuildingDef,
  state: BuildingState | undefined,
  stock: number,
  now = Date.now(),
) {
  if (!state) return 0;
  // Food has no stock cap of its own (missions also feed it): only the
  // pending amount is capped, so the shed never becomes useless.
  const free = def.produces === 'food' ? STORAGE_CAP : STORAGE_CAP - stock;
  const elapsed = Math.max(0, now - Date.parse(state.collectedAt));
  const produced = Math.floor(
    (def.levels[state.level - 1].perDay * elapsed) / DAY_MS,
  );
  return Math.max(0, Math.min(produced, free));
}
