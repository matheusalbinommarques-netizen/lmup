<!-- src/lib/AchievementsPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    getTotalXpObservable,
    getStreakObservable,
  } from '../services/xpService';

  type Rarity = 'comum' | 'raro' | 'épico' | 'lendário';

  type AchievementDef = {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: Rarity;
    // só usamos totalXp e streak por enquanto
    condition: (stats: { totalXp: number; streak: number }) => boolean;
  };

  // catálogo de conquistas (dá pra expandir depois)
  const ALL_ACHIEVEMENTS: AchievementDef[] = [
    {
      id: 'primeiros-passos',
      title: 'Primeira centelha',
      description: 'Ganhe pelo menos 10 XP.',
      icon: '✨',
      rarity: 'comum',
      condition: ({ totalXp }) => totalXp >= 10,
    },
    {
      id: 'aprendiz-dedicado',
      title: 'Aprendiz dedicado',
      description: 'Alcance 100 XP totais.',
      icon: '📘',
      rarity: 'raro',
      condition: ({ totalXp }) => totalXp >= 100,
    },
    {
      id: 'foco-constante',
      title: 'Chama constante',
      description: 'Mantenha um streak de 3 dias.',
      icon: '🔥',
      rarity: 'raro',
      condition: ({ streak }) => streak >= 3,
    },
    {
      id: 'maratonista',
      title: 'Guardião do hábito',
      description: 'Mantenha um streak de 7 dias.',
      icon: '🛡️',
      rarity: 'épico',
      condition: ({ streak }) => streak >= 7,
    },
    {
      id: 'sabio-do-reino',
      title: 'Sábio do reino',
      description: 'Acumule 500 XP totais.',
      icon: '🏆',
      rarity: 'lendário',
      condition: ({ totalXp }) => totalXp >= 500,
    },
  ];

  // estados vindos do xpService
  let totalXp = $state(0);
  let streak = $state(0);

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
    for (const fn of unsubscribeFns) {
      fn();
    }
  });

  const achievements = $derived(
    ALL_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: a.condition({ totalXp, streak }),
    })),
  );

  function rarityLabel(rarity: Rarity): string {
    switch (rarity) {
      case 'comum':
        return 'Comum';
      case 'raro':
        return 'Raro';
      case 'épico':
        return 'Épico';
      case 'lendário':
        return 'Lendário';
      default:
        return '';
    }
  }

  function rarityBadgeClasses(rarity: Rarity): string {
    switch (rarity) {
      case 'comum':
        return 'bg-slate-600/60 text-slate-100';
      case 'raro':
        return 'bg-violet-500/25 text-violet-200';
      case 'épico':
        return 'bg-emerald-500/25 text-emerald-200';
      case 'lendário':
        return 'bg-amber-400/25 text-amber-100';
      default:
        return '';
    }
  }
</script>

<section class="w-full mb-8">
  <div
    class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-violet-600/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(129,140,248,0.5)]"
  >
    <div class="relative px-6 py-6 md:px-8 md:py-7">
      <!-- borda/ brilho interno -->
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div
          class="absolute inset-[10px] rounded-3xl border border-violet-500/35"
        ></div>
      </div>

      <div class="relative space-y-4">
        <!-- título -->
        <header class="space-y-1">
          <p
            class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-violet-300/80"
          >
            Avatar &amp; conquistas
          </p>
          <div
            class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
          >
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-50">
              Conquistas do reino
            </h2>
            <p class="text-[0.7rem] text-violet-100/80">
              Desbloqueie medalhas ao acumular XP e manter sua chama de foco
              acesa.
            </p>
          </div>
        </header>

        <!-- grade de conquistas -->
        <div class="grid gap-3 md:grid-cols-2">
          {#each achievements as ach (ach.id)}
            <article
              class={`group relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300
                ${
                  ach.unlocked
                    ? 'border-violet-400/60 bg-slate-950/90 shadow-[0_0_20px_rgba(129,140,248,0.7)]'
                    : 'border-slate-700/70 bg-slate-950/70 opacity-60'
                }`}
            >
              <div class="flex items-start gap-3">
                <div
                  class={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg
                    ${
                      ach.unlocked
                        ? 'bg-violet-500/20 ring-2 ring-violet-400/70'
                        : 'bg-slate-800/80 ring-2 ring-slate-600/70'
                    }`}
                  aria-hidden="true"
                >
                  <span>{ach.icon}</span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 class="text-sm font-semibold text-slate-50">
                      {ach.title}
                    </h3>
                    <span
                      class={`rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${rarityBadgeClasses(
                        ach.rarity,
                      )}`}
                    >
                      {rarityLabel(ach.rarity)}
                    </span>
                    {#if ach.unlocked}
                      <span
                        class="rounded-full bg-emerald-500/20 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-emerald-200"
                      >
                        Desbloqueada
                      </span>
                    {:else}
                      <span
                        class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80"
                      >
                        Bloqueada
                      </span>
                    {/if}
                  </div>

                  <p
                    class="mt-1 text-[0.72rem] leading-snug text-violet-100/85"
                  >
                    {ach.description}
                  </p>
                </div>
              </div>
            </article>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
