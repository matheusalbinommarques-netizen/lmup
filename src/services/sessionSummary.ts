import type { ActivityEvent } from './db';
import type { Resources, SavedMissionSession } from './productivityTypes';
import { occurrenceDue, progressTarget } from './productivityRules';
import { calculateReward, ordinaryReward } from './rewardService';
import type { JourneySnapshot } from './journeyQuery';
const zero = (): Resources => ({ xp: 0, gold: 0, food: 0 });
const add = (sum: Resources, value: Resources) => {
  for (const key of ['xp', 'gold', 'food'] as const) sum[key] += value[key];
  return sum;
};
export function summarizeSession(
  session: SavedMissionSession,
  data: Pick<
    JourneySnapshot,
    | 'occurrences'
    | 'tasks'
    | 'events'
    | 'executionRecords'
    | 'profile'
    | 'mods'
    | 'buffs'
  >,
) {
  const ids = new Set(session.occurrenceIds),
    rows = data.occurrences.filter((row) => ids.has(row.id));
  const related = (event: ActivityEvent) =>
    event.occurrenceId
      ? ids.has(event.occurrenceId)
      : rows.some(
          (row) =>
            row.taskId === event.taskId &&
            (!data.tasks.find((task) => task.id === row.taskId)?.recurrence ||
              (event.occurrenceDate ?? event.date) === row.originDate),
        );
  const credits = data.events.filter(
    (event) =>
      ['task', 'review', 'adjustment'].includes(event.kind) && related(event),
  );
  const creditIds = new Set(credits.map((event) => event.id));
  const receipts = [
    ...credits,
    ...data.events.filter(
      (event) =>
        event.sourceEventId &&
        creditIds.has(event.sourceEventId) &&
        !creditIds.has(event.id),
    ),
  ];
  const received = zero(),
    gross = zero(),
    compensation = zero(),
    corrections = zero(),
    atTarget = zero(),
    remaining = zero();
  let milestones = 0;
  for (const event of receipts) {
    add(received, event.reward);
    if (!event.debtAdded) add(gross, event.grossReward ?? event.reward);
    if (event.compensation) add(compensation, event.compensation);
    if (event.debtAdded) add(corrections, event.debtAdded);
    milestones +=
      event.milestoneGold ??
      Math.max(
        0,
        (event.grossReward ?? event.reward).gold - ordinaryReward(event).gold,
      );
  }
  for (const row of rows) {
    const modifiers =
      row.modifiers ??
      (data.profile
        ? calculateReward(row.baseXp, data.profile, data.mods, data.buffs)
            .modifiers
        : undefined);
    const target = occurrenceDue({ ...row, modifiers }, progressTarget(row));
    add(atTarget, target);
    if (!['discarded', 'excused'].includes(row.status))
      for (const key of ['xp', 'gold', 'food'] as const)
        remaining[key] += Math.max(0, target[key] - row.due[key]);
  }
  const projectIds = new Set(rows.map((row) => row.projectId).filter(Boolean));
  const projectBonuses = data.events.filter(
    (event) =>
      ['project', 'adjustment'].includes(event.kind) &&
      projectIds.has(event.projectId) &&
      !related(event),
  );
  return {
    received,
    gross,
    compensation,
    corrections,
    atTarget,
    remaining,
    milestones,
    projectBonuses,
    completed: rows.filter((row) => row.status === 'completed').length,
    partial: rows.filter((row) => row.status !== 'completed' && row.value > 0)
      .length,
    pending: rows.filter(
      (row) =>
        row.value === 0 &&
        !['completed', 'discarded', 'excused'].includes(row.status),
    ).length,
    extraTime: rows.some((row) => row.tracking?.method === 'time'),
    outside: rows
      .filter(
        (row) =>
          row.status === 'completed' &&
          data.executionRecords.some(
            (record) =>
              record.occurrenceId === row.id &&
              record.source === 'individual' &&
              `progress:${record.id}` === row.completionEventId,
          ),
      )
      .map((row) => row.id),
    dates: [...new Set(rows.map((row) => row.originDate))].sort(),
  };
}
