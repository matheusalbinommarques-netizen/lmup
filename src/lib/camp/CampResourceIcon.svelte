<script lang="ts">
  import type { CampResource } from './campWorkshop';
  import CampGameIcon from './CampGameIcon.svelte';
  let { resource }: { resource: CampResource } = $props();
</script>

<CampGameIcon kind={resource} size={28} />
