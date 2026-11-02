import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { ensureCamp } from './campService';
import { saveArea } from './areaService';
import { areaIconKey } from './areaIcons';
import { saveTaskDefinition } from './taskDefinitionService';
import { completeTask } from './taskService';
import { previewTaskRemoval, removeTask } from './taskRemoval';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
  await ensureCamp();
});

it('restaura ícones, exclusão e arquivo juntos, preservando recibos e acampamento', async () => {
  const areaId = await saveArea('Estudos', undefined, 'estudo');
  const create = (title: string) =>
    saveTaskDefinition({ title, areaId, requestId: crypto.randomUUID() });
  const used = await create('Missão com histórico');
  const unused = await create('Missão sem uso');
  await completeTask(used);
  const savedProfile = (await db.profile.get(1))!;
  const before = await createJourneyBackup();
  for (const id of [used, unused]) {
    const preview = await previewTaskRemoval(id);
    expect(preview.mode).toBe(id === used ? 'archive' : 'delete');
    await removeTask(id, preview.token, crypto.randomUUID());
  }
  await saveArea('Estudos', areaId, 'exercicio');
  const backup = await createJourneyBackup();
  expect(backup.data.profile).toMatchObject(before.data.profile!);
  for (const key of ['activityEvents', 'xpLogs', 'executionRecords'])
    expect(backup.data[key]).toEqual(before.data[key]);
  await restoreJourneyBackup(backup);
  expect(await db.tasks.get(unused)).toBeUndefined();
  const archived = await db.tasks.get(used);
  expect(archived?.archived).toBe(true);
  expect(areaIconKey(archived, await db.areas.toArray())).toBe('exercicio');
  const restored = await createJourneyBackup();
  const restoredProfile = (await db.profile.get(1))!;
  // Restoration invalidates old camp commands by issuing a fresh epoch.
  expect(restoredProfile.camp!.epoch).not.toBe(savedProfile.camp!.epoch);
  expect(restoredProfile).toMatchObject({
    ...savedProfile,
    camp: { ...savedProfile.camp, epoch: restoredProfile.camp!.epoch },
  });
  for (const key of ['activityEvents', 'xpLogs', 'executionRecords'])
    expect(restored.data[key]).toEqual(before.data[key]);
  expect(db.verno).toBe(6);
});
