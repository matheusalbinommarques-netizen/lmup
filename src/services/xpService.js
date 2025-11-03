import { db } from './db.js';
import { liveQuery } from 'dexie';

// --- Constantes de Gamificação ---
const BASE_XP_POR_NIVEL = 100;

// --- FUNÇÕES DE XP (sem alteração) ---

export function getTotalXpObservable() {
  return liveQuery(async () => {
    const xpItem = await db['meta'].get('totalXp');
    return xpItem ? xpItem.value : 0;
  });
}

export async function addXp(amount) {
  try {
    // Adicionamos 'db.meta' à transação, embora já estivesse implícito
    await db.transaction('rw', db['meta'], async () => {
      const currentXpItem = await db['meta'].get('totalXp');
      const currentXp = currentXpItem ? currentXpItem.value : 0;

      const newXp = currentXp + amount;

      await db['meta'].put({
        key: 'totalXp',
        value: newXp,
      });
    });
  } catch (e) {
    console.error('Falha ao adicionar XP:', e);
  }
}

export function calcularNivel(totalXp) {
  let nivel = 1;
  let xpNecessarioParaNivelAtual = 0;
  let xpParaProximoNivel = BASE_XP_POR_NIVEL;

  while (totalXp >= xpParaProximoNivel) {
    nivel++;
    xpNecessarioParaNivelAtual = xpParaProximoNivel;
    xpParaProximoNivel += nivel * BASE_XP_POR_NIVEL;
  }

  const xpDesdeUltimoNivel = totalXp - xpNecessarioParaNivelAtual;
  const xpTotalParaEsteNivel = xpParaProximoNivel - xpNecessarioParaNivelAtual;

  // O progresso pode dar NaN se xpTotalParaEsteNivel for 0 (no nível 1)
  const progresso =
    xpTotalParaEsteNivel > 0
      ? (xpDesdeUltimoNivel / xpTotalParaEsteNivel) * 100
      : 0;

  return {
    nivel,
    xpParaProximoNivel: xpTotalParaEsteNivel,
    xpAtualNesteNivel: xpDesdeUltimoNivel,
    progresso: Math.floor(progresso),
  };
}

//
// --- LÓGICA DE STREAK (NOVO) ---
//

/**
 * Retorna um Observable que emite a streak atual.
 */
export function getStreakObservable() {
  return liveQuery(async () => {
    const streakItem = await db['meta'].get('streakData');
    // Se não houver dados, a streak é 0
    if (!streakItem) return { count: 0, lastUpdate: null };

    // Checa se a streak foi perdida (mais de 1 dia de diferença)
    if (!isYesterdayOrToday(new Date(streakItem.lastUpdate))) {
      return { count: 0, lastUpdate: streakItem.lastUpdate };
    }

    // Se não, retorna a streak atual
    return streakItem;
  });
}

/**
 * Atualiza a streak do usuário.
 * Chamado toda vez que um item é completado.
 */
export async function updateStreak() {
  try {
    await db.transaction('rw', db['meta'], async () => {
      const today = new Date();
      const streakItem = await db['meta'].get('streakData');

      if (!streakItem) {
        // Primeira vez completando um item
        await db['meta'].put({
          key: 'streakData',
          count: 1,
          lastUpdate: today.toISOString(),
        });
      } else {
        const lastUpdate = new Date(streakItem.lastUpdate);

        if (isToday(lastUpdate)) {
          // Já completou um item hoje. Não faz nada.
          return;
        }

        if (isYesterday(lastUpdate)) {
          // Continua a streak
          await db['meta'].put({
            key: 'streakData',
            count: streakItem.count + 1,
            lastUpdate: today.toISOString(),
          });
        } else {
          // Perdeu a streak (completou há 2+ dias)
          await db['meta'].put({
            key: 'streakData',
            count: 1, // Reseta para 1
            lastUpdate: today.toISOString(),
          });
        }
      }
    });
  } catch (e) {
    console.error('Falha ao atualizar streak:', e);
  }
}

// --- Funções Utilitárias de Data ---

function isToday(someDate) {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
}

function isYesterday(someDate) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    someDate.getDate() === yesterday.getDate() &&
    someDate.getMonth() === yesterday.getMonth() &&
    someDate.getFullYear() === yesterday.getFullYear()
  );
}

function isYesterdayOrToday(someDate) {
  return isToday(someDate) || isYesterday(someDate);
}
