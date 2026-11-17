<script lang="ts">
  import { page } from '$app/state';
  import ExecutionScreen from '$lib/journey/ExecutionScreen.svelte';
  const kind = $derived.by(() => {
    const value = page.url.searchParams.get('fila');
    return value === 'dia' || value === 'bloco' || value === 'selecao'
      ? value
      : undefined;
  });
  const ids = $derived(
    (page.url.searchParams.get('ids') ?? '')
      .split(',')
      .filter(Boolean)
      .map((value) => decodeURIComponent(value)),
  );
</script>

{#key `${page.params.id}:${kind ?? ''}`}<ExecutionScreen
    id={page.params.id!}
    {kind}
    {ids}
  />{/key}
