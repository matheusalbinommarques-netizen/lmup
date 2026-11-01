import type { Task } from '$services/db';
import { isAvailable } from '$services/journeyService';

export const PRIORITY_KEY = 'lmup.home-priority.v1';

export function readPriority(): number | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(PRIORITY_KEY) ?? 'null',
    );
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
      ? value
      : null;
  } catch {
    return null;
  }
}

export function savePriority(id: number | null): boolean {
  try {
    if (id === null) window.localStorage.removeItem(PRIORITY_KEY);
    else window.localStorage.setItem(PRIORITY_KEY, JSON.stringify(id));
    return true;
  } catch {
    return false;
  }
}

export function priorityTask(
  tasks: Task[],
  id: number | null,
  today: string,
): Task | null {
  return (
    tasks.find(
      (task) =>
        task.id === id && isAvailable(task, new Date(`${today}T12:00:00`)),
    ) ?? null
  );
}
