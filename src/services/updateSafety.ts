import { writable, get } from 'svelte/store';
export const updateLocked = writable(false);
const guards = new Set<() => boolean>();
export function registerUpdateGuard(guard: () => boolean) {
  guards.add(guard);
  return () => {
    guards.delete(guard);
  };
}
export function unsafeToUpdate() {
  if (get(updateLocked) || writes.size > 0) return true;
  for (const guard of guards) {
    try {
      if (guard()) return true;
    } catch {
      return true;
    }
  }
  return false;
}
export function isUpdateLocked() {
  return get(updateLocked);
}

const writes = new Set<object>();
export function trackWrite(transaction: {
  mode: string;
  on: (event: any, callback: () => void) => unknown;
}) {
  if (transaction.mode !== 'readwrite' || writes.has(transaction)) return;
  if (isUpdateLocked())
    throw new Error('Aguarde a atualização antes de salvar.');
  writes.add(transaction);
  const done = () => {
    writes.delete(transaction);
  };
  transaction.on('complete', done);
  transaction.on('abort', done);
}
export function pendingWrites() {
  return writes.size;
}
