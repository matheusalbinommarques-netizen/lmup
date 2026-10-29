<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { collectionStats } from '$services/collectionRules';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  import CollectionNav from './CollectionNav.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    search = $state(''),
    filter = $state<'next' | 'earned' | 'future'>('next');
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível abrir as conquistas.';
      },
    });
    return () => sub.unsubscribe();
  });
  const stats = $derived(
    data?.profile
      ? collectionStats(data.profile, data.tasks, data.companions, data.owned)
      : null,
  );
  const earned = $derived(
    stats
      ? ALL_ACHIEVEMENTS.filter((item) => !item.future && item.condition(stats))
      : [],
  );
  const rows = $derived(
    ALL_ACHIEVEMENTS.filter(
      (item) =>
        (filter === 'future'
          ? item.future
          : !item.future &&
            (filter === 'earned'
              ? !!stats && item.condition(stats)
              : !stats || !item.condition(stats))) &&
        (item.title + ' ' + item.description)
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR')),
    ),
  );
</script>

<svelte:head><title>Conquistas · Level Me Up</title></svelte:head>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">Reconheça o caminho</p>
    <h1>Conquistas</h1>
    <p>Pequenas e grandes realizações, com critérios à vista.</p>
  </div>
  <p class="collection-balance">
    {earned.length} de {ALL_ACHIEVEMENTS.filter((item) => !item.future).length} conquistas
    atuais
  </p>
</header>
<CollectionNav />
<p class="journey-banner">
  Conquistas acompanham seus dados atuais. Desfazer missões ou gastar um saldo
  pode alterar os critérios atendidos. Metas de versões futuras ficam em uma
  seleção separada.
</p>
{#if error}<p role="alert">{error}</p>{:else if !stats}<p role="status">
    Abrindo conquistas…
  </p>{:else}
  <div class="journey-filters" aria-label="Filtrar conquistas">
    <Button
      variant="secondary"
      aria-pressed={filter === 'next'}
      onclick={() => {
        filter = 'next';
      }}>Próximas</Button
    ><Button
      variant="secondary"
      aria-pressed={filter === 'earned'}
      onclick={() => {
        filter = 'earned';
      }}>Conquistadas · {earned.length}</Button
    ><Button
      variant="secondary"
      aria-pressed={filter === 'future'}
      onclick={() => {
        filter = 'future';
      }}>Futuras</Button
    >
  </div>
  <Field label="Buscar conquista" type="search" bind:value={search} />
  <div class="collection-grid collection-achievements">
    {#each rows as item (item.id)}<Card
        ><Artwork src={item.icon} alt="" />
        <div class="journey-stack">
          <p class="lmu-eyebrow">
            {item.future
              ? 'Versão futura'
              : filter === 'earned'
                ? 'Conquistada'
                : 'Um próximo objetivo'}
          </p>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <p class="lmu-hint">
            {item.rarity}{#if item.future}
              · este critério ainda não participa da coleção atual{/if}
          </p>
        </div></Card
      >{/each}
  </div>
  {#if !rows.length}<Card
      ><h2>
        {filter === 'next'
          ? 'Todos os critérios desta seleção foram alcançados.'
          : 'Nenhuma conquista nesta seleção.'}
      </h2>
      <p class="lmu-muted">Experimente outra busca ou seleção.</p></Card
    >{/if}{/if}
