import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Dexie from 'dexie';
import { db, LEGACY_STORES, LevelMeUpDB } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  ensureOccurrence,
  plannedOccurrences,
  recordProgress,
  changeOccurrence,
} from './occurrenceService';
import { occurrenceDue, validatePlanning } from './productivityRules';
import { grantReward, revokeRewards } from './rewardService';
import { completeTask, previewTaskUndo, undoTask } from './taskService';
import { configureReview } from './reviewService';
import { saveRoutine, justifyPause } from './routineService';
import { newSavedSession, saveSession } from './savedSessionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import {
  freeSlot,
  recommendations,
  consistency,
  productivityReport,
} from './productivityInsights';
import {
  refreshAchievementReceipts,
  invalidateAchievement,
} from './productivityAchievements';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
it('recusa confirmação com impacto econômico desatualizado sem alterar o débito', async () => {
  const row = await mission();
  await progress(row.id, 40);
  const impact = await previewTaskUndo(row.taskId);
  await progress(row.id, 60);
  const before = await db.profile.get(1);
  await expect(undoTask(row.taskId, undefined, impact)).rejects.toThrow(
    'impacto da correção mudou',
  );
  expect(await db.profile.get(1)).toEqual(before);
});
it('mantém a revisão independente de uma execução única no mesmo dia', async () => {
  const taskId = await saveTaskDefinition({
    title: 'Revisar conhecimento',
    requestId: 'review-independent',
    plannedDate: '2026-11-02',
  });
  await completeTask(taskId);
  await configureReview(taskId, {
    enabled: true,
    intervalDays: 7,
    dueDate: '2026-11-02',
  });
  await completeTask(taskId, { reviewOutcome: 'partial' });
  await completeTask(taskId, { reviewOutcome: 'recalled' });
  expect(
    await db.activityEvents
      .where('taskId')
      .equals(taskId)
      .filter((event) => event.kind === 'review')
      .count(),
  ).toBe(1);
  expect(await db.occurrences.where('taskId').equals(taskId).count()).toBe(1);
});
it('alterações futuras de calendário podem ser desfeitas sem perder ocorrências não iniciadas', async () => {
  const row = await mission();
  const future = await ensureOccurrence(row.taskId, '2026-11-03');
  for (const days of [[1], [1, 2]]) {
    const task = (await db.tasks.get(row.taskId))!;
    await saveTaskDefinition({
      title: task.title,
      requestId: crypto.randomUUID(),
      editId: task.id,
      expectedRevision: task.definitionRevision,
      plannedDate: task.plannedDate,
      recurrence: { kind: 'weekdays', startDate: '2026-11-02', days },
    });
  }
  expect((await db.occurrences.get(future.id))!.status).toBe('planned');
  expect(
    (await plannedOccurrences('2026-11-03', '2026-11-03')).map((row) => row.id),
  ).toEqual([future.id]);
});
it('corrige tempo manual e conserva a soma no histórico e nas estatísticas', async () => {
  const row = await mission('quantity');
  await recordProgress({
    requestId: 'manual-time',
    occurrenceId: row.id,
    expectedRevision: 0,
    value: 20,
    minutes: 30,
    executedAt: '2026-11-02T14:00:00',
  });
  await recordProgress({
    requestId: 'correct-time',
    occurrenceId: row.id,
    expectedRevision: 1,
    value: 10,
    minutes: 15,
    executedAt: '2026-11-02T14:00:00',
    correction: true,
  });
  const updated = (await db.occurrences.get(row.id))!;
  expect(updated.actualMinutes).toBe(15);
  expect(
    productivityReport(
      [updated],
      await db.executionRecords.toArray(),
      [],
      [],
      '2026-11-02',
      '2026-11-02',
    ).minutes,
  ).toBe(15);
  const copy = await createJourneyBackup();
  expect(() => validateBackup(copy)).not.toThrow();
});
async function mission(
  method: 'time' | 'quantity' | 'percentage' | 'steps' | 'direct' = 'time',
) {
  const id = await saveTaskDefinition({
    title: 'Estudar',
    requestId: crypto.randomUUID(),
    effort: 'medium',
    plannedDate: '2026-11-02',
    recurrence: { kind: 'daily', startDate: '2026-11-02' },
    plannedTime: '19:00',
    estimatedMinutes: 45,
    tracking: { method, target: 40 },
    steps: method === 'steps' ? ['A', 'B', 'C', 'D'] : [],
  });
  return ensureOccurrence(id, '2026-11-02');
}
async function progress(id: string, value: number, correction = false) {
  const row = (await db.occurrences.get(id))!;
  return recordProgress({
    requestId: crypto.randomUUID(),
    occurrenceId: id,
    value,
    expectedRevision: row.revision,
    executedAt: '2026-11-02T14:00:00',
    correction,
  });
}
describe('progresso, orçamento e débitos', () => {
  it('premia somente a diferença cumulativa, inclusive arredondamentos de ouro e comida', async () => {
    const row = await mission();
    await progress(row.id, 10);
    const first = await db.profile.get(1);
    await progress(row.id, 24);
    const second = await db.profile.get(1);
    expect(second!.totalXpEarned - first!.totalXpEarned).toBe(37);
    await progress(row.id, 40);
    const completed = (await db.occurrences.get(row.id))!;
    const expected = occurrenceDue(completed);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: expected.xp,
      gold: expected.gold,
      food: expected.food,
    });
    expect(completed.status).toBe('completed');
  });
  it('conserva o mesmo total registrando de uma vez ou em muitas parcelas', async () => {
    const row = await mission();
    for (let value = 1; value <= 60; value++) await progress(row.id, value);
    const current = (await db.occurrences.get(row.id))!;
    expect(current.due).toEqual(occurrenceDue(current, 60));
    expect(current.due.xp).toBe(
      Math.round(150 * current.modifiers!.xpMultiplier),
    );
    expect(current.due.gold).toBe(50);
    expect(current.due.food).toBe(4);
    await progress(row.id, 40000);
    expect((await db.occurrences.get(row.id))!.due).toEqual(current.due);
  });
  it('gera débitos independentes sem retirar saldos e os compensa ao continuar', async () => {
    const row = await mission();
    await progress(row.id, 40);
    const before = (await db.profile.get(1))!;
    await db.profile.update(1, { gold: 0, food: 0 });
    await progress(row.id, 20, true);
    const corrected = (await db.profile.get(1))!;
    expect(corrected.totalXpEarned).toBe(before.totalXpEarned);
    expect(corrected.level).toBe(before.level);
    expect(corrected.rewardDebt).toEqual({ xp: 52, gold: 25, food: 2 });
    const receipt = (await progress(row.id, 40))!;
    expect(receipt.reward).toEqual({ xp: 0, gold: 0, food: 0 });
    expect((await db.profile.get(1))!.rewardDebt).toEqual({
      xp: 0,
      gold: 0,
      food: 0,
    });
    expect((await db.profile.get(1))!.gold).toBe(0);
  });
  it('chamadas concorrentes com o mesmo identificador não duplicam parcelas', async () => {
    const row = await mission();
    const input = {
      requestId: 'same-operation',
      occurrenceId: row.id,
      expectedRevision: 0,
      value: 20,
      executedAt: '2026-11-02T14:00:00',
    };
    await Promise.all([
      recordProgress(input),
      recordProgress(input),
      recordProgress(input),
    ]);
    expect(await db.executionRecords.count()).toBe(1);
    expect(await db.activityEvents.count()).toBe(1);
    await expect(recordProgress({ ...input, value: 30 })).rejects.toThrow(
      'identificador',
    );
  });
  it('correção repetida não gera outro débito e revisão desatualizada é recusada', async () => {
    const row = await mission();
    await progress(row.id, 40);
    const input = {
      requestId: 'same-correction',
      occurrenceId: row.id,
      expectedRevision: 1,
      value: 20,
      executedAt: '2026-11-02T14:00:00',
      correction: true,
    };
    await recordProgress(input);
    const debt = (await db.profile.get(1))!.rewardDebt;
    await recordProgress(input);
    expect((await db.profile.get(1))!.rewardDebt).toEqual(debt);
    await expect(
      recordProgress({ ...input, requestId: 'stale' }),
    ).rejects.toThrow('outra aba');
  });
  it('preserva o prêmio do Refúgio e não o concede novamente após correção', async () => {
    await db.profile.update(1, { totalXpEarned: 2490 });
    const event = (
      await grantReward({ id: 'cross-stage', kind: 'task', baseXp: 100 })
    ).event;
    expect(event.milestoneGold).toBe(200);
    await revokeRewards([event.id]);
    await revokeRewards([event.id]);
    expect((await db.profile.get(1))!.rewardDebt!.gold).toBe(50);
    expect((await db.profile.get(1))!.ecoGoldClaimedUpToStage).toBe(2);
    const next = await grantReward({ id: 'next', kind: 'task', baseXp: 100 });
    expect(next.event.awardedStages).toEqual([]);
  });
  it.each(['quantity', 'percentage', 'steps', 'direct'] as const)(
    'mede %s e conclui ao atingir a meta',
    async (method) => {
      const row = await mission(method);
      const target =
        method === 'quantity'
          ? 40
          : method === 'percentage'
            ? 100
            : method === 'steps'
              ? 4
              : 1;
      await recordProgress({
        requestId: crypto.randomUUID(),
        occurrenceId: row.id,
        expectedRevision: 0,
        value: target,
        checkedSteps: method === 'steps' ? [0, 1, 2, 3] : [],
        executedAt: '2026-11-02T14:00:00',
      });
      expect((await db.occurrences.get(row.id))!.status).toBe('completed');
    },
  );
  it('reagenda sem mudar identidade, orçamento nem data de origem', async () => {
    const row = await mission();
    await progress(row.id, 10);
    const before = (await db.occurrences.get(row.id))!;
    await changeOccurrence(
      row.id,
      before.revision,
      { plannedDate: '2026-11-03', plannedTime: '20:00' },
      'move',
    );
    const agenda = await plannedOccurrences('2026-11-03', '2026-11-03');
    expect(agenda).toHaveLength(2);
    expect(agenda.find((o) => o.id === row.id)).toMatchObject({
      originDate: '2026-11-02',
      plannedDate: '2026-11-03',
      originalTime: '19:00',
      due: before.due,
    });
  });
  it('não aceita execução futura, diminuição silenciosa nem progresso inválido', async () => {
    const row = await mission();
    await progress(row.id, 10);
    await expect(progress(row.id, 5)).rejects.toThrow('correção');
    await expect(
      recordProgress({
        requestId: 'future',
        occurrenceId: row.id,
        expectedRevision: 1,
        value: 20,
        executedAt: '2026-11-03T12:00:00',
      }),
    ).rejects.toThrow('futuro');
    await expect(progress(row.id, NaN)).rejects.toThrow('inválido');
    expect(() => validatePlanning({ plannedTime: '25:00' })).toThrow();
    expect(() =>
      validatePlanning({ tracking: { method: 'time', target: 0 } }),
    ).toThrow();
  });
});
describe('migração aditiva v5 → v6', () => {
  it('preserva IDs, recompensas e snapshot sem reconstruir faltas antigas', async () => {
    const name = `migration-${crypto.randomUUID()}`;
    const old = new Dexie(name);
    old.version(5).stores({
      ...LEGACY_STORES,
      activityEvents:
        'id, sequence, kind, taskId, projectId, sourceEventId, date',
      recoverySnapshots: 'id, createdAt, reason',
      xpLogs: '++id, date, areaId, createdAt, eventId',
    });
    await old.table('tasks').add({
      id: 37,
      title: 'Legado',
      xp: 50,
      rarity: 'common',
      createdAt: '2020-01-01',
      recurrence: { kind: 'daily', startDate: '2020-01-01' },
    });
    old.close();
    const upgraded = new LevelMeUpDB(name);
    await upgraded.open();
    expect((await upgraded.tasks.get(37))!.title).toBe('Legado');
    expect(await upgraded.occurrences.count()).toBe(0);
    expect((await upgraded.planVersions.toArray())[0].effectiveFrom).toBe(
      '2026-11-02',
    );
    expect(
      (await upgraded.recoverySnapshots.get('migration-v5'))!.data.tasks,
    ).toHaveLength(1);
    upgraded.close();
    await Dexie.delete(name);
  });
});
describe('rotinas, sessões e backup', () => {
  it('controla calendário, impede vínculo duplo e restaura planejamento ao desvincular', async () => {
    const first = await mission(),
      second = await mission();
    const routine = {
      id: 'night',
      name: 'Noite produtiva',
      days: [1, 3],
      startDate: '2026-11-02',
      entries: [
        { taskId: first.taskId, time: '18:30' },
        { taskId: second.taskId, time: '19:00' },
      ],
    };
    await saveRoutine(routine);
    expect((await db.tasks.get(first.taskId))!.projectId).toBeNull();
    expect((await db.tasks.get(first.taskId))!.plannedTime).toBe('18:30');
    await expect(saveRoutine({ ...routine, id: 'other' })).rejects.toThrow(
      'outra rotina',
    );
    await saveRoutine({
      ...routine,
      expectedRevision: 1,
      entries: [routine.entries[1]],
    });
    expect(await db.tasks.get(first.taskId)).toMatchObject({
      routineId: null,
      plannedTime: '19:00',
      recurrence: { kind: 'daily' },
    });
  });
  it('várias sessões compartilham progresso e apenas uma permanece em foco', async () => {
    const row = await mission();
    const a = await saveSession(newSavedSession('Primeira', [row.id]));
    const b = await saveSession(newSavedSession('Segunda', [row.id]));
    expect((await db.savedMissionSessions.get(a.id))!.status).toBe('paused');
    expect((await db.savedMissionSessions.get(b.id))!.status).toBe('active');
    await progress(row.id, 20);
    expect(await db.occurrences.count()).toBe(1);
    expect((await db.occurrences.get(row.id))!.value).toBe(20);
    await expect(saveSession({ ...a, cursor: 1 }, a.revision)).rejects.toThrow(
      'outra aba',
    );
  });
  it('pausa auditável não premia nem apaga execução, respeitando cota e idempotência', async () => {
    const row = await mission();
    await justifyPause([row.id], 'Imprevisto', 'pause-1');
    await justifyPause([row.id], 'Imprevisto', 'pause-1');
    expect((await db.occurrences.get(row.id))!.status).toBe('excused');
    expect((await db.profile.get(1))!.totalXpEarned).toBe(0);
    const other = await mission();
    await progress(other.id, 1);
    await expect(
      justifyPause([other.id], 'Imprevisto', 'pause-2'),
    ).rejects.toThrow('sem execução');
  });
  it('exporta e restaura parcelas, débitos, sessões e recusa adulteração', async () => {
    const row = await mission();
    await progress(row.id, 40);
    await progress(row.id, 20, true);
    await saveSession(newSavedSession('Retomar', [row.id]));
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await restoreJourneyBackup(backup);
    expect(
      JSON.parse(JSON.stringify((await createJourneyBackup()).data)),
    ).toEqual(backup.data);
    const bad = structuredClone(backup);
    bad.data.profile.rewardDebt.xp++;
    expect(() => validateBackup(bad)).toThrow('débito');
    const wrong = structuredClone(backup);
    wrong.data.occurrences[0].due.gold++;
    expect(() => validateBackup(wrong)).toThrow('orçamento');
  });
});

describe('proteções de atualização, histórico e indicadores', () => {
  it('mudanças normais não reavaliam a configuração nem modificadores de uma ocorrência premiada', async () => {
    const row = await mission();
    await progress(row.id, 10);
    const before = (await db.occurrences.get(row.id))!;
    const task = (await db.tasks.get(row.taskId))!;
    await saveTaskDefinition({
      title: 'Outra meta futura',
      requestId: crypto.randomUUID(),
      editId: task.id,
      expectedRevision: task.definitionRevision,
      effort: 'deep',
      plannedDate: task.plannedDate,
      recurrence: task.recurrence,
      tracking: { method: 'time', target: 80 },
    });
    await db.profile.update(1, { totalXpEarned: 8000, activeCompanionId: 3 });
    await progress(row.id, 40);
    expect((await db.occurrences.get(row.id))!.modifiers).toEqual(
      before.modifiers,
    );
    expect((await db.occurrences.get(row.id))!.baseXp).toBe(100);
    expect(
      (await plannedOccurrences('2026-11-03', '2026-11-03'))[0],
    ).toMatchObject({ baseXp: 250, tracking: { target: 80 } });
  });
  it('sugestões são determinísticas e não alteram o planejamento', async () => {
    const row = await mission();
    const before = await db.occurrences.get(row.id);
    expect(recommendations([row])).toEqual(recommendations([row]));
    expect(freeSlot([row], row.plannedDate, 30)).toBe('08:00');
    expect(await db.occurrences.get(row.id)).toEqual(before);
  });
  it('recuperação posterior não reescreve pontualidade e pausas não contam como execução', async () => {
    const row = await mission();
    vi.setSystemTime(new Date('2026-11-03T15:00:00'));
    await recordProgress({
      requestId: 'late',
      occurrenceId: row.id,
      expectedRevision: 0,
      value: 40,
      executedAt: '2026-11-03T14:00:00',
    });
    const completed = (await db.occurrences.get(row.id))!;
    expect(completed.recovered).toBe(true);
    expect(consistency([completed], '2026-11-03').streak).toBe(0);
    const report = productivityReport(
      [completed],
      await db.executionRecords.toArray(),
      [],
      [],
      '2026-11-02',
      '2026-11-03',
    );
    expect(report).toMatchObject({ completed: 1, recovered: 1, minutes: 40 });
    expect(report.neglected).toEqual([]);
  });
  it('execução pontual lançada depois conta no dia real, sem mover o último dia da sequência para trás', async () => {
    const row = await mission();
    vi.setSystemTime(new Date('2026-11-03T15:00:00'));
    const today = await ensureOccurrence(row.taskId, '2026-11-03');
    await recordProgress({
      requestId: 'today',
      occurrenceId: today.id,
      expectedRevision: 0,
      value: 40,
      executedAt: '2026-11-03T14:00:00',
    });
    await recordProgress({
      requestId: 'yesterday',
      occurrenceId: row.id,
      expectedRevision: 0,
      value: 40,
      executedAt: '2026-11-02T14:00:00',
    });
    expect((await db.occurrences.get(row.id))!.recovered).toBe(false);
    expect(await db.profile.get(1)).toMatchObject({
      currentStreak: 2,
      lastCompletionDate: '2026-11-03',
    });
  });
  it('recibo de conquista é único, persistente e pode ser invalidado com histórico', async () => {
    const row = await mission();
    await progress(row.id, 40);
    await refreshAchievementReceipts();
    expect(
      await db.achievementReceipts.where('id').equals('primeiro-passo').count(),
    ).toBe(1);
    await progress(row.id, 0, true);
    await refreshAchievementReceipts();
    expect(
      (await db.achievementReceipts.get('primeiro-passo'))!.invalidatedAt,
    ).toBeUndefined();
    await invalidateAchievement(
      'primeiro-passo',
      'Reconhecimento indevido confirmado',
    );
    await refreshAchievementReceipts();
    expect(
      (await db.achievementReceipts.get('primeiro-passo'))!.invalidatedAt,
    ).toBeTruthy();
  });
  it('falha na migração reverte o esquema e permite retomar sem perder registros', async () => {
    const name = `failed-migration-${crypto.randomUUID()}`;
    const old = new Dexie(name);
    old.version(5).stores({
      ...LEGACY_STORES,
      activityEvents:
        'id, sequence, kind, taskId, projectId, sourceEventId, date',
      recoverySnapshots: 'id, createdAt, reason',
      xpLogs: '++id, date, areaId, createdAt, eventId',
    });
    await old.table('tasks').put({
      id: 17,
      title: 'Preservar',
      xp: 50,
      rarity: 'common',
      createdAt: '2020-01-01',
    });
    old.close();
    const failing = new LevelMeUpDB(name);
    const failure = () => {
      throw new Error('Falha sintética de migração');
    };
    failing.planVersions.hook('creating', failure);
    await expect(failing.open()).rejects.toThrow('Falha sintética');
    failing.close();
    const restored = new LevelMeUpDB(name);
    await restored.open();
    expect((await restored.tasks.get(17))!.title).toBe('Preservar');
    expect(await restored.recoverySnapshots.count()).toBe(1);
    restored.close();
    await restored.open();
    expect(await restored.recoverySnapshots.count()).toBe(1);
    restored.close();
    await Dexie.delete(name);
  });
});
