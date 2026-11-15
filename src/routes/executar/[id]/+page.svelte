<script lang="ts">
  import { page } from '$app/state';
  import ExecutionScreen from '$lib/journey/ExecutionScreen.svelte';
  const kind = $derived.by(() => {
    const value = page.url.searchParams.get('fila');
    return value === 'dia' || value === 'bloco' ? value : undefined;
  });
</script>

{#key `${page.params.id}:${kind ?? ''}`}<ExecutionScreen
    id={page.params.id!}
    {kind}
  />{/key}
