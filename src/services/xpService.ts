// src/services/xpService.ts
import { BehaviorSubject, type Observable } from 'rxjs';

type StreakSnapshot = {
  count: number;
  lastCheckin: string | null;
};

const STORAGE_KEYS = {
  totalXp: 'lmup:totalXp',
  streak: 'lmup:streak',
  lastCheckin: 'lmup:lastCheckin',
} as const;

// Observables internos
const totalXp$ = new BehaviorSubject<number>(0);
const streak$ = new BehaviorSubject<StreakSnapshot>({
  count: 0,
  lastCheckin: null,
});

// ----------------------
// Helpers de localStorage
// ----------------------

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // se der erro (quota, privacidade etc.), só ignoramos
  }
}

// ----------------------
// Inicialização
// ----------------------

function initFromStorage(): void {
  const storedXp = Number(safeGetItem(STORAGE_KEYS.totalXp) ?? '0');
  const storedStreak = Number(safeGetItem(STORAGE_KEYS.streak) ?? '0');
  const storedLastCheckin = safeGetItem(STORAGE_KEYS.lastCheckin);

  totalXp$.next(Number.isFinite(storedXp) ? storedXp : 0);
  streak$.next({
    count: Number.isFinite(storedStreak) ? storedStreak : 0,
    lastCheckin: storedLastCheckin,
  });
}

if (typeof window !== 'undefined') {
  initFromStorage();
}

// ----------------------
// API pública
// ----------------------

/**
 * Soma XP total do usuário.
 * Chamado em ItemManager quando o usuário conclui um item.
 */
export async function addXp(amount: number): Promise<void> {
  if (typeof window === 'undefined') return;

  const current = totalXp$.getValue();
  const updated = current + amount;

  totalXp$.next(updated);
  safeSetItem(STORAGE_KEYS.totalXp, String(updated));
}

/**
 * Verifica / atualiza a streak diária.
 * Chama isso quando o usuário completa pelo menos uma tarefa no dia.
 */
export async function checkStreak(): Promise<void> {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const snapshot = streak$.getValue();
  const lastCheckin = snapshot.lastCheckin;

  let newCount = snapshot.count;

  if (!lastCheckin) {
    // primeira vez
    newCount = 1;
  } else {
    const lastDate = new Date(lastCheckin);
    const diffMs = new Date(today).getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000); // 1000*60*60*24

    if (diffDays === 0) {
      // já contou hoje, não muda
      return;
    } else if (diffDays === 1) {
      // dia seguinte -> continua streak
      newCount += 1;
    } else {
      // perdeu streak
      newCount = 1;
    }
  }

  streak$.next({ count: newCount, lastCheckin: today });

  safeSetItem(STORAGE_KEYS.streak, String(newCount));
  safeSetItem(STORAGE_KEYS.lastCheckin, today);
}

// Observables usados pelo StatsManager.svelte
export function getTotalXpObservable(): Observable<number> {
  return totalXp$.asObservable();
}

export function getStreakObservable(): Observable<StreakSnapshot> {
  return streak$.asObservable();
}

// ----------------------
// Cálculo de nível
// ----------------------
// Regra simples: base 100 XP, e cada nível seguinte custa +50 XP a mais que o anterior.
export function calcularNivel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
} {
  let level = 1;
  let remainingXp = totalXp;
  let xpNextLevel = 100;

  while (remainingXp >= xpNextLevel) {
    remainingXp -= xpNextLevel;
    level += 1;
    xpNextLevel = 100 + (level - 1) * 50;
  }

  return {
    level,
    currentLevelXp: remainingXp,
    xpToNextLevel: xpNextLevel,
  };
}
