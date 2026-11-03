import {
  selectCompanion,
  feedCompanion,
  getActiveCompanionBuffs,
} from './companionService';
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('$lib/camp/cinematic/previewMode', () => ({
  CAMP_PREVIEW: true,
  CAMP_PREVIEW_DB: 'LevelMeUpCampCinematicPreview',
}));
import { db } from './db';
import { initializeJourney } from './profileService';
import { ensureCamp } from './campService';
import {
  ensureCampPreview,
  meetCaretaker,
  buildResidence,
  resetCampPreview,
  setCampSimulationXp,
  BUILD_RECEIPT,
} from './campPreviewService';
import {
  getCampTreeXp,
  isCampCompanionDiscovered,
} from '$lib/camp/cinematic/state';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';
beforeEach(async () => {
  vi.restoreAllMocks();
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
async function ready() {
  await ensureCampPreview();
  return (await meetCaretaker()).campPreview!;
}
async function data() {
  return (await createJourneyBackup()).data;
}
it('provisiona 50 ouro e 120 comida uma vez, sem companheiros descobertos', async () => {
  const p = await ensureCampPreview();
  expect(p.gold).toBe(50);
  expect(p.food).toBe(120);
  expect(p.campPreview!.discoveredCompanionIds).toEqual([]);
  expect(p.activeCompanionId).toBeNull();
  await db.profile.update(1, { gold: 37, food: 111 });
  await ensureCampPreview();
  expect((await db.profile.get(1))!.gold).toBe(37);
  expect(await db.productivityAudit.count()).toBe(1);
});
it('preserva estado, saldo e XP do protótipo anterior sem migrar ou provisionar novamente', async () => {
  await ensureCampPreview();
  const state = {
    version: 1 as const,
    epoch: 'old-demo',
    revision: 7,
    caretakerMet: true,
    residenceBuilt: true,
  };
  await db.profile.update(1, {
    gold: 50,
    food: 93,
    totalXpEarned: 7500,
    campPreview: state,
  });
  await db.productivityAudit.add({
    id: BUILD_RECEIPT,
    entityId: 'camp-preview:residence',
    action: 'camp-preview:build',
    recordedAt: new Date().toISOString(),
    before: {},
    after: { cost: 50 },
  });
  const before = await data();
  await ensureCampPreview();
  await ensureCampPreview();
  expect(await data()).toEqual(before);
  await buildResidence(state);
  expect(await data()).toEqual(before);
});
it('salva uma única compra para Aposentos, Bestiário e Jardim sob envios concorrentes', async () => {
  const state = await ready();
  await Promise.all([buildResidence(state), buildResidence(state)]);
  await buildResidence(state);
  const p = (await db.profile.get(1))!;
  expect(p.gold).toBe(0);
  expect(p.campPreview!.residenceBuilt).toBe(true);
  const receipts = await db.productivityAudit
    .where({ entityId: 'camp-preview:residence' })
    .toArray();
  expect(receipts).toHaveLength(1);
  expect(receipts[0].after).toMatchObject({
    buildings: ['residence', 'bestiary', 'garden'],
  });
});
it('cobra apenas após encontro e saldo suficientes', async () => {
  const p = await ensureCampPreview();
  await expect(buildResidence(p.campPreview!)).rejects.toThrow('caseiro');
  const state = await ready();
  await db.profile.update(1, { gold: 49 });
  const before = await data();
  await expect(buildResidence(state)).rejects.toThrow('50 ouro');
  expect(await data()).toEqual(before);
});
it('reverte construção, saldo e recibo integralmente quando a gravação falha', async () => {
  const state = await ready();
  const before = await data();
  vi.spyOn(db.productivityAudit, 'add').mockRejectedValueOnce(
    Error('falha de gravação'),
  );
  await expect(buildResidence(state)).rejects.toThrow('falha de gravação');
  expect(await data()).toEqual(before);
});
it('recusa inconsistência entre estado e recibo sem cobrar novamente', async () => {
  const state = await ready();
  await db.productivityAudit.add({
    id: BUILD_RECEIPT,
    entityId: 'camp-preview:residence',
    action: 'camp-preview:build',
    recordedAt: new Date().toISOString(),
    before: {},
    after: {},
  });
  await expect(buildResidence(state)).rejects.toThrow('incompatíveis');
  expect((await db.profile.get(1))!.gold).toBe(50);
});
it('simula XP compartilhado sem mudar XP, nível, saldo ou recompensas do perfil sintético', async () => {
  const state = await ready();
  const before = (await db.profile.get(1))!;
  const receipts = await db.productivityAudit.toArray();
  const p = await setCampSimulationXp(12000, state);
  expect(getCampTreeXp(p)).toBe(12000);
  expect(p.totalXpEarned).toBe(before.totalXpEarned);
  expect(p.level).toBe(before.level);
  expect(p.gold).toBe(before.gold);
  expect(p.ecoGoldClaimedUpToStage).toBe(before.ecoGoldClaimedUpToStage);
  expect(await db.productivityAudit.toArray()).toEqual(receipts);
  const restored = await setCampSimulationXp(null, state);
  expect(getCampTreeXp(restored)).toBe(restored.totalXpEarned);
});
it.each([NaN, Infinity, -1, 1.5])(
  'recusa XP de teste inválido %s sem escrita',
  async (xp) => {
    const state = await ready();
    const before = await data();
    await expect(setCampSimulationXp(xp, state)).rejects.toThrow('inválido');
    expect(await data()).toEqual(before);
  },
);
it('reinicia só a demonstração, guarda recuperação e preserva a economia legada opaca', async () => {
  const state = await ready();
  await ensureCamp();
  await buildResidence(state);
  const legacy = structuredClone((await db.profile.get(1))!.camp);
  const before = (await db.profile.get(1))!;
  const updated = await setCampSimulationXp(12000, before.campPreview!);
  await db.tasks.add({
    title: 'Exemplo sintético',
    xp: 10,
    rarity: 'common',
    completed: false,
    createdAt: new Date(),
    areaId: 0,
  });
  const p = await resetCampPreview(updated.campPreview!);
  expect(p.gold).toBe(50);
  expect(p.food).toBe(120);
  expect(p.totalXpEarned).toBe(0);
  expect(p.camp).toEqual(legacy);
  expect(p.campPreview!.residenceBuilt).toBe(false);
  expect(p.campPreview!.caretakerMet).toBe(false);
  expect(p.campPreview!.simulatedXp).toBeUndefined();
  expect(p.campPreview!.discoveredCompanionIds).toEqual([]);
  expect(p.activeCompanionId).toBeNull();
  expect(await db.tasks.count()).toBe(0);
  expect(await db.recoverySnapshots.count()).toBe(1);
  for (const pet of await db.companions.toArray())
    expect(isCampCompanionDiscovered(pet, p)).toBe(false);
  await expect(buildResidence(state)).rejects.toThrow('reiniciada');
  const fresh = (await meetCaretaker()).campPreview!;
  await buildResidence(fresh);
  expect((await db.profile.get(1))!.gold).toBe(0);
  expect(
    await db.productivityAudit
      .where({ entityId: 'camp-preview:residence' })
      .count(),
  ).toBe(1);
});
it('falha no reinício reverte também a recuperação e a limpeza das tabelas', async () => {
  const state = await ready();
  await buildResidence(state);
  const current = (await db.profile.get(1))!.campPreview!;
  const before = await data();
  vi.spyOn(db.profile, 'put').mockRejectedValueOnce(Error('falha no reinício'));
  await expect(resetCampPreview(current)).rejects.toThrow('falha no reinício');
  expect(await data()).toEqual(before);
  expect(await db.recoverySnapshots.count()).toBe(0);
});
it('rejeita segunda confirmação concorrente do reinício e intenções de época antiga', async () => {
  const state = await ready();
  const results = await Promise.allSettled([
    resetCampPreview(state),
    resetCampPreview(state),
  ]);
  expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  expect(await db.recoverySnapshots.count()).toBe(1);
  await expect(setCampSimulationXp(12000, state)).rejects.toThrow('reiniciada');
});
it('restauração de backup conserva compra, saldo e simulação, renovando a época', async () => {
  const state = await ready();
  await buildResidence(state);
  const p = await setCampSimulationXp(7500, state);
  const backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  const after = (await db.profile.get(1))!;
  expect(after.gold).toBe(0);
  expect(after.campPreview!.residenceBuilt).toBe(true);
  expect(getCampTreeXp(after)).toBe(7500);
  expect(after.campPreview!.epoch).not.toBe(p.campPreview!.epoch);
  await expect(buildResidence(state)).rejects.toThrow('restaurada');
});
it('backup sem recibos é recusado antes de modificar dados ou recuperação', async () => {
  const state = await ready();
  await buildResidence(state);
  const backup = await createJourneyBackup();
  backup.data.productivityAudit = [];
  const before = await data();
  await expect(restoreJourneyBackup(backup)).rejects.toThrow('recibos');
  expect(await data()).toEqual(before);
  expect(await db.recoverySnapshots.count()).toBe(0);
});
it('disponibilidade por nível ou seleção ativa não descobre criaturas', async () => {
  const p = await ensureCampPreview();
  const pet = (await db.companions.get(4))!;
  const old = {
    ...p,
    level: 30,
    activeCompanionId: 4,
    campPreview: { ...p.campPreview!, discoveredCompanionIds: undefined },
  };
  expect(isCampCompanionDiscovered({ ...pet, unlocked: false }, old)).toBe(
    false,
  );
  expect(isCampCompanionDiscovered({ ...pet, unlocked: true }, old)).toBe(true);
  expect(isCampCompanionDiscovered({ ...pet, unlocked: true }, p)).toBe(false);
});

it('não permite selecionar, alimentar ou receber bônus de criaturas não descobertas na demonstração', async () => {
  const p = await ensureCampPreview();
  await expect(selectCompanion(1)).rejects.toThrow('não está disponível');
  await expect(feedCompanion(1, 10)).rejects.toThrow('não está disponível');
  await db.profile.update(1, {
    campPreview: { ...p.campPreview!, discoveredCompanionIds: [1] },
  });
  await selectCompanion(1);
  await feedCompanion(1, 10);
  expect((await db.profile.get(1))!.food).toBe(110);
  await resetCampPreview((await db.profile.get(1))!.campPreview!);
  await expect(
    feedCompanion(1, 10, { requestId: 'old-intent', expectedInvested: 0 }),
  ).rejects.toThrow('não está disponível');
  await db.profile.update(1, { activeCompanionId: 1 });
  expect(await getActiveCompanionBuffs()).toBeNull();
  expect((await db.profile.get(1))!.food).toBe(120);
});

it('comandos da integração normal recusam o banco da demonstração', async () => {
  const { ensureCampSettlement, meetCampCaretaker, constructCampSettlement } =
    await import('./campSettlementService');
  const before = await data();
  for (const action of [
    () => ensureCampSettlement(),
    () => meetCampCaretaker(),
    () => constructCampSettlement({ epoch: 'fake', revision: 0 }),
  ])
    await expect(action()).rejects.toThrow('banco da demonstração');
  expect(await data()).toEqual(before);
});
