import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveHeroProject } from './projectService';
import { deleteArea, saveArea } from './areaService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-15T10:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const area = async (nome: string) => Number(await saveArea(nome));

it('projeto nasce sem área e aceita Geral ou uma área ativa', async () => {
  const casa = await area('Casa');
  const semArea = await saveHeroProject({ name: 'Sem área' });
  expect((await db.projects.get(semArea))?.areaId).toBeNull();
  const geral = await saveHeroProject({ name: 'Geral', areaId: 0 });
  expect((await db.projects.get(geral))?.areaId).toBe(0);
  const comArea = await saveHeroProject({ name: 'Casa', areaId: casa });
  expect((await db.projects.get(comArea))?.areaId).toBe(casa);
});

it('editar sem informar a área preserva a área; null a remove', async () => {
  const casa = await area('Casa');
  const id = await saveHeroProject({ name: 'Mudança', areaId: casa });
  await saveHeroProject({ name: 'Mudança de casa' }, id, 1);
  expect((await db.projects.get(id))?.areaId).toBe(casa);
  await saveHeroProject({ name: 'Mudança de casa', areaId: null }, id, 2);
  const saved = await db.projects.get(id);
  expect(saved?.areaId).toBeNull();
  expect(saved?.revision).toBe(3);
});

it('recusa área inexistente ou arquivada sem gravar nada', async () => {
  const velha = await area('Antiga');
  await db.areas.update(velha, { archived: true });
  await expect(saveHeroProject({ name: 'X', areaId: 999 })).rejects.toThrow(
    'área escolhida',
  );
  await expect(saveHeroProject({ name: 'Y', areaId: velha })).rejects.toThrow(
    'área escolhida',
  );
  expect(await db.projects.count()).toBe(0);
});

it('projeto que já está numa área arquivada pode ser editado sem trocar a área', async () => {
  const velha = await area('Antiga');
  const id = await saveHeroProject({ name: 'Projeto', areaId: velha });
  await db.areas.update(velha, { archived: true });
  await saveHeroProject({ name: 'Projeto renomeado', areaId: velha }, id, 1);
  expect((await db.projects.get(id))?.name).toBe('Projeto renomeado');
});

it('a mesma criação repetida não duplica o projeto nem muda a área', async () => {
  const casa = await area('Casa');
  const requestId = crypto.randomUUID();
  const first = await saveHeroProject({ name: 'Uma', areaId: casa, requestId });
  const again = await saveHeroProject({ name: 'Uma', areaId: 0, requestId });
  expect(again).toBe(first);
  expect(await db.projects.count()).toBe(1);
  expect((await db.projects.get(first))?.areaId).toBe(casa);
});

it('excluir a área leva o projeto para a área de destino e registra na auditoria', async () => {
  const casa = await area('Casa');
  const id = await saveHeroProject({ name: 'Reforma', areaId: casa });
  await deleteArea(casa, 0);
  const project = await db.projects.get(id);
  expect(project?.areaId).toBe(0);
  expect(project?.revision).toBe(2);
  const audit = await db.productivityAudit
    .filter((row) => row.action === 'area-delete')
    .first();
  expect((audit?.before as { projectIds: number[] }).projectIds).toEqual([id]);
});

it('o backup leva a área do projeto e recusa área inexistente', async () => {
  const casa = await area('Casa');
  const id = await saveHeroProject({ name: 'Reforma', areaId: casa });
  const backup = await createJourneyBackup();
  await db.projects.update(id, { areaId: null });
  await restoreJourneyBackup(backup);
  expect((await db.projects.get(id))?.areaId).toBe(casa);
  const broken = structuredClone(backup);
  (broken.data.projects as { areaId: number }[])[0].areaId = 999;
  expect(() => validateBackup(broken)).toThrow('área de projeto inexistente');
});
