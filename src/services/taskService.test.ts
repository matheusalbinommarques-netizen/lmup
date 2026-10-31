import { configureReview } from './reviewService';
import { isAvailable } from './journeyService';
import { dateKey } from './rewardService';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Dexie from 'dexie';
import { db, LevelMeUpDB, LEGACY_STORES, type Task } from './db';
import { initializeJourney, createDefaultProfile } from './profileService';
import { completeTask, undoTask } from './taskService';
import { feedCompanion } from './companionService';
import { invalidateHeroModifiersCache } from './gearService';
import { buyItem } from './shopService';
import { getShopItemById } from '$lib/shop/types';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

async function mission(extra: Partial<Task> = {}) {
  return db.tasks.add({
    title: 'Missão de teste',
    xp: 50,
    rarity: 'common',
    areaId: 0,
    completed: false,
    status: 'available',
    createdAt: new Date(),
    ...extra,
  });
}

describe('conclusão e estorno', () => {
  it('guarda o progresso exato no recibo, preservado após outras missões e estorno', async () => {
    const id = await mission();
    const first = await completeTask(id);
    expect(first?.progress).toEqual({ before: 0, after: first!.reward.xp });
    const next = await completeTask(await mission());
    expect(next?.progress?.before).toBe(first?.progress?.after);
    expect(await completeTask(id)).toBeNull();
    await undoTask(id);
    expect((await db.activityEvents.get(first!.id))?.progress).toEqual(
      first?.progress,
    );
    expect(
      (await db.activityEvents.get(`reversal:${first!.id}`))?.progress,
    ).toBeUndefined();
  });
  it('é idempotente em conclusões simultâneas', async () => {
    const id = await mission();
    await Promise.all([completeTask(id), completeTask(id), completeTask(id)]);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 53,
      gold: 25,
      food: 2,
      currentStreak: 1,
    });
    expect(await db.activityEvents.count()).toBe(1);
    expect(await db.xpLogs.count()).toBe(1);
  });

  it('estorna os valores efetivos e não fabrica recurso em ciclos repetidos', async () => {
    const id = await mission();
    for (let i = 0; i < 3; i++) {
      await completeTask(id);
      await undoTask(id);
      expect(await db.profile.get(1)).toMatchObject({
        totalXpEarned: 0,
        gold: 0,
        food: 0,
        currentStreak: 0,
        lastCompletionDate: null,
      });
    }
    await Promise.all([undoTask(id), undoTask(id)]);
    expect(await db.activityEvents.count()).toBe(6);
  });

  it('edição de XP e troca de companheiro não alteram o estorno', async () => {
    const id = await mission();
    await completeTask(id);
    await db.tasks.update(id, { xp: 500, rarity: 'legendary' });
    await db.profile.update(1, { activeCompanionId: 3 });
    await undoTask(id);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 0,
      gold: 0,
      food: 0,
    });
    expect(
      (await db.activityEvents.get(`reversal:task:${id}:0`))?.reward.xp,
    ).toBe(-53);
  });

  it('não concede recurso para tarefa arquivada ou XP inválido', async () => {
    const archived = await mission({ archived: true });
    await expect(completeTask(archived)).rejects.toThrow('disponível');
    const invalid = await mission({ xp: NaN });
    await expect(completeTask(invalid)).rejects.toThrow('inteiro');
    expect((await db.profile.get(1))?.totalXpEarned).toBe(0);
  });

  it('recusa estorno de conclusão legada sem inventar histórico', async () => {
    const id = await mission({ completed: true, status: 'completed' });
    await expect(undoTask(id)).rejects.toThrow('anterior');
    expect((await db.tasks.get(id))?.completed).toBe(true);
    expect(await db.activityEvents.count()).toBe(0);
  });

  it('falha no log reverte perfil, evento e conclusão juntos', async () => {
    const id = await mission();
    const failure = () => {
      throw new Error('Falha simulada de armazenamento');
    };
    db.xpLogs.hook('creating', failure);
    try {
      await expect(completeTask(id)).rejects.toThrow('Falha simulada');
    } finally {
      db.xpLogs.hook('creating').unsubscribe(failure);
    }
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 0,
      gold: 0,
      food: 0,
    });
    expect((await db.tasks.get(id))?.completed).toBe(false);
    expect(await db.activityEvents.count()).toBe(0);
  });

  it('preserva compra e conclusão quando parte do Gold foi gasta', async () => {
    const id = await mission({ xp: 2000 });
    await completeTask(id);
    const item = getShopItemById(101)!;
    expect(item).toBeTruthy();
    expect(await buyItem(item)).toMatchObject({ ok: true });
    await expect(undoTask(id)).rejects.toThrow('utilizada');
    expect((await db.tasks.get(id))?.completed).toBe(true);
    expect(await db.ownedShopItems.count()).toBe(1);
  });

  it('não permite gastar a mesma comida duas vezes', async () => {
    const id = await mission();
    await completeTask(id);
    const results = await Promise.allSettled([
      feedCompanion(1, 2),
      feedCompanion(1, 2),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect((await db.profile.get(1))?.food).toBe(0);
    expect((await db.companions.get(1))?.foodInvested).toBe(2);
    await expect(undoTask(id)).rejects.toThrow('utilizada');
    expect((await db.tasks.get(id))?.completed).toBe(true);
  });

  it('estorna o baú do Santuário e permite uma nova concessão legítima', async () => {
    await db.profile.update(1, { totalXpEarned: 2490 });
    const id = await mission();
    await completeTask(id);
    expect(await db.profile.get(1)).toMatchObject({
      gold: 225,
      ecoGoldClaimedUpToStage: 2,
    });
    await undoTask(id);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 2490,
      gold: 0,
      ecoGoldClaimedUpToStage: 1,
    });
    await completeTask(id);
    expect((await db.profile.get(1))?.gold).toBe(225);
  });

  it('recalcula a sequência sem apagar outra execução ativa no mesmo dia', async () => {
    const a = await mission();
    const b = await mission();
    await completeTask(a);
    await completeTask(b);
    await undoTask(a);
    expect((await db.profile.get(1))?.currentStreak).toBe(1);
    await undoTask(b);
    expect((await db.profile.get(1))?.currentStreak).toBe(0);
  });
});

describe('projetos e revisões', () => {
  it('estorna também o bônus e reabre o projeto de forma consistente', async () => {
    const projectId = await db.projects.add({
      name: 'Projeto',
      status: 'planejando',
      createdAt: new Date(),
    });
    const id = await mission({ projectId });
    await Promise.all([completeTask(id), completeTask(id)]);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 58,
      gold: 27,
      food: 3,
    });
    expect(await db.projects.get(projectId)).toMatchObject({
      status: 'concluido',
      rewardGranted: true,
    });
    await undoTask(id);
    expect(await db.profile.get(1)).toMatchObject({
      totalXpEarned: 0,
      gold: 0,
      food: 0,
    });
    expect(await db.projects.get(projectId)).toMatchObject({
      status: 'em_andamento',
      rewardGranted: false,
    });
    await completeTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(58);
  });

  it('estorno combinado insuficiente preserva projeto e missão', async () => {
    const projectId = await db.projects.add({
      name: 'Projeto',
      status: 'planejando',
      createdAt: new Date(),
    });
    const id = await mission({ projectId });
    await completeTask(id);
    await feedCompanion(1, 1);
    await expect(undoTask(id)).rejects.toThrow('utilizada');
    expect((await db.projects.get(projectId))?.rewardGranted).toBe(true);
    expect((await db.tasks.get(id))?.completed).toBe(true);
    expect(
      (await db.activityEvents.toArray()).every((event) => !event.reversedAt),
    ).toBe(true);
  });

  it('revisão respeita a data e pode ser estornada e refeita', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-06-10T12:00:00-03:00'));
    const id = await mission({
      reviewEnabled: true,
      reviewIntervalDays: 1,
      createdAt: new Date('2026-06-08T12:00:00-03:00'),
    });
    await Promise.all([completeTask(id), completeTask(id)]);
    expect(await db.activityEvents.count()).toBe(1);
    vi.setSystemTime(new Date('2026-06-11T12:00:00-03:00'));
    await completeTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(106);
    await undoTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(53);
    await completeTask(id);
    expect((await db.profile.get(1))?.totalXpEarned).toBe(106);
  });
});

describe('migração conservadora', () => {
  it('preserva o banco v4 e captura a versão anterior sem fabricar eventos', async () => {
    const name = `legacy-${crypto.randomUUID()}`;
    const legacy = new Dexie(name);
    legacy.version(4).stores(LEGACY_STORES);
    await legacy.table('profile').put({
      ...createDefaultProfile(),
      name: 'Perfil antigo',
      totalXpEarned: 777,
      gold: 321,
      xpNext: 100,
    });
    await legacy.table('tasks').put({
      id: 77,
      title: 'Antiga',
      xp: 50,
      rarity: 'common',
      completed: true,
      createdAt: new Date(),
    });
    legacy.close();
    const migrated = new LevelMeUpDB(name);
    try {
      await migrated.open();
      expect(await migrated.profile.get(1)).toMatchObject({
        name: 'Perfil antigo',
        totalXpEarned: 777,
        gold: 321,
        xpNext: 100,
      });
      expect((await migrated.tasks.get(77))?.completionEventId).toBeUndefined();
      expect(await migrated.activityEvents.count()).toBe(0);
      const snapshot = await migrated.recoverySnapshots.get('migration-v4');
      expect(snapshot?.data.profile[0]).toMatchObject({
        name: 'Perfil antigo',
        gold: 321,
      });
      expect(snapshot?.data.tasks).toHaveLength(1);
    } finally {
      await migrated.delete();
    }
  });
});

it('desfazer a primeira revisão após conclusão normal restaura a prática no mesmo dia', async () => {
  const id = await mission();
  await completeTask(id);
  await configureReview(id, {
    enabled: true,
    intervalDays: 1,
    dueDate: dateKey(),
  });
  await completeTask(id);
  await undoTask(id);
  const restored = (await db.tasks.get(id))!;
  expect(restored.completed).toBe(true);
  expect(restored.lastReviewDate).toBeNull();
  expect(isAvailable(restored)).toBe(true);
  expect((await db.profile.get(1))?.totalXpEarned).toBe(53);
  expect(
    (await db.activityEvents.toArray()).filter(
      (event) => event.kind === 'review' && !event.reversedAt,
    ),
  ).toHaveLength(0);
  await completeTask(id);
  expect(
    (await db.activityEvents.toArray()).filter(
      (event) => event.kind === 'review' && !event.reversedAt,
    ),
  ).toHaveLength(1);
});
