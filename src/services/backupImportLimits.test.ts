import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { completeTask } from './taskService';
import { saveArea } from './areaService';
import {
  createJourneyBackup,
  inspectJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import { invalidateHeroModifiersCache } from './gearService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
async function populated(title = 'Missão') {
  const id = await db.tasks.add({
    title,
    xp: 50,
    rarity: 'common',
    completed: false,
    areaId: 0,
    createdAt: new Date(),
  });
  await completeTask(id);
  return id;
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe('limites do backup importado', () => {
  it.each([1001, 5 * 1024 * 1024])(
    'recusa título de %s caracteres antes de alterar dados ou criar recuperação',
    async (size) => {
      await populated();
      const backup = copy(await createJourneyBackup());
      (backup.data.tasks as { title: string }[])[0].title = 'x'.repeat(size);
      const before = structuredClone((await createJourneyBackup()).data);
      await expect(restoreJourneyBackup(backup)).rejects.toThrow(
        'excede o limite',
      );
      expect(() => inspectJourneyBackup(backup)).toThrow('excede o limite');
      expect((await createJourneyBackup()).data).toEqual(before);
      expect(await db.recoverySnapshots.count()).toBe(0);
    },
  );
  it.each([
    ['projects', 'name'],
    ['areas', 'nome'],
  ])('recusa %s.%s acima do limite', async (table, field) => {
    await db.projects.add({
      name: 'Projeto',
      status: 'planejando',
      createdAt: new Date(),
    });
    await saveArea('Casa');
    const backup = copy(await createJourneyBackup());
    const row = (backup.data[table] as Record<string, unknown>[])[0];
    row[field] = 'x'.repeat(1001);
    expect(() => validateBackup(backup)).toThrow('excede o limite');
  });
  it('aceita título de exatamente 1000 caracteres, avisa e restaura sem alterá-lo', async () => {
    const title = 'y'.repeat(1000);
    await populated(title);
    const backup = copy(await createJourneyBackup());
    const summary = inspectJourneyBackup(backup);
    expect(summary.warnings).toHaveLength(1);
    expect(summary.warnings[0]).toContain('160 caracteres');
    await restoreJourneyBackup(backup);
    expect((await db.tasks.toArray())[0].title).toBe(title);
  });
  it('não avisa para título dentro do limite de cadastro nem para jornada coerente', async () => {
    await populated('z'.repeat(160));
    expect(inspectJourneyBackup(await createJourneyBackup()).warnings).toEqual(
      [],
    );
  });
  it('avisa sobre saldo sem registro, mas restaura sem recalcular nem inventar eventos', async () => {
    const backup = copy(await createJourneyBackup());
    Object.assign(backup.data.profile!, {
      gold: 1_000_000,
      totalXpEarned: 999,
    });
    const summary = inspectJourneyBackup(backup);
    expect(summary.warnings).toHaveLength(1);
    expect(summary.warnings[0]).toContain('sem recalcular');
    await restoreJourneyBackup(backup);
    expect(await db.activityEvents.count()).toBe(0);
    expect(await db.profile.get(1)).toMatchObject({
      gold: 1_000_000,
      totalXpEarned: 999,
    });
  });
  it.each([1, 2, 3, 4])(
    'backup legítimo no formato v%s continua válido e restaura os mesmos dados',
    async (version) => {
      await populated();
      const backup = copy(await createJourneyBackup());
      backup.meta.formatVersion = version;
      const before = copy(backup.data);
      expect(inspectJourneyBackup(backup).warnings).toEqual([]);
      await restoreJourneyBackup(backup);
      expect(await db.tasks.count()).toBe(1);
      expect((await createJourneyBackup()).data.profile).toMatchObject({
        gold: (before.profile as { gold: number }).gold,
        totalXpEarned: (before.profile as { totalXpEarned: number })
          .totalXpEarned,
      });
    },
  );
});
