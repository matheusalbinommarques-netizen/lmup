import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { gitCommand, synchronize } from './local-sync-core.mjs';
import { publishBuild, activeRelease } from './local-release-store.mjs';
import { acquireLocalLock } from './local-process-lock.mjs';

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
    const advance = async () => {
      const sha = await commit(seed, 'second');
      await git(seed, 'push', 'github', 'main');
      return sha;
    };
    await work({
      options,
      project,
      storage,
      git,
      commit,
      advance,
      first,
      calls: () => calls,
    });
  } finally {
    const inside = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside));
    await rm(temporary, { recursive: true, maxRetries: 3, retryDelay: 100 });
  }
}

test('sem novidade não recompila; avanço direto testa e publica', () =>
  fixture(async ({ options, advance, calls, project, git, storage }) => {
    assert.equal((await synchronize(options)).state, 'current');
    assert.equal(calls(), 0);
    const target = await advance();
    assert.equal((await synchronize(options)).state, 'published');
    assert.equal(await git(project, 'rev-parse', 'HEAD'), target);
    assert.equal((await activeRelease(storage)).source.commit, target);
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

test('falha de testes mantém publicação e tenta novamente no próximo ciclo', () =>
  fixture(async ({ options, advance, storage }) => {
    await advance();
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
    assert.equal((await synchronize(options)).state, 'published');
  }));

test('falha de publicação mantém o ponteiro anterior', () =>
  fixture(async ({ options, advance, storage }) => {
    await advance();
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
  }));

test('edição durante os testes impede publicar o resultado', () =>
  fixture(async ({ options, advance, project, storage }) => {
    await advance();
    const previous = (await activeRelease(storage)).id;
    const result = await synchronize({
      ...options,
      verify: async () => {
        await writeFile(join(project, 'task.txt'), 'nova edição');
      },
    });
    assert.equal(result.reason, 'local-changes');
    assert.equal((await activeRelease(storage)).id, previous);
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
