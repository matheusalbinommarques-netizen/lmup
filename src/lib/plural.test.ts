import { describe, expect, it } from 'vitest';
import { countLabel } from './plural';

describe('countLabel', () => {
  it('usa o singular só para um item', () => {
    expect(countLabel(1, 'missão', 'missões')).toBe('1 missão');
    expect(countLabel(0, 'missão', 'missões')).toBe('0 missões');
    expect(countLabel(2, 'missão', 'missões')).toBe('2 missões');
  });
});
