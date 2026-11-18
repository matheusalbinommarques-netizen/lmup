// Atualiza o agente da sincronização local (.local-app/agent) sem nunca o
// deixar sem uma versão utilizável, mesmo que o processo seja interrompido:
//
// 1. com as travas do ciclo e da publicação, prepara a nova versão completa
//    ao lado e valida (arquivos, sintaxe, importações);
// 2. renomeia a pasta preparada para agent/versions/<id> (a versão ativa não
//    é tocada);
// 3. troca agent/current.json de uma vez ({ version, previous });
// 4. na primeira vez, troca agent/scripts/sync-local.mjs (o caminho que a
//    tarefa agendada executa) pelo carregador fixo (agent-bootstrap.mjs),
//    guardando o original como sync-local.legacy.mjs.
//
// Interrompido antes de 3, segue rodando a versão anterior; depois de 3, a
// nova. Cada passo é uma renomeação única no mesmo volume. Não toca na
// configuração, na tarefa agendada, na cópia publication-main nem no
// servidor da porta 5174.
//
// Uso (pelo install-local-sync.ps1 -Mode update-agent):
//   node scripts/update-agent.mjs <pasta .local-app>
import { execFile } from 'node:child_process';
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { acquireLocalLock } from './local-process-lock.mjs';
import { AGENT_FILES, agentClosure } from './local-agent-files.mjs';

const execute = promisify(execFile);
const here = fileURLToPath(new URL('./', import.meta.url));
const stamp = (now) => new Date(now).toISOString().replace(/[-:.]/g, '');
const exists = (path) =>
  stat(path).then(
    () => true,
    () => false,
  );

async function checkSyntax(file, label) {
  await execute(process.execPath, ['--check', file], {
    windowsHide: true,
    timeout: 60_000,
  }).catch((error) => {
    throw Error(`Sintaxe inválida em ${label}.`, { cause: error });
  });
}

/** Confere a cópia preparada: arquivos, sintaxe e importações completas. */
export async function validateAgentCopy(directory, files = AGENT_FILES) {
  for (const name of files) {
    if (!(await exists(join(directory, name))))
      throw Error(`A nova cópia do agente não tem ${name}.`);
    await checkSyntax(join(directory, name), name);
  }
  const missing = (await agentClosure(directory)).filter(
    (name) => !files.includes(name),
  );
  if (missing.length)
    throw Error(
      `A cópia do agente importa arquivos fora da lista: ${missing}.`,
    );
}

/** Ponteiro atual, ou nenhum (agente no formato antigo). */
export async function readPointer(agent) {
  try {
    return JSON.parse(await readFile(join(agent, 'current.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw Error('Ponteiro do agente ilegível; nada foi alterado.', {
      cause: error,
    });
  }
}

export async function updateAgent({
  source = here,
  bootstrap = join(here, 'agent-bootstrap.mjs'),
  storage,
  files = AGENT_FILES,
  now = Date.now(),
  checkpoint = () => {},
}) {
  const agent = join(storage, 'agent');
  const scripts = join(agent, 'scripts');
  if (!(await stat(scripts).catch(() => null))?.isDirectory())
    throw Error(
      'Agente não encontrado. Use a instalação completa; nada foi alterado.',
    );
  const id = stamp(now);
  const versions = join(agent, 'versions');
  const target = join(versions, id);
  const staged = join(versions, `.next-${id}`);
  const pointerNext = join(agent, `current.next-${id}.json`);
  const loaderNext = join(scripts, `.sync-local.next-${id}.mjs`);
  let unlockSync, unlockPublish;
  try {
    // Tudo o que é compartilhado (restos .next-*, ponteiro, ativação) fica sob
    // as mesmas travas do ciclo e da publicação: uma segunda atualização, um
    // ciclo ou uma publicação simultâneos esperam ou são recusados.
    unlockSync = await acquireLocalLock(join(storage, 'sync-daemon.lock'));
    unlockPublish = await acquireLocalLock(join(storage, 'publish.lock'));
    checkpoint('locked');
    await mkdir(versions, { recursive: true });
    // Restos de uma atualização interrompida não contam como versão.
    for (const name of await readdir(versions))
      if (name.startsWith('.next-'))
        await rm(join(versions, name), { recursive: true, force: true });
    if (await exists(target)) throw Error(`A versão ${id} já existe.`);
    await mkdir(staged);
    for (const name of files)
      await copyFile(join(source, name), join(staged, name));
    await validateAgentCopy(staged, files);
    const loader = await readFile(bootstrap, 'utf8');
    await writeFile(loaderNext, loader);
    await checkSyntax(loaderNext, 'agent-bootstrap.mjs');
    const pointer = await readPointer(agent);
    checkpoint('staged');
    await rename(staged, target);
    checkpoint('version');
    const previous =
      typeof pointer?.version === 'string' &&
      (await exists(join(versions, pointer.version, 'sync-local.mjs')))
        ? pointer.version
        : undefined;
    await writeFile(
      pointerNext,
      JSON.stringify({ format: 1, version: id, previous }, null, 2),
    );
    await rename(pointerNext, join(agent, 'current.json'));
    checkpoint('pointer');
    const entry = join(scripts, 'sync-local.mjs');
    if ((await readFile(entry, 'utf8').catch(() => '')) !== loader) {
      if (!(await exists(join(scripts, 'sync-local.legacy.mjs'))))
        await copyFile(entry, join(scripts, 'sync-local.legacy.mjs'));
      await rename(loaderNext, entry);
    }
    checkpoint('loader');
    return { agent, version: id, previous };
  } finally {
    // Só quem tem as travas limpou ou criou estes arquivos temporários.
    if (unlockSync && unlockPublish) {
      await rm(staged, { recursive: true, force: true });
      await rm(pointerNext, { force: true });
      await rm(loaderNext, { force: true });
    }
    if (unlockPublish) await unlockPublish();
    if (unlockSync) await unlockSync();
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const storage = process.argv[2];
  if (!storage) {
    console.error('Informe a pasta .local-app.');
    process.exit(1);
  }
  try {
    const result = await updateAgent({ storage: resolve(storage) });
    console.log(
      `Agente atualizado para a versão ${result.version}${result.previous ? ` (anterior: ${result.previous})` : ''}.`,
    );
  } catch (error) {
    console.error(`Agente preservado: ${error.message}`);
    process.exit(1);
  }
}
