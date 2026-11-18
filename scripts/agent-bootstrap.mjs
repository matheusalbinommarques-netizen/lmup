// Carregador fixo do agente da sincronização local. O update-agent instala
// este arquivo como .local-app/agent/scripts/sync-local.mjs, o caminho que a
// tarefa agendada executa. Cada versão do agente fica completa em
// agent/versions/<id>; agent/current.json aponta a atual e a anterior e é
// trocado de uma vez. Se a atual não estiver utilizável, roda a anterior; sem
// nenhuma, sai com erro e nada é publicado. Não importa nada desta pasta.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const agent = fileURLToPath(new URL('../', import.meta.url));
const VERSION = /^\d{8}T\d{9}Z$/;
const usable = (id) => {
  if (typeof id !== 'string' || !VERSION.test(id)) return null;
  const entry = join(agent, 'versions', id, 'sync-local.mjs');
  try {
    return statSync(entry).isFile() ? entry : null;
  } catch {
    return null;
  }
};
const readPointer = () => {
  try {
    return JSON.parse(readFileSync(join(agent, 'current.json'), 'utf8'));
  } catch {
    return {};
  }
};
const pointer = readPointer();
const current = usable(pointer?.version);
const entry = current ?? usable(pointer?.previous);
if (!entry) {
  console.error('Agente sem versão utilizável; nada foi publicado.');
  process.exit(1);
}
if (!current)
  console.error(
    `Versão ${pointer?.version} do agente indisponível; usando a anterior, ${pointer?.previous}.`,
  );
await import(pathToFileURL(entry).href);
