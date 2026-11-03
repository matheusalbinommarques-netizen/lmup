<script lang="ts">
  import { untrack } from 'svelte';
  import type { SavedMissionSession } from '$services/productivityTypes';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import { endSession } from '$services/savedSessionService';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    session,
    snapshot,
    onended,
  }: {
    open?: boolean;
    session: SavedMissionSession;
    snapshot: JourneySnapshot;
    onended?: () => void;
  } = $props();
  let busy = $state(false),
    error = $state('');
  const rows = $derived(
    snapshot.occurrences.filter((row) =>
      session.occurrenceIds.includes(row.id),
    ),
  );
  const completed = $derived(rows.filter((row) => row.status === 'completed'));
  const pending = $derived(
    rows.filter(
      (row) =>
        !['completed', 'excused', 'discarded'].includes(row.status) &&
        !snapshot.tasks.find((task) => task.id === row.taskId)?.archived,
    ),
  );
  let expectedRevision = $state(0);
  $effect(() => {
    if (open) {
      expectedRevision = untrack(() => session.revision);
      error = '';
    }
  });
  guardUpdates(() => open || busy);
  async function confirm() {
    if (busy) return;
    busy = true;
    try {
      await endSession(session.id, expectedRevision);
      open = false;
      onended?.();
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível encerrar.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog bind:open title="Encerrar sessão?" dismissible={!busy}>
  <p>{session.name}</p>
  <div class="end-outcome">
    <strong
      >✓ {completed.length}
      {completed.length === 1 ? 'concluída permanece' : 'concluídas permanecem'} no
      histórico</strong
    >
  </div>
  <div class="end-outcome">
    <strong
      >{pending.length}
      {pending.length === 1 ? 'pendente volta' : 'pendentes voltam'} para Pendentes</strong
    >{#each pending as row (row.id)}<small
        >{row.title}{row.value > 0
          ? ' · Progresso parcial preservado'
          : ''}</small
      >{/each}
  </div>
  <p class="lmu-hint">
    O progresso parcial e as recompensas já registradas serão preservados. As
    atividades liberadas poderão entrar em outra sessão, mantendo suas datas.
  </p>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <div class="journey-actions">
    <Button variant="secondary" disabled={busy} onclick={() => (open = false)}
      >Continuar sessão</Button
    ><Button disabled={busy} onclick={confirm}
      >Encerrar e liberar pendências</Button
    >
  </div>
</Dialog>

<style>
  .end-outcome {
    padding: 12px;
    margin: 12px 0;
    border: 1px solid #8d744a66;
    border-radius: 7px;
    background: #0b1b1c;
    color: #e9d6a7;
  }
  small {
    display: block;
    color: #b9c8b8;
    margin-top: 6px;
  }
</style>
