import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import {
  ensureOccurrence,
  plannedOccurrences,
  recordProgress,
} from './occurrenceService';
import { readJourneySnapshot } from './journeyQuery';
import { todayView } from '$lib/journey/todayView';
import {
  dayName,
  daySummary,
  moveToDay,
  rangeLabel,
  routinesLabel,
  weekView,
} from './week';

// Sábado, 14 de novembro de 2026 (dia do design P1).
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

async function week(start = TODAY) {
  const snapshot = await readJourneySnapshot();
  return weekView({
    start,
    today: TODAY,
    rows: await plannedOccurrences(start, '2026-11-30'),
    todayRows: todayView(snapshot, TODAY).planned,
    tasks: snapshot.tasks,
    routines: await db.routines.toArray(),
  });
}
type Days = Awaited<ReturnType<typeof week>>;
const all = (days: Days, date: string) => {
  const day = days.find((entry) => entry.date === date)!;
  return [...day.items, ...day.recurring];
};
const titles = (days: Days, date: string) =>
  all(days, date).map((item) => item.row.title);
const row = async (title: string, date: string) =>
  all(await week(), date).find((item) => item.row.title === title)!.row;

describe('weekView', () => {
  it('lays out seven days with dated work, leaving the inbox out', async () => {
    await create('Ligar para o seguro');
    await create('Pagar conta de luz', { plannedDate: TODAY });
    await create('Reunião de equipe', {
      plannedDate: '2026-11-16',
      plannedTime: '09:00',
      estimatedMinutes: 60,
    });
    await create('Responder contador', { plannedDate: '2026-11-16' });
    const days = await week();
    expect(days.map((day) => day.date)).toEqual([
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
    ]);
    expect(titles(days, TODAY)).toEqual(['Pagar conta de luz']);
    expect(titles(days, '2026-11-16')).toEqual([
      'Reunião de equipe',
      'Responder contador',
    ]);
    expect(
      days.flatMap((day) => day.items).map((i) => i.row.title),
    ).not.toContain('Ligar para o seguro');
  });

  it('sums only real durations and names the day like the design', async () => {
    await create('Reunião', {
      plannedDate: '2026-11-16',
      estimatedMinutes: 60,
    });
    await create('Aula 3', { plannedDate: '2026-11-16', estimatedMinutes: 70 });
    await create('Responder contador', { plannedDate: '2026-11-16' });
    const monday = (await week()).find((day) => day.date === '2026-11-16')!;
    expect(daySummary(monday)).toBe('3 pendentes · 2h10 com duração · 1 sem');
    const sunday = (await week()).find((day) => day.date === '2026-11-15')!;
    expect(daySummary(sunday)).toBe('Livre');
    expect(dayName(TODAY, TODAY)).toBe('Sáb 14 · hoje');
    expect(dayName('2026-11-16', TODAY)).toBe('Seg 16');
    expect(rangeLabel(TODAY)).toBe('14 a 20 de novembro');
    expect(rangeLabel('2026-11-28')).toBe('28 de novembro a 4 de dezembro');
  });

  it('groups routine items into one block per routine and day', async () => {
    const a = await create('Varrer a casa', { estimatedMinutes: 20 });
    const b = await create('Limpar o banheiro');
    await saveRoutine({
      id: 'faxina',
      name: 'Faxina de sábado',
      days: [6],
      startDate: TODAY,
      entries: [
        { taskId: a, time: '12:00' },
        { taskId: b, time: null },
      ],
    });
    const days = await week();
    const saturday = days.find((day) => day.date === TODAY)!;
    expect(saturday.items).toEqual([]);
    expect(saturday.routines).toEqual([
      {
        id: 'faxina',
        name: 'Faxina de sábado',
        count: 2,
        done: 0,
        time: '12:00',
      },
    ]);
    expect(routinesLabel(saturday)).toBe('1 rotina');
    await create('Meditar', {
      plannedDate: TODAY,
      recurrence: { kind: 'daily', startDate: TODAY },
    });
    const withHabit = (await week()).find((day) => day.date === TODAY)!;
    expect(withHabit.items).toEqual([]);
    expect(routinesLabel(withHabit)).toBe('1 rotina · 1 recorrente');
    expect(daySummary(withHabit)).toBe('Livre');
    expect(days.find((day) => day.date === '2026-11-15')!.routines).toEqual([]);
  });

  it('marks what can move and what can go back to the inbox', async () => {
    await create('Consertar a torneira', { plannedDate: '2026-11-17' });
    await create('Natação', {
      plannedDate: '2026-11-18',
      recurrence: { kind: 'weekly', startDate: '2026-11-18', days: [3] },
    });
    const days = await week();
    const tuesday = days.find((day) => day.date === '2026-11-17')!.items[0];
    expect([tuesday.movable, tuesday.toInbox]).toEqual([true, true]);
    const wednesday = days.find((day) => day.date === '2026-11-18')!
      .recurring[0];
    expect([wednesday.movable, wednesday.toInbox]).toEqual([true, false]);
  });
});

describe('moveToDay', () => {
  it('moves a single mission by its own day, with an audit', async () => {
    const id = await create('Consertar a torneira', {
      plannedDate: '2026-11-17',
    });
    await moveToDay(
      await row('Consertar a torneira', '2026-11-17'),
      '2026-11-19',
      'move-1',
    );
    expect((await db.tasks.get(id))!.plannedDate).toBe('2026-11-19');
    expect(titles(await week(), '2026-11-19')).toEqual([
      'Consertar a torneira',
    ]);
    expect(titles(await week(), '2026-11-17')).toEqual([]);
    expect(await db.productivityAudit.get('move-1')).toBeTruthy();
  });

  it('moves one occurrence of a repetition and keeps the definition', async () => {
    const id = await create('Natação', {
      plannedDate: '2026-11-18',
      recurrence: { kind: 'weekly', startDate: '2026-11-18', days: [3] },
    });
    const before = await db.tasks.get(id);
    await moveToDay(await row('Natação', '2026-11-18'), '2026-11-19', 'move-2');
    const days = await week('2026-11-14');
    expect(titles(days, '2026-11-18')).toEqual([]);
    expect(titles(days, '2026-11-19')).toEqual(['Natação']);
    expect(await db.tasks.get(id)).toEqual(before);
  });

  it('keeps progress and balances when the mission already has progress', async () => {
    const id = await create('Ler 20 páginas', {
      plannedDate: TODAY,
      tracking: { method: 'quantity', target: 20, unit: 'páginas' },
    });
    const stored = await ensureOccurrence(id, TODAY);
    await recordProgress({
      occurrenceId: stored.id,
      expectedRevision: stored.revision,
      value: 5,
      executedAt: new Date().toISOString(),
      requestId: 'progress-1',
    });
    const profile = await db.profile.get(1);
    const events = await db.activityEvents.count();
    await moveToDay(await row('Ler 20 páginas', TODAY), '2026-11-16', 'move-3');
    const moved = await db.occurrences.get(stored.id);
    expect(moved!.plannedDate).toBe('2026-11-16');
    expect(moved!.value).toBe(5);
    const after = await db.profile.get(1);
    expect([after!.gold, after!.xpCurrent, after!.food]).toEqual([
      profile!.gold,
      profile!.xpCurrent,
      profile!.food,
    ]);
    expect(await db.activityEvents.count()).toBe(events);
  });

  it('is idempotent per request and refuses past days and completed work', async () => {
    const id = await create('Renovar CNH', { plannedDate: '2026-11-19' });
    const target = await row('Renovar CNH', '2026-11-19');
    await moveToDay(target, '2026-11-20', 'same');
    await moveToDay(target, '2026-11-17', 'same');
    expect((await db.tasks.get(id))!.plannedDate).toBe('2026-11-20');
    await expect(moveToDay(target, '2026-11-13', 'past')).rejects.toThrow(
      'Escolha hoje ou um dia futuro.',
    );
    await db.tasks.update(id, { completed: true, status: 'completed' });
    await expect(moveToDay(target, '2026-11-18', 'done')).rejects.toThrow(
      'Missão concluída não muda de dia.',
    );
  });

  it('refuses an occurrence that belongs to an open session', async () => {
    const id = await create('Natação', {
      plannedDate: '2026-11-14',
      recurrence: { kind: 'daily', startDate: '2026-11-14' },
    });
    const stored = await ensureOccurrence(id, TODAY);
    await db.savedMissionSessions.add({
      id: 'session',
      name: 'Sessão',
      occurrenceIds: [stored.id],
      cursor: 0,
      status: 'active',
      mode: 'focus',
      revision: 1,
      createdAt: new Date().toISOString(),
    });
    await expect(
      moveToDay(await row('Natação', TODAY), '2026-11-15', 'session-move'),
    ).rejects.toThrow('sessão iniciada');
    expect((await db.occurrences.get(stored.id))!.plannedDate).toBe(TODAY);
  });
});
