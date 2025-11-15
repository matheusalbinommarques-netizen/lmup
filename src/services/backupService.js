// src/services/backupService.js
import { browser } from '$app/environment';
import { db } from './db';

/** -------------------------
 * Helpers
 * ------------------------*/
function pad(n) {
  return String(n).padStart(2, '0');
}

function timestampForFilename(d = new Date()) {
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}${M}${D}-${h}${m}${s}`;
}

function downloadBlob(blob, filename) {
  if (!browser) return; // SSR guard
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function isPlainObject(val) {
  return (
    !!val &&
    typeof val === 'object' &&
    Object.getPrototypeOf(val) === Object.prototype
  );
}

/**
 * Revive datas serializadas em strings:
 *  - Converte chaves terminadas em "At" (createdAt, updatedAt, completedAt, reviewStartedAt, etc.) para Date.
 *  - Mantém XpLog.date como string 'YYYY-MM-DD'.
 */
function reviveDatesDeep(data) {
  function revive(obj) {
    if (Array.isArray(obj)) return obj.map(revive);
    if (!isPlainObject(obj)) return obj;

    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) {
        out[k] = v;
        continue;
      }

      // manter XpLog.date como string
      if (k === 'date' && typeof v === 'string') {
        out[k] = v;
        continue;
      }

      // converter *At -> Date quando vier string ISO/date-only
      if (k.endsWith('At') && typeof v === 'string') {
        const isoLike =
          /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?$/.test(v);
        const d = new Date(v);
        if (isoLike && !Number.isNaN(d.getTime())) {
          out[k] = d;
          continue;
        }
      }

      out[k] = revive(v);
    }
    return out;
  }

  return revive(data);
}

/** -------------------------
 * EXPORT
 * ------------------------*/
/**
 * Exporta TODO o banco (profile, areas, tasks, companions, xpLogs,
 * inventory, shopItems, ownedShopItems, projects) para um .json.
 */
export async function exportData() {
  if (!browser) return;

  try {
    const [
      profile,
      areas,
      tasks,
      companions,
      xpLogs,
      inventory,
      shopItems,
      ownedShopItems,
      projects,
    ] = await Promise.all([
      db.profile.get(1),
      db.areas.toArray(),
      db.tasks.toArray(),
      db.companions.toArray(),
      db.xpLogs.toArray(),
      db.inventory.toArray(),
      db.shopItems.toArray(),
      db.ownedShopItems.toArray(),
      db.projects.toArray(),
    ]);

    const snapshot = {
      meta: {
        app: 'Level Me Up!',
        formatVersion: 2, // novo formato com inventário/loja/projetos
        exportedAt: new Date().toISOString(),
      },
      data: {
        profile: profile ?? null,
        areas,
        tasks,
        companions,
        xpLogs,
        inventory,
        shopItems,
        ownedShopItems,
        projects,
      },
    };

    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const name = `lmup-backup-${timestampForFilename()}.json`;
    downloadBlob(blob, name);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw error;
  }
}

/** -------------------------
 * IMPORT
 * ------------------------*/
/**
 * Importa um backup gerado pelo exportData (substituição completa).
 * Aceita tanto backups antigos (sem inventory/loja/projetos)
 * quanto o formato novo.
 * @param {File} file
 */
export async function importData(file) {
  if (!browser) return;
  if (!file || typeof file.text !== 'function') {
    throw new Error(
      'Arquivo inválido — selecione um .json exportado pelo app.',
    );
  }

  try {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('JSON inválido.');
    }

    if (!parsed || !parsed.data || !isPlainObject(parsed.data)) {
      throw new Error('Estrutura de backup não reconhecida.');
    }

    // Reconstituir datas em profundidade
    const revived = reviveDatesDeep(parsed);

    const {
      profile,
      areas,
      tasks,
      companions,
      xpLogs,
      inventory,
      shopItems,
      ownedShopItems,
      projects,
    } = revived.data;

    const areasArr = Array.isArray(areas) ? areas : [];
    const tasksArr = Array.isArray(tasks) ? tasks : [];
    const compArr = Array.isArray(companions) ? companions : [];
    const xpLogsArr = Array.isArray(xpLogs) ? xpLogs : [];

    const invArr = Array.isArray(inventory) ? inventory : [];
    const shopArr = Array.isArray(shopItems) ? shopItems : [];
    const ownedArr = Array.isArray(ownedShopItems) ? ownedShopItems : [];
    const projArr = Array.isArray(projects) ? projects : [];

    await db.transaction(
      'rw',
      [
        db.profile,
        db.areas,
        db.tasks,
        db.companions,
        db.xpLogs,
        db.inventory,
        db.shopItems,
        db.ownedShopItems,
        db.projects,
      ],
      async () => {
        // Limpa tudo relevante
        await Promise.all([
          db.xpLogs.clear(),
          db.companions.clear(),
          db.tasks.clear(),
          db.areas.clear(),
          db.inventory.clear(),
          db.shopItems.clear(),
          db.ownedShopItems.clear(),
          db.projects.clear(),
          db.profile.clear(),
        ]);

        // Reinsere em ordem
        if (areasArr.length) await db.areas.bulkPut(areasArr);
        if (tasksArr.length) await db.tasks.bulkPut(tasksArr);
        if (compArr.length) await db.companions.bulkPut(compArr);
        if (xpLogsArr.length) await db.xpLogs.bulkPut(xpLogsArr);

        if (invArr.length) await db.inventory.bulkPut(invArr);
        if (shopArr.length) await db.shopItems.bulkPut(shopArr);
        if (ownedArr.length) await db.ownedShopItems.bulkPut(ownedArr);
        if (projArr.length) await db.projects.bulkPut(projArr);

        // Profile: se veio no backup usa, senão default
        const prof = profile ?? {
          id: 1,
          name: 'Seu herói',
          title: 'Nobre Aventureiro Nv. 1',
          level: 1,
          xpCurrent: 0,
          xpNext: 100,
          avatarUrl: '',
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: '',
          activeCompanionId: 1,
          gold: 0,
        };

        // garante id=1
        prof.id = 1;

        await db.profile.put(prof);
      },
    );
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    throw new Error('Arquivo de backup inválido ou corrompido');
  }
}

/** -------------------------
 * RESET OPCIONAL
 * ------------------------*/
/**
 * Reseta o progresso do usuário preservando identidade visual (nome, avatar, pet).
 * Limpa áreas/tarefas e zera XP/nível/streak/totalXp/gold.
 */
export async function clearAllData() {
  if (!browser) return;

  try {
    await db.transaction('rw', [db.profile, db.areas, db.tasks], async () => {
      const existingProfile = await db.profile.get(1);

      await Promise.all([db.areas.clear(), db.tasks.clear()]);

      const baseProfile = {
        id: 1,
        name: existingProfile?.name ?? 'Seu herói',
        title: 'Nobre Aventureiro Nv. 1',
        level: 1,
        xpCurrent: 0,
        xpNext: 100,
        avatarUrl: existingProfile?.avatarUrl ?? '',
        totalXpEarned: 0,
        currentStreak: 0,
        lastCompletionDate: '',
        activeCompanionId: existingProfile?.activeCompanionId ?? 1,
        gold: 0,
      };

      await db.profile.put(baseProfile);
    });

    console.log('Progresso resetado. Perfil preservado.');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
}
