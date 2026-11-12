// A15: cópia em pasta. Um arquivo só, substituído; falha nunca vira cópia pela metade.
import { beforeEach, expect, it } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  FOLDER_BACKUP_FILE,
  FOLDER_BACKUP_INTERVAL,
  folderBackupDue,
  runAutomaticFolderBackup,
  writeFolderBackup,
  type FolderHandle,
} from './folderBackup';
import { restoreJourneyBackup, validateBackup } from './backupDataService';

beforeEach(async () => {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});

/** In-memory folder: the content only changes when close() succeeds. */
function folder(options: { failOnClose?: boolean } = {}) {
  const files = new Map<string, string>();
  const handle: FolderHandle = {
    name: 'Backups',
    async getFileHandle(name) {
      return {
        async createWritable() {
          let pending = '';
          return {
            async write(data: string) {
              pending += data;
            },
            async close() {
              if (options.failOnClose) throw new Error('disco cheio');
              files.set(name, pending);
            },
          };
        },
      };
    },
  };
  return { handle, files };
}

it('grava um backup válido e restaurável no arquivo fixo', async () => {
  await saveTaskDefinition({
    title: 'Missão da pasta',
    requestId: crypto.randomUUID(),
  });
  const { handle, files } = folder();
  await writeFolderBackup(handle);
  expect([...files.keys()]).toEqual([FOLDER_BACKUP_FILE]);
  const backup = validateBackup(JSON.parse(files.get(FOLDER_BACKUP_FILE)!));
  await db.tasks.clear();
  await restoreJourneyBackup(backup);
  expect((await db.tasks.toArray()).map((task) => task.title)).toContain(
    'Missão da pasta',
  );
});

it('a cópia seguinte substitui a anterior em vez de acumular', async () => {
  const { handle, files } = folder();
  await writeFolderBackup(handle);
  const first = files.get(FOLDER_BACKUP_FILE);
  await saveTaskDefinition({ title: 'Depois', requestId: crypto.randomUUID() });
  await writeFolderBackup(handle);
  expect(files.size).toBe(1);
  expect(files.get(FOLDER_BACKUP_FILE)).not.toBe(first);
  expect(files.get(FOLDER_BACKUP_FILE)).toContain('Depois');
});

it('falha ao gravar mantém a cópia anterior e avisa quem chamou', async () => {
  const good = folder();
  await writeFolderBackup(good.handle);
  const before = good.files.get(FOLDER_BACKUP_FILE);
  const broken = folder({ failOnClose: true });
  await expect(writeFolderBackup(broken.handle)).rejects.toThrow('disco cheio');
  expect(broken.files.size).toBe(0);
  expect(good.files.get(FOLDER_BACKUP_FILE)).toBe(before);
});

it('intervalo entre cópias automáticas e silêncio fora do Chromium', async () => {
  const now = Date.parse('2026-11-12T12:00:00Z');
  expect(folderBackupDue(null, now)).toBe(true);
  expect(folderBackupDue(new Date(now - 60_000).toISOString(), now)).toBe(
    false,
  );
  expect(
    folderBackupDue(new Date(now - FOLDER_BACKUP_INTERVAL).toISOString(), now),
  ).toBe(true);
  // Data no futuro (relógio mudou) não trava a cópia para sempre.
  expect(folderBackupDue(new Date(now + 3_600_000).toISOString(), now)).toBe(
    true,
  );
  // Sem a API de pastas (ambiente de teste), nada acontece e nada quebra.
  expect(await runAutomaticFolderBackup(now)).toBe(false);
});
