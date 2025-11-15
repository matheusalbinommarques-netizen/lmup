<!-- src/lib/CompanionSelectModal.svelte -->
<script lang="ts">
  import { db, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';

  // --- Props (Svelte 5 runes) ---
  let { close } = $props<{ close: () => void }>();

  // Configuração base CANÔNICA dos pets (mesmo espírito do Bestiário)
  type PetBaseInfo = {
    id: number;
    key: string;
    name: string;
    rarity: Companion['rarity'];
    type: string;
    imagePath: string;
    requiredLevel: number;
  };

  const PET_BASE: PetBaseInfo[] = [
    {
      id: 1,
      key: 'wolf',
      name: 'Lobo Etéreo',
      rarity: 'rare',
      type: 'Caçador das Sombras',
      imagePath: '/art/pets/lobo-1.webp',
      requiredLevel: 1,
    },
    {
      id: 2,
      key: 'lich',
      name: 'Lorde Lich',
      rarity: 'epic',
      type: 'Mago Imortal',
      imagePath: '/art/pets/lich-1.webp',
      requiredLevel: 5,
    },
    {
      id: 3,
      key: 'dragon',
      name: 'Dragão Ancião',
      rarity: 'legendary',
      type: 'Guardião de Chamas',
      imagePath: '/art/pets/dragao-1.webp',
      requiredLevel: 15,
    },
    {
      id: 4,
      key: 'aberration',
      name: 'Aberração Abissal',
      rarity: 'epic',
      type: 'Eco do Vazio',
      imagePath: '/art/pets/aberracao-1.webp',
      requiredLevel: 20,
    },
  ];

  // ---- Evolução: mesmos thresholds do Bestiário/Taverna ----
  const EVOLUTION_THRESHOLDS: number[] = [
    0, // índice 0 não usado
    0, // stage 1
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

  // helper pra trocar lobo-1.webp -> lobo-2.webp / lobo-3.webp
  function getStageImage(basePath: string, evolutionStage?: number): string {
    const stage = Math.min(Math.max(evolutionStage ?? 1, 1), 3); // clamp 1..3
    // espera padrão ...-1.webp, ...-2.webp, ...-3.webp
    return basePath.replace(/-\d+(\.\w+)$/, `-${stage}$1`);
  }

  // Companion com metadados extras que o DB não exige mas a UI usa
  type CompanionWithMeta = Companion & {
    type?: string;
    imagePath?: string;
  };

  type PetCard = CompanionWithMeta & {
    key: string;
    requiredLevel: number;
    isUnlocked: boolean;
    isActive: boolean;
    imagePath: string;
    type: string;
    evolutionStage: number;
    foodInvested: number;
  };

  // Texto do bônus mostrado no card, por pet + evolução
  function getPetBonusDescription(pet: PetCard): string {
    const stage = Math.min(Math.max(pet.evolutionStage || 1, 1), 3);

    switch (pet.key) {
      case 'wolf': {
        if (stage === 1) return '+5% de XP ganho em missões.';
        if (stage === 2) return '+10% de XP ganho em missões.';
        return '+15% de XP ganho em missões.';
      }
      case 'lich': {
        if (stage === 1) return '+5% de comida obtida (alimentação).';
        if (stage === 2) return '+10% de comida obtida (alimentação).';
        return '+15% de comida obtida (alimentação).';
      }
      case 'dragon': {
        if (stage === 1) return '+5% de Gold ganho em missões.';
        if (stage === 2) return '+10% de Gold ganho em missões.';
        return '+15% de Gold ganho em missões.';
      }
      case 'aberration': {
        if (stage === 1) return '+5% de XP, Gold e Comida.';
        if (stage === 2) return '+10% de XP, Gold e Comida.';
        // nível 3: reforça os 3 bônus + redução de tarefas
        return '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      }
      default:
        return 'Bônus não definido.';
    }
  }

  // Seed inicial pro Dexie (usa PET_BASE como fonte da verdade)
  const PET_SEED: CompanionWithMeta[] = PET_BASE.map((base) => ({
    id: base.id,
    key: base.key,
    name: base.name,
    rarity: base.rarity,
    type: base.type,
    imagePath: base.imagePath,
    unlocked: false,
  }));

  // --- Estado do banco / herói ---
  let companions = $state<CompanionWithMeta[]>([]);
  let heroLevel = $state<number>(1);
  let activeCompanionId = $state<number>(1);

  const companionsQuery = liveQuery(() => db.companions.toArray());
  const heroQuery = liveQuery(() => db.profile.get(1));

  async function ensureCompanionsSeeded() {
    const count = await db.companions.count();
    if (count === 0) {
      await db.companions.bulkAdd(PET_SEED);
    }
  }

  function getRequiredLevelForId(id?: number): number {
    if (!id) return 1;
    const base = PET_BASE.find((p) => p.id === id);
    return base?.requiredLevel ?? 1;
  }

  // Lista derivada com gating por nível + evolução
  let petCards = $derived.by<PetCard[]>(() => {
    const lvl = heroLevel ?? 1;

    // Indexa companions do DB por id pra mesclar (inclui nomes renomeados + evolução)
    const byId = new SvelteMap<number, CompanionWithMeta>();
    for (const c of companions) {
      if (c.id != null) byId.set(c.id, c);
    }

    return PET_BASE.map((base) => {
      const dbPet = byId.get(base.id);

      const name =
        (dbPet && dbPet.name && dbPet.name.trim().length > 0
          ? dbPet.name
          : base.name) || base.name;

      const requiredLevel = base.requiredLevel;
      const isUnlocked = lvl >= requiredLevel;
      const isActive = base.id === activeCompanionId;

      const foodInvested = (dbPet as any)?.foodInvested ?? 0;
      const evolutionStage =
        (dbPet as any)?.evolutionStage ??
        getEvolutionStageForFood(foodInvested);

      const merged: PetCard = {
        ...(dbPet || {}),
        ...base,
        name,
        type: base.type,
        requiredLevel,
        isUnlocked,
        isActive,
        foodInvested,
        evolutionStage,
        imagePath: getStageImage(base.imagePath, evolutionStage),
      } as PetCard;

      return merged;
    }).sort((a, b) => a.requiredLevel - b.requiredLevel);
  });

  let currentActivePet = $derived.by<PetCard | undefined>(() =>
    petCards.find((p) => p.isActive),
  );

  onMount(() => {
    // Seed de segurança dos pets
    ensureCompanionsSeeded().catch((err) => {
      console.error('Erro ao semear pets na Taverna:', err);
    });

    // Profile / herói
    const heroSub = heroQuery.subscribe((profileData) => {
      const profile =
        profileData ??
        ({
          id: 1,
          name: 'Seu herói',
          title: 'Aprendiz de Aventuras',
          level: 1,
          xpCurrent: 0,
          xpNext: 100,
          avatarUrl: '',
          totalXpEarned: 0,
          currentStreak: 0,
          lastCompletionDate: null,
          activeCompanionId: 1,
        } as any);

      heroLevel = profile.level ?? 1;
      activeCompanionId = profile.activeCompanionId ?? 1;
    });

    // Pets
    const compSub = companionsQuery.subscribe((list) => {
      companions = (list ?? []) as CompanionWithMeta[];
    });

    // Acessibilidade: Esc fecha modal
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      heroSub.unsubscribe();
      compSub.unsubscribe();
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function handleOverlayClick(event: MouseEvent) {
    // Fecha só se clicar no fundo, não dentro do card
    if (event.currentTarget === event.target) {
      close();
    }
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    // A11y: permite fechar com Enter/Espaço se o overlay tiver foco
    if (event.currentTarget !== event.target) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      close();
    }
  }

  async function selectCompanion(pet: PetCard) {
    if (!pet.id) return;

    const requiredLevel = pet.requiredLevel ?? getRequiredLevelForId(pet.id);
    if (heroLevel < requiredLevel) {
      // Segurança extra: nem tenta gravar se não tiver nível
      return;
    }

    try {
      // Atualiza perfil e marca esse pet como desbloqueado
      await db.profile.update(1, { activeCompanionId: pet.id });
      await db.companions.update(pet.id, { unlocked: true });

      activeCompanionId = pet.id;
      close();
    } catch (err) {
      console.error('Erro ao selecionar companheiro:', err);
    }
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-labelledby="companion-modal-title"
  onclick={handleOverlayClick}
  onkeydown={handleOverlayKeydown}
>
  <div
    class="relative w-full max-w-3xl mx-4 rounded-3xl border border-slate-700 bg-slate-950/95 shadow-2xl"
  >
    <header
      class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-800"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
          Taverna • Companheiro de Batalha
        </p>
        <h2
          id="companion-modal-title"
          class="mt-1 text-lg font-semibold text-slate-50"
        >
          Escolha quem luta ao seu lado
        </h2>
        <p class="mt-1 text-xs text-slate-400">
          Companheiros são liberados conforme o nível do seu herói. Você está no
          nível
          <span class="font-semibold text-emerald-400">{heroLevel}</span>.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        onclick={close}
        aria-label="Fechar seleção de companheiro"
      >
        ✕
      </button>
    </header>

    <div class="px-6 pb-6 pt-4">
      <div
        class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400"
      >
        <p>Pets desbloqueiam nos níveis: 1 • 5 • 15 • 20.</p>
        <p>
          Pet atual:
          <span class="font-semibold text-emerald-400">
            {#if currentActivePet}
              {currentActivePet.name}
            {:else}
              Nenhum
            {/if}
          </span>
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {#each petCards as pet (pet.id ?? pet.imagePath)}
          <button
            type="button"
            class="group relative flex flex-col items-center gap-2 rounded-2xl border bg-slate-900/70 p-3 shadow-md transition
              {pet.isActive
              ? 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.8)]'
              : pet.isUnlocked
                ? 'border-slate-700 hover:border-emerald-400/70 hover:bg-slate-900/90'
                : 'border-slate-800 opacity-60 grayscale'}"
            disabled={!pet.isUnlocked}
            onclick={() => selectCompanion(pet)}
          >
            {#if !pet.isUnlocked}
              <div
                class="pointer-events-none absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center"
              >
                <span
                  class="text-2xl"
                  title={`Desbloqueia no nível ${pet.requiredLevel}`}
                >
                  🔒
                </span>
              </div>
            {/if}

            <div
              class="w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center"
            >
              <img
                src={pet.imagePath}
                alt={pet.name}
                class="w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            <div class="text-center">
              <h3 class="text-xs font-semibold text-slate-100">
                {pet.name}
              </h3>
              <p class="text-[0.65rem] text-slate-400">{pet.type}</p>

              <!-- Evolução atual -->
              <p class="text-[0.65rem] text-emerald-300 mt-1">
                Evolução: {getStageLabel(pet.evolutionStage)} (Nível {pet.evolutionStage})
              </p>

              <!-- BÔNUS DO PET -->
              <p class="text-[0.65rem] text-amber-300 mt-0.5">
                Bônus: {getPetBonusDescription(pet)}
              </p>

              <p class="mt-1 text-[0.65rem]">
                {#if pet.isUnlocked}
                  {#if pet.isActive}
                    <span class="font-semibold text-emerald-400">
                      Equipado
                    </span>
                  {:else}
                    <span class="text-slate-400">Clique para equipar</span>
                  {/if}
                {:else}
                  <span class="text-slate-500">
                    Nível {pet.requiredLevel} necessário
                  </span>
                {/if}
              </p>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
