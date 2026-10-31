// A deterministic manifest for this app's static assets; no globbing dependency.
// Personal data never enters this generator: only the compiled build/ tree is read.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const limit = 3 * 1024 * 1024;
const exact = new Set([
  '200.html',
  'manifest.webmanifest',
  'favicon-shield.ico',
  'art/pilot/companion.webp',
]);

export function isPrecacheAsset(path) {
  if (exact.has(path)) return true;
  return (
    /^pwa-[^/]*\.png$/.test(path) ||
    /^art\/bg\/eco-stage-[^/]*\.webp$/.test(path) ||
    /^_app\/immutable\/(?:[^/]+\/)*[^/]+\.(?:js|css|wasm|woff2)$/.test(path) ||
    /^art\/pilot\/scene-[^/]*-small\.webp$/.test(path) ||
    /^art\/companions-v2\/[^/]*-160\.webp$/.test(path) ||
    /^art\/home-rpg\/[^/]*\.webp$/.test(path) ||
    /^fonts\/(?:[^/]+\/)*[^/]+\.woff2$/.test(path)
  );
}

export async function getLocalPrecacheManifest(root = 'build') {
  const manifestEntries = [];
  let size = 0;
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // Workbox glob ignores dotfiles.
      const file = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw Error('Link simbólico não permitido no manifesto: ' + file);
      }
      if (entry.isDirectory()) {
        await visit(file);
      } else if (entry.isFile()) {
        const url = relative(root, file).split(sep).join('/');
        if (!isPrecacheAsset(url)) continue;
        const buffer = await readFile(file);
        if (buffer.length > limit) {
          throw Error('Arquivo excede o limite offline de 3 MiB: ' + url);
        }
        manifestEntries.push({
          revision: createHash('md5').update(buffer).digest('hex'),
          url,
        });
        size += buffer.length;
      }
    }
  }
  await visit(root);
  manifestEntries.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
  if (!manifestEntries.some((entry) => entry.url === '200.html'))
    throw Error('Shell offline ausente.');
  return { manifestEntries, count: manifestEntries.length, size };
}
