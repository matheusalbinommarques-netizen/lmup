import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { gitCommand, runGit, synchronize } from './local-sync-core.mjs';
import { fakeGit, windows } from './git-test-fixtures.mjs';
import { publishBuild, activeRelease } from './local-release-store.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';
import {
  APPROVAL_FILE,
  APPROVAL_USED_FILE,
  readApproval,
  writeApproval,
} from './local-sync-approval.mjs';
import { evaluateAudit } from './local-security-policy.mjs';
import {
  REVIEWED_MODERATE,
  addEntry,
  advisory,
  picomatchException,
  picomatchReport,
  upstreamOk,
  upstreamPatched,
} from './audit-test-fixtures.mjs';

async function fixture(work) {
  const temporary = await mkdtemp(join(tmpdir(), 'lmup-sync-'));
  const seed = join(temporary, 'seed'),
    project = join(temporary, 'checkout');
  const remote = join(temporary, 'remote.git'),
    storage = join(temporary, 'installed');
  await mkdir(seed);
  await mkdir(storage);
  const git = (cwd, ...args) => gitCommand(cwd, args);
  try {
    await git(temporary, 'init', '--bare', remote);
    await git(seed, 'init', '-b', 'main');
    await git(seed, 'config', 'user.name', 'LMUP Test');
    await git(seed, 'config', 'user.email', 'test@example.invalid');
    async function commit(cwd, value) {
      await writeFile(join(cwd, 'task.txt'), value);
      await git(cwd, 'add', 'task.txt');
      await git(cwd, '-c', 'core.hooksPath=', 'commit', '-m', value);
      return git(cwd, 'rev-parse', 'HEAD');
    }
    const first = await commit(seed, 'first');
    await git(seed, 'remote', 'add', 'github', remote);
    await git(seed, 'push', 'github', 'main');
    await git(temporary, 'clone', '--branch', 'main', remote, project);
    await git(project, 'remote', 'rename', 'origin', 'github');
    await git(project, 'config', 'user.name', 'LMUP Test');
    await git(project, 'config', 'user.email', 'test@example.invalid');
    await git(project, 'config', 'core.excludesFile', '');
    await writeFile(join(project, '.git/info/exclude'), 'build/\n');
    async function build(version) {
      const directory = join(project, 'build');
      await mkdir(directory, { recursive: true });
      for (const [name, value] of Object.entries({
        'release.json': JSON.stringify({ version, schema: 5, protocol: 1 }),
        '200.html': version,
        'sw.js': version,
        'manifest.webmanifest': '{}',
      }))
        await writeFile(join(directory, name), value);
      return directory;
    }
    await publishBuild(await build('1111111111111111'), storage, {
      commit: first,
      dirty: false,
    });
    const config = { remote: 'github', branch: 'main', url: remote };
    let calls = 0;
    const options = {
      project,
      storage,
      config,
      verify: async () => {
        calls++;
        await build('2222222222222222');
      },
    };
    const advance = async (value = 'second') => {
      const sha = await commit(seed, value);
      await git(seed, 'push', 'github', 'main');
      return sha;
    };
    // O que o app:aprovar grava depois de conferir PR, CI e merge.
    const approve = async (sha, extra = {}) =>
      writeApproval(storage, {
        format: 1,
        commit: sha,
        tree: await git(seed, 'rev-parse', `${sha}^{tree}`),
        pr: { number: 7, head: sha },
        approvedAt: '2026-11-19T12:00:00.000Z',
        ...extra,
      });
    await work({
      options,
      project,
      storage,
      git,
      commit,
      advance,
      approve,
      first,
      calls: () => calls,
    });
  } finally {
    const inside = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside));
    await rm(temporary, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}

test('recebe a main sem publicar; só o commit autorizado é testado, publicado e consome a autorização', () =>
  fixture(
    async ({
      options,
      advance,
      approve,
      calls,
      project,
      git,
      storage,
      first,
    }) => {
      assert.equal((await synchronize(options)).state, 'current');
      assert.equal(calls(), 0);
      const target = await advance();
      for (let cycle = 0; cycle < 2; cycle++)
        assert.deepEqual(await synchronize(options), {
          state: 'awaiting-approval',
          commit: target,
          approved: null,
        });
      // A cópia recebeu a main, mas nada foi compilado nem publicado.
      assert.equal(await git(project, 'rev-parse', 'HEAD'), target);
      assert.equal((await activeRelease(storage)).source.commit, first);
      assert.equal(calls(), 0);
      await approve(target);
      const result = await synchronize(options);
      assert.equal(result.state, 'published');
      assert.equal(result.pr, 7);
      const active = await activeRelease(storage);
      assert.equal(active.source.commit, target);
      assert.equal(active.source.pr, 7);
      assert.equal(calls(), 1);
      assert.equal(await readApproval(storage), null);
      const used = JSON.parse(
        await readFile(join(storage, APPROVAL_USED_FILE), 'utf8'),
      );
      assert.equal(used.commit, target);
      assert.equal(used.release.id, active.id);
      assert.equal((await synchronize(options)).state, 'current');
      assert.equal(calls(), 1);
    },
  ));

test('autorização obsoleta ou de outro commit nunca é herdada', () =>
  fixture(async ({ options, advance, approve, calls, storage, first }) => {
    const second = await advance('second');
    await approve(second);
    const third = await advance('third');
    assert.deepEqual(await synchronize(options), {
      state: 'awaiting-approval',
      commit: third,
      approved: second,
    });
    assert.equal(calls(), 0);
    assert.equal((await activeRelease(storage)).source.commit, first);
    // Aprovar um commit antigo, já publicado, também não libera a main.
    await approve(first);
    assert.equal((await synchronize(options)).state, 'awaiting-approval');
    assert.equal(calls(), 0);
    await approve(third);
    assert.equal((await synchronize(options)).state, 'published');
    // O segundo commit nunca foi publicado.
    assert.equal((await activeRelease(storage)).source.commit, third);
    assert.equal(calls(), 1);
  }));

test('árvore diferente da autorizada bloqueia mesmo com o commit certo', () =>
  fixture(async ({ options, advance, approve, calls, storage, first }) => {
    const target = await advance();
    await approve(target, { tree: 'f'.repeat(40) });
    assert.deepEqual(await synchronize(options), {
      state: 'waiting',
      reason: 'approval-tree-mismatch',
    });
    assert.equal(calls(), 0);
    assert.equal((await activeRelease(storage)).source.commit, first);
  }));

test('autorização corrompida ou incompleta bloqueia sem publicar', () =>
  fixture(async ({ options, advance, calls, storage, first }) => {
    const target = await advance();
    for (const content of [
      'não é json',
      JSON.stringify({ format: 1, commit: target }),
      JSON.stringify({
        format: 2,
        commit: target,
        tree: 'a'.repeat(40),
        pr: { number: 1, head: target },
        approvedAt: 'x',
      }),
    ]) {
      await writeFile(join(storage, APPROVAL_FILE), content);
      await assert.rejects(
        synchronize(options),
        /Autorização de publicação inválida/,
      );
      assert.equal((await activeRelease(storage)).source.commit, first);
    }
    assert.equal(calls(), 0);
  }));

test('interrompido depois de trocar o ponteiro: o ciclo seguinte reconhece e consome, sem recompilar', () =>
  fixture(async ({ options, advance, approve, calls, storage }) => {
    const target = await advance();
    await approve(target);
    // Simula a queda do processo entre a publicação e o consumo.
    let interrupted;
    await assert.rejects(
      synchronize({
        ...options,
        publish: async (...args) => {
          interrupted = await publishBuild(...args);
          throw Error('processo interrompido');
        },
      }),
      /interrompido/,
    );
    assert.equal((await activeRelease(storage)).id, interrupted.id);
    assert.equal((await synchronize(options)).state, 'current');
    assert.equal(await readApproval(storage), null);
    assert.equal(
      JSON.parse(await readFile(join(storage, APPROVAL_USED_FILE), 'utf8'))
        .release.id,
      interrupted.id,
    );
    assert.equal(calls(), 1);
  }));

test('arquivo local sem commit é preservado e impede sincronização', () =>
  fixture(async ({ options, advance, project, first, git, calls }) => {
    await advance();
    await writeFile(join(project, 'minhas-notas.txt'), 'preservar');
    assert.equal((await synchronize(options)).reason, 'local-changes');
    assert.equal(await git(project, 'rev-parse', 'HEAD'), first);
    assert.equal(
      await readFile(join(project, 'minhas-notas.txt'), 'utf8'),
      'preservar',
    );
    assert.equal(calls(), 0);
  }));

test('histórico divergente não faz merge nem remove commits locais', () =>
  fixture(async ({ options, advance, project, commit, git, calls }) => {
    await advance();
    const local = await commit(project, 'local');
    assert.equal(
      (await synchronize(options)).reason,
      'diverged-or-local-ahead',
    );
    assert.equal(await git(project, 'rev-parse', 'HEAD'), local);
    assert.equal(calls(), 0);
  }));

test('falha de testes mantém a publicação e para até uma nova autorização', () =>
  fixture(async ({ options, advance, approve, storage, calls }) => {
    const target = await advance();
    await approve(target);
    const previous = (await activeRelease(storage)).id;
    await assert.rejects(
      synchronize({
        ...options,
        verify: async () => {
          throw Error('teste falhou');
        },
      }),
      /teste falhou/,
    );
    assert.equal((await activeRelease(storage)).id, previous);
    assert.equal((await readApproval(storage)).failure.message, 'teste falhou');
    // Sem nova autorização, não repete o ciclo nem recompila.
    assert.deepEqual(await synchronize(options), {
      state: 'approval-failed',
      commit: target,
      message: 'teste falhou',
    });
    assert.equal(calls(), 0);
    await approve(target);
    assert.equal((await synchronize(options)).state, 'published');
    assert.equal(calls(), 1);
  }));

test('falha de publicação mantém o ponteiro anterior', () =>
  fixture(async ({ options, advance, approve, storage }) => {
    await approve(await advance());
    const previous = (await activeRelease(storage)).id;
    await assert.rejects(
      synchronize({
        ...options,
        publish: async () => {
          throw Error('cópia falhou');
        },
      }),
      /cópia falhou/,
    );
    assert.equal((await activeRelease(storage)).id, previous);
    assert.equal((await synchronize(options)).state, 'approval-failed');
  }));

test('edição durante os testes impede publicar o resultado', () =>
  fixture(async ({ options, advance, approve, project, storage }) => {
    await approve(await advance());
    const previous = (await activeRelease(storage)).id;
    const result = await synchronize({
      ...options,
      verify: async () => {
        await writeFile(join(project, 'task.txt'), 'nova edição');
      },
    });
    assert.equal(result.reason, 'local-changes');
    assert.equal((await activeRelease(storage)).id, previous);
    // Não é falha do commit: a autorização segue válida.
    assert.equal((await readApproval(storage)).failure, undefined);
  }));

test('branch diferente e remoto alterado bloqueiam sem trocar o código', () =>
  fixture(async ({ options, project, git }) => {
    await git(project, 'switch', '-c', 'working');
    assert.equal((await synchronize(options)).reason, 'branch-different');
    await git(project, 'remote', 'set-url', 'github', 'changed');
    assert.equal((await synchronize(options)).reason, 'remote-changed');
  }));

test('trava compartilhada impede publicar simultaneamente ao hook', () =>
  fixture(async ({ options, storage }) => {
    const unlock = await acquireLocalLock(join(storage, 'publish.lock'));
    try {
      await assert.rejects(synchronize(options), /andamento/);
    } finally {
      await unlock();
    }
  }));

// Auditoria com a exceção compartilhada da CI (#115) dentro do ciclo real:
// aprovada publica a versão inteira; reprovada não troca nem altera a ativa.
const nov = Date.parse('2026-11-18T12:00:00Z');
const audited = (options, scenario) => ({
  ...options,
  verify: async () => {
    evaluateAudit({
      report: picomatchReport(),
      exitCode: 1,
      exceptions: [picomatchException()],
      upstream: upstreamOk(),
      commit: 'candidate',
      lockHash: 'lock',
      now: nov,
      ...scenario,
    });
    await options.verify();
  },
});
const servedFiles = async (release) =>
  Object.fromEntries(
    await Promise.all(
      ['release.json', '200.html', 'sw.js', 'manifest.webmanifest'].map(
        async (name) => [
          name,
          await readFile(join(release.build, name), 'utf8'),
        ],
      ),
    ),
  );

test('auditoria só com o picomatch autorizado publica a versão inteira', () =>
  fixture(async ({ options, advance, approve, storage, calls }) => {
    const target = await advance();
    await approve(target);
    assert.equal((await synchronize(audited(options, {}))).state, 'published');
    const active = await activeRelease(storage);
    assert.equal(active.source.commit, target);
    assert.deepEqual(await servedFiles(active), {
      'release.json': JSON.stringify({
        version: '2222222222222222',
        schema: 5,
        protocol: 1,
      }),
      '200.html': '2222222222222222',
      'sw.js': '2222222222222222',
      'manifest.webmanifest': '{}',
    });
    assert.equal(calls(), 1);
  }));

test('auditoria reprovada não substitui nem altera a versão instalada', () =>
  fixture(async ({ options, advance, approve, storage, calls }) => {
    const target = await advance();
    const before = await activeRelease(storage);
    const files = await servedFiles(before);
    const moderate = addEntry(picomatchReport(), 'minimatch', 'moderate', [
      advisory(REVIEWED_MODERATE, 'moderate', 'minimatch'),
    ]);
    const otherHigh = addEntry(picomatchReport(), 'cookie', 'high', [
      advisory(
        'https://github.com/advisories/GHSA-pxg6-pf52-xh8x',
        'high',
        'cookie',
      ),
    ]);
    for (const [scenario, message] of [
      [{ report: otherHigh }, /altos ou críticos/],
      [{ report: moderate }, /aprovação local explícita/],
      [{ now: Date.parse('2026-12-18T00:00:01Z') }, /venceu/],
      [{ upstream: upstreamPatched() }, /informa correção/],
      [{ upstream: {} }, /Não foi possível consultar/],
      [{ exceptions: [] }, /altos ou críticos/],
    ]) {
      await approve(target);
      await assert.rejects(synchronize(audited(options, scenario)), message);
      assert.ok((await readApproval(storage)).failure);
      const after = await activeRelease(storage);
      assert.equal(after.id, before.id);
      assert.deepEqual(await servedFiles(after), files);
    }
    // A auditoria barra antes da compilação: nada foi construído.
    assert.equal(calls(), 0);
  }));

test('fetch que estoura o tempo limite falha sem merge, verificação, publicação nem consumo da autorização', () =>
  fixture(
    async ({
      options,
      advance,
      approve,
      project,
      git,
      storage,
      first,
      calls,
    }) => {
      const fake = await fakeGit();
      try {
        const target = await advance();
        await approve(target);
        const before = await activeRelease(storage);
        let published = 0;
        await assert.rejects(
          synchronize({
            ...options,
            publish: async () => {
              published++;
            },
            // Só o fetch é trocado: um Git sintético que não termina e, no
            // Windows, deixa filho e neto como o wrapper do Git for Windows.
            runGitCommand: (cwd, args) =>
              args[0] === 'fetch'
                ? runGit(
                    cwd,
                    args,
                    fake.options(windows ? 'tree' : 'hang', { timeout: 4000 }),
                  )
                : gitCommand(cwd, args),
          }),
          (error) =>
            error.code === 'ETIMEDOUT' &&
            error.gitSubcommand === 'fetch' &&
            error.cleanup === (windows ? 'confirmada' : 'não verificada'),
        );
        assert.equal(await git(project, 'rev-parse', 'HEAD'), first);
        assert.equal(calls(), 0);
        assert.equal(published, 0);
        assert.equal((await activeRelease(storage)).id, before.id);
        const approval = await readApproval(storage);
        assert.equal(approval.commit, target);
        assert.equal(approval.failure, undefined);
        assert.deepEqual(await fake.running(), []);
      } finally {
        await fake.dispose();
      }
    },
  ));
