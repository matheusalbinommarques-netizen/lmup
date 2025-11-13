// src/services/shopService.ts
import { db, type OwnedShopItem, type ShopCategoryDB } from './db';
import type { ShopItem } from '$lib/shop/types';

export type BuyResult =
  | { ok: true; code?: 'already_owned' }
  | { ok: false; code: 'no_funds' | 'profile_missing' | 'unknown' };

export async function buyItem(item: ShopItem): Promise<BuyResult> {
  try {
    return await db.transaction(
      'rw',
      db.profile,
      db.ownedShopItems,
      async () => {
        const profile = await db.profile.get(1);
        if (!profile) return { ok: false, code: 'profile_missing' };

        // idempotente: se já possui, retorna ok
        const already = await db.ownedShopItems
          .where({ itemId: item.id })
          .first();
        if (already) return { ok: true, code: 'already_owned' };

        const currentGold = profile.gold ?? 0;
        if (currentGold < item.price) return { ok: false, code: 'no_funds' };

        await db.profile.update(1, { gold: currentGold - item.price });

        const row: OwnedShopItem = {
          itemId: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          rarity: item.rarity as OwnedShopItem['rarity'],
          category: item.category as ShopCategoryDB,
          equipped: false,
          acquiredAt: new Date().toISOString(),
        };

        await db.ownedShopItems.add(row);
        return { ok: true };
      },
    );
  } catch {
    return { ok: false, code: 'unknown' };
  }
}

export async function equipItemById(itemId: number): Promise<void> {
  await db.transaction('rw', db.ownedShopItems, async () => {
    const target = await db.ownedShopItems.where({ itemId }).first();
    if (!target) return;

    // um equipado por categoria
    await db.ownedShopItems
      .where('category')
      .equals(target.category)
      .modify({ equipped: false });

    await db.ownedShopItems.update(target.id!, { equipped: true });
  });
}

export async function isOwned(itemId: number): Promise<boolean> {
  const row = await db.ownedShopItems.where({ itemId }).first();
  return !!row;
}
