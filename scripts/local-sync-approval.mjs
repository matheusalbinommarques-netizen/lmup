// Autorização de publicação do sincronizador local. O sincronizador recebe a
// main sozinho, mas só compila e publica o commit exato gravado aqui por
// `npm run app:aprovar` (scripts/approve-local.mjs), que confere antes o PR,
// a CI no HEAD aprovado e o commit do merge. Um commit diferente nunca herda a
// autorização. A gravação é atômica (arquivo temporário + renomeação); depois
// de uma publicação confirmada a autorização é consumida, e uma falha a marca
// como falhada, sem novas tentativas até uma nova autorização.
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const APPROVAL_FILE = 'sync-approval.json';
export const APPROVAL_USED_FILE = 'sync-approval-used.json';
const SHA = /^[a-f0-9]{40}$/;
const text = (value) => typeof value === 'string' && value.length > 0;

export function validateApproval(value) {
  if (
    value?.format !== 1 ||
    !SHA.test(value.commit) ||
    !SHA.test(value.tree) ||
    !Number.isSafeInteger(value.pr?.number) ||
    value.pr.number < 1 ||
    !SHA.test(value.pr.head) ||
    !text(value.approvedAt) ||
    (value.failure !== undefined &&
      !(text(value.failure?.message) && text(value.failure.at)))
  )
    throw Error('Autorização de publicação inválida; nada será publicado.');
  return value;
}

/** Autorização vigente, ou nenhuma. Arquivo corrompido bloqueia (erro). */
export async function readApproval(storage) {
  let content;
  try {
    content = await readFile(join(storage, APPROVAL_FILE), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  try {
    return validateApproval(JSON.parse(content));
  } catch (cause) {
    throw Error('Autorização de publicação inválida; nada será publicado.', {
      cause,
    });
  }
}

async function writeAtomic(storage, name, value) {
  const temporary = join(storage, `${name}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2));
    await rename(temporary, join(storage, name));
  } finally {
    await rm(temporary, { force: true });
  }
}

/** Grava (ou substitui) a autorização. Chame com publish.lock. */
export const writeApproval = (storage, approval) =>
  writeAtomic(storage, APPROVAL_FILE, validateApproval(approval));

/** Marca a falha na própria autorização: o ciclo seguinte não repete. */
export const markApprovalFailed = (
  storage,
  approval,
  message,
  now = Date.now(),
) =>
  writeApproval(storage, {
    ...approval,
    failure: {
      message: String(message || 'falha sem mensagem'),
      at: new Date(now).toISOString(),
    },
  });

/**
 * Consome a autorização depois da publicação confirmada: guarda o registro
 * em sync-approval-used.json e só então remove a vigente. Interrompido entre
 * os dois passos, o ciclo seguinte vê a versão ativa no mesmo commit e
 * consome de novo, sem recompilar.
 */
export async function consumeApproval(
  storage,
  approval,
  release,
  now = Date.now(),
) {
  await writeAtomic(storage, APPROVAL_USED_FILE, {
    ...approval,
    consumedAt: new Date(now).toISOString(),
    release: { id: release.id, version: release.version },
  });
  await rm(join(storage, APPROVAL_FILE), { force: true });
}

/** Remove a autorização vigente. Chame com publish.lock. */
export const revokeApproval = (storage) =>
  rm(join(storage, APPROVAL_FILE), { force: true });
