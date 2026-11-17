/**
 * Navegação do plano Dia único (lote 4): quatro destinos iguais no desktop
 * e no mobile. Rotas antigas continuam existindo; aqui só se decide qual
 * destino fica marcado e qual aba da Jornada está ativa.
 */
import type { GameLayer } from '$services/gameLayer';

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

/**
 * Destinos da barra por camada de jogo (design "LMUP Hoje" D1–D3): a
 * Jornada só fica na barra na camada Completa. Na Discreta ela vai para o
 * rodapé da lateral e para "Mais" no mobile; na Desligada some do menu.
 */
export function destinationsFor(layer: GameLayer): Destination[] {
  return layer === 'completa'
    ? primaryDestinations
    : primaryDestinations.filter((item) => item.href !== '/perfil');
}

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
  if (
    under(path, [
      '/evolucao',
      '/roda',
      '/projetos',
      '/progresso',
      '/revisao-semanal',
    ])
  )
    return '/evolucao';
  if (journeyTab(path)) return '/perfil';
  return null;
}
