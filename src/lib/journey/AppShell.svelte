<script lang="ts">
  import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';
  import { page } from '$app/state';
  import { identity, destinations } from '$lib/content/experience';
  import type { Snippet } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import Icon, { type IconName } from '$lib/ui/Icon.svelte';
  import Button from '$lib/ui/Button.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import '$lib/rpg-theme.css';
  import './visual.css';
  import Dialog from '$lib/ui/Dialog.svelte';
  let { children }: { children: Snippet } = $props();
  let menu = $state(false);
  const links: { href: string; label: string; icon: IconName }[] = [
    { href: '/', label: destinations.today, icon: 'today' },
    { href: '/missoes', label: destinations.missions, icon: 'missions' },
    { href: '/mundo', label: 'Mundo', icon: 'world' },
  ];
  const extras = [
    { href: '/projetos', label: 'Projetos' },
    { href: '/refugio/acampamento', label: 'Acampamento' },
    { href: '/aposentos', label: 'Aposentos' },
    { href: '/mundo', label: 'Mundo, mapa e aventuras' },
    { href: '/progresso', label: 'Meu progresso' },
    { href: '/perfil', label: 'Herói e equipamentos' },
    { href: '/config', label: 'Configurações e backup' },
    { href: '/santuario', label: 'Registros do ambiente' },
    { href: '/bestiario', label: destinations.companions },
    { href: '/loja', label: 'Loja' },
    { href: '/inventario', label: 'Inventário' },
    { href: '/trofeus', label: destinations.achievements },
    { href: '/cla', label: 'Clã (demonstração)' },
  ];
  const homeLinks = [
    { href: '/', label: 'Hoje', icon: 'today' },
    { href: '/missoes', label: 'Missões', icon: 'missions' },
    { href: '/mundo', label: 'Mundo', icon: 'mundo' },
    { href: '/refugio/acampamento', label: 'Acampamento', icon: 'refugio' },
    { href: '/perfil', label: 'Herói', icon: 'heroi' },
    { href: '/projetos', label: 'Projetos', icon: 'projetos_navegacao' },
  ];
  function active(href: string) {
    const path = page.url.pathname;
    if (href === '/') return path === '/';
    if (href === '/mundo')
      return path.startsWith('/mundo') || path.startsWith('/aventura');
    if (href === '/missoes')
      return (
        path.startsWith('/missoes') ||
        path.startsWith('/arquivo/missoes') ||
        path === '/revisoes' ||
        path === '/sessoes' ||
        path === '/sessao' ||
        path.startsWith('/missao/') ||
        path.startsWith('/ocorrencia/')
      );
    if (href === '/refugio/acampamento')
      return [
        '/refugio/acampamento',
        '/aposentos',
        '/refugio',
        '/santuario',
        '/bestiario',
      ].includes(path);
    if (href === '/aposentos')
      return [
        '/aposentos',
        '/refugio',
        '/santuario',
        '/bestiario',
        '/loja',
        '/inventario',
        '/trofeus',
      ].includes(path);
    return href !== '/mundo#mapa' && path.startsWith(href.split('?')[0]);
  }
  afterNavigate(() => {
    menu = false;
  });
</script>

<div
  class="lmu-design journey-shell rpg-theme visual-shell"
  class:journey-adventure={page.url.pathname === '/aventura'}
  class:journey-home={page.url.pathname === '/'}
  class:journey-camp={['/refugio/acampamento', '/aposentos'].includes(
    page.url.pathname,
  ) ||
    (CAMP_PREVIEW &&
      ['/refugio', '/santuario', '/bestiario'].includes(page.url.pathname))}
>
  <a class="lmu-skip" href="#journey-main">Pular para o conteúdo</a>
  <aside class="journey-sidebar" aria-label="Navegação lateral">
    <a href="/" class="journey-brand" aria-label={identity.name}
      ><Icon name="spark" size={28} /><span
        >{identity.name}<small>{identity.tagline}</small></span
      ></a
    >
    <nav aria-label="Navegação principal">
      {#each homeLinks as link (link.href)}<a
          href={link.href}
          aria-label={link.label}
          title={link.label}
          aria-current={active(link.href) ? 'page' : undefined}
          ><ApprovedIcon name={link.icon} size={32} /><span
            class="journey-nav-label">{link.label}</span
          ></a
        >{/each}
    </nav>
    <div class="journey-sidebar-bottom">
      <Button
        variant="quiet"
        aria-label="Perfil e mais"
        onclick={() => {
          menu = true;
        }}
        ><ApprovedIcon name="perfil" size={28} /><span class="journey-nav-label"
          >Perfil e mais</span
        ></Button
      >
    </div>
  </aside>
  <div class="journey-content">
    <header class="journey-mobile-header">
      <a href="/" class="journey-brand"
        ><Icon name="spark" size={24} />{identity.name}</a
      ><Button
        variant="quiet"
        aria-label="Perfil e mais"
        onclick={() => {
          menu = true;
        }}><Icon name="settings" /></Button
      >
    </header>
    <main id="journey-main" tabindex="-1">
      {#if page.url.pathname === '/cla'}<p class="journey-banner">
          Esta tela demonstra uma ideia de Clã. Os participantes e dados são
          exemplos; não há conexão social ativa.
        </p>{/if}{@render children()}
    </main>
  </div>
  <nav class="journey-bottom-nav" aria-label="Navegação móvel">
    {#each links as link (link.href)}<a
        href={link.href}
        aria-current={active(link.href) ? 'page' : undefined}
        ><ApprovedIcon
          name={link.icon === 'projects'
            ? 'projetos_navegacao'
            : link.icon === 'world'
              ? 'mundo'
              : link.icon}
          size={28}
        /><span>{link.label}</span></a
      >{/each}
    <button
      type="button"
      class="mobile-more"
      aria-label="Mais"
      aria-expanded={menu}
      onclick={() => (menu = true)}
      ><ApprovedIcon name="perfil" size={28} /><span>Mais</span></button
    >
  </nav>
  <Dialog bind:open={menu} title="Seu espaço"
    ><nav class="journey-extra-links" aria-label="Perfil e ferramentas">
      {#each extras as link (link.href)}<a href={link.href}
          >{link.label}<Icon name="arrow" size={18} /></a
        >{/each}
    </nav></Dialog
  >
</div>

<style>
  .mobile-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 56px;
    background: none;
    border: 0;
    color: inherit;
    font: inherit;
    font-size: 0.7rem;
    cursor: pointer;
  }
  .mobile-more:focus-visible {
    outline: 2px solid #e0b45b;
    outline-offset: -3px;
  }
</style>
