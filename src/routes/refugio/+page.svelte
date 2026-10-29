<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';
  import { sanctuaryContent } from '$lib/content/world';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Card from '$lib/ui/Card.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  onMount(() => {
    const subscription = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error =
          'Não foi possível abrir seu refúgio. Seus dados continuam guardados.';
      },
    });
    return () => subscription.unsubscribe();
  });
  const stage = $derived(
    getEcoStageForTotalXp(data?.profile?.totalXpEarned ?? 0).id,
  );
  const links = [
    { href: '/santuario', label: 'Natureza e seus marcos' },
    { href: '/bestiario', label: 'Companheiros e evolução' },
    { href: '/inventario', label: 'Inventário' },
    { href: '/loja', label: 'Loja e equipamentos' },
    { href: '/trofeus', label: 'Conquistas' },
    { href: '/perfil', label: 'Perfil e progresso' },
  ];
</script>

<svelte:head><title>Refúgio · Level Me Up</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">O que sua jornada construiu</p>
    <h1>Refúgio</h1>
    <p>Seu progresso ganha uma paisagem.</p>
  </div>
</header>
{#if error}<p role="alert">{error}</p>{:else if data}<Card class="journey-world"
    ><Artwork
      src={sanctuaryContent[stage].pilot}
      alt={`Seu ambiente: ${sanctuaryContent[stage].label}`}
      sizes="(max-width: 760px) 100vw, 1100px"
      eager
    />
    <div class="journey-world-copy">
      <h2>{sanctuaryContent[stage].label}</h2>
      <p class="lmu-muted">{sanctuaryContent[stage].description}</p>
      <p>
        {data.profile?.totalXpEarned ?? 0} XP · {data.profile?.gold ?? 0} Gold ·
        {data.profile?.food ?? 0} Comida
      </p>
      {#if data.companion}<p>Seu companheiro: {data.companion.name}</p>{/if}
    </div></Card
  >
  <div class="journey-hub-links">
    {#each links as link (link.href)}<a href={link.href}>{link.label}</a>{/each}
  </div>{:else}<p role="status">Abrindo seu refúgio…</p>{/if}
