<!-- src/lib/GearPanel.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import {
    db,
    type OwnedShopItem,
    type Companion,
    type Profile,
  } from '$services/db';
  import {
    getHeroModifiersOnce,
    type HeroModifiers,
  } from '$services/gearService';

  type GearRarity = 'common' | 'rare' | 'epic' | 'legendary';

  type GearMeta = {
    id: number;
    name: string;
    slot: string;
    rarity: GearRarity;
    shortEffect: string;
    iconSrc?: string;
  };

  // Meta apenas para exibição no painel
  const GEAR_ITEMS: GearMeta[] = [
    // ARMADURAS
    {
      id: 101,
      name: 'Cota da Rotina',
      slot: 'Armadura',
      rarity: 'common',
      shortEffect: 'Permite falhar 1 dia sem quebrar o streak.',
      iconSrc: '/art/items/cota-da-rotina.png',
    },
    {
      id: 102,
      name: 'Guarda-peito da Perseverança',
      slot: 'Armadura',
      rarity: 'rare',
      shortEffect: 'Permite falhar 2 dias sem quebrar o streak.',
      iconSrc: '/art/items/guarda-peito-da-perseveranca.png',
    },
    {
      id: 103,
      name: 'Armadura do Foco Inabalável',
      slot: 'Armadura',
      rarity: 'epic',
      shortEffect: 'Permite falhar 3 dias sem quebrar o streak.',
      iconSrc: '/art/items/armadura-do-foco-inabalavel.png',
    },
    {
      id: 104,
      name: 'Placas do Herói Eterno',
      slot: 'Armadura',
      rarity: 'legendary',
      shortEffect: 'Permite falhar 5 dias sem quebrar o streak.',
      iconSrc: '/art/items/placas-do-heroi-eterno.png',
    },

    // ESPADAS
    {
      id: 105,
      name: 'Espada da Eficiência',
      slot: 'Arma',
      rarity: 'rare',
      shortEffect:
        'Reduz em 1 a quantidade de subtarefas para missões de alta raridade.',
      iconSrc: '/art/items/espada-da-eficiencia.png',
    },
    {
      id: 106,
      name: 'Lâmina da Otimização',
      slot: 'Arma',
      rarity: 'epic',
      shortEffect:
        'Reduz em 2 a quantidade de subtarefas para missões de alta raridade.',
      iconSrc: '/art/items/lamina-da-otimizacao.png',
    },
    {
      id: 107,
      name: 'Lâmina do Tempo Dobrada',
      slot: 'Arma',
      rarity: 'legendary',
      shortEffect:
        'Reduz em 3 a quantidade de subtarefas para missões de alta raridade.',
      iconSrc: '/art/items/lamina-do-tempo-dobrada.png',
    },

    // AMULETOS
    {
      id: 108,
      name: 'Amuleto do Trocado',
      slot: 'Amuleto',
      rarity: 'common',
      shortEffect: '+5% de ouro recebido.',
      iconSrc: '/art/items/amuleto-do-trocado.png',
    },
    {
      id: 109,
      name: 'Amuleto do Cambista',
      slot: 'Amuleto',
      rarity: 'rare',
      shortEffect: '+10% de ouro recebido.',
      iconSrc: '/art/items/amuleto-do-cambista.png',
    },
    {
      id: 110,
      name: 'Amuleto do Tesouro Vivo',
      slot: 'Amuleto',
      rarity: 'epic',
      shortEffect: '+15% de ouro recebido.',
      iconSrc: '/art/items/amuleto-do-tesouro-vivo.png',
    },
    {
      id: 111,
      name: 'Relíquia do Cofre Infinito',
      slot: 'Amuleto',
      rarity: 'legendary',
      shortEffect: '+20% de ouro recebido.',
      iconSrc: '/art/items/reliquia-do-cofre-infinito.png',
    },

    // ANÉIS
    {
      id: 112,
      name: 'Anel da Brisa Serena',
      slot: 'Anel',
      rarity: 'common',
      shortEffect: '+1% ao bônus atual do Santuário.',
      iconSrc: '/art/items/anel-da-brisa-serena.png',
    },
    {
      id: 113,
      name: 'Anel da Canção Silenciosa',
      slot: 'Anel',
      rarity: 'rare',
      shortEffect: '+3% ao bônus atual do Santuário.',
      iconSrc: '/art/items/anel-da-cancao-silenciosa.png',
    },
    {
      id: 114,
      name: 'Anel do Bosque Vivo',
      slot: 'Anel',
      rarity: 'epic',
      shortEffect: '+5% ao bônus atual do Santuário.',
      iconSrc: '/art/items/anel-do-bosque-vivo.png',
    },
    {
      id: 115,
      name: 'Anel do Guardião Ancestral',
      slot: 'Anel',
      rarity: 'legendary',
      shortEffect: '+10% ao bônus atual do Santuário.',
      iconSrc: '/art/items/anel-do-guardiao-ancestral.png',
    },

    // UTILITÁRIOS
    {
      id: 116,
      name: 'Mochila do Aventureiro Sem Fundo',
      slot: 'Mochila',
      rarity: 'legendary',
      shortEffect: '+10 slots de inventário para itens visuais.',
      iconSrc: '/art/items/mochila-do-aventureiro-sem-fundo.png',
    },
    {
      id: 117,
      name: 'Elmo do Planejador Visionário',
      slot: 'Elmo',
      rarity: 'legendary',
      shortEffect: '+15% de XP ao concluir um projeto.',
      iconSrc: '/art/items/elmo-do-planejador-visionario.png',
    },
  ];

  const gearById: Record<number, GearMeta> = {};
  for (const g of GEAR_ITEMS) {
    gearById[g.id] = g;
  }

  // prioridade por raridade (pra escolher qual mostrar por slot)
  const RARITY_SCORE: Record<GearRarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };

  // ---------- PET ATIVO / EVOLUÇÃO ----------
  const EVOLUTION_THRESHOLDS: number[] = [
    0,
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

  // lobo-1.webp -> lobo-2.webp / lobo-3.webp
  function getStageImage(basePath: string, evolutionStage?: number): string {
    const stage = Math.min(Math.max(evolutionStage ?? 1, 1), 3);
    return basePath.replace(/-\d+(\.\w+)$/, `-${stage}$1`);
  }

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
        // Aberração → XP + Gold + Comida + redução de tasks no lvl 3
        if (stage === 1) return '+5% de XP, Gold e Comida.';
        if (stage === 2) return '+10% de XP, Gold e Comida.';
        return '+15% de XP, Gold e Comida e redução na quantidade de tarefas exigidas em sistemas avançados.';
      }
      default:
        return 'Bônus não definido.';
    }
  }

  type ActivePetView = Companion & {
    evolutionStage: number;
    imagePath: string;
  };

  let equippedRows = $state<OwnedShopItem[]>([]);
  let modifiers = $state<HeroModifiers | null>(null);
  let loading = $state(true);

  let heroProfile = $state<Profile | null>(null);
  let companions = $state<Companion[]>([]);

  const ownedQuery = liveQuery(() => db.ownedShopItems.toArray());
  const heroQuery = liveQuery(() => db.profile.get(1));
  const companionsQuery = liveQuery(() => db.companions.toArray());

  let activePet = $derived.by<ActivePetView | null>(() => {
    if (!heroProfile) return null;
    const activeId = heroProfile.activeCompanionId ?? null;
    if (!activeId) return null;

    const pet = companions.find((c) => c.id === activeId);
    if (!pet) return null;

    const foodInvested = (pet as any)?.foodInvested ?? 0;
    const evolutionStage =
      (pet as any)?.evolutionStage ?? getEvolutionStageForFood(foodInvested);

    const basePath =
      (pet.imagePath as string | undefined) || '/art/pets/lobo-1.webp';
    const imagePath = getStageImage(basePath, evolutionStage);

    return {
      ...(pet as any),
      evolutionStage,
      imagePath,
    } as ActivePetView;
  });

  onMount(() => {
    const ownedSub = ownedQuery.subscribe((rows) => {
      // Escolhe no máximo 1 item equipado por SLOT (Armadura, Arma, etc.),
      // priorizando a maior raridade.
      const bySlot: Record<string, OwnedShopItem> = {};

      for (const row of rows) {
        if (!row.equipped) continue;
        if (typeof row.itemId !== 'number') continue;

        const meta = gearById[row.itemId];
        if (!meta) continue;

        const slot = meta.slot;
        const existing = bySlot[slot];

        if (!existing) {
          bySlot[slot] = row;
        } else if (typeof existing.itemId === 'number') {
          const existingMeta = gearById[existing.itemId];
          if (!existingMeta) {
            bySlot[slot] = row;
          } else {
            const curScore = RARITY_SCORE[existingMeta.rarity];
            const newScore = RARITY_SCORE[meta.rarity];
            if (newScore >= curScore) {
              bySlot[slot] = row;
            }
          }
        }
      }

      equippedRows = Object.values(bySlot);
    });

    const heroSub = heroQuery.subscribe((profileData) => {
      heroProfile = profileData ?? null;
    });

    const compSub = companionsQuery.subscribe((rows) => {
      companions = rows ?? [];
    });

    (async () => {
      try {
        modifiers = await getHeroModifiersOnce();
      } catch (error) {
        console.error('Erro ao carregar HeroModifiers no GearPanel:', error);
      } finally {
        loading = false;
      }
    })();

    return () => {
      ownedSub.unsubscribe();
      heroSub.unsubscribe();
      compSub.unsubscribe();
    };
  });

  function rarityTagClass(r: GearRarity): string {
    switch (r) {
      case 'common':
        return 'bg-slate-800 text-slate-100';
      case 'rare':
        return 'bg-sky-900/60 text-sky-200';
      case 'epic':
        return 'bg-violet-900/60 text-violet-200';
      case 'legendary':
        return 'bg-amber-900/70 text-amber-100';
      default:
        return 'bg-slate-800 text-slate-100';
    }
  }

  function slotEmoji(slot: string): string {
    if (slot === 'Arma') return '⚔️';
    if (slot === 'Anel') return '💍';
    if (slot === 'Amuleto') return '🧿';
    if (slot === 'Armadura') return '🛡️';
    if (slot === 'Mochila') return '🎒';
    if (slot === 'Elmo') return '🪖';
    return '🎁';
  }
</script>

<section
  class="w-full max-w-4xl mx-auto rounded-2xl border border-emerald-500/70 bg-slate-950/90 px-4 py-4 shadow-[0_0_22px_rgba(16,185,129,0.45)]"
>
  <header class="mb-3 flex items-center justify-between gap-2">
    <div>
      <p class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80">
        Equipamentos do Herói
      </p>
      <h2 class="text-sm font-semibold text-slate-100">
        Artefatos que afetam XP, Gold e Streak
      </h2>
    </div>
    <div class="text-[0.7rem] text-slate-400 text-right">
      <p>Os efeitos abaixo valem enquanto o item estiver equipado.</p>
    </div>
  </header>

  <!-- Companheiro de batalha ativo -->
  {#if activePet}
    <div
      class="mb-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5"
    >
      <div
        class="relative h-16 w-16 rounded-2xl border border-emerald-400/80 bg-slate-950 overflow-hidden flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.7)]"
      >
        <img
          src={activePet.imagePath}
          alt={activePet.name}
          class="h-full w-full object-contain"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p
          class="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-300/80"
        >
          Companheiro de Batalha
        </p>
        <p class="text-sm font-semibold text-slate-100 truncate">
          {activePet.name}
        </p>
        <p class="text-[0.7rem] text-slate-400">
          {getStageLabel(activePet.evolutionStage)} (Nível
          {` ${activePet.evolutionStage}`})
        </p>
        <p class="mt-1 text-[0.7rem] text-amber-300">
          Bônus:
          {getPetBonusDescription(activePet.id, activePet.evolutionStage)}
        </p>
      </div>
    </div>
  {:else}
    <div
      class="mb-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-[0.7rem] text-slate-400"
    >
      Nenhum companheiro de batalha selecionado.
      <span class="text-emerald-300"> Escolha um na Taverna.</span>
    </div>
  {/if}

  <!-- Lista de itens equipados -->
  <div class="space-y-2">
    {#if loading}
      <p class="text-xs text-slate-400">Carregando equipamentos...</p>
    {:else if equippedRows.length === 0}
      <div
        class="rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-3 text-xs text-slate-400"
      >
        Nenhum artefato de gameplay equipado no momento.
        <span class="text-emerald-300">
          Visite a Loja da Taverna para comprar e equipar novos itens.
        </span>
      </div>
    {:else}
      {#each equippedRows as row (row.id)}
        {#if gearById[row.itemId]}
          {@const meta = gearById[row.itemId]}
          <article
            class="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs"
          >
            <!-- Ícone do item -->
            <div class="mt-[2px]">
              <div
                class="relative h-16 w-16 rounded-full border border-amber-400/70 bg-slate-900/90 overflow-hidden shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              >
                {#if meta.iconSrc}
                  <img
                    src={meta.iconSrc}
                    alt={meta.name}
                    class="h-full w-full object-cover"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center text-lg"
                  >
                    {slotEmoji(meta.slot)}
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p
                    class="truncate text-[0.8rem] font-semibold text-slate-100"
                  >
                    {meta.name}
                  </p>
                  <p class="mt-0.5 text-[0.7rem] text-slate-400">
                    Slot: <span class="text-slate-200">{meta.slot}</span>
                  </p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span
                    class={`rounded-full px-2 py-[2px] text-[0.65rem] ${rarityTagClass(
                      meta.rarity,
                    )}`}
                  >
                    {meta.rarity === 'common'
                      ? 'COMUM'
                      : meta.rarity === 'rare'
                        ? 'RARO'
                        : meta.rarity === 'epic'
                          ? 'ÉPICO'
                          : 'LENDÁRIO'}
                  </span>
                  <span class="text-[0.65rem] text-emerald-300">
                    Equipado
                  </span>
                </div>
              </div>

              <p class="mt-1 text-[0.7rem] text-slate-300">
                {meta.shortEffect}
              </p>
            </div>
          </article>
        {/if}
      {/each}
    {/if}
  </div>

  <!-- Resumo dos modificadores ativos -->
  <div
    class="mt-4 rounded-xl border border-emerald-600/60 bg-emerald-500/5 px-3 py-2"
  >
    <p class="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/90">
      Bônus Atuais
    </p>

    {#if !modifiers}
      <p class="mt-1 text-[0.75rem] text-slate-400">
        Nenhum bônus adicional ativo além do progresso padrão.
      </p>
    {:else}
      <ul class="mt-1 space-y-1 text-[0.75rem] text-slate-100">
        {#if modifiers.streakProtectionDays > 0}
          <li>
            • Até
            <span class="font-semibold text-emerald-300">
              {modifiers.streakProtectionDays}
              dia{modifiers.streakProtectionDays > 1 ? 's' : ''}
            </span>
            sem XP podem ser perdoados antes da sequência quebrar.
          </li>
        {/if}

        {#if modifiers.goldMultiplier !== 1}
          <li>
            • Gold por XP efetivo:
            <span class="font-semibold text-emerald-300">
              {Math.round((modifiers.goldMultiplier - 1) * 100)}%
            </span>
            de bônus.
          </li>
        {/if}

        {#if modifiers.sanctuaryBonusExtraPercent > 0}
          <li>
            • Bônus extra do Santuário:
            <span class="font-semibold text-emerald-300">
              +{modifiers.sanctuaryBonusExtraPercent}%
            </span>
            de XP sobre o bônus base.
          </li>
        {/if}

        {#if modifiers.projectBonusExtraFraction > 0}
          <li>
            • Projetos concluídos recebem
            <span class="font-semibold text-emerald-300">
              +{Math.round(modifiers.projectBonusExtraFraction * 100)}%
            </span>
            de XP bônus adicional.
          </li>
        {/if}

        {#if modifiers.rarityThresholdDelta > 0}
          <li>
            • Missões precisam de
            <span class="font-semibold text-emerald-300">
              menos {modifiers.rarityThresholdDelta} passo(s)
            </span>
            para subir de raridade (facilita chegar em épico/lendário).
          </li>
        {/if}

        {#if !(modifiers.streakProtectionDays > 0 || modifiers.goldMultiplier !== 1 || modifiers.sanctuaryBonusExtraPercent > 0 || modifiers.projectBonusExtraFraction > 0 || modifiers.rarityThresholdDelta > 0)}
          <li class="text-slate-400">
            Nenhum bônus especial ativo no momento. Experimente comprar e
            equipar artefatos na Loja.
          </li>
        {/if}
      </ul>
    {/if}
  </div>
</section>
