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
</script>

<svelte:head><title>Aventura experimental · Level Me Up</title></svelte:head>

<section class="rpg-pilot">
  <header class="rpg-pilot-header">
    <p class="lmu-eyebrow">Aventura experimental · roteiro provisório</p>
    <h1>O outro lado da ponte</h1>
    <p class="lmu-muted">
      Capítulos completos, escolhas salvas e avanço manual. Sua vida real continua
      sendo o centro da jornada.
    </p>
  </header>

  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if !ready}
    <p role="status">Preparando a aventura…</p>
  {:else}
    <div class="rpg-pilot-chapters" aria-label="Progresso dos capítulos">
      <span>Capítulo 1 · {pilot.scene === 6 ? 'Concluído' : 'Em andamento'}</span>
      <span>
        Capítulo 2 · {pilot.chapterTwoUnlocked
          ? 'Disponível'
          : pilot.chapterOneEndXp === undefined
            ? 'Ainda não iniciado'
            : progress.available
              ? 'Pronto para abrir'
              : 'Em preparação'}
      </span>
    </div>

    {#if chapterOneFinished}
      <article class="rpg-pilot-scene">
        <Artwork
          src="/art/pilot/scene-3.webp"
          alt="Paisagem fantástica diante da ponte"
          eager
        />
        <div class="rpg-pilot-overlay">
          <p class="rpg-pilot-counter">Capítulo 1 concluído</p>
          <h2>{chapterOneEnding.title}</h2>
          <p>{chapterOneEnding.text}</p>
          <p class="rpg-pilot-caption">
            Sua escolha foi salva. O próximo capítulo começa apenas quando você
            decidir iniciá-lo.
          </p>
        </div>
      </article>
      <section class="rpg-pilot-unlock" aria-labelledby="rpg-next-title">
        <p class="lmu-eyebrow">Próximo capítulo</p>
        <h2 id="rpg-next-title">Ecos da passagem</h2>
        {#if replay}
          <p>Você está revendo o primeiro capítulo. Sua decisão original não mudou.</p>
          <Button onclick={closeReview}>Voltar aos capítulos</Button>
        {:else if pilot.chapterOneEndXp === undefined}
          <p>
            Você concluiu a versão anterior do piloto. Para preservar seu XP
            antigo, o progresso do segundo capítulo começará a contar a partir de agora.
          </p>
          <Button disabled={busy} onclick={registerProgress}>
            Começar a contar XP para o próximo capítulo
          </Button>
        {:else}
          <p>
            Seu esforço fora do jogo libera a próxima aventura. O XP não será gasto.
            Não existe prazo ou sequência obrigatória.
          </p>
          <label for="rpg-xp">XP conquistado depois do capítulo 1</label>
          <progress id="rpg-xp" max={CHAPTER_TWO_XP} value={Math.min(progress.earned, CHAPTER_TWO_XP)}></progress>
          <p class="rpg-pilot-meter">{Math.min(progress.earned, CHAPTER_TWO_XP)} / {CHAPTER_TWO_XP} XP
            {#if !progress.available} · Faltam {progress.remaining} XP{/if}
          </p>
          {#if progress.available}
            <Button disabled={busy} onclick={startSecond}>Iniciar capítulo 2</Button>
          {:else}
            <a class="lmu-button lmu-button--secondary" href="/missoes">Ver minhas missões reais</a>
          {/if}
        {/if}
      </section>
    {:else if chapterTwoFinished}
      <div class="rpg-pilot-unlock">
        <p class="lmu-eyebrow">Capítulo 2 concluído</p>
        <h2>O mundo continua</h2>
        <p>Esta foi uma demonstração curta de capítulos completos e desbloqueios.
          A próxima história será desenvolvida depois da avaliação da experiência.</p>
      </div>
    {:else}
      <article class="rpg-pilot-scene">
        <Artwork src={scene.art} alt={'Ambiente ilustrado de ' + scene.title} eager />
        <div class="rpg-pilot-overlay">
          <p class="rpg-pilot-counter">
            {playingTwo ? 'Capítulo 2' : 'Capítulo 1'} ·
            Cena {(playingTwo ? chapterTwoIndex : chapterOneIndex) + 1}
            de {playingTwo ? chapterTwoScenes.length : pilotScenes.length}
          </p>
          <h2>{scene.title}</h2>
          <p>{scene.text}</p>
          {#if scene.speaker && scene.dialogue}
            <div class="rpg-pilot-dialogue">
              <strong>{scene.speaker}</strong>
              <p>“{scene.dialogue}”</p>
            </div>
          {/if}
          <p class="rpg-pilot-caption">{scene.caption}</p>
        </div>
      </article>
    {/if}

    <nav class="rpg-pilot-actions" aria-label="Controles da aventura">
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
      {#if voiceAvailable}
        <Button variant="quiet" onclick={speakScene}>
          {speaking ? 'Parar leitura' : 'Ouvir (voz do dispositivo)'}
        </Button>
      {/if}
      {#if pilot.scene === 6 && !replay}
        <Button variant="quiet" onclick={review}>Rever capítulo 1</Button>
      {/if}
      <a class="lmu-button lmu-button--secondary" href="/">Voltar para Hoje</a>
    </nav>
  {/if}
</section>

<style>
  .rpg-pilot{max-width:960px;margin:0 auto;padding:1.25rem 0 3rem}
  .rpg-pilot-header h1{margin:.35rem 0}
  .rpg-pilot-chapters{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.5rem 0 1rem}
  .rpg-pilot-chapters span{padding:.5rem .8rem;border:1px solid #827254;border-radius:.6rem;font-size:.85rem}
  .rpg-pilot-scene{position:relative;min-height:480px;overflow:hidden;border-radius:1rem;border:1px solid #8f7654;background:#171a21;display:flex;flex-direction:column;justify-content:flex-end}
  .rpg-pilot-scene :global(img),.rpg-pilot-scene :global(.lmu-art-fallback){position:absolute;width:100%;height:100%;inset:0;object-fit:cover;opacity:.67}
  .rpg-pilot-overlay{position:relative;z-index:1;padding:clamp(1.1rem,4vw,2.5rem);background:linear-gradient(transparent,rgba(10,13,19,.97) 30%);color:#f5eddb}
  .rpg-pilot-counter{font-size:.83rem;letter-spacing:.08em;text-transform:uppercase;color:#e4ca98}
  .rpg-pilot-overlay h2{font-size:clamp(1.6rem,4vw,2.3rem);margin:.7rem 0}
  .rpg-pilot-overlay>p{max-width:67ch;line-height:1.65}
  .rpg-pilot-dialogue{margin:1rem 0;padding:.75rem 1rem;border-left:3px solid #d4b776;background:rgba(10,13,19,.76);max-width:60ch}
  .rpg-pilot-dialogue strong{color:#f1d9a1}
  .rpg-pilot-dialogue p{margin:.3rem 0 0;line-height:1.6}
  .rpg-pilot-caption{font-style:italic;color:#e5c995}
  .rpg-pilot-unlock{margin:1.2rem 0;padding:clamp(1rem,3vw,1.8rem);border:1px solid #827254;border-radius:1rem}
  .rpg-pilot-unlock progress{width:100%;height:1rem;display:block;margin:.65rem 0}
  .rpg-pilot-meter{font-variant-numeric:tabular-nums}
  .rpg-pilot-actions{margin-top:1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
  @media(max-width:560px){.rpg-pilot-scene{min-height:490px}.rpg-pilot-overlay{background:linear-gradient(transparent,rgba(10,13,19,.98) 22%)}}
  @media(prefers-reduced-motion:reduce){.rpg-pilot-scene,.rpg-pilot-scene *{animation:none!important;transition:none!important}}
</style>
