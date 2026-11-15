<script lang="ts">
  import { page } from '$app/state';
  import OccurrenceExecution from '$lib/journey/OccurrenceExecution.svelte';
</script>

<svelte:head><title>Registro da ocorrência · Level Me Up</title></svelte:head>
<a class="journey-link" href="/">← Dia</a>
{#key page.params.id}<OccurrenceExecution id={page.params.id!} />{/key}
