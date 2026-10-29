<script lang="ts">
  import { tick, onMount } from 'svelte';
  import Button from '$lib/ui/Button.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Icon, { type IconName } from '$lib/ui/Icon.svelte';
  import MissionRow from '$lib/ui/MissionRow.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import {
    companionContent,
    sanctuaryContent,
    journeyCopy,
  } from '$lib/content/world';

  type View =
    | 'today'
    | 'missions'
    | 'projects'
    | 'world'
    | 'execution'
    | 'conclusion'
    | 'components';
  const destinations: { key: View; label: string; icon: IconName }[] = [
    { key: 'today', label: journeyCopy.today, icon: 'today' },
    { key: 'missions', label: journeyCopy.missions, icon: 'missions' },
    { key: 'projects', label: journeyCopy.projects, icon: 'projects' },
    { key: 'world', label: journeyCopy.world, icon: 'world' },
  ];
  let view = $state<View>('today');
  let stage = $state<1 | 2 | 3 | 4>(2);
  let done = $state<number[]>([0]);
  let completed = $state(false);
  let addOpen = $state(false);
  let draft = $state('');
  let error = $state('');
  let added = $state<string[]>([]);
  let notice = $state('');
  let search = $state('');
  let calm = $state(false);
  let busy = $state(false);
  const steps = [
    'Escolher uma referência',
    'Desenhar três possibilidades',
    'Comparar e anotar o que funciona',
  ];
  const activeDestination = $derived(
    view === 'execution' || view === 'conclusion' ? 'today' : view,
  );
  const currentStep = $derived(
    steps.findIndex((_, index) => !done.includes(index)),
  );
  const allDone = $derived(done.length === steps.length);

  onMount(() => {
    if (new URLSearchParams(location.search).get('view') === 'componentes')
      view = 'components';
  });

  async function show(next: View) {
    view = next;
    notice = '';
    await tick();
    window.scrollTo({ top: 0, behavior: 'instant' });
    document
      .querySelector<HTMLElement>('#preview-main h1')
      ?.focus({ preventScroll: true });
  }
  function toggle(index: number) {
    done = done.includes(index)
      ? done.filter((entry) => entry !== index)
      : [...done, index];
  }
  function openAdd() {
    draft = '';
    error = '';
    addOpen = true;
  }
  function create(event: SubmitEvent) {
    event.preventDefault();
    if (!draft.trim()) {
      error = 'Dê um nome para encontrar essa missão depois.';
      return;
    }
    added = [...added, draft.trim()];
    addOpen = false;
    notice = 'Missão adicionada à prévia desta sessão.';
  }
  async function finish() {
    completed = true;
    await show('conclusion');
  }
  async function undo() {
    completed = false;
    await show('execution');
  }
  async function loadingExample() {
    busy = true;
    await new Promise((resolve) => setTimeout(resolve, 900));
    busy = false;
    notice = 'Exemplo de carregamento concluído.';
  }
</script>

<svelte:head
  ><title>Level Me Up — Prévia da nova experiência</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>

<div class="preview" class:calm>
  <a href="#preview-main" class="lmu-skip">Pular para o conteúdo</a>
  <div class="preview-banner">
    <span
      ><span class="preview-dot"></span>Prévia de design
      <span class="banner-detail"
        >· dados de exemplo, sem alterar sua jornada</span
      ></span
    ><a href="/" data-sveltekit-reload
      >Voltar ao app atual <span aria-hidden="true">↗</span></a
    >
  </div>
  <div class="preview-shell">
    <aside class="preview-sidebar">
      <a class="preview-brand" href="/laboratorio"
        ><span class="brand-mark"><Icon name="spark" size={28} /></span><span
          >Level Me Up<span class="brand-caption">A sua próxima conquista.</span
          ></span
        ></a
      >
      <nav aria-label="Navegação da prévia" class="preview-nav">
        {#each destinations as destination (destination.key)}
          <button
            class:active={activeDestination === destination.key}
            aria-current={activeDestination === destination.key
              ? 'page'
              : undefined}
            onclick={() => show(destination.key)}
            ><Icon name={destination.icon} /><span>{destination.label}</span
            ></button
          >
        {/each}
      </nav>
      <div class="sidebar-bottom">
        <button
          class:active={view === 'components'}
          onclick={() => show('components')}
          ><Icon name="settings" /><span>Componentes e conforto</span></button
        >
        <div class="sidebar-profile">
          <span class="profile-monogram">M</span><span
            ><strong>Seu herói</strong><small>Uma jornada de exemplo</small
            ></span
          >
        </div>
      </div>
    </aside>

    <main id="preview-main" class="preview-main" tabindex="-1">
      {#if view === 'today'}
        <header class="page-heading">
          <div>
            <p class="lmu-eyebrow">Seu tempo. Sua jornada.</p>
            <h1 tabindex="-1">{journeyCopy.welcome}</h1>
            <p class="lmu-muted">Você já começou. Vamos dar continuidade?</p>
          </div>
          <Button variant="secondary" aria-label="Nova missão" onclick={openAdd}
            ><Icon name="plus" size={18} /><span class="create-label"
              >Nova missão</span
            ></Button
          >
        </header>
        <div class="today-grid">
          <div class="main-column">
            <Card variant="featured" class="next-mission">
              <div class="section-label">
                <span class="status-pill"
                  ><span></span>{completed
                    ? 'Missão concluída'
                    : 'Em andamento'}</span
                ><span class="lmu-muted">Criação · Projeto pessoal</span>
              </div>
              <h2>Dar forma a uma boa ideia</h2>
              <p class="lmu-muted">
                {completed
                  ? 'Uma pequena conquista que agora faz parte da sua jornada.'
                  : 'Um rascunho vale mais do que esperar a ideia perfeita.'}
              </p>
              <div class="mission-progress">
                <span>{completed ? 3 : done.length} de 3 passos</span><span
                  >+53 XP</span
                >
              </div>
              <progress
                value={completed ? 3 : done.length}
                max="3"
                aria-label="Progresso da missão"
              ></progress>
              {#if !completed}<div class="next-step">
                  <span class="lmu-eyebrow">Próximo passo</span>
                  <p>{steps[currentStep] ?? 'Pronto para concluir'}</p>
                </div>{/if}
              <Button
                onclick={() => show(completed ? 'conclusion' : 'execution')}
                >{completed ? 'Ver conquista' : 'Continuar missão'}<Icon
                  name="arrow"
                  size={18}
                /></Button
              >
            </Card>
            <section aria-labelledby="today-plan">
              <div class="section-heading">
                <h2 id="today-plan">Seu plano de hoje</h2>
                <span class="lmu-muted">Sem pressa.</span>
              </div>
              <Card
                ><ul class="lmu-list">
                  <MissionRow
                    title="Dar forma a uma boa ideia"
                    context="Projeto pessoal · Criação"
                    progress={completed ? 'Concluída' : `${done.length}/3`}
                    done={completed}
                    onclick={() => show(completed ? 'conclusion' : 'execution')}
                  /><MissionRow
                    title="Ler e guardar uma descoberta"
                    context="Aprendizado · Um capítulo já conta"
                    onclick={() => {
                      notice =
                        'Na próxima etapa você poderá escolher e executar qualquer missão.';
                    }}
                  />{#each added as title, index (`${index}-${title}`)}<MissionRow
                      {title}
                      context="Adicionada nesta prévia"
                      onclick={() => {
                        notice =
                          'Esta missão de exemplo foi guardada só durante esta sessão.';
                      }}
                    />{/each}
                </ul>
                <button class="inline-action" onclick={openAdd}
                  ><Icon name="plus" size={18} />Adicionar ao plano</button
                ></Card
              >
            </section>
            <Card class="project-preview"
              ><span class="project-icon"><Icon name="book" size={26} /></span>
              <div>
                <p class="lmu-eyebrow">Um projeto em movimento</p>
                <h3>Do rascunho ao primeiro projeto</h3>
                <p class="lmu-muted">Próximo marco: encontrar uma direção.</p>
              </div>
              <Button
                variant="quiet"
                aria-label="Ver projeto"
                onclick={() => show('projects')}><Icon name="arrow" /></Button
              ></Card
            >
          </div>
          <aside class="world-column" aria-label="Sua jornada ganha forma">
            <Card class="world-card"
              ><div class="world-art lmu-decorative">
                <Artwork
                  src={sanctuaryContent[stage].pilot}
                  alt="Terraço de pedra sobre um vale, com uma planta crescendo ao entardecer"
                  eager
                /><span class="world-art-tag">Seu mundo está crescendo</span>
              </div>
              <div class="world-card-copy">
                <p class="lmu-eyebrow">{sanctuaryContent[stage].label}</p>
                <h2>Pequenos passos. Novas paisagens.</h2>
                <p class="lmu-muted">{sanctuaryContent[stage].description}</p>
                <button class="inline-action" onclick={() => show('world')}
                  >Visitar {journeyCopy.world.toLowerCase()}<Icon
                    name="arrow"
                    size={18}
                  /></button
                >
              </div></Card
            >
            <div class="companion-note">
              <Artwork
                src={companionContent.wolf.pilot}
                alt="Lobo de pelagem escura, peito claro e olhos verdes"
                class="companion-small lmu-decorative"
              />
              <div>
                <p class="lmu-eyebrow">Boa companhia</p>
                <p>{journeyCopy.companionMessage}</p>
              </div>
            </div>
            <p class="quiet-note">
              Seu progresso continua aqui.<br />Uma pausa também faz parte do
              caminho.
            </p>
          </aside>
        </div>
      {:else if view === 'execution'}
        <div class="execution-wrap">
          <button
            class="inline-action back-action"
            onclick={() => show('today')}
            ><Icon name="back" size={18} />Voltar para hoje</button
          >
          <header class="page-heading">
            <div>
              <p class="lmu-eyebrow">Criação · Projeto pessoal</p>
              <h1 tabindex="-1">Dar forma a uma boa ideia</h1>
              <p class="lmu-muted">Você só precisa cuidar do próximo passo.</p>
            </div>
          </header>
          <Card
            ><div class="mission-progress">
              <strong>{done.length} de 3 passos</strong><span class="lmu-muted"
                >No seu ritmo</span
              >
            </div>
            <progress value={done.length} max="3" aria-label="Passos concluídos"
            ></progress>
            <ul class="lmu-list step-list">
              {#each steps as step, index (index)}<li>
                  <label class:step-done={done.includes(index)}
                    ><input
                      type="checkbox"
                      checked={done.includes(index)}
                      onchange={() => toggle(index)}
                    /><span
                      ><strong>{step}</strong><small
                        >{index === 0
                          ? 'Uma imagem, texto ou projeto que te inspire.'
                          : index === 1
                            ? 'Sem polir. Explore caminhos diferentes.'
                            : 'Escolha uma direção para continuar depois.'}</small
                      ></span
                    ><span class="step-number" aria-hidden="true"
                      >0{index + 1}</span
                    ></label
                  >
                </li>{/each}
            </ul></Card
          >
          <p class="execution-help">
            Você pode pausar a qualquer momento. Nesta prévia, os passos ficam
            guardados enquanto a página estiver aberta.
          </p>
          <div class="execution-actions">
            <Button variant="quiet" onclick={() => show('today')}
              ><Icon name="pause" size={18} />Pausar e voltar</Button
            ><Button disabled={!allDone} onclick={finish}
              >Concluir missão<Icon name="check" size={18} /></Button
            >{#if !allDone}<p class="lmu-hint">
                Marque os passos para concluir.
              </p>{/if}
          </div>
        </div>
      {:else if view === 'conclusion'}
        <div class="completion-wrap">
          <div class="completion-symbol"><Icon name="check" size={34} /></div>
          <p class="lmu-eyebrow">Missão concluída</p>
          <h1 tabindex="-1">{journeyCopy.completion}</h1>
          <p class="lmu-muted">
            Você deu forma a uma boa ideia.<br />E fez sua jornada avançar.
          </p>
          <div class="reward-strip" aria-label="Recompensa de exemplo">
            <span><strong>+53</strong> XP</span><span
              ><strong>+25</strong> Gold</span
            ><span><strong>+2</strong> Comida</span>
          </div>
          <Artwork
            src={companionContent.wolf.pilot}
            alt="Seu companheiro lobo acompanhando a conquista"
            class="completion-companion lmu-decorative"
          /><Card
            ><p>Uma conquista pequena também merece seu lugar.</p>
            <p class="lmu-muted">
              Agora você pode continuar ou ficar por aqui hoje.
            </p></Card
          ><Button onclick={() => show('today')}
            >Voltar para hoje<Icon name="arrow" size={18} /></Button
          ><Button variant="quiet" onclick={undo}
            >Desfazer conclusão de exemplo</Button
          >
        </div>
      {:else if view === 'missions'}
        <header class="page-heading">
          <div>
            <p class="lmu-eyebrow">Organize para agir</p>
            <h1 tabindex="-1">Suas missões</h1>
            <p class="lmu-muted">
              Um lugar para guardar ideias e encontrar o próximo passo.
            </p>
          </div>
          <Button onclick={openAdd}
            ><Icon name="plus" size={18} />Nova missão</Button
          >
        </header>
        <Field
          label="Buscar missão"
          bind:value={search}
          placeholder="O que você quer encontrar?"
          type="search"
        /><Card class="mission-library"
          ><ul class="lmu-list">
            {#if 'dar forma a uma boa ideia'.includes(search.toLocaleLowerCase('pt-BR'))}<MissionRow
                title="Dar forma a uma boa ideia"
                context="Criação · Projeto pessoal"
                progress={completed ? 'Concluída' : `${done.length}/3 passos`}
                done={completed}
                onclick={() => show(completed ? 'conclusion' : 'execution')}
              />{/if}{#each added.filter((title) => title
                .toLocaleLowerCase('pt-BR')
                .includes(search.toLocaleLowerCase('pt-BR'))) as title, index (`${index}-${title}`)}<MissionRow
                {title}
                context="Missão desta prévia"
                onclick={() => {
                  notice = 'A execução de novas missões será integrada em E4.';
                }}
              />{/each}
          </ul>
          {#if !'dar forma a uma boa ideia'.includes(search.toLocaleLowerCase('pt-BR')) && !added.some( (title) => title
                  .toLocaleLowerCase('pt-BR')
                  .includes(search.toLocaleLowerCase('pt-BR')), )}<div
              class="empty-state"
            >
              <Icon name="missions" size={36} />
              <h2>Nenhuma missão por aqui.</h2>
              <p class="lmu-muted">
                Experimente outro nome ou guarde uma ideia nova.
              </p>
              <Button variant="secondary" onclick={openAdd}
                >Criar uma missão</Button
              >
            </div>{/if}</Card
        >
      {:else if view === 'projects'}
        <header class="page-heading">
          <div>
            <p class="lmu-eyebrow">Uma direção para seus passos</p>
            <h1 tabindex="-1">Projetos</h1>
            <p class="lmu-muted">
              Transforme uma intenção em algo que você consegue começar.
            </p>
          </div>
        </header>
        <Card class="project-detail"
          ><span class="project-icon"><Icon name="book" size={32} /></span>
          <h2>Do rascunho ao primeiro projeto</h2>
          <p class="lmu-muted">
            Resultado desejado: uma ideia clara e uma primeira versão para
            experimentar.
          </p>
          <ol class="project-chapters">
            <li>
              <span>01</span>
              <div>
                <strong>Encontrar uma direção</strong>
                <p class="lmu-muted">Dar forma a uma boa ideia</p>
              </div>
              <Button
                variant="secondary"
                onclick={() => show(completed ? 'conclusion' : 'execution')}
                >Continuar</Button
              >
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Criar uma primeira versão</strong>
                <p class="lmu-muted">Um próximo marco, quando fizer sentido.</p>
              </div>
            </li>
          </ol></Card
        >
      {:else if view === 'world'}
        <header class="page-heading">
          <div>
            <p class="lmu-eyebrow">O que sua jornada construiu</p>
            <h1 tabindex="-1">{journeyCopy.world}</h1>
            <p class="lmu-muted">Um lugar que muda com você.</p>
          </div>
        </header>
        <div class="world-showcase">
          <Artwork
            src={sanctuaryContent[stage].pilot}
            alt={`Paisagem no estágio ${sanctuaryContent[stage].label}`}
            sizes="(max-width: 760px) 100vw, (max-width: 1600px) calc(100vw - 20rem), 1100px"
            eager
          />
          <div class="world-showcase-caption">
            <h2>{sanctuaryContent[stage].label}</h2>
            <p>{sanctuaryContent[stage].description}</p>
          </div>
        </div>
        <fieldset class="stage-picker">
          <legend>Experimentar os estágios do ambiente</legend
          >{#each [1, 2, 3, 4] as value (value)}<label
              ><input
                type="radio"
                name="environment"
                checked={stage === value}
                onchange={() => {
                  stage = value as 1 | 2 | 3 | 4;
                }}
              />{sanctuaryContent[value as 1 | 2 | 3 | 4].label}</label
            >{/each}
        </fieldset>
        <div class="world-details">
          <Card class="companion-detail"
            ><Artwork
              src={companionContent.wolf.pilot}
              alt="Piloto do lobo, com marcas de jade na pelagem"
              class="companion-medium"
            />
            <div>
              <p class="lmu-eyebrow">Seu companheiro</p>
              <h2>{companionContent.wolf.name}</h2>
              <p class="lmu-muted">
                Presença, curiosidade e um pouco de mistério. A personalidade
                dessa história ainda será sua.
              </p>
            </div></Card
          ><Card class="objects-detail"
            ><Artwork
              src="/art/pilot/objects.webp"
              alt="Coleção de objetos: cápsula de semente, caderno e fragmento mineral"
            />
            <div>
              <p class="lmu-eyebrow">Lembranças da jornada</p>
              <h3>Cada conquista deixa uma marca.</h3>
              <p class="lmu-muted">
                Piloto de materiais e objetos colecionáveis.
              </p>
            </div></Card
          >
        </div>
      {:else}
        <header class="page-heading">
          <div>
            <p class="lmu-eyebrow">Base da nova experiência</p>
            <h1 tabindex="-1">Componentes e conforto</h1>
            <p class="lmu-muted">
              Experimente os estados e as interações desta direção visual.
            </p>
          </div>
        </header>
        <div class="component-grid">
          <Card
            ><h2>Ações claras</h2>
            <div class="component-actions">
              <Button onclick={openAdd}>Criar missão</Button><Button
                variant="secondary"
                onclick={() => show('today')}>Ação secundária</Button
              ><Button
                variant="quiet"
                onclick={() => {
                  notice = 'Ação discreta acionada.';
                }}>Ação discreta</Button
              ><Button disabled>Indisponível</Button><Button
                loading={busy}
                onclick={loadingExample}>Testar carregamento</Button
              ><Button
                variant="danger"
                onclick={() => {
                  notice =
                    'Exemplo de ação destrutiva. Nenhum dado foi removido.';
                }}>Ação destrutiva</Button
              >
            </div></Card
          ><Card
            ><h2>Leitura e conforto</h2>
            <p class="lmu-muted">
              Texto funcional sobre superfícies sólidas. Ícones continuam
              visíveis ao reduzir a arte.
            </p>
            <label class="comfort-toggle"
              ><input type="checkbox" bind:checked={calm} />Reduzir arte nesta
              prévia</label
            >
            <p class="lmu-hint">
              A preferência de movimento reduzido do sistema também é
              respeitada.
            </p>
            <Field
              label="Nome da missão"
              value=""
              error="Exemplo de mensagem: escreva um nome para continuar."
            /></Card
          ><Card
            ><h2>Estágio vazio</h2>
            <div class="empty-state">
              <Icon name="projects" size={32} />
              <p>Todo projeto começa com uma intenção.</p>
              <Button variant="secondary" onclick={openAdd}
                >Guardar uma ideia</Button
              >
            </div></Card
          ><Card
            ><h2>Arte com alternativa</h2>
            <p class="lmu-muted">
              Se a imagem não carregar, o contexto e as ações continuam
              disponíveis.
            </p>
            <Artwork
              src="/art/pilot/arquivo-ausente.webp"
              alt="Ambiente em crescimento"
              class="fallback-example"
            /></Card
          >
        </div>
      {/if}
      <div class="notice-region" role="status" aria-live="polite">{notice}</div>
      <footer class="preview-footer">
        <span>Uma direção em construção. A personalidade vem com você.</span
        ><button
          onclick={() => show(view === 'components' ? 'today' : 'components')}
          >{view === 'components'
            ? 'Voltar para hoje'
            : 'Ver componentes'}</button
        >
      </footer>
    </main>
    <nav class="preview-mobile-nav" aria-label="Navegação móvel da prévia">
      {#each destinations as destination (destination.key)}<button
          aria-current={activeDestination === destination.key
            ? 'page'
            : undefined}
          onclick={() => show(destination.key)}
          ><Icon name={destination.icon} /><span>{destination.label}</span
          ></button
        >{/each}
    </nav>
  </div>
  <Dialog
    bind:open={addOpen}
    title="Uma nova missão"
    description="Guarde uma ideia pequena. Nesta prévia ela fica só durante a sessão; seus dados reais não mudam."
  >
    <form onsubmit={create} novalidate>
      <Field
        label="O que você quer fazer?"
        bind:value={draft}
        {error}
        placeholder="Ex.: praticar uma ideia por 10 minutos"
        data-initial-focus
        maxlength={160}
      />
      <footer>
        <Button
          variant="quiet"
          onclick={() => {
            addOpen = false;
          }}>Cancelar</Button
        ><Button type="submit">Adicionar missão</Button>
      </footer>
    </form>
  </Dialog>
</div>

<style>
  .preview {
    min-height: 100dvh;
  }
  .preview-banner {
    padding: 0.65rem 2rem;
    font-size: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    color: var(--lmu-muted);
    background: #0f171b;
    border-bottom: 1px solid var(--lmu-line);
  }
  .preview-dot {
    display: inline-block;
    width: 0.4rem;
    height: 0.4rem;
    margin-right: 0.5rem;
    border-radius: 50%;
    background: var(--lmu-positive);
    vertical-align: middle;
  }
  .preview-banner a {
    white-space: nowrap;
  }
  .preview-shell {
    max-width: 1600px;
    margin: auto;
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    min-height: calc(100dvh - 2.5rem);
  }
  .preview-sidebar {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    border-right: 1px solid var(--lmu-line);
    padding: 2rem 1.25rem;
  }
  .preview-brand {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    text-decoration: none;
  }
  .brand-mark {
    display: grid;
    place-items: center;
    color: var(--lmu-action);
  }
  .brand-caption {
    display: block;
    font-size: 0.68rem;
    font-weight: 400;
    color: var(--lmu-muted);
    margin-top: 0.15rem;
  }
  .preview-nav {
    display: grid;
    gap: 0.5rem;
  }
  .preview-nav button,
  .sidebar-bottom > button {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    min-height: 3rem;
    border-radius: 0.65rem;
    padding: 0.75rem 1rem;
    text-align: left;
    color: var(--lmu-muted);
    background: transparent;
    border: 1px solid transparent;
  }
  .preview-nav button.active {
    background: #293a37;
    color: var(--lmu-action);
    border-color: #4c6055;
  }
  .preview-nav button:hover,
  .sidebar-bottom > button:hover {
    background: var(--lmu-surface);
  }
  .sidebar-bottom {
    margin-top: auto;
    padding-top: 3rem;
    display: grid;
    gap: 1.5rem;
  }
  .sidebar-bottom > button {
    font-size: 0.8rem;
    padding: 0.75rem 0.25rem;
  }
  .sidebar-profile {
    border-top: 1px solid var(--lmu-line);
    padding-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }
  .profile-monogram {
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid var(--lmu-border);
    color: var(--lmu-action);
    background: var(--lmu-raised);
  }
  .sidebar-profile strong,
  .sidebar-profile small {
    display: block;
    font-size: 0.8rem;
  }
  .sidebar-profile small {
    color: var(--lmu-muted);
    font-size: 0.7rem;
  }
  .preview-main {
    padding: 2.75rem clamp(1.25rem, 4vw, 3.5rem) 1.5rem;
    min-width: 0;
  }
  .preview-main:focus {
    outline: none;
  }
  h1:focus {
    outline: none;
  }
  .page-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .page-heading h1 {
    margin: 0.55rem 0 0.7rem;
  }
  .today-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(15rem, 1fr);
    gap: 1.75rem;
    align-items: start;
  }
  .main-column,
  .world-column {
    display: grid;
    gap: 1.75rem;
    min-width: 0;
  }
  .section-label {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    margin-bottom: 1rem;
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 2rem;
    background: #35493a;
    color: #d3dec9;
    padding: 0.25rem 0.65rem;
  }
  .status-pill > span {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: var(--lmu-positive);
  }
  :global(.next-mission h2) {
    font-size: clamp(1.6rem, 2.3vw, 2rem);
    margin-bottom: 0.5rem;
  }
  .mission-progress {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin: 1.5rem 0 0.25rem;
    font-size: 0.875rem;
    color: var(--lmu-muted);
  }
  .next-step {
    margin: 1.25rem 0 1.5rem;
  }
  .next-step p {
    margin-top: 0.2rem;
  }
  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .section-heading h2 {
    font-size: 1.35rem;
  }
  .section-heading > span {
    font-size: 0.875rem;
  }
  .inline-action {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.6rem;
    min-height: 3rem;
    color: var(--lmu-action);
    background: transparent;
    border: 0;
    text-align: left;
    font-size: 0.875rem;
    padding: 0.6rem 0.2rem;
  }
  .inline-action:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  :global(.project-preview) {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  :global(.project-preview > div) {
    flex: 1;
    min-width: 0;
  }
  :global(.project-preview h3) {
    font-size: 1rem;
    margin: 0.3rem 0;
  }
  :global(.project-preview p.lmu-muted) {
    font-size: 0.8rem;
  }
  .project-icon {
    flex: 0 0 auto;
    color: var(--lmu-action);
    background: #3c3c2f;
    border-radius: 0.7rem;
    display: inline-grid;
    place-items: center;
    padding: 0.8rem;
  }
  :global(.lmu-card.world-card) {
    padding: 0;
    overflow: hidden;
  }
  .world-art {
    position: relative;
    height: 13rem;
  }
  .world-art :global(img),
  .world-art :global(.lmu-art-fallback) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .world-art-tag {
    position: absolute;
    bottom: 0.75rem;
    left: 1rem;
    color: var(--lmu-text);
    background: #121b20e8;
    border: 1px solid #69796c;
    border-radius: 2rem;
    font-size: 0.65rem;
    padding: 0.35rem 0.65rem;
  }
  .world-card-copy {
    padding: 1.5rem;
  }
  .world-card-copy h2 {
    margin: 0.6rem 0 0.8rem;
    font-size: 1.6rem;
  }
  .world-card-copy > p.lmu-muted {
    font-size: 0.875rem;
  }
  .world-card-copy .inline-action {
    margin-top: 0.75rem;
  }
  .companion-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-right: 0.5rem;
  }
  .companion-note :global(.companion-small) {
    width: 7rem;
    height: 8.5rem;
    object-fit: contain;
    flex: 0 0 auto;
  }
  .companion-note p:not(.lmu-eyebrow) {
    font-size: 0.875rem;
    margin-top: 0.4rem;
  }
  .quiet-note {
    color: var(--lmu-muted);
    text-align: center;
    font-size: 0.75rem;
  }
  .preview-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 2.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--lmu-line);
    color: var(--lmu-muted);
    font-size: 0.75rem;
  }
  .preview-footer button {
    color: var(--lmu-muted);
    background: transparent;
    border: 0;
    min-height: 3rem;
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
  .notice-region {
    min-height: 1.5rem;
    color: var(--lmu-positive);
    margin-top: 1rem;
    font-size: 0.875rem;
  }
  .execution-wrap {
    max-width: 48rem;
    margin: auto;
  }
  .back-action {
    margin-bottom: 1rem;
  }
  .step-list {
    margin-top: 1rem;
  }
  .step-list li + li {
    border-top: 1px solid var(--lmu-line);
  }
  .step-list label {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.3rem 0.15rem;
    cursor: pointer;
    min-height: 3rem;
  }
  .step-list input,
  .comfort-toggle input {
    width: 1.35rem;
    height: 1.35rem;
    flex: 0 0 auto;
    accent-color: var(--lmu-positive);
    margin-top: 0.2rem;
  }
  .step-list label > span:not(.step-number) {
    flex: 1;
  }
  .step-list strong {
    font-weight: 600;
  }
  .step-list small {
    display: block;
    color: var(--lmu-muted);
    font-size: 0.875rem;
    margin-top: 0.3rem;
  }
  .step-done strong {
    color: var(--lmu-muted);
    text-decoration: line-through;
  }
  .step-number {
    color: var(--lmu-muted);
    font-size: 0.75rem;
  }
  .execution-help {
    color: var(--lmu-muted);
    font-size: 0.875rem;
    margin: 1.5rem 0;
  }
  .execution-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    background: var(--lmu-bg);
    border-top: 1px solid var(--lmu-line);
    padding: 1rem 0;
    position: sticky;
    bottom: 0;
  }
  .execution-actions p {
    width: 100%;
    text-align: right;
  }
  .completion-wrap {
    max-width: 32rem;
    margin: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
  }
  .completion-symbol {
    border: 1px solid var(--lmu-positive);
    color: var(--lmu-positive);
    width: 4rem;
    height: 4rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #243c36;
  }
  .reward-strip {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    color: var(--lmu-muted);
  }
  .reward-strip strong {
    color: var(--lmu-action);
    font-size: 1.4rem;
    display: block;
  }
  .completion-wrap :global(.completion-companion) {
    height: 13rem;
    width: 13rem;
    object-fit: contain;
  }
  .completion-wrap :global(.lmu-card) {
    display: grid;
    gap: 0.5rem;
    width: 100%;
  }
  :global(.mission-library) {
    margin-top: 1.5rem;
  }
  .empty-state {
    padding: 2rem 0.5rem;
    display: grid;
    justify-items: center;
    gap: 1rem;
    text-align: center;
  }
  .empty-state > :global(svg) {
    color: var(--lmu-muted);
  }
  :global(.project-detail) {
    display: grid;
    gap: 1.25rem;
  }
  :global(.project-detail) .project-icon {
    justify-self: start;
  }
  .project-chapters {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .project-chapters li {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border-top: 1px solid var(--lmu-line);
    padding: 1.5rem 0;
    flex-wrap: wrap;
  }
  .project-chapters li > span {
    color: var(--lmu-action);
    font-family: var(--lmu-display);
    font-size: 1.5rem;
  }
  .project-chapters li > div {
    flex: 1;
    min-width: 12rem;
  }
  .world-showcase {
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    background: var(--lmu-surface);
  }
  .world-showcase :global(img),
  .world-showcase :global(.lmu-art-fallback) {
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 1;
    object-fit: cover;
  }
  .world-showcase-caption {
    padding: 1rem 1.5rem;
    background: var(--lmu-surface);
    border: 1px solid var(--lmu-line);
    border-top: 0;
    border-radius: 0 0 1rem 1rem;
  }
  .world-showcase-caption p {
    color: var(--lmu-muted);
    margin-top: 0.4rem;
  }
  .stage-picker {
    border: 0;
    padding: 1rem 0;
    margin: 1rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .stage-picker legend {
    color: var(--lmu-muted);
    font-size: 0.875rem;
  }
  .stage-picker label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 3rem;
    padding: 0.6rem 1rem;
    border: 1px solid var(--lmu-border);
    border-radius: 0.75rem;
    cursor: pointer;
  }
  .stage-picker label:has(input:checked) {
    border-color: var(--lmu-action);
    color: var(--lmu-action);
    background: #33392d;
  }
  .stage-picker input {
    accent-color: var(--lmu-action);
  }
  .world-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  :global(.companion-detail),
  :global(.objects-detail) {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .world-details :global(.companion-medium),
  .world-details :global(img) {
    width: 8rem;
    height: 11rem;
    object-fit: contain;
    flex: 0 0 auto;
  }
  .world-details :global(h2),
  .world-details :global(h3) {
    margin: 0.5rem 0;
  }
  .world-details :global(p.lmu-muted) {
    font-size: 0.875rem;
  }
  .component-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .component-grid :global(.lmu-card) {
    display: grid;
    align-content: start;
    gap: 1.5rem;
  }
  .component-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .comfort-toggle {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-height: 3rem;
  }
  .component-grid :global(.fallback-example) {
    min-height: 8rem;
  }
  .calm :global(.lmu-decorative) {
    display: none;
  }
  .preview-mobile-nav {
    display: none;
  }
  @media (max-width: 1100px) {
    .preview-shell {
      grid-template-columns: 12.5rem minmax(0, 1fr);
    }
    .today-grid {
      grid-template-columns: 1fr;
    }
    .world-column {
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }
    .world-column :global(.world-card) {
      grid-row: span 2;
    }
    .world-art {
      height: 10rem;
    }
    .companion-note {
      flex-direction: column;
      text-align: center;
    }
    .quiet-note {
      align-self: start;
    }
    .world-details {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 760px) {
    .preview-banner {
      padding: 0.55rem 1rem;
      font-size: 0.65rem;
    }
    .banner-detail {
      display: none;
    }
    .preview-shell {
      display: block;
    }
    .preview-sidebar {
      display: none;
    }
    .preview-main {
      padding: 1.5rem 1rem calc(6rem + env(safe-area-inset-bottom));
    }
    .page-heading {
      align-items: flex-start;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .page-heading h1 {
      font-size: 2rem;
    }
    .page-heading > :global(.lmu-button) {
      padding: 0.6rem 1rem;
      min-height: 3rem;
    }
    .page-heading .lmu-muted {
      font-size: 0.875rem;
    }
    .today-grid {
      gap: 1.5rem;
    }
    .main-column {
      gap: 1.5rem;
    }
    .section-label {
      font-size: 0.7rem;
    }
    :global(.next-mission h2) {
      font-size: 1.65rem;
    }
    :global(.next-mission > .lmu-muted) {
      font-size: 0.875rem;
    }
    :global(.next-mission > .lmu-button) {
      width: 100%;
    }
    .world-column {
      grid-template-columns: 1fr;
    }
    .world-column :global(.world-card) {
      grid-row: auto;
      display: grid;
      grid-template-columns: 1fr 1.2fr;
    }
    .world-art {
      height: auto;
      min-height: 10rem;
    }
    .world-art-tag {
      display: none;
    }
    .world-card-copy {
      padding: 1rem;
    }
    .world-card-copy h2 {
      font-size: 1.3rem;
    }
    .world-card-copy > p.lmu-muted {
      display: none;
    }
    .world-card-copy .inline-action {
      margin: 0;
      font-size: 0.8rem;
    }
    .companion-note {
      flex-direction: row;
      text-align: left;
      max-width: 24rem;
      margin: auto;
    }
    .quiet-note {
      display: none;
    }
    .preview-footer {
      font-size: 0.7rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
    .preview-mobile-nav {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      position: fixed;
      z-index: 20;
      bottom: 0;
      left: 0;
      right: 0;
      background: #162227fa;
      border-top: 1px solid var(--lmu-border);
      padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom));
    }
    .preview-mobile-nav button {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.2rem;
      color: var(--lmu-muted);
      background: transparent;
      border: 0;
      border-radius: 0.5rem;
      min-height: 3.5rem;
      font-size: 0.7rem;
    }
    .preview-mobile-nav button[aria-current='page'] {
      color: var(--lmu-action);
      background: #2d3933;
    }
    .execution-actions {
      bottom: calc(4.5rem + env(safe-area-inset-bottom));
      gap: 0.5rem;
    }
    .execution-actions > :global(.lmu-button) {
      flex: 1;
      font-size: 0.875rem;
      padding: 0.7rem 0.6rem;
    }
    .execution-actions p {
      text-align: center;
    }
    .execution-help {
      font-size: 0.8rem;
    }
    .completion-wrap {
      gap: 1rem;
    }
    .completion-wrap :global(.completion-companion) {
      height: 7rem;
      width: 7rem;
    }
    .world-showcase :global(img) {
      aspect-ratio: 3 / 2;
    }
    .world-details :global(.companion-detail),
    .world-details :global(.objects-detail) {
      flex-wrap: wrap;
      justify-content: center;
      text-align: center;
    }
    .component-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 400px) {
    .section-heading > span {
      display: none;
    }
    :global(.project-preview > .project-icon) {
      display: none;
    }
    .section-label {
      align-items: flex-start;
    }
    .step-number {
      display: none;
    }
    .world-column :global(.world-card) {
      display: block;
    }
    .world-art {
      height: 9rem;
      min-height: 0;
    }
  }
  @media (max-height: 650px) and (max-width: 760px) {
    :global(.next-mission > p.lmu-muted) {
      display: none;
    }
    :global(.next-mission h2) {
      font-size: 1.4rem;
    }
    .section-label {
      margin-bottom: 0.6rem;
    }
    .page-heading {
      flex-wrap: nowrap;
    }
    .page-heading > div {
      min-width: 0;
      flex: 1;
    }
    .page-heading h1 {
      font-size: 1.7rem;
    }
    .create-label {
      display: none;
    }
    .page-heading > :global(.lmu-button) {
      padding: 0.6rem;
    }
    .execution-actions {
      position: static;
    }
    .preview-main {
      padding-top: 1rem;
    }
    .page-heading {
      margin-bottom: 1rem;
    }
    .page-heading > div > p.lmu-muted {
      display: none;
    }
    .next-step {
      margin: 0.75rem 0;
    }
    .mission-progress {
      margin-top: 1rem;
    }
    .completion-wrap :global(.completion-companion) {
      display: none;
    }
  }
</style>
