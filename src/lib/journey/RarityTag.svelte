<script lang="ts">
  import { rarityKey, rarityLabel } from './heroSlots';
  let { rarity }: { rarity?: string | null } = $props();
  const key = $derived(rarityKey(rarity));
</script>

<!-- Só exibe raridades reais; o texto sempre acompanha a cor. -->
{#if key}<span class={'tag ' + key.normalize('NFD').replace(/[̀-ͯ]/g, '')}
    >{rarityLabel[key]}</span
  >{/if}

<style>
  .tag {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-size: 0.8rem;
    line-height: 1.4;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: #02090c99;
  }
  .comum {
    color: #e0c88f;
  }
  .raro {
    color: #8fc7ff;
  }
  .epico {
    color: #cfa8ff;
  }
  .lendario {
    color: #ffd27a;
  }
</style>
