<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { isAvailable } from '$services/journeyService';
  import { dateKey } from '$services/rewardService';
  import { reviewDueDate } from '$services/reviewRules';
  import { formatCalendar } from '$services/calendar';
  import type { Task } from '$services/db';
  import ReviewForm from '$lib/journey/ReviewForm.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    open = $state(false);
  let selected = $state<Task>();
  let today = $state(dateKey());
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler as revisões.';
      },
    });
    const refresh = () => {
      today = dateKey();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  });
  const tasks = $derived(
    data?.tasks
      .filter(
        (task) =>
          !task.archived &&
          (task.reviewEnabled ||
            data?.events.some(
              (event) => event.taskId === task.id && event.kind === 'review',
            )),
      )
      .sort((a, b) => reviewDueDate(a).localeCompare(reviewDueDate(b))) ?? [],
  );
</script>

<svelte:head><title>Revisões · Level Me Up</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Voltar para lembrar</p>
    <h1>Revisões</h1>
    <p>
      Uma missão continua sendo uma só. Cada prática tem seu próprio registro.
    </p>
  </div>
</header>
<p class="journey-banner">
  Antes de consultar as notas, tente explicar o conteúdo de memória. Depois
  confira e registre uma descoberta. Você escolhe quando praticar novamente.
</p>
{#if error}<p role="alert">{error}</p>{:else if !data}<p role="status">
    Abrindo revisões…
  </p>{:else}<div class="journey-stack">
    {#each tasks as task (task.id)}{@const count = data.events.filter(
        (event) =>
          event.taskId === task.id &&
          event.kind === 'review' &&
          !event.reversedAt,
      ).length}<Card
        ><h2>{task.title}</h2>
        <p class="lmu-muted">
          {task.reviewEnabled
            ? `Próxima prática: ${formatCalendar(reviewDueDate(task))}`
            : 'Revisões desativadas'} · {count}
          {count === 1 ? 'sessão válida' : 'sessões válidas'}
        </p>
        <div class="journey-actions">
          <a class="lmu-button lmu-button--primary" href={`/missao/${task.id}`}
            >{task.reviewEnabled &&
            isAvailable(task, new Date(`${today}T12:00:00`))
              ? 'Praticar revisão'
              : 'Ver missão e sessões'}</a
          ><Button
            variant="secondary"
            onclick={() => {
              selected = task;
              open = true;
            }}>Configurar revisão</Button
          >
        </div></Card
      >{/each}{#if !tasks.length}<Card
        ><div class="journey-empty">
          <h2>O que você quer revisitar?</h2>
          <p class="lmu-muted">
            Abra uma missão e configure sua próxima revisão.
          </p>
          <a class="lmu-button lmu-button--secondary" href="/missoes"
            >Escolher uma missão</a
          >
        </div></Card
      >{/if}
  </div>{/if}{#if selected}<ReviewForm bind:open task={selected} />{/if}
