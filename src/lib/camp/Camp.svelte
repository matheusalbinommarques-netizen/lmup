<script lang="ts">
  import { onMount } from 'svelte';
  import SceneSprite from '$lib/camp/SceneSprite.svelte';
  import CampResourceIcon from '$lib/camp/CampResourceIcon.svelte';
  import CampBuildingIcon from '$lib/camp/CampBuildingIcon.svelte';
  import CampGameIcon from '$lib/camp/CampGameIcon.svelte';
  import {
    campSprites,
    type SceneSpriteDefinition,
  } from '$lib/camp/campSprites';
  import TerrainRegion from '$lib/camp/TerrainRegion.svelte';
  import { campRegion, CAMP_WORLD } from '$lib/camp/campRegion';
  import { liveQuery } from 'dexie';
  import { goto } from '$app/navigation';
  import { db, type Profile } from '$services/db';
  import {
    CampConflictError,
    ensureCamp,
    executeCamp,
    settleCampProduction,
    type CampCommand,
  } from '$services/campService';
  import {
    validateCampState,
    campVersion,
    viewInventory,
    persistentCraftingError as craftingError,
  } from './campState';
  import { storageError } from '$services/storageErrors';
  import { guardUpdates } from '$lib/journey/guardUpdates';
  import { producerRate, productionRate } from '$lib/camp/campProduction';
  import {
    buildingRules,
    producerRules,
    isProducer,
    buildingLevel,
    materialCapacity,
    describeCost,
    missingResources,
    upgradeError,
    demoWorkers,
  } from '$lib/camp/campEconomy';
  import {
    resourceNames,
    createCampInventory,
    resourceDetails,
    demoRecipe,
    summarizeCamp,
    type CampResource,
  } from '$lib/camp/campWorkshop';
  import {
    constructionCatalog,
    initialBuildings,
    type CampBuilding as Building,
  } from '$lib/camp/campConstruction';
  import {
    footprintCorners,
    pointerWorldPoint,
    snapPlacement,
    placementError,
    nextRotation,
    groundHeading,
    type GroundRotation,
    type Point,
  } from '$lib/camp/campPlacement';

  const WORLD_W = CAMP_WORLD.width;
  const WORLD_H = CAMP_WORLD.height;
  let buildings = $state<Building[]>(structuredClone(initialBuildings));
  let inventory = $state({ ...createCampInventory(), gold: 0 });
  let loaded = $state(false),
    busy = $state(false),
    saveError = $state(''),
    version = $state('');
  let totalXp = $state(0);
  let interactionVersion = '';
  let retry: { signature: string; id: string; version: string } | undefined;
  guardUpdates(() => busy || !loaded || placing || removePending);
  function applyProfile(profile: Profile | undefined) {
    if (!profile?.camp) return;
    const camp = profile.camp;
    try {
      validateCampState(camp);
    } catch (error) {
      saveError = storageError(error, 'Dados do acampamento inválidos.');
      loaded = false;
      return;
    }
    if (movingId && !camp.buildings.some((b) => b.id === movingId)) {
      movingId = null;
      placing = false;
      proposed = null;
    }
    buildings = camp.buildings;
    inventory = viewInventory(camp, profile.gold);
    totalXp = profile.totalXpEarned;
    nextForge = camp.nextBuilding;
    version = campVersion(camp);
    loaded = true;
    if (selection)
      selection = buildings.find((b) => b.id === selection!.id) ?? null;
  }
  async function runCommand(command: CampCommand) {
    if (busy || !loaded) return false;
    busy = true;
    saveError = '';
    workshopMessage = '';
    const signature = JSON.stringify(command);
    if (!retry || retry.signature !== signature)
      retry = {
        signature,
        id: crypto.randomUUID(),
        version: ['build', 'move'].includes(command.type)
          ? interactionVersion || version
          : version,
      };
    try {
      applyProfile(
        await executeCamp(JSON.parse(signature), retry.id, retry.version),
      );
      retry = undefined;
      return true;
    } catch (error) {
      if (error instanceof CampConflictError) {
        retry = undefined;
        cancelBuilding();
        applyProfile(await db.profile.get(1));
      }
      saveError = storageError(
        error,
        'Não foi possível salvar. Seus dados anteriores foram preservados.',
      );
      return false;
    } finally {
      busy = false;
    }
  }
  const initialResource = (resource: CampResource) =>
    resource === 'gold' ? 0 : createCampInventory()[resource];
  let missionsOpen = $state(false);
  function openMissions() {
    const active = !missionsOpen;
    if (placing) cancelBuilding();
    reorganizing = false;
    demolishing = false;
    removePending = false;
    selection = null;
    catalogOpen = false;
    resourcePanel = null;
    missionsOpen = active;
  }
  function openRealMissions() {
    void goto('/missoes');
  }
  function producers(resource: CampResource) {
    return buildings.filter(
      (b) =>
        isProducer(b.sprite) &&
        producerRules[b.sprite].resource === resource &&
        b.status === 'ready',
    );
  }
  function producedBy(id: string, resource: CampResource) {
    return resource === 'wood'
      ? (inventory.timber?.find((r) => r.id === id)?.amount ?? 0)
      : (inventory.minerals?.find((r) => r.id === id && r.resource === resource)
          ?.amount ?? 0);
  }
  let settling = false;
  async function settleCamp() {
    if (busy || !loaded || settling || dragging || placing) return;
    settling = true;
    try {
      applyProfile(await settleCampProduction());
    } catch (error) {
      saveError = storageError(error, 'Produção não salva. Tente novamente.');
    } finally {
      settling = false;
    }
  }
  async function changeWorker(event: Event) {
    if (selection)
      await runCommand({
        type: 'worker',
        id: selection.id,
        workerId: (event.target as HTMLSelectElement).value || null,
      });
  }
  async function improveSelected() {
    if (selection && (await runCommand({ type: 'upgrade', id: selection.id })))
      workshopMessage = 'Melhoria salva.';
  }
  let resourcePanel = $state<CampResource | 'inventory' | null>(null);
  function toggleResourcePanel(panel: CampResource | 'inventory') {
    demolishing = false;
    removePending = false;
    missionsOpen = false;
    resourcePanel = resourcePanel === panel ? null : panel;
    if (!placing) selection = null;
    catalogOpen = false;
  }
  const resourceDetail = $derived(
    resourcePanel === 'gold'
      ? {
          stock: inventory.gold,
          gains: inventory.gold,
          produced: 0,
          consumed: 0,
          net: inventory.gold,
          origins: [],
        }
      : resourcePanel && resourcePanel !== 'inventory'
        ? resourceDetails(inventory, resourcePanel)
        : null,
  );
  function focusResourceBuilding(id: string) {
    const building = buildings.find((candidate) => candidate.id === id);
    if (!building) return;
    if (placing) cancelBuilding();
    reorganizing = false;
    demolishing = false;
    removePending = false;
    choose(building);
    limitCamera(building.x, building.y);
    resourcePanel = null;
  }
  let workshopMessage = $state('');
  const campSummary = $derived(summarizeCamp(buildings));
  async function fabricate() {
    if (
      selection &&
      !placing &&
      (await runCommand({ type: 'craft', id: selection.id }))
    )
      workshopMessage = 'Espada de treino fabricada e enviada ao armazém.';
  }
  let placing = $state(false);
  let reorganizing = $state(false);
  let demolishing = $state(false);
  function toggleDemolition() {
    const active = !demolishing;
    cancelBuilding();
    demolishing = active;
    reorganizing = false;
    selection = null;
    removePending = false;
    resourcePanel = null;
    missionsOpen = false;
    catalogOpen = false;
    viewport.focus({ preventScroll: true });
  }
  function toggleReorganization() {
    const active = !reorganizing;
    cancelBuilding();
    reorganizing = active;
    demolishing = false;
    catalogOpen = false;
    missionsOpen = false;
    resourcePanel = null;
    selection = null;
    removePending = false;
    viewport.focus({ preventScroll: true });
  }
  let catalogOpen = $state(false);
  let movingId = $state<string | null>(null);
  let removePending = $state(false);
  let chosenType = $state<keyof typeof constructionCatalog>('forge');
  const placementSprite = $derived<SceneSpriteDefinition>(
    campSprites[
      movingId
        ? buildings.find((b) => b.id === movingId)!.sprite
        : constructionCatalog[chosenType].sprite
    ],
  );
  let proposed = $state<Point | null>(null);
  let proposedRotation = $state<GroundRotation>(0);
  const previewHeading = $derived(
    groundHeading(proposedRotation, placementSprite.footprint.height),
  );
  function rotateBuilding() {
    proposedRotation = nextRotation(proposedRotation);
    viewport.focus({ preventScroll: true });
  }
  async function rotateSelected() {
    if (selection) {
      interactionVersion = version;
      await runCommand({
        type: 'move',
        id: selection.id,
        point: { x: selection.x, y: selection.y },
        rotation: nextRotation(selection.rotation ?? 0),
      });
    }
  }
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
  const proposedError = $derived(
    proposed
      ? placementError(
          proposedFootprint(proposed),
          buildings
            .filter((b) => b.status !== 'site' && b.id !== movingId)
            .map(buildingFootprint),
          { width: WORLD_W, height: WORLD_H },
        ) ||
          (!movingId
            ? missingResources(inventory, buildingRules[chosenType].build)
            : '')
      : 'Escolha uma posição no terreno.',
  );
  const previewPoints = $derived(
    footprintCorners(proposedFootprint({ x: 0, y: 0 }))
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  function beginBuilding(point: Point = { x: 1008, y: 848 }) {
    interactionVersion = version;
    demolishing = false;
    reorganizing = false;
    catalogOpen = false;
    movingId = null;
    placing = true;
    proposed = { ...point };
    proposedRotation = 0;
    selection = null;
    limitCamera(point.x, point.y);
    viewport.focus({ preventScroll: true });
  }
  function cancelBuilding() {
    stopGesture();
    placing = false;
    proposed = null;
    movingId = null;
  }
  function beginMove() {
    if (selection) startMove(selection, true);
  }
  function startMove(building: Building, centerCamera: boolean) {
    interactionVersion = version;
    if (building.status === 'site') return;
    selection = building;
    resourcePanel = null;
    catalogOpen = false;
    movingId = building.id;
    proposed = { x: building.x, y: building.y };
    proposedRotation = building.rotation ?? 0;
    placing = true;
    removePending = false;
    if (centerCamera) limitCamera(proposed.x, proposed.y);
    viewport.focus({ preventScroll: true });
  }
  async function finishSelected() {
    if (selection) await runCommand({ type: 'complete', id: selection.id });
  }
  async function removeSelected() {
    if (selection && (await runCommand({ type: 'remove', id: selection.id }))) {
      selection = null;
      removePending = false;
    }
  }
  async function confirmBuilding() {
    if (!proposed || proposedError || dragging || busy) return;
    if (movingId) {
      if (
        await runCommand({
          type: 'move',
          id: movingId,
          point: { ...proposed },
          rotation: proposedRotation,
        })
      )
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
      rotation: proposedRotation,
    };
    if (await runCommand({ type: 'build', building: created })) {
      selection = buildings.find((b) => b.id === created.id) ?? null;
      placing = false;
      proposed = null;
    }
  }
  function placementKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (placing) {
        cancelBuilding();
        selection = null;
      } else if (removePending) {
        removePending = false;
        selection = null;
      } else if (demolishing) {
        demolishing = false;
        selection = null;
      } else if (reorganizing) {
        reorganizing = false;
        selection = null;
      } else if (resourcePanel) resourcePanel = null;
      else if (missionsOpen) missionsOpen = false;
      else {
        catalogOpen = false;
        selection = null;
      }
      return;
    }
    if (
      !placing ||
      (event.target !== viewport &&
        !(event.target as HTMLElement).closest(
          '[data-placement-handle], [data-placement-controls]',
        ))
    )
      return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelBuilding();
      return;
    }
    if (
      event.key.toLowerCase() === 'r' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      if (!event.repeat) rotateBuilding();
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
  const forgeError = $derived(
    selection?.sprite === 'forge'
      ? craftingError(buildings, selection.id, inventory)
      : '',
  );
  let dragging = $state(false);
  let pointer: number | null = null;
  let captureTarget: HTMLElement | null = null;
  let gestureKind = $state<'camera' | 'building' | null>(null);
  let gestureProposal: Point | null = null;
  let gestureOnGround = false;
  let grabOffset: Point = { x: 0, y: 0 };
  let startX = 0,
    startY = 0,
    startCameraX = 0,
    startCameraY = 0;
  const controlPoint = $derived(placing ? proposed : selection);
  const controlSprite = $derived<SceneSpriteDefinition | null>(
    placing
      ? placementSprite
      : selection
        ? campSprites[selection.sprite]
        : null,
  );
  const controlX = $derived(
    controlPoint ? viewWidth / 2 + (controlPoint.x - cameraX) * zoom : 0,
  );
  const controlY = $derived(
    controlPoint && controlSprite
      ? viewHeight / 2 +
          (controlPoint.y -
            cameraY -
            ((controlSprite.pivot.y - (controlSprite.topInset ?? 0)) *
              controlSprite.worldWidth) /
              controlSprite.source.width) *
            zoom -
          12
      : 0,
  );
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
  function worldPoint(event: PointerEvent): Point {
    const bounds = viewport.getBoundingClientRect();
    return pointerWorldPoint(
      { x: event.clientX, y: event.clientY },
      {
        left: bounds.left,
        top: bounds.top,
        width: viewWidth,
        height: viewHeight,
      },
      { x: cameraX, y: cameraY },
      zoom,
    );
  }
  function stopGesture(releaseCapture = true) {
    const captured = pointer;
    const target = captureTarget;
    captureTarget = null;
    pointer = null;
    dragging = false;
    gestureKind = null;
    gestureProposal = null;
    if (
      releaseCapture &&
      captured !== null &&
      target?.hasPointerCapture(captured)
    )
      target!.releasePointerCapture(captured);
  }
  function pointerDown(event: PointerEvent) {
    if (
      pointer !== null ||
      !event.isPrimary ||
      event.button !== 0 ||
      (!placing &&
        !reorganizing &&
        (event.target as HTMLElement).closest('button'))
    )
      return;
    const source =
      reorganizing &&
      (event.target as HTMLElement).closest<HTMLElement>('[data-instance-id]');
    const building = source
      ? buildings.find(
          (candidate) => candidate.id === source.dataset.instanceId,
        )
      : null;
    if (building) {
      if (placing) cancelBuilding();
      startMove(building, false);
    }
    gestureKind =
      placing &&
      proposed &&
      (building ||
        (event.target as HTMLElement).closest('[data-placement-handle]'))
        ? 'building'
        : 'camera';
    gestureOnGround = !(event.target as HTMLElement).closest('button');
    gestureProposal = proposed ? { ...proposed } : null;
    if (gestureKind === 'building') {
      const point = worldPoint(event);
      grabOffset = { x: point.x - proposed!.x, y: point.y - proposed!.y };
    }
    dragging = true;
    pointer = event.pointerId;
    movedDuringDrag = false;
    startX = event.clientX;
    startY = event.clientY;
    startCameraX = cameraX;
    startCameraY = cameraY;
    captureTarget =
      gestureKind === 'building'
        ? (event.target as HTMLElement).closest<HTMLElement>(
            '[data-placement-handle], .sprite-footprint',
          )!
        : viewport;
    captureTarget.setPointerCapture(event.pointerId);
  }
  function updateDraggedProposal(event: PointerEvent) {
    const point = worldPoint(event);
    proposed = snapPlacement({
      x: point.x - grabOffset.x,
      y: point.y - grabOffset.y,
    });
  }
  function pointerMove(event: PointerEvent) {
    if (pointer !== event.pointerId) return;
    const dx = event.clientX - startX,
      dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 7) movedDuringDrag = true;
    if (gestureKind === 'building') {
      if (movedDuringDrag) updateDraggedProposal(event);
    } else {
      limitCamera(startCameraX - dx / zoom, startCameraY - dy / zoom);
    }
  }
  function pointerUp(event: PointerEvent) {
    if (pointer !== event.pointerId) return;
    const cancelled =
      event.type === 'pointercancel' || event.type === 'lostpointercapture';
    if (gestureKind === 'building') {
      if (cancelled) proposed = gestureProposal;
      else if (movedDuringDrag) updateDraggedProposal(event);
    } else if (
      viewWidth > 700 &&
      !movedDuringDrag &&
      !cancelled &&
      gestureOnGround &&
      (!placing || movingId)
    ) {
      if (placing) cancelBuilding();
      reorganizing = false;
      demolishing = false;
      selection = null;
      removePending = false;
    } else if (placing && !movedDuringDrag && !cancelled) {
      // A click remains an alternative; dragging bare ground only pans the camera.
      proposed = snapPlacement(worldPoint(event));
    }
    stopGesture(false);
  }
  function choose(building: Building) {
    if (demolishing && !placing) {
      selection = building;
      removePending = true;
      resourcePanel = null;
      missionsOpen = false;
      return;
    }
    if (!placing && !reorganizing) {
      missionsOpen = false;
      resourcePanel = null;
      selection = building;
      workshopMessage = '';
      catalogOpen = false;
      removePending = false;
    }
  }
  onMount(() => {
    let disposed = false;
    void ensureCamp()
      .then((profile) => {
        if (!disposed) {
          applyProfile(profile);
          void settleCamp();
        }
      })
      .catch((error) => {
        saveError = String(error);
      });
    const subscription = liveQuery(() => db.profile.get(1)).subscribe({
      next: (profile) => {
        if (profile && !profile.camp && loaded) {
          loaded = false;
          cancelBuilding();
          selection = null;
          void ensureCamp()
            .then(applyProfile)
            .catch(
              (error) =>
                (saveError = storageError(
                  error,
                  'Não foi possível preparar o acampamento.',
                )),
            );
        } else applyProfile(profile);
      },
      error: (error) => {
        saveError = String(error);
      },
    });
    const productionTimer = setInterval(() => void settleCamp(), 5000);
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
      clearInterval(productionTimer);
      disposed = true;
      subscription.unsubscribe();
      observer.disconnect();
      viewport.removeEventListener('wheel', wheel);
    };
  });
</script>

<svelte:window onkeydown={placementKey} />

<svelte:head
  ><title>Acampamento — Refúgio LMUP</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>

<div class="shell">
  <header class="top">
    <div>
      <span class="eyebrow">LMUP / Refúgio</span>
      <h1>Acampamento</h1>
    </div>
    <a href="/refugio">Voltar ao Refúgio</a>
  </header>
  <p class="camp-save-status" role="status">
    {!loaded
      ? 'Preparando acampamento…'
      : busy
        ? 'Salvando…'
        : 'Progresso salvo neste navegador'}
  </p>
  {#if saveError}<p class="camp-save-error" role="alert">
      {saveError}<button
        onclick={() => {
          void ensureCamp()
            .then(applyProfile)
            .catch((error) => (saveError = String(error)));
        }}>Conferir dados</button
      >
    </p>{/if}
  <section
    class="game"
    inert={!loaded || busy}
    aria-label="Acampamento do Refúgio"
  >
    <div class="hud">
      <strong>O ACAMPAMENTO</strong><span
        >{reorganizing
          ? 'Reorganizar · arraste um prédio · Esc sai'
          : 'Arraste o mapa · Roda para zoom'}</span
      >
      <small class="camp-help"
        >Selecione um prédio para gerenciar.<br />Construa e evolua seu
        assentamento.</small
      >
    </div>
    {#if !missionsOpen}<button
        type="button"
        class="missions-toggle quest-launcher"
        aria-label="Missões e progresso"
        onclick={openMissions}><CampGameIcon kind="mission" />Missões</button
      >{/if}
    {#if missionsOpen}<section
        class="mission-panel"
        aria-label="Missões e progresso"
      >
        <header>
          <h2>Missões e progresso</h2>
          <button
            class="icon-close"
            aria-label="Fechar missões e progresso"
            onclick={() => (missionsOpen = false)}>×</button
          >
        </header>
        <p>Seu perfil: {totalXp} XP acumulados · {inventory.gold} Ouro.</p>
        <p>
          Atividades e projetos mantêm suas recompensas e evolução. O
          acampamento não concede XP ou ouro por simulações.
        </p>
        <button class="claim-mission" onclick={openRealMissions}
          >Abrir minhas missões</button
        >
        <p>
          <a href="/projetos">Meus projetos</a> ·
          <a href="/progresso">Meu progresso</a>
        </p>
      </section>{/if}
    <div class="build-tools">
      <button
        type="button"
        onclick={() => {
          resourcePanel = null;
          missionsOpen = false;
          if (placing) cancelBuilding();
          reorganizing = false;
          demolishing = false;
          catalogOpen = !catalogOpen;
          selection = null;
          removePending = false;
        }}
        class:active={catalogOpen || (placing && !movingId)}
        aria-expanded={catalogOpen}
        aria-label="Construir"
        ><CampGameIcon kind="build" size={28} /> Construir</button
      >
      <button
        type="button"
        onclick={toggleReorganization}
        class:active={reorganizing}
        aria-pressed={reorganizing}
        aria-label="Modo mover construções"
        title="Reorganizar: arraste os prédios; Esc sai"
        ><CampGameIcon kind="move" size={28} /> Mover</button
      >
      {#if reorganizing}<small>Modo mover ativo · Esc sai</small>{/if}
      <button
        type="button"
        onclick={toggleDemolition}
        class:active={demolishing}
        aria-label="Modo destruir construções"
        aria-pressed={demolishing}
        ><CampGameIcon kind="destroy" size={28} /> Destruir</button
      >
      {#if demolishing}<small
          >Clique no prédio · confirmação sem reembolso · Esc sai</small
        >{/if}
    </div>
    <div class="resource-bar" role="group" aria-label="Recursos do acampamento">
      {#each Object.entries(resourceNames) as [key, name] (key)}
        <button
          type="button"
          data-stock-resource={key}
          aria-label={`${name}: ${inventory[key as CampResource]}. Ver detalhes`}
          aria-expanded={resourcePanel === key}
          aria-controls="camp-resource-panel"
          onclick={() => toggleResourcePanel(key as CampResource)}
          title={name}
          ><CampResourceIcon resource={key as CampResource} />
          <span class="resource-name">{name}</span><strong
            >{inventory[key as CampResource]}</strong
          ><small
            >{key === 'gold'
              ? 'pontual'
              : `${productionRate(buildings, inventory, key as CampResource)}/h`}</small
          ></button
        >
      {/each}
      <button
        type="button"
        class="inventory-toggle"
        aria-label="Inventário de materiais e itens"
        aria-expanded={resourcePanel === 'inventory'}
        aria-controls="camp-resource-panel"
        onclick={() => toggleResourcePanel('inventory')}
        title="Inventário de materiais e itens"
        ><CampGameIcon kind="inventory" size={28} /><span>Inventário</span
        ></button
      >
    </div>
    {#if resourcePanel}
      <section
        id="camp-resource-panel"
        class="resource-panel"
        aria-label={resourcePanel === 'inventory'
          ? 'Inventário expandido'
          : `Detalhes de ${resourceNames[resourcePanel]}`}
      >
        <div class="resource-panel-heading">
          <h2>
            {resourcePanel === 'inventory'
              ? 'Inventário'
              : resourceNames[resourcePanel]}
          </h2>
          <button
            type="button"
            aria-label="Fechar painel de recursos"
            onclick={() => (resourcePanel = null)}>✕</button
          >
        </div>
        <span class="eyebrow">Acampamento · progresso salvo</span>
        {#if resourcePanel === 'inventory'}
          <h3>Materiais e saldo da jornada</h3>
          <p>
            Madeira, pedra e ferro são do acampamento. Ouro mostra o saldo da
            jornada.
          </p>
          <dl class="camp-inventory material-inventory">
            {#each Object.entries(resourceNames) as [key, name] (key)}<div>
                <dt>
                  <CampResourceIcon resource={key as CampResource} />
                  {name}
                </dt>
                <dd data-inventory-resource={key}>
                  {inventory[key as CampResource]}
                </dd>
              </div>{/each}
          </dl>
          <h3>Itens produzidos</h3>
          <dl class="camp-inventory item-inventory">
            <div>
              <dt>Espadas de treino</dt>
              <dd data-inventory-resource="trainingSword">
                {inventory.trainingSword}
              </dd>
            </div>
          </dl>
          <p>
            As forjas concluídas usam estes materiais e enviam os itens para
            este inventário.
          </p>
          {#each buildings.filter((building) => building.sprite === 'store') as store (store.id)}<button
              class="resource-link"
              type="button"
              onclick={() => focusResourceBuilding(store.id)}
              >Ver {store.name} no mapa</button
            >{/each}
        {:else if resourcePanel === 'gold'}
          <p>Saldo da jornada: {inventory.gold} Ouro.</p>
          <p>
            Ouro, XP e comida seguem os serviços e recompensas da sua jornada. A
            produção do acampamento gera apenas madeira, pedra e ferro.
          </p>
          <a href="/progresso">Conferir histórico da jornada →</a>
        {:else if resourceDetail}
          <dl class="camp-inventory resource-totals">
            <div>
              <dt>Estoque atual</dt>
              <dd data-detail="stock">{resourceDetail.stock}</dd>
            </div>
            <div>
              <dt>Ganhos pontuais</dt>
              <dd data-detail="gains">+{resourceDetail.gains}</dd>
            </div>
            <div>
              <dt>Produção de recurso</dt>
              <dd data-detail="production">{resourceDetail.produced}</dd>
            </div>
            <div>
              <dt>Consumo registrado</dt>
              <dd data-detail="consumption">−{resourceDetail.consumed}</dd>
            </div>
            <div>
              <dt>Saldo dos materiais</dt>
              <dd data-detail="net">
                {resourceDetail.net >= 0 ? '+' : ''}{resourceDetail.net}
              </dd>
            </div>
          </dl>

          <h3>Produção recorrente</h3>
          <p data-resource-rate={resourcePanel}>
            {productionRate(buildings, inventory, resourcePanel)}
            {resourceNames[resourcePanel].toLowerCase()}/h · estoque {inventory[
              resourcePanel
            ]}/{materialCapacity(buildings, resourcePanel)}
          </p>
          {#if inventory[resourcePanel] >= materialCapacity(buildings, resourcePanel)}<p
            >
              Armazém cheio: produção pausada. Excedentes são descartados.
            </p>{/if}
          {#each producers(resourcePanel) as producer (producer.id)}<p>
              {producer.name}: {inventory[resourcePanel] >=
              materialCapacity(buildings, resourcePanel)
                ? 0
                : producerRate(producer)}/h · {producedBy(
                producer.id,
                resourcePanel,
              )} produzidos.
              <button
                class="resource-link"
                type="button"
                onclick={() => focusResourceBuilding(producer.id)}
                >Centralizar {producer.name}</button
              >
            </p>{/each}
          {#if !producers(resourcePanel).length}<p>
              Nenhum produtor concluído deste material.
            </p>{/if}

          <details class="resource-disclosure">
            <summary>Movimentação e origens</summary>
            <h3>Origem dos ganhos pontuais</h3>
            <p>
              +{initialResource(resourcePanel)} de {resourceNames[
                resourcePanel
              ].toLowerCase()}: provisão inicial única do acampamento. Nenhum
              edifício gera esse ganho.
            </p>
            {#each (inventory.events ?? []).filter((event) => event.kind === 'mission' && event.delta[resourcePanel as CampResource] > 0) as event (event.id)}<p
              >
                +{event.delta[resourcePanel as CampResource]} · {event.name} · recompensa
                pontual.
              </p>{/each}
            <h3>Consumo por origem</h3>
            {#if resourceDetail.origins.length}<ul>
                {#each resourceDetail.origins as origin (origin.id)}<li>
                    {origin.name}: −{origin.consumed} em fabricação ou melhorias.
                    {#if buildings.some((building) => building.id === origin.id)}<button
                        class="resource-link"
                        type="button"
                        onclick={() => focusResourceBuilding(origin.id)}
                        >Ver {origin.name} no mapa</button
                      >{:else}<small>Construção removida.</small>{/if}
                  </li>{/each}
              </ul>{:else}<p>Nenhum consumo registrado.</p>{/if}
            <h3>Como obter mais</h3>
            <p>
              Conclua um produtor deste material; designe um trabalhador para
              dobrar sua produtividade. A produção respeita a capacidade do
              armazém. Seu progresso permanece após recarregar.
            </p>
          </details>
        {/if}
      </section>
    {/if}
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
      onlostpointercapture={pointerUp}
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
            class:held={gestureKind === 'building'}
            style:left={proposed.x + 'px'}
            style:top={proposed.y + 'px'}
            style:z-index={Math.round(proposed.y) + 1}
          >
            <svg class="placement-base" aria-hidden="true"
              ><polygon points={previewPoints} /><path
                class="ground-heading"
                d={`M0,${-placementSprite.footprint.height / 2} L${previewHeading.x},${previewHeading.y}`}
              /><circle
                class="ground-heading"
                cx={previewHeading.x}
                cy={previewHeading.y}
                r="5"
              /></svg
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
              style:transform-origin={`${(placementSprite.pivot.x * placementSprite.worldWidth) / placementSprite.source.width}px ${(placementSprite.pivot.y * placementSprite.worldWidth) / placementSprite.source.width}px`}
              style:filter={placementSprite.tint ?? ''}
              style:transform={proposedRotation === 180 ? 'scaleX(-1)' : 'none'}
            />
            <button
              class="placement-handle"
              data-placement-handle
              type="button"
              aria-label="Arrastar prévia da construção"
              style:width={`${placementSprite.footprint.width}px`}
              style:height={`${placementSprite.footprint.height}px`}
              style:left={`${-placementSprite.footprint.width / 2}px`}
              style:top={`${-placementSprite.footprint.height}px`}
            ></button>
            <span
              >{proposedError
                ? '✕ Confirmação indisponível'
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
              rotation={building.rotation ?? 0}
              kind={building.sprite}
              level={buildingLevel(building)}
              producing={isProducer(building.sprite) &&
                building.status === 'ready' &&
                inventory[producerRules[building.sprite].resource] <
                  materialCapacity(
                    buildings,
                    producerRules[building.sprite].resource,
                  )}
              phase={building.status}
              selected={selection?.id === building.id}
              muted={movingId === building.id}
              onselect={() => choose(building)}
            />
          {/if}
        {/each}
      </div>
    </div>
    {#if controlPoint && !catalogOpen && (placing || !reorganizing)}
      <div
        class="construction-controls"
        data-placement-controls
        style:left={`${controlX}px`}
        style:top={`${controlY}px`}
      >
        <span class="control-name"
          >{placing
            ? movingId
              ? selection?.name
              : 'Nova forja'
            : selection?.name}</span
        >
        <div
          class="control-buttons"
          role="group"
          aria-label="Ações da construção"
        >
          {#if removePending}
            <button
              type="button"
              class="danger-control"
              onclick={removeSelected}
              aria-label="Confirmar destruição">Destruir</button
            >
            <button
              type="button"
              onclick={() => {
                removePending = false;
                selection = null;
              }}
              aria-label="Cancelar destruição">Cancelar</button
            >
          {:else if placing}
            <button
              type="button"
              onclick={rotateBuilding}
              aria-label="Girar"
              title="Espelhar construção (R)"
              aria-keyshortcuts="R">↻ <span>Girar</span><kbd>R</kbd></button
            >
            <button
              type="button"
              class="confirm-control"
              onclick={confirmBuilding}
              disabled={!proposed || !!proposedError || dragging}
              aria-label={movingId ? 'Confirmar mudança' : 'Confirmar posição'}
              title="Confirmar (Enter)">✓</button
            >
            <button
              type="button"
              onclick={cancelBuilding}
              aria-label="Cancelar"
              title="Cancelar (Esc)">✕</button
            >
          {:else}
            <button
              type="button"
              onclick={beginMove}
              aria-label="Mover"
              title="Mover construção">✥ <span>Mover</span></button
            >
            <button
              type="button"
              onclick={rotateSelected}
              aria-label="Girar"
              title="Espelhar construção">↻ <span>Girar</span></button
            >
            {#if selection?.status === 'building'}<button
                type="button"
                onclick={finishSelected}
                aria-label="Concluir construção"
                title="Concluir construção">✓</button
              >{/if}
          {/if}
        </div>
        {#if removePending}<small
            >Destruir {selection?.name}? Sem reembolso. O trabalhador ficará
            livre.</small
          >{:else if placing}<small
            class:placement-error={!!proposedError}
            role="status"
            >{proposedError ||
              'Arraste a base · R gira · Enter confirma · Esc cancela'}</small
          >{/if}
      </div>
    {/if}
    {#if selection && !placing && !removePending && !reorganizing && !demolishing && !resourcePanel}
      <section
        class="building-utility"
        aria-label={`Painel de ${selection.name}`}
      >
        <div class="building-panel-header">
          <span class="building-crest" data-kind={selection.sprite}
            ><CampBuildingIcon kind={selection.sprite} /></span
          >
          <div>
            <span class="eyebrow"
              >{buildingRules[selection.sprite].name} · nível {buildingLevel(
                selection,
              )}</span
            >
            <h2>{selection.name}</h2>
          </div>
          <button
            type="button"
            class="panel-close"
            aria-label="Fechar painel da construção"
            onclick={() => (selection = null)}>✕</button
          >
        </div>
        <span
          class="building-state"
          class:under-construction={selection.status === 'building'}
          ><i></i>{selection.status === 'building'
            ? 'Em construção'
            : isProducer(selection.sprite)
              ? inventory[producerRules[selection.sprite].resource] >=
                materialCapacity(
                  buildings,
                  producerRules[selection.sprite].resource,
                )
                ? 'Armazenamento cheio'
                : 'Produzindo'
              : 'Concluído'}</span
        >
        <div class="building-panel-content">
          {#if selection.sprite === 'hall'}
            <p>Edifícios do acampamento</p>
            <table aria-label="Resumo dos edifícios">
              <thead
                ><tr
                  ><th>Tipo</th><th>Prontos</th><th>Em obra</th><th>Total</th
                  ></tr
                ></thead
              >
              <tbody
                >{#each campSummary as row (row.type)}<tr
                    data-building-type={row.type}
                    ><th scope="row">{row.name}</th><td>{row.ready}</td><td
                      >{row.building}</td
                    ><td>{row.total}</td></tr
                  >{/each}</tbody
              >
              <tfoot
                ><tr
                  ><th scope="row">Total</th><td
                    >{campSummary.reduce((sum, row) => sum + row.ready, 0)}</td
                  ><td
                    >{campSummary.reduce(
                      (sum, row) => sum + row.building,
                      0,
                    )}</td
                  ><td
                    >{campSummary.reduce((sum, row) => sum + row.total, 0)}</td
                  ></tr
                ></tfoot
              >
            </table>
          {:else}
            <details class="stock-disclosure">
              <summary>Reservas e itens</summary>
              <dl class="camp-inventory">
                {#each Object.entries(resourceNames) as [resource, name] (resource)}<div
                  >
                    <dt>{name}</dt>
                    <dd data-resource={resource}>
                      {inventory[resource as CampResource]}
                    </dd>
                  </div>{/each}
                <div>
                  <dt>Espadas de treino</dt>
                  <dd data-resource="trainingSword">
                    {inventory.trainingSword}
                  </dd>
                </div>
              </dl>
            </details>
            {#if isProducer(selection.sprite)}
              <h3 class="duplicate-title">
                {buildingRules[selection.sprite].name} · nível {buildingLevel(
                  selection,
                )}
              </h3>
              {#if selection.status !== 'ready'}<p>
                  Conclua a construção para iniciar a produção.
                </p>
              {:else}
                <p data-producer-rate>
                  Produção: {inventory[
                    producerRules[selection.sprite].resource
                  ] >=
                  materialCapacity(
                    buildings,
                    producerRules[selection.sprite].resource,
                  )
                    ? 0
                    : producerRate(selection)}
                  {resourceNames[
                    producerRules[selection.sprite].resource
                  ].toLowerCase()}/h
                </p>
                <p class="capacity-explainer">
                  Armazenamento: {inventory[
                    producerRules[selection.sprite].resource
                  ]}/{materialCapacity(
                    buildings,
                    producerRules[selection.sprite].resource,
                  )} · trabalhador ×2.
                </p>
                <label class="worker-field"
                  >Trabalhador de {selection.name}
                  <select
                    aria-label={`Trabalhador de ${selection.name}`}
                    value={selection.production?.workerId ?? ''}
                    onchange={changeWorker}
                  >
                    <option value="">Nenhum trabalhador</option>
                    {#each demoWorkers as worker (worker.id)}<option
                        value={worker.id}
                        disabled={buildings.some(
                          (b) =>
                            b.id !== selection!.id &&
                            b.production?.workerId === worker.id,
                        )}
                        >{worker.name}{buildings.some(
                          (b) =>
                            b.id !== selection!.id &&
                            b.production?.workerId === worker.id,
                        )
                          ? ' · ocupado'
                          : ''}</option
                      >{/each}
                  </select>
                </label>
                <p class="worker-availability">
                  {demoWorkers.filter(
                    (worker) =>
                      !buildings.some(
                        (b) => b.production?.workerId === worker.id,
                      ),
                  ).length} de {demoWorkers.length} trabalhadores livres.
                </p>
              {/if}
            {:else if selection.sprite === 'store'}
              <p class="store-capacity">
                Capacidade: <strong
                  >{materialCapacity(buildings, 'wood')}</strong
                > por material.
              </p>
              <small
                >Madeira, pedra e ferro têm limites independentes. Ouro e itens
                ficam separados.</small
              >
            {:else if selection.sprite === 'forge'}
              <h3>{demoRecipe.name}</h3>
              <p class="recipe-cost">
                Custo: {demoRecipe.cost.wood} madeira · {demoRecipe.cost.stone} pedra
                · {demoRecipe.cost.iron} ferro
              </p>
              <button
                class="craft-button"
                type="button"
                onclick={fabricate}
                disabled={!!forgeError}>Fabricar espada de treino</button
              >
              <p class:placement-error={!!forgeError} role="status">
                {forgeError ||
                  workshopMessage ||
                  'Pronta para fabricar. O item vai para o armazém.'}
              </p>
            {/if}
          {/if}
        </div>
        <div class="improvement-section">
          {#if selection.status === 'ready' && buildingRules[selection.sprite].max > 1}
            {#if buildingLevel(selection) >= buildingRules[selection.sprite].max}
              <p class="max-level">
                Nível máximo atingido · {buildingLevel(selection)}. Nenhuma
                melhoria adicional.
              </p>
            {:else}
              <h3>Melhorar para nível {buildingLevel(selection) + 1}</h3>
              <p>
                {selection.sprite === 'store'
                  ? 'Amplia o limite de madeira, pedra e ferro.'
                  : '+50% da produção base do nível 1.'}
              </p>
              <p>
                Custo: {describeCost(
                  buildingRules[selection.sprite].upgrades[
                    buildingLevel(selection) - 1
                  ],
                )}
              </p>
              {#if selection.sprite === 'mine' && buildingLevel(selection) === 2}<p
                >
                  Requisito: um trabalhador designado para desbloquear o nível
                  3.
                </p>{/if}
              <button
                type="button"
                class="craft-button"
                onclick={improveSelected}
                disabled={!!upgradeError(buildings, selection.id, inventory)}
                aria-label={`Melhorar ${buildingRules[selection.sprite].name}`}
                >Melhorar {buildingRules[selection.sprite].name}</button
              >
              <p role="status">
                {upgradeError(buildings, selection.id, inventory) ||
                  workshopMessage ||
                  'Melhoria disponível.'}
              </p>
            {/if}
          {/if}
        </div>
        <small class="session-note"
          >Produção e construções salvas neste navegador.</small
        >
      </section>
    {/if}

    {#if placing || catalogOpen || selection}
      <div
        class="bottom"
        class:catalog-visible={catalogOpen}
        class:contextual={placing ||
          reorganizing ||
          demolishing ||
          removePending ||
          (!!selection && !removePending)}
      >
        <div class="build-info">
          {#if placing}
            <span class="eyebrow"
              >{movingId ? 'Reposicionar' : 'Modo construção'} · Refúgio</span
            >
            <h2>
              {movingId
                ? 'Mover construção'
                : `Posicionar ${constructionCatalog[chosenType].name.toLowerCase()}`}
            </h2>
            <p>
              Segure a base destacada para arrastar a construção. Arraste o
              terreno para explorar. Setas movem, R espelha, Enter confirma e
              Esc cancela.
            </p>
            <small
              >{proposedRotation === 180 ? 'Espelhada' : 'Orientação original'}.
              Duas vistas por espelhamento, com a mesma área ocupada.</small
            >
            <p role="status" class:placement-error={!!proposedError}>
              {proposedError || 'Posição livre. Confirme para continuar.'}
            </p>
            <button
              class="quiet-action"
              type="button"
              onclick={rotateBuilding}
              aria-keyshortcuts="R">Girar · R</button
            >
            <div class="placement-actions">
              <button
                type="button"
                onclick={confirmBuilding}
                disabled={!proposed || !!proposedError}
                >{movingId ? 'Confirmar mudança' : 'Confirmar posição'}</button
              ><button type="button" onclick={cancelBuilding}>Cancelar</button>
            </div>
          {:else if catalogOpen}
            <span class="eyebrow">Catálogo · recursos de construção</span>
            <h2>Construções</h2>
            <p>
              Posicione em qualquer área livre do mapa. Escolha a posição
              diretamente no terreno.
            </p>
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
                  ><strong>{item.name}</strong><small>{item.purpose}</small
                  ><small
                    >Custo: {describeCost(
                      buildingRules[item.sprite].build,
                    )}</small
                  ></span
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
                  : 'Concluído'}{selection.status !== 'site'
                ? ` · ${selection.rotation ?? 0}°`
                : ''}</span
            >
            <h2>{selection.name}</h2>
            <p>{selection.purpose}</p>
            {#if removePending}
              <p>
                Remover {selection.name}? Materiais gastos não serão devolvidos.
                Trabalhadores designados ficarão livres.
              </p>
              <div class="placement-actions">
                <button onclick={removeSelected}>Confirmar remoção</button
                ><button onclick={() => (removePending = false)}
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
          {/if}
        </div>
      </div>
    {/if}
  </section>
  <p class="disclaimer">
    Terreno e edifícios reaproveitados do acervo do LMUP. Progresso salvo neste
    navegador e incluído no backup da jornada. Materiais de construção são
    separados de XP, ouro e comida.
  </p>
</div>

<style>
  .camp-save-status {
    font-size: 0.8rem;
    color: #b7c9bc;
    margin-bottom: 8px;
  }
  .camp-save-error {
    color: #ffdbb1;
    padding: 10px;
    border: 1px solid #d49d59;
  }
  .control-buttons .danger-control {
    background: #6d3028;
    color: #ffe4d5;
  }
  .missions-toggle {
    position: absolute;
    z-index: 4;
    top: 100px;
    left: 16px;
    padding: 9px 12px;
    border: 1px solid #89764f;
    border-radius: 6px;
    background: #14241ff2;
    color: #f1dfb5;
    cursor: pointer;
    font-size: 12px;
  }
  .worker-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    margin: 12px 0;
  }
  .worker-field select {
    background: #273c31;
    color: #f1dfb5;
    border: 1px solid #89764f;
    border-radius: 5px;
    padding: 8px;
  }
  .max-level {
    padding: 8px;
    border: 1px solid #ae946260;
    border-radius: 5px;
    color: #ffe2a2;
  }
  .resource-bar small {
    font-size: 9px;
    color: #bcbfae;
  }
  .resource-bar {
    position: absolute;
    z-index: 5;
    right: 76px;
    top: 14px;
    display: flex;
    gap: 3px;
    padding: 4px;
    background: #10201be8;
    border: 1px solid #ae946260;
    border-radius: 7px;
  }
  .resource-bar button {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: #f0e9db;
    border-radius: 4px;
    padding: 6px 9px;
    cursor: pointer;
    font-size: 13px;
  }
  .resource-bar button:hover,
  .resource-bar button[aria-expanded='true'] {
    background: #344736;
    border-color: #ae9462;
  }
  .resource-bar strong {
    font-variant-numeric: tabular-nums;
  }
  .resource-bar .inventory-toggle {
    border-left-color: #ae946260;
    font-size: 11px;
  }
  .resource-panel {
    position: absolute;
    z-index: 5;
    top: 70px;
    right: 76px;
    width: 320px;
    max-height: calc(100% - 150px);
    overflow: auto;
    padding: 16px;
    border: 1px solid #ae9462;
    border-radius: 8px;
    background: #10201bf8;
    color: #f0e9db;
    box-shadow: 0 5px 20px #0005;
  }
  .resource-panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .resource-panel h2 {
    font-size: 17px;
    margin: 0;
  }
  .resource-panel-heading button {
    border: 0;
    background: transparent;
    color: #e2c58b;
    cursor: pointer;
    padding: 4px 7px;
  }
  .resource-panel h3 {
    margin: 16px 0 6px;
    font-size: 12px;
    color: #e2c58b;
  }
  .resource-panel p,
  .resource-panel li {
    font-size: 12px;
    line-height: 1.5;
    margin: 5px 0;
  }
  .resource-panel small {
    display: block;
    font-size: 10px;
    line-height: 1.5;
    color: #bcbfae;
    margin-top: 8px;
  }
  .resource-panel ul {
    padding-left: 17px;
  }
  .resource-link {
    display: inline-block;
    padding: 4px 0;
    color: #ffe2a2;
    text-decoration: underline;
    border: 0;
    background: none;
    cursor: pointer;
    font-size: 12px;
  }
  .resource-totals {
    margin-top: 15px !important;
  }
  .resource-bar button:focus-visible,
  .resource-panel button:focus-visible {
    outline: 2px solid #ffe4a3;
    outline-offset: 2px;
  }
  .building-utility {
    position: absolute;
    right: 16px;
    bottom: 78px;
    z-index: 3;
    width: 290px;
    max-height: calc(100% - 185px);
    overflow: auto;
    padding: 16px;
    border: 1px solid #ae9462;
    border-radius: 9px;
    background: #10201bf5;
    color: #f0e9db;
    box-shadow: 0 5px 20px #0005;
  }
  .building-utility h2 {
    font-size: 18px;
    margin: 5px 0 12px;
  }
  .building-utility h3 {
    font-size: 13px;
    color: #e2c58b;
    margin: 12px 0 8px;
  }
  .building-utility p {
    font-size: 12px;
    line-height: 1.5;
    margin: 8px 0;
  }
  .building-utility small {
    display: block;
    font-size: 10px;
    line-height: 1.5;
    color: #bcbfae;
    margin-top: 12px;
  }
  .building-utility table {
    width: 100%;
    font-size: 11px;
    border-collapse: collapse;
  }
  .building-utility th,
  .building-utility td {
    padding: 7px 3px;
    border-bottom: 1px solid #ae946245;
    text-align: right;
  }
  .building-utility th:first-child {
    text-align: left;
  }
  .camp-inventory {
    margin: 0;
  }
  .camp-inventory div {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 13px;
    border-bottom: 1px solid #ae946230;
  }
  .camp-inventory dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    color: #ffe2a2;
  }
  .craft-button {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid #ae9462;
    border-radius: 5px;
    background: #e2c58b;
    color: #17271d;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .craft-button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .construction-controls {
    display: none;
  }
  @media (min-width: 701px) {
    .bottom.contextual {
      display: none;
    }
    .construction-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;
      z-index: 4;
      transform: translate(-50%, -100%);
      width: max-content;
      max-width: 280px;
      gap: 5px;
      pointer-events: none;
    }
    .control-name {
      font-size: 11px;
      padding: 3px 7px;
      border-radius: 4px;
      background: #10201bf0;
      color: #f0e9db;
    }
    .control-buttons {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: #10201bf0;
      border: 1px solid #ae9462;
      border-radius: 8px;
      pointer-events: auto;
      box-shadow: 0 3px 10px #0006;
    }
    .control-buttons button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-width: 34px;
      height: 34px;
      padding: 0 9px;
      border: 1px solid #8d8059;
      border-radius: 5px;
      background: #273c31;
      color: #ffebbd;
      cursor: pointer;
      font-size: 16px;
    }
    .control-buttons button span {
      font-size: 12px;
    }
    .control-buttons button:hover {
      background: #476047;
    }
    .control-buttons button:focus-visible {
      outline: 2px solid #ffe4a3;
      outline-offset: 2px;
    }
    .control-buttons button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .control-buttons .confirm-control {
      background: #e2c58b;
      color: #17271d;
    }
    .control-buttons kbd {
      font: 10px system-ui;
      opacity: 0.65;
    }
    .construction-controls small {
      max-width: 270px;
      background: #10201bea;
      color: #e3dcc3;
      border-radius: 4px;
      padding: 4px 7px;
      font-size: 10px;
      text-align: center;
    }
  }
  .ground-heading {
    stroke: #fff0b5;
    stroke-width: 4;
    fill: #fff0b5;
  }
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
    overflow: clip;
    border-block: 1px solid #6b6448;
    background: #344c35;
  }
  .viewport {
    position: absolute;
    inset: 0;
    overflow: clip;
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
    overflow: clip;
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
    z-index: 6;
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
  @media (min-width: 701px) {
    .build-tools {
      top: auto;
      left: auto;
      right: 16px;
      bottom: 16px;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .build-tools button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 132px;
      height: 46px;
      background: #14241ff2;
      color: #f1dfb5;
      box-shadow: 0 3px 12px #0005;
    }
    .build-tools button.active {
      background: #e3c182;
      color: #1b211b;
      outline: 2px solid #fff0bd;
      outline-offset: 2px;
    }
    .build-tools small {
      position: absolute;
      bottom: 53px;
      right: 0;
      white-space: nowrap;
      background: #10201bf0;
      color: #ffe2a2;
      font-size: 11px;
      padding: 5px 8px;
      border-radius: 4px;
    }
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
    z-index: 1;
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
    .build-info {
      max-height: 245px;
    }
    .hud span {
      max-width: 180px;
    }
  }
  .placement-handle {
    position: absolute;
    pointer-events: auto;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    border: 0;
    padding: 0;
    background: transparent;
    cursor: grab;
    touch-action: none;
  }
  .held .placement-handle {
    cursor: grabbing;
  }
  .placement-preview:has(.placement-handle:focus-visible)
    .placement-base
    polygon {
    stroke: #fff1b5;
    stroke-width: 5;
  }

  @media (min-width: 701px) {
    .shell {
      --panel: #15221ef7;
      --line: #b2a27a40;
      --gold: #d7c18d;
      --muted: #a5ad9f;
      color: #ede8d9;
    }
    .top {
      min-height: 68px;
      padding: 10px 22px;
      background: #111c19;
      border-bottom: 1px solid var(--line);
    }
    .top h1 {
      font-family: Georgia, serif;
      font-weight: 400;
      letter-spacing: 0.01em;
      font-size: 23px;
    }
    .top a {
      font-size: 11px;
      color: #bbb7a5;
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 8px 12px;
      border-radius: 3px;
    }
    .eyebrow {
      color: #b9a777;
      font-size: 9px;
      letter-spacing: 0.13em;
      line-height: 1.6;
    }
    .game {
      border: 1px solid #b1a27640;
      box-shadow: inset 0 0 80px #07120a60;
    }
    .hud {
      top: 18px;
      left: 20px;
      border: 1px solid var(--line);
      border-left: 3px solid #baaa76;
      border-radius: 3px;
      background: #14221de8;
      padding: 12px 15px;
      box-shadow: 0 4px 16px #0003;
    }
    .hud strong {
      font:
        16px Georgia,
        serif;
      letter-spacing: 0.06em;
      color: #e6d9b7;
    }
    .hud span {
      color: #aab6a6;
      font-size: 10px;
    }
    .missions-toggle {
      left: 20px;
      top: 108px;
      padding: 10px 13px;
      border-color: var(--line);
      border-radius: 3px;
      background: linear-gradient(#26372d, #18271f);
      font-size: 11px;
      color: #ddd1b3;
      box-shadow: 0 3px 9px #0003;
    }
    .resource-bar {
      top: 18px;
      right: 78px;
      gap: 0;
      padding: 5px;
      border: 1px solid #b6a57770;
      border-radius: 4px;
      background: linear-gradient(#24342bf5, #15251ef5);
      box-shadow:
        0 4px 15px #0005,
        inset 0 1px #e6d5a612;
    }
    .resource-bar button {
      display: grid;
      grid-template-columns: 22px auto;
      grid-template-rows: 13px 21px;
      column-gap: 8px;
      row-gap: 0;
      min-width: 87px;
      height: 48px;
      padding: 6px 12px;
      border-radius: 2px;
      border-right: 1px solid var(--line);
      text-align: left;
    }
    .resource-bar button :global(svg) {
      grid-column: 1;
      grid-row: 1 / 3;
      width: 21px;
      height: 21px;
      align-self: center;
    }
    .resource-name {
      grid-column: 2;
      grid-row: 1;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.09em;
      color: #b7bda9;
    }
    .resource-bar strong {
      grid-column: 2;
      grid-row: 2;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #f0e4c5;
      line-height: 21px;
    }
    .resource-bar small {
      grid-column: 3;
      grid-row: 2;
      font-size: 9px;
      align-self: end;
      color: #a7c099;
      padding: 0 0 2px 2px;
    }
    .resource-bar button:hover,
    .resource-bar button[aria-expanded='true'] {
      background: #d1b77513;
      border-color: #c7b38380;
    }
    .resource-bar .inventory-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 48px;
      gap: 7px;
      border: 0;
      min-width: 90px;
      color: #d6c8a8;
      font-size: 11px;
    }
    .resource-panel,
    .building-utility {
      top: 96px;
      right: 78px;
      bottom: 84px;
      width: 360px;
      max-height: none;
      padding: 18px;
      border: 1px solid #b3a17a70;
      border-radius: 5px;
      background: linear-gradient(135deg, #203129fa, #14211dfa 65%);
      box-shadow:
        0 10px 32px #0006,
        inset 0 1px #f3dfaa14;
      scrollbar-width: thin;
      scrollbar-color: #80734e #17271e;
      overscroll-behavior: contain;
    }
    .resource-panel-heading,
    .building-panel-header {
      display: flex;
      gap: 12px;
      align-items: center;
      padding-bottom: 13px;
      margin-bottom: 10px;
      border-bottom: 1px solid var(--line);
    }
    .resource-panel h2,
    .building-utility h2 {
      font-family: Georgia, serif;
      font-size: 24px;
      line-height: 1.12;
      font-weight: 400;
      color: #f0e3c3;
      margin: 0;
    }
    .resource-panel h3,
    .building-utility h3 {
      margin: 13px 0 7px;
      color: #d1bf95;
      font-size: 11px;
      letter-spacing: 0.035em;
      font-weight: 600;
    }
    .resource-panel p,
    .resource-panel li,
    .building-utility p {
      font-size: 12px;
      line-height: 1.55;
      margin: 7px 0;
      color: #c4ccbe;
    }
    .resource-panel small,
    .building-utility small {
      color: #99a695;
      font-size: 10px;
      line-height: 1.5;
    }
    .building-panel-header > div {
      flex: 1;
    }
    .building-crest {
      flex: 0 0 42px;
      height: 46px;
      display: grid;
      place-items: center;
      border: 1px solid #baaa7660;
      border-radius: 3px 3px 12px 12px;
      background: #aa95651a;
      color: #dac58d;
    }
    .building-crest :global(svg) {
      width: 28px;
      height: 28px;
    }
    .building-crest[data-kind='quarry'],
    .building-crest[data-kind='mine'] {
      color: #c2ced0;
      background: #a3bbc318;
      border-color: #b2c3c349;
    }
    .panel-close,
    .resource-panel-heading button {
      margin-left: auto;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      border: 1px solid transparent;
      border-radius: 3px;
      color: #bfb49c;
      background: transparent;
      cursor: pointer;
      padding: 0;
    }
    .panel-close:hover,
    .resource-panel-heading button:hover {
      background: #ffffff09;
      border-color: var(--line);
    }
    .building-state {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #b3cba7;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .building-state i {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }
    .building-state.under-construction {
      color: #d9b67f;
    }
    .camp-inventory {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      margin: 8px 0;
    }
    .camp-inventory div {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 10px;
      border: 1px solid #a8b49a20;
      border-radius: 3px;
      background: #07150d28;
      font-size: 11px;
    }
    .camp-inventory dt {
      font-size: 10px;
      line-height: 1.3;
      color: #abb8a4;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .camp-inventory dd {
      font-size: 20px;
      line-height: 1;
      color: #ecdfbb;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    .resource-totals > div:first-child {
      grid-column: 1/-1;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      background: #b7a27413;
      padding: 13px;
      border-color: #d6bd7e40;
    }
    .resource-totals > div:first-child dt {
      font-size: 12px;
      color: #c8c9b6;
    }
    .resource-totals > div:first-child dd {
      font:
        34px Georgia,
        serif;
      color: #f2dfaa;
    }
    .resource-totals dd {
      font-size: 19px;
    }
    .stock-disclosure {
      margin: 6px 0 10px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    .stock-disclosure > summary,
    .resource-disclosure > summary {
      cursor: pointer;
      color: #bfb69c;
      font-size: 11px;
      padding: 9px 0;
    }
    .stock-disclosure .camp-inventory {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 5px;
    }
    .stock-disclosure .camp-inventory div {
      padding: 7px;
      gap: 5px;
    }
    .stock-disclosure .camp-inventory dt {
      font-size: 9px;
    }
    .stock-disclosure .camp-inventory dd {
      font-size: 17px;
    }
    .resource-disclosure {
      border-top: 1px solid var(--line);
      margin-top: 12px;
    }
    .resource-disclosure p,
    .resource-disclosure li {
      font-size: 11px;
    }
    .resource-disclosure ul {
      margin: 4px 0;
    }
    .resource-link {
      color: #d0bd91;
      font-size: 11px;
      text-underline-offset: 3px;
      padding: 4px 0;
    }
    [data-producer-rate],
    [data-resource-rate] {
      padding: 12px;
      background: #9ec88a0b;
      border: 1px solid #9db98b40;
      border-left: 2px solid #a8bc91;
      border-radius: 3px;
      color: #d4e3c7 !important;
      font-size: 17px !important;
      font-variant-numeric: tabular-nums;
    }
    .worker-field {
      font-size: 10px;
      color: #b5bba8;
      margin: 12px 0 6px;
      gap: 6px;
    }
    .worker-field select {
      min-height: 38px;
      border-color: #aea17c60;
      background: #1b2b23;
      color: #e0d6be;
      font-size: 12px;
    }
    .craft-button {
      min-height: 40px;
      padding: 10px 12px;
      border: 1px solid #c8b17a;
      border-radius: 3px;
      background: linear-gradient(#d7c28e, #bba16d);
      color: #20261c;
      font-size: 12px;
      font-weight: 600;
      box-shadow:
        inset 0 1px #fff5d638,
        0 3px 9px #0003;
      margin-top: 5px;
    }
    .craft-button:hover:enabled {
      background: linear-gradient(#e5d3a4, #c7b17d);
    }
    .craft-button:disabled {
      opacity: 0.48;
      filter: saturate(0.4);
    }
    .improvement-section {
      border-top: 1px solid var(--line);
      padding-top: 2px;
      margin-top: 12px;
    }
    .improvement-section:not(:has(button, .max-level)) {
      display: none;
    }
    .max-level {
      background: #a6bb8b0d;
      border: 1px solid #a1b08440;
      color: #bacda8 !important;
      padding: 12px;
      margin: 10px 0 !important;
    }
    .session-note {
      margin-top: 14px !important;
      padding-top: 10px;
      border-top: 1px solid #b2a27a22;
      font-size: 9px !important;
      color: #82917e !important;
    }
    .recipe-cost {
      padding: 10px;
      background: #c7aa6a0b;
      border: 1px solid var(--line);
      border-radius: 3px;
      color: #dfcda5 !important;
    }
    .building-utility table {
      font-size: 12px;
    }
    .building-utility th,
    .building-utility td {
      padding: 11px 5px;
      border-bottom-color: #aabb8f22;
    }
    .building-utility td {
      color: #e5d3a9;
      font-variant-numeric: tabular-nums;
    }
    .build-tools {
      right: 18px;
      bottom: 18px;
      gap: 5px;
      padding: 5px;
      background: linear-gradient(#26332af7, #14211cf7);
      border: 1px solid #aa9b7160;
      border-radius: 5px;
      box-shadow: 0 5px 22px #0005;
    }
    .build-tools button {
      width: 122px;
      height: 45px;
      border: 1px solid #bbac7d45;
      border-radius: 3px;
      box-shadow: inset 0 1px #ead7a00b;
      background: #c6b07808;
      color: #d8cfb5;
      font-size: 12px;
      font-weight: 500;
      gap: 9px;
    }
    .build-tools button:hover {
      background: #c6b07816;
      border-color: #bbac7d90;
    }
    .build-tools button.active {
      outline: none;
      background: linear-gradient(#cdb783, #a58b56);
      color: #18231b;
      border-color: #e3cea0;
      box-shadow: inset 0 1px #f7e5b5;
    }
    .build-tools button[aria-label='Modo destruir construções'] {
      color: #d1a696;
    }
    .build-tools button[aria-label='Modo destruir construções'].active {
      background: linear-gradient(#7d3f35, #552b26);
      border-color: #c08972;
      color: #f3dfcf;
      box-shadow: inset 0 1px #c99c7a25;
    }
    .build-tools small {
      bottom: 64px;
      right: -1px;
      font-size: 10px;
      padding: 7px 10px;
      color: #d7cfb5;
      border: 1px solid var(--line);
      border-radius: 3px;
    }
    .zoom-tools {
      right: 20px;
      top: 18px;
      gap: 6px;
    }
    .zoom-tools button {
      width: 38px;
      height: 38px;
      font-size: 21px;
      background: #16261eea;
      border: 1px solid #b6a57770;
      border-radius: 3px;
      color: #dfd0ab;
      box-shadow: 0 3px 9px #0003;
    }
    .construction-controls {
      gap: 5px;
    }
    .control-name {
      background: #15241ded;
      color: #ddcfad;
      font-size: 10px;
      border: 1px solid #a6986a55;
      padding: 4px 9px;
      border-radius: 3px;
    }
    .control-buttons {
      border-radius: 4px;
      padding: 4px;
      gap: 4px;
      background: linear-gradient(#29392e, #17271f);
      border-color: #c3b17b80;
      box-shadow: 0 4px 14px #0006;
    }
    .control-buttons button {
      height: 34px;
      background: #bbc08b09;
      border-color: #b7a67a50;
      border-radius: 2px;
      color: #e2d3ad;
    }
    .control-buttons button:hover {
      background: #b7a77b24;
    }
    .control-buttons .confirm-control {
      background: #c7b47f;
      color: #18271c;
      border-color: #ddc992;
    }
    .control-buttons .danger-control {
      background: #723e32;
      border-color: #b7826a;
      color: #f8dfcd;
    }
    .construction-controls small {
      font-size: 10px;
      padding: 6px 9px;
      background: #14231df2;
      border: 1px solid #a3a87935;
      color: #c0cdb2;
      border-radius: 3px;
    }
    .placement-preview {
      opacity: 0.88;
    }
    .placement-base polygon {
      fill: #8fbfa925;
      stroke: #b7ddbd;
      stroke-width: 2;
    }
    .invalid .placement-base polygon {
      fill: #be64582c;
      stroke: #df9b88;
    }
    .placement-preview span {
      top: 16px;
      background: #14251de8;
      border: 1px solid #a4b58b60;
      border-radius: 3px;
      font-size: 11px;
      padding: 5px 8px;
      color: #d7e3cb;
    }
    .bottom:not(.catalog-visible):not(.contextual) .build-info {
      width: max-content;
      max-width: 350px;
      background: #14251dc9;
      border: 1px solid #a4b58b30;
      border-radius: 3px;
      box-shadow: none;
      padding: 10px 13px;
    }
    .bottom:not(.catalog-visible):not(.contextual) .eyebrow {
      display: none;
    }
    .bottom:not(.catalog-visible):not(.contextual) h2 {
      font:
        15px Georgia,
        serif;
      color: #d3c8a9;
      margin: 0 0 4px;
    }
    .bottom:not(.catalog-visible):not(.contextual) p {
      font-size: 10px;
      color: #b0bba5;
    }
    .bottom.catalog-visible {
      left: auto;
      top: 96px;
      right: 78px;
      bottom: 84px;
      width: 360px;
      display: block;
    }
    .bottom.catalog-visible .build-info {
      width: 100%;
      height: 100%;
      max-height: none;
      padding: 18px;
      border-radius: 5px;
      background: linear-gradient(135deg, #203129fa, #14211dfa 65%);
      border: 1px solid #b3a17a70;
      scrollbar-width: thin;
      scrollbar-color: #80734e #17271e;
      box-shadow: 0 10px 32px #0006;
    }
    .bottom.catalog-visible h2 {
      font:
        24px Georgia,
        serif;
      color: #f0e3c3;
      margin: 4px 0 12px;
    }
    .catalog-item {
      padding: 10px 0;
      border: 0;
      border-bottom: 1px solid var(--line);
      border-radius: 0;
      background: transparent;
      gap: 12px;
    }
    .catalog-item:hover {
      background: #d6c08a09;
    }
    .catalog-item img {
      width: 67px;
      height: 66px;
      object-fit: contain;
      filter: drop-shadow(0 3px 3px #0004);
    }
    .catalog-item strong {
      font:
        17px Georgia,
        serif;
      color: #e2d5b1;
    }
    .catalog-item small {
      font-size: 10px;
      line-height: 1.5;
      color: #a8b79f;
      margin-top: 4px;
    }
    .catalog-item small:last-child {
      color: #d3c294;
    }
    .quiet-action {
      border-color: var(--line);
      border-radius: 3px;
      background: #c6b07809;
      color: #c7c2a9;
      font-size: 11px;
    }
    .disclaimer {
      font-size: 10px;
      color: #82917e;
      padding: 8px 20px;
    }
    button {
      transition:
        background-color 0.12s,
        border-color 0.12s,
        color 0.12s;
    }
  }

  @media (min-width: 701px) {
    .building-utility {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .building-panel-header,
    .building-state,
    .improvement-section,
    .session-note {
      flex-shrink: 0;
    }
    .building-panel-content {
      min-height: 0;
      flex: 1;
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: #80734e #17271e;
    }
    .building-panel-content .duplicate-title {
      display: none;
    }
    .store-capacity {
      padding: 12px;
      border: 1px solid #a3b58d40;
      background: #a4b8840b;
      color: #dae1c6 !important;
    }
    .store-capacity strong {
      color: #eddfac;
      font-size: 24px;
      margin: 0 3px;
    }
  }
  @media (min-width: 701px) and (max-height: 800px) {
    .resource-panel,
    .building-utility {
      padding: 14px 16px;
    }
    .building-panel-header,
    .resource-panel-heading {
      padding-bottom: 9px;
      margin-bottom: 8px;
    }
    .building-crest {
      flex-basis: 34px;
      height: 35px;
    }
    .building-crest :global(svg) {
      width: 23px;
      height: 23px;
    }
    .building-utility h2,
    .resource-panel h2 {
      font-size: 21px;
    }
    .building-state {
      font-size: 9px;
      margin-bottom: 7px;
    }
    .building-utility p {
      font-size: 11px;
      line-height: 1.45;
      margin: 5px 0;
    }
    .building-utility h3 {
      font-size: 10px;
      margin: 7px 0 5px;
    }
    .building-utility .stock-disclosure {
      margin: 0 0 7px;
    }
    .building-utility:has([data-producer-rate]) .stock-disclosure {
      display: none;
    }
    .building-utility:has([data-producer-rate]) .capacity-explainer {
      font-size: 10px;
    }
    .building-utility [data-producer-rate] {
      font-size: 15px !important;
      padding: 9px 10px;
    }
    .worker-field {
      margin: 8px 0 4px;
      font-size: 10px;
      gap: 4px;
    }
    .worker-field select {
      min-height: 33px;
      padding: 6px 8px;
      font-size: 11px;
    }
    .worker-availability {
      font-size: 10px !important;
      color: #a6b59c !important;
    }
    .improvement-section {
      padding-top: 3px;
      margin-top: 7px;
    }
    .improvement-section .craft-button {
      min-height: 36px;
      padding: 8px;
    }
    .improvement-section p[role='status'] {
      font-size: 10px;
      line-height: 1.4;
      margin-bottom: 0;
    }
    .building-utility .session-note {
      display: none;
    }
    .resource-totals {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 5px;
      margin: 8px 0 !important;
    }
    .resource-totals > div:first-child {
      grid-column: 1/-1;
      padding: 9px 10px;
    }
    .resource-totals > div:first-child dd {
      font-size: 27px;
    }
    .resource-totals > div:not(:first-child) {
      padding: 7px 5px;
      gap: 5px;
    }
    .resource-totals > div:not(:first-child) dt {
      font-size: 8px;
      min-height: 20px;
    }
    .resource-totals > div:not(:first-child) dd {
      font-size: 16px;
    }
    .resource-panel p,
    .resource-panel li {
      font-size: 11px;
      line-height: 1.4;
      margin: 5px 0;
    }
    .resource-panel h3 {
      margin: 8px 0 5px;
      font-size: 10px;
    }
    .resource-disclosure {
      margin-top: 7px;
    }
    .resource-disclosure > summary {
      padding: 7px 0;
      font-size: 10px;
    }
    .resource-panel [data-resource-rate] {
      font-size: 14px !important;
      padding: 9px 10px;
    }
    .bottom.catalog-visible .build-info {
      padding: 14px 16px;
    }
    .bottom.catalog-visible .build-info > .eyebrow,
    .bottom.catalog-visible .build-info > p {
      display: none;
    }
    .bottom.catalog-visible h2 {
      font-size: 21px;
      margin: 0 0 9px;
    }
    .catalog-item {
      padding: 6px 0;
      min-height: 53px;
    }
    .catalog-item img {
      width: 44px;
      height: 42px;
    }
    .catalog-item strong {
      font-size: 15px;
    }
    .catalog-item small:not(:last-child) {
      display: none;
    }
    .catalog-item small:last-child {
      margin-top: 2px;
      font-size: 9px;
    }
    .bottom.catalog-visible .quiet-action {
      min-height: 31px;
      padding: 6px 10px;
      margin-top: 8px;
    }
  }

  @media (min-width: 701px) and (max-height: 800px) {
    .resource-panel .material-inventory {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 5px;
    }
    .resource-panel .material-inventory div {
      padding: 8px 6px;
    }
    .resource-panel .material-inventory dt {
      flex-direction: column;
      align-items: flex-start;
      min-height: 34px;
      font-size: 9px;
      gap: 4px;
    }
    .resource-panel .item-inventory div {
      padding: 8px;
    }
    .resource-panel:has(.material-inventory) > p {
      display: none;
    }
  }

  @media (min-width: 701px) {
    .resource-bar {
      background: linear-gradient(180deg, #2b3230f5, #19221ff8);
      border-color: #8d8c7870;
      padding: 4px;
      border-radius: 6px;
    }
    .resource-bar button {
      grid-template-columns: 28px auto auto;
      min-width: 103px;
      height: 52px;
      column-gap: 8px;
      padding: 6px 12px;
      border-right-color: #b5b29c28;
    }
    .resource-bar button :global(svg) {
      width: 26px;
      height: 26px;
      color: #c8ba96;
    }
    .resource-bar button:nth-child(2) :global(svg) {
      color: #b9c2c4;
    }
    .resource-bar button:nth-child(3) :global(svg) {
      color: #b2bfca;
    }
    .resource-bar button:nth-child(4) :global(svg) {
      color: #d4b772;
    }
    .resource-name {
      font-family: 'Segoe UI', sans-serif;
      font-size: 10px;
      letter-spacing: 0.025em;
      text-transform: none;
      color: #bec6ba;
    }
    .resource-bar strong {
      font-family: 'Segoe UI', sans-serif;
      font-size: 21px;
      font-weight: 600;
      line-height: 23px;
      color: #f0f1e8;
    }
    .resource-bar small {
      font-family: 'Segoe UI', sans-serif;
      font-size: 10px;
      color: #9dbca3;
    }
    .resource-bar .inventory-toggle {
      font-family: 'Segoe UI', sans-serif;
      font-size: 12px;
      min-width: 99px;
    }
    .resource-panel:not(.mission-panel) {
      background: linear-gradient(150deg, #242d2bf9, #151f1cfb);
      border-color: #959a8060;
    }
    .resource-panel:not(.mission-panel) h2 {
      font:
        600 21px 'Segoe UI',
        sans-serif;
      color: #e4e8dc;
    }
    .resource-panel .camp-inventory dd {
      font-family: 'Segoe UI', sans-serif;
      font-weight: 600;
      color: #e3e9db;
    }
    .resource-totals > div:first-child dd {
      font-family: 'Segoe UI', sans-serif;
      font-size: 31px;
      font-weight: 600;
    }
    .resource-panel .camp-inventory div {
      background: #b6c0ad05;
      border-color: #a9b4a12a;
    }
    .resource-panel .camp-inventory dt {
      font-family: 'Segoe UI', sans-serif;
      font-size: 11px;
      color: #b7c3b0;
    }
    .resource-panel h3 {
      font-family: 'Segoe UI', sans-serif;
      font-size: 12px;
      color: #d1c9af;
      letter-spacing: 0;
    }
    .resource-panel .eyebrow {
      font-family: 'Segoe UI', sans-serif;
      letter-spacing: 0.045em;
      color: #9ead99;
    }
    .resource-panel [data-resource-rate] {
      background: #abc79708;
      border-color: #a5b59238;
      border-left-color: #9db98c;
      font:
        500 15px 'Segoe UI',
        sans-serif !important;
    }
    .resource-link {
      color: #c5c5ad;
    }
    .quest-launcher {
      display: flex;
      align-items: center;
      gap: 13px;
      min-width: 208px;
      text-align: left;
      padding: 14px 15px;
      border: 1px solid #aa966055;
      border-left: 3px solid #c4ae78;
      background: linear-gradient(120deg, #2a3022ed, #15231ced);
      box-shadow: 0 5px 18px #0004;
    }
    .mission-panel {
      right: auto;
      left: 20px;
      width: 360px;
      background: linear-gradient(145deg, #2c3023fb, #14211cfb);
    }
    .mission-panel h2 {
      font:
        24px Cambria,
        Georgia,
        serif;
    }
    .construction-controls {
      z-index: 4;
    }
  }
  @media (min-width: 701px) and (max-height: 800px) {
    .resource-totals > div:not(:first-child) dt {
      font-size: 9px;
    }
    .resource-totals > div:not(:first-child) dd {
      font-size: 17px;
    }
  }

  @media (min-width: 701px) {
    .hud {
      max-width: 258px;
      gap: 5px;
    }
    .camp-help {
      display: block;
      color: #a8b69f;
      font:
        10px/1.5 'Segoe UI',
        sans-serif;
      border-top: 1px solid #b2a27a25;
      padding-top: 6px;
      margin-top: 3px;
    }
    .quest-launcher {
      top: 143px;
    }
    .quest-launcher :global(.game-icon) {
      margin-right: 1px;
    }
    .resource-bar :global(.game-icon) {
      grid-column: 1;
      grid-row: 1/3;
      align-self: center;
    }
    .resource-bar .inventory-toggle :global(.game-icon),
    .build-tools :global(.game-icon) {
      grid-column: auto;
      grid-row: auto;
    }
    .resource-panel .material-inventory :global(.game-icon) {
      width: 25px !important;
      height: 25px !important;
    }
    .mission-panel {
      left: 20px;
      top: 143px;
      width: 380px;
    }
  }
  @media (min-width: 701px) and (max-height: 800px) {
    .hud {
      padding: 9px 12px;
    }
    .hud strong {
      font-size: 15px;
    }
    .camp-help {
      font-size: 9px;
      line-height: 1.45;
      padding-top: 4px;
      margin-top: 1px;
    }
    .mission-panel {
      top: 135px;
      bottom: 34px;
    }
    .quest-launcher {
      top: 135px;
    }
    .mission-panel h2 {
      font-size: 21px;
    }
  }

  /* Fit the existing prototype controls inside the app's mobile chrome. */
  @media (max-width: 700px) {
    .game {
      height: calc(100dvh - 260px);
      min-height: 460px;
    }
    .resource-bar {
      left: 8px;
      right: 64px;
      max-width: calc(100% - 72px);
      overflow-x: auto;
      overflow-y: hidden;
    }
    .resource-bar button {
      flex: 0 0 auto;
      white-space: nowrap;
      min-height: 44px;
      padding: 5px 7px;
    }
    .resource-name {
      white-space: nowrap;
    }
    .build-tools {
      top: 100px;
      left: 8px;
      right: 64px;
      display: flex;
      gap: 4px;
    }
    .build-tools button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-width: 0;
      padding: 6px 2px;
      font-size: 11px;
      gap: 4px;
    }
    .missions-toggle {
      top: 156px;
      left: 8px;
      padding: 6px 10px;
      font-size: 11px;
    }
    .hud {
      top: 206px;
      max-width: calc(100% - 76px);
      font-size: 11px;
    }
    .camp-help {
      font-size: 10px;
      line-height: 1.4;
    }
    .build-tools :global(.game-icon) {
      width: 24px !important;
      height: 24px !important;
    }
    .zoom-tools {
      z-index: 7;
    }
    .resource-panel {
      top: 210px;
      left: 8px;
      right: 8px;
      width: auto;
      max-height: calc(100% - 230px);
    }
    .building-utility {
      z-index: 5;
      left: 8px;
      right: 8px;
      width: auto;
      max-height: calc(100% - 210px);
    }
  }
</style>
