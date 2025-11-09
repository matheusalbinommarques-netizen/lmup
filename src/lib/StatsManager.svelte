<!-- src/lib/StatsManager.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type Profile } from '$services/db';

  const fallbackProfile: Profile = {
    id: 1,
    name: 'Seu herói',
    title: 'Nobre aventureiro',
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
      Object.assign(hero, profileData ?? fallbackProfile);
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

<section class="w-full">
  <div
    class="realm-card relative mx-auto max-w-4xl overflow-hidden px-6 py-5 md:px-8 md:py-6"
  >
    <!-- brilho suave no fundo -->
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden="true"
    >
      <div
        class="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)]"
      ></div>
    </div>

    <div class="relative flex flex-col gap-4">
      <!-- Cabeçalho: nome, descrição + streak / xp total -->
      <div
        class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p class="text-[0.65rem] uppercase tracking-[0.25em] text-sky-400/80">
            Status do herói
          </p>
          <h2 class="text-xl md:text-2xl font-bold text-slate-50">
            {hero.name || 'Seu herói'}
          </h2>
          <p class="text-xs text-slate-300/80 max-w-md">
            Complete pequenas missões todos os dias para subir de nível e manter
            sua chama de foco acesa.
          </p>
        </div>

        <div class="flex flex-col items-end gap-2 text-xs">
          <!-- pill de streak -->
          <div
            class="inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-amber-100 shadow-md shadow-amber-900/40"
          >
            <span class="text-sm">🔥</span>

            {#if streak > 0}
              <span class="font-semibold">
                {streak} dia{streak === 1 ? '' : 's'}
              </span>
              <span
                class="text-[0.65rem] uppercase tracking-[0.18em] text-amber-200/80"
              >
                sequência
              </span>
            {:else}
              <span class="font-semibold">Comece hoje</span>
            {/if}
          </div>

          <p class="text-[0.7rem] text-slate-400">
            XP total:
            <span class="font-semibold text-slate-100">
              {totalXp}
            </span>
          </p>
        </div>
      </div>

      <!-- Nível + barra de progresso -->
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <!-- Level badge -->
        <div class="flex items-center gap-4">
          <div
            class="flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)]"
          >
            <img
              src="/art/heroi.png"
              alt="Avatar do herói"
              class="h-36 w-36 object-contain"
            />
          </div>
          <div class="space-y-1">
            <p
              class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-sky-300/90"
            >
              Nível atual
            </p>
            <span class="text-2xl font-bold text-green-100">
              {level}
            </span>
            <p class="text-xs text-slate-300/85 max-w-xs">
              Falta
              <span class="font-semibold text-sky-100">
                {Math.max(xpToNextLevel - currentLevelXp, 0)}
              </span>
              XP para o próximo nível.
            </p>
          </div>
        </div>

        <!-- Barra de XP -->
        <div class="w-full space-y-2 md:w-1/2">
          <div
            class="flex items-center justify-between text-[0.7rem] text-slate-400"
          >
            <span>Progresso até o próximo nível</span>
            <span class="font-medium text-slate-200">
              {currentLevelXp} / {xpToNextLevel} XP
            </span>
          </div>

          <div
            class="h-2.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"
          >
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"
              style={`width: ${xpProgress}%;`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
