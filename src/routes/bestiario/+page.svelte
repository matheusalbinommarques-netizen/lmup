<!-- src/routes/bestiario/+page.svelte -->
<script lang="ts">
  import { db, type Profile, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import { SvelteMap } from 'svelte/reactivity';

  // Configuração base CANÔNICA dos pets (arte + level de desbloqueio)
  type PetBaseInfo = {
    id: number;
    name: string;
    type: string;
    imagePath: string;
    requiredLevel: number;
  };

  const PET_BASE: PetBaseInfo[] = [
    {
      id: 1,
      name: 'Lobo Etéreo',
      type: 'Caçador das Sombras',
      imagePath: '/art/pets/lobo-1.webp',
      requiredLevel: 1,
    },
    {
      id: 2,
      name: 'Lorde Lich',
      type: 'Mago Imortal',
      imagePath: '/art/pets/lich-1.webp',
      requiredLevel: 5,
    },
    {
      id: 3,
      name: 'Dragão Ancião',
      type: 'Guardião de Chamas',
      imagePath: '/art/pets/dragao-1.webp',
      requiredLevel: 15,
    },
    {
      id: 4,
      name: 'Aberração Abissal',
      type: 'Eco do Vazio',
      imagePath: '/art/pets/aberracao-1.webp',
      requiredLevel: 20,
    },
  ];

  // Seed inicial pro Dexie (usa só o que o schema precisa)
  const PET_SEED: Companion[] = PET_BASE.map((pet) => ({
    id: pet.id,
    name: pet.name,
    type: pet.type,
    imagePath: pet.imagePath,
    unlocked: false,
  }));

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
    gold: 0,
  };

  let hero = $state<Profile>(fallbackProfile);
  let companions = $state<Companion[]>([]);
  let nameEdits = $state<Record<number, string>>({});

  const heroQuery = liveQuery(() => db.profile.get(1));
  const companionsQuery = liveQuery(() => db.companions.toArray());

  async function ensureCompanionsSeeded() {
    const count = await db.companions.count();
    if (count === 0) {
      await db.companions.bulkAdd(PET_SEED);
    }
  }

  // ---- Evolução: thresholds de comida por estágio ----
  // Stage 1 -> 2: 100 de comida total
  // Stage 2 -> 3: 300 de comida total
  const EVOLUTION_THRESHOLDS: number[] = [
    0, // índice 0 não usado
    0, // stage 1 começa em 0
    100, // stage 2
    300, // stage 3
  ];

  function getEvolutionStageForFood(food: number): number {
    if (food >= EVOLUTION_THRESHOLDS[3]) return 3;
    if (food >= EVOLUTION_THRESHOLDS[2]) return 2;
    return 1;
  }

  function getStageLabel(stage: number): string {
    switch (stage) {
      case 1:
        return 'Forma Juvenil';
      case 2:
        return 'Forma Crescida';
      case 3:
        return 'Forma Lendária';
      default:
        return 'Forma Desconhecida';
    }
  }

  function getStageProgressPercent(
    foodInvested: number,
    stage: number,
  ): number {
    const clampedStage = Math.min(Math.max(stage, 1), 3);

    // Se já está no máximo, barra cheia
    if (clampedStage >= 3) {
      return 100;
    }

    const currentThreshold = EVOLUTION_THRESHOLDS[clampedStage];
    const nextThreshold = EVOLUTION_THRESHOLDS[clampedStage + 1];
    const span = nextThreshold - currentThreshold;
    if (span <= 0) return 0;

    const inSpan = Math.max(0, Math.min(foodInvested - currentThreshold, span));

    return Math.round((inSpan / span) * 100);
  }

  // Quanto falta de comida para atingir a PRÓXIMA evolução
  function getFoodNeededToReachNextStage(currentFoodTotal: number): number {
    const currentStage = getEvolutionStageForFood(currentFoodTotal);

    // Já está no máximo (stage 3) → não precisa de mais comida pra evoluir
    if (currentStage >= 3) return 0;

    const nextThreshold = EVOLUTION_THRESHOLDS[currentStage + 1];
    const needed = nextThreshold - currentFoodTotal;

    return Math.max(0, needed);
  }

  // helper pra trocar lobo-1.webp -> lobo-2.webp / lobo-3.webp
  function getStageImage(basePath: string, evolutionStage?: number): string {
    const stage = Math.min(Math.max(evolutionStage ?? 1, 1), 3); // clamp 1..3
    // espera padrão ...-1.webp, ...-2.webp, ...-3.webp
    return basePath.replace(/-\d+(\.\w+)$/, `-${stage}$1`);
  }

  // ---- Helpers de bônus (mesma lógica do modal da Taverna) ----
  function getPetBonusDescription(
    petId: number | undefined,
    evolutionStage: number | undefined,
  ): string {
    const stage = Math.min(Math.max(evolutionStage || 1, 1), 3);

    switch (petId) {
      case 1: {
        // Lobo → XP
        if (stage === 1) return '+5% de XP ganho em missões.';
        if (stage === 2) return '+10% de XP ganho em missões.';
        return '+15% de XP ganho em missões.';
      }
      case 2: {
        // Lich → Comida
        if (stage === 1) return '+5% de comida obtida (alimentação).';
        if (stage === 2) return '+10% de comida obtida (alimentação).';
        return '+15% de comida obtida (alimentação).';
      }
      case 3: {
        // Dragão → Gold
        if (stage === 1) return '+5% de Gold ganho em missões.';
        if (stage === 2) return '+10% de Gold ganho em missões.';
        return '+15% de Gold ganho em missões.';
      }
      case 4: {
        // Aberração → 3 recursos + redução de tasks no lvl 3
        if (stage === 1) return '+5% de XP, Gold e Comida.';
        if (stage === 2) return '+10% de XP, Gold e Comida.';
        return '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      }
      default:
        return 'Bônus não definido.';
    }
  }

  // ---- Helpers de nome (renomear pet) ----
  function getDisplayName(petId: number | undefined, fallback: string) {
    if (!petId) return fallback;
    return nameEdits[petId] ?? fallback;
  }

  function handleNameInput(petId: number | undefined, event: Event) {
    if (!petId) return;
    const target = event.target as HTMLInputElement;
    nameEdits[petId] = target.value;
  }

  async function handleNameBlur(petId: number | undefined) {
    if (!petId) return;
    const newName = (nameEdits[petId] ?? '').trim();
    if (!newName) return;

    try {
      await db.companions.update(petId, { name: newName });
    } catch (err) {
      console.error('Erro ao atualizar nome do pet:', err);
    }
  }

  // ---- Tipo de view do Bestiário ----
  type PetView = PetBaseInfo &
    Companion & {
      isUnlocked: boolean;
      isActive: boolean;
      evolutionStage: number;
      foodInvested: number;
      imagePath: string;
      name: string;
    };

  // Bestiário: junta base CANÔNICA + dados do banco (renome, ativo, evolução, comida)
  let bestiary = $derived.by<PetView[]>(() => {
    const lvl = hero.level ?? 1;

    // indexa companions por id pra facilitar o merge
    const byId = new SvelteMap<number, Companion>();
    for (const c of companions) {
      if (c.id != null) byId.set(c.id, c);
    }

    return PET_BASE.map((base) => {
      const dbPet = byId.get(base.id);

      const rawNameFromDb = dbPet?.name;
      const name =
        rawNameFromDb && rawNameFromDb.trim().length > 0
          ? rawNameFromDb
          : base.name;

      const isUnlocked = lvl >= base.requiredLevel;
      const isActive = base.id === hero.activeCompanionId;

      const foodInvested = (dbPet as any)?.foodInvested ?? 0;
      const evolutionStage =
        (dbPet as any)?.evolutionStage ??
        getEvolutionStageForFood(foodInvested);

      return {
        ...base,
        ...(dbPet || {}),
        id: base.id,
        name,
        imagePath: getStageImage(base.imagePath, evolutionStage), // arte correta pro stage
        requiredLevel: base.requiredLevel,
        isUnlocked,
        isActive,
        evolutionStage,
        foodInvested,
      } as PetView;
    }).sort((a, b) => a.requiredLevel - b.requiredLevel);
  });

  // -------------------------
  // Modal de Alimentar / Evoluir
  // -------------------------
  let petToFeedId = $state<number | null>(null);
  let foodToSpend = $state<number>(0);

  let petToFeed = $derived.by<PetView | null>(() => {
    if (petToFeedId == null) return null;
    return bestiary.find((p: PetView) => p.id === petToFeedId) ?? null;
  });

  let potentialFood = $derived.by<number>(() => {
    if (!petToFeed) return 0;
    const baseFood = petToFeed.foodInvested ?? 0;
    const availableFood = hero.food ?? 0;
    const spend = Math.max(0, Math.min(foodToSpend, availableFood));
    return baseFood + spend;
  });

  let potentialStage = $derived.by<number>(() =>
    getEvolutionStageForFood(potentialFood),
  );

  function openFeedModal(petId: number | undefined) {
    if (!petId) return;
    petToFeedId = petId;
    foodToSpend = 0;
  }

  function closeFeedModal() {
    petToFeedId = null;
    foodToSpend = 0;
  }

  function clampFoodSpend(value: number): number {
    const availableFood = hero.food ?? 0;
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(Math.floor(value), availableFood));
  }

  function adjustFood(delta: number) {
    const next = clampFoodSpend((foodToSpend ?? 0) + delta);
    foodToSpend = next;
  }

  async function confirmFeed() {
    if (!petToFeed || !petToFeed.id) return;

    const availableFood = hero.food ?? 0;
    const spend = clampFoodSpend(foodToSpend);
    if (spend <= 0 || availableFood <= 0) return;

    const petId = petToFeed.id;

    try {
      // Atualiza comida do herói
      await db.profile.update(1, {
        food: availableFood - spend,
      });

      // Recarrega o pet direto do DB
      const dbPet = await db.companions.get(petId);
      const currentFoodInvested = (dbPet as any)?.foodInvested ?? 0;
      const newFoodInvested = currentFoodInvested + spend;
      const newStage = getEvolutionStageForFood(newFoodInvested);

      await db.companions.update(petId, {
        foodInvested: newFoodInvested,
        evolutionStage: newStage,
      });

      // zera input, mantém modal
      foodToSpend = 0;
    } catch (err) {
      console.error('Erro ao alimentar/evoluir companheiro:', err);
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.currentTarget === event.target) {
      closeFeedModal();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    // A11y: fechar com Esc, Enter ou Espaço quando o overlay tiver foco
    if (event.currentTarget !== event.target) return;

    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeFeedModal();
    }
  }

  onMount(() => {
    ensureCompanionsSeeded().catch((err) =>
      console.error('Erro ao semear pets:', err),
    );

    const heroSub = heroQuery.subscribe((profileData) => {
      Object.assign(hero, profileData || fallbackProfile);
    });

    const compSub = companionsQuery.subscribe((data) => {
      companions = data || [];
    });

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && petToFeedId != null) {
        closeFeedModal();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      heroSub.unsubscribe();
      compSub.unsubscribe();
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function getHeroFood(): number {
    return hero.food ?? 0;
  }
</script>

<div class="flex flex-col gap-6 pb-8">
  <PageTitleCard
    title="Bestiário de Companheiros"
    subtitle="Alimente e evolua seus fiéis companheiros enquanto você avança em sua jornada!"
    iconSrc="/art/icones/book-icon.png"
    align="center"
  />

  <section
    class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
  >
    <div class="flex-1">
      <p class="text-sm text-slate-400">
        Os companheiros são desbloqueados conforme o seu nível:
        <span class="font-semibold text-[#ffb74d]">
          Lobo (1), Lich (5), Dragão (15), Aberração (20).
        </span>
      </p>
      <p class="text-xs text-slate-500 mt-1">
        Você pode renomear qualquer criatura já desbloqueada. A troca de
        companheiro ativo é feita na Taverna. Aqui no Bestiário você alimenta e
        acompanha a evolução de cada um.
      </p>
    </div>

    <div
      class="flex items-center gap-4 rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2"
    >
      <div class="text-xs text-slate-400 leading-tight">
        <div>Nível atual</div>
        <div class="text-sm font-semibold text-[#ffb74d]">
          Nv. {hero.level}
        </div>
      </div>
      <div class="h-8 w-px bg-slate-800"></div>
      <div class="text-xs text-slate-400 leading-tight">
        <div>Comida disponível</div>
        <div class="text-sm font-semibold text-emerald-400">
          {getHeroFood()}
        </div>
      </div>
      <div class="h-8 w-px bg-slate-800"></div>
      <div class="text-xs text-slate-400 leading-tight">
        <div>Companheiro ativo</div>
        <div class="text-sm font-semibold text-emerald-400">
          {bestiary.find((p) => p.isActive)?.name || 'Nenhum selecionado'}
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each bestiary as pet (pet.id ?? pet.name)}
        <article
          class="relative rounded-2xl border bg-slate-900/70 p-4 flex flex-col gap-3 shadow-lg
                 {pet.isUnlocked
            ? 'border-slate-700'
            : 'border-slate-800 opacity-60 grayscale'}"
        >
          <div class="relative">
            <div
              class="w-full aspect-[4/5] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center"
            >
              <img
                src={pet.imagePath}
                alt={pet.name}
                class="w-full h-full object-contain"
              />
            </div>

            {#if pet.isActive}
              <span
                class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-bold uppercase tracking-widest"
              >
                Equipado
              </span>
            {:else if pet.isUnlocked}
              <span
                class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-800/90 text-emerald-300 font-semibold uppercase tracking-widest"
              >
                Desbloqueado
              </span>
            {:else}
              <span
                class="absolute top-2 left-2 text-[0.7rem] px-2 py-1 rounded-full bg-slate-900/95 text-slate-400 font-semibold uppercase tracking-widest"
              >
                Nv. {pet.requiredLevel}
              </span>
            {/if}
          </div>

          <div class="flex-1 flex flex-col gap-2 mt-1">
            {#if pet.isUnlocked && pet.id}
              {#key pet.id}
                <div class="flex flex-col gap-1">
                  <label
                    for={`pet-name-${pet.id}`}
                    class="text-[0.7rem] text-slate-500 uppercase tracking-widest"
                  >
                    Nome do companheiro
                  </label>
                  <input
                    id={`pet-name-${pet.id}`}
                    type="text"
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                    value={getDisplayName(pet.id, pet.name)}
                    oninput={(e) => handleNameInput(pet.id, e)}
                    onblur={() => handleNameBlur(pet.id)}
                  />
                </div>
              {/key}
            {:else}
              <h3 class="font-semibold text-slate-100">{pet.name}</h3>
            {/if}

            <p class="text-xs text-slate-400">{pet.type}</p>

            {#if pet.isUnlocked}
              <div class="mt-2 space-y-1">
                <p class="text-[0.7rem] text-emerald-300">
                  Evolução: {getStageLabel(pet.evolutionStage ?? 1)}
                  (Nível {pet.evolutionStage ?? 1})
                </p>
                <div
                  class="h-2 w-full rounded-full bg-slate-800 overflow-hidden"
                >
                  <div
                    class="h-full rounded-full bg-emerald-500"
                    style={`width: ${getStageProgressPercent(
                      pet.foodInvested ?? 0,
                      pet.evolutionStage ?? 1,
                    )}%`}
                  ></div>
                </div>
                <p class="text-[0.65rem] text-slate-500">
                  Comida investida: {pet.foodInvested ?? 0}
                </p>
              </div>
            {/if}

            <!-- BÔNUS DO PET (visível sempre, usando stage atual ou 1) -->
            <p class="text-[0.65rem] text-amber-300 mt-1">
              Bônus:
              {getPetBonusDescription(pet.id, pet.evolutionStage ?? 1)}
            </p>
          </div>

          <div class="mt-3 flex items-center justify-between text-[0.7rem]">
            {#if pet.isUnlocked}
              <span
                class="text-emerald-400 font-semibold flex items-center gap-1"
              >
                <span>★</span> Ao seu lado
              </span>
            {:else}
              <span class="text-slate-500 italic">
                Desbloqueia no nível {pet.requiredLevel}
              </span>
            {/if}

            <span class="text-slate-600">
              ID:
              {pet.id ?? '—'}
            </span>
          </div>

          {#if pet.isUnlocked && pet.id}
            <button
              type="button"
              class="mt-3 inline-flex items-center justify-center rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-3 py-1.5 text-[0.75rem] font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition"
              onclick={() => openFeedModal(pet.id)}
            >
              Alimentar / Evoluir
            </button>
          {/if}
        </article>
      {/each}
    </div>
  </section>

  {#if petToFeed}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feed-modal-title"
      tabindex="-1"
      onclick={handleOverlayClick}
      onkeydown={handleOverlayKeydown}
    >
      <div
        class="relative w-full max-w-lg mx-4 rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl"
      >
        <header
          class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-800"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              Bestiário • Alimentar & Evoluir
            </p>
            <h2
              id="feed-modal-title"
              class="mt-1 text-lg font-semibold text-slate-50"
            >
              {petToFeed.name}
            </h2>
            <p class="mt-1 text-xs text-slate-400">
              {getStageLabel(petToFeed.evolutionStage ?? 1)} — Nível de evolução
              {petToFeed.evolutionStage ?? 1}
            </p>
            <p class="mt-1 text-[0.65rem] text-amber-300">
              Bônus atual:
              {getPetBonusDescription(
                petToFeed.id,
                petToFeed.evolutionStage ?? 1,
              )}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            onclick={closeFeedModal}
            aria-label="Fechar janela de alimentação"
          >
            ✕
          </button>
        </header>

        <div class="px-6 pb-6 pt-4 space-y-4">
          <div class="flex gap-4 items-center">
            <div
              class="w-28 h-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center"
            >
              <img
                src={petToFeed.imagePath}
                alt={petToFeed.name}
                class="w-full h-full object-contain"
              />
            </div>
            <div class="flex-1 space-y-2 text-xs text-slate-300">
              <div>
                <span class="text-slate-400">Comida disponível:</span>
                <span class="ml-1 font-semibold text-emerald-400">
                  {getHeroFood()}
                </span>
              </div>
              <div>
                <span class="text-slate-400">Comida investida neste pet:</span>
                <span class="ml-1 font-semibold">
                  {petToFeed.foodInvested ?? 0}
                </span>
              </div>
              <div>
                <span class="text-slate-400">Evolução atual:</span>
                <span class="ml-1 font-semibold">
                  {getStageLabel(petToFeed.evolutionStage ?? 1)}
                  (Nível {petToFeed.evolutionStage ?? 1})
                </span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label
              for="food-amount-input"
              class="text-[0.7rem] text-slate-400 uppercase tracking-widest"
            >
              Quanto de comida investir agora?
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800"
                onclick={() => adjustFood(-10)}
              >
                -10
              </button>
              <button
                type="button"
                class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800"
                onclick={() => adjustFood(-1)}
              >
                -1
              </button>
              <input
                id="food-amount-input"
                type="number"
                min="0"
                class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60"
                value={foodToSpend}
                oninput={(e) => {
                  const value = Number((e.target as HTMLInputElement).value);
                  foodToSpend = clampFoodSpend(value);
                }}
              />
              <button
                type="button"
                class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800"
                onclick={() => adjustFood(1)}
              >
                +1
              </button>
              <button
                type="button"
                class="px-2 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:bg-slate-800"
                onclick={() => adjustFood(10)}
              >
                +10
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md border border-emerald-500/60 text-xs text-emerald-300 hover:bg-emerald-500/10"
                onclick={() => {
                  const currentFood = petToFeed.foodInvested ?? 0;
                  const neededToNext =
                    getFoodNeededToReachNextStage(currentFood);
                  const availableFood = getHeroFood();

                  // MAX = o mínimo entre o que falta pra evoluir e o que você tem disponível
                  const target = Math.min(neededToNext, availableFood);

                  foodToSpend = clampFoodSpend(target);
                }}
              >
                MAX
              </button>
            </div>
            <p class="text-[0.65rem] text-slate-500">
              O valor será descontado da sua comida total e somado à comida
              investida neste companheiro.
            </p>
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">
                Progresso atual
              </p>
              <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full bg-emerald-500"
                  style={`width: ${getStageProgressPercent(
                    petToFeed.foodInvested ?? 0,
                    petToFeed.evolutionStage ?? 1,
                  )}%`}
                ></div>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-[0.7rem] text-slate-400 uppercase tracking-widest">
                Após esta alimentação (prévia)
              </p>
              <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full bg-emerald-400"
                  style={`width: ${getStageProgressPercent(
                    potentialFood,
                    potentialStage,
                  )}%`}
                ></div>
              </div>
              <p class="text-[0.65rem] text-slate-400 mt-1">
                Evolução prevista:
                <span class="ml-1 font-semibold text-emerald-300">
                  {getStageLabel(potentialStage)} (Nível {potentialStage})
                </span>
              </p>
              <p class="text-[0.65rem] text-amber-300">
                Bônus previsto:
                {getPetBonusDescription(petToFeed.id, potentialStage)}
              </p>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              onclick={closeFeedModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={foodToSpend <= 0 || getHeroFood() <= 0}
              onclick={confirmFeed}
            >
              Alimentar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
