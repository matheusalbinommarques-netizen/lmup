import { db, type OwnedShopItem } from '$services/db';
import { getShopItemById, type ShopItem } from '$lib/shop/types';
import { invalidateHeroModifiersCache } from './gearService';
export type BuyResult =
  | { ok: true; code?: 'already_owned' }
  | {
      ok: false;
      code:
        | 'no_funds'
        | 'profile_missing'
        | 'unknown'
        | 'unavailable'
        | 'capacity';
    };
export async function buyItem(input: ShopItem): Promise<BuyResult> {
  const item = getShopItemById(input.id);
  if (!item || item.status !== 'available')
    return { ok: false, code: 'unavailable' };
  return db.transaction(
    'rw',
    db.profile,
    db.ownedShopItems,
    db.inventory,
    async () => {
      const profile = await db.profile.get(1);
      if (!profile) return { ok: false, code: 'profile_missing' };
      const owned = await db.ownedShopItems.toArray();
      if (owned.some((row) => row.itemId === item.id))
        return { ok: true, code: 'already_owned' };
      if (profile.gold < item.price) return { ok: false, code: 'no_funds' };
      const visuals = await db.inventory
        .filter((row) => row.owned && row.type !== 'gear')
        .count();
      const bag = owned.some(
        (row) => row.equipped && getShopItemById(row.itemId)?.slot === 'bag',
      );
      if (owned.length + visuals >= 20 + (bag ? 10 : 0) && item.slot !== 'bag')
        return { ok: false, code: 'capacity' };
      const row: OwnedShopItem = {
        itemId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        rarity: item.rarity,
        category: item.category,
        equipped: false,
        acquiredAt: new Date().toISOString(),
      };
      await db.profile.update(1, { gold: profile.gold - item.price });
      await db.ownedShopItems.add(row);
      return { ok: true };
    },
  );
}
/** Desired state makes repeated submissions safe; one equipment per slot. */
export async function setEquipment(
  itemId: number,
  equipped: boolean,
): Promise<void> {
  await db.transaction('rw', db.ownedShopItems, async () => {
    const target = await db.ownedShopItems.where({ itemId }).first();
    const meta = getShopItemById(itemId);
    if (!target?.id || !meta?.slot)
      throw new Error('Este equipamento não está disponível na sua coleção.');
    if (equipped)
      for (const row of await db.ownedShopItems.toArray())
        if (
          row.id !== target.id &&
          row.equipped &&
          getShopItemById(row.itemId)?.slot === meta.slot
        )
          await db.ownedShopItems.update(row.id!, { equipped: false });
    await db.ownedShopItems.update(target.id, { equipped });
  });
  invalidateHeroModifiersCache();
}
export async function equipItemById(itemId: number): Promise<void> {
  const target = await db.ownedShopItems.where({ itemId }).first();
  await setEquipment(itemId, !target?.equipped);
}
export async function isOwned(itemId: number): Promise<boolean> {
  return !!(await db.ownedShopItems.where({ itemId }).first());
}

export async function setCosmetic(id: number, equipped: boolean) {
  await db.transaction('rw', db.inventory, async () => {
    const target = await db.inventory.get(id);
    if (!target?.owned || target.type === 'gear')
      throw new Error('Este item visual não está disponível.');
    if (equipped)
      await db.inventory
        .filter(
          (row) => row.id !== id && row.type === target.type && !!row.equipped,
        )
        .modify({ equipped: false });
    await db.inventory.update(id, { equipped });
  });
}

/** Repair conflicting legacy flags, preserving every owned item and receipt. */
export async function repairEquipmentSlots(): Promise<void> {
  await db.transaction('rw', db.ownedShopItems, async () => {
    const slots = new Set<string>();
    for (const row of (await db.ownedShopItems.toArray()).sort(
      (a, b) => b.itemId - a.itemId,
    )) {
      const slot = getShopItemById(row.itemId)?.slot;
      if (!row.equipped || !slot) continue;
      if (slots.has(slot))
        await db.ownedShopItems.update(row.id!, { equipped: false });
      else slots.add(slot);
    }
  });
  invalidateHeroModifiersCache();
}
