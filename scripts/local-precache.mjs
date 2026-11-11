import approvedIcons from '../src/lib/content/approved-icons.json' with { type: 'json' };
// A deterministic manifest for this app's static assets; no globbing dependency.
// Personal data never enters this generator: only the compiled build/ tree is read.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const limit = 3 * 1024 * 1024;
const exact = new Set([
  ...[
    'mapa-ermos-centrais.webp',
    'cena-oasis-construcao.webp',
    'cena-arredores-pistas.webp',
    'eldrin-vane.webp',
    'alaric-conall.webp',
    'elowen-morrigan.webp',
    'lucan-dorian.webp',
    'lucan-dorian-horizontal.png',
  ].map((name) => `art/world/${name}`),
  ...approvedIcons.flatMap(({ key }) =>
    [64, 128].map((size) => `art/approved/icons/${key}/${size}.png`),
  ),
  ...['Hoje', 'Missoes', 'Recuperar', 'XP'].flatMap((key) =>
    [64, 128].map((size) => `art/approved/navigation/${key}_${size}.png`),
  ),
  ...[
    '01_Hoje_Vedria_panorama',
    '02_Cartao_Aventura',
    '03_Cartao_Refugio',
    '04_Cartao_Projetos',
    '05_Cartao_Mapa',
  ].map((key) => `art/approved/paintings/${key}.webp`),
  '200.html',
  'manifest.webmanifest',
  'favicon.ico',
  'art/ui/sidebar-map.webp',
  'art/brand/logo-400.webp',
  'art/brand/logo-800.webp',
  'art/brand/monograma-64.webp',
  'art/brand/monograma-128.webp',
  'art/pilot/companion.webp',
]);

const campModularAssets = new Set([
  'art/camp-modular/approved-garden.png',
  'art/camp-modular/garden-clean-plate.webp',
  'art/camp-modular/center-built.webp',
  'art/camp-modular/center-empty.webp',
  'art/camp-modular/bestiary.webp',
  'art/camp-modular/interior.png',
  'art/camp-modular/tree-seed.png',
  'art/camp-modular/tree-sapling.png',
  'art/camp-modular/tree-young.png',
  'art/camp-modular/tree-ancient.png',
  'art/camp-modular/vegetation.png',
  'art/camp-modular/repair-mask.svg',
  'art/camp-modular/foreground-mask.svg',
  'art/camp-modular/rune-stones-mask.svg',
  'art/camp-modular/rune-glyphs-mask.svg',
  'art/camp-modular/center-empty-mask.svg',
  'art/camp-modular/center-bed-mask.svg',
  'art/camp-modular/center-runes.svg',
]);
export function isPrecacheAsset(path) {
  if (path.startsWith('art/camp-modular/')) return campModularAssets.has(path);
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
