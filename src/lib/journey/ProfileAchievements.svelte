<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  const SHOWN = 4;
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

<section aria-labelledby="profile-achievements" class="profile-achievements">
  <div class="journey-section-heading">
    <div>
      <p class="lmu-eyebrow">Reconheça o caminho</p>
      <h2 id="profile-achievements">Conquistas</h2>
    </div>
    <a class="lmu-button lmu-button--secondary" href="/trofeus"
      >Ver todas as conquistas <Icon name="arrow" size={18} /></a
    >
  </div>
  {#if error}<p role="alert" class="journey-error">
      {error}
    </p>{:else if !stats}<p role="status" class="lmu-muted">
      Abrindo conquistas…
    </p>{:else}<p class="lmu-muted">
      {earned.length} de {current.length} conquistas atuais.
    </p>
    {#if earned.length}<ul class="profile-achievement-list">
        {#each earned.slice(0, SHOWN) as { item } (item.id)}<li>
            <Artwork src={item.icon} sizes="56px" alt="" />
            <div>
              <h3>{item.title}</h3>
              <p class="lmu-hint">{item.description}</p>
            </div>
          </li>{/each}
      </ul>
      {#if earned.length > SHOWN}<p class="lmu-hint">
          E mais {earned.length - SHOWN} na lista completa.
        </p>{/if}{:else}<p class="lmu-muted">
        Nenhuma conquista ainda. Elas aparecem aqui conforme você avança.
      </p>{/if}{/if}
</section>
