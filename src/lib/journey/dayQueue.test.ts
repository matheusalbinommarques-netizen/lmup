import { describe, expect, it } from 'vitest';
import type { Occurrence } from '$services/productivityTypes';
import {
  blockOf,
  dayBlocks,
  dayStartLabel,
  executionHref,
  executionQueue,
  nextInQueue,
} from './dayQueue';

const row = (
  id: string,
  routineId?: string,
  status: Occurrence['status'] = 'planned',
  value = 0,
) =>
  ({ id, routineId, status, value }) as Pick<
    Occurrence,
    'id' | 'routineId' | 'status' | 'value'
  >;

describe('blocos do Dia', () => {
  it('agrupa 2+ itens seguidos da mesma rotina', () => {
    const rows = [
      row('a', 'manha'),
      row('b', 'manha'),
      row('c'),
      row('d', 'ingles'),
      row('e', 'manha'),
      row('f', 'manha'),
      row('g', 'manha'),
    ];
    expect(dayBlocks(rows)).toEqual([
      { routineId: 'manha', ids: ['a', 'b'] },
      { routineId: 'manha', ids: ['e', 'f', 'g'] },
    ]);
    expect(blockOf(rows, 'd')).toBeUndefined();
  });

  it('a fila do bloco é o trecho do Dia, na ordem do Dia', () => {
    const rows = [row('x'), row('b', 'r'), row('a', 'r'), row('y')];
    expect(executionQueue(rows, 'bloco', 'a').map((r) => r.id)).toEqual([
      'b',
      'a',
    ]);
    expect(executionQueue(rows, 'dia', 'a').map((r) => r.id)).toEqual([
      'x',
      'b',
      'a',
      'y',
    ]);
    expect(executionQueue(rows, 'dia', 'fora')).toEqual([]);
  });
});

describe('próxima da fila', () => {
  it('segue a ordem e volta às pendentes de antes', () => {
    const queue = [
      row('a'),
      row('b', undefined, 'completed'),
      row('c'),
      row('d', undefined, 'completed'),
    ];
    expect(nextInQueue(queue, 'a')?.id).toBe('c');
    expect(nextInQueue(queue, 'c')?.id).toBe('a');
    expect(nextInQueue([row('a')], 'a')).toBeUndefined();
  });
});

it('rótulo do botão principal e endereço da tela única', () => {
  expect(dayStartLabel([row('a'), row('b')])).toBe('Iniciar dia');
  expect(dayStartLabel([row('a', undefined, 'partial', 1)])).toBe(
    'Continuar o dia',
  );
  expect(dayStartLabel([row('a', undefined, 'completed')])).toBe(
    'Continuar o dia',
  );
  expect(executionHref('t:1:2026-11-15', 'bloco')).toBe(
    '/executar/t%3A1%3A2026-11-15?fila=bloco',
  );
});

describe('fila da seleção (lote 5c)', () => {
  it('é o trecho escolhido, na ordem do Dia, e o endereço leva os ids', () => {
    const rows = [row('x'), row('b'), row('a'), row('y')];
    expect(
      executionQueue(rows, 'selecao', 'a', ['a', 'y', 'b']).map((r) => r.id),
    ).toEqual(['b', 'a', 'y']);
    expect(executionQueue(rows, 'selecao', 'x', ['a', 'b'])).toEqual([]);
    expect(
      executionHref('t:1:2026-11-15', 'selecao', ['t:1:2026-11-15', 'o,2']),
    ).toBe(
      '/executar/t%3A1%3A2026-11-15?fila=selecao&ids=t%3A1%3A2026-11-15,o%2C2',
    );
  });
});
