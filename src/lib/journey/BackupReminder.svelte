<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '$lib/ui/Button.svelte';
  import {
    BACKUP_EXPORT_KEY,
    BACKUP_STARTED_KEY,
    BACKUP_DISMISSED_KEY,
    BACKUP_REMINDER_EVENT,
    backupReminderDue,
    dismissBackupReminder,
    readBackupReminder,
    startBackupReminder,
    type BackupReminderState,
  } from '$services/backupReminder';

  let {
    hasContent,
    onexport,
    busy = false,
  }: {
    hasContent: boolean;
    onexport?: () => void;
    busy?: boolean;
  } = $props();
  let mounted = $state(false);
  let transientDismissal: string | null = null;
  let transientExport: string | null = null;
  let now = $state(Date.now());
  let reminder = $state<BackupReminderState>({
    lastExportAt: null,
    firstDataAt: null,
    dismissedAt: null,
  });
  const due = $derived(mounted && backupReminderDue(hasContent, reminder, now));

  $effect(() => {
    if (mounted) {
      const next = startBackupReminder(reminder, hasContent, now);
      if (next !== reminder) reminder = next;
    }
  });
  onMount(() => {
    const refresh = () => {
      now = Date.now();
      reminder = readBackupReminder();
      if (transientDismissal)
        reminder = { ...reminder, dismissedAt: transientDismissal };
      if (transientExport)
        reminder = { ...reminder, lastExportAt: transientExport };
    };
    const exported = (event: Event) => {
      refresh();
      if (event instanceof CustomEvent && typeof event.detail === 'string') {
        transientExport = event.detail;
        reminder = { ...reminder, lastExportAt: event.detail };
      }
    };
    refresh();
    mounted = true;
    const storage = (event: StorageEvent) => {
      if (
        event.key === null ||
        [BACKUP_EXPORT_KEY, BACKUP_STARTED_KEY, BACKUP_DISMISSED_KEY].includes(
          event.key,
        )
      ) {
        transientDismissal = null;
        transientExport = null;
        refresh();
      }
    };
    const tick = () => {
      now = Date.now();
    };
    const timer = setInterval(tick, 60_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', storage);
    window.addEventListener(BACKUP_REMINDER_EVENT, exported);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', storage);
      window.removeEventListener(BACKUP_REMINDER_EVENT, exported);
    };
  });
</script>

{#if due}
  <aside class="backup-reminder" aria-label="Lembrete de backup">
    <div>
      <strong>Guarde uma cópia da sua jornada</strong>
      <p>Exporte um backup e guarde o arquivo fora deste navegador.</p>
    </div>
    <div class="backup-reminder-actions">
      {#if onexport}
        <Button variant="secondary" disabled={busy} onclick={onexport}
          >Exportar backup</Button
        >
      {:else}
        <a class="journey-link" href="/config#backup">Fazer backup</a>
      {/if}
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          now = Date.now();
          reminder = dismissBackupReminder(reminder, now);
          transientDismissal = reminder.dismissedAt;
        }}>Lembrar em 14 dias</Button
      >
    </div>
  </aside>
{/if}

<style>
  .backup-reminder {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: 1px solid #526b80;
    border-radius: 0.5rem;
    background: #10202b;
    color: #e0eaf2;
  }
  p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
  }
  .backup-reminder-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
