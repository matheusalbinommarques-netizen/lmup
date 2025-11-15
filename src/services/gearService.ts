// src/services/gearService.ts
import { db, type OwnedShopItem } from '$services/db';
import type { ShopItem } from '$lib/shop/types';
import { getShopItemById } from '$lib/shop/types';

export type HeroModifiers = {
  streakProtectionDays: number; // quantos dias de "perdão" no streak
  goldMultiplier: number; // multiplicador de gold (1 = normal)
  sanctuaryBonusExtraPercent: number; // bônus extra (%) no multiplicador do Santuário
  inventoryExtraSlots: number; // slots extras no inventário visual
  projectBonusExtraFraction: number; // fração extra (0.1 = +10%) em bônus de projeto
  rarityThresholdDelta: number; // desloca limiares de raridade por subtarefas
};

const BASE_MODIFIERS: HeroModifiers = {
  streakProtectionDays: 0,
  goldMultiplier: 1,
  sanctuaryBonusExtraPercent: 0,
  inventoryExtraSlots: 0,
  projectBonusExtraFraction: 0,
  rarityThresholdDelta: 0,
};

/**
 * Aplica o efeito de UM item da loja nos modificadores.
 * Importante: as keys aqui PRECISAM bater com as de SHOP_ITEMS (lib/shop/types.ts).
 */
function applyItem(mods: HeroModifiers, item: ShopItem): void {
  switch (item.key) {
    // ----- ARMADURAS: proteção de streak -----
    case 'gear-armor-coat-routine':
      mods.streakProtectionDays += 1;
      break;
    case 'gear-armor-breastplate-perseverance':
      mods.streakProtectionDays += 2;
      break;
    case 'gear-armor-focus-unshakable':
      mods.streakProtectionDays += 3;
      break;
    case 'gear-armor-eternal-hero-plates':
      mods.streakProtectionDays += 5;
      break;

    // ----- ESPADAS: redução de subtarefas para raridade alta -----
    case 'gear-sword-efficiency':
      mods.rarityThresholdDelta += 1;
      break;
    case 'gear-sword-optimization':
      mods.rarityThresholdDelta += 2;
      break;
    case 'gear-sword-time-bent':
      mods.rarityThresholdDelta += 3;
      break;

    // ----- AMULETOS: bônus de Gold -----
    case 'gear-amulet-change':
      mods.goldMultiplier *= 1.05; // +5%
      break;
    case 'gear-amulet-moneychanger':
      mods.goldMultiplier *= 1.1; // +10%
      break;
    case 'gear-amulet-living-treasure':
      mods.goldMultiplier *= 1.15; // +15%
      break;
    case 'gear-amulet-infinite-vault':
      mods.goldMultiplier *= 1.2; // +20%
      break;

    // ----- ANÉIS: bônus extra de Santuário -----
    case 'gear-ring-serene-breeze':
      mods.sanctuaryBonusExtraPercent += 1;
      break;
    case 'gear-ring-silent-song':
      mods.sanctuaryBonusExtraPercent += 3;
      break;
    case 'gear-ring-living-forest':
      mods.sanctuaryBonusExtraPercent += 5;
      break;
    case 'gear-ring-ancient-guardian':
      mods.sanctuaryBonusExtraPercent += 10;
      break;

    // ----- MOCHILA -----
    case 'gear-bag-bottomless-adventurer':
      mods.inventoryExtraSlots += 10;
      break;

    // ----- ELMO (bônus de projeto) -----
    // AQUI é onde o Elmo do Planejador Visionário entra:
    case 'gear-helm-visionary-planner':
      // +15% em cima do bônus de projeto da dificuldade
      mods.projectBonusExtraFraction += 0.15;
      break;

    default:
      // itens sem efeito de gameplay (se existirem)
      break;
  }
}

/**
 * Constrói os modificadores do herói a partir dos itens equipados.
 * A exclusividade já é garantida por SLOT na loja/inventário,
 * então aqui basta aplicar o efeito de cada item equipado.
 */
async function buildHeroModifiersFromOwned(): Promise<HeroModifiers> {
  const allOwned: OwnedShopItem[] = await db.ownedShopItems.toArray();

  const equippedRows = allOwned.filter(
    (row) => row.equipped && typeof row.itemId === 'number',
  );

  const mods: HeroModifiers = { ...BASE_MODIFIERS };

  for (const row of equippedRows) {
    const item = getShopItemById(row.itemId as number);
    if (!item) continue;
    applyItem(mods, item);
  }

  return mods;
}

// cache simples pra não recalcular toda hora
let lastMods: HeroModifiers | null = null;
let lastBuiltAt = 0;
const CACHE_MS = 1000;

export async function getHeroModifiersOnce(): Promise<HeroModifiers> {
  const now = Date.now();
  if (lastMods && now - lastBuiltAt < CACHE_MS) {
    return lastMods;
  }

  const mods = await buildHeroModifiersFromOwned();
  lastMods = mods;
  lastBuiltAt = now;
  return mods;
}

export function invalidateHeroModifiersCache(): void {
  lastMods = null;
  lastBuiltAt = 0;
}
