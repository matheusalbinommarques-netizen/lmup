import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type ActivityEvent } from './db';
import type { Occurrence } from './productivityTypes';
import { initializeJourney } from './profileService';
import { refreshCompletionStreak } from './rewardService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});

let seq = 0;
function event(id: string, extra: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id,
    kind: 'task',
    sequence: ++seq,
    date: '2026-10-01',
    occurredAt: '2026-10-01T12:00:00Z',
    baseXp: 10,
    reward: { xp: 10, gold: 5, food: 0 },
    modifiers: { xpMultiplier: 1, goldMultiplier: 1, foodMultiplier: 1 },
    awardedStages: [],
    ecoClaimedBefore: 0,
    protectionDays: 0,
    ...extra,
  };
}
function occurrence(
  id: string,
  day: string,
  extra: Partial<Occurrence> = {},
): Occurrence {
  return {
    id,
    taskId: 1,
    originDate: day,
    plannedDate: day,
    originalTime: null,
    title: id,
    areaId: 0,
    baseXp: 10,
    steps: [],
    checkedSteps: [],
    value: 0,
    due: { xp: 10, gold: 5, food: 0 },
    status: 'completed',
    completedLocalDate: day,
    revision: 1,
    ...extra,
  } as Occurrence;
}
async function streak() {
  const p = await db.profile.get(1);
  return [p?.currentStreak, p?.lastCompletionDate];
}
async function seed(events: ActivityEvent[], rows: Occurrence[]) {
  await db.profile.update(1, { currentStreak: 99, lastCompletionDate: 'x' });
  await db.activityEvents.bulkAdd(events);
  await db.occurrences.bulkAdd(rows);
}

describe('refreshCompletionStreak (caracterização)', () => {
  it('recalcula com conclusões diretas, de ocorrência, estornadas, sem evento e legadas', async () => {
    await seed(
      [
        event('base', {
          date: '2026-10-01',
          streakBefore: { currentStreak: 0, lastCompletionDate: null },
        }),
        event('direct', {
          date: '2026-10-02',
          streakBefore: { currentStreak: 1, lastCompletionDate: '2026-10-01' },
        }),
        event('reversed', {
          date: '2026-10-04',
          reversedAt: '2026-10-04T13:00:00Z',
          streakBefore: { currentStreak: 3, lastCompletionDate: '2026-10-03' },
        }),
        event('occ-normal', {
          occurrenceId: 'o1',
          date: '2026-10-03',
          streakBefore: { currentStreak: 2, lastCompletionDate: '2026-10-02' },
        }),
        event('occ-protected', {
          occurrenceId: 'o2',
          date: '2026-10-06',
          protectionDays: 2,
        }),
      ],
      [
        occurrence('o1', '2026-10-03', { completionEventId: 'occ-normal' }),
        occurrence('o2', '2026-10-06', { completionEventId: 'occ-protected' }),
        occurrence('o3', '2026-10-07', { completionEventId: 'sumiu' }),
        occurrence('o4', '2026-10-08'),
        occurrence('o5', '2026-10-09', { status: 'planned' }),
      ],
    );
    await refreshCompletionStreak();
    expect(await streak()).toEqual([5, '2026-10-08']);
  });

  it('sem histórico com streakBefore, o perfil não muda', async () => {
    await seed([event('a')], [occurrence('o1', '2026-10-03')]);
    await refreshCompletionStreak();
    expect(await streak()).toEqual([99, 'x']);
  });

  it('não faz leituras por ocorrência em activityEvents', async () => {
    await seed(
      [
        event('base', {
          streakBefore: { currentStreak: 0, lastCompletionDate: null },
        }),
        event('e1', { occurrenceId: 'o1', date: '2026-10-02' }),
        event('e2', { occurrenceId: 'o2', date: '2026-10-03' }),
      ],
      [
        occurrence('o1', '2026-10-02', { completionEventId: 'e1' }),
        occurrence('o2', '2026-10-03', { completionEventId: 'e2' }),
      ],
    );
    const get = vi.spyOn(db.activityEvents, 'get');
    await refreshCompletionStreak();
    expect(get).not.toHaveBeenCalled();
  });
});
