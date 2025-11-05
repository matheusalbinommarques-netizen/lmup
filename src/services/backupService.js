import { db } from './db.js';
import { browser } from '$app/environment';

export async function exportarDados() {
  if (!browser) return;

  const [areas, itens, meta] = await Promise.all([
    db.areas?.toArray?.() ?? [],
    db.itens?.toArray?.() ?? [],
    db.meta?.toArray?.() ?? [],
  ]);

  const payload = { areas, itens, meta };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });

  const { default: fileSaver } = await import('file-saver');
  const { saveAs } = fileSaver;

  const hoje = new Date().toISOString().slice(0, 10);
  saveAs(blob, `lmup-backup-${hoje}.json`);
}

export async function importarDados() {
  if (!browser) return;

  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text ?? '{}');

        await db.transaction('rw', db.areas, db.itens, db.meta, async () => {
          if (Array.isArray(data.areas)) {
            await db.areas.clear();
            await db.areas.bulkAdd(data.areas);
          }

          if (Array.isArray(data.itens)) {
            await db.itens.clear();
            await db.itens.bulkAdd(data.itens);
          }

          if (Array.isArray(data.meta)) {
            await db.meta.clear();
            await db.meta.bulkAdd(data.meta);
          }
        });

        resolve();
      } catch (err) {
        console.error('Erro ao importar dados', err);
        reject(err);
      }
    };

    input.click();
  });
}
