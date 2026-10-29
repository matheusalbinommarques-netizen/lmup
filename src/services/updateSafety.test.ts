import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import {
  updateLocked,
  pendingWrites,
  unsafeToUpdate,
  registerUpdateGuard,
} from './updateSafety';
import { storageError } from './storageErrors';
beforeEach(async () => {
  updateLocked.set(false);
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});
afterEach(() => updateLocked.set(false));
describe('segurança da atualização', () => {
  it('registra transação de escrita desde a leitura e libera após confirmação', async () => {
    await db.transaction('rw', db.profile, async () => {
      await db.profile.get(1);
      expect(pendingWrites()).toBeGreaterThan(0);
      expect(unsafeToUpdate()).toBe(true);
      await db.profile.update(1, { name: 'Atualizado' });
    });
    expect(pendingWrites()).toBe(0);
    expect(unsafeToUpdate()).toBe(false);
  });
  it('não bloqueia atualização por consultas somente de leitura', async () => {
    await db.transaction('r', db.profile, async () => {
      await db.profile.get(1);
      expect(pendingWrites()).toBe(0);
    });
  });
  it('aborto limpa a proteção e não deixa débito parcial', async () => {
    await expect(
      db.transaction('rw', db.profile, async () => {
        await db.profile.update(1, { gold: 100 });
        throw new Error('falha');
      }),
    ).rejects.toThrow('falha');
    await expect.poll(() => pendingWrites()).toBe(0);
    expect((await db.profile.get(1))?.gold).toBe(0);
  });
  it('nenhuma nova escrita começa enquanto a troca está travada', async () => {
    updateLocked.set(true);
    await expect(db.profile.update(1, { gold: 900 })).rejects.toThrow(
      'Aguarde a atualização',
    );
    updateLocked.set(false);
    expect((await db.profile.get(1))?.gold).toBe(0);
  });
  it('rascunhos e guardas sem resposta impedem a troca até serem liberados', () => {
    let dirty = true;
    const remove = registerUpdateGuard(() => dirty);
    expect(unsafeToUpdate()).toBe(true);
    dirty = false;
    expect(unsafeToUpdate()).toBe(false);
    remove();
    const broken = registerUpdateGuard(() => {
      throw new Error('unknown');
    });
    expect(unsafeToUpdate()).toBe(true);
    broken();
    expect(unsafeToUpdate()).toBe(false);
  });
  it('explica limite de espaço, bloqueio e versão sem sugerir apagar dados', () => {
    expect(
      storageError(
        { name: 'UnknownError', inner: { name: 'QuotaExceededError' } },
        'fallback',
        true,
      ),
    ).toContain('Seu texto continua aqui');
    expect(storageError({ name: 'SecurityError' }, 'fallback')).toContain(
      'armazenamento permitido',
    );
    expect(storageError({ name: 'VersionError' }, 'fallback')).toContain(
      'versão mais recente',
    );
  });
});
