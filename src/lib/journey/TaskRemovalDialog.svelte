<script lang="ts">
  import type { Task } from '$services/db';
  import {
    previewTaskRemoval,
    removeTask,
    type RemovalPreview,
    type RemovalMode,
  } from '$services/taskRemoval';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    task,
    onremoved,
  }: {
    open?: boolean;
    task?: Task;
    onremoved?: (mode: RemovalMode) => void;
  } = $props();
  let preview = $state<RemovalPreview>(),
    busy = $state(false),
    error = $state('');
  let requestId = '';
  guardUpdates(() => open || busy);
  $effect(() => {
    if (!open || !task?.id) return;
    const id = task.id;
    let live = true;
    preview = undefined;
    error = '';
    busy = true;
    requestId = `task-remove:${crypto.randomUUID()}`;
    void previewTaskRemoval(id)
      .then((value) => {
        if (live) preview = value;
      })
      .catch((cause) => {
        if (live)
          error =
            cause instanceof Error
              ? cause.message
              : 'Não foi possível conferir a missão.';
      })
      .finally(() => {
        if (live) busy = false;
      });
    return () => {
      live = false;
    };
  });
  async function confirm() {
    if (!preview || busy) return;
    busy = true;
    error = '';
    try {
      const mode = await removeTask(preview.taskId, preview.token, requestId);
      open = false;
      onremoved?.(mode);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível remover a missão.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog bind:open title="Remover missão" dismissible={!busy}>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if !preview && busy}<p role="status">
      Conferindo histórico e vínculos…
    </p>{/if}
  {#if preview}
    <h3>{preview.title}</h3>
    {#if preview.mode === 'delete'}
      <p>
        Esta missão não tem histórico relevante nem vínculos que precisem ser
        preservados. O cadastro e seu planejamento sem uso serão apagados
        definitivamente.
      </p>
      <p>Essa ação não pode ser desfeita. Nenhum saldo será alterado.</p>
    {:else}
      <p>
        Esta missão será arquivada e sairá das atividades ativas. Seu histórico,
        notas, XP e recompensas serão preservados.
      </p>
      <ul>
        {#each preview.reasons as reason (reason)}<li>{reason}</li>{/each}
      </ul>
      {#if preview.routines || preview.sessions}<p>
          Ela sairá das sequências ativas de rotinas e sessões. Registros
          anteriores continuam guardados. Uma rotina que ficar vazia será
          pausada.
        </p>{/if}
      {#if preview.project}<p>
          O vínculo com o projeto permanece no histórico. Arquivar não conclui o
          projeto nem concede ou estorna bônus.
        </p>{/if}
      <p>Você poderá consultar a missão em Arquivadas.</p>
    {/if}
    <p class="lmu-hint">
      Tirar de hoje ou remover de uma sessão são ações separadas e mantêm o
      cadastro ativo.
    </p>
    <div class="journey-actions">
      <Button variant="danger" disabled={busy || !!error} onclick={confirm}
        >{preview.mode === 'delete'
          ? 'Excluir definitivamente'
          : 'Arquivar missão'}</Button
      ><Button variant="quiet" disabled={busy} onclick={() => (open = false)}
        >Cancelar</Button
      >
    </div>
  {:else if !busy}<Button variant="quiet" onclick={() => (open = false)}
      >Fechar</Button
    >{/if}
</Dialog>
