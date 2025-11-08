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
}

export interface Area {
  id?: number;
  nome: string;
  cor: string;
}

export interface Task {
  id?: number;
  areaId: number;
  title: string;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  completed: boolean;
  createdAt: Date;
}

// Interface para o Schema Antigo (V1)
interface ItemV1 {
  id: number;
  areaId: number;
  titulo: string;
  xp?: number;
}

// CORREÇÃO: Exportar 'Companion'
export interface Companion {
  id?: number;
  name: string;
  type: string;
  imagePath: string;
}

// CORREÇÃO: Exportar 'UnlockedCompanion'
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
  companions!: Table<Companion>; // <-- CORREÇÃO: Tabela adicionada
  unlockedCompanions!: Table<UnlockedCompanion>; // <-- CORREÇÃO: Tabela adicionada

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

    // Versão 3: Adicionando totalXpEarned
    this.version(3)
      .stores({
        profile: '++id, totalXpEarned',
      })
      .upgrade(() => {});

    // Versão 4: Adicionando campos de Streak
    this.version(4)
      .stores({
        profile: '++id, totalXpEarned, currentStreak, lastCompletionDate',
      })
      .upgrade(() => {});

    // Versão 5: Adicionando Companheiros (Pets)
    this.version(5)
      .stores({
        profile:
          '++id, totalXpEarned, currentStreak, lastCompletionDate, activeCompanionId', // Atualiza profile
        companions: '++id, name', // Nova tabela
        unlockedCompanions: '++id, companionId', // Nova tabela
      })
      .upgrade(() => {
        // Bloco de upgrade Vazio.
      });
  }
}

export const db = new MySubClassedDexie();
