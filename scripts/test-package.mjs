import { execFileSync } from 'node:child_process';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { verifyPackage } from './verify-package.mjs';
const project = fileURLToPath(new URL('../', import.meta.url));
const output = execFileSync(process.execPath, ['scripts/package-release.mjs'], {
  cwd: project,
  encoding: 'utf8',
}).trim();
const directory = resolve(output),
  allowed = resolve(project, 'dist'),
  inside = relative(allowed, directory);
if (inside.startsWith('..') || isAbsolute(inside) || !inside)
  throw Error('Pacote de teste fora da pasta dist.');
await verifyPackage(directory);
const guide = join(directory, 'COMO-USAR.md'),
  manifest = join(directory, 'integrity.json'),
  extra = join(directory, 'ARQUIVO-EXTRA-TESTE.txt');
const originalGuide = await readFile(guide),
  originalManifest = await readFile(manifest);
try {
  await writeFile(
    guide,
    Buffer.concat([originalGuide, Buffer.from('\nAlteração de teste.')]),
  );
  await assert.rejects(verifyPackage(directory), /alterado ou incompleto/);
  await writeFile(guide, originalGuide);
  await unlink(guide);
  await assert.rejects(verifyPackage(directory), /ENOENT/);
  await writeFile(guide, originalGuide);
  await writeFile(extra, 'Extra de teste.');
  await assert.rejects(verifyPackage(directory), /alterado ou incompleto/);
  await unlink(extra);
  const altered = JSON.parse(originalManifest);
  altered.files[0].path = '../fora-do-pacote';
  await writeFile(manifest, JSON.stringify(altered));
  await assert.rejects(verifyPackage(directory), /Caminho inválido/);
} finally {
  await writeFile(guide, originalGuide);
  await writeFile(manifest, originalManifest);
  await unlink(extra).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}
await verifyPackage(directory);
console.log(
  '5 verificações passaram: íntegro, alterado, ausente, extra e caminho inválido. Pacote restaurado e íntegro.',
);
