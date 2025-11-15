// src/services/gearItems.ts
import {
  db,
  type ShopItem,
  type GearEffect,
  type GearSlot,
  type ItemRarity,
} from '$services/db';

// Helper pra deixar o tipo mais estrito
type GearShopItem = ShopItem & {
  type: 'gear';
  rarity: ItemRarity;
  slot: GearSlot;
  effects: GearEffect[];
};

/**
 * Catálogo de itens de equipamento vendidos na loja.
 * Aqui você define NOME, DESCRIÇÃO, PREÇO e EFEITOS.
 */
export const GEAR_SHOP_ITEMS: GearShopItem[] = [
  // -------------------------------------------------
  // ARMADURAS – proteção de streak (não zera por X dias)
  // -------------------------------------------------
  {
    key: 'armor-streak-common',
    type: 'gear',
    name: 'Cota da Rotina',
    description: 'Permite falhar 1 dia sem quebrar o streak.',
    price: 500,
    rarity: 'common',
    slot: 'armor',
    effects: [{ type: 'streak_protection_days', value: 1 }],
  },
  {
    key: 'armor-streak-rare',
    type: 'gear',
    name: 'Guarda-peito da Perseverança',
    description: 'Permite falhar 2 dias sem quebrar o streak.',
    price: 1200,
    rarity: 'rare',
    slot: 'armor',
    effects: [{ type: 'streak_protection_days', value: 2 }],
  },
  {
    key: 'armor-streak-epic',
    type: 'gear',
    name: 'Armadura do Foco Inabalável',
    description: 'Permite falhar 3 dias sem quebrar o streak.',
    price: 2500,
    rarity: 'epic',
    slot: 'armor',
    effects: [{ type: 'streak_protection_days', value: 3 }],
  },
  {
    key: 'armor-streak-legendary',
    type: 'gear',
    name: 'Placas do Herói Eterno',
    description: 'Permite falhar 5 dias sem quebrar o streak.',
    price: 5000,
    rarity: 'legendary',
    slot: 'armor',
    effects: [{ type: 'streak_protection_days', value: 5 }],
  },

  // -------------------------------------------------
  // ESPADAS – reduzem subtarefas necessárias p/ raridade
  // -------------------------------------------------
  {
    key: 'sword-focus-rare',
    type: 'gear',
    name: 'Espada da Eficiência',
    description:
      'Reduz em 1 subtarefa os requisitos para missões Raras, Épicas e Lendárias.',
    price: 1800,
    rarity: 'rare',
    slot: 'weapon',
    effects: [{ type: 'rarity_subtask_reduction', value: 1 }],
  },
  {
    key: 'sword-focus-epic',
    type: 'gear',
    name: 'Lâmina da Otimização',
    description:
      'Reduz em 2 subtarefas os requisitos para missões Raras, Épicas e Lendárias.',
    price: 3200,
    rarity: 'epic',
    slot: 'weapon',
    effects: [{ type: 'rarity_subtask_reduction', value: 2 }],
  },
  {
    key: 'sword-focus-legendary',
    type: 'gear',
    name: 'Lâmina do Tempo Dobrada',
    description:
      'Reduz em 3 subtarefas os requisitos para missões Raras, Épicas e Lendárias.',
    price: 5500,
    rarity: 'legendary',
    slot: 'weapon',
    effects: [{ type: 'rarity_subtask_reduction', value: 3 }],
  },

  // -------------------------------------------------
  // AMULETOS – multiplicador de ouro
  // -------------------------------------------------
  {
    key: 'amulet-gold-common',
    type: 'gear',
    name: 'Amuleto do Trocado',
    description: '+5% de ouro recebido.',
    price: 600,
    rarity: 'common',
    slot: 'amulet',
    effects: [{ type: 'gold_multiplier', value: 0.05 }],
  },
  {
    key: 'amulet-gold-rare',
    type: 'gear',
    name: 'Amuleto do Cambista',
    description: '+10% de ouro recebido.',
    price: 1400,
    rarity: 'rare',
    slot: 'amulet',
    effects: [{ type: 'gold_multiplier', value: 0.1 }],
  },
  {
    key: 'amulet-gold-epic',
    type: 'gear',
    name: 'Amuleto do Tesouro Vivo',
    description: '+15% de ouro recebido.',
    price: 2600,
    rarity: 'epic',
    slot: 'amulet',
    effects: [{ type: 'gold_multiplier', value: 0.15 }],
  },
  {
    key: 'amulet-gold-legendary',
    type: 'gear',
    name: 'Relíquia do Cofre Infinito',
    description: '+20% de ouro recebido.',
    price: 4200,
    rarity: 'legendary',
    slot: 'amulet',
    effects: [{ type: 'gold_multiplier', value: 0.2 }],
  },

  // -------------------------------------------------
  // ANÉIS – buff extra do Santuário
  // -------------------------------------------------
  {
    key: 'ring-sanct-common',
    type: 'gear',
    name: 'Anel da Brisa Serena',
    description: '+1% ao bônus atual do Santuário.',
    price: 800,
    rarity: 'common',
    slot: 'ring',
    effects: [{ type: 'sanctuary_bonus_multiplier', value: 0.01 }],
  },
  {
    key: 'ring-sanct-rare',
    type: 'gear',
    name: 'Anel da Canção Silenciosa',
    description: '+3% ao bônus atual do Santuário.',
    price: 1600,
    rarity: 'rare',
    slot: 'ring',
    effects: [{ type: 'sanctuary_bonus_multiplier', value: 0.03 }],
  },
  {
    key: 'ring-sanct-epic',
    type: 'gear',
    name: 'Anel do Bosque Vivo',
    description: '+5% ao bônus atual do Santuário.',
    price: 3000,
    rarity: 'epic',
    slot: 'ring',
    effects: [{ type: 'sanctuary_bonus_multiplier', value: 0.05 }],
  },
  {
    key: 'ring-sanct-legendary',
    type: 'gear',
    name: 'Anel do Guardião Ancestral',
    description: '+10% ao bônus atual do Santuário.',
    price: 5000,
    rarity: 'legendary',
    slot: 'ring',
    effects: [{ type: 'sanctuary_bonus_multiplier', value: 0.1 }],
  },

  // -------------------------------------------------
  // MOCHILA – slots extras de inventário
  // -------------------------------------------------
  {
    key: 'bag-legendary',
    type: 'gear',
    name: 'Mochila do Aventureiro Sem Fundo',
    description: '+10 slots de inventário.',
    price: 3000,
    rarity: 'legendary',
    slot: 'bag',
    effects: [{ type: 'inventory_slots_bonus', value: 10 }],
  },

  // -------------------------------------------------
  // ELMO – bônus extra em projeto concluído
  // -------------------------------------------------
  {
    key: 'helm-project-legendary',
    type: 'gear',
    name: 'Elmo do Planejador Visionário',
    description: '+15% no bônus de XP ao concluir um projeto.',
    price: 3800,
    rarity: 'legendary',
    slot: 'helm',
    effects: [{ type: 'project_bonus_multiplier', value: 0.15 }],
  },
];

/**
 * Seed para garantir que os itens de gear existam na tabela shopItems.
 * Se já existir um item com a mesma key, ele é atualizado (nome, descrição etc.).
 */
export async function seedGearShopItems(): Promise<void> {
  await db.transaction('rw', db.shopItems, async () => {
    for (const item of GEAR_SHOP_ITEMS) {
      const existing = await db.shopItems.where('key').equals(item.key).first();

      if (existing && existing.id != null) {
        await db.shopItems.update(existing.id, {
          name: item.name,
          description: item.description,
          price: item.price,
          type: item.type,
          rarity: item.rarity,
          slot: item.slot,
          effects: item.effects,
        });
      } else {
        await db.shopItems.add(item);
      }
    }
  });
}
