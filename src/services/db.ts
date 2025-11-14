// src/services/db.ts
import Dexie, { type Table } from 'dexie';

// ---------------------------------------------
// PROFILE (herói)
// ---------------------------------------------
export interface Profile {
  id?: number;
  name: string;
  title?: string;

  level: number;
  xpCurrent: number;
  xpNext: number;
  totalXpEarned: number;

  gold: number; // usado no app inteiro
  avatarUrl?: string;

  // streak
  currentStreak: number;
  lastCompletionDate?: string | null;

  // pet ativo
  activeCompanionId?: number | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;

  // usado no EcoPanel
  ecoGoldClaimedUpToStage?: number;
}

// ---------------------------------------------
// AREAS
// ---------------------------------------------
export interface Area {
  id?: number;
  nome: string;
  descricao?: string;
  ordem?: number;
  cor?: string;
}

// ---------------------------------------------
// TASKS (missões)
// ---------------------------------------------
export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type TaskStatus = 'available' | 'todo' | 'completed';

export interface Task {
  id?: number;

  title: string;
  description?: string;

  areaId?: number;

  // FASE 2 – projetos
  projectId?: number | null;

  xp: number;
  rarity: TaskRarity;

  status?: TaskStatus;
  completed?: boolean;
  archived?: boolean;

  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string | null;

  todoOrder?: number;

  // revisão espaçada
  reviewEnabled?: boolean;
  reviewIntervalDays?: number | null;
  reviewStartedAt?: Date | string | null;
}

// ---------------------------------------------
// XP LOGS
// ---------------------------------------------
export interface XpLog {
  id?: number;
  date: string; // yyyy-mm-dd
  amount: number;

  areaId?: number | null;
  type?: 'gain' | 'spend';
  reason?: string;

  createdAt?: string | Date;
}

// ---------------------------------------------
// INVENTÁRIO / LOJA
// ---------------------------------------------
export type InventoryItemType =
  | 'frame'
  | 'avatar'
  | 'background'
  | 'aura'
  | 'weapon-skin';

export interface InventoryItem {
  id?: number;
  key: string;
  type: InventoryItemType;
  name: string;
  description?: string;
  owned: boolean;
  equipped?: boolean;
}

export interface ShopItem {
  id?: number;
  key: string;
  type: InventoryItemType;
  name: string;
  description?: string;
  price: number;
}

export interface OwnedShopItem {
  id?: number;
  itemId: number;
}

// ---------------------------------------------
// COMPANIONS (PETS)
// ---------------------------------------------
export type CompanionRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Companion {
  id?: number;

  // ⚠️ estes são OPCIONAIS pra bater com o PET_SEED do bestiário
  key?: string;
  rarity?: CompanionRarity;
  type?: string;
  imagePath?: string;

  name: string;

  unlocked?: boolean;
  requiredLevel?: number;
  description?: string;
  createdAt?: string | Date;
}

// ---------------------------------------------
// LEGACY ITEM (ItemManager antigo)
// ---------------------------------------------
export interface LegacyItem {
  id?: number;
  titulo: string;
  descricao?: string;
  xp?: number;
  areaId?: number;
}

// ---------------------------------------------
// HERO PROJECT (FASE 2)
// ---------------------------------------------
export type HeroProjectStatus =
  | 'planejando'
  | 'em_andamento'
  | 'concluido'
  | 'pausado'
  | 'arquivado';

export interface HeroProject {
  id?: number;

  name: string;
  vision?: string | null;
  status: HeroProjectStatus;

  createdAt: Date | string;
  updatedAt?: Date | string;

  targetDate?: Date | string | null;

  color?: string | null;
  icon?: string | null;

  // pra Fase 4 (bônus de XP)
  rewardGranted?: boolean;
}

// ---------------------------------------------
// BANCO DEXIE
// ---------------------------------------------
export class LevelMeUpDB extends Dexie {
  profile!: Table<Profile, number>;
  tasks!: Table<Task, number>;
  areas!: Table<Area, number>;
  xpLogs!: Table<XpLog, number>;

  inventory!: Table<InventoryItem, number>;
  shopItems!: Table<ShopItem, number>;
  ownedShopItems!: Table<OwnedShopItem, number>;

  companions!: Table<Companion, number>;

  items!: Table<LegacyItem, number>; // legado

  projects!: Table<HeroProject, number>; // Fase 2

  constructor() {
    super('LevelMeUpDB');

    // versão 4 (já estávamos nela, não muda o schema aqui)
    this.version(4).stores({
      profile: '++id',

      tasks:
        '++id, areaId, projectId, status, completed, archived, createdAt, completedAt, reviewEnabled',

      xpLogs: '++id, date, areaId, createdAt',

      areas: '++id',

      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      ownedShopItems: '++id, itemId',

      companions: '++id, key, rarity, unlocked',

      items: '++id, areaId',

      projects: '++id, status, createdAt, targetDate',
    });
  }
}

export const db = new LevelMeUpDB();
