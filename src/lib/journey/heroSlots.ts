export type HeroSlot = {
  key: string;
  label: string;
  item?: {
    name: string;
    description?: string | null;
    iconSrc?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
};
export type RarityKey = 'comum' | 'raro' | 'épico' | 'lendário';
/** Raridades reais: as da loja (inglês) e as do catálogo de conquistas (português). */
export function rarityKey(value?: string | null): RarityKey | null {
  switch (value) {
    case 'common':
    case 'comum':
      return 'comum';
    case 'rare':
    case 'raro':
      return 'raro';
    case 'epic':
    case 'épico':
      return 'épico';
    case 'legendary':
    case 'lendário':
      return 'lendário';
    default:
      return null;
  }
}
export const rarityLabel: Record<RarityKey, string> = {
  comum: 'Comum',
  raro: 'Raro',
  épico: 'Épico',
  lendário: 'Lendário',
};
