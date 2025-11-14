// src/services/db.ts
import Dexie from 'dexie';
import type { Table } from 'dexie';

// ----------------- TIPOS BÁSICOS -----------------
export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type TaskStatus = 'available' | 'in_progress' | 'completed';

export interface Area {
  id?: number;
  nome: string;
  color?: string;
  createdAt: Date;
}

export interface Task {
  id?: number;
  areaId: number;
  title: string;
  rarity: TaskRarity;
  xp: number;
  completed: boolean;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
  subtasks?: string[];
  // preparado para linkar tarefas a projetos na Fase 3+
  projectId?: number | null;
}

export interface XpLog {
  id?: number;

  // Relacionamentos
  areaId?: number | null;
  taskId?: number | null;
  projectId?: number | null;
  amount: number;
  xp?: number;
  reason?: string;
  date: string;
  createdAt: string | Date;
}

export interface NeuroSettings {
  id?: number; // normalmente sempre 1
  reduceAnimations?: boolean;
  highContrast?: boolean;
  largeFont?: boolean;
  dyslexiaFriendly?: boolean;
  focusMode?: boolean;
}

export interface Companion {
  id?: number;
  name: string;
  type: string;
  imagePath: string;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  avatarUrl: string;
  totalXpEarned: number;
  currentStreak: number;
  // xpService às vezes zera isso pra null
  lastCompletionDate: string | null;
  activeCompanionId: number;
  gold: number;
  // alguns pontos do código fazem update com updatedAt
  updatedAt?: string | Date | null;
}

// Itens legados (ItemV1)
export interface ItemV1 {
  id?: number;
  areaId: number;
  titulo: string;
  xp?: number;
}

export interface OwnedShopItem {
  id?: number;
  itemId: number;
  equipped?: boolean;
}

// ----------------- PROJETOS DO HERÓI -----------------
export type ProjectStatus = 'planning' | 'in_progress' | 'done';
export type ProjectDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface HeroProject {
  id?: number;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'done';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  totalTasks: number;
  completedTasks: number;
  baseXp: number;
  createdAt: string;
  targetDate: string; // pode ser string vazia quando não tiver alvo
  updatedAt?: string; // ✅ novo campo opcional
}

// ----------------- DB DEXIE -----------------
export class LevelMeUpDB extends Dexie {
  profile!: Table<Profile, number>;
  areas!: Table<Area, number>;
  tasks!: Table<Task, number>;
  xpLogs!: Table<XpLog, number>;
  neuroSettings!: Table<NeuroSettings, number>;
  companions!: Table<Companion, number>;
  items!: Table<ItemV1, number>;
  ownedShopItems!: Table<OwnedShopItem, number>;
  projects!: Table<HeroProject, number>;

  constructor() {
    super('LevelMeUpDB');

    // 🔺 versão 3 para incluir tabela "projects"
    // (não mexemos nas chaves existentes, só adicionamos a nova tabela)
    this.version(3).stores({
      profile: 'id',
      areas: '++id, nome',
      tasks: '++id, areaId, status, completed, projectId',
      xpLogs: '++id, areaId, projectId, createdAt',
      neuroSettings: 'id',
      companions: '++id',
      items: '++id, areaId',
      ownedShopItems: '++id, itemId',
      projects: '++id, status, difficulty, targetDate',
    });
  }
}

export const db = new LevelMeUpDB();
