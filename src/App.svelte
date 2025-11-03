<script>
  import AreaManager from './lib/AreaManager.svelte';
  import StatsManager from './lib/StatsManager.svelte';
  // 1. Importamos o novo SettingsManager
  import SettingsManager from './lib/SettingsManager.svelte';

  let appName = $state('Level Me Up!');

  // 2. Criamos um estado para a aba ativa
  let activeTab = $state('progresso'); // 'progresso' ou 'config'
</script>

<main>
  <header class="app-header">
    <h1>{appName}</h1>
  </header>

  <!-- 3. Adicionamos a Navegação por Abas -->
  <nav class="tabs">
    <!-- 
      Usamos 'class:active' para aplicar a classe
      se a condição for verdadeira
    -->
    <button
      class:active={activeTab === 'progresso'}
      onclick={() => (activeTab = 'progresso')}
    >
      Progresso
    </button>
    <button
      class:active={activeTab === 'config'}
      onclick={() => (activeTab = 'config')}
    >
      Configurações
    </button>
  </nav>

  <!-- 4. Renderizamos o conteúdo com base na aba ativa -->
  {#if activeTab === 'progresso'}
    <StatsManager />
    <AreaManager />
  {:else if activeTab === 'config'}
    <SettingsManager />
  {/if}
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

  /* 5. Estilos para as Abas */
  .tabs {
    display: flex;
    margin-bottom: var(--espacamento-lg);
    border-bottom: 2px solid var(--cor-borda);
  }

  .tabs button {
    background: none;
    border: none;
    font-family: var(--fonte-sistema);
    font-size: 1.1rem;
    font-weight: 600;
    padding: var(--espacamento-sm) var(--espacamento-md);
    cursor: pointer;
    color: var(--cor-texto-secundario);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px; /* Alinha com a borda principal */
  }

  .tabs button:hover {
    color: var(--cor-texto-primario);
  }

  .tabs button.active {
    color: var(--cor-marca-primaria);
    border-bottom-color: var(--cor-marca-primaria);
  }
</style>
