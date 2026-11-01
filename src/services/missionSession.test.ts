import { describe, expect, it } from 'vitest';
import {
  newMissionSession,
  normalizeMissionSession,
  removeMissionFromSession,
} from './missionSession';

describe('fila local de sessões de missões', () => {
  const today = '2026-10-31';

  it.each<[number, number, number[], number]>([
    [0, 8, [3, 15], 0],
    [0, 3, [8, 15], 0],
    [0, 15, [8, 3], 0],
    [1, 8, [3, 15], 0],
    [1, 3, [8, 15], 1],
    [2, 15, [8, 3], 2],
    [3, 3, [8, 15], 2],
  ])(
    'remove da fila com cursor %s e missão %s preservando o foco',
    (cursor, id, taskIds, expectedCursor) => {
      const original = {
        ...newMissionSession([8, 3, 15], today),
        cursor,
      };
      const result = removeMissionFromSession(original, id);
      expect(result).toEqual({ date: today, taskIds, cursor: expectedCursor });
      expect(original.taskIds).toEqual([8, 3, 15]);
      expect(normalizeMissionSession(result, today)).toEqual(result);
    },
  );

  it('encerra a fila ao remover seu único item e ignora IDs ausentes', () => {
    const session = newMissionSession([8], today);
    expect(removeMissionFromSession(session, 8)).toBeNull();
    expect(removeMissionFromSession(session, 99)).toBe(session);
  });

  it('cria uma fila ordenada e inicia no primeiro item', () => {
    expect(newMissionSession([8, 3, 15], today)).toEqual({
      date: today,
      taskIds: [8, 3, 15],
      cursor: 0,
    });
  });

  it('preserva o cursor ao retomar uma fila válida', () => {
    expect(
      normalizeMissionSession(
        { date: today, taskIds: [1, 2], cursor: 1 },
        today,
      ),
    ).toEqual({
      date: today,
      taskIds: [1, 2],
      cursor: 1,
    });
  });

  it('não carrega a fila de um dia anterior', () => {
    expect(
      normalizeMissionSession(
        { date: today, taskIds: [1], cursor: 0 },
        '2026-11-01',
      ),
    ).toBeNull();
  });

  it('recusa itens repetidos, IDs inválidos, filas vazias e cursores fora da fila', () => {
    for (const value of [
      { date: today, taskIds: [1, 1], cursor: 0 },
      { date: today, taskIds: [0], cursor: 0 },
      { date: today, taskIds: [1.5], cursor: 0 },
      { date: today, taskIds: [], cursor: 0 },
      { date: today, taskIds: [1], cursor: -1 },
      { date: today, taskIds: [1], cursor: 2 },
    ]) {
      expect(normalizeMissionSession(value, today)).toBeNull();
    }
  });

  it('permite o cursor no final da fila sem marcar missões como concluídas', () => {
    expect(
      normalizeMissionSession({ date: today, taskIds: [9], cursor: 1 }, today)
        ?.cursor,
    ).toBe(1);
  });
});
