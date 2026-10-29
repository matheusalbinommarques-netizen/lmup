<script lang="ts">
  import Execution from '$lib/journey/Execution.svelte';
  let { data }: { data: { id: number } } = $props();
</script>

{#key data.id}<Execution id={data.id} />{/key}
