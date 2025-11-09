// src/services/xpService.ts
import { db } from './db';
import { liveQuery } from 'dexie';

/**
 * XP necessário para subir de nível.
 * Ex:
 *  - Nível 1 -> 2 = 100 XP
 *  - Nível 2 -> 3 = 200 XP
 *  - Nível 3 -> 4 = 300 XP
 */
const getXpForNextLevel = (level: number): number => {
  if (level < 1) return 100;
  return level * 100;
};

// -----------------------------
// Helpers de data / streak
// -----------------------------

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateOnlyString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateOnly(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

/**
 * Calcula o streak atualizado dado o streak atual + última data salva.
 * Regra:
 *  - Nunca teve streak -> vira 1 hoje.
 *  - Mesma data que hoje -> mantém streak.
 *  - Ontem -> streak + 1.
 *  - Mais de 1 dia sem completar -> reseta para 1.
 */
function computeUpdatedStreak(
  currentStreak: number | undefined,
  lastCompletionDate: string | undefined | null,
): { currentStreak: number; lastCompletionDate: string } {
  const today = toDateOnly(new Date());
  const todayStr = toDateOnlyString(today);

  if (!lastCompletionDate) {
    return { currentStreak: 1, lastCompletionDate: todayStr };
  }

  const lastDateParsed = parseDateOnly(lastCompletionDate);
  if (!lastDateParsed) {
    return { currentStreak: 1, lastCompletionDate: todayStr };
  }

  const lastDate = toDateOnly(lastDateParsed);
  const lastStr = toDateOnlyString(lastDate);

  // Já registrou streak hoje
  if (lastStr === todayStr) {
    return {
      currentStreak: currentStreak ?? 1,
      lastCompletionDate,
    };
  }

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / DAY_IN_MS);

  if (diffDays === 1) {
    // Dia seguinte -> incrementa streak
    const nextStreak = (currentStreak ?? 0) + 1;
    return { currentStreak: nextStreak, lastCompletionDate: todayStr };
  }

  // Passou mais de um dia (ou relógio bagunçado) -> reseta
  return { currentStreak: 1, lastCompletionDate: todayStr };
}

// -----------------------------
// Serviço principal de XP
// -----------------------------

export const xpService = {
  /**
   * Adiciona XP ao perfil do usuário, checa level up
   * e atualiza o streak diário.
   */
  async addXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      // Garante que exista um profile com id = 1
      let profile = await db.profile.get(1);

      if (!profile) {
        profile = {
          id: 1,
          name: 'Seu herói',
          title: 'Nobre Aventureiro Nv. 1',
          level: 1,
          xpCurrent: 0,
          xpNext: getXpForNextLevel(1),
          avatarUrl: '',
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: '',
          activeCompanionId: 1,
        };
        await db.profile.put(profile);
      }

      // Somente leitura → const
      const {
        currentStreak,
        lastCompletionDate,
        totalXpEarned: totalXpEarnedRaw = 0,
      } = profile;

      // Valores que vamos mutar → let
      let { xpCurrent, xpNext, level, title } = profile;
      let totalXpEarned = totalXpEarnedRaw;

      // XP atual + histórico
      xpCurrent += amount;
      totalXpEarned += amount;

      // Loop de level up
      let leveledUp = false;
      while (xpCurrent >= xpNext) {
        leveledUp = true;
        xpCurrent -= xpNext;
        level += 1;
        xpNext = getXpForNextLevel(level);
      }

      if (leveledUp) {
        title = `Nobre Aventureiro Nv. ${level}`;
      }

      // Atualiza streak diário
      const streakInfo = computeUpdatedStreak(
        currentStreak,
        lastCompletionDate,
      );

      await db.profile.update(1, {
        xpCurrent,
        xpNext,
        level,
        title,
        totalXpEarned,
        currentStreak: streakInfo.currentStreak,
        lastCompletionDate: streakInfo.lastCompletionDate,
      });
    });
  },

  /**
   * Remove XP do perfil (ex: ao desmarcar uma missão).
   * Não mexe no totalXpEarned nem no streak.
   */
  async removeXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      let profile = await db.profile.get(1);

      if (!profile) {
        // Se não existir perfil, cria um zerado só para manter consistência
        profile = {
          id: 1,
          name: 'Seu herói',
          title: 'Aventureiro Nv. 1',
          level: 1,
          xpCurrent: 0,
          xpNext: getXpForNextLevel(1),
          avatarUrl: '',
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: '',
          activeCompanionId: 1,
        };
        await db.profile.put(profile);
      }

      let { xpCurrent, xpNext, level, title } = profile;

      xpCurrent -= amount;

      // Loop de "de-level"
      let deleveled = false;
      while (xpCurrent < 0 && level > 1) {
        deleveled = true;
        level -= 1;
        xpNext = getXpForNextLevel(level);
        xpCurrent += xpNext;
      }

      if (level < 1) level = 1;
      if (xpCurrent < 0) xpCurrent = 0;

      if (deleveled) {
        title = `Aventureiro Nv. ${level}`;
      }

      await db.profile.update(1, {
        xpCurrent,
        xpNext,
        level,
        title,
      });
    });
  },
} as const;

// -----------------------------
// Observables para painéis (XP total + streak)
// -----------------------------

/**
 * Observable com o total de XP acumulado (totalXpEarned).
 */
export function getTotalXpObservable() {
  return liveQuery(async () => {
    const profile = await db.profile.get(1);
    return profile?.totalXpEarned ?? 0;
  });
}

/**
 * Observable com o streak atual + última data de conclusão.
 * Formato: { count: number, lastCompletionDate: string }
 */
export function getStreakObservable() {
  return liveQuery(async () => {
    const profile = await db.profile.get(1);
    return {
      count: profile?.currentStreak ?? 0,
      lastCompletionDate: profile?.lastCompletionDate ?? '',
    };
  });
}

// -----------------------------
// Função de cálculo de nível
// -----------------------------

/**
 * Dado o total de XP da vida, retorna:
 *  - nivel / level
 *  - progresso (%)
 *  - xpAtualNesteNivel / currentLevelXp
 *  - xpParaProximoNivel / xpToNextLevel
 */
export function calcularNivel(totalXp: number) {
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    totalXp = 0;
  }

  let level = 1;
  let xpRemaining = Math.floor(totalXp);
  let xpForNext = getXpForNextLevel(level); // 100 no nível 1

  while (xpRemaining >= xpForNext) {
    xpRemaining -= xpForNext;
    level += 1;
    xpForNext = getXpForNextLevel(level);
  }

  const progress =
    xpForNext > 0 ? Math.floor((xpRemaining / xpForNext) * 100) : 0;

  return {
    // nomes em pt-BR (se quiser usar em JS puro)
    nivel: level,
    progresso: progress,
    xpAtualNesteNivel: xpRemaining,
    xpParaProximoNivel: xpForNext,

    // aliases em inglês (para os componentes Svelte)
    level,
    progress,
    currentLevelXp: xpRemaining,
    xpToNextLevel: xpForNext,
  };
}
