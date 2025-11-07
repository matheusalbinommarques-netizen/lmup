<script lang="ts">
  import { page } from '$app/stores';

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
    { href: '/config', label: 'Config', icon: '/art/icones/icon-config.png' },
  ];

  // CORREÇÃO: Adicionado o $ na frente de page
  const currentPath = $derived($page.url.pathname);

  const linkClasses = (href: string) => {
    const active = currentPath === href;
    return {
      root:
        'flex flex-col items-center gap-1 text-[0.7rem] transition-colors duration-150 w-16 ' +
        (active ? 'text-primary' : 'text-text-secondary'),
      icon:
        'flex h-10 w-10 p-1 items-center justify-center rounded-full border text-base ' +
        (active
          ? 'border-primary bg-primary/10'
          : 'border-slate-700 bg-slate-900/80'),
    };
  };
</script>

<nav
  class="bottom-nav z-50 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md md:hidden"
  style="position: fixed; left: 0; right: 0; bottom: 0;"
>
  <div
    class="mx-auto flex max-w-3xl items-center justify-around gap-2 px-4 py-2"
  >
    {#each links as link (link.href)}
      {@const cls = linkClasses(link.href)}
      <a
        href={link.href}
        class={cls.root}
        aria-current={currentPath === link.href ? 'page' : undefined}
      >
        <span class={cls.icon}>
          <img
            src={link.icon}
            alt={link.label}
            class="w-6 h-6 {currentPath === link.href
              ? ''
              : 'opacity-70 grayscale-[50%]'}"
          />
        </span>
        <span>{link.label}</span>
      </a>
    {/each}
  </div>
</nav>
