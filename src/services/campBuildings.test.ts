// Onda E: serraria e campo de caça (V0.2). Recibos, produção offline, estorno e backup.
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import {
  constructCampSettlement,
  ensureCampSettlement,
  meetCampCaretaker,
} from './campSettlementService';
import {
  buildOrUpgrade,
  buildingViews,
  collectProduction,
} from './campBuildingsService';
import {
  creditMaterials,
  InsufficientResources,
  materialsFromReceipts,
  MATERIALS,
} from './resourceLedger';
import { DAY_MS } from '$lib/camp/buildings';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const T0 = new Date('2026-11-12T10:00:00.000Z');
const at = (days: number) => new Date(T0.getTime() + days * DAY_MS);

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
  await db.profile.update(1, { gold: 5000, food: 0 });
});
async function settle() {
  await ensureCampSettlement();
  const met = await meetCampCaretaker();
  await constructCampSettlement(met.campSettlement!);
}
const profile = async () => (await db.profile.get(1))!;
const wood = async () => (await profile()).materials?.wood ?? 0;
async function giveMaterials(amount: Record<string, number>) {
  await db.transaction('rw', db.profile, db.productivityAudit, () =>
    creditMaterials({
      requestId: `teste:${crypto.randomUUID()}`,
      entityId: 'teste',
      amount,
    }),
  );
}
async function reconciles() {
  const p = await profile();
  const implied = materialsFromReceipts(await db.productivityAudit.toArray());
  for (const key of MATERIALS)
    expect((p.materials?.[key] ?? 0) - (p.materialDebt?.[key] ?? 0)).toBe(
      implied[key],
    );
}

it('a serraria pede o acampamento construído e cobra 150 ouro uma vez', async () => {
  await expect(buildOrUpgrade('sawmill', 0, T0)).rejects.toThrow('acampamento');
  await settle();
  const gold = (await profile()).gold;
  expect(await buildOrUpgrade('sawmill', 0, T0)).toBe(1);
  expect((await profile()).gold).toBe(gold - 150);
  expect(
    await db.productivityAudit.get('camp-building:sawmill:1'),
  ).toBeTruthy();
  // Clique repetido com o estado antigo não cobra de novo.
  await expect(buildOrUpgrade('sawmill', 0, T0)).rejects.toThrow('outra aba');
  expect((await profile()).gold).toBe(gold - 150);
});

it('produz 10 madeira por dia offline, até 60, e coletar credita uma vez', async () => {
  await settle();
  await buildOrUpgrade('sawmill', 0, T0);
  expect(buildingViews(await profile(), at(1).getTime())[0].pending).toBe(10);
  expect(buildingViews(await profile(), at(2.5).getTime())[0].pending).toBe(25);
  expect(buildingViews(await profile(), at(30).getTime())[0].pending).toBe(60);
  // Relógio para trás não gera produção negativa.
  expect(buildingViews(await profile(), at(-3).getTime())[0].pending).toBe(0);
  expect(await collectProduction('sawmill', at(1))).toBe(10);
  expect(await collectProduction('sawmill', at(1))).toBe(0);
  expect(await wood()).toBe(10);
  // Estoque perto do limite: só cabe o que falta para 60.
  await giveMaterials({ wood: 45 });
  expect(await collectProduction('sawmill', at(3))).toBe(5);
  expect(await wood()).toBe(60);
  expect(await collectProduction('sawmill', at(4))).toBe(0);
  await reconciles();
});

it('campo de caça pede a serraria, gasta madeira e produz comida', async () => {
  await settle();
  await expect(buildOrUpgrade('hunting', 0, T0)).rejects.toThrow('Serraria');
  await buildOrUpgrade('sawmill', 0, T0);
  await expect(buildOrUpgrade('hunting', 0, T0)).rejects.toBeInstanceOf(
    InsufficientResources,
  );
  expect((await profile()).campBuildings?.hunting).toBeUndefined();
  await collectProduction('sawmill', at(2));
  await buildOrUpgrade('hunting', 0, at(2));
  expect(await wood()).toBe(8);
  expect(await collectProduction('hunting', at(4))).toBe(8);
  expect((await profile()).food).toBe(8);
  const receipt = (await db.productivityAudit.toArray()).find((row) =>
    row.id.startsWith('camp-production:hunting:'),
  );
  expect(receipt?.after).toMatchObject({ foodDelta: 8 });
  await reconciles();
});

it('melhorar coleta antes o que o nível antigo produziu; nível 3 fica fechado', async () => {
  await settle();
  await buildOrUpgrade('sawmill', 0, T0);
  await giveMaterials({ wood: 30, stone: 20 });
  // 1 dia no nível 1 = 10 madeira coletadas antes de pagar 40.
  expect(await buildOrUpgrade('sawmill', 1, at(1))).toBe(2);
  expect(await wood()).toBe(0);
  expect(buildingViews(await profile(), at(2).getTime())[0].pending).toBe(15);
  await expect(buildOrUpgrade('sawmill', 2, at(2))).rejects.toThrow('ferro');
  expect(buildingViews(await profile())[0].blocked).toContain('ferro');
  await reconciles();
});

it('backup leva as construções e recusa nível sem recibo', async () => {
  await settle();
  await buildOrUpgrade('sawmill', 0, T0);
  await collectProduction('sawmill', at(2));
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await db.profile.update(1, { campBuildings: undefined });
  await restoreJourneyBackup(backup);
  expect((await profile()).campBuildings?.sawmill?.level).toBe(1);
  expect(await wood()).toBe(20);
  await reconciles();
  backup.data.profile.campBuildings.sawmill.level = 2;
  expect(() => validateBackup(backup)).toThrow('construções diferem');
  backup.data.profile.campBuildings = { version: 1, forja: {} };
  expect(() => validateBackup(backup)).toThrow();
});
