// Onda D (D2): caixas de suprimentos (V0.2 aprovada em 12/11/2026).
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db, type ActivityEvent } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask, undoTask } from './taskService';
import { revokeRewards } from './rewardService';
import {
  boxAmount,
  boxDays,
  openSupplyBox,
  supplyBoxStatus,
} from './supplyBoxes';
import {
  materialsFromReceipts,
  spendResources,
  MATERIALS,
} from './resourceLedger';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

const TODAY = '2026-11-12';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${TODAY}T15:00:00`));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
  // Sem companheiro: XP da missão = XP-base, contas exatas.
  await db.profile.update(1, { activeCompanionId: null });
  invalidateHeroModifiersCache();
});
afterEach(() => vi.useRealTimers());

const event = (date: string, xp: number, extra: Partial<ActivityEvent> = {}) =>
  ({
    id: `e:${date}:${xp}:${Math.random()}`,
    kind: 'task',
    sequence: 1,
    occurredAt: `${date}T12:00:00.000Z`,
    date,
    baseXp: xp,
    reward: { xp, gold: 0, food: 0 },
    modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
    awardedStages: [],
    ecoClaimedBefore: 1,
    protectionDays: 0,
    ...extra,
  }) as ActivityEvent;

it('uma caixa a cada 400 XP, no máximo 5 por dia, e o resto abaixo de 400 passa para o dia seguinte', () => {
  const days = boxDays([
    event('2026-11-10', 350),
    event('2026-11-11', 100),
    event('2026-11-11', 300),
    event('2026-11-12', 2600),
  ]);
  expect(days.map((day) => [day.date, day.earned, day.progress])).toEqual([
    ['2026-11-10', 0, 350],
    // 350 do dia anterior + 400 = 750 → 1 caixa, 350 de progresso.
    ['2026-11-11', 1, 350],
    // Depois da 5ª caixa nada mais no dia, e nada acumula.
    ['2026-11-12', 5, 0],
  ]);
  // Estorno e correção para baixo diminuem o XP do dia.
  expect(
    boxDays([
      event('2026-11-12', 800),
      event('2026-11-12', 400, { reversedAt: '2026-11-12T16:00:00Z' }),
      event('2026-11-12', 0, {
        kind: 'adjustment',
        debtAdded: { xp: 100, gold: 0, food: 0 },
      }),
    ])[0],
  ).toMatchObject({ xp: 700, earned: 1, progress: 300 });
});

it('valor por caixa: 100%, 75% e depois 50% da base escolhida', () => {
  expect([1, 2, 3, 4, 5].map((index) => boxAmount(index, 'wood'))).toEqual([
    8, 6, 4, 4, 4,
  ]);
  expect(boxAmount(1, 'stone')).toBe(6);
  expect(boxAmount(2, 'ore')).toBe(3);
  expect(() => boxAmount(6, 'wood')).toThrow();
});

async function complete(effort: 'deep' | 'large' | 'medium', title: string) {
  const id = await saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    effort,
    plannedDate: TODAY,
  });
  return { id, event: (await completeTask(id))! };
}
const materials = async () => (await db.profile.get(1))?.materials;
async function reconciles() {
  const profile = (await db.profile.get(1))!;
  const implied = materialsFromReceipts(await db.productivityAudit.toArray());
  for (const key of MATERIALS)
    expect(
      (profile.materials?.[key] ?? 0) - (profile.materialDebt?.[key] ?? 0),
    ).toBe(implied[key]);
}

it('abrir credita o material escolhido uma vez; caixa não ganha é recusada', async () => {
  await complete('deep', 'Intensa 1');
  await complete('large', 'Exigente 1');
  const status = await supplyBoxStatus(TODAY);
  expect(status.today).toMatchObject({ xp: 400, earned: 1, opened: 0 });
  expect(status.available).toEqual([{ date: TODAY, index: 1, factor: 1 }]);
  await openSupplyBox({ date: TODAY, index: 1, material: 'stone' });
  expect(
    (await openSupplyBox({ date: TODAY, index: 1, material: 'wood' })).repeated,
  ).toBe(true);
  expect(await materials()).toEqual({ wood: 0, stone: 6, ore: 0 });
  await expect(
    openSupplyBox({ date: TODAY, index: 2, material: 'wood' }),
  ).rejects.toThrow('não está disponível');
  expect((await supplyBoxStatus(TODAY)).available).toEqual([]);
  await reconciles();
});

it('desfazer a missão estorna a caixa aberta; material gasto vira débito; refazer libera de novo', async () => {
  await complete('deep', 'Intensa 1');
  const { id } = await complete('large', 'Exigente 1');
  await openSupplyBox({ date: TODAY, index: 1, material: 'wood' });
  await db.transaction('rw', db.profile, db.productivityAudit, () =>
    spendResources({
      requestId: 'obra:1',
      entityId: 'obra',
      cost: { wood: 5 },
    }),
  );
  await undoTask(id);
  const profile = (await db.profile.get(1))!;
  expect(profile.materials).toEqual({ wood: 0, stone: 0, ore: 0 });
  expect(profile.materialDebt).toEqual({ wood: 5, stone: 0, ore: 0 });
  expect((await supplyBoxStatus(TODAY)).today).toMatchObject({
    earned: 0,
    opened: 0,
  });
  await reconciles();
  // Nova missão no mesmo dia: a caixa volta e paga o débito primeiro.
  await complete('large', 'Exigente 2');
  await openSupplyBox({ date: TODAY, index: 1, material: 'wood' });
  expect(await db.profile.get(1)).toMatchObject({
    materials: { wood: 3, stone: 0, ore: 0 },
    materialDebt: { wood: 0, stone: 0, ore: 0 },
  });
  await reconciles();
});

it('restaurar backup não cria caixas nem duplica as abertas', async () => {
  await complete('deep', 'Intensa 1');
  await complete('large', 'Exigente 1');
  await openSupplyBox({ date: TODAY, index: 1, material: 'ore' });
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await restoreJourneyBackup(backup);
  await restoreJourneyBackup(backup);
  const status = await supplyBoxStatus(TODAY);
  expect(status.today).toMatchObject({ earned: 1, opened: 1 });
  expect(status.available).toEqual([]);
  expect(await materials()).toEqual({ wood: 0, stone: 0, ore: 4 });
  await reconciles();
});

it('desfazer missão sem data (estorno direto do recibo) também estorna a caixa', async () => {
  const ids: number[] = [];
  for (const [effort, title] of [
    ['deep', 'Sem data 1'],
    ['large', 'Sem data 2'],
  ] as const) {
    const id = await saveTaskDefinition({
      title,
      requestId: crypto.randomUUID(),
      effort,
    });
    await completeTask(id);
    ids.push(id);
  }
  expect((await supplyBoxStatus(TODAY)).today.earned).toBe(1);
  await openSupplyBox({ date: TODAY, index: 1, material: 'ore' });
  await undoTask(ids[1]);
  expect((await supplyBoxStatus(TODAY)).today).toMatchObject({
    earned: 0,
    opened: 0,
  });
  expect(await materials()).toEqual({ wood: 0, stone: 0, ore: 0 });
  await reconciles();
});

it('estorno direto do recibo (revisões e conclusões antigas) também estorna a caixa', async () => {
  await complete('deep', 'Intensa 1');
  const { event } = await complete('large', 'Exigente 1');
  await openSupplyBox({ date: TODAY, index: 1, material: 'wood' });
  await revokeRewards([event.id]);
  expect((await supplyBoxStatus(TODAY)).today).toMatchObject({
    earned: 0,
    opened: 0,
  });
  expect(await materials()).toEqual({ wood: 0, stone: 0, ore: 0 });
  await reconciles();
});
