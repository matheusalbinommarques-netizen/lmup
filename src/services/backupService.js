import { db } from './db.js';
import { saveAs } from 'file-saver';

export async function exportarDados() {
  try {
    const allData = {};

    for (const table of db.tables) {
      allData[table.name] = await table.toArray();
    }

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    saveAs(blob, 'level-me-up-backup.json');

    console.log('Dados exportados com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    alert('Erro ao exportar dados. Verifique o console.');
  }
}

export async function importarDados() {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Resultado do leitor não é uma string');
          }
          const dados = JSON.parse(result);

          await db.transaction('rw', db.tables, async () => {
            for (const tableName in dados) {
              if (db[tableName]) {
                await db[tableName].clear();
                await db[tableName].bulkAdd(dados[tableName]);
              }
            }
          });

          console.log('Dados importados com sucesso!');
          alert('Dados importados com sucesso! A página será recarregada.');
          window.location.reload();
        } catch (readError) {
          console.error('Erro ao ler ou importar o arquivo:', readError);
          alert(
            'Erro ao importar dados. O arquivo pode estar corrompido. Verifique o console.',
          );
        }
      };
      reader.readAsText(file);
    };

    input.click();
  } catch (error) {
    console.error('Erro ao iniciar a importação:', error);
  }
}