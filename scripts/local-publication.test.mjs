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
import { join, resolve, relative, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { publishBuild, activeRelease } from './local-release-store.mjs';
import { createStaticServer } from './static-server.mjs';

async function fixture(work) {
  const temporary = await mkdtemp(join(tmpdir(), 'lmup-publication-'));
  const build = join(temporary, 'candidate'),
    storage = join(temporary, 'installed');
  await mkdir(build);
  try {
    await work({ build, storage, temporary });
  } finally {
    const inside = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside));
    await rm(temporary, { recursive: true });
  }
}
async function candidate(build, version, extra = {}) {
  await mkdir(join(build, '_app/immutable'), { recursive: true });
  await writeFile(
    join(build, 'release.json'),
    JSON.stringify({ version, schema: 5, protocol: 1, ...extra }),
  );
  await writeFile(join(build, '200.html'), `<h1>${version}</h1>`);
  await writeFile(join(build, 'sw.js'), `// worker ${version}`);
  await writeFile(join(build, 'manifest.webmanifest'), '{}');
  await writeFile(
    join(build, `_app/immutable/${version}.js`),
    `// chunk ${version}`,
  );
}
test('publicação muda o ponteiro somente depois de conferir uma cópia completa', () =>
  fixture(async ({ build, storage }) => {
    await candidate(build, '1111111111111111');
    const first = await publishBuild(build, storage, { commit: 'first' });
    await candidate(build, '2222222222222222');
    assert.equal((await activeRelease(storage)).version, first.version);
    assert.match(
      await readFile(join(first.build, '200.html'), 'utf8'),
      /1111111111111111/,
    );
    const second = await publishBuild(build, storage, { commit: 'second' });
    assert.equal((await activeRelease(storage)).id, second.id);
    assert.notEqual(first.build, second.build);
    await candidate(build, '3333333333333333', { schema: 7 });
    await assert.rejects(publishBuild(build, storage, {}), /migração/);
    assert.equal((await activeRelease(storage)).id, second.id);
  }));

test('controlador compatível publica esquema 6 e mantém a cópia anterior', () =>
  fixture(async ({ build, storage }) => {
    await candidate(build, '1111111111111111');
    const previous = await publishBuild(build, storage, { commit: 'legacy' });
    await candidate(build, '2222222222222222', { schema: 6 });
    const next = await publishBuild(build, storage, {
      commit: 'migration-tested',
    });
    assert.equal(next.version, '2222222222222222');
    assert.match(
      await readFile(join(previous.build, '200.html'), 'utf8'),
      /1111111111111111/,
    );
  }));
test('retém três versões e preserva diretórios que não pertencem ao publicador', () =>
  fixture(async ({ build, storage }) => {
    await mkdir(join(storage, 'releases', 'meus-arquivos'), {
      recursive: true,
    });
    await writeFile(
      join(storage, 'releases', 'meus-arquivos', 'nota.txt'),
      'preservar',
    );
    for (let i = 1; i <= 5; i++) {
      await candidate(build, String(i).repeat(16));
      await publishBuild(build, storage, { commit: String(i) });
    }
    const directories = await readdir(join(storage, 'releases'));
    assert.equal(
      directories.filter((name) => /^[a-f0-9]{16}-[a-f0-9]{12}$/.test(name))
        .length,
      3,
    );
    assert.equal(
      await readFile(
        join(storage, 'releases', 'meus-arquivos', 'nota.txt'),
        'utf8',
      ),
      'preservar',
    );
    assert.equal((await activeRelease(storage)).version, '5555555555555555');
  }));
test('servidor mantém a versão publicada durante uma nova compilação e oferece chunks anteriores', () =>
  fixture(async ({ build, storage }) => {
    await candidate(build, '1111111111111111');
    await publishBuild(build, storage, {});
    const server = createStaticServer({
      root: build,
      publicationRoot: storage,
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const origin = `http://127.0.0.1:${server.address().port}`;
    try {
      await candidate(build, '2222222222222222');
      assert.equal(
        (await (await fetch(origin + '/release.json')).json()).version,
        '1111111111111111',
      );
      await publishBuild(build, storage, {});
      assert.equal(
        (await (await fetch(origin + '/release.json')).json()).version,
        '2222222222222222',
      );
      assert.match(
        await (
          await fetch(origin + '/_app/immutable/1111111111111111.js')
        ).text(),
        /1111111111111111/,
      );
      assert.equal((await fetch(origin + '/missing.webp')).status, 404);
      assert.equal(
        (await (await fetch(origin + '/__lmup/status')).json()).service,
        'lmup-local-publications',
      );
      // The update monitor may read status, but must not leak paths or raw errors.
      await writeFile(
        join(storage, 'sync-status.json'),
        JSON.stringify({
          state: 'validating',
          step: 'pwa',
          checkedAt: '2026-10-31T18:00:00.000Z',
          checkout: 'C:\\private\\publication',
          token: 'do-not-expose',
        }),
      );
      const monitorResponse = await fetch(origin + '/__lmup/status');
      assert.equal(monitorResponse.headers.get('cache-control'), 'no-store');
      const monitor = await monitorResponse.json();
      assert.equal(monitor.sync.state, 'validating');
      assert.equal(monitor.sync.step, 'pwa');
      assert.equal(monitor.sync.checkedAt, '2026-10-31T18:00:00.000Z');
      assert.equal(JSON.stringify(monitor).includes('do-not-expose'), false);
      assert.equal(JSON.stringify(monitor).includes('private'), false);
      await writeFile(
        join(storage, 'sync-status.json'),
        JSON.stringify({
          state: 'error',
          message: 'secret file: C:\\private\\log',
        }),
      );
      const failure = await (await fetch(origin + '/__lmup/status')).json();
      assert.equal(failure.sync.state, 'error');
      assert.equal(JSON.stringify(failure).includes('private'), false);
      const saved = await readFile(join(storage, 'active.json'));
      await writeFile(
        join(storage, 'active.json'),
        JSON.stringify({ format: 1, id: '../../private' }),
      );
      assert.equal((await fetch(origin + '/release.json')).status, 503);
      await writeFile(join(storage, 'active.json'), saved);
    } finally {
      server.closeAllConnections();
      server.close();
      await once(server, 'close');
    }
  }));
test('recusa uma cópia alterada sem trocar a versão ativa', () =>
  fixture(async ({ build, storage }) => {
    await candidate(build, '1111111111111111');
    const first = await publishBuild(build, storage, {});
    await candidate(build, '2222222222222222');
    const second = await publishBuild(build, storage, {});
    await writeFile(join(first.build, '200.html'), 'alterado');
    await candidate(build, '1111111111111111');
    // Recreate the exact original candidate so the stored generation ID is selected.
    await rm(join(build, '_app/immutable/2222222222222222.js'));
    await assert.rejects(publishBuild(build, storage, {}), /alterada/);
    assert.equal((await activeRelease(storage)).id, second.id);
  }));
