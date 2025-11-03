import Dexie from 'dexie';

// Cria a instância do banco de dados
export const db = new Dexie('levelMeUpDB');

//
// ATUALIZAÇÃO: Incrementamos a versão para 2
// e adicionamos a tabela 'meta'.
// 'key' será nossa chave primária (ex: 'totalXp', 'streak')
//
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
