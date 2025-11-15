// src/lib/shop/types.ts
import type { GearSlot } from '$services/db';

// Raridade visual dos itens
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// Categoria de filtro na loja
export type ShopCategory =
  | 'highlight' // só na UI (aba "Destaque")
  | 'gear' // artefatos de gameplay
  | 'theme'
  | 'utility'
  | 'effect'
  | 'profile';

export type ShopItemStatus = 'available' | 'soon';

export type ShopItem = {
  id: number;
  key: string; // chave estável pra lógica interna
  name: string;
  description: string;
  price: number;
  rarity: Rarity;
  category: Exclude<ShopCategory, 'highlight'>;
  tag?: string;
  status: ShopItemStatus;

  // slot de equipamento (usado pra garantir 1 item por slot)
  slot?: GearSlot;
};

// Lista oficial de itens da Loja
// ⚠️ SOMENTE os 17 artefatos novos
export const SHOP_ITEMS: ShopItem[] = [
  // ---------- ARMADURAS (PROTEÇÃO DE STREAK) ----------
  {
    id: 101,
    key: 'gear-armor-coat-routine',
    name: 'Cota da Rotina',
    description: 'Permite falhar 1 dia sem quebrar o streak.',
    price: 500,
    rarity: 'common',
    category: 'gear',
    tag: 'Protege Streak',
    status: 'available',
    slot: 'armor',
  },
  {
    id: 102,
    key: 'gear-armor-breastplate-perseverance',
    name: 'Guarda-peito da Perseverança',
    description: 'Permite falhar 2 dias sem quebrar o streak.',
    price: 1200,
    rarity: 'rare',
    category: 'gear',
    tag: 'Protege Streak',
    status: 'available',
    slot: 'armor',
  },
  {
    id: 103,
    key: 'gear-armor-focus-unshakable',
    name: 'Armadura do Foco Inabalável',
    description: 'Permite falhar 3 dias sem quebrar o streak.',
    price: 2500,
    rarity: 'epic',
    category: 'gear',
    tag: 'Protege Streak',
    status: 'available',
    slot: 'armor',
  },
  {
    id: 104,
    key: 'gear-armor-eternal-hero-plates',
    name: 'Placas do Herói Eterno',
    description: 'Permite falhar 5 dias sem quebrar o streak.',
    price: 5000,
    rarity: 'legendary',
    category: 'gear',
    tag: 'Protege Streak',
    status: 'available',
    slot: 'armor',
  },

  // ---------- ESPADAS (EFICIÊNCIA / SUBTAREFAS) ----------
  {
    id: 105,
    key: 'gear-sword-efficiency',
    name: 'Espada da Eficiência',
    description:
      'Reduz em 1 a quantidade de subtarefas para missões de alta raridade.',
    price: 1800,
    rarity: 'rare',
    category: 'gear',
    tag: 'Subtarefas -1',
    status: 'available',
    slot: 'weapon',
  },
  {
    id: 106,
    key: 'gear-sword-optimization',
    name: 'Lâmina da Otimização',
    description:
      'Reduz em 2 a quantidade de subtarefas para missões de alta raridade.',
    price: 3200,
    rarity: 'epic',
    category: 'gear',
    tag: 'Subtarefas -2',
    status: 'available',
    slot: 'weapon',
  },
  {
    id: 107,
    key: 'gear-sword-time-bent',
    name: 'Lâmina do Tempo Dobrada',
    description:
      'Reduz em 3 a quantidade de subtarefas para missões de alta raridade.',
    price: 5500,
    rarity: 'legendary',
    category: 'gear',
    tag: 'Subtarefas -3',
    status: 'available',
    slot: 'weapon',
  },

  // ---------- AMULETOS (ECONOMIA / GOLD) ----------
  {
    id: 108,
    key: 'gear-amulet-change',
    name: 'Amuleto do Trocado',
    description: '+5% de ouro recebido.',
    price: 600,
    rarity: 'common',
    category: 'gear',
    tag: '+5% Gold',
    status: 'available',
    slot: 'amulet',
  },
  {
    id: 109,
    key: 'gear-amulet-moneychanger',
    name: 'Amuleto do Cambista',
    description: '+10% de ouro recebido.',
    price: 1400,
    rarity: 'rare',
    category: 'gear',
    tag: '+10% Gold',
    status: 'available',
    slot: 'amulet',
  },
  {
    id: 110,
    key: 'gear-amulet-living-treasure',
    name: 'Amuleto do Tesouro Vivo',
    description: '+15% de ouro recebido.',
    price: 2600,
    rarity: 'epic',
    category: 'gear',
    tag: '+15% Gold',
    status: 'available',
    slot: 'amulet',
  },
  {
    id: 111,
    key: 'gear-amulet-infinite-vault',
    name: 'Relíquia do Cofre Infinito',
    description: '+20% de ouro recebido.',
    price: 4200,
    rarity: 'legendary',
    category: 'gear',
    tag: '+20% Gold',
    status: 'available',
    slot: 'amulet',
  },

  // ---------- ANÉIS (BUFF DE SANTUÁRIO) ----------
  {
    id: 112,
    key: 'gear-ring-serene-breeze',
    name: 'Anel da Brisa Serena',
    description: '+1% ao bônus atual do Santuário.',
    price: 800,
    rarity: 'common',
    category: 'gear',
    tag: '+1% Santuário',
    status: 'available',
    slot: 'ring',
  },
  {
    id: 113,
    key: 'gear-ring-silent-song',
    name: 'Anel da Canção Silenciosa',
    description: '+3% ao bônus atual do Santuário.',
    price: 1600,
    rarity: 'rare',
    category: 'gear',
    tag: '+3% Santuário',
    status: 'available',
    slot: 'ring',
  },
  {
    id: 114,
    key: 'gear-ring-living-forest',
    name: 'Anel do Bosque Vivo',
    description: '+5% ao bônus atual do Santuário.',
    price: 3000,
    rarity: 'epic',
    category: 'gear',
    tag: '+5% Santuário',
    status: 'available',
    slot: 'ring',
  },
  {
    id: 115,
    key: 'gear-ring-ancient-guardian',
    name: 'Anel do Guardião Ancestral',
    description: '+10% ao bônus atual do Santuário.',
    price: 5000,
    rarity: 'legendary',
    category: 'gear',
    tag: '+10% Santuário',
    status: 'available',
    slot: 'ring',
  },

  // ---------- UTILITÁRIOS (MOCHILA & PROJETO) ----------
  {
    id: 116,
    key: 'gear-bag-bottomless-adventurer',
    name: 'Mochila do Aventureiro Sem Fundo',
    description: '+10 slots de inventário.',
    price: 3000,
    rarity: 'legendary',
    category: 'gear',
    tag: '+10 Slots',
    status: 'available',
    slot: 'bag',
  },
  {
    id: 117,
    key: 'gear-helm-visionary-planner',
    name: 'Elmo do Planejador Visionário',
    description: '+15% de XP ao concluir um projeto.',
    price: 3800,
    rarity: 'legendary',
    category: 'gear',
    tag: '+15% XP Projeto',
    status: 'available',
    slot: 'helm',
  },
];

// helper simples
export function getShopItemById(id: number): ShopItem | undefined {
  return SHOP_ITEMS.find((it) => it.id === id);
}
