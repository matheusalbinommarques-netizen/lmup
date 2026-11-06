<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  // A antiga visão geral do Refúgio foi retirada; links e favoritos antigos seguem para o Acampamento.
  onMount(() => {
    void goto('/refugio/acampamento', { replaceState: true });
  });
</script>

<svelte:head><title>Acampamento · Level Me Up</title></svelte:head>
<p class="lmu-muted">
  Abrindo o <a href="/refugio/acampamento">Acampamento</a>…
</p>
