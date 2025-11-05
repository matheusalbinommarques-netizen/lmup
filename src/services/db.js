import Dexie from 'dexie';
import { browser } from '$app/environment';

export let db = null;

if (browser) {
  db = new Dexie('levelMeUpDB');

  db.version(1).stores({
    areas: '++id, nome',
    itens: '++id, areaId, nome, tipo',
  });

  db.version(2).stores({
    areas: '++id, nome',
    itens: '++id, areaId, nome, tipo',
    meta: 'key',
  });

  db.open().catch((err) => {
    console.error(`Falha ao abrir o DB: ${err.stack || err}`);
  });
}