<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    void goto('/missoes' + window.location.search, { replaceState: true });
  });
</script>

<svelte:head><title>Missões · Level Me Up</title></svelte:head>
<p>Suas missões estão na Lista de Missões.</p>
<a class="lmu-button lmu-button--secondary" href="/missoes">Abrir missões</a>
