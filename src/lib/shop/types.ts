// src/lib/shop/types.ts
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ShopCategory =
  | 'highlight'
  | 'theme'
  | 'utility'
  | 'effect'
  | 'profile';

export type ShopItemStatus = 'available' | 'soon' | 'owned';

export type ShopItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  category: ShopCategory;
  tag?: string;
  status?: ShopItemStatus;
};
