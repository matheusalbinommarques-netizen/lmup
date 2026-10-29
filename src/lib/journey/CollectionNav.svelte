<script lang="ts">
  import { page } from '$app/state';
  const links = [
    { href: '/refugio', label: 'Visão geral' },
    { href: '/bestiario', label: 'Companheiros' },
    { href: '/inventario', label: 'Minha coleção' },
    { href: '/loja', label: 'Loja' },
    { href: '/trofeus', label: 'Conquistas' },
  ];
</script>

<nav class="collection-nav" aria-label="Explorar o Refúgio">
  {#each links as link (link.href)}<a
      href={link.href}
      aria-current={page.url.pathname === link.href ? 'page' : undefined}
      >{link.label}</a
    >{/each}
</nav>
