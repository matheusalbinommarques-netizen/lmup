import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { previewTaskRemoval, removeTask } from './taskRemoval';
import { completeTask } from './taskService';
import {
  ensureOccurrence,
  recordProgress,
  plannedOccurrences,
} from './occurrenceService';
import { saveRoutine } from './routineService';
import { newSavedSession, saveSession } from './savedSessionService';
import { createHeroProject } from './projectService';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';
import { planTask } from './journeyService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) await t.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const create = (title = 'Teste') =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: '2026-11-02',
    tracking: { method: 'direct' },
  });
async function remove(id: number, request = crypto.randomUUID()) {
  const p = await previewTaskRemoval(id);
  return removeTask(id, p.token, request);
}

it('apaga cadastro sem uso e metadados automáticos, mantém saldos e permite restaurar backup', async () => {
  const id = await create();
  await ensureOccurrence(id);
  const before = (await createJourneyBackup()).data.profile;
  const p = await previewTaskRemoval(id);
  expect(p.mode).toBe('delete');
  expect(await removeTask(id, p.token, 'remove:unused')).toBe('delete');
  expect(await removeTask(id, p.token, 'remove:unused')).toBe('delete');
  expect(await db.tasks.get(id)).toBeUndefined();
  expect(await db.occurrences.count()).toBe(0);
  expect(await db.planVersions.count()).toBe(0);
  expect((await createJourneyBackup()).data.profile).toMatchObject(before!);
  expect((await db.profile.get(1))!.personalTaskDeletions).toHaveLength(1);
  await restoreJourneyBackup(await createJourneyBackup());
  expect(await db.tasks.count()).toBe(0);
  expect(db.verno).toBe(6);
});
it('arquiva conclusão sem alterar notas, recibos, recursos, logs e execuções', async () => {
  const id = await create();
  await completeTask(id);
  await db.tasks.update(id, { executionNotes: 'Minha nota preservada' });
  const before = await createJourneyBackup();
  expect((await previewTaskRemoval(id)).mode).toBe('archive');
  await remove(id);
  const after = await createJourneyBackup();
  for (const key of [
    'profile',
    'activityEvents',
    'xpLogs',
    'executionRecords',
    'projects',
  ])
    expect(after.data[key]).toEqual(before.data[key]);
  expect(await db.tasks.get(id)).toMatchObject({
    archived: true,
    executionNotes: 'Minha nota preservada',
  });
  await restoreJourneyBackup(after);
  expect((await db.tasks.get(id))?.archived).toBe(true);
  await expect(completeTask(id)).rejects.toThrow();
});
it('arquivamento de parcial preserva progresso e retira de rotina e sessão sem apagar vínculos históricos', async () => {
  const id = await saveTaskDefinition({
    title: 'Parcial',
    requestId: 'partial',
    plannedDate: '2026-11-02',
    tracking: { method: 'quantity', target: 10 },
  });
  await saveRoutine({
    id: 'routine',
    name: 'Rotina',
    days: [1],
    startDate: '2026-11-02',
    entries: [{ taskId: id, time: '09:00' }],
  });
  const row = await ensureOccurrence(id);
  await recordProgress({
    occurrenceId: row.id,
    value: 3,
    executedAt: new Date().toISOString(),
    expectedRevision: row.revision,
    requestId: 'progress:partial',
  });
  await saveSession(newSavedSession('Sessão', [row.id]));
  const before = await createJourneyBackup();
  const p = await previewTaskRemoval(id);
  expect(p.routines).toBe(1);
  expect(p.sessions).toBe(1);
  await removeTask(id, p.token, 'archive:partial');
  const after = await createJourneyBackup();
  expect(await db.routines.get('routine')).toMatchObject({
    entries: [],
    status: 'paused',
  });
  expect((await db.savedMissionSessions.toArray())[0]).toMatchObject({
    status: 'ended',
    occurrenceIds: [],
  });
  expect(await db.occurrences.get(row.id)).toEqual(
    (before.data.occurrences as any[])[0],
  );
  for (const key of ['profile', 'activityEvents', 'xpLogs', 'executionRecords'])
    expect(after.data[key]).toEqual(before.data[key]);
  await restoreJourneyBackup(after);
});
it('preserva projeto e seus recibos sem concluir ou premiar ao arquivar', async () => {
  const project = await createHeroProject({ name: 'Projeto' });
  const id = await saveTaskDefinition({
    title: 'Vinculada',
    requestId: 'project',
    projectId: project,
  });
  const before = await db.projects.get(project);
  expect((await previewTaskRemoval(id)).mode).toBe('archive');
  await remove(id);
  expect(await db.projects.get(project)).toEqual(before);
  expect(await db.activityEvents.count()).toBe(0);
  expect((await db.tasks.get(id))?.projectId).toBe(project);
  await restoreJourneyBackup(await createJourneyBackup());
});
it('revalida antes de apagar quando outra aba inicia execução e aceita revisão atualizada', async () => {
  const id = await create();
  const p = await previewTaskRemoval(id);
  await completeTask(id);
  await expect(removeTask(id, p.token, 'race')).rejects.toThrow('mudou');
  expect((await db.tasks.get(id))?.archived).not.toBe(true);
  await remove(id);
  expect((await db.tasks.get(id))?.archived).toBe(true);
});
it('duas confirmações simultâneas não duplicam operação nem recompensas', async () => {
  const id = await create();
  const p = await previewTaskRemoval(id);
  await Promise.all([
    removeTask(id, p.token, 'same'),
    removeTask(id, p.token, 'same'),
  ]);
  expect(
    await db.productivityAudit.where('entityId').equals(`task:${id}`).count(),
  ).toBe(1);
  const other = await create('Outra');
  await expect(
    removeTask(other, (await previewTaskRemoval(other)).token, 'same'),
  ).rejects.toThrow('utilizado');
});
it('tirar de hoje mantém o cadastro ativo; arquivar impede novos planos recorrentes', async () => {
  const id = await create();
  await planTask(id, false);
  expect((await db.tasks.get(id))?.archived).not.toBe(true);
  const recurring = await saveTaskDefinition({
    title: 'Diária',
    requestId: 'daily',
    recurrence: { kind: 'daily', startDate: '2026-11-02' },
  });
  await db.tasks.update(recurring, { executionNotes: 'preservar' });
  await remove(recurring);
  expect(
    (await plannedOccurrences('2026-11-03', '2026-11-04')).filter(
      (r) => r.taskId === recurring,
    ),
  ).toHaveLength(0);
});
it('falha na gravação final reverte toda a exclusão', async () => {
  const id = await create();
  const before = await createJourneyBackup();
  const p = await previewTaskRemoval(id);
  const failure = () => {
    throw Error('Falha simulada');
  };
  db.productivityAudit.hook('creating', failure);
  try {
    await expect(removeTask(id, p.token, 'rollback')).rejects.toThrow(
      'Falha simulada',
    );
  } finally {
    db.productivityAudit.hook('creating').unsubscribe(failure);
  }
  expect((await createJourneyBackup()).data).toEqual(before.data);
});
