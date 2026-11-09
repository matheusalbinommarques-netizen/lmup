import { describe, expect, it } from 'vitest';
import { formatCalendarMonth } from './calendar';

describe('mês apresentado no progresso', () => {
  it.each([
    ['2026-01', 'janeiro de 2026'],
    ['2026-11', 'novembro de 2026'],
    ['2026-12', 'dezembro de 2026'],
  ])('apresenta %s em português sem deslocar o mês', (value, label) => {
    expect(formatCalendarMonth(value)).toBe(label);
  });

  it.each(['2026-00', '2026-13', '2026-11-09', 'inválido'])(
    'preserva a tela diante do mês antigo inválido %s',
    (value) => {
      expect(formatCalendarMonth(value)).toBe('Mês antigo inválido');
    },
  );
});
