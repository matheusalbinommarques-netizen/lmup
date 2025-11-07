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
        xpNext: 100, // XP necessário para o Nível 2
        avatarUrl: '', // Novo campo
      });
    }
  }
  return {};
}
