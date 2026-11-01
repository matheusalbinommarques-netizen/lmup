import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { buyItem, setEquipment } from './shopService';
import { getShopItemById } from '$lib/shop/types';
import {
  modifiersForOwned,
  buildHeroModifiersFromOwned,
  invalidateHeroModifiersCache,
} from './gearService';
import {
  feedCompanion,
  careQuote,
  evolveCompanion,
  selectCompanion,
  getActiveCompanionBuffs,
} from './companionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import {
  discoveryRows,
  collectionStats,
  collectionCapacity,
} from './collectionRules';
import { ALL_ACHIEVEMENTS } from './achievementsCatalog';
import { completeTask, undoTask } from './taskService';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
  await db.profile.update(1, { gold: 20000, food: 500 });
});
afterEach(() => vi.restoreAllMocks());
describe('coleção transacional', () => {
  it('usa preço e metadados canônicos e não duplica compra concorrente', async () => {
    const item = getShopItemById(105)!;
    const results = await Promise.all([
      buyItem({ ...item, price: 0 }),
      buyItem(item),
      buyItem(item),
    ]);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(await db.ownedShopItems.count()).toBe(1);
    expect((await db.profile.get(1))?.gold).toBe(18200);
    expect((await db.ownedShopItems.toArray())[0].price).toBe(1800);
    expect((await db.ownedShopItems.toArray())[0].equipped).toBe(false);
  });
  it('recusa item desconhecido e saldo insuficiente sem escritas', async () => {
    await db.profile.update(1, { gold: 1 });
    expect(await buyItem(getShopItemById(105)!)).toEqual({
      ok: false,
      code: 'no_funds',
    });
    expect(await buyItem({ ...getShopItemById(105)!, id: 999 })).toEqual({
      ok: false,
      code: 'unavailable',
    });
    expect(await db.ownedShopItems.count()).toBe(0);
    expect((await db.profile.get(1))?.gold).toBe(1);
  });
  it('reverte débito se falhar a gravação da posse', async () => {
    vi.spyOn(db.ownedShopItems, 'add').mockRejectedValueOnce(
      new Error('falha'),
    );
    await expect(buyItem(getShopItemById(105)!)).rejects.toThrow('falha');
    expect((await db.profile.get(1))?.gold).toBe(20000);
    expect(await db.ownedShopItems.count()).toBe(0);
  });
  it('garante um item por espaço, mantém posse e repetições não desequipam', async () => {
    await buyItem(getShopItemById(105)!);
    await buyItem(getShopItemById(106)!);
    await Promise.all([setEquipment(105, true), setEquipment(106, true)]);
    expect(await db.ownedShopItems.filter((row) => row.equipped).count()).toBe(
      1,
    );
    await Promise.all([setEquipment(105, true), setEquipment(105, true)]);
    expect((await buildHeroModifiersFromOwned()).taskXpBonusPercent).toBe(5);
    expect(await db.ownedShopItems.count()).toBe(2);
    await setEquipment(105, false);
    expect((await buildHeroModifiersFromOwned()).taskXpBonusPercent).toBe(0);
  });
  it('não acumula efeitos duplicados de um espaço em backup legado', () => {
    const rows = [105, 106, 108, 109].map((itemId) => ({
      itemId,
      equipped: true,
      acquiredAt: '',
    }));
    const mods = modifiersForOwned(rows);
    expect(mods.taskXpBonusPercent).toBe(10);
    expect(mods.goldMultiplier).toBe(1.1);
  });
  it('reverte troca de espaço inteira se falhar a ativação', async () => {
    await buyItem(getShopItemById(105)!);
    await buyItem(getShopItemById(106)!);
    await setEquipment(105, true);
    const original = db.ownedShopItems.update.bind(db.ownedShopItems);
    vi.spyOn(db.ownedShopItems, 'update').mockImplementation(
      (key, changes: any) => {
        if (changes.equipped) throw new Error('falha');
        return original(key, changes);
      },
    );
    await expect(setEquipment(106, true)).rejects.toThrow('falha');
    expect(
      (await db.ownedShopItems.where('itemId').equals(105).first())?.equipped,
    ).toBe(true);
  });
  it('respeita capacidade e a mochila amplia dez espaços', async () => {
    for (let i = 1; i <= 20; i++)
      await db.inventory.add({
        key: 'v' + i,
        type: 'avatar',
        name: 'Visual',
        owned: true,
        equipped: false,
      });
    expect(await buyItem(getShopItemById(105)!)).toEqual({
      ok: false,
      code: 'capacity',
    });
    expect(await buyItem(getShopItemById(116)!)).toEqual({ ok: true });
    await setEquipment(116, true);
    expect(
      collectionCapacity(
        await db.ownedShopItems.toArray(),
        await db.inventory.toArray(),
      ),
    ).toEqual({ used: 21, max: 30 });
    expect(await buyItem(getShopItemById(105)!)).toEqual({ ok: true });
  });
});
describe('compatibilidade de equipamentos', () => {
  it('inicialização e restauração corrigem espaços duplicados sem perder itens', async () => {
    await buyItem(getShopItemById(105)!);
    await buyItem(getShopItemById(106)!);
    await db.ownedShopItems.toCollection().modify({ equipped: true });
    const before = await createJourneyBackup();
    await restoreJourneyBackup(before);
    expect(await db.ownedShopItems.count()).toBe(2);
    expect(
      (await db.ownedShopItems.toArray())
        .filter((row) => row.equipped)
        .map((row) => row.itemId),
    ).toEqual([106]);
    expect((await buildHeroModifiersFromOwned()).taskXpBonusPercent).toBe(10);
    await initializeJourney();
    expect(await db.ownedShopItems.count()).toBe(2);
  });
});

describe('cuidado e bônus canônicos', () => {
  it('prévia e gravação coincidem; repetição do pedido não gasta outra vez', async () => {
    const pet = (await db.companions.get(1))!;
    expect(careQuote(pet, 100)).toEqual({ cost: 100, invested: 100, stage: 2 });
    const options = { requestId: 'mesmo-cuidado', expectedInvested: 0 };
    await Promise.all([
      feedCompanion(1, 100, options),
      feedCompanion(1, 100, options),
    ]);
    expect((await db.profile.get(1))?.food).toBe(400);
    const saved = (await db.companions.get(1))!;
    expect(saved.evolutionStage).toBe(2);
    expect(saved.careHistory).toHaveLength(1);
    expect(await getActiveCompanionBuffs()).toEqual({ xpBonusPercent: 10 });
  });
  it('recusa prévia obsoleta de outra aba', async () => {
    await feedCompanion(1, 10, { requestId: 'aba-1', expectedInvested: 0 });
    await expect(
      feedCompanion(1, 10, { requestId: 'aba-2', expectedInvested: 0 }),
    ).rejects.toThrow('outra aba');
    expect((await db.profile.get(1))?.food).toBe(490);
  });
  it('não cobra além da evolução final e não aceita gasto no máximo', async () => {
    await db.companions.update(1, { foodInvested: 299, evolutionStage: 2 });
    const saved = await feedCompanion(1, 10);
    expect(saved.foodInvested).toBe(300);
    expect((await db.profile.get(1))?.food).toBe(499);
    await expect(feedCompanion(1, 1)).rejects.toThrow('máxima');
  });
  it('reverte comida se a gravação do companheiro falhar', async () => {
    vi.spyOn(db.companions, 'put').mockRejectedValueOnce(new Error('falha'));
    await expect(feedCompanion(1, 100)).rejects.toThrow('falha');
    expect((await db.profile.get(1))?.food).toBe(500);
    expect((await db.companions.get(1))?.foodInvested).toBe(0);
  });
  it('seleção e bônus respeitam o nível sem depender de visita ao bestiário', async () => {
    await expect(selectCompanion(3)).rejects.toThrow('disponível');
    await db.profile.update(1, { level: 15 });
    await selectCompanion(3);
    expect(await getActiveCompanionBuffs()).toEqual({ goldBonusPercent: 5 });
    await db.profile.update(1, { level: 1 });
    expect(await getActiveCompanionBuffs()).toBeNull();
  });
  it('duas evoluções com a mesma prévia não avançam duas etapas', async () => {
    const result = await Promise.allSettled([
      evolveCompanion(1, 1),
      evolveCompanion(1, 1),
    ]);
    expect(result.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await db.companions.get(1))?.evolutionStage).toBe(2);
    expect((await db.profile.get(1))?.food).toBe(400);
  });
  it('restaura recibos de cuidado e rejeita investimento incompatível', async () => {
    await feedCompanion(1, 100);
    await buyItem(getShopItemById(105)!);
    await setEquipment(105, true);
    const backup = await createJourneyBackup();
    await db.companions.clear();
    await db.ownedShopItems.clear();
    await restoreJourneyBackup(backup);
    expect((await db.companions.get(1))?.careHistory).toHaveLength(1);
    expect((await buildHeroModifiersFromOwned()).taskXpBonusPercent).toBe(5);
    const invalid = structuredClone(backup) as any;
    invalid.data.companions[0].careHistory[0].amount = 999;
    expect(() => validateBackup(invalid)).toThrow('excede investimento');
  });
});
describe('marcos e conquistas', () => {
  it('liga transformação ao evento original e conserva a referência após estorno', async () => {
    await db.profile.update(1, {
      totalXpEarned: 2490,
      ecoGoldClaimedUpToStage: 1,
    });
    const id = await db.tasks.add({
      title: 'Cruzar marco',
      xp: 50,
      rarity: 'common',
      completed: false,
      status: 'available',
      createdAt: new Date().toISOString(),
    });
    const event = await completeTask(id);
    let rows = discoveryRows(
      (await db.profile.get(1))!,
      await db.activityEvents.toArray(),
    );
    expect(rows[1].source?.id).toBe(event?.id);
    expect(rows[1].reached).toBe(true);
    await undoTask(id);
    rows = discoveryRows(
      (await db.profile.get(1))!,
      await db.activityEvents.toArray(),
    );
    expect(rows[1].source?.reversedAt).toBeTruthy();
    expect(rows[1].reached).toBe(true);
  });
  it('identifica marco legado sem fabricar evento ou prêmio', async () => {
    await db.profile.update(1, {
      totalXpEarned: 8000,
      ecoGoldClaimedUpToStage: 3,
    });
    expect(discoveryRows((await db.profile.get(1))!, [])[2]).toMatchObject({
      legacy: true,
      reached: true,
      source: undefined,
    });
    expect(await db.activityEvents.count()).toBe(0);
  });
  it('conquistas de economia usam posse e saldo reais e não estão marcadas futuras', async () => {
    await buyItem(getShopItemById(105)!);
    const stats = collectionStats(
      (await db.profile.get(1))!,
      [],
      await db.companions.toArray(),
      await db.ownedShopItems.toArray(),
    );
    expect(
      ALL_ACHIEVEMENTS.find((a) => a.id === 'primeira-compra')?.condition(
        stats,
      ),
    ).toBe(true);
    expect(
      ALL_ACHIEVEMENTS.find((a) => a.id === 'primeira-compra')?.future,
    ).toBeFalsy();
    expect(stats.completedMissions).toBe(0);
    expect(stats.unlockedCompanionsCount).toBe(1);
  });
});
