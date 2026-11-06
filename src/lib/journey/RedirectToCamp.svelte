<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  // Endereços antigos (Refúgio, Santuário) seguem para o Acampamento.
  onMount(() => {
    void goto('/acampamento', { replaceState: true });
  });
</script>

<svelte:head><title>Acampamento · Level Me Up</title></svelte:head>
<p class="lmu-muted">Abrindo o <a href="/acampamento">Acampamento</a>…</p>
