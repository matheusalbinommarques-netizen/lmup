import { db } from './db';
import { liveQuery } from 'dexie';
export function settingsQuery() {
  return liveQuery(() =>
    db.transaction('r', db.tables, async () => ({
      profile: await db.profile.get(1),
      tasks: await db.tasks.count(),
      projects: await db.projects.count(),
      events: await db.activityEvents.count(),
      recoveries: (
        await db.recoverySnapshots.orderBy('createdAt').reverse().toArray()
      ).map((row) => ({
        id: row.id,
        createdAt: row.createdAt,
        reason: row.reason,
        tasks: row.data.tasks?.length ?? 0,
      })),
    })),
  );
}
export type SettingsSnapshot = {
  profile?: import('./db').Profile;
  tasks: number;
  projects: number;
  events: number;
  recoveries: {
    id: string;
    createdAt: string;
    reason: string;
    tasks: number;
  }[];
};
