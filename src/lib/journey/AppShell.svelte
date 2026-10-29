<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import Icon, { type IconName } from '$lib/ui/Icon.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let { children }: { children: Snippet } = $props();
  let menu = $state(false);
  const links: { href: string; label: string; icon: IconName }[] = [
    { href: '/', label: 'Hoje', icon: 'today' },
    { href: '/missoes', label: 'Missões', icon: 'missions' },
    { href: '/projetos', label: 'Projetos', icon: 'projects' },
    { href: '/refugio', label: 'Refúgio', icon: 'world' },
  ];
  const extras = [
    { href: '/progresso', label: 'Meu progresso e histórico' },
    { href: '/perfil', label: 'Perfil e equipamentos' },
    { href: '/config', label: 'Configurações e backup' },
    { href: '/revisoes', label: 'Revisões e sessões' },
    { href: '/arquivo/missoes', label: 'Organização avançada de missões' },
    { href: '/santuario', label: 'Santuário' },
    { href: '/bestiario', label: 'Companheiros' },
    { href: '/loja', label: 'Loja' },
    { href: '/inventario', label: 'Inventário' },
    { href: '/trofeus', label: 'Troféus' },
    { href: '/cla', label: 'Clã (demonstração)' },
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

<div class="lmu-design journey-shell">
  <a class="lmu-skip" href="#journey-main">Pular para o conteúdo</a>
  <aside class="journey-sidebar">
    <a href="/" class="journey-brand"
      ><Icon name="spark" size={28} /><span
        >Level Me Up<small>A sua próxima conquista.</small></span
      ></a
    >
    <nav aria-label="Navegação principal">
      {#each links as link (link.href)}<a
          href={link.href}
          aria-current={active(link.href) ? 'page' : undefined}
          ><Icon name={link.icon} />{link.label}</a
        >{/each}
    </nav>
    <div class="journey-sidebar-bottom">
      <Button
        variant="quiet"
        onclick={() => {
          menu = true;
        }}><Icon name="settings" />Perfil e mais</Button
      >
    </div>
  </aside>
  <div class="journey-content">
    <header class="journey-mobile-header">
      <a href="/" class="journey-brand"
        ><Icon name="spark" size={24} />Level Me Up</a
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
        ><Icon name={link.icon} /><span>{link.label}</span></a
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
