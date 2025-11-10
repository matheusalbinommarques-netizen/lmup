<script lang="ts">
  import { db, type Profile, type Companion } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';

  const PET_SEED: Companion[] = [
    {
      id: 1,
      name: 'Lobo Etéreo',
      type: 'Caçador das Sombras',
      imagePath: '/art/pets/pet-wolf-final.png',
    },
    {
      id: 2,
      name: 'Lorde Lich',
      type: 'Mago Imortal',
      imagePath: '/art/pets/pet-lich-final.png',
    },
    {
      id: 3,
      name: 'Dragão Ancião',
      type: 'Guardião de Chamas',
      imagePath: '/art/pets/pet-dragon-final.png',
    },
    {
      id: 4,
      name: 'Aberração Abissal',
      type: 'Eco do Vazio',
      imagePath: '/art/pets/pet-aberration-final.png',
    },
  ];

  const PET_LEVELS: { imagePath: string; requiredLevel: number }[] = [
    { imagePath: '/art/pets/pet-wolf-final.png', requiredLevel: 1 },
    { imagePath: '/art/pets/pet-lich-final.png', requiredLevel: 5 },
    { imagePath: '/art/pets/pet-dragon-final.png', requiredLevel: 15 },
    { imagePath: '/art/pets/pet-aberration-final.png', requiredLevel: 20 },
  ];

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

    return () => {
      heroSub.unsubscribe();
      compSub.unsubscribe();
    };
  });

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

  let bestiary = $derived(() => {
    const list = companions.length > 0 ? companions : PET_SEED;
    const lvl = hero.level ?? 1;

    return list
      .map((pet) => {
        const cfg = PET_LEVELS.find((c) => c.imagePath === pet.imagePath);
        const requiredLevel = cfg?.requiredLevel ?? 1;
        const isUnlocked = lvl >= requiredLevel;
        const isActive = pet.id === hero.activeCompanionId;

        return {
          ...pet,
          requiredLevel,
          isUnlocked,
          isActive,
        };
      })
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  });
</script>

<div class="flex flex-col gap-6 pb-8">
  <PageTitleCard
    title="Bestiário de Companheiros"
    subtitle="Alimente e evolua seus fiéis companheiros enquanto você avança em sua jornada!"
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
        companheiro ativo é feita na Taverna.
      </p>
    </div>

    <div
      class="flex items-center gap-3 rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2"
    >
      <div class="text-xs text-slate-400 leading-tight">
        <div>Nível atual</div>
        <div class="text-sm font-semibold text-[#ffb74d]">
          Nv. {hero.level}
        </div>
      </div>
      <div class="h-8 w-px bg-slate-800"></div>
      <div class="text-xs text-slate-400 leading-tight">
        <div>Companheiro ativo</div>
        <div class="text-sm font-semibold text-emerald-400">
          {bestiary().find((p) => p.isActive)?.name || 'Nenhum selecionado'}
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each bestiary() as pet (pet.id ?? pet.name)}
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
          </div>

          <div class="flex items-center justify-between text-[0.7rem] mt-2">
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
        </article>
      {/each}
    </div>
  </section>
</div>
