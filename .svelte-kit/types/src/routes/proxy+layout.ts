// @ts-nocheck
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

/**
 * Layout raiz bem simples.
 * Não acessa IndexedDB nem faz contagens aqui para evitar erros de hidratação.
 * Tudo que é "dinâmico" vem dos componentes (StatsManager, Taverna, etc).
 */
export const load = async () => {
  return {};
};
null as any as LayoutLoad;
