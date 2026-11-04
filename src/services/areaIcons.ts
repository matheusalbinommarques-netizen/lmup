import { db, type Area, type Task } from './db';
import { isTaskIconKey } from '$lib/content/visualAssets';

/** Always resolve from the current area, never the legacy task icon. */
export function areaIconKey(
  task: Pick<Task, 'areaId'> | undefined,
  areas: Area[],
  generalIconKey?: string | null,
): string | null {
  const key = task?.areaId
    ? areas.find((area) => area.id === task.areaId)?.iconKey
    : generalIconKey;
  return isTaskIconKey(key) ? key : null;
}

/** Additive, idempotent adoption. Explicit null is a saved neutral choice. */
export async function migrateAreaIcons() {
  await db.transaction('rw', db.areas, db.tasks, async () => {
    const areas = await db.areas.toArray();
    const pending = areas.filter((area) => area.iconKey === undefined);
    if (!pending.length) return;
    const tasks = await db.tasks.toArray();
    for (const area of pending) {
      const keys = new Set(
        tasks
          .filter(
            (task) => task.areaId === area.id && isTaskIconKey(task.iconKey),
          )
          .map((task) => task.iconKey as string),
      );
      await db.areas.update(area.id!, {
        iconKey: keys.size === 1 ? [...keys][0] : null,
        iconConflict: keys.size > 1,
      });
    }
  });
}
