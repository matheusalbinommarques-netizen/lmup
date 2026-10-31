import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { invalidateHeroModifiersCache } from './gearService';
import { xpService } from './xpService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  invalidateHeroModifiersCache();
});

describe('xpService com IndexedDB em memória', () => {
  it('cria um único perfil com a curva atual de progressão', async () => {
    const first = await xpService.ensureProfile();
    const second = await xpService.ensureProfile();
    expect(first).toMatchObject({
      id: 1,
      level: 1,
      xpNext: 250,
      gold: 0,
      food: 0,
    });
    expect(second.id).toBe(first.id);
    expect(await db.profile.count()).toBe(1);
  });

  it('persiste ganho, saldo e log com a mesma quantidade de XP', async () => {
    const result = await xpService.addXp(50, 7);
    expect(result).toMatchObject({ totalXpEarned: 50, gold: 25, food: 2 });
    expect(await db.profile.get(1)).toMatchObject(result);
    expect(await db.xpLogs.toArray()).toEqual([
      expect.objectContaining({ amount: 50, areaId: 7 }),
    ]);
  });

  it('atravessa o limite de nível sem perder XP excedente', async () => {
    const result = await xpService.addXp(275);
    expect(result).toMatchObject({ level: 2, xpCurrent: 25, xpNext: 300 });
  });

  it('aplica o bônus do companheiro ativo ao ganho de XP', async () => {
    await xpService.ensureProfile();
    await db.companions.put({
      id: 1,
      key: 'wolf',
      name: 'Lobo Etéreo',
      unlocked: true,
      evolutionStage: 1,
    });
    const result = await xpService.addXp(50);
    expect(result).toMatchObject({ totalXpEarned: 53, gold: 25, food: 2 });
    expect(await db.xpLogs.toArray()).toEqual([
      expect.objectContaining({ amount: 53 }),
    ]);
  });

  it('concede o baú do Santuário uma vez ao cruzar o estágio', async () => {
    await xpService.ensureProfile();
    await db.profile.update(1, { totalXpEarned: 2499 });
    const crossed = await xpService.addXp(50);
    expect(crossed).toMatchObject({ totalXpEarned: 2549, gold: 225 });
    const next = await xpService.addXp(50);
    expect(next).toMatchObject({ totalXpEarned: 2602, gold: 250 });
  });

  it('registra redução de XP e Gold sem saldo negativo', async () => {
    await xpService.addXp(50);
    const result = await xpService.removeXp(100);
    expect(result).toMatchObject({ totalXpEarned: 0, gold: 0, level: 1 });
    expect(await db.xpLogs.toArray()).toEqual([
      expect.objectContaining({ amount: 50 }),
      expect.objectContaining({ amount: -50 }),
    ]);
  });

  it('uma operação sem ganho devolve o perfil sem criar log', async () => {
    expect(await xpService.addXp(0)).toMatchObject({ id: 1, totalXpEarned: 0 });
    expect(await xpService.removeXp(0)).toMatchObject({
      id: 1,
      totalXpEarned: 0,
    });
    expect(await db.xpLogs.count()).toBe(0);
  });
});
