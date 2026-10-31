import { db } from './db';
export type ProfileIdentity = { name: string; avatarUrl: string };
export async function saveProfileIdentity(
  draft: ProfileIdentity,
  original: ProfileIdentity,
) {
  const name = draft.name.trim();
  if (!name || name.length > 80)
    throw new Error('Use um nome entre 1 e 80 caracteres.');
  const changes: Partial<ProfileIdentity> = {};
  if (name !== original.name) changes.name = name;
  if (draft.avatarUrl !== original.avatarUrl) {
    if (
      draft.avatarUrl &&
      (!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/]+=*$/i.test(
        draft.avatarUrl,
      ) ||
        draft.avatarUrl.length > 2800000)
    )
      throw new Error('Use uma imagem PNG, JPEG ou WebP de até 2 MB.');
    changes.avatarUrl = draft.avatarUrl;
  }
  return db.transaction('rw', db.profile, async () => {
    const current = await db.profile.get(1);
    if (!current)
      throw new Error(
        'Seu perfil não está disponível. Feche esta janela e reabra o aplicativo.',
      );
    if (
      (changes.name !== undefined && current.name !== original.name) ||
      (changes.avatarUrl !== undefined &&
        (current.avatarUrl ?? '') !== original.avatarUrl)
    )
      throw new Error(
        'Seu perfil mudou em outra aba. Seu rascunho continua aqui; copie o que quiser manter e reabra a edição para conferir.',
      );
    if (Object.keys(changes).length)
      await db.profile.update(1, { ...changes, updatedAt: new Date() });
  });
}
