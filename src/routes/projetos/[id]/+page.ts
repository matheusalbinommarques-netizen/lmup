// src/routes/projetos/[id]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const rawId = params.id; // "1", "2", etc (string)
  const idNum = Number(rawId); // converte para número

  return {
    // se for um número válido > 0, passa, senão manda null
    projectId: Number.isFinite(idNum) && idNum > 0 ? idNum : null,
  };
};
