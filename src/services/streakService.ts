// src/services/streakService.ts
import { db, type Profile } from '$services/db';
import { getHeroModifiersOnce } from '$services/gearService';

function toDateOnly(d: Date | string): Date {
  if (d instanceof Date)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parsed = new Date(d);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function diffInDays(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

type StreakUpdateResult = {
  newStreak: number;
  newLastCompletionDate: string;
};

/**
 * Regra de streak com proteção da armadura:
 *
 * - Sem gear:
 *   - mesmo dia: mantém streak
 *   - +1 dia: streak + 1
 *   - >1 dia: streak = 1 (reset)
 *
 * - Com armadura (streakProtectionDays = N):
 *   - janela de perdão = 1 (dia normal) + N
 *   - se diff > janela → reset (1)
 *   - se diff === 0 → mantém
 *   - se diff === 1 → +1
 *   - se 1 < diff <= janela → NÃO reseta, mas também não soma (congela)
 */
function computeStreakWithProtection(
  currentStreak: number,
  lastCompletionDate: string | null | undefined,
  today: Date,
  streakProtectionDays: number,
): StreakUpdateResult {
  const todayOnly = toDateOnly(today);
  const todayStr = todayOnly.toISOString().slice(0, 10);

  // nunca completou nada
  if (!lastCompletionDate) {
    return {
      newStreak: 1,
      newLastCompletionDate: todayStr,
    };
  }

  const lastDateOnly = toDateOnly(lastCompletionDate);
  const diff = diffInDays(lastDateOnly, todayOnly);

  // mesmo dia → não mexe no streak
  if (diff === 0) {
    return {
      newStreak: currentStreak || 1,
      newLastCompletionDate: todayStr,
    };
  }

  // janela de perdão
  const allowedGap = 1 + (streakProtectionDays || 0);

  // passou da janela → reset
  if (diff > allowedGap) {
    return {
      newStreak: 1,
      newLastCompletionDate: todayStr,
    };
  }

  // exatamente 1 dia → soma streak
  if (diff === 1) {
    return {
      newStreak: (currentStreak || 0) + 1,
      newLastCompletionDate: todayStr,
    };
  }

  // entre 2 e allowedGap → “congelado” (nem reseta nem soma)
  return {
    newStreak: currentStreak || 1,
    newLastCompletionDate: todayStr,
  };
}

/**
 * Chame esta função quando o usuário COMPLETAR uma missão no dia atual.
 *
 * Ela:
 * - lê o perfil (id=1),
 * - lê os modificadores de gear,
 * - aplica a regra de streak com proteção,
 * - salva currentStreak e lastCompletionDate no db.profile.
 */
export async function registerTaskCompletionWithStreakProtection(): Promise<void> {
  const profile = (await db.profile.get(1)) as Profile | undefined;
  if (!profile) return;

  const mods = await getHeroModifiersOnce();

  const result = computeStreakWithProtection(
    profile.currentStreak ?? 0,
    profile.lastCompletionDate ?? null,
    new Date(),
    mods.streakProtectionDays,
  );

  await db.profile.update(profile.id ?? 1, {
    currentStreak: result.newStreak,
    lastCompletionDate: result.newLastCompletionDate,
    updatedAt: new Date().toISOString(),
  });
}
