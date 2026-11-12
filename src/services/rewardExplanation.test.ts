// "Por que ganhei isso?": a conta sai do recibo e sempre fecha com o ganho líquido.
import { beforeEach, expect, it } from 'vitest';
import { db, type ActivityEvent } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask } from './taskService';
import { explainReward } from './rewardExplanation';

const NO_MODS = { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 };
const receipt = (patch: Partial<ActivityEvent>): ActivityEvent => ({
  id: 'r1',
  kind: 'task',
  sequence: 1,
  occurredAt: '2026-11-12T12:00:00.000Z',
  date: '2026-11-12',
  baseXp: 50,
  reward: { xp: 50, gold: 25, food: 2 },
  grossReward: { xp: 50, gold: 25, food: 2 },
  compensation: { xp: 0, gold: 0, food: 0 },
  milestoneGold: 0,
  modifiers: NO_MODS,
  awardedStages: [],
  ecoClaimedBefore: 1,
  protectionDays: 0,
  ...patch,
});
const labels = (event: ActivityEvent) =>
  explainReward(event)?.rows.map((row) => row.label);

it('missão comum: só o esforço, e o total é o recebido', () => {
  const account = explainReward(receipt({}));
  expect(account?.rows).toEqual([
    { label: 'Esforço Leve', xp: 50, gold: 25, food: 2 },
  ]);
  expect(account?.total).toEqual({ xp: 50, gold: 25, food: 2 });
});

it('bônus, marco e compensação aparecem separados e somam o líquido', () => {
  const event = receipt({
    baseXp: 100,
    modifiers: { xpMultiplier: 1.1, goldMultiplier: 1.2, foodMultiplier: 1 },
    grossReward: { xp: 110, gold: 60 + 100, food: 4 },
    milestoneGold: 100,
    compensation: { xp: 0, gold: 30, food: 1 },
    reward: { xp: 110, gold: 130, food: 3 },
  });
  const account = explainReward(event)!;
  expect(account.rows.map((row) => row.label)).toEqual([
    'Esforço Moderado',
    'Bônus ativos',
    'Marco do Refúgio',
    'Compensação de débito',
  ]);
  expect(account.rows[1]).toMatchObject({ xp: 10, gold: 10, food: 0 });
  expect(account.rows[1].note).toBe(
    'Refúgio, equipamento e companheiro: XP +10% · Ouro +20%',
  );
  expect(account.rows[3]).toMatchObject({ xp: 0, gold: -30, food: -1 });
  expect(account.total).toEqual(event.reward);
});

it('execução parcial vira ajuste explícito, nunca um número escondido', () => {
  const event = receipt({
    occurrenceId: 'o1',
    grossReward: { xp: 25, gold: 13, food: 1 },
    reward: { xp: 25, gold: 13, food: 1 },
  });
  const account = explainReward(event)!;
  expect(labels(event)).toEqual(['Esforço Leve', 'Ajuste registrado']);
  expect(account.rows[1]).toMatchObject({
    xp: -25,
    gold: -12,
    food: -1,
    note: 'Parte proporcional ao progresso desta execução.',
  });
  expect(account.total).toEqual(event.reward);
});

it('recibo antigo sem bruto usa o valor gravado; estorno e conta que não fecha não são explicados', () => {
  const legacy = receipt({
    grossReward: undefined,
    compensation: undefined,
    milestoneGold: undefined,
    reward: { xp: 60, gold: 25, food: 2 },
  });
  expect(explainReward(legacy)?.total).toEqual(legacy.reward);
  expect(explainReward(receipt({ kind: 'reversal' }))).toBeNull();
  expect(
    explainReward(
      receipt({
        grossReward: { xp: 50, gold: 25, food: 2 },
        reward: { xp: 99, gold: 25, food: 2 },
      }),
    ),
  ).toBeNull();
});

it('conclusão real: a conta do recibo gravado fecha', async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
  const id = await saveTaskDefinition({
    title: 'Missão da conta',
    requestId: crypto.randomUUID(),
    effort: 'medium',
  });
  const event = (await completeTask(id))!;
  const account = explainReward(event)!;
  expect(account.rows[0].label).toBe('Esforço Moderado');
  expect(account.total).toEqual(event.reward);
});

beforeEach(() => invalidateHeroModifiersCache());
