<script lang="ts">
  import { onMount } from 'svelte';
  import SceneSprite from '$lib/lab/SceneSprite.svelte';
  import { campSprites } from '$lib/lab/campSprites';
  import TerrainRegion from '$lib/lab/TerrainRegion.svelte';
  import { forgeRegion } from '$lib/lab/campRegion';
  import {
    footprintCorners,
    placementError,
    type Point,
  } from '$lib/lab/campPlacement';

  type Building = {
    id: string;
    name: string;
    purpose: string;
    x: number;
    y: number;
    icon: string;
    roof: string;
    sprite?: keyof typeof campSprites;
    status: 'ready' | 'site';
  };
  const initialBuildings: Building[] = [
    {
      id: 'hall',
      name: 'Salão do acampamento',
      purpose: 'O coração do assentamento.',
      x: 830,
      y: 570,
      icon: '♜',
      roof: 'hall',
      status: 'ready',
    },
    {
      id: 'forge',
      name: 'Forja',
      purpose: 'Um futuro lugar para equipamentos e melhorias.',
      x: 1170,
      y: 700,
      icon: '⚒',
      roof: 'forge',
      sprite: 'forge',
      status: 'ready',
    },
    {
      id: 'forge-copy',
      name: 'Forja 2',
      purpose: 'Segunda instância da mesma forja, com seleção independente.',
      x: 1290,
      y: 760,
      icon: '',
      roof: 'forge',
      sprite: 'forge',
      status: 'ready',
    },
    {
      id: 'store',
      name: 'Armazém',
      purpose: 'Um espaço para os recursos da comunidade.',
      x: 620,
      y: 885,
      icon: '▣',
      roof: 'store',
      status: 'ready',
    },
    {
      id: 'plot',
      name: 'Terreno disponível',
      purpose: 'Área reservada para uma futura construção.',
      x: 1330,
      y: 965,
      icon: '+',
      roof: 'site',
      status: 'site',
    },
  ];
  const WORLD_W = 1850;
  const WORLD_H = 1400;
  let buildings = $state<Building[]>(initialBuildings);
  let placing = $state(false);
  let proposed = $state<Point | null>(null);
  let movedDuringDrag = false;
  let nextForge = 3;
  const forgeFootprint = (point: Point) => ({
    ...point,
    ...campSprites.forge.footprint,
  });
  function buildingFootprint(building: Building) {
    if (building.sprite)
      return {
        x: building.x,
        y: building.y,
        ...campSprites[building.sprite].footprint,
      };
    // Ground base of the provisional CSS walls (not their roof/button rectangle).
    return { x: building.x, y: building.y + 47, width: 104, height: 52 };
  }
  const proposedError = $derived(
    proposed
      ? placementError(
          forgeFootprint(proposed),
          buildings.filter((b) => b.status === 'ready').map(buildingFootprint),
          { width: WORLD_W, height: WORLD_H },
        )
      : 'Escolha uma posição no terreno.',
  );
  const previewPoints = $derived(
    footprintCorners(forgeFootprint({ x: 0, y: 0 }))
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  function beginBuilding() {
    placing = true;
    proposed = { x: 1000, y: 980 };
    selection = null;
    limitCamera(1000, 980);
    viewport.focus({ preventScroll: true });
  }
  function cancelBuilding() {
    placing = false;
    proposed = null;
  }
  function confirmBuilding() {
    if (!proposed || proposedError) return;
    const created: Building = {
      id: `forge-user-${nextForge}`,
      name: `Forja ${nextForge}`,
      purpose: 'Construção demonstrativa posicionada por você.',
      x: proposed.x,
      y: proposed.y,
      icon: '⚒',
      roof: 'forge',
      sprite: 'forge',
      status: 'ready',
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
  const trees = [
    [360, 270],
    [460, 420],
    [540, 220],
    [680, 280],
    [915, 260],
    [1140, 300],
    [1400, 370],
    [1600, 450],
    [320, 680],
    [400, 1040],
    [520, 1150],
    [755, 1135],
    [980, 1180],
    [1220, 1175],
    [1540, 1100],
    [1620, 850],
    [260, 930],
    [1440, 210],
    [1070, 1040],
    [770, 380],
  ];
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
    if (!placing) selection = building;
  }
  function focus(building: Building) {
    if (!placing) selection = building;
    limitCamera(building.x, building.y);
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
      <button type="button" onclick={beginBuilding} disabled={placing}
        >+ Construir forja</button
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
        <div class="ground"></div>
        <div class="clearing"></div>
        <div class="road road-a"></div>
        <div class="road road-b"></div>
        <div class="lake"></div>
        <TerrainRegion region={forgeRegion} />
        {#each trees as tree, i (i)}
          <div
            class="tree"
            style:left={tree[0] + 'px'}
            style:top={tree[1] + 'px'}
            style:z-index={tree[1] + 86}
            aria-hidden="true"
          >
            <i></i><b></b>
          </div>
        {/each}
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
              src={campSprites.forge.src}
              alt=""
              draggable="false"
              style:width={campSprites.forge.worldWidth + 'px'}
              style:left={(-campSprites.forge.pivot.x *
                campSprites.forge.worldWidth) /
                campSprites.forge.source.width +
                'px'}
              style:top={(-campSprites.forge.pivot.y *
                campSprites.forge.worldWidth) /
                campSprites.forge.source.width +
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
          {#if building.sprite}
            <SceneSprite
              id={building.id}
              name={building.name}
              x={building.x}
              y={building.y}
              sprite={campSprites[building.sprite]}
              selected={selection?.id === building.id}
              onselect={() => choose(building)}
            />
          {:else}
            <button
              class="building"
              class:active={selection?.id === building.id}
              class:site={building.status === 'site'}
              style:left={building.x + 'px'}
              style:top={building.y + 'px'}
              style:z-index={Math.round(building.y + 82.5)}
              onclick={() => choose(building)}
              aria-label={'Selecionar ' + building.name}
              aria-pressed={selection?.id === building.id}
            >
              <span
                class="building-art"
                class:forge={building.roof === 'forge'}
                class:hall={building.roof === 'hall'}
                class:store={building.roof === 'store'}
                class:site-art={building.roof === 'site'}
              >
                <span class="roof"></span><span class="walls"></span><span
                  class="glyph">{building.icon}</span
                >
              </span>
              <span class="building-name">{building.name}</span>
            </button>
          {/if}
        {/each}
      </div>
    </div>
    <div class="bottom">
      <div class="build-info">
        {#if placing}
          <span class="eyebrow">Modo construção · demonstração</span>
          <h2>Posicionar forja</h2>
          <p>
            Toque ou clique no terreno para posicionar; arraste para explorar.
            No teclado, use as setas, Enter e Esc.
          </p>
          <p role="status" class:placement-error={!!proposedError}>
            {proposedError || 'Posição livre. Confirme para criar a forja.'}
          </p>
          <div class="placement-actions">
            <button
              type="button"
              onclick={confirmBuilding}
              disabled={!proposed || !!proposedError}>Confirmar posição</button
            ><button type="button" onclick={cancelBuilding}>Cancelar</button>
          </div>
        {:else if selection}
          <span class="eyebrow">Espaço selecionado</span>
          <h2>{selection.name}</h2>
          <p>{selection.purpose}</p>
          <span class="chip"
            >{selection.status === 'site'
              ? 'Terreno livre (demonstração)'
              : 'Construção demonstrativa'}</span
          >
        {:else}
          <span class="eyebrow">Exploração</span>
          <h2>Escolha uma construção</h2>
          <p>
            Arraste o mapa, aproxime com a roda do mouse ou selecione um
            edifício. Nas forjas, selecione a base destacada ou use os atalhos.
          </p>
        {/if}
      </div>
      {#if !placing}
        <div class="shortcuts">
          {#each buildings as building (building.id)}
            <button
              onclick={() => focus(building)}
              class:active={selection?.id === building.id}
              >{building.name}</button
            >
          {/each}
        </div>
      {/if}
    </div>
  </section>
  <p class="disclaimer">
    Região da forja: arte de avaliação CC0 de rubberduck e feudalwars. Restante
    do mapa em CSS provisório. Construções apenas em memória, sem persistência,
    economia ou acesso ao IndexedDB. Não é a identidade visual final do jogo.
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
  .ground {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        ellipse at 45% 48%,
        #799063 0 15%,
        #617b51 40%,
        #304b36 90%
      ),
      repeating-linear-gradient(35deg, transparent 0 34px, #d8c69815 34px 36px);
  }
  .clearing {
    position: absolute;
    left: 300px;
    top: 265px;
    width: 1250px;
    height: 900px;
    border-radius: 48%;
    background: radial-gradient(
      ellipse,
      #9c9b6b 0%,
      #889363 43%,
      #76905a 69%,
      transparent 72%
    );
  }
  .road {
    position: absolute;
    background: #a79870;
    box-shadow: 0 0 0 7px #756d5050;
    border-radius: 48%;
    opacity: 0.75;
  }
  .road-a {
    left: 300px;
    top: 700px;
    width: 1160px;
    height: 95px;
    transform: rotate(12deg);
  }
  .road-b {
    left: 830px;
    top: 385px;
    width: 105px;
    height: 650px;
    transform: rotate(22deg);
  }
  .lake {
    position: absolute;
    left: 1450px;
    top: 65px;
    width: 365px;
    height: 310px;
    border-radius: 42% 58% 60% 40%;
    background: radial-gradient(
      ellipse at 35% 35%,
      #8ba7a5,
      #3c757e 70%,
      #294d61
    );
    box-shadow: 0 0 0 15px #a4a58255;
  }
  .tree {
    position: absolute;
    width: 80px;
    height: 88px;
    filter: drop-shadow(12px 12px 5px #162e2299);
  }
  .tree i {
    position: absolute;
    left: 37px;
    top: 45px;
    background: #654f35;
    width: 10px;
    height: 41px;
  }
  .tree b {
    position: absolute;
    left: 2px;
    top: 1px;
    width: 76px;
    height: 72px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 36% 28%,
      #64865a,
      #224c3c 68%,
      #163c32
    );
    border: 3px solid #25402c;
  }
  .building {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 190px;
    height: 165px;
    border: 0;
    background: transparent;
    color: #fff3d6;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    padding: 0;
  }
  .building-art {
    height: 110px;
    width: 130px;
    position: relative;
    display: block;
    filter: drop-shadow(12px 14px 4px #1b2719a0);
  }
  .walls {
    position: absolute;
    inset: 37px 13px 7px;
    background: #847c63;
    border: 4px solid #544e44;
    clip-path: polygon(0 15%, 50% 33%, 100% 15%, 100% 80%, 50% 100%, 0 80%);
  }
  .roof {
    position: absolute;
    left: 4px;
    top: 6px;
    width: 122px;
    height: 76px;
    background: #694538;
    clip-path: polygon(50% 0, 100% 43%, 50% 100%, 0 43%);
    border-radius: 8px;
  }
  .hall .roof {
    background: #73503d;
  }
  .hall .walls {
    background: #b0a68a;
  }
  .forge .roof {
    background: #493f41;
  }
  .forge .walls {
    background: #827369;
  }
  .store .roof {
    background: #816742;
  }
  .store .walls {
    background: #93836a;
  }
  .glyph {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -25%);
    font-size: 37px;
    text-shadow: 0 2px 6px #1d1a18;
  }
  .site-art {
    border: 4px dashed #e9d4a0;
    border-radius: 50%;
    width: 115px;
    height: 70px;
    margin-top: 25px;
    background: #dfd1a029;
    filter: none;
  }
  .site-art .roof,
  .site-art .walls {
    display: none;
  }
  .site-art .glyph {
    top: 24%;
    font-size: 48px;
  }
  .building-name {
    background: #152521e5;
    padding: 6px 10px;
    border: 1px solid #ab9560;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .building.active .building-name,
  .building:focus-visible .building-name {
    background: #5b4526;
    border-color: #ffe7b0;
  }
  .building:focus-visible {
    outline: 4px solid #fceac3;
    border-radius: 10px;
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
  .build-info,
  .shortcuts {
    background: #14241fe8;
    border: 1px solid #89764f;
    border-radius: 10px;
    padding: 12px;
    pointer-events: auto;
  }
  .build-info {
    width: min(365px, 48%);
  }
  .build-info h2 {
    margin: 4px 0;
    font-size: 1.1rem;
  }
  .build-info p {
    margin: 5px 0;
    font-size: 0.79rem;
    color: #e2d7bc;
  }
  .chip {
    display: inline-block;
    margin-top: 5px;
    font-size: 0.66rem;
    color: #e3ca93;
  }
  .shortcuts {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    flex: 1;
    justify-content: end;
  }
  .shortcuts button {
    font-size: 0.75rem;
    border-radius: 6px;
    padding: 10px;
    background: #3f4838;
    border: 1px solid #7a846d;
    color: #eee1c5;
    cursor: pointer;
    min-height: 40px;
  }
  .shortcuts button.active {
    border-color: #ffe4a3;
    background: #6f5c3d;
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
    .shortcuts {
      margin-top: 6px;
      justify-content: start;
      padding: 7px;
    }
    .shortcuts button {
      padding: 6px;
      font-size: 0.68rem;
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
  .shortcuts {
    max-height: 130px;
    overflow: auto;
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
</style>
