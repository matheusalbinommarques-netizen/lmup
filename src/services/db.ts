// src/services/db.ts
import Dexie, { type Table } from 'dexie';

// Interface para a nova tabela 'profile' (Taverna)
export interface Profile {
  id?: number; // Sempre será 1
  name: string;
  title: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  avatarUrl?: string; // Novo campo para o avatar
}

// Interface 'areas'
export interface Area {
  id?: number;
  nome: string;
  cor: string;
}

// Interface 'tasks' (Missões)
export interface Task {
  id?: number;
  areaId: number;
  title: string;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  completed: boolean;
  createdAt: Date;
}

export class MySubClassedDexie extends Dexie {
  profile!: Table<Profile>;
  areas!: Table<Area>;
  tasks!: Table<Task>;

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
        // Função de migração
        const itemsCount = await tx.table('items').count();
        if (itemsCount > 0) {
          await tx
            .table('items')
            .toCollection()
            .modify(async (item) => {
              await tx.table('tasks').add({
                id: item.id,
                areaId: item.areaId,
                title: item.titulo,
                xp: item.xp || 50, // Adiciona XP default
                rarity: 'common',
                completed: false,
                createdAt: new Date(),
              });
            });
        }
      });
  }
}

export const db = new MySubClassedDexie();
