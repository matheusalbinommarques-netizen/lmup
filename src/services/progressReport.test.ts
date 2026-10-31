import { describe, it, expect } from 'vitest';
import { reportFor, buildLedger, type ReportInput } from './progressReport';
import { createDefaultProfile } from './profileService';
import type { ActivityEvent } from './db';
function data(): ReportInput {
  return {
    profile: createDefaultProfile(),
    events: [],
    tasks: [],
    projects: [],
    areas: [],
    owned: [],
    companions: [],
    logs: [],
  };
}
function event(id: string, extra: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id,
    kind: 'task',
    sequence: 1,
    date: '2026-10-29',
    occurredAt: '2026-10-29T12:00:00Z',
    taskId: 1,
    baseXp: 50,
    reward: { xp: 53, gold: 25, food: 2 },
    modifiers: { xpMultiplier: 1.05, goldMultiplier: 1, foodMultiplier: 1 },
    awardedStages: [],
    ecoClaimedBefore: 1,
    protectionDays: 0,
    ...extra,
  };
}
describe('relatório de progresso pelos registros', () => {
  it('uma missão com duas revisões conta uma missão e duas sessões', () => {
    const input = data();
    input.events = [
      event('task'),
      event('review-1', { kind: 'review', sequence: 2 }),
      event('review-2', { kind: 'review', sequence: 3 }),
    ];
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.distinctMissions).toBe(1);
    expect(report.reviews).toBe(2);
    expect(report.net.xp).toBe(159);
  });
  it('conserva concessão estornada e lançamento negativo no cálculo líquido', () => {
    const input = data();
    input.events = [
      event('task', { reversedAt: '2026-10-29T12:01:00Z' }),
      event('undo', {
        kind: 'reversal',
        sourceEventId: 'task',
        sequence: 2,
        reward: { xp: -53, gold: -25, food: -2 },
      }),
    ];
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.net).toEqual({ xp: 0, gold: 0, food: 0 });
    expect(report.rows).toHaveLength(2);
    expect(report.distinctMissions).toBe(0);
    expect(report.reversals).toBe(1);
  });
  it('mostra dia negativo quando o estorno é de uma concessão fora do período', () => {
    const input = data();
    input.events = [
      event('task', {
        date: '2026-09-01',
        occurredAt: '2026-09-01T12:00:00Z',
        reversedAt: '2026-10-29T12:00:00Z',
      }),
      event('undo', {
        kind: 'reversal',
        sourceEventId: 'task',
        sequence: 2,
        reward: { xp: -53, gold: -25, food: -2 },
      }),
    ];
    const report = reportFor(input, '7', '2026-10-29');
    expect(report.net.xp).toBe(-53);
    expect(report.points.at(-1)).toEqual({ date: '2026-10-29', xp: -53 });
    expect(report.points).toHaveLength(7);
  });
  it('bônus de projeto não vira missão nem sessão', () => {
    const input = data();
    input.events = [
      event('project', { kind: 'project', taskId: undefined, projectId: 2 }),
    ];
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.projects).toBe(1);
    expect(report.distinctMissions).toBe(0);
    expect(report.reviews).toBe(0);
  });
  it('recibos, compras e cuidados compõem o saldo sem transformar gasto em XP', () => {
    const input = data();
    input.profile = {
      ...input.profile,
      totalXpEarned: 153,
      gold: 1000,
      food: 20,
    };
    input.events = [event('task')];
    input.owned = [
      {
        id: 1,
        itemId: 105,
        price: 500,
        equipped: true,
        acquiredAt: '2026-10-29T13:00:00Z',
      },
    ];
    input.companions = [
      {
        id: 1,
        name: 'Lobo',
        foodInvested: 100,
        careHistory: [
          {
            id: 'care',
            amount: 100,
            fromStage: 1,
            toStage: 2,
            occurredAt: '2026-10-29T14:00:00Z',
          },
        ],
      },
    ];
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.recorded).toEqual({ xp: 53, gold: -475, food: -98 });
    expect(report.unrecorded).toEqual({ xp: 100, gold: 1475, food: 118 });
    expect(report.rows.map((row) => row.kind)).toEqual([
      'care',
      'purchase',
      'task',
    ]);
    expect(input.events).toHaveLength(1);
  });
  it('não converte logs legados ou tarefas antigas em eventos fabricados', () => {
    const input = data();
    input.profile.totalXpEarned = 777;
    input.logs = [{ date: '2026-10-01', amount: 777 }];
    input.tasks = [
      {
        id: 1,
        title: 'Antiga',
        createdAt: '2026-10-01',
        completed: true,
        xp: 777,
        rarity: 'common',
        areaId: 0,
      },
    ];
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.rows).toEqual([]);
    expect(report.distinctMissions).toBe(0);
    expect(report.unrecorded.xp).toBe(777);
    expect(report.legacyLogs).toBe(1);
  });
  it('usa área do recibo e mantém área removida identificável', () => {
    const input = data();
    input.events = [event('task')];
    input.logs = [
      { eventId: 'task', date: '2026-10-29', amount: 53, areaId: 9 },
    ];
    input.tasks = [
      {
        id: 1,
        title: 'Renomeada',
        areaId: 2,
        xp: 50,
        rarity: 'common',
        completed: true,
        createdAt: '2026-10-29',
      },
    ];
    expect(reportFor(input, 'all', '2026-10-29').byArea).toEqual([
      { id: 9, xp: 53, name: 'Área removida #9' },
    ]);
    expect(buildLedger(input)[0].title).toContain('Renomeada');
  });
  it('agrupa área zero e bônus sem área em um único grupo', () => {
    const input = data();
    input.events = [
      event('a'),
      event('b', {
        kind: 'project',
        taskId: undefined,
        projectId: 1,
        sequence: 2,
      }),
    ];
    input.logs = [{ eventId: 'a', date: '2026-10-29', amount: 53, areaId: 0 }];
    expect(reportFor(input, 'all', '2026-10-29').byArea).toEqual([
      { id: null, xp: 106, name: 'Geral e bônus' },
    ]);
  });
  it('preserva dia registrado, preenche dias sem movimento e inclui datas futuras em todo o histórico', () => {
    const input = data();
    input.events = [
      event('a', { date: '2026-10-28', occurredAt: '2026-10-29T01:00:00Z' }),
      event('future', {
        date: '2026-11-01',
        occurredAt: '2026-11-01T12:00:00Z',
        sequence: 2,
      }),
    ];
    const week = reportFor(input, '7', '2026-10-29');
    expect(week.net.xp).toBe(53);
    expect(week.points.at(-2)?.xp).toBe(53);
    expect(week.points.at(-1)?.xp).toBe(0);
    expect(reportFor(input, 'all', '2026-10-29').net.xp).toBe(106);
  });
  it('não inventa preço ausente e não modifica os dados de entrada', () => {
    const input = data();
    input.owned = [
      {
        id: 1,
        itemId: 999,
        equipped: false,
        acquiredAt: '2026-10-29T12:00:00Z',
      },
    ];
    const original = structuredClone(input);
    const report = reportFor(input, 'all', '2026-10-29');
    expect(report.unknownPrices).toBe(1);
    expect(report.rows[0].unknownCost).toBe(true);
    expect(report.net.gold).toBe(0);
    expect(input).toEqual(original);
  });
});

it('ordena movimentos pelo instante real quando um backup usa fusos ISO diferentes', () => {
  const input = data();
  input.events = [event('task', { occurredAt: '2026-10-29T15:00:00Z' })];
  input.owned = [
    {
      id: 1,
      itemId: 105,
      price: 500,
      equipped: false,
      acquiredAt: '2026-10-29T13:00:00-03:00',
    },
  ];
  expect(buildLedger(input).map((row) => row.kind)).toEqual([
    'purchase',
    'task',
  ]);
});
