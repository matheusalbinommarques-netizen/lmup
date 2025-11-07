// src/services/backupService.js
import { browser } from '$app/environment';
import { db } from './db';

/**
 * Exporta os dados do app (profile, areas, tasks) para um arquivo JSON
 */
export async function exportData() {
  if (!browser) return;

  try {
    const [profile, areas, tasks] = await Promise.all([
      db.profile.toArray(),
      db.areas.toArray(),
      db.tasks.toArray(), // Corrigido de 'items' para 'tasks'
    ]);

    const backupPayload = {
      version: 2, // Corresponde à versão do db.ts
      exportedAt: new Date().toISOString(),
      profile,
      areas,
      tasks,
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });

    const mod = await import('file-saver');
    const saveAs = mod.saveAs || (mod.default && mod.default.saveAs);

    if (saveAs) {
      saveAs(blob, 'lmup-backup-v2.json');
    } else {
      console.error('Não foi possível carregar saveAs de file-saver');
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw error;
  }
}

/**
 * Importa um arquivo JSON de backup e substitui os dados atuais.
 * @param {File} file
 */
export async function importData(file) {
  if (!browser) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || typeof data !== 'object') {
      throw new Error('Arquivo de backup inválido');
    }

    const profile = Array.isArray(data.profile) ? data.profile : [];
    const areas = Array.isArray(data.areas) ? data.areas : [];
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];

    await db.transaction('rw', db.profile, db.areas, db.tasks, async () => {
      await Promise.all([
        db.profile.clear(),
        db.areas.clear(),
        db.tasks.clear(),
      ]);

      if (profile.length) await db.profile.bulkAdd(profile);
      if (areas.length) await db.areas.bulkAdd(areas);
      if (tasks.length) await db.tasks.bulkAdd(tasks);
    });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    throw new Error('Arquivo de backup inválido ou corrompido');
  }
}

/**
 * Apaga TODOS os dados do banco local.
 */
export async function clearAllData() {
  if (!browser) return;

  try {
    await db.transaction('rw', db.profile, db.areas, db.tasks, async () => {
      await Promise.all([
        db.profile.clear(),
        db.areas.clear(),
        db.tasks.clear(),
      ]);
    });
    console.log('Todos os dados foram apagados.');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
}
