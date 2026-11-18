// Atualiza a cópia do agente da sincronização local (.local-app/agent/scripts)
// de forma atômica: prepara e valida a nova cópia ao lado, espera nenhum
// ciclo ou publicação estar em andamento (as mesmas travas deles) e só então
// troca os diretórios, guardando o anterior. Não toca na configuração, na
// tarefa agendada, na cópia publication-main nem no servidor da porta 5174.
//
// Uso (pelo install-local-sync.ps1 -Mode update-agent):
//   node scripts/update-agent.mjs <pasta .local-app>
import { execFile } from 'node:child_process';
import { copyFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { acquireLocalLock } from './local-process-lock.mjs';
import { AGENT_FILES, agentClosure } from './local-agent-files.mjs';

const execute = promisify(execFile);
const stamp = (now) => new Date(now).toISOString().replace(/[-:.]/g, '');

/** Confere a cópia preparada: arquivos, sintaxe e importações completas. */
export async function validateAgentCopy(directory, files = AGENT_FILES) {
  for (const name of files) {
    await stat(join(directory, name)).catch(() => {
      throw Error(`A nova cópia do agente não tem ${name}.`);
    });
    await execute(process.execPath, ['--check', join(directory, name)], {
      windowsHide: true,
      timeout: 60_000,
    }).catch((error) => {
      throw Error(`Sintaxe inválida em ${name}.`, { cause: error });
    });
  }
  const missing = (await agentClosure(directory)).filter(
    (name) => !files.includes(name),
  );
  if (missing.length)
    throw Error(
      `A cópia do agente importa arquivos fora da lista: ${missing}.`,
    );
}

export async function updateAgent({
  source = fileURLToPath(new URL('./', import.meta.url)),
  storage,
  files = AGENT_FILES,
  now = Date.now(),
}) {
  const agent = join(storage, 'agent', 'scripts');
  if (!(await stat(agent).catch(() => null))?.isDirectory())
    throw Error(
      'Agente não encontrado. Use a instalação completa; nada foi alterado.',
    );
  const id = stamp(now);
  const staged = join(storage, 'agent', `scripts.next-${id}`);
  const previous = join(storage, 'agent', `scripts.previous-${id}`);
  let unlockSync, unlockPublish;
  try {
    await mkdir(staged);
    for (const name of files)
      await copyFile(join(source, name), join(staged, name));
    await validateAgentCopy(staged, files);
    // Mesmas travas do ciclo e da publicação: nada troca durante o uso.
    unlockSync = await acquireLocalLock(join(storage, 'sync-daemon.lock'));
    unlockPublish = await acquireLocalLock(join(storage, 'publish.lock'));
    await rename(agent, previous);
    try {
      await rename(staged, agent);
    } catch (error) {
      await rename(previous, agent);
      throw error;
    }
    return { agent, previous, files: [...files] };
  } finally {
    if (unlockPublish) await unlockPublish();
    if (unlockSync) await unlockSync();
    await rm(staged, { recursive: true, force: true });
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
      `Agente atualizado (${result.files.length} arquivos). Cópia anterior: ${result.previous}`,
    );
  } catch (error) {
    console.error(`Agente preservado: ${error.message}`);
    process.exit(1);
  }
}
