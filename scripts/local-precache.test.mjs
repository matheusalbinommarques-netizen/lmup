import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getLocalPrecacheManifest, isPrecacheAsset } from './local-precache.mjs';

test('only explicitly reviewed static assets enter precache', () => {
  for (const path of [
    '200.html', 'manifest.webmanifest', 'pwa-192.png',
    'favicon-shield.ico', 'art/bg/eco-stage-1.webp',
    '_app/immutable/assets/a.css', '_app/immutable/chunks/a.js',
    '_app/immutable/x/any.wasm', 'art/pilot/scene-2-small.webp',
    'art/pilot/companion.webp', 'art/companions-v2/wolf-160.webp',
    'art/home-rpg/city.webp', 'fonts/type/display.woff2',
  ]) assert.equal(isPrecacheAsset(path), true, path);
  for (const path of [
    'private.env', 'backup.json', '200.html/evil.js', 'art/random.webp',
    'art/pilot/scene-2.webp', 'art/companions-v2/wolf-320.webp',
    'fonts/type/font.ttf', 'scripts/code.js', '.secret',
  ]) assert.equal(isPrecacheAsset(path), false, path);
});

test('manifest is deterministic and revisions reflect actual content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lmup-precache-'));
  try {
    await mkdir(join(root, '_app/immutable/chunks'), { recursive: true });
    await writeFile(join(root, '200.html'), '<h1>Ok</h1>');
    await writeFile(join(root, '_app/immutable/chunks/app.js'), 'a');
    await writeFile(join(root, 'private.env'), 'not for the cache');
    const first = await getLocalPrecacheManifest(root);
    assert.equal(first.count, 2);
    assert.equal(first.size, Buffer.byteLength('<h1>Ok</h1>') + 1);
    assert.deepEqual(first.manifestEntries.map(({ url }) => url), [
      '200.html', '_app/immutable/chunks/app.js',
    ]);
    assert.deepEqual(await getLocalPrecacheManifest(root), first);
    await writeFile(join(root, '_app/immutable/chunks/app.js'), 'b');
    const second = await getLocalPrecacheManifest(root);
    assert.notEqual(first.manifestEntries[1].revision, second.manifestEntries[1].revision);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('missing offline shell refuses a publication manifest', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lmup-precache-'));
  try {
    await assert.rejects(getLocalPrecacheManifest(root), /Shell offline ausente/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
