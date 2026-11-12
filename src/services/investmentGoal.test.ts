// Fase 1: o objetivo é só um ponteiro; a distância sai sempre dos saldos reais.
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { buyItem } from './shopService';
import { feedCompanion } from './companionService';
import {
  ensureCampSettlement,
  meetCampCaretaker,
} from './campSettlementService';
import { getShopItemById } from '$lib/shop/types';
import {
  chooseInvestmentGoal,
  evaluateGoal,
  isInvestmentGoal,
  listGoalOptions,
  type GoalSnapshot,
} from './investmentGoal';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
  await db.profile.update(1, { gold: 250, food: 40 });
});

async function snapshot(): Promise<GoalSnapshot> {
  return {
    profile: await db.profile.get(1),
    owned: await db.ownedShopItems.toArray(),
    inventory: await db.inventory.toArray(),
    companions: await db.companions.toArray(),
  };
}
const status = async () =>
  evaluateGoal((await db.profile.get(1))?.investmentGoal, await snapshot());

it('lista acampamento, evoluções de companheiro e itens da loja ainda não comprados', async () => {
  const ids = listGoalOptions(await snapshot()).map((row) => row.id);
  expect(ids[0]).toBe('camp:residence');
  expect(ids).toContain('companion:1:2');
  expect(ids).toContain('shop:101');
  await db.profile.update(1, { gold: 5000 });
  await buyItem(getShopItemById(101)!);
  expect(listGoalOptions(await snapshot()).map((row) => row.id)).not.toContain(
    'shop:101',
  );
});

it('escolher o objetivo não mexe em saldos nem cria recibos e mostra a distância real', async () => {
  const audits = await db.productivityAudit.count();
  await chooseInvestmentGoal('shop:101', null);
  expect(await db.profile.get(1)).toMatchObject({ gold: 250, food: 40 });
  expect(await db.productivityAudit.count()).toBe(audits);
  expect(await status()).toMatchObject({
    state: 'progress',
    percent: 50,
    missing: 'Falta: 250 Ouro',
  });
  await db.profile.update(1, { gold: 500 });
  expect(await status()).toMatchObject({
    state: 'ready',
    percent: 100,
    missing: '',
  });
  await buyItem(getShopItemById(101)!);
  expect(await status()).toMatchObject({ state: 'achieved' });
});

it('a barra conta só os recursos que se tem; pré-requisitos impedem "pronto"', async () => {
  await ensureCampSettlement();
  await db.profile.update(1, { gold: 80 });
  await chooseInvestmentGoal('camp:residence', null);
  expect(await status()).toMatchObject({
    state: 'progress',
    percent: 100,
    missing: 'Falta: Conversar com o caseiro',
  });
  await meetCampCaretaker();
  expect(await status()).toMatchObject({ state: 'ready' });
});

it('evolução de companheiro conta a comida investida e o nível exigido', async () => {
  await chooseInvestmentGoal('companion:2:2', null);
  expect(await status()).toMatchObject({
    state: 'progress',
    percent: 40,
    missing: 'Falta: 60 Comida · Nível 5 do personagem',
  });
  await chooseInvestmentGoal('companion:1:2', 'companion:2:2');
  await feedCompanion(1, 40, { requestId: 'cuidado-1', expectedInvested: 0 });
  // A comida investida fica no companheiro: a distância continua honesta.
  expect(await status()).toMatchObject({
    state: 'progress',
    percent: 0,
    missing: 'Falta: 60 Comida',
  });
  await db.profile.update(1, { food: 60 });
  await feedCompanion(1, 60, { requestId: 'cuidado-2', expectedInvested: 40 });
  expect(await status()).toMatchObject({ state: 'achieved' });
});

it('repetir a escolha é seguro, outra aba é detectada e dá para limpar', async () => {
  const first = await chooseInvestmentGoal('shop:101', null);
  expect(await chooseInvestmentGoal('shop:101', null)).toEqual(first);
  await expect(chooseInvestmentGoal('shop:102', null)).rejects.toThrow(
    'outra aba',
  );
  await chooseInvestmentGoal(null, 'shop:101');
  expect((await db.profile.get(1))?.investmentGoal).toBeUndefined();
  await expect(chooseInvestmentGoal('shop:abc', null)).rejects.toThrow();
  expect(await status()).toBeNull();
});

it('objetivo de item que deixou de existir aparece como indisponível, sem quebrar', async () => {
  await db.profile.update(1, {
    investmentGoal: { id: 'shop:999', chosenAt: new Date().toISOString() },
  });
  expect(await status()).toMatchObject({ state: 'unavailable' });
});

it('o backup leva o objetivo e rejeita um objetivo malformado', async () => {
  await chooseInvestmentGoal('shop:101', null);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  await chooseInvestmentGoal(null, 'shop:101');
  await restoreJourneyBackup(backup);
  expect((await db.profile.get(1))?.investmentGoal?.id).toBe('shop:101');
  backup.data.profile.investmentGoal = { id: 'loja', chosenAt: 'x' };
  expect(() => validateBackup(backup)).toThrow('objetivo');
  backup.data.profile.investmentGoal = {
    id: 'shop:101',
    chosenAt: new Date().toISOString(),
    extra: 1,
  };
  expect(() => validateBackup(backup)).toThrow('objetivo');
  expect(
    isInvestmentGoal({ id: 'camp:residence', chosenAt: '2026-11-12' }),
  ).toBe(true);
});
