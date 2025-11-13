// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

/**
 * O layout NÃO deve acessar IndexedDB, localStorage ou RxJS.
 * Apenas retorna um objeto vazio para evitar erros de hidratação.
 */
export const load: LayoutLoad = async () => {
  return {};
};
