import { createJourneyBackup } from './backupDataService';
import { recordBackupExport } from './backupReminder';

/**
 * A15: optional copy of the backup into a folder the person chose. One file
 * only (`lmup-backup.json`), replaced on every copy. Chromium only (File
 * System Access API). The folder handle lives in its own small IndexedDB
 * database, so the journey database and its schema stay untouched.
 */
export const FOLDER_BACKUP_FILE = 'lmup-backup.json';
export const FOLDER_BACKUP_LAST = 'lmup:folder-backup-last';
export const FOLDER_BACKUP_EVENT = 'lmup:folder-backup-changed';
/** Minimum time between automatic copies. */
export const FOLDER_BACKUP_INTERVAL = 30 * 60 * 1000;
const STORE_DB = 'LevelMeUpFolderBackup';
const STORE = 'handles';
const KEY = 'folder';

type Permission = 'granted' | 'denied' | 'prompt';
export type FolderHandle = {
  name: string;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<{
    createWritable(): Promise<{
      write(data: string): Promise<void>;
      close(): Promise<void>;
    }>;
  }>;
  queryPermission?(options: { mode: 'readwrite' }): Promise<Permission>;
  requestPermission?(options: { mode: 'readwrite' }): Promise<Permission>;
};
export type FolderStatus =
  | { state: 'unsupported' }
  | { state: 'off' }
  | {
      state: 'ready' | 'needs-permission';
      folder: string;
      lastAt: string | null;
    };

type PickerWindow = Window & {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: 'readwrite';
  }) => Promise<FolderHandle>;
};

export function folderBackupSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as PickerWindow).showDirectoryPicker === 'function'
  );
}

function openStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function storeRequest<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openStore();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export const savedFolder = () =>
  storeRequest<FolderHandle | undefined>('readonly', (store) => store.get(KEY));
const saveFolder = (handle: FolderHandle) =>
  storeRequest<unknown>('readwrite', (store) => store.put(handle, KEY));

function readLast(): string | null {
  try {
    return localStorage.getItem(FOLDER_BACKUP_LAST);
  } catch {
    return null;
  }
}
function announce() {
  try {
    window.dispatchEvent(new Event(FOLDER_BACKUP_EVENT));
  } catch {
    /* No window in tests. */
  }
}

async function permission(handle: FolderHandle): Promise<Permission> {
  return (await handle.queryPermission?.({ mode: 'readwrite' })) ?? 'granted';
}

/** Whether an automatic copy is due; pure, so it can be tested alone. */
export function folderBackupDue(lastAt: string | null, now = Date.now()) {
  const last = lastAt ? Date.parse(lastAt) : NaN;
  return (
    !Number.isFinite(last) || last > now || now - last >= FOLDER_BACKUP_INTERVAL
  );
}

/**
 * Writes the current journey to the folder, replacing the previous copy.
 * The browser swaps the file only when `close()` succeeds, so an interrupted
 * copy never leaves a half-written backup in place.
 */
export async function writeFolderBackup(handle: FolderHandle) {
  const backup = JSON.stringify(await createJourneyBackup(), null, 2);
  const file = await handle.getFileHandle(FOLDER_BACKUP_FILE, { create: true });
  const writable = await file.createWritable();
  await writable.write(backup);
  await writable.close();
  const at = new Date().toISOString();
  try {
    localStorage.setItem(FOLDER_BACKUP_LAST, at);
  } catch {
    /* The copy exists even if the date cannot be remembered. */
  }
  recordBackupExport();
  announce();
  return at;
}

export async function folderBackupStatus(): Promise<FolderStatus> {
  if (!folderBackupSupported()) return { state: 'unsupported' };
  const handle = await savedFolder().catch(() => undefined);
  if (!handle) return { state: 'off' };
  return {
    state:
      (await permission(handle)) === 'granted' ? 'ready' : 'needs-permission',
    folder: handle.name,
    lastAt: readLast(),
  };
}

/** Asks for a folder (needs a click) and writes the first copy right away. */
export async function chooseBackupFolder() {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (!picker)
    throw new Error('Este navegador não permite escolher uma pasta.');
  const handle = await picker({ id: 'lmup-backup', mode: 'readwrite' });
  await saveFolder(handle);
  return writeFolderBackup(handle);
}

/** Renews the permission after the browser expired it (needs a click). */
export async function reauthorizeBackupFolder() {
  const handle = await savedFolder();
  if (!handle) throw new Error('Escolha uma pasta primeiro.');
  const granted =
    (await handle.requestPermission?.({ mode: 'readwrite' })) ?? 'granted';
  if (granted !== 'granted')
    throw new Error('O navegador não liberou a pasta. Nada foi copiado.');
  return writeFolderBackup(handle);
}

export async function copyToFolderNow() {
  const handle = await savedFolder();
  if (!handle) throw new Error('Escolha uma pasta primeiro.');
  if ((await permission(handle)) !== 'granted')
    throw new Error('Reautorize a pasta para continuar copiando.');
  return writeFolderBackup(handle);
}

/** Turns the copy off. The file already in the folder is left as it is. */
export async function disableFolderBackup() {
  await storeRequest<unknown>('readwrite', (store) => store.delete(KEY));
  try {
    localStorage.removeItem(FOLDER_BACKUP_LAST);
  } catch {
    /* Nothing to forget. */
  }
  announce();
}

/**
 * Silent automatic copy: only with a saved folder, permission still granted
 * and the interval elapsed. Any failure is swallowed; the app never blocks on it.
 */
export async function runAutomaticFolderBackup(now = Date.now()) {
  try {
    if (!folderBackupSupported() || !folderBackupDue(readLast(), now))
      return false;
    const handle = await savedFolder();
    if (!handle || (await permission(handle)) !== 'granted') return false;
    await writeFolderBackup(handle);
    return true;
  } catch {
    return false;
  }
}
