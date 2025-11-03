<script>
  // 1. Removemos os imports e lógica de teste (BaseCard, BaseButton, count)
  // 2. Importamos nosso novo componente
  import AreaManager from './lib/AreaManager.svelte';

  // (Nenhum import de $state é necessário, ele é global)
  let appName = $state('Level Me Up!');
</script>

<main>
  <header class="app-header">
    <h1>{appName}</h1>
  </header>

  <!-- 3. Renderizamos o gerenciador de áreas -->
  <AreaManager />
</main>

<style>
  .app-header {
    text-align: center;
    padding: var(--espacamento-md) 0;
    margin-bottom: var(--espacamento-lg);
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
</style>
