// src/routes/+layout.ts
import { browser } from '$app/environment';
import { db } from '$services/db';

export const prerender = true;

// A função load roda em ambos, servidor e cliente.
export async function load() {
  if (browser) {
    const profileCount = await db.profile.count();

    if (profileCount === 0) {
      console.log('Nenhum perfil encontrado. Criando Herói padrão...');
      await db.profile.add({
        name: 'Matheus',
        title: 'Recruta Promissor',
        level: 1,
        xpCurrent: 0,
        xpNext: 100,
        avatarUrl: '',
        totalXpEarned: 0, // <-- CAMPO ADICIONADO
      });
    } else {
      // Bloco de migração simples para usuários existentes
      const profile = await db.profile.get(1);
      if (profile && profile.totalXpEarned === undefined) {
        console.log('Migrando perfil: Adicionando totalXpEarned');
        // Define o XP total inicial como o XP atual para usuários antigos
        await db.profile.update(1, { totalXpEarned: profile.xpCurrent });
      }
    }
  }
  return {};
}
