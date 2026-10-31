import { beforeEach, describe, it, expect } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { readProfileSnapshot } from './profileQuery';
import { buyItem, setEquipment } from './shopService';
import { getShopItemById } from '$lib/shop/types';
import { equippedItemsForOwned, modifiersForOwned } from './gearService';
import { calculateReward } from './rewardService';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});
describe('perfil integrado', () => {
  it('usa o cálculo real para a prévia e mantém a companhia selecionada', async () => {
    const view = await readProfileSnapshot();
    expect(view.active).toBe(true);
    expect(view.companion?.id).toBe(view.profile.activeCompanionId);
    expect(view.preview).toEqual(
      calculateReward(100, view.profile, view.mods, view.buffs),
    );
    expect(view.preview.xp).toBe(105);
    expect(view.equipped).toEqual([]);
  });
  it('relê o equipamento e a recompensa depois de uma troca sem cache obsoleto', async () => {
    await db.profile.update(1, { gold: 10000 });
    const before = await readProfileSnapshot();
    await buyItem(getShopItemById(105)!);
    await setEquipment(105, true);
    const equipped = await readProfileSnapshot();
    expect(equipped.equipped.map((row) => row.item.id)).toEqual([105]);
    expect(equipped.mods.taskXpBonusPercent).toBe(5);
    expect(equipped.preview.xp).toBeGreaterThan(before.preview.xp);
    await setEquipment(105, false);
    expect((await readProfileSnapshot()).preview).toEqual(before.preview);
  });
  it('exibe o mesmo vencedor por espaço que o cálculo usa em dados legados', () => {
    const rows = [101, 104, 105, 999].map((itemId) => ({
      itemId,
      equipped: true,
      acquiredAt: '',
    }));
    const original = structuredClone(rows);
    expect(equippedItemsForOwned(rows).map((row) => row.item.id)).toEqual([
      105, 104,
    ]);
    expect(modifiersForOwned(rows)).toMatchObject({
      streakProtectionDays: 5,
      taskXpBonusPercent: 5,
    });
    expect(rows).toEqual(original);
  });
  it('não inventa lobo nem bônus para seleção indisponível ou ausente', async () => {
    await db.profile.update(1, { activeCompanionId: 3 });
    const locked = await readProfileSnapshot();
    expect(locked.companion?.id).toBe(3);
    expect(locked.active).toBe(false);
    expect(locked.buffs).toBeNull();
    expect(locked.preview.xp).toBe(100);
    await db.profile.update(1, { activeCompanionId: 999 });
    const absent = await readProfileSnapshot();
    expect(absent.companion).toBeUndefined();
    expect(absent.preview.xp).toBe(100);
    expect((await db.profile.get(1))?.activeCompanionId).toBe(999);
  });
  it('preserva posse desconhecida e não grava ao abrir o perfil', async () => {
    await db.ownedShopItems.add({
      itemId: 999,
      equipped: true,
      acquiredAt: '',
    });
    const original = await db.profile.get(1);
    const view = await readProfileSnapshot();
    expect(view.unknownEquipment).toBe(1);
    expect(view.equipped).toEqual([]);
    expect(await db.profile.get(1)).toEqual(original);
    expect(await db.ownedShopItems.count()).toBe(1);
  });
  it('não mostra perfil fictício se o registro não estiver disponível', async () => {
    await db.profile.delete(1);
    await expect(readProfileSnapshot()).rejects.toThrow(
      'Seu perfil não está disponível',
    );
    expect(await db.profile.count()).toBe(0);
  });
});
