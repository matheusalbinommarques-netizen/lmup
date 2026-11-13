import { db, type Profile } from './db';
import {
  BUILDINGS,
  building,
  pendingProduction,
  validateCampBuildings,
  type BuildingId,
  type CampBuildings,
} from '$lib/camp/buildings';
import {
  creditFood,
  creditMaterials,
  spendResources,
  ZERO_MATERIALS,
} from './resourceLedger';
import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';

/**
 * Wave E — build, upgrade and collect. Every gold/material movement goes
 * through the ledger with a receipt:
 * - `camp-building:<id>:<level>` for each level paid (deterministic, so a
 *   repeated click never charges twice);
 * - `camp-production:<id>:<collectedAt>` for each collection.
 */
export const BUILD_ACTION = 'camp-building:build';
const ENTITY = 'camp-building';

function normalMode() {
  if (CAMP_PREVIEW || db.name !== 'LevelMeUpDB')
    throw Error('As construções não operam no banco da demonstração.');
}
function stateOf(profile: Profile): CampBuildings {
  if (profile.campBuildings) validateCampBuildings(profile.campBuildings);
  return profile.campBuildings ?? { version: 1 };
}
const stockOf = (profile: Profile, id: BuildingId) => {
  const produces = building(id).produces;
  return produces === 'food'
    ? (profile.food ?? 0)
    : { ...ZERO_MATERIALS, ...profile.materials }[produces];
};

/** Collects inside the caller's transaction; returns the amount credited. */
async function collectIn(id: BuildingId, now: Date) {
  const profile = (await db.profile.get(1))!;
  const state = stateOf(profile);
  const current = state[id];
  if (!current) throw Error('Esta construção ainda não existe.');
  const def = building(id);
  const amount = pendingProduction(
    def,
    current,
    stockOf(profile, id),
    now.getTime(),
  );
  if (amount > 0) {
    const request = {
      requestId: `camp-production:${id}:${current.collectedAt}`,
      entityId: `${ENTITY}:${id}`,
      details: { building: id, level: current.level },
    };
    if (def.produces === 'food') await creditFood({ ...request, amount });
    else
      await creditMaterials({ ...request, amount: { [def.produces]: amount } });
  }
  // Time with the stock full is not banked: production restarts now.
  const fresh = (await db.profile.get(1))!;
  const next = stateOf(fresh);
  await db.profile.update(1, {
    campBuildings: {
      ...next,
      [id]: { ...next[id]!, collectedAt: now.toISOString() },
    },
  });
  return amount;
}

export async function collectProduction(id: BuildingId, now = new Date()) {
  normalMode();
  return db.transaction('rw', db.profile, db.productivityAudit, () =>
    collectIn(id, now),
  );
}

/**
 * Builds level 1 or upgrades to the next open level. Needs the settlement
 * built and, when listed, the previous building. Upgrading first collects
 * what the old level produced, so nothing is lost or counted twice.
 */
export async function buildOrUpgrade(
  id: BuildingId,
  expectedLevel: number,
  now = new Date(),
) {
  normalMode();
  const def = building(id);
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw Error('Abra sua jornada primeiro.');
    if (!profile.campSettlement?.residenceBuilt)
      throw Error('Construa o acampamento antes.');
    const state = stateOf(profile);
    const level = state[id]?.level ?? 0;
    if (level !== expectedLevel)
      throw Error('A construção mudou em outra aba. Confira de novo.');
    if (def.requires && !state[def.requires])
      throw Error(`Construa primeiro: ${building(def.requires).name}.`);
    const next = def.levels[level];
    if (!next) throw Error(def.lockedNext ?? 'Nível máximo alcançado.');
    if (level > 0) await collectIn(id, now);
    await spendResources({
      requestId: `${ENTITY}:${id}:${level + 1}`,
      entityId: `${ENTITY}:${id}`,
      action: BUILD_ACTION,
      cost: next.cost,
      details: { building: id, level: level + 1 },
    });
    const paid = (await db.profile.get(1))!;
    const after = stateOf(paid);
    const stamp = now.toISOString();
    await db.profile.update(1, {
      campBuildings: {
        ...after,
        [id]: {
          level: level + 1,
          builtAt: after[id]?.builtAt ?? stamp,
          collectedAt: stamp,
        },
      },
    });
    return level + 1;
  });
}

export type BuildingView = {
  id: BuildingId;
  level: number;
  pending: number;
  next: (typeof BUILDINGS)[number]['levels'][number] | null;
  blocked: string | null;
};
/** Read model for the panel; pure given a profile and a moment. */
export function buildingViews(profile: Profile | undefined, now = Date.now()) {
  const state = profile?.campBuildings ?? { version: 1 as const };
  return BUILDINGS.map((def): BuildingView => {
    const level = state[def.id]?.level ?? 0;
    const next = def.levels[level] ?? null;
    return {
      id: def.id,
      level,
      pending: profile
        ? pendingProduction(def, state[def.id], stockOf(profile, def.id), now)
        : 0,
      next,
      blocked: !profile?.campSettlement?.residenceBuilt
        ? 'Construa o acampamento antes.'
        : def.requires && !state[def.requires]
          ? `Construa primeiro: ${building(def.requires).name}.`
          : !next
            ? (def.lockedNext ?? 'Nível máximo alcançado.')
            : null,
    };
  });
}
