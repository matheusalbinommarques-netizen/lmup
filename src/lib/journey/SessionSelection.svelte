<script lang="ts">
  import { countLabel } from '$lib/plural';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import { makeOccurrence } from '$services/occurrenceService';
  import { occurrenceEligibility } from '$services/dailyPlanningService';
  import {
    startSelectedSession,
    appendSessionOccurrences,
  } from '$services/savedSessionService';
  import { isOpenSession } from '$services/sessionLifecycle';
  import type { SavedMissionSession } from '$services/productivityTypes';
  import { dateKey } from '$services/rewardService';
  import { scheduledOn, nextPlannedDate } from '$services/recurrence';
  import { goto } from '$app/navigation';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    snapshot,
    targetSession,
    onadded,
  }: {
    open?: boolean;
    snapshot: JourneySnapshot;
    targetSession?: SavedMissionSession;
    onadded?: () => void;
  } = $props();
  let selected = $state<string[]>([]),
    search = $state(''),
    busy = $state(false),
    error = $state('');
  let area = $state('all');
  $effect(() => {
    if (!open) {
      selected = [];
      search = '';
      error = '';
      area = 'all';
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
      const selection = candidates.filter((row) => selected.includes(row.id));
      if (targetSession)
        await appendSessionOccurrences(
          targetSession.id,
          targetSession.revision,
          selection,
        );
      else await startSelectedSession(selection);
      open = false;
      if (targetSession) onadded?.();
      else await goto('/sessoes');
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
  title={targetSession ? 'Adicionar missões à sessão' : 'Montar sessão'}
  description={targetSession
    ? 'As atividades entram no fim da fila. A atividade atual e seu progresso continuam preservados.'
    : 'Selecione ocorrências disponíveis hoje. Nenhuma data será alterada automaticamente.'}
  dismissible={!busy}
>
  <label class="journey-label lmu-field"
    >Buscar atividade<input type="search" bind:value={search} /></label
  >
  <label class="journey-label lmu-field"
    >Área<select bind:value={area}
      ><option value="all">Todas as áreas</option
      >{#each snapshot.areas as item (item.id)}<option value={String(item.id)}
          >{item.nome}</option
        >{/each}</select
    ></label
  >
  <div class="selection-list">
    {#each candidates.filter((row) => !targetSession?.occurrenceIds.includes(row.id) && (area === 'all' || row.areaId === Number(area)) && row.title
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR'))) as row (row.id)}{@const task =
        snapshot.tasks.find((task) => task.id === row.taskId)}{@const reason =
        snapshot.sessions.some(
          (session) =>
            isOpenSession(session) && session.occurrenceIds.includes(row.id),
        )
          ? 'Já pertence a uma sessão aberta'
          : occurrenceEligibility(row, task, dateKey())}<label
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
            >{reason ?? 'Disponível hoje'}</small
          ></span
        ></label
      >{/each}
  </div>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p class="lmu-hint">
    {countLabel(
      selected.length,
      'ocorrência selecionada',
      'ocorrências selecionadas',
    )} ·
    <a href="/missoes?view=sessions">Ver sessões ativas</a>
  </p>
  <div class="journey-actions">
    <Button disabled={busy || !selected.length} onclick={start}
      >{targetSession
        ? `Adicionar ${selected.length} ${selected.length === 1 ? 'missão' : 'missões'}`
        : 'Iniciar sessão'}</Button
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
