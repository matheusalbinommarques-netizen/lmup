// src/services/db.ts
import Dexie, { type Table } from 'dexie';

/**
 * PERFIL DO HERÓI
 */
export interface Profile {
  id?: number;
  name: string;
  title: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  totalXpEarned: number;

  // Deixamos opcional para não quebrar fallbacks antigos
  gold?: number;

  avatarUrl?: string;
  currentStreak?: number;
  lastCompletionDate?: string | null; // 'YYYY-MM-DD'
  activeCompanionId?: number | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * ÁREAS (Carreira, Geral, LMU, etc.)
 */
export interface Area {
  id?: number;
  nome: string;
  color?: string | null;
  icon?: string | null;
  createdAt?: Date | string;
}

/**
 * MISSÕES / TAREFAS
 */
export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type TaskStatus = 'available' | 'todo' | 'completed';

export interface Task {
  id?: number;
  title: string;

  // Aceita string ou null (pra bater com os modais que enviam `null`)
  description?: string | null;

  areaId?: number; // referência a Area.id
  xp: number;
  rarity: TaskRarity;

  // status / fluxo
  status?: TaskStatus;
  completed?: boolean;
  archived?: boolean;

  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string | null;

  // ordenação da lista "A fazer"
  todoOrder?: number;

  // revisão espaçada
  reviewEnabled?: boolean;
  reviewIntervalDays?: number | null;
  reviewStartedAt?: Date | string | null;
}

/**
 * LOG DE XP POR DIA / ÁREA
 */
export interface XpLog {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  amount: number; // pode ser positivo ou negativo
  areaId: number | null;
  createdAt: Date;
}

/**
 * INVENTÁRIO (itens cosméticos, etc.)
 * (estrutura mínima — pode ter mais campos em outros arquivos)
 */
export interface InventoryItem {
  id?: number;
  key: string; // ex: 'avatar_frame_01'
  type: string; // ex: 'avatar-frame', 'background'
  owned: boolean;
  equipped?: boolean;
  acquiredAt?: Date | string;
}

/**
 * ITENS DE LOJA (catálogo da loja no banco, não o tipo da UI)
 */
export interface ShopItem {
  id?: number;
  key: string; // identificador interno do item
  type: string; // ex: 'theme', 'effect', 'profile'
  name: string;
  description?: string;
  price: number;
  createdAt?: Date | string;
}

/**
 * ITENS DE LOJA POSSUÍDOS PELO JOGADOR
 * (ligação entre um item de catálogo e o jogador)
 */
export interface OwnedShopItem {
  id?: number;
  itemId: number; // referencia ShopItem.id
  acquiredAt: Date | string;
}

/**
 * COMPANHEIROS / PETS
 * Compatível com o Bestiário e a Taverna:
 * - name, type, imagePath (como nas seeds)
 * - key/rarity opcionais (pra achievements)
 */
export interface Companion {
  id?: number;
  key?: string;
  name: string;
  type: string;
  imagePath: string;
  rarity?: TaskRarity;
  unlocked?: boolean;
}

/**
 * TABELA LEGADA DE ITENS POR ÁREA (ItemManager)
 * Estrutura equivalente ao ItemV1 do app antigo.
 */
export interface LegacyItem {
  id?: number;
  areaId: number;
  titulo: string;
  xp?: number;
}

/**
 * BANCO DEXIE
 */
export class LevelMeUpDB extends Dexie {
  profile!: Table<Profile, number>;
  tasks!: Table<Task, number>;
  areas!: Table<Area, number>;
  xpLogs!: Table<XpLog, number>;

  inventory!: Table<InventoryItem, number>;
  shopItems!: Table<ShopItem, number>;
  ownedShopItems!: Table<OwnedShopItem, number>;

  companions!: Table<Companion, number>;

  // tabela legada de itens por área (ItemManager)
  items!: Table<LegacyItem, number>;

  constructor() {
    super('LevelMeUpDB');

    /**
     * IMPORTANTE:
     * - Versão 2 para evitar o warning "Schema was extended without increasing db.version()".
     * - Aqui listamos TODAS as stores atuais do app.
     */
    this.version(2).stores({
      profile: '++id',
      tasks:
        '++id, areaId, completed, status, archived, reviewEnabled, createdAt, completedAt',
      areas: '++id',
      xpLogs: '++id, date, areaId',

      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      ownedShopItems: '++id, itemId',

      companions: '++id, key, rarity, unlocked',

      // tabela de itens legados por área (ItemManager)
      items: '++id, areaId',
    });
  }
}

export const db = new LevelMeUpDB();
