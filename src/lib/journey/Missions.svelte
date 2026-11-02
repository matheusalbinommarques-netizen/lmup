<script lang="ts">
  import '$lib/rpg-theme.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import {
    isAvailable,
    planTask,
    pinTask,
    taskSteps,
  } from '$services/journeyService';
  import {
    completeTask,
    undoTask,
    previewTaskUndo,
  } from '$services/taskService';
  import Dialog from '$lib/ui/Dialog.svelte';
  import type { Resources } from '$services/productivityTypes';
  import { celebrateReward } from '$services/rewardPresentation';
  import {
    MISSION_SESSION_KEY,
    newMissionSession,
    readMissionSession,
    saveMissionSession,
    type MissionSession,
  } from '$services/missionSession';
  import { dateKey } from '$services/rewardService';
  import {
    scheduledOn,
    nextPlannedDate,
    recurrenceLabel,
  } from '$services/recurrence';
  import { formatCalendar } from '$services/calendar';
  import type { Task } from '$services/db';
  import { guardUpdates } from './guardUpdates';
  import QuickCreate from './QuickCreate.svelte';
  import AreasDialog from './AreasDialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import { paintings } from '$lib/content/visualAssets';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import ProductivityWorkspace from './ProductivityWorkspace.svelte';
  import { ensureOccurrence } from '$services/occurrenceService';
  import { newSavedSession, saveSession } from '$services/savedSessionService';
  import { fraction } from '$services/productivityRules';
  let workspaceView = $state<
    'list' | 'agenda' | 'routines' | 'recovery' | 'sessions'
  >('list');
  $effect(() => {
    const value = page.url.searchParams.get('view');
    workspaceView =
      value && ['agenda', 'routines', 'recovery', 'sessions'].includes(value)
        ? (value as typeof workspaceView)
        : 'list';
  });
  function changeView(view: string) {
    const url = new URL(page.url);
    url.searchParams.set('view', view);
    void goto(url.pathname + url.search, { noScroll: true, keepFocus: true });
  }
  const workspaceTitle = $derived(
    {
      list: 'Lista de Missões',
      agenda:
        page.url.searchParams.get('mode') === 'week'
          ? 'Agenda — Semana'
          : 'Agenda',
      routines: 'Rotinas',
      recovery: 'Recuperar Ocorrências',
      sessions: 'Sessões salvas',
    }[workspaceView],
  );
  const workspaceSubtitle = $derived(
    {
      list: 'Veja, filtre e gerencie todas as suas missões.',
      agenda: 'Organize seu tempo e mantenha o foco.',
      routines: 'Organize suas sequências e mantenha a constância.',
      recovery: 'Recupere, reorganize e mantenha o progresso.',
      sessions: 'Retome suas atividades com o progresso preservado.',
    }[workspaceView],
  );
  let data = $state<JourneySnapshot>();
  let undoOpen = $state(false);
  let undoSelection = $state<{
    taskId: number;
    eventId?: string;
    impact: Resources;
  }>();
  async function requestUndo(taskId: number, eventId?: string) {
    await act(
      String(taskId),
      async () => {
        undoSelection = {
          taskId,
          eventId,
          impact: await previewTaskUndo(taskId, eventId),
        };
        undoOpen = true;
      },
      'Revise o impacto antes de confirmar.',
    );
  }
  async function confirmUndo() {
    if (!undoSelection) return;
    const selected = undoSelection;
    await act(
      String(selected.taskId),
      async () => {
        await undoTask(selected.taskId, selected.eventId, selected.impact);
        undoOpen = false;
      },
      'Conclusão corrigida. Débitos serão compensados com ganhos futuros.',
    );
  }
  let error = $state(''),
    notice = $state('');
  let open = $state(false),
    areasOpen = $state(false);
  let editTask = $state<Task>();
  let search = $state(''),
    project = $state(''),
    area = $state('all');
  let filter = $state<'today' | 'upcoming' | 'all' | 'undated' | 'completed'>(
    'all',
  );
  let groupAreas = $state(false),
    pinnedOnly = $state(false);
  let selecting = $state(false),
    selected = $state<number[]>([]),
    storedSession = $state<MissionSession | null>(null);
  let pending = $state<string[]>([]),
    today = $state(dateKey());
  guardUpdates(() => !data || pending.length > 0);
  onMount(() => {
    storedSession = readMissionSession(today);
    const sync = (event: StorageEvent) => {
      if (event.key === MISSION_SESSION_KEY || event.key === null)
        storedSession = readMissionSession(dateKey());
    };
    window.addEventListener('storage', sync);
    project = new URLSearchParams(location.search).get('projectId') ?? '';
    if (project) filter = 'all';
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () =>
        (error =
          'Não foi possível carregar as missões. Recarregue para tentar novamente.'),
    });
    const refresh = () => {
      const current = dateKey();
      if (today !== current) {
        today = current;
        selected = [];
        storedSession = readMissionSession(current);
      }
    };
    const clock = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      sub.unsubscribe();
      clearInterval(clock);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', sync);
    };
  });
  $effect(() => {
    if (
      data &&
      area !== 'all' &&
      area !== '0' &&
      !data.areas.some((item) => item.id === Number(area))
    )
      area = 'all';
  });
  const available = (task: Task) =>
    task.productivityVersion && !task.reviewEnabled
      ? !!data?.plannedToday.some(
          (row) =>
            row.taskId === task.id &&
            !['completed', 'discarded', 'excused'].includes(row.status),
        )
      : isAvailable(task, new Date(`${today}T12:00:00`));
  const scheduledToday = (task: Task) =>
    task.productivityVersion && !task.reviewEnabled
      ? !!data?.plannedToday.some(
          (row) =>
            row.taskId === task.id &&
            (!!task.recurrence ||
              !!task.plannedDate ||
              row.originDate !== row.plannedDate) &&
            !['discarded', 'excused'].includes(row.status),
        )
      : scheduledOn(task, today);
  const historyCompletion = (event: JourneySnapshot['events'][number]) =>
    event.executionComplete !== false;
  const areaName = (id?: number) =>
    data?.areas.find((item) => item.id === id)?.nome ?? 'Geral';
  const matches = (task: Task) =>
    !task.archived &&
    task.title
      .toLocaleLowerCase('pt-BR')
      .includes(search.trim().toLocaleLowerCase('pt-BR')) &&
    (!project || task.projectId === Number(project)) &&
    (area === 'all' || (task.areaId ?? 0) === Number(area)) &&
    (!pinnedOnly || task.pinned);
  const category = (task: Task) =>
    task.completed && !task.recurrence && !task.reviewEnabled
      ? 'Concluídas'
      : scheduledToday(task)
        ? 'Hoje'
        : !task.plannedDate && !task.recurrence && !task.reviewEnabled
          ? 'Sem data'
          : 'Outros dias';
  const categoryOrder = (task: Task) =>
    ['Hoje', 'Outros dias', 'Sem data', 'Concluídas'].indexOf(category(task));
  const tasks = $derived(data?.tasks.filter(matches) ?? []);
  const counts = $derived({
    today: tasks.filter((task) => scheduledToday(task)).length,
    upcoming: tasks.filter(
      (task) =>
        nextPlannedDate(task, today) &&
        (task.recurrence || task.reviewEnabled || !task.completed),
    ).length,
    all: tasks.length,
    undated: tasks.filter((task) => category(task) === 'Sem data').length,
    completed:
      data?.events.filter(
        (event) =>
          ['task', 'review'].includes(event.kind) &&
          !event.reversedAt &&
          historyCompletion(event) &&
          tasks.some((task) => task.id === event.taskId),
      ).length ?? 0,
  });
  const visible = $derived(
    tasks
      .filter(
        (task) =>
          filter === 'all' ||
          (filter === 'undated' && category(task) === 'Sem data') ||
          (filter === 'today'
            ? scheduledToday(task)
            : filter === 'upcoming'
              ? !!nextPlannedDate(task, today) &&
                (!!task.recurrence || !!task.reviewEnabled || !task.completed)
              : false),
      )
      .sort(
        (a, b) =>
          (!groupAreas && filter === 'all'
            ? categoryOrder(a) - categoryOrder(b)
            : 0) ||
          (groupAreas
            ? areaName(a.areaId).localeCompare(areaName(b.areaId), 'pt-BR')
            : 0) ||
          (filter === 'upcoming'
            ? (nextPlannedDate(a, today) ?? '').localeCompare(
                nextPlannedDate(b, today) ?? '',
              )
            : 0) ||
          Number(!!b.pinned) - Number(!!a.pinned) ||
          Number(
            ['active', 'paused'].includes(b.executionState ?? '') &&
              available(b),
          ) -
            Number(
              ['active', 'paused'].includes(a.executionState ?? '') &&
                available(a),
            ) ||
          (b.id ?? 0) - (a.id ?? 0),
      ),
  );
  const history = $derived(
    data?.events
      .filter((event) => {
        if (!['task', 'review'].includes(event.kind)) return false;
        if (!historyCompletion(event)) return false;
        const task = data?.tasks.find((item) => item.id === event.taskId);
        return (
          (event.taskTitle ?? task?.title ?? '')
            .toLocaleLowerCase('pt-BR')
            .includes(search.trim().toLocaleLowerCase('pt-BR')) &&
          (!project || event.projectId === Number(project)) &&
          (area === 'all' ||
            (event.areaId ?? task?.areaId ?? 0) === Number(area)) &&
          (!pinnedOnly || task?.pinned)
        );
      })
      .sort((a, b) => b.sequence - a.sequence) ?? [],
  );
  const legacy = $derived(
    tasks.filter((task) => task.completed && !task.completionEventId),
  );
  async function act(key: string, work: () => Promise<unknown>, message = '') {
    if (pending.includes(key)) return;
    pending = [...pending, key];
    error = '';
    notice = '';
    try {
      await work();
      notice = message;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Tente novamente.';
    } finally {
      pending = pending.filter((item) => item !== key);
    }
  }
  async function complete(task: Task) {
    await act(String(task.id), async () => {
      const event = await completeTask(task.id!, {
        occurrenceDate: task.recurrence ? today : undefined,
      });
      if (event) {
        celebrateReward(event.id);
        await goto(`/missao/${task.id}?evento=${encodeURIComponent(event.id)}`);
      } else
        notice =
          'Esta ocorrência já foi registrada. Sua recompensa foi preservada.';
    });
  }
  function create() {
    editTask = undefined;
    open = true;
  }
  const eligibleSelection = $derived(
    selected.filter((id) =>
      data?.tasks.some(
        (task) => task.id === id && scheduledToday(task) && available(task),
      ),
    ),
  );
  function toggleSelection(id: number) {
    selected = selected.includes(id)
      ? selected.filter((entry) => entry !== id)
      : [...selected, id];
  }
  async function beginSession() {
    try {
      if (
        data &&
        eligibleSelection.every(
          (id) => !data?.tasks.find((task) => task.id === id)?.reviewEnabled,
        )
      ) {
        const ids = [];
        for (const id of eligibleSelection) {
          const planned = data.plannedToday.filter(
            (row) =>
              row.taskId === id &&
              !['completed', 'excused', 'discarded'].includes(row.status),
          );
          for (const row of planned)
            ids.push((await ensureOccurrence(id, row.originDate)).id);
        }
        await saveSession(newSavedSession('Sessão de Missões', ids));
        selecting = false;
        selected = [];
        error = '';
        await goto('/sessoes');
        return;
      }
      const session = newMissionSession(eligibleSelection, today);
      saveMissionSession(session);
      storedSession = session;
      selecting = false;
      selected = [];
      error = '';
      await goto('/sessao');
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível criar a sessão.';
    }
  }
</script>

<svelte:head><title>Missões · Level Me Up</title></svelte:head>
<section class="rpg-theme missions-organizer">
  <header
    class="journey-heading missions-heading"
    style:--heading-art={`url("${paintings.vedria}")`}
  >
    <div>
      <p class="lmu-eyebrow">
        Missões › {workspaceView === 'list' ? 'Lista' : workspaceTitle}
      </p>
      <h1>{workspaceTitle}</h1>
      <p>{workspaceSubtitle}</p>
    </div>
    <Button onclick={create}><Icon name="plus" size={18} />Nova missão</Button>
  </header>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p role="status" class="journey-save-status">{notice}</p>
  {#if !data}<p>Abrindo suas missões…</p>{:else}
    <nav class="journey-actions" aria-label="Visualização das missões">
      {#each [{ id: 'list', label: 'Lista' }, { id: 'agenda', label: 'Agenda' }, { id: 'routines', label: 'Rotinas' }, { id: 'recovery', label: 'Recuperar ocorrências' }, { id: 'sessions', label: 'Sessões salvas' }] as tab (tab.id)}
        <Button
          variant="secondary"
          aria-pressed={workspaceView === tab.id}
          onclick={() => changeView(tab.id)}
          ><ApprovedIcon
            name={tab.id === 'agenda'
              ? 'agenda'
              : tab.id === 'routines'
                ? 'rotina'
                : tab.id === 'recovery'
                  ? 'recover'
                  : tab.id === 'sessions'
                    ? 'em_andamento'
                    : 'missions'}
            size={24}
          />{tab.label}</Button
        >
      {/each}
    </nav>
    {#if workspaceView !== 'list'}<ProductivityWorkspace
        view={workspaceView}
        snapshot={data}
      />{:else}
      <div class="organizer-toolbar">
        <div class="organizer-primary-controls">
          <nav class="organizer-tabs" aria-label="Agenda de missões">
            {#each [{ key: 'today', label: 'Hoje' }, { key: 'upcoming', label: 'Próximas' }, { key: 'all', label: 'Todas' }, { key: 'undated', label: 'Sem data' }, { key: 'completed', label: 'Concluídas' }] as tab (tab.key)}<Button
                variant="secondary"
                aria-label={tab.label}
                aria-pressed={filter === tab.key}
                onclick={() => (filter = tab.key as typeof filter)}
                >{tab.label}<small aria-hidden="true"
                  >{tab.key === 'completed'
                    ? history.filter((event) => !event.reversedAt).length +
                      legacy.length
                    : counts[tab.key as keyof typeof counts]}</small
                ></Button
              >{/each}
          </nav>
          <div class="mission-session-tools">
            {#if selecting}
              <span
                >{eligibleSelection.length}
                {eligibleSelection.length === 1
                  ? 'missão selecionada'
                  : 'missões selecionadas'}</span
              >
              <Button
                disabled={!eligibleSelection.length}
                onclick={beginSession}>Iniciar sessão</Button
              >
              <Button
                variant="quiet"
                onclick={() => {
                  selecting = false;
                  selected = [];
                }}>Cancelar seleção</Button
              >
            {:else}
              <Button
                variant="secondary"
                onclick={() => {
                  selecting = true;
                  filter = 'today';
                  selected = [];
                }}
              >
                <Icon name="missions" size={18} />Montar sessão
              </Button>
              {#if storedSession}<a
                  class="lmu-button lmu-button--secondary"
                  href="/sessao">Retomar sessão do dia</a
                >{/if}
            {/if}
          </div>
        </div>
        <div class="organizer-compact-filters">
          <label class="journey-label lmu-field search-field"
            ><span class="sr-only">Buscar missão</span><input
              type="search"
              bind:value={search}
              placeholder="Buscar missão…"
            /></label
          >
          <div class="organizer-filters">
            <label class="journey-label"
              ><span class="sr-only">Área</span><select
                aria-label="Área"
                bind:value={area}
                ><option value="all">Todas as áreas</option><option value="0"
                  >Geral</option
                >{#each data.areas as item (item.id)}<option
                    value={String(item.id)}>{item.nome}</option
                  >{/each}</select
              ></label
            >
          </div>
          <details class="extra-filters">
            <summary
              >Mais filtros{project || pinnedOnly ? ' · ativos' : ''}</summary
            >
            <label class="journey-label"
              >Projeto<select bind:value={project}
                ><option value="">Todos os projetos</option
                >{#each data.projects as item (item.id)}<option
                    value={String(item.id)}>{item.name}</option
                  >{/each}</select
              ></label
            >
            <div class="organizer-options">
              <label class="journey-check"
                ><input type="checkbox" bind:checked={groupAreas} />Agrupar por
                área</label
              ><label class="journey-check"
                ><input type="checkbox" bind:checked={pinnedOnly} />Apenas
                fixadas</label
              >
            </div>
            <Button variant="quiet" onclick={() => (areasOpen = true)}
              >Gerenciar áreas</Button
            >
          </details>
        </div>
        {#if search || area !== 'all' || project || pinnedOnly}<Button
            variant="quiet"
            onclick={() => {
              search = '';
              area = 'all';
              project = '';
              pinnedOnly = false;
            }}>Limpar filtros</Button
          >{/if}
      </div>
      <section
        class="rpg-frame organizer-list"
        aria-label={filter === 'completed'
          ? 'Histórico de conclusões'
          : 'Lista de missões'}
      >
        <RpgTrim />
        <h2 class:sr-only={filter === 'all' && !groupAreas}>
          {filter === 'today'
            ? 'Hoje'
            : filter === 'upcoming'
              ? 'Próximas atividades'
              : filter === 'undated'
                ? 'Sem data'
                : filter === 'completed'
                  ? 'Suas conclusões'
                  : 'Todas as missões'}
        </h2>
        {#if filter === 'completed'}
          {#if history.length || legacy.length}<ul>
              {#each history as event (event.id)}
                {@const corrected =
                  !!event.occurrenceId &&
                  !data.occurrences.some(
                    (row) =>
                      row.id === event.occurrenceId &&
                      row.status === 'completed' &&
                      row.completionEventId === event.id,
                  )}
                {@const task = data.tasks.find(
                  (item) => item.id === event.taskId,
                )}
                <li
                  class="mission-row history-row"
                  class:reversed={!!event.reversedAt}
                >
                  <Icon name={event.reversedAt ? 'back' : 'check'} size={21} />
                  <div class="mission-copy">
                    {#if task && !task.archived}<a
                        href={`/missao/${task.id}?evento=${encodeURIComponent(event.id)}`}
                        >{event.taskTitle ?? task.title}</a
                      >{:else}<strong
                        >{event.taskTitle ??
                          task?.title ??
                          'Missão registrada'}</strong
                      >{/if}<small
                      >{formatCalendar(event.occurrenceDate ?? event.date)} · {event.areaName ??
                        areaName(task?.areaId)} · {corrected || event.reversedAt
                        ? 'Corrigida'
                        : event.kind === 'review'
                          ? 'Revisão realizada'
                          : event.occurrenceDate
                            ? 'Rotina realizada'
                            : 'Concluída'}</small
                    >
                  </div>
                  <div class="mission-reward">
                    <span
                      >{event.reversedAt ? '−' : '+'}{event.reward.xp} XP</span
                    ><small
                      >{event.reversedAt ? '−' : '+'}{event.reward.gold} Ouro{event
                        .reward.food
                        ? ` · ${event.reversedAt ? '−' : '+'}${event.reward.food} Comida`
                        : ''}</small
                    >
                  </div>
                  {#if !corrected && !event.reversedAt && task && (event.occurrenceDate || task.completionEventId === event.id)}<Button
                      variant="quiet"
                      disabled={pending.includes(event.id)}
                      aria-label={`Desfazer ${event.taskTitle ?? task.title} de ${formatCalendar(event.date)}`}
                      onclick={() => requestUndo(task.id!, event.id)}
                      >Desfazer</Button
                    >{/if}
                </li>{/each}
              {#each legacy as task (task.id)}<li class="mission-row">
                  <Icon name="check" size={21} />
                  <div class="mission-copy">
                    <a href={`/missao/${task.id}`}>{task.title}</a><small
                      >Conclusão antiga · Histórico preservado</small
                    >
                  </div>
                </li>{/each}
            </ul>
          {:else}<p class="organizer-empty">
              Nenhuma conclusão nesta seleção. Cada atividade realizada ficará
              registrada aqui.
            </p>{/if}
        {:else if visible.length}<ul>
            {#each visible as task, index (task.id)}
              {#if !groupAreas && filter === 'all' && (index === 0 || category(visible[index - 1]) !== category(task))}<li
                  class="area-group"
                >
                  <h3>
                    {category(task)} ({visible.filter(
                      (item) => category(item) === category(task),
                    ).length})
                  </h3>
                </li>{/if}
              {#if groupAreas && (index === 0 || areaName(visible[index - 1].areaId) !== areaName(task.areaId))}<li
                  class="area-group"
                >
                  <h3>{areaName(task.areaId)}</h3>
                </li>{/if}
              {@const todayRows = data.plannedToday.filter(
                (row) => row.taskId === task.id && !row.planningSuspended,
              )}
              {@const canComplete = available(task)}
              {@const done = task.recurrence
                ? task.lastOccurrenceDate === today
                : !!task.completed && !canComplete}
              {@const reward =
                done && task.completionEventId
                  ? data.events.find(
                      (entry) =>
                        entry.id === task.completionEventId &&
                        !entry.reversedAt,
                    )?.reward
                  : data.rewards[task.id!]}
              <li class="mission-row" class:mission-done={done}>
                {#if selecting && filter === 'today'}<label
                    class="mission-selection"
                  >
                    <input
                      type="checkbox"
                      aria-label={`Incluir ${task.title} na sessão`}
                      disabled={!canComplete || !scheduledToday(task)}
                      checked={selected.includes(task.id!)}
                      onchange={() => toggleSelection(task.id!)}
                    />
                  </label>{:else if canComplete && (!task.tracking || task.tracking.method === 'direct') && !taskSteps(task).length && todayRows.length <= 1 && filter !== 'upcoming'}<button
                    class="mission-check"
                    disabled={pending.includes(String(task.id))}
                    aria-label={`Concluir ${task.title}`}
                    onclick={() => complete(task)}
                    ><Icon name="check" size={18} /></button
                  >{:else}<span class="mission-check-static"
                    >{#if done}<Icon name="check" size={18} />{:else}<span
                        aria-hidden="true">·</span
                      >{/if}</span
                  >{/if}
                <ApprovedIcon name={task.iconKey} size={32} />
                <div class="mission-copy">
                  <a href={`/missao/${task.id}`}>{task.title}</a>
                  <small
                    >{areaName(task.areaId)} · {task.plannedTime ??
                      'Flexível'}{task.estimatedMinutes
                      ? ` · ${task.estimatedMinutes} min`
                      : ''} · {done
                      ? 'Concluída'
                      : task.plannedDate
                        ? formatCalendar(task.plannedDate)
                        : recurrenceLabel(task)}</small
                  >
                  {#if todayRows.length > 1}<details
                      class="mission-occurrences"
                    >
                      <summary>{todayRows.length} ocorrências hoje</summary
                      >{#each todayRows as occurrence (occurrence.id)}<a
                          href={'/ocorrencia/' +
                            encodeURIComponent(occurrence.id)}
                          onclick={async (event) => {
                            event.preventDefault();
                            await act('open:' + occurrence.id, async () => {
                              await ensureOccurrence(
                                occurrence.taskId,
                                occurrence.originDate,
                              );
                              await goto(
                                '/ocorrencia/' +
                                  encodeURIComponent(occurrence.id),
                              );
                            });
                          }}
                          >Origem {occurrence.originDate} · {Math.round(
                            fraction(occurrence) * 100,
                          )}% · Executar ocorrência →</a
                        >{/each}
                    </details>
                  {:else if todayRows[0]?.value > 0 && !done}<a
                      class="inline-progress"
                      href={'/ocorrencia/' +
                        encodeURIComponent(todayRows[0].id)}
                      ><progress
                        max="100"
                        value={fraction(todayRows[0]) * 100}
                        aria-label={'Progresso de ' + task.title}
                      ></progress>{Math.round(fraction(todayRows[0]) * 100)}% ·
                      Continuar</a
                    >{/if}
                </div>
                {#if reward}<div class="mission-reward">
                    <span>+{reward.xp} XP</span><small
                      >+{reward.gold} Ouro</small
                    >
                  </div>{/if}
                <details class="mission-menu">
                  <summary aria-label={`Ações para ${task.title}`}>⋯</summary>
                  <div>
                    <Button
                      variant="quiet"
                      onclick={() => {
                        editTask = task;
                        open = true;
                      }}>Editar missão</Button
                    ><a class="journey-link" href={`/missao/${task.id}`}
                      >Abrir missão</a
                    ><Button
                      variant="quiet"
                      disabled={pending.includes(String(task.id))}
                      onclick={() =>
                        act(
                          String(task.id),
                          () => planTask(task.id!, !scheduledToday(task)),
                          'Plano atualizado.',
                        )}
                      >{scheduledToday(task)
                        ? 'Tirar de hoje'
                        : 'Planejar para hoje'}</Button
                    ><Button
                      variant="quiet"
                      aria-pressed={!!task.pinned}
                      disabled={pending.includes(String(task.id))}
                      onclick={() =>
                        act(
                          String(task.id),
                          () => pinTask(task.id!, !task.pinned),
                          'Destaque atualizado.',
                        )}>{task.pinned ? 'Desafixar' : 'Fixar'}</Button
                    >{#if canComplete && !taskSteps(task).length && filter !== 'upcoming'}<Button
                        disabled={pending.includes(String(task.id))}
                        onclick={() => complete(task)}>Completar missão</Button
                      >{/if}{#if done && task.completionEventId}<Button
                        variant="quiet"
                        disabled={pending.includes(String(task.id))}
                        onclick={() => requestUndo(task.id!)}
                        >Desfazer conclusão</Button
                      >{/if}
                  </div>
                </details>
              </li>
            {/each}
          </ul>{:else}<div class="organizer-empty">
            <Icon name="missions" size={30} />
            <h3>
              {filter === 'today'
                ? 'Seu dia está livre.'
                : 'Nenhuma missão nesta seleção.'}
            </h3>
            <p>
              {filter === 'today'
                ? 'Planeje uma atividade para hoje ou consulte suas próximas missões.'
                : 'Experimente outro filtro ou registre uma nova atividade.'}
            </p>
            <Button variant="secondary" onclick={create}>Criar missão</Button>
          </div>{/if}
      </section>
      <div class="organizer-links">
        <a class="journey-link" href="/revisoes">Revisões e suas sessões</a><a
          class="journey-link"
          href="/arquivo/missoes">Organização avançada</a
        >
      </div>
    {/if}
    <QuickCreate
      bind:open
      snapshot={data}
      {editTask}
      defaultAreaId={area === 'all' ? undefined : Number(area)}
      oncreated={() =>
        (notice = editTask
          ? 'Missão atualizada.'
          : 'Missão salva. Você pode criar outra ou continuar seu planejamento.')}
    /><AreasDialog bind:open={areasOpen} snapshot={data} />
  {/if}
</section>
<Dialog bind:open={undoOpen} title="Revisar correção">
  {#if undoSelection}<p>
      Débito a compensar: {undoSelection.impact.xp} XP · {undoSelection.impact
        .gold} Ouro · {undoSelection.impact.food} Comida.
    </p>
    <p>
      Ganhos futuros compensarão o débito. Níveis, compras, construções e
      prêmios de estágio já alcançados serão preservados.
    </p>
    <Button disabled={pending.length > 0} onclick={confirmUndo}
      >Confirmar correção</Button
    >{/if}
</Dialog>

<style>
  .missions-organizer {
    max-width: none;
    margin: 0;
  }
  .missions-heading {
    background:
      linear-gradient(90deg, #061115 20%, #06111544 80%), var(--heading-art);
    background-size: cover;
    background-position:
      center,
      center 42%;
    min-height: 124px;
    padding: 16px;
    margin: 0 0 10px;
    border-radius: 6px;
    align-items: center;
  }
  .missions-heading h1 {
    font: 500 2.65rem/1.05 var(--lmu-display);
    color: #f0ca76;
    margin: 6px 0;
  }
  .missions-heading p {
    font-size: 0.85rem;
    color: #c5cfb9;
    margin: 4px 0;
  }
  .missions-heading .lmu-eyebrow {
    font-size: 0.7rem;
    color: #e4c481;
    letter-spacing: 0.04em;
  }
  .missions-organizer > nav {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    margin: 0 0 12px;
    padding: 0 0 10px;
    border-bottom: 1px solid #69603b66;
  }
  .missions-organizer > nav :global(.lmu-button) {
    min-width: 0;
    min-height: 38px;
    font-size: 0.82rem;
    padding: 5px 8px;
    white-space: nowrap;
  }
  .missions-organizer > nav :global([aria-pressed='true']),
  .organizer-tabs :global([aria-pressed='true']) {
    border-color: #d8a94c;
    color: #ffe5af;
    background: linear-gradient(#956e2b, #392b18);
    box-shadow: 0 0 9px #d7a04033;
  }
  .journey-save-status:empty {
    display: none;
  }
  .organizer-toolbar {
    display: grid;
    gap: 10px;
    margin: 0 0 12px;
  }
  .organizer-primary-controls {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .organizer-tabs,
  .mission-session-tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
  }
  .organizer-tabs :global(.lmu-button),
  .mission-session-tools :global(.lmu-button) {
    min-height: 36px;
    font-size: 0.8rem;
    padding: 5px 9px;
    gap: 5px;
  }
  .organizer-tabs small {
    font-size: 0.75rem;
    opacity: 0.8;
  }
  .mission-session-tools {
    font-size: 0.8rem;
    color: #dcc79c;
  }
  .organizer-compact-filters {
    display: grid;
    grid-template-columns: minmax(180px, 1.5fr) minmax(150px, 0.7fr) auto;
    align-items: start;
    gap: 10px;
  }
  .organizer-compact-filters label {
    margin: 0;
  }
  .organizer-compact-filters input,
  .organizer-compact-filters select {
    min-height: 38px;
    font-size: 0.85rem;
    padding: 7px 10px;
    border-radius: 6px;
  }
  .organizer-filters label {
    display: block;
  }
  .extra-filters {
    position: relative;
    font-size: 0.8rem;
    margin: 0;
  }
  .extra-filters summary {
    cursor: pointer;
    color: #d7c497;
    min-height: 38px;
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border: 1px solid #736845;
    border-radius: 6px;
  }
  .extra-filters[open] {
    grid-column: 1/-1;
    border: 1px solid #736845;
    border-radius: 6px;
    padding: 10px;
    background: #102022;
  }
  .extra-filters[open] summary {
    border: 0;
    padding: 0;
    min-height: 30px;
  }
  .extra-filters > label {
    margin: 8px 0;
    max-width: 400px;
  }
  .organizer-options {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
    margin: 8px 0;
  }
  .organizer-list {
    padding: 10px 12px;
    margin: 0 0 14px;
    border-color: #615f3b80;
  }
  .organizer-list > :global(.rpg-trim) {
    display: none;
  }
  .organizer-list h2 {
    font: 500 1.45rem var(--lmu-display);
    color: #e9ce8c;
    margin: 0 0 8px;
  }
  .organizer-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 5px;
  }
  .area-group h3 {
    font: 500 1.15rem var(--lmu-display);
    color: #dfc891;
    margin: 6px 0 3px;
  }
  .mission-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    min-height: 64px;
    border: 1px solid #4b624344;
    border-radius: 6px;
    background: linear-gradient(100deg, #172c2a88, #071316);
    flex-wrap: wrap;
  }
  .mission-copy {
    flex: 1;
    min-width: 0;
    line-height: 1.35;
  }
  .mission-copy > a,
  .mission-copy > strong {
    font: 600 1.15rem var(--lmu-display);
    color: #f1ead4;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .mission-copy a:hover {
    text-decoration: underline;
  }
  .mission-copy > small,
  .mission-reward small {
    display: block;
    font-size: 0.78rem;
    line-height: 1.45;
    color: #b9c8bc;
    margin-top: 3px;
  }
  .inline-progress {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    margin-top: 4px;
    color: #e0c789;
  }
  .inline-progress progress {
    width: 84px;
    height: 6px;
  }
  .mission-reward {
    text-align: right;
    font-size: 0.85rem;
    color: var(--rpg-gold);
    font-variant-numeric: tabular-nums;
  }
  .mission-check,
  .mission-check-static,
  .mission-selection {
    display: grid;
    place-items: center;
    width: 32px;
    height: 36px;
    flex: 0 0 32px;
    border: 1px solid #ba9b645c;
    border-radius: 4px;
    background: #071418;
    color: #c8ad77;
  }
  .mission-selection input {
    width: 20px;
    height: 20px;
    accent-color: #e0b45b;
  }
  .mission-check {
    cursor: pointer;
  }
  .mission-check:hover {
    background: #ad87332b;
    color: #ffe4a4;
  }
  .mission-done .mission-copy > a {
    color: #b9c9bd;
  }
  .reversed {
    opacity: 0.75;
  }
  .mission-menu {
    margin-left: auto;
  }
  .mission-menu summary {
    cursor: pointer;
    padding: 6px;
    list-style: none;
    min-width: 32px;
    min-height: 36px;
    font-size: 1.3rem;
  }
  .mission-menu[open] {
    width: 100%;
  }
  .mission-menu[open] summary {
    text-align: right;
  }
  .mission-menu > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px;
    background: #102326;
    border: 1px solid #736845;
    border-radius: 6px;
    align-items: center;
  }
  .mission-occurrences {
    font-size: 0.78rem;
    padding-top: 4px;
  }
  .mission-occurrences a {
    display: block;
  }
  .organizer-empty {
    padding: 24px 12px;
    text-align: center;
    color: #b6c3ba;
  }
  .organizer-empty h3 {
    font-family: var(--lmu-display);
  }
  .organizer-links {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
  }
  @media (max-width: 900px) {
    .missions-heading {
      min-height: 118px;
      padding: 12px 10px;
    }
    .missions-heading h1 {
      font-size: 2.1rem;
    }
    .missions-organizer > nav {
      display: flex;
      overflow-x: auto;
      flex-wrap: nowrap;
      gap: 6px;
    }
    .missions-organizer > nav :global(.lmu-button) {
      flex: 0 0 auto;
      font-size: 0.78rem;
    }
  }
  @media (max-width: 600px) {
    .missions-heading {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 6px;
    }
    .missions-heading > div {
      min-width: 0;
    }
    .missions-heading h1 {
      font-size: 1.9rem;
    }
    .missions-heading p {
      font-size: 0.78rem;
    }
    .missions-heading :global(.lmu-button) {
      font-size: 0.8rem;
      padding: 6px;
    }
    .organizer-primary-controls {
      gap: 8px;
    }
    .organizer-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      width: 100%;
      padding-bottom: 2px;
    }
    .organizer-tabs :global(.lmu-button) {
      flex: 0 0 auto;
      padding: 5px 7px;
      font-size: 0.78rem;
    }
    .organizer-tabs small {
      display: none;
    }
    .organizer-compact-filters {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
    }
    .search-field {
      grid-column: 1/-1;
    }
    .organizer-list {
      padding: 8px;
    }
    .mission-row {
      gap: 7px;
      padding: 8px;
    }
    .mission-copy {
      flex-basis: calc(100% - 120px);
    }
    .mission-reward {
      margin-left: 78px;
      display: flex;
      gap: 8px;
      font-size: 0.78rem;
      align-items: center;
    }
    .mission-reward small {
      margin: 0;
    }
    .mission-menu {
      margin-left: auto;
    }
    .mission-copy > a {
      font-size: 1.1rem;
    }
    .mission-check,
    .mission-check-static,
    .mission-selection {
      width: 28px;
      flex-basis: 28px;
    }
  }
</style>
