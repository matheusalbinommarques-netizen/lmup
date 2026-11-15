<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import InvestmentGoalCard from './InvestmentGoalCard.svelte';
  import SupplyBoxesCard from './SupplyBoxesCard.svelte';

  // Lote 4b: caixas de suprimento e "No que investir?" saem do Hoje e
  // moram no Acampamento (design "LMUP Hoje" D1). Regras e saldos não mudam.
  let data = $state.raw<JourneySnapshot>();
  let error = $state('');
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler os suprimentos. Nada foi alterado.';
      },
    });
    return () => sub.unsubscribe();
  });
  const today = dateKey();
</script>

<section class="camp-supplies" aria-label="Suprimentos e investimento">
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if data}<InvestmentGoalCard {data} />
    <SupplyBoxesCard {today} />{/if}
</section>

<style>
  .camp-supplies {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    align-items: start;
    max-width: 1180px;
    margin: 16px auto 32px;
    padding: 0 16px;
  }
</style>
