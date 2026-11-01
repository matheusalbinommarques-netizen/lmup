import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '$services/db';
import {
  PRIORITY_KEY,
  readPriority,
  savePriority,
  priorityTask,
} from './homePriority';

const today = '2026-10-31';
const task: Task = {
  id: 7,
  title: 'Missão',
  xp: 50,
  rarity: 'common',
  createdAt: today,
};
afterEach(() => vi.unstubAllGlobals());

describe('prioridade local da Home', () => {
  it('persiste a escolha e permite voltar ao automático', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    expect(savePriority(7)).toBe(true);
    expect(values.get(PRIORITY_KEY)).toBe('7');
    expect(readPriority()).toBe(7);
    expect(savePriority(null)).toBe(true);
    expect(readPriority()).toBeNull();
  });
  it.each([
    'broken',
    '"7"',
    '{}',
    '[]',
    '0',
    '-2',
    '1.5',
    '9007199254740992',
    'null',
  ])('ignora armazenamento inválido: %s', (value) => {
    vi.stubGlobal('window', { localStorage: { getItem: () => value } });
    expect(readPriority()).toBeNull();
  });
  it('tolera erros de acesso e ausência de navegador', () => {
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('denied');
      },
    });
    expect(readPriority()).toBeNull();
    expect(savePriority(7)).toBe(false);
    expect(savePriority(null)).toBe(false);
    vi.stubGlobal('window', undefined);
    expect(readPriority()).toBeNull();
  });
  it.each([
    { completed: true },
    { status: 'completed' as const },
    { archived: true },
    { plannedDate: '2026-11-01' },
    {
      recurrence: { kind: 'daily' as const, startDate: today },
      lastOccurrenceDate: today,
    },
  ])('descarta missão indisponível: %j', (change) => {
    expect(priorityTask([{ ...task, ...change }], 7, today)).toBeNull();
  });
  it('preserva andamento, pausa e a próxima ocorrência disponível', () => {
    for (const executionState of ['active', 'paused'] as const) {
      const active = { ...task, executionState };
      expect(priorityTask([active], 7, today)).toBe(active);
    }
    const recurring = {
      ...task,
      completed: true,
      recurrence: { kind: 'daily' as const, startDate: today },
      lastOccurrenceDate: '2026-10-30',
    };
    expect(priorityTask([recurring], 7, today)).toBe(recurring);
    expect(priorityTask([], 7, today)).toBeNull();
  });
});
