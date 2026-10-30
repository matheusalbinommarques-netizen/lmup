<script lang="ts">
  import { onMount } from 'svelte';
  import {
    CHAPTER_TWO_XP,
    chapterTwoScenes,
    pilotScenes,
    type PilotChoice,
    type PilotState,
  } from '$lib/content/pilot';
  import {
    advanceChapterTwo,
    advancePilot,
    chapterTwoProgress,
    initializeChapterTwoProgress,
    readPilot,
    unlockChapterTwo,
  } from '$services/rpgPilotService';
  import { journeyQuery } from '$services/journeyQuery';
  import Button from '$lib/ui/Button.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';

  let pilot = $state<PilotState>({ scene: 0 });
  let totalXp = $state(0);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state('');
  let replay = $state(false);
  let replayScene = $state(0);
  let speaking = $state(false);
  let voiceAvailable = $state(false);
  let browserFullscreen = $state(false);
  let canFullscreen = $state(false);
  let immersiveElement: HTMLElement;

  const chapterOneIndex = $derived(replay ? replayScene : pilot.scene);
  const playingTwo = $derived(!replay && pilot.chapterTwoUnlocked === true);
  const chapterTwoIndex = $derived(pilot.chapterTwoScene ?? 0);
  const scene = $derived(
    playingTwo
      ? chapterTwoScenes[Math.min(chapterTwoIndex, chapterTwoScenes.length - 1)]
      : pilotScenes[Math.min(chapterOneIndex, pilotScenes.length - 1)],
  );
  const progress = $derived(chapterTwoProgress(pilot, totalXp));
  const chapterOneFinished = $derived(chapterOneIndex === 6 && !playingTwo);
  const chapterTwoFinished = $derived(
    playingTwo && chapterTwoIndex >= chapterTwoScenes.length,
  );
  const chapterOneEnding = $derived(
    pilot.choice === 'help'
      ? {
          title: 'A promessa feita ao guarda',
          text: 'Você fica ao lado do guarda, improvisa ajuda e promete voltar com reforços. Quando a passagem é reaberta, ele se lembra de você.',
        }
      : {
          title: 'O eco sob as pedras',
          text: 'Você segue os passos pelas galerias, deixando sinais do caminho para que o guarda encontre ajuda. Lá embaixo, descobre uma inscrição que alguém tentou apagar.',
        },
  );

  onMount(() => {
    let live = true;
    canFullscreen = Boolean(document.documentElement.requestFullscreen);
    const syncFullscreen = () => {
      if (live) browserFullscreen = document.fullscreenElement === immersiveElement;
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    voiceAvailable =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window;
    const sync = async () => {
      try {
        const saved = await readPilot();
        if (live) {
          pilot = saved;
          error = '';
          ready = true;
        }
      } catch (cause) {
        if (live)
          error =
            cause instanceof Error
              ? cause.message
              : 'Não foi possível abrir a aventura.';
      }
    };
    void sync();
    const sub = journeyQuery().subscribe({
      next: (data) => {
        if (live) totalXp = data.profile?.totalXpEarned ?? 0;
      },
      error: () => {
        if (live)
          error = 'Não foi possível acompanhar o XP. Reabra a aventura.';
      },
    });
    window.addEventListener('focus', sync);
    return () => {
      live = false;
      window.removeEventListener('focus', sync);
      document.removeEventListener('fullscreenchange', syncFullscreen);
      sub.unsubscribe();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  });

  function stopSpeech() {
    if (voiceAvailable) window.speechSynthesis.cancel();
    speaking = false;
  }

  function speakScene() {
    if (!voiceAvailable) return;
    if (speaking) {
      stopSpeech();
      return;
    }
    const text = chapterOneFinished
      ? chapterOneEnding.title + '. ' + chapterOneEnding.text
      : chapterTwoFinished
        ? 'Fim desta demonstração. Sua jornada real continua disponível.'
        : [scene.title, scene.text, scene.speaker, scene.dialogue, scene.caption]
            .filter(Boolean)
            .join('. ');
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'pt-BR';
    voice.rate = 0.95;
    voice.onend = () => (speaking = false);
    voice.onerror = () => (speaking = false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voice);
    speaking = true;
  }

  async function next(selected?: PilotChoice) {
    if (busy) return;
    stopSpeech();
    if (replay) {
      replayScene = Math.min(6, replayScene + 1);
      return;
    }
    busy = true;
    error = '';
    try {
      pilot = playingTwo
        ? await advanceChapterTwo(chapterTwoIndex)
        : await advancePilot(pilot.scene, selected);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Não foi possível avançar.';
    } finally {
      busy = false;
    }
  }

  async function registerProgress() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      pilot = await initializeChapterTwoProgress();
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível salvar o marco.';
    } finally {
      busy = false;
    }
  }

  async function startSecond() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      pilot = await unlockChapterTwo();
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível abrir o capítulo.';
    } finally {
      busy = false;
    }
  }

  function review() {
    stopSpeech();
    replay = true;
    replayScene = 0;
  }
  function closeReview() {
    stopSpeech();
    replay = false;
  }

  async function toggleBrowserFullscreen() {
    try {
      if (document.fullscreenElement === immersiveElement) {
        await document.exitFullscreen();
      } else if (immersiveElement?.requestFullscreen) {
        await immersiveElement.requestFullscreen();
      }
    } catch {
      error = 'O navegador não permitiu tela cheia. O modo imersivo continua disponível nesta página.';
    }
  }

</script>

<svelte:head>
  <title>Aventura experimental · Level Me Up</title>
</svelte:head>

<section
  class="rpg-theater"
  bind:this={immersiveElement}
  aria-label="Aventura interativa"
>
  <div class="rpg-backdrop" aria-hidden="true">
    {#if ready}
      <Artwork
        src={chapterOneFinished ? '/art/pilot/scene-3.webp' : chapterTwoFinished
          ? '/art/pilot/scene-1.webp' : scene.art}
        alt=""
        eager
      />
    {/if}
  </div>
  <div class="rpg-vignette" aria-hidden="true"></div>

  <header class="rpg-theater-top">
    <div class="rpg-heading">
      <p class="rpg-kicker">Level Me Up <span aria-hidden="true">/</span> Aventura experimental</p>
      <h1>O outro lado da ponte</h1>
      <p class="rpg-chapter-state">
        Capítulo 1: {pilot.scene === 6 ? 'concluído' : 'em andamento'}
        <span aria-hidden="true">·</span>
        Capítulo 2: {pilot.chapterTwoUnlocked ? 'liberado' : 'por XP'}
      </p>
    </div>
    <nav class="rpg-top-actions" aria-label="Janela da aventura">
      {#if canFullscreen}
        <button class="rpg-icon-button" type="button" onclick={toggleBrowserFullscreen}>
          {browserFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
        </button>
      {/if}
      <a class="rpg-leave" href="/">Voltar para Hoje</a>
    </nav>
  </header>

  <div class="rpg-story-area" role="region" aria-label="Cena atual">
    {#if error}<p class="rpg-message" role="alert">{error}</p>{/if}
    {#if !ready}
      <p role="status" class="rpg-message">Preparando a aventura…</p>
    {:else if chapterOneFinished}
      <div class="rpg-story-card rpg-finale">
        <p class="rpg-overline">Capítulo 1 · Encerramento</p>
        <h2>{chapterOneEnding.title}</h2>
        <p>{chapterOneEnding.text}</p>
        <p class="rpg-caption">
          Sua escolha foi registrada. A próxima aventura poderá ser iniciada quando você desejar.
        </p>
        <div class="rpg-chapter-unlock" aria-labelledby="next-chapter-title">
          <p class="rpg-overline">Próxima aventura</p>
          <h3 id="next-chapter-title">Capítulo 2 — Ecos da passagem</h3>
          {#if replay}
            <p>Você está revendo o primeiro capítulo. Sua decisão original não mudou.</p>
          {:else if pilot.chapterOneEndXp === undefined}
            <p>Você concluiu o piloto antigo. Para não contar XP passado como conquista nova,
              defina agora o ponto de partida para o próximo capítulo.</p>
            <Button disabled={busy} onclick={registerProgress}>
              Começar a contar XP para o próximo capítulo
            </Button>
          {:else}
            <p>Continue suas atividades reais no seu ritmo. Ganhe {CHAPTER_TWO_XP} XP
              novos para liberar esta aventura — sem gastar seu XP.</p>
            <label for="rpg-xp">XP conquistado depois do capítulo 1</label>
            <progress id="rpg-xp" max={CHAPTER_TWO_XP}
              value={Math.min(progress.earned, CHAPTER_TWO_XP)}></progress>
            <p class="rpg-xp-numbers">
              {Math.min(progress.earned, CHAPTER_TWO_XP)} / {CHAPTER_TWO_XP} XP
              {#if !progress.available} · Faltam {progress.remaining} XP{/if}
            </p>
            {#if progress.available}
              <Button disabled={busy} onclick={startSecond}>Iniciar capítulo 2</Button>
            {:else}
              <a class="rpg-secondary-link" href="/missoes">Ver minhas missões reais</a>
            {/if}
          {/if}
        </div>
      </div>
    {:else if chapterTwoFinished}
      <div class="rpg-story-card rpg-finale">
        <p class="rpg-overline">Capítulo 2 · Concluído</p>
        <h2>O mundo continua</h2>
        <p>Esta pequena continuação serve para testar capítulos e progressão.
          A história definitiva será criada depois de validarmos a experiência.</p>
      </div>
    {:else}
      <div class="rpg-story-card">
        <p class="rpg-overline">
          {playingTwo ? 'Capítulo 2' : 'Capítulo 1'} ·
          Cena {(playingTwo ? chapterTwoIndex : chapterOneIndex) + 1}
          de {playingTwo ? chapterTwoScenes.length : pilotScenes.length}
        </p>
        <h2>{scene.title}</h2>
        <p class="rpg-narration">{scene.text}</p>
        {#if scene.speaker && scene.dialogue}
          <div class="rpg-dialogue">
            <span class="rpg-speaker">{scene.speaker}</span>
            <p>“{scene.dialogue}”</p>
          </div>
        {/if}
        <p class="rpg-caption">{scene.caption}</p>
      </div>
    {/if}
  </div>

  <footer class="rpg-theater-bottom">
    <div class="rpg-bottom-meta">
      <span>{replay ? 'Revendo a história' : 'Seu ritmo, suas escolhas'}</span>
      {#if voiceAvailable}
        <details class="rpg-options">
          <summary>Opções de voz</summary>
          <div>
            <p>Leitura sintética do navegador; nenhuma voz é reproduzida automaticamente.</p>
            <Button variant="quiet" onclick={speakScene}>
              {speaking ? 'Parar leitura' : 'Ouvir cena'}
            </Button>
          </div>
        </details>
      {/if}
    </div>
    <nav class="rpg-controls" aria-label="Controles da história">
      {#if ready}
        {#if !chapterOneFinished && !chapterTwoFinished}
          {#if !playingTwo && chapterOneIndex === 5 && !replay}
            <Button disabled={busy} onclick={() => next('help')}>Ajudar o guarda</Button>
            <Button variant="secondary" disabled={busy} onclick={() => next('follow')}>
              Investigar os passos
            </Button>
          {:else}
            <Button disabled={busy} onclick={() => next()}>
              {replay && chapterOneIndex === 5 ? 'Rever o desfecho' : 'Próxima cena'}
            </Button>
          {/if}
        {/if}
        {#if pilot.scene === 6 && !replay}
          <Button variant="quiet" onclick={review}>Rever capítulo 1</Button>
        {/if}
        {#if replay && chapterOneFinished}
          <Button variant="secondary" onclick={closeReview}>Voltar aos capítulos</Button>
        {/if}
      {/if}
    </nav>
  </footer>
</section>

<style>
  .rpg-theater {
    --rpg-gold: #e8c891;
    --rpg-paper: #f8f3e9;
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100dvh;
    min-height: 360px;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    color: var(--rpg-paper);
    background: #080e16;
    overflow: hidden;
  }
  .rpg-theater:fullscreen { width: 100vw; height: 100dvh; }
  .rpg-backdrop { position: absolute; inset: 0; z-index: -3; overflow: hidden; }
  .rpg-backdrop :global(img),
  .rpg-backdrop :global(.lmu-art-fallback) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
    filter: saturate(.9) contrast(1.08);
  }
  .rpg-vignette {
    position: absolute;
    inset: 0;
    z-index: -2;
    background:
      linear-gradient(180deg,rgba(5,9,17,.88),transparent 27%,transparent 39%,rgba(5,9,17,.92) 86%),
      linear-gradient(90deg,rgba(5,9,17,.76),transparent 85%);
    pointer-events: none;
  }
  .rpg-theater-top {
    padding: max(1rem, env(safe-area-inset-top)) clamp(1rem,3vw,2.5rem) 1rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }
  .rpg-heading { min-width: 0; }
  .rpg-kicker,.rpg-overline { color: var(--rpg-gold); font-size: .78rem; letter-spacing: .13em; text-transform: uppercase; }
  .rpg-kicker span { color: #b5b9bf; padding: 0 .3rem; }
  .rpg-heading h1 { font-size: clamp(1.15rem,2.1vw,1.6rem); line-height: 1.18; color: #fff; margin: .35rem 0; }
  .rpg-chapter-state { margin: 0; color: #ccd3da; font-size: .85rem; }
  .rpg-chapter-state span { padding: 0 .3rem; }
  .rpg-top-actions { display: flex; gap: .65rem; flex-wrap: wrap; justify-content: flex-end; flex-shrink: 0; }
  .rpg-leave,.rpg-icon-button,.rpg-secondary-link {
    color: var(--rpg-paper);
    text-decoration: none;
    background: rgba(5,12,19,.79);
    border: 1px solid rgba(241,224,192,.5);
    border-radius: .7rem;
    padding: .65rem .85rem;
    font: inherit;
    font-size: .88rem;
    cursor: pointer;
    min-height: 44px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .rpg-story-area {
    overflow-y: auto;
    min-height: 0;
    padding: 1rem clamp(1rem,4vw,3.75rem);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 1rem;
  }
  .rpg-story-card {
    width: min(100%, 68ch);
    background: linear-gradient(90deg,rgba(7,12,19,.88),rgba(7,12,19,.56));
    border-left: 3px solid rgba(232,200,145,.74);
    border-radius: 0 .8rem .8rem 0;
    padding: clamp(1rem,2.1vw,1.75rem);
    box-shadow: 0 12px 40px rgba(0,0,0,.22);
  }
  .rpg-story-card h2 {
    color: #fff;
    font-size: clamp(1.55rem,3vw,2.6rem);
    line-height: 1.15;
    margin: .45rem 0 1rem;
  }
  .rpg-story-card p { line-height: 1.55; margin: .55rem 0; max-width: 68ch; }
  .rpg-narration { font-size: clamp(.99rem,1.35vw,1.12rem); }
  .rpg-caption { color: #ead4ad; font-style: italic; }
  .rpg-dialogue {
    margin-top: .9rem;
    padding: .55rem 1rem;
    background: rgba(31,38,46,.75);
    border-radius: .45rem;
  }
  .rpg-speaker { color: var(--rpg-gold); font-weight: 700; font-size: .85rem; }
  .rpg-dialogue p { margin: .32rem 0; }
  .rpg-finale { max-width: 74ch; }
  .rpg-chapter-unlock {
    border-top: 1px solid rgba(232,200,145,.45);
    margin-top: 1.2rem;
    padding-top: .8rem;
  }
  .rpg-chapter-unlock h3 { font-size: 1.15rem; margin: .4rem 0; color: #fff; }
  .rpg-chapter-unlock label { font-size: .85rem; display: block; margin: 1rem 0 .45rem; }
  .rpg-chapter-unlock progress { width: 100%; height: .8rem; }
  .rpg-xp-numbers { font-variant-numeric: tabular-nums; }
  .rpg-message { background: #2e1616; border: 1px solid #b96565; color: white; padding: .7rem 1rem; border-radius: .6rem; }
  .rpg-theater-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem clamp(1rem,3vw,2.5rem) max(1rem, env(safe-area-inset-bottom));
    background: rgba(5,9,17,.85);
    border-top: 1px solid rgba(241,224,192,.23);
  }
  .rpg-bottom-meta { color: #d5d5db; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; font-size: .85rem; }
  .rpg-controls { display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: .65rem; }
  .rpg-options { position: relative; }
  .rpg-options summary { cursor: pointer; color: var(--rpg-gold); font-size: .85rem; }
  .rpg-options[open] > div {
    position: absolute;
    z-index: 4;
    bottom: 2.5rem;
    left: 0;
    min-width: min(19rem,75vw);
    max-width: 19rem;
    padding: 1rem;
    color: var(--rpg-paper);
    background: #17212e;
    border: 1px solid rgba(232,200,145,.5);
    border-radius: .7rem;
  }
  .rpg-options[open] > div p { font-size: .85rem; line-height: 1.5; }
  .rpg-theater :global(.lmu-button) { min-height: 44px; }
  .rpg-theater :is(button,a,summary):focus-visible { outline: 3px solid var(--rpg-gold); outline-offset: 3px; }
  @media (max-width: 700px) {
    .rpg-theater-top { padding: .75rem 1rem; align-items: flex-start; }
    .rpg-kicker { font-size: .65rem; }
    .rpg-heading h1 { font-size: 1.1rem; }
    .rpg-chapter-state { font-size: .74rem; }
    .rpg-top-actions { flex-wrap: nowrap; }
    .rpg-top-actions :is(a,button) { font-size: .75rem; padding: .45rem .55rem; }
    .rpg-story-area { padding: .75rem .8rem; }
    .rpg-story-card { padding: .85rem; width: 100%; }
    .rpg-story-card h2 { margin: .2rem 0 .5rem; }
    .rpg-story-card p { line-height: 1.4; }
    .rpg-dialogue { margin-top: .5rem; }
    .rpg-theater-bottom { padding: .6rem .8rem max(.7rem,env(safe-area-inset-bottom)); align-items: flex-end; }
    .rpg-bottom-meta > span { display: none; }
    .rpg-controls :global(.lmu-button) { font-size: .85rem; }
  }
  @media (max-width: 380px) {
    .rpg-top-actions { flex-direction: column; }
    .rpg-theater-bottom { flex-direction: column-reverse; align-items: stretch; }
    .rpg-controls { justify-content: stretch; }
    .rpg-controls :global(.lmu-button) { flex: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rpg-theater * { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
  }
</style>
