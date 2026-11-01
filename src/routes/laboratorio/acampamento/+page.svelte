<script lang="ts">
  import { onMount } from 'svelte';
  import SceneSprite from '$lib/lab/SceneSprite.svelte';
  import { campSprites } from '$lib/lab/campSprites';
  import TerrainRegion from '$lib/lab/TerrainRegion.svelte';
  import { campRegion, campLandmarks, CAMP_WORLD } from '$lib/lab/campRegion';
  import {
    initialBuildings,
    constructionCatalog,
    moveBuilding,
    completeBuilding,
    removeBuilding,
    type CampBuilding as Building,
  } from '$lib/lab/campConstruction';
  import {
    footprintCorners,
    footprintsOverlap,
    placementError,
    type Point,
  } from '$lib/lab/campPlacement';

  const WORLD_W = CAMP_WORLD.width;
  const WORLD_H = CAMP_WORLD.height;
  let buildings = $state<Building[]>(initialBuildings);
  let placing = $state(false);
  let catalogOpen = $state(false);
  let landmarksOpen = $state(false);
  let movingId = $state<string | null>(null);
  let removePending = $state(false);
  let chosenType = $state<keyof typeof constructionCatalog>('forge');
  const placementSprite = $derived(
    campSprites[
      movingId
        ? buildings.find((b) => b.id === movingId)!.sprite
        : constructionCatalog[chosenType].sprite
    ],
  );
  let proposed = $state<Point | null>(null);
  let movedDuringDrag = false;
  let nextForge = 3;
  const proposedFootprint = (point: Point) => ({
    ...point,
    ...placementSprite.footprint,
  });
  const buildingFootprint = (b: Building) => ({
    x: b.x,
    y: b.y,
    ...campSprites[b.sprite].footprint,
  });
  const openSiteIds = $derived(
    buildings
      .filter(
        (b) =>
          b.status === 'site' &&
          !buildings.some(
            (other) =>
              other.status !== 'site' &&
              footprintsOverlap(buildingFootprint(b), buildingFootprint(other)),
          ),
      )
      .map((b) => b.id),
  );
  const proposedError = $derived(
    proposed
      ? placementError(
          proposedFootprint(proposed),
          buildings
            .filter((b) => b.status !== 'site' && b.id !== movingId)
            .map(buildingFootprint),
          { width: WORLD_W, height: WORLD_H },
        )
      : 'Escolha uma posição no terreno.',
  );
  const previewPoints = $derived(
    footprintCorners(proposedFootprint({ x: 0, y: 0 }))
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  function beginBuilding(point: Point = { x: 1000, y: 980 }) {
    catalogOpen = false;
    movingId = null;
    placing = true;
    proposed = { ...point };
    selection = null;
    limitCamera(point.x, point.y);
    viewport.focus({ preventScroll: true });
  }
  function cancelBuilding() {
    placing = false;
    proposed = null;
    movingId = null;
  }
  function beginMove() {
    if (!selection || selection.status === 'site') return;
    catalogOpen = false;
    movingId = selection.id;
    proposed = { x: selection.x, y: selection.y };
    placing = true;
    removePending = false;
    limitCamera(proposed.x, proposed.y);
    viewport.focus({ preventScroll: true });
  }
  function finishSelected() {
    if (!selection) return;
    buildings = completeBuilding(buildings, selection.id);
    selection = buildings.find((b) => b.id === selection!.id)!;
  }
  function removeSelected() {
    if (!selection) return;
    buildings = removeBuilding(buildings, selection.id);
    selection = null;
    removePending = false;
  }
  function confirmBuilding() {
    if (!proposed || proposedError) return;
    if (movingId) {
      buildings = moveBuilding(buildings, movingId, proposed);
      selection = buildings.find((b) => b.id === movingId)!;
      cancelBuilding();
      return;
    }
    const created: Building = {
      id: `${chosenType}-user-${nextForge}`,
      name: `${constructionCatalog[chosenType].name} ${nextForge}`,
      purpose: constructionCatalog[chosenType].purpose,
      x: proposed.x,
      y: proposed.y,
      sprite: constructionCatalog[chosenType].sprite,
      status: 'building',
    };
    nextForge += 1;
    buildings = [...buildings, created];
    selection = created;
    placing = false;
    proposed = null;
  }
  function placementKey(event: KeyboardEvent) {
    if (!placing || event.target !== viewport) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelBuilding();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      confirmBuilding();
      return;
    }
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -16, y: 0 },
      ArrowRight: { x: 16, y: 0 },
      ArrowUp: { x: 0, y: -16 },
      ArrowDown: { x: 0, y: 16 },
    };
    const delta = directions[event.key];
    if (delta && proposed) {
      event.preventDefault();
      proposed = { x: proposed.x + delta.x, y: proposed.y + delta.y };
      limitCamera(proposed.x, proposed.y);
    }
  }
  let viewport: HTMLDivElement;
  let viewWidth = $state(900);
  let viewHeight = $state(590);
  let cameraX = $state(900);
  let cameraY = $state(700);
  let zoom = $state(0.72);
  let selection = $state<Building | null>(null);
  let dragging = $state(false);
  let pointer: number | null = null;
  let startX = 0,
    startY = 0,
    startCameraX = 0,
    startCameraY = 0;
  const MIN_ZOOM = 0.45,
    MAX_ZOOM = 1.5;
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));
  function limitCamera(x: number, y: number, z = zoom) {
    const marginX = Math.max(0, (WORLD_W - viewWidth / z) / 2);
    const marginY = Math.max(0, (WORLD_H - viewHeight / z) / 2);
    cameraX = clamp(x, WORLD_W / 2 - marginX, WORLD_W / 2 + marginX);
    cameraY = clamp(y, WORLD_H / 2 - marginY, WORLD_H / 2 + marginY);
  }
  function setZoom(z: number) {
    zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
    limitCamera(cameraX, cameraY);
  }
  function resetCamera() {
    zoom = 0.72;
    limitCamera(900, 700);
  }
  function pointerDown(event: PointerEvent) {
    if (
      event.button !== 0 ||
      (!placing && (event.target as HTMLElement).closest('button'))
    )
      return;
    dragging = true;
    pointer = event.pointerId;
    movedDuringDrag = false;
    startX = event.clientX;
    startY = event.clientY;
    startCameraX = cameraX;
    startCameraY = cameraY;
    viewport.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent) {
    if (!dragging || pointer !== event.pointerId) return;
    const dx = event.clientX - startX,
      dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) movedDuringDrag = true;
    limitCamera(startCameraX - dx / zoom, startCameraY - dy / zoom);
  }
  function pointerUp(event: PointerEvent) {
    if (pointer !== event.pointerId) return;
    const wasDrag = movedDuringDrag;
    dragging = false;
    pointer = null;
    if (placing && !wasDrag && event.type !== 'pointercancel') {
      const bounds = viewport.getBoundingClientRect();
      const x =
        Math.round(
          (cameraX + (event.clientX - bounds.left - viewWidth / 2) / zoom) / 16,
        ) * 16;
      const y =
        Math.round(
          (cameraY + (event.clientY - bounds.top - viewHeight / 2) / zoom) / 16,
        ) * 16;
      proposed = { x, y };
    }
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
  }
  function choose(building: Building) {
    if (!placing) {
      selection = building;
      catalogOpen = false;
      removePending = false;
    }
  }
  function visit(point: Point) {
    landmarksOpen = false;
    if (placing) return;
    selection = null;
    catalogOpen = false;
    limitCamera(point.x, point.y);
  }
  onMount(() => {
    const observer = new ResizeObserver(() => {
      viewWidth = viewport.clientWidth;
      viewHeight = viewport.clientHeight;
      limitCamera(cameraX, cameraY);
    });
    observer.observe(viewport);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(zoom * (event.deltaY > 0 ? 0.9 : 1.1));
    };
    viewport.addEventListener('wheel', wheel, { passive: false });
    viewWidth = viewport.clientWidth;
    viewHeight = viewport.clientHeight;
    limitCamera(cameraX, cameraY);
    return () => {
      observer.disconnect();
      viewport.removeEventListener('wheel', wheel);
    };
  });
</script>

<svelte:window onkeydown={placementKey} />

<svelte:head
  ><title>Acampamento navegável — Laboratório LMUP</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>

<div class="shell">
  <header class="top">
    <div>
      <span class="eyebrow">LMUP / Laboratório sem dados reais</span>
      <h1>Acampamento navegável</h1>
    </div>
    <a href="/laboratorio">Sair do experimento</a>
  </header>
  <section class="game" aria-label="Experimento de mapa navegável">
    <div class="hud">
      <strong>O ACAMPAMENTO</strong><span
        >Arraste para explorar · Roda para zoom</span
      >
    </div>
    <div class="build-tools">
      <button
        type="button"
        onclick={() => {
          catalogOpen = !catalogOpen;
          selection = null;
          removePending = false;
        }}
        disabled={placing}
        aria-expanded={catalogOpen}>Construir</button
      >
    </div>
    <div class="zoom-tools" aria-label="Controle da câmera">
      <button onclick={() => setZoom(zoom + 0.15)} aria-label="Aproximar"
        >+</button
      >
      <button onclick={() => setZoom(zoom - 0.15)} aria-label="Afastar"
        >−</button
      >
      <button onclick={resetCamera} aria-label="Centralizar mapa">⌖</button>
    </div>
    <div
      class="viewport"
      bind:this={viewport}
      class:dragging
      tabindex="-1"
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
      onpointercancel={pointerUp}
      role="region"
      aria-label="Terreno do acampamento, arrastável"
    >
      <div
        class="world"
        style:transform={`translate(${viewWidth / 2 - cameraX * zoom}px, ${viewHeight / 2 - cameraY * zoom}px) scale(${zoom})`}
      >
        <TerrainRegion region={campRegion} />
        {#if placing && proposed}
          <div
            class="placement-preview"
            class:invalid={!!proposedError}
            style:left={proposed.x + 'px'}
            style:top={proposed.y + 'px'}
            style:z-index={Math.round(proposed.y)}
          >
            <svg class="placement-base" aria-hidden="true"
              ><polygon points={previewPoints} /></svg
            >
            <img
              src={placementSprite.src}
              alt=""
              draggable="false"
              style:width={placementSprite.worldWidth + 'px'}
              style:left={(-placementSprite.pivot.x *
                placementSprite.worldWidth) /
                placementSprite.source.width +
                'px'}
              style:top={(-placementSprite.pivot.y *
                placementSprite.worldWidth) /
                placementSprite.source.width +
                'px'}
            />
            <span
              >{proposedError
                ? '✕ Local indisponível'
                : '✓ Posição livre'}</span
            >
          </div>
        {/if}
        {#each buildings as building (building.id)}
          {#if building.status !== 'site'}
            <SceneSprite
              id={building.id}
              name={building.name}
              x={building.x}
              y={building.y}
              sprite={campSprites[building.sprite]}
              phase={building.status}
              selected={selection?.id === building.id}
              muted={movingId === building.id}
              onselect={() => choose(building)}
            />
          {:else if openSiteIds.includes(building.id)}
            <button
              class="site-plot"
              class:active={selection?.id === building.id}
              style:left={`${building.x}px`}
              style:top={`${building.y}px`}
              style:z-index={building.y}
              onclick={() => choose(building)}
              aria-label={`Selecionar ${building.name}`}
              aria-pressed={selection?.id === building.id}
            >
              <svg
                width="150"
                height="75"
                viewBox="0 0 150 75"
                aria-hidden="true"
                ><polygon points="75,2 148,37.5 75,73 2,37.5" /></svg
              >
              <span>Terreno vazio</span>
            </button>
          {/if}
        {/each}
      </div>
    </div>
    <nav class="landmarks" aria-label="Locais do acampamento">
      <details bind:open={landmarksOpen}>
        <summary>Locais</summary>
        {#each campLandmarks as landmark (landmark.id)}<button
            onclick={() => visit(landmark)}
            disabled={placing}>{landmark.name}</button
          >{/each}
      </details>
    </nav>
    <div class="bottom">
      <div class="build-info">
        {#if placing}
          <span class="eyebrow"
            >{movingId ? 'Reposicionar' : 'Modo construção'} · demonstração</span
          >
          <h2>{movingId ? 'Mover construção' : 'Posicionar forja'}</h2>
          <p>
            Toque no terreno para posicionar; arraste para explorar. Setas
            movem, Enter confirma e Esc cancela.
          </p>
          <p role="status" class:placement-error={!!proposedError}>
            {proposedError || 'Posição livre. Confirme para continuar.'}
          </p>
          <div class="placement-actions">
            <button
              type="button"
              onclick={confirmBuilding}
              disabled={!proposed || !!proposedError}
              >{movingId ? 'Confirmar mudança' : 'Confirmar posição'}</button
            ><button type="button" onclick={cancelBuilding}>Cancelar</button>
          </div>
        {:else if catalogOpen}
          <span class="eyebrow">Catálogo · sem custos reais</span>
          <h2>Construções</h2>
          {#each Object.entries(constructionCatalog) as [key, item] (key)}
            <button
              class="catalog-item"
              onclick={() => {
                chosenType = key as keyof typeof constructionCatalog;
                beginBuilding();
              }}
              aria-label={`Escolher ${item.name}`}
            >
              <img src={campSprites[item.sprite].src} alt="" /><span
                ><strong>{item.name}</strong><small>{item.purpose}</small></span
              >
            </button>
          {/each}
          <button class="quiet-action" onclick={() => (catalogOpen = false)}
            >Fechar catálogo</button
          >
        {:else if selection}
          <span class="eyebrow"
            >{selection.status === 'site'
              ? 'Terreno vazio'
              : selection.status === 'building'
                ? 'Em construção'
                : 'Concluído'}</span
          >
          <h2>{selection.name}</h2>
          <p>{selection.purpose}</p>
          {#if selection.status === 'site'}
            <button
              class="quiet-action"
              onclick={() => beginBuilding(selection!)}>Construir aqui</button
            >
          {:else if removePending}
            <p>Remover {selection.name} deste experimento?</p>
            <div class="placement-actions">
              <button onclick={removeSelected}>Confirmar remoção</button><button
                onclick={() => (removePending = false)}
                >Manter construção</button
              >
            </div>
          {:else}
            <div class="context-actions">
              {#if selection.status === 'building'}<button
                  onclick={finishSelected}>Concluir construção</button
                >{/if}
              <button onclick={beginMove}>Mover</button><button
                onclick={() => (removePending = true)}>Remover</button
              >
            </div>
          {/if}
        {:else}
          <span class="eyebrow">Exploração</span>
          <h2>Seu acampamento</h2>
          <p>
            Selecione uma base no mapa para gerenciar. Abra Construir para
            colocar uma forja.
          </p>
        {/if}
      </div>
    </div>
  </section>
  <p class="disclaimer">
    Arte de avaliação CC0 de rubberduck e feudalwars. Terreno composto por atlas
    reutilizáveis. Construções apenas em memória, sem persistência, economia ou
    acesso ao IndexedDB. Não é a identidade visual final do jogo.
  </p>
</div>

<style>
  :global(body) {
    background: #111a17;
  }
  .shell {
    max-width: 1800px;
    margin: auto;
    color: #f0e9db;
    font-family: system-ui, sans-serif;
  }
  .top {
    padding: 12px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .top h1 {
    font-size: clamp(1.15rem, 2.4vw, 1.6rem);
    margin: 3px 0;
  }
  .top a {
    color: #ead7aa;
  }
  .eyebrow {
    font-size: 0.68rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #c3a878;
  }
  .game {
    height: calc(100dvh - 142px);
    min-height: 500px;
    position: relative;
    overflow: hidden;
    border-block: 1px solid #6b6448;
    background: #344c35;
  }
  .viewport {
    position: absolute;
    inset: 0;
    overflow: hidden;
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  .viewport.dragging {
    cursor: grabbing;
  }
  .world {
    width: 1850px;
    height: 1400px;
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: 0 0;
    overflow: hidden;
    background: #476243;
  }
  .hud,
  .zoom-tools,
  .bottom {
    z-index: 2;
    position: absolute;
  }
  .hud {
    left: 16px;
    top: 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 11px 15px;
    background: #10201bdf;
    border: 1px solid #ae946257;
    border-radius: 8px;
    pointer-events: none;
  }
  .hud span {
    font-size: 0.75rem;
    color: #c9c9b6;
  }
  .zoom-tools {
    right: 16px;
    top: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .zoom-tools button {
    font-size: 23px;
    width: 43px;
    height: 43px;
    background: #172721ee;
    color: #fae8ca;
    border: 1px solid #b39c6a;
    border-radius: 8px;
    cursor: pointer;
  }
  .bottom {
    bottom: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    align-items: end;
    gap: 10px;
    pointer-events: none;
  }
  .build-info {
    width: min(365px, 100%);
    max-height: min(280px, 42dvh);
    overflow: auto;
    pointer-events: auto;
    background: #14241ff2;
    border: 1px solid #89764f;
    border-radius: 10px;
    padding: 12px;
  }
  .build-info h2 {
    font-size: 1.1rem;
    margin: 4px 0;
  }
  .build-info p {
    font-size: 0.79rem;
    margin: 5px 0;
    color: #e2d7bc;
  }
  .disclaimer {
    font-size: 0.78rem;
    color: #b7b7aa;
    padding: 8px 18px;
    margin: 0;
  }
  @media (max-width: 700px) {
    .top {
      padding: 10px;
    }
    .game {
      height: calc(100dvh - 122px);
      min-height: 520px;
    }
    .hud {
      left: 8px;
      top: 8px;
      padding: 7px 9px;
    }
    .hud span {
      max-width: 205px;
    }
    .zoom-tools {
      right: 8px;
      top: 8px;
    }
    .bottom {
      display: block;
      left: 8px;
      right: 8px;
      bottom: 8px;
    }
    .build-info {
      width: auto;
    }
    .disclaimer {
      font-size: 0.7rem;
    }
  }
  .build-tools {
    position: absolute;
    z-index: 3;
    top: 100px;
    left: 16px;
  }
  .build-tools button,
  .placement-actions button {
    background: #e3c182;
    color: #1b211b;
    border: 1px solid #eacb96;
    border-radius: 7px;
    padding: 10px 13px;
    min-height: 44px;
    font-weight: 700;
    cursor: pointer;
  }
  .build-tools button:disabled,
  .placement-actions button:disabled {
    opacity: 0.55;
    cursor: default;
  }
  .placement-preview {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
    opacity: 0.8;
    filter: drop-shadow(0 0 4px #a6ffd0);
  }
  .placement-base {
    position: absolute;
    overflow: visible;
    width: 1px;
    height: 1px;
  }
  .placement-base polygon {
    fill: #3edb8f55;
    stroke: #85ffc0;
    stroke-width: 3;
  }
  .invalid .placement-base polygon {
    fill: #ee525266;
    stroke: #ff8e8e;
  }
  .placement-error {
    color: #ffb5a9 !important;
  }
  .viewport:focus-visible {
    outline: 2px solid #ffe4a3;
    outline-offset: -3px;
  }
  .placement-preview.invalid {
    filter: drop-shadow(0 0 8px #ef6f6f);
    opacity: 0.6;
  }
  .placement-preview img {
    position: absolute;
    max-width: none;
    pointer-events: none;
  }
  .placement-preview span {
    position: absolute;
    top: 12px;
    left: -60px;
    white-space: nowrap;
    background: #17281eef;
    color: #f8e7bd;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
  }
  .placement-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .placement-actions button {
    flex: 1;
    min-width: 0;
    padding-inline: 8px;
  }
  .placement-actions button:first-child {
    flex: 2;
  }
  .placement-actions button:nth-child(2) {
    background: #27342f;
    color: #f0e9db;
  }
  @media (max-width: 700px) {
    .build-tools {
      top: 100px;
      left: 8px;
    }
    .build-tools button {
      font-size: 12px;
      padding: 8px;
    }
  }
  .landmarks {
    position: absolute;
    z-index: 3;
    left: 16px;
    top: 155px;
    max-width: 170px;
  }
  .landmarks details {
    background: #14241fee;
    border: 1px solid #89764f;
    border-radius: 8px;
    padding: 8px;
  }
  .landmarks summary {
    cursor: pointer;
    min-height: 28px;
  }
  .landmarks button {
    display: block;
    width: 100%;
    background: none;
    border: 0;
    color: #f1dfb5;
    text-align: left;
    min-height: 40px;
    padding: 8px;
  }
  .site-plot {
    position: absolute;
    width: 150px;
    height: 75px;
    transform: translate(-50%, -100%);
    border: 0;
    background: none;
    color: #ead5aa;
    cursor: pointer;
  }
  .site-plot polygon {
    fill: #ccb87820;
    stroke: #c7ac72;
    stroke-width: 2;
    stroke-dasharray: 7 5;
  }
  .site-plot span {
    display: block;
    background: #182b22dd;
    padding: 5px;
    border-radius: 5px;
  }
  .site-plot.active polygon {
    stroke: #fff1b5;
    fill: #ccb87850;
  }
  .catalog-item {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    padding: 8px;
    background: #334736;
    border: 1px solid #b4a16b;
    color: #f3e4c5;
    border-radius: 7px;
    text-align: left;
    cursor: pointer;
  }
  .catalog-item img {
    width: 70px;
    height: 60px;
    object-fit: contain;
  }
  .catalog-item small {
    display: block;
    font-size: 12px;
  }
  .quiet-action,
  .context-actions button {
    background: #304a38;
    border: 1px solid #b4a16b;
    color: #f3e4c5;
    border-radius: 6px;
    padding: 8px;
    min-height: 44px;
    cursor: pointer;
  }
  .context-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .quiet-action {
    margin-top: 8px;
  }
  @media (max-width: 700px) {
    .landmarks {
      left: 8px;
      top: 155px;
    }
    .build-info {
      max-height: 245px;
    }
    .hud span {
      max-width: 180px;
    }
  }
</style>
