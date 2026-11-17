<script lang="ts">
  import { reviewStatus, type WeeklyReviewState } from '$services/weeklyReview';
  import { sentence } from '$services/capture';

  // Cartão da revisão semanal na Evolução (design E3): disponível, em dia
  // ou nunca feita. Não conta dias de atraso nem acumula semanas.
  let { state, today }: { state?: WeeklyReviewState; today: string } = $props();
  const status = $derived(reviewStatus(state, today));
  const day = (date: string, weekday = false) =>
    new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', {
      ...(weekday ? { weekday: 'long' as const } : {}),
      day: 'numeric',
      month: 'short',
    });
  const localDay = (iso: string) => {
    const date = new Date(iso);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
</script>

<section
  class="review-card"
  class:available={status.kind === 'available'}
  class:never={status.kind === 'never'}
  aria-labelledby="weekly-review-title"
>
  <h2 id="weekly-review-title">Revisão semanal</h2>
  {#if status.kind === 'done'}
    <p>
      <span class="check" aria-hidden="true">✓</span>
      {sentence(
        `Revisão da semana feita em ${day(localDay(status.last!.doneAt!))}`,
      )}
      {sentence(`Próxima: a partir de ${day(status.nextFrom, true)}`)}
    </p>
    <a class="quiet" href="/revisao-semanal">Fazer agora</a>
  {:else if status.kind === 'available'}
    <p>
      {status.availableSince === today
        ? 'Disponível desde hoje.'
        : sentence(`Disponível desde ${day(status.availableSince, true)}`)}
      {sentence(`Última: ${day(localDay(status.last!.doneAt!), true)}`)}
    </p>
    <a class="lmu-button lmu-button--primary" href="/revisao-semanal"
      >Fazer a revisão</a
    >
    <span class="hint">Cerca de 5 min · 3 passos · pode pular qualquer um</span>
  {:else}
    <p>
      Uma vez por semana, cerca de 5 min: olhar a semana, a Roda e ajustar a
      próxima. Tudo opcional.
    </p>
    <a class="lmu-button lmu-button--secondary" href="/revisao-semanal"
      >Experimentar agora</a
    >
  {/if}
</section>

<style>
  .review-card {
    display: grid;
    gap: 10px;
    align-content: start;
    padding: 18px;
    border: 1px solid var(--lmu-line);
    border-radius: 10px;
    background: var(--lmu-surface);
  }
  .review-card.available {
    border-color: var(--lmu-border);
    background: #15272a;
  }
  .review-card.never {
    border-style: dashed;
    background: none;
  }
  h2 {
    margin: 0;
    font-family: 'LMUP Cormorant', Georgia, serif;
    font-weight: 500;
    font-size: 1.5rem;
  }
  p {
    margin: 0;
    font-size: 0.875rem;
  }
  .check {
    color: var(--lmu-positive);
    font-weight: 700;
  }
  a {
    justify-self: start;
  }
  .quiet {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-weight: 600;
  }
  .hint {
    font-size: 0.75rem;
    color: var(--lmu-muted);
  }
</style>
