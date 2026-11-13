// A12: sequências aleatórias com semente fixa sobre tudo que mexe em saldo.
// Depois de cada operação, saldo, registros e o que é devido precisam fechar.
// Em caso de falha, a mensagem traz semente, passo e as últimas operações.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import { createHeroProject } from './projectService';
import {
  currentOccurrences,
  ensureOccurrence,
  recordProgress,
} from './occurrenceService';
import { completeTask, undoTask } from './taskService';
import { reconcileProductivity } from './productivityLifecycle';
import { skipMission } from './missionActions';
import { progressTarget } from './productivityRules';
import { startSelectedSession } from './savedSessionService';
import { buyItem } from './shopService';
import { feedCompanion } from './companionService';
import {
  constructCampSettlement,
  ensureCampSettlement,
  meetCampCaretaker,
  SETTLEMENT_PRICE,
} from './campSettlementService';
import { SHOP_ITEMS } from '$lib/shop/types';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';
import { addCalendarDays } from './calendar';
import { ordinaryReward } from './rewardService';
import { invalidateHeroModifiersCache } from './gearService';
import { explainReward } from './rewardExplanation';
import { boxDays, openSupplyBox, supplyBoxStatus } from './supplyBoxes';
import { MATERIALS, materialsFromReceipts } from './resourceLedger';

const SEEDS = [1, 2, 3, 4, 5, 6];
const STEPS = 60;
const done: Record<string, number> = {};

type Totals = { xp: number; gold: number; food: number };
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 32;
};
const setDay = (day: string) => vi.setSystemTime(new Date(`${day}T12:00:00`));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setDay('2026-11-02');
});
afterEach(() => vi.useRealTimers());

async function reset() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
}

/** Every unit of XP, gold and food is explained by logs, spending and debt. */
async function violations(baseline: Totals) {
  const profile = (await db.profile.get(1))!;
  const logs = await db.xpLogs.toArray();
  const events = await db.activityEvents.toArray();
  const occurrences = await db.occurrences.toArray();
  const owned = await db.ownedShopItems.toArray();
  const companions = await db.companions.toArray();
  const residence = profile.campSettlement?.residenceBuilt
    ? SETTLEMENT_PRICE
    : 0;
  const spent = {
    gold: owned.reduce((sum, row) => sum + (row.price ?? 0), 0) + residence,
    food: companions.reduce((sum, row) => sum + (row.foodInvested ?? 0), 0),
  };
  const debt = profile.rewardDebt ?? { xp: 0, gold: 0, food: 0 };
  const owed: Totals = { xp: 0, gold: 0, food: 0 };
  for (const row of occurrences) {
    owed.xp += row.due.xp;
    owed.gold += row.due.gold;
    owed.food += row.due.food;
  }
  for (const event of events) {
    owed.gold += event.milestoneGold ?? 0;
    if (event.kind === 'project' && !event.reversedAt) {
      const reward = ordinaryReward(event);
      owed.xp += reward.xp;
      owed.gold += reward.gold;
      owed.food += reward.food;
    }
  }
  const logged = (pick: (row: (typeof logs)[number]) => number | undefined) =>
    logs.reduce((sum, row) => sum + (pick(row) ?? 0), 0);
  const balance: Totals = {
    xp: profile.totalXpEarned,
    gold: profile.gold + spent.gold,
    food: (profile.food ?? 0) + spent.food,
  };
  const log: Totals = {
    xp: logged((row) => row.amount),
    gold: logged((row) => row.goldDelta),
    food: logged((row) => row.foodDelta),
  };
  const found: string[] = [];
  for (const key of ['xp', 'gold', 'food'] as const) {
    if (balance[key] - baseline[key] !== log[key])
      found.push(`saldo ≠ registros (${key})`);
    if (balance[key] - debt[key] !== baseline[key] + owed[key])
      found.push(`saldo − débito ≠ devido (${key})`);
    if (debt[key] < 0) found.push(`débito negativo (${key})`);
  }
  if (profile.gold < 0 || (profile.food ?? 0) < 0) found.push('saldo negativo');
  if (new Set(events.map((row) => row.id)).size !== events.length)
    found.push('evento duplicado');
  const ids = new Set(occurrences.map((row) => row.id));
  for (const session of await db.savedMissionSessions.toArray())
    if (
      session.status !== 'ended' &&
      session.occurrenceIds.some((id) => !ids.has(id))
    )
      found.push('sessão aponta para ocorrência inexistente');
  // Wave D: materials close with their receipts; never more boxes open than earned.
  const audit = await db.productivityAudit.toArray();
  const implied = materialsFromReceipts(audit);
  for (const key of MATERIALS) {
    if (
      (profile.materials?.[key] ?? 0) - (profile.materialDebt?.[key] ?? 0) !==
      implied[key]
    )
      found.push(`materiais ≠ recibos (${key})`);
    if ((profile.materials?.[key] ?? 0) < 0) found.push('material negativo');
  }
  const earned = new Map(boxDays(events).map((row) => [row.date, row.earned]));
  const reversed = new Set(audit.map((row) => row.id));
  const open = new Map<string, number>();
  for (const row of audit)
    if (
      row.id.startsWith('supply-box:') &&
      !row.id.endsWith(':reversal') &&
      !reversed.has(`${row.id}:reversal`)
    ) {
      const date = row.id.split(':')[1];
      open.set(date, (open.get(date) ?? 0) + 1);
    }
  for (const [date, count] of open)
    if (count > (earned.get(date) ?? 0))
      found.push(`caixas abertas > ganhas (${date})`);
  return found;
}
let openedBoxes = 0;

async function play(seed: number) {
  setDay('2026-11-02');
  await reset();
  await db.profile.update(1, { gold: 3000, food: 500 });
  const start = (await db.profile.get(1))!;
  const baseline = {
    xp: start.totalXpEarned,
    gold: start.gold,
    food: start.food ?? 0,
  };
  const random = rng(seed * 104729);
  let day = '2026-11-02';
  const project = (await createHeroProject({
    name: 'Projeto',
    stages: [{ id: 's1', title: 'Etapa' }],
    requestId: crypto.randomUUID(),
  } as never)) as number;
  const tasks: number[] = [];
  const make = async (extra: object) => {
    const id = (await saveTaskDefinition({
      title: 'Missão ' + tasks.length,
      requestId: crypto.randomUUID(),
      plannedDate: day,
      effort: ['micro', 'medium', 'deep'][Math.floor(random() * 3)],
      tracking:
        random() < 0.3 ? { method: 'time', target: 30 } : { method: 'direct' },
      recurrence: null,
      ...extra,
    } as never)) as number;
    tasks.push(id);
    return id;
  };
  const daily = [
    await make({
      recurrence: { kind: 'daily', startDate: day },
      plannedDate: null,
    }),
    await make({
      recurrence: { kind: 'daily', startDate: day },
      plannedDate: null,
    }),
  ];
  await saveRoutine({
    id: 'rotina',
    name: 'Rotina',
    days: [0, 1, 2, 3, 4, 5, 6],
    startDate: day,
    entries: daily.map((taskId) => ({ taskId, time: null })),
  } as never);
  await make({ projectId: project, projectStageId: 's1' });
  await make({ projectId: project, projectStageId: 's1' });
  await make({});

  const trail: string[] = [];
  for (let step = 0; step < STEPS; step++) {
    const pick = random();
    const task = tasks[Math.floor(random() * tasks.length)];
    const rows = await currentOccurrences();
    const row = rows.find((item) => item.taskId === task);
    let op = 'nada';
    try {
      if (pick < 0.2 && row) {
        op = 'concluir';
        await completeTask(task);
      } else if (pick < 0.33 && row) {
        op = 'parcial';
        const saved = await ensureOccurrence(task, row.originDate);
        const target = progressTarget(saved);
        await recordProgress({
          occurrenceId: saved.id,
          expectedRevision: saved.revision,
          requestId: crypto.randomUUID(),
          value: Math.min(target, saved.value + Math.ceil(random() * target)),
          executedAt: new Date().toISOString(),
        });
      } else if (pick < 0.42 && row) {
        op = 'corrigir';
        const saved = await ensureOccurrence(task, row.originDate);
        await recordProgress({
          occurrenceId: saved.id,
          expectedRevision: saved.revision,
          requestId: crypto.randomUUID(),
          value: Math.floor(random() * (saved.value + 1)),
          executedAt: new Date().toISOString(),
          correction: true,
        });
      } else if (pick < 0.5) {
        op = 'desfazer';
        await undoTask(task);
      } else if (pick < 0.58) {
        op = 'pular';
        const id = daily[Math.floor(random() * daily.length)];
        const found = rows.find((item) => item.taskId === id);
        if (found) {
          const saved = await ensureOccurrence(id, found.originDate);
          await skipMission(saved.id, saved.revision, !saved.skipped);
        }
      } else if (pick < 0.65) {
        op = 'sessão';
        const chosen = rows.filter((item) => item.status !== 'completed');
        if (chosen.length) await startSelectedSession(chosen.slice(0, 2));
      } else if (pick < 0.71) {
        op = 'comprar';
        await buyItem(SHOP_ITEMS[Math.floor(random() * SHOP_ITEMS.length)]);
      } else if (pick < 0.77) {
        op = 'alimentar';
        const companion = (await db.companions.toArray())[0];
        if (companion) await feedCompanion(companion.id!, 10);
      } else if (pick < 0.8) {
        op = 'residência';
        const profile = await ensureCampSettlement();
        await meetCampCaretaker();
        await constructCampSettlement(profile.campSettlement!);
      } else if (pick < 0.85) {
        op = 'caixa';
        const box = (await supplyBoxStatus(day)).available[0];
        if (box) {
          await openSupplyBox({
            ...box,
            material: MATERIALS[Math.floor(random() * MATERIALS.length)],
          });
          openedBoxes += 1;
        }
      } else if (pick < 0.92) {
        op = 'dia seguinte';
        day = addCalendarDays(day, 1);
        setDay(day);
        await reconcileProductivity();
      } else {
        op = 'backup';
        await restoreJourneyBackup(
          JSON.parse(JSON.stringify(await createJourneyBackup())),
        );
      }
      trail.push(op);
      done[op] = (done[op] ?? 0) + 1;
    } catch {
      // Refused operations (skipped mission, empty balance...) are expected;
      // what matters is that nothing became inconsistent.
      trail.push(op + '!');
    }
    const found = await violations(baseline);
    if (found.length)
      return `semente ${seed}, passo ${step} (${op}, ${day}): ${found.join('; ')} · últimas: ${trail.slice(-8).join(', ')}`;
  }
  // "Por que ganhei isso?": every grant receipt must have an account that closes.
  for (const event of await db.activityEvents.toArray()) {
    if (!['task', 'review', 'project'].includes(event.kind)) continue;
    explained += 1;
    if (!explainReward(event))
      return `semente ${seed}: a conta do recibo ${event.id} não fecha`;
  }
  return null;
}
let explained = 0;

it('nenhuma sequência de operações deixa saldo, registro ou débito inconsistente', async () => {
  const failures: string[] = [];
  for (const seed of SEEDS) {
    const failure = await play(seed);
    if (failure) failures.push(failure);
  }
  expect(failures).toEqual([]);
  // Each kind of operation really ran at least once, so the check is not vacuous.
  for (const op of [
    'concluir',
    'parcial',
    'corrigir',
    'desfazer',
    'pular',
    'sessão',
    'comprar',
    'alimentar',
    'residência',
    'dia seguinte',
    'backup',
  ])
    expect(done[op] ?? 0, op).toBeGreaterThan(0);
  expect(explained).toBeGreaterThan(0);
  expect(openedBoxes).toBeGreaterThan(0);
}, 240000);
