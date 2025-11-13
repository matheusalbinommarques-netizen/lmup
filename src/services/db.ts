// src/services/db.ts
import Dexie, { type Table } from 'dexie';

// --- INTERFACES / TIPOS ---

export type TaskRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type TaskStatus = 'available' | 'todo' | 'completed';

export interface Profile {
  id?: number; // sempre 1
  name: string;
  title: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  avatarUrl?: string;
  totalXpEarned: number; // v3
  currentStreak: number; // v4
  lastCompletionDate: string; // v4 (YYYY-MM-DD)
  activeCompanionId: number; // v5
  gold?: number; // v6
}

export interface Area {
  id?: number;
  nome: string;
  cor: string;
}

// Log de XP diário para estatísticas e gráficos
export interface XpLog {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  amount: number; // XP ganho (pode ser negativo no remove)
}

export interface Task {
  id?: number;
  areaId: number;
  title: string;
  xp: number;
  rarity: TaskRarity;
  completed: boolean;
  createdAt: Date;

  // --- Campos usados nas telas / lógicas atuais ---
  status?: TaskStatus; // 'available' | 'todo' | 'completed'
  updatedAt?: Date | null; // para métricas semanais
  completedAt?: Date | null; // para métricas semanais

  // Revisão espaçada (config no painel)
  reviewEnabled?: boolean; // ativada?
  reviewIntervalDays?: number | null; // 1,3,7,14,30...
  reviewStartedAt?: Date | null; // referência de início
}

// Schema antigo (V1) — apenas para migração
interface ItemV1 {
  id: number;
  areaId: number;
  titulo: string;
  xp?: number;
}

// Companheiros (pets)
export interface Companion {
  id?: number;
  name: string;
  type: string;
  imagePath: string;
}

export interface UnlockedCompanion {
  id?: number;
  companionId: number;
}

// --- Loja / Inventário (compras persistidas) ---
export type ShopCategoryDB =
  | 'highlight'
  | 'theme'
  | 'utility'
  | 'effect'
  | 'profile';

export interface OwnedShopItem {
  id?: number; // chave da tabela
  itemId: number; // id estático do item da loja
  name: string;
  description?: string;
  price: number;
  rarity: TaskRarity; // reaproveitando o union
  category: ShopCategoryDB;
  equipped?: boolean; // true = item ativo para a categoria
  acquiredAt: string; // ISO datetime
}

// --- BANCO DE DADOS ---

export class MySubClassedDexie extends Dexie {
  profile!: Table<Profile>;
  areas!: Table<Area>;
  tasks!: Table<Task>;
  items!: Table<ItemV1>; // legado v1
  companions!: Table<Companion>;
  unlockedCompanions!: Table<UnlockedCompanion>;
  xpLogs!: Table<XpLog>;
  ownedShopItems!: Table<OwnedShopItem>;

  constructor() {
    super('levelMeUpDb');

    // v1 — schema antigo
    this.version(1).stores({
      areas: '++id, nome',
      items: '++id, areaId, titulo',
    });

    // v2 — adiciona profile/tasks
    this.version(2)
      .stores({
        profile: '++id',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
      })
      .upgrade(async (tx) => {
        const itemsCount = await tx.table('items').count();
        if (itemsCount > 0) {
          await tx
            .table('items')
            .toCollection()
            .modify(async (item: ItemV1) => {
              await tx.table('tasks').add({
                id: item.id,
                areaId: item.areaId,
                title: item.titulo,
                xp: item.xp ?? 50,
                rarity: 'common',
                completed: false,
                createdAt: new Date(),
              } as Task);
            });
        }
      });

    // v3 — totalXpEarned
    this.version(3)
      .stores({
        profile: '++id, totalXpEarned',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
      })
      .upgrade(() => {});

    // v4 — streak
    this.version(4)
      .stores({
        profile: '++id, totalXpEarned, currentStreak, lastCompletionDate',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
      })
      .upgrade(() => {});

    // v5 — companions
    this.version(5)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
        companions: '++id, name',
        unlockedCompanions: '++id, companionId',
      })
      .upgrade(() => {});

    // v6 — gold + xpLogs
    this.version(6)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId, gold',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
        companions: '++id, name',
        unlockedCompanions: '++id, companionId',
        xpLogs: '++id, date',
      })
      .upgrade(async (tx) => {
        // garante gold
        await tx
          .table('profile')
          .toCollection()
          .modify((p: any) => {
            if (typeof p.gold !== 'number') p.gold = 0;
          });
      });

    // v7 — campos modernos de Task (status/review/tempos) + novos índices
    this.version(7)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId, gold',
        areas: '++id, nome',
        tasks:
          '++id, areaId, completed, status, createdAt, updatedAt, completedAt, reviewEnabled',
        items: '++id, areaId, titulo',
        companions: '++id, name, type',
        unlockedCompanions: '++id, companionId',
        xpLogs: '++id, date',
      })
      .upgrade(async (tx) => {
        await tx
          .table('tasks')
          .toCollection()
          .modify((t: any) => {
            if (!t.status) {
              t.status = t.completed ? 'completed' : 'available';
            }
            if (t.completed && !t.completedAt) {
              t.completedAt = t.updatedAt ?? t.createdAt ?? new Date();
            }
            if (t.reviewEnabled === undefined) t.reviewEnabled = false;
            if (t.reviewIntervalDays === undefined) t.reviewIntervalDays = null;
            if (t.reviewStartedAt === undefined) t.reviewStartedAt = null;
          });
      });

    // v8 — ownedShopItems (compras persistidas) + índice por categoria/equipped
    this.version(8)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId, gold',
        areas: '++id, nome',
        tasks:
          '++id, areaId, completed, status, createdAt, updatedAt, completedAt, reviewEnabled',
        items: '++id, areaId, titulo',
        companions: '++id, name, type',
        unlockedCompanions: '++id, companionId',
        xpLogs: '++id, date',
        ownedShopItems: '++id, itemId, category, equipped', // NOVA
      })
      .upgrade(() => {});

    // liga as tabelas nas propriedades (TS/IDE)
    this.profile = this.table('profile');
    this.areas = this.table('areas');
    this.tasks = this.table('tasks');
    this.items = this.table('items');
    this.companions = this.table('companions');
    this.unlockedCompanions = this.table('unlockedCompanions');
    this.xpLogs = this.table('xpLogs');
    this.ownedShopItems = this.table('ownedShopItems');
  }
}

export const db = new MySubClassedDexie();
