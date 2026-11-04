<script lang="ts">
  import CampCinematic from '$lib/camp/cinematic/CampCinematic.svelte';
  import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';
  import Refuge from '$lib/journey/Refuge.svelte';
</script>

{#if CAMP_PREVIEW}<CampCinematic initialScene="center" />{:else}
  <Refuge />
{/if}
