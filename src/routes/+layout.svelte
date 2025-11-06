<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/BottomNav.svelte';
  import type { Snippet } from 'svelte';

  // Em runes mode, pegamos as props com $props()
  const { children } = $props<{ children: Snippet }>();
</script>

<div class="min-h-screen bg-slate-950 text-text flex flex-col">
  <!-- Conteúdo da página com espaço pro bottom nav -->
  <main class="flex-1 page-with-bottom-nav">
    {@render children()}
  </main>

  <!-- Navegação fixa no rodapé -->
  <BottomNav />
</div>
