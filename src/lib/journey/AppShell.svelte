<script lang="ts">
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
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
    { href: '/projetos', label: destinations.projects, icon: 'projects' },
    { href: '/refugio', label: destinations.world, icon: 'world' },
  ];
  const extras = [
    { href: '/aventura', label: 'Aventura (experimento)' },
    { href: '/progresso', label: 'Meu progresso e histórico' },
    { href: '/perfil', label: 'Perfil e equipamentos' },
    { href: '/config', label: 'Configurações e backup' },
    { href: '/revisoes', label: 'Revisões e sessões' },
    { href: '/arquivo/missoes', label: 'Organização avançada de missões' },
    { href: '/santuario', label: 'Santuário' },
    { href: '/bestiario', label: destinations.companions },
    { href: '/loja', label: 'Loja' },
    { href: '/inventario', label: 'Inventário' },
    { href: '/trofeus', label: destinations.achievements },
    { href: '/cla', label: 'Clã (demonstração)' },
  ];
  const homeLinks = [
    { href: '/', label: 'Hoje', icon: 'today' },
    { href: '/missoes', label: 'Missões', icon: 'missions' },
    { href: '/progresso', label: 'Mundo', icon: 'mundo' },
    { href: '/perfil', label: 'Herói', icon: 'heroi' },
    { href: '/projetos', label: 'Projetos', icon: 'projetos_navegacao' },
    { href: '/aventura', label: 'Aventura', icon: 'aventura' },
    { href: '/refugio', label: 'Refúgio', icon: 'refugio' },
    { href: '/bestiario', label: 'Companheiros', icon: 'companheiros' },
    { href: '/#home-map', label: 'Mapa', icon: 'mapa' },
  ];
  function active(href: string) {
    const path = page.url.pathname;
    if (href === '/') return path === '/' || path.startsWith('/missao/');
    if (href === '/missoes')
      return (
        path.startsWith('/missoes') ||
        path.startsWith('/arquivo/missoes') ||
        path === '/revisoes'
      );
    if (href === '/refugio')
      return [
        '/refugio',
        '/santuario',
        '/bestiario',
        '/loja',
        '/inventario',
        '/trofeus',
      ].includes(path);
    return path.startsWith(href);
  }
  afterNavigate(() => {
    menu = false;
  });
</script>

<div
  class="lmu-design journey-shell rpg-theme visual-shell"
  class:journey-adventure={page.url.pathname === '/aventura'}
  class:journey-home={page.url.pathname === '/'}
>
  <a class="lmu-skip" href="#journey-main">Pular para o conteúdo</a>
  <aside class="journey-sidebar" class:rpg-frame={page.url.pathname === '/'}>
    {#if page.url.pathname === '/'}<RpgTrim />{/if}
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
              ? 'refugio'
              : link.icon}
          size={28}
        /><span>{link.label}</span></a
      >{/each}
  </nav>
  <Dialog bind:open={menu} title="Seu espaço"
    ><nav class="journey-extra-links" aria-label="Perfil e ferramentas">
      {#each extras as link (link.href)}<a href={link.href}
          >{link.label}<Icon name="arrow" size={18} /></a
        >{/each}
    </nav></Dialog
  >
</div>
