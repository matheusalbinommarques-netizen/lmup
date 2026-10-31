import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateSyncConfig } from './local-sync-config.mjs';

test('instalação antiga exige migração sem aceitar sua cópia de publicação', async () => {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-config-'));
  try {
    const oldCheckout = join(storage, 'publication');
    await mkdir(oldCheckout);
    await assert.rejects(
      validateSyncConfig(
        { branch: 'release/lmup-local', checkout: oldCheckout },
        storage,
      ),
      /migração/,
    );
    await assert.rejects(
      validateSyncConfig({ branch: 'main', checkout: oldCheckout }, storage),
      /publication-main/,
    );
  } finally {
    await rm(storage, { recursive: true });
  }
});

test('main usa apenas a nova cópia isolada e recusa outros caminhos', async () => {
  const storage = await mkdtemp(join(tmpdir(), 'lmup-config-'));
  try {
    const checkout = join(storage, 'publication-main');
    await mkdir(checkout);
    await validateSyncConfig({ branch: 'main', checkout }, storage);
    await assert.rejects(
      validateSyncConfig({ branch: 'main', checkout: storage }, storage),
      /publication-main/,
    );
  } finally {
    await rm(storage, { recursive: true });
  }
});
