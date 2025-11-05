<script>
  import { onMount } from 'svelte';
  import {
    getTotalXpObservable,
    getStreakObservable,
    calcularNivel,
  } from '../services/xpService.js';

  // --- ESTADO ---
  let totalXp = $state(0);
  let streak = $state({ count: 0 });

  // 'onMount' SÓ é executado no navegador (cliente)
  onMount(() => {
    const xpSub = getTotalXpObservable().subscribe((newXp) => {
      totalXp = newXp;
    });

    const streakSub = getStreakObservable().subscribe((newStreak) => {
      streak = newStreak;
    });

    return () => {
      xpSub.unsubscribe();
      streakSub.unsubscribe();
    };
  });

  // O 'stats' derivado funciona perfeitamente
  let stats = $derived(calcularNivel(totalXp));
</script>

<div
  class="stats-manager bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4"
>
  <div class="stat-item flex flex-col items-center min-w-[80px]">
    <span class="label text-xs font-semibold text-text-secondary uppercase mb-1"
      >NÍVEL</span
    >
    <span class="value text-3xl font-bold text-primary">{stats.nivel}</span>
  </div>

  <div class="xp-bar-container w-full flex-grow flex flex-col items-center">
    <span class="label text-xs font-semibold text-text-secondary uppercase mb-1"
      >XP TOTAL: {totalXp}</span
    >
    <div
      class="xp-bar w-full h-3 bg-background border border-border rounded-full overflow-hidden mb-1"
    >
      <div
        class="xp-progress h-full bg-success transition-all duration-300 ease-out"
        style="width: {stats.progresso}%;"
      ></div>
    </div>
    <span class="progress-label text-xs text-text-secondary font-medium">
      {stats.xpAtualNesteNivel} / {stats.xpParaProximoNivel} XP
    </span>
  </div>

  <div class="stat-item flex flex-col items-center min-w-[80px]">
    <span class="label text-xs font-semibold text-text-secondary uppercase mb-1"
      >STREAK</span
    >
    <span class="value text-3xl font-bold text-danger">🔥 {streak.count}</span>
  </div>
</div>