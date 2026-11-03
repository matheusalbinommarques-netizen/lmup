import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { areaIconKey, migrateAreaIcons } from './areaIcons';
import { saveArea, deleteArea, saveGeneralAreaIcon } from './areaService';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask } from './taskService';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});

async function legacy(areaId: number, key?: string) {
  return saveTaskDefinition({
    title: 'Missão preservada',
    requestId: crypto.randomUUID(),
    areaId,
    iconKey: key,
  });
}

it('adota um único ícone, incluindo missões arquivadas, sem alterar cadastros legados', async () => {
  const id = await db.areas.add({ nome: 'Estudos' });
  const first = await legacy(id, 'estudo');
  const archived = await legacy(id, 'estudo');
  await db.tasks.update(archived, { archived: true });
  await legacy(id);
  const before = await db.tasks.toArray();
  await initializeJourney();
  expect((await db.areas.get(id))?.iconKey).toBe('estudo');
  expect(areaIconKey(await db.tasks.get(first), await db.areas.toArray())).toBe(
    'estudo',
  );
  expect(await db.tasks.toArray()).toEqual(before);
  expect(db.verno).toBe(6);
});

it('conflitos usam neutro e edição propaga a todas as missões sem apagar os ícones antigos', async () => {
  const id = await db.areas.add({ nome: 'Pessoal' });
  const a = await legacy(id, 'estudo'),
    b = await legacy(id, 'exercicio');
  await migrateAreaIcons();
  expect(await db.areas.get(id)).toMatchObject({
    iconKey: null,
    iconConflict: true,
  });
  await saveArea('Pessoal', id, 'bem_estar');
  const areas = await db.areas.toArray();
  expect(areaIconKey(await db.tasks.get(a), areas)).toBe('bem_estar');
  expect(areaIconKey(await db.tasks.get(b), areas)).toBe('bem_estar');
  expect((await db.tasks.get(a))?.iconKey).toBe('estudo');
  expect((await db.tasks.get(b))?.iconKey).toBe('exercicio');
  expect((await db.areas.get(id))?.iconConflict).toBe(false);
});

it('migração concorrente e repetida preserva escolha explícita, inclusive neutro', async () => {
  const id = await db.areas.add({ nome: 'Casa' });
  await legacy(id, 'cozinha');
  await Promise.all([migrateAreaIcons(), migrateAreaIcons()]);
  await saveArea('Casa', id, null);
  await legacy(id, 'estudo');
  await Promise.all([migrateAreaIcons(), migrateAreaIcons()]);
  expect((await db.areas.get(id))?.iconKey).toBeNull();
  await saveArea('Casa renomeada', id);
  expect((await db.areas.get(id))?.iconKey).toBeNull();
});

it('área vazia e missão sem área usam neutro sem herdar ícone individual', async () => {
  const id = await db.areas.add({ nome: 'Nova' });
  await migrateAreaIcons();
  expect((await db.areas.get(id))?.iconKey).toBeNull();
  const taskId = await legacy(0, 'exercicio');
  expect(
    areaIconKey(await db.tasks.get(taskId), await db.areas.toArray()),
  ).toBeNull();
  expect(areaIconKey({ areaId: 999 }, [])).toBeNull();
  expect(areaIconKey(undefined, [])).toBeNull();
});

it('reatribuição e exclusão de área usam o destino, mantendo versões e recibos anteriores', async () => {
  const source = await saveArea('Estudos', undefined, 'estudo');
  const destination = await saveArea('Saúde', undefined, 'exercicio');
  const id = await legacy(source, 'cozinha');
  const versions = await db.planVersions.toArray();
  await deleteArea(source, destination);
  expect(areaIconKey(await db.tasks.get(id), await db.areas.toArray())).toBe(
    'exercicio',
  );
  expect(await db.planVersions.toArray()).toEqual(versions);
  await deleteArea(destination);
  expect(
    areaIconKey(await db.tasks.get(id), await db.areas.toArray()),
  ).toBeNull();
  expect((await db.tasks.get(id))?.iconKey).toBe('cozinha');
  await restoreJourneyBackup(await createJourneyBackup());
});

it('backup novo preserva área configurada e campos legados, sem alterar economia ou recibos', async () => {
  const area = await saveArea('Estudos', undefined, 'estudo');
  const id = await legacy(area, 'cozinha');
  await completeTask(id);
  const before = await createJourneyBackup();
  await saveArea('Estudos', area, 'exercicio');
  await restoreJourneyBackup(before);
  expect((await createJourneyBackup()).data).toEqual(before.data);
  expect((await db.areas.get(area))?.iconKey).toBe('estudo');
  expect((await db.tasks.get(id))?.iconKey).toBe('cozinha');
  expect(db.verno).toBe(6);
});

it('restaura backup anterior e adota ícone uma vez, preservando tarefas, perfil e planejamento', async () => {
  const area = await db.areas.add({ nome: 'Antiga' });
  await legacy(area, 'estudo');
  const old = await createJourneyBackup();
  await restoreJourneyBackup(old);
  const adopted = await createJourneyBackup();
  expect((await db.areas.get(area))?.iconKey).toBe('estudo');
  expect(adopted.data.tasks).toEqual(old.data.tasks);
  expect(adopted.data.profile).toEqual(old.data.profile);
  expect(adopted.data.planVersions).toEqual(old.data.planVersions);
  await restoreJourneyBackup(adopted);
  expect((await createJourneyBackup()).data).toEqual(adopted.data);
});

it.each(['../../outside', 'toString', '', 42, { key: 'estudo' }])(
  'recusa ícone de área inválido %j antes de gravar ou restaurar',
  async (key) => {
    const id = await saveArea('Estudos', undefined, 'estudo');
    const before = await createJourneyBackup();
    await expect(saveArea('Alterada', id, key as string)).rejects.toThrow(
      'ícone',
    );
    const invalid = structuredClone(before);
    (invalid.data.areas as any[])[0].iconKey = key;
    await expect(restoreJourneyBackup(invalid)).rejects.toThrow('ícone');
    expect((await createJourneyBackup()).data).toEqual(before.data);
  },
);

it('personaliza Geral sem criar área, alterar missões ou economia, e preserva no backup', async () => {
  const area = await saveArea('Outra', undefined, 'exercicio');
  const task = await legacy(0);
  await completeTask(task);
  const before = await createJourneyBackup();
  await saveGeneralAreaIcon('estudo', undefined);
  const profile = (await db.profile.get(1))!;
  expect(areaIconKey({ areaId: 0 }, [], profile.generalAreaIconKey)).toBe(
    'estudo',
  );
  expect(areaIconKey({}, [], profile.generalAreaIconKey)).toBe('estudo');
  expect(
    areaIconKey(
      { areaId: area },
      await db.areas.toArray(),
      profile.generalAreaIconKey,
    ),
  ).toBe('exercicio');
  expect(
    areaIconKey({ areaId: 999 }, [], profile.generalAreaIconKey),
  ).toBeNull();
  const saved = await createJourneyBackup();
  expect(saved.data.areas).toEqual(before.data.areas);
  expect(saved.data.tasks).toEqual(before.data.tasks);
  expect(saved.data.activityEvents).toEqual(before.data.activityEvents);
  expect(saved.data.profile).toEqual({
    ...before.data.profile,
    generalAreaIconKey: 'estudo',
  });
  expect(db.verno).toBe(6);
  await saveGeneralAreaIcon('exercicio', 'estudo');
  await restoreJourneyBackup(saved);
  expect((await db.profile.get(1))?.generalAreaIconKey).toBe('estudo');
  await restoreJourneyBackup(before);
  expect((await db.profile.get(1))?.generalAreaIconKey).toBeUndefined();
});

it('recusa edição concorrente e backup inválido de Geral sem gravações parciais', async () => {
  await saveGeneralAreaIcon('estudo', undefined);
  const saved = await createJourneyBackup();
  await expect(saveGeneralAreaIcon('exercicio', undefined)).rejects.toThrow(
    'outra aba',
  );
  await expect(saveGeneralAreaIcon('toString', 'estudo')).rejects.toThrow(
    'ícone',
  );
  const invalid = structuredClone(saved);
  invalid.data.profile!.generalAreaIconKey = 'toString';
  await expect(restoreJourneyBackup(invalid)).rejects.toThrow('ícone');
  expect((await createJourneyBackup()).data).toEqual(saved.data);
  await saveGeneralAreaIcon(null, 'estudo');
  expect((await db.profile.get(1))?.generalAreaIconKey).toBeNull();
});
