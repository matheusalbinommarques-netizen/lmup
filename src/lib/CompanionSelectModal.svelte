<!-- src/lib/CompanionSelectModal.svelte -->
<script lang="ts">
  import { db, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  // --- Props (Svelte 5 runes) ---
  let { close } = $props<{ close: () => void }>();

  // Companion com metadados extras que o DB não exige mas a UI usa
  type CompanionWithMeta = Companion & {
    type: string;
    imagePath: string;
  };

  type PetCard = CompanionWithMeta & {
    requiredLevel: number;
    isUnlocked: boolean;
    isActive: boolean;
  };

  // --- Seed local (mesmo conjunto do Bestiário) ---
  const PET_SEED: CompanionWithMeta[] = [
    {
      id: 1,
      key: 'wolf',
      name: 'Lobo Etéreo',
      rarity: 'rare',
      type: 'Caçador das Sombras',
      imagePath: '/art/pets/pet-wolf-final.png',
      unlocked: false,
    },
    {
      id: 2,
      key: 'lich',
      name: 'Lorde Lich',
      rarity: 'epic',
      type: 'Mago Imortal',
      imagePath: '/art/pets/pet-lich-final.png',
      unlocked: false,
    },
    {
      id: 3,
      key: 'dragon',
      name: 'Dragão Ancião',
      rarity: 'legendary',
      type: 'Guardião de Chamas',
      imagePath: '/art/pets/pet-dragon-final.png',
      unlocked: false,
    },
    {
      id: 4,
      key: 'aberration',
      name: 'Aberração Abissal',
      rarity: 'epic',
      type: 'Eco do Vazio',
      imagePath: '/art/pets/pet-aberration-final.png',
      unlocked: false,
    },
  ];

  // Mesmo mapeamento de nível usado no Bestiário
  const PET_LEVELS: { imagePath: string; requiredLevel: number }[] = [
    { imagePath: '/art/pets/pet-wolf-final.png', requiredLevel: 1 },
    { imagePath: '/art/pets/pet-lich-final.png', requiredLevel: 5 },
    { imagePath: '/art/pets/pet-dragon-final.png', requiredLevel: 15 },
    { imagePath: '/art/pets/pet-aberration-final.png', requiredLevel: 20 },
  ];

  // --- Estado do banco / herói ---
  let companions = $state<CompanionWithMeta[]>([]);
  let heroLevel = $state<number>(1);
  let activeCompanionId = $state<number>(1);

  const companionsQuery = liveQuery(() => db.companions.toArray());
  const heroQuery = liveQuery(() => db.profile.get(1));

  async function ensureCompanionsSeeded() {
    const count = await db.companions.count();
    if (count === 0) {
      // salva apenas o que o schema exige; extras (type/imagePath) também são guardados
      await db.companions.bulkAdd(PET_SEED);
    }
  }

  function getRequiredLevelForImage(imagePath?: string): number {
    if (!imagePath) return 1;
    const cfg = PET_LEVELS.find((c) => c.imagePath === imagePath);
    return cfg?.requiredLevel ?? 1;
  }

  // Lista derivada com gating por nível (igual ao Bestiário)
  let petCards = $derived.by<PetCard[]>(() => {
    const list = companions.length > 0 ? companions : PET_SEED;
    const lvl = heroLevel ?? 1;

    return list
      .map((pet) => {
        const requiredLevel = getRequiredLevelForImage(pet.imagePath);
        const isUnlockedByLevel = lvl >= requiredLevel;
        const isActive = pet.id === activeCompanionId;

        return {
          ...pet,
          requiredLevel,
          isUnlocked: isUnlockedByLevel,
          isActive,
        };
      })
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
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

    const requiredLevel =
      pet.requiredLevel ?? getRequiredLevelForImage(pet.imagePath);
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
              <p class="mt-1 text-[0.65rem]">
                {#if pet.isUnlocked}
                  {#if pet.isActive}
                    <span class="font-semibold text-emerald-400">
                      Equipado
                    </span>
                  {:else}
                    <span class="text-slate-400"> Clique para equipar </span>
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
