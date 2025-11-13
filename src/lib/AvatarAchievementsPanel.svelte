<!-- src/lib/AvatarAchievementsPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type Profile } from '$services/db';
  import { getLevelStateFromTotalXp } from '$services/xpService';

  import {
    ALL_ACHIEVEMENTS,
    HIGHLIGHT_ACHIEVEMENT_IDS,
    createAchievementStats,
    type HighlightAchievementId,
    type AchievementDef,
    type Rarity,
  } from '$services/achievementsCatalog';

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
    lastCompletionDate: null,
    activeCompanionId: 1,
    gold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let hero = $state<Profile>(fallbackProfile);

  // estado reativo básico derivado do perfil
  let totalXp = $state(0);
  let streak = $state(0);

  const levelInfo = $derived(getLevelStateFromTotalXp(totalXp));
  const level = $derived(levelInfo.level ?? 1);

  const heroQuery = liveQuery(() => db.profile.get(1));

  let unsubscribe: (() => void) | null = null;

  if (typeof window !== 'undefined') {
    const profileSub = heroQuery.subscribe((profileData) => {
      const data = profileData ?? fallbackProfile;
      Object.assign(hero, data);
      totalXp = data.totalXpEarned ?? 0;
      streak = data.currentStreak ?? 0;
    });

    unsubscribe = () => profileSub.unsubscribe();
  }

  onDestroy(() => {
    unsubscribe?.();
  });

  // conquistas em destaque (subconjunto do catálogo)
  const highlightDefinitions: AchievementDef[] = ALL_ACHIEVEMENTS.filter(
    (ach) =>
      HIGHLIGHT_ACHIEVEMENT_IDS.includes(ach.id as HighlightAchievementId),
  );

  const achievementsWithStatus = $derived(
    highlightDefinitions.map((ach) => {
      const stats = createAchievementStats({
        totalXp,
        streak,
        level,
      });

      return {
        ...ach,
        unlocked: ach.condition(stats),
      };
    }),
  );

  function rarityBadgeClasses(rarity: Rarity): string {
    switch (rarity) {
      case 'comum':
        return 'bg-slate-700/80 text-slate-100';
      case 'raro':
        return 'bg-indigo-600/80 text-indigo-50';
      case 'épico':
        return 'bg-fuchsia-600/80 text-fuchsia-50';
      case 'lendário':
        return 'bg-amber-500/90 text-amber-900';
      default:
        return 'bg-slate-700/80 text-slate-100';
    }
  }

  function rarityLabel(rarity: Rarity): string {
    switch (rarity) {
      case 'comum':
        return 'COMUM';
      case 'raro':
        return 'RARO';
      case 'épico':
        return 'ÉPICO';
      case 'lendário':
        return 'LENDÁRIO';
      default:
        return '';
    }
  }
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-amber-400/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(251,191,36,0.45)] md:px-8 md:py-7"
  >
    <!-- Cabeçalho -->
    <div
      class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300/85">
          Avatar &amp; conquistas
        </p>
        <h2 class="text-xl font-bold text-white md:text-2xl">
          Conquistas em destaque
        </h2>
        <p class="text-xs text-slate-300/80">
          Veja rapidinho como está seu nível, XP total e streak atual.
        </p>
      </div>

      <!-- mini avatar / nível -->
      <div
        class="flex items-center gap-3 rounded-2xl border border-amber-400/80 bg-slate-950/90 px-3 py-2 shadow-[0_0_30px_rgba(251,191,36,0.55)]"
      >
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)] overflow-hidden"
        >
          {#if hero.avatarUrl}
            <img
              src={hero.avatarUrl}
              alt={hero.name || 'Avatar do herói'}
              class="h-full w-full object-cover rounded-full"
            />
          {:else}
            <img
              src="/art/heroi.png"
              alt="Avatar do herói"
              class="h-full w-full object-cover rounded-full"
            />
          {/if}
        </div>
        <div class="text-xs">
          <div class="text-slate-300/90">Nível do avatar</div>
          <div class="text-sm font-semibold text-amber-300">
            {level} • {totalXp} XP
          </div>
          <div class="text-[0.65rem] text-amber-200/80">
            Streak atual:
            {streak}
            {streak === 1 ? ' dia' : ' dias'}
          </div>
        </div>
      </div>
    </div>

    <!-- Grade de conquistas em destaque -->
    <div class="grid gap-3 md:grid-cols-2">
      {#each achievementsWithStatus as ach (ach.id)}
        <article
          class={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs transition-all duration-300 ${
            ach.unlocked
              ? 'border-amber-400/80 bg-slate-950/90 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
              : 'border-slate-800/80 bg-slate-950/80 opacity-75'
          }`}
        >
          <div
            class={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${
              ach.unlocked
                ? 'border-amber-400/90 text-amber-300 bg-slate-950'
                : 'border-slate-700 text-slate-400 bg-slate-950'
            }`}
          >
            {#if ach.icon && ach.icon.startsWith('/')}
              <!-- Ícone vindo de arquivo (PNG/WebP etc.) -->
              <img
                src={ach.icon}
                alt={ach.title}
                class="h-12 w-12 object-contain"
              />
            {:else}
              <!-- Ícone como emoji (comportamento antigo) -->
              <span>{ach.icon}</span>
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
                {rarityLabel(ach.rarity)}
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
