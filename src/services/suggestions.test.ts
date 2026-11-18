import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, type Task } from './db';
import { initializeJourney } from './profileService';
import { invalidateHeroModifiersCache } from './gearService';
import { saveTaskDefinition } from './taskDefinitionService';
import { saveRoutine } from './routineService';
import { ensureOccurrence, plannedOccurrences } from './occurrenceService';
import {
  createJourneyBackup,
  restoreJourneyBackup,
  validateBackup,
} from './backupDataService';
import type { ExecutionRecord, Occurrence } from './productivityTypes';
import {
  acceptSuggestion,
  circularMedian,
  declineSuggestion,
  durationSuggestions,
  suggestions,
  timeSuggestions,
  type SuggestionInput,
} from './suggestions';
import {
  completeReview,
  setSundayBlock,
  showSundayBlock,
  type WeeklyReviewState,
} from './weeklyReview';

// Semana revisada: domingo, 8, a sábado, 14 de novembro de 2026; hoje é
// segunda, 16. A janela de horário vai de 25/10 a 14/11.
const WEEK = '2026-11-08';
const TODAY = '2026-11-16';

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-16T10:00:00'));
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
  invalidateHeroModifiersCache();
  await initializeJourney();
});
afterEach(() => vi.useRealTimers());

const daily = { kind: 'daily', startDate: '2026-10-01' } as Task['recurrence'];
const task = (id: number, extra: Partial<Task> = {}) =>
  ({
    id,
    title: `Missão ${id}`,
    areaId: 0,
    recurrence: daily,
    plannedTime: null,
    estimatedMinutes: null,
    ...extra,
  }) as Task;
const occurrence = (
  id: string,
  taskId: number,
  extra: Partial<Occurrence> = {},
) =>
  ({
    id,
    taskId,
    originDate: id.slice(-10),
    plannedDate: id.slice(-10),
    status: 'completed',
    value: 1,
    ...extra,
  }) as Occurrence;
let seq = 0;
/** Registro do cronômetro: início local `start`, `minutes` depois. */
const record = (
  occurrenceId: string,
  start: string,
  minutes: number | null = 20,
  extra: Partial<ExecutionRecord> = {},
): ExecutionRecord => {
  const began = new Date(start);
  const executed = new Date(began.getTime() + (minutes ?? 1) * 60000);
  seq += 1;
  return {
    id: `r${seq}`,
    occurrenceId,
    before: 0,
    after: 1,
    minutes,
    startedAt: began.toISOString(),
    executedAt: executed.toISOString(),
    localDate: start.slice(0, 10),
    localTime: start.slice(11, 16),
    timezone: 'America/Sao_Paulo',
    offsetMinutes: began.getTimezoneOffset(),
    recordedAt: executed.toISOString(),
    correction: false,
    revision: 1,
    ...extra,
  };
};
const days = (from: number, count: number) =>
  Array.from(
    { length: count },
    (_, i) => `2026-11-${String(from + i).padStart(2, '0')}`,
  );
/** Uma conclusão medida por dia, com início em `times` (hh:mm). */
const measured = (taskId: number, dates: string[], times: string[]) => {
  const occurrences = dates.map((day) =>
    occurrence(`m:${taskId}:${day}`, taskId),
  );
  const executionRecords = dates.map((day, i) =>
    record(`m:${taskId}:${day}`, `${day}T${times[i % times.length]}:00`),
  );
  return { occurrences, executionRecords };
};
const input = (extra: Partial<SuggestionInput>): SuggestionInput => ({
  tasks: [],
  occurrences: [],
  executionRecords: [],
  ...extra,
});

describe('mediana circular', () => {
  it('trata a meia-noite como vizinha e recusa inícios espalhados', () => {
    expect(circularMedian([23 * 60 + 50, 10, 23 * 60 + 40, 20, 0])).toBe(0);
    expect(circularMedian([420, 435, 450])).toBe(435);
    expect(circularMedian([0, 360, 720, 1080])).toBeNull();
  });
});

describe('sugestão de horário', () => {
  it('6 dias de início real sugerem a mediana arredondada a 15 min', () => {
    const data = measured(1, days(8, 6), [
      '07:05',
      '07:20',
      '07:10',
      '07:25',
      '07:15',
      '07:40',
    ]);
    const [suggestion] = timeSuggestions(
      input({ tasks: [task(1, { plannedTime: '06:30' })], ...data }),
      WEEK,
      TODAY,
    );
    expect(suggestion).toMatchObject({
      id: 'time:1',
      current: '06:30',
      suggested: '07:15',
      samples: ['07:05', '07:20', '07:10', '07:25', '07:15', '07:40'],
      close: { count: 6, from: '07:05', to: '07:40' },
    });
  });

  it('com 5 dias, ou fora dos 21 dias, não sugere', () => {
    const tasks = [task(1)];
    const five = measured(1, days(10, 5), ['07:00']);
    expect(timeSuggestions(input({ tasks, ...five }), WEEK, TODAY)).toEqual([]);
    // 24/10 fica antes da janela (25/10 a 14/11); 15/11 fica depois.
    const edges = measured(
      1,
      ['2026-10-24', ...days(10, 4), '2026-11-15'],
      ['07:00'],
    );
    expect(timeSuggestions(input({ tasks, ...edges }), WEEK, TODAY)).toEqual(
      [],
    );
  });

  it('sem hora fixa sugere fixar; perto da hora fixa (menos de 30 min) não', () => {
    const data = measured(1, days(8, 6), ['07:10']);
    expect(
      timeSuggestions(input({ tasks: [task(1)], ...data }), WEEK, TODAY)[0],
    ).toMatchObject({ current: null, suggested: '07:15' });
    expect(
      timeSuggestions(
        input({ tasks: [task(1, { plannedTime: '07:00' })], ...data }),
        WEEK,
        TODAY,
      ),
    ).toEqual([]);
    expect(
      timeSuggestions(
        input({ tasks: [task(1, { plannedTime: '06:45' })], ...data }),
        WEEK,
        TODAY,
      )[0].suggested,
    ).toBe('07:15');
  });

  it('inícios espalhados (menos de 2/3 perto da mediana) não sugerem', () => {
    const data = measured(1, days(8, 6), [
      '07:00',
      '07:10',
      '07:20',
      '12:00',
      '18:00',
      '21:00',
    ]);
    expect(
      timeSuggestions(input({ tasks: [task(1)], ...data }), WEEK, TODAY),
    ).toEqual([]);
    const four = measured(1, days(8, 6), [
      '07:00',
      '07:10',
      '07:20',
      '07:15',
      '18:00',
      '21:00',
    ]);
    expect(
      timeSuggestions(input({ tasks: [task(1)], ...four }), WEEK, TODAY),
    ).toHaveLength(1);
  });

  it('em volta da meia-noite sugere 00:00, não meio-dia', () => {
    const data = measured(1, days(8, 6), [
      '23:50',
      '00:10',
      '23:40',
      '00:05',
      '23:55',
      '00:20',
    ]);
    expect(
      timeSuggestions(
        input({ tasks: [task(1, { plannedTime: '22:00' })], ...data }),
        WEEK,
        TODAY,
      )[0],
    ).toMatchObject({
      suggested: '00:00',
      close: { count: 6, from: '23:40', to: '00:20' },
    });
  });

  it('ignora correção, ocorrência corrigida ou desfeita e registro sem início real', () => {
    const tasks = [task(1)];
    const base = measured(1, days(8, 6), ['07:00']);
    const swap = (i: number, change: Partial<ExecutionRecord>) => ({
      ...base,
      executionRecords: base.executionRecords.map((r, j) =>
        j === i ? { ...r, ...change } : r,
      ),
    });
    expect(
      timeSuggestions(input({ tasks, ...base }), WEEK, TODAY),
    ).toHaveLength(1);
    for (const change of [
      { correction: true },
      { startedAt: undefined },
      { startedAt: 'nada' },
      { after: 0 },
    ])
      expect(
        timeSuggestions(input({ tasks, ...swap(0, change) }), WEEK, TODAY),
      ).toEqual([]);
    // Uma correção posterior derruba todas as medições daquela ocorrência.
    const corrected = {
      ...base,
      executionRecords: [
        ...base.executionRecords,
        record(base.occurrences[0].id, '2026-11-08T20:00:00', null, {
          correction: true,
          before: 1,
          after: 1,
        }),
      ],
    };
    expect(
      timeSuggestions(input({ tasks, ...corrected }), WEEK, TODAY),
    ).toEqual([]);
    const undone = {
      ...base,
      occurrences: base.occurrences.map((row, i) =>
        i === 0 ? { ...row, value: 0, status: 'planned' as const } : row,
      ),
    };
    expect(timeSuggestions(input({ tasks, ...undone }), WEEK, TODAY)).toEqual(
      [],
    );
  });

  it('retomar no dia seguinte e duas ocorrências no mesmo dia contam um dia', () => {
    const tasks = [task(1)];
    const base = measured(1, days(8, 5), ['07:00']);
    // A 5ª ocorrência foi retomada no dia 13: conta só o primeiro início.
    const resumed = {
      ...base,
      executionRecords: [
        ...base.executionRecords,
        record(base.occurrences[4].id, '2026-11-13T07:00:00', 10, {
          before: 0.5,
          after: 1,
        }),
      ],
    };
    expect(timeSuggestions(input({ tasks, ...resumed }), WEEK, TODAY)).toEqual(
      [],
    );
    // Outra ocorrência no dia 12 também não soma dia.
    const sameDay = {
      occurrences: [...base.occurrences, occurrence('extra:2026-11-12', 1)],
      executionRecords: [
        ...base.executionRecords,
        record('extra:2026-11-12', '2026-11-12T19:00:00'),
      ],
    };
    expect(timeSuggestions(input({ tasks, ...sameDay }), WEEK, TODAY)).toEqual(
      [],
    );
  });

  it('só missão recorrente ou de rotina, ativa e não suprimida', () => {
    const data = measured(1, days(8, 6), ['07:00']);
    for (const extra of [
      { recurrence: null },
      { archived: true },
      { completed: true },
    ] as Partial<Task>[])
      expect(
        timeSuggestions(
          input({ tasks: [task(1, extra)], ...data }),
          WEEK,
          TODAY,
        ),
      ).toEqual([]);
    expect(
      timeSuggestions(
        input({
          tasks: [task(1, { recurrence: null, routineId: 'r' })],
          ...data,
        }),
        WEEK,
        TODAY,
      ),
    ).toHaveLength(1);
    const declined: WeeklyReviewState = {
      version: 1,
      reviews: [
        {
          week: '2026-11-01',
          startedAt: '2026-11-07T10:00:00.000Z',
          skipped: [],
          decisions: [
            {
              id: 'time:1',
              outcome: 'declined',
              at: '2026-11-07T10:00:00.000Z',
            },
          ],
        },
      ],
    };
    expect(
      timeSuggestions(
        input({ tasks: [task(1)], ...data, weeklyReview: declined }),
        WEEK,
        TODAY,
      ),
    ).toEqual([]);
  });
});

describe('sugestão de duração', () => {
  it('o exemplo do autor: 30 min atuais e 40–55 medidos sugerem 45', () => {
    const data = measured(2, days(8, 5), ['07:00']);
    data.executionRecords = data.executionRecords.map((r, i) => ({
      ...r,
      minutes: [40, 45, 45, 50, 55][i],
    }));
    expect(
      durationSuggestions(
        input({ tasks: [task(2, { estimatedMinutes: 30 })], ...data }),
        TODAY,
      )[0],
    ).toMatchObject({
      id: 'duration:2',
      current: 30,
      suggested: 45,
      samples: [40, 45, 45, 50, 55],
    });
  });

  it('precisa de 3 conclusões medidas e usa só as 5 mais recentes', () => {
    const two = measured(2, days(8, 2), ['07:00']);
    expect(
      durationSuggestions(input({ tasks: [task(2)], ...two }), TODAY),
    ).toEqual([]);
    const seven = measured(2, days(1, 7), ['07:00']);
    seven.executionRecords = seven.executionRecords.map((r, i) => ({
      ...r,
      minutes: [90, 90, 10, 10, 12, 14, 16][i],
    }));
    expect(
      durationSuggestions(input({ tasks: [task(2)], ...seven }), TODAY)[0],
    ).toMatchObject({ suggested: 10, samples: [10, 10, 12, 14, 16] });
  });

  it('soma as partes medidas; uma parte sem cronômetro tira a conclusão', () => {
    const data = measured(2, days(8, 3), ['07:00']);
    const parts = {
      ...data,
      executionRecords: [
        ...data.executionRecords.map((r) => ({ ...r, before: 0.5 })),
        ...data.occurrences.map((row) =>
          record(row.id, `${row.id.slice(-10)}T06:00:00`, 15, { after: 0.5 }),
        ),
      ],
    };
    expect(
      durationSuggestions(input({ tasks: [task(2)], ...parts }), TODAY)[0]
        .suggested,
    ).toBe(35);
    const manual = {
      ...parts,
      executionRecords: parts.executionRecords.map((r, i) =>
        i === 3 ? { ...r, startedAt: undefined } : r,
      ),
    };
    expect(
      durationSuggestions(input({ tasks: [task(2)], ...manual }), TODAY),
    ).toEqual([]);
  });

  it('com duração definida, só diferença de 25% e de 5 min', () => {
    const data = measured(2, days(8, 3), ['07:00']);
    data.executionRecords = data.executionRecords.map((r) => ({
      ...r,
      minutes: 20,
    }));
    const of = (estimatedMinutes: number | null) =>
      durationSuggestions(
        input({ tasks: [task(2, { estimatedMinutes })], ...data }),
        TODAY,
      );
    expect(of(null)[0].suggested).toBe(20);
    expect(of(16)).toEqual([]); // 25%, mas só 4 min
    expect(of(15)[0].suggested).toBe(20); // 5 min e 33%
    expect(of(24)).toEqual([]); // 4 min
    expect(of(25)).toEqual([]); // 5 min, mas 25% de 25 é 6,25
    expect(of(27)[0].suggested).toBe(20); // 7 min e 26%
  });

  it('ocorrência não concluída ou corrigida não conta', () => {
    const data = measured(2, days(8, 3), ['07:00']);
    const partial = {
      ...data,
      occurrences: data.occurrences.map((row, i) =>
        i === 0 ? { ...row, status: 'partial' as const } : row,
      ),
    };
    expect(
      durationSuggestions(input({ tasks: [task(2)], ...partial }), TODAY),
    ).toEqual([]);
  });

  it('"Não sugerir mais" de horário não suprime a duração', () => {
    const data = measured(3, days(8, 6), ['07:00']);
    const state: WeeklyReviewState = {
      version: 1,
      reviews: [
        {
          week: '2026-11-01',
          startedAt: '2026-11-07T10:00:00.000Z',
          skipped: [],
          decisions: [
            {
              id: 'time:3',
              outcome: 'declined',
              at: '2026-11-07T10:00:00.000Z',
            },
          ],
        },
      ],
    };
    expect(
      suggestions(
        input({ tasks: [task(3)], ...data, weeklyReview: state }),
        WEEK,
        TODAY,
      ).map((s) => s.id),
    ).toEqual(['duration:3']);
  });
});

describe('aceitar e recusar', () => {
  // Criada no dia 1, para haver plano nos dias passados.
  const create = async () => {
    vi.setSystemTime(new Date('2026-11-01T09:00:00'));
    const id = await saveTaskDefinition({
      title: 'Treino',
      requestId: crypto.randomUUID(),
      plannedTime: '06:30',
      estimatedMinutes: 30,
      recurrence: { kind: 'daily', startDate: '2026-11-01' },
    });
    vi.setSystemTime(new Date('2026-11-16T10:00:00'));
    return id;
  };

  it('aceitar muda a definição, hoje e o futuro intocados, e preserva o passado', async () => {
    const id = await create();
    const past = await ensureOccurrence(id, '2026-11-15');
    const today = await ensureOccurrence(id, TODAY);
    const versions = await db.planVersions.where('taskId').equals(id).count();
    expect(
      await acceptSuggestion(WEEK, {
        id: `time:${id}`,
        kind: 'time',
        taskId: id,
        value: '07:15',
      }),
    ).toBe(true);
    expect((await db.tasks.get(id))!.plannedTime).toBe('07:15');
    expect((await db.occurrences.get(today.id))!.plannedTime).toBe('07:15');
    expect((await db.occurrences.get(past.id))!.plannedTime).toBe('06:30');
    const [projectedPast] = await plannedOccurrences(
      '2026-11-14',
      '2026-11-14',
    );
    expect(projectedPast.plannedTime).toBe('06:30');
    const [tomorrow] = await plannedOccurrences('2026-11-17', '2026-11-17');
    expect(tomorrow.plannedTime).toBe('07:15');
    expect(await db.planVersions.where('taskId').equals(id).count()).toBe(
      versions + 1,
    );
    const decisions = (await db.profile.get(1))!.weeklyReview!.reviews[0]
      .decisions;
    expect(decisions).toMatchObject([
      { id: `time:${id}`, outcome: 'accepted', action: 'time:07:15' },
    ]);
  });

  it('dois cliques gravam uma mudança e uma decisão', async () => {
    const id = await create();
    const change = {
      id: `duration:${id}` as const,
      kind: 'duration' as const,
      taskId: id,
      value: 45,
    };
    const results = await Promise.all([
      acceptSuggestion(WEEK, change),
      acceptSuggestion(WEEK, change),
    ]);
    expect(results.sort()).toEqual([false, true]);
    const task = (await db.tasks.get(id))!;
    expect(task.estimatedMinutes).toBe(45);
    expect(await acceptSuggestion(WEEK, change)).toBe(false);
    expect((await db.tasks.get(id))!.definitionRevision).toBe(
      task.definitionRevision,
    );
    expect(
      (await db.profile.get(1))!.weeklyReview!.reviews[0].decisions,
    ).toHaveLength(1);
  });

  it('falha ao registrar a decisão desfaz a mudança; tentar de novo grava uma vez', async () => {
    const id = await create();
    const before = (await db.tasks.get(id))!;
    const profile = (await db.profile.get(1))!;
    await db.profile.delete(1);
    const change = {
      id: `time:${id}` as const,
      kind: 'time' as const,
      taskId: id,
      value: '07:15',
    };
    await expect(acceptSuggestion(WEEK, change)).rejects.toThrow();
    expect((await db.tasks.get(id))!.plannedTime).toBe('06:30');
    expect((await db.tasks.get(id))!.definitionRevision).toBe(
      before.definitionRevision,
    );
    await db.profile.put(profile);
    expect(await acceptSuggestion(WEEK, change)).toBe(true);
    expect((await db.tasks.get(id))!.definitionRevision).toBe(
      (before.definitionRevision ?? 0) + 1,
    );
  });

  it('aceitar horário de missão de rotina muda a hora na rotina', async () => {
    const id = await saveTaskDefinition({
      title: 'Alongar',
      requestId: crypto.randomUUID(),
    });
    await saveRoutine({
      id: 'manha',
      name: 'Manhã',
      days: [0, 1, 2, 3, 4, 5, 6],
      startDate: '2026-11-01',
      entries: [{ taskId: id, time: '06:30' }],
    });
    await acceptSuggestion(WEEK, {
      id: `time:${id}`,
      kind: 'time',
      taskId: id,
      value: '07:00',
    });
    expect((await db.routines.get('manha'))!.entries[0].time).toBe('07:00');
  });

  it('"Não sugerir mais" só registra, uma vez, e vale para as próximas semanas', async () => {
    const id = await create();
    expect(await declineSuggestion(WEEK, `time:${id}`)).toBeTruthy();
    await declineSuggestion(WEEK, `time:${id}`);
    const state = (await db.profile.get(1))!.weeklyReview!;
    expect(state.reviews[0].decisions).toMatchObject([
      { id: `time:${id}`, outcome: 'declined' },
    ]);
    expect((await db.tasks.get(id))!.plannedTime).toBe('06:30');
    const data = measured(id, days(15, 6), ['08:00']);
    vi.setSystemTime(new Date('2026-11-23T10:00:00'));
    expect(
      timeSuggestions(
        input({
          tasks: [(await db.tasks.get(id))!],
          ...data,
          weeklyReview: state,
        }),
        '2026-11-15',
        '2026-11-23',
      ),
    ).toEqual([]);
  });

  it('recusa id inválido', async () => {
    await expect(declineSuggestion(WEEK, 'routine:1')).rejects.toThrow();
    await expect(
      acceptSuggestion(WEEK, {
        id: 'time:2',
        kind: 'time',
        taskId: 3,
        value: '07:00',
      }),
    ).rejects.toThrow('Sugestão inválida');
  });
});

describe('Pôr no Dia aos domingos', () => {
  it('liga e desliga só a preferência, sem missão, e repetir não muda nada', async () => {
    const tasks = await db.tasks.count();
    expect(await setSundayBlock(true)).toBe(true);
    expect(await setSundayBlock(true)).toBe(false);
    expect((await db.profile.get(1))!.weeklyReview).toMatchObject({
      version: 1,
      reviews: [],
      sundays: true,
    });
    expect(await db.tasks.count()).toBe(tasks);
    expect(await setSundayBlock(false)).toBe(true);
    expect((await db.profile.get(1))!.weeklyReview!.sundays).toBeUndefined();
  });

  it('aparece só no domingo, com a preferência, e some com a revisão feita', async () => {
    const on: WeeklyReviewState = { version: 1, reviews: [], sundays: true };
    expect(showSundayBlock(on, '2026-11-15')).toBe(true);
    expect(showSundayBlock(on, '2026-11-14')).toBe(false);
    expect(showSundayBlock(on, '2026-11-16')).toBe(false);
    expect(showSundayBlock({ version: 1, reviews: [] }, '2026-11-15')).toBe(
      false,
    );
    expect(showSundayBlock(undefined, '2026-11-15')).toBe(false);
    // Feita no sábado, 14 (semana de 8 a 14): no domingo, 15, não aparece.
    vi.setSystemTime(new Date('2026-11-14T18:00:00'));
    await setSundayBlock(true);
    await completeReview(WEEK, []);
    const state = (await db.profile.get(1))!.weeklyReview!;
    expect(showSundayBlock(state, '2026-11-15')).toBe(false);
    // No domingo seguinte, 22, a semana de 15 a 21 ainda não foi revisada.
    expect(showSundayBlock(state, '2026-11-22')).toBe(true);
  });

  it('vai e volta no backup; valor inválido é recusado', async () => {
    await setSundayBlock(true);
    const backup = JSON.parse(JSON.stringify(await createJourneyBackup()));
    expect(() => validateBackup(backup)).not.toThrow();
    await setSundayBlock(false);
    await restoreJourneyBackup(backup);
    expect((await db.profile.get(1))!.weeklyReview!.sundays).toBe(true);
    backup.data.profile.weeklyReview.sundays = 'sim';
    expect(() => validateBackup(backup)).toThrow('Revisão semanal');
  });
});
