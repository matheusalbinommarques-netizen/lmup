<script>
  // Importando seu CSS global
  import './app.css';

  // Importando o Dexie (nosso DB offline) - Conforme Step 2 da Fase 2
  // import { db } from './services/db';

  // Aqui é onde sua lógica principal do Svelte (state, etc.) vai começar.
  let appName = 'Level Me Up!';
</script>

<main>
  <h1>Bem-vindo ao {appName}</h1>

  <p>
    A Fase 1 (Setup) está completa. Agora estamos na Fase 2: Core Development!
  </p>

  <!-- 
    Seu plano (Step 1 da Fase 2) começa aqui:
    1. Implementar o Design System (tokens.css, BaseButton.svelte, etc.)
    2. Configurar a Camada de Dados (Dexie)
    3. Construir a UI (CRUD de Áreas, etc.)
  -->
</main>

<style>
  main {
    padding: 1.5rem;
    max-width: 800px;
    margin-inline: auto;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    font-weight: 600;
  }
</style>
