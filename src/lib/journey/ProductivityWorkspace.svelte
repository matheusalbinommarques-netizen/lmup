<script lang="ts">
  import { timePicker } from '$lib/ui/timePicker';
  import { areaIconKey } from '$services/areaIcons';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import OccurrenceRow from '$lib/ui/OccurrenceRow.svelte';
  import DayProgress from '$lib/ui/DayProgress.svelte';
  import { guardUpdates } from './guardUpdates';
  import { liveQuery } from 'dexie';
  import { goto } from '$app/navigation';
  import { db } from '$services/db';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import {
    plannedOccurrences,
    ensureOccurrence,
  } from '$services/occurrenceService';
  import SessionSummary from './SessionSummary.svelte';
  import {
    startOrResumeSession,
    saveSession,
  } from '$services/savedSessionService';
  import { saveRoutine, setRoutineStatus } from '$services/routineService';
  import { WEEKDAYS, routineRecurrenceLabel } from '$services/recurrence';
  import { freeSlot, recommendations } from '$services/productivityInsights';
  import type {
    Occurrence,
    Routine,
    SavedMissionSession,
  } from '$services/productivityTypes';
  import type { Task } from '$services/db';
  import Button from '$lib/ui/Button.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import type { JourneySnapshot } from '$services/journeyQuery';
  let {
    view,
    snapshot,
  }: {
    view: 'agenda' | 'routines' | 'recovery' | 'sessions';
    snapshot: JourneySnapshot;
  } = $props();
  let day = $state(dateKey()),
    week = $state(false),
    rows = $state<Occurrence[]>([]),
    contextRows = $state<Occurrence[]>([]),
    routines = $state<Routine[]>([]);
  let selected = $state<string[]>([]),
    error = $state(''),
    notice = $state(''),
    busy = $state(false);
  let tasks = $state<Task[]>([]),
    routineId = $state(''),
    routineName = $state(''),
    routineArea = $state('0'),
    description = $state('');
  let frequency = $state('weekdays');
  let days = $state<number[]>([1, 2, 3, 4, 5]),
    start = $state(dateKey()),
    entries = $state<{ taskId: number; time: string | null }[]>([]);
  let routineRevision = $state<number>(),
    editing = $state(false),
    quota = $state(2),
    period = $state(30);
  let editTask = $state<Task>(),
    editOpen = $state(false),
    dismiss = $state<string[]>([]);
  let reconstructTask = $state(''),
    reconstructDate = $state(addCalendarDays(dateKey(), -1));
  let sessions = $state<SavedMissionSession[]>([]);
  let routineSearch = $state(''),
    recoverySearch = $state(''),
    recoveryStatus = $state('pending');
  let recoveryFrom = $state(addCalendarDays(dateKey(), -29)),
    recoveryTo = $state(dateKey());
  let creatingForRoutine = $state(false);
  guardUpdates(() => editing || editOpen || busy);
  $effect(() => {
    const date = page.url.searchParams.get('date');
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) day = date;
    week = page.url.searchParams.get('mode') === 'week';
  });
  const weekStart = $derived(
    addCalendarDays(day, -((new Date(day + 'T12:00:00').getDay() + 6) % 7)),
  );
  const historicalRows = $derived(
    rows.filter(
      (row) => row.originDate < dateKey() || row.plannedDate < dateKey(),
    ),
  );
  const recoveredRows = $derived(
    historicalRows.filter(
      (row) =>
        (row.originDate < dateKey() || row.plannedDate < dateKey()) &&
        row.title
          .toLocaleLowerCase('pt-BR')
          .includes(recoverySearch.trim().toLocaleLowerCase('pt-BR')) &&
        (recoveryStatus === 'all' ||
          (recoveryStatus === 'completed'
            ? row.status === 'completed'
            : !['completed', 'excused', 'discarded'].includes(row.status))),
    ),
  );
  const pendingRecovery = $derived(
    historicalRows.filter(
      (row) =>
        (row.originDate < dateKey() || row.plannedDate < dateKey()) &&
        !['completed', 'excused', 'discarded'].includes(row.status),
    ).length,
  );
  const dayRows = $derived(
    rows.filter(
      (row) =>
        row.plannedDate === day &&
        !['discarded', 'excused'].includes(row.status),
    ),
  );
  const completedDay = $derived(
    dayRows.filter((row) => row.status === 'completed').length,
  );
  const sessionIsToday = (session: SavedMissionSession) =>
    session.occurrenceIds.every(
      (id) =>
        snapshot.occurrences.find((row) => row.id === id)?.originDate ===
        dateKey(),
    );
  const orderedSessions = $derived(
    [...sessions].sort(
      (a, b) =>
        Number(sessionIsToday(b)) - Number(sessionIsToday(a)) ||
        b.createdAt.localeCompare(a.createdAt),
    ),
  );
  const availableTasks = $derived(
    tasks.filter(
      (task) =>
        !task.archived &&
        !task.reviewEnabled &&
        (!task.routineId || task.routineId === routineId) &&
        !entries.some((entry) => entry.taskId === task.id) &&
        task.title
          .toLocaleLowerCase('pt-BR')
          .includes(routineSearch.toLocaleLowerCase('pt-BR')),
    ),
  );
  function navigate(date: string, mode = week ? 'week' : 'day') {
    const url = new URL(page.url);
    url.searchParams.set('view', 'agenda');
    url.searchParams.set('date', date);
    url.searchParams.set('mode', mode);
    void goto(url.pathname + url.search, { noScroll: true, keepFocus: true });
  }
  function addedMission(id: number, time: string | null = null) {
    if (creatingForRoutine && !entries.some((entry) => entry.taskId === id))
      entries = [...entries, { taskId: id, time }];
    creatingForRoutine = false;
    notice =
      'Missão criada e adicionada à sequência. Salve a rotina para aplicar o vínculo.';
  }
  const areaName = (row: Occurrence) =>
    snapshot.areas.find((area) => area.id === row.areaId)?.nome ?? 'Geral';
  const iconKey = (row: Occurrence) =>
    areaIconKey(
      tasks.find((task) => task.id === row.taskId),
      snapshot.areas,
    );
  function editFuture(row: Occurrence) {
    creatingForRoutine = false;
    editTask = tasks.find((task) => task.id === row.taskId);
    editOpen = true;
  }

  let timer: ReturnType<typeof setInterval>;
  let now = $state(new Date());
  $effect(() => {
    const from =
      view === 'recovery'
        ? recoveryFrom
        : view === 'agenda' && week
          ? weekStart
          : day;
    const to =
      view === 'recovery'
        ? recoveryTo
        : view === 'agenda' && week
          ? addCalendarDays(weekStart, 6)
          : day;
    const sub = liveQuery(async () => ({
      rows: await plannedOccurrences(addCalendarDays(from, -7), to),
      routines: await db.routines.toArray(),
      tasks: await db.tasks.toArray(),
      sessions: await db.savedMissionSessions.toArray(),
    })).subscribe({
      next: (data) => {
        const activeRows = data.rows.filter((row) =>
          data.tasks.some((task) => task.id === row.taskId && !task.archived),
        );
        contextRows = activeRows;
        rows = activeRows.filter(
          (row) =>
            row.plannedDate >= from &&
            (row.value > 0 ||
              row.originDate !== row.plannedDate ||
              data.tasks.some(
                (task) =>
                  task.id === row.taskId &&
                  (!!task.plannedDate || !!task.recurrence),
              )),
        );
        error = '';
        routines = data.routines;
        tasks = data.tasks;
        sessions = data.sessions;
      },
      error: (cause) =>
        (error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível ler o planejamento.'),
    });
    return () => sub.unsubscribe();
  });
  onMount(() => {
    timer = setInterval(() => (now = new Date()), 30000);
    return () => clearInterval(timer);
  });
  const agendaDays = $derived(
    Array.from({ length: week ? 7 : 1 }, (_, index) =>
      addCalendarDays(weekStart, index),
    ),
  );
  const tips = $derived(
    recommendations(rows, now).filter((tip) => !dismiss.includes(tip.id)),
  );
  async function run(work: () => Promise<unknown>, message = '') {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await work();
      if (message) notice = message;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível salvar.';
    } finally {
      busy = false;
    }
  }
  async function open(row: Occurrence) {
    await run(async () => {
      await ensureOccurrence(row.taskId, row.originDate, row.reconstructed);
      await goto('/ocorrencia/' + encodeURIComponent(row.id));
    });
  }
  function editRoutine(row?: Routine) {
    routineId = row?.id ?? crypto.randomUUID();
    routineName = row?.name ?? '';
    description = row?.description ?? '';
    routineArea = String(row?.defaultAreaId ?? 0);
    days = [...(row?.days ?? [1, 2, 3, 4, 5])];
    frequency =
      days.length === 7 ? 'daily' : days.length === 1 ? 'weekly' : 'weekdays';
    start = row?.startDate ?? dateKey();
    entries = row?.entries.map(({ taskId, time }) => ({ taskId, time })) ?? [];
    routineRevision = row?.revision;
    quota = row?.pauseQuota ?? 2;
    period = row?.pausePeriodDays ?? 30;
    editing = true;
  }
  async function startSession(
    occurrences: Occurrence[],
    name = 'Minha sessão',
  ) {
    await run(async () => {
      const ids = [];
      for (const row of occurrences)
        ids.push(
          (
            await ensureOccurrence(
              row.taskId,
              row.originDate,
              row.reconstructed,
            )
          ).id,
        );
      await startOrResumeSession(name, ids, dateKey(), true);
      await goto('/sessoes');
    });
  }
  async function saveRoutineForm(event: SubmitEvent) {
    event.preventDefault();
    await run(async () => {
      await saveRoutine({
        id: routineId,
        name: routineName,
        defaultAreaId: Number(routineArea),
        description,
        days,
        startDate: start,
        entries,
        status:
          routines.find((row) => row.id === routineId)?.status ?? 'active',
        expectedRevision: routineRevision,
        pauseQuota: quota,
        pausePeriodDays: period,
      });
      editing = false;
    }, 'Rotina salva. Ocorrências iniciadas e histórico foram preservados.');
  }
  function earliestSlot(date: string) {
    if (date !== dateKey() || now.getHours() < 8) return '08:00';
    return (
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0')
    );
  }
  function move(index: number, direction: number) {
    const next = [...entries];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    entries = next;
  }
</script>

<section class="productivity-workspace">
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p role="status" class="workspace-notice">{notice}</p>
  {#if view === 'agenda'}
    <div class="workspace-controls date-navigation">
      <Button
        variant="secondary"
        aria-label="Período anterior"
        onclick={() => navigate(addCalendarDays(day, week ? -7 : -1))}>‹</Button
      >
      <label
        >Data da agenda<input
          type="date"
          value={day}
          onchange={(event) => navigate(event.currentTarget.value)}
        /></label
      >
      <Button
        variant="secondary"
        aria-label="Próximo período"
        onclick={() => navigate(addCalendarDays(day, week ? 7 : 1))}>›</Button
      >
      <Button variant="quiet" onclick={() => navigate(dateKey())}>Hoje</Button>
      <div class="view-switch">
        <Button
          variant="secondary"
          aria-pressed={!week}
          onclick={() => navigate(day, 'day')}>Dia</Button
        ><Button
          variant="secondary"
          aria-pressed={week}
          onclick={() => navigate(day, 'week')}>Semana</Button
        >
      </div>
    </div>
    {#if week}
      <div class="week-grid" aria-label="Resumo da semana">
        {#each agendaDays as date (date)}
          {@const activities = rows.filter(
            (row) =>
              row.plannedDate === date &&
              !['discarded', 'excused'].includes(row.status),
          )}
          {@const done = activities.filter(
            (row) => row.status === 'completed',
          ).length}
          <button
            class="week-day rpg-frame"
            class:today={date === dateKey()}
            onclick={() => navigate(date, 'day')}
            aria-label={`Abrir dia ${date}`}
          >
            <span class="week-date"
              >{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              })}</span
            >
            <DayProgress completed={done} total={activities.length} compact />
            <span class="week-activities"
              >{#each activities.slice(0, 3) as row (row.id)}<span
                  ><ApprovedIcon
                    name={row.status === 'completed'
                      ? 'concluida'
                      : iconKey(row)}
                    size={22}
                  /><span>{row.title}</span></span
                >{/each}{#if activities.length > 3}<small
                  >+ {activities.length - 3} atividades</small
                >{/if}{#if !activities.length}<small>Dia livre</small
                >{/if}</span
            ><span class="day-link">Ver dia →</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="daily-agenda">
        <aside class="agenda-summary rpg-frame">
          <h2>Progresso do dia</h2>
          <DayProgress completed={completedDay} total={dayRows.length} />
          <p>
            {new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
          <small
            >Horários são inícios desejados. Seu progresso permanece na
            ocorrência.</small
          >
        </aside>
        <div class="timeline">
          {#if selected.length}<Button
              disabled={busy}
              onclick={() =>
                startSession(
                  dayRows.filter((row) => selected.includes(row.id)),
                )}>Executar seleção como sessão ({selected.length})</Button
            >{/if}
          {#each ['timed', 'flexible'] as group (group)}
            {@const groupRows = dayRows.filter((row) =>
              group === 'timed' ? !!row.plannedTime : !row.plannedTime,
            )}
            {#if groupRows.length}
              <h2 class="timeline-label">
                <ApprovedIcon name="agenda" size={18} />{group === 'timed'
                  ? 'Com horário'
                  : 'Horário flexível'}<span>{groupRows.length}</span>
              </h2>
              {#each groupRows as row (row.id)}
                <div class="timeline-entry">
                  <OccurrenceRow
                    {row}
                    iconKey={iconKey(row)}
                    area={areaName(row)}
                    {busy}
                    checked={selected.includes(row.id)}
                    onselect={(checked) =>
                      (selected = checked
                        ? [...selected, row.id]
                        : selected.filter((id) => id !== row.id))}
                    onopen={() => open(row)}
                    onedit={() => editFuture(row)}
                  />
                </div>
              {/each}
            {/if}
          {/each}
          {#if !dayRows.length}<p class="workspace-empty">
              Sem compromissos neste dia. Sua agenda está livre para planejar.
            </p>{/if}
        </div>
      </div>
    {/if}
    <details class="secondary-tools">
      <summary>Sugestões de planejamento</summary>
      {#each tips as tip (tip.id)}<p>
          <strong>{tip.title}</strong> · {tip.reason}<Button
            variant="quiet"
            onclick={() => (dismiss = [...dismiss, tip.id])}
            >Dispensar sugestão</Button
          >
        </p>{/each}
      <p class="lmu-hint">
        Janela inicial: 08h–22h. Sem estimativa, a sugestão reserva 30 minutos;
        nenhum horário é aplicado automaticamente.
      </p>
      {#each rows
        .filter((row) => row.plannedDate >= dateKey() && !row.plannedTime && !['completed', 'discarded', 'excused'].includes(row.status))
        .slice(0, 3) as row (row.id)}<p>
          {row.title}: {freeSlot(
            contextRows,
            row.plannedDate,
            row.estimatedMinutes ?? 30,
            earliestSlot(row.plannedDate),
          ) ?? 'sem intervalo encontrado'} · para sua revisão.
        </p>{/each}
    </details>
  {:else if view === 'recovery'}
    <div class="recovery-filters">
      <label
        >Buscar ocorrência<input
          type="search"
          bind:value={recoverySearch}
          placeholder="Buscar missão ou atividade…"
        /></label
      >
      <label
        >De<input
          type="date"
          bind:value={recoveryFrom}
          max={recoveryTo}
        /></label
      ><label
        >Até<input
          type="date"
          bind:value={recoveryTo}
          min={recoveryFrom}
          max={dateKey()}
        /></label
      >
      <label
        >Situação<select bind:value={recoveryStatus}
          ><option value="pending">Pendentes</option><option value="completed"
            >Concluídas</option
          ><option value="all">Todas</option></select
        ></label
      >
    </div>
    <div class="recovery-totals">
      <div>
        <ApprovedIcon name="pendente" size={38} /><span
          >Pendentes<strong>{pendingRecovery}</strong></span
        >
      </div>
      <div>
        <ApprovedIcon name="em_andamento" size={38} /><span
          >Com progresso<strong
            >{historicalRows.filter(
              (row) => row.value > 0 && row.status !== 'completed',
            ).length}</strong
          ></span
        >
      </div>
      <div>
        <ApprovedIcon name="concluida" size={38} /><span
          >Recuperadas<strong
            >{historicalRows.filter(
              (row) => row.recovered && row.status === 'completed',
            ).length}</strong
          ></span
        >
      </div>
    </div>
    <div class="recovery-list">
      {#each recoveredRows as row (row.id)}<OccurrenceRow
          {row}
          recovery
          iconKey={iconKey(row)}
          area={areaName(row)}
          {busy}
          onopen={() => open(row)}
          onedit={() => editFuture(row)}
        />{/each}{#if !recoveredRows.length}<p class="workspace-empty">
          Nenhuma ocorrência nesta seleção. Ajuste o período ou a situação para
          consultar o histórico.
        </p>{/if}
    </div>
    <details>
      <summary>Reconstruir uma atividade antiga</summary>
      <p>
        Use apenas para atividade realizada ou planejada cuja ocorrência não foi
        preservada. O registro será identificado como reconstrução; recompensas
        legadas não serão recalculadas.
      </p>
      <label
        >Missão<select bind:value={reconstructTask}
          ><option value="">Escolher missão</option
          >{#each tasks.filter((task) => !task.archived && !task.reviewEnabled) as task (task.id)}<option
              value={String(task.id)}>{task.title}</option
            >{/each}</select
        ></label
      ><label
        >Data de origem<input type="date" bind:value={reconstructDate} /></label
      ><Button
        variant="secondary"
        onclick={() =>
          run(async () => {
            const row = await ensureOccurrence(
              Number(reconstructTask),
              reconstructDate,
              true,
            );
            await goto('/ocorrencia/' + encodeURIComponent(row.id));
          })}>Reconstruir explicitamente</Button
      >
    </details>
  {:else if view === 'routines'}
    <div class="workspace-controls">
      <h2>Suas rotinas</h2>
      <Button onclick={() => editRoutine()}
        ><ApprovedIcon name="criar" size={24} />Nova rotina</Button
      >
    </div>
    <div class="routine-workspace" class:editing>
      <div class="routine-list">
        {#each routines as routine (routine.id)}<article
            class="rpg-frame routine-card"
            class:chosen={editing && routineId === routine.id}
          >
            <div class="routine-title">
              <ApprovedIcon name="rotina" size={36} /><button
                class="routine-name"
                onclick={() => editRoutine(routine)}
                >{routine.name}<small
                  >{routine.entries.length} atividades · {routine.status ===
                  'active'
                    ? 'Ativa'
                    : routine.status === 'paused'
                      ? 'Pausada'
                      : 'Arquivada'}</small
                ></button
              >
            </div>
            <p>
              {routine.days
                .map(
                  (day) => WEEKDAYS.find((item) => item.value === day)?.short,
                )
                .join(' · ')}
            </p>
            <div class="routine-actions">
              <Button variant="secondary" onclick={() => editRoutine(routine)}
                >Editar rotina</Button
              ><Button
                variant="quiet"
                aria-pressed={routine.status === 'active'}
                onclick={() =>
                  run(
                    () =>
                      setRoutineStatus(
                        routine.id,
                        routine.status === 'active' ? 'paused' : 'active',
                        routine.revision,
                      ),
                    'Estado da rotina atualizado.',
                  )}
                >{routine.status === 'active'
                  ? 'Pausar rotina'
                  : 'Ativar rotina'}</Button
              >
            </div>
            {#if sessions.some((session) => session.status !== 'ended' && session.occurrenceIds.some((id) => snapshot.occurrences.find((row) => row.id === id)?.routineId === routine.id))}<details
              >
                <summary>Execuções preservadas</summary
                >{#each sessions.filter((session) => session.status !== 'ended' && session.occurrenceIds.some((id) => snapshot.occurrences.find((row) => row.id === id)?.routineId === routine.id)) as saved (saved.id)}<p
                    class="lmu-hint"
                  >
                    {[
                      ...new Set(
                        saved.occurrenceIds
                          .map(
                            (id) =>
                              snapshot.occurrences.find((row) => row.id === id)
                                ?.originDate,
                          )
                          .filter(Boolean),
                      ),
                    ].join(' · ')} · {saved.status === 'paused'
                      ? 'Sessão pausada'
                      : 'Sessão em andamento'}
                  </p>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onclick={() =>
                      run(async () => {
                        await saveSession(
                          { ...saved, status: 'active' },
                          saved.revision,
                        );
                        await goto('/sessoes');
                      })}>Retomar execução preservada</Button
                  >{/each}
              </details>{/if}
            <details>
              <summary>Mais ações</summary><Button
                variant="quiet"
                disabled={busy}
                onclick={async () => {
                  const candidates = await plannedOccurrences(
                    dateKey(),
                    dateKey(),
                  );
                  await startSession(
                    candidates.filter((row) => row.routineId === routine.id),
                    routine.name,
                  );
                }}>Executar rotina</Button
              ><Button
                variant="quiet"
                onclick={() =>
                  run(
                    () =>
                      setRoutineStatus(
                        routine.id,
                        'archived',
                        routine.revision,
                      ),
                    'Rotina arquivada; histórico preservado.',
                  )}>Arquivar</Button
              >
            </details>
          </article>{/each}
        {#if !routines.length}<p class="workspace-empty">
            Monte sua primeira sequência de atividades.
          </p>{/if}
      </div>
      {#if editing}<form
          class="rpg-frame routine-form"
          onsubmit={saveRoutineForm}
        >
          <h2>{routineRevision ? 'Editar rotina' : 'Montar rotina'}</h2>
          <div class="routine-fields">
            <label
              >Nome da rotina<input
                maxlength="160"
                bind:value={routineName}
                required
              /></label
            >
            <label
              >Área padrão para novas missões<select bind:value={routineArea}
                ><option value="0">Geral</option
                >{#each snapshot.areas as area (area.id)}<option
                    value={String(area.id)}>{area.nome}</option
                  >{/each}</select
              ></label
            >
          </div>
          <p class="lmu-hint">
            Novas missões começam nesta área. Você pode alterá-la em cada
            missão; as já cadastradas mantêm sua área.
          </p>
          <div class="routine-fields routine-calendar">
            <label
              >Recorrência da rotina<select
                bind:value={frequency}
                onchange={() => {
                  if (frequency === 'daily') days = [0, 1, 2, 3, 4, 5, 6];
                  else if (frequency === 'weekly') days = [days[0] ?? 1];
                  else if (days.length === 7) days = [1, 2, 3, 4, 5];
                }}
                ><option value="daily">Diariamente</option><option
                  value="weekdays">Dias específicos da semana</option
                ><option value="weekly">Semanalmente</option></select
              ></label
            >
            <label
              >Início da rotina<input
                type="date"
                bind:value={start}
                required
              /></label
            >
          </div>
          {#if frequency === 'weekdays'}
            <fieldset class="weekday-picker">
              <legend>Dias de execução</legend
              >{#each WEEKDAYS as weekday (weekday.value)}<label
                  class:chosen={days.includes(weekday.value)}
                  ><input
                    type="checkbox"
                    checked={days.includes(weekday.value)}
                    onchange={(event) =>
                      (days = event.currentTarget.checked
                        ? [...days, weekday.value]
                        : days.filter((day) => day !== weekday.value))}
                  />{weekday.short}</label
                >{/each}
            </fieldset>
          {:else if frequency === 'weekly'}<label
              >Dia da rotina<select
                value={days[0] ?? 1}
                onchange={(event) =>
                  (days = [Number(event.currentTarget.value)])}
                >{#each WEEKDAYS as weekday (weekday.value)}<option
                    value={weekday.value}>{weekday.label}</option
                  >{/each}</select
              ></label
            >{/if}
          <p class="lmu-hint">
            {routineRecurrenceLabel(days)}. Todas as missões vinculadas herdam
            esta recorrência ao salvar a rotina. Os horários podem ser ajustados
            em cada atividade.
          </p>
          <div class="sequence-heading">
            <h3>Sequência de missões ({entries.length})</h3>
            <Button
              variant="secondary"
              onclick={() => {
                creatingForRoutine = true;
                editTask = undefined;
                editOpen = true;
              }}
              ><ApprovedIcon name="criar" size={22} />Criar missão na rotina</Button
            >
          </div>
          <ol class="routine-sequence">
            {#each entries as entry, index (entry.taskId)}{@const task =
                tasks.find((task) => task.id === entry.taskId)}
              <li>
                <span class="sequence-number">{index + 1}</span><ApprovedIcon
                  name={areaIconKey(task, snapshot.areas)}
                  size={32}
                /><span class="sequence-title"
                  >{task?.title ?? 'Missão criada'}<small
                    >{snapshot.areas.find((area) => area.id === task?.areaId)
                      ?.nome ?? 'Geral'}</small
                  ></span
                ><input
                  type="time"
                  use:timePicker
                  aria-label={`Horário de ${task?.title ?? 'missão'}`}
                  value={entry.time ?? ''}
                  onchange={(event) =>
                    (entries = entries.map((item, i) =>
                      i === index
                        ? { ...item, time: event.currentTarget.value || null }
                        : item,
                    ))}
                />
                <div class="sequence-actions">
                  <Button
                    variant="quiet"
                    aria-label={`Editar ${task?.title ?? 'missão'}`}
                    disabled={!task || task.archived}
                    onclick={() => {
                      creatingForRoutine = false;
                      editTask = task;
                      editOpen = true;
                    }}>Editar</Button
                  >
                  <Button
                    variant="quiet"
                    disabled={index === 0}
                    aria-label={`Mover ${task?.title} para cima`}
                    onclick={() => move(index, -1)}>↑</Button
                  ><Button
                    variant="quiet"
                    disabled={index === entries.length - 1}
                    aria-label={`Mover ${task?.title} para baixo`}
                    onclick={() => move(index, 1)}>↓</Button
                  ><Button
                    variant="quiet"
                    aria-label={`Remover ${task?.title} da sequência`}
                    onclick={() =>
                      (entries = entries.filter(
                        (item) => item.taskId !== entry.taskId,
                      ))}><ApprovedIcon name="excluir" size={22} /></Button
                  >
                </div>
              </li>{/each}
          </ol>
          <details class="mission-search">
            <summary>Adicionar missão existente</summary>
            <label
              ><span class="sr-only">Buscar missão existente</span><input
                type="search"
                bind:value={routineSearch}
                placeholder="Buscar nas suas missões…"
              /></label
            >
            <div class="mission-results">
              {#each availableTasks.slice(0, 6) as task (task.id)}<button
                  type="button"
                  onclick={() =>
                    (entries = [
                      ...entries,
                      { taskId: task.id!, time: task.plannedTime ?? null },
                    ])}
                  ><ApprovedIcon
                    name={areaIconKey(task, snapshot.areas)}
                    size={28}
                  />{task.title}<span>Adicionar +</span></button
                >{/each}{#if !availableTasks.length}<p class="lmu-hint">
                  Nenhuma missão disponível nesta busca. Você pode criar uma
                  nova.
                </p>{/if}
            </div>
          </details>
          <details>
            <summary>Descrição e pausas justificadas</summary><label
              >Descrição<textarea bind:value={description}></textarea></label
            >
            <p class="lmu-hint">
              Pausas não contam como execução nem concedem recursos.
            </p>
            <label
              >Pausas por período<input
                type="number"
                min="0"
                bind:value={quota}
              /></label
            ><label
              >Dias do período<input
                type="number"
                min="1"
                bind:value={period}
              /></label
            >
          </details>
          <div class="journey-actions routine-footer">
            <Button variant="quiet" onclick={() => (editing = false)}
              >Cancelar</Button
            ><Button type="submit" disabled={busy}>Salvar rotina</Button>
          </div>
        </form>{/if}
    </div>
  {:else}
    <h2>Sessões salvas</h2>
    <p class="lmu-hint">
      O progresso pertence à ocorrência e é compartilhado entre sessões.
    </p>
    {#each orderedSessions as session, index (session.id)}
      {#if index === 0 || sessionIsToday(orderedSessions[index - 1]) !== sessionIsToday(session)}<h3
        >
          {sessionIsToday(session)
            ? 'Execuções do dia atual'
            : 'Execuções anteriores'}
        </h3>{/if}
      {@const completed = session.occurrenceIds.filter(
        (id) =>
          snapshot.occurrences.find((row) => row.id === id)?.status ===
          'completed',
      ).length}
      {@const total = session.occurrenceIds.length}
      {@const percent = total ? Math.round((completed * 100) / total) : 0}
      <article class="rpg-frame saved-session-card">
        <p class="lmu-hint">
          {[
            ...new Set(
              session.occurrenceIds
                .map(
                  (id) =>
                    snapshot.occurrences.find((row) => row.id === id)
                      ?.originDate,
                )
                .filter(Boolean),
            ),
          ].join(' · ')} · {[
            ...new Set(
              session.occurrenceIds.map(
                (id) =>
                  snapshot.occurrences.find((row) => row.id === id)?.originDate,
              ),
            ),
          ].some((day) => day !== dateKey())
            ? 'Execução anterior'
            : 'Execução do dia'}
        </p>
        <div class="saved-session-heading">
          <div>
            <h3>{session.name}</h3>
            <p>
              {total} atividades ·
              <span
                >{session.status === 'active'
                  ? 'Em andamento'
                  : session.status === 'paused'
                    ? 'Pausada'
                    : 'Encerrada'}</span
              >
            </p>
          </div>
          <Button
            disabled={!total}
            onclick={() =>
              run(async () => {
                await saveSession(
                  { ...session, status: 'active' },
                  session.revision,
                );
                await goto('/sessoes');
              })}>Retomar sessão</Button
          >
        </div>
        <div class="saved-session-progress">
          <progress
            value={completed}
            max={Math.max(1, total)}
            aria-label={`Progresso de ${session.name}`}
          ></progress><strong
            >{completed} de {total} <span>({percent}%)</span></strong
          >
        </div>
        <SessionSummary {session} data={snapshot} compact />
      </article>
    {/each}
    {#if !sessions.length}<p class="workspace-empty">
        Selecione atividades na agenda para montar sua primeira sessão.
      </p>{/if}
  {/if}
  <QuickCreate
    bind:open={editOpen}
    {snapshot}
    {editTask}
    defaultAreaId={creatingForRoutine ? Number(routineArea) : undefined}
    routineContext={creatingForRoutine
      ? { name: routineName, startDate: start, days: [...days] }
      : undefined}
    allowSaveAnother={!creatingForRoutine}
    oncreated={(id, time) => {
      if (creatingForRoutine) addedMission(id, time);
      else if (editing)
        notice = 'Missão atualizada. O rascunho da rotina foi preservado.';
    }}
  />
</section>

<style>
  .productivity-workspace {
    display: grid;
    gap: 12px;
    min-width: 0;
  }
  .workspace-notice:empty {
    display: none;
  }
  .workspace-notice {
    font-size: 0.8rem;
    color: #afcca9;
  }
  .workspace-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .workspace-controls h2 {
    font: 500 1.8rem var(--lmu-display);
    color: #ecd498;
    margin-right: auto;
  }
  .view-switch {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }
  .date-navigation label {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.75rem;
    color: #c0c9b4;
  }
  .date-navigation input {
    max-width: 160px;
  }
  .daily-agenda {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    gap: 22px;
  }
  .agenda-summary {
    padding: 18px 14px;
    text-align: center;
    align-self: start;
    display: grid;
    gap: 16px;
  }
  .agenda-summary h2 {
    font: 500 1.4rem var(--lmu-display);
    color: #f0d79a;
  }
  .agenda-summary p {
    color: #e2d5b0;
    font-size: 0.8rem;
  }
  .agenda-summary small {
    font-size: 0.7rem;
    color: #9fb29e;
  }
  .timeline {
    display: grid;
    gap: 10px;
    align-content: start;
    border-left: 1px solid #b09048aa;
    padding-left: 20px;
  }
  .timeline-entry {
    position: relative;
    min-width: 0;
  }
  .timeline-entry::before {
    content: '';
    position: absolute;
    left: -25px;
    top: 26px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 1px solid #ffe3a5;
    background: #ce9e42;
    box-shadow: 0 0 0 4px #091619;
  }
  .timeline-label {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 7px 10px;
    border: 1px solid #8d744a77;
    border-radius: 6px;
    background: #122326;
    font-family: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    color: #ead6a5;
    margin: 8px 0 2px;
  }
  .timeline-label span {
    padding-left: 6px;
    border-left: 1px solid #8d744a66;
    color: #bccbbd;
    font-size: 0.75rem;
  }
  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
    align-items: start;
  }
  .week-day {
    color: #e8e2cb;
    text-align: left;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .week-day.today {
    border-color: #e7ba52;
  }
  .week-date {
    text-transform: capitalize;
    font-size: 0.8rem;
    min-height: 32px;
    text-align: center;
    font-size: 0.85rem;
  }
  .week-activities {
    display: grid;
    gap: 10px;
    margin: 8px 0;
    width: 100%;
  }
  .week-activities > span {
    overflow-wrap: anywhere;
    display: flex;
    align-items: start;
    gap: 4px;
    font-size: 0.8rem;
    line-height: 1.4;
    min-width: 0;
  }
  .week-activities small {
    font-size: 0.78rem;
    color: #a6b99e;
  }
  .day-link {
    font-size: 0.78rem;
    color: #edd19a;
    border-top: 1px solid #6d704955;
    padding-top: 8px;
  }
  .secondary-tools {
    font-size: 0.8rem;
    padding-top: 10px;
    border-top: 1px solid #4f624b66;
  }
  .secondary-tools summary {
    cursor: pointer;
    color: #c4bc98;
  }
  .secondary-tools p {
    margin: 10px 0;
  }
  .workspace-empty {
    padding: 24px;
    color: #a6bda8;
    font-size: 0.85rem;
  }
  .recovery-filters {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    align-items: end;
  }
  .recovery-totals {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .recovery-totals > div {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 12px;
    background: linear-gradient(100deg, #40351a40, #11272455);
    border: 1px solid #84704766;
    border-radius: 8px;
  }
  .recovery-totals span {
    font-size: 0.72rem;
    color: #d4ceb4;
  }
  .recovery-totals strong {
    display: block;
    color: #f5e3b7;
    font-size: 1.3rem;
  }
  .recovery-list {
    display: grid;
    gap: 9px;
  }
  .routine-workspace {
    display: grid;
    gap: 18px;
  }
  .routine-workspace.editing {
    grid-template-columns: minmax(230px, 0.75fr) minmax(0, 1.6fr);
  }
  .routine-list {
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .routine-card {
    padding: 12px;
  }
  .routine-title {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .routine-name {
    border: 0;
    background: none;
    color: #f0e3bf;
    text-align: left;
    padding: 0;
    font: 600 1.25rem var(--lmu-display);
  }
  .routine-name small {
    display: block;
    font: 400 0.78rem var(--lmu-font);
    color: #aebba7;
    margin-top: 5px;
  }
  .routine-card > p {
    font-size: 0.78rem;
    color: #b5bfa7;
    margin: 10px 0;
  }
  .routine-card.chosen {
    border-color: #d0a653;
  }
  .routine-actions {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .routine-card :global(.lmu-button) {
    min-height: 30px;
    padding: 0.3rem 0.45rem;
    font-size: 0.72rem;
  }
  .routine-card details {
    font-size: 0.78rem;
    color: #a9b99e;
    margin-top: 8px;
  }
  .routine-form {
    padding: 16px;
    display: grid;
    gap: 12px;
    align-content: start;
  }
  .routine-form h2 {
    font: 500 1.6rem var(--lmu-display);
    color: #f1d9a0;
  }
  .routine-fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  label {
    display: grid;
    gap: 5px;
    font-size: 0.8rem;
    color: #c8ccb3;
  }
  input,
  textarea,
  select {
    background: #101f22;
    color: #efe5cd;
    border: 1px solid #736845;
    border-radius: 5px;
    padding: 0.55rem 0.7rem;
    min-width: 0;
    max-width: 100%;
    min-height: 36px;
  }
  fieldset {
    border: 0;
    padding: 0;
    min-width: 0;
  }
  legend {
    font-size: 0.75rem;
    color: #c7cfb9;
    margin-bottom: 8px;
  }
  .weekday-picker {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .weekday-picker label {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #182a27;
    border: 1px solid #5c6c4e;
    padding: 7px;
    border-radius: 6px;
  }
  .weekday-picker label.chosen {
    border-color: #d5a650;
    background: #67502577;
    color: #ffe3a5;
  }
  .weekday-picker input {
    min-height: 0;
    accent-color: #e1ae52;
  }
  .sequence-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .sequence-heading h3 {
    font: 500 1.2rem var(--lmu-display);
    color: #ebd69e;
  }
  .sequence-heading :global(.lmu-button) {
    min-height: 32px;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
  .routine-sequence {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 7px;
  }
  .routine-sequence li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #0a181a;
    border: 1px solid #485b4544;
    border-radius: 6px;
  }
  .sequence-number {
    color: #cbbf8d;
    font-size: 0.7rem;
  }
  .sequence-title {
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.4;
    min-width: 0;
  }
  .routine-sequence input {
    width: 124px;
    padding: 0.5rem;
    font-size: 0.82rem;
  }
  .sequence-actions {
    display: flex;
    gap: 0;
  }
  .sequence-actions :global(.lmu-button) {
    min-height: 34px;
    min-width: 32px;
    padding: 2px;
  }
  .mission-results {
    display: grid;
    gap: 5px;
    margin-top: 8px;
    max-height: 210px;
    overflow: auto;
  }
  .mission-results > button {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #4d624055;
    border-radius: 5px;
    background: #122524;
    color: #d8dec9;
    padding: 7px;
    text-align: left;
    font-size: 0.75rem;
  }
  .mission-results > button > span:last-child {
    margin-left: auto;
    color: #dfc07d;
    font-size: 0.65rem;
  }
  .routine-footer {
    margin: 0;
    justify-content: end;
    border-top: 1px solid #6d704955;
    padding-top: 12px;
  }
  .routine-form details {
    margin: 0;
    align-self: start;
    border-top: 1px solid #6d704955;
    padding-top: 10px;
    font-size: 0.8rem;
    color: #b7c3ab;
  }
  .routine-form summary {
    cursor: pointer;
    color: #e2ca92;
  }
  .routine-form details label {
    margin-top: 8px;
  }
  @media (max-width: 1000px) {
    .routine-workspace.editing {
      grid-template-columns: 1fr;
    }
    .routine-list {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .week-grid {
      gap: 4px;
    }
    .week-day {
      padding: 12px 7px;
    }
    .daily-agenda {
      grid-template-columns: 150px minmax(0, 1fr);
      gap: 12px;
    }
    .recovery-filters {
      grid-template-columns: 2fr 1fr;
    }
    .recovery-totals > div {
      gap: 5px;
      padding: 10px;
    }
  }
  @media (max-width: 700px) {
    .daily-agenda {
      grid-template-columns: 1fr;
    }
    .agenda-summary {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 10px;
    }
    .agenda-summary small {
      display: none;
    }
    .agenda-summary h2 {
      font-size: 1.2rem;
    }
    .timeline {
      padding-left: 14px;
    }
    .timeline-entry::before {
      left: -19px;
    }
    .week-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .week-day {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 110px;
      gap: 8px 18px;
      padding: 14px;
    }
    .week-date {
      min-height: 0;
      text-align: left;
      align-self: center;
    }
    .week-activities {
      grid-column: 1/-1;
      gap: 6px;
      margin: 0;
    }
    .day-link {
      grid-column: 1/-1;
    }
    .view-switch {
      margin-left: 0;
    }
    .date-navigation {
      gap: 7px;
    }
    .date-navigation label {
      font-size: 0.65rem;
      gap: 4px;
    }
    .date-navigation input {
      max-width: 140px;
    }
    .recovery-filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .recovery-filters label:first-child {
      grid-column: 1/-1;
    }
    .recovery-totals {
      gap: 7px;
    }
    .recovery-totals > div {
      flex-direction: column;
      text-align: center;
    }
    .routine-fields {
      grid-template-columns: 1fr;
    }
    .routine-form {
      padding: 14px;
    }
    .routine-sequence li {
      flex-wrap: wrap;
    }
    .sequence-title {
      flex-basis: calc(100% - 74px);
    }
    .sequence-actions {
      margin-left: auto;
    }
    .routine-list {
      grid-template-columns: 1fr;
    }
    .routine-workspace.editing .routine-form {
      grid-row: 1;
    }
    .weekday-picker {
      gap: 4px;
    }
    .weekday-picker label {
      padding: 6px;
    }
    .routine-actions {
      gap: 8px;
    }
  }
  .sequence-title small {
    display: block;
    color: #adbfaf;
    font-size: 0.75rem;
    margin-top: 3px;
  }

  .saved-session-card {
    padding: 16px;
  }
  .saved-session-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .saved-session-heading h3 {
    font: 500 1.55rem var(--lmu-display);
    color: #e9d29d;
    margin: 0 0 6px;
  }
  .saved-session-heading p {
    color: #acbfae;
    font-size: 0.78rem;
    margin: 0;
  }
  .saved-session-heading p span {
    color: #d4bc82;
  }
  .saved-session-heading :global(.lmu-button) {
    font-size: 0.8rem;
    padding: 8px 12px;
    min-height: 40px;
  }
  .saved-session-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
  }
  .saved-session-progress progress {
    height: 8px;
    accent-color: #dfb658;
    width: auto;
    flex: 1;
    min-width: 0;
  }
  .saved-session-progress strong {
    font-size: 0.78rem;
    color: #dec992;
    font-weight: 500;
    white-space: nowrap;
  }
  .saved-session-progress strong span {
    color: #a8bda9;
  }
  @media (max-width: 600px) {
    .saved-session-card {
      padding: 12px;
    }
    .saved-session-heading {
      flex-wrap: wrap;
    }
    .saved-session-heading h3 {
      font-size: 1.4rem;
    }
  }
</style>
