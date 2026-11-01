<script lang="ts">
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    plannedOccurrences,
    ensureOccurrence,
  } from '$services/occurrenceService';
  import { dateKey } from '$services/rewardService';
  import type { Occurrence } from '$services/productivityTypes';
  import { occurrenceSituation } from '$services/productivityInsights';
  import Button from '$lib/ui/Button.svelte';
  let rows = $state<Occurrence[]>([]),
    error = $state(''),
    today = $state(dateKey());
  onMount(() => {
    const timer = setInterval(() => (today = dateKey()), 30000);
    return () => clearInterval(timer);
  });
  $effect(() => {
    const day = today;
    const sub = liveQuery(() => plannedOccurrences(day, day)).subscribe({
      next: (data) =>
        (rows = data.filter(
          (row) => !['completed', 'discarded', 'excused'].includes(row.status),
        )),
      error: () => (error = 'Não foi possível ler os próximos horários.'),
    });
    return () => sub.unsubscribe();
  });
  async function open(row: Occurrence) {
    try {
      await ensureOccurrence(row.taskId, row.originDate);
      await goto('/ocorrencia/' + encodeURIComponent(row.id));
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível abrir.';
    }
  }
</script>

{#if rows.some((row) => row.plannedTime || row.deadline)}<section
    class="rpg-frame today-planning"
  >
    <div>
      <h2>Próximos compromissos</h2>
      <a class="journey-link" href="/missoes?view=agenda">Abrir agenda →</a>
    </div>
    {#if error}<p role="alert">{error}</p>{/if}
    <ol>
      {#each rows
        .filter((row) => row.plannedTime || row.deadline)
        .slice(0, 3) as row (row.id)}<li>
          <strong>{row.plannedTime ?? 'Flexível'}</strong><span
            >{row.title}{occurrenceSituation(row) === 'expired'
              ? ' · prazo vencido'
              : occurrenceSituation(row) === 'late'
                ? ' · início atrasado'
                : ''}</span
          ><Button onclick={() => open(row)}>Executar</Button>
        </li>{/each}
    </ol>
  </section>{/if}

<style>
  .today-planning {
    padding: 1rem;
    margin: 1rem 0;
  }
  .today-planning > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  h2 {
    font: 500 1.3rem var(--lmu-display);
    color: #e2c184;
  }
  ol {
    list-style: none;
    padding: 0;
  }
  li {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    border-top: 1px solid #a27c4340;
    padding: 0.5rem 0;
  }
  li strong {
    color: #e1c58d;
  }
  li span {
    flex: 1;
  }
  @media (max-width: 500px) {
    li {
      flex-wrap: wrap;
    }
  }
</style>
