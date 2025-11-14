<!-- src/lib/EcoGamificationPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type Profile } from '$services/db';

  type EcoStageId = 'solo' | 'broto' | 'arbusto' | 'arvore' | 'floresta';

  type EcoStage = {
    id: EcoStageId;
    name: string;
    description: string;
    icon: string;
    minXp: number;
  };

  const STAGES: EcoStage[] = [
    {
      id: 'solo',
      name: 'Solo adormecido',
      description: 'Comece suas missões para acordar a primeira semente.',
      icon: '🌑',
      minXp: 0,
    },
    {
      id: 'broto',
      name: 'Primeiro broto',
      description: 'As primeiras missões já fizeram uma semente acordar.',
      icon: '🌱',
      minXp: 10,
    },
    {
      id: 'arbusto',
      name: 'Arbusto de foco',
      description: 'Seu hábito está criando raízes fortes.',
      icon: '🌿',
      minXp: 50,
    },
    {
      id: 'arvore',
      name: 'Árvore do hábito',
      description: 'Uma árvore inteira cresceu com sua consistência.',
      icon: '🌳',
      minXp: 150,
    },
    {
      id: 'floresta',
      name: 'Guardião da floresta',
      description: 'Sua rotina alimentou uma floresta inteira de foco.',
      icon: '🌲',
      minXp: 400,
    },
  ];

  let totalXp = $state(0);
  let streak = $state(0);

  let unsubscribeFns: (() => void)[] = [];

  if (typeof window !== 'undefined') {
    // Lê direto do perfil (XP total e streak atual)
    const profile$ = liveQuery(() => db.profile.get(1));

    const sub = profile$.subscribe((profile: Profile | undefined) => {
      totalXp = profile?.totalXpEarned ?? 0;
      streak = profile?.currentStreak ?? 0;
    });

    unsubscribeFns = [() => sub.unsubscribe()];
  }

  onDestroy(() => {
    for (const fn of unsubscribeFns) {
      fn();
    }
  });

  // ------------------------------------
  // DERIVADOS
  // ------------------------------------

  const currentStage = $derived(
    (() => {
      let stage: EcoStage = STAGES[0];

      for (const s of STAGES) {
        if (totalXp >= s.minXp && s.minXp >= stage.minXp) {
          stage = s;
        }
      }

      return stage;
    })(),
  );

  const nextStage = $derived(
    (() => {
      const currentIndex = STAGES.findIndex((s) => s.id === currentStage.id);
      if (currentIndex < 0 || currentIndex === STAGES.length - 1) return null;
      const result: EcoStage | null = STAGES[currentIndex + 1];
      return result;
    })(),
  );

  const xpProgressToNext = $derived(
    (() => {
      if (!nextStage) {
        return 100;
      }

      const from = currentStage.minXp;
      const to = nextStage.minXp;
      const span = Math.max(1, to - from);
      const clamped = Math.min(Math.max(totalXp, from), to);

      return Math.round(((clamped - from) / span) * 100);
    })(),
  );

  const streakHealth = $derived(
    (() => {
      const score = Math.min(streak, 7);
      return Math.round((score / 7) * 100);
    })(),
  );

  const streakLabel = $derived(
    (() => {
      if (streak === 0) return 'Solo frio — comece hoje mesmo.';
      if (streak < 3) return 'A chama está acendendo, continue!';
      if (streak < 7) return 'A floresta está ganhando vida.';
      return 'Floresta vibrante — seu hábito está fortíssimo!';
    })(),
  );
</script>

<section class="w-full mb-8">
  <div
    class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.6)]"
  >
    <div class="relative px-6 py-6 md:px-8 md:py-7">
      <!-- borda / glow interno -->
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div
          class="absolute inset-[10px] rounded-3xl border border-emerald-400/40"
        ></div>
      </div>

      <div class="relative space-y-5">
        <!-- título -->
        <header
          class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p
              class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-emerald-300/80"
            >
              Eco-gamificação
            </p>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-50">
              Jardim do foco
            </h2>
          </div>
          <p class="max-w-sm text-[0.7rem] text-emerald-100/85">
            Cada missão concluída alimenta o seu jardim. Mantenha o streak para
            que sua floresta nunca murche.
          </p>
        </header>

        <!-- conteúdo principal -->
        <div class="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <!-- avatar ecológico -->
          <div
            class="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/40 bg-slate-950/80 px-5 py-4"
          >
            <div class="relative flex items-center justify-center">
              <div
                class="h-24 w-24 rounded-full bg-gradient-to-b from-emerald-400/40 via-emerald-500/10 to-emerald-900/60 shadow-[0_0_35px_rgba(16,185,129,0.8)] flex items-center justify-center"
              >
                <span class="text-4xl">
                  {currentStage.icon}
                </span>
              </div>
            </div>
            <div class="text-center space-y-1">
              <p
                class="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-emerald-200"
              >
                {currentStage.name}
              </p>
              <p class="text-[0.75rem] text-emerald-100/90">
                {currentStage.description}
              </p>
            </div>

            <div class="w-full space-y-2">
              <div
                class="flex items-center justify-between text-[0.7rem] text-emerald-100/90"
              >
                <span>Progresso até o próximo estágio</span>
                {#if nextStage}
                  <span>{totalXp} / {nextStage.minXp} XP</span>
                {:else}
                  <span>{totalXp} XP — floresta máxima</span>
                {/if}
              </div>
              <div
                class="h-2.5 w-full overflow-hidden rounded-full border border-emerald-900 bg-slate-950"
              >
                <div
                  class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"
                  style={`width: ${xpProgressToNext}%;`}
                ></div>
              </div>
            </div>
          </div>

          <!-- status de saúde / streak -->
          <div
            class="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-slate-950/80 px-5 py-4"
          >
            <div class="space-y-1">
              <p
                class="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-emerald-200"
              >
                Saúde da floresta
              </p>
              <p class="text-[0.75rem] text-emerald-100/90">
                Baseada no seu streak de dias com missões concluídas.
              </p>
            </div>

            <div class="space-y-2">
              <div
                class="flex items-center justify-between text-[0.7rem] text-emerald-100/90"
              >
                <span>Streak atual</span>
                <span>{streak} {streak === 1 ? 'dia' : 'dias'}</span>
              </div>
              <div
                class="h-2.5 w-full overflow-hidden rounded-full border border-emerald-900 bg-slate-950"
              >
                <div
                  class="h-full bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 transition-[width] duration-500 ease-out"
                  style={`width: ${streakHealth}%;`}
                ></div>
              </div>
              <p class="text-[0.7rem] text-emerald-100/85">
                {streakLabel}
              </p>
            </div>

            <div class="mt-1 space-y-1">
              <p
                class="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-200"
              >
                Marcos ecológicos
              </p>
              <ul class="space-y-1.5 text-[0.7rem] text-emerald-100/85">
                <li>• 10 XP: o primeiro broto aparece.</li>
                <li>• 50 XP: o arbusto de foco ganha forma.</li>
                <li>• 150 XP: nasce a árvore do hábito.</li>
                <li>• 400 XP: você protege uma floresta inteira.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
