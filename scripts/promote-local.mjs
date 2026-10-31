import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { gitCommand } from './local-sync-core.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => gitCommand(project, args);
const commit = process.argv.find((arg) => /^[a-f0-9]{40}$/.test(arg));
if (!process.argv.includes('--aprovar') || !commit)
  throw Error(
    'A promoção exige aprovação explícita: npm run app:promover -- --aprovar COMMIT_COMPLETO',
  );
async function guard() {
  if (
    (await git('branch', '--show-current')) !== 'feat/home-rpg-reference' ||
    (await git('rev-parse', 'HEAD')) !== commit ||
    (await git('status', '--porcelain', '--untracked-files=all'))
  )
    throw Error(
      'A promoção exige o commit escolhido na branch de desenvolvimento, sem alterações pendentes.',
    );
}
await guard();
const npmCli = process.env.npm_execpath;
if (!npmCli) throw Error('Execute pelo comando npm run app:promover.');
for (const script of ['verify', 'audit:security', 'test:pwa']) {
  execFileSync(process.execPath, [npmCli, 'run', script], {
    cwd: project,
    stdio: 'inherit',
    windowsHide: true,
    env: {
      ...process.env,
      HUSKY: '0',
      LMU_BROWSER_CHANNEL:
        process.env.LMU_BROWSER_CHANNEL ||
        (process.platform === 'win32' ? 'chrome' : ''),
    },
  });
}
await guard();
await git(
  'fetch',
  '--no-tags',
  'origin',
  'feat/home-rpg-reference',
  'release/lmup-local',
);
const publishedDev = await git(
  'ls-remote',
  '--heads',
  'origin',
  'feat/home-rpg-reference',
);
if (publishedDev.split(/\s+/)[0] !== commit)
  throw Error(
    'Publique primeiro esse mesmo commit na branch de desenvolvimento do GitHub.',
  );
// Git rejects a non-fast-forward publication. Never force the stable branch.
await git('push', 'origin', `${commit}:refs/heads/release/lmup-local`);
console.log(
  `Versão aprovada: ${commit}. O sincronizador buscará a branch estável.`,
);
