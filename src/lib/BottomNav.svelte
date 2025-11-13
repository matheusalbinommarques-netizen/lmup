<!-- src/lib/BottomNav.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';

  // pathname reativo sem depender de store
  let pathname = $state('/');

  function updatePath() {
    pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  }

  onMount(() => {
    updatePath();
    afterNavigate(() => updatePath());
  });

  type NavLink = {
    href: string;
    label: string;
    icon: string;
  };

  const links: NavLink[] = [
    { href: '/', label: 'Taverna', icon: '/art/icones/icon-taverna.png' },
    {
      href: '/missoes',
      label: 'Missões',
      icon: '/art/icones/icon-missoes.png',
    },
    { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
    { href: '/config', label: 'Config.', icon: '/art/icones/icon-config.png' },
  ];

  // ativa também em subrotas (ex.: /missoes/editar/1)
  function isActive(href: string): boolean {
    return (
      pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
    );
  }
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/70 bg-slate-900/95 backdrop-blur"
  aria-label="Navegação inferior"
>
  <div class="bottom-nav-inner">
    {#each links as link (link.href)}
      <a
        href={link.href}
        class={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[0.65rem] font-medium transition-colors ${
          isActive(link.href)
            ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]'
            : 'text-slate-400 hover:text-slate-100'
        }`}
        aria-current={isActive(link.href) ? 'page' : undefined}
      >
        <img src={link.icon} alt={link.label} class="h-6 w-6" />
        <span>{link.label}</span>
      </a>
    {/each}
  </div>
</nav>
