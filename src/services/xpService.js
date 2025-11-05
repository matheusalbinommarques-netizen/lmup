import { browser } from '$app/environment';
import { db } from './db.js';
import { liveQuery } from 'dexie';

import { BehaviorSubject } from 'rxjs';

const XP_POR_NIVEL_BASE = 100;
const FATOR_CRESCIMENTO = 1.5;

const totalXpSubject = new BehaviorSubject(0);
const streakSubject = new BehaviorSubject({ count: 0, lastCheckin: null });

if (browser) {
  const initDB = async () => {
    try {
      await db.meta.bulkPut([
        { key: 'totalXp', value: (await db.meta.get('totalXp'))?.value || 0 },
        {
          key: 'streak',
          value: (await db.meta.get('streak'))?.value || {
            count: 0,
            lastCheckin: null,
          },
        },
      ]);
    } catch (error) {
      console.error('Falha ao inicializar a store meta:', error);
    }
  };

  liveQuery(() => db.meta.get('totalXp')).subscribe((meta) => {
    totalXpSubject.next(meta?.value || 0);
  });

  liveQuery(() => db.meta.get('streak')).subscribe((meta) => {
    streakSubject.next(meta?.value || { count: 0, lastCheckin: null });
  });

  initDB().catch(console.error);
}

export function getTotalXpObservable() {
  return totalXpSubject.asObservable();
}

export function getStreakObservable() {
  return streakSubject.asObservable();
}

export async function addXp(amount) {
  if (!browser) return;
  try {
    await db.meta.put({ key: 'totalXp', value: totalXpSubject.value + amount });
    await checkStreak(true);
  } catch (error) {
    console.error('Falha ao adicionar XP:', error);
  }
}

export async function checkStreak(forceCheckin = false) {
  if (!browser) return;

  const hoje = new Date().toDateString();
  const { count, lastCheckin } = streakSubject.value;

  if (lastCheckin === hoje && !forceCheckin) {
    return;
  }

  const ontem = new Date(Date.now() - 86400000).toDateString();
  let newStreak = { count: 1, lastCheckin: hoje };

  if (lastCheckin === hoje && forceCheckin) {
    newStreak = { count, lastCheckin };
  } else if (lastCheckin === ontem) {
    newStreak = { count: count + 1, lastCheckin: hoje };
  }

  try {
    await db.meta.put({ key: 'streak', value: newStreak });
  } catch (error) {
    console.error('Falha ao atualizar o streak:', error);
  }
}

export function calcularNivel(xp) {
  let nivel = 0;
  let xpParaProximoNivel = XP_POR_NIVEL_BASE;
  let xpAcumulado = 0;

  while (xp >= xpAcumulado + xpParaProximoNivel) {
    xpAcumulado += xpParaProximoNivel;
    nivel++;
    xpParaProximoNivel = Math.floor(xpParaProximoNivel * FATOR_CRESCIMENTO);
  }

  const xpAtualNesteNivel = xp - xpAcumulado;
  const progresso = (xpAtualNesteNivel / xpParaProximoNivel) * 100;

  return {
    nivel,
    progresso,
    xpAtualNesteNivel,
    xpParaProximoNivel,
  };
}