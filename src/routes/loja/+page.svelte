<script lang="ts">
  type ShopItem = {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: 'xp' | 'gema';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    tag?: string;
  };

  const rarityLabels: Record<ShopItem['rarity'], string> = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
  };

  const rarityClasses: Record<ShopItem['rarity'], string> = {
    common:
      'border-slate-700/80 bg-slate-900/80 text-slate-200 shadow-sm shadow-slate-900/40',
    rare: 'border-blue-500/60 bg-slate-900/80 text-blue-100 shadow-lg shadow-blue-500/30',
    epic: 'border-purple-500/70 bg-slate-900/80 text-purple-100 shadow-lg shadow-purple-500/40',
    legendary:
      'border-amber-400/80 bg-slate-900/90 text-amber-100 shadow-xl shadow-amber-400/40',
  };

  function getRarityLabel(r: ShopItem['rarity']): string {
    return rarityLabels[r];
  }

  function getRarityClass(r: ShopItem['rarity']): string {
    return rarityClasses[r];
  }

  const featuredItems: ShopItem[] = [
    {
      id: 1,
      name: 'Tema “Noite Arcana”',
      description:
        'Transforma a taverna em um salão ainda mais místico, com brilhos sutis e runas animadas.',
      price: 800,
      currency: 'xp',
      rarity: 'epic',
      tag: 'Visual',
    },
    {
      id: 2,
      name: 'Pacote de Sons “Forja & Canecas”',
      description:
        'Adiciona sons imersivos de forja, canecas se chocando e páginas virando aos seus cliques.',
      price: 400,
      currency: 'xp',
      rarity: 'rare',
      tag: 'Imersão',
    },
    {
      id: 3,
      name: 'Moldura Lendária do Herói',
      description:
        'Uma moldura especial para o avatar, reservada apenas aos aventureiros verdadeiramente dedicados.',
      price: 1500,
      currency: 'xp',
      rarity: 'legendary',
      tag: 'Perfil',
    },
  ];

  const utilityItems: ShopItem[] = [
    {
      id: 4,
      name: 'Slot Extra de Inventário',
      description:
        'Aumenta a capacidade de itens carregados, ideal para quem acumula artefatos.',
      price: 300,
      currency: 'xp',
      rarity: 'rare',
    },
    {
      id: 5,
      name: 'Lembrete Mágico Diário',
      description:
        'Desbloqueia lembretes suaves para não deixar suas missões passarem em branco.',
      price: 200,
      currency: 'xp',
      rarity: 'common',
    },
    {
      id: 6,
      name: 'Efeito de Entrada na Taverna',
      description:
        'Um pequeno efeito visual quando você volta para a Taverna, mostrando sua presença.',
      price: 600,
      currency: 'xp',
      rarity: 'epic',
      tag: 'Cosmético',
    },
  ];

  function formatPrice(item: ShopItem): string {
    if (item.currency === 'xp') return `${item.price} XP`;
    return `${item.price} Gemas`;
  }

  function getCurrencyIcon(item: ShopItem): string {
    if (item.currency === 'xp') return '✨';
    return '💎';
  }
</script>

<div class="flex flex-col gap-6 pb-8">
  <header class="mb-4 text-center">
    <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
      Loja da Taverna
    </h1>
    <p class="text-slate-400">
      Troque seu progresso por estilos, melhorias e pequenos encantos
      cosméticos.
    </p>
  </header>

  <section
    class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
  >
    <div class="flex-1 text-sm text-slate-300">
      <p>
        Esta loja é totalmente cosmética: nada aqui é <em>pay to win</em>. Tudo
        é conquistado com esforço, foco e XP das suas próprias missões.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        No futuro, itens daqui podem se integrar com a Taverna, Inventário e
        Sala de Troféus, desbloqueando visuais exclusivos conforme você evolui.
      </p>
    </div>

    <div
      class="flex flex-col items-stretch gap-2 text-xs text-slate-400 min-w-[190px]"
    >
      <div
        class="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
      >
        <span>Moeda da Loja</span>
        <span class="font-semibold text-slate-100 flex items-center gap-1">
          <span>✨</span>
          XP
        </span>
      </div>
      <div
        class="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[0.7rem]"
      >
        <p class="text-slate-300 font-semibold">Como funciona?</p>
        <p class="text-slate-500 mt-1">
          Você desbloqueia itens só jogando: complete missões, mantenha o streak
          e acumule XP. Nada de dinheiro real aqui.
        </p>
      </div>
    </div>
  </section>

  <section class="space-y-6">
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <span class="text-base">🛍️</span>
        Itens em Destaque
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {#each featuredItems as item (item.id)}
          <article
            class={`rounded-2xl border p-4 flex flex-col gap-3 ${getRarityClass(
              item.rarity,
            )}`}
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-sm">
                  {item.name}
                </h3>
                <p
                  class="text-[0.7rem] uppercase tracking-widest text-slate-400"
                >
                  {getRarityLabel(item.rarity)}
                </p>
              </div>
              <div
                class="px-3 py-1 rounded-full bg-slate-950/70 border border-slate-700 text-[0.7rem] text-slate-100 flex items-center gap-1"
              >
                <span>{getCurrencyIcon(item)}</span>
                <span>{formatPrice(item)}</span>
              </div>
            </div>

            <p class="text-xs text-slate-200 leading-relaxed">
              {item.description}
            </p>

            <div class="flex items-center justify-between text-[0.7rem]">
              <div class="text-slate-400">
                {#if item.tag}
                  <span
                    class="px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-700 text-slate-300"
                  >
                    {item.tag}
                  </span>
                {/if}
              </div>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-[#ffb74d] text-slate-950 font-semibold hover:bg-[#ffa726] text-xs transition-colors"
              >
                Pré-visualizar
              </button>
            </div>
          </article>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <span class="text-base">🧰</span>
        Utilidades & Qualidade de Vida
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {#each utilityItems as item (item.id)}
          <article
            class={`rounded-2xl border p-4 flex flex-col gap-3 ${getRarityClass(
              item.rarity,
            )}`}
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-sm">
                  {item.name}
                </h3>
                <p
                  class="text-[0.7rem] uppercase tracking-widest text-slate-400"
                >
                  {getRarityLabel(item.rarity)}
                </p>
              </div>
              <div
                class="px-3 py-1 rounded-full bg-slate-950/70 border border-slate-700 text-[0.7rem] text-slate-100 flex items-center gap-1"
              >
                <span>{getCurrencyIcon(item)}</span>
                <span>{formatPrice(item)}</span>
              </div>
            </div>

            <p class="text-xs text-slate-200 leading-relaxed">
              {item.description}
            </p>

            <div class="flex items-center justify-end text-[0.7rem]">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 font-semibold hover:bg-slate-700 transition-colors"
              >
                Em breve
              </button>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>
</div>
