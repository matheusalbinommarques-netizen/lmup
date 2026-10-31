import { describe, expect, it } from 'vitest';
import { newMissionSession, normalizeMissionSession } from './missionSession';

describe('fila local de sessões de missões', () => {
  const today = '2026-10-31';

  it('cria uma fila ordenada e inicia no primeiro item', () => {
    expect(newMissionSession([8, 3, 15], today)).toEqual({
      date: today,
      taskIds: [8, 3, 15],
      cursor: 0,
    });
  });

  it('preserva o cursor ao retomar uma fila válida', () => {
    expect(normalizeMissionSession({ date: today, taskIds: [1, 2], cursor: 1 }, today)).toEqual({
      date: today,
      taskIds: [1, 2],
      cursor: 1,
    });
  });

  it('não carrega a fila de um dia anterior', () => {
    expect(normalizeMissionSession({ date: today, taskIds: [1], cursor: 0 }, '2026-11-01')).toBeNull();
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
    expect(normalizeMissionSession({ date: today, taskIds: [9], cursor: 1 }, today)?.cursor).toBe(1);
  });
});
