import { describe, expect, it } from 'vitest';
import {
  BACKUP_DISMISSED_KEY,
  BACKUP_EXPORT_KEY,
  BACKUP_REMINDER_INTERVAL,
  BACKUP_STARTED_KEY,
  backupReminderDue,
  dismissBackupReminder,
  hasBackupContent,
  readBackupReminder,
  recordBackupExport,
  startBackupReminder,
  type BackupReminderState,
} from './backupReminder';

const now = Date.parse('2026-11-30T12:00:00Z');
const empty: BackupReminderState = {
  lastExportAt: null,
  firstDataAt: null,
  dismissedAt: null,
};
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe('lembrete opcional de backup', () => {
  it('não inicia prazo nem avisa em instalação vazia, mesmo com datas antigas', () => {
    const prefs = storage();
    const state = { ...empty, lastExportAt: '2026-01-01T00:00:00Z' };
    expect(startBackupReminder(empty, false, now, prefs)).toBe(empty);
    expect(prefs.getItem(BACKUP_STARTED_KEY)).toBeNull();
    expect(backupReminderDue(false, state, now)).toBe(false);
    expect(
      hasBackupContent({
        tasks: 0,
        projects: 0,
        events: 0,
        profile: { totalXpEarned: 0, world: { quest: 'new' } },
      }),
    ).toBe(false);
  });

  it.each(['tasks', 'projects', 'events'] as const)(
    'reconhece conteúdo em %s',
    (key) => {
      expect(
        hasBackupContent({ tasks: 0, projects: 0, events: 0, [key]: 1 }),
      ).toBe(true);
    },
  );

  it('reconhece progresso no Mundo mesmo sem missões ou XP', () => {
    expect(
      hasBackupContent({
        tasks: 0,
        projects: 0,
        events: 0,
        profile: { totalXpEarned: 0, world: { quest: 'active' } },
      }),
    ).toBe(true);
  });

  it('concede 14 dias desde o primeiro conteúdo sem exportação anterior', () => {
    const prefs = storage();
    const state = startBackupReminder(empty, true, now, prefs);
    expect(prefs.getItem(BACKUP_STARTED_KEY)).toBe(new Date(now).toISOString());
    expect(
      backupReminderDue(true, state, now + BACKUP_REMINDER_INTERVAL - 1),
    ).toBe(false);
    expect(backupReminderDue(true, state, now + BACKUP_REMINDER_INTERVAL)).toBe(
      true,
    );
    expect(startBackupReminder(state, true, now + 1000, prefs)).toBe(state);
  });

  it('reaproveita a exportação existente e não reinicia a carência ao abrir outra tela', () => {
    const prefs = storage();
    prefs.setItem(
      BACKUP_EXPORT_KEY,
      new Date(now - BACKUP_REMINDER_INTERVAL).toISOString(),
    );
    const state = readBackupReminder(prefs);
    expect(startBackupReminder(state, true, now, prefs)).toBe(state);
    expect(backupReminderDue(true, state, now)).toBe(true);
    expect(prefs.getItem(BACKUP_STARTED_KEY)).toBeNull();
  });

  it('adiar persiste por 14 dias e uma exportação posterior reinicia o prazo', () => {
    const prefs = storage();
    prefs.setItem(BACKUP_EXPORT_KEY, '2026-11-01T12:00:00Z');
    dismissBackupReminder(readBackupReminder(prefs), now, prefs);
    expect(prefs.getItem(BACKUP_DISMISSED_KEY)).toBe(
      new Date(now).toISOString(),
    );
    expect(
      backupReminderDue(
        true,
        readBackupReminder(prefs),
        now + BACKUP_REMINDER_INTERVAL - 1,
      ),
    ).toBe(false);
    expect(
      backupReminderDue(
        true,
        readBackupReminder(prefs),
        now + BACKUP_REMINDER_INTERVAL,
      ),
    ).toBe(true);
    recordBackupExport(now + BACKUP_REMINDER_INTERVAL, prefs);
    expect(
      backupReminderDue(
        true,
        readBackupReminder(prefs),
        now + BACKUP_REMINDER_INTERVAL + 1,
      ),
    ).toBe(false);
  });

  it('ignora datas inválidas ou futuras sem travar a tela nem avisar imediatamente', () => {
    const state = {
      lastExportAt: 'inválido',
      firstDataAt: '',
      dismissedAt: '2099-01-01',
    };
    expect(backupReminderDue(true, state, now)).toBe(false);
    const started = startBackupReminder(state, true, now, storage());
    expect(backupReminderDue(true, started, now)).toBe(false);
    expect(
      backupReminderDue(true, started, now + BACKUP_REMINDER_INTERVAL),
    ).toBe(true);
  });

  it('continua funcionando quando preferências não podem ser lidas ou gravadas', () => {
    const blocked = {
      getItem: () => {
        throw Error('blocked');
      },
      setItem: () => {
        throw Error('blocked');
      },
    };
    expect(readBackupReminder(blocked)).toEqual(empty);
    const due = { ...empty, lastExportAt: '2026-11-01T12:00:00Z' };
    const dismissed = dismissBackupReminder(due, now, blocked);
    expect(backupReminderDue(true, dismissed, now)).toBe(false);
    expect(() => recordBackupExport(now, blocked)).not.toThrow();
  });
});
