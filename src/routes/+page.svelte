<script lang="ts">
  import { db, type Profile, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import EditProfileModal from '$lib/EditProfileModal.svelte';
  // *** CORREÇÃO: Removido o 'lib' extra do caminho ***
  import CompanionSelectModal from '$lib/CompanionSelectModal.svelte';

  // --- Estado do Herói (Fallback) ---
  const fallbackProfile: Profile = {
    id: 1,
    name: 'Carregando...',
    title: '...',
    level: 0,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    currentStreak: 0,
    lastCompletionDate: '',
    activeCompanionId: 1,
  };

  // --- Padrão Reativo Svelte 5 + Dexie ---
  let hero = $state<Profile>(fallbackProfile);
  let allCompanions = $state<Companion[]>([]);

  const heroQuery = liveQuery(() => db.profile.get(1));
  const allCompanionsQuery = liveQuery(() => db.companions.toArray());

  onMount(() => {
    const heroSub = heroQuery.subscribe((profileData) => {
      // Atualiza as propriedades do objeto $state, não o substitui.
      const data = profileData || fallbackProfile;
      Object.assign(hero, data);
    });

    const compSub = allCompanionsQuery.subscribe((companionData) => {
      // O mesmo para arrays: usar .splice para manter a reatividade.
      allCompanions.splice(0, allCompanions.length, ...(companionData || []));
    });

    return () => {
      heroSub.unsubscribe();
      compSub.unsubscribe();
    };
  });
  // --- Fim da Correção ---

  // --- Estado dos Modais ---
  let isCompanionModalOpen = $state(false);
  let isProfileModalOpen = $state(false);

  // --- Dados Derivados ---
  let xpPercentage = $derived((hero.xpCurrent / hero.xpNext) * 100);

  let activePet = $derived(
    (() => {
      if (allCompanions.length === 0) {
        return {
          name: 'Carregando...',
          type: '...',
          imagePath: '/art/pets/pet-dragon-final.png',
        };
      }
      return (
        allCompanions.find((c: Companion) => c.id === hero.activeCompanionId) ||
        allCompanions[0]
      );
    })(),
  );
</script>

{#if isProfileModalOpen}
  <EditProfileModal profile={hero} close={() => (isProfileModalOpen = false)} />
{/if}

{#if isCompanionModalOpen}
  <CompanionSelectModal close={() => (isCompanionModalOpen = false)} />
{/if}

<div class="flex flex-col gap-6">
  <header class="mb-2">
    <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
      Taverna do Herói
    </h1>
    <p class="text-slate-400">
      Bem-vindo de volta, viajante. Descanse e prepare-se.
    </p>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <section
      class="col-span-1 lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-lg relative overflow-hidden"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
      ></div>

      <div class="relative shrink-0">
        <div class="relative w-32 h-32 rounded-full shadow-2xl">
          {#if hero.avatarUrl}
            <img
              src={hero.avatarUrl}
              alt={hero.name}
              class="w-full h-full object-cover rounded-full"
            />
          {:else}
            <div class="w-full h-full rounded-full bg-slate-700"></div>
          {/if}

          <img
            src="/art/hero-avatar-default.png"
            alt="Moldura do Avatar"
            class="absolute inset-0 w-full h-full pointer-events-none"
            style="transform: scale(1.40);"
          />
        </div>

        <div class="absolute -bottom-3 inset-x-0 flex justify-center">
          <span
            class="bg-[#ffb74d] text-slate-950 font-bold text-sm px-3 py-1 rounded-full border-2 border-[#3a2f25] shadow-sm"
          >
            Lvl {hero.level}
          </span>
        </div>
      </div>

      <div class="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0">
        <div class="flex items-center justify-center sm:justify-start gap-3">
          <h2 class="text-2xl font-bold text-slate-100">{hero.name}</h2>
          <button
            onclick={() => (isProfileModalOpen = true)}
            class="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-slate-800 transition-colors"
            title="Editar Perfil"
          >
            ✏️
          </button>
        </div>
        <p class="text-[#ffb74d]/80 font-medium mb-4">{hero.title}</p>

        <div
          class="flex items-center justify-between text-xs text-slate-400 mb-1"
        >
          <span>XP</span>
          <span>{hero.xpCurrent} / {hero.xpNext}</span>
        </div>
        <div
          class="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"
        >
          <div
            class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
            style="width: {xpPercentage}%"
          ></div>
        </div>
      </div>
    </section>

    <section
      class="col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden"
    >
      <div class="absolute top-0 right-0 p-3 opacity-50">🐾</div>
      <h3 class="text-slate-300 font-semibold mb-4 w-full text-left">
        Companheiro
      </h3>

      <img
        src={activePet.imagePath}
        alt={activePet.name}
        class="w-24 h-24 object-contain drop-shadow-xl animate-pulse-slow"
      />
      <h4 class="text-lg font-bold text-slate-200 mt-2">{activePet.name}</h4>
      <p class="text-sm text-slate-500">{activePet.type}</p>

      <button
        onclick={() => (isCompanionModalOpen = true)}
        class="mt-4 w-full py-2 text-sm text-slate-400 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors"
      >
        Trocar Companheiro
      </button>
    </section>
  </div>

  <h3 class="text-xl font-bold text-slate-200 mt-4 font-serif">
    Serviços da Taverna
  </h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button
      class="p-4 bg-slate-900/50 border border-slate-800 hover:border-primary/50 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all group"
    >
      <span class="text-3xl group-hover:scale-110 transition-transform">🛒</span
      >
      <span class="font-medium text-slate-300">Loja & Inventário</span>
    </button>
    <button
      class="p-4 bg-slate-900/50 border border-slate-800 hover:border-primary/50 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all group"
    >
      <span class="text-3xl group-hover:scale-110 transition-transform">🏆</span
      >
      <span class="font-medium text-slate-300">Sala de Troféus</span>
    </button>
    <button
      class="p-4 bg-slate-900/50 border border-slate-800 hover:border-primary/50 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all group"
    >
      <span class="text-3xl group-hover:scale-110 transition-transform">🧥</span
      >
      <span class="font-medium text-slate-300">Guarda-Roupa</span>
    </button>
    <button
      class="p-4 bg-slate-900/50 border border-slate-800 hover:border-primary/50 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all group"
    >
      <span class="text-3xl group-hover:scale-110 transition-transform">📖</span
      >
      <span class="font-medium text-slate-300">Bestiário</span>
    </button>
  </div>
</div>

<style>
  .animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }
</style>
