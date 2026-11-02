<script lang="ts">
  import type { JourneySnapshot } from '$services/journeyQuery';
  import { makeOccurrence } from '$services/occurrenceService';
  import { occurrenceEligibility } from '$services/dailyPlanningService';
  import { startSelectedSession } from '$services/savedSessionService';
  import { dateKey } from '$services/rewardService';
  import { scheduledOn, nextPlannedDate } from '$services/recurrence';
  import { formatCalendar } from '$services/calendar';
  import { goto } from '$app/navigation';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    snapshot,
  }: { open?: boolean; snapshot: JourneySnapshot } = $props();
  let selected = $state<string[]>([]),
    search = $state(''),
    busy = $state(false),
    error = $state('');
  $effect(() => {
    if (!open) {
      selected = [];
      search = '';
      error = '';
    }
  });
  guardUpdates(() => open || busy);
  const candidates = $derived.by(() =>
    snapshot.tasks
      .filter((task) => !task.archived)
      .flatMap((task) => {
        const planned = snapshot.plannedToday.filter(
          (row) => row.taskId === task.id,
        );
        if (planned.length) return planned;
        const stored = !task.recurrence
          ? snapshot.occurrences.find((row) => row.taskId === task.id)
          : snapshot.occurrences.find(
              (row) => row.taskId === task.id && row.originDate === dateKey(),
            );
        return [
          stored ??
            makeOccurrence(
              task,
              task.recurrence
                ? scheduledOn(task, dateKey())
                  ? dateKey()
                  : (nextPlannedDate(task, dateKey()) ??
                    task.recurrence.startDate)
                : (task.plannedDate ?? dateKey()),
            ),
        ];
      }),
  );
  async function start() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await startSelectedSession(
        candidates.filter((row) => selected.includes(row.id)),
      );
      open = false;
      await goto('/sessoes');
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível iniciar.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog
  bind:open
  title="Montar sessão"
  description="Selecione ocorrências disponíveis hoje. Nenhuma data será alterada automaticamente."
  dismissible={!busy}
>
  <label class="journey-label lmu-field"
    >Buscar atividade<input type="search" bind:value={search} /></label
  >
  <div class="selection-list">
    {#each candidates.filter((row) => row.title
        .toLocaleLowerCase('pt-BR')
        .includes(search.toLocaleLowerCase('pt-BR'))) as row (row.id)}{@const task =
        snapshot.tasks.find((task) => task.id === row.taskId)}{@const reason =
        occurrenceEligibility(row, task, dateKey())}<label
        class:unavailable={!!reason}
        ><input
          type="checkbox"
          aria-label={`Incluir ${row.title} na sessão${candidates.filter((item) => item.taskId === row.taskId).length > 1 ? ` · ${row.originDate}` : ''}`}
          disabled={busy || !!reason}
          checked={selected.includes(row.id)}
          onchange={(event) =>
            (selected = event.currentTarget.checked
              ? [...selected, row.id]
              : selected.filter((id) => id !== row.id))}
        /><span
          ><strong>{row.title}</strong><small
            >{reason ??
              `Disponível hoje · origem ${formatCalendar(row.originDate)}`}</small
          ></span
        ></label
      >{/each}
  </div>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p class="lmu-hint">
    {selected.length} ocorrências selecionadas ·
    <a href="/revisoes">Sessões de revisão</a>
    · <a href="/missoes?view=sessions">Ver sessões salvas</a>
  </p>
  <div class="journey-actions">
    <Button disabled={busy || !selected.length} onclick={start}
      >Iniciar sessão</Button
    ><Button variant="quiet" disabled={busy} onclick={() => (open = false)}
      >Cancelar seleção</Button
    >
  </div>
</Dialog>

<style>
  .selection-list {
    display: grid;
    gap: 7px;
    max-height: 45dvh;
    overflow: auto;
    margin: 12px 0;
  }
  .selection-list label {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #8d744a44;
    border-radius: 7px;
    padding: 10px;
    font-size: 0.85rem;
  }
  .selection-list input {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  .selection-list span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .selection-list small {
    display: block;
    color: #afbfaa;
    font-size: 0.75rem;
    margin-top: 4px;
  }
  .unavailable {
    opacity: 0.72;
  }
</style>
