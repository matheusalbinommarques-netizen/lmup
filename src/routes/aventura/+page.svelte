<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Preserve old bookmarks and offline links; the experimental pilot is retired.
  // The world state and historical rpgPilot profile data are not modified here.
  const destination = $derived(
    page.url.searchParams.get('campanha') === 'ermos'
      ? '/mundo/campanha'
      : '/mundo',
  );
  onMount(() => {
    void goto(destination, { replaceState: true });
  });
</script>

<svelte:head><title>Mundo · Level Me Up</title></svelte:head>
<p class="lmu-muted">Abrindo o <a href={destination}>Mundo</a>…</p>
