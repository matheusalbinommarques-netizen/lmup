<script lang="ts">
  import ProjectDetail from '$lib/journey/ProjectDetail.svelte';
  let { data }: { data: { projectId: number | null } } = $props();
</script>

{#key data.projectId}<ProjectDetail id={data.projectId} />{/key}
