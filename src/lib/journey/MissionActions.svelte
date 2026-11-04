<script lang="ts">
  import type { Occurrence } from '$services/productivityTypes';
  import { ensureOccurrence } from '$services/occurrenceService';
  import {
    skipMission,
    restartPreview,
    restartMission,
  } from '$services/missionActions';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    row,
    recurring,
    disabled = false,
  }: { row: Occurrence; recurring: boolean; disabled?: boolean } = $props();
  let busy = $state(false),
    open = $state(false),
    error = $state('');
  let preview = $state<Awaited<ReturnType<typeof restartPreview>>>();
  guardUpdates(() => busy || open);
  async function skip() {
    if (busy || disabled) return;
    busy = true;
    error = '';
    try {
      await ensureOccurrence(row.taskId, row.originDate);
      await skipMission(row.id, row.revision, !row.skipped);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível alterar o pulo.';
    } finally {
      busy = false;
    }
  }
  async function prepare() {
    busy = true;
    error = '';
    try {
      preview = await restartPreview(row.id, row.revision);
      open = true;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível preparar o reinício.';
    } finally {
      busy = false;
    }
  }
  async function restart() {
    if (!preview || busy) return;
    busy = true;
    try {
      await restartMission(
        row.id,
        preview.input.expectedRevision,
        preview.preview.due,
        preview.preview.projectDebt,
      );
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Atualize a prévia antes de recomeçar.';
    } finally {
      busy = false;
    }
  }
</script>

{#if !row.supersededBy && !['completed', 'discarded', 'excused'].includes(row.status)}
  {#if row.routineId}<Button
      variant="secondary"
      disabled={disabled || busy}
      onclick={skip}>{row.skipped ? 'Desfazer pulo' : 'Pular missão'}</Button
    >{/if}
  {#if !recurring && row.value > 0}<Button
      variant="secondary"
      disabled={disabled || busy}
      onclick={prepare}>Recomeçar do zero</Button
    >{/if}
{/if}
{#if error && !open}<p class="journey-error" role="alert">{error}</p>{/if}
<Dialog bind:open title="Recomeçar missão?" dismissible={!busy} portal>
  {#if preview}<p>
      O progresso confirmado continuará no histórico. Recomeçar zera a meta
      atual sem criar outra recompensa.
    </p>
    <p>
      Compensação nos próximos ganhos: {preview.preview.debt.xp +
        preview.preview.projectDebt.xp} XP · {preview.preview.debt.gold +
        preview.preview.projectDebt.gold} Ouro · {preview.preview.debt.food +
        preview.preview.projectDebt.food} Comida.
    </p>
    <p>Níveis e recursos já investidos permanecem preservados.</p>
    <Button loading={busy} onclick={restart}>Confirmar reinício</Button>{/if}
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
</Dialog>
