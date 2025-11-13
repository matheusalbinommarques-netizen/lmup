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
  gold: number;
  avatarUrl?: string;
  currentStreak?: number;
  lastCompletionDate?: string | null; // 'YYYY-MM-DD'
  activeCompanionId?: number | null;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ÁREAS (Carreira, Geral, LMU, etc.)
 */
export interface Area {
  id?: number;
  nome: string;
  // Preferir usar "color" daqui pra frente.
  color?: string | null;
  // Campo legado, usado em alguns lugares como "cor".
  cor?: string | null;
  icon?: string | null;
  createdAt?: Date;
}

/**
 * MISSÕES / TAREFAS
 */
export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type TaskStatus = 'available' | 'todo' | 'completed';

export interface Task {
  id?: number;
  title: string;
  description?: string;
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

  // subtarefas (existem em AddTaskModal)
  // deixo como any[] pra não quebrar nada legado
  subtasks?: any[];
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
 */
export interface InventoryItem {
  id?: number;
  key: string; // ex: 'avatar_frame_01'
  type: string; // ex: 'avatar-frame', 'background'
  owned: boolean;
  equipped?: boolean;
  acquiredAt?: Date;
}

/**
 * ITENS DE LOJA
 */
export interface ShopItem {
  id?: number;
  key: string;
  type: string;
  name: string;
  description?: string;
  price: number;
  createdAt?: Date;
}

/**
 * COMPANHEIROS / PETS (estrutura mínima)
 */
export interface Companion {
  id?: number;
  key: string;
  name: string;
  rarity: TaskRarity;
  unlocked?: boolean;
}

/**
 * COMPANHEIROS DESBLOQUEADOS (para conquistas / bestiário)
 */
export interface UnlockedCompanion {
  id?: number;
  companionId: number;
  unlockedAt?: Date;
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
  companions!: Table<Companion, number>;
  unlockedCompanions!: Table<UnlockedCompanion, number>;

  constructor() {
    super('LevelMeUpDB');

    // Versão 1 — schema original
    this.version(1).stores({
      profile: '++id',
      tasks:
        '++id, areaId, completed, status, archived, reviewEnabled, createdAt, completedAt',
      areas: '++id',
      xpLogs: '++id, date, areaId',
      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      companions: '++id, key, rarity, unlocked',
    });

    // Versão 2 — adiciona tabela unlockedCompanions
    this.version(2).stores({
      profile: '++id',
      tasks:
        '++id, areaId, completed, status, archived, reviewEnabled, createdAt, completedAt',
      areas: '++id',
      xpLogs: '++id, date, areaId',
      inventory: '++id, key, type, owned, equipped',
      shopItems: '++id, key, type, price',
      companions: '++id, key, rarity, unlocked',
      unlockedCompanions: '++id, companionId',
    });
  }
}

export const db = new LevelMeUpDB();
