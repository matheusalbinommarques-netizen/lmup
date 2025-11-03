<script>
  // A LINHA DE IMPORT FOI REMOVIDA.

  // Importando seu CSS global
  import './app.css';
  // Importando o Dexie (Passo 2)
  import { db } from './services/db.js';

  // Use $state para criar estado reativo (isto agora vai funcionar)
  let appName = $state('Level Me Up!');

  // NOTA: O aviso "db is declared but its value is never read"
  // (db foi declarado mas nunca usado) é NORMAL.
  // Ele vai desaparecer assim que você usar 'db' para salvar algo.
</script>

<main>
  <h1>Bem-vindo ao {appName}</h1>

  <p>
    A Fase 1 (Setup) está completa. Agora estamos na Fase 2: Core Development!
  </p>
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
