// Onda D (D1): materiais no razão único. Consistência, duplicação, estorno e backup.
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import {
  InsufficientResources,
  creditMaterials,
  materialsFromReceipts,
  reverseMaterialCredit,
  spendResources,
  MATERIALS,
} from './resourceLedger';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
  await db.profile.update(1, { gold: 100, food: 10 });
});

const tx = <T>(run: () => Promise<T>) =>
  db.transaction('rw', db.profile, db.productivityAudit, run);
const credit = (id: string, amount: Record<string, number>) =>
  tx(() => creditMaterials({ requestId: id, entityId: 'teste', amount }));
const reverse = (id: string) =>
  tx(() => reverseMaterialCredit({ creditId: id, reason: 'teste' }));
const spend = (id: string, cost: Record<string, number>) =>
  tx(() => spendResources({ requestId: id, entityId: 'obra', cost }));
const state = async () => {
  const profile = (await db.profile.get(1))!;
  return {
    materials: profile.materials ?? { wood: 0, stone: 0, ore: 0 },
    debt: profile.materialDebt ?? { wood: 0, stone: 0, ore: 0 },
    gold: profile.gold,
  };
};
/** materials − debt must equal the sum of all receipt deltas. */
async function reconciles() {
  const { materials, debt } = await state();
  const implied = materialsFromReceipts(await db.productivityAudit.toArray());
  for (const key of MATERIALS)
    expect(materials[key] - debt[key], key).toBe(implied[key]);
}

it('creditar soma uma vez e grava recibo; repetir não credita de novo', async () => {
  expect((await credit('caixa:1', { wood: 8 })).repeated).toBe(false);
  expect((await credit('caixa:1', { wood: 8 })).repeated).toBe(true);
  expect((await state()).materials).toEqual({ wood: 8, stone: 0, ore: 0 });
  const receipt = await db.productivityAudit.get('caixa:1');
  expect(receipt?.after).toMatchObject({
    materialDelta: { wood: 8, stone: 0, ore: 0 },
  });
  await expect(
    tx(() =>
      creditMaterials({
        requestId: 'caixa:1',
        entityId: 'outra',
        amount: { wood: 8 },
      }),
    ),
  ).rejects.toThrow('já utilizado');
  await reconciles();
});

it('gastar materiais exige saldo; gasto só de ouro mantém o formato antigo do recibo', async () => {
  await credit('caixa:1', { wood: 8, stone: 6 });
  await expect(spend('obra:1', { wood: 9 })).rejects.toBeInstanceOf(
    InsufficientResources,
  );
  await spend('obra:2', { gold: 50, wood: 5, stone: 6 });
  expect(await state()).toMatchObject({
    gold: 50,
    materials: { wood: 3, stone: 0, ore: 0 },
  });
  await spend('loja:1', { gold: 10 });
  const goldOnly = await db.productivityAudit.get('loja:1');
  expect(goldOnly?.after).not.toHaveProperty('materialDelta');
  expect(goldOnly?.before).toEqual({ gold: 50, food: 10 });
  await reconciles();
});

it('estorno tira o que há em estoque, o resto vira débito pago pelo próximo crédito', async () => {
  await credit('caixa:1', { wood: 8 });
  await spend('obra:1', { wood: 5 });
  await reverse('caixa:1');
  expect(await state()).toMatchObject({
    materials: { wood: 0, stone: 0, ore: 0 },
    debt: { wood: 5, stone: 0, ore: 0 },
  });
  expect((await reverse('caixa:1')).repeated).toBe(true);
  await reconciles();
  await credit('caixa:2', { wood: 8, stone: 6 });
  expect(await state()).toMatchObject({
    materials: { wood: 3, stone: 6, ore: 0 },
    debt: { wood: 0, stone: 0, ore: 0 },
  });
  await reconciles();
  await expect(reverse('obra:1')).rejects.toThrow('não encontrado');
});

it('o backup leva materiais e débito e recusa saldo que não fecha com os recibos', async () => {
  await credit('caixa:1', { ore: 4 });
  await reverse('caixa:1');
  await credit('caixa:2', { wood: 8 });
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await db.profile.update(1, { materials: undefined, materialDebt: undefined });
  await restoreJourneyBackup(backup);
  expect(await state()).toMatchObject({
    materials: { wood: 8, stone: 0, ore: 0 },
    debt: { wood: 0, stone: 0, ore: 0 },
  });
  await reconciles();
  backup.data.profile.materials.wood = 80;
  expect(() => validateBackup(backup)).toThrow('materiais diferem');
  backup.data.profile.materials = { wood: 8, ouro: 1 };
  expect(() => validateBackup(backup)).toThrow('materiais inválidos');
});

it('perfil antigo sem materiais continua válido', async () => {
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(backup.data.profile.materials).toBeUndefined();
  expect(() => validateBackup(backup)).not.toThrow();
});
