<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/BottomNav.svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';

  // pega o "children" do layout (Svelte 5)
  let { children } = $props();

  // caminho atual (reactivo com runes)
  let currentPath = $state('/');

  // mantém currentPath sincronizado com o store `page`
  $effect(() => {
    const unsubscribe = page.subscribe(($page) => {
      currentPath = $page.url.pathname;
    });

    return unsubscribe;
  });
</script>

<main class="max-w-3xl mx-auto p-4 md:p-6 pb-24">
  <header class="text-center py-6">
    <h1 class="text-primary text-4xl font-bold">Level Me Up!</h1>
  </header>

  <nav class="flex gap-6 mb-6 border-b-2 border-border">
    <a
      href={`${base}/`}
      class="py-2 text-lg font-semibold
        {currentPath === '/'
        ? 'text-primary border-b-2 border-primary -mb-0.5'
        : 'text-text-secondary'}"
    >
      Progresso
    </a>

    <a
      href={`${base}/config`}
      class="py-2 text-lg font-semibold
        {currentPath === '/config'
        ? 'text-primary border-b-2 border-primary -mb-0.5'
        : 'text-text-secondary'}"
    >
      Configurações
    </a>
  </nav>

  {@render children?.()}
</main>

<!-- bottom nav fixo, recebe o path atual como prop -->
<BottomNav {currentPath} />
