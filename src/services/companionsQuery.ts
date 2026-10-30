import { liveQuery } from 'dexie';
import { db } from './db';
export function readCompanionsSnapshot() {
  return db.transaction('r', db.profile, db.companions, async () => {
    const profile = await db.profile.get(1);
    if (!profile)
      throw new Error(
        'Seu perfil não está disponível. Reabra o aplicativo para tentar novamente.',
      );
    return { profile, companions: await db.companions.toArray() };
  });
}
export function companionsQuery() {
  return liveQuery(readCompanionsSnapshot);
}
export type CompanionsSnapshot = Awaited<
  ReturnType<typeof readCompanionsSnapshot>
>;
