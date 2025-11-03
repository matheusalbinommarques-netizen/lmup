<script>
  // 1. Importamos as funções de XP e a nova função de Streak
  import {
    getTotalXpObservable,
    getStreakObservable,
    calcularNivel,
  } from '../services/xpService.js';

  // --- ESTADO ---

  // 2. Criamos um $state para o XP e outro para a Streak
  let totalXp = $state(0);
  let streak = $state({ count: 0 }); // Começa com um objeto

  // 3. Assinamos o Observable de XP
  $effect(() => {
    const xpSub = getTotalXpObservable().subscribe((newXp) => {
      totalXp = newXp;
    });

    // 4. Assinamos o Observable de Streak
    const streakSub = getStreakObservable().subscribe((newStreak) => {
      streak = newStreak;
    });

    // 5. Retornamos a limpeza para ambas as assinaturas
    return () => {
      xpSub.unsubscribe();
      streakSub.unsubscribe();
    };
  });

  // 'stats' continua sendo derivado apenas do 'totalXp'
  let stats = $derived(calcularNivel(totalXp));
</script>

<div class="stats-manager">
  <div class="stat-item">
    <span class="label">NÍVEL</span>
    <span class="value level">{stats.nivel}</span>
  </div>

  <div class="stat-item xp-bar-container">
    <span class="label">XP TOTAL: {totalXp}</span>
    <div class="xp-bar">
      <div class="xp-progress" style="width: {stats.progresso}%;"></div>
    </div>
    <span class="progress-label">
      {stats.xpAtualNesteNivel} / {stats.xpParaProximoNivel} XP
    </span>
  </div>

  <!-- 
    6. UI ATUALIZADA:
    Agora o valor da streak vem do nosso estado 'streak.count'
  -->
  <div class="stat-item">
    <span class="label">STREAK</span>
    <span class="value streak">🔥 {streak.count}</span>
  </div>
</div>

<style>
  .stats-manager {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--cor-fundo-card);
    border: 1px solid var(--cor-borda);
    border-radius: var(--raio-borda-md);
    padding: var(--espacamento-md) var(--espacamento-lg);
    box-shadow: var(--sombra-card);
    margin-bottom: var(--espacamento-lg);
    gap: var(--espacamento-lg);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--cor-texto-secundario);
    text-transform: uppercase;
    margin-bottom: var(--espacamento-xs);
  }

  .value {
    font-size: 1.75rem;
    font-weight: 700;
  }
  .level {
    color: var(--cor-marca-primaria);
  }
  .streak {
    color: var(--cor-perigo);
  }

  .xp-bar-container {
    flex-grow: 1;
    align-items: stretch;
    text-align: center;
  }

  .xp-bar {
    width: 100%;
    height: 12px;
    background-color: var(--cor-fundo);
    border: 1px solid var(--cor-borda);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: var(--espacamento-xs);
  }

  .xp-progress {
    height: 100%;
    background-color: var(--cor-sucesso);
    width: 0%;
    transition: width 0.3s ease-out;
  }

  .progress-label {
    font-size: 0.75rem;
    color: var(--cor-texto-secundario);
    font-weight: 500;
  }
</style>
