<script lang="ts">
  import { onMount, tick } from 'svelte';
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
    lucanArt,
    returnNoticeAvailable,
    personalTasks,
    locations,
    founders,
    clues,
    requiredClues,
    type LocationId,
    type SceneId,
    type HotspotId,
  } from './content';
  import { type WorldState } from './worldState';
  import RegionalMap from './RegionalMap.svelte';
  import OasisCinematic from './OasisCinematic.svelte';
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
        return 'A caravana de mantimentos está atrasada, e os carregadores ainda não chegaram. Precisamos dessa entrega para quem trabalha no Oásis. Investigue a estrada antes de enviarmos ajuda.';
      case 'briefing':
        return 'A entrega vem do Entreposto de Variel. Siga para os arredores e examine a carroça, os sacos e as pegadas. Precisamos saber por que pararam e para onde foram os carregadores.';
      case 'progress':
        return returnNoticeAvailable(world)
          ? 'Os carregadores já voltaram pelo caminho alto. O retorno foi registrado no quadro. Ainda precisamos ligar as três pistas para entender a parada e decidir como recuperar os mantimentos.'
          : 'Precisamos entender por que a caravana parou, o que aconteceu com a carga e para onde foram os carregadores. Examine e registre os sinais nos arredores.';
      case 'hint':
        return 'Olhe de perto a carroça, os sacos e as pegadas no caminho. Registre as pistas que conseguir confirmar. Depois volte para conversarmos.';
      case 'report':
        return 'Todos os carregadores voltaram em segurança; o aviso do portão confirma a chegada. A carga restante está junto à carroça, nos arredores. Precisamos recolhê-la e preparar o caminho das próximas entregas. Qual tarefa você assume? Eu cuido da outra.';
      case 'evidence':
        return 'O eixo explica a parada. Os sacos menores e as alças de corda explicam o transporte à mão. As pegadas ligam a carroça ao Oásis. Foi uma avaria: parte dos mantimentos chegou, e o restante ficou onde você encontrou a carroça.';
      case 'ending':
        return world.resolution === 'rescue'
          ? 'Combinado: você acompanha a recuperação dos sacos junto à carroça. Vou preparar as marcações do caminho alto para as próximas entregas. Separei cordas na mesa; os carregadores podem descansar. Sei que posso contar com sua iniciativa.'
          : 'Combinado: você prepara as marcações e orientações do caminho alto. Eu acompanho a recuperação dos sacos junto à carroça. Deixei um esboço da rota na mesa. Sua atenção aos detalhes vai ajudar quem vier depois.';
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
          id: 'rescue',
          label: 'Vou ajudar a recuperar a carga restante.',
          detail: 'Lucan prepara a rota das próximas entregas.',
        },
        {
          id: 'route',
          label: 'Vou preparar uma rota mais segura.',
          detail: 'Lucan acompanha a recuperação da carga.',
        },
        {
          id: 'review',
          label:
            n === 'report'
              ? 'Rever as pistas antes de decidir.'
              : 'Voltar à decisão.',
        },
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
  async function returnToMap() {
    view = 'map';
    await tick();
    document
      .querySelector<HTMLButtonElement>('[data-resume-exploration]')
      ?.focus();
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
{#snippet narrationControls()}
  {#if voiceAvailable}<label class="journey-check"
      ><input type="checkbox" bind:checked={narration} />Narração com voz local</label
    >
    {#if narration}<label class="volume"
        >Volume<input
          type="range"
          min="0"
          max="1"
          step=".1"
          bind:value={volume}
        /></label
      >
      <Button variant="quiet" onclick={() => window.speechSynthesis.cancel()}
        >Pular narração</Button
      >{/if}
  {:else}<p>
      A narração está indisponível: este navegador não oferece uma voz
      portuguesa local.
    </p>{/if}
  <p class="lmu-hint">A aventura também pode ser jogada sem som.</p>
{/snippet}
{#if world && !campaign && section === 'explore' && view === 'scene'}
  <OasisCinematic
    {world}
    {dialogueText}
    {choices}
    {busy}
    {error}
    {notice}
    audio={narrationControls}
    onInteract={interact}
    onChoose={choose}
    onCollect={() => perform({ type: 'collect' })}
    onMap={returnToMap}
  />
{:else}
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
          <span>Nível {profile.level}</span><span
            >{profile.totalXpEarned} XP</span
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
                    onclick={() => enter('outskirts')}
                    >Explorar arredores</Button
                  >{#if world.lastScene}<Button
                      data-resume-exploration
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
                </p>{/if}<a class="journey-link" href="/refugio/acampamento"
                >Entrar no Acampamento →</a
              >
            </aside>
          </div>
        {/if}
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
                  src={founder.id === 'lucan-dorian'
                    ? lucanArt
                    : worldArt + founder.id + '.webp'}
                  class:lucan={founder.id === 'lucan-dorian'}
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
              ? 'Os carregadores voltaram ao Oásis. A carga restante está junto à carroça; as duas providências foram divididas entre você e Lucan.'
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
      {#if world.resolution}<p class="task-assignment">
          <strong>Sua tarefa:</strong>
          {personalTasks[world.resolution].player} <strong>Lucan:</strong>
          {personalTasks[world.resolution].lucan}
        </p>{/if}
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
                  <small>{new Date(entry.at).toLocaleDateString('pt-BR')}</small
                  >
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
{/if}
<Dialog
  bind:open={confirmOpen}
  title="Registrar sua decisão"
  dismissible={!busy}
  ><p>
    {confirmation?.choice === 'rescue'
      ? 'Você ajudará a recuperar a carga restante junto à carroça. Lucan preparará a rota das próximas entregas.'
      : 'Você preparará uma rota mais segura pelo caminho alto. Lucan acompanhará a recuperação da carga restante.'}
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
  .relationship {
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
  .founder-grid img.lucan {
    object-position: 30% center;
  }
  .task-assignment {
    line-height: 1.7;
    color: #e5d8b8;
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
    .local-preview {
      max-height: 180px;
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
