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
}): Promise<{ profile: Profile; event: ActivityEvent; applied: boolean }> {
  if (!Number.isSafeInteger(input.baseXp) || input.baseXp <= 0)
    throw new Error('A recompensa precisa ter XP inteiro e positivo.');
  return progressTransaction(async () => {
    const profile = await ensureProfile();
    const previous = await db.activityEvents.get(input.id);
    if (previous) return { profile, event: previous, applied: false };
    const mods = await buildHeroModifiersFromOwned();
    const buffs = await getActiveCompanionBuffs();
    const { xp, gold, food, total, modifiers, awarded, ecoClaimedBefore } =
      calculateReward(input.baseXp, profile, mods, buffs, input.kind);
    const now = new Date();
    const isExecution = input.kind === 'task' || input.kind === 'review';
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
          now,
          mods.streakProtectionDays,
        )
      : null;
    const updated: Profile = {
      ...profile,
      ...levelFields(total),
      gold: profile.gold + gold,
      food: (profile.food ?? 0) + food,
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
    const events: ActivityEvent[] = [];
    for (const id of new Set(ids)) {
      const event = await db.activityEvents.get(id);
      if (!event || !['task', 'review', 'project'].includes(event.kind))
        throw new Error(
          'Não há registro suficiente para desfazer esta conclusão antiga com segurança.',
        );
      if (!event.reversedAt) events.push(event);
    }
    if (!events.length) return profile;
    const reward = events.reduce(
      (sum, event) => ({
        xp: sum.xp + event.reward.xp,
        gold: sum.gold + event.reward.gold,
        food: sum.food + event.reward.food,
      }),
      { xp: 0, gold: 0, food: 0 },
    );
    if (
      profile.totalXpEarned < reward.xp ||
      profile.gold < reward.gold ||
      (profile.food ?? 0) < reward.food
    ) {
      throw new Error(
        'Parte da recompensa já foi utilizada. O estorno foi cancelado para preservar seus saldos e itens.',
      );
    }
    const now = new Date();
    for (const event of events) {
      await db.activityEvents.update(event.id, {
        reversedAt: now.toISOString(),
      });
      const reversal: ActivityEvent = {
        ...event,
        id: `reversal:${event.id}`,
        kind: 'reversal',
        sequence: await nextSequence(),
        sourceEventId: event.id,
        occurredAt: now.toISOString(),
        date: dateKey(now),
        reward: {
          xp: -event.reward.xp,
          gold: -event.reward.gold,
          food: -event.reward.food,
        },
        awardedStages: [],
        streakBefore: undefined,
        reversedAt: undefined,
      };
      await db.activityEvents.add(reversal);
      const log = await db.xpLogs.where('eventId').equals(event.id).first();
      await db.xpLogs.add({
        date: reversal.date,
        amount: reversal.reward.xp,
        areaId: log?.areaId ?? null,
        createdAt: now,
        eventId: reversal.id,
        kind: 'reversal',
        taskId: event.taskId,
        projectId: event.projectId,
        goldDelta: reversal.reward.gold,
        foodDelta: reversal.reward.food,
      });
    }
    const history = (await db.activityEvents.toArray())
      .filter((event) => event.kind !== 'reversal')
      .sort((a, b) => a.sequence - b.sequence);
    const executions = history.filter((event) => event.streakBefore);
    let streak = executions[0]?.streakBefore ?? {
      currentStreak: profile.currentStreak,
      lastCompletionDate: profile.lastCompletionDate ?? null,
    };
    for (const event of executions.filter((entry) => !entry.reversedAt)) {
      const next = computeStreakWithProtection(
        streak.currentStreak,
        streak.lastCompletionDate,
        new Date(event.occurredAt),
        event.protectionDays,
      );
      streak = {
        currentStreak: next.newStreak,
        lastCompletionDate: next.newLastCompletionDate,
      };
    }
    const claimed = Math.max(
      history[0]?.ecoClaimedBefore ?? 1,
      ...history
        .filter((event) => !event.reversedAt)
        .flatMap((event) => event.awardedStages),
    );
    const updated: Profile = {
      ...profile,
      ...levelFields(profile.totalXpEarned - reward.xp),
      gold: profile.gold - reward.gold,
      food: (profile.food ?? 0) - reward.food,
      ...streak,
      ecoGoldClaimedUpToStage: claimed,
      updatedAt: now,
    };
    await db.profile.put(updated);
    return updated;
  });
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
