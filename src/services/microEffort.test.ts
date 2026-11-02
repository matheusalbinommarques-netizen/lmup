import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { EFFORTS, effortDefinition } from './effort';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask } from './taskService';
import {
  ensureOccurrence,
  plannedOccurrences,
  recordProgress,
} from './occurrenceService';
import { occurrenceDue } from './productivityRules';
import { saveRoutine } from './routineService';
import { newSavedSession, saveSession } from './savedSessionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const create = (tracking = false) =>
  saveTaskDefinition({
    title: 'Beber água',
    requestId: crypto.randomUUID(),
    effort: 'micro',
    plannedDate: '2026-11-02',
    recurrence: { kind: 'daily', startDate: '2026-11-02' },
    ...(tracking ? { tracking: { method: 'time' as const, target: 40 } } : {}),
  });
async function progress(id: string, value: number, correction = false) {
  const row = (await db.occurrences.get(id))!;
  return recordProgress({
    occurrenceId: id,
    expectedRevision: row.revision,
    requestId: crypto.randomUUID(),
    value,
    correction,
    executedAt: new Date().toISOString(),
  });
}

describe('Microação no motor existente', () => {
  it('acrescenta 10 XP sem mudar os quatro tiers nem o padrão Leve', async () => {
    expect(EFFORTS.map(({ key, xp, rarity }) => [key, xp, rarity])).toEqual([
      ['micro', 10, 'common'],
      ['small', 50, 'common'],
      ['medium', 100, 'rare'],
      ['large', 150, 'epic'],
      ['deep', 250, 'legendary'],
    ]);
    expect(effortDefinition('micro').label).toBe('Microação');
    const id = await saveTaskDefinition({
      title: 'Padrão preservado',
      requestId: crypto.randomUUID(),
    });
    expect(await db.tasks.get(id)).toMatchObject({ effort: 'small', xp: 50 });
  });
  it('conclui individualmente com modificadores e não premia cliques repetidos', async () => {
    const id = await create();
    const events = await Promise.all([
      completeTask(id),
      completeTask(id),
      completeTask(id),
    ]);
    expect(events.filter(Boolean)).toHaveLength(1);
    const row = (await db.occurrences.toArray())[0];
    expect(row).toMatchObject({ baseXp: 10, status: 'completed' });
    expect(row.due).toEqual(occurrenceDue(row));
    expect(row.due.gold).toBe(5);
    expect(row.due.food).toBe(1);
    expect((await db.profile.get(1))!.totalXpEarned).toBe(row.due.xp);
    expect(await db.activityEvents.count()).toBe(1);
  });
  it('rotina, agenda, sessões e execução individual compartilham a ocorrência', async () => {
    const id = await create();
    await saveRoutine({
      id: 'morning',
      name: 'Manhã',
      days: [1, 2],
      startDate: '2026-11-02',
      entries: [{ taskId: id, time: '08:00' }],
    });
    const [today] = await plannedOccurrences('2026-11-02', '2026-11-02');
    const row = await ensureOccurrence(id, today.originDate);
    await saveSession(newSavedSession('Sessão', [row.id]));
    await completeTask(id);
    expect((await db.occurrences.get(row.id))!.status).toBe('completed');
    await completeTask(id);
    expect(await db.activityEvents.count()).toBe(1);
    vi.setSystemTime(new Date('2026-11-03T15:00:00'));
    const [tomorrow] = await plannedOccurrences('2026-11-03', '2026-11-03');
    expect(tomorrow.id).not.toBe(row.id);
    await completeTask(id);
    expect(await db.activityEvents.count()).toBe(2);
  });
  it('mantém parcelas zero e arredondamento cumulativo sem recompensa extra', async () => {
    const id = await create(true),
      row = await ensureOccurrence(id);
    await progress(row.id, 1);
    expect((await db.occurrences.get(row.id))!.due).toEqual({
      xp: 0,
      gold: 0,
      food: 0,
    });
    for (const value of [10, 20, 30, 40]) await progress(row.id, value);
    const done = (await db.occurrences.get(row.id))!;
    const receipts = await db.activityEvents.toArray();
    for (const key of ['xp', 'gold', 'food'] as const)
      expect(receipts.reduce((sum, event) => sum + event.reward[key], 0)).toBe(
        done.due[key],
      );
    expect(done.due).toEqual(occurrenceDue(done, 40));
  });
  it('correção e retomada usam os débitos existentes sem pagar duas vezes', async () => {
    const id = await create(true),
      row = await ensureOccurrence(id);
    await progress(row.id, 40);
    const before = (await db.profile.get(1))!;
    await progress(row.id, 20, true);
    expect((await db.profile.get(1))!.rewardDebt!.xp).toBeGreaterThan(0);
    await progress(row.id, 40);
    const after = (await db.profile.get(1))!;
    expect(after.totalXpEarned).toBe(before.totalXpEarned);
    expect(after.gold).toBe(before.gold);
    expect(after.rewardDebt).toEqual({ xp: 0, gold: 0, food: 0 });
  });
  it('restaura progresso parcial e sessão com Microação no mesmo schema', async () => {
    const version = db.verno;
    const id = await create(true),
      row = await ensureOccurrence(id);
    await progress(row.id, 20);
    await saveSession(newSavedSession('Retomar', [row.id]));
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await restoreJourneyBackup(backup);
    expect(
      JSON.parse(JSON.stringify((await createJourneyBackup()).data)),
    ).toEqual(backup.data);
    expect(db.verno).toBe(version);
    await progress(row.id, 40);
    expect((await db.occurrences.get(row.id))!.due).toEqual(
      occurrenceDue((await db.occurrences.get(row.id))!),
    );
  });
  it('preserva uma recompensa legada individual ao editar sem escolher outro tier', async () => {
    const id = await db.tasks.add({
      title: 'Cadastro antigo',
      xp: 37,
      rarity: 'common',
      completed: false,
      createdAt: new Date().toISOString(),
    });
    await saveTaskDefinition({
      editId: id,
      expectedRevision: 0,
      title: 'Cadastro antigo revisado',
      requestId: crypto.randomUUID(),
    });
    expect(await db.tasks.get(id)).toMatchObject({ xp: 37, rarity: 'common' });
    expect((await db.tasks.get(id))!.effort).toBeUndefined();
  });
  it('valida o tier no backup sem aceitar XP incoerente nem esforço desconhecido', async () => {
    await create();
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    const wrong = structuredClone(backup);
    wrong.data.tasks[0].xp = 50;
    expect(() => validateBackup(wrong)).toThrow();
    const unknown = structuredClone(backup);
    unknown.data.tasks[0].effort = 'unknown';
    expect(() => validateBackup(unknown)).toThrow();
  });
});
