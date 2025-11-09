// src/services/db.ts
import Dexie, { type Table } from 'dexie';

// --- INTERFACES DO BANCO DE DADOS ---

export interface Profile {
  id?: number; // Sempre será 1
  name: string;
  title: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  avatarUrl?: string;
  totalXpEarned: number; // Da V3 (Santuário)
  currentStreak: number; // Da V4 (Streak)
  lastCompletionDate: string; // Da V4 (Streak)
  activeCompanionId: number; // Da V5 (Pets)
  gold?: number; // Da V6 (moeda da loja)
}

export interface Area {
  id?: number;
  nome: string;
  cor: string;
}

// Log de XP diário para estatísticas
export type XpLog = {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  amount: number; // XP ganho nesse dia
};

export interface Task {
  id?: number;
  areaId: number;
  title: string;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  completed: boolean;
  createdAt: Date;
}

// Schema antigo (V1)
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

// --- CLASSE DO BANCO DE DADOS ---

export class MySubClassedDexie extends Dexie {
  profile!: Table<Profile>;
  areas!: Table<Area>;
  tasks!: Table<Task>;
  items!: Table<ItemV1>; // Tabela antiga da v1
  companions!: Table<Companion>;
  unlockedCompanions!: Table<UnlockedCompanion>;
  xpLogs!: Table<XpLog>;

  constructor() {
    super('levelMeUpDb');

    // Versão 1: Schema antigo
    this.version(1).stores({
      areas: '++id, nome',
      items: '++id, areaId, titulo',
    });

    // Versão 2: Novo Schema (profile, tasks)
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
                xp: item.xp || 50,
                rarity: 'common',
                completed: false,
                createdAt: new Date(),
              });
            });
        }
      });

    // Versão 3: adiciona totalXpEarned em profile
    this.version(3)
      .stores({
        profile: '++id, totalXpEarned',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
      })
      .upgrade(() => {});

    // Versão 4: campos de streak em profile
    this.version(4)
      .stores({
        profile: '++id, totalXpEarned, currentStreak, lastCompletionDate',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
      })
      .upgrade(() => {});

    // Versão 5: Companheiros (pets)
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
      .upgrade(() => {
        // Nada especial por enquanto
      });

    // Versão 6: Gold + tabela de logs de XP
    this.version(6)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId, gold',
        areas: '++id, nome',
        tasks: '++id, areaId, completed, createdAt',
        items: '++id, areaId, titulo',
        companions: '++id, name',
        unlockedCompanions: '++id, companionId',
        xpLogs: '++id, date', // índice por data pra facilitar agregações
      })
      .upgrade(async (tx) => {
        // Garante que todo profile tenha gold inicializado
        await tx
          .table('profile')
          .toCollection()
          .modify((p: any) => {
            if (typeof p.gold !== 'number') {
              p.gold = 0;
            }
          });
        // xpLogs começa vazio mesmo, será preenchido quando você logar XP
      });
  }
}

export const db = new MySubClassedDexie();
