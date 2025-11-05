// src/services/backupService.js
import { browser } from '$app/environment';
import { db } from './db';

/**
 * Exporta os dados do app (áreas e itens) para um arquivo JSON
 * e dispara o download no navegador.
 */
export async function exportarDados() {
  if (!browser) {
    // Em SSR / build estático não faz nada
    return;
  }

  // Busca tudo do IndexedDB
  const [areas, items] = await Promise.all([
    db.areas.toArray(),
    db.items.toArray(),
  ]);

  const backupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    areas,
    items,
  };

  const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  // import dinâmico para evitar problemas com CommonJS + SSR
  const mod = await import('file-saver');
  const saveAs = mod.saveAs || (mod.default && mod.default.saveAs);

  if (!saveAs) {
    console.error('Não foi possível carregar saveAs de file-saver');
    return;
  }

  saveAs(blob, 'lmup-backup.json');
}

/**
 * Importa um arquivo JSON de backup e substitui os dados atuais.
 * @param {File} file
 */
export async function importarDados(file) {
  if (!browser) {
    return;
  }

  const text = await file.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('Erro ao parsear backup:', e);
    throw new Error('Arquivo de backup inválido');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Arquivo de backup inválido');
  }

  const areas = Array.isArray(data.areas) ? data.areas : [];
  const items = Array.isArray(data.items) ? data.items : [];

  // Limpa e repovoa o banco
  await db.transaction('rw', db.areas, db.items, async () => {
    await Promise.all([db.areas.clear(), db.items.clear()]);

    if (areas.length) {
      await db.areas.bulkAdd(areas);
    }

    if (items.length) {
      await db.items.bulkAdd(items);
    }
  });
}
