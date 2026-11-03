import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  getLocalPrecacheManifest,
  isPrecacheAsset,
} from './local-precache.mjs';

test('only explicitly reviewed static assets enter precache', () => {
  for (const path of [
    '200.html',
    'manifest.webmanifest',
    'pwa-192.png',
    'favicon-shield.ico',
    'art/bg/eco-stage-1.webp',
    '_app/immutable/assets/a.css',
    '_app/immutable/chunks/a.js',
    '_app/immutable/x/any.wasm',
    'art/pilot/scene-2-small.webp',
    'art/pilot/companion.webp',
    'art/companions-v2/wolf-160.webp',
    'art/home-rpg/city.webp',
    'fonts/type/display.woff2',
  ])
    assert.equal(isPrecacheAsset(path), true, path);
  for (const path of [
    'private.env',
    'backup.json',
    '200.html/evil.js',
    'art/random.webp',
    'art/pilot/scene-2.webp',
    'art/companions-v2/wolf-320.webp',
    'fonts/type/font.ttf',
    'scripts/code.js',
    '.secret',
  ])
    assert.equal(isPrecacheAsset(path), false, path);
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
    assert.deepEqual(
      first.manifestEntries.map(({ url }) => url),
      ['200.html', '_app/immutable/chunks/app.js'],
    );
    assert.deepEqual(await getLocalPrecacheManifest(root), first);
    await writeFile(join(root, '_app/immutable/chunks/app.js'), 'b');
    const second = await getLocalPrecacheManifest(root);
    assert.notEqual(
      first.manifestEntries[1].revision,
      second.manifestEntries[1].revision,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('missing offline shell refuses a publication manifest', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lmup-precache-'));
  try {
    await assert.rejects(
      getLocalPrecacheManifest(root),
      /Shell offline ausente/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('approved visual assets are available on the first offline visit without originals or labs', () => {
  for (const path of [
    'art/approved/icons/estudo/64.png',
    'art/approved/icons/estudo/128.png',
    'art/approved/navigation/Missoes_64.png',
    'art/approved/navigation/XP_128.png',
    'art/approved/paintings/01_Hoje_Vedria_panorama.webp',
  ])
    assert.equal(isPrecacheAsset(path), true, path);
  for (const path of [
    'art/approved/icons/estudo/original.png',
    'art/approved/icons/estudo/512.png',
    'art/approved/icons/estudo/256.png',
    'art/approved/icons/chip_casa/64.png',
    'art/approved/paintings/01_Hoje_Vedria_panorama.png',
    'art/lab/icons-pilot/Hoje_64.png',
    'art/lab/camp/mine-prototype-ai.png',
  ])
    assert.equal(isPrecacheAsset(path), false, path);
});

test('integrated camp precaches only preserved sprites while laboratory stays excluded', () => {
  for (const name of [
    'forge-feudalwars.png',
    'hall-feudalwars.png',
    'store-feudalwars.png',
    'sawmill-prototype-ai.png',
    'quarry-prototype-ai.png',
    'mine-prototype-ai.png',
    'ui-icons-prototype-ai.png',
    'region/grass_medium_128x64.png',
    'region/dirt_128x64.png',
    'region/forest_ground_128x64.png',
    'region/sand_128x64.png',
    'region/tree-30.png',
    'region/tree-36.png',
  ])
    assert.equal(isPrecacheAsset('art/camp/' + name), true);
  assert.equal(isPrecacheAsset('art/camp/not-reviewed.png'), false);
  assert.equal(isPrecacheAsset('art/lab/camp/forge-feudalwars.png'), false);
  assert.equal(isPrecacheAsset('art/camp/preservation-manifest.json'), false);
});

test('cinematic assets are reviewed and cached in the main application and preview', () => {
  assert.equal(
    isPrecacheAsset('art/camp-modular/center-built.webp', {
      campPreview: false,
    }),
    true,
  );
  assert.equal(
    isPrecacheAsset('art/camp-modular/center-built.webp', {
      campPreview: true,
    }),
    true,
  );
  assert.equal(
    isPrecacheAsset('art/camp-modular/tree-ancient.png', { campPreview: true }),
    true,
  );
  assert.equal(
    isPrecacheAsset('art/camp-modular/unknown.png', { campPreview: true }),
    false,
  );
  assert.equal(
    isPrecacheAsset('art/camp-modular/backup.json', { campPreview: true }),
    false,
  );
});
