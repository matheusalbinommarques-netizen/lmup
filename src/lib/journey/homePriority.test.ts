import { makeOccurrence } from '$services/occurrenceService';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '$services/db';
import {
  PRIORITY_KEY,
  readPriority,
  savePriority,
  priorityTask,
  homeOccurrences,
  usesTaskExecution,
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

describe('compatibilidade de apresentação da Home', () => {
  it('retém pausa e notas do fluxo anterior sem alterar tarefas ou ocorrências', () => {
    const legacy = {
      ...task,
      productivityVersion: 1 as const,
      executionState: 'paused' as const,
      executionNotes: 'Guardadas',
    };
    const row = makeOccurrence(legacy, today),
      original = structuredClone(row);
    const view = homeOccurrences([row], [legacy], today);
    expect(view[0].status).toBe('paused');
    expect(usesTaskExecution(legacy, view[0], today)).toBe(true);
    expect(row).toEqual(original);
    expect(legacy.executionNotes).toBe('Guardadas');
  });
  it('não oferece tarefa arquivada, excluída ou concluída com uma ocorrência antiga pendente', () => {
    const row = makeOccurrence(task, today);
    expect(homeOccurrences([row], [], today)).toEqual([]);
    expect(
      homeOccurrences([row], [{ ...task, archived: true }], today),
    ).toEqual([]);
    expect(
      homeOccurrences(
        [row],
        [{ ...task, productivityVersion: 1, completed: true }],
        today,
      ),
    ).toEqual([]);
  });
  it('mostra conclusão legada de hoje sem persistir ou recalcular a recompensa', () => {
    const done = { ...task, completed: true, plannedDate: today };
    const view = homeOccurrences([], [done], today);
    expect(view[0]).toMatchObject({
      status: 'completed',
      due: { xp: 0, gold: 0, food: 0 },
    });
    expect(
      homeOccurrences([makeOccurrence(done, today)], [done], today)[0].status,
    ).toBe('completed');
    expect(done).not.toHaveProperty('completionEventId');
  });
  it('não reutiliza a pausa de uma ocorrência antiga e preserva a identidade reagendada', () => {
    const recurring = {
      ...task,
      productivityVersion: 1 as const,
      executionState: 'paused' as const,
      recurrence: { kind: 'daily' as const, startDate: today },
      occurrenceSession: '2026-10-30',
      tracking: { method: 'direct' as const },
    };
    const row = makeOccurrence(recurring, today);
    expect(homeOccurrences([row], [recurring], today)[0].status).toBe(
      'planned',
    );
    expect(
      usesTaskExecution(recurring, { ...row, originDate: '2026-10-30' }, today),
    ).toBe(false);
  });
  it('revisão pronta usa o fluxo existente e revisão futura não é oferecida', () => {
    const review = { ...task, reviewEnabled: true, reviewDueDate: today };
    const ready = homeOccurrences([], [review], today);
    expect(ready).toHaveLength(1);
    expect(usesTaskExecution(review, ready[0], today)).toBe(true);
    expect(
      homeOccurrences([], [{ ...review, reviewDueDate: '2099-01-01' }], today),
    ).toEqual([]);
  });
});
