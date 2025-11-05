<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let appName = 'Level Me Up!';
</script>

<main class="max-w-3xl mx-auto p-4 md:p-6">
  <header class="text-center py-6">
    <h1 class="text-primary text-4xl font-bold">{appName}</h1>
  </header>

  <nav class="flex mb-6 border-b-2 border-border">
    <a
      href="/"
      class="text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150
        hover:text-text
        {$page.url.pathname === '/' ? 'text-primary border-primary' : ''}"
    >
      Progresso
    </a>
    <a
      href="/config"
      class="text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duração-150
        hover:text-text
        {$page.url.pathname === '/config' ? 'text-primary border-primary' : ''}"
    >
      Configurações
    </a>
  </nav>

  {@render children?.()}
</main>
