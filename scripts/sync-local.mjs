import {
  readFile,
  writeFile,
  mkdir,
  stat,
  rename,
  appendFile,
  realpath,
} from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { synchronize, runNpm } from './local-sync-core.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';
import { ensureServer } from './publish-local.mjs';
import { auditLocalRelease } from './local-security-policy.mjs';

const project =
  process.env.LMU_INSTALLATION_PROJECT ||
  fileURLToPath(new URL('../', import.meta.url));
const storage = join(project, '.local-app');
const configPath = join(storage, 'sync-config.json');
const statusPath = join(storage, 'sync-status.json');
const logPath = join(storage, 'sync.log');
await mkdir(storage, { recursive: true });
if (process.argv.includes('--status')) {
  console.log(
    await readFile(statusPath, 'utf8').catch(
      () => 'A sincronização ainda não executou.',
    ),
  );
} else {
  const unlock = await acquireLocalLock(join(storage, 'sync-daemon.lock'));
  const progress = async (step) => {
    await writeFile(statusPath, JSON.stringify({ state: 'validating', step, checkedAt: new Date().toISOString() }, null, 2));
  };
  const cycle = async () => {
    let result;
    try {
      if ((await stat(logPath).catch(() => null))?.size > 5 * 1024 * 1024)
        await rename(logPath, `${logPath}.previous`);
      await ensureServer();
      const config = JSON.parse(await readFile(configPath, 'utf8'));
      if (!config.enabled) result = { state: 'paused', reason: 'disabled' };
      else {
        if (
          config.branch !== 'release/lmup-local' ||
          (await realpath(config.checkout)) !== resolve(storage, 'publication')
        )
          throw Error(
            'A sincronização exige a cópia isolada e a branch release/lmup-local.',
          );
        result = await synchronize({
          project: config.checkout,
          storage,
          config,
          verify: async () => {
            await progress('dependencies');
            await runNpm(
              config.checkout,
              config.npmCli,
              ['ci', '--no-audit', '--no-fund'],
              logPath,
            );
            await progress('audit');
            await auditLocalRelease({
              project: config.checkout,
              storage,
              npmCli: config.npmCli,
              logPath,
            });
            await progress('verify');
            await runNpm(
              config.checkout,
              config.npmCli,
              ['run', 'verify'],
              logPath,
            );
            await progress('pwa');
            await runNpm(
              config.checkout,
              config.npmCli,
              ['run', 'test:pwa'],
              logPath,
            );
            await progress('package');
            await runNpm(
              config.checkout,
              config.npmCli,
              ['run', 'test:package'],
              logPath,
            );
          },
        });
      }
    } catch (error) {
      result = { state: 'error', message: error.message };
    }
    result.checkedAt = new Date().toISOString();
    await writeFile(statusPath, JSON.stringify(result, null, 2));
    await appendFile(logPath, `${JSON.stringify(result)}\n`);
    console.log(JSON.stringify(result));
  };
  try {
    do {
      await cycle();
      if (!process.argv.includes('--daemon')) break;
      await new Promise((done) => setTimeout(done, 5 * 60 * 1000));
    } while (process.argv.includes('--daemon'));
  } finally {
    await unlock();
  }
}
