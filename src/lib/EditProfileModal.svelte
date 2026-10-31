<script lang="ts">
  import { untrack, onDestroy } from 'svelte';
  import type { Profile } from '$services/db';
  import { saveProfileIdentity } from '$services/profileIdentityService';
  import { storageError } from '$services/storageErrors';
  import { guardUpdates } from '$lib/journey/guardUpdates';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Button from '$lib/ui/Button.svelte';
  let { profile, close } = $props<{ profile: Profile; close: () => void }>();
  // A draft snapshots identity once. Live profile changes must not overwrite typing.
  const original = untrack(() => ({
    name: profile.name,
    avatarUrl: profile.avatarUrl ?? '',
  }));
  let name = $state(original.name),
    avatarUrl = $state(original.avatarUrl);
  let open = $state(true),
    saving = $state(false),
    uploading = $state(false),
    error = $state('');
  let reader: FileReader | undefined;
  guardUpdates(() => true);
  $effect(() => {
    if (!open) close();
  });
  onDestroy(() => {
    if (reader?.readyState === FileReader.LOADING) reader.abort();
  });
  function upload(event: Event) {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    if (!file) return;
    error = '';
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      error = 'Use uma imagem PNG, JPEG ou WebP de até 2 MB.';
      input.value = '';
      return;
    }
    uploading = true;
    reader = new FileReader();
    reader.onload = () => {
      avatarUrl = String(reader?.result ?? '');
    };
    reader.onerror = () => {
      error = 'Não foi possível ler a imagem. Escolha o arquivo novamente.';
    };
    reader.onloadend = () => {
      uploading = false;
    };
    reader.readAsDataURL(file);
  }
  async function save(event: SubmitEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    saving = true;
    error = '';
    try {
      await saveProfileIdentity({ name, avatarUrl }, original);
      open = false;
    } catch (cause) {
      error = storageError(
        cause,
        'Não foi possível salvar. Seu rascunho continua aqui.',
        true,
      );
    } finally {
      saving = false;
    }
  }
</script>

<Dialog
  bind:open
  title="Editar perfil"
  description="Seu nome e sua imagem acompanham a jornada neste navegador."
  dismissible={!saving}
>
  <form class="journey-stack profile-identity" onsubmit={save} novalidate>
    <Field
      label="Nome do herói"
      bind:value={name}
      data-initial-focus
      required
      maxlength={80}
      disabled={saving}
    />
    <label class="journey-label"
      >Avatar (opcional)<input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onchange={upload}
        disabled={saving || uploading}
      /></label
    >
    <p class="lmu-hint">
      PNG, JPEG ou WebP, até 2 MB. O avatar fica nos seus dados locais e nos
      backups exportados.
    </p>
    {#if uploading}<p role="status">Lendo sua imagem…</p>{/if}
    {#if avatarUrl}<img
        src={avatarUrl}
        alt="Prévia do seu avatar"
        width="80"
        height="80"
        style="border-radius:50%;object-fit:cover"
      /><Button
        variant="quiet"
        disabled={saving || uploading}
        onclick={() => {
          avatarUrl = '';
        }}>Remover avatar</Button
      >{/if}
    {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
    <footer>
      <Button
        variant="quiet"
        disabled={saving}
        onclick={() => {
          open = false;
        }}>Cancelar</Button
      ><Button type="submit" loading={saving} disabled={uploading}
        >Salvar perfil</Button
      >
    </footer>
  </form>
</Dialog>

<style>
  .profile-identity {
    min-width: 0;
  }
  .profile-identity input[type='file'] {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
</style>
