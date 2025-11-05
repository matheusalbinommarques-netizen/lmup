import Dexie, { type Table } from 'dexie';

export interface Area {
  id?: number;
  nome: string;
}

export interface Item {
  id?: number;
  areaId: number;
  nome: string;
  xp: number;
  done?: boolean;
}

class LMUPDB extends Dexie {
  areas!: Table<Area, number>;
  items!: Table<Item, number>;

  constructor() {
    super('lmup');
    this.version(1).stores({
      areas: '++id, nome',
      items: '++id, areaId, nome, xp, done',
    });
  }
}

export const db = new LMUPDB();
export type { Table };
