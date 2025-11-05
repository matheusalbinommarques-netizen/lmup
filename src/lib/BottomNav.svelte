<!-- src/lib/BottomNav.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  type NavItem = {
    href: string;
    label: string;
    icon: 'home' | 'settings';
  };

  const navItems: NavItem[] = [
    { href: '/', label: 'Progresso', icon: 'home' },
    { href: '/config', label: 'Configurações', icon: 'settings' },
  ];

  const activePath = $derived(page.url.pathname);
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-background/95 backdrop-blur"
>
  <div
    class="mx-auto flex max-w-5xl items-center justify-center gap-16 px-6 py-2.5 text-xs text-text-secondary"
  >
    {#each navItems as item (item.href)}
      {#if item.href === activePath}
        <a
          href={item.href}
          aria-current="page"
          class="flex flex-col items-center gap-1 text-primary"
        >
          <span class="text-xl">
            {#if item.icon === 'home'}🏠{:else if item.icon === 'settings'}⚙️{/if}
          </span>
          <span class="text-[0.7rem] font-medium tracking-wide">
            {item.label}
          </span>
        </a>
      {:else}
        <a
          href={item.href}
          class="flex flex-col items-center gap-1 text-text-secondary transition-colors hover:text-primary"
        >
          <span class="text-xl">
            {#if item.icon === 'home'}🏠{:else if item.icon === 'settings'}⚙️{/if}
          </span>
          <span class="text-[0.7rem] tracking-wide">
            {item.label}
          </span>
        </a>
      {/if}
    {/each}
  </div>
</nav>
