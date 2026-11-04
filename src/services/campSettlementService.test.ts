import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('$lib/camp/cinematic/previewMode', () => ({
  CAMP_PREVIEW: false,
  CAMP_PREVIEW_DB: 'LevelMeUpCampCinematicPreview',
}));
import { db } from './db';
import { initializeJourney } from './profileService';
import { ensureCamp } from './campService';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';
import {
  ensureCampSettlement,
  meetCampCaretaker,
  constructCampSettlement,
  SETTLEMENT_INIT,
  SETTLEMENT_BUILT,
} from './campSettlementService';
beforeEach(async () => {
  vi.restoreAllMocks();
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
async function snapshot() {
  return {
    profile: await db.profile.get(1),
    audit: await db.productivityAudit.toArray(),
  };
}
async function ready(gold = 100) {
  await db.profile.update(1, { gold });
  await ensureCampSettlement();
  return (await meetCampCaretaker()).campSettlement!;
}
it('inicializa apenas metadados sem provisão, XP, recompensa ou alteração de companhias', async () => {
  const before = (await db.profile.get(1))!;
  const pets = await db.companions.toArray();
  const profile = await ensureCampSettlement();
  const { campSettlement, ...rest } = profile;
  expect(rest).toEqual(before);
  expect(campSettlement?.residenceBuilt).toBe(false);
  expect(await db.companions.toArray()).toEqual(pets);
  expect((await db.productivityAudit.get(SETTLEMENT_INIT))?.after).toEqual({
    inherited: false,
    provisionedGold: 0,
  });
});
it('reabrir não muda saldo, revisão, época ou recibos', async () => {
  await ready(37);
  const before = await snapshot();
  await ensureCampSettlement();
  await meetCampCaretaker();
  expect(await snapshot()).toEqual(before);
});
it('uma compra desconta exatamente 50 e conserva todos os outros campos', async () => {
  const state = await ready();
  const before = (await db.profile.get(1))!;
  const after = await constructCampSettlement(state);
  const { campSettlement: oldState, gold: oldGold, ...oldRest } = before;
  const { campSettlement: newState, gold: newGold, ...newRest } = after;
  expect(oldGold - newGold).toBe(50);
  expect(newRest).toEqual(oldRest);
  expect(newState).toEqual({
    ...oldState,
    residenceBuilt: true,
    revision: oldState!.revision + 1,
  });
  expect(
    (await db.productivityAudit.get(SETTLEMENT_BUILT))?.after,
  ).toMatchObject({
    source: 'purchase',
    cost: 50,
    buildings: ['residence', 'bestiary', 'garden'],
  });
});
it('confirmações simultâneas e repetidas descontam uma única vez', async () => {
  const state = await ready();
  await Promise.all([
    constructCampSettlement(state),
    constructCampSettlement(state),
  ]);
  await constructCampSettlement(state);
  expect((await db.profile.get(1))!.gold).toBe(50);
  expect(
    await db.productivityAudit.where({ entityId: 'camp-settlement' }).count(),
  ).toBe(2);
});
it('reconhece o acampamento legado sem cobrar ou substituir estoque e recibos', async () => {
  await db.profile.update(1, { gold: 37, food: 88, totalXpEarned: 8123 });
  await ensureCamp();
  const before = await snapshot();
  const profile = await ensureCampSettlement();
  expect(profile.gold).toBe(37);
  expect(profile.food).toBe(88);
  expect(profile.totalXpEarned).toBe(8123);
  expect(profile.camp).toEqual(before.profile!.camp);
  expect(profile.campSettlement?.residenceBuilt).toBe(true);
  for (const row of before.audit)
    expect(await db.productivityAudit.get(row.id)).toEqual(row);
  expect((await db.productivityAudit.get(SETTLEMENT_BUILT))?.after).toEqual({
    source: 'legacy',
    cost: 0,
  });
  await constructCampSettlement(profile.campSettlement!);
  expect((await db.profile.get(1))!.gold).toBe(37);
});
it('não herda legado sem recibo nem escreve estado novo', async () => {
  await ensureCamp();
  const p = (await db.profile.get(1))!;
  await db.productivityAudit.delete(`camp:${p.camp!.worldId}:init`);
  const before = await snapshot();
  await expect(ensureCampSettlement()).rejects.toThrow('sem recibo');
  expect(await snapshot()).toEqual(before);
});
it.each([0, 49, -1, NaN])(
  'saldo %s não compra nem cria recibo',
  async (gold) => {
    const state = await ready(gold);
    const before = await snapshot();
    await expect(constructCampSettlement(state)).rejects.toThrow('50 ouro');
    expect(await snapshot()).toEqual(before);
  },
);
it('conversa e revisão atual são exigidas; época antiga é recusada mesmo depois de construir', async () => {
  await db.profile.update(1, { gold: 100 });
  const state = (await ensureCampSettlement()).campSettlement!;
  await expect(constructCampSettlement(state)).rejects.toThrow('caseiro');
  const current = (await meetCampCaretaker()).campSettlement!;
  await expect(constructCampSettlement(state)).rejects.toThrow('mudou');
  await constructCampSettlement(current);
  await expect(
    constructCampSettlement({ ...current, epoch: 'old' }),
  ).rejects.toThrow('restaurado');
});
it('falha no recibo reverte também débito e construção', async () => {
  const state = await ready();
  const before = await snapshot();
  vi.spyOn(db.productivityAudit, 'add').mockRejectedValueOnce(
    Error('falha de gravação'),
  );
  await expect(constructCampSettlement(state)).rejects.toThrow(
    'falha de gravação',
  );
  expect(await snapshot()).toEqual(before);
});
it('falha na inicialização não deixa estado parcial', async () => {
  const before = await snapshot();
  vi.spyOn(db.productivityAudit, 'add').mockRejectedValueOnce(
    Error('falha de gravação'),
  );
  await expect(ensureCampSettlement()).rejects.toThrow('falha de gravação');
  expect(await snapshot()).toEqual(before);
});
it('backup preserva compra e saldo e renova a época para invalidar confirmações antigas', async () => {
  const state = await ready();
  await constructCampSettlement(state);
  const backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  const profile = (await db.profile.get(1))!;
  expect(profile.gold).toBe(50);
  expect(profile.campSettlement?.residenceBuilt).toBe(true);
  expect(profile.campSettlement?.epoch).not.toBe(state.epoch);
  await expect(constructCampSettlement(state)).rejects.toThrow('restaurado');
});
it('backup antigo sem novo campo continua válido, sem migração destrutiva', async () => {
  const backup = await createJourneyBackup();
  await restoreJourneyBackup(backup);
  expect((await db.profile.get(1))!.campSettlement).toBeUndefined();
  expect((await db.profile.get(1))!.gold).toBe(0);
});
it('backup sem recibo ou com simulação no estado normal é recusado sem alterar dados', async () => {
  const state = await ready();
  await constructCampSettlement(state);
  const backup = await createJourneyBackup();
  const before = await snapshot();
  const noReceipt = structuredClone(backup);
  noReceipt.data.productivityAudit = [];
  await expect(restoreJourneyBackup(noReceipt)).rejects.toThrow('recibos');
  const simulation = structuredClone(backup);
  Object.assign(simulation.data.profile!.campSettlement!, {
    simulatedXp: 12000,
  });
  await expect(restoreJourneyBackup(simulation)).rejects.toThrow('inválido');
  expect(await snapshot()).toEqual(before);
});
