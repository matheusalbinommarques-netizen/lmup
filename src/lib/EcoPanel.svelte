<script lang="ts">
  import { db, type Profile } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  const fallbackProfile: Profile = {
    id: 1,
    name: '...',
    title: '...',
    level: 0,
    xpCurrent: 0,
    xpNext: 100,
    totalXpEarned: 0,
    avatarUrl: '',
  };

  let hero = $state<Profile>(fallbackProfile);

  const heroQuery = liveQuery(async () => {
    const profile = await db.profile.get(1);
    return profile || fallbackProfile;
  });

  onMount(() => {
    const subscription = heroQuery.subscribe((profileData) => {
      hero = profileData || fallbackProfile;
    });
    return () => subscription.unsubscribe();
  });

  let ecoData = $derived(
    (() => {
      const totalXp = hero.totalXpEarned;

      if (totalXp < 500) {
        return {
          image: '/art/bg/eco-stage-1-seed.webp',
          label: 'Semente',
          next: 500,
        };
      }
      if (totalXp < 1500) {
        return {
          image: '/art/bg/eco-stage-2-sprout.webp',
          label: 'Brotinho',
          next: 1500,
        };
      }
      if (totalXp < 3000) {
        return {
          image: '/art/bg/eco-stage-3-tree.webp',
          label: 'Árvore Jovem',
          next: 3000,
        };
      }
      return {
        image: '/art/bg/eco-stage-4-forest.webp',
        label: 'Floresta Anciã',
        next: null,
      };
    })(),
  );

  let ecoPercentage = $derived(
    (() => {
      if (ecoData.next === null) return 100;

      const totalXp = hero.totalXpEarned;

      let startXp = 0;
      if (totalXp >= 3000) startXp = 3000;
      else if (totalXp >= 1500) startXp = 1500;
      else if (totalXp >= 500) startXp = 500;

      const currentProgress = totalXp - startXp;
      const goal = ecoData.next - startXp;

      return (currentProgress / goal) * 100;
    })(),
  );
</script>

<section
  class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-4"
>
  <img
    src={ecoData.image}
    alt={ecoData.label}
    class="w-full h-68 object-cover rounded-lg border border-slate-700/50 shadow-inner"
  />
  <div>
    <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
      <span class="font-medium text-slate-300">Estágio: {ecoData.label}</span>
      {#if ecoData.next}
        <span>{hero.totalXpEarned} / {ecoData.next} XP Total</span>
      {:else}
        <span class="text-green-400 font-medium"
          >{hero.totalXpEarned} XP Total (Máx)</span
        >
      {/if}
    </div>
    <div
      class="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"
    >
      <div
        class="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
        style="width: {ecoPercentage}%"
      ></div>
    </div>
  </div>
</section>
