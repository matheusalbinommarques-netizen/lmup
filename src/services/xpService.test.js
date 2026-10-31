import { describe, it, expect } from 'vitest';
import { getLevelStateFromTotalXp, getXpForNextLevel } from './xpService';

describe('XP progression using current level thresholds', () => {
  it('starts at level 1 with 250 XP required', () => {
    expect(getLevelStateFromTotalXp(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNext: 250,
    });
  });

  it('keeps progress within level 1 before its threshold', () => {
    expect(getLevelStateFromTotalXp(125)).toEqual({
      level: 1,
      xpIntoLevel: 125,
      xpForNext: 250,
    });
  });

  it('reaches level 2 at exactly 250 total XP', () => {
    expect(getLevelStateFromTotalXp(250)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNext: 300,
    });
  });

  it('tracks progress within level 2', () => {
    expect(getLevelStateFromTotalXp(400)).toEqual({
      level: 2,
      xpIntoLevel: 150,
      xpForNext: 300,
    });
  });

  it('reaches level 3 at 550 total XP', () => {
    expect(getLevelStateFromTotalXp(550)).toEqual({
      level: 3,
      xpIntoLevel: 0,
      xpForNext: 360,
    });
  });

  it('does not exceed the configured level cap', () => {
    const result = getLevelStateFromTotalXp(1_000_000);
    expect(result.level).toBe(30);
    expect(result.xpForNext).toBe(0);
    expect(getXpForNextLevel(30)).toBe(0);
  });
});
