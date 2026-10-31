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
  import { scheduledOn } from '$services/recurrence';
  import { dateKey } from '$services/rewardService';
  import { reviewDueDate } from '$services/reviewRules';
  import { formatCalendar } from '$services/calendar';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';
  import { sanctuaryContent } from '$lib/content/world';
  import Button from '$lib/ui/Button.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import HeroIdentity from './HeroIdentity.svelte';
  import WorldProgress from './WorldProgress.svelte';
  import HomeScene from './HomeScene.svelte';
  import WorldDestination from './WorldDestination.svelte';
  import { MAX_LEVEL } from '$services/progression';
  import { chapterTwoProgress, sanitizePilot } from '$services/rpgPilotService';
  import { chapterTwoScenes } from '$lib/content/pilot';
  import '$lib/rpg-theme.css';
  import './home.css';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import { collectionStats } from '$services/collectionRules';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let open = $state(false);
  let starter = $state<MissionStarter>();
  let greeting = $state('Boa jornada');
  let filter = $state<'pending' | 'all' | 'today' | 'completed'>('pending');
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
      const hour = new Date().getHours();
      greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    };
    refreshDay();
    window.addEventListener('focus', refreshDay);
    const clock = setInterval(refreshDay, 30000);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', refreshDay);
      clearInterval(clock);
    };
  });
  const next = $derived(
    data
      ? selectNext(
          data.tasks.filter((task) => scheduledOn(task, today)),
          today,
        )
      : null,
  );
  const hasVisibleTasks = $derived(
    data?.tasks.some((task) => !task.archived) ?? false,
  );
  const waitingReview = $derived(
    !next &&
      (data?.tasks.some((task) => !task.archived && task.reviewEnabled) ??
        false),
  );
  const activeTasks = $derived(
    data?.tasks.filter((task) => !task.archived) ?? [],
  );
  const dayTasks = $derived(
    activeTasks.filter(
      (task) =>
        scheduledOn(task, today) ||
        data?.events.some(
          (event) =>
            event.taskId === task.id &&
            ['task', 'review'].includes(event.kind) &&
            !event.reversedAt &&
            event.date === today,
        ),
    ),
  );
  const availableToday = (task: (typeof activeTasks)[number]) =>
    isAvailable(task, new Date(`${today}T12:00:00`));
  const visibleTasks = $derived(
    filter === 'all'
      ? activeTasks
      : dayTasks.filter(
          (task) =>
            filter === 'today' ||
            (filter === 'pending'
              ? availableToday(task) || !task.completed
              : !availableToday(task) && !!task.completed),
        ),
  );
  const plan = $derived(dayTasks);
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
    dayTasks.filter((task) => !availableToday(task) && !!task.completed),
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
<div class="home-world rpg-home">
  {#if error}
    <div role="alert" class="journey-error">
      {error}<a class="journey-link" href="/" data-sveltekit-reload
        >Tentar novamente</a
      >
    </div>
  {:else if !data}
    <div class="rpg-loading" role="status">
      <Icon name="world" size={36} />Abrindo sua jornada…
    </div>
  {:else}
    <div class="rpg-top">
      <section
        class="rpg-world-panel rpg-frame"
        aria-label="Personagem e mundo"
      >
        <RpgTrim />
        <header class="rpg-heading">
          <div>
            <p class="lmu-eyebrow">Level Me Up · Seu mundo, sua jornada</p>
            <h1>
              {data?.profile
                ? `${greeting}, ${data.profile.name}.`
                : 'Hoje, no seu mundo.'}
            </h1>
            <p class="rpg-heading-note">
              O que você faz hoje deixa marcas no seu mundo.
            </p>
          </div>
        </header>
        <HomeScene companion={data.companion} />
        <div class="rpg-character-status">
          {#if data.profile}<HeroIdentity
              profile={data.profile}
              owned={data.owned}
              achievements={achievements.map((item) => item.title)}
              compact
            />{:else}<p role="alert">
              Seu perfil não está disponível. Seus dados foram preservados. <a
                href="/"
                data-sveltekit-reload>Tentar novamente</a
              >
            </p>{/if}
        </div>
      </section>
      <section
        class="rpg-missions rpg-frame"
        aria-labelledby="rpg-missions-title"
      >
        <RpgTrim />
        <header class="rpg-missions-heading">
          <Icon name="today" size={25} />
          <h2 id="rpg-missions-title">Suas missões</h2>
          <span
            >{completed.length}/{dayTasks.length}<small>concluídas</small></span
          >
        </header>
        <div
          class="rpg-task-filters"
          role="group"
          aria-label="Filtrar missões da Home"
        >
          <button
            type="button"
            aria-pressed={filter === 'pending'}
            onclick={() => {
              filter = 'pending';
            }}>Pendentes</button
          >
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onclick={() => {
              filter = 'all';
            }}>Todas</button
          >
          <button
            type="button"
            aria-pressed={filter === 'today'}
            onclick={() => {
              filter = 'today';
            }}>Hoje <span>{plan.length}</span></button
          >
          <button
            type="button"
            aria-pressed={filter === 'completed'}
            onclick={() => {
              filter = 'completed';
            }}>Concluídas</button
          >
        </div>
        <!-- Keyboard focus lets the user scroll the task region without a pointer. -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="rpg-task-scroll"
          role="region"
          aria-label="Lista de missões"
          tabindex="0"
        >
          {#if next && filter !== 'completed' && (filter !== 'today' || scheduledOn(next.task, today))}
            <div class="rpg-next">
              <div class="rpg-next-label">
                <span>{next.reason}</span>{#if reward}<small
                    >Prévia: +{reward.xp} XP</small
                  >{/if}
              </div>
              <h2>{next.task.title}</h2>
              <p class="lmu-hint">
                {next.reason === 'Em andamento'
                  ? homeCopy.resume
                  : next.explanation}
              </p>
              {#if taskSteps(next.task).length}<progress
                  max={taskSteps(next.task).length}
                  value={taskSteps(next.task).filter((step) =>
                    next.task.completedSubtasks?.includes(step.index),
                  ).length}
                  aria-label="Passos da próxima missão"
                ></progress>
                <p class="lmu-hint">
                  {taskSteps(next.task).find(
                    (step) =>
                      !next.task.completedSubtasks?.includes(step.index),
                  )?.label ?? 'Pronta para concluir'}
                </p>{/if}
              <a
                class="lmu-button lmu-button--primary"
                href={`/missao/${next.task.id}`}
                >{next.reason === 'Em andamento'
                  ? 'Continuar missão'
                  : 'Começar missão'}<Icon name="arrow" size={16} /></a
              >
            </div>
          {/if}
          {#if !next && filter !== 'completed'}
            <div
              class="rpg-empty"
              class:rpg-empty-compact={data.tasks.length > 0}
            >
              <Icon name={data.tasks.length ? 'check' : 'missions'} size={24} />
              <h2>
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
              {#if !data.tasks.length}
                <Button onclick={() => createMission()}
                  >Criar minha primeira missão<Icon
                    name="plus"
                    size={16}
                  /></Button
                >
                <details class="rpg-starters">
                  <summary>{homeCopy.examplesTitle}</summary>
                  <p class="lmu-hint">{homeCopy.examplesHint}</p>
                  <div class="journey-starter-list">
                    {#each missionStarters as example (example.key)}<Button
                        variant="secondary"
                        onclick={() => createMission(example)}
                        >{example.label}<Icon name="arrow" size={16} /></Button
                      >{/each}
                  </div>
                </details>
              {:else}<a class="journey-link" href="/progresso"
                  >Rever meu progresso</a
                >{/if}
            </div>
          {/if}
          {#if visibleTasks.length}
            <ul class="rpg-task-list">
              {#each visibleTasks as task (task.id)}
                {@const available = availableToday(task)}
                {@const recorded = task.completionEventId
                  ? data.events.find(
                      (event) =>
                        event.id === task.completionEventId &&
                        !event.reversedAt,
                    )
                  : undefined}
                {@const taskReward = available
                  ? data.rewards[task.id!]
                  : recorded?.reward}
                <li
                  class:rpg-task-done={!available &&
                    (task.completed || task.status === 'completed')}
                >
                  <a href={`/missao/${task.id}`}>
                    <span class="rpg-task-mark"
                      ><Icon
                        name={!available &&
                        (task.completed || task.status === 'completed')
                          ? 'check'
                          : task.executionState === 'active'
                            ? 'pause'
                            : 'book'}
                        size={18}
                      /></span
                    >
                    <span class="rpg-task-copy"
                      ><strong>{task.title}</strong><small
                        >{available
                          ? task.executionState === 'active'
                            ? 'Em execução'
                            : task.executionState === 'paused'
                              ? 'Pausada'
                              : scheduledOn(task, today)
                                ? 'Planejada para hoje'
                                : 'Disponível'
                          : task.reviewEnabled
                            ? task.lastReviewDate === today
                              ? 'Revisão realizada hoje'
                              : 'Próxima revisão: ' +
                                formatCalendar(reviewDueDate(task))
                            : 'Concluída'}</small
                      ></span
                    >
                    {#if taskReward}<span class="rpg-task-reward"
                        ><span>+{taskReward.xp} XP</span><small
                          >+{taskReward.gold} Gold</small
                        ><span class="sr-only"
                          >{available ? 'Prévia' : 'Registrado'}</span
                        ></span
                      >{/if}
                    <Icon name="arrow" size={14} />
                  </a>
                </li>
              {/each}
            </ul>
          {:else if filter === 'completed'}<p class="rpg-list-empty">
              Nenhuma missão concluída para mostrar.
            </p>{:else if filter === 'today' && next}<p class="rpg-list-empty">
              Você ainda não escolheu missões para hoje. <a href="/missoes"
                >Abrir planejamento</a
              >
            </p>{/if}
        </div>
        <footer class="rpg-missions-footer">
          <Button aria-label="Nova missão" onclick={() => createMission()}
            ><Icon name="plus" size={18} />Nova missão</Button
          ><a href="/missoes" aria-label="Abrir planejamento"
            ><Icon name="missions" size={22} /></a
          >
        </footer>
      </section>
    </div>
    <div class="rpg-destinations" aria-label="Explorar seu mundo">
      <WorldDestination
        title="Aventura"
        icon="swords"
        image="/art/home-rpg/adventure-small.webp"
        detail={adventureStatus}
        href="/aventura"
        action={pilot.scene > 0 ? 'Continuar aventura' : 'Entrar na aventura'}
      >
        {#if pilot.scene === 6 && pilot.chapterOneEndXp !== undefined && !pilot.chapterTwoUnlocked}<progress
            value={Math.min(chapter.required, chapter.earned)}
            max={chapter.required}
            aria-label="XP para o capítulo 2"
          ></progress><small
            >{Math.min(chapter.required, chapter.earned)} / {chapter.required} XP</small
          >{:else}<small>O outro lado da ponte · experiência narrativa</small
          >{/if}
      </WorldDestination>
      <WorldDestination
        title="Refúgio"
        icon="world"
        image={sanctuaryContent[stage].pilot}
        alt={`Seu ambiente no estágio ${sanctuaryContent[stage].label}`}
        detail={`Estágio ${stage} · ${sanctuaryContent[stage].label}`}
        href="/refugio"
        action="Acessar refúgio"
        ><small>{sanctuaryContent[stage].description}</small></WorldDestination
      >
      <WorldDestination
        title="Projetos"
        icon="projects"
        image="/art/home-rpg/planning-small.webp"
        detail={projects.length
          ? `${projects.length} ${projects.length === 1 ? 'projeto em curso' : 'projetos em curso'}`
          : 'Seu próximo projeto começa com uma ideia.'}
        href="/projetos"
        action="Ver projetos"
      >
        {#if projects.length}<a
            class="rpg-project-name"
            href={`/projetos/${projects[0].id}`}
            >{projects[0].name}<span
              >{projects[0].status === 'pausado'
                ? 'Pausado'
                : projects[0].status === 'planejando'
                  ? 'Planejando'
                  : 'Em andamento'}</span
            ></a
          >{:else}<small>Organize o que você quer construir.</small>{/if}
      </WorldDestination>
      <WorldDestination
        id="home-map"
        title="Mapa"
        icon="map"
        image="/art/home-rpg/atlas.webp"
        detail="Um atlas ainda por explorar."
        href="/refugio"
        action="Ver lugares do refúgio"
        ><small
          >Mapa explorável em preparação. As paisagens do refúgio já estão
          disponíveis.</small
        ></WorldDestination
      >
    </div>
    <section
      class="rpg-horizons rpg-frame rpg-frame--secondary"
      aria-label="Próximos marcos"
    >
      <RpgTrim />
      <div class="rpg-horizons-title">
        <Icon name="spark" size={25} />
        <h2>O caminho adiante</h2>
        <a href="/progresso">Ver progresso <Icon name="arrow" size={14} /></a>
      </div>
      <div class="rpg-horizons-grid">
        <WorldProgress totalXp={data.profile?.totalXpEarned ?? 0} />
        <div class="rpg-level-goal">
          <p class="lmu-eyebrow">Seu personagem</p>
          <h3>
            {(data.profile?.level ?? 0) >= MAX_LEVEL
              ? 'Nível máximo alcançado'
              : `Rumo ao nível ${(data.profile?.level ?? 1) + 1}`}
          </h3>
          <p>
            {(data.profile?.level ?? 0) >= MAX_LEVEL
              ? 'Cada novo passo continua registrado.'
              : `${Math.max(0, (data.profile?.xpNext ?? 0) - (data.profile?.xpCurrent ?? 0))} XP para a próxima evolução.`}
          </p>
          <a href="/perfil">Ver personagem <Icon name="arrow" size={14} /></a>
        </div>
        <a class="rpg-earned" href="/trofeus"
          ><Icon name="spark" size={28} /><span
            ><strong
              >{achievements.length}
              {achievements.length === 1 ? 'conquista' : 'conquistas'}</strong
            ><small>Marcas do que você já construiu.</small></span
          ><Icon name="arrow" size={15} /></a
        >
      </div>
    </section>
    <QuickCreate bind:open snapshot={data} {starter} />
  {/if}
</div>
