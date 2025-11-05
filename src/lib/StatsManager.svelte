<!-- src/lib/StatsManager.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    getTotalXpObservable,
    getStreakObservable,
    calcularNivel,
  } from '../services/xpService';

  // Estados reativos com runes (sempre let)
  let totalXp = $state(0);
  let level = $state(1);
  let currentLevelXp = $state(0);
  let xpToNextLevel = $state(100);
  let streak = $state(0);

  let unsubscribeFns: (() => void)[] = [];

  if (typeof window !== 'undefined') {
    const sub1 = getTotalXpObservable().subscribe((xp) => {
      totalXp = xp;

      const info = calcularNivel(xp);
      level = info.level;
      currentLevelXp = info.currentLevelXp;
      xpToNextLevel = info.xpToNextLevel;
    });

    const sub2 = getStreakObservable().subscribe(({ count }) => {
      streak = count;
    });

    unsubscribeFns = [() => sub1.unsubscribe(), () => sub2.unsubscribe()];
  }

  onDestroy(() => {
    for (const fn of unsubscribeFns) fn();
  });

  const xpProgress = $derived(
    xpToNextLevel > 0
      ? Math.min(100, (currentLevelXp / xpToNextLevel) * 100)
      : 0,
  );
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-3xl rounded-xl bg-surface shadow-md p-6 flex flex-col gap-4 border border-border"
  >
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Level Me Up!</h1>
        <p class="text-sm text-text-secondary">Seu progresso geral</p>
      </div>

      <div class="text-right">
        <div class="text-xs uppercase tracking-wide text-text-secondary">
          STREAK
        </div>
        <div class="mt-1 flex items-center justify-end gap-1">
          <span class="text-2xl">🔥</span>
          <span class="text-xl font-semibold">{streak}</span>
        </div>
      </div>
    </header>

    <div class="grid gap-4 md:grid-cols-[auto,1fr] items-center">
      <div class="flex flex-col gap-1">
        <span class="text-xs uppercase tracking-wide text-text-secondary"
          >Nível</span
        >
        <span class="text-4xl font-bold text-accent">{level}</span>
        <span class="text-xs text-text-secondary">
          XP total:
          <span class="font-semibold">{totalXp}</span>
        </span>
      </div>

      <div class="flex flex-col gap-2">
        <div
          class="flex items-center justify-between text-xs text-text-secondary"
        >
          <span>Progresso do nível</span>
          <span>{currentLevelXp} / {xpToNextLevel} XP</span>
        </div>

        <div class="h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            class="h-full bg-green-500 transition-[width] duration-300 ease-out"
            style={`width: ${xpProgress}%;`}
          ></div>
        </div>
      </div>
    </div>
  </div>
</section>
