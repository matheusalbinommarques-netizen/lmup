// src/services/xpService.ts
import { db } from './db';

const getXpForNextLevel = (level: number): number => {
  // Ex: Lvl 1->100, Lvl 2->220, Lvl 3->360, Lvl 4->520...
  return Math.floor(level * 80 + Math.pow(level, 2) * 20);
};

export const xpService = {
  /**
   * Adiciona XP ao perfil do usuário e checa por level up.
   */
  async addXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      const profile = await db.profile.get(1);
      if (!profile) return;

      // Puxa o totalXpEarned (ou 0 se for undefined, por segurança)
      let { xpCurrent, xpNext, level, title, totalXpEarned = 0 } = profile;

      xpCurrent += amount;
      totalXpEarned += amount; // <-- LINHA ADICIONADA

      let leveledUp = false;
      while (xpCurrent >= xpNext) {
        leveledUp = true;
        xpCurrent -= xpNext; // Zera o XP (mantendo o excesso)
        level += 1; // Aumenta o Nível
        xpNext = getXpForNextLevel(level); // Calcula o novo teto de XP
      }

      if (leveledUp) {
        title = `Nobre Aventureiro Nv. ${level}`;
      }

      await db.profile.update(1, {
        xpCurrent,
        xpNext,
        level,
        title,
        totalXpEarned, // <-- CAMPO ADICIONADO
      });
    });
  },

  /**
   * Remove XP do perfil do usuário (ex: ao desmarcar uma missão).
   * (Não mexemos no totalXpEarned aqui, pois representa o progresso histórico)
   */
  async removeXp(amount: number) {
    if (amount <= 0) return;

    await db.transaction('rw', db.profile, async () => {
      const profile = await db.profile.get(1);
      if (!profile) return;

      let { xpCurrent, xpNext, level, title } = profile;
      xpCurrent -= amount;

      // Loop de "De-Level"
      let deleveled = false;
      while (xpCurrent < 0 && level > 1) {
        deleveled = true;
        level -= 1;
        xpNext = getXpForNextLevel(level);
        xpCurrent += xpNext; // "Devolve" o XP do nível anterior
      }

      if (level < 1) level = 1;
      if (xpCurrent < 0) xpCurrent = 0; // Trava o XP em 0

      if (deleveled) {
        title = `Aventureiro Nv. ${level}`;
      }

      await db.profile.update(1, {
        xpCurrent,
        xpNext,
        level,
        title,
        // totalXpEarned não é modificado
      });
    });
  },
};
