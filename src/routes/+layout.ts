// src/routes/+layout.ts
import { browser } from '$app/environment';
import { db, type Profile, type Companion } from '$services/db'; // Importar 'Companion'

export const prerender = true;

// Lista de todos os pets disponíveis no jogo
const allCompanions: Companion[] = [
  {
    id: 1,
    name: 'Fagulha',
    type: 'Dragão Jovem',
    imagePath: '/art/pets/pet-dragon-final.png',
  },
  {
    id: 2,
    name: 'Lobo Cinzento',
    type: 'Lobo das Estepes',
    imagePath: '/art/pets/pet-wolf-final.png',
  },
  {
    id: 3,
    name: 'Espectro',
    type: 'Lich Aprendiz',
    imagePath: '/art/pets/pet-lich-final.png',
  },
  {
    id: 4,
    name: 'Observador',
    type: 'Aberração',
    imagePath: '/art/pets/pet-aberration-final.png',
  },
];

export async function load() {
  if (browser) {
    const profileCount = await db.profile.count();

    if (profileCount === 0) {
      // --- SETUP DE NOVO USUÁRIO ---
      console.log('Nenhum perfil encontrado. Criando Herói padrão...');

      // *** CORREÇÃO: Adicionados os 3 campos em falta ***
      await db.profile.add({
        name: 'Matheus',
        title: 'Recruta Promissor',
        level: 1,
        xpCurrent: 0,
        xpNext: 100,
        avatarUrl: '',
        totalXpEarned: 0,
        currentStreak: 0,
        lastCompletionDate: '',
        activeCompanionId: 1,
      });

      // Popular a tabela de pets
      console.log('Populando tabela de Companheiros...');
      await db.companions.bulkAdd(allCompanions);

      // Desbloquear o pet padrão
      await db.unlockedCompanions.add({ companionId: 1 });
    } else {
      // --- MIGRAÇÃO DE USUÁRIO EXISTENTE ---
      const profile = await db.profile.get(1);
      if (profile) {
        let needsUpdate = false;
        const updates: Partial<Profile> = {};

        if (profile.totalXpEarned === undefined) {
          updates.totalXpEarned = profile.xpCurrent;
          needsUpdate = true;
        }
        if (profile.currentStreak === undefined) {
          updates.currentStreak = 0;
          updates.lastCompletionDate = '';
          needsUpdate = true;
        }
        if (profile.activeCompanionId === undefined) {
          updates.activeCompanionId = 1; // ID do Fagulha
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log('Migrando perfil para V5...', updates);
          await db.profile.update(1, updates);
        }
      }

      // Migração das tabelas de pets (para usuários existentes)
      const companionCount = await db.companions.count();
      if (companionCount === 0) {
        console.log('Migração: Populando tabela de Companheiros...');
        await db.companions.bulkAdd(allCompanions);
      }

      const unlockedCount = await db.unlockedCompanions.count();
      if (unlockedCount === 0) {
        console.log('Migração: Desbloqueando pet padrão...');
        await db.unlockedCompanions.add({ companionId: 1 });
      }
    }
  }
  return {};
}
