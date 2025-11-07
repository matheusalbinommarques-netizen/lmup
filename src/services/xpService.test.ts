// src/services/xpService.ts
import { db } from './db';

const getXpForNextLevel = (level: number): number => {
  // Fórmula de XP para level up
  return Math.floor(level * 80 + Math.pow(level, 2) * 20);
};

// A constante 'xpService' é o que está sendo importado em +page.svelte e missoes/+page.svelte
export const xpService = {
  /**
   * Adiciona XP ao perfil do usuário e checa por level up.
   */
  async addXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      const profile = await db.profile.get(1);
      if (!profile) return;

      let { xpCurrent, xpNext, level, title } = profile;
      xpCurrent += amount;

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

      await db.profile.update(1, {
        xpCurrent,
        xpNext,
        level,
        title,
      });
    });
  },

  /**
   * Remove XP do perfil do usuário.
   */
  async removeXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      const profile = await db.profile.get(1);
      if (!profile) return;

      let { xpCurrent, xpNext, level, title } = profile;
      xpCurrent -= amount;

      let deleveled = false;
      while (xpCurrent < 0) {
        deleveled = true;
        level -= 1;
        if (level < 1) level = 1;

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
};
