<script lang="ts">
  import { page } from '$app/state';
  import OccurrenceExecution from '$lib/journey/OccurrenceExecution.svelte';
</script>

<svelte:head><title>Executar ocorrência · Level Me Up</title></svelte:head>
<a class="journey-link" href="/missoes">← Voltar às missões</a>
{#key page.params.id}<OccurrenceExecution id={page.params.id!} />{/key}
