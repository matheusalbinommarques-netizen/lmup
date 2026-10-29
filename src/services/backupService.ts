import { browser } from '$app/environment';
import {
  BACKUP_LIMIT,
  createJourneyBackup,
  inspectJourneyBackup,
  validateBackup,
  latestRecoveryBackup,
  resetJourney,
  restoreJourneyBackup,
} from './backupDataService';

function download(data: unknown, prefix: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function parseBackupFile(file: File): Promise<unknown> {
  if (!file || file.size > BACKUP_LIMIT || typeof file.text !== 'function')
    throw new Error('Selecione um backup JSON de até 25 MB.');
  try {
    return JSON.parse(await file.text());
  } catch {
    throw new Error('O arquivo não contém um JSON válido.');
  }
}

export async function exportData(): Promise<void> {
  if (browser) {
    download(await createJourneyBackup(), 'lmup-backup');
    try {
      localStorage.setItem('lmup:last-export', new Date().toISOString());
    } catch {
      /* Export remains usable without preference storage. */
    }
  }
}

export async function inspectBackup(file: File) {
  return inspectJourneyBackup(await parseBackupFile(file));
}

export async function importData(file: File): Promise<void> {
  if (browser) await restoreJourneyBackup(await parseBackupFile(file));
}

export async function clearAllData(): Promise<void> {
  if (browser) await resetJourney();
}

export async function hasRecoveryData(): Promise<boolean> {
  return !!(await latestRecoveryBackup());
}

export async function exportRecoveryData(): Promise<void> {
  const backup = await latestRecoveryBackup();
  if (!backup)
    throw new Error(
      'Ainda não há cópia local de recuperação. Exporte seus dados para criar um backup externo.',
    );
  if (browser) download(backup, 'lmup-recuperacao');
}

export async function prepareBackup(file: File) {
  const backup = validateBackup(await parseBackupFile(file));
  return { backup, summary: inspectJourneyBackup(backup) };
}
