import { liveQuery } from 'dexie';
import { db } from './db';
import { readIdentitySnapshot } from './profileQuery';
import { discoveryRows } from './collectionRules';
export function readRefugeSnapshot() {
  return db.transaction(
    'r',
    db.profile,
    db.companions,
    db.ownedShopItems,
    db.activityEvents,
    async () => {
      const view = await readIdentitySnapshot(),
        events = await db.activityEvents.toArray();
      return {
        ...view,
        events,
        milestones: discoveryRows(view.profile, events),
      };
    },
  );
}
export function refugeQuery() {
  return liveQuery(readRefugeSnapshot);
}
export type RefugeSnapshot = Awaited<ReturnType<typeof readRefugeSnapshot>>;
