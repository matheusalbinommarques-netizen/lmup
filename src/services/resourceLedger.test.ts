// R1: todo gasto de ouro ou comida passa por spendResources, com recibo.
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import {
  InsufficientResources,
  LEDGER_SPEND,
  spendResources,
} from './resourceLedger';
import { buyItem } from './shopService';
import { feedCompanion } from './companionService';
import {
  constructCampSettlement,
  ensureCampSettlement,
  meetCampCaretaker,
  SETTLEMENT_BUILT,
} from './campSettlementService';
import { getShopItemById } from '$lib/shop/types';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import { invalidateHeroModifiersCache } from './gearService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
  await db.profile.update(1, { gold: 1000, food: 300 });
});

const spend = (requestId: string, cost: { gold?: number; food?: number }) =>
  db.transaction('rw', db.profile, db.productivityAudit, () =>
    spendResources({ requestId, entityId: 'teste', cost }),
  );
const ledger = () =>
  db.productivityAudit
    .filter((row) => (row.after as { spent?: unknown })?.spent != null)
    .toArray();

it('desconta uma vez, grava o recibo com saldo antes e depois e não cobra de novo ao repetir', async () => {
  const first = await spend('gasto:1', { gold: 120, food: 30 });
  expect(first.repeated).toBe(false);
  expect(await db.profile.get(1)).toMatchObject({ gold: 880, food: 270 });
  const again = await spend('gasto:1', { gold: 120, food: 30 });
  expect(again.repeated).toBe(true);
  expect(await db.profile.get(1)).toMatchObject({ gold: 880, food: 270 });
  const [row] = await ledger();
  expect(row).toMatchObject({
    id: 'gasto:1',
    action: LEDGER_SPEND,
    before: { gold: 1000, food: 300 },
    after: { gold: 880, food: 270, spent: { gold: 120, food: 30 } },
  });
});

it('saldo insuficiente, custo inválido ou id reutilizado não mudam nada', async () => {
  await expect(spend('gasto:caro', { gold: 1001 })).rejects.toBeInstanceOf(
    InsufficientResources,
  );
  await expect(spend('gasto:fome', { food: 301 })).rejects.toThrow('comida');
  for (const cost of [{ gold: -1 }, { gold: 1.5 }, {}, { gold: 0 }])
    await expect(spend('gasto:x', cost)).rejects.toThrow('Custo inválido');
  await spend('gasto:a', { gold: 10 });
  await expect(
    db.transaction('rw', db.profile, db.productivityAudit, () =>
      spendResources({
        requestId: 'gasto:a',
        entityId: 'outro',
        cost: { gold: 10 },
      }),
    ),
  ).rejects.toThrow('já utilizado');
  expect(await db.profile.get(1)).toMatchObject({ gold: 990, food: 300 });
  expect(await ledger()).toHaveLength(1);
});

it('se a operação falha depois do gasto, saldo e recibo voltam juntos', async () => {
  await expect(
    db.transaction('rw', db.profile, db.productivityAudit, async () => {
      await spendResources({
        requestId: 'gasto:falho',
        entityId: 'teste',
        cost: { gold: 200 },
      });
      throw Error('falha depois');
    }),
  ).rejects.toThrow('falha depois');
  expect((await db.profile.get(1))?.gold).toBe(1000);
  expect(await db.productivityAudit.get('gasto:falho')).toBeUndefined();
});

it('loja, cuidado de companheiro e residência gravam recibo e fecham com o saldo', async () => {
  await db.profile.update(1, { gold: 5000 });
  const item = getShopItemById(105)!;
  expect(await buyItem(item)).toEqual({ ok: true });
  expect(await buyItem(item)).toEqual({ ok: true, code: 'already_owned' });
  await feedCompanion(1, 100, { requestId: 'cuidado-1', expectedInvested: 0 });
  await feedCompanion(1, 100, { requestId: 'cuidado-1', expectedInvested: 0 });
  await ensureCampSettlement();
  await meetCampCaretaker();
  await constructCampSettlement((await db.profile.get(1))!.campSettlement!);
  await constructCampSettlement((await db.profile.get(1))!.campSettlement!);

  const rows = await ledger();
  const spent = rows.reduce(
    (sum, row) => {
      const value = (row.after as { spent: { gold: number; food: number } })
        .spent;
      return { gold: sum.gold + value.gold, food: sum.food + value.food };
    },
    { gold: 0, food: 0 },
  );
  const profile = (await db.profile.get(1))!;
  expect(rows.map((row) => row.entityId).sort()).toEqual([
    'camp-settlement',
    'companion:1',
    'shop-item:105',
  ]);
  expect(spent.gold).toBe(item.price + 50);
  expect(profile.gold).toBe(5000 - spent.gold);
  expect(profile.food).toBe(300 - spent.food);
  // O recibo da residência mantém id, ação e formato de antes.
  expect(await db.productivityAudit.get(SETTLEMENT_BUILT)).toMatchObject({
    entityId: 'camp-settlement',
    action: 'camp-settlement:build',
    after: { source: 'purchase', cost: 50 },
  });
});

it('backup leva os recibos e restaurar não cobra de novo', async () => {
  await db.profile.update(1, { gold: 5000 });
  await buyItem(getShopItemById(105)!);
  await feedCompanion(1, 100, { requestId: 'cuidado-2', expectedInvested: 0 });
  const backup = await createJourneyBackup();
  expect(() => validateBackup(backup)).not.toThrow();
  const before = await db.profile.get(1);
  await restoreJourneyBackup(JSON.parse(JSON.stringify(backup)));
  expect(await db.profile.get(1)).toMatchObject({
    gold: before!.gold,
    food: before!.food,
  });
  expect(await ledger()).toHaveLength(2);
  await feedCompanion(1, 100, { requestId: 'cuidado-2', expectedInvested: 0 });
  expect((await db.profile.get(1))?.food).toBe(before!.food);
});
