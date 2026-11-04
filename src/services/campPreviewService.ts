import { db, type Profile } from './db';
import { CAMP_PREVIEW, CAMP_PREVIEW_DB } from '$lib/camp/cinematic/previewMode';
import {
  validateCampPreview,
  type CampPreviewState,
} from '$lib/camp/cinematic/state';
import { createDefaultProfile, initializeJourney } from './profileService';
export const RESIDENCE_PRICE = 50;
export const BUILD_RECEIPT = 'camp-preview:residence:built';
type Expected = Pick<CampPreviewState, 'epoch' | 'revision'>;
function isolated() {
  if (!CAMP_PREVIEW || db.name !== CAMP_PREVIEW_DB)
    throw Error('Operação disponível somente na demonstração isolada.');
}
function stateOf(p: Profile | undefined) {
  if (!p) throw Error('Perfil sintético ausente.');
  validateCampPreview(p.campPreview);
  return p.campPreview;
}
function freshState(): CampPreviewState {
  return {
    version: 1,
    epoch: crypto.randomUUID(),
    revision: 0,
    caretakerMet: false,
    residenceBuilt: false,
    discoveredCompanionIds: [],
  };
}
function sameEpoch(
  state: CampPreviewState,
  expected: Pick<CampPreviewState, 'epoch'>,
) {
  if (state.epoch !== expected.epoch)
    throw Error(
      'A demonstração foi reiniciada ou restaurada. Reabra a confirmação.',
    );
}
async function provisionAudit(gold: number, food: number) {
  await db.productivityAudit.add({
    id: 'camp-preview:provision',
    entityId: 'camp-preview',
    action: 'camp-preview:provision',
    recordedAt: new Date().toISOString(),
    before: {},
    after: { gold, food, synthetic: true },
  });
}
export async function ensureCampPreview() {
  isolated();
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const p = await db.profile.get(1);
    if (!p) throw Error('Abra a jornada sintética primeiro.');
    if (p.campPreview) {
      validateCampPreview(p.campPreview);
      return p;
    }
    const updated = {
      ...p,
      name: 'Herói da demonstração',
      gold: 50,
      food: 120,
      activeCompanionId: null,
      campPreview: freshState(),
    };
    await db.profile.put(updated);
    await provisionAudit(50, 120);
    return updated;
  });
}
export async function meetCaretaker() {
  isolated();
  return db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get(1);
    const state = stateOf(p);
    if (state.caretakerMet) return p!;
    const updated = {
      ...p!,
      campPreview: {
        ...state,
        caretakerMet: true,
        revision: state.revision + 1,
      },
    };
    await db.profile.put(updated);
    return updated;
  });
}
/** Original receipt ID is retained so previous purchases never get charged again. */
export async function buildResidence(expected: Expected) {
  isolated();
  return db.transaction('rw', db.profile, db.productivityAudit, async () => {
    const p = await db.profile.get(1);
    const state = stateOf(p);
    sameEpoch(state, expected);
    const receipt = await db.productivityAudit.get(BUILD_RECEIPT);
    if (state.residenceBuilt && receipt) return p!;
    if (state.residenceBuilt || receipt)
      throw Error(
        'Construção e recibo incompatíveis. Seus dados foram preservados.',
      );
    if (state.revision !== expected.revision)
      throw Error('O acampamento mudou. Reabra a confirmação.');
    if (!state.caretakerMet) throw Error('Converse primeiro com o caseiro.');
    if (!Number.isSafeInteger(p!.gold) || p!.gold < RESIDENCE_PRICE)
      throw Error('Você precisa de 50 ouro para construir o acampamento.');
    const updated = {
      ...p!,
      gold: p!.gold - RESIDENCE_PRICE,
      campPreview: {
        ...state,
        residenceBuilt: true,
        revision: state.revision + 1,
      },
    };
    await db.profile.put(updated);
    await db.productivityAudit.add({
      id: BUILD_RECEIPT,
      entityId: 'camp-preview:residence',
      action: 'camp-preview:build',
      recordedAt: new Date().toISOString(),
      before: { gold: p!.gold, built: false },
      after: {
        gold: updated.gold,
        built: true,
        cost: 50,
        buildings: ['residence', 'bestiary', 'garden'],
        synthetic: true,
      },
    });
    return updated;
  });
}
export async function setCampSimulationXp(
  xp: number | null,
  expected: Pick<CampPreviewState, 'epoch'>,
) {
  isolated();
  if (xp !== null && (!Number.isSafeInteger(xp) || xp < 0))
    throw Error('XP de teste inválido.');
  return db.transaction('rw', db.profile, async () => {
    const p = await db.profile.get(1);
    const state = stateOf(p);
    sameEpoch(state, expected);
    const next = { ...state, revision: state.revision + 1 };
    if (xp === null) delete next.simulatedXp;
    else next.simulatedXp = xp;
    const updated = { ...p!, campPreview: next };
    await db.profile.put(updated);
    return updated;
  });
}
/** Full synthetic restart is atomic; opaque legacy camp and its receipts survive. */
export async function resetCampPreview(expected: Expected) {
  isolated();
  return db.transaction('rw', db.tables, async () => {
    const p = await db.profile.get(1);
    const state = stateOf(p);
    sameEpoch(state, expected);
    if (state.revision !== expected.revision)
      throw Error('A demonstração mudou. Confira o estado antes de reiniciar.');
    const snapshot: Record<string, unknown[]> = {};
    for (const table of db.tables)
      if (table.name !== 'recoverySnapshots')
        snapshot[table.name] = await table.toArray();
    const legacyReceipts = (await db.productivityAudit.toArray()).filter(
      (row) => row.id.startsWith('camp:'),
    );
    await db.recoverySnapshots.add({
      id: 'camp-preview:before-reset:' + crypto.randomUUID(),
      reason: 'before-reset',
      createdAt: new Date().toISOString(),
      data: snapshot,
    });
    for (const table of db.tables)
      if (table.name !== 'recoverySnapshots') await table.clear();
    const updated: Profile = {
      ...createDefaultProfile(),
      name: 'Herói da demonstração',
      gold: 50,
      food: 120,
      activeCompanionId: null,
      campPreview: freshState(),
      ...(p!.camp ? { camp: p!.camp } : {}),
    };
    await db.profile.put(updated);
    if (legacyReceipts.length)
      await db.productivityAudit.bulkAdd(legacyReceipts);
    await provisionAudit(50, 120);
    await initializeJourney();
    return (await db.profile.get(1))!;
  });
}
