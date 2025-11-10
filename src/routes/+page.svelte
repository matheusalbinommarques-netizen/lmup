<script lang="ts">
  import { db, type Profile, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import EditProfileModal from '$lib/EditProfileModal.svelte';
  import CompanionSelectModal from '$lib/CompanionSelectModal.svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';

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
      const data = profileData || fallbackProfile;
      Object.assign(hero, data);
    });

    const compSub = allCompanionsQuery.subscribe((companionData) => {
      allCompanions.splice(0, allCompanions.length, ...(companionData || []));
    });

    return () => {
      heroSub.unsubscribe();
      compSub.unsubscribe();
    };
  });

  // --- Estado dos Modais ---
  let isCompanionModalOpen = $state(false);
  let isProfileModalOpen = $state(false);

  // --- Dados Derivados ---
  let xpPercentage = $derived(
    hero.xpNext > 0 ? (hero.xpCurrent / hero.xpNext) * 100 : 0,
  );

  // corrigindo typo: usar hero.xpNext
  $effect(() => {
    xpPercentage = hero.xpNext > 0 ? (hero.xpCurrent / hero.xpNext) * 100 : 0;
  });

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
<div class="min-h-full lmup-bg-taverna bg-slate-950/60">
  <div class="flex flex-col gap-6">
    <PageTitleCard
      title="Taverna do Herói"
      subtitle="Bem vindo de volta guerreiro! descanse e prepare-se para novas aventuras."
      align="center"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Painel do Herói -->
      <section
        class="col-span-1 lg:col-span-2 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent pointer-events-none"
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

        <div
          class="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0 relative"
        >
          <div class="flex items-center justify-center sm:justify-start gap-3">
            <h2 class="text-2xl font-bold text-slate-100">{hero.name}</h2>
            <button
              type="button"
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

            <span class="inline-flex items-center gap-1">
              <img
                src="art/icones/icon-xp.png"
                alt="XP"
                class="h-4 w-4 object-contain"
              />
              <span>{hero.xpCurrent} / {hero.xpNext}</span>
            </span>
          </div>

          <div
            class="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"
          >
            <div
              class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={`width: ${xpPercentage}%;`}
            ></div>
          </div>
        </div>
      </section>

      <!-- Companheiro -->
      <section
        class="col-span-1 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_24px_rgba(251,191,36,0.45)] relative overflow-hidden transition-all"
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
          type="button"
          onclick={() => (isCompanionModalOpen = true)}
          class="mt-4 w-full py-2 text-sm text-slate-400 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors"
        >
          Trocar Companheiro
        </button>
      </section>
    </div>

    <!-- Serviços da Taverna -->
    <div class="mt-6 flex justify-center">
      <div
        class="relative inline-flex items-center justify-center
           rounded-2xl border border-amber-500/70
           bg-gradient-to-r from-slate-950 via-amber-900/40 to-slate-950
           px-8 md:px-12 py-3
           shadow-[0_0_35px_rgba(245,158,11,0.65)]"
      >
        <!-- moldura interna / glow -->
        <div
          class="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        >
          <div
            class="absolute inset-[6px] rounded-2xl border border-amber-300/40"
          ></div>
        </div>

        <h2
          class="relative z-[1] font-serif text-xl md:text-2xl font-extrabold
             tracking-wide text-amber-100"
        >
          Serviços da Taverna
        </h2>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Loja -->
      <a
        href="/loja"
        class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group"
        role="button"
      >
        <img
          src="/art/icones/shop-icon.png"
          alt="Loja"
          class="w-20 h-20 group-hover:scale-110 transition-transform"
        />
        <span class="font-medium text-slate-300">Loja</span>
      </a>

      <!-- Sala de Troféus -->
      <a
        href="/trofeus"
        class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group"
        role="button"
      >
        <img
          src="/art/icones/trophy-icon.png"
          alt="Sala de Troféus"
          class="w-20 h-20 group-hover:scale-110 transition-transform"
        />
        <span class="font-medium text-slate-300">Sala de Troféus</span>
      </a>

      <!-- Inventário -->
      <a
        href="/inventario"
        class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group"
        role="button"
      >
        <img
          src="/art/icones/bag-icon.png"
          alt="Inventário"
          class="w-20 h-20 group-hover:scale-110 transition-transform"
        />
        <span class="font-medium text-slate-300">Inventário</span>
      </a>

      <!-- Bestiário -->
      <a
        href="/bestiario"
        class="p-4 bg-slate-900/50 border-2 border-amber-400/80 hover:border-amber-300 hover:bg-slate-800/80 rounded-xl flex flex-col items-center gap-3 transition-all shadow-[0_0_18px_rgba(251,191,36,0.35)] group"
        role="button"
      >
        <img
          src="/art/icones/book-icon.png"
          alt="Bestiário"
          class="w-20 h-20 group-hover:scale-110 transition-transform"
        />
        <span class="font-medium text-slate-300">Bestiário</span>
      </a>
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
</div>
