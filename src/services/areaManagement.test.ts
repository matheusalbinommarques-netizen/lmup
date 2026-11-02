import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { db, type Task } from './db';
import type {
  Occurrence,
  Routine,
  ProductivityAudit,
} from './productivityTypes';
import { initializeJourney } from './profileService';
import { saveHeroProject } from './projectService';
import { saveArea, deleteArea, transferAreaTasks } from './areaService';
import { saveTaskDefinition } from './taskDefinitionService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { saveSession, newSavedSession } from './savedSessionService';
import { saveRoutine } from './routineService';
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
const create = (areaId: number, title = 'Atividade', projectId?: number) =>
  saveTaskDefinition({
    title,
    areaId,
    ...(projectId ? { projectId, projectStageId: 'inicio' } : {}),
    effort: 'micro',
    requestId: crypto.randomUUID(),
    plannedDate: '2026-11-02',
  });
async function selection(ids: number[]) {
  return Promise.all(
    ids.map(async (id) => {
      const task = (await db.tasks.get(id))!;
      return {
        id,
        areaId: task.areaId ?? 0,
        revision: task.definitionRevision ?? 0,
      };
    }),
  );
}
it('salva nome, descrição e ícone na mesma área e preserva campos legados em edição parcial', async () => {
  const id = await saveArea(
    'Saúde',
    undefined,
    'bem_estar',
    'Bem-estar diário',
  );
  await saveArea('Saúde física', id);
  expect(await db.areas.get(id)).toMatchObject({
    nome: 'Saúde física',
    descricao: 'Bem-estar diário',
    iconKey: 'bem_estar',
  });
  const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
  await restoreJourneyBackup(copy);
  expect((await db.areas.get(id))?.descricao).toBe('Bem-estar diário');
  delete copy.data.areas[0].descricao;
  expect(() => validateBackup(copy)).not.toThrow();
  copy.data.areas[0].descricao = 12;
  expect(() => validateBackup(copy)).toThrow('descrição');
  await expect(
    saveArea('Inválida', undefined, null, 'a'.repeat(4001)),
  ).rejects.toThrow('4000');
});
it('transfere cadastros ativos, concluídos e arquivados sem mudar progresso, recibos, projetos ou sessões', async () => {
  const source = await saveArea('Saúde'),
    dest = await saveArea('Casa');
  const projectId = await saveHeroProject({
    name: 'Cuidados do mês',
    stages: [{ id: 'inicio', title: 'Começar' }],
  });
  const ids = await Promise.all(
    ['Concluída', 'Em execução', 'Arquivada'].map((title) =>
      create(source, title, projectId),
    ),
  );
  const rows = await Promise.all(ids.map((id) => ensureOccurrence(id)));
  await recordProgress({
    occurrenceId: rows[0].id,
    expectedRevision: rows[0].revision,
    requestId: crypto.randomUUID(),
    value: 1,
    executedAt: new Date().toISOString(),
  });
  await db.tasks.update(ids[2], { archived: true });
  await saveSession(
    newSavedSession(
      'Minha sessão',
      rows.slice(0, 2).map((row) => row.id),
    ),
  );
  await saveRoutine({
    id: 'routine',
    name: 'Saúde',
    defaultAreaId: source,
    days: [1],
    startDate: '2026-11-02',
    entries: [{ taskId: ids[1], time: null }],
  });
  const before = await createJourneyBackup();
  expect(await transferAreaTasks(ids, dest, await selection(ids))).toBe(3);
  const after = await createJourneyBackup();
  for (const key of [
    'profile',
    'activityEvents',
    'xpLogs',
    'occurrences',
    'executionRecords',
    'projects',
    'routines',
    'savedMissionSessions',
  ] as const)
    expect(after.data[key]).toEqual(before.data[key]);
  for (const id of ids) {
    const old = (before.data.tasks as Task[]).find((t) => t.id === id)!;
    expect(await db.tasks.get(id)).toEqual({
      ...old,
      areaId: dest,
      definitionRevision: (old.definitionRevision ?? 0) + 1,
    });
  }
  expect(
    (after.data.productivityAudit as ProductivityAudit[]).some(
      (row) => row.action === 'area-transfer',
    ),
  ).toBe(true);
  expect(() => validateBackup(JSON.parse(JSON.stringify(after)))).not.toThrow();
});
it('recusa seleção antiga, missão ausente e destino inválido sem transferência parcial', async () => {
  const source = await saveArea('Origem'),
    dest = await saveArea('Destino'),
    ids = await Promise.all([create(source), create(source)]),
    expected = await selection(ids);
  await db.tasks.update(ids[0], { definitionRevision: 99 });
  await expect(transferAreaTasks(ids, dest, expected)).rejects.toThrow(
    'outra aba',
  );
  expect((await db.tasks.get(ids[1]))?.areaId).toBe(source);
  await expect(
    transferAreaTasks(ids, 999, await selection(ids)),
  ).rejects.toThrow('destino');
  await db.tasks.delete(ids[0]);
  await expect(transferAreaTasks(ids, dest, expected)).rejects.toThrow(
    'outra aba',
  );
});
it('exclui área ocupada transferindo todos os cadastros e padrões de rotina, sem alterar ocorrências e saldos', async () => {
  const source = await saveArea('Origem'),
    dest = await saveArea('Destino'),
    id = await create(source);
  const occurrence = await ensureOccurrence(id);
  await saveRoutine({
    id: 'routine',
    name: 'Manhã',
    defaultAreaId: source,
    days: [1],
    startDate: '2026-11-02',
    entries: [{ taskId: id, time: null }],
  });
  const before = await createJourneyBackup();
  await deleteArea(source, dest);
  const after = await createJourneyBackup();
  expect(await db.areas.get(source)).toBeUndefined();
  expect((await db.tasks.get(id))?.areaId).toBe(dest);
  expect((await db.routines.get('routine'))?.defaultAreaId).toBe(dest);
  expect(await db.occurrences.get(occurrence.id)).toEqual(
    (before.data.occurrences as Occurrence[]).find(
      (row) => row.id === occurrence.id,
    ),
  );
  expect(after.data.profile).toEqual(before.data.profile);
  expect(after.data.activityEvents).toEqual(before.data.activityEvents);
  expect(() => validateBackup(JSON.parse(JSON.stringify(after)))).not.toThrow();
  await restoreJourneyBackup(JSON.parse(JSON.stringify(after)));
  expect((await db.routines.get('routine'))?.entries).toEqual(
    (before.data.routines as Routine[])[0].entries,
  );
});
it('repetir transferência para o destino atual não altera revisão ou gera nova auditoria', async () => {
  const dest = await saveArea('Destino'),
    id = await create(dest),
    before = await db.tasks.get(id),
    audits = await db.productivityAudit.count();
  expect(await transferAreaTasks([id], dest, await selection([id]))).toBe(0);
  expect(await db.tasks.get(id)).toEqual(before);
  expect(await db.productivityAudit.count()).toBe(audits);
});
