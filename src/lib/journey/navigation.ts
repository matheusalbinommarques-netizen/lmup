/**
 * Navegação do plano Dia único (lote 4): quatro destinos iguais no desktop
 * e no mobile. Rotas antigas continuam existindo; aqui só se decide qual
 * destino fica marcado e qual aba da Jornada está ativa.
 */
export type Destination = {
  href: string;
  label: string;
  icon: string;
};

export const primaryDestinations: Destination[] = [
  { href: '/', label: 'Hoje', icon: 'today' },
  { href: '/missoes', label: 'Missões', icon: 'missions' },
  { href: '/evolucao', label: 'Evolução', icon: 'evolucao' },
  { href: '/perfil', label: 'Jornada', icon: 'mundo' },
];

export const journeyTabs: { href: string; label: string }[] = [
  { href: '/perfil', label: 'Herói' },
  { href: '/acampamento', label: 'Acampamento' },
  { href: '/mundo', label: 'Mundo' },
  { href: '/loja', label: 'Loja' },
];

const under = (path: string, prefixes: string[]) =>
  prefixes.some((prefix) => path === prefix || path.startsWith(prefix + '/'));

const tabRoutes: Record<string, string[]> = {
  '/perfil': ['/perfil', '/inventario', '/trofeus'],
  '/acampamento': ['/acampamento', '/aposentos', '/refugio', '/santuario'],
  '/mundo': ['/mundo', '/aventura', '/bestiario'],
  '/loja': ['/loja'],
};

/** Aba da Jornada da rota, ou null fora da Jornada. */
export function journeyTab(path: string): string | null {
  for (const [tab, routes] of Object.entries(tabRoutes))
    if (under(path, routes)) return tab;
  return null;
}

/** Destino principal marcado como atual para a rota, ou null. */
export function activeDestination(path: string): string | null {
  if (path === '/') return '/';
  if (
    under(path, [
      '/missoes',
      '/arquivo/missoes',
      '/revisoes',
      '/sessoes',
      '/sessao',
      '/missao',
      '/ocorrencia',
      '/executar',
    ])
  )
    return '/missoes';
  if (under(path, ['/evolucao', '/roda', '/projetos', '/progresso']))
    return '/evolucao';
  if (journeyTab(path)) return '/perfil';
  return null;
}
