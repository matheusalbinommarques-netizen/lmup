import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { gitCommand } from './local-sync-core.mjs';
import { publishBuild } from './local-release-store.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';
import {
  APPROVAL_FILE,
  markApprovalFailed,
  readApproval,
  validateApproval,
  writeApproval,
} from './local-sync-approval.mjs';
import {
  REQUIRED_CHECKS,
  approve,
  evaluatePullRequest,
  repositoryFromUrl,
  revoke,
  verifyMergeBinding,
  waitForPublication,
} from './approve-local.mjs';

const HEAD = 'b'.repeat(40);
const MERGE = 'c'.repeat(40);
const run = (name, conclusion = 'SUCCESS', status = 'COMPLETED') => ({
  __typename: 'CheckRun',
  name,
  status,
  conclusion,
});
const merged = (extra = {}) => ({
  number: 9,
  state: 'MERGED',
  baseRefName: 'main',
  headRefOid: HEAD,
  mergeCommit: { oid: MERGE },
  statusCheckRollup: REQUIRED_CHECKS.map((name) => run(name)),
  ...extra,
});

test('PR integrado na main a partir do HEAD aprovado, com os checks obrigatórios verdes', () => {
  const result = evaluatePullRequest(
    merged({
      statusCheckRollup: [
        ...REQUIRED_CHECKS.map((name) => run(name)),
        run('opcional', 'SKIPPED'),
      ],
    }),
    { head: HEAD },
  );
  assert.equal(result.commit, MERGE);
  assert.deepEqual(
    result.checks.map((check) => check.name),
    [...REQUIRED_CHECKS, 'opcional'],
  );
});

test('recusa PR aberto, outra base, HEAD diferente do aprovado, sem merge ou com CI incompleta', () => {
  const required = REQUIRED_CHECKS.map((name) => run(name));
  for (const [pr, message] of [
    [merged({ state: 'OPEN', mergeCommit: null }), /não foi integrado/],
    [merged({ baseRefName: 'develop' }), /na main/],
    // Um commit novo no PR depois da aprovação não herda a autorização.
    [merged({ headRefOid: 'd'.repeat(40) }), /não é o aprovado/],
    [merged({ mergeCommit: { oid: 'curto' } }), /commit de merge/],
    [
      merged({ statusCheckRollup: [run('verify (22)')] }),
      /falta o check verify \(24\)/,
    ],
    [
      merged({
        statusCheckRollup: [run('verify (22)'), run('verify (24)', 'FAILURE')],
      }),
      /verify \(24\) não passou/,
    ],
    [
      merged({
        statusCheckRollup: [
          run('verify (22)'),
          run('verify (24)', null, 'IN_PROGRESS'),
        ],
      }),
      /verify \(24\) não passou/,
    ],
    [
      merged({ statusCheckRollup: [...required, run('outro', 'CANCELLED')] }),
      /outro está CANCELLED/,
    ],
    [null, /não foi integrado/],
  ])
    assert.throws(() => evaluatePullRequest(pr, { head: HEAD }), message);
});

test('repositório do GitHub vem do remoto configurado na sincronização', () => {
  assert.equal(
    repositoryFromUrl('https://github.com/dono/lmup.git'),
    'dono/lmup',
  );
  assert.equal(repositoryFromUrl('git@github.com:dono/lmup.git'), 'dono/lmup');
  assert.throws(
    () => repositoryFromUrl('https://example.com/dono/lmup.git'),
    /GitHub/,
  );
});

test('autorização válida exige formato, SHAs completos e PR', () => {
  const valid = {
    format: 1,
    commit: MERGE,
    tree: 'e'.repeat(40),
    pr: { number: 9, head: HEAD },
    approvedAt: '2026-11-19T12:00:00.000Z',
  };
  assert.equal(validateApproval(valid), valid);
  for (const broken of [
    { ...valid, format: 2 },
    { ...valid, commit: MERGE.slice(0, 7) },
    { ...valid, tree: undefined },
    { ...valid, pr: { number: 0, head: HEAD } },
    { ...valid, pr: { number: 9 } },
    { ...valid, approvedAt: '' },
    { ...valid, failure: { message: '' } },
  ])
    assert.throws(() => validateApproval(broken), /inválida/);
});

// Repositório real: main com um merge do PR atualizado (mesma árvore do HEAD)
// e um merge de um PR desatualizado (árvore diferente da verificada).
async function repository(work) {
  const temporary = await mkdtemp(join(tmpdir(), 'lmup-approval-'));
  const git = (cwd, ...args) => gitCommand(cwd, args);
  const remote = join(temporary, 'remote.git');
  const seed = join(temporary, 'seed');
  const project = join(temporary, 'project');
  const storage = join(project, '.local-app');
  try {
    await git(temporary, 'init', '--bare', remote);
    await mkdir(seed);
    await git(seed, 'init', '-b', 'main');
    await git(seed, 'config', 'user.name', 'LMUP Test');
    await git(seed, 'config', 'user.email', 'test@example.invalid');
    const commit = async (file, value) => {
      await writeFile(join(seed, file), value);
      await git(seed, 'add', file);
      await git(seed, '-c', 'core.hooksPath=', 'commit', '-m', value);
      return git(seed, 'rev-parse', 'HEAD');
    };
    const mergeInto = async (branch) => {
      await git(seed, 'switch', 'main');
      await git(
        seed,
        '-c',
        'core.hooksPath=',
        'merge',
        '--no-ff',
        '-m',
        `merge ${branch}`,
        branch,
      );
      return git(seed, 'rev-parse', 'HEAD');
    };
    await commit('a.txt', 'base');
    await git(seed, 'switch', '-c', 'atualizado');
    const head = await commit('b.txt', 'pr atualizado');
    const merge = await mergeInto('atualizado');
    await git(seed, 'switch', '-c', 'desatualizado', `${merge}~1`);
    const staleHead = await commit('c.txt', 'pr desatualizado');
    const staleMerge = await mergeInto('desatualizado');
    await git(seed, 'switch', '-c', 'fora-da-main');
    const outside = await commit('d.txt', 'fora');
    await git(seed, 'remote', 'add', 'origin', remote);
    await git(seed, 'push', 'origin', 'main', 'fora-da-main');
    await git(temporary, 'clone', '--branch', 'main', remote, project);
    await mkdir(storage);
    await writeFile(
      join(storage, 'sync-config.json'),
      JSON.stringify({ branch: 'main', url: remote, remote: 'origin' }),
    );
    await work({
      temporary,
      project,
      storage,
      remote,
      head,
      merge,
      staleHead,
      staleMerge,
      outside,
      git: (...args) => git(project, ...args),
    });
  } finally {
    const inside = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside));
    await rm(temporary, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}

test('merge na main com a árvore verificada é aceito; desatualizado ou fora da main é recusado', () =>
  repository(
    async ({ git, remote, head, merge, staleHead, staleMerge, outside }) => {
      const tree = await verifyMergeBinding(git, {
        commit: merge,
        head,
        url: remote,
      });
      assert.equal(tree, await git('rev-parse', `${head}^{tree}`));
      await assert.rejects(
        verifyMergeBinding(git, {
          commit: staleMerge,
          head: staleHead,
          url: remote,
        }),
        /mesma árvore/,
      );
      await assert.rejects(
        verifyMergeBinding(git, {
          commit: merge,
          head: staleHead,
          url: remote,
        }),
        /não faz parte do merge/,
      );
      await git('fetch', remote, 'fora-da-main');
      await assert.rejects(
        verifyMergeBinding(git, {
          commit: outside,
          head: outside,
          url: remote,
        }),
        /não está na main/,
      );
    },
  ));

const view = (head, merge) => async (repository, number) => {
  assert.equal(number, 9);
  return merged({ headRefOid: head, mergeCommit: { oid: merge } });
};

test('aprovação grava o commit exato e a árvore de forma atômica e registra no log', () =>
  repository(async ({ project, storage, remote, head, merge, git }) => {
    await writeFile(
      join(storage, 'sync-config.json'),
      JSON.stringify({ branch: 'main', url: remote }),
    );
    // O remoto local não é do GitHub: a consulta ao PR recebe o nome extraído.
    await assert.rejects(
      approve({ project, storage, pr: 9, head, view: view(head, merge) }),
      /GitHub/,
    );
    const github = 'https://github.com/dono/lmup.git';
    await writeFile(
      join(storage, 'sync-config.json'),
      JSON.stringify({ branch: 'main', url: github }),
    );
    const remoteGit = async (...args) =>
      args[0] === 'fetch'
        ? git('fetch', '--no-tags', remote, 'refs/heads/main')
        : git(...args);
    const result = await approve({
      project,
      storage,
      pr: 9,
      head,
      view: async (repository, number) => {
        assert.equal(repository, 'dono/lmup');
        return view(head, merge)(repository, number);
      },
      git: remoteGit,
    });
    assert.equal(result.state, 'approved');
    const saved = await readApproval(storage);
    assert.equal(saved.commit, merge);
    assert.equal(saved.tree, await git('rev-parse', `${merge}^{tree}`));
    assert.deepEqual(saved.pr, { number: 9, head });
    assert.deepEqual(
      (await readdir(storage)).filter((name) => name.endsWith('.tmp')),
      [],
    );
    assert.match(
      await readFile(join(storage, 'sync.log'), 'utf8'),
      /"event":"approved"/,
    );
    // Revogar remove a autorização vigente.
    assert.equal((await revoke({ storage })).commit, merge);
    assert.equal(await readApproval(storage), null);
  }));

test('argumentos incompletos ou HEAD abreviado são recusados antes de consultar o GitHub', () =>
  repository(async ({ project, storage, head }) => {
    const never = async () => assert.fail('não deveria consultar o GitHub');
    await assert.rejects(
      approve({ project, storage, pr: NaN, head, view: never }),
      /--pr/,
    );
    await assert.rejects(
      approve({ project, storage, pr: 9, head: head.slice(0, 7), view: never }),
      /SHA completo/,
    );
    await rm(join(storage, 'sync-config.json'));
    await assert.rejects(
      approve({ project, storage, pr: 9, head, view: never }),
      /não instalada/,
    );
  }));

test('com um ciclo ou publicação em andamento a aprovação é recusada sem gravar nada', () =>
  repository(async ({ project, storage, remote, head, merge, git }) => {
    await writeFile(
      join(storage, 'sync-config.json'),
      JSON.stringify({
        branch: 'main',
        url: 'https://github.com/dono/lmup.git',
      }),
    );
    const remoteGit = async (...args) =>
      args[0] === 'fetch'
        ? git('fetch', '--no-tags', remote, 'refs/heads/main')
        : git(...args);
    const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
    try {
      await assert.rejects(
        approve({
          project,
          storage,
          pr: 9,
          head,
          view: view(head, merge),
          git: remoteGit,
        }),
        /andamento/,
      );
      await assert.rejects(revoke({ storage }), /andamento/);
    } finally {
      await unlock();
    }
    assert.equal(await readApproval(storage), null);
    // Duas aprovações simultâneas: no máximo uma grava, e o arquivo fica íntegro.
    const outcomes = await Promise.allSettled([
      approve({
        project,
        storage,
        pr: 9,
        head,
        view: view(head, merge),
        git: remoteGit,
      }),
      approve({
        project,
        storage,
        pr: 9,
        head,
        view: view(head, merge),
        git: remoteGit,
      }),
    ]);
    assert.ok(outcomes.some((outcome) => outcome.status === 'fulfilled'));
    for (const outcome of outcomes)
      if (outcome.status === 'rejected')
        assert.match(outcome.reason.message, /andamento/);
    assert.equal((await readApproval(storage)).commit, merge);
  }));

// Espera e validação depois da aprovação.
async function installed(work) {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-wait-'));
  try {
    const build = join(storage, 'candidate');
    await mkdir(build);
    for (const [name, value] of Object.entries({
      'release.json': JSON.stringify({
        version: '3333333333333333',
        schema: 5,
        protocol: 1,
      }),
      '200.html': 'ok',
      'sw.js': 'ok',
      'manifest.webmanifest': '{}',
    }))
      await writeFile(join(build, name), value);
    await work({ storage, build });
  } finally {
    await rm(storage, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}
const approval = (commit) => ({
  format: 1,
  commit,
  tree: 'e'.repeat(40),
  pr: { number: 9, head: HEAD },
  approvedAt: '2026-11-19T12:00:00.000Z',
});

test('espera a publicação do commit aprovado e confere hashes e a versão servida', () =>
  installed(async ({ storage, build }) => {
    await writeApproval(storage, approval(MERGE));
    let pauses = 0;
    const result = await waitForPublication({
      storage,
      commit: MERGE,
      served: async () => ({ version: '3333333333333333' }),
      // O sincronizador publica (e consome a autorização) durante a espera.
      sleep: async () => {
        pauses++;
        await publishBuild(build, storage, { commit: MERGE, dirty: false });
        await rm(join(storage, APPROVAL_FILE));
      },
    });
    assert.equal(pauses, 1);
    assert.equal(result.state, 'published');
    assert.equal(result.version, '3333333333333333');
    assert.equal(
      (
        await waitForPublication({
          storage,
          commit: MERGE,
          served: async () => ({ version: 'outra' }),
        })
      ).state,
      'invalid',
    );
    await writeFile(
      join(storage, 'releases', result.id, 'build', 'sw.js'),
      'alterado',
    );
    assert.match(
      (
        await waitForPublication({
          storage,
          commit: MERGE,
          served: async () => ({ version: '3333333333333333' }),
        })
      ).message,
      /hashes/,
    );
  }));

test('espera para na falha, na revogação, com o sincronizador pausado ou no prazo', () =>
  installed(async ({ storage }) => {
    const wait = (extra = {}) =>
      waitForPublication({
        storage,
        commit: MERGE,
        served: async () => null,
        sleep: async () => {},
        ...extra,
      });
    await writeApproval(storage, approval(MERGE));
    let now = 0;
    assert.equal(
      (await wait({ timeout: 5, clock: () => (now += 3) })).state,
      'timeout',
    );
    await writeFile(
      join(storage, 'sync-status.json'),
      JSON.stringify({ state: 'paused' }),
    );
    assert.equal((await wait()).state, 'paused');
    await markApprovalFailed(
      storage,
      approval(MERGE),
      'npm run test:pwa falhou (1)',
    );
    const failed = await wait();
    assert.equal(failed.state, 'failed');
    assert.match(failed.message, /test:pwa/);
    await writeApproval(storage, approval('f'.repeat(40)));
    assert.equal((await wait()).state, 'superseded');
    await rm(join(storage, APPROVAL_FILE));
    assert.equal((await wait()).state, 'superseded');
  }));
