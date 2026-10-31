<script lang="ts">
  import {
    getEcoStageForTotalXp,
    getNextEcoStage,
    getEcoProgressForTotalXp,
  } from '$services/ecoConfig';
  import Icon from '$lib/ui/Icon.svelte';
  let { totalXp }: { totalXp: number } = $props();
  const stage = $derived(getEcoStageForTotalXp(totalXp));
  const next = $derived(getNextEcoStage(stage.id));
</script>

<section class="world-progress" aria-label="Evolução do seu mundo">
  <p class="lmu-eyebrow">Seu mundo · estágio {stage.id} de 4</p>
  <h2>{stage.label}</h2>
  <progress
    aria-label="Evolução do ambiente"
    max="100"
    value={getEcoProgressForTotalXp(totalXp)}
  ></progress>
  <p>
    {#if next}Faltam {Math.max(0, next.minXp - totalXp)} XP para {next.label}.{:else}Floresta
      Anciã alcançada. Seu mundo continua aqui.{/if}
  </p>
  <a href="/refugio">Visitar refúgio <Icon name="arrow" size={16} /></a>
</section>

<style>
  .world-progress {
    min-width: 0;
  }
  h2 {
    margin: 0.4rem 0 0.8rem;
  }
  progress {
    display: block;
    height: 0.3rem;
  }
  p:not(.lmu-eyebrow) {
    color: #cfdbd4;
    font-size: 0.8rem;
    margin-top: 0.7rem;
  }
  a {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    color: #ead0a1;
    min-height: 2.75rem;
    font-size: 0.875rem;
  }
</style>
