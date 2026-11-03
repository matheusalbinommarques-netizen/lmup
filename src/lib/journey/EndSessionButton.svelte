<script lang="ts">
  import type { SavedMissionSession } from '$services/productivityTypes';
  import { endSession } from '$services/savedSessionService';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    session,
    disabled = false,
    onended,
    onbusy,
  }: {
    session: SavedMissionSession;
    disabled?: boolean;
    onended?: () => unknown;
    onbusy?: (busy: boolean) => void;
  } = $props();
  let busy = $state(false),
    error = $state('');
  guardUpdates(() => busy);
  async function finish() {
    if (busy || disabled) return;
    busy = true;
    onbusy?.(true);
    error = '';
    try {
      await endSession(session.id, session.revision);
      await onended?.();
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível encerrar a sessão.';
    } finally {
      busy = false;
      onbusy?.(false);
    }
  }
</script>

<div class="end-session-action">
  <Button variant="secondary" {disabled} loading={busy} onclick={finish}
    >Encerrar sessão</Button
  >
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
</div>

<style>
  .end-session-action {
    display: grid;
    gap: 6px;
  }
  p {
    margin: 0;
    max-width: 32ch;
  }
</style>
