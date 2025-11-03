<script>
  import AreaManager from './lib/AreaManager.svelte';

  // 1. Importamos o novo StatsManager
  import StatsManager from './lib/StatsManager.svelte';

  let appName = $state('Level Me Up!');
</script>

<main>
  <header class="app-header">
    <h1>{appName}</h1>
  </header>

  <!-- 2. Adicionamos o StatsManager aqui -->
  <StatsManager />

  <!-- 3. O AreaManager continua abaixo -->
  <AreaManager />
</main>

<style>
  .app-header {
    text-align: center;
    padding: var(--espacamento-md) 0;
    /* Removemos a margem inferior para grudar no StatsManager */
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
