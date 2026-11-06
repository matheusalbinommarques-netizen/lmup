<script lang="ts">
  import Artwork from '$lib/ui/Artwork.svelte';
  import type { HeroSlot } from './heroSlots';
  let {
    slots,
    selectedKey = '',
    onselect,
    children,
  }: {
    slots: HeroSlot[];
    selectedKey?: string;
    onselect: (key: string) => void;
    children?: import('svelte').Snippet;
  } = $props();
  const byKey = $derived(Object.fromEntries(slots.map((s) => [s.key, s])));
  const left = ['helm', 'armor', 'ring'],
    right = ['amulet', 'weapon', 'bag'];
</script>

{#snippet slotButton(key: string)}
  {@const slot = byKey[key]}
  {#if slot}<button
      type="button"
      class="slot"
      class:filled={!!slot.item}
      class:active={selectedKey === key}
      aria-pressed={selectedKey === key}
      aria-label={slot.label + ': ' + (slot.item?.name ?? 'vazio')}
      onclick={() => onselect(key)}
    >
      {#if slot.item?.iconSrc}<Artwork
          src={slot.item.iconSrc}
          alt=""
          sizes="72px"
          class="slot-art"
        />{:else if !slot.item}<span class="rune" aria-hidden="true"
        ></span>{/if}
      <span class="slot-label" aria-hidden="true">{slot.label}</span>
    </button>{/if}
{/snippet}

<div class="gear">
  <div class="col">
    {#each left as key (key)}{@render slotButton(key)}{/each}
  </div>
  <div class="center">{@render children?.()}</div>
  <div class="col">
    {#each right as key (key)}{@render slotButton(key)}{/each}
  </div>
</div>

<style>
  .gear {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: clamp(0.5rem, 1.6vw, 1.5rem);
    align-items: center;
  }
  .col {
    display: grid;
    gap: 0.75rem;
  }
  .center {
    display: grid;
    place-items: center;
  }
  .slot {
    position: relative;
    width: clamp(5rem, 7.4vw, 6.4rem);
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 0.3rem;
    border-radius: 0.6rem;
    color: inherit;
    cursor: pointer;
  }
  /* Ocupado: moldura sólida em dourado envelhecido e fundo mais claro. */
  .slot.filled {
    border: 1px solid #c9a45f;
    background: #12282acc;
    box-shadow:
      inset 0 0 0 2px #02090c,
      inset 0 0 0 3px #b08d5240,
      0 2px 6px #0008;
  }
  /* Vazio: tracejado discreto, sem dourado. */
  .slot:not(.filled) {
    border: 1px dashed #5f7a7466;
    background: #061115aa;
    box-shadow: inset 0 0 0 2px #02090c99;
  }
  .slot:not(.filled):hover {
    border-color: #a27c4399;
  }
  .slot.active {
    outline: 2px solid var(--rpg-gold, #edc477);
    outline-offset: 2px;
  }
  .slot:focus-visible {
    outline: 2px solid var(--rpg-gold-bright, #ffe0a0);
    outline-offset: 3px;
  }
  .slot :global(.slot-art) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .rune {
    width: 34%;
    aspect-ratio: 1;
    border: 1px solid #7f9a9266;
    transform: rotate(45deg);
    border-radius: 0.2rem;
  }
  .slot-label {
    position: absolute;
    bottom: 0.15rem;
    left: 0;
    right: 0;
    font-size: 0.85rem;
    line-height: 1;
    text-align: center;
    color: var(--lmu-muted);
    text-shadow: 0 1px 2px #000;
  }
  .filled .slot-label {
    display: none;
  }
  @media (max-width: 900px) {
    .gear {
      grid-template-columns: 1fr;
    }
    .col {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      justify-items: center;
    }
    .center {
      order: -1;
    }
    .slot {
      width: min(5.5rem, 100%);
    }
  }
</style>
