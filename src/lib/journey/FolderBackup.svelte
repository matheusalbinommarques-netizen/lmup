<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/ui/Button.svelte';
  import {
    chooseBackupFolder,
    copyToFolderNow,
    disableFolderBackup,
    folderBackupStatus,
    reauthorizeBackupFolder,
    FOLDER_BACKUP_EVENT,
    FOLDER_BACKUP_FILE,
    type FolderStatus,
  } from '$services/folderBackup';

  let status = $state<FolderStatus>();
  let busy = $state(false),
    error = $state(''),
    notice = $state('');
  const refresh = async () => (status = await folderBackupStatus());
  onMount(() => {
    void refresh();
    const sync = () => void refresh();
    window.addEventListener(FOLDER_BACKUP_EVENT, sync);
    return () => window.removeEventListener(FOLDER_BACKUP_EVENT, sync);
  });
  const date = (value: string) =>
    new Date(value).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

  async function run(action: () => Promise<unknown>, done: string) {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      await action();
      notice = done;
    } catch (cause) {
      // Closing the folder picker is a choice, not an error.
      if (cause instanceof DOMException && cause.name === 'AbortError') return;
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível copiar para a pasta. Seus dados continuam aqui.';
    } finally {
      busy = false;
      await refresh();
    }
  }
</script>

<section class="folder-backup" aria-labelledby="folder-backup-title">
  <h3 id="folder-backup-title">Cópia automática em pasta</h3>
  {#if !status}<p class="lmu-hint">Verificando…</p>
  {:else if status.state === 'unsupported'}<p class="lmu-hint">
      Este navegador não permite gravar numa pasta. No Chrome ou no Edge do
      computador, você pode escolher uma pasta para receber a cópia sozinha.
    </p>
  {:else if status.state === 'off'}
    <p class="lmu-hint">
      Escolha uma pasta (por exemplo, uma sincronizada com a nuvem). O app grava
      <code>{FOLDER_BACKUP_FILE}</code> nela e o substitui a cada nova cópia, sem
      acumular arquivos.
    </p>
    <Button
      variant="secondary"
      loading={busy}
      onclick={() =>
        run(chooseBackupFolder, 'Pasta escolhida e primeira cópia gravada.')}
      >Escolher pasta</Button
    >
  {:else}
    <p>
      Pasta: <strong>{status.folder}</strong>{status.lastAt
        ? ` · última cópia em ${date(status.lastAt)}`
        : ''}
    </p>
    {#if status.state === 'needs-permission'}<p
        class="journey-banner"
        role="status"
      >
        O navegador pediu nova autorização para a pasta. Até lá, nenhuma cópia
        automática é gravada.
      </p>{:else}<p class="lmu-hint">
        Com o app aberto, a cópia é atualizada a cada 30 minutos no máximo e ao
        sair da tela.
      </p>{/if}
    <div class="journey-actions">
      {#if status.state === 'needs-permission'}<Button
          variant="secondary"
          loading={busy}
          onclick={() =>
            run(reauthorizeBackupFolder, 'Pasta autorizada e cópia gravada.')}
          >Reautorizar pasta</Button
        >{:else}<Button
          variant="secondary"
          loading={busy}
          onclick={() => run(copyToFolderNow, 'Cópia gravada na pasta.')}
          >Copiar agora</Button
        >{/if}
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() =>
          run(
            disableFolderBackup,
            'Cópia automática desligada. O arquivo que já está na pasta foi mantido.',
          )}>Desligar</Button
      >
    </div>
  {/if}
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  {#if notice}<p class="lmu-hint" role="status">{notice}</p>{/if}
</section>

<style>
  .folder-backup {
    display: grid;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--lmu-line, #35494f);
  }
  .folder-backup h3 {
    margin: 0;
  }
  .folder-backup p {
    margin: 0;
  }
</style>
