<script lang="ts">
  import { companionArtwork } from './companionArtwork';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import {
    getEcoStageForTotalXp,
    getNextEcoStage,
    getEcoProgressForTotalXp,
  } from '$services/ecoConfig';
  import { sanctuaryContent } from '$lib/content/world';
  import { identity, destinations, refugeCopy } from '$lib/content/experience';
  import { companionBonusLabel } from '$services/companionService';
  import { discoveryRows, slotLabels } from '$services/collectionRules';
  import { getShopItemById } from '$lib/shop/types';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Card from '$lib/ui/Card.svelte';
  import CollectionNav from './CollectionNav.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error =
          'Não foi possível abrir seu refúgio. Seus dados continuam guardados.';
      },
    });
    return () => sub.unsubscribe();
  });
  const stage = $derived(
    getEcoStageForTotalXp(data?.profile?.totalXpEarned ?? 0),
  );
  const next = $derived(getNextEcoStage(stage.id));
  const content = $derived(sanctuaryContent[stage.id]);
</script>

<svelte:head><title>{destinations.world} · {identity.name}</title></svelte:head>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">{refugeCopy.eyebrow}</p>
    <h1>{destinations.world}</h1>
    <p>{refugeCopy.description}</p>
  </div>
</header>
<CollectionNav />
{#if error}<p role="alert">{error}</p>{:else if data?.profile}
  <section class="collection-scene" aria-label="Seu ambiente">
    <Artwork
      src={content.pilot}
      alt={'Seu ambiente: ' + content.label}
      sizes="(max-width: 760px) 100vw, 1100px"
      eager
    />
    <div class="collection-scene-copy">
      <p class="lmu-eyebrow">Seu ambiente · etapa {stage.id} de 4</p>
      <h2>{content.label}</h2>
      <p>{content.description}</p>
    </div>
  </section>
  <div class="collection-summary" aria-label="Seus recursos">
    <span><strong>{data.profile.totalXpEarned}</strong> XP acumulado</span><span
      ><strong>{data.profile.gold}</strong> Gold disponível</span
    ><span><strong>{data.profile.food ?? 0}</strong> Comida disponível</span>
  </div>
  <div class="collection-overview">
    <Card class="collection-companion-feature"
      ><div>
        <p class="lmu-eyebrow">Sua companhia</p>
        <h2>{data.companion?.name ?? 'Escolha um companheiro'}</h2>
        <p class="lmu-muted">
          {data.companion
            ? data.buffs
              ? companionBonusLabel(data.companion)
              : 'Bônus inativo neste nível. Escolha um companheiro disponível.'
            : 'Você não precisa cuidar de tudo sozinho.'}
        </p>
        <p class="lmu-hint">
          Cuidado é opcional. Não há fome, perda de evolução ou punição por
          ficar longe.
        </p>
        <a class="lmu-button lmu-button--primary" href="/bestiario"
          >Cuidar dos companheiros</a
        >
      </div>
      {#if data.companion}<Artwork
          src={companionArtwork(data.companion)}
          alt={data.companion.name}
        />{/if}</Card
    >
    <Card
      ><p class="lmu-eyebrow">O próximo marco</p>
      <h2>{next ? next.label : 'Uma paisagem inteira'}</h2>
      <p>
        {next
          ? next.minXp -
            data.profile.totalXpEarned +
            ' XP até a próxima transformação.'
          : 'Você alcançou o último ambiente desta versão.'}
      </p>
      <progress
        max="100"
        value={getEcoProgressForTotalXp(data.profile.totalXpEarned)}
        aria-label="Progresso do ambiente"
      ></progress>
      <p class="lmu-hint">
        {next
          ? 'O marco concede ' +
            next.goldRewardOnEnter +
            ' Gold uma vez. Bônus de XP do próximo ambiente: +' +
            Math.round((next.xpBonusMultiplier - 1) * 100) +
            '%.'
          : 'Seu progresso continua contando em missões e conquistas.'}
      </p>
      <a class="journey-link" href="/#journey-main"
        >Escolher meu próximo passo →</a
      ></Card
    >
  </div>
  <section class="journey-stack">
    <div class="journey-section-heading">
      <h2>O que você leva com você</h2>
      <a class="journey-link" href="/inventario">Abrir coleção →</a>
    </div>
    <div class="collection-slots">
      {#each Object.entries(slotLabels) as [slot, label] (slot)}{@const equipped =
          data.owned
            .filter(
              (row) =>
                row.equipped && getShopItemById(row.itemId)?.slot === slot,
            )
            .sort((a, b) => b.itemId - a.itemId)[0]}<a href="/inventario"
          ><span class="lmu-hint">{label}</span><strong
            >{equipped
              ? getShopItemById(equipped.itemId)?.name
              : 'Espaço livre'}</strong
          ></a
        >{/each}
    </div>
  </section>
  <section id="marcos" class="journey-stack">
    <div>
      <p class="lmu-eyebrow">Memória do seu caminho</p>
      <h2>Transformações do ambiente</h2>
      <p class="lmu-muted">
        Cada transformação acompanha seu XP. Se uma conclusão for desfeita, o
        ambiente acompanha o saldo restaurado.
      </p>
    </div>
    <div class="collection-milestones">
      {#each discoveryRows(data.profile, data.events) as row (row.stage.id)}<Card
          ><span class="collection-stage-number">0{row.stage.id}</span>
          <h3>{row.stage.label}</h3>
          <p>
            {row.reached
              ? 'Presente na sua jornada'
              : row.source?.reversedAt
                ? 'Registro estornado'
                : 'Ainda por descobrir'}
          </p>
          <p class="lmu-hint">
            {row.stage.minXp} XP · {row.stage.goldRewardOnEnter} Gold ao alcançar
          </p>
          {#if row.source}<p class="lmu-hint">
              Registrado em {new Date(row.source.occurredAt).toLocaleDateString(
                'pt-BR',
              )}. {row.source.reversedAt
                ? 'O recibo de origem foi estornado.'
                : 'Recibo de origem preservado.'}
            </p>{:else if row.legacy && row.stage.id > 1}<p class="lmu-hint">
              Marco anterior ao histórico detalhado. Nenhum novo prêmio foi
              emitido.
            </p>{/if}</Card
        >{/each}
    </div>
  </section>
{:else}<p role="status">Abrindo seu refúgio…</p>{/if}
