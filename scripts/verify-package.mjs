import { readdir, readFile, lstat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, join, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export async function listFiles(root, ignore = []) {
  const files = [];
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = join(folder, entry.name),
        key = relative(root, file).split(sep).join('/');
      if (entry.isSymbolicLink())
        throw Error('Link simbólico não é permitido: ' + key);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile() && !ignore.includes(key)) {
        const bytes = await readFile(file);
        files.push({ path: key, bytes: bytes.length, sha256: hash(bytes) });
      }
    }
  }
  await visit(root);
  return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
export async function verifyPackage(directory) {
  const root = resolve(directory),
    info = JSON.parse(await readFile(join(root, 'integrity.json'), 'utf8'));
  if (
    info.format !== 1 ||
    !Array.isArray(info.files) ||
    !info.release ||
    !info.source
  )
    throw Error('Manifesto de integridade inválido.');
  const seen = new Set();
  for (const record of info.files) {
    if (
      typeof record.path !== 'string' ||
      record.path.includes(String.fromCharCode(92)) ||
      isAbsolute(record.path) ||
      record.path
        .split('/')
        .some((segment) => !segment || segment === '..' || segment === '.') ||
      seen.has(record.path)
    )
      throw Error('Caminho inválido no manifesto.');
    seen.add(record.path);
    const file = resolve(root, record.path),
      within = relative(root, file);
    if (
      within.startsWith('..') ||
      isAbsolute(within) ||
      (await lstat(file)).isSymbolicLink()
    )
      throw Error('Arquivo fora do pacote.');
  }
  const actual = await listFiles(root, ['integrity.json']);
  if (JSON.stringify(actual) !== JSON.stringify(info.files))
    throw Error(
      'Pacote alterado ou incompleto: arquivos, tamanhos ou hashes não correspondem.',
    );
  const id = hash(
    JSON.stringify({
      release: info.release,
      source: info.source,
      files: info.files,
    }),
  );
  if (id !== info.id) throw Error('Identificação de integridade divergente.');
  const release = JSON.parse(
    await readFile(join(root, 'build/release.json'), 'utf8'),
  );
  if (JSON.stringify(release) !== JSON.stringify(info.release))
    throw Error('Revisão do aplicativo divergente.');
  return info;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (!process.argv[2]) throw Error('Informe a pasta do pacote.');
  const info = await verifyPackage(process.argv[2]);
  console.log(
    'Pacote íntegro: ' +
      info.files.length +
      ' arquivos; revisão ' +
      info.release.version +
      '.',
  );
}
