import { realpath } from 'node:fs/promises';
import { resolve } from 'node:path';

export const OFFICIAL_BRANCH = 'main';
export const PUBLICATION_DIRECTORY = 'publication-main';

export async function validateSyncConfig(config, storage) {
  if (config.branch !== OFFICIAL_BRANCH)
    throw Error(
      'A sincronização exige a branch main. Execute a migração da instalação antiga.',
    );
  const expected = resolve(storage, PUBLICATION_DIRECTORY);
  if (
    resolve(config.checkout || '') !== expected ||
    (await realpath(config.checkout)) !== expected
  )
    throw Error('A sincronização exige a cópia isolada publication-main.');
}
