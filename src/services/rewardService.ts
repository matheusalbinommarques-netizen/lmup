import { db, type ActivityEvent, type ActivityKind, type Profile } from './db';
import { ECO_STAGES, getEcoStageForTotalXp } from './ecoConfig';
import { type HeroModifiers, buildHeroModifiersFromOwned } from './gearService';
import {
  type CompanionBuffs,
  getActiveCompanionBuffs,
} from './companionService';
import { ensureProfile } from './profileService';
import {
  getFoodFromEffectiveXp,
  getLevelStateFromTotalXp,
  getTitleForLevel,
} from './progression';
import { computeStreakWithProtection } from './streakService';
import { settleResources } from './productivityRules';
import { ZERO_RESOURCES, type Resources } from './productivityTypes';

export const progressTransaction = <T>(work: () => Promise<T>) =>
  db.transaction('rw', db.tables, work);

export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function nextSequence(): Promise<number> {
  return (
    ((await db.activityEvents.orderBy('sequence').last())?.sequence ?? 0) + 1
  );
}

function levelFields(total: number) {
  const state = getLevelStateFromTotalXp(total);
  return {
    totalXpEarned: total,
    level: state.level,
    xpCurrent: state.xpIntoLevel,
    xpNext: state.xpForNext,
    title: getTitleForLevel(state.level),
  };
}

export async function grantReward(input: {
  id: string;
  kind: Exclude<ActivityKind, 'reversal'>;
  baseXp: number;
  taskId?: number;
  projectId?: number;
  areaId?: number | null;
  fixedReward?: Resources;
  fixedModifiers?: ActivityEvent['modifiers'];
  occurrenceId?: string;
  countsCompletion?: boolean;
  executedAt?: string;
}): Promise<{ profile: Profile; event: ActivityEvent; applied: boolean }> {
  if (!Number.isSafeInteger(input.baseXp) || input.baseXp <= 0)
    throw new Error('A recompensa precisa ter XP inteiro e positivo.');
  return progressTransaction(async () => {
    const profile = await ensureProfile();
    const previous = await db.activityEvents.get(input.id);
    if (previous) return { profile, event: previous, applied: false };
    const mods = await buildHeroModifiersFromOwned();
    const buffs = await getActiveCompanionBuffs();
    const calculated = calculateReward(
      input.baseXp,
      profile,
      mods,
      buffs,
      input.kind,
    );
    const ordinary = input.fixedReward ?? {
      xp: calculated.xp,
      gold:
        calculated.gold -
        calculated.awarded.reduce(
          (sum, stage) => sum + stage.goldRewardOnEnter,
          0,
        ),
      food: calculated.food,
    };
    const settled = settleResources(
      ordinary,
      profile.rewardDebt ?? ZERO_RESOURCES,
    );
    const total = profile.totalXpEarned + settled.net.xp;
    const ecoClaimedBefore = profile.ecoGoldClaimedUpToStage ?? 1;
    const awarded = ECO_STAGES.filter(
      (stage) =>
        stage.id > ecoClaimedBefore &&
        stage.id <= getEcoStageForTotalXp(total).id,
    );
    const milestoneGold = awarded.reduce(
      (sum, stage) => sum + stage.goldRewardOnEnter,
      0,
    );
    const milestone = settleResources(
      { xp: 0, gold: milestoneGold, food: 0 },
      settled.remaining,
    );
    const xp = settled.net.xp,
      gold = settled.net.gold + milestone.net.gold,
      food = settled.net.food;
    if (
      ![total, profile.gold + gold, (profile.food ?? 0) + food].every(
        Number.isSafeInteger,
      )
    )
      throw new Error('Saldo fora do limite seguro.');
    const modifiers = input.fixedModifiers ?? calculated.modifiers;
    const now = new Date();
    const isExecution =
      (input.kind === 'task' || input.kind === 'review') &&
      input.countsCompletion !== false;
    const event: ActivityEvent = {
      id: input.id,
      kind: input.kind,
      sequence: await nextSequence(),
      occurredAt: now.toISOString(),
      date: dateKey(now),
      taskId: input.taskId,
      projectId: input.projectId,
      baseXp: input.baseXp,
      reward: { xp, gold, food },
      grossReward: {
        xp: ordinary.xp,
        gold: ordinary.gold + milestoneGold,
        food: ordinary.food,
      },
      compensation: {
        ...settled.compensation,
        gold: settled.compensation.gold + milestone.compensation.gold,
      },
      milestoneGold,
      occurrenceId: input.occurrenceId,
      executionComplete: input.countsCompletion,
      progress: { before: profile.totalXpEarned, after: total },
      modifiers,
      awardedStages: awarded.map((stage) => stage.id),
      ecoClaimedBefore,
      protectionDays: mods.streakProtectionDays,
      ...(isExecution
        ? {
            streakBefore: {
              currentStreak: profile.currentStreak,
              lastCompletionDate: profile.lastCompletionDate ?? null,
            },
          }
        : {}),
    };
    const streak = isExecution
      ? computeStreakWithProtection(
          profile.currentStreak,
          profile.lastCompletionDate,
          input.executedAt ? new Date(input.executedAt) : now,
          mods.streakProtectionDays,
        )
      : null;
    const updated: Profile = {
      ...profile,
      ...levelFields(total),
      gold: profile.gold + gold,
      food: (profile.food ?? 0) + food,
      rewardDebt: milestone.remaining,
      ecoGoldClaimedUpToStage: Math.max(
        ecoClaimedBefore,
        ...event.awardedStages,
      ),
      updatedAt: now,
      ...(streak
        ? {
            currentStreak: streak.newStreak,
            lastCompletionDate: streak.newLastCompletionDate,
          }
        : {}),
    };
    await db.profile.put(updated);
    await db.activityEvents.add(event);
    await db.xpLogs.add({
      date: event.date,
      amount: xp,
      areaId: input.areaId ?? null,
      createdAt: now,
      eventId: event.id,
      kind: event.kind,
      taskId: input.taskId,
      projectId: input.projectId,
      goldDelta: gold,
      foodDelta: food,
    });
    return { profile: updated, event, applied: true };
  });
}

export async function revokeRewards(ids: string[]): Promise<Profile> {
  return progressTransaction(async () => {
    const profile = await ensureProfile();
    const debt = { ...(profile.rewardDebt ?? ZERO_RESOURCES) };
    for (const id of new Set(ids)) {
      const event = await db.activityEvents.get(id);
      if (!event || !['task', 'review', 'project'].includes(event.kind))
        throw new Error(
          'Não há registro suficiente para corrigir esta conclusão antiga com segurança.',
        );
      if (event.reversedAt) continue;
      const gross = event.grossReward ?? event.reward;
      // Legacy receipts include the stage prize in gold; preserve it too.
      const stageGold =
        event.milestoneGold ??
        event.awardedStages.reduce(
          (sum, stageId) =>
            sum +
            (ECO_STAGES.find((stage) => stage.id === stageId)
              ?.goldRewardOnEnter ?? 0),
          0,
        );
      const added = {
        xp: gross.xp,
        gold: Math.max(0, gross.gold - stageGold),
        food: gross.food,
      };
      for (const key of ['xp', 'gold', 'food'] as const) {
        debt[key] += added[key];
        if (!Number.isSafeInteger(debt[key]))
          throw new Error('Débito fora do limite seguro.');
      }
      const now = new Date();
      await db.activityEvents.update(id, { reversedAt: now.toISOString() });
      const reversal: ActivityEvent = {
        ...event,
        id: 'reversal:' + id,
        kind: 'reversal',
        sequence: await nextSequence(),
        sourceEventId: id,
        occurredAt: now.toISOString(),
        date: dateKey(now),
        reward: { xp: 0, gold: 0, food: 0 },
        grossReward: undefined,
        compensation: undefined,
        debtAdded: added,
        milestoneGold: 0,
        progress: undefined,
        awardedStages: [],
        streakBefore: undefined,
        reversedAt: undefined,
      };
      await db.activityEvents.add(reversal);
      await db.xpLogs.add({
        date: reversal.date,
        amount: 0,
        createdAt: now,
        eventId: reversal.id,
        kind: 'reversal',
        taskId: event.taskId,
        projectId: event.projectId,
        goldDelta: 0,
        foodDelta: 0,
      });
    }
    const updated = { ...profile, rewardDebt: debt, updatedAt: new Date() };
    await db.profile.put(updated);
    await refreshCompletionStreak();
    return updated;
  });
}

export async function refreshCompletionStreak() {
  const profile = await db.profile.get(1);
  if (!profile) return;
  const history = (await db.activityEvents.toArray())
    .filter((event) => event.streakBefore)
    .sort((a, b) => a.sequence - b.sequence);
  const initial = history[0]?.streakBefore;
  if (!initial) return;
  const completions = history
    .filter((event) => !event.occurrenceId && !event.reversedAt)
    .map((event) => ({ day: event.date, protection: event.protectionDays }));
  for (const row of await db.occurrences.toArray())
    if (row.status === 'completed' && row.completedLocalDate) {
      const event = row.completionEventId
        ? await db.activityEvents.get(row.completionEventId)
        : undefined;
      completions.push({
        day: row.completedLocalDate,
        protection: event?.protectionDays ?? 0,
      });
    }
  let currentStreak = initial.currentStreak,
    lastCompletionDate = initial.lastCompletionDate;
  for (const row of completions.sort((a, b) => a.day.localeCompare(b.day))) {
    const next = computeStreakWithProtection(
      currentStreak,
      lastCompletionDate,
      new Date(`${row.day}T12:00:00`),
      row.protection,
    );
    currentStreak = next.newStreak;
    lastCompletionDate = next.newLastCompletionDate;
  }
  if (
    profile.currentStreak !== currentStreak ||
    profile.lastCompletionDate !== lastCompletionDate
  )
    await db.profile.update(1, { currentStreak, lastCompletionDate });
}

// Ajuste administrativo legado; não é um estorno de missão.
export async function removeManualXp(
  amount: number,
  areaId?: number | null,
): Promise<Profile> {
  if (!Number.isSafeInteger(amount) || amount < 0)
    throw new Error('XP inválido.');
  return progressTransaction(async () => {
    const profile = await ensureProfile();
    const xp = Math.min(amount, profile.totalXpEarned);
    if (!xp) return profile;
    const gold = Math.min(profile.gold, Math.floor(xp * 0.5));
    const now = new Date();
    const event: ActivityEvent = {
      id: `adjustment:${crypto.randomUUID()}`,
      kind: 'adjustment',
      sequence: await nextSequence(),
      occurredAt: now.toISOString(),
      date: dateKey(now),
      baseXp: -xp,
      reward: { xp: -xp, gold: -gold, food: 0 },
      modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
      awardedStages: [],
      ecoClaimedBefore: profile.ecoGoldClaimedUpToStage ?? 1,
      protectionDays: 0,
    };
    const updated = {
      ...profile,
      ...levelFields(profile.totalXpEarned - xp),
      gold: profile.gold - gold,
      updatedAt: now,
    };
    await db.profile.put(updated);
    await db.activityEvents.add(event);
    await db.xpLogs.add({
      date: event.date,
      amount: -xp,
      areaId,
      createdAt: now,
      eventId: event.id,
      kind: 'adjustment',
      goldDelta: -gold,
      foodDelta: 0,
    });
    return updated;
  });
}

export function calculateReward(
  baseXp: number,
  profile: Profile,
  mods: HeroModifiers,
  buffs: CompanionBuffs | null,
  kind: ActivityKind = 'task',
) {
  if (!Number.isSafeInteger(baseXp) || baseXp <= 0)
    throw new Error('A recompensa precisa ter XP inteiro e positivo.');
  const sanctuary = getEcoStageForTotalXp(
    profile.totalXpEarned,
  ).xpBonusMultiplier;
  const modifiers = {
    xpMultiplier:
      (sanctuary + mods.sanctuaryBonusExtraPercent / 100) *
      (1 + (buffs?.xpBonusPercent ?? 0) / 100) *
      (kind === 'task' || kind === 'review'
        ? 1 + (mods.taskXpBonusPercent ?? 0) / 100
        : 1),
    goldMultiplier:
      mods.goldMultiplier * (1 + (buffs?.goldBonusPercent ?? 0) / 100),
    foodMultiplier: 1 + (buffs?.foodBonusPercent ?? 0) / 100,
  };
  const xp = Math.round(baseXp * modifiers.xpMultiplier);
  const total = profile.totalXpEarned + xp;
  if (!Number.isSafeInteger(total))
    throw new Error('O valor de XP ultrapassa o limite permitido.');
  const ecoClaimedBefore = profile.ecoGoldClaimedUpToStage ?? 1;
  const stageAfter = getEcoStageForTotalXp(total).id;
  const awarded = ECO_STAGES.filter(
    (stage) => stage.id > ecoClaimedBefore && stage.id <= stageAfter,
  );
  const gold =
    Math.round(Math.floor(baseXp * 0.5) * modifiers.goldMultiplier) +
    awarded.reduce((sum, stage) => sum + stage.goldRewardOnEnter, 0);
  const food = Math.round(
    getFoodFromEffectiveXp(baseXp) * modifiers.foodMultiplier,
  );
  if (
    ![gold, food, profile.gold + gold, (profile.food ?? 0) + food].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    )
  ) {
    throw new Error('A recompensa ultrapassa o limite permitido de recursos.');
  }
  return { xp, gold, food, total, modifiers, awarded, ecoClaimedBefore };
}
