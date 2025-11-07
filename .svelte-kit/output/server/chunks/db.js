import Dexie from 'dexie';
class LMUPDB extends Dexie {
  areas;
  items;
  constructor() {
    super('lmup');
    this.version(1).stores({
      areas: '++id, nome',
      items: '++id, areaId, nome, xp, done',
    });
  }
}
new LMUPDB();
