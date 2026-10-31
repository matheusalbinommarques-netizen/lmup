import {
  cp,
  mkdir,
  readFile,
  writeFile,
  rename,
  lstat,
  realpath,
  readdir,
  rm,
} from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { listFiles } from './verify-package.mjs';

const releaseId = /^[a-f0-9]{16}-[a-f0-9]{12}$/;
function within(root, target) {
  const child = relative(resolve(root), resolve(target));
  if (!child || child.startsWith('..') || isAbsolute(child))
    throw Error('Caminho de publicação fora da pasta reservada.');
  return resolve(target);
}
async function plainDirectory(path) {
  if (
    !(await lstat(path)).isDirectory() ||
    (await lstat(path)).isSymbolicLink()
  )
    throw Error('A publicação precisa ser uma pasta real.');
}
export async function activeRelease(storage) {
  let active;
  try {
    active = JSON.parse(await readFile(join(storage, 'active.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (active.format !== 1 || !releaseId.test(active.id))
    throw Error('Publicação ativa inválida.');
  const root = await realpath(storage);
  const directory = within(root, join(root, 'releases', active.id));
  await plainDirectory(directory);
  const build = within(root, join(directory, 'build'));
  await plainDirectory(build);
  within(root, await realpath(build));
  return { ...active, build };
}
export async function publishedBuilds(storage) {
  const current = await activeRelease(storage);
  if (!current) return [];
  const directories = await readdir(join(storage, 'releases'));
  const older = [];
  for (const id of directories.filter(
    (id) => releaseId.test(id) && id !== current.id,
  )) {
    try {
      const directory = within(storage, join(storage, 'releases', id));
      await plainDirectory(directory);
      await plainDirectory(join(directory, 'build'));
      const info = JSON.parse(
        await readFile(join(directory, 'publication.json'), 'utf8'),
      );
      if (info.format === 1 && info.id === id)
        older.push({ ...info, build: join(directory, 'build') });
    } catch {
      /* Foreign or incomplete directories are never served or removed. */
    }
  }
  return [
    current,
    ...older.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  ];
}
export async function publishBuild(
  build,
  storage,
  source,
  { retain = 3 } = {},
) {
  await mkdir(storage, { recursive: true });
  await plainDirectory(storage);
  await mkdir(join(storage, 'releases'), { recursive: true });
  const root = await realpath(storage);
  await plainDirectory(join(root, 'releases'));
  const release = JSON.parse(
    await readFile(join(build, 'release.json'), 'utf8'),
  );
  if (
    !/^[a-f0-9]{16}$/.test(release.version) ||
    release.schema !== 5 ||
    release.protocol !== 1
  )
    throw Error(
      'Esta publicação requer uma migração explícita. A versão atual foi mantida.',
    );
  const files = await listFiles(build);
  if (
    !['200.html', 'sw.js', 'manifest.webmanifest'].every((name) =>
      files.some((file) => file.path === name),
    )
  )
    throw Error('Build incompleto. A versão atual foi mantida.');
  const digest = createHash('sha256')
    .update(JSON.stringify({ release, files, source }))
    .digest('hex');
  const id = `${release.version}-${digest.slice(0, 12)}`;
  const destination = within(root, join(root, 'releases', id));
  const publishedAt = new Date().toISOString();
  const metadata = {
    format: 1,
    id,
    version: release.version,
    source,
    publishedAt,
  };
  try {
    await lstat(destination);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const staged = within(root, join(root, `preparing-${randomUUID()}`));
    await mkdir(staged);
    await cp(build, join(staged, 'build'), {
      recursive: true,
      dereference: false,
    });
    const copied = await listFiles(join(staged, 'build'));
    if (JSON.stringify(copied) !== JSON.stringify(files))
      throw Error(
        'A cópia mudou durante a publicação. A versão atual foi mantida.',
      );
    await writeFile(
      join(staged, 'publication.json'),
      JSON.stringify({ ...metadata, release, files }, null, 2),
    );
    // Both absolute paths are constrained to our own publication folder before moving.
    within(root, await realpath(staged));
    within(root, destination);
    await rename(staged, destination);
  }
  await plainDirectory(destination);
  const verified = JSON.parse(
    await readFile(join(destination, 'publication.json'), 'utf8'),
  );
  if (
    verified.id !== id ||
    JSON.stringify(await listFiles(join(destination, 'build'))) !==
      JSON.stringify(files)
  )
    throw Error('A publicação existente está incompleta ou alterada.');
  const pointer = within(root, join(root, `active-${randomUUID()}.tmp`));
  await writeFile(
    pointer,
    JSON.stringify({ ...metadata, publishedAt: verified.publishedAt }, null, 2),
  );
  await rename(pointer, join(root, 'active.json'));
  const releases = await publishedBuilds(root);
  for (const old of releases.slice(Math.max(2, retain))) {
    const directory = within(root, join(root, 'releases', old.id));
    await plainDirectory(directory);
    within(root, await realpath(directory));
    // Only generated, validated release directories are removed; never project files.
    await rm(directory, { recursive: true });
  }
  return activeRelease(root);
}
