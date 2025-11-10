<!-- src/lib/shop/ShopItemCard.svelte -->
<script lang="ts">
  import type { ShopItem, Rarity } from './types';

  // props no modo runes
  const props = $props<{ item: ShopItem }>();
  const item = props.item as ShopItem;

  type RarityConfig = {
    label: string;
    pillClass: string;
    accentClass: string;
    cardClass: string;
  };

  const rarityConfig: Record<Rarity, RarityConfig> = {
    common: {
      label: 'COMUM',
      pillClass: 'bg-slate-800 text-slate-200',
      accentClass: 'text-slate-300',
      cardClass:
        // borda + glow cinza
        'border border-slate-600 shadow-[0_0_10px_rgba(148,163,184,0.35)] ' +
        'hover:border-slate-300 hover:shadow-[0_0_18px_rgba(148,163,184,0.6)]',
    },
    rare: {
      label: 'RARO',
      pillClass: 'bg-sky-900/60 text-sky-200',
      accentClass: 'text-sky-300',
      cardClass:
        // borda + glow azul
        'border border-sky-500/80 shadow-[0_0_12px_rgba(59,130,246,0.4)] ' +
        'hover:border-sky-300 hover:shadow-[0_0_22px_rgba(96,165,250,0.7)]',
    },
    epic: {
      label: 'ÉPICO',
      pillClass: 'bg-violet-900/60 text-violet-200',
      accentClass: 'text-violet-300',
      cardClass:
        // borda + glow roxo
        'border border-violet-500/80 shadow-[0_0_12px_rgba(139,92,246,0.45)] ' +
        'hover:border-violet-300 hover:shadow-[0_0_24px_rgba(167,139,250,0.8)]',
    },
    legendary: {
      label: 'LENDÁRIO',
      pillClass: 'bg-amber-900/70 text-amber-100',
      accentClass: 'text-amber-300',
      cardClass:
        // borda + glow dourado
        'border border-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.55)] ' +
        'hover:border-amber-200 hover:shadow-[0_0_26px_rgba(252,211,77,0.95)]',
    },
  };
</script>

<div
  class={`group flex h-full flex-col rounded-2xl
          bg-slate-900/80 p-4 transition-all
          ${rarityConfig[item.rarity].cardClass}`}
>
  <!-- topo: nome + raridade + status -->
  <div class="mb-2 flex items-start justify-between gap-2">
    <div>
      <p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
        {rarityConfig[item.rarity].label}
      </p>
      <h3 class="text-sm font-semibold text-slate-100">
        {item.name}
      </h3>
    </div>

    {#if item.status === 'owned'}
      <span
        class="rounded-full border border-emerald-500/60 bg-emerald-500/15
               px-2 py-[2px] text-[0.65rem] text-emerald-300"
      >
        Adquirido
      </span>
    {:else if item.status === 'soon'}
      <span
        class="rounded-full border border-slate-700 bg-slate-800
               px-2 py-[2px] text-[0.65rem] text-slate-400"
      >
        Em breve
      </span>
    {/if}
  </div>

  <!-- descrição curta -->
  <p class="mb-3 line-clamp-2 text-[0.75rem] text-slate-400">
    {item.description}
  </p>

  <!-- rodapé: tags + preço/botão -->
  <div class="mt-auto flex items-center justify-between gap-2">
    <div class="flex flex-wrap items-center gap-1.5">
      {#if item.tag}
        <span
          class={`rounded-full px-2 py-[2px] text-[0.65rem]
                 ${rarityConfig[item.rarity].pillClass}`}
        >
          {item.tag}
        </span>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-amber-300">
        {item.price}
        <span class="text-[0.65rem] font-normal text-amber-200"> Gold</span>
      </span>

      <button
        type="button"
        class="rounded-full bg-amber-500/90 px-3 py-1 text-[0.7rem]
               font-semibold text-slate-950 hover:bg-amber-400
               disabled:bg-slate-700 disabled:text-slate-400
               transition-colors"
        disabled={item.status === 'soon' || item.status === 'owned'}
        onclick={() => {
          // aqui depois você pluga a lógica de compra / modal
          console.log('clicou em', item.name);
        }}
      >
        {item.status === 'owned'
          ? 'Equipar'
          : item.status === 'soon'
            ? 'Em breve'
            : 'Comprar'}
      </button>
    </div>
  </div>
</div>
