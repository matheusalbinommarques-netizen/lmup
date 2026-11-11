// C03: a leitura compartilhada não pode mudar o que as telas e as regras veem.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { firstValueFrom, filter, take, toArray } from 'rxjs';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask } from './taskService';
import {
  currentOccurrences,
  ensureOccurrence,
  plannedOccurrences,
  recordProgress,
} from './occurrenceService';
import {
  readAchievementData,
  readAchievementStats,
  refreshAchievementReceipts,
} from './productivityAchievements';
import { refreshCompletionStreak } from './rewardService';
import { journeyQuery, readJourneySnapshot } from './journeyQuery';
import { invalidateHeroModifiersCache } from './gearService';

const start = '2026-11-02';
const time = (day: string) => vi.setSystemTime(new Date(`${day}T12:00:00`));
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  time(start);
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const define = (
  title: string,
  extra: Partial<Parameters<typeof saveTaskDefinition>[0]> = {},
) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: start,
    effort: 'medium',
    ...extra,
  });
async function finish(taskId: number, day: string) {
  const row = await ensureOccurrence(taskId, day);
  await recordProgress({
    occurrenceId: row.id,
    expectedRevision: row.revision,
    requestId: crypto.randomUUID(),
    value: 1,
    executedAt: new Date().toISOString(),
  });
}

/** Rotinas diária e semanal, avulsas, arquivada, concluída e evento legado. */
async function history() {
  const daily = await define('Diária', {
    recurrence: { kind: 'daily', startDate: start },
  });
  const weekly = await define('Semanal', {
    tracking: { method: 'time', target: 30 },
    recurrence: { kind: 'weekdays', startDate: start, days: [1, 4] },
  });
  const once = await define('Avulsa');
  const done = await define('Concluída');
  const archived = await define('Arquivada');
  await db.tasks.update(archived, { archived: true });
  const legacy = await define('Legada', {
    recurrence: { kind: 'daily', startDate: start },
  });
  for (const day of ['2026-11-02', '2026-11-03', '2026-11-05']) {
    time(day);
    await finish(daily, day);
  }
  time('2026-11-05');
  await completeTask(done);
  await db.activityEvents.put({
    ...(await db.activityEvents.toCollection().first())!,
    id: 'legacy:sem-ocorrencia',
    taskId: legacy,
    occurrenceId: undefined,
    occurrenceDate: '2026-11-05',
    date: '2026-11-05',
    kind: 'task',
    reversedAt: undefined,
    sequence: 9999,
  });
  time('2026-11-06');
  return { daily, weekly, once, done, archived, legacy };
}

const bigTables = [
  'tasks',
  'occurrences',
  'activityEvents',
  'executionRecords',
  'planVersions',
  'projects',
] as const;
/** Counts full-table reads (Table.toArray); indexed reads are not counted. */
function countFullReads() {
  const counts: Record<string, number> = {};
  for (const name of bigTables) {
    const table = db[name] as unknown as { toArray: () => Promise<unknown> };
    const original = table.toArray.bind(table);
    vi.spyOn(table, 'toArray').mockImplementation(() => {
      counts[name] = (counts[name] ?? 0) + 1;
      return original();
    });
  }
  return counts;
}

it('consultar uma única missão devolve exatamente o recorte da consulta completa', async () => {
  const ids = Object.values(await history());
  for (const day of ['2026-11-05', '2026-11-06', '2026-11-09']) {
    time(day);
    const current = await currentOccurrences(day);
    const planned = await plannedOccurrences('2026-11-01', day);
    for (const id of [...ids, 999]) {
      expect(await currentOccurrences(day, id)).toEqual(
        current.filter((row) => row.taskId === id),
      );
      expect(await plannedOccurrences('2026-11-01', day, id)).toEqual(
        planned.filter((row) => row.taskId === id),
      );
    }
  }
});

it('conquistas e sequência são as mesmas com leitura própria ou compartilhada', async () => {
  await history();
  const own = await readAchievementStats();
  const shared = await db.transaction('r', db.tables, async () =>
    readAchievementStats(await readAchievementData()),
  );
  expect(shared).toEqual(own);
  expect(own?.completedMissions).toBeGreaterThan(0);

  const profile = await db.profile.get(1);
  await db.profile.update(1, { currentStreak: 0, lastCompletionDate: null });
  await refreshCompletionStreak();
  const rebuilt = await db.profile.get(1);
  await db.profile.update(1, { currentStreak: 0, lastCompletionDate: null });
  await db.transaction('rw', db.tables, async () =>
    refreshCompletionStreak({
      events: await db.activityEvents.toArray(),
      occurrences: await db.occurrences.toArray(),
    }),
  );
  const fromShared = await db.profile.get(1);
  expect(fromShared?.currentStreak).toBe(rebuilt?.currentStreak);
  expect(fromShared?.lastCompletionDate).toBe(rebuilt?.lastCompletionDate);
  expect(rebuilt?.currentStreak).toBe(profile?.currentStreak);
});

it('o retrato da jornada lê cada tabela grande uma única vez', async () => {
  await history();
  const counts = countFullReads();
  const snapshot = await readJourneySnapshot();
  for (const name of bigTables) expect(counts[name], name).toBe(1);
  expect(snapshot.plannedToday).toEqual(await currentOccurrences());
  expect(snapshot.achievementStats).toEqual(await readAchievementStats());
});

it('concluir uma missão lê ocorrências e eventos inteiros no máximo duas vezes', async () => {
  const { once } = await history();
  const receipts = await db.achievementReceipts.count();
  const counts = countFullReads();
  const event = await completeTask(once);
  expect(event).toBeTruthy();
  expect(counts.occurrences ?? 0).toBeLessThanOrEqual(2);
  expect(counts.activityEvents ?? 0).toBeLessThanOrEqual(1);
  vi.restoreAllMocks();
  // Mesmo resultado econômico e sem duplicar a conclusão ao repetir.
  expect(await completeTask(once)).toBeNull();
  expect(
    (await db.activityEvents.toArray()).filter((row) => row.id === event!.id),
  ).toHaveLength(1);
  expect(await db.achievementReceipts.count()).toBeGreaterThanOrEqual(receipts);
  await refreshAchievementReceipts();
  const ids = (await db.achievementReceipts.toArray()).map((row) => row.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it('telas abertas ao mesmo tempo compartilham uma leitura por mudança', async () => {
  await history();
  const reads = { count: 0 };
  const logs = db.xpLogs as unknown as { toArray: () => Promise<unknown> };
  const original = logs.toArray.bind(logs);
  vi.spyOn(logs, 'toArray').mockImplementation(() => {
    reads.count++;
    return original();
  });
  const first = journeyQuery().pipe(take(2), toArray());
  const second = journeyQuery().pipe(take(2), toArray());
  const both = Promise.all([firstValueFrom(first), firstValueFrom(second)]);
  await firstValueFrom(journeyQuery());
  const before = reads.count;
  await db.areas.add({ nome: 'Nova área', archived: false } as never);
  const [a, b] = await both;
  expect(a.at(-1)).toBe(b.at(-1));
  expect(a.at(-1)!.areas.some((area) => area.nome === 'Nova área')).toBe(true);
  expect(reads.count - before).toBe(1);

  // Quem chega depois recebe o último valor; sem assinantes, a fonte para.
  const late = await firstValueFrom(
    journeyQuery().pipe(filter((value) => value.areas.length > 0)),
  );
  expect(late.areas).toEqual(a.at(-1)!.areas);
});
