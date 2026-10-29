import { describe, expect, it } from 'vitest';
import {
  getFoodFromEffectiveXp,
  getLevelStateFromTotalXp,
  getTitleForLevel,
  getXpForNextLevel,
  MAX_LEVEL,
} from './xpService';

describe('progressão atual do herói', () => {
  it.each([
    [0, 1, 0, 250],
    [249, 1, 249, 250],
    [250, 2, 0, 300],
    [549, 2, 299, 300],
    [550, 3, 0, 360],
    [900_000, 30, 650_000, 0],
  ])('%i XP resulta no nível %i', (total, level, current, next) => {
    expect(getLevelStateFromTotalXp(total)).toEqual({
      level,
      xpIntoLevel: current,
      xpForNext: next,
    });
  });

  it('atinge o limite em 250.000 XP e não exige outro nível', () => {
    expect(getLevelStateFromTotalXp(250_000)).toEqual({
      level: MAX_LEVEL,
      xpIntoLevel: 0,
      xpForNext: 0,
    });
    expect(getXpForNextLevel(MAX_LEVEL)).toBe(0);
  });

  it('resolve títulos nos limites sem retornar um valor vazio', () => {
    expect(getTitleForLevel(0)).toBe(getTitleForLevel(1));
    expect(getTitleForLevel(MAX_LEVEL)).toBe('O Criador');
    expect(getTitleForLevel(MAX_LEVEL + 1)).toBe('O Criador');
  });

  it.each([
    [0, 0],
    [25, 1],
    [26, 2],
    [50, 2],
    [51, 3],
    [75, 3],
    [76, 4],
    [100, 4],
    [250, 7],
    [500, 12],
  ])('%i XP base corresponde a %i comidas', (xp, food) => {
    expect(getFoodFromEffectiveXp(xp)).toBe(food);
  });
});
