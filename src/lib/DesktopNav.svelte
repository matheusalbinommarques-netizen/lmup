<!-- src/lib/DesktopNav.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';

  // Rota atual (mantida em state; atualizada via subscribe ao store `page`)
  let pathname = $state('/');

  let unsub: (() => void) | null = null;
  onMount(() => {
    unsub = page.subscribe((p) => {
      pathname = p.url.pathname;
    });
  });
  onDestroy(() => {
    unsub?.();
  });

  type NavLink = {
    href: string;
    label: string;
    icon: string;
  };

  const links: NavLink[] = [
    {
      href: '/',
      label: 'Taverna do Herói',
      icon: '/art/icones/icon-taverna.png',
    },
    {
      href: '/missoes',
      label: 'Quadro de Missões',
      icon: '/art/icones/icon-missoes.png',
    },
    {
      href: '/projetos',
      label: 'Projetos do Herói',
      icon: '/art/icones/icon-projetos.png',
    },
    { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
    {
      href: '/santuario',
      label: 'Santuário',
      icon: '/art/icones/icon-leaf-eco.png',
    },
    {
      href: '/config',
      label: 'Cofre Arcano',
      icon: '/art/icones/icon-config.png',
    },
  ];

  function isActive(href: string): boolean {
    return (
      pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
    );
  }
</script>

<aside
  class="hidden w-64 flex-col gap-6 border-r border-slate-800/50 bg-slate-900/80 p-4 md:flex"
>
  <!-- Logo + título -->
  <a href="/" class="flex items-center gap-3 px-2 group">
    <img
      src="/art/icones/logo lmu.png"
      alt="Logo LMU"
      class="h-12 w-12 drop-shadow-[0_0_18px_rgba(251,191,36,0.45)]"
      decoding="async"
    />

    <div class="flex flex-col leading-tight">
      <span
        class="relative inline-block font-serif text-lg md:text-xl font-extrabold"
      >
        <span
          class="absolute inset-0 text-amber-300 blur opacity-80 group-hover:blur-xl group-hover:opacity-100 transition-all duration-300"
          aria-hidden="true"
        >
          Level Me Up!
        </span>
        <span class="relative text-amber-100">Level Me Up!</span>
      </span>
      <span class="text-[0.7rem] text-slate-400">
        Seu quadro de missões gamificado
      </span>
    </div>
  </a>

  <!-- Links -->
  <nav class="flex flex-1 flex-col gap-1" aria-label="Navegação lateral">
    {#each links as link (link.href)}
      <a
        href={link.href}
        class={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          isActive(link.href)
            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/60 shadow-[0_0_18px_rgba(52,211,153,0.65)]'
            : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
        }`}
        aria-current={isActive(link.href) ? 'page' : undefined}
      >
        <img src={link.icon} alt={link.label} class="h-5 w-5" />
        <span>{link.label}</span>
      </a>
    {/each}
  </nav>
</aside>
