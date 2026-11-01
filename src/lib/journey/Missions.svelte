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
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import ProductivityWorkspace from './ProductivityWorkspace.svelte';
  import { ensureOccurrence } from '$services/occurrenceService';
  import { newSavedSession, saveSession } from '$services/savedSessionService';
  import { fraction } from '$services/productivityRules';
  let workspaceView = $state<
    'list' | 'agenda' | 'routines' | 'recovery' | 'sessions'
  >('list');
  onMount(() => {
    const value = page.url.searchParams.get('view');
    if (value && ['agenda', 'routines', 'recovery', 'sessions'].includes(value))
      workspaceView = value as typeof workspaceView;
  });
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
  let filter = $state<'today' | 'upcoming' | 'all' | 'completed'>('today');
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
  const tasks = $derived(data?.tasks.filter(matches) ?? []);
  const counts = $derived({
    today: tasks.filter((task) => scheduledToday(task)).length,
    upcoming: tasks.filter(
      (task) =>
        nextPlannedDate(task, today) &&
        (task.recurrence || task.reviewEnabled || !task.completed),
    ).length,
    all: tasks.length,
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
          (filter === 'today'
            ? scheduledToday(task)
            : filter === 'upcoming'
              ? !!nextPlannedDate(task, today) &&
                (!!task.recurrence || !!task.reviewEnabled || !task.completed)
              : false),
      )
      .sort(
        (a, b) =>
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
  <header class="journey-heading">
    <div>
      <p class="lmu-eyebrow">Organize para agir</p>
      <h1>Missões</h1>
      <p>Seu dia, um próximo passo de cada vez.</p>
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
          onclick={() => (workspaceView = tab.id as typeof workspaceView)}
          >{tab.label}</Button
        >
      {/each}
    </nav>
    {#if workspaceView !== 'list'}<ProductivityWorkspace
        view={workspaceView}
        snapshot={data}
      />{:else}
      <div class="rpg-frame organizer-toolbar">
        <RpgTrim />
        <nav class="organizer-tabs" aria-label="Agenda de missões">
          {#each [{ key: 'today', label: 'Hoje' }, { key: 'upcoming', label: 'Próximas' }, { key: 'all', label: 'Todas' }, { key: 'completed', label: 'Concluídas' }] as tab (tab.key)}<Button
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
            <Button disabled={!eligibleSelection.length} onclick={beginSession}
              >Iniciar sessão</Button
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
              >Área<select bind:value={area}
                ><option value="all">Todas as áreas</option><option value="0"
                  >Geral</option
                >{#each data.areas as item (item.id)}<option
                    value={String(item.id)}>{item.nome}</option
                  >{/each}</select
              ></label
            >
            <Button variant="secondary" onclick={() => (areasOpen = true)}
              >Gerenciar áreas</Button
            >
          </div>
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
              ><input type="checkbox" bind:checked={pinnedOnly} />Apenas fixadas</label
            >
          </div>
        </details>
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
        <h2>
          {filter === 'today'
            ? 'Hoje'
            : filter === 'upcoming'
              ? 'Próximas atividades'
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
                  </label>{:else if canComplete && !taskSteps(task).length && todayRows.length <= 1 && filter !== 'upcoming'}<button
                    class="mission-check"
                    disabled={pending.includes(String(task.id))}
                    aria-label={`Concluir ${task.title}`}
                    onclick={() => complete(task)}
                    ><Icon name="check" size={18} /></button
                  >{:else}<span class="mission-check-static"
                    ><Icon
                      name={done ? 'check' : task.recurrence ? 'today' : 'book'}
                      size={20}
                    /></span
                  >{/if}
                <div class="mission-copy">
                  <a href={`/missao/${task.id}`}>{task.title}</a><small
                    >{areaName(task.areaId)} · {recurrenceLabel(
                      task,
                    )}{task.pinned ? ' · Fixada' : ''}{canComplete &&
                    ['active', 'paused'].includes(task.executionState ?? '')
                      ? ' · Em andamento'
                      : ''}</small
                  ><small
                    >{filter === 'upcoming'
                      ? `Próxima: ${formatCalendar(nextPlannedDate(task, today))}`
                      : done
                        ? 'Concluída'
                        : task.recurrence
                          ? scheduledToday(task)
                            ? `Ocorrência: ${formatCalendar(today)}`
                            : `Próxima: ${formatCalendar(nextPlannedDate(task, today))}`
                          : task.plannedDate
                            ? `Planejada: ${formatCalendar(task.plannedDate)}`
                            : 'Sem data'}</small
                  >
                  {#if task.plannedTime || task.estimatedMinutes || task.importance === 'high'}<small
                      >{task.plannedTime ??
                        'Horário flexível'}{task.estimatedMinutes
                        ? ' · ' + task.estimatedMinutes + ' min estimados'
                        : ''}{task.importance === 'high'
                        ? ' · Alta importância'
                        : ''}</small
                    >{/if}
                  {#if todayRows.length > 1 || todayRows.some((row) => row.value > 0 && row.status !== 'completed')}
                    <div class="mission-occurrences">
                      {#each todayRows as occurrence (occurrence.id)}<p>
                          Origem {occurrence.originDate} · {Math.round(
                            fraction(occurrence) * 100,
                          )}% ·
                          <a
                            class="journey-link"
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
                            }}>Executar ocorrência →</a
                          >
                        </p>{/each}
                    </div>
                  {/if}
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
    max-width: 1100px;
    margin: auto;
  }
  .mission-session-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem;
    margin: 0 0 0.85rem;
    color: #dcc79c;
    font-size: 0.85rem;
  }
  .mission-selection {
    display: grid;
    place-items: center;
    width: 36px;
    height: 38px;
    flex: 0 0 36px;
  }
  .mission-selection input {
    width: 22px;
    height: 22px;
    accent-color: #d5a457;
    cursor: pointer;
  }
  .organizer-compact-filters {
    display: grid;
    grid-template-columns: minmax(220px, 1.4fr) minmax(330px, 1fr);
    gap: 0.7rem;
    align-items: end;
  }
  .organizer-compact-filters .search-field {
    margin: 0;
  }
  .organizer-compact-filters .organizer-filters {
    margin-top: 0;
  }
  @media (max-width: 900px) {
    .organizer-compact-filters {
      grid-template-columns: 1fr;
    }
  }
  .organizer-toolbar,
  .organizer-list {
    padding: 1.1rem;
    margin-bottom: 1rem;
  }
  .organizer-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.9rem;
  }
  .organizer-tabs :global(button) {
    min-width: 0;
    gap: 0.5rem;
  }
  .organizer-tabs :global(button[aria-pressed='true']) {
    border-color: #d0a451;
    color: #ffe0a0;
    background: linear-gradient(180deg, #644b28, #31291d);
    box-shadow: inset 0 1px #ffe4a033;
  }
  .organizer-tabs small {
    opacity: 0.75;
    font-size: 0.75rem;
  }
  .organizer-filters {
    display: flex;
    gap: 0.75rem;
    align-items: end;
    margin-top: 0.8rem;
    flex-wrap: wrap;
  }
  .organizer-filters label {
    flex: 1 1 130px;
    min-width: 0;
  }
  .journey-save-status:empty {
    display: none;
  }
  .extra-filters {
    margin-top: 0.7rem;
    font-size: 0.85rem;
  }
  .extra-filters summary {
    cursor: pointer;
    color: #cbb380;
  }
  .extra-filters > label {
    margin-top: 0.7rem;
    max-width: 400px;
  }
  .organizer-options {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 0.7rem;
    font-size: 0.8rem;
  }
  .organizer-options label {
    margin: 0;
  }
  h1,
  h2,
  h3 {
    font-family: var(--lmu-display);
  }
  h1 {
    color: var(--rpg-gold);
  }
  .organizer-list h2 {
    margin: 0 0 0.8rem;
    font-size: 1.6rem;
    color: #eadbbf;
  }
  .organizer-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .mission-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0.85rem 0.3rem;
    border-top: 1px solid #a27c433d;
  }
  .mission-copy {
    flex: 1 1 180px;
    min-width: 0;
  }
  .mission-copy a,
  .mission-copy strong {
    color: #ece7d7;
    overflow-wrap: anywhere;
    font-weight: 500;
    text-decoration: none;
  }
  .mission-copy a:hover {
    text-decoration: underline;
  }
  .mission-copy small,
  .mission-reward small {
    display: block;
    font-size: 0.76rem;
    color: #afbeb5;
    margin-top: 0.2rem;
  }
  .mission-reward {
    text-align: right;
    font-size: 0.85rem;
    color: var(--rpg-gold);
    font-variant-numeric: tabular-nums;
  }
  .mission-check,
  .mission-check-static {
    display: grid;
    place-items: center;
    width: 36px;
    height: 38px;
    border: 1px solid #ba9b645c;
    border-radius: 0.3rem;
    background: #071418;
    color: #bfa36a;
    flex: 0 0 36px;
  }
  .mission-check {
    cursor: pointer;
  }
  .mission-check:hover {
    color: #ffe4a4;
    background: #ad87332b;
  }
  .mission-check :global(svg) {
    opacity: 0.5;
  }
  .mission-check:hover :global(svg),
  .mission-check:focus-visible :global(svg) {
    opacity: 1;
  }
  .mission-done .mission-copy a {
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
    padding: 0.5rem;
    list-style: none;
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
    gap: 0.4rem;
    padding: 0.5rem;
    background: #0a1c20;
    border-radius: 0.35rem;
    align-items: center;
  }
  .area-group h3 {
    color: var(--rpg-gold);
    margin: 0.9rem 0 0.3rem;
    font-size: 1.3rem;
  }
  .organizer-empty {
    padding: 1.6rem 0.8rem;
    text-align: center;
    color: #b6c3ba;
  }
  .organizer-empty :global(svg) {
    margin: auto;
    color: #d8b674;
  }
  .organizer-links {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  @media (max-width: 600px) {
    .journey-heading {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
    }
    .journey-heading > div {
      min-width: 0;
    }
    .journey-heading h1 {
      font-size: 2rem;
      margin: 0.2rem 0;
    }
    .journey-heading p {
      font-size: 0.8rem;
      margin: 0.3rem 0;
    }
    .journey-heading .lmu-eyebrow {
      font-size: 0.6rem;
    }
    .journey-heading :global(button) {
      padding: 0.65rem 0.6rem;
      font-size: 0.8rem;
    }
    .organizer-tabs small {
      display: none;
    }
    .organizer-filters :global(button) {
      font-size: 0.8rem;
      padding: 0.65rem 0.5rem;
    }
    .organizer-toolbar,
    .organizer-list {
      padding: 0.8rem;
    }
    .organizer-tabs {
      gap: 0.3rem;
    }
    .organizer-tabs :global(button) {
      padding: 0.65rem 0.2rem;
      font-size: 0.8rem;
      flex-wrap: wrap;
    }
    .mission-row {
      gap: 0.5rem;
    }
    .mission-copy {
      flex-basis: 140px;
    }
    .mission-reward {
      margin-left: 44px;
      text-align: left;
    }
    .mission-reward small {
      display: inline;
      margin-left: 0.4rem;
    }
    .organizer-filters {
      gap: 0.5rem;
    }
    .journey-save-status:empty {
      display: none;
    }
    .extra-filters {
      margin-top: 0.7rem;
      font-size: 0.85rem;
    }
    .extra-filters summary {
      cursor: pointer;
      color: #cbb380;
    }
    .extra-filters > label {
      margin-top: 0.7rem;
      max-width: 400px;
    }
    .organizer-options {
      gap: 0.7rem;
    }
    .organizer-list h2 {
      font-size: 1.5rem;
    }
  }
</style>
