// Lote 3: the optional timer stores the real start and the measured minutes
// on the execution record. Rewards, balances and progress must not change.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { completeTask, undoTask } from './taskService';
import { createJourneyBackup, validateBackup } from './backupDataService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

async function mission(method: 'direct' | 'quantity' = 'direct') {
  const id = await saveTaskDefinition({
    title: 'Pagar conta de luz',
    requestId: crypto.randomUUID(),
    effort: 'medium',
    plannedDate: '2026-11-02',
    tracking: method === 'direct' ? undefined : { method, target: 40 },
  });
  return ensureOccurrence(id, '2026-11-02');
}

it('guarda início real e minutos do cronômetro ao concluir', async () => {
  const row = await mission();
  const event = await completeTask(row.taskId, {
    minutes: 12.5,
    startedAt: '2026-11-02T14:40:00',
  });
  expect(event).not.toBeNull();
  const [record] = await db.executionRecords.toArray();
  expect(record.startedAt).toBe(new Date('2026-11-02T14:40:00').toISOString());
  expect(record.minutes).toBe(12.5);
  expect((await db.occurrences.get(row.id))!.actualMinutes).toBe(12.5);
});

it('a recompensa e o saldo são os mesmos com ou sem cronômetro', async () => {
  const plain = await mission();
  const timed = await mission();
  const a = await completeTask(plain.taskId);
  const before = (await db.profile.get(1))!;
  const b = await completeTask(timed.taskId, {
    minutes: 30,
    startedAt: '2026-11-02T14:30:00',
  });
  expect(b!.reward).toEqual(a!.reward);
  const after = (await db.profile.get(1))!;
  expect(after.totalXpEarned - before.totalXpEarned).toBe(b!.reward.xp);
  expect(after.gold - before.gold).toBe(b!.reward.gold);
});

it('sem cronômetro o registro não ganha início real', async () => {
  const row = await mission();
  await completeTask(row.taskId);
  const [record] = await db.executionRecords.toArray();
  expect('startedAt' in record).toBe(false);
  expect(record.minutes).toBe(0);
});

it('recusa início real inválido sem gravar nada', async () => {
  const row = await mission('quantity');
  const base = {
    occurrenceId: row.id,
    expectedRevision: 0,
    value: 10,
    executedAt: '2026-11-02T14:00:00',
  };
  for (const startedAt of [
    'ontem',
    '2026-11-02T14:30:00', // after the execution
    '2026-10-31T13:00:00', // more than 24 h before
  ])
    await expect(
      recordProgress({ ...base, requestId: crypto.randomUUID(), startedAt }),
    ).rejects.toThrow('Início real inválido');
  expect(await db.executionRecords.count()).toBe(0);
  expect((await db.occurrences.get(row.id))!.value).toBe(0);
});

it('repetir o mesmo registro parcial não duplica execução nem início', async () => {
  const row = await mission('quantity');
  const input = {
    requestId: 'parte-1',
    occurrenceId: row.id,
    expectedRevision: 0,
    value: 10,
    minutes: 8,
    startedAt: '2026-11-02T13:50:00',
    executedAt: '2026-11-02T14:00:00',
  };
  await recordProgress(input);
  await recordProgress(input);
  expect(await db.executionRecords.count()).toBe(1);
  expect((await db.occurrences.get(row.id))!.actualMinutes).toBe(8);
});

it('desfazer a conclusão vira débito e preserva o registro com início real', async () => {
  const row = await mission();
  const event = await completeTask(row.taskId, {
    minutes: 5,
    startedAt: '2026-11-02T14:50:00',
  });
  await undoTask(row.taskId, event!.id);
  const profile = (await db.profile.get(1))!;
  expect(
    Object.values(profile.rewardDebt ?? {}).some((value) => value > 0),
  ).toBe(true);
  const records = await db.executionRecords.toArray();
  expect(records.some((record) => record.startedAt)).toBe(true);
});

it('o backup aceita início real válido e recusa um adulterado', async () => {
  const row = await mission();
  await completeTask(row.taskId, {
    minutes: 5,
    startedAt: '2026-11-02T14:50:00',
  });
  const copy = await createJourneyBackup();
  expect(() => validateBackup(copy)).not.toThrow();
  const records = (
    copy.data as unknown as { executionRecords: { startedAt?: string }[] }
  ).executionRecords;
  records[0].startedAt = '2026-11-03T10:00:00.000Z';
  expect(() => validateBackup(copy)).toThrow();
});
