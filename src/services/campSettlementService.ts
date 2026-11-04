import { db, type Profile } from './db';
import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';
import { validateCampState } from '$lib/camp/campState';
import {
  validateCampSettlement,
  type CampSettlementState,
} from '$lib/camp/cinematic/settlementState';
export const SETTLEMENT_PRICE = 50;
export const SETTLEMENT_INIT = 'camp-settlement:init';
export const SETTLEMENT_BUILT = 'camp-settlement:built';
type Expected = Pick<CampSettlementState, 'epoch' | 'revision'>;
function normalMode() {
  if (CAMP_PREVIEW || db.name !== 'LevelMeUpDB')
    throw Error('A construção da jornada não opera no banco da demonstração.');
}
function stateOf(profile: Profile | undefined) {
  if (!profile) throw Error('Abra sua jornada primeiro.');
  validateCampSettlement(profile.campSettlement);
  return profile.campSettlement;
}
function sameEpoch(state: CampSettlementState, expected: Expected) {
  if (state.epoch !== expected.epoch)
    throw Error(
      'O acampamento foi restaurado ou reiniciado. Reabra a confirmação.',
    );
}
async function audit(
  id: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
) {
  await db.productivityAudit.add({
    id,
    entityId: 'camp-settlement',
    action,
    recordedAt: new Date().toISOString(),
    before,
    after,
  });
}
/** Adds only settlement metadata. Never provisions money, XP, pets or legacy stock. */
export async function ensureCampSettlement() {
  normalMode();
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const profile = await db.profile.get(1);
    if (!profile) throw Error('Abra sua jornada primeiro.');
    if (profile.campSettlement) {
      validateCampSettlement(profile.campSettlement);
      return profile;
    }
    // Existing legacy settlements keep their access; their stock/receipts are untouched.
    const inherited = !!profile.camp;
    if (profile.camp) {
      validateCampState(profile.camp);
      if (
        !(await db.productivityAudit.get(`camp:${profile.camp.worldId}:init`))
      )
        throw Error(
          'O acampamento existente está sem recibo. Preserve um backup antes de continuar.',
        );
    }
    const state: CampSettlementState = {
      version: 1,
      epoch: crypto.randomUUID(),
      revision: 0,
      caretakerMet: inherited,
      residenceBuilt: inherited,
    };
    const updated = { ...profile, campSettlement: state };
    await db.profile.put(updated);
    await audit(SETTLEMENT_INIT, 'camp-settlement:initialize', null, {
      inherited,
      provisionedGold: 0,
    });
    if (inherited)
      await audit(SETTLEMENT_BUILT, 'camp-settlement:inherit', null, {
        source: 'legacy',
        cost: 0,
      });
    return updated;
  });
}
export async function meetCampCaretaker() {
  normalMode();
  return db.transaction('rw', db.profile, async () => {
    const profile = await db.profile.get(1),
      state = stateOf(profile);
    if (state.caretakerMet) return profile!;
    const updated = {
      ...profile!,
      campSettlement: {
        ...state,
        caretakerMet: true,
        revision: state.revision + 1,
      },
    };
    await db.profile.put(updated);
    return updated;
  });
}
export async function constructCampSettlement(expected: Expected) {
  normalMode();
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const profile = await db.profile.get(1),
      state = stateOf(profile);
    sameEpoch(state, expected);
    const receipt = await db.productivityAudit.get(SETTLEMENT_BUILT);
    if (state.residenceBuilt && receipt) return profile!;
    if (state.residenceBuilt || receipt)
      throw Error(
        'Construção e recibo incompatíveis. Os dados foram preservados.',
      );
    if (state.revision !== expected.revision)
      throw Error('O acampamento mudou. Reabra a confirmação.');
    if (!state.caretakerMet) throw Error('Converse primeiro com o caseiro.');
    if (
      !Number.isSafeInteger(profile!.gold) ||
      profile!.gold < SETTLEMENT_PRICE
    )
      throw Error('Você precisa de 50 ouro para construir o acampamento.');
    const updated = {
      ...profile!,
      gold: profile!.gold - SETTLEMENT_PRICE,
      campSettlement: {
        ...state,
        residenceBuilt: true,
        revision: state.revision + 1,
      },
    };
    await db.profile.put(updated);
    await audit(
      SETTLEMENT_BUILT,
      'camp-settlement:build',
      { gold: profile!.gold },
      {
        gold: updated.gold,
        source: 'purchase',
        cost: SETTLEMENT_PRICE,
        buildings: ['residence', 'bestiary', 'garden'],
      },
    );
    return updated;
  });
}
