// src/services/xpService.ts
import { db, type Profile } from './db';

/**
 * Curva de XP unificada (linear):
 * L1 -> 100, L2 -> 150, L3 -> 200, ...
 */
export const XP_BASE = 100;
export const XP_STEP = 50;

export function getXpForNextLevel(level: number): number {
  const L = Math.max(1, Math.floor(level || 1));
  return XP_BASE + (L - 1) * XP_STEP;
}

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function ensureProfile(): Promise<Profile> {
  let p = await db.profile.get(1);
  if (!p) {
    p = {
      id: 1,
      name: 'Seu herói',
      title: 'Nobre aventureiro',
      level: 1,
      xpCurrent: 0,
      xpNext: getXpForNextLevel(1),
      avatarUrl: '',
      totalXpEarned: 0,
      currentStreak: 0,
      lastCompletionDate: '',
      activeCompanionId: 1,
      gold: 0,
    };
    await db.profile.put(p);
  } else if (!p.xpNext || p.xpNext <= 0) {
    // Normaliza xpNext para a curva atual
    p.xpNext = getXpForNextLevel(p.level || 1);
    await db.profile.put(p);
  }
  return p;
}

async function writeLog(amount: number) {
  // XpLog tem apenas { date, amount } no schema atual
  await db.xpLogs.add({
    date: todayKey(),
    amount,
  });
}

async function _applyLeveling(
  profile: Profile,
  deltaXp: number,
): Promise<Profile> {
  // Garante campos básicos
  let level = Math.max(1, profile.level || 1);
  let xpCurrent = Math.max(0, profile.xpCurrent || 0);
  let xpNext = getXpForNextLevel(level);

  if (deltaXp >= 0) {
    // Ganho de XP (pode dar vários level ups)
    xpCurrent += deltaXp;
    while (xpCurrent >= xpNext) {
      xpCurrent -= xpNext;
      level += 1;
      xpNext = getXpForNextLevel(level);
    }
    profile.totalXpEarned = (profile.totalXpEarned || 0) + deltaXp;
    profile.gold = Math.max(0, (profile.gold || 0) + Math.floor(deltaXp * 0.5));
  } else {
    // Perda de XP (pode baixar nível, até L1)
    let remaining = -deltaXp;
    while (remaining > 0) {
      if (xpCurrent >= remaining) {
        xpCurrent -= remaining;
        remaining = 0;
      } else {
        remaining -= xpCurrent;
        if (level > 1) {
          level -= 1;
          const prevNext = getXpForNextLevel(level);
          xpCurrent = prevNext; // “empresta” do nível anterior
          xpCurrent -= Math.min(xpCurrent, remaining);
          remaining = Math.max(0, remaining - (prevNext - xpCurrent));
        } else {
          // Nível 1 não pode ficar negativo
          xpCurrent = 0;
          remaining = 0;
        }
      }
    }
    profile.totalXpEarned = Math.max(
      0,
      (profile.totalXpEarned || 0) + deltaXp, // deltaXp é negativo
    );
    profile.gold = Math.max(0, (profile.gold || 0) + Math.floor(deltaXp * 0.5));
  }

  profile.level = level;
  profile.xpCurrent = xpCurrent;
  profile.xpNext = xpNext;

  return profile;
}

export const xpService = {
  getXpForNextLevel,

  /**
   * Concede XP e registra log (fonte oficial).
   */
  async addXp(amount: number): Promise<void> {
    if (!amount || amount <= 0) return;
    await db.transaction('rw', db.profile, db.xpLogs, async () => {
      const p = await ensureProfile();
      const updated = await _applyLeveling({ ...p }, amount);
      await db.profile.put(updated);
      await writeLog(amount);
    });
  },

  /**
   * Remove XP (idempotente, sem deixar negativo) e registra log negativo.
   */
  async removeXp(amount: number): Promise<void> {
    if (!amount || amount <= 0) return;
    await db.transaction('rw', db.profile, db.xpLogs, async () => {
      const p = await ensureProfile();
      const updated = await _applyLeveling({ ...p }, -amount);
      await db.profile.put(updated);
      await writeLog(-amount);
    });
  },
};
