import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { completeTask, undoTask } from './taskService';
import {
  createJourneyBackup,
  validateBackup,
  restoreJourneyBackup,
  resetJourney,
  latestRecoveryBackup,
} from './backupDataService';
import { invalidateHeroModifiersCache } from './gearService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});

async function populated() {
  const projectId = await db.projects.add({
    name: 'Projeto',
    status: 'planejando',
    createdAt: new Date(),
  });
  const id = await db.tasks.add({
    title: 'Missão',
    xp: 50,
    rarity: 'common',
    completed: false,
    areaId: 0,
    projectId,
    createdAt: new Date(),
  });
  await completeTask(id);
  return id;
}

describe('backup e recuperação', () => {
  it('restaura eventos, estornos e bônus sem recalcular recompensas', async () => {
    const id = await populated();
    await undoTask(id);
    await completeTask(id);
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await resetJourney();
    await restoreJourneyBackup(backup);
    const restored = await createJourneyBackup();
    expect(JSON.parse(JSON.stringify(restored.data))).toEqual(backup.data);
    await undoTask(id);
    expect(await db.profile.get(1)).toMatchObject({
      gold: 0,
      food: 0,
      totalXpEarned: 0,
    });
  });

  it('aceita o formato legado sem inventar eventos', async () => {
    await populated();
    const backup = await createJourneyBackup();
    backup.meta.formatVersion = 2;
    backup.data.tasks = [];
    backup.data.xpLogs = [];
    for (const key of [
      'activityEvents',
      'projects',
      'items',
      'inventory',
      'shopItems',
      'ownedShopItems',
    ])
      delete backup.data[key];
    await restoreJourneyBackup(backup);
    expect(await db.activityEvents.count()).toBe(0);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
  });

  it.each(['meta', 'data', 'tasks', 'activityEvents'])(
    'recusa ausência de %s antes de alterar dados',
    async (key) => {
      await populated();
      const backup = await createJourneyBackup();
      const before = structuredClone(backup.data);
      if (key === 'meta' || key === 'data')
        delete (backup as unknown as Record<string, unknown>)[key];
      else delete backup.data[key];
      await expect(restoreJourneyBackup(backup)).rejects.toThrow(
        'Backup inválido',
      );
      expect((await createJourneyBackup()).data).toEqual(before);
      expect(await db.recoverySnapshots.count()).toBe(0);
    },
  );

  it('recusa IDs duplicados, valores inválidos, referências quebradas e histórico adulterado', async () => {
    await populated();
    const original = await createJourneyBackup();
    const mutations = [
      (data: any) => data.tasks.push(structuredClone(data.tasks[0])),
      (data: any) => {
        data.profile.gold = -1;
      },
      (data: any) => {
        data.profile.food = Infinity;
      },
      (data: any) => {
        data.tasks[0].projectId = 9999;
      },
      (data: any) => {
        data.xpLogs[0].amount += 1;
      },
      (data: any) => {
        data.activityEvents = [];
      },
      (data: any) => {
        data.tasks[0].completionEventId = 'inexistente';
      },
    ];
    for (const mutate of mutations) {
      const backup = structuredClone(original);
      mutate(backup.data);
      await expect(restoreJourneyBackup(backup)).rejects.toThrow(
        'Backup inválido',
      );
    }
    expect((await createJourneyBackup()).data).toEqual(original.data);
  });

  it('recusa chaves reservadas e profundidade excessiva', async () => {
    const backup = await createJourneyBackup();
    const reserved = JSON.parse(JSON.stringify(backup));
    reserved.data.extra = JSON.parse('{"__proto__":{"polluted":true}}');
    expect(() => validateBackup(reserved)).toThrow('reservada');
    let deep: unknown = {};
    for (let i = 0; i < 45; i++) deep = { child: deep };
    expect(() => validateBackup({ ...backup, extra: deep })).toThrow(
      'profunda',
    );
  });

  it('uma falha durante a importação restaura todos os dados e a lista de recuperação', async () => {
    await populated();
    const backup = await createJourneyBackup();
    const failure = () => {
      throw new Error('Armazenamento indisponível');
    };
    db.tasks.hook('creating', failure);
    try {
      await expect(restoreJourneyBackup(backup)).rejects.toThrow(
        'indisponível',
      );
    } finally {
      db.tasks.hook('creating').unsubscribe(failure);
    }
    expect((await createJourneyBackup()).data).toEqual(backup.data);
    expect(await db.recoverySnapshots.count()).toBe(0);
  });

  it('reset limpa a jornada inteira, preserva identidade e permite recuperar a versão anterior', async () => {
    await populated();
    await db.profile.update(1, {
      name: 'Minha identidade',
      avatarUrl: '/avatar.webp',
    });
    await db.items.add({ titulo: 'Legado', xp: 5 } as any);
    await db.ownedShopItems.add({
      itemId: 101,
      acquiredAt: new Date().toISOString(),
      equipped: true,
    });
    const original = await createJourneyBackup();
    await resetJourney();
    expect(await db.profile.get(1)).toMatchObject({
      name: 'Minha identidade',
      avatarUrl: '/avatar.webp',
      totalXpEarned: 0,
      gold: 0,
      food: 0,
    });
    for (const name of [
      'tasks',
      'projects',
      'items',
      'ownedShopItems',
      'xpLogs',
      'activityEvents',
    ])
      expect(await db.table(name).count()).toBe(0);
    expect(await db.companions.count()).toBe(4);
    const recovery = await latestRecoveryBackup();
    expect(recovery?.data).toEqual(original.data);
    await restoreJourneyBackup(recovery);
    expect((await createJourneyBackup()).data).toEqual(original.data);
  });

  it('retém cinco cópias recentes além da migração', async () => {
    await db.recoverySnapshots.add({
      id: 'migration-v4',
      reason: 'migration-v4',
      createdAt: '2020-01-01T00:00:00.000Z',
      data: {},
    });
    for (let i = 0; i < 7; i++) await resetJourney();
    expect(await db.recoverySnapshots.count()).toBe(6);
    expect(await db.recoverySnapshots.get('migration-v4')).toBeTruthy();
  });

  it('inicializações concorrentes preservam perfil e companheiro existente', async () => {
    await db.profile.update(1, { name: 'Nome pessoal', gold: 123 });
    await db.companions.update(1, {
      name: 'Apelido',
      evolutionStage: 3,
      foodInvested: 301,
    });
    await db.companions.delete(2);
    await Promise.all([initializeJourney(), initializeJourney()]);
    expect(await db.profile.get(1)).toMatchObject({
      name: 'Nome pessoal',
      gold: 123,
    });
    expect(await db.companions.get(1)).toMatchObject({
      name: 'Apelido',
      evolutionStage: 3,
      foodInvested: 301,
    });
    expect(await db.companions.count()).toBe(4);
  });
});
