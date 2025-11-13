<!-- src/routes/loja/+page.svelte -->
<script lang="ts">
  import ShopItemCard from '$lib/shop/ShopItemCard.svelte';
  import type { ShopItem, ShopCategory } from '$lib/shop/types';
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import { buyItem, equipItemById } from '$services/shopService';

  // categoria selecionada
  let selectedCategory = $state<ShopCategory>('highlight');

  // mock dos itens disponíveis na vitrine
  const items: ShopItem[] = [
    {
      id: 1,
      name: 'Tema "Noite Arcana"',
      description:
        'Transforma a taverna em um salão ainda mais místico, com brilhos sutis e runas animadas.',
      price: 800,
      rarity: 'epic',
      category: 'theme',
      tag: 'Visual',
      status: 'available',
    },
    {
      id: 2,
      name: 'Pacote de Sons "Forja & Canecas"',
      description:
        'Adiciona sons imersivos de forja, canecas se chocando e páginas virando ao seus cliques.',
      price: 600,
      rarity: 'rare',
      category: 'effect',
      tag: 'Imersão',
      status: 'available',
    },
    {
      id: 3,
      name: 'Moldura Lendária do Herói',
      description:
        'Uma moldura especial para o avatar, reservada apenas aos aventureiros verdadeiramente dedicados.',
      price: 1500,
      rarity: 'legendary',
      category: 'profile',
      tag: 'Perfil',
      status: 'soon',
    },
    {
      id: 4,
      name: 'Slot Extra de Inventário',
      description:
        'Aumenta a capacidade de itens carregados, ideal para quem acumula artefatos.',
      price: 300,
      rarity: 'rare',
      category: 'utility',
      tag: 'Raro',
      status: 'available',
    },
    {
      id: 5,
      name: 'Lembrete Mágico Diário',
      description:
        'Desbloqueia lembretes suaves para não deixar suas missões passarem em branco.',
      price: 200,
      rarity: 'common',
      category: 'utility',
      tag: 'Comum',
      status: 'soon',
    },
    {
      id: 6,
      name: 'Efeito de Entrada na Taverna',
      description:
        'Um pequeno efeito visual quando você volta para a Taverna, mostrando sua presença.',
      price: 600,
      rarity: 'epic',
      category: 'effect',
      tag: 'Épico',
      status: 'soon',
    },
    {
      id: 7,
      name: 'Tema "Aurora do Herói"',
      description:
        'Tema claro com auroras suaves e partículas de luz; perfeito para quem prefere um clima amanhecer.',
      price: 900,
      rarity: 'epic',
      category: 'theme',
      tag: 'Visual',
      status: 'available',
    },
  ];

  // ---------- saldo real de Gold ----------
  const goldQuery = liveQuery(async () => {
    const profile = await db.profile.get(1);
    return profile?.gold ?? 0;
  });
  let gold = $state(0);

  onMount(() => {
    const sub = goldQuery.subscribe((value) => (gold = value));
    return () => sub.unsubscribe();
  });

  // ---------- itens já comprados (owned) ----------
  let ownedSet = $state<Set<number>>(new Set());
  const ownedQuery = liveQuery(() => db.ownedShopItems.toArray());

  onMount(() => {
    const sub = ownedQuery.subscribe((rows) => {
      ownedSet = new Set(rows.map((r) => r.itemId));
    });
    return () => sub.unsubscribe();
  });

  // ---------- UI state por item (comprando...) ----------
  let buyingId = $state<number | null>(null);

  async function handleBuy(item: ShopItem) {
    if (item.status === 'soon') return;
    if (ownedSet.has(item.id)) return;

    if (gold < item.price) {
      alert('Gold insuficiente.');
      return;
    }

    try {
      buyingId = item.id;
      const res = await buyItem(item);
      if (!res.ok) {
        if (res.code === 'no_funds') alert('Gold insuficiente.');
        else if (res.code === 'profile_missing')
          alert('Perfil não encontrado.');
        else alert('Não foi possível concluir a compra.');
      } else if (res.code === 'already_owned') {
        // idempotente — já possuído
        // nada a fazer
      } else {
        // sucesso — liveQuery atualiza gold e ownedSet automaticamente
        // opcional: auto-equip para categorias visuais
        // if (item.category === 'theme' || item.category === 'profile') {
        //   await equipItemById(item.id);
        // }
      }
    } finally {
      buyingId = null;
    }
  }

  async function handleEquip(item: ShopItem) {
    await equipItemById(item.id);
  }

  // ---------- filtro de itens ----------
  const filteredItems = $derived(
    selectedCategory === 'highlight'
      ? items
      : items.filter((item) => item.category === selectedCategory),
  );

  const categories: { id: ShopCategory; label: string }[] = [
    { id: 'highlight', label: 'Destaque' },
    { id: 'theme', label: 'Temas' },
    { id: 'utility', label: 'Utilidades' },
    { id: 'effect', label: 'Efeitos' },
    { id: 'profile', label: 'Perfil' },
  ];
</script>

<!-- Fundo da loja com imagem + overlay escuro -->
<div
  class="relative flex-1"
  style="
    background-image: url('/art/bg/bg-shop.webp');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
  "
>
  <div class="pointer-events-none absolute inset-0 bg-slate-950/85"></div>

  <main class="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
    <PageTitleCard
      title="Loja da Taverna"
      subtitle="Gaste seu Gold em itens exclusivos para personalizar sua experiência e aprimorar sua jornada."
      align="center"
    />

    <!-- Saldo -->
    <section
      class="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800
             bg-slate-900/80 px-4 py-3 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-center gap-3">
        <p class="text-[0.7 rem] uppercase tracking-[0.18em] text-slate-400">
          Seu saldo
        </p>
        <div
          class="inline-flex items-center gap-1 rounded-full border border-amber-500/70
                 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-200"
        >
          <span>{gold}</span>
          <span class="text-[0.7rem] font-normal text-amber-100">Gold</span>
          <img
            src="/art/icones/gold-icon.png"
            alt="Gold"
            class="h-4 w-4 object-contain"
          />
        </div>
      </div>

      <div class="text-xs text-slate-400 max-w-md">
        <p>
          Você ganha Gold ao completar missões, manter sua sequência ativa e
          evoluir de nível.
        </p>
      </div>

      <button
        type="button"
        class="self-start rounded-full border border-amber-400/70
               bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-100
               hover:bg-amber-500/20 transition-colors"
        onclick={() => console.log('como ganhar mais gold')}
      >
        Como ganhar mais Gold?
      </button>
    </section>

    <!-- Tabs -->
    <nav
      class="mb-4 flex flex-wrap items-center gap-2 text-[0.75rem]"
      aria-label="Categorias da loja"
    >
      {#each categories as cat (cat.id)}
        <button
          type="button"
          onclick={() => (selectedCategory = cat.id)}
          class={`rounded-full px-3 py-1.5 border transition-colors ${
            selectedCategory === cat.id
              ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
              : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          {cat.label}
        </button>
      {/each}
    </nav>

    <!-- Grid -->
    <section>
      {#if filteredItems.length > 0}
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {#each filteredItems as item (item.id)}
            <ShopItemCard
              {item}
              owned={ownedSet.has(item.id)}
              buying={buyingId === item.id}
              canAfford={gold >= item.price}
              onBuy={() => handleBuy(item)}
              onEquip={() => handleEquip(item)}
            />
          {/each}
        </div>
      {:else}
        <div
          class="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-8 text-center text-sm text-slate-400"
        >
          Nenhum item disponível nesta categoria por enquanto.
        </div>
      {/if}
    </section>
  </main>
</div>
