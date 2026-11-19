import { open, readFile, stat, unlink } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const RELEASED = Symbol('released');
const WRITING = Symbol('writing');
// Trava sendo liberada: o arquivo sumiu ou, no Windows, está com a exclusão
// pendente (outro processo ainda o tem aberto), o que recusa abrir com EPERM.
const RELEASING = new Set(['ENOENT', 'EPERM']);

// Um dono grava o pid logo depois de criar a trava; sem pid há mais tempo que
// isso, o dono caiu ao criá-la e a trava é inválida.
const STUCK_MS = 1000;

// Dono da trava. Entre o EEXIST e a leitura, o dono pode ter liberado a trava
// ou ainda não ter gravado o pid (arquivo vazio ou parcial).
async function holder(path) {
  try {
    const text = await readFile(path, 'utf8');
    try {
      return JSON.parse(text);
    } catch {
      const { mtimeMs } = await stat(path);
      return Date.now() - mtimeMs > STUCK_MS ? null : WRITING;
    }
  } catch (error) {
    if (RELEASING.has(error.code)) return RELEASED;
    throw error;
  }
}

const BUSY = 'Outra publicação ou sincronização está em andamento.';

export async function acquireLocalLock(path, attempts = 5) {
  // Trava trocando de dono: tenta de novo algumas vezes; esgotadas, a trava
  // segue disputada e a recusa é "em andamento", com o erro original na causa.
  const retry = async (error) => {
    if (attempts <= 1) throw Error(BUSY, { cause: error });
    await delay(20);
    return acquireLocalLock(path, attempts - 1);
  };
  try {
    const file = await open(path, 'wx');
    await file.writeFile(JSON.stringify({ pid: process.pid }));
    await file.close();
    return async () => unlink(path);
  } catch (error) {
    // Ao criar, ENOENT é pasta inexistente (erro real); EPERM é exclusão pendente.
    if (error.code === 'EPERM') return retry(error);
    if (error.code !== 'EEXIST') throw error;
    const previous = await holder(path);
    if (previous === RELEASED || previous === WRITING) return retry(error);
    if (!Number.isSafeInteger(previous?.pid) || previous.pid < 1)
      throw Error('Trava inválida; a versão publicada foi preservada.', {
        cause: error,
      });
    try {
      process.kill(previous.pid, 0);
    } catch (cause) {
      if (cause.code === 'ESRCH') {
        await unlink(path).catch((reason) => {
          if (reason.code !== 'ENOENT') throw reason;
        });
        return acquireLocalLock(path, attempts);
      }
      throw cause;
    }
    throw Error(BUSY, { cause: error });
  }
}
