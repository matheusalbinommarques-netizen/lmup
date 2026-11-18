<script lang="ts">
  import {
    setSundayBlock,
    showSundayBlock,
    type WeeklyReviewState,
  } from '$services/weeklyReview';
  import Button from '$lib/ui/Button.svelte';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';

  // "Pôr no Dia aos domingos" (lote 6b): no domingo, enquanto a revisão da
  // vez não foi feita, uma linha no Plano do dia leva a ela. Não é missão:
  // fica fora da ordem, da fila, da contagem do dia e das recompensas.
  let { state: review, today }: { state?: WeeklyReviewState; today: string } =
    $props();
  const show = $derived(showSundayBlock(review, today));
  let busy = $state(false),
    error = $state('');
  async function remove() {
    busy = true;
    error = '';
    try {
      await setSundayBlock(false);
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível tirar.';
    } finally {
      busy = false;
    }
  }
</script>

{#if show}<div
    class="sunday-review"
    role="group"
    aria-label="Revisão da semana"
  >
    <span class="mark" aria-hidden="true">↻</span>
    <span class="text"
      ><strong>Revisão da semana</strong>
      <small
        >Cerca de 5 min · 3 passos opcionais · fora da contagem do dia</small
      ></span
    >
    <a
      class="lmu-button lmu-button--secondary lmu-button--s"
      href="/revisao-semanal">Abrir</a
    >
    <ContextMenu label="Mais ações para Revisão da semana"
      ><Button variant="quiet" disabled={busy} onclick={remove}
        >Tirar dos domingos</Button
      ></ContextMenu
    >
    {#if error}<p class="error" role="alert">{error}</p>{/if}
  </div>{/if}

<style>
  .sunday-review {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin: 0 0 10px;
    padding: 10px 12px;
    border: 1px dashed var(--lmu-line);
    border-radius: 8px;
  }
  .mark {
    color: var(--lmu-muted);
  }
  .text {
    display: grid;
    flex: 1 1 200px;
    gap: 2px;
  }
  small {
    color: var(--lmu-muted);
    font-size: 0.75rem;
  }
  .error {
    flex-basis: 100%;
    margin: 0;
    color: var(--lmu-danger);
    font-size: 0.8125rem;
  }
</style>
