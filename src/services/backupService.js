// src/services/backupService.js
import { db } from './db';
import { saveAs } from 'file-saver';

/**
 * Exporta as áreas e itens em um JSON.
 */
export async function exportBackup() {
  const [areas, items] = await Promise.all([
    db.areas.toArray(),
    db.items.toArray(),
  ]);

  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    areas,
    items,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  saveAs(blob, 'lmup-backup.json');
}

/**
 * Importa um JSON de backup e sobrescreve o banco atual.
 * @param {File} file
 */
export async function importBackup(file) {
  const text = await file.text();
  /** @type {{ version?: number; areas?: any[]; items?: any[] }} */
  const data = JSON.parse(text);

  if (!Array.isArray(data.areas) || !Array.isArray(data.items)) {
    throw new Error('Arquivo de backup inválido');
  }

  await db.transaction('rw', db.areas, db.items, async () => {
    await db.areas.clear();
    await db.items.clear();
    await db.areas.bulkAdd(data.areas);
    await db.items.bulkAdd(data.items);
  });
}
