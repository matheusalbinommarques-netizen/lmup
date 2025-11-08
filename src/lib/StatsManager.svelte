<!-- src/lib/StatsManager.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type Profile } from '$services/db';

  const fallbackProfile: Profile = {
    id: 1,
    name: 'Carregando...',
    title: '...',
    level: 1,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    currentStreak: 0,
    lastCompletionDate: '',
    activeCompanionId: 1,
  };

  const hero = $state<Profile>(fallbackProfile);

  const heroQuery = liveQuery(() => db.profile.get(1));

  onMount(() => {
    const sub = heroQuery.subscribe((profileData) => {
      Object.assign(hero, profileData || fallbackProfile);
    });
    return () => sub.unsubscribe();
  });

  const totalXp = $derived(hero.totalXpEarned ?? 0);
  const level = $derived(hero.level ?? 1);
  const currentLevelXp = $derived(hero.xpCurrent ?? 0);
  const xpToNextLevel = $derived(hero.xpNext ?? 100);
  const streak = $derived(hero.currentStreak ?? 0);

  const xpProgress = $derived(
    xpToNextLevel > 0
      ? Math.min(100, (currentLevelXp / xpToNextLevel) * 100)
      : 0,
  );
</script>

<section class="w-full mb-8">
  <div
    class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl"
  >
    <div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8">
      <!-- brilho / mapa de fundo -->
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div
          class="h-full w-full bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]"
        ></div>
      </div>

      <!-- Título -->
      <div class="relative flex flex-col items-center gap-3 text-center">
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70">
          Reino do aprendizado
        </p>
        <h1 class="text-3xl font-extrabold text-primary drop-shadow">
          Level Me Up!
        </h1>
        <p class="max-w-md text-xs text-text-secondary">
          Complete missões todos os dias para evoluir de nível e manter sua
          chama de foco acesa.
        </p>
      </div>

      <!-- Avatar / nível -->
      <div class="relative mt-6 flex flex-col items-center gap-4">
        <div
          class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-950/90 shadow-[0_0_40px_rgba(251,191,36,0.7)]"
        >
          <span class="text-3xl">🛡️</span>
        </div>

        <div
          class="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"
        >
          <span
            class="text-[0.65rem] uppercase tracking-widest text-text-secondary"
          >
            Nível
          </span>
          <span class="text-2xl font-bold text-white">{level}</span>
        </div>

        <div class="text-xs text-text-secondary">
          XP total:
          <span class="font-semibold text-primary">{totalXp}</span>
        </div>
      </div>

      <!-- Barra de progresso -->
      <div class="relative mt-6 w-full space-y-2">
        <div
          class="flex items-center justify-between text-[0.7rem] text-text-secondary"
        >
          <span>Progresso até o próximo nível</span>
          <span>{currentLevelXp} / {xpToNextLevel} XP</span>
        </div>

        <div
          class="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"
        >
          <div
            class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"
            style={`width: ${xpProgress}%;`}
          ></div>
        </div>
      </div>

      <!-- Streak -->
      <div
        class="relative mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 text-xs text-text-secondary md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">🔥</span>
          <div>
            <div class="font-semibold text-text">Streak de dias</div>
            <div class="text-[0.7rem]">
              Faça pelo menos uma missão por dia para manter a chama acesa.
            </div>
          </div>
        </div>

        <div class="flex items-baseline justify-end gap-1">
          <span class="text-3xl font-bold text-primary">{streak}</span>
          <span
            class="text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary"
          >
            dias
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
