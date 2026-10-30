<script lang="ts">
  import { companionArtwork } from './companionArtwork';
  import { onMount } from 'svelte';
  import { refugeQuery, type RefugeSnapshot } from '$services/refugeQuery';
  import {
    getEcoStageForTotalXp,
    getNextEcoStage,
    getEcoProgressForTotalXp,
    getEcoStageById,
    type EcoStageId,
  } from '$services/ecoConfig';
  import { sanctuaryContent } from '$lib/content/world';
  import {
    identity,
    destinations,
    refugeCopy,
    milestoneRewardCopy,
  } from '$lib/content/experience';
  import { companionBonusLabel } from '$services/companionService';
  import { slotLabels } from '$services/collectionRules';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { guardUpdates } from './guardUpdates';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Card from '$lib/ui/Card.svelte';
  import CollectionNav from './CollectionNav.svelte';
  let data = $state<RefugeSnapshot>();
  let error = $state('');
  onMount(() => {
    const sub = refugeQuery().subscribe({
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
  const nextRow = $derived(
    data?.milestones.find((row) => row.stage.id === next?.id),
  );
  let previewOpen = $state(false),
    previewId = $state<EcoStageId>(1);
  const previewStage = $derived(getEcoStageById(previewId));
  const previewContent = $derived(sanctuaryContent[previewId]);
  guardUpdates(() => previewOpen);
  function showPreview(id: EcoStageId) {
    previewId = id;
    previewOpen = true;
  }
  function dateLabel(value: string) {
    return new Date(value).toLocaleDateString('pt-BR');
  }
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
    <Card class="refuge-next"
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
          ? 'Bônus de XP do próximo ambiente: +' +
            Math.round((next.xpBonusMultiplier - 1) * 100) +
            '%.'
          : 'Seu progresso continua contando em missões e conquistas.'}
      </p>
      <p class="lmu-hint">
        {next
          ? nextRow?.inconsistent
            ? 'Há uma diferença entre o recibo e a marcação de prêmio. Confira seus registros antes de continuar.'
            : nextRow?.markedReceived
              ? 'O prêmio deste marco já consta como recebido. Alcançá-lo novamente não gera outro Gold.'
              : nextRow?.rewardStatus === 'reversed'
                ? 'O prêmio anterior foi estornado. Ao alcançar o marco em uma nova ação válida, o cálculo pode registrá-lo novamente.'
                : 'Este marco prevê ' +
                  next.goldRewardOnEnter +
                  ' Gold. A recompensa é registrada na ação que alcançar o marco; abrir a paisagem não concede Gold.'
          : 'Você já conhece todas as paisagens desta versão.'}
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
          data.equipped.find((row) => row.item.slot === slot)}<a
          href="/inventario"
          ><span class="lmu-hint">{label}</span><strong
            >{equipped ? equipped.item.name : 'Espaço livre'}</strong
          ></a
        >{/each}
    </div>
  </section>
  <section class="refuge-bonuses" aria-labelledby="refuge-bonus-title">
    <Card
      ><h2 id="refuge-bonus-title">Bônus de XP do ambiente</h2>
      <p class="refuge-bonus-summary">
        +{Math.round((stage.xpBonusMultiplier - 1) * 100)}% XP do ambiente
      </p>
      <p class="lmu-hint">
        {data.mods.sanctuaryBonusExtraPercent
          ? 'Seu anel acrescenta ' +
            data.mods.sanctuaryBonusExtraPercent +
            (data.mods.sanctuaryBonusExtraPercent === 1
              ? ' ponto percentual'
              : ' pontos percentuais') +
            ' ao bônus do ambiente.'
          : 'Sem bônus extra de anel equipado.'}
      </p>
      <p class="lmu-hint">
        A missão também pode considerar companhia e outros equipamentos. Confira
        a simulação completa no seu perfil.
      </p>
      <a class="journey-link" href="/perfil">Ver bônus no perfil →</a></Card
    >
  </section>
  <section id="marcos" class="journey-stack">
    <div>
      <p class="lmu-eyebrow">Memória do seu caminho</p>
      <h2>Transformações do ambiente</h2>
      <p class="lmu-muted">
        A paisagem acompanha o XP atual. Os registros mostram quais recompensas
        continuam ativas, foram estornadas ou vieram de dados anteriores.
      </p>
    </div>
    <div class="collection-milestones">
      {#each data.milestones as row (row.stage.id)}<Card
          class="refuge-milestone"
        >
          <div class="refuge-stage-thumbnail lmu-decorative" aria-hidden="true">
            <Artwork
              src={sanctuaryContent[row.stage.id].pilot}
              alt=""
              sizes="(max-width:600px) 100vw, 240px"
            />
          </div>
          <span class="collection-stage-number">0{row.stage.id}</span>
          <h3>{row.stage.label}</h3>
          <p
            class="refuge-milestone-status"
            data-reward-status={row.rewardStatus}
          >
            {milestoneRewardCopy[row.rewardStatus].label}
          </p>
          <p class="lmu-muted">
            {row.reached
              ? 'Este ambiente está alcançado pelo seu XP atual.'
              : row.stage.minXp -
                data.profile.totalXpEarned +
                ' XP até alcançar esta paisagem.'}
          </p>
          <details>
            <summary>Entender este marco</summary>
            <p class="lmu-hint">
              {milestoneRewardCopy[row.rewardStatus].description}
            </p>
          </details>
          {#if row.stage.id > 1}<p class="lmu-hint">
              Regra atual do marco: {row.stage.minXp} XP · {row.stage
                .goldRewardOnEnter} Gold.
            </p>{/if}
          {#if row.inconsistent}<p class="journey-error">
              O recibo e a marcação de prêmio não coincidem. Confira o histórico
              e preserve um backup antes de continuar.
            </p>{/if}
          {#if row.source}<p class="lmu-hint">
              {row.source.reversedAt
                ? 'O recibo de origem foi estornado.'
                : 'Recibo de origem preservado.'}
            </p>
            <details>
              <summary>Ver registro deste marco</summary>
              <p class="lmu-hint">
                Ação de origem em {dateLabel(row.source.occurredAt)}.
              </p>
              <p>
                Recompensa total da ação: +{row.source.reward.xp} XP · +{row
                  .source.reward.gold} Gold · +{row.source.reward.food} Comida.
              </p>
              <p class="lmu-hint">
                O total pode incluir outros ganhos da ação, além do marco.
              </p>
              {#if row.source.reversedAt}<p class="lmu-hint">
                  Estornado em {dateLabel(row.source.reversedAt)}.
                </p>{/if}<a href="/progresso" class="journey-link"
                >Abrir histórico →</a
              >
            </details>{/if}
          <Button
            variant="secondary"
            onclick={() => showPreview(row.stage.id)}
            aria-label={'Ver paisagem de ' + row.stage.label}
            >Ver paisagem</Button
          >
        </Card>{/each}
    </div>
  </section>
{:else}<p role="status">Abrindo seu refúgio…</p>{/if}

<Dialog
  bind:open={previewOpen}
  title={'Prévia: ' + previewContent.label}
  description="Uma paisagem da sua jornada."
>
  {#if previewOpen}<p class="lmu-hint" tabindex="-1" data-initial-focus>
      Prévia visual. Não altera o ambiente ativo, XP ou Gold.
    </p>
    <div class="refuge-preview-art">
      <Artwork
        src={previewContent.pilot}
        alt={'Prévia da paisagem ' + previewContent.label}
        sizes="(max-width:760px) 100vw, 900px"
        eager
      />
    </div>
    <p>{previewContent.description}</p>
    <p class="lmu-hint">
      {previewStage.minXp} XP · +{Math.round(
        (previewStage.xpBonusMultiplier - 1) * 100,
      )}% XP do ambiente.
    </p>
    <footer>
      <Button
        onclick={() => {
          previewOpen = false;
        }}>Fechar prévia</Button
      >
    </footer>{/if}
</Dialog>
