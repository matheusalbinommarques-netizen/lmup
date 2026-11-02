<script lang="ts">
  import { onMount, tick, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { worldArt, hotspots, clues, type HotspotId } from './content';
  import type { WorldState } from './worldState';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  let {
    world,
    dialogueText,
    choices,
    busy,
    error,
    notice,
    audio,
    onInteract,
    onChoose,
    onCollect,
    onMap,
    onSound,
  }: {
    world: WorldState;
    dialogueText: string;
    choices: { id: string; label: string }[];
    busy: boolean;
    error: string;
    notice: string;
    audio: Snippet;
    onInteract: (id: HotspotId) => Promise<void>;
    onChoose: (id: string) => Promise<void>;
    onCollect: () => Promise<void>;
    onMap: () => void;
    onSound?: (cue: 'scene' | 'interact' | 'discovery' | 'dialogue') => void;
  } = $props();
  const points = hotspots.filter((p) => p.scene === 'settlement');
  let stage: HTMLDialogElement;
  let canvas: HTMLDivElement;
  let wholeScene = $state(false),
    reduceMotion = $state(false);
  let displayLine = $state(''),
    displayChoices = $state<{ id: string; label: string }[]>([]);
  let reveal = $state(false),
    panel = $state<'points' | 'journal' | 'audio'>(),
    inspecting = $state(false);
  let selected = $state<HotspotId>('lucan');
  const speaking = $derived(!!world.dialogue);
  const point = $derived(points.find((p) => p.id === world.focus));
  const questLabel = $derived(
    world.quest === 'solved'
      ? 'Investigação concluída'
      : world.quest === 'active'
        ? 'Encontre e registre as pistas.'
        : 'Investigue o atraso da entrega.',
  );
  onMount(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => (reduceMotion = motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);
    const previous = document.activeElement,
      oldOverflow = document.body.style.overflow;
    inspecting = !!world.focus;
    stage.showModal();
    document.body.style.overflow = 'hidden';
    stage.querySelector<HTMLElement>('[data-scene-title]')?.focus();
    onSound?.('scene');
    return () => {
      motion.removeEventListener('change', syncMotion);
      stage.close();
      document.body.style.overflow = oldOverflow;
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  });
  $effect(() => {
    if (notice) onSound?.('discovery');
  });
  // Focus follows conversation changes; the narrative and receipts remain in worldService.
  $effect(() => {
    const node = world.dialogue;
    if (node) {
      displayLine = dialogueText;
      displayChoices = choices;
    }
    if (node)
      void tick().then(() =>
        stage?.querySelector<HTMLElement>('[data-speaker]')?.focus(),
      );
  });
  async function interact(id: HotspotId) {
    selected = id;
    panel = undefined;
    inspecting = true;
    onSound?.(id === 'lucan' ? 'dialogue' : 'interact');
    await onInteract(id);
    await tick();
    if (!world.dialogue)
      stage?.querySelector<HTMLElement>('[data-inspection-title]')?.focus();
  }
  async function back() {
    if (busy) return;
    if (panel) panel = undefined;
    else if (speaking) await onChoose('leave');
    else if (inspecting) inspecting = false;
    else {
      onMap();
      return;
    }
    await tick();
    stage?.querySelector<HTMLElement>(`[data-point="${selected}"]`)?.focus();
  }
  async function togglePanel(value: typeof panel) {
    panel = panel === value ? undefined : value;
    await tick();
    if (panel) stage?.querySelector<HTMLElement>('[data-panel-title]')?.focus();
  }
  function keys(event: KeyboardEvent) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.repeat ||
      (event.target as HTMLElement).closest('input,textarea,select')
    )
      return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      event.preventDefault();
      if (!busy) onMap();
    } else if (key === 'r') {
      event.preventDefault();
      void togglePanel('journal');
    } else if (key === 'h') {
      event.preventDefault();
      reveal = !reveal;
    } else if (key === 'e' && !speaking && !panel && !busy) {
      event.preventDefault();
      void interact(selected);
    } else if (
      ['ArrowLeft', 'ArrowRight'].includes(event.key) &&
      (event.target as HTMLElement).closest('.scene-point')
    ) {
      event.preventDefault();
      const index = points.findIndex((p) => p.id === selected),
        offset = event.key === 'ArrowRight' ? 1 : -1;
      selected = points[(index + offset + points.length) % points.length].id;
      stage.querySelector<HTMLElement>(`[data-point="${selected}"]`)?.focus();
    }
  }
</script>

{#snippet glyph(id: string)}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if id === 'lucan'}<path
        d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
      /><path d="M7 10h.01M12 10h.01M17 10h.01" stroke-width="3" />
    {:else if id === 'board'}<path d="M12 4v10m0 4v1" stroke-width="2.4" />
    {:else if id === 'supplies'}<path
        d="M4 7h16v13H4zM3 7V4h18v3M9 11h6v4H9zM12 11v5"
      />
    {:else}<path d="M4 12h15m-6-6 6 6-6 6M4 5v14" />{/if}
  </svg>
{/snippet}

<dialog
  bind:this={stage}
  class="cinematic-stage"
  class:speaking
  class:revealed={reveal}
  class:whole-scene={wholeScene}
  aria-label="Exploração do Oásis"
  onkeydown={keys}
  oncancel={(event) => {
    event.preventDefault();
    void back();
  }}
>
  <div class="atmosphere" aria-hidden="true"></div>
  <div
    class="scene-canvas"
    bind:this={canvas}
    role="region"
    aria-label="Cenário panorâmico do Oásis"
    aria-hidden={speaking || !!panel ? true : undefined}
    inert={speaking || !!panel}
  >
    <div class="scene-painting">
      <img
        class="settlement-art"
        src={worldArt + 'cena-oasis-construcao.webp'}
        alt="Oásis em construção, com tendas, oficinas, andaimes e um caminho junto à água"
        draggable="false"
      />
      {#each points as hotspot (hotspot.id)}<button
          class="scene-point"
          class:chosen={inspecting && selected === hotspot.id}
          data-point={hotspot.id}
          style:left={hotspot.x + '%'}
          style:top={hotspot.y + '%'}
          disabled={busy}
          aria-label={hotspot.name}
          onfocus={(event) => {
            selected = hotspot.id;
            if (
              event.currentTarget.matches(':focus-visible') &&
              !wholeScene &&
              window.matchMedia('(max-width: 700px)').matches
            )
              canvas.scrollTo({
                left: event.currentTarget.offsetLeft - canvas.clientWidth / 2,
              });
          }}
          onpointerenter={() => (selected = hotspot.id)}
          onclick={() => interact(hotspot.id)}
        >
          <span class="point-emblem">{@render glyph(hotspot.id)}</span><span
            class="point-label">{hotspot.name}</span
          >
        </button>{/each}
    </div>
  </div>
  <header class="scene-hud" class:subdued={speaking}>
    <div class="location-plaque">
      <ApprovedIcon name="mundo" size={42} />
      <div>
        <h1 data-scene-title tabindex="-1">Oásis dos Fundadores</h1>
        <p>Assentamento em construção</p>
      </div>
    </div>
    <div class="quest-plaque">
      <ApprovedIcon name="missions" size={30} />
      <div><strong>A Caravana Perdida</strong><span>{questLabel}</span></div>
    </div>
  </header>
  {#if speaking}
    <section
      out:fade={{ duration: reduceMotion ? 0 : 180 }}
      class="cinematic-conversation"
      aria-label="Conversa com Lucan"
      inert={!!panel}
      aria-hidden={panel ? true : undefined}
    >
      <div class="character-portrait">
        <img
          src={worldArt + 'lucan-dorian.webp'}
          alt="Lucan Dorian, um dos quatro fundadores"
        />
      </div>
      <div class="conversation-copy">
        <p class="speaker-role">Um dos quatro fundadores · Ladino</p>
        <h2 data-speaker tabindex="-1">Lucan Dorian</h2>
        {#key world.dialogue}<div class="dialogue-line">
            <p>{displayLine}</p>
          </div>{/key}
        <div class="cinematic-choices" aria-label="Respostas a Lucan">
          {#each displayChoices as choice (choice.id)}<button
              disabled={busy}
              onclick={() => onChoose(choice.id)}
              ><span aria-hidden="true">➤</span>{choice.label}</button
            >{/each}
        </div>
      </div>
    </section>
  {:else if inspecting && point && !panel}
    <section class="inspection-card" aria-label="Objeto selecionado">
      <button class="close-card" aria-label="Fechar inspeção" onclick={back}
        >×</button
      >
      <p class="overline">Observe de perto</p>
      <h2 data-inspection-title tabindex="-1">{point.name}</h2>
      <p>
        {point.id === 'supplies' && world.quest === 'solved'
          ? world.resolution === 'rescue'
            ? 'Cordas e recipientes foram separados para a equipe que recuperará a carga. Sua decisão mudou os preparativos do assentamento.'
            : 'O registro da rota segura está sobre a mesa, junto do aviso enviado ao entreposto.'
          : point.text}
      </p>
      {#if 'clue' in point}{#if world.clues.includes(point.clue)}<p
            class="recorded"
          >
            ✓ Pista registrada no diário
          </p>{:else if world.quest === 'active'}<button
            class="gold-control"
            disabled={busy}
            onclick={onCollect}>Registrar pista</button
          >{:else}<p class="hint">
            Converse com Lucan para iniciar a investigação.
          </p>{/if}{/if}
    </section>
  {/if}
  {#if panel}<section
      class="scene-drawer"
      aria-label={panel === 'points'
        ? 'Pontos interativos'
        : panel === 'journal'
          ? 'Diário da campanha'
          : 'Áudio'}
    >
      <button class="close-card" aria-label="Fechar painel" onclick={back}
        >×</button
      >
      <p class="overline">Oásis dos Fundadores</p>
      <h2 data-panel-title tabindex="-1">
        {panel === 'points'
          ? 'Pontos interativos'
          : panel === 'journal'
            ? 'Diário da campanha'
            : 'Áudio'}
      </h2>
      {#if panel === 'points'}<p>
          Escolha um lugar para observar ou conversar.
        </p>
        <nav aria-label="Interações da cena" class="point-list">
          {#each points as hotspot (hotspot.id)}<button
              disabled={busy}
              onclick={() => interact(hotspot.id)}
              >{@render glyph(hotspot.id)}{hotspot.name}<span aria-hidden="true"
                >→</span
              ></button
            >{/each}
        </nav>
      {:else if panel === 'journal'}<h3>A Caravana Perdida</h3>
        <p>{questLabel}</p>
        <p>
          Pistas verificadas: {world.clues.filter((id) => id !== 'manifest')
            .length} / 3
        </p>
        {#if world.resolution}<p class="recorded">
            Relação com Lucan: {world.resolution === 'rescue'
              ? 'confiança na sua iniciativa'
              : 'respeito pela sua atenção aos detalhes'}.
          </p>{/if}
        {#if !world.journal.length}<p>
            Sua história nos Ermos ainda vai começar.
          </p>{/if}
        <ol>
          {#each [...world.journal].reverse() as entry (entry.id)}<li>
              <small>{new Date(entry.at).toLocaleDateString('pt-BR')}</small>
              <p>{entry.text}</p>
            </li>{/each}
        </ol>
        {#if world.clues.length}<h3>Pistas registradas</h3>
          <ul>
            {#each world.clues as id (id)}<li>
                <strong>{clues[id].name}</strong>
                <p>{clues[id].text}</p>
              </li>{/each}
          </ul>{/if}
      {:else}{@render audio()}{/if}
    </section>{/if}
  {#if error}<p role="alert" class="scene-feedback error">
      {error}
    </p>{:else if notice}<p role="status" class="scene-feedback discovery">
      ✦ {notice}
    </p>{/if}
  <footer class="scene-controls">
    <nav class="primary-controls" aria-label="Controles da exploração">
      {#if speaking}<button
          class="quiet-control main-control"
          disabled={busy}
          aria-label="Voltar à exploração"
          onclick={back}><span aria-hidden="true">←</span>Exploração</button
        >
      {:else}<button
          class="quiet-control main-control"
          aria-label="Pontos interativos"
          aria-expanded={panel === 'points'}
          onclick={() => togglePanel('points')}
          ><span aria-hidden="true">☷</span>Interações</button
        >{/if}
      <button
        class="quiet-control"
        aria-keyshortcuts="R"
        aria-expanded={panel === 'journal'}
        onclick={() => togglePanel('journal')}
        ><span class="key" aria-hidden="true">R</span>Diário</button
      >
      <button
        class="quiet-control"
        aria-keyshortcuts="M"
        aria-label="Voltar ao mapa"
        disabled={busy}
        onclick={onMap}
        ><span class="key" aria-hidden="true">M</span>Mapa</button
      >
    </nav>
    <nav class="secondary-controls" aria-label="Opções da exploração">
      {#if !speaking}<button
          class="quiet-control"
          aria-keyshortcuts="H"
          aria-label={reveal ? 'Ocultar pontos' : 'Revelar pontos'}
          aria-pressed={reveal}
          onclick={() => (reveal = !reveal)}
          ><span aria-hidden="true">✧</span>{reveal
            ? 'Ocultar'
            : 'Revelar'}</button
        >{/if}
      <button
        class="quiet-control"
        aria-expanded={panel === 'audio'}
        onclick={() => togglePanel('audio')}>Áudio</button
      >
      <a
        class="quiet-control exit-control"
        href="/"
        aria-label="Sair da exploração"><span aria-hidden="true">↗</span>Sair</a
      >
    </nav>
  </footer>
  {#if !speaking && !panel}<button
      class="framing-control"
      aria-pressed={wholeScene}
      onclick={() => (wholeScene = !wholeScene)}
      >{wholeScene ? 'Ampliar cenário' : 'Ver cena inteira'}
      <span aria-hidden="true">↔</span></button
    >{/if}
  {#if !speaking && !panel && !inspecting}<p class="explore-hint">
      Explore os símbolos ou revele todos os pontos. No celular, deslize para
      observar o cenário.
    </p>{/if}
</dialog>

<style>
  .cinematic-stage {
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    width: 100vw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    border: 0;
    overflow: hidden;
    background: #110e0a;
    color: #f3e5c8;
    font-family: var(--lmu-body, sans-serif);
    isolation: isolate;
  }
  .cinematic-stage::backdrop {
    background: #090c0c;
  }
  .atmosphere {
    position: absolute;
    inset: 0;
    z-index: -2;
    background:
      linear-gradient(#1b110d22, #100e0acc),
      url('/art/world/cena-oasis-construcao.webp') center/cover;
    filter: blur(16px);
    opacity: 0.85;
    pointer-events: none;
  }
  .cinematic-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      linear-gradient(#090b0e85, transparent 23%, transparent 65%, #0b0b0eee),
      radial-gradient(ellipse at center, transparent 45%, #090b0c65);
  }
  .scene-canvas {
    position: absolute;
    inset: 55px 0 65px;
    display: grid;
    place-items: center;
    transition:
      filter 0.4s,
      opacity 0.4s;
  }
  .scene-painting {
    position: relative;
    width: min(100%, calc((100dvh - 120px) * 16 / 9));
    aspect-ratio: 16/9;
  }
  .settlement-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    mask-image: linear-gradient(transparent, #000 3%, #000 96%, transparent);
  }
  .scene-hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 20px 28px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    pointer-events: none;
    transition: opacity 0.25s;
  }
  .location-plaque,
  .quest-plaque {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 15px;
    max-width: 49%;
    border: 0;
    text-shadow: 0 2px 8px #000;
    background: linear-gradient(90deg, #0b100dcc, transparent);
    border-left: 1px solid #dbc28e80;
  }
  .quest-plaque {
    background: linear-gradient(270deg, #0b100dcc, transparent);
    border-left: 0;
    border-right: 1px solid #dbc28e80;
    text-align: right;
    flex-direction: row-reverse;
  }
  .location-plaque :global(img) {
    width: 29px !important;
    height: 29px !important;
  }
  .quest-plaque :global(img) {
    width: 25px !important;
    height: 25px !important;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  .cinematic-stage .location-plaque h1 {
    font: 600 clamp(1.1rem, 1.7vw, 1.55rem) var(--lmu-display);
    color: #ffedc7;
  }
  h1:focus,
  h2:focus {
    outline: none;
  }
  .location-plaque p,
  .quest-plaque span {
    display: block;
    margin-top: 5px;
    font-size: 0.78rem;
    color: #e2d5bc;
  }
  .quest-plaque strong {
    font: 600 1.1rem var(--lmu-display);
  }
  .scene-point {
    position: absolute;
    transform: translate(-50%, -50%);
    display: grid;
    justify-items: center;
    min-width: 48px;
    min-height: 48px;
    padding: 4px;
    border: 0;
    background: none;
    color: #fff0cc;
    cursor: pointer;
    z-index: 1;
  }
  .point-emblem {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid #f0e4c9c4;
    border-radius: 50%;
    background: #101711c2;
    box-shadow:
      0 0 0 3px #09110d38,
      0 3px 12px #000a;
    opacity: 0.94;
    transition:
      box-shadow 0.18s,
      transform 0.18s,
      background 0.18s;
  }
  .point-emblem svg {
    width: 20px;
    height: 20px;
  }
  .point-label {
    position: absolute;
    top: 100%;
    width: max-content;
    max-width: 190px;
    padding: 7px 13px;
    border: 1px solid #c0a77388;
    border-radius: 3px;
    background: #12150ef2;
    color: #ffe7ad;
    box-shadow: 0 4px 15px #0007;
    font: 600 0.95rem var(--lmu-display);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-3px);
    transition:
      opacity 0.18s,
      transform 0.18s;
    pointer-events: none;
  }
  .scene-point:hover,
  .scene-point:focus-visible,
  .scene-point.chosen {
    z-index: 2;
  }
  .scene-point:hover .point-emblem,
  .scene-point:focus-visible .point-emblem,
  .scene-point.chosen .point-emblem,
  .revealed .point-emblem {
    box-shadow:
      0 0 0 3px #ffd36f50,
      0 0 22px #ffc14e99;
    background: #30200dec;
    transform: scale(1.12);
    border-color: #ffe2a0;
  }
  .scene-point:hover .point-label,
  .scene-point:focus-visible .point-label,
  .scene-point.chosen .point-label,
  .revealed .point-label {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  button,
  a {
    font: inherit;
  }
  button {
    touch-action: manipulation;
  }
  button:disabled {
    opacity: 0.5;
    cursor: wait;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid #ffe19b;
    outline-offset: 4px;
  }
  .scene-controls {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 12px 28px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    background: linear-gradient(transparent, #0b0d0cf2 65%);
    z-index: 5;
  }
  .scene-controls nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .secondary-controls {
    margin-left: auto;
  }
  .quiet-control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    background: transparent;
    color: #ecdfc3;
    min-height: 44px;
    padding: 8px 12px;
    text-decoration: none;
    font-size: 0.86rem;
    cursor: pointer;
    text-shadow: 0 1px 5px #000;
  }
  .quiet-control:hover,
  .quiet-control:focus-visible {
    color: #fff0c8;
    background: #bc99521a;
    border-bottom-color: #c5a25f;
  }
  .main-control {
    border-bottom-color: #c5a25f99;
    background: linear-gradient(transparent, #8a6b2b20);
    color: #fff0c8;
  }
  .secondary-controls .quiet-control {
    color: #cfc7b5;
    font-size: 0.8rem;
  }
  .key {
    display: inline-grid;
    place-items: center;
    width: 19px;
    height: 20px;
    font-size: 0.65rem;
    border: 1px solid #c2af8544;
    border-radius: 2px;
    color: #d9c9aa;
  }
  .exit-control {
    margin-left: 6px;
  }
  .framing-control {
    display: none;
  }
  .explore-hint {
    position: absolute;
    bottom: 78px;
    left: 26px;
    right: 26px;
    text-align: center;
    color: #f2e4ca;
    font-size: 0.77rem;
    text-shadow: 0 2px 6px #000;
    pointer-events: none;
  }
  .scene-drawer,
  .inspection-card {
    position: absolute;
    z-index: 6;
    border: 1px solid #ad8c52;
    border-radius: 6px;
    color: #e9dfca;
    background: linear-gradient(130deg, #21190ff5, #111411fa);
    box-shadow: 0 18px 70px #0008;
    padding: 28px;
    line-height: 1.6;
  }
  .scene-drawer {
    right: 26px;
    top: 95px;
    bottom: 85px;
    overflow: auto;
    width: min(470px, calc(100% - 52px));
  }
  .inspection-card {
    right: 30px;
    bottom: 95px;
    width: min(410px, calc(100% - 60px));
  }
  .scene-drawer h2,
  .inspection-card h2 {
    font: 600 1.8rem var(--lmu-display);
    color: #f4dba0;
    margin: 4px 30px 15px 0;
  }
  .scene-drawer h3 {
    font: 600 1.4rem var(--lmu-display);
    margin: 20px 0 8px;
    color: #eace91;
  }
  .scene-drawer p,
  .inspection-card p {
    margin: 8px 0;
  }
  .overline {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #c7b28b;
  }
  .close-card {
    position: absolute;
    right: 12px;
    top: 12px;
    min-width: 44px;
    min-height: 44px;
    border: 0;
    background: none;
    color: #e6d0a6;
    font-size: 1.8rem;
    cursor: pointer;
  }
  .point-list {
    display: grid;
    gap: 10px;
    margin-top: 22px;
  }
  .point-list button {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #987943;
    background: #211a10;
    color: #f2ddaf;
    padding: 14px 12px;
    text-align: left;
    border-radius: 4px;
    cursor: pointer;
  }
  .point-list svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  .point-list span {
    margin-left: auto;
  }
  .scene-drawer ol {
    list-style: none;
    padding: 0;
  }
  .scene-drawer li {
    border-left: 1px solid #997746;
    padding: 8px 12px;
    margin: 14px 0;
    background: #14161160;
  }
  .scene-drawer small {
    color: #b4bbaa;
    font-size: 0.75rem;
  }
  .recorded {
    color: #cbe3b3;
  }
  .gold-control {
    border: 1px solid #d2a354;
    background: linear-gradient(#6b4821, #37240d);
    color: #fff0ca;
    padding: 12px 18px;
    cursor: pointer;
    border-radius: 4px;
  }
  .scene-feedback {
    position: absolute;
    z-index: 10;
    top: 98px;
    left: 50%;
    transform: translateX(-50%);
    max-width: min(600px, 90%);
    padding: 12px 22px;
    border: 1px solid #e1bb6b;
    background: #171a14ed;
    box-shadow: 0 5px 25px #0008;
    line-height: 1.5;
    text-align: center;
  }
  .scene-feedback.error {
    color: #ffd2c3;
    border-color: #d99477;
  }
  .speaking .scene-canvas {
    filter: blur(3px) brightness(0.65);
    opacity: 0.8;
  }
  .scene-hud.subdued {
    opacity: 0;
  }
  .cinematic-conversation {
    position: absolute;
    inset: 0 0 66px;
    display: grid;
    grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
    align-items: center;
    padding: 65px 5vw 30px;
    overflow: auto;
  }
  .character-portrait {
    position: absolute;
    left: 0;
    bottom: 0;
    top: 28px;
    width: 48%;
    pointer-events: none;
    mask-image:
      linear-gradient(90deg, #000 61%, transparent 100%),
      linear-gradient(transparent, #000 7%, #000 84%, transparent);
    mask-composite: intersect;
  }
  .character-portrait img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center top;
    filter: sepia(0.1) saturate(0.96) brightness(1.025);
  }
  .conversation-copy {
    position: relative;
    grid-column: 2;
    padding: 24px 30px;
    border: 0;
    border-left: 1px solid #c3a26180;
    border-radius: 0;
    background: linear-gradient(90deg, #10140fed, #10140fd9);
    box-shadow: 0 12px 50px #0003;
    max-width: 760px;
  }
  .speaker-role {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.64rem;
    color: #c4ad80;
    margin-bottom: 8px;
  }
  .conversation-copy h2 {
    font: 600 clamp(1.8rem, 2.5vw, 2.5rem) var(--lmu-display);
    color: #f1d69e;
    border-bottom: 1px solid #c4a16950;
    padding-bottom: 15px;
  }
  .dialogue-line {
    margin: 19px 0 24px;
    font: 400 clamp(1.16rem, 1.48vw, 1.5rem)/1.6 var(--lmu-display);
    color: #f4e8d0;
  }
  .cinematic-choices {
    display: grid;
    gap: 9px;
  }
  .cinematic-choices button {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    text-align: left;
    font-size: 0.96rem;
    line-height: 1.45;
    min-height: 48px;
    padding: 13px 16px;
    color: #f2e2bf;
    border: 1px solid #c6ac7455;
    border-radius: 3px;
    background: linear-gradient(110deg, #4b341b55, #17180f55);
    cursor: pointer;
    box-shadow: inset 0 1px #ddbc6f08;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .cinematic-choices button span {
    color: #c0a16a;
    font-size: 0.8rem;
  }
  .cinematic-choices button:hover,
  .cinematic-choices button:focus-visible {
    background: linear-gradient(110deg, #825621b0, #2c1f11);
    border-color: #e4b458;
    box-shadow: 0 0 16px #f5b74322;
  }
  .hint {
    font-size: 0.8rem;
    color: #b8c3ae;
  }
  @media (max-width: 1100px) and (min-width: 701px) {
    .scene-hud {
      padding: 17px 22px;
    }
    .cinematic-conversation {
      padding: 45px 3vw 25px;
      grid-template-columns: minmax(0, 0.77fr) minmax(0, 1.23fr);
    }
    .conversation-copy {
      padding: 22px;
    }
    .character-portrait {
      width: 46%;
    }
    .dialogue-line {
      font-size: 1.18rem;
    }
    .scene-controls {
      padding: 10px 18px;
    }
    .scene-controls nav {
      gap: 4px;
    }
  }
  @media (max-width: 700px) {
    .scene-hud {
      padding: 15px 16px;
      display: block;
    }
    .location-plaque {
      padding: 5px 10px;
      gap: 9px;
      max-width: 100%;
    }
    .cinematic-stage .location-plaque h1 {
      font-size: 1.12rem;
    }
    .location-plaque p {
      font-size: 0.7rem;
    }
    .location-plaque :global(img) {
      width: 23px !important;
      height: 23px !important;
    }
    .quest-plaque {
      margin-top: 8px;
      padding: 3px 10px;
      display: flex;
      max-width: 100%;
      border: 0;
      background: none;
      flex-direction: row;
      text-align: left;
      gap: 8px;
    }
    .quest-plaque strong {
      font-size: 0.95rem;
    }
    .quest-plaque span {
      font-size: 0.69rem;
      margin-top: 3px;
    }
    .quest-plaque :global(img) {
      width: 21px !important;
      height: 21px !important;
    }
    .scene-canvas {
      inset: 125px 0 128px;
      display: block;
      place-items: normal;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      scrollbar-color: #ac874b #14120e;
      overscroll-behavior-x: contain;
    }
    .scene-painting {
      width: calc((100dvh - 253px) * 16 / 9);
      min-width: 100%;
      height: 100%;
      justify-self: start;
    }
    .whole-scene .scene-canvas {
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .whole-scene .scene-painting {
      width: 100%;
      height: auto;
      justify-self: center;
    }
    .point-emblem {
      width: 34px;
      height: 34px;
      background: #101711d9;
    }
    .point-emblem svg {
      width: 19px;
      height: 19px;
    }
    .point-label {
      font-size: 0.8rem;
      padding: 6px 9px;
      max-width: 150px;
      white-space: normal;
    }
    .scene-point[data-point='exit'] .point-label {
      transform: translate(-45%, -80px);
    }
    .scene-point[data-point='board'] .point-label,
    .scene-point[data-point='supplies'] .point-label {
      right: 0;
    }
    .scene-controls {
      padding: 8px 12px 10px;
      display: grid;
      gap: 0;
      background: linear-gradient(transparent, #0b0d0cf5 25%);
    }
    .scene-controls nav {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2px;
      width: 100%;
    }
    .secondary-controls {
      margin: 0;
      border-top: 1px solid #d9c18d24;
    }
    .quiet-control {
      min-height: 44px;
      font-size: 0.8rem;
      padding: 8px 4px;
      gap: 5px;
    }
    .secondary-controls .quiet-control {
      font-size: 0.74rem;
    }
    .key {
      display: none;
    }
    .exit-control {
      margin: 0;
    }
    .framing-control {
      display: flex;
      align-items: center;
      gap: 8px;
      position: absolute;
      right: 14px;
      top: 132px;
      z-index: 3;
      border: 0;
      border-bottom: 1px solid #d3bb8455;
      background: #0c120d99;
      color: #eadfca;
      padding: 6px 9px;
      min-height: 44px;
      font-size: 0.68rem;
      cursor: pointer;
    }
    .explore-hint {
      bottom: 113px;
      left: 18px;
      right: 18px;
      font-size: 0.7rem;
      line-height: 1.4;
    }
    .scene-drawer {
      inset: 60px 12px 112px;
      width: auto;
      padding: 22px;
    }
    .inspection-card {
      left: 12px;
      right: 12px;
      bottom: 116px;
      width: auto;
      max-height: 55dvh;
      overflow: auto;
      padding: 20px;
    }
    .scene-feedback {
      top: 128px;
      width: calc(100% - 32px);
      font-size: 0.8rem;
      padding: 10px;
    }
    .cinematic-conversation {
      display: block;
      inset: 0 0 66px;
      padding: 0 14px 18px;
    }
    .character-portrait {
      position: relative;
      top: 0;
      left: 0;
      height: clamp(155px, 28dvh, 260px);
      width: calc(100% + 28px);
      margin: 0 -14px -30px;
      mask-image: linear-gradient(#000 62%, transparent);
    }
    .character-portrait img {
      object-position: center top;
    }
    .conversation-copy {
      padding: 16px 18px 21px;
      max-width: none;
      background: linear-gradient(#10140fdd, #10140ff5);
      border-left: 0;
      border-top: 1px solid #c3a26166;
      box-shadow: none;
    }
    .conversation-copy h2 {
      font-size: 1.7rem;
      padding-bottom: 10px;
    }
    .speaker-role {
      font-size: 0.56rem;
      letter-spacing: 0.12em;
      margin-bottom: 6px;
    }
    .dialogue-line {
      font-size: 1.08rem;
      line-height: 1.5;
      margin: 13px 0 18px;
    }
    .cinematic-choices {
      gap: 8px;
    }
    .cinematic-choices button {
      font-size: 0.88rem;
      padding: 11px 12px;
      min-height: 44px;
      gap: 10px;
    }
    .speaking .scene-controls {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0;
      background: linear-gradient(transparent, #0b0d0cf5 25%);
    }
    .speaking .scene-controls nav {
      display: contents;
    }
    .speaking .scene-controls .quiet-control {
      font-size: 0.66rem;
      min-width: 0;
      padding: 8px 2px;
      gap: 2px;
    }
    .speaking .main-control {
      font-size: 0.66rem;
    }
    .speaking .scene-controls .main-control > span {
      display: none;
    }
  }
  @media (max-height: 540px) and (min-width: 701px) {
    .cinematic-conversation {
      padding-top: 20px;
      align-items: start;
    }
    .conversation-copy {
      padding: 20px;
    }
    .dialogue-line {
      font-size: 1.05rem;
      margin: 12px 0;
    }
    .character-portrait {
      position: fixed;
      top: 0;
      height: 100dvh;
    }
    .scene-hud.subdued {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .scene-painting {
      animation: scene-arrival 0.65s ease-out;
    }
    .cinematic-conversation {
      animation: conversation-arrival 0.35s ease-out;
    }
    .inspection-card,
    .scene-drawer {
      animation: panel-arrival 0.22s ease-out;
    }
    .discovery {
      animation: discovery-arrival 0.4s ease-out;
    }
    @keyframes scene-arrival {
      from {
        opacity: 0.35;
        transform: scale(1.015);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes conversation-arrival {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes panel-arrival {
      from {
        opacity: 0.2;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes discovery-arrival {
      from {
        opacity: 0;
        filter: brightness(1.6);
      }
      to {
        opacity: 1;
        filter: brightness(1);
      }
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
