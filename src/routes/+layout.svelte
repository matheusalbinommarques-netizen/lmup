<script lang="ts">
  // importa o CSS global (Tailwind + estilos)
  import '../app.css';

  import BottomNav from '$lib/BottomNav.svelte';

  // em Svelte 5, o conteúdo da rota vem como snippet "children"
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-background text-text">
  <!-- Conteúdo principal -->
  <main class="flex-1 px-4 pt-8 pb-24 max-w-3xl mx-auto w-full">
    {@render children()}
  </main>

  <!-- Navegação fixa no rodapé -->
  <BottomNav />
</div>
