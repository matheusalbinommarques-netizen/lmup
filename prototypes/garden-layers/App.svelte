<script lang="ts">
  import { onMount } from 'svelte';
  import LayeredScene from '../../src/lib/scenes/LayeredScene.svelte';
  import {
    getGardenScene,
    TREE_SPRITES,
  } from '../../src/lib/scenes/gardenProof';
  import {
    ECO_STAGES,
    getEcoStageForTotalXp,
    getNextEcoStage,
  } from '../../src/services/ecoConfig';
  let xp = $state(12000);
  let view = $state<'scene' | 'compare' | 'reference'>('scene');
  let debug = $state(false),
    showTree = $state(true),
    showVegetation = $state(true),
    inspect = $state(false);
  let ready = $state(false),
    offline = $state(false),
    assetError = $state('');
  let viewport: HTMLDivElement | undefined = $state();
  const stage = $derived(getEcoStageForTotalXp(xp));
  const next = $derived(getNextEcoStage(stage.id));
  const scene = $derived(
    getGardenScene(xp, { tree: showTree, vegetation: showVegetation }),
  );
  const format = (value: number) => value.toLocaleString('pt-BR');
  $effect(() => {
    if (viewport) {
      const current = viewport;
      requestAnimationFrame(() => {
        current.scrollLeft = (current.scrollWidth - current.clientWidth) / 2;
      });
    }
  });
  function selectXp(value: number) {
    xp = Number.isFinite(value)
      ? Math.min(999999, Math.max(0, Math.trunc(value)))
      : 0;
  }
  function toggleView(value: 'compare' | 'reference') {
    view = view === value ? 'scene' : value;
    inspect = false;
  }
  onMount(() => {
    Promise.all(
      Object.values(TREE_SPRITES).map(
        (sprite) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new Error('Não foi possível carregar as árvores.'));
            image.src = '/assets/' + sprite.src;
          }),
      ),
    )
      .then(() => (ready = true))
      .catch((error) => (assetError = error.message));
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then(() => (offline = true))
        .catch(() => (offline = false));
    }
  });
</script>

<svelte:head
  ><meta
    name="description"
    content="Prova isolada de composição modular do Jardim da Árvore. Quatro estágios, cenário fixo e XP sintético."
  /></svelte:head
>
<div class="page">
  <header class="topbar">
    <a href="#jardim" class="brand"
      ><span aria-hidden="true">✦</span> Level Me Up</a
    ><span class="demo-badge"><i></i> DEMONSTRAÇÃO ISOLADA</span><span
      class="edition">ESTUDO VISUAL · 01</span
    >
  </header>
  <main id="jardim">
    <div class="intro">
      <div>
        <p class="eyebrow">ACAMPAMENTO / PROVA DE COMPOSIÇÃO</p>
        <h1>Jardim da Árvore</h1>
        <p class="subtitle">Um lugar que cresce com a sua jornada.</p>
      </div>
      <div class="intro-note">
        Quatro estágios.<br /><span>A mesma paisagem.</span>
      </div>
    </div>
    <section class="gallery" aria-label="Comparação visual do Jardim">
      <div class="scene-toolbar">
        <div class="location">
          <span aria-hidden="true">✧</span> Jardim da Árvore
          <small
            >{view === 'compare'
              ? 'QUATRO ESTÁGIOS'
              : view === 'reference'
                ? 'PINTURA APROVADA'
                : 'CÂMERA FIXA'}</small
          >
        </div>
        <div class="view-controls">
          <button
            aria-pressed={view === 'compare'}
            onclick={() => toggleView('compare')}>Comparar quatro</button
          >
          <button
            aria-pressed={view === 'reference'}
            onclick={() => toggleView('reference')}>Referência aprovada</button
          >
          <button
            aria-pressed={debug}
            onclick={() => {
              debug = !debug;
              view = 'scene';
            }}>Inspecionar camadas</button
          >
        </div>
      </div>
      {#if assetError}<p class="error" role="alert">{assetError}</p>{/if}
      {#if view === 'compare'}
        <div class="comparison" data-testid="comparison-grid">
          {#each ECO_STAGES as item (item.id)}
            <div class="comparison-card">
              <LayeredScene scene={getGardenScene(item.minXp)} />
              <div class="compare-caption">
                <strong>0{item.id} <span>{item.label}</span></strong><span
                  >{format(item.minXp)} XP</span
                >
              </div>
            </div>
          {/each}
        </div>
      {:else if view === 'reference'}
        <figure class="reference">
          <img
            src="/assets/approved-garden.png"
            alt="Pintura aprovada do Jardim: árvore adulta, canteiro circular, pedras com runas e nascente à direita."
          />
          <figcaption>Referência original fornecida · estágio 4</figcaption>
        </figure>
      {:else}
        <div class="scene-viewport" bind:this={viewport}>
          <div class="scene-canvas">
            <LayeredScene
              {scene}
              {debug}
              oninspect={() => (inspect = !inspect)}
            />
          </div>
        </div>
        <p class="mobile-hint">
          ↔ Deslize a paisagem para explorar suas bordas. Os controles
          permanecem abaixo.
        </p>
      {/if}
      {#if debug && view === 'scene'}
        <div class="layers-panel" aria-label="Inspeção das camadas">
          <span
            ><i class="dot permanent"></i> Paisagem original + reconstrução local</span
          ><label
            ><input type="checkbox" bind:checked={showTree} /> Árvore e sombra</label
          ><label
            ><input type="checkbox" bind:checked={showVegetation} /> Vegetação do
            canteiro</label
          ><span
            ><i class="dot structure"></i> Pedras e primeiro plano fixos</span
          >
        </div>
      {/if}
      {#if inspect && view === 'scene'}
        <div class="tree-info" role="region" aria-label="Informações da árvore">
          <strong>{stage.label}</strong><span
            >{format(xp)} XP de teste · {next
              ? format(Math.max(0, next.minXp - xp)) + ' XP até ' + next.label
              : 'Estágio final'}</span
          ><button
            onclick={() => (inspect = false)}
            aria-label="Fechar informações da árvore">Fechar</button
          >
        </div>
      {/if}
      <div class="stages-panel">
        <div class="panel-label">
          <span class="test-icon" aria-hidden="true">⌁</span>
          <div>
            <strong>Simulação de estágios</strong>
            <p>Ferramenta de teste · XP sintético</p>
          </div>
        </div>
        <div class="stage-buttons" aria-label="Selecionar estágio da árvore">
          {#each ECO_STAGES as item (item.id)}
            <button
              class:active={stage.id === item.id}
              aria-pressed={stage.id === item.id}
              aria-label={'Estágio ' + item.id + ' — ' + item.label}
              onclick={() => selectXp(item.minXp)}
              disabled={!ready}
              ><span class="stage-number">0{item.id}</span><span
                ><strong>{item.label}</strong><small
                  >{format(item.minXp)} XP</small
                ></span
              ></button
            >
          {/each}
        </div>
      </div>
    </section>
    <footer class="proof-footer">
      <div class="xp-input">
        <label for="synthetic-xp">XP de teste</label><input
          id="synthetic-xp"
          type="number"
          min="0"
          max="999999"
          step="1"
          value={xp}
          oninput={(event) => selectXp(event.currentTarget.valueAsNumber)}
        />
      </div>
      <p role="status">
        {!ready
          ? 'Preparando os quatro estágios…'
          : offline
            ? 'Comparação pronta · disponível offline'
            : 'Comparação pronta'}<span
          >Somente visualização. Sem recompensas ou alteração do jogador.</span
        >
      </p>
      <span class="review-note">PRÉVIA PARA AVALIAÇÃO</span>
    </footer>
  </main>
  <div class="page-foot">
    <span>Level Me Up · Jardim da Árvore</span><span
      >Composição por camadas · prova 01</span
    >
  </div>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }
  :global(html) {
    background: #101815;
    scroll-behavior: auto;
    color-scheme: dark;
  }
  :global(body) {
    margin: 0;
    color: #eee7d8;
    font:
      14px/1.5 system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
  }
  :global(button),
  :global(input) {
    font: inherit;
  }
  :global(button) {
    cursor: pointer;
  }
  :global(button:disabled) {
    cursor: wait;
    opacity: 0.5;
  }
  :global(button:focus-visible),
  :global(a:focus-visible),
  :global(input:focus-visible) {
    outline: 2px solid #f3da9e;
    outline-offset: 4px;
  }
  .page {
    min-height: 100vh;
    background: radial-gradient(ellipse at 50% 0, #29352b55, transparent 65%);
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 19px 3.6%;
    border-bottom: 1px solid #d5bd8420;
    gap: 16px;
  }
  .brand {
    font:
      24px Georgia,
      serif;
    color: #f0dfb8;
    text-decoration: none;
    letter-spacing: -0.5px;
  }
  .brand > span {
    color: #d6ac60;
    font-size: 28px;
    vertical-align: middle;
    margin-right: 8px;
  }
  .demo-badge {
    font-size: 10px;
    letter-spacing: 1.6px;
    color: #d9c69e;
    border: 1px solid #a38a4d55;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .demo-badge i {
    display: inline-block;
    width: 5px;
    height: 5px;
    background: #d5ad66;
    border-radius: 50%;
    vertical-align: middle;
    margin-right: 7px;
  }
  .edition {
    font-size: 10px;
    letter-spacing: 1.7px;
    color: #8f9b90;
  }
  main {
    width: min(1360px, 93%);
    margin: 0 auto;
  }
  .intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 34px 0 26px;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 2.2px;
    color: #bda579;
    margin: 0 0 10px;
  }
  h1 {
    font:
      normal clamp(30px, 3.2vw, 46px)/1.1 Georgia,
      serif;
    letter-spacing: -0.8px;
    margin: 0;
    color: #f2e1bc;
  }
  .subtitle {
    margin: 10px 0 0;
    color: #a9b0a3;
    font:
      16px Georgia,
      serif;
  }
  .intro-note {
    text-align: right;
    font:
      17px/1.65 Georgia,
      serif;
    color: #d6c79f;
    border-right: 1px solid #baa16b55;
    padding-right: 20px;
  }
  .intro-note span {
    color: #8c9c8e;
    font-size: 15px;
  }
  .gallery {
    border: 1px solid #b89d6055;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 18px 50px #0004;
    background: #131e18;
  }
  .scene-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 16px;
    background: #17241d;
  }
  .location {
    font:
      16px Georgia,
      serif;
    color: #e4d2aa;
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .location > span {
    font-size: 22px;
    color: #c6a469;
  }
  .location small {
    font: 9px system-ui;
    letter-spacing: 1.5px;
    color: #8f9e8b;
    margin-left: 15px;
  }
  .view-controls {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .view-controls button {
    background: transparent;
    color: #adbaa9;
    font-size: 11px;
    padding: 6px 9px;
    border: 1px solid transparent;
    border-radius: 4px;
    min-height: 32px;
  }
  .view-controls button:hover {
    border-color: #687454;
  }
  .view-controls button[aria-pressed='true'] {
    background: #c4a66919;
    border-color: #b49d6655;
    color: #eed9a6;
  }
  .scene-viewport {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #8b784c #15241a;
  }
  .scene-canvas {
    width: 100%;
  }
  .mobile-hint {
    display: none;
  }
  .stages-panel {
    display: flex;
    gap: 25px;
    align-items: center;
    padding: 19px 22px;
    background: #18251e;
    border-top: 1px solid #b89d6030;
  }
  .panel-label {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 210px;
  }
  .panel-label strong {
    font-size: 12px;
    font-weight: 500;
    color: #d9d5bf;
  }
  .panel-label p {
    font-size: 10px;
    color: #899c89;
    margin: 3px 0 0;
  }
  .test-icon {
    font:
      30px Georgia,
      serif;
    color: #bda16c;
  }
  .stage-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    flex: 1;
  }
  .stage-buttons button {
    display: flex;
    gap: 10px;
    align-items: center;
    text-align: left;
    background: #152019;
    border: 1px solid #8d9d7933;
    border-radius: 5px;
    padding: 10px 12px;
    color: #a7b29d;
    min-height: 59px;
  }
  .stage-buttons .active {
    background: linear-gradient(110deg, #a68b4526, #81773e0d);
    border-color: #bca26b;
    color: #e8d7ad;
    box-shadow: inset 0 0 0 1px #baa16218;
  }
  .stage-number {
    font:
      23px Georgia,
      serif;
    color: #7c9275;
  }
  .active .stage-number {
    color: #d4b976;
  }
  .stage-buttons strong {
    display: block;
    font:
      14px Georgia,
      serif;
  }
  .stage-buttons small {
    display: block;
    font-size: 10px;
    color: #81937d;
    margin-top: 4px;
  }
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #b89d6044;
  }
  .comparison-card {
    background: #101c15;
  }
  .compare-caption {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 11px 14px;
    color: #b2b69d;
    font-size: 11px;
  }
  .compare-caption strong {
    font-weight: 500;
    color: #d4b977;
  }
  .compare-caption strong span {
    font:
      15px Georgia,
      serif;
    color: #e0d3b5;
    margin-left: 8px;
  }
  .reference {
    margin: 0;
    position: relative;
  }
  .reference img {
    display: block;
    width: 100%;
    height: auto;
  }
  .reference figcaption {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: #101815e6;
    border: 1px solid #b89d6077;
    padding: 6px 10px;
    color: #e9d9af;
    font-size: 11px;
    border-radius: 4px;
  }
  .layers-panel {
    display: flex;
    align-items: center;
    gap: 22px;
    flex-wrap: wrap;
    font-size: 11px;
    color: #bec8ad;
    padding: 14px 18px;
    background: #233528;
    border-top: 1px solid #6c9a6844;
  }
  .layers-panel label {
    display: flex;
    gap: 6px;
    align-items: center;
    min-height: 28px;
  }
  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #baa06e;
    margin-right: 6px;
  }
  .dot.structure {
    background: #94b7a1;
  }
  .tree-info {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 14px 20px;
    background: #253a2b;
    color: #d5ddc5;
    font-size: 12px;
  }
  .tree-info strong {
    font:
      18px Georgia,
      serif;
    color: #f1dba6;
  }
  .tree-info button {
    margin-left: auto;
    color: #d0d7ba;
    border: 1px solid #8fa07a77;
    background: transparent;
    padding: 6px 10px;
    border-radius: 4px;
  }
  .proof-footer {
    display: flex;
    align-items: center;
    gap: 25px;
    padding: 20px 1px 26px;
  }
  .xp-input {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .xp-input label {
    font-size: 11px;
    color: #8c9e8a;
  }
  .xp-input input {
    width: 100px;
    background: #15221a;
    border: 1px solid #6d805e66;
    border-radius: 4px;
    padding: 7px 10px;
    color: #d9cba6;
  }
  .proof-footer p {
    font-size: 11px;
    color: #a9b89e;
    margin: 0;
  }
  .proof-footer p span {
    display: block;
    color: #6f846e;
    font-size: 10px;
    margin-top: 3px;
  }
  .review-note {
    margin-left: auto;
    font-size: 9px;
    letter-spacing: 1.5px;
    color: #7c8d77;
  }
  .page-foot {
    display: flex;
    justify-content: space-between;
    width: min(1360px, 93%);
    margin: auto;
    border-top: 1px solid #8f9d7420;
    padding: 15px 0 22px;
    color: #526951;
    font-size: 10px;
  }
  .error {
    padding: 10px 20px;
    background: #5d301d;
    color: #ffddbb;
  }
  @media (max-width: 1050px) {
    .stages-panel {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .panel-label {
      min-width: 0;
    }
    .intro {
      margin-top: 26px;
    }
    .location small {
      display: none;
    }
    .stage-buttons {
      gap: 7px;
    }
    .stage-buttons button {
      padding: 9px;
    }
    .edition {
      display: none;
    }
    .scene-toolbar {
      padding: 10px 12px;
    }
    .view-controls {
      gap: 0;
    }
    .view-controls button {
      font-size: 10px;
      padding: 6px;
    }
  }
  @media (max-width: 640px) {
    main {
      width: 94%;
    }
    .topbar {
      padding: 14px 4%;
      gap: 6px;
    }
    .brand {
      font-size: 19px;
    }
    .brand > span {
      font-size: 24px;
      margin-right: 4px;
    }
    .demo-badge {
      font-size: 8px;
      letter-spacing: 0.8px;
      padding: 5px 7px;
    }
    .intro {
      margin: 25px 2px 20px;
    }
    .eyebrow {
      font-size: 8px;
      letter-spacing: 1.3px;
    }
    h1 {
      font-size: 32px;
    }
    .subtitle {
      font-size: 14px;
    }
    .intro-note {
      display: none;
    }
    .scene-toolbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      padding: 10px;
    }
    .view-controls {
      width: 100%;
      justify-content: space-between;
    }
    .view-controls button {
      font-size: 10px;
      min-height: 40px;
      padding: 6px;
    }
    .scene-canvas {
      width: 680px;
      min-width: 100%;
    }
    .mobile-hint {
      display: block;
      color: #8c9b82;
      font-size: 9px;
      margin: 0;
      padding: 8px 12px;
      border-top: 1px solid #83966a22;
    }
    .stages-panel {
      padding: 13px;
      gap: 13px;
    }
    .stage-buttons {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .stage-buttons button {
      min-height: 62px;
    }
    .stage-buttons strong {
      font-size: 15px;
    }
    .proof-footer {
      flex-wrap: wrap;
      gap: 14px;
      padding: 18px 3px;
    }
    .proof-footer p {
      font-size: 10px;
      flex-basis: 100%;
      order: 2;
    }
    .review-note {
      font-size: 8px;
    }
    .comparison {
      grid-template-columns: 1fr;
    }
    .compare-caption strong span {
      font-size: 14px;
    }
    .tree-info {
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tree-info span {
      width: 100%;
      order: 2;
    }
    .layers-panel {
      gap: 8px 16px;
    }
    .page-foot {
      font-size: 8px;
    }
    .reference figcaption {
      font-size: 9px;
      bottom: 6px;
      left: 6px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
</style>
