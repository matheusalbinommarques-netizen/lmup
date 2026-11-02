<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { page } from '$app/state';
  import { db, type Profile } from '$services/db';
  import {
    ensureWorld,
    actInWorld,
    type WorldCommand,
  } from '$services/worldService';
  import {
    worldArt,
    locations,
    founders,
    clues,
    requiredClues,
    hotspots,
    sceneContent,
    type LocationId,
    type SceneId,
    type HotspotId,
  } from './content';
  import { type WorldState } from './worldState';
  import RegionalMap from './RegionalMap.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import { guardUpdates } from '$lib/journey/guardUpdates';
  let { campaign = false }: { campaign?: boolean } = $props();
  let world = $state<WorldState>(),
    profile = $state<Profile>(),
    error = $state(''),
    notice = $state(''),
    busy = $state(false);
  let section = $state<'explore' | 'atlas' | 'history'>('explore'),
    view = $state<'map' | 'scene'>('map'),
    selected = $state<LocationId>('oasis');
  let confirmation = $state<{
      choice: 'rescue' | 'route';
      epoch: string;
      revision: number;
    }>(),
    confirmOpen = $state(false);
  let narration = $state(false),
    volume = $state(0.7),
    voiceAvailable = $state(false);
  let voice: SpeechSynthesisVoice | undefined;
  guardUpdates(() => busy || confirmOpen);
  onMount(() => {
    let live = true;
    const subscription = liveQuery(() => db.profile.get(1)).subscribe({
      next: (p) => {
        if (live) {
          profile = p;
          world = p?.world;
        }
      },
      error: () =>
        (error =
          'Não foi possível ler sua exploração. Seus dados foram preservados.'),
    });
    void ensureWorld()
      .then((saved) => {
        if (live) {
          world = saved;
          if (page.url.searchParams.get('retomar') === '1' && saved.lastScene)
            view = 'scene';
          if (page.url.searchParams.get('diario') === '1') section = 'history';
        }
      })
      .catch((cause) => {
        if (live)
          error =
            cause instanceof Error
              ? cause.message
              : 'Não foi possível abrir o Mundo.';
      });
    const voices = () => {
      if (!('speechSynthesis' in window)) return;
      voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.localService && v.lang.toLowerCase().startsWith('pt'));
      voiceAvailable = !!voice;
    };
    voices();
    if ('speechSynthesis' in window)
      window.speechSynthesis.addEventListener('voiceschanged', voices);
    return () => {
      live = false;
      subscription.unsubscribe();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', voices);
        window.speechSynthesis.cancel();
      }
    };
  });
  const selectedPlace = $derived(locations.find((p) => p.id === selected)!);
  const scene = $derived(world?.lastScene ?? 'settlement');
  const point = $derived(hotspots.find((p) => p.id === world?.focus));
  const gathered = $derived(
    requiredClues.filter((id) => world?.clues.includes(id)).length,
  );
  const questLabel = $derived(
    world?.quest === 'solved'
      ? 'Investigação concluída'
      : world?.quest === 'active'
        ? 'Em investigação'
        : 'Uma caravana está atrasada',
  );
  const dialogueText = $derived.by(() => {
    if (!world?.dialogue) return '';
    switch (world.dialogue) {
      case 'welcome':
        return 'Uma caravana de mantimentos não chegou no horário combinado. Com o assentamento em obras, cada entrega faz falta. Quero saber o que aconteceu antes de mandar gente pela estrada.';
      case 'briefing':
        return 'A entrega vem pelo caminho do Entreposto de Variel. Comece no quadro de avisos e examine os arredores. Separe o que pode verificar daquilo que parece apenas estranho.';
      case 'progress':
        return 'O que você encontrou? Precisamos entender a avaria, o destino da carga e para onde foram os carregadores. Não é preciso adivinhar: a estrada deixa sinais.';
      case 'hint':
        return 'Olhe de perto a carroça, os sacos e as pegadas no caminho. Registre as pistas que conseguir confirmar. Depois volte para conversarmos.';
      case 'report':
        return 'Suas pistas fazem sentido. Enquanto você estava fora, dois carregadores chegaram pelo portão: todos estão seguros. O eixo quebrou, e eles trouxeram parte da carga pelo caminho alto. O restante da caravana aguarda no entreposto. Como vamos encaminhar isso?';
      case 'evidence':
        return 'A madeira rompeu sob o peso, a carga foi dividida para transporte e as pegadas seguem de volta ao Oásis. O relato dos carregadores confirma os três sinais. Foi uma avaria, não um desaparecimento inexplicável.';
      case 'ending':
        return world.resolution === 'rescue'
          ? 'Já organizei a saída de uma pequena equipe com as cordas que você separou. A carga será recolhida e os carregadores poderão descansar. Você agiu com cuidado quando precisávamos de ajuda. Vou me lembrar disso.'
          : 'O aviso seguiu para o entreposto, e sua indicação do caminho alto ficou registrada. A próxima entrega terá uma rota de retorno conhecida. Você sabe observar antes de concluir. Isso é útil por aqui.';
    }
  });
  const choices = $derived.by(() => {
    const n = world?.dialogue;
    if (n === 'welcome')
      return [
        { id: 'ask', label: 'O que sabemos sobre a entrega?' },
        { id: 'accept', label: 'Vou investigar os arredores.' },
        { id: 'leave', label: 'Conversamos depois.' },
      ];
    if (n === 'briefing')
      return [
        { id: 'accept', label: 'Vou procurar sinais verificáveis.' },
        { id: 'leave', label: 'Vou me preparar primeiro.' },
      ];
    if (n === 'progress')
      return [
        { id: 'hint', label: 'Por onde você sugere começar?' },
        { id: 'leave', label: 'Vou continuar procurando.' },
      ];
    if (n === 'hint')
      return [{ id: 'leave', label: 'Entendido. Vou examinar a estrada.' }];
    if (n === 'report' || n === 'evidence')
      return [
        {
          id: 'review',
          label:
            n === 'report'
              ? 'Rever as pistas antes de decidir.'
              : 'Voltar à decisão.',
        },
        { id: 'rescue', label: 'Organizar ajuda para recuperar a carga.' },
        { id: 'route', label: 'Registrar a rota e avisar o entreposto.' },
        { id: 'leave', label: 'Vou pensar antes de decidir.' },
      ];
    return [{ id: 'leave', label: 'Até a próxima, Lucan.' }];
  });
  $effect(() => {
    if (
      campaign ||
      view !== 'scene' ||
      section !== 'explore' ||
      !narration ||
      !voiceAvailable ||
      !voice ||
      !dialogueText
    )
      return;
    const speech = new SpeechSynthesisUtterance(dialogueText);
    speech.voice = voice;
    speech.lang = 'pt-BR';
    speech.volume = volume;
    speech.rate = 0.96;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
    return () => window.speechSynthesis.cancel();
  });
  async function perform(
    command: WorldCommand,
    expected?: { epoch: string; revision: number },
  ) {
    if (!world || busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      world = await actInWorld(
        command,
        expected ?? { epoch: world.epoch, revision: world.revision },
        crypto.randomUUID(),
      );
      if (command.type === 'collect') notice = 'Pista registrada no diário.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível registrar a ação.';
    } finally {
      busy = false;
    }
  }
  async function enter(next: SceneId) {
    await perform({ type: 'enter', scene: next });
    if (world?.lastScene === next) {
      view = 'scene';
      section = 'explore';
    }
  }
  async function interact(id: HotspotId) {
    if (id === 'lucan') await perform({ type: 'talk' });
    else if (id === 'exit') await enter('outskirts');
    else if (id === 'return') await enter('settlement');
    else await perform({ type: 'inspect', id });
  }
  async function choose(choice: string) {
    if (!world) return;
    if (choice === 'rescue' || choice === 'route') {
      confirmation = { choice, epoch: world.epoch, revision: world.revision };
      confirmOpen = true;
    } else
      await perform({
        type: 'choose',
        choice: choice as 'ask' | 'accept' | 'hint' | 'review' | 'leave',
      });
  }
</script>

<svelte:head
  ><title>{campaign ? 'Campanha dos Ermos' : 'Mundo'} · Level Me Up</title
  ></svelte:head
>
<div class="world-experience" class:campaign>
  <header class="world-header">
    <div>
      <p class="lmu-eyebrow">Uma história construída pelas suas escolhas</p>
      <h1>{campaign ? 'Aventura nos Ermos' : 'Mundo'}</h1>
      <p>
        {campaign
          ? 'Objetivos, pistas e acontecimentos da sua campanha.'
          : 'Explore a região, encontre pessoas e descubra o que aconteceu.'}
      </p>
    </div>
    {#if profile}<div class="resources" aria-label="Recursos do herói">
        <span>Nível {profile.level}</span><span>{profile.totalXpEarned} XP</span
        ><span>Ouro: {profile.gold}</span><span
          >Comida: {profile.food ?? 0}</span
        >
      </div>{/if}
  </header>
  {#if error}<p class="journey-error" role="alert">
      {error}
    </p>{/if}{#if notice}<p class="journey-banner" role="status">
      {notice}
    </p>{/if}
  {#if !world}<p role="status">Abrindo sua exploração…</p>{:else}
    {#if campaign}<nav class="world-actions">
        <a class="lmu-button lmu-button--primary" href="/mundo">Abrir Mundo</a
        >{#if world.lastScene}<a
            class="lmu-button lmu-button--secondary"
            href="/mundo?retomar=1">Continuar exploração</a
          >{/if}<a class="journey-link" href="/aventura"
          >Piloto experimental de Védria →</a
        ><a class="journey-link" href="/progresso">Meu progresso →</a>
      </nav>
    {:else}<nav class="world-tabs" aria-label="Seções de Mundo">
        {#each [{ id: 'explore', label: 'Exploração' }, { id: 'atlas', label: 'Atlas' }, { id: 'history', label: 'História do Mundo' }] as item (item.id)}<Button
            variant={section === item.id ? 'primary' : 'secondary'}
            aria-pressed={section === item.id}
            onclick={() => (section = item.id as typeof section)}
            >{item.label}</Button
          >{/each}<a class="journey-link" href="/aventura?campanha=ermos"
          >Campanha e objetivos →</a
        ><a class="journey-link" href="/progresso">Meu progresso →</a>
      </nav>{/if}
    {#if !campaign && section === 'explore'}
      {#if view === 'map'}<div class="exploration-layout">
          <RegionalMap {world} bind:selected />
          <aside class="world-panel">
            <p class="lmu-eyebrow">
              {selected === 'oasis'
                ? 'Local atual'
                : world.discovered.includes(selected)
                  ? 'Local conhecido · viagem futura'
                  : 'Local não descoberto'}
            </p>
            <h2>{selectedPlace.name}</h2>
            {#if selected === 'oasis'}<img
                class="local-preview"
                src={worldArt + 'cena-oasis-construcao.webp'}
                alt="Tendas e oficinas no assentamento em construção"
              />{/if}
            <p>{selectedPlace.description}</p>
            {#if selected === 'oasis'}<div class="world-actions vertical">
                <Button disabled={busy} onclick={() => enter('settlement')}
                  >Entrar no assentamento</Button
                ><Button
                  variant="secondary"
                  disabled={busy || world.quest === 'new'}
                  onclick={() => enter('outskirts')}>Explorar arredores</Button
                >{#if world.lastScene}<Button
                    variant="secondary"
                    onclick={() => {
                      view = 'scene';
                    }}>Continuar exploração</Button
                  >{/if}
              </div>
              {#if world.quest === 'new'}<p class="lmu-hint">
                  Encontre Lucan no assentamento para planejar a investigação.
                </p>{/if}{:else}<p class="lmu-hint">
                Novas expedições permitirão explorar esta localidade. Por
                enquanto, sua jornada começa no Oásis e em seus arredores.
              </p>{/if}<a class="journey-link" href="/aposentos"
              >Aposentos e progresso preservado →</a
            >
          </aside>
        </div>
      {:else}<div class="scene-toolbar">
          <Button variant="secondary" onclick={() => (view = 'map')}
            >Voltar ao mapa</Button
          >
          <h2>{sceneContent[scene].name}</h2>
          <span class="lmu-hint"
            >Seu ponto de retomada é salvo a cada ação.</span
          >
        </div>
        <div class="exploration-layout scene-layout">
          <section class="scene-panel" aria-label="Cena explorável">
            <div class="illustrated-scene">
              <img
                src={worldArt + sceneContent[scene].art}
                alt={sceneContent[scene].description}
              />{#each hotspots.filter((p) => p.scene === scene) as hotspot, index (hotspot.id)}<button
                  class="hotspot"
                  style:left={hotspot.x + '%'}
                  style:top={hotspot.y + '%'}
                  aria-label={hotspot.name}
                  disabled={busy}
                  onclick={() => interact(hotspot.id)}
                  ><span aria-hidden="true">{index + 1}</span><small
                    >{hotspot.name}</small
                  ></button
                >{/each}
            </div>
            <p class="scene-caption">{sceneContent[scene].description}</p>
            <nav class="interaction-list" aria-label="Interações da cena">
              {#each hotspots.filter((p) => p.scene === scene) as hotspot, index (hotspot.id)}<Button
                  variant="secondary"
                  disabled={busy}
                  onclick={() => interact(hotspot.id)}
                  >{index + 1}. {hotspot.name}</Button
                >{/each}
            </nav>
          </section>
          <aside class="world-panel interaction-panel" aria-live="polite">
            {#if world.dialogue}<div class="speaker">
                <img
                  src={worldArt + 'lucan-dorian.webp'}
                  alt="Retrato de Lucan Dorian"
                />
                <div>
                  <p class="lmu-eyebrow">Fundador · Ladino</p>
                  <h2>Lucan Dorian</h2>
                </div>
              </div>
              <p class="dialogue-text">{dialogueText}</p>
              <div class="dialogue-choices">
                {#each choices as choice (choice.id)}<Button
                    variant="secondary"
                    disabled={busy}
                    onclick={() => choose(choice.id)}>{choice.label}</Button
                  >{/each}
              </div>
              {#if voiceAvailable}<label class="journey-check"
                  ><input type="checkbox" bind:checked={narration} />Narração
                  com voz local</label
                >{#if narration}<label class="volume"
                    >Volume<input
                      type="range"
                      min="0"
                      max="1"
                      step=".1"
                      bind:value={volume}
                    /></label
                  ><Button
                    variant="quiet"
                    onclick={() => window.speechSynthesis.cancel()}
                    >Pular narração</Button
                  >{/if}{/if}
            {:else if point}<p class="lmu-eyebrow">Investigação</p>
              <h2>{point.name}</h2>
              <p>
                {point.id === 'supplies' && world.quest === 'solved'
                  ? world.resolution === 'rescue'
                    ? 'Cordas e recipientes foram separados para a equipe que recuperará a carga. Sua decisão mudou os preparativos do assentamento.'
                    : 'O registro da rota segura está sobre a mesa, junto do aviso enviado ao entreposto.'
                  : point.text}
              </p>
              {#if 'clue' in point}{#if world.clues.includes(point.clue)}<p
                    class="clue-recorded"
                  >
                    ✓ Pista registrada no diário
                  </p>{:else if world.quest === 'active'}<Button
                    disabled={busy}
                    onclick={() => perform({ type: 'collect' })}
                    >Registrar pista</Button
                  >{:else}<p class="lmu-hint">
                    Converse com Lucan para iniciar a investigação.
                  </p>{/if}{/if}
            {:else}<p class="lmu-eyebrow">Observe antes de concluir</p>
              <h2>
                {scene === 'settlement'
                  ? 'Um começo entre andaimes'
                  : 'Sinais na estrada'}
              </h2>
              <p>
                Escolha um ponto na cena ou na lista de interações. As falas e
                investigações avançam no seu ritmo.
              </p>{/if}
          </aside>
        </div>{/if}
    {/if}
    {#if !campaign && section === 'atlas'}<section class="atlas">
        <h2>Os quatro fundadores</h2>
        <p>
          Quatro caminhos diferentes se encontram na construção do Oásis.
          Conheça as pessoas que deram início ao assentamento.
        </p>
        <div class="founder-grid">
          {#each founders as founder (founder.id)}<article>
              <img
                src={worldArt + founder.id + '.webp'}
                alt={'Retrato de ' + founder.name}
                loading="lazy"
              />
              <h3>{founder.name}</h3>
              <p>{founder.role}</p>
              <small>{founder.age} anos</small>
            </article>{/each}
        </div>
        <h2>Geografia conhecida</h2>
        <ul>
          {#each locations.filter( (p) => world?.discovered.includes(p.id) ) as place (place.id)}<li
            >
              <strong>{place.name}</strong> · {place.description}
            </li>{/each}
        </ul>
      </section>{/if}
    <section class="quest-card" aria-label="Investigação atual">
      <ApprovedIcon name="missions" size={36} />
      <div>
        <p class="lmu-eyebrow">{questLabel}</p>
        <h2>A Caravana Perdida</h2>
        <p>
          {world.quest === 'solved'
            ? 'A caravana foi localizada. Os carregadores estão seguros, e sua decisão ficou registrada.'
            : world.quest === 'active'
              ? 'Examine a carroça, a carga e os rastros. Registre as três pistas e retorne a Lucan.'
              : 'Lucan precisa entender o atraso de uma entrega antes de enviar ajuda.'}
        </p>
        {#if world.quest !== 'new'}<label class="evidence-progress"
            >Pistas verificadas: {gathered} / 3<progress
              max="3"
              value={gathered}
            ></progress></label
          >{/if}{#if world.quest === 'solved'}<p class="relationship">
            Relação com Lucan: {world.resolution === 'rescue'
              ? 'confiança na sua iniciativa'
              : 'respeito pela sua atenção aos detalhes'}.
          </p>{/if}
      </div>
    </section>
    {#if campaign || section === 'history'}<section class="journal">
        <h2>Diário da campanha</h2>
        <p>
          Revisar estes registros não altera escolhas nem reaplica
          consequências.
        </p>
        {#if !world.journal.length}<p class="lmu-muted">
            Sua história nos Ermos ainda vai começar.
          </p>{:else}<ol>
            {#each [...world.journal].reverse() as entry (entry.id)}<li>
                <small>{new Date(entry.at).toLocaleDateString('pt-BR')}</small>
                <p>{entry.text}</p>
              </li>{/each}
          </ol>{/if}
        <h3>Pistas registradas</h3>
        <ul>
          {#each world.clues as id (id)}<li>
              <strong>{clues[id].name}</strong> — {clues[id].text}
            </li>{/each}
        </ul>
      </section>{/if}
    {#if !campaign && section === 'explore'}<p class="world-footnote">
        Localidades identificadas: {world.discovered.length} / {locations.length}
        · Cenas visitadas no Oásis: {world.visitedScenes.length} / 2. O mapa é fixo;
        os acontecimentos acompanham suas ações.
      </p>{/if}
  {/if}
</div>
<Dialog
  bind:open={confirmOpen}
  title="Registrar sua decisão"
  dismissible={!busy}
  ><p>
    {confirmation?.choice === 'rescue'
      ? 'Você organizará ajuda para recuperar a carga. Lucan reconhecerá sua iniciativa.'
      : 'Você registrará a rota segura e avisará o entreposto. Lucan reconhecerá sua atenção aos detalhes.'}
  </p>
  <p>
    Esta escolha ficará na história da campanha. Nenhum XP, ouro ou comida será
    concedido ou gasto.
  </p>
  <div class="world-actions">
    <Button
      disabled={busy}
      onclick={async () => {
        if (confirmation) {
          await perform(
            { type: 'choose', choice: confirmation.choice },
            confirmation,
          );
          if (!error) confirmOpen = false;
        }
      }}>Confirmar decisão</Button
    ><Button
      variant="quiet"
      disabled={busy}
      onclick={() => (confirmOpen = false)}>Voltar à conversa</Button
    >
  </div>
  {#if error}<p role="alert">{error}</p>{/if}</Dialog
>

<style>
  .world-experience {
    max-width: 1600px;
    margin: auto;
    color: #eee8d7;
  }
  .world-experience.campaign {
    padding: clamp(20px, 5vw, 70px);
    min-height: 100dvh;
    background:
      radial-gradient(ellipse at top right, #293a3040, transparent 70%), #071519;
  }
  .world-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
  }
  .world-header h1 {
    font: 600 clamp(2.5rem, 5vw, 4rem) var(--lmu-display);
    color: #f0dfb7;
    margin: 6px 0;
  }
  .world-header p {
    color: #c8d0c5;
    margin: 5px 0;
  }
  .resources {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    border: 1px solid #8b764f;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 0.86rem;
    background: #09191c;
  }
  .resources span {
    white-space: nowrap;
  }
  .world-tabs,
  .world-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }
  .world-tabs .journey-link {
    font-size: 0.85rem;
    margin-left: auto;
  }
  .exploration-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(250px, 1fr);
    gap: 18px;
    align-items: start;
  }
  .world-panel {
    border: 1px solid #8c744a;
    border-radius: 14px;
    padding: 22px;
    background: linear-gradient(145deg, #15292b, #071519);
    min-width: 0;
  }
  .world-panel h2 {
    font: 600 1.8rem var(--lmu-display);
    color: #f0dfb7;
    margin: 8px 0 16px;
  }
  .world-panel > p {
    line-height: 1.65;
    color: #d6dbcc;
  }
  .local-preview {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #726442;
  }
  .vertical {
    display: grid;
    align-items: stretch;
    margin-top: 20px;
  }
  .world-panel .journey-link {
    font-size: 0.85rem;
  }
  .scene-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 15px;
  }
  .scene-toolbar h2 {
    margin: 0;
    font: 600 1.8rem var(--lmu-display);
  }
  .scene-toolbar > span {
    margin-left: auto;
  }
  .scene-panel {
    border: 1px solid #8c744a;
    border-radius: 14px;
    overflow: hidden;
    background: #091a1e;
  }
  .illustrated-scene {
    position: relative;
    aspect-ratio: 16/9;
  }
  .illustrated-scene > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .hotspot {
    position: absolute;
    transform: translate(-50%, -50%);
    background: none;
    border: none;
    color: #ffe4a5;
    display: grid;
    justify-items: center;
    gap: 3px;
    cursor: pointer;
    max-width: 32%;
    min-width: 44px;
    min-height: 44px;
  }
  .hotspot > span {
    width: 27px;
    height: 27px;
    border: 2px solid #f4cc7a;
    border-radius: 50%;
    background: #132328e8;
    display: grid;
    place-items: center;
    font-size: 0.85rem;
    box-shadow: 0 0 12px #d8aa4c88;
  }
  .hotspot > small {
    background: #071519ee;
    padding: 3px 7px;
    border: 1px solid #aa8950;
    border-radius: 5px;
    font-size: 0.78rem;
    white-space: nowrap;
  }
  .hotspot:focus-visible {
    outline: 3px solid #fff2cc;
    border-radius: 8px;
    z-index: 2;
  }
  .scene-caption {
    padding: 0 16px;
    color: #c6d1c4;
    font-size: 0.86rem;
    line-height: 1.55;
  }
  .interaction-list {
    padding: 5px 16px 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .speaker {
    display: flex;
    align-items: center;
    gap: 13px;
  }
  .speaker img {
    width: 90px;
    height: 120px;
    object-fit: cover;
    border: 1px solid #9b7c47;
    border-radius: 8px;
  }
  .speaker h2 {
    margin: 4px 0;
  }
  .speaker p {
    font-size: 0.7rem;
  }
  .dialogue-text {
    font-family: var(--lmu-display);
    font-size: 1.3rem;
    line-height: 1.5;
    color: #f1e5cb !important;
  }
  .dialogue-choices {
    display: grid;
    gap: 9px;
    margin: 20px 0;
  }
  .dialogue-choices :global(button) {
    text-align: left;
    justify-content: flex-start;
    line-height: 1.4;
  }
  .quest-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 22px 25px;
    border: 1px solid #8c744a;
    border-radius: 12px;
    background: linear-gradient(110deg, #182b2a, #08171b);
    margin-top: 22px;
  }
  .quest-card h2 {
    font: 600 1.8rem var(--lmu-display);
    margin: 5px 0;
    color: #f0dfb7;
  }
  .quest-card p {
    margin: 6px 0;
    line-height: 1.5;
  }
  .quest-card > div {
    flex: 1;
    min-width: 0;
  }
  .evidence-progress {
    display: grid;
    gap: 8px;
    font-size: 0.85rem;
    margin-top: 15px;
  }
  .evidence-progress progress {
    width: 100%;
    height: 7px;
    accent-color: #e3ba68;
  }
  .relationship,
  .clue-recorded {
    color: #c7e2a8 !important;
  }
  .world-footnote {
    font-size: 0.79rem;
    color: #aebfb4;
    margin-top: 18px;
    line-height: 1.6;
  }
  .atlas,
  .journal {
    margin-top: 24px;
    border: 1px solid #6d634a;
    padding: 25px;
    border-radius: 12px;
    background: #102125;
  }
  .founder-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin: 25px 0;
  }
  .founder-grid article {
    background: #0a191e;
    border: 1px solid #695e43;
    border-radius: 10px;
    overflow: hidden;
    padding-bottom: 14px;
  }
  .founder-grid img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
  }
  .founder-grid h3,
  .founder-grid p,
  .founder-grid small {
    margin: 10px 14px;
    display: block;
  }
  .founder-grid h3 {
    font: 600 1.5rem var(--lmu-display);
    color: #f0dfb7;
  }
  .founder-grid p {
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .atlas li,
  .journal li {
    line-height: 1.6;
    margin: 12px 0;
  }
  .journal ol {
    list-style: none;
    padding: 0;
  }
  .journal ol li {
    border-left: 2px solid #b28d4c;
    padding: 8px 18px;
    background: #0a191c;
  }
  .journal small {
    color: #a9baae;
  }
  .volume {
    display: grid;
    gap: 6px;
    margin-top: 12px;
  }
  .volume input {
    max-width: 100%;
  }
  @media (max-width: 1050px) {
    .world-header {
      align-items: flex-start;
      flex-direction: column;
    }
    .exploration-layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .world-panel {
      padding: 18px;
    }
    .scene-layout .world-panel {
      min-height: 180px;
    }
    .local-preview {
      max-height: 180px;
    }
    .speaker img {
      width: 72px;
      height: 96px;
    }
    .world-tabs .journey-link {
      margin-left: 0;
    }
    .founder-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 600px) {
    .world-header {
      margin-bottom: 18px;
    }
    .resources {
      gap: 10px;
      padding: 12px;
      font-size: 0.77rem;
    }
    .world-tabs {
      gap: 7px;
    }
    .world-tabs :global(button) {
      font-size: 0.83rem;
      padding: 8px 10px;
    }
    .world-panel h2 {
      font-size: 1.6rem;
    }
    .hotspot small {
      display: none;
    }
    .hotspot > span {
      width: 23px;
      height: 23px;
    }
    .interaction-list :global(button) {
      flex: 1 1 130px;
      font-size: 0.78rem;
      padding: 8px;
    }
    .quest-card {
      padding: 17px;
      gap: 10px;
    }
    .quest-card h2 {
      font-size: 1.5rem;
    }
    .quest-card p {
      font-size: 0.86rem;
    }
    .scene-toolbar h2 {
      font-size: 1.4rem;
    }
    .scene-toolbar > span {
      margin-left: 0;
    }
    .atlas,
    .journal {
      padding: 17px;
    }
    .founder-grid {
      gap: 10px;
    }
    .founder-grid h3 {
      font-size: 1.2rem;
    }
    .founder-grid p {
      font-size: 0.75rem;
    }
    .world-experience.campaign {
      padding: 18px;
    }
    .dialogue-text {
      font-size: 1.18rem;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .world-panel,
    .quest-card {
      animation: arrive 0.22s ease-out;
    }
    @keyframes arrive {
      from {
        opacity: 0.6;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
</style>
