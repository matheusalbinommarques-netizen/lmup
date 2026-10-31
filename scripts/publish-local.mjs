import { readFile, writeFile, mkdir, open, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { publishBuild, activeRelease } from './local-release-store.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';

const project =
  process.env.LMU_INSTALLATION_PROJECT ||
  fileURLToPath(new URL('../', import.meta.url));
const storage = join(project, '.local-app');
const args = new Set(process.argv.slice(2));
const git = (...args) =>
  execFileSync('git', args, {
    cwd: project,
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
async function configuration() {
  try {
    return JSON.parse(await readFile(join(storage, 'config.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { enabled: false };
    throw error;
  }
}
function cleanSource() {
  const modified = git('diff', '--name-only', 'HEAD');
  const untracked = git('ls-files', '--others', '--exclude-standard');
  if (modified || untracked)
    throw Error(
      'Há código ainda não commitado. A versão publicada foi mantida. Conclua o commit e publique novamente.',
    );
}
async function serverStatus() {
  try {
    const response = await fetch('http://127.0.0.1:5174/__lmup/status', {
      signal: AbortSignal.timeout(1500),
    });
    const result = await response.json().catch(() => null);
    if (
      result?.service !== 'lmup-local-publications' ||
      result.installation !==
        createHash('sha256').update(resolve(storage)).digest('hex')
    )
      throw Error(
        'A porta do app está sendo usada por outro servidor. A versão existente não foi interrompida.',
      );
    return result;
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return null;
    throw error;
  }
}
export async function ensureServer() {
  if (await serverStatus()) return;
  const log = await open(join(storage, 'server.log'), 'a');
  const child = spawn(
    process.execPath,
    [fileURLToPath(new URL('./serve-static.mjs', import.meta.url))],
    {
      cwd: project,
      env: {
        ...process.env,
        LMU_PREVIEW_PORT: '5174',
        LMU_PUBLICATION_ROOT: storage,
      },
      detached: true,
      windowsHide: true,
      stdio: ['ignore', log.fd, log.fd],
    },
  );
  child.unref();
  await log.close();
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((done) => setTimeout(done, 100));
    if (await serverStatus()) return;
  }
  throw Error(
    'A publicação está salva, mas o servidor não abriu. Confira .local-app/server.log.',
  );
}
async function main() {
  try {
    await mkdir(storage, { recursive: true });
    if (
      (await lstat(storage)).isSymbolicLink() ||
      !(await lstat(storage)).isDirectory()
    )
      throw Error('Pasta local de publicação inválida.');
    if (args.has('--status')) {
      const active = await activeRelease(storage);
      console.log(
        JSON.stringify(
          {
            enabled: (await configuration()).enabled,
            version: active?.version ?? null,
            source: active?.source ?? null,
          },
          null,
          2,
        ),
      );
    } else if (args.has('--serve')) {
      await ensureServer();
      console.log('Aplicativo disponível no mesmo endereço de sempre.');
    } else {
      if (args.has('--after-commit') && !(await configuration()).enabled)
        process.exit(0);
      const sync = JSON.parse(
        await readFile(join(storage, 'sync-config.json'), 'utf8').catch(
          (error) => {
            if (error.code === 'ENOENT') return '{}';
            throw error;
          },
        ),
      );
      if (sync.enabled)
        throw Error(
          'A fonte oficial é a branch estável. Use npm run app:sincronizar; commits de desenvolvimento não são publicados diretamente.',
        );
      const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
      try {
        const commit = git('rev-parse', 'HEAD');
        if (!args.has('--setup')) {
          cleanSource();
          console.log(
            'Conferindo a versão antes de disponibilizar no aplicativo…',
          );
          execFileSync(
            process.platform === 'win32' ? 'cmd.exe' : 'npm',
            process.platform === 'win32'
              ? ['/d', '/s', '/c', 'npm run verify']
              : ['run', 'verify'],
            { cwd: project, stdio: 'inherit', windowsHide: true },
          );
          cleanSource();
          if (git('rev-parse', 'HEAD') !== commit)
            throw Error(
              'Outro commit chegou durante a verificação. Execute npm run app:publicar para conferir a versão mais recente.',
            );
        }
        const source = {
          commit,
          dirty: !!git('status', '--porcelain'),
          channel: 'local-commits',
        };
        const release = await publishBuild(
          join(project, 'build'),
          storage,
          source,
        );
        if (args.has('--setup'))
          await writeFile(
            join(storage, 'config.json'),
            JSON.stringify({ enabled: true }, null, 2),
          );
        await ensureServer();
        console.log(
          `Versão ${release.version} disponível no aplicativo. Ele avisará quando a atualização estiver pronta.`,
        );
      } finally {
        await unlock();
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();
