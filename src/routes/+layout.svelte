<script>
  import { page } from '$app/stores'; // Store nativa do SvelteKit
  import '../app.css'; // Importando estilos globais
  import '../styles/tokens.css'; // Importando estilos globais

  let appName = 'Level Me Up!';
</script>

<main>
  <header class="app-header">
    <h1>{appName}</h1>
  </header>

  <nav class="tabs">
    <a href="/" class:active={$page.url.pathname === '/'}> Progresso </a>
    <a href="/config" class:active={$page.url.pathname === '/config'}>
      Configurações
    </a>
  </nav>

  <slot />
</main>

<style>
  .app-header {
    text-align: center;
    padding: var(--espacamento-md) 0;
  }

  h1 {
    color: var(--cor-marca-primaria);
    font-size: 2.5rem;
  }

  main {
    padding: var(--espacamento-lg);
    max-width: 800px;
    margin-inline: auto;
  }

  .tabs {
    display: flex;
    margin-bottom: var(--espacamento-lg);
    border-bottom: 2px solid var(--cor-borda);
  }

  /* Ajustamos o seletor de 'button' para 'a' */
  .tabs a {
    background: none;
    border: none;
    font-family: var(--fonte-sistema);
    font-size: 1.1rem;
    font-weight: 600;
    padding: var(--espacamento-sm) var(--espacamento-md);
    cursor: pointer;
    color: var(--cor-texto-secundario);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    text-decoration: none; /* Remove sublinhado do link */
  }

  .tabs a:hover {
    color: var(--cor-texto-primario);
  }

  .tabs a.active {
    color: var(--cor-marca-primaria);
    border-bottom-color: var(--cor-marca-primaria);
  }
</style>
