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
    mode = 'delete',
  }: {
    open?: boolean;
    mode?: RemovalMode;
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
      const result = await removeTask(
        preview.taskId,
        preview.token,
        requestId,
        mode,
      );
      open = false;
      onremoved?.(result);
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
    {#if mode === 'delete'}
      {#if !preview.canDelete}<p role="alert">
          Missões de história não podem ser excluídas definitivamente.
        </p>{:else}
        <p>
          O cadastro, a descrição, os passos, as notas e o progresso pessoal
          serão apagados definitivamente, incluindo {preview.occurrences} ocorrências.
          Os vínculos desta missão com rotinas e sessões serão removidos; as demais
          atividades serão preservadas.
        </p>
        <p>
          {preview.receipts} recibos contábeis serão mantidos sem título, notas ou
          vínculo com a missão para preservar XP, ouro, comida, níveis e saldos. Não
          haverá recompensa nem estorno.
        </p>
        <p>
          As cópias locais de recuperação também serão limpas. Um registro de
          exclusão impedirá que esta missão reapareça ao restaurar backups nesta
          instalação. Arquivos exportados anteriormente não podem ser apagados
          pelo aplicativo.
        </p>
        <p>
          <strong>Esta ação é irreversível.</strong> O histórico pessoal da missão
          não poderá ser recuperado por esse fluxo.
        </p>{/if}
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
      <Button
        variant={mode === 'delete' ? 'danger' : 'secondary'}
        disabled={busy || !!error || (mode === 'delete' && !preview.canDelete)}
        onclick={confirm}
        >{mode === 'delete'
          ? 'Excluir definitivamente'
          : 'Arquivar missão'}</Button
      ><Button
        variant="quiet"
        data-initial-focus
        disabled={busy}
        onclick={() => (open = false)}>Cancelar</Button
      >
    </div>
  {:else if !busy}<Button variant="quiet" onclick={() => (open = false)}
      >Fechar</Button
    >{/if}
</Dialog>
