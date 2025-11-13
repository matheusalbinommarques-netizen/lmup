<!-- src/lib/EcoPanel.svelte -->
<script lang="ts">
  import { db, type Profile } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  type EcoStage = {
    image: string;
    label: string;
    next: number | null; // XP alvo para o próximo estágio (null = máximo)
  };

  const fallbackProfile: Profile = {
    id: 1,
    name: '...',
    title: '...',
    level: 1,
    xpCurrent: 0,
    xpNext: 100,
    totalXpEarned: 0,
    gold: 0,
    avatarUrl: '',
    currentStreak: 0,
    lastCompletionDate: null,
    activeCompanionId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let hero = $state<Profile>(fallbackProfile);

  const heroQuery = liveQuery(() => db.profile.get(1));

  onMount(() => {
    const subscription = heroQuery.subscribe((profileData) => {
      Object.assign(hero, profileData ?? fallbackProfile);
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  // Estágio ecológico baseado no XP total
  const ecoData = $derived.by<EcoStage>(() => {
    const totalXp = hero.totalXpEarned ?? 0;

    if (totalXp < 2500) {
      return {
        image: '/art/bg/eco-stage-1-seed.webp',
        label: 'Semente',
        next: 2500,
      };
    }
    if (totalXp < 7500) {
      return {
        image: '/art/bg/eco-stage-2-sprout.webp',
        label: 'Brotinho',
        next: 7500,
      };
    }
    if (totalXp < 12000) {
      return {
        image: '/art/bg/eco-stage-3-tree.webp',
        label: 'Árvore Jovem',
        next: 12000,
      };
    }
    return {
      image: '/art/bg/eco-stage-4-forest.webp',
      label: 'Floresta Anciã',
      next: null,
    };
  });

  // Progresso dentro do estágio atual (0–100)
  const ecoPercentage = $derived.by<number>(() => {
    const totalXp = hero.totalXpEarned ?? 0;
    const stage = ecoData;

    if (stage.next === null) return 100;

    let startXp = 0;
    if (totalXp >= 12000) startXp = 12000;
    else if (totalXp >= 7500) startXp = 7500;
    else if (totalXp >= 2500) startXp = 2500;

    const currentProgress = totalXp - startXp;
    const goal = stage.next - startXp;

    if (goal <= 0) return 100;

    const pct = (currentProgress / goal) * 100;
    if (pct < 0) return 0;
    if (pct > 100) return 100;
    return pct;
  });
</script>

<section
  class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-4"
>
  <img
    src={ecoData.image}
    alt={ecoData.label}
    class="w-full h-84 object-cover rounded-lg border border-slate-700/50 shadow-inner"
  />

  <div>
    <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
      <span class="font-medium text-slate-300">Estágio: {ecoData.label}</span>

      {#if ecoData.next !== null}
        <!-- XP atual / próximo com ícone -->
        <span class="inline-flex items-center gap-1 font-medium text-slate-200">
          <img
            src="/art/icones/icon-xp.png"
            alt="XP"
            class="h-4 w-4 object-contain"
          />
          <span>{hero.totalXpEarned ?? 0} / {ecoData.next}</span>
        </span>
      {:else}
        <!-- Estágio máximo -->
        <span class="inline-flex items-center gap-1 font-medium text-green-400">
          <img
            src="/art/icones/icon-xp.png"
            alt="XP"
            class="h-4 w-4 object-contain"
          />
          <span>{hero.totalXpEarned ?? 0} (Máx)</span>
        </span>
      {/if}
    </div>

    <div
      class="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"
    >
      <div
        class="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
        style={`width: ${ecoPercentage}%;`}
      ></div>
    </div>
  </div>
</section>
