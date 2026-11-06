<script lang="ts">
  import Icon from '$lib/ui/Icon.svelte';
  import type { HeroSlot } from './heroSlots';
  import RarityTag from './RarityTag.svelte';
  let {
    selected,
    effects,
    unknownEquipment = 0,
  }: {
    selected: HeroSlot | null;
    effects: string[];
    unknownEquipment?: number;
  } = $props();
</script>

<div class="detail" aria-live="polite">
  {#if selected?.item}<p class="lmu-eyebrow">{selected.label}</p>
    <div class="name">
      <h3>{selected.item.name}</h3>
      <RarityTag rarity={selected.item.rarity} />
    </div>
    {#if selected.item.description}<p class="lmu-hint">
        {selected.item.description}
      </p>{/if}{:else if selected}<p class="lmu-eyebrow">{selected.label}</p>
    <p class="lmu-muted">Nenhum item neste espaço.</p>{:else}<p
      class="lmu-muted"
    >
      Nenhum item equipado. Seus equipamentos aparecem aqui.
    </p>{/if}
</div>
{#if unknownEquipment}<p class="journey-banner">
    Há {unknownEquipment} item(ns) equipado(s) de versão anterior sem efeito reconhecido.
    Eles continuam nos seus dados.
  </p>{/if}
<details>
  <summary>Entender os efeitos ativos</summary>
  <ul class="effects profile-effects">
    {#each effects as line (line)}<li>{line}</li>{/each}
  </ul>
  <p class="lmu-hint">
    Os efeitos são combinados pelas regras de cada recompensa; a soma dos
    percentuais não é o resultado final.
  </p>
</details>
<a class="lmu-button lmu-button--primary" href="/inventario"
  >Gerenciar equipamento <Icon name="arrow" size={18} /></a
>

<style>
  .detail {
    min-height: 4.5rem;
  }
  .detail p {
    font-size: 1.05rem;
  }
  summary {
    font-size: 1.05rem;
    padding: 0.35rem 0;
  }
  a.lmu-button {
    min-height: 3.4rem;
    font-size: 1.1rem;
  }
  .name {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.75rem;
    margin: 0.1rem 0 0.25rem;
  }
  .detail h3 {
    margin: 0;
    font: 500 1.6rem/1.2 var(--lmu-display);
  }
  .effects {
    padding-left: 1.25rem;
    margin: 0.75rem 0 0;
  }
  .effects li + li {
    margin-top: 0.4rem;
  }
</style>
