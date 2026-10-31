// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

// O estado pessoal vive no navegador. Pré-renderizamos o shell das rotas fixas.
export const ssr = false;
export const prerender = true;

export const load: LayoutLoad = () => {
  return {};
};
