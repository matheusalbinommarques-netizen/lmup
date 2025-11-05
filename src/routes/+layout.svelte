<script>
  import { page } from '$app/stores';
  import '../app.css';

  let appName = 'Level Me Up!';

  // --- CORREÇÃO AQUI ---
  // Capturamos o 'children' (o conteúdo da página)
  let { children } = $props();
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
      class="text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150
        hover:text-text
        {$page.url.pathname === '/config' ? 'text-primary border-primary' : ''}"
    >
      Configurações
    </a>
  </nav>

  {@render children?.()}
</main>
