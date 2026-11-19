// Autoriza o sincronizador local a publicar um commit exato da main.
//
//   npm run app:aprovar -- --pr <número> --head <sha do HEAD aprovado> [--aguardar]
//   npm run app:aprovar -- --status
//   npm run app:aprovar -- --revogar
//
// Antes de gravar, confere no GitHub (gh) que o PR foi integrado na main a
// partir do HEAD aprovado, com os checks obrigatórios verdes nesse HEAD, e,
// no Git, que o commit do merge está na main e tem exatamente a árvore que a
// CI verificou. Grava só a autorização (sync-approval.json, sob publish.lock);
// não compila nem publica. O sincronizador publica no próximo ciclo e consome
// a autorização. Com --aguardar, espera a publicação, confere a integridade
// da versão ativa e a versão servida na porta 5174, e relata.
import { execFile } from 'node:child_process';
import { appendFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { acquireLocalLock } from './local-process-lock.mjs';
import { activeRelease } from './local-release-store.mjs';
import { gitCommand } from './local-sync-core.mjs';
import {
  readApproval,
  revokeApproval,
  writeApproval,
} from './local-sync-approval.mjs';
import { listFiles } from './verify-package.mjs';

const execute = promisify(execFile);
const SHA = /^[a-f0-9]{40}$/;
// Os mesmos checks obrigatórios da regra da main (workflow Verificar LMU).
export const REQUIRED_CHECKS = ['verify (22)', 'verify (24)'];
const NEUTRAL = new Set(['SKIPPED', 'NEUTRAL']);

export function repositoryFromUrl(url) {
  const match =
    /^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(
      String(url ?? ''),
    );
  if (!match)
    throw Error('O remoto da sincronização não é um repositório do GitHub.');
  return `${match[1]}/${match[2]}`;
}

/** Confere o PR integrado e a CI no HEAD aprovado; devolve o commit do merge. */
export function evaluatePullRequest(pr, { head }) {
  const problems = [];
  if (pr?.state !== 'MERGED') problems.push('o PR não foi integrado');
  if (pr?.baseRefName !== 'main')
    problems.push('o PR não foi integrado na main');
  if (pr?.headRefOid !== head)
    problems.push(
      `o HEAD do PR (${pr?.headRefOid ?? 'nenhum'}) não é o aprovado`,
    );
  const commit = pr?.mergeCommit?.oid;
  if (!SHA.test(commit ?? '')) problems.push('o PR não tem commit de merge');
  const checks = (pr?.statusCheckRollup ?? []).map((item) =>
    item.__typename === 'StatusContext'
      ? { name: item.context, result: item.state }
      : {
          name: item.name,
          result: item.status === 'COMPLETED' ? item.conclusion : item.status,
        },
  );
  for (const name of REQUIRED_CHECKS) {
    const runs = checks.filter((check) => check.name === name);
    if (!runs.length) problems.push(`falta o check ${name}`);
    else if (runs.some((check) => check.result !== 'SUCCESS'))
      problems.push(`o check ${name} não passou`);
  }
  for (const check of checks)
    if (
      !REQUIRED_CHECKS.includes(check.name) &&
      check.result !== 'SUCCESS' &&
      !NEUTRAL.has(check.result)
    )
      problems.push(`o check ${check.name} está ${check.result}`);
  if (problems.length)
    throw Error(`Autorização recusada: ${problems.join('; ')}.`);
  return {
    commit,
    checks: checks.map(({ name, result }) => ({ name, result })),
  };
}

/** O merge está na main e publica exatamente a árvore verificada no HEAD. */
export async function verifyMergeBinding(git, { commit, head, url }) {
  // A ponta da main vem do ls-remote, não do FETCH_HEAD: o FETCH_HEAD é
  // compartilhado por qualquer fetch nesse repositório (outra aprovação, o
  // autor no terminal) e pode ser lido truncado ou de outra busca. A busca
  // vem depois e só traz objetos; como a main só avança, contém essa ponta.
  const [main] = (
    await git('ls-remote', '--exit-code', url, 'refs/heads/main')
  ).split(/\s+/);
  if (!SHA.test(main ?? ''))
    throw Error('Autorização recusada: não foi possível ler a main do remoto.');
  await git(
    'fetch',
    '--no-tags',
    '--no-write-fetch-head',
    url,
    'refs/heads/main',
  );
  const ancestor = async (older, newer, message) => {
    try {
      await git('merge-base', '--is-ancestor', older, newer);
    } catch (error) {
      if (error.code === 1)
        throw Error(`Autorização recusada: ${message}.`, { cause: error });
      throw error;
    }
  };
  await ancestor(commit, main, 'o commit do merge não está na main');
  await ancestor(head, commit, 'o HEAD aprovado não faz parte do merge');
  const tree = await git('rev-parse', `${commit}^{tree}`);
  if (tree !== (await git('rev-parse', `${head}^{tree}`)))
    throw Error(
      'Autorização recusada: o merge não tem a mesma árvore que a CI verificou no HEAD.',
    );
  return tree;
}

async function readConfig(storage) {
  try {
    return JSON.parse(
      await readFile(join(storage, 'sync-config.json'), 'utf8'),
    );
  } catch (error) {
    if (error.code === 'ENOENT')
      throw Error(
        'Sincronização não instalada aqui. Execute na pasta da instalação (com .local-app) ou defina LMU_INSTALLATION_PROJECT.',
        { cause: error },
      );
    throw error;
  }
}

async function log(storage, event) {
  await appendFile(
    join(storage, 'sync.log'),
    `${JSON.stringify({ ...event, at: new Date().toISOString() })}\n`,
  );
}

const ghView = async (repository, number) =>
  JSON.parse(
    (
      await execute(
        'gh',
        [
          'pr',
          'view',
          String(number),
          '--repo',
          repository,
          '--json',
          'number,url,state,baseRefName,headRefOid,mergeCommit,mergedAt,statusCheckRollup',
        ],
        { windowsHide: true, timeout: 60_000, maxBuffer: 4 * 1024 * 1024 },
      )
    ).stdout,
  );

export async function approve({
  project,
  storage,
  pr,
  head,
  view = ghView,
  git = (...args) => gitCommand(project, args),
  now = Date.now(),
}) {
  if (!Number.isSafeInteger(pr) || pr < 1)
    throw Error('Informe --pr <número>.');
  if (!SHA.test(head ?? ''))
    throw Error(
      'Informe --head com o SHA completo (40 caracteres) do HEAD aprovado.',
    );
  const config = await readConfig(storage);
  if (config.branch !== 'main')
    throw Error('A sincronização não está na main.');
  const { commit, checks } = evaluatePullRequest(
    await view(repositoryFromUrl(config.url), pr),
    { head },
  );
  // A consulta à rede e ao Git fica fora da trava, para não segurar um ciclo
  // do sincronizador; a trava cobre só a releitura da versão ativa e a gravação.
  const tree = await verifyMergeBinding(git, { commit, head, url: config.url });
  const approval = {
    format: 1,
    commit,
    tree,
    pr: { number: pr, head },
    checks,
    approvedAt: new Date(now).toISOString(),
  };
  const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
  try {
    const active = await activeRelease(storage);
    if (active?.source?.commit === commit && !active.source.dirty)
      return { state: 'already-published', commit, version: active.version };
    await writeApproval(storage, approval);
  } finally {
    await unlock();
  }
  await log(storage, { event: 'approved', commit, pr, head });
  return { state: 'approved', commit, tree };
}

export async function revoke({ storage }) {
  const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
  let previous;
  try {
    previous = await readApproval(storage).catch(() => null);
    await revokeApproval(storage);
  } finally {
    await unlock();
  }
  await log(storage, { event: 'revoked', commit: previous?.commit ?? null });
  return { state: 'revoked', commit: previous?.commit ?? null };
}

const servedRelease = async () => {
  // O fetch do Node não tem cache HTTP: lê sempre o que o servidor entrega.
  const response = await fetch('http://127.0.0.1:5174/release.json', {
    signal: AbortSignal.timeout(5000),
  });
  return response.ok ? response.json() : null;
};

/** Espera a publicação do commit aprovado, valida e relata; para na falha. */
export async function waitForPublication({
  storage,
  commit,
  timeout = 60 * 60 * 1000,
  interval = 15_000,
  served = servedRelease,
  clock = Date.now,
  sleep = (ms) => new Promise((done) => setTimeout(done, ms)),
}) {
  const deadline = clock() + timeout;
  for (;;) {
    const active = await activeRelease(storage);
    if (active?.source?.commit === commit) {
      const info = JSON.parse(
        await readFile(
          join(storage, 'releases', active.id, 'publication.json'),
          'utf8',
        ),
      );
      if (
        JSON.stringify(await listFiles(active.build)) !==
        JSON.stringify(info.files)
      )
        return {
          state: 'invalid',
          commit,
          message: 'Arquivos da versão ativa divergem dos hashes.',
        };
      const release = await served().catch(() => null);
      if (release?.version !== active.version)
        return {
          state: 'invalid',
          commit,
          message: `A porta 5174 serve ${release?.version ?? 'nada'}, não ${active.version}.`,
        };
      return {
        state: 'published',
        commit,
        version: active.version,
        id: active.id,
        files: info.files.length,
      };
    }
    const approval = await readApproval(storage);
    if (approval?.commit !== commit)
      return {
        state: 'superseded',
        commit,
        message: 'A autorização foi revogada ou substituída.',
      };
    if (approval.failure)
      return {
        state: 'failed',
        commit,
        message: approval.failure.message,
        at: approval.failure.at,
      };
    const status = JSON.parse(
      await readFile(join(storage, 'sync-status.json'), 'utf8').catch(
        () => '{}',
      ),
    );
    if (status.state === 'paused')
      return {
        state: 'paused',
        commit,
        message: 'O sincronizador está pausado; a autorização fica aguardando.',
      };
    if (clock() >= deadline) return { state: 'timeout', commit, status };
    await sleep(interval);
  }
}

async function main() {
  const project =
    process.env.LMU_INSTALLATION_PROJECT ||
    fileURLToPath(new URL('../', import.meta.url));
  const storage = join(project, '.local-app');
  const args = process.argv.slice(2);
  const option = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  try {
    if (args.includes('--status')) {
      const status = await readFile(
        join(storage, 'sync-status.json'),
        'utf8',
      ).catch(() => 'null');
      console.log(
        JSON.stringify(
          {
            approval: await readApproval(storage),
            used: JSON.parse(
              await readFile(
                join(storage, 'sync-approval-used.json'),
                'utf8',
              ).catch(() => 'null'),
            ),
            status: JSON.parse(status),
          },
          null,
          2,
        ),
      );
      return;
    }
    if (args.includes('--revogar')) {
      await readConfig(storage);
      console.log(JSON.stringify(await revoke({ storage })));
      return;
    }
    const result = await approve({
      project,
      storage,
      pr: Number(option('--pr')),
      head: option('--head'),
    });
    console.log(JSON.stringify(result));
    if (result.state === 'approved' && args.includes('--aguardar')) {
      const outcome = await waitForPublication({
        storage,
        commit: result.commit,
      });
      console.log(JSON.stringify(outcome));
      if (outcome.state !== 'published') process.exitCode = 1;
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
