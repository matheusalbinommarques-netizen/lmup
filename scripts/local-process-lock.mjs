import { open, readFile, unlink } from 'node:fs/promises';

export async function acquireLocalLock(path) {
  try {
    const file = await open(path, 'wx');
    await file.writeFile(JSON.stringify({ pid: process.pid }));
    await file.close();
    return async () => unlink(path);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const previous = JSON.parse(await readFile(path, 'utf8'));
    if (!Number.isSafeInteger(previous.pid) || previous.pid < 1)
      throw Error('Trava inválida; a versão publicada foi preservada.');
    try {
      process.kill(previous.pid, 0);
    } catch (cause) {
      if (cause.code === 'ESRCH') {
        await unlink(path);
        return acquireLocalLock(path);
      }
      throw cause;
    }
    throw Error('Outra publicação ou sincronização está em andamento.');
  }
}
