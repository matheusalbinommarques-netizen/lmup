<script lang="ts">
  import PageTitleCard from '$lib/PageTitleCard.svelte';

  // --- Tipos locais do inventário (mock) ---
  type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
  type InvType = 'arma' | 'armadura' | 'consumivel' | 'miscelanea';

  type InventoryItem = {
    id: number;
    name: string;
    type: InvType;
    rarity: Rarity;
    description: string;
    quantity: number;
    slot?: string;
  };

  // Labels e classes por raridade
  const rarityLabels: Record<Rarity, string> = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
  };

  const rarityClasses: Record<Rarity, string> = {
    common:
      'border-slate-700/80 bg-slate-900/80 text-slate-200 shadow-sm shadow-slate-900/40',
    rare: 'border-blue-500/60 bg-slate-900/80 text-blue-100 shadow-lg shadow-blue-500/30',
    epic: 'border-purple-500/70 bg-slate-900/80 text-purple-100 shadow-lg shadow-purple-500/40',
    legendary:
      'border-amber-400/80 bg-slate-900/90 text-amber-100 shadow-xl shadow-amber-400/40',
  };

  const typeLabels: Record<InvType, string> = {
    arma: 'Ferramentas',
    armadura: 'Equipamentos',
    consumivel: 'Consumíveis',
    miscelanea: 'Miscelânea',
  };

  // Mock atual (substitua depois por dados do DB se quiser)
  const items: InventoryItem[] = [
    {
      id: 1,
      name: 'Caderno Arcano',
      type: 'arma',
      rarity: 'epic',
      description:
        'Cada página preenchida concede +10 de foco e +5 de clareza.',
      quantity: 1,
      slot: 'Mão principal',
    },
    {
      id: 2,
      name: 'Caneca da Cafeína Infinita',
      type: 'consumivel',
      rarity: 'rare',
      description:
        'Enche sozinha todas as manhãs. Aumenta a disposição em sessões longas.',
      quantity: 3,
    },
    {
      id: 3,
      name: 'Fones Anti-Distracção',
      type: 'armadura',
      rarity: 'legendary',
      description:
        'Cria uma barreira mágica que silencia notificações e conversas aleatórias.',
      quantity: 1,
      slot: 'Cabeça',
    },
    {
      id: 4,
      name: 'Marca-Páginas Dimensional',
      type: 'miscelanea',
      rarity: 'common',
      description: 'Sempre volta exatamente ao ponto onde você parou.',
      quantity: 5,
    },
    {
      id: 5,
      name: 'Tocha da Motivação',
      type: 'consumivel',
      rarity: 'epic',
      description:
        'Acenda quando bater a preguiça. Ilumina o próximo passo do caminho.',
      quantity: 2,
    },
    {
      id: 6,
      name: 'Mochila do Dev Andarilho',
      type: 'armadura',
      rarity: 'rare',
      description:
        'Capacidade extra para carregar ideias, livros e dispositivos mágicos.',
      quantity: 1,
      slot: 'Costas',
    },
  ];

  // Helpers tipados p/ TS
  function getRarityLabel(r: Rarity): string {
    return rarityLabels[r];
  }
  function getRarityClass(r: Rarity): string {
    return rarityClasses[r];
  }

  // --- Runes: derivados que viram funções ---
  // Contadores por raridade
  const countsByRarity = $derived(() => {
    const counts: Record<Rarity, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    for (const it of items) counts[it.rarity]++;
    return counts;
  });

  // Agrupamento por tipo
  const groupedByType = $derived(() => {
    const groups: Record<InvType | string, InventoryItem[]> = {};
    for (const item of items) {
      const key = item.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  });
</script>

<div class="flex flex-col gap-6 pb-8">
  <PageTitleCard
    title="Inventário"
    subtitle="Seu inventário é o reflexo da sua aventura: cada item representa um hábito, uma ferramenta ou um ritual que te fez evoluir."
    align="center"
  />

  <!-- Resumo / KPIs -->
  <section
    class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
  >
    <div class="flex-1 text-sm text-slate-300">
      <p>
        Seu inventário é o reflexo da sua aventura: cada item representa um
        hábito, uma ferramenta ou um ritual que te ajuda a evoluir.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        No futuro, estes itens poderão ser conquistados através de missões,
        conquistas e progresso em diferentes áreas.
      </p>
    </div>

    <div
      class="flex flex-col items-stretch gap-2 text-xs text-slate-400 min-w-[180px]"
    >
      <div
        class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800"
      >
        <span>Espaços usados</span>
        <span class="font-semibold text-slate-100">
          {items.length}
          <span class="text-slate-500"> / 32</span>
        </span>
      </div>

      <div class="grid grid-cols-2 gap-1">
        <div
          class="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[0.7rem]"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-slate-400 mr-2"
          ></span>
          Comuns
          <span class="float-right text-slate-200"
            >{countsByRarity().common}</span
          >
        </div>
        <div
          class="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[0.7rem]"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"
          ></span>
          Raros
          <span class="float-right text-slate-200">{countsByRarity().rare}</span
          >
        </div>
        <div
          class="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[0.7rem]"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"
          ></span>
          Épicos
          <span class="float-right text-slate-200">{countsByRarity().epic}</span
          >
        </div>
        <div
          class="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[0.7rem]"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"
          ></span>
          Lendários
          <span class="float-right text-slate-200"
            >{countsByRarity().legendary}</span
          >
        </div>
      </div>
    </div>
  </section>

  <!-- Listas por tipo -->
  <section class="space-y-6">
    {#each Object.entries(groupedByType()) as [typeKey, group] (typeKey)}
      <div class="space-y-3">
        <h2
          class="text-sm font-semibold text-slate-300 flex items-center gap-2"
        >
          <span class="text-base">
            {#if typeKey === 'arma'}
              🛠️
            {:else if typeKey === 'armadura'}
              🧥
            {:else if typeKey === 'consumivel'}
              🧪
            {:else}
              🎒
            {/if}
          </span>
          {typeLabels[typeKey as InvType]}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {#each group as item (item.id)}
            <article
              class={`rounded-2xl border p-4 flex flex-col gap-2 ${getRarityClass(
                item.rarity as Rarity,
              )}`}
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-semibold text-sm">{item.name}</h3>
                  <p
                    class="text-[0.7rem] uppercase tracking-widest text-slate-400"
                  >
                    {getRarityLabel(item.rarity as Rarity)}
                  </p>
                </div>
                <div
                  class="px-2 py-1 rounded-full bg-slate-950/60 border border-slate-700 text-[0.7rem] text-slate-300"
                >
                  x{item.quantity}
                </div>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>

              {#if item.slot}
                <p class="text-[0.7rem] text-slate-400 mt-1">
                  <span class="text-slate-500">Slot:</span>&nbsp;{item.slot}
                </p>
              {/if}
            </article>
          {/each}
        </div>
      </div>
    {/each}
  </section>
</div>
