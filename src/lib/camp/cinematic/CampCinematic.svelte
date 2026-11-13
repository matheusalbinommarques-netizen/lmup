<script lang="ts">
  import { CAMP_PREVIEW } from './previewMode';
  import {
    ensureCampSettlement,
    meetCampCaretaker,
    constructCampSettlement,
  } from '$services/campSettlementService';
  import Refuge from '$lib/journey/Refuge.svelte';
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { db, type Profile } from '$services/db';
  import {
    ensureCampPreview,
    meetCaretaker,
    buildResidence,
    resetCampPreview,
    setCampSimulationXp,
    RESIDENCE_PRICE,
  } from '$services/campPreviewService';
  import { getCampTreeXp, type CampPreviewState } from './state';
  import {
    getEcoStageForTotalXp,
    getEcoProgressForTotalXp,
    getNextEcoStage,
    ECO_STAGES,
  } from '$services/ecoConfig';
  import { guardUpdates } from '$lib/journey/guardUpdates';
  import { protectMutation } from '$lib/journey/protectMutation';
  import Collection from '$lib/journey/Collection.svelte';
  import Companions from '$lib/journey/Companions.svelte';
  import Achievements from '$lib/journey/Achievements.svelte';
  import Progress from '$lib/journey/Progress.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import CampBuildings from '../CampBuildings.svelte';
  import SceneViewport from './SceneViewport.svelte';
  import { campScene, resolveCampScene, type CampSceneId } from './scenes';
  let { initialScene = 'center' }: { initialScene?: CampSceneId } = $props();
  let profile = $state<Profile>(),
    loaded = $state(false),
    busy = $state(false),
    open = $state(false),
    panel = $state(''),
    error = $state(''),
    notice = $state(''),
    transformed = $state(false);
  let expected = $state<Pick<CampPreviewState, 'epoch' | 'revision'>>();
  const settlement = $derived(
    CAMP_PREVIEW ? profile?.campPreview : profile?.campSettlement,
  );
  const built = $derived(settlement?.residenceBuilt ?? false);
  const xp = $derived(
    profile
      ? CAMP_PREVIEW
        ? getCampTreeXp(profile)
        : profile.totalXpEarned
      : 0,
  );
  const stage = $derived(getEcoStageForTotalXp(xp));
  const requested = $derived(
    page.url.searchParams.get('scene') ?? initialScene,
  );
  const sceneId = $derived(resolveCampScene(requested, built));
  const scene = $derived(campScene(sceneId, built, xp));
  const next = $derived(getNextEcoStage(stage.id));
  const title = $derived(
    (
      {
        caretaker: built ? 'O caseiro' : 'Construir seu acampamento',
        reset: 'Reiniciar demonstração',
        tree: 'Árvore de Evolução',
        equipment: 'Equipamentos',
        collection: 'Coleção',
        trophies: 'Troféus e conquistas',
        records: 'Registros da jornada',
        companions: 'Companheiros descobertos',
        milestones: 'Registros do ambiente',
      } as Record<string, string>
    )[panel] ?? 'Acampamento',
  );
  const format = (value: number) => value.toLocaleString('pt-BR');
  guardUpdates(() => busy || open || !loaded);
  protectMutation(
    () => busy,
    () => (notice = 'Aguarde a confirmação antes de sair.'),
  );
  onMount(() => {
    const sub = liveQuery(() => db.profile.get(1)).subscribe({
      next: (value) => {
        profile = value;
      },
      error: () => (error = 'Não foi possível ler o acampamento.'),
    });
    let active = true;
    void (CAMP_PREVIEW ? ensureCampPreview() : ensureCampSettlement())
      .then((value) => {
        if (active) {
          profile = value;
          loaded = true;
        }
      })
      .catch((cause) => (error = cause.message));
    const sprites = [
      'tree-seed.png',
      'tree-sapling.png',
      'tree-young.png',
      'tree-ancient.png',
      'center-built.webp',
    ];
    for (const file of sprites) {
      const image = new Image();
      image.src = '/art/camp-modular/' + file;
    }
    return () => {
      active = false;
      sub.unsubscribe();
    };
  });
  async function navigate(id: CampSceneId) {
    if (busy) return;
    open = false;
    error = '';
    notice = '';
    await goto('/acampamento' + (id === 'center' ? '' : '?scene=' + id), {
      keepFocus: true,
      noScroll: true,
    });
  }
  async function interact(id: string) {
    if (busy || !loaded || !settlement) return;
    if (
      ['center', 'interior', 'bestiary', 'garden', 'preparation'].includes(id)
    ) {
      await navigate(id as CampSceneId);
      return;
    }
    error = '';
    if (id === 'caretaker') {
      busy = true;
      try {
        profile = await (CAMP_PREVIEW ? meetCaretaker() : meetCampCaretaker());
      } catch (cause) {
        error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível conversar com o caseiro.';
        return;
      } finally {
        busy = false;
      }
    }
    expected = {
      epoch: (CAMP_PREVIEW ? profile!.campPreview! : profile!.campSettlement!)
        .epoch,
      revision: (CAMP_PREVIEW
        ? profile!.campPreview!
        : profile!.campSettlement!
      ).revision,
    };
    panel = id;
    open = true;
  }
  async function construct() {
    if (busy || !expected) return;
    busy = true;
    error = '';
    try {
      profile = await (CAMP_PREVIEW
        ? buildResidence(expected)
        : constructCampSettlement(expected));
      open = false;
      busy = false;
      await navigate('center');
      transformed = true;
      notice =
        'Aposentos, Bestiário e Jardim estão prontos. Bem-vindo ao seu acampamento.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível construir. Seus dados foram preservados.';
    } finally {
      busy = false;
    }
  }
  async function restart() {
    if (!CAMP_PREVIEW || busy || !expected) return;
    busy = true;
    error = '';
    try {
      profile = await resetCampPreview(expected);
      open = false;
      busy = false;
      await navigate('center');
      notice = 'Demonstração reiniciada: 50 ouro, 120 comida e um novo começo.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível reiniciar. O estado anterior foi preservado.';
    } finally {
      busy = false;
    }
  }
  async function simulate(value: number | null) {
    if (!CAMP_PREVIEW || busy || !profile?.campPreview) return;
    busy = true;
    error = '';
    try {
      profile = await setCampSimulationXp(value, profile.campPreview);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível trocar o estágio.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>{scene.title} · Level Me Up</title></svelte:head>
<div class="prototype-ribbon">
  <span>{CAMP_PREVIEW ? 'Protótipo · dados sintéticos' : 'Acampamento'}</span>
  <div>
    <span
      aria-label={CAMP_PREVIEW ? 'Saldo do protótipo' : 'Seus recursos'}
      data-testid="camp-balance"
      >{profile?.gold ?? 0} ouro · {profile?.food ?? 0} comida</span
    >{#if CAMP_PREVIEW}<button
        disabled={busy || !loaded}
        onclick={() => interact('reset')}>Reiniciar demonstração</button
      >{/if}
  </div>
</div>
{#if loaded}
  <div
    class="camp-experience"
    class:transformed
    onanimationend={() => (transformed = false)}
  >
    <SceneViewport
      {scene}
      {busy}
      onPoint={interact}
      onCenter={() => navigate('center')}
    />
  </div>
  {#if notice}<p class="camp-notice" role="status">{notice}</p>{/if}
  {#if error && !open}<p class="camp-notice error" role="alert">{error}</p>{/if}
  {#if !CAMP_PREVIEW && built && profile}<CampBuildings {profile} />{/if}
  {#if CAMP_PREVIEW}<details class="simulation-tools">
      <summary>Ferramentas da demonstração · simular árvore</summary>
      <p>
        Teste visual compartilhado entre Centro e Jardim. Não concede XP, bônus
        ou recompensas.
      </p>
      <div class="simulation-buttons">
        {#each ECO_STAGES as item (item.id)}<button
            disabled={busy}
            aria-pressed={stage.id === item.id}
            aria-label={'Simular estágio ' + item.id + ' — ' + item.label}
            onclick={() => simulate(item.minXp)}
            ><strong>{item.label}</strong><span
              >{format(item.minXp)} XP de teste</span
            ></button
          >{/each}
      </div>
      <div class="simulation-state">
        <span data-testid="shared-tree-stage"
          >Estágio {stage.id} · {stage.label} · {format(xp)} XP {profile
            ?.campPreview?.simulatedXp !== undefined
            ? 'de teste'
            : 'acumulado'}</span
        >
        {#if CAMP_PREVIEW && profile?.campPreview?.simulatedXp !== undefined}<button
            disabled={busy}
            onclick={() => simulate(null)}>Usar XP atual da demonstração</button
          >{/if}
      </div>
      {#if !built}<p>A árvore aparecerá depois da construção do Jardim.</p>{/if}
    </details>{/if}
{:else}<p class="camp-notice" role={error ? 'alert' : 'status'}>
    {error || 'Preparando o acampamento de demonstração…'}
  </p>{/if}
<Dialog
  scenePanel
  bind:open
  {title}
  dismissible={!busy}
  wide={[
    'equipment',
    'collection',
    'trophies',
    'records',
    'companions',
    'milestones',
  ].includes(panel)}
>
  {#if open}<div class="camp-dialog-content">
      {#if error}<p role="alert">{error}</p>{/if}
      {#if panel === 'caretaker'}
        {#if !built}
          <p class="spoken">
            Podemos transformar estes terrenos no seu primeiro acampamento.
          </p>
          <p>
            Uma única construção de <strong>{RESIDENCE_PRICE} ouro</strong> prepara,
            ao mesmo tempo:
          </p>
          <ul>
            <li>Aposentos</li>
            <li>Bestiário</li>
            <li>Jardim da Árvore</li>
          </ul>
          <dl class="quote">
            <div>
              <dt>Saldo atual</dt>
              <dd>{profile?.gold ?? 0} ouro</dd>
            </div>
            <div>
              <dt>Após construir</dt>
              <dd>{Math.max(0, (profile?.gold ?? 0) - 50)} ouro</dd>
            </div>
          </dl>
          <Button
            disabled={busy || (profile?.gold ?? 0) < 50}
            onclick={construct}>Confirmar construção · 50 ouro</Button
          >
          {#if (profile?.gold ?? 0) < 50}<p role="status">
              Ouro insuficiente. São necessários 50 ouro.
            </p>{/if}
        {:else}
          <p class="spoken">
            A casa está pronta. O Bestiário fica à esquerda, e o Jardim, à
            direita. Cada canto deste lugar acompanha a sua jornada.
          </p>
          <p>Seu Jardim está no estágio {stage.id}: {stage.label}.</p>
          <Button onclick={() => navigate('interior')}
            >Entrar nos Aposentos</Button
          >
        {/if}
      {:else if panel === 'reset' && CAMP_PREVIEW}
        <p>Reiniciar apenas esta demonstração?</p>
        <p>
          O Centro voltará a ficar vazio, com <strong>50 ouro</strong>,
          <strong>120 comida</strong>, <strong>0 XP</strong> e nenhuma criatura descoberta.
        </p>
        <p>
          A árvore voltará ao estágio Semente e aparecerá após a construção. O
          estado atual permanece até você confirmar.
        </p>
        <p class="reset-note">Os dados reais do aplicativo não são afetados.</p>
        <div class="dialog-actions">
          <Button
            variant="secondary"
            disabled={busy}
            onclick={() => (open = false)}>Cancelar</Button
          ><Button disabled={busy} onclick={restart}
            >Confirmar reinício da demonstração</Button
          >
        </div>
      {:else if panel === 'tree'}
        <p class="lmu-eyebrow">Estágio {stage.id} de 4</p>
        <h3>{stage.label}</h3>
        <p>
          {format(xp)} XP {CAMP_PREVIEW &&
          profile?.campPreview?.simulatedXp !== undefined
            ? 'de teste'
            : 'acumulado'}
        </p>
        <progress
          max="100"
          value={getEcoProgressForTotalXp(xp)}
          aria-label="Progresso da árvore"
        ></progress>
        <p>
          {next
            ? format(Math.max(0, next.minXp - xp)) +
              ' XP até ' +
              next.label +
              '.'
            : 'A árvore alcançou o estágio final.'}
        </p>
        <p>
          Bônus ambiental configurado: +{Math.round(
            (stage.xpBonusMultiplier - 1) * 100,
          )}% XP.
        </p>
        {#if CAMP_PREVIEW && profile?.campPreview?.simulatedXp !== undefined}<p
            class="reset-note"
          >
            Simulação visual: este bônus não está sendo aplicado ao perfil.
          </p>{/if}
        {#if !CAMP_PREVIEW}<Button
            variant="secondary"
            onclick={() => (panel = 'milestones')}
            >Consultar registros do ambiente</Button
          >{/if}
      {:else if panel === 'milestones' && !CAMP_PREVIEW}<Refuge embedded />
      {:else if panel === 'equipment' || panel === 'collection'}<Collection
          inventoryOnly
          embedded
        />
      {:else if panel === 'trophies'}<Achievements embedded />
      {:else if panel === 'records'}<Progress embedded />
      {:else if panel === 'companions'}<Companions embedded discoveredOnly />
      {/if}
    </div>{/if}
</Dialog>

<style>
  .prototype-ribbon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #0c1913;
    color: #ddc99d;
    font:
      13px/1.4 Georgia,
      serif;
    border-bottom: 1px solid #9d814344;
  }
  .prototype-ribbon > div {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .prototype-ribbon button {
    background: transparent;
    border: 1px solid #9f854c55;
    border-radius: 4px;
    padding: 5px 9px;
    color: #c4b994;
    font-size: 11px;
    min-height: 32px;
    cursor: pointer;
  }
  .camp-experience {
    position: relative;
  }
  .camp-notice {
    margin: 0;
    padding: 13px 20px;
    border-top: 1px solid #a28d4c44;
    background: #1e3023;
    color: #e8d6a8;
    text-align: center;
  }
  .camp-notice.error {
    background: #482d20;
    color: #f1d7bd;
  }
  .simulation-tools {
    padding: 14px 18px;
    background: #15251b;
    border-top: 1px solid #a28d4c44;
    color: #b5c3a5;
  }
  .simulation-tools summary {
    cursor: pointer;
    color: #d6c392;
    font:
      14px Georgia,
      serif;
    min-height: 30px;
  }
  .simulation-tools p {
    font-size: 12px;
    line-height: 1.5;
  }
  .simulation-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    margin: 14px 0;
  }
  .simulation-buttons button {
    display: grid;
    gap: 4px;
    text-align: left;
    padding: 11px 14px;
    border: 1px solid #8e9b6b55;
    border-radius: 5px;
    background: #122018;
    color: #cfdbbb;
    min-height: 60px;
    cursor: pointer;
  }
  .simulation-buttons button[aria-pressed='true'] {
    border-color: #c3a86a;
    background: #bca35220;
    color: #f1dfae;
  }
  .simulation-buttons strong {
    font:
      16px Georgia,
      serif;
  }
  .simulation-buttons span {
    font-size: 11px;
    color: #91a183;
  }
  .simulation-state {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }
  .simulation-state button {
    min-height: 40px;
    background: transparent;
    border: 1px solid #ac945a66;
    color: #e1d1a5;
    border-radius: 5px;
    padding: 6px 10px;
    cursor: pointer;
  }
  .camp-dialog-content {
    max-height: 72dvh;
    overflow: auto;
    padding: 0 6px 12px;
    min-width: 0;
  }
  .camp-dialog-content progress {
    width: 100%;
  }
  .spoken {
    font:
      22px/1.6 Georgia,
      serif;
    color: #eddfbe;
  }
  .quote {
    padding: 12px 16px;
    background: #203224;
    border: 1px solid #b29a5c55;
    border-radius: 6px;
  }
  .quote > div {
    display: flex;
    justify-content: space-between;
    gap: 15px;
  }
  .quote dd {
    margin: 0;
    color: #e7d6aa;
  }
  .quote dt {
    color: #a5b699;
  }
  .reset-note {
    padding: 10px 12px;
    border-left: 2px solid #b4a064;
    background: #b4a06410;
    color: #d9d1bb;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 20px;
  }
  .transformed:after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 45;
    pointer-events: none;
    background: #fce5ad;
    animation: establish 0.45s ease-out forwards;
  }
  @keyframes establish {
    from {
      opacity: 0.5;
    }
    to {
      opacity: 0;
    }
  }
  @media (max-width: 900px) {
    .prototype-ribbon {
      padding: 8px 12px;
      font-size: 11px;
      align-items: flex-start;
    }
    .prototype-ribbon > div {
      gap: 6px;
      align-items: flex-end;
      flex-direction: column;
    }
    .prototype-ribbon button {
      min-height: 35px;
    }
    .simulation-buttons {
      grid-template-columns: 1fr 1fr;
    }
    .simulation-state {
      align-items: flex-start;
      flex-direction: column;
    }
    .camp-dialog-content {
      max-height: 65dvh;
    }
    .spoken {
      font-size: 19px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .transformed:after {
      display: none;
      animation: none;
    }
    * {
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
</style>
