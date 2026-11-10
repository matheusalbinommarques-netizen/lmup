export const BACKUP_EXPORT_KEY = 'lmup:last-export';
export const BACKUP_STARTED_KEY = 'lmup:backup-reminder-started';
export const BACKUP_DISMISSED_KEY = 'lmup:backup-reminder-dismissed';
export const BACKUP_REMINDER_EVENT = 'lmup:backup-reminder-changed';
export const BACKUP_REMINDER_INTERVAL = 14 * 24 * 60 * 60 * 1000;

export type BackupReminderState = {
  lastExportAt: string | null;
  firstDataAt: string | null;
  dismissedAt: string | null;
};
type Reader = Pick<Storage, 'getItem'>;
type Writer = Pick<Storage, 'setItem'>;

export function hasBackupContent(data: {
  tasks: number;
  projects: number;
  events: number;
  profile?: { totalXpEarned: number; world?: { quest: string } };
}): boolean {
  return (
    data.tasks > 0 ||
    data.projects > 0 ||
    data.events > 0 ||
    (data.profile?.totalXpEarned ?? 0) > 0 ||
    ['active', 'solved'].includes(data.profile?.world?.quest ?? '')
  );
}

export function readBackupReminder(storage?: Reader): BackupReminderState {
  const empty = { lastExportAt: null, firstDataAt: null, dismissedAt: null };
  try {
    const source =
      storage ?? (typeof window === 'undefined' ? null : window.localStorage);
    return source
      ? {
          lastExportAt: source.getItem(BACKUP_EXPORT_KEY),
          firstDataAt: source.getItem(BACKUP_STARTED_KEY),
          dismissedAt: source.getItem(BACKUP_DISMISSED_KEY),
        }
      : empty;
  } catch {
    return empty;
  }
}

function referenceTime(state: BackupReminderState, now: number): number | null {
  const dates = Object.values(state)
    .map((value) => (value ? Date.parse(value) : NaN))
    .filter((value) => Number.isFinite(value) && value > 0 && value <= now);
  return dates.length ? Math.max(...dates) : null;
}

export function backupReminderDue(
  hasContent: boolean,
  state: BackupReminderState,
  now = Date.now(),
): boolean {
  const reference = referenceTime(state, now);
  return (
    hasContent &&
    reference !== null &&
    now - reference >= BACKUP_REMINDER_INTERVAL
  );
}

function persist(key: string, value: string, storage?: Writer) {
  try {
    const target =
      storage ?? (typeof window === 'undefined' ? null : window.localStorage);
    target?.setItem(key, value);
  } catch {
    // Export and dismissal still work in the current view without preference storage.
  }
}

export function startBackupReminder(
  state: BackupReminderState,
  hasContent: boolean,
  now = Date.now(),
  storage?: Writer,
): BackupReminderState {
  if (!hasContent || referenceTime(state, now) !== null) return state;
  const firstDataAt = new Date(now).toISOString();
  persist(BACKUP_STARTED_KEY, firstDataAt, storage);
  return { ...state, firstDataAt };
}

export function dismissBackupReminder(
  state: BackupReminderState,
  now = Date.now(),
  storage?: Writer,
): BackupReminderState {
  const dismissedAt = new Date(now).toISOString();
  persist(BACKUP_DISMISSED_KEY, dismissedAt, storage);
  return { ...state, dismissedAt };
}

export function recordBackupExport(now = Date.now(), storage?: Writer) {
  const lastExportAt = new Date(now).toISOString();
  persist(BACKUP_EXPORT_KEY, lastExportAt, storage);
  if (typeof window !== 'undefined')
    window.dispatchEvent(
      new CustomEvent(BACKUP_REMINDER_EVENT, { detail: lastExportAt }),
    );
}
