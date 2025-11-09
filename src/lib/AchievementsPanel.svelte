<!-- src/lib/AchievementsPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { liveQuery } from 'dexie';
  import {
    getTotalXpObservable,
    getStreakObservable,
    calcularNivel,
  } from '../services/xpService';
  import {
    ALL_ACHIEVEMENTS,
    SECTIONS,
    createAchievementStats,
    type AchievementStats,
    type Rarity,
    type Category,
  } from '../services/achievementsCatalog';
  import {
    db,
    type Task,
    type Companion,
    type UnlockedCompanion,
  } from '../services/db';

  // regra simples: 100 XP por “nível de área”
  const XP_PER_AREA_LEVEL = 100;

  // estados globais (xp/streak/nível)
  let totalXp = $state(0);
  let streak = $state(0);

  // estatísticas de missões / áreas
  let completedMissions = $state(0);
  let completedEpicOrLegendary = $state(0);
  let completedLegendary = $state(0);
  let maxTasksInSingleArea = $state(0);
  let completedAreasCount = $state(0);
  let maxAreaLevel = $state(0);
  let areasAtLeastLevel20 = $state(0);

  // companheiros
  let unlockedCompanionsCount = $state(0);
  let hasWolf = $state(false);
  let hasDragon = $state(false);
  let allCompanionsUnlocked = $state(false);

  // placeholder pra quando tiver tracking real
  let companionInteractions = $state(0);

  const levelInfo = $derived(calcularNivel(totalXp));
  const level = $derived(levelInfo.level ?? 1);

  let unsubscribeFns: (() => void)[] = [];

  if (typeof window !== 'undefined') {
    const sub1 = getTotalXpObservable().subscribe((xp) => {
      totalXp = xp;
    });

    const sub2 = getStreakObservable().subscribe(({ count }) => {
      streak = count;
    });

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

        for (const xp of Object.values(xpPerArea)) {
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

    const companionsSub = liveQuery(async () => {
      const [companions, unlocked] = await Promise.all([
        db.companions.toArray(),
        db.unlockedCompanions.toArray(),
      ]);

      return { companions, unlocked };
    }).subscribe(
      ({
        companions,
        unlocked,
      }: {
        companions: Companion[];
        unlocked: UnlockedCompanion[];
      }) => {
        const allCompanions = companions ?? [];
        const unlockedList = unlocked ?? [];

        unlockedCompanionsCount = unlockedList.length;

        const unlockedIds = unlockedList
          .map((u) => Number(u.companionId))
          .filter((id) => Number.isFinite(id));

        hasWolf = unlockedIds.includes(1);
        hasDragon = unlockedIds.includes(3);

        const allIds = allCompanions
          .map((c) => c.id)
          .filter((id): id is number => typeof id === 'number');

        allCompanionsUnlocked =
          allIds.length > 0 && allIds.every((id) => unlockedIds.includes(id));
      },
    );

    unsubscribeFns = [
      () => sub1.unsubscribe(),
      () => sub2.unsubscribe(),
      () => tasksSub.unsubscribe(),
      () => companionsSub.unsubscribe(),
    ];
  }

  onDestroy(() => {
    for (const fn of unsubscribeFns) fn();
  });

  const achievements = $derived(
    ALL_ACHIEVEMENTS.map((a) => {
      const stats: AchievementStats = createAchievementStats({
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
        ...a,
        unlocked: a.condition(stats),
      };
    }),
  );

  const groupedSections = $derived(
    SECTIONS.map((section) => ({
      ...section,
      achievements: achievements.filter(
        (ach) => ach.category === section.category,
      ),
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

  function categoryBadgeClasses(category: Category): string {
    switch (category) {
      case 'missoes':
        return 'bg-sky-500/20 text-sky-100';
      case 'consistencia':
        return 'bg-amber-500/25 text-amber-100';
      case 'progresso':
        return 'bg-emerald-500/25 text-emerald-100';
      case 'areas':
        return 'bg-indigo-500/25 text-indigo-100';
      case 'eco':
        return 'bg-emerald-700/40 text-emerald-100';
      case 'companheiros':
        return 'bg-pink-500/25 text-pink-100';
      case 'sociais':
        return 'bg-slate-600/40 text-slate-100';
      case 'economia':
        return 'bg-lime-500/25 text-lime-100';
      default:
        return 'bg-slate-700/60 text-slate-100';
    }
  }
</script>

<section class="w-full mb-8">
  <div
    class="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-600/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(129,140,248,0.5)]"
  >
    <div class="relative px-6 py-6 md:px-8 md:py-7">
      <div
        class="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      >
        <div
          class="absolute inset-[10px] rounded-3xl border border-violet-500/35"
        ></div>
      </div>

      <div class="relative space-y-6">
        <header class="space-y-1">
          <p
            class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-violet-300/80"
          >
            Troféus &amp; conquistas
          </p>
          <div
            class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
          >
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-50">
              Mapa de conquistas
            </h2>
          </div>
        </header>

        <div class="space-y-6">
          {#each groupedSections as section (section.id)}
            <div class="space-y-3 rounded-2xl bg-slate-950/40 p-3 md:p-4">
              <div
                class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"
              >
                <h3 class="text-sm font-semibold text-slate-50 md:text-base">
                  {section.title}
                </h3>
                <p class="text-[0.7rem] text-slate-400 md:max-w-md">
                  {section.subtitle}
                </p>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                {#each section.achievements as ach (ach.id)}
                  <article
                    class={`group relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ${
                      ach.unlocked
                        ? 'border-violet-400/60 bg-slate-950/90 shadow-[0_0_20px_rgba(129,140,248,0.7)]'
                        : 'border-slate-700/70 bg-slate-950/70 opacity-60'
                    }`}
                  >
                    <div class="flex items-start gap-3">
                      <div
                        class={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                          ach.unlocked
                            ? 'bg-violet-500/20 ring-2 ring-violet-400/70'
                            : 'bg-slate-800/80 ring-2 ring-slate-600/70'
                        }`}
                        aria-hidden="true"
                      >
                        <span>{ach.icon}</span>
                      </div>

                      <div class="min-w-0 flex-1">
                        <div
                          class="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                        >
                          <h4 class="text-sm font-semibold text-slate-50">
                            {ach.title}
                          </h4>
                          <span
                            class={`rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${rarityBadgeClasses(
                              ach.rarity,
                            )}`}
                          >
                            {rarityLabel(ach.rarity)}
                          </span>
                          <span
                            class={`rounded-full px-2 py-[1px] text-[0.6rem] font-medium uppercase tracking-[0.2em] ${categoryBadgeClasses(
                              ach.category,
                            )}`}
                          >
                            {section.title.split('.')[0]}
                          </span>
                          {#if ach.future}
                            <span
                              class="rounded-full bg-slate-700/50 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-200/80"
                            >
                              Em breve
                            </span>
                          {:else if ach.unlocked}
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
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
