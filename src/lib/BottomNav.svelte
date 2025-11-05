<script lang="ts">
  import { base } from '$app/paths';

  // prop vinda do layout (com default '/')
  let { currentPath = '/' } = $props<{
    currentPath?: string;
  }>();

  const items = [
    { path: '/', href: `${base}/`, label: 'Progresso', icon: '🏠' },
    {
      path: '/config',
      href: `${base}/config`,
      label: 'Configurações',
      icon: '⚙️',
    },
  ];
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 backdrop-blur
         supports-[backdrop-filter]:bg-card/60"
>
  <ul class="mx-auto max-w-3xl grid grid-cols-2">
    {#each items as item (item.href)}
      <li>
        <a
          href={item.href}
          aria-current={currentPath === item.path ? 'page' : undefined}
          class="flex flex-col items-center gap-1 py-3 text-sm
                 {currentPath === item.path
            ? 'text-primary font-semibold'
            : 'text-text-secondary'}"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
