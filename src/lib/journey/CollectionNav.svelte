<script lang="ts">
  import { page } from '$app/state';
  import { destinations, refugeCopy } from '$lib/content/experience';
  const links = [
    { href: '/refugio', label: 'Visão geral' },
    { href: '/bestiario', label: destinations.companions },
    { href: '/inventario', label: 'Minha coleção' },
    { href: '/loja', label: 'Loja' },
    { href: '/trofeus', label: destinations.achievements },
  ];
</script>

<nav class="collection-nav" aria-label={refugeCopy.explore}>
  {#each links as link (link.href)}<a
      href={link.href}
      aria-current={page.url.pathname === link.href ? 'page' : undefined}
      >{link.label}</a
    >{/each}
</nav>
