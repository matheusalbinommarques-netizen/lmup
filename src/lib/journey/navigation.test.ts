import { describe, expect, it } from 'vitest';
import {
  activeDestination,
  journeyTab,
  primaryDestinations,
} from './navigation';

describe('navegação de quatro destinos', () => {
  it('tem Hoje, Missões, Evolução e Jornada, nessa ordem', () => {
    expect(primaryDestinations.map((item) => item.label)).toEqual([
      'Hoje',
      'Missões',
      'Evolução',
      'Jornada',
    ]);
  });

  it.each([
    ['/', '/'],
    ['/missoes', '/missoes'],
    ['/missao/4', '/missoes'],
    ['/executar/abc', '/missoes'],
    ['/revisoes', '/missoes'],
    ['/evolucao', '/evolucao'],
    ['/roda', '/evolucao'],
    ['/projetos', '/evolucao'],
    ['/projetos/3', '/evolucao'],
    ['/progresso', '/evolucao'],
    ['/perfil', '/perfil'],
    ['/inventario', '/perfil'],
    ['/aposentos', '/perfil'],
    ['/mundo/campanha', '/perfil'],
    ['/loja', '/perfil'],
    ['/config', null],
    ['/cla', null],
    ['/missoesx', null],
  ])('%s marca %s', (path, expected) => {
    expect(activeDestination(path)).toBe(expected);
  });

  it.each([
    ['/trofeus', '/perfil'],
    ['/aposentos', '/acampamento'],
    ['/mundo/campanha', '/mundo'],
    ['/bestiario', '/mundo'],
    ['/loja', '/loja'],
    ['/roda', null],
  ])('aba da Jornada de %s é %s', (path, expected) => {
    expect(journeyTab(path)).toBe(expected);
  });
});
