<!-- src/lib/AvatarAchievementsPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    getTotalXpObservable,
    getStreakObservable,
    calcularNivel,
  } from '../services/xpService';

  type AchievementId =
    | 'primeira-centelha'
    | 'aprendiz-dedicado'
    | 'chama-constante'
    | 'guardiao-habito'
    | 'sabio-reino';

  type Achievement = {
    id: AchievementId;
    title: string;
    rarity: 'COMUM' | 'RARO' | 'ÉPICO' | 'LENDÁRIO';
    description: string;
    /**
     * Condição para desbloquear (usa XP total e streak).
     */
    isUnlocked: (params: { xp: number; streak: number }) => boolean;
  };

  const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'primeira-centelha',
      title: 'Primeira centelha',
      rarity: 'COMUM',
      description: 'Ganhe pelo menos 10 XP.',
      isUnlocked: ({ xp }) => xp >= 10,
    },
    {
      id: 'aprendiz-dedicado',
      title: 'Aprendiz dedicado',
      rarity: 'RARO',
      description: 'Alcance 100 XP totais.',
      isUnlocked: ({ xp }) => xp >= 100,
    },
    {
      id: 'chama-constante',
      title: 'Chama constante',
      rarity: 'RARO',
      description: 'Mantenha um streak de 3 dias.',
      isUnlocked: ({ streak }) => streak >= 3,
    },
    {
      id: 'guardiao-habito',
      title: 'Guardião do hábito',
      rarity: 'ÉPICO',
      description: 'Mantenha um streak de 7 dias.',
      isUnlocked: ({ streak }) => streak >= 7,
    },
    {
      id: 'sabio-reino',
      title: 'Sábio do reino',
      rarity: 'LENDÁRIO',
      description: 'Acumule 500 XP totais.',
      isUnlocked: ({ xp }) => xp >= 500,
    },
  ];

  // estado reativo
  let totalXp = $state(0);
  let streak = $state(0);

  // só para exibir nível do avatar no card
  const levelInfo = $derived(calcularNivel(totalXp));
  const level = $derived(levelInfo.level);

  const achievementsWithStatus = $derived(
    ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: ach.isUnlocked({ xp: totalXp, streak }),
    })),
  );

  let unsubscribeFns: (() => void)[] = [];

  if (typeof window !== 'undefined') {
    const sub1 = getTotalXpObservable().subscribe((xp) => {
      totalXp = xp;
    });

    const sub2 = getStreakObservable().subscribe(({ count }) => {
      streak = count;
    });

    unsubscribeFns = [() => sub1.unsubscribe(), () => sub2.unsubscribe()];
  }

  onDestroy(() => {
    for (const fn of unsubscribeFns) fn();
  });

  function rarityBadgeClasses(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'COMUM':
        return 'bg-slate-700/80 text-slate-100';
      case 'RARO':
        return 'bg-indigo-600/80 text-indigo-50';
      case 'ÉPICO':
        return 'bg-fuchsia-600/80 text-fuchsia-50';
      case 'LENDÁRIO':
        return 'bg-amber-500/90 text-amber-900';
      default:
        return 'bg-slate-700/80 text-slate-100';
    }
  }
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(56,189,248,0.15)] md:px-8 md:py-7"
  >
    <!-- Cabeçalho -->
    <div
      class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-cyan-400/80">
          Avatar &amp; conquistas
        </p>
        <h2 class="text-xl font-bold text-white md:text-2xl">
          Conquistas do reino
        </h2>
        <p class="text-xs text-slate-300/80">
          Desbloqueie medalhas ao acumular XP e manter sua chama de foco acesa.
        </p>
      </div>

      <!-- mini avatar / nível -->
      <div
        class="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/70 bg-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.5)]"
        >
          <span class="text-xl">🛡️</span>
        </div>
        <div class="text-xs">
          <div class="text-slate-300/90">Nível do avatar</div>
          <div class="text-sm font-semibold text-cyan-300">
            {level} • {totalXp} XP
          </div>
        </div>
      </div>
    </div>

    <!-- Grade de conquistas -->
    <div class="grid gap-3 md:grid-cols-2">
      {#each achievementsWithStatus as ach (ach.id)}
        <article
          class={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs transition-all duration-300 ${
            ach.unlocked
              ? 'border-cyan-400/70 bg-slate-900/80 shadow-[0_0_25px_rgba(34,211,238,0.35)]'
              : 'border-slate-800/80 bg-slate-950/80 opacity-70'
          }`}
        >
          <!-- ícone / medalha -->
          <div
            class={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${
              ach.unlocked
                ? 'border-cyan-400/90 text-cyan-300 bg-slate-950'
                : 'border-slate-700 text-slate-400 bg-slate-950'
            }`}
          >
            {#if ach.id === 'primeira-centelha'}
              ✨
            {:else if ach.id === 'aprendiz-dedicado'}
              📘
            {:else if ach.id === 'chama-constante'}
              🔥
            {:else if ach.id === 'guardiao-habito'}
              🛡️
            {:else}
              👑
            {/if}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3
                class={`text-[0.78rem] font-semibold ${
                  ach.unlocked ? 'text-slate-50' : 'text-slate-300/90'
                }`}
              >
                {ach.title}
              </h3>
              <span
                class={`rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${rarityBadgeClasses(
                  ach.rarity,
                )}`}
              >
                {ach.rarity}
              </span>
            </div>

            <p class="mt-1 text-[0.7rem] text-slate-300/85">
              {ach.unlocked
                ? 'Desbloqueada • '
                : 'Bloqueada • '}{ach.description}
            </p>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>
