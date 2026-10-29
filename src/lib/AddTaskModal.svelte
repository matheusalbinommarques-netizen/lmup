<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import type { Task } from '$services/db';
  import QuickCreate from '$lib/journey/QuickCreate.svelte';
  let {
    close,
    taskToEdit = null,
  }: { close: () => void; taskToEdit?: Task | null } = $props();
  let snapshot = $state<JourneySnapshot>();
  let open = $state(true);
  let error = $state('');
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        snapshot = value;
      },
      error: () => {
        error =
          'Não foi possível abrir o formulário. Seus dados continuam guardados.';
      },
    });
    return () => sub.unsubscribe();
  });
  $effect(() => {
    if (snapshot && !open) close();
  });
</script>

{#if error}<p role="alert">{error}</p>
  <button onclick={close}>Fechar</button>{:else if snapshot}<QuickCreate
    bind:open
    {snapshot}
    editTask={taskToEdit ?? undefined}
  />{:else}<p role="status">Abrindo formulário…</p>{/if}
