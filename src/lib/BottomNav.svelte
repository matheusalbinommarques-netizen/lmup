<!-- src/lib/BottomNav.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  type NavLink = {
    href: string;
    label: string;
    icon: string;
  };

  const links: NavLink[] = [
    {
      href: '/',
      label: 'Progresso',
      icon: '🏠',
    },
    {
      href: '/config',
      label: 'Configurações',
      icon: '⚙️',
    },
  ];

  const currentPath = $derived(page.url.pathname);

  const linkClasses = (href: string) => {
    const active = currentPath === href;

    return {
      root:
        'flex flex-col items-center gap-1 text-[0.7rem] transition-colors duration-150 ' +
        (active ? 'text-primary' : 'text-text-secondary'),
      icon:
        'flex h-8 w-8 items-center justify-center rounded-full border text-base ' +
        (active
          ? 'border-primary bg-primary/10'
          : 'border-slate-700 bg-slate-900/80'),
    };
  };
</script>

<nav
  class="bottom-nav z-50 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md"
  style="position: fixed; left: 0; right: 0; bottom: 0;"
>
  <div
    class="mx-auto flex max-w-3xl items-center justify-around gap-4 px-6 py-2"
  >
    {#each links as link (link.href)}
      {@const cls = linkClasses(link.href)}
      <a
        href={link.href}
        class={cls.root}
        aria-current={currentPath === link.href ? 'page' : undefined}
      >
        <span class={cls.icon}>{link.icon}</span>
        <span>{link.label}</span>
      </a>
    {/each}
  </div>
</nav>
