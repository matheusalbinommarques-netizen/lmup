import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import { ensureOccurrence, recordProgress } from './occurrenceService';
import { startOrResumeSession } from './savedSessionService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
const day = '2026-11-02';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(day + 'T15:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());
async function setup() {
  const ids = [];
  for (const title of ['Alongar', 'Respirar'])
    ids.push(
      await saveTaskDefinition({
        title,
        plannedDate: day,
        effort: 'small',
        tracking: { method: 'time', target: 40 },
        requestId: crypto.randomUUID(),
      }),
    );
  await saveRoutine({
    id: 'routine-time',
    name: 'Minha rotina',
    days: [0, 1, 2, 3, 4, 5, 6],
    startDate: day,
    entries: ids.map((taskId, i) => ({ taskId, time: i ? '09:00' : '08:00' })),
  });
  return ids;
}
async function edit(id: number, time: string | null) {
  const task = (await db.tasks.get(id))!;
  return saveTaskDefinition({
    ...task,
    description: task.description ?? '',
    editId: id,
    expectedRevision: task.definitionRevision,
    plannedTime: time,
    requestId: crypto.randomUUID(),
  });
}
it('editar fora da rotina sincroniza somente o horário escolhido e preserva execução, recibos e backup', async () => {
  const [id] = await setup();
  const row = await ensureOccurrence(id);
  const session = await startOrResumeSession('Em andamento', [row.id]);
  await recordProgress({
    occurrenceId: row.id,
    expectedRevision: row.revision,
    value: 10,
    executedAt: new Date().toISOString(),
    requestId: 'partial-time',
    sessionId: session.id,
  });
  const future = await ensureOccurrence(id, '2026-11-03');
  const frozen = await db.occurrences.get(row.id),
    profile = await db.profile.get(1),
    receipts = await db.activityEvents.toArray(),
    records = await db.executionRecords.toArray(),
    before = (await db.routines.get('routine-time'))!;
  await edit(id, '10:45');
  const routine = (await db.routines.get(before.id))!;
  expect(routine.entries[0].time).toBe('10:45');
  expect({
    ...routine,
    entries: before.entries,
    revision: before.revision,
  }).toEqual(before);
  expect(routine.revision).toBe(before.revision + 1);
  expect((await db.tasks.get(id))?.plannedTime).toBe('10:45');
  expect(await db.occurrences.get(row.id)).toEqual(frozen);
  expect((await db.occurrences.get(future.id))?.plannedTime).toBe('10:45');
  expect(await db.savedMissionSessions.get(session.id)).toEqual(session);
  expect(await db.profile.get(1)).toEqual(profile);
  expect(await db.activityEvents.toArray()).toEqual(receipts);
  expect(await db.executionRecords.toArray()).toEqual(records);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await restoreJourneyBackup(backup);
  expect((await db.routines.get(before.id))?.entries[0].time).toBe('10:45');
  expect(await db.occurrences.get(row.id)).toEqual(frozen);
});
it('remover horário e salvar outro rascunho antigo não perde sincronização', async () => {
  const [id] = await setup(),
    task = (await db.tasks.get(id))!,
    routine = (await db.routines.get('routine-time'))!;
  await edit(id, null);
  expect((await db.tasks.get(id))?.plannedTime).toBeNull();
  expect((await db.routines.get(routine.id))?.entries[0].time).toBeNull();
  await expect(
    saveTaskDefinition({
      ...task,
      description: task.description ?? '',
      editId: id,
      expectedRevision: task.definitionRevision,
      plannedTime: '12:00',
      requestId: 'stale-task',
    }),
  ).rejects.toThrow('outra aba');
  await expect(
    saveRoutine({ ...routine, expectedRevision: routine.revision }),
  ).rejects.toThrow('outra aba');
});
it('edições concorrentes são atômicas entre missão e rotina', async () => {
  const [id] = await setup(),
    task = (await db.tasks.get(id))!;
  const results = await Promise.allSettled(
    ['11:00', '12:00'].map((plannedTime) =>
      saveTaskDefinition({
        ...task,
        description: task.description ?? '',
        editId: id,
        expectedRevision: task.definitionRevision,
        plannedTime,
        requestId: crypto.randomUUID(),
      }),
    ),
  );
  expect(results.filter((row) => row.status === 'fulfilled')).toHaveLength(1);
  const updated = (await db.tasks.get(id))!;
  expect((await db.routines.get('routine-time'))?.entries[0].time).toBe(
    updated.plannedTime,
  );
});
it('horário inválido e alteração de recorrência continuam recusados sem mudanças parciais', async () => {
  const [id] = await setup(),
    task = (await db.tasks.get(id))!,
    routine = await db.routines.get('routine-time');
  await expect(edit(id, '25:90')).rejects.toThrow('horário');
  await expect(
    saveTaskDefinition({
      ...task,
      description: task.description ?? '',
      editId: id,
      expectedRevision: task.definitionRevision,
      recurrence: { kind: 'daily', startDate: day },
      requestId: 'bad-days',
    }),
  ).rejects.toThrow('dias');
  expect(await db.tasks.get(id)).toEqual(task);
  expect(await db.routines.get('routine-time')).toEqual(routine);
});
