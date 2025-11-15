// src/services/shopService.ts
import { db, type OwnedShopItem } from '$services/db';
import type { ShopItem } from '$lib/shop/types';

export type BuyResult =
  | { ok: true; code?: 'already_owned' }
  | { ok: false; code: 'no_funds' | 'profile_missing' | 'unknown' };

/**
 * Compra um item da loja:
 * - Verifica se o perfil existe
 * - Garante que o item tem id
 * - Evita compra duplicada (idempotente)
 * - Desconta gold
 * - Salva metadados mínimos do item comprado em ownedShopItems
 */
export async function buyItem(item: ShopItem): Promise<BuyResult> {
  try {
    return await db.transaction(
      'rw',
      db.profile,
      db.ownedShopItems,
      async () => {
        const profile = await db.profile.get(1);
        if (!profile) {
          return { ok: false, code: 'profile_missing' };
        }

        if (item.id == null) {
          // seed bugada (item sem id)
          return { ok: false, code: 'unknown' };
        }

        // já possui = idempotente
        const already = await db.ownedShopItems
          .where({ itemId: item.id })
          .first();

        if (already) {
          return { ok: true, code: 'already_owned' };
        }

        const currentGold = profile.gold ?? 0;
        if (currentGold < item.price) {
          return { ok: false, code: 'no_funds' };
        }

        // desconta gold do perfil
        await db.profile.update(1, { gold: currentGold - item.price });

        // guarda metadados básicos do item no momento da compra
        const row: OwnedShopItem = {
          itemId: item.id,
          name: item.name,
          description: item.description ?? null,
          price: item.price,
          rarity: item.rarity, // compatível com ShopItemRarity
          category: item.category, // string (tipo/categoria de vitrine)
          equipped: false,
          acquiredAt: new Date().toISOString(),
        };

        await db.ownedShopItems.add(row);

        return { ok: true };
      },
    );
  } catch (error) {
    console.error('Erro em buyItem:', error);
    return { ok: false, code: 'unknown' };
  }
}

/**
 * Alterna o estado equipado de um item:
 * - se estava equipado -> desequipa
 * - se estava desequipado -> equipa
 * Não mexe nos outros itens => você pode ter VÁRIOS equipados ao mesmo tempo.
 */
export async function equipItemById(itemId: number): Promise<void> {
  await db.transaction('rw', db.ownedShopItems, async () => {
    const target = await db.ownedShopItems.where({ itemId }).first();
    if (!target || !target.id) return;

    const newState = !target.equipped;
    await db.ownedShopItems.update(target.id, { equipped: newState });
  });
}

export async function isOwned(itemId: number): Promise<boolean> {
  const row = await db.ownedShopItems.where({ itemId }).first();
  return !!row;
}
