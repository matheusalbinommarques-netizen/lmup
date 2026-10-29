import { beforeEach, describe, it, expect } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveProfileIdentity } from './profileIdentityService';
beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
  await initializeJourney();
});
async function original() {
  const profile = (await db.profile.get(1))!;
  return { name: profile.name, avatarUrl: profile.avatarUrl ?? '' };
}
describe('edição da identidade sem perder a jornada', () => {
  it('preserva saldos e mudanças de outra aba enquanto altera somente o nome', async () => {
    const initial = await original();
    await db.profile.update(1, { gold: 125, totalXpEarned: 300, food: 12 });
    await saveProfileIdentity(
      { ...initial, name: '  Minha identidade  ' },
      initial,
    );
    expect(await db.profile.get(1)).toMatchObject({
      name: 'Minha identidade',
      gold: 125,
      totalXpEarned: 300,
      food: 12,
    });
  });
  it('recusa edição concorrente no mesmo campo sem sobrescrever', async () => {
    const initial = await original();
    await db.profile.update(1, { name: 'Outra aba' });
    await expect(
      saveProfileIdentity({ ...initial, name: 'Meu rascunho' }, initial),
    ).rejects.toThrow('Seu perfil mudou');
    expect((await db.profile.get(1))?.name).toBe('Outra aba');
  });
  it('preserva avatar alterado em outra aba quando só o nome foi editado', async () => {
    const initial = await original();
    await db.profile.update(1, { avatarUrl: 'data:image/png;base64,YQ==' });
    await saveProfileIdentity({ ...initial, name: 'Nome novo' }, initial);
    expect(await db.profile.get(1)).toMatchObject({
      name: 'Nome novo',
      avatarUrl: 'data:image/png;base64,YQ==',
    });
  });
  it('recusa conflito de avatar mesmo com nome válido e grava tudo atomicamente', async () => {
    const initial = await original();
    await db.profile.update(1, { avatarUrl: 'data:image/png;base64,YQ==' });
    await expect(
      saveProfileIdentity(
        { name: 'Não deve gravar', avatarUrl: 'data:image/png;base64,Yg==' },
        initial,
      ),
    ).rejects.toThrow('Seu perfil mudou');
    expect((await db.profile.get(1))?.name).toBe(initial.name);
  });
  it('não recria perfil ausente com saldos zerados durante uma edição', async () => {
    const initial = await original();
    await db.profile.delete(1);
    await expect(
      saveProfileIdentity({ ...initial, name: 'Nome' }, initial),
    ).rejects.toThrow('não está disponível');
    expect(await db.profile.get(1)).toBeUndefined();
  });
  it('valida nome e imagem sem alterar os dados anteriores', async () => {
    const initial = await original();
    for (const name of ['', 'x'.repeat(81)])
      await expect(
        saveProfileIdentity({ ...initial, name }, initial),
      ).rejects.toThrow('1 e 80');
    for (const avatarUrl of [
      'data:image/svg+xml;base64,YQ==',
      'data:image/png;base64,' + 'a'.repeat(2800001),
    ])
      await expect(
        saveProfileIdentity({ ...initial, avatarUrl }, initial),
      ).rejects.toThrow('2 MB');
    expect(await original()).toEqual(initial);
  });
});
