<!-- src/lib/DesktopNav.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  // açúcar de store em runes
  let pathname = $derived($page.url.pathname);

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
      href: '/cla',
      label: 'Clã',
      icon: '/art/icones/icon-cla.png',
    },
    {
      href: '/santuario',
      label: 'Santuário',
      icon: '/art/icones/icon-leaf-eco.png',
    },
    {
      href: '/config',
      label: 'Configurações',
      icon: '/art/icones/icon-config.png',
    },
  ];
</script>

<aside
  class="hidden w-64 flex-col gap-6 border-r border-slate-800/50 bg-slate-900/80 p-4 md:flex"
>
  <!-- Logo -->
  <a href="/" class="flex items-center gap-3 px-2">
    <img src="/art/icones/logo lmu.png" alt="Logo LMU" class="h-12 w-12" />
    <span class="font-serif text-xl font-bold text-slate-200">
      Level Me Up
    </span>
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
        <img src={link.icon} alt={link.label} class="h-6 w-6" />
        <span class="font-medium">{link.label}</span>
      </a>
    {/each}
  </nav>

  <div class="mt-auto p-2 text-center">
    <span class="text-xs text-slate-600">v0.0.0 – Alpha</span>
  </div>
</aside>
