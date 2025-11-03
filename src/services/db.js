import Dexie from 'dexie';

// Cria a instância do banco de dados
export const db = new Dexie('levelMeUpDB');

// Define o Schema (Versão 1)
// Conforme o plano: Áreas e Itens (para XP, revisões, etc.)
db.version(1).stores({
  areas: '++id, nome', // '++id' é chave primária auto-incremento, 'nome' é indexado
  itens: '++id, areaId, nome, tipo', // 'areaId' será usado para relacionar com a área
  // Você pode adicionar mais tabelas (ex: 'reviews', 'streaks') aqui
});

// Abre o banco de dados para testar a conexão
db.open().catch((err) => {
  console.error(`Falha ao abrir o DB: ${err.stack || err}`);
});
