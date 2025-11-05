import Dexie from 'dexie';
import { browser } from '$app/environment'; // 1. Importamos o 'browser'

// 2. Declaramos 'db' como nulo inicialmente.
// Usamos 'let' para que possa ser modificado
export let db = null;

// 3. Este 'if' garante que o bloco de código
// SÓ execute no ambiente do navegador (cliente).
if (browser) {
  // 4. Se estamos no navegador, criamos a instância do Dexie
  db = new Dexie('levelMeUpDB');

  // 5. Mantemos as suas definições de versão originais
  db.version(1).stores({
    areas: '++id, nome',
    itens: '++id, areaId, nome, tipo',
  });

  db.version(2).stores({
    areas: '++id, nome',
    itens: '++id, areaId, nome, tipo',
    meta: 'key', // Nova tabela para guardar XP, Streaks, etc.
  });

  // Abre o banco de dados para testar a conexão
  db.open().catch((err) => {
    console.error(`Falha ao abrir o DB: ${err.stack || err}`);
  });
}

// No servidor, 'db' será exportado como 'null'.
// No navegador, 'db' será exportado como a instância do Dexie.
