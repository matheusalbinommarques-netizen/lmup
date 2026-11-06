<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import RarityTag from './RarityTag.svelte';
  const SHOWN = 6;
  let data = $state<JourneySnapshot>(),
    error = $state('');
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
  const stats = $derived(data?.profile ? data.achievementStats : null);
  const current = ALL_ACHIEVEMENTS.filter((item) => !item.future);
  // Mesma regra da tela de Conquistas: recibo válido, ou critério atendido sem recibo.
  function earnedAt(id: string) {
    const receipt = data?.achievementReceipts.find((row) => row.id === id);
    if (receipt) return receipt.invalidatedAt ? null : receipt.earnedAt;
    return stats && current.find((item) => item.id === id)?.condition(stats)
      ? ''
      : null;
  }
  const earned = $derived(
    stats
      ? current
          .map((item) => ({ item, at: earnedAt(item.id) }))
          .filter(
            (row): row is { item: (typeof current)[number]; at: string } =>
              row.at !== null,
          )
          .sort((a, b) => b.at.localeCompare(a.at))
      : [],
  );
</script>

<section aria-labelledby="profile-achievements" class="achievements">
  <div class="head">
    <div>
      <p class="lmu-eyebrow">Marcos do caminho</p>
      <h2 id="profile-achievements">Conquistas</h2>
    </div>
    {#if stats}<p class="count">
        <strong>{earned.length}</strong> de {current.length} desbloqueadas
      </p>{/if}
    <a class="lmu-button lmu-button--secondary" href="/trofeus"
      >Ver todas as conquistas <Icon name="arrow" size={18} /></a
    >
  </div>
  {#if error}<p role="alert" class="journey-error">
      {error}
    </p>{:else if !stats}<p role="status" class="lmu-muted">
      Abrindo conquistas…
    </p>{:else if earned.length}<ul class="emblems">
      {#each earned.slice(0, SHOWN) as { item } (item.id)}<li>
          <span class="medal"
            ><Artwork src={item.icon} sizes="72px" alt="" /></span
          >
          <div>
            <h3>{item.title}</h3>
            <p class="lmu-hint">{item.description}</p>
            <p class="rarity"><RarityTag rarity={item.rarity} /></p>
          </div>
        </li>{/each}
    </ul>
    {#if earned.length > SHOWN}<p class="lmu-hint more">
        E mais {earned.length - SHOWN} na lista completa.
      </p>{/if}{:else}<p class="lmu-muted empty">
      Suas conquistas aparecem aqui conforme você avança, no seu ritmo.
    </p>{/if}
</section>

<style>
  .achievements {
    display: grid;
    gap: 1rem;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
  }
  .head h2 {
    font: 500 1.9rem/1.1 var(--lmu-display);
    margin: 0;
  }
  .count {
    margin: 0 auto 0 0;
    color: var(--lmu-muted);
  }
  .count strong {
    color: var(--rpg-gold, #edc477);
    font: 600 1.5rem var(--lmu-font, system-ui);
    font-variant-numeric: lining-nums;
  }
  .emblems {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem 1.5rem;
  }
  .emblems li {
    display: flex;
    gap: 0.9rem;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--lmu-line);
    border-radius: 0.6rem;
    background: #061115a6;
  }
  .medal {
    flex: none;
    width: 4.9rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
  }
  .medal :global(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  h3 {
    margin: 0;
    font: 500 1.35rem/1.2 var(--lmu-display);
  }
  .emblems p {
    margin: 0.2rem 0 0;
    font-size: 1.02rem;
  }
  .head :global(a.lmu-button) {
    min-height: 3.25rem;
    font-size: 1.05rem;
  }
  .count {
    font-size: 1.1rem;
  }
  .emblems .rarity {
    margin-top: 0.4rem;
  }
  .more,
  .empty {
    margin: 0;
  }
  @media (max-width: 1100px) {
    .emblems {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .emblems {
      grid-template-columns: 1fr;
    }
    .count {
      margin: 0;
    }
  }
</style>
