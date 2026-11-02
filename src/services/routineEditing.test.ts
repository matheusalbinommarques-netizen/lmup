import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveArea, deleteArea } from './areaService';
import { saveRoutine } from './routineService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  ensureOccurrence,
  plannedOccurrences,
  recordProgress,
} from './occurrenceService';
import { newSavedSession, saveSession } from './savedSessionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-02T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
const create = (areaId = 0) =>
  saveTaskDefinition({
    title: 'Ação original',
    effort: 'micro',
    requestId: crypto.randomUUID(),
    areaId,
    plannedDate: '2026-11-02',
  });
const routine = (taskId: number, defaultAreaId?: number) => ({
  id: 'morning',
  name: 'Manhã',
  defaultAreaId,
  days: [1, 2],
  startDate: '2026-11-02',
  entries: [{ taskId, time: '08:00' }],
});

describe('área padrão e edição de rotina', () => {
  it('persiste o padrão sem reclassificar missões e mantém rotinas antigas válidas', async () => {
    const health = await saveArea('Saúde'),
      home = await saveArea('Casa');
    const id = await create(home);
    await saveRoutine(routine(id, health));
    expect((await db.tasks.get(id))!.areaId).toBe(home);
    const current = (await db.routines.get('morning'))!;
    await saveRoutine({
      ...current,
      defaultAreaId: home,
      expectedRevision: current.revision,
    });
    expect((await db.tasks.get(id))!.areaId).toBe(home);
    const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(copy.data.routines[0].defaultAreaId).toBe(home);
    await restoreJourneyBackup(copy);
    expect((await db.routines.get('morning'))!.defaultAreaId).toBe(home);
    delete copy.data.routines[0].defaultAreaId;
    expect(() => validateBackup(copy)).not.toThrow();
  });
  it('recusa áreas inexistentes e transfere o padrão ao excluir uma área', async () => {
    const health = await saveArea('Saúde'),
      home = await saveArea('Casa'),
      id = await create();
    await expect(saveRoutine(routine(id, 999))).rejects.toThrow('área padrão');
    await saveRoutine(routine(id, health));
    const previous = (await db.routines.get('morning'))!;
    await deleteArea(health, home);
    expect((await db.routines.get('morning'))!.defaultAreaId).toBe(home);
    await expect(
      saveRoutine({ ...previous, expectedRevision: previous.revision }),
    ).rejects.toThrow('outra aba');
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    backup.data.routines[0].defaultAreaId = 999;
    expect(() => validateBackup(backup)).toThrow('área padrão');
  });
  it('edição congela também as atividades ainda pendentes de uma sessão iniciada', async () => {
    const id = await create();
    await saveRoutine(routine(id));
    const row = await ensureOccurrence(id);
    const session = await saveSession(newSavedSession('Manhã', [row.id]));
    const before = (await db.profile.get(1))!;
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      ...task,
      description: task.description ?? undefined,
      title: 'Ação revisada',
      effort: 'medium',
      steps: ['Novo passo'],
      editId: id,
      expectedRevision: task.definitionRevision,
      requestId: crypto.randomUUID(),
    });
    expect(await db.occurrences.get(row.id)).toEqual(row);
    expect(await db.savedMissionSessions.get(session.id)).toEqual(session);
    expect(await db.profile.get(1)).toEqual(before);
    expect(await db.activityEvents.count()).toBe(0);
    vi.setSystemTime(new Date('2026-11-03T15:00:00'));
    const [next] = await plannedOccurrences('2026-11-03', '2026-11-03');
    expect(next).toMatchObject({
      title: 'Ação revisada',
      baseXp: 100,
      steps: ['Novo passo'],
    });
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    await restoreJourneyBackup(backup);
    expect(await db.occurrences.get(row.id)).toEqual(row);
  });
  it('edição da rotina preserva composição e horários da sessão existente', async () => {
    const first = await create(),
      second = await create();
    await saveRoutine(routine(first));
    const row = await ensureOccurrence(first);
    const session = await saveSession(newSavedSession('Manhã', [row.id]));
    const old = (await db.routines.get('morning'))!;
    await saveRoutine({
      ...old,
      entries: [{ taskId: second, time: '10:00' }],
      expectedRevision: old.revision,
    });
    expect(await db.savedMissionSessions.get(session.id)).toEqual(session);
    expect(await db.occurrences.get(row.id)).toEqual(row);
  });
  it('progresso premiado e recibos sobrevivem à edição do cadastro', async () => {
    const id = await saveTaskDefinition({
      title: 'Ler',
      effort: 'micro',
      requestId: crypto.randomUUID(),
      plannedDate: '2026-11-02',
      tracking: { method: 'time', target: 30 },
    });
    await saveRoutine(routine(id));
    const row = await ensureOccurrence(id);
    await saveSession(newSavedSession('Manhã', [row.id]));
    await recordProgress({
      occurrenceId: row.id,
      expectedRevision: row.revision,
      requestId: 'first-half',
      value: 15,
      executedAt: new Date().toISOString(),
    });
    const frozen = (await db.occurrences.get(row.id))!,
      events = await db.activityEvents.toArray(),
      profile = await db.profile.get(1);
    const task = (await db.tasks.get(id))!;
    await saveTaskDefinition({
      ...task,
      description: task.description ?? undefined,
      editId: id,
      expectedRevision: task.definitionRevision,
      requestId: crypto.randomUUID(),
      title: 'Ler revisado',
      effort: 'deep',
    });
    expect(await db.occurrences.get(row.id)).toEqual(frozen);
    expect(await db.activityEvents.toArray()).toEqual(events);
    expect(await db.profile.get(1)).toEqual(profile);
    await recordProgress({
      occurrenceId: row.id,
      expectedRevision: frozen.revision,
      requestId: 'second-half',
      value: 30,
      executedAt: new Date().toISOString(),
    });
    expect((await db.occurrences.get(row.id))!.due.gold).toBe(5);
  });
});
