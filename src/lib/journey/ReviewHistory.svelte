<script lang="ts">
  import type { Task, ActivityEvent } from '$services/db';
  import { reviewDueDate } from '$services/reviewRules';
  import { formatCalendar } from '$services/calendar';
  import Card from '$lib/ui/Card.svelte';
  let { task, events }: { task: Task; events: ActivityEvent[] } = $props();
  const sessions = $derived(
    events
      .filter((event) => event.taskId === task.id && event.kind === 'review')
      .sort((a, b) => b.sequence - a.sequence),
  );
  const valid = $derived(sessions.filter((event) => !event.reversedAt).length);
  const undone = $derived(sessions.filter((event) => event.reversedAt).length);
</script>

{#if task.reviewEnabled || sessions.length}<section
    class="review-history"
    aria-label="Histórico de revisões"
  >
    <Card
      ><div class="journey-stack">
        <h2>Uma missão, várias práticas.</h2>
        <p class="lmu-muted">
          {valid}
          {valid === 1
            ? 'sessão válida registrada'
            : 'sessões válidas registradas'} · {undone}
          {undone === 1 ? 'desfeita' : 'desfeitas'}.
        </p>
        <p>
          {task.reviewEnabled
            ? `Próxima revisão: ${formatCalendar(reviewDueDate(task))}`
            : 'Revisões desativadas. Seu histórico continua aqui.'}
        </p>
        {#if sessions.length}<ol class="lmu-list">
            {#each sessions as event (event.id)}<li class="review-session">
                <strong>{formatCalendar(event.date)}</strong><span
                  >{event.reversedAt
                    ? 'Sessão desfeita'
                    : event.reviewOutcome === 'recalled'
                      ? 'Lembrei bem'
                      : event.reviewOutcome === 'partial'
                        ? 'Lembrei em parte'
                        : event.reviewOutcome === 'again'
                          ? 'Quero praticar mais'
                          : 'Prática registrada'}</span
                ><span class="lmu-hint"
                  >Recibo da sessão: +{event.reward.xp} XP · +{event.reward
                    .gold} Gold · +{event.reward.food} Comida{event.reversedAt
                    ? ' (estornado)'
                    : ''}</span
                >
              </li>{/each}
          </ol>{:else}<p class="lmu-muted">
            Ainda não há sessões detalhadas. Conclusões antigas não são
            transformadas em sessões inventadas.
          </p>{/if}
      </div></Card
    >
  </section>{/if}
