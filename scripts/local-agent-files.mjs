// Arquivos que o agente da sincronização local roda a partir da própria cópia
// (.local-app/agent/scripts). A lista do install-local-sync.ps1 precisa ser
// igual; local-agent.test.mjs confere isso e que nada importado fica de fora.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const AGENT_ENTRY = 'sync-local.mjs';
export const AGENT_FILES = [
  'sync-local.mjs',
  'local-sync-config.mjs',
  'local-sync-core.mjs',
  'local-security-policy.mjs',
  'audit-policy.mjs',
  'audit-upstream.mjs',
  'local-process-lock.mjs',
  'publish-local.mjs',
  'local-release-store.mjs',
  'verify-package.mjs',
  'serve-static.mjs',
  'static-server.mjs',
];

// import com ou sem `from`, import() e new URL('./x.mjs', import.meta.url)
// (processos filhos).
const REFERENCE =
  /(?:\bfrom\s+|\bimport\s*\(?\s*|\bnew URL\(\s*)['"]\.\/([\w.-]+\.mjs)['"]/g;

/** Arquivos locais alcançados a partir da entrada, dentro do diretório. */
export async function agentClosure(directory, entry = AGENT_ENTRY) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const name = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const text = await readFile(join(directory, name), 'utf8');
    for (const match of text.matchAll(REFERENCE)) queue.push(match[1]);
  }
  return [...seen].sort();
}
