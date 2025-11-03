<script>
  // Importando os novos componentes base
  import BaseCard from './lib/BaseCard.svelte';
  import BaseButton from './lib/BaseButton.svelte';

  // Importando o Dexie (Banco de Dados)
  import { db } from './services/db.js';

  // Estado reativo (Rune do Svelte 5)
  let appName = $state('Level Me Up!');
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<main>
  <BaseCard>
    <h1>Bem-vindo ao {appName}</h1>

    <p>O Design System básico está implementado.</p>

    <p>Estes são os nossos novos componentes reutilizáveis em ação.</p>

    <!-- 
      A CORREÇÃO ESTÁ AQUI:
      'onClick' (Svelte 4) mudou para 'onclick' (Svelte 5)
    -->
    <BaseButton onclick={increment} variant="primary">
      Contador: {count}
    </BaseButton>
  </BaseCard>
</main>

<style>
  main {
    padding: var(--espacamento-lg);
    max-width: 800px;
    margin-inline: auto;
    text-align: center;
  }

  h1 {
    color: var(--cor-marca-primaria);
  }

  p {
    margin-bottom: var(--espacamento-md);
    color: var(--cor-texto-secundario);
  }
</style>
