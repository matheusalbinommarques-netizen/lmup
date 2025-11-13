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
        <!-- Glow por trás -->
        <span
          class="absolute inset-0 text-amber-300 blur opacity-80 group-hover:blur-xl group-hover:opacity-100 transition-all duration-300"
          aria-hidden="true"
        >
          Level Me Up!
        </span>

        <!-- Texto principal -->
        <span
          class="relative bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(251,191,36,0.9)] group-hover:drop-shadow-[0_0_28px_rgba(251,191,36,1)] transition-all duration-300"
        >
          Level Me Up!
        </span>
      </span>
    </div>
  </a>

  <!-- Navegação -->
  <nav class="flex flex-col gap-2">
    {#each links as link (link.href)}
      <a
        href={link.href}
        class={`flex items-center gap-3 rounded-lg p-3 text-sm transition-colors ${
          pathname === link.href
            ? 'bg-primary/20 text-primary'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }`}
        aria-current={pathname === link.href ? 'page' : undefined}
      >
        <img
          src={link.icon}
          alt={link.label}
          class="h-6 w-6"
          decoding="async"
        />
        <span class="font-medium">{link.label}</span>
      </a>
    {/each}
  </nav>

  <div class="mt-auto p-2 text-center">
    <span class="text-xs text-slate-600">v0.0.0 – Alpha</span>
  </div>
</aside>
