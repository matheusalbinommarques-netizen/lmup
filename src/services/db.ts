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
  avatarUrl?: string;
  totalXpEarned: number;
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

// <-- 1. ADICIONAR INTERFACE PARA O SCHEMA ANTIGO (V1)
interface ItemV1 {
  id: number;
  areaId: number;
  titulo: string;
  xp?: number; // O XP era opcional na lógica de migração
}

export class MySubClassedDexie extends Dexie {
  profile!: Table<Profile>;
  areas!: Table<Area>;
  tasks!: Table<Task>;
  // Define a tabela antiga 'items' para ser usada na migração
  items!: Table<ItemV1>;

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
            // <-- 2. APLICAR O TIPO 'ItemV1' AO PARÂMETRO 'item'
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
      .upgrade(() => {
        // Bloco de upgrade Vazio, mas necessário.
      });
  }
}

export const db = new MySubClassedDexie();
