// src/lib/shop/types.ts

// Raridade visual dos itens
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// Categoria de filtro na loja
export type ShopCategory =
  | 'highlight' // só na UI (aba "Destaque")
  | 'gear' // artefatos de gameplay (Espada, Anel, Amuleto...)
  | 'theme' // temas de fundo
  | 'utility' // utilidades gerais
  | 'effect' // efeitos visuais/sonoros
  | 'profile'; // molduras / coisas de perfil

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
};

// Lista oficial de itens da Loja
// (IDs e keys usados em gearService / modifiers)
export const SHOP_ITEMS: ShopItem[] = [
  // ---------- ARTEFATOS DE GAMEPLAY (GEAR) ----------
  {
    id: 101,
    key: 'gear-sword-thousand-tasks',
    name: 'Espada das Mil Tarefas',
    description:
      'Reduz o número de subtarefas necessárias para que missões virem Raras, Épicas e Lendárias (mais XP por missão complexa).',
    price: 900,
    rarity: 'epic',
    category: 'gear',
    tag: '+Dificuldade = +XP',
    status: 'available',
  },
  {
    id: 102,
    key: 'gear-ring-forest-prosper',
    name: 'Anel da Floresta Próspera',
    description:
      'Aumenta levemente o bônus de XP do Santuário e o Gold ganho por missão.',
    price: 900,
    rarity: 'rare',
    category: 'gear',
    tag: '+XP & +Gold',
    status: 'available',
  },
  {
    id: 103,
    key: 'gear-amulet-eternal-streak',
    name: 'Amuleto da Sequência Eterna',
    description:
      'Perdoa um dia perdido antes de resetar sua sequência, protegendo seu streak em momentos difíceis.',
    price: 1200,
    rarity: 'legendary',
    category: 'gear',
    tag: 'Protege Streak',
    status: 'available',
  },

  // ---------- COSMÉTICOS / QUALIDADE DE VIDA ----------
  {
    id: 201,
    key: 'cosmetic-theme-night-arcane',
    name: 'Tema "Noite Arcana"',
    description:
      'Transforma a taverna em um salão ainda mais místico, com brilhos sutis e runas animadas.',
    price: 800,
    rarity: 'epic',
    category: 'theme',
    tag: 'Visual',
    status: 'available',
  },
  {
    id: 202,
    key: 'cosmetic-theme-aurora-hero',
    name: 'Tema "Aurora do Herói"',
    description:
      'Tema claro com auroras suaves e partículas de luz; perfeito para quem prefere um clima amanhecer.',
    price: 900,
    rarity: 'epic',
    category: 'theme',
    tag: 'Visual',
    status: 'available',
  },
  {
    id: 203,
    key: 'cosmetic-sfx-forge',
    name: 'Pacote de Sons "Forja & Canecas"',
    description:
      'Adiciona sons imersivos de forja, canecas se chocando e páginas virando aos seus cliques.',
    price: 600,
    rarity: 'rare',
    category: 'effect',
    tag: 'Imersão',
    status: 'available',
  },
  {
    id: 204,
    key: 'cosmetic-frame-legendary-hero',
    name: 'Moldura Lendária do Herói',
    description:
      'Uma moldura especial para o avatar, reservada apenas aos aventureiros verdadeiramente dedicados.',
    price: 1500,
    rarity: 'legendary',
    category: 'profile',
    tag: 'Perfil',
    status: 'soon',
  },
  {
    id: 205,
    key: 'utility-extra-inventory-slot',
    name: 'Slot Extra de Inventário',
    description:
      'Aumenta a capacidade de itens visuais carregados (futuro impacto direto no inventário).',
    price: 300,
    rarity: 'rare',
    category: 'utility',
    tag: 'Raro',
    status: 'available',
  },
  {
    id: 206,
    key: 'utility-magic-reminder',
    name: 'Lembrete Mágico Diário',
    description:
      'Desbloqueia lembretes suaves para não deixar suas missões passarem em branco.',
    price: 200,
    rarity: 'common',
    category: 'utility',
    tag: 'Comum',
    status: 'soon',
  },
  {
    id: 207,
    key: 'effect-entrance-tavern',
    name: 'Efeito de Entrada na Taverna',
    description:
      'Um pequeno efeito visual quando você volta para a Taverna, mostrando sua presença.',
    price: 600,
    rarity: 'epic',
    category: 'effect',
    tag: 'Épico',
    status: 'soon',
  },
];

// helper simples
export function getShopItemById(id: number): ShopItem | undefined {
  return SHOP_ITEMS.find((it) => it.id === id);
}
