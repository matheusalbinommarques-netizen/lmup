<script lang="ts">
  import { onMount } from 'svelte';
  import {
    identity,
    destinations,
    homeCopy,
    missionStarters,
    type MissionStarter,
  } from '$lib/content/experience';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { selectNext, isAvailable, taskSteps } from '$services/journeyService';
  import { dateKey } from '$services/rewardService';
  import { reviewDueDate } from '$services/reviewRules';
  import { formatCalendar } from '$services/calendar';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';
  import { sanctuaryContent } from '$lib/content/world';
  import { companionArtwork } from './companionArtwork';
  import Button from '$lib/ui/Button.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import HeroIdentity from './HeroIdentity.svelte';
  import WorldProgress from './WorldProgress.svelte';
  import { chapterTwoProgress, sanitizePilot } from '$services/rpgPilotService';
  import { chapterTwoScenes } from '$lib/content/pilot';
  import './home.css';
  import { collectionStats } from '$services/collectionRules';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let open = $state(false);
  let starter = $state<MissionStarter>();
  function createMission(example?: MissionStarter) {
    starter = example;
    open = true;
  }
  let today = $state(dateKey());
  onMount(() => {
    const subscription = journeyQuery().subscribe({
      next: (value) => {
        data = value;
        error = '';
      },
      error: () => {
        error =
          'Não foi possível ler sua jornada. Seus dados foram preservados.';
      },
    });
    const refreshDay = () => {
      today = dateKey();
    };
    window.addEventListener('focus', refreshDay);
    const clock = setInterval(refreshDay, 30000);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', refreshDay);
      clearInterval(clock);
    };
  });
  const next = $derived(data ? selectNext(data.tasks, today) : null);
  const hasVisibleTasks = $derived(
    data?.tasks.some((task) => !task.archived) ?? false,
  );
  const waitingReview = $derived(
    !next &&
      (data?.tasks.some((task) => !task.archived && task.reviewEnabled) ??
        false),
  );
  const introduction = $derived(
    !data
      ? ''
      : !data.tasks.length
        ? homeCopy.first
        : next
          ? next.reason === 'Em andamento'
            ? homeCopy.resume
            : homeCopy.next
          : homeCopy.clear,
  );
  const plan = $derived(
    data?.tasks.filter(
      (task) => !task.archived && task.plannedDate === today,
    ) ?? [],
  );
  const stage = $derived(
    getEcoStageForTotalXp(data?.profile?.totalXpEarned ?? 0).id,
  );
  const reward = $derived(next ? data?.rewards[next.task.id!] : null);
  const achievementStats = $derived(
    data?.profile
      ? collectionStats(data.profile, data.tasks, data.companions, data.owned)
      : null,
  );
  const achievements = $derived(
    ALL_ACHIEVEMENTS.filter(
      (item) =>
        !item.future && achievementStats && item.condition(achievementStats),
    ),
  );
  const completed = $derived(
    data?.tasks.filter(
      (task) =>
        !task.archived && (task.completed || task.status === 'completed'),
    ) ?? [],
  );
  const projects = $derived(
    data?.projects.filter((project) =>
      ['planejando', 'em_andamento', 'pausado'].includes(project.status),
    ) ?? [],
  );
  const pilot = $derived(sanitizePilot(data?.profile?.rpgPilot));
  const chapter = $derived(
    chapterTwoProgress(pilot, data?.profile?.totalXpEarned ?? 0),
  );
  const adventureStatus = $derived(
    pilot.scene < 6
      ? pilot.scene === 0
        ? 'Capítulo 1 · ainda por descobrir'
        : `Capítulo 1 · cena ${pilot.scene + 1} de 6`
      : pilot.chapterTwoUnlocked
        ? (pilot.chapterTwoScene ?? 0) >= chapterTwoScenes.length
          ? 'Demonstração concluída'
          : `Capítulo 2 · cena ${(pilot.chapterTwoScene ?? 0) + 1} de ${chapterTwoScenes.length}`
        : pilot.chapterOneEndXp === undefined
          ? 'Capítulo 1 concluído · ative o próximo marco na aventura'
          : chapter.available
            ? 'Capítulo 2 disponível'
            : `Capítulo 1 concluído · faltam ${chapter.remaining} XP para o capítulo 2`,
  );
</script>

<svelte:head><title>{destinations.today} · {identity.name}</title></svelte:head>
<div class="home-world">
  <header class="home-heading">
    <div>
      <p class="lmu-eyebrow">O registro da sua jornada</p>
      <h1>Hoje, no seu mundo.</h1>
    </div>
    {#if data && !error}<Button
        aria-label="Nova missão"
        onclick={() => createMission()}
        ><Icon name="plus" size={18} /><span class="home-create-label"
          >Nova missão</span
        ></Button
      >{/if}
  </header>
  {#if error}
    <div role="alert" class="journey-error">
      {error}<a class="journey-link" href="/" data-sveltekit-reload
        >Tentar novamente</a
      >
    </div>
  {:else if !data}
    <div class="home-loading" role="status">
      <Icon name="world" size={32} />
      <p>Abrindo sua jornada…</p>
    </div>
  {:else}
    {#if data.profile}
      <div class="home-landscape">
        <div class="home-scenery lmu-decorative">
          <Artwork
            src={sanctuaryContent[stage].pilot}
            alt={`Seu ambiente no estágio ${sanctuaryContent[stage].label}`}
            sizes="(max-width: 760px) 100vw, 1100px"
            eager
          />
        </div>
        <div class="home-landscape-top">
          <span class="lmu-eyebrow">Santuário pessoal</span><span
            >{data.profile.totalXpEarned} XP na sua jornada</span
          >
        </div>
        <div class="home-landscape-bottom">
          <HeroIdentity
            profile={data.profile}
            owned={data.owned}
            achievements={achievements.map((item) => item.title)}
          /><WorldProgress totalXp={data.profile.totalXpEarned} />
        </div>
      </div>
    {:else}
      <p role="alert" class="journey-error">
        Seu perfil não está disponível. Seus dados foram preservados. <a
          href="/"
          data-sveltekit-reload>Tentar novamente</a
        >
      </p>
    {/if}
    <div class="home-columns">
      <section class="home-work" aria-labelledby="home-action-title">
        <div class="home-section-heading">
          <p class="lmu-eyebrow">Na vida real</p>
          <a href="/missoes"
            >Abrir planejamento <Icon name="arrow" size={16} /></a
          >
        </div>
        <div class="home-next" class:home-next-empty={!next}>
          {#if next}
            <p class="home-kicker">
              <span class="home-reason">{next.reason}</span>{#if reward}<span
                  >+{reward.xp} XP ao concluir</span
                >{/if}
            </p>
            <h2 id="home-action-title">{next.task.title}</h2>
            <p class="lmu-muted">{introduction}</p>
            {#if next.reason !== 'Em andamento'}<p class="lmu-hint">
                {next.explanation}
              </p>{/if}
            {#if taskSteps(next.task).length}
              <progress
                max={taskSteps(next.task).length}
                value={taskSteps(next.task).filter((step) =>
                  next.task.completedSubtasks?.includes(step.index),
                ).length}
                aria-label="Passos da próxima missão"
              ></progress>
              <p class="lmu-hint home-step">
                Próximo passo: {taskSteps(next.task).find(
                  (step) => !next.task.completedSubtasks?.includes(step.index),
                )?.label ?? 'Pronta para concluir'}
              </p>
            {/if}
            <a
              class="lmu-button lmu-button--primary"
              href={`/missao/${next.task.id}`}
              >{next.reason === 'Em andamento'
                ? 'Continuar missão'
                : 'Começar missão'}<Icon name="arrow" size={18} /></a
            >
          {:else}
            <p class="home-kicker">
              <Icon
                name={data.tasks.length ? 'spark' : 'missions'}
                size={18}
              />{data.tasks.length ? 'Tempo para respirar' : 'O começo é seu'}
            </p>
            <h2 id="home-action-title">
              {!data.tasks.length
                ? homeCopy.firstTitle
                : waitingReview
                  ? homeCopy.waitingTitle
                  : hasVisibleTasks
                    ? homeCopy.clearTitle
                    : homeCopy.archivedTitle}
            </h2>
            <p class="lmu-muted">
              {!data.tasks.length
                ? homeCopy.firstDescription
                : waitingReview
                  ? homeCopy.waitingDescription
                  : hasVisibleTasks
                    ? homeCopy.clearDescription
                    : homeCopy.archivedDescription}
            </p>
            {#if data.tasks.length}<p class="lmu-hint">{introduction}</p>{/if}
            <div class="home-actions">
              <Button onclick={() => createMission()}
                >{data.tasks.length
                  ? 'Criar outra missão'
                  : 'Criar minha primeira missão'}<Icon
                  name="plus"
                  size={18}
                /></Button
              >
              {#if data.tasks.length}<a href="/progresso" class="journey-link"
                  >Rever meu progresso</a
                >{/if}
            </div>
            {#if !data.tasks.length}
              <details class="home-starters">
                <summary>{homeCopy.examplesTitle}</summary>
                <p class="lmu-hint">{homeCopy.examplesHint}</p>
                <div class="journey-starter-list">
                  {#each missionStarters as example (example.key)}<Button
                      variant="secondary"
                      onclick={() => createMission(example)}
                      >{example.label}<Icon name="arrow" size={18} /></Button
                    >{/each}
                </div>
              </details>
            {/if}
          {/if}
        </div>
        {#if plan.length}
          <section class="home-plan" aria-labelledby="plan-title">
            <div class="home-section-heading">
              <h3 id="plan-title">Seu plano de hoje</h3>
              <span class="lmu-hint">{plan.length} no plano</span>
            </div>
            <ul class="home-task-list">
              {#each plan as task (task.id)}<li>
                  <a href={`/missao/${task.id}`}
                    ><span>{task.title}</span><small
                      >{isAvailable(task)
                        ? 'Disponível'
                        : task.reviewEnabled
                          ? task.lastReviewDate === today
                            ? 'Revisão realizada hoje'
                            : 'Próxima revisão: ' +
                              formatCalendar(reviewDueDate(task))
                          : 'Concluída'}</small
                    ><Icon name="arrow" size={16} /></a
                  >
                </li>{/each}
            </ul>
          </section>
        {:else if data.tasks.some((task) => !task.archived && task.reviewEnabled && !isAvailable(task))}
          <p class="home-plan lmu-hint">
            {#each data.tasks
              .filter((task) => !task.archived && task.reviewEnabled && !isAvailable(task))
              .slice(0, 3) as task (task.id)}<a
                class="journey-link"
                href={`/missao/${task.id}`}
                >{task.title} · {task.lastReviewDate === today
                  ? 'Revisão realizada hoje'
                  : 'Próxima revisão: ' +
                    formatCalendar(reviewDueDate(task))}</a
              >{/each}
          </p>
        {/if}
        {#if completed.length}
          <details class="home-completed">
            <summary
              >{completed.length}
              {completed.length === 1
                ? 'missão concluída'
                : 'missões concluídas'}</summary
            >
            <ul class="home-task-list">
              {#each completed.slice(-5).reverse() as task (task.id)}<li>
                  <a href={`/missao/${task.id}`}
                    ><Icon name="spark" size={16} /><span>{task.title}</span
                    ><small>Concluída</small></a
                  >
                </li>{/each}
            </ul>
            <a class="journey-link" href="/progresso">Ver todo o histórico</a>
          </details>
        {/if}
        {#if projects.length}
          <section class="home-projects" aria-labelledby="home-projects-title">
            <div class="home-section-heading">
              <h3 id="home-projects-title">O que você está construindo</h3>
              <a href="/projetos">Projetos <Icon name="arrow" size={16} /></a>
            </div>
            <ul class="home-task-list">
              {#each projects.slice(0, 3) as project (project.id)}<li>
                  <a href={`/projetos/${project.id}`}
                    ><Icon name="projects" size={18} /><span
                      >{project.name}</span
                    ><small
                      >{project.status === 'pausado'
                        ? 'Pausado'
                        : project.status === 'planejando'
                          ? 'Planejando'
                          : 'Em andamento'}</small
                    ></a
                  >
                </li>{/each}
            </ul>
          </section>
        {/if}
      </section>
      <aside class="home-beyond" aria-label="Além das missões">
        <div class="home-section-heading">
          <p class="lmu-eyebrow">Além das missões</p>
          <Icon name="world" size={17} />
        </div>
        {#if data.companion}
          <a href="/bestiario" class="home-companion"
            ><Artwork
              src={companionArtwork(data.companion)}
              alt={data.companion.name}
              sizes="80px"
              class="lmu-decorative"
            />
            <div>
              <p class="lmu-eyebrow">Ao seu lado</p>
              <h3>{data.companion.name}</h3>
              <p class="lmu-hint">
                Estágio {data.companion.evolutionStage ?? 1} · Ver companhia
              </p>
            </div>
            <Icon name="arrow" size={16} /></a
          >
        {:else}
          <a href="/bestiario" class="home-discover"
            ><Icon name="spark" size={24} />
            <div>
              <h3>Companhia para o caminho</h3>
              <p class="lmu-hint">Conheça os companheiros disponíveis.</p>
            </div>
            <Icon name="arrow" size={16} /></a
          >
        {/if}
        <section class="home-adventure" aria-labelledby="home-adventure-title">
          <p class="lmu-eyebrow">Aventura experimental</p>
          <h2 id="home-adventure-title">O outro lado da ponte</h2>
          <p class="lmu-muted">{adventureStatus}</p>
          <a href="/aventura" class="journey-link"
            >{pilot.scene > 0
              ? 'Ver meus capítulos'
              : 'Entrar na aventura'}<Icon name="arrow" size={16} /></a
          >
        </section>
        <a href="/progresso" class="home-record"
          ><Icon name="today" size={20} /><span
            >Seu registro de jornada<small
              >XP, conquistas e passos que ficaram.</small
            ></span
          ><Icon name="arrow" size={16} /></a
        >
        <p class="home-rest">
          Seu mundo pode esperar.<br />O tempo aqui é seu.
        </p>
      </aside>
    </div>
    <QuickCreate bind:open snapshot={data} {starter} />
  {/if}
</div>
