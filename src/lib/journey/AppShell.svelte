<script lang="ts">
  import { page } from '$app/state';
  import { identity } from '$lib/content/experience';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { runAutomaticFolderBackup } from '$services/folderBackup';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import '$lib/rpg-theme.css';
  import './visual.css';
  import {
    activeDestination,
    journeyTab,
    journeyTabs,
    primaryDestinations,
  } from './navigation';
  let { children }: { children: Snippet } = $props();
  // A15: silent copy to the chosen folder; it never blocks or warns here.
  onMount(() => {
    void runAutomaticFolderBackup();
    const timer = setInterval(
      () => void runAutomaticFolderBackup(),
      5 * 60_000,
    );
    const hidden = () => {
      if (document.visibilityState === 'hidden')
        void runAutomaticFolderBackup();
    };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', hidden);
    };
  });
  const links = primaryDestinations;
  const path = $derived(page.url.pathname);
  const current = $derived(activeDestination(path));
  const tab = $derived(journeyTab(path));
</script>

<div
  class="lmu-design journey-shell rpg-theme visual-shell"
  class:journey-adventure={page.url.pathname === '/mundo/campanha'}
  class:journey-home={page.url.pathname === '/'}
  class:journey-focus={page.url.pathname.startsWith('/executar/')}
  class:journey-camp={['/acampamento', '/aposentos'].includes(
    page.url.pathname,
  )}
>
  <a class="lmu-skip" href="#journey-main">Pular para o conteúdo</a>
  <aside class="journey-sidebar" aria-label="Navegação lateral">
    <a href="/" class="journey-brand journey-brand-logo"
      ><img
        src="/art/brand/logo-400.webp"
        srcset="/art/brand/logo-400.webp 400w, /art/brand/logo-800.webp 800w"
        sizes="150px"
        width="400"
        height="309"
        alt={identity.name}
      /></a
    >
    <nav aria-label="Navegação principal">
      {#each links as link (link.href)}<a
          href={link.href}
          aria-label={link.label}
          title={link.label}
          aria-current={current === link.href ? 'page' : undefined}
          ><ApprovedIcon name={link.icon} size={32} /><span
            class="journey-nav-label">{link.label}</span
          ></a
        >{/each}
    </nav>
    <div class="journey-sidebar-bottom">
      <a
        href="/config"
        class="journey-settings-link"
        aria-current={path === '/config' ? 'page' : undefined}
        ><ApprovedIcon name="opcoes" size={24} /><span class="journey-nav-label"
          >Configurações</span
        ></a
      >
    </div>
  </aside>
  <div class="journey-content">
    <header class="journey-mobile-header">
      <a href="/" class="journey-brand"
        ><img
          src="/art/brand/monograma-64.webp"
          srcset="/art/brand/monograma-64.webp 1x, /art/brand/monograma-128.webp 2x"
          width="30"
          height="32"
          alt=""
        />{identity.name}</a
      ><a
        href="/config"
        class="journey-mobile-settings"
        aria-label="Configurações"
        aria-current={path === '/config' ? 'page' : undefined}
        ><ApprovedIcon name="opcoes" size={26} /></a
      >
    </header>
    <main id="journey-main" tabindex="-1">
      {#if tab}<nav class="journey-tabs" aria-label="Jornada">
          {#each journeyTabs as item (item.href)}<a
              href={item.href}
              aria-current={tab === item.href ? 'page' : undefined}
              >{item.label}</a
            >{/each}
        </nav>{/if}
      {#if path === '/cla'}<p class="journey-banner">
          Esta tela demonstra uma ideia de Clã. Os participantes e dados são
          exemplos; não há conexão social ativa.
        </p>{/if}{@render children()}
    </main>
  </div>
  <nav class="journey-bottom-nav" aria-label="Navegação móvel">
    {#each links as link (link.href)}<a
        href={link.href}
        aria-current={current === link.href ? 'page' : undefined}
        ><ApprovedIcon name={link.icon} size={28} /><span>{link.label}</span></a
      >{/each}
  </nav>
</div>
