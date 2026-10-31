import { getManifest } from 'workbox-build';
import { getLocalPrecacheManifest } from './local-precache.mjs';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await stat('build/200.html');
const { manifestEntries, count, size, warnings } = await getManifest({
  globDirectory: 'build',
  globPatterns: [
    'art/bg/eco-stage-*.webp',
    '_app/immutable/**/*.{js,css,wasm,woff2}',
    '200.html',
    'manifest.webmanifest',
    'pwa-*.png',
    'favicon-shield.ico',
    'art/pilot/scene-*-small.webp',
    'art/pilot/companion.webp',
    'art/companions-v2/*-160.webp',
    'art/home-rpg/*.webp',
    'fonts/**/*.woff2',
  ],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
});
if (warnings.length) throw new Error(warnings.join('\n'));
// Temporary equivalence guard: remove Workbox only after its output matches
// the native generator byte-for-byte on a real production build.
const local = await getLocalPrecacheManifest('build');
const canonical = (entries) =>
  entries.map(({ url, revision }) => ({ url, revision }))
    .sort((a, b) => a.url.localeCompare(b.url, 'en'));
if (
  JSON.stringify(canonical(manifestEntries)) !==
    JSON.stringify(canonical(local.manifestEntries)) ||
  count !== local.count || size !== local.size
) {
  const sourcePaths = new Set(manifestEntries.map(({ url }) => url));
  const localPaths = new Set(local.manifestEntries.map(({ url }) => url));
  throw Error(
    'Manifestos Workbox e nativo divergentes: ' +
    JSON.stringify({
      onlyWorkbox: [...sourcePaths].filter((x) => !localPaths.has(x)),
      onlyLocal: [...localPaths].filter((x) => !sourcePaths.has(x)),
      workbox: { count, size }, local: { count: local.count, size: local.size },
    }),
  );
}
console.log('Manifesto nativo equivalente ao Workbox: ' + local.count + ' arquivos.');
if (!manifestEntries.some((entry) => entry.url === '200.html'))
  throw new Error('Shell offline ausente.');
const source = await readFile('pwa/worker.js', 'utf8');
const version = createHash('sha256')
  .update(
    source +
      JSON.stringify(manifestEntries) +
      (process.env.LMU_RELEASE_SEED ?? ''),
  )
  .digest('hex')
  .slice(0, 16);
await writeFile(
  'build/sw.js',
  source
    .replace('__LMU_RELEASE__', version)
    .replace('self.__WB_MANIFEST', JSON.stringify(manifestEntries)),
);
await writeFile(
  'build/release.json',
  JSON.stringify(
    {
      version,
      protocol: 1,
      schema: 5,
      precacheFiles: count,
      precacheBytes: size,
    },
    null,
    2,
  ),
);
console.log(
  'PWA: ' +
    count +
    ' arquivos essenciais, ' +
    size +
    ' bytes, versão ' +
    version,
);
