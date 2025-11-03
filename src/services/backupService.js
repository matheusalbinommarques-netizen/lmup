import { db } from './db.js';

/**
 * Exporta todos os dados do Dexie para uma string JSON.
 * @returns {Promise<string>} String JSON contendo todas as tabelas.
 */
export async function exportData() {
  try {
    // Nomes de todas as tabelas que queremos exportar
    // (areas, itens, meta)
    const tables = ['areas', 'itens', 'meta'];

    const exportObject = {};

    // Usa Promise.all para carregar todas as tabelas em paralelo
    await Promise.all(
      tables.map(async (tableName) => {
        // Pega todos os itens da tabela
        const data = await db[tableName].toArray();
        exportObject[tableName] = data;
      }),
    );

    // Retorna o objeto completo como uma string JSON formatada
    return JSON.stringify(exportObject, null, 2);
  } catch (e) {
    console.error('Falha ao exportar dados:', e);
    // Lança o erro para o componente de UI tratar
    throw new Error('Falha na exportação de dados.');
  }
}

/**
 * Importa dados de uma string JSON, substituindo o conteúdo atual do DB.
 * @param {string} jsonString - String JSON contendo os dados das tabelas.
 * @returns {Promise<void>}
 */
export async function importData(jsonString) {
  try {
    const importObject = JSON.parse(jsonString);
    const tables = Object.keys(importObject);

    // Usa uma transação 'rw' (read-write) para garantir que todas
    // as operações (limpar e adicionar) sejam atômicas.
    await db.transaction('rw', db.tables, async () => {
      // 1. Limpa todas as tabelas
      await Promise.all(
        tables.map(async (tableName) => {
          // Apenas limpa tabelas que existem no schema atual
          if (db[tableName]) {
            await db[tableName].clear();
          }
        }),
      );

      // 2. Adiciona os novos dados
      await Promise.all(
        tables.map(async (tableName) => {
          if (
            db[tableName] &&
            importObject[tableName] &&
            importObject[tableName].length > 0
          ) {
            // Usa 'bulkPut' para inserção rápida de múltiplos itens
            await db[tableName].bulkPut(importObject[tableName]);
          }
        }),
      );
    });

    // Sucesso
  } catch (e) {
    console.error('Falha ao importar dados:', e);
    // Lança o erro para o componente de UI tratar
    throw new Error('Falha na importação de dados. O arquivo JSON é inválido?');
  }
}
