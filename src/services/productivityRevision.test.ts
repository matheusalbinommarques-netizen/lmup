import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  currentOccurrences,
  ensureOccurrence,
  recordProgress,
  savePlanVersion,
} from './occurrenceService';
import { reconcileProductivity } from './productivityLifecycle';
import { startSelectedSession } from './savedSessionService';
import { saveRoutine } from './routineService';
import { completeTask } from './taskService';
import { readJourneySnapshot } from './journeyQuery';
import { journeyQuery } from './journeyQuery';
import { firstValueFrom } from 'rxjs';
import { todayView } from '$lib/journey/todayView';
import { skipMission, restartPreview, restartMission } from './missionActions';
import { saveArea } from './areaService';
import {
  previewAreaMerge,
  mergeAreas,
  previewRoutineMerge,
  mergeRoutines,
} from './mergeService';
import { createJourneyBackup, restoreJourneyBackup } from './backupDataService';

const monday = '2026-11-02';
const time = (day: string, hour = '12:00:00') =>
  vi.setSystemTime(new Date(`${day}T${hour}`));
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  time(monday);
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

it('carrega a jornada dentro da consulta reativa sem tentar abrir transações de escrita', async () => {
  const data = await firstValueFrom(journeyQuery());
  expect(data.profile?.id).toBe(1);
  expect(data.plannedToday).toEqual([]);
});
const create = (title: string, recurrence = false) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    plannedDate: monday,
    effort: 'medium',
    tracking: { method: 'time', target: 40 },
    recurrence: recurrence ? { kind: 'daily', startDate: monday } : null,
  });
async function progress(taskId: number, value: number) {
  const row = (await currentOccurrences()).find(
    (row) => row.taskId === taskId,
  )!;
  const stored = await ensureOccurrence(taskId, row.originDate);
  await recordProgress({
    occurrenceId: stored.id,
    expectedRevision: stored.revision,
    requestId: crypto.randomUUID(),
    value,
    executedAt: new Date().toISOString(),
  });
  return (await db.occurrences.get(stored.id))!;
}
async function routine(
  id: string,
  taskId: number,
  days = [1, 3, 5],
  custom?: number[],
) {
  await saveRoutine({
    id,
    name: id,
    days,
    startDate: monday,
    entries: [{ taskId, time: '19:30', days: custom }],
  });
}

it('substitui às 00h locais, conserva parcial confirmada e libera somente a referência antiga da sessão', async () => {
  const daily = await create('Diária', true),
    once = await create('Pontual');
  const partial = await progress(daily, 20);
  const session = await startSelectedSession(
    (await currentOccurrences()).filter((row) =>
      [daily, once].includes(row.taskId),
    ),
  );
  const before = await createJourneyBackup();
  time('2026-11-03', '00:00:00');
  await Promise.all([reconcileProductivity(), reconcileProductivity()]);
  const after = await createJourneyBackup();
  expect(after.data.profile).toEqual(before.data.profile);
  expect(after.data.activityEvents).toEqual(before.data.activityEvents);
  expect(after.data.executionRecords).toEqual(before.data.executionRecords);
  expect(await db.occurrences.get(partial.id)).toMatchObject({
    value: 20,
    due: partial.due,
    supersededBy: '2026-11-03',
  });
  expect(
    (await db.savedMissionSessions.get(session.id))?.occurrenceIds,
  ).toEqual([`mission:${once}:once`]);
  expect(
    (await currentOccurrences()).find((row) => row.taskId === daily),
  ).toMatchObject({
    originDate: '2026-11-03',
    value: 0,
    due: { xp: 0, gold: 0, food: 0 },
  });
  await restoreJourneyBackup(after);
  expect((await db.occurrences.get(partial.id))?.value).toBe(20);
});

it('rejeita gravação de aba antiga mesmo antes da reconciliação e não recompensa execução substituída', async () => {
  const id = await create('Antiga', true),
    row = await progress(id, 20);
  const before = await createJourneyBackup();
  time('2026-11-03');
  await expect(
    recordProgress({
      occurrenceId: row.id,
      expectedRevision: row.revision,
      requestId: crypto.randomUUID(),
      value: 40,
      executedAt: new Date().toISOString(),
    }),
  ).rejects.toThrow('substituída');
  expect((await createJourneyBackup()).data.profile).toEqual(
    before.data.profile,
  );
  expect((await db.occurrences.get(row.id))?.value).toBe(20);
});

it('calendário individual substitui no próximo dia da missão e ignora o horário', async () => {
  const inherited = await create('Flexões'),
    custom = await create('Caminhada');
  await saveRoutine({
    id: 'exercicios',
    name: 'Exercícios',
    days: [1, 3, 5],
    startDate: monday,
    entries: [
      { taskId: inherited, time: '23:59' },
      { taskId: custom, time: '23:59', days: [2, 4] },
    ],
  });
  const partial = await progress(inherited, 20);
  time('2026-11-03', '00:00:00');
  await reconcileProductivity();
  expect(
    (await currentOccurrences()).find((row) => row.taskId === inherited)
      ?.originDate,
  ).toBe(monday);
  expect(
    (await currentOccurrences()).find((row) => row.taskId === custom)
      ?.originDate,
  ).toBe('2026-11-03');
  expect((await db.occurrences.get(partial.id))?.supersededBy).toBeUndefined();
  time('2026-11-04', '00:00:00');
  await reconcileProductivity();
  expect(
    (await currentOccurrences()).find((row) => row.taskId === inherited),
  ).toMatchObject({ originDate: '2026-11-04', value: 0 });
  expect(
    (await currentOccurrences()).find((row) => row.taskId === custom)
      ?.originDate,
  ).toBe('2026-11-03');
});

it('muitos ciclos não realizados produzem uma única pendência e nenhuma recompensa por substituição', async () => {
  const id = await create('Diária', true);
  await ensureOccurrence(id, monday);
  const profile = await db.profile.get(1);
  time('2026-12-03');
  await reconcileProductivity();
  expect(
    (await currentOccurrences()).filter((row) => row.taskId === id),
  ).toHaveLength(1);
  expect(await db.occurrences.count()).toBe(1);
  expect(await db.profile.get(1)).toEqual(profile);
  expect(await db.activityEvents.count()).toBe(0);
});

it('pontual atravessa o dia com progresso intacto e entra no plano sem reagendamento', async () => {
  const id = await create('Objetivo');
  const row = await progress(id, 20);
  time('2026-11-07');
  const snapshot = await readJourneySnapshot(),
    view = todayView(snapshot, '2026-11-07');
  expect(view.planned.find((item) => item.taskId === id)).toMatchObject({
    id: row.id,
    value: 20,
    plannedDate: monday,
  });
  expect(view.old).toEqual([]);
  expect(view.completed).toBe(0);
  await progress(id, 40);
  expect(todayView(await readJourneySnapshot(), '2026-11-07').completed).toBe(
    1,
  );
});

it('reinício usa correção compensatória sem duplicar XP, moedas ou registros de conclusão', async () => {
  const id = await create('Recomeçar');
  const row = await progress(id, 20);
  const prior = (await db.profile.get(1))!;
  const { preview } = await restartPreview(row.id, row.revision);
  await restartMission(row.id, row.revision, preview.due, preview.projectDebt);
  expect((await db.occurrences.get(row.id))?.value).toBe(0);
  expect((await db.profile.get(1))?.gold).toBe(prior.gold);
  expect((await db.profile.get(1))?.rewardDebt?.xp).toBe(row.due.xp);
  await expect(restartPreview(row.id, row.revision)).rejects.toThrow('pontual');
  const done = await progress(id, 40);
  expect((await db.profile.get(1))?.totalXpEarned).toBe(done.due.xp);
  expect((await db.profile.get(1))?.rewardDebt).toEqual({
    xp: 0,
    gold: 0,
    food: 0,
  });
  await restoreJourneyBackup(await createJourneyBackup());
});

it('pular preserva ganho parcial, sai do denominador e pode ser desfeito somente no ciclo válido', async () => {
  const a = await create('A'),
    b = await create('B');
  await routine('rotina', a, [0, 1, 2, 3, 4, 5, 6]);
  const partial = await progress(a, 20);
  await progress(b, 40);
  const profile = await db.profile.get(1);
  await skipMission(partial.id, partial.revision, true);
  const view = todayView(await readJourneySnapshot(), monday);
  expect(view.planned).toHaveLength(1);
  expect(view.completed).toBe(1);
  expect(await db.profile.get(1)).toEqual(profile);
  const skipped = (await db.occurrences.get(partial.id))!;
  await skipMission(skipped.id, skipped.revision, false);
  expect(todayView(await readJourneySnapshot(), monday).planned).toHaveLength(
    2,
  );
  const restored = (await db.occurrences.get(partial.id))!;
  await skipMission(restored.id, restored.revision, true);
  time('2026-11-03');
  await reconcileProductivity();
  await expect(
    skipMission(
      partial.id,
      (await db.occurrences.get(partial.id))!.revision,
      false,
    ),
  ).rejects.toThrow('disponível');
  expect(
    (await currentOccurrences()).find((row) => row.taskId === a)?.skipped,
  ).toBeUndefined();
  await restoreJourneyBackup(await createJourneyBackup());
});

it('pular a última missão em foco mantém outra missão válida acessível na sessão', async () => {
  const a = await create('Primeira'),
    b = await create('Última');
  await routine('rotina', b, [0, 1, 2, 3, 4, 5, 6]);
  const first = await ensureOccurrence(a, monday),
    last = await ensureOccurrence(b, monday);
  await startSelectedSession([first, last], 'Fila');
  const session = (await db.savedMissionSessions.toArray())[0];
  await db.savedMissionSessions.update(session.id, { cursor: 1 });
  await skipMission(last.id, last.revision, true);
  expect(await db.savedMissionSessions.get(session.id)).toMatchObject({
    status: 'active',
    cursor: 0,
    occurrenceIds: [first.id],
  });
  await restoreJourneyBackup(await createJourneyBackup());
});

it('alterar dias padrão afeta herança e preserva dias personalizados após backup', async () => {
  const a = await create('Herdada'),
    b = await create('Personalizada');
  await saveRoutine({
    id: 'r',
    name: 'R',
    days: [1, 3, 5],
    startDate: monday,
    entries: [
      { taskId: a, time: null },
      { taskId: b, time: '13:00', days: [2, 4] },
    ],
  });
  const r = (await db.routines.get('r'))!;
  await saveRoutine({ ...r, days: [0, 6], expectedRevision: r.revision });
  expect((await db.tasks.get(a))?.recurrence?.days).toEqual([0, 6]);
  expect((await db.tasks.get(b))?.recurrence?.days).toEqual([2, 4]);
  await restoreJourneyBackup(await createJourneyBackup());
  expect((await db.routines.get('r'))?.entries[1].days).toEqual([2, 4]);
});

it('desativa futuras revisões sem converter missão ou apagar conclusão, economia e backup anterior', async () => {
  const id = await create('Estudo');
  await progress(id, 40);
  await db.tasks.update(id, {
    reviewEnabled: true,
    reviewIntervalDays: 7,
    reviewDueDate: '2026-11-03',
  });
  const old = await createJourneyBackup();
  await restoreJourneyBackup(old);
  expect(await db.tasks.get(id)).toMatchObject({
    reviewEnabled: false,
    completed: true,
    recurrence: null,
  });
  expect((await createJourneyBackup()).data.activityEvents).toEqual(
    old.data.activityEvents,
  );
  const profile = await db.profile.get(1);
  await completeTask(id);
  expect(await db.profile.get(1)).toEqual(profile);
});

it('mescla áreas preservando IDs, recibos, classificação histórica e metadados arquivados', async () => {
  const source = await saveArea(
      'Origem',
      undefined,
      'estudo',
      'Descrição preservada',
    ),
    destination = await saveArea('Destino', undefined, 'exercicio');
  const id = await create('Área');
  await db.tasks.update(id, { areaId: source });
  await savePlanVersion((await db.tasks.get(id))!);
  const row = await progress(id, 20),
    before = await createJourneyBackup();
  const preview = await previewAreaMerge(source, destination),
    request = crypto.randomUUID();
  await mergeAreas(source, destination, preview.token, request);
  await mergeAreas(source, destination, preview.token, request);
  expect((await db.tasks.get(id))?.areaId).toBe(destination);
  expect(await db.areas.get(source)).toMatchObject({
    archived: true,
    mergedInto: destination,
    descricao: 'Descrição preservada',
  });
  expect((await db.occurrences.get(row.id))?.areaId).toBe(source);
  expect((await createJourneyBackup()).data.activityEvents).toEqual(
    before.data.activityEvents,
  );
  expect(
    (await readJourneySnapshot()).areas.some((row) => row.id === source),
  ).toBe(false);
  await restoreJourneyBackup(await createJourneyBackup());
});

it('mesclagem recusa prévia antiga e reverte transferência inteira se a gravação final falhar', async () => {
  const source = await saveArea('Origem'),
    destination = await saveArea('Destino');
  const id = await create('A');
  await db.tasks.update(id, { areaId: source });
  await savePlanVersion((await db.tasks.get(id))!);
  const preview = await previewAreaMerge(source, destination);
  await saveArea('Destino alterado', destination);
  await expect(
    mergeAreas(source, destination, preview.token, crypto.randomUUID()),
  ).rejects.toThrow('mudaram');
  const current = await previewAreaMerge(source, destination),
    before = await createJourneyBackup();
  const fail = () => {
    throw new Error('falha sintética');
  };
  db.areas.hook('updating', fail);
  try {
    await expect(
      mergeAreas(source, destination, current.token, crypto.randomUUID()),
    ).rejects.toThrow('sintética');
  } finally {
    db.areas.hook('updating').unsubscribe(fail);
  }
  expect((await createJourneyBackup()).data).toEqual(before.data);
});

it('mescla rotinas preservando dias efetivos, herança do destino, horários e identidades', async () => {
  const a = await create('Da origem'),
    b = await create('Do destino');
  await routine('origem', a, [1, 3, 5]);
  await routine('destino', b, [2, 4]);
  const row = await progress(a, 20),
    before = await createJourneyBackup();
  const preview = await previewRoutineMerge('origem', 'destino'),
    request = crypto.randomUUID();
  await mergeRoutines('origem', 'destino', preview.token, request);
  await mergeRoutines('origem', 'destino', preview.token, request);
  const destination = (await db.routines.get('destino'))!;
  expect(destination.entries.find((entry) => entry.taskId === a)).toMatchObject(
    { days: [1, 3, 5], time: '19:30' },
  );
  expect(
    destination.entries.find((entry) => entry.taskId === b)?.days,
  ).toBeUndefined();
  expect(await db.tasks.get(a)).toMatchObject({
    routineId: 'destino',
    recurrence: { days: [1, 3, 5] },
  });
  expect((await db.occurrences.get(row.id))?.routineId).toBe('origem');
  expect((await createJourneyBackup()).data.activityEvents).toEqual(
    before.data.activityEvents,
  );
  expect(await db.routines.get('origem')).toMatchObject({
    status: 'archived',
    entries: [],
    mergedInto: 'destino',
  });
  await restoreJourneyBackup(await createJourneyBackup());
});
