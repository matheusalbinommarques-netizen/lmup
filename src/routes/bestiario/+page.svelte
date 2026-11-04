<script lang="ts">
  import CampCinematic from '$lib/camp/cinematic/CampCinematic.svelte';
  import { CAMP_PREVIEW } from '$lib/camp/cinematic/previewMode';
  import Companions from '$lib/journey/Companions.svelte';
</script>

{#if CAMP_PREVIEW}<CampCinematic initialScene="bestiary" />{:else}
  <Companions />
{/if}
