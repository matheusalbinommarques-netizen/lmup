<script lang="ts">
  import { untrack } from 'svelte';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import {
    previewAreaMerge,
    previewRoutineMerge,
    mergeAreas,
    mergeRoutines,
  } from '$services/mergeService';
  import { WEEKDAYS } from '$services/recurrence';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    kind,
    snapshot,
    sourceId,
    onmerged,
  }: {
    open?: boolean;
    kind: 'areas' | 'routines';
    snapshot: JourneySnapshot;
    sourceId: string;
    onmerged?: () => void;
  } = $props();
  let source = $state(''),
    destination = $state(''),
    error = $state(''),
    busy = $state(false),
    acknowledged = $state(false);
  let preview = $state<
    | { token: string; conflicts: string[]; summary: string; lines: string[] }
    | undefined
  >();
  let requestId = '';
  const choices = $derived(
    kind === 'areas'
      ? snapshot.areas
          .filter((row) => !row.archived)
          .map((row) => ({ id: String(row.id), name: row.nome }))
      : snapshot.routines
          .filter((row) => row.status !== 'archived')
          .map((row) => ({ id: row.id, name: row.name })),
  );
  $effect(() => {
    if (open) {
      source = untrack(() => sourceId);
      destination = '';
      error = '';
    }
  });
  $effect(() => {
    void source;
    void destination;
    preview = undefined;
    acknowledged = false;
    requestId = crypto.randomUUID();
  });
  guardUpdates(() => open || busy);
  async function inspect() {
    busy = true;
    error = '';
    try {
      if (kind === 'areas') {
        const result = await previewAreaMerge(
          Number(source),
          Number(destination),
        );
        preview = {
          token: result.token,
          conflicts: result.conflicts,
          summary: `${result.tasks.length} missões e ${result.routines.length} padrões de rotina serão transferidos para ${result.destination.nome}.`,
          lines: result.tasks.map((task) => task.title),
        };
      } else {
        const result = await previewRoutineMerge(source, destination);
        preview = {
          token: result.token,
          conflicts: result.conflicts,
          summary: `${result.destination.name} terá ${result.entries.length} missões. Os dias efetivos das missões da origem serão preservados.`,
          lines: result.entries.map(
            (entry) =>
              `${result.tasks.find((task) => task?.id === entry.taskId)?.title ?? 'Missão'} · ${entry.time ?? 'Sem horário'} · ${WEEKDAYS.filter(
                (day) =>
                  (entry.days ?? result.destination.days).includes(day.value),
              )
                .map((day) => day.short)
                .join(
                  ', ',
                )}${entry.days == null ? ' · Segue a rotina' : ' · Dias individuais'}`,
          ),
        };
      }
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível preparar a mesclagem.';
    } finally {
      busy = false;
    }
  }
  async function confirm() {
    if (!preview || busy || (preview.conflicts.length && !acknowledged)) return;
    busy = true;
    error = '';
    try {
      if (kind === 'areas')
        await mergeAreas(
          Number(source),
          Number(destination),
          preview.token,
          requestId,
        );
      else await mergeRoutines(source, destination, preview.token, requestId);
      open = false;
      onmerged?.();
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'A mesclagem não foi salva. Atualize a prévia.';
      preview = undefined;
    } finally {
      busy = false;
    }
  }
</script>

<Dialog
  bind:open
  title={kind === 'areas' ? 'Mesclar áreas' : 'Mesclar rotinas'}
  dismissible={!busy}
>
  <p>
    Identidades, execuções e recompensas serão preservadas. A origem ficará
    arquivada.
  </p>
  <div class="merge-fields">
    <label
      >Origem<select bind:value={source} disabled={busy}
        ><option value="">Escolha a origem</option
        >{#each choices as item (item.id)}<option value={item.id}
            >{item.name}</option
          >{/each}</select
      ></label
    >
    <label
      >Destino<select bind:value={destination} disabled={busy}
        ><option value="">Escolha o destino</option
        >{#each choices.filter((item) => item.id !== source) as item (item.id)}<option
            value={item.id}>{item.name}</option
          >{/each}</select
      ></label
    >
  </div>
  <Button
    variant="secondary"
    disabled={busy || !source || !destination || source === destination}
    onclick={inspect}>Visualizar resultado</Button
  >
  {#if preview}
    <p role="status">{preview.summary}</p>
    <ul>
      {#each preview.lines as line, index (index)}<li>{line}</li>{/each}
    </ul>
    {#if preview.conflicts.length}<div class="merge-conflicts">
        <strong>Confira antes de mesclar</strong>
        <ul>
          {#each preview.conflicts as conflict, index (index)}<li>
              {conflict}
            </li>{/each}
        </ul>
        <label class="journey-check"
          ><input
            type="checkbox"
            bind:checked={acknowledged}
            disabled={busy}
          />Concordo com o tratamento dos conflitos apresentado acima.</label
        >
      </div>{/if}
    <Button
      loading={busy}
      disabled={!!preview.conflicts.length && !acknowledged}
      onclick={confirm}>Confirmar mesclagem</Button
    >
  {/if}
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
</Dialog>

<style>
  .merge-fields {
    display: grid;
    gap: 12px;
    margin: 16px 0;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  }
  label {
    display: grid;
    gap: 8px;
  }
  select {
    width: 100%;
    padding: 10px;
    background: #0a1a1c;
    color: #eee0c3;
    border: 1px solid #9e7b3e;
    border-radius: 6px;
  }
  ul {
    max-height: 220px;
    overflow: auto;
    padding-left: 22px;
  }
  li {
    margin: 7px 0;
    overflow-wrap: anywhere;
  }
  .merge-conflicts {
    padding: 12px;
    border: 1px solid #9e7b3e;
    border-radius: 6px;
    margin: 12px 0;
  }
  .journey-check {
    display: flex;
    align-items: start;
  }
</style>
