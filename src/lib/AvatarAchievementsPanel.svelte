<!-- src/lib/AvatarAchievementsPanel.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type Task, type Companion, type Profile } from '$services/db';
  import { getLevelStateFromTotalXp } from '$services/xpService';

  import {
    ALL_ACHIEVEMENTS,
    HIGHLIGHT_ACHIEVEMENT_IDS,
    createAchievementStats,
    type Rarity,
  } from '$services/achievementsCatalog';

  // ---------------------------------------------
  // Perfil base (fallback)
  // ---------------------------------------------
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

  // ---------------------------------------------
  // Estados globais de progresso
  // ---------------------------------------------
  // regra simples: 100 XP por “nível de área”
  const XP_PER_AREA_LEVEL = 100;

  let totalXp = $state(0);
  let streak = $state(0);

  const levelInfo = $derived(getLevelStateFromTotalXp(totalXp));
  const level = $derived(levelInfo.level ?? 1);

  // Missões / áreas
  let completedMissions = $state(0);
  let completedEpicOrLegendary = $state(0);
  let completedLegendary = $state(0);
  let maxTasksInSingleArea = $state(0);
  let completedAreasCount = $state(0);
  let maxAreaLevel = $state(0);
  let areasAtLeastLevel20 = $state(0);

  // Companheiros
  let unlockedCompanionsCount = $state(0);
  let hasWolf = $state(false);
  let hasDragon = $state(false);
  let allCompanionsUnlocked = $state(false);

  // placeholder para futuro tracking de interações
  let companionInteractions = $state(0);

  // ---------------------------------------------
  // Modo de edição dos destaques
  // ---------------------------------------------
  let isEditing = $state(false);
  let tempSelectedIds = $state<string[]>([]);
  let isSaving = $state(false);
  let errorMessage = $state<string | null>(null);

  // ---------------------------------------------
  // onMount: assina Dexie para preencher stats
  // ---------------------------------------------
  onMount(() => {
    // Perfil
    const profileSub = liveQuery(() => db.profile.get(1)).subscribe(
      (profileData) => {
        const data = (profileData ?? fallbackProfile) as Profile;
        Object.assign(hero, data);

        totalXp = data.totalXpEarned ?? 0;
        streak = data.currentStreak ?? 0;
      },
    );

    // Missões
    const tasksSub = liveQuery(() => db.tasks.toArray()).subscribe(
      (tasks: Task[]) => {
        const allTasks = tasks ?? [];
        const completed = allTasks.filter((t) => t.completed);

        completedMissions = completed.length;
        completedEpicOrLegendary = completed.filter(
          (t) => t.rarity === 'epic' || t.rarity === 'legendary',
        ).length;
        completedLegendary = completed.filter(
          (t) => t.rarity === 'legendary',
        ).length;

        const tasksPerArea: Record<number, number> = {};
        const completedAreaIds: number[] = [];
        const xpPerArea: Record<number, number> = {};

        for (const task of allTasks) {
          const areaId = Number(task.areaId);
          const xp = Number(task.xp) || 0;

          if (Number.isFinite(areaId)) {
            tasksPerArea[areaId] = (tasksPerArea[areaId] ?? 0) + 1;

            if (task.completed) {
              if (!completedAreaIds.includes(areaId)) {
                completedAreaIds.push(areaId);
              }
              xpPerArea[areaId] = (xpPerArea[areaId] ?? 0) + xp;
            }
          }
        }

        maxTasksInSingleArea = Object.values(tasksPerArea).reduce(
          (max, value) => (value > max ? value : max),
          0,
        );
        completedAreasCount = completedAreaIds.length;

        let localMaxAreaLevel = 0;
        let localAreasAtLeastLevel20 = 0;

        const xpValues = Object.values(xpPerArea) as number[];
        for (const xp of xpValues) {
          const areaLevel = Math.floor(xp / XP_PER_AREA_LEVEL);
          if (areaLevel > localMaxAreaLevel) {
            localMaxAreaLevel = areaLevel;
          }
          if (areaLevel >= 20) {
            localAreasAtLeastLevel20 += 1;
          }
        }

        maxAreaLevel = localMaxAreaLevel;
        areasAtLeastLevel20 = localAreasAtLeastLevel20;
      },
    );

    // Companheiros
    const companionsSub = liveQuery(() => db.companions.toArray()).subscribe(
      (companions: Companion[]) => {
        const allCompanions = companions ?? [];
        const unlockedList = allCompanions.filter(
          (c) => (c as any).unlocked === true,
        );

        unlockedCompanionsCount = unlockedList.length;

        const lower = (v: string | undefined | null) => (v ?? '').toLowerCase();

        hasWolf = unlockedList.some(
          (c) =>
            lower(c.key).includes('wolf') ||
            lower(c.name).includes('lobo') ||
            c.id === 1,
        );
        hasDragon = unlockedList.some(
          (c) =>
            lower(c.key).includes('drag') ||
            lower(c.name).includes('drag') ||
            c.id === 3,
        );

        allCompanionsUnlocked =
          allCompanions.length > 0 &&
          unlockedList.length === allCompanions.length;
      },
    );

    return () => {
      profileSub.unsubscribe();
      tasksSub.unsubscribe();
      companionsSub.unsubscribe();
    };
  });

  // ---------------------------------------------
  // Conquistas + status de desbloqueio
  // ---------------------------------------------
  const allAchievementsWithStatus = $derived(
    ALL_ACHIEVEMENTS.map((ach) => {
      const stats = createAchievementStats({
        totalXp,
        streak,
        level,
        completedMissions,
        completedEpicOrLegendary,
        completedLegendary,
        maxTasksInSingleArea,
        completedAreasCount,
        maxAreaLevel,
        areasAtLeastLevel20,
        unlockedCompanionsCount,
        hasWolf,
        hasDragon,
        allCompanionsUnlocked,
        companionInteractions,
      });

      return {
        ...ach,
        unlocked: ach.condition(stats),
      };
    }),
  );

  // conquistas disponíveis para seleção (apenas desbloqueadas e não futuras)
  const selectableAchievements = $derived(
    allAchievementsWithStatus.filter((a) => a.unlocked && !a.future),
  );

  // IDs atualmente em destaque (para exibição)
  const highlightIds = $derived<string[]>(
    hero.highlightAchievementIds && hero.highlightAchievementIds.length > 0
      ? hero.highlightAchievementIds
      : HIGHLIGHT_ACHIEVEMENT_IDS,
  );

  // cards que aparecem ao lado do avatar
  const displayedAchievements = $derived(
    allAchievementsWithStatus.filter((ach) => highlightIds.includes(ach.id)),
  );

  // ---------------------------------------------
  // Funções auxiliares (raridade)
  // ---------------------------------------------
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

  // ---------------------------------------------
  // Modo edição: selecionar / salvar destaques
  // ---------------------------------------------
  function startEditing() {
    errorMessage = null;

    const allowedIds = selectableAchievements.map((a) => a.id);

    // Fonte base: o que tiver salvo no perfil; se não tiver, usa default
    const fromProfile = hero.highlightAchievementIds ?? [];
    const baseSource =
      fromProfile.length > 0 ? fromProfile : HIGHLIGHT_ACHIEVEMENT_IDS;

    // Interseção com as conquistas realmente desbloqueadas
    const baseFiltered = baseSource.filter((id) => allowedIds.includes(id));

    const initial =
      baseFiltered.length > 0 ? baseFiltered : allowedIds.slice(0, 5);

    tempSelectedIds = initial.slice(0, 5);
    isEditing = true;
  }

  function cancelEditing() {
    isEditing = false;
    tempSelectedIds = [];
    errorMessage = null;
  }

  function toggleTempSelection(id: string) {
    if (!isEditing) return;

    if (tempSelectedIds.includes(id)) {
      // remover da seleção
      tempSelectedIds = tempSelectedIds.filter((x) => x !== id);
    } else {
      // limite de 5 conquistas em destaque
      if (tempSelectedIds.length >= 5) {
        errorMessage = 'Você pode destacar no máximo 5 conquistas.';
        return;
      }
      tempSelectedIds = [...tempSelectedIds, id];
    }
  }

  async function saveHighlights() {
    if (!isEditing) return;
    if (tempSelectedIds.length === 0) {
      errorMessage = 'Escolha pelo menos 1 conquista para destacar.';
      return;
    }

    isSaving = true;
    errorMessage = null;

    const idsToSave = tempSelectedIds.slice(0, 5);
    const id = hero.id ?? 1;

    try {
      hero.highlightAchievementIds = idsToSave;
      hero.updatedAt = new Date();

      await db.profile.update(id, {
        highlightAchievementIds: idsToSave,
        updatedAt: hero.updatedAt,
      });

      isEditing = false;
    } catch (err) {
      console.error(err);
      errorMessage =
        'Não foi possível salvar suas conquistas em destaque. Tente novamente.';
    } finally {
      isSaving = false;
    }
  }
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-amber-400/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(251,191,36,0.45)] md:px-8 md:py-7"
  >
    <!-- Cabeçalho + avatar -->
    <div
      class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="space-y-1">
        <p class="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300/85">
          Avatar &amp; conquistas
        </p>
        <h2 class="text-xl font-bold text-white md:text-2xl">
          Conquistas em destaque
        </h2>
        <p class="text-xs text-slate-300/80">
          Veja rapidinho como está seu nível, XP total e streak atual. Escolha
          quais troféus aparecem ao lado do seu avatar.
        </p>

        <div class="mt-2 text-[0.7rem] text-amber-200/80">
          {#if isEditing}
            <strong>Editando conquistas em destaque...</strong>
            Selecione até 5 conquistas desbloqueadas.
          {:else}
            <button
              type="button"
              class="mt-1 rounded-full border border-amber-400/70 bg-amber-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-amber-200 hover:bg-amber-500/20"
              onclick={startEditing}
            >
              Personalizar destaques
            </button>
          {/if}
        </div>
      </div>

      <!-- mini avatar / nível -->
      <div
        class="flex items-center gap-3 rounded-2xl border border-amber-400/80 bg-slate-950/90 px-3 py-2 shadow-[0_0_30px_rgba(251,191,36,0.55)]"
      >
        <div
          class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-amber-400/80 bg-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.7)]"
        >
          {#if hero.avatarUrl}
            <img
              src={hero.avatarUrl}
              alt={hero.name || 'Avatar do herói'}
              class="h-full w-full rounded-full object-cover"
            />
          {:else}
            <img
              src="/art/heroi.png"
              alt="Avatar do herói"
              class="h-full w-full rounded-full object-cover"
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

    <!-- Painel de edição (quando ativo) -->
    {#if isEditing}
      <div
        class="mb-5 rounded-2xl border border-amber-400/40 bg-slate-950/90 px-4 py-3 shadow-[0_0_25px_rgba(251,191,36,0.4)]"
      >
        <div
          class="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        >
          <p class="text-[0.72rem] text-slate-200/85">
            Escolha até
            <strong>5 conquistas desbloqueadas</strong>
            para aparecerem ao lado do seu avatar na Sala de Troféus.
          </p>
          <div class="flex gap-2 text-[0.7rem]">
            <button
              type="button"
              class="rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-slate-200 hover:bg-slate-800"
              onclick={cancelEditing}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-full border border-amber-400 bg-amber-500/90 px-3 py-1 font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              onclick={saveHighlights}
              disabled={isSaving || tempSelectedIds.length === 0}
            >
              {isSaving ? 'Salvando...' : 'Salvar destaques'}
            </button>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          {#each selectableAchievements as ach (ach.id)}
            <button
              type="button"
              class={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-xs transition-all duration-200 ${
                tempSelectedIds.includes(ach.id)
                  ? 'border-amber-400 bg-slate-900/90 shadow-[0_0_18px_rgba(251,191,36,0.55)]'
                  : 'border-slate-700 bg-slate-900/70 hover:border-amber-400/60'
              }`}
              onclick={() => toggleTempSelection(ach.id)}
            >
              <div
                class={`flex h-9 w-9 items-center justify-center rounded-full border text-base ${
                  tempSelectedIds.includes(ach.id)
                    ? 'border-amber-400 text-amber-300 bg-slate-950'
                    : 'border-slate-700 text-slate-400 bg-slate-950'
                }`}
              >
                {#if ach.icon && ach.icon.startsWith('/')}
                  <img
                    src={ach.icon}
                    alt={ach.title}
                    class="h-10 w-10 object-contain"
                  />
                {:else}
                  <span>{ach.icon}</span>
                {/if}
              </div>

              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class={`text-[0.78rem] font-semibold ${
                      tempSelectedIds.includes(ach.id)
                        ? 'text-slate-50'
                        : 'text-slate-200'
                    }`}
                  >
                    {ach.title}
                  </span>
                  <span
                    class={`rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${rarityBadgeClasses(
                      ach.rarity,
                    )}`}
                  >
                    {rarityLabel(ach.rarity)}
                  </span>
                </div>
                <p class="mt-1 text-[0.7rem] text-slate-300/85">
                  {ach.description}
                </p>
              </div>
            </button>
          {/each}
        </div>

        {#if errorMessage}
          <p class="mt-2 text-[0.7rem] text-amber-300">
            {errorMessage}
          </p>
        {/if}
      </div>
    {/if}

    <!-- Grade final de conquistas em destaque -->
    <div class="grid gap-3 md:grid-cols-2">
      {#if displayedAchievements.length === 0}
        <div
          class="col-span-full rounded-2xl border border-slate-700/70 bg-slate-950/80 px-4 py-3 text-xs text-slate-300"
        >
          Você ainda não selecionou conquistas em destaque. Clique em
          <strong>“Personalizar destaques”</strong>
          para escolher.
        </div>
      {:else}
        {#each displayedAchievements as ach (ach.id)}
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
                <img
                  src={ach.icon}
                  alt={ach.title}
                  class="h-12 w-12 object-contain"
                />
              {:else}
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
      {/if}
    </div>
  </div>
</section>
