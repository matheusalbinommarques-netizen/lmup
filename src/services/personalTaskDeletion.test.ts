import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { previewTaskRemoval, removeTask } from './taskRemoval';
import { completeTask } from './taskService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { saveRoutine } from './routineService';
import { newSavedSession, saveSession } from './savedSessionService';
import { createHeroProject } from './projectService';
import { ensureWorld } from './worldService';
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
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const create = (title = 'Conteúdo privado para apagar') =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: '2026-11-02',
  });
async function remove(id: number, mode: 'delete' | 'archive' = 'delete') {
  const preview = await previewTaskRemoval(id);
  return removeTask(id, preview.token, crypto.randomUUID(), mode);
}
async function financial() {
  const profile = (await db.profile.get(1))!;
  const unchanged = { ...profile };
  delete unchanged.personalTaskDeletions;
  return {
    profile: unchanged,
    inventory: await db.inventory.toArray(),
    owned: await db.ownedShopItems.toArray(),
    projects: await db.projects.toArray(),
  };
}

describe('exclusão definitiva pessoal', () => {
  it('apaga uma missão concluída com notas sem alterar saldos nem apagar recibos', async () => {
    const id = await create();
    await completeTask(id);
    await db.tasks.update(id, {
      executionNotes: 'Minha nota privada',
      description: 'Minha descrição privada',
    });
    const before = await financial(),
      events = await db.activityEvents.toArray();
    await remove(id);
    expect(await financial()).toEqual(before);
    expect(await db.tasks.get(id)).toBeUndefined();
    expect(await db.occurrences.count()).toBe(0);
    expect(await db.executionRecords.count()).toBe(0);
    expect(await db.planVersions.count()).toBe(0);
    const after = await db.activityEvents.toArray();
    expect(after).toHaveLength(events.length);
    for (const [index, event] of after.entries()) {
      expect(event.reward).toEqual(events[index].reward);
      expect(event.grossReward).toEqual(events[index].grossReward);
      expect(event.taskId).toBeUndefined();
      expect(event.occurrenceId).toBeUndefined();
      expect(event.taskTitle).toBeUndefined();
      expect(event.deletedPersonalTask).toBeTruthy();
    }
    const backup = await createJourneyBackup();
    expect(() =>
      validateBackup(JSON.parse(JSON.stringify(backup))),
    ).not.toThrow();
    const text = JSON.stringify(backup);
    for (const content of [
      'Conteúdo privado para apagar',
      'Minha nota privada',
      'Minha descrição privada',
    ])
      expect(text).not.toContain(content);
  });
  it('permite apagar uma arquivada com histórico e mantém o registro contábil', async () => {
    const id = await create();
    await completeTask(id);
    await remove(id, 'archive');
    expect((await db.tasks.get(id))!.archived).toBe(true);
    const before = await financial();
    await remove(id);
    expect(await db.tasks.get(id)).toBeUndefined();
    expect(await financial()).toEqual(before);
    expect(await db.activityEvents.count()).toBe(1);
  });
  it('retira somente os vínculos da missão de rotinas, sessões e projetos', async () => {
    const projectId = await createHeroProject({ name: 'Projeto preservado' });
    const id = await saveTaskDefinition({
      title: 'Apagar vinculada',
      requestId: 'delete-linked',
      projectId,
      plannedDate: '2026-11-02',
    });
    const other = await saveTaskDefinition({
      title: 'Outra preservada',
      requestId: 'keep-linked',
      projectId,
      plannedDate: '2026-11-02',
    });
    await saveRoutine({
      id: 'day',
      name: 'Rotina preservada',
      days: [1],
      startDate: '2026-11-02',
      entries: [
        { taskId: id, time: null },
        { taskId: other, time: null },
      ],
    });
    const row = await ensureOccurrence(id),
      keep = await ensureOccurrence(other);
    const session = await saveSession(
      newSavedSession('Sequência preservada', [row.id, keep.id]),
    );
    const otherTask = await db.tasks.get(other),
      project = await db.projects.get(projectId);
    await remove(id);
    expect(await db.tasks.get(other)).toEqual(otherTask);
    expect(await db.projects.get(projectId)).toEqual(project);
    expect(
      (await db.routines.get('day'))!.entries.map((entry) => entry.taskId),
    ).toEqual([other]);
    expect(
      (await db.savedMissionSessions.get(session.id))!.occurrenceIds,
    ).toEqual([keep.id]);
    expect(await db.occurrences.get(keep.id)).toEqual(keep);
    await restoreJourneyBackup(await createJourneyBackup());
    expect(await db.tasks.get(other)).toEqual(otherTask);
  });
  it('limpa recuperações locais e impede ressurreição ao restaurar um backup antigo', async () => {
    const id = await create(),
      other = await create('Independente preservada');
    await completeTask(id);
    const old = await createJourneyBackup();
    await restoreJourneyBackup(old); // creates an internal recovery snapshot
    await remove(id);
    expect(JSON.stringify(await db.recoverySnapshots.toArray())).not.toContain(
      'Conteúdo privado para apagar',
    );
    await restoreJourneyBackup(old);
    expect(await db.tasks.get(id)).toBeUndefined();
    expect((await db.tasks.get(other))!.title).toBe('Independente preservada');
    expect((await db.profile.get(1))!.personalTaskDeletions).toHaveLength(1);
    const restored = await createJourneyBackup();
    expect(() => validateBackup(restored)).not.toThrow();
    expect(JSON.stringify(restored)).not.toContain(
      'Conteúdo privado para apagar',
    );
  });
  it('preserva correções, débitos e compensações após apagar o progresso pessoal', async () => {
    const id = await saveTaskDefinition({
      title: 'Progresso privado',
      requestId: 'private-partial',
      effort: 'micro',
      plannedDate: '2026-11-02',
      tracking: { method: 'time', target: 30 },
    });
    const row = await ensureOccurrence(id);
    for (const [revision, value, correction] of [
      [0, 30, false],
      [1, 15, true],
    ] as const)
      await recordProgress({
        occurrenceId: row.id,
        expectedRevision: revision,
        value,
        correction,
        requestId: `partial-${revision}`,
        executedAt: new Date().toISOString(),
      });
    const before = await financial();
    await remove(id);
    expect(await financial()).toEqual(before);
    const copy = await createJourneyBackup();
    expect(() => validateBackup(copy)).not.toThrow();
    await restoreJourneyBackup(copy);
    expect((await db.profile.get(1))!.rewardDebt).toEqual(
      before.profile.rewardDebt,
    );
    const another = await create('Nova missão independente');
    await completeTask(another);
    expect((await db.profile.get(1))!.rewardDebt).toEqual({
      xp: 0,
      gold: 0,
      food: 0,
    });
  });
  it('não altera Mundo ou Védria e recusa origem narrativa explícita', async () => {
    await ensureWorld();
    await db.profile.update(1, { rpgPilot: { scene: 2 } });
    const id = await create('Missão pessoal com qualquer nome');
    const before = (await db.profile.get(1))!;
    await remove(id);
    const after = (await db.profile.get(1))!;
    expect(after.world).toEqual(before.world);
    expect(after.rpgPilot).toEqual(before.rpgPilot);
    const story = await create('História identificada por origem');
    await db.tasks.update(story, { source: 'story' });
    const preview = await previewTaskRemoval(story);
    expect(preview.canDelete).toBe(false);
    await expect(
      removeTask(story, preview.token, 'protected-story', 'delete'),
    ).rejects.toThrow('história');
    expect(await db.tasks.get(story)).toBeTruthy();
  });
  it('é idempotente, recusa confirmação desatualizada e não recria o mesmo cadastro', async () => {
    const id = await create();
    const task = (await db.tasks.get(id))!;
    const stale = await previewTaskRemoval(id);
    await db.tasks.update(id, { executionNotes: 'Mudança concorrente' });
    await expect(
      removeTask(id, stale.token, 'stale', 'delete'),
    ).rejects.toThrow('mudou');
    const current = await previewTaskRemoval(id);
    await Promise.all([
      removeTask(id, current.token, 'same', 'delete'),
      removeTask(id, current.token, 'same', 'delete'),
    ]);
    expect((await db.profile.get(1))!.personalTaskDeletions).toHaveLength(1);
    await expect(
      saveTaskDefinition({
        title: 'Cadastro atrasado de outra aba',
        requestId: task.creationKey!,
      }),
    ).rejects.toThrow('excluída');
  });
  it('reverte toda a limpeza se a transação falhar, inclusive recibos e recuperações', async () => {
    const id = await create();
    await completeTask(id);
    const before = await createJourneyBackup();
    const preview = await previewTaskRemoval(id);
    const fail = () => {
      throw Error('Falha final simulada');
    };
    db.productivityAudit.hook('creating', fail);
    try {
      await expect(
        removeTask(id, preview.token, 'rollback', 'delete'),
      ).rejects.toThrow('Falha final');
    } finally {
      db.productivityAudit.hook('creating').unsubscribe(fail);
    }
    expect((await createJourneyBackup()).data).toEqual(before.data);
  });
  it('recusa recibos desvinculados que reintroduzam conteúdo ou percam o registro de exclusão', async () => {
    const id = await create();
    await completeTask(id);
    await remove(id);
    const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
    const content = structuredClone(copy);
    content.data.activityEvents[0].taskTitle = 'Título reinserido';
    expect(() => validateBackup(content)).toThrow('desvinculado');
    delete copy.data.profile.personalTaskDeletions;
    expect(() => validateBackup(copy)).toThrow('desvinculado');
  });
});
