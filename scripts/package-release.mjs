import { readFile, writeFile, mkdir, cp, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { hash, listFiles, verifyPackage } from './verify-package.mjs';
const project = fileURLToPath(new URL('../', import.meta.url)),
  build = join(project, 'build');
const release = JSON.parse(await readFile(join(build, 'release.json'), 'utf8'));
if (
  !/^[a-f0-9]{16}$/.test(release.version) ||
  release.schema !== 5 ||
  release.protocol !== 1
)
  throw Error('Build candidato não reconhecido.');
for (const name of ['200.html', 'sw.js', 'manifest.webmanifest'])
  await stat(join(build, name));
const buildFiles = await listFiles(build);
if (
  buildFiles.some((entry) =>
    entry.path
      .split('/')
      .some(
        (part) =>
          part === '.git' || part === '.env' || part.startsWith('.env.'),
      ),
  )
)
  throw Error('Arquivo privado inesperado no build.');
const source = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: project,
    encoding: 'utf8',
  }).trim(),
  dirty: !!execFileSync('git', ['status', '--porcelain'], {
    cwd: project,
    encoding: 'utf8',
  }).trim(),
};
const guide = await readFile(join(project, 'docs/GUIA-DA-BETA.md'));
const extras = {
  'COMO-USAR.md': guide,
  'iniciar.mjs': Buffer.from(
    "process.env.LMU_PREVIEW_PORT ??= '5174';\nawait import('./scripts/serve-static.mjs');\n",
  ),
  'scripts/serve-static.mjs': await readFile(
    join(project, 'scripts/serve-static.mjs'),
  ),
  'scripts/static-server.mjs': await readFile(
    join(project, 'scripts/static-server.mjs'),
  ),
  'scripts/local-release-store.mjs': await readFile(
    join(project, 'scripts/local-release-store.mjs'),
  ),
  'scripts/verify-package.mjs': await readFile(
    join(project, 'scripts/verify-package.mjs'),
  ),
};
const files = [
  ...buildFiles.map((entry) => ({ ...entry, path: 'build/' + entry.path })),
  ...Object.entries(extras).map(([path, bytes]) => ({
    path,
    bytes: bytes.length,
    sha256: hash(bytes),
  })),
].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
const metadata = { release, source, files },
  id = hash(JSON.stringify(metadata));
const target = resolve(
  project,
  'dist',
  'level-me-up-beta-' + release.version + '-' + id.slice(0, 8),
);
if (await stat(target).catch(() => false)) {
  const existing = await verifyPackage(target);
  if (existing.id !== id)
    throw Error('Pasta candidata com conteúdo diferente.');
  console.log(target);
  process.exit(0);
}
await mkdir(target, { recursive: true });
await cp(build, join(target, 'build'), { recursive: true });
await mkdir(join(target, 'scripts'), { recursive: true });
for (const [path, bytes] of Object.entries(extras))
  await writeFile(join(target, path), bytes);
await writeFile(
  join(target, 'integrity.json'),
  JSON.stringify({ format: 1, id, ...metadata }, null, 2),
);
await verifyPackage(target);
console.log(target);
