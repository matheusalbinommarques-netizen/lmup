import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import { changeToday } from './dailyPlanningService';
import { recordProgress, ensureOccurrence } from './occurrenceService';
import { readJourneySnapshot } from './journeyQuery';
import { todayView } from '$lib/journey/todayView';
import { orderDay } from './dayOrder';
import { insertBlock, routineDraftFromSession } from './routineBlocks';

// Lets a test make the second step (saving the Dia's order) fail once.
const orderFailure = vi.hoisted(() => ({ next: false }));
vi.mock('./dayOrder', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./dayOrder')>();
  return {
    ...actual,
    saveDayOrder: async (...args: Parameters<typeof actual.saveDayOrder>) => {
      if (orderFailure.next) {
        orderFailure.next = false;
        throw new Error('Falha simulada ao guardar a ordem.');
      }
      return actual.saveDayOrder(...args);
    },
  };
});

// Sábado, 14 de novembro de 2026 (dia do design P3); a rotina é de dias úteis.
const TODAY = '2026-11-14';
beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(`${TODAY}T09:00:00`));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const create = (
  title: string,
  extra: Partial<Parameters<typeof saveTaskDefinition>[0]> = {},
) =>
  saveTaskDefinition({
    title,
    requestId: crypto.randomUUID(),
    planToday: false,
    ...extra,
  });

async function day() {
  const snapshot = await readJourneySnapshot();
  return orderDay(todayView(snapshot, TODAY).planned, TODAY);
}
const titles = async () => (await day()).map((row) => row.title);

async function faxina(days = [1, 2, 3, 4, 5]) {
  const a = await create('Varrer a casa', { estimatedMinutes: 20 });
  const b = await create('Limpar o banheiro');
  const c = await create('Trocar a roupa de cama');
  await saveRoutine({
    id: 'faxina',
    name: 'Faxina',
    days,
    startDate: TODAY,
    entries: [
      { taskId: a, time: '12:00' },
      { taskId: b, time: null },
      { taskId: c, time: null },
    ],
  });
  return [a, b, c];
}

async function insert(
  taskIds: number[],
  at?: number,
  extra: Partial<Parameters<typeof insertBlock>[0]> = {},
) {
  const rows = await day();
  return insertBlock({
    routineId: 'faxina',
    taskIds,
    day: TODAY,
    rows,
    at: at ?? rows.length,
    requestId: crypto.randomUUID(),
    ...extra,
  });
}

describe('insertBlock', () => {
  it('brings a routine into a day outside its days, after the chosen row', async () => {
    await create('Pagar conta de luz', { plannedDate: TODAY });
    await create('Ler 20 páginas', { plannedDate: TODAY });
    await create('Buscar Ana na escola', {
      plannedDate: TODAY,
      plannedTime: '13:30',
    });
    const ids = await faxina();
    const before = await titles();
    expect(before).toHaveLength(3);
    const at = before.indexOf('Ler 20 páginas') + 1;
    const routine = await db.routines.get('faxina');
    const result = await insert(ids, at);
    expect(result.inserted).toHaveLength(3);
    expect(result.skipped).toEqual([]);
    expect(await titles()).toEqual([
      ...before.slice(0, at),
      'Varrer a casa',
      'Limpar o banheiro',
      'Trocar a roupa de cama',
      ...before.slice(at),
    ]);
    // The routine and its days do not change; only today is added.
    expect(await db.routines.get('faxina')).toEqual(routine);
    const task = (await db.tasks.get(ids[0]))!;
    expect(task.recurrence).toMatchObject({ days: [1, 2, 3, 4, 5] });
    expect(task.occurrenceOverride).toBe(TODAY);
    const rows = await db.occurrences.bulkGet(result.inserted);
    expect(rows.map((row) => row!.routineId)).toEqual([
      'faxina',
      'faxina',
      'faxina',
    ]);
    const audit = await db.productivityAudit
      .filter((entry) => entry.action === 'routine-insert')
      .toArray();
    expect(audit).toHaveLength(1);
  });

  it('inserts only the checked items and fixes today only for the first', async () => {
    const [a, , c] = await faxina();
    await insert([a, c], 0, { time: '15:00' });
    const rows = await day();
    expect(rows.map((row) => row.title)).toEqual([
      'Varrer a casa',
      'Trocar a roupa de cama',
    ]);
    expect(rows[0].plannedTime).toBe('15:00');
    // The routine entry keeps its time for its own days.
    const routine = (await db.routines.get('faxina'))!;
    expect(routine.entries[0].time).toBe('12:00');
    expect((await db.tasks.get(a))!.plannedTime).toBe('12:00');
  });

  it('is idempotent by request and leaves balances and events untouched', async () => {
    const ids = await faxina();
    const profile = await db.profile.get(1);
    const events = await db.activityEvents.count();
    const rows = await day();
    const input = {
      routineId: 'faxina',
      taskIds: ids,
      day: TODAY,
      rows,
      at: 0,
      requestId: 'insert-1',
    };
    const first = await insertBlock(input);
    const again = await insertBlock(input);
    expect(again).toEqual(first);
    expect(await db.occurrences.count()).toBe(3);
    expect(
      await db.productivityAudit
        .filter((entry) => entry.action === 'routine-insert')
        .count(),
    ).toBe(1);
    const after = await db.profile.get(1);
    expect([after!.gold, after!.xpCurrent, after!.food]).toEqual([
      profile!.gold,
      profile!.xpCurrent,
      profile!.food,
    ]);
    expect(await db.activityEvents.count()).toBe(events);
    await expect(insertBlock({ ...input, routineId: 'outra' })).rejects.toThrow(
      'Identificador já utilizado.',
    );
  });

  it('finishes the order when the same request is repeated after a failure between the steps', async () => {
    await create('Pagar conta de luz', { plannedDate: TODAY });
    await create('Ler 20 páginas', { plannedDate: TODAY });
    await create('Buscar Ana na escola', {
      plannedDate: TODAY,
      plannedTime: '13:30',
    });
    const ids = await faxina();
    const before = await titles();
    const at = before.indexOf('Pagar conta de luz') + 1;
    const input = {
      routineId: 'faxina',
      taskIds: ids,
      day: TODAY,
      rows: await day(),
      at,
      requestId: 'insert-falha',
    };
    orderFailure.next = true;
    await expect(insertBlock(input)).rejects.toThrow('Falha simulada');
    // The block exists (one transaction) but has no place in the Dia yet.
    const stored = await db.occurrences
      .where('routineId')
      .equals('faxina')
      .toArray();
    expect(stored).toHaveLength(3);
    expect(stored.every((row) => row.dayOrder?.day !== TODAY)).toBe(true);
    // Repeating the request, with the Dia as it is now (block included),
    // places the block where it was asked, without a second insertion.
    const again = await insertBlock({ ...input, rows: await day() });
    expect([...again.inserted].sort()).toEqual(
      stored.map((row) => row.id).sort(),
    );
    const expected = [
      ...before.slice(0, at),
      'Varrer a casa',
      'Limpar o banheiro',
      'Trocar a roupa de cama',
      ...before.slice(at),
    ];
    expect(await titles()).toEqual(expected);
    expect(
      await db.occurrences.where('routineId').equals('faxina').count(),
    ).toBe(3);
    expect(
      await db.productivityAudit
        .filter((entry) => entry.action === 'routine-insert')
        .count(),
    ).toBe(1);
    // Once placed, repeating it again keeps a later move by the user.
    const [first, ...rest] = await day();
    const moved = [...rest, first];
    const { saveDayOrder } = await import('./dayOrder');
    await saveDayOrder(TODAY, moved);
    await insertBlock({ ...input, rows: await day() });
    expect(await titles()).toEqual(moved.map((row) => row.title));
  });

  it('leaves rows already in the Dia where they are and skips resolved ones', async () => {
    // Saturday routine: it is already in today's Dia.
    const ids = await faxina([6]);
    const before = await titles();
    const result = await insert(ids);
    expect(result.inserted).toEqual([]);
    expect(result.skipped.map((item) => item.reason)).toEqual([
      'já está no Dia',
      'já está no Dia',
      'já está no Dia',
    ]);
    expect(await titles()).toEqual(before);
  });

  it('brings back a row removed from today and refuses a completed one', async () => {
    const ids = await faxina([6]);
    const [first, second] = await day();
    await changeToday({
      row: first,
      action: 'remove',
      day: TODAY,
      requestId: crypto.randomUUID(),
    });
    const stored = await ensureOccurrence(second.taskId, TODAY);
    await recordProgress({
      requestId: crypto.randomUUID(),
      occurrenceId: stored.id,
      expectedRevision: stored.revision,
      value: 1,
      executedAt: new Date().toISOString(),
    });
    expect(await titles()).not.toContain('Varrer a casa');
    const result = await insert([ids[0]]);
    expect(result.inserted).toHaveLength(1);
    expect(await titles()).toContain('Varrer a casa');
    // A completed row is in the Dia (kept in place), so it is not inserted again.
    const again = await insert([ids[1]]);
    expect(again.skipped).toEqual([
      { taskId: ids[1], title: 'Limpar o banheiro', reason: 'já está no Dia' },
    ]);
  });

  it('can be undone with "Remover de hoje" without touching the routine', async () => {
    const ids = await faxina();
    const routine = await db.routines.get('faxina');
    await insert(ids);
    const [row] = await day();
    await changeToday({
      row,
      action: 'remove',
      day: TODAY,
      requestId: crypto.randomUUID(),
    });
    expect(await titles()).toEqual([
      'Limpar o banheiro',
      'Trocar a roupa de cama',
    ]);
    expect(await db.routines.get('faxina')).toEqual(routine);
    expect((await db.tasks.get(ids[0]))!.recurrence).toMatchObject({
      days: [1, 2, 3, 4, 5],
    });
  });

  it('refuses another day, a paused routine and missions outside it', async () => {
    const ids = await faxina();
    const other = await create('Outra missão');
    await expect(insert(ids, 0, { day: '2026-11-15' })).rejects.toThrow(
      'O dia mudou',
    );
    await expect(insert([other])).rejects.toThrow(
      'Uma missão não faz parte desta rotina.',
    );
    await expect(insert([])).rejects.toThrow('ao menos uma missão');
    const routine = (await db.routines.get('faxina'))!;
    await saveRoutine({
      ...routine,
      status: 'paused',
      expectedRevision: routine.revision,
    });
    await expect(insert(ids)).rejects.toThrow('não está ativa');
    expect(await db.occurrences.count()).toBe(0);
  });
});

describe('routineDraftFromSession', () => {
  it('keeps the session order without time and explains what is left out', async () => {
    const a = await create('Alongar', {
      recurrence: { kind: 'daily', startDate: TODAY },
    });
    const b = await create('Ler 20 páginas', { plannedDate: TODAY });
    const c = await create('Varrer a casa');
    await saveRoutine({
      id: 'faxina',
      name: 'Faxina',
      days: [6],
      startDate: TODAY,
      entries: [{ taskId: c, time: null }],
    });
    const done = await create('Pagar conta', { plannedDate: TODAY });
    await db.tasks.update(done, { completed: true });
    const tasks = await db.tasks.toArray();
    const draft = routineDraftFromSession(
      {
        name: '  Manhã de estudo ',
        occurrenceIds: ['o1', 'o2', 'o2b', 'o3', 'o4'],
      },
      [
        { id: 'o1', taskId: a },
        { id: 'o2', taskId: b },
        { id: 'o2b', taskId: b },
        { id: 'o3', taskId: c },
        { id: 'o4', taskId: done },
      ],
      tasks,
      await db.routines.toArray(),
    );
    expect(draft.name).toBe('Manhã de estudo');
    expect(draft.entries).toEqual([
      { taskId: a, time: null },
      { taskId: b, time: null },
    ]);
    expect(draft.left).toEqual([
      { title: 'Varrer a casa', reason: 'já está na rotina Faxina' },
      { title: 'Pagar conta', reason: 'avulsa já concluída' },
    ]);
  });
});
