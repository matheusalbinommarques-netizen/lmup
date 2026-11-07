import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import { previewTaskRemoval, removeTask } from './taskRemoval';
import { completeTask } from './taskService';
import {
  createJourneyBackup,
  latestRecoveryBackup,
  resetJourney,
  restoreJourneyBackup,
} from './backupDataService';

const secret = 'Conteúdo privado do backup';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const create = (title: string) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: '2026-11-02',
  });
async function erase(id: number) {
  const preview = await previewTaskRemoval(id);
  await removeTask(id, preview.token, crypto.randomUUID(), 'delete');
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

it('restaurar guarda antes uma cópia de recuperação idêntica ao estado anterior e permite voltar', async () => {
  await completeTask(await create('Missão do backup'));
  const imported = await createJourneyBackup();
  await create('Criada depois do backup');
  await db.profile.update(1, { name: 'Estado antes de restaurar' });
  const before = await createJourneyBackup();
  expect(await db.recoverySnapshots.count()).toBe(0);
  await restoreJourneyBackup(copy(imported));
  const snapshots = await db.recoverySnapshots.toArray();
  expect(snapshots.map((row) => row.reason)).toEqual(['before-import']);
  expect((await latestRecoveryBackup())!.data).toEqual(before.data);
  expect((await db.tasks.toArray()).map((task) => task.title)).toEqual([
    'Missão do backup',
  ]);
  await restoreJourneyBackup((await latestRecoveryBackup())!);
  expect((await db.profile.get(1))!.name).toBe('Estado antes de restaurar');
  expect((await db.tasks.toArray()).map((task) => task.title)).toContain(
    'Criada depois do backup',
  );
});

it('restaurar um backup sem perfil mantém as exclusões pessoais e não ressuscita a missão', async () => {
  const id = await create(secret);
  await create('Missão independente');
  const old = copy(await createJourneyBackup());
  await erase(id);
  const deletions = (await db.profile.get(1))!.personalTaskDeletions!;
  expect(deletions).toHaveLength(1);
  const withoutProfile = copy(old);
  withoutProfile.data.profile = null;
  await restoreJourneyBackup(withoutProfile);
  expect((await db.profile.get(1))!.personalTaskDeletions).toEqual(deletions);
  expect((await db.tasks.toArray()).map((task) => task.title)).toEqual([
    'Missão independente',
  ]);
  expect(JSON.stringify(await createJourneyBackup())).not.toContain(secret);
  expect(JSON.stringify(await db.recoverySnapshots.toArray())).not.toContain(
    secret,
  );
});

it('o reinício preserva as exclusões pessoais e impede que um backup antigo ressuscite a missão', async () => {
  const id = await create(secret);
  await completeTask(id);
  const old = copy(await createJourneyBackup());
  await erase(id);
  const deletions = (await db.profile.get(1))!.personalTaskDeletions!;
  await resetJourney();
  expect((await db.profile.get(1))!.personalTaskDeletions).toEqual(deletions);
  expect(JSON.stringify(await db.recoverySnapshots.toArray())).not.toContain(
    secret,
  );
  await restoreJourneyBackup(old);
  expect(await db.tasks.count()).toBe(0);
  expect((await db.profile.get(1))!.personalTaskDeletions).toEqual(deletions);
  expect(JSON.stringify(await createJourneyBackup())).not.toContain(secret);
});
