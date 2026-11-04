import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import {
  ensureOccurrence,
  recordProgress,
  plannedOccurrences,
  makeOccurrence,
} from './occurrenceService';
import { changeToday, occurrenceEligibility } from './dailyPlanningService';
import {
  startOrResumeSession,
  startSelectedSession,
  completeSessionOccurrence,
} from './savedSessionService';
import { readJourneySnapshot } from './journeyQuery';
import { todayView } from '$lib/journey/todayView';
import { summarizeSession } from './sessionSummary';
import { completeTask } from './taskService';
import { previewTaskRemoval, removeTask } from './taskRemoval';
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
const create = (
  title = 'Atividade',
  plannedDate: string | null = day,
  tracking = false,
) =>
  saveTaskDefinition({
    title,
    plannedDate,
    requestId: crypto.randomUUID(),
    effort: 'medium',
    ...(tracking ? { tracking: { method: 'time' as const, target: 40 } } : {}),
  });
async function progress(
  id: string,
  value: number,
  correction = false,
  sessionId?: string,
) {
  const row = (await db.occurrences.get(id))!;
  return recordProgress({
    occurrenceId: id,
    expectedRevision: row.revision,
    value,
    correction,
    sessionId,
    requestId: crypto.randomUUID(),
    executedAt: new Date().toISOString(),
  });
}
it('retira de hoje sem arquivar, descartar, apagar ou movimentar recursos e restaura após backup', async () => {
  const id = await create(),
    row = await ensureOccurrence(id),
    before = await readJourneySnapshot();
  await changeToday({ row, action: 'remove', day, requestId: 'remove-one' });
  let data = await readJourneySnapshot();
  expect(data.tasks).toEqual(before.tasks);
  expect(data.events).toEqual(before.events);
  expect(data.profile).toEqual(before.profile);
  expect(data.occurrences[0].status).toBe(row.status);
  expect(todayView(data, day).planned).toHaveLength(0);
  expect(todayView(data, day).removed).toHaveLength(1);
  const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
  await restoreJourneyBackup(copy);
  data = await readJourneySnapshot();
  expect(todayView(data, day).pending).toHaveLength(0);
  await changeToday({
    row: data.occurrences[0],
    action: 'restore',
    day,
    requestId: 'restore-one',
  });
  expect(await plannedOccurrences(day, day)).toHaveLength(1);
});
it('progresso parcial exige confirmação e permanece intacto inclusive dentro da sessão', async () => {
  const id = await create('Tempo', day, true),
    row = await ensureOccurrence(id);
  const session = await startOrResumeSession('Minha sessão', [row.id]);
  await progress(row.id, 10, false, session.id);
  const current = (await db.occurrences.get(row.id))!,
    before = await readJourneySnapshot();
  await expect(
    changeToday({ row: current, action: 'remove', day, requestId: 'unsafe' }),
  ).rejects.toThrow('Confirme');
  await changeToday({
    row: current,
    action: 'remove',
    day,
    requestId: 'safe',
    acknowledged: true,
  });
  const data = await readJourneySnapshot();
  expect(data.occurrences[0]).toMatchObject({
    value: 10,
    status: 'partial',
    due: current.due,
    modifiers: current.modifiers,
  });
  expect(data.events).toEqual(before.events);
  expect(data.executionRecords).toEqual(before.executionRecords);
  expect(await db.savedMissionSessions.get(session.id)).toEqual(session);
  expect(todayView(data, day).planned).toHaveLength(0);
  await progress(row.id, 40, false, session.id);
  expect((await db.occurrences.get(row.id))?.status).toBe('completed');
  expect(
    todayView(await readJourneySnapshot(), day).completedEvents,
  ).toHaveLength(1);
  expect(todayView(await readJourneySnapshot(), day).planned).toHaveLength(0);
});
it('retirada é diária e pontuais antigas entram automaticamente no plano seguinte', async () => {
  const id = await create(),
    row = await ensureOccurrence(id);
  await changeToday({ row, action: 'remove', day, requestId: 'remove' });
  vi.setSystemTime(new Date('2026-11-03T15:00:00'));
  const view = todayView(await readJourneySnapshot(), '2026-11-03');
  expect(view.planned.map((item) => item.id)).toContain(row.id);
  expect(view.old).toEqual([]);
  expect(view.removed).toHaveLength(0);
});
it('reagendamento preserva identidade, progresso e recibos, mas não modifica sessões congeladas', async () => {
  const id = await create('Parcial', day, true),
    row = await ensureOccurrence(id);
  await progress(row.id, 10);
  const current = (await db.occurrences.get(row.id))!,
    before = await readJourneySnapshot();
  await changeToday({
    row: current,
    action: 'reschedule',
    day,
    targetDate: '2026-11-03',
    acknowledged: true,
    requestId: 'move',
  });
  const moved = (await db.occurrences.get(row.id))!;
  expect(moved).toMatchObject({
    id: row.id,
    originDate: day,
    plannedDate: '2026-11-03',
    value: 10,
    due: current.due,
  });
  expect((await readJourneySnapshot()).events).toEqual(before.events);
  expect((await readJourneySnapshot()).profile).toEqual(before.profile);
  const other = await create('Congelada'),
    otherRow = await ensureOccurrence(other);
  await startOrResumeSession('Foco', [otherRow.id]);
  await expect(
    changeToday({
      row: otherRow,
      action: 'reschedule',
      day,
      targetDate: '2026-11-03',
      acknowledged: true,
      requestId: 'frozen',
    }),
  ).rejects.toThrow('sessão iniciada');
  expect(await db.occurrences.get(otherRow.id)).toEqual(otherRow);
});
it('reagendar cadastro antigo sem execução não fabrica progresso histórico', async () => {
  const id = await create('Antiga', '2026-10-31'),
    task = (await db.tasks.get(id))!;
  await changeToday({
    row: makeOccurrence(task, '2026-10-31'),
    action: 'reschedule',
    day,
    targetDate: '2026-11-03',
    requestId: 'old',
  });
  expect((await db.tasks.get(id))?.plannedDate).toBe('2026-11-03');
  expect(await db.occurrences.count()).toBe(0);
  expect(await db.activityEvents.count()).toBe(0);
});
it('conclusões efetivas de pontuais antigas integram o progresso das missões do dia', async () => {
  vi.setSystemTime(new Date('2026-11-01T15:00:00'));
  const oldId = await create('Antiga', '2026-11-01'),
    old = await ensureOccurrence(oldId, '2026-11-01');
  vi.setSystemTime(new Date(day + 'T15:00:00'));
  await create('Plano atual');
  await progress(old.id, 1);
  const view = todayView(await readJourneySnapshot(), day);
  expect(view.planned).toHaveLength(2);
  expect(view.completed).toBe(1);
  expect(view.completedEvents.map((event) => event.occurrenceId)).toContain(
    old.id,
  );
});
it('traz uma pendência parcial para hoje sem recriar a ocorrência nem conceder recompensa', async () => {
  vi.setSystemTime(new Date('2026-11-01T15:00:00'));
  const id = await create('Pendente', '2026-11-01', true);
  const original = await ensureOccurrence(id, '2026-11-01');
  await progress(original.id, 10);
  vi.setSystemTime(new Date(day + 'T15:00:00'));
  const row = (await db.occurrences.get(original.id))!;
  const before = await readJourneySnapshot();
  const input = {
    row,
    action: 'reschedule' as const,
    day,
    targetDate: day,
    requestId: 'bring-today',
  };
  await expect(changeToday(input)).rejects.toThrow('Confirme');
  await changeToday({ ...input, acknowledged: true });
  await changeToday({ ...input, acknowledged: true });
  const after = await readJourneySnapshot();
  expect(after.occurrences).toHaveLength(1);
  expect(after.occurrences[0]).toMatchObject({
    id: original.id,
    originDate: '2026-11-01',
    plannedDate: day,
    value: 10,
    due: row.due,
  });
  expect(after.profile).toEqual(before.profile);
  expect(after.events).toEqual(before.events);
  expect(after.executionRecords).toEqual(before.executionRecords);
  expect(todayView(after, day).old).toHaveLength(0);
  expect(todayView(after, day).pending.map((row) => row.id)).toContain(
    original.id,
  );
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  await restoreJourneyBackup(backup);
  expect(
    todayView(await readJourneySnapshot(), day).pending.map((row) => row.id),
  ).toContain(original.id);
});
it('traz um cadastro antigo sem execução para hoje e preserva a proteção da sessão iniciada', async () => {
  const id = await create('Sem execução', '2026-11-01');
  await changeToday({
    row: makeOccurrence((await db.tasks.get(id))!, '2026-11-01'),
    action: 'reschedule',
    day,
    targetDate: day,
    requestId: 'bring-definition',
  });
  expect((await db.tasks.get(id))?.plannedDate).toBe(day);
  expect(await db.occurrences.count()).toBe(0);
  expect(await db.activityEvents.count()).toBe(0);
  vi.setSystemTime(new Date('2026-11-01T15:00:00'));
  const frozenId = await create('Em sessão', '2026-11-01');
  const frozen = await ensureOccurrence(frozenId, '2026-11-01');
  const session = await startOrResumeSession('Preservada', [frozen.id]);
  vi.setSystemTime(new Date(day + 'T15:00:00'));
  await expect(
    changeToday({
      row: frozen,
      action: 'reschedule',
      day,
      targetDate: day,
      acknowledged: true,
      requestId: 'bring-frozen',
    }),
  ).rejects.toThrow('sessão iniciada');
  expect(await db.occurrences.get(frozen.id)).toEqual(frozen);
  expect(await db.savedMissionSessions.get(session.id)).toEqual(session);
});
it('repetição e comando desatualizado não mudam economia nem perdem a retirada', async () => {
  const id = await create(),
    row = await ensureOccurrence(id),
    input = { row, action: 'remove' as const, day, requestId: 'same' };
  await changeToday(input);
  const current = await db.occurrences.get(row.id);
  await changeToday(input);
  expect(await db.occurrences.get(row.id)).toEqual(current);
  await expect(changeToday({ ...input, requestId: 'stale' })).rejects.toThrow(
    'outra aba',
  );
  expect(await db.activityEvents.count()).toBe(0);
});
it('iniciar repetidamente ou em concorrência reutiliza a mesma sessão', async () => {
  const id = await create(),
    row = await ensureOccurrence(id);
  const [one, two] = await Promise.all([
    startOrResumeSession('Uma', [row.id]),
    startOrResumeSession('Outra', [row.id]),
  ]);
  expect(one.id).toBe(two.id);
  expect(await db.savedMissionSessions.count()).toBe(1);
  expect(await db.activityEvents.count()).toBe(0);
});
it('seleção não inclui datas futuras, pausas ou retiradas e não reagenda atividades', async () => {
  const id = await create('Futura', '2026-11-03'),
    task = (await db.tasks.get(id))!,
    row = makeOccurrence(task, '2026-11-03');
  expect(occurrenceEligibility(row, task, day)).toContain('outra data');
  await expect(startSelectedSession([row])).rejects.toThrow('outra data');
  expect(await db.occurrences.count()).toBe(0);
  expect(await db.tasks.get(id)).toEqual(task);
});
it('direito restante usa o bruto devido, sem confundir compensação com progresso não pago', async () => {
  const debtId = await create('Corrigida'),
    debtRow = await ensureOccurrence(debtId);
  await progress(debtRow.id, 1);
  await progress(debtRow.id, 0, true);
  const id = await create('Tempo', day, true),
    row = await ensureOccurrence(id),
    session = await startOrResumeSession('Parcial', [row.id]);
  await progress(row.id, 10, false, session.id);
  const data = await readJourneySnapshot(),
    summary = summarizeSession(session, data),
    current = data.occurrences.find((item) => item.id === row.id)!;
  expect(summary.received.xp).toBe(0);
  expect(summary.compensation.xp).toBeGreaterThan(0);
  expect(summary.remaining.xp).toBe(summary.atTarget.xp - current.due.xp);
  expect(summary.remaining.xp).toBeLessThan(
    summary.atTarget.xp - summary.received.xp,
  );
  expect(summary.partial).toBe(1);
  const copy = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(copy)).not.toThrow();
});
it('conclusão individual sincroniza a ocorrência da sessão sem duplicar recompensa ao retomar', async () => {
  const a = await create('Primeira'),
    b = await create('Segunda'),
    rows = await Promise.all([ensureOccurrence(a), ensureOccurrence(b)]),
    session = await startOrResumeSession(
      'Sessão',
      rows.map((row) => row.id),
    );
  await completeTask(a);
  const data = await readJourneySnapshot(),
    summary = summarizeSession(session, data);
  expect(summary.completed).toBe(1);
  expect(summary.outside).toContain(rows[0].id);
  const balance = await db.profile.get(1);
  await startOrResumeSession(
    'De novo',
    rows.map((row) => row.id),
  );
  await completeTask(a);
  expect(await db.profile.get(1)).toEqual(balance);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  await restoreJourneyBackup(backup);
  expect((await db.executionRecords.toArray())[0].source).toBe('individual');
});
it('conclusão na sessão registra a origem e a alternância de modos não duplica recibos', async () => {
  const id = await create(),
    row = await ensureOccurrence(id),
    session = await startOrResumeSession('Sessão', [row.id]);
  await completeSessionOccurrence({
    sessionId: session.id,
    expectedSessionRevision: session.revision,
    occurrenceId: row.id,
    expectedOccurrenceRevision: row.revision,
    requestId: 'session-complete',
  });
  const data = await readJourneySnapshot();
  expect(data.executionRecords[0]).toMatchObject({
    source: 'session',
    sessionId: session.id,
  });
  expect(summarizeSession(session, data).outside).toHaveLength(0);
  const balance = await db.profile.get(1);
  await completeTask(id);
  expect(await db.profile.get(1)).toEqual(balance);
});
it('backup rejeita metadados de retirada inválidos', async () => {
  const id = await create();
  await ensureOccurrence(id);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  backup.data.occurrences[0].removedFromDays = ['broken'];
  expect(() => validateBackup(backup)).toThrow('retiradas');
});
it('exclusão após execução de sessão preserva recibos e mantém backup válido sem referências pessoais', async () => {
  const id = await create('Conteúdo privado'),
    other = await create('Preservada');
  const row = await ensureOccurrence(id),
    otherRow = await ensureOccurrence(other);
  const session = await startOrResumeSession('Minha sessão', [
    row.id,
    otherRow.id,
  ]);
  await completeTask(id, { sessionId: session.id });
  const before = await db.profile.get(1);
  const preview = await previewTaskRemoval(id);
  await removeTask(id, preview.token, 'delete-session-task', 'delete');
  expect(await db.tasks.get(id)).toBeUndefined();
  expect(await db.executionRecords.count()).toBe(0);
  expect(await db.profile.get(1)).toMatchObject(before!);
  expect(
    (await db.savedMissionSessions.get(session.id))?.occurrenceIds,
  ).toEqual([otherRow.id]);
  const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
  expect(() => validateBackup(backup)).not.toThrow();
  expect(JSON.stringify(backup)).not.toContain('Conteúdo privado');
  await restoreJourneyBackup(backup);
  expect(await db.tasks.get(other)).toBeDefined();
  expect(await db.tasks.get(id)).toBeUndefined();
});
it('Hoje apresenta conclusões legadas sem modificar registros ou conceder recursos', async () => {
  const id = await create('Rotina legada');
  await db.tasks.update(id, {
    productivityVersion: undefined,
    completed: true,
    recurrence: { kind: 'daily', startDate: day },
    lastOccurrenceDate: day,
  });
  const data = await readJourneySnapshot();
  const row = makeOccurrence(
    data.tasks.find((task) => task.id === id)!,
    day,
  );
  const view = todayView({ ...data, plannedToday: [row] }, day);
  expect(view.completed).toBe(1);
  expect(view.pending).toHaveLength(0);
  expect(await db.occurrences.count()).toBe(0);
  expect(await db.activityEvents.count()).toBe(0);
  expect((await readJourneySnapshot()).profile).toEqual(data.profile);
});
it('seleção parcialmente sobreposta não ignora atividades nem altera a sessão preservada', async () => {
  const ids = await Promise.all([create('A'), create('B'), create('C')]);
  const rows = await Promise.all(ids.map((id) => ensureOccurrence(id)));
  const session = await startOrResumeSession('Original', [
    rows[0].id,
    rows[1].id,
  ]);
  await expect(startSelectedSession([rows[0], rows[2]])).rejects.toThrow(
    'composição existente foi preservada',
  );
  expect(await db.savedMissionSessions.toArray()).toEqual([session]);
  expect(await db.activityEvents.count()).toBe(0);
});
it.each([false, true])(
  'missão legada vinculada sincroniza execução %s sem duplicar recibos',
  async (inSession) => {
    const id = await create('Legada vinculada');
    await db.tasks.update(id, { productivityVersion: undefined });
    const row = await ensureOccurrence(id);
    const session = await startOrResumeSession('Legada', [row.id]);
    await completeTask(id, inSession ? { sessionId: session.id } : {});
    const data = await readJourneySnapshot();
    expect(data.occurrences[0].status).toBe('completed');
    expect(data.executionRecords[0].source).toBe(
      inSession ? 'session' : 'individual',
    );
    expect(summarizeSession(session, data).outside).toHaveLength(
      inSession ? 0 : 1,
    );
    const balance = await db.profile.get(1);
    await completeTask(id);
    expect(await db.profile.get(1)).toEqual(balance);
    expect(
      (await db.activityEvents.toArray()).filter(
        (event) => event.kind === 'task',
      ),
    ).toHaveLength(1);
  },
);
