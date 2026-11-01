<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { goto } from '$app/navigation';
  import { db } from '$services/db';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import {
    plannedOccurrences,
    ensureOccurrence,
  } from '$services/occurrenceService';
  import { newSavedSession, saveSession } from '$services/savedSessionService';
  import { saveRoutine, setRoutineStatus } from '$services/routineService';
  import { WEEKDAYS } from '$services/recurrence';
  import { fraction } from '$services/productivityRules';
  import {
    freeSlot,
    occurrenceSituation,
    recommendations,
  } from '$services/productivityInsights';
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
    week = $state(true),
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
    description = $state('');
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
  let timer: ReturnType<typeof setInterval>;
  let now = $state(new Date());
  $effect(() => {
    const from = view === 'recovery' ? day : day;
    const to = view === 'agenda' && week ? addCalendarDays(day, 6) : day;
    const sub = liveQuery(async () => ({
      rows: await plannedOccurrences(addCalendarDays(from, -7), to),
      routines: await db.routines.toArray(),
      tasks: await db.tasks.toArray(),
      sessions: await db.savedMissionSessions.toArray(),
    })).subscribe({
      next: (data) => {
        contextRows = data.rows;
        rows = data.rows.filter((row) => row.plannedDate >= from);
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
      addCalendarDays(day, index),
    ),
  );
  const tips = $derived(
    recommendations(rows, now).filter((tip) => !dismiss.includes(tip.id)),
  );
  const labels: Record<string, string> = {
    planned: 'Planejada',
    active: 'Em andamento',
    paused: 'Pausada',
    partial: 'Parcial',
    completed: 'Concluída',
    late: 'Início atrasado',
    expired: 'Prazo vencido',
    discarded: 'Descartada',
    excused: 'Pausa justificada',
  };
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
    days = [...(row?.days ?? [1, 2, 3, 4, 5])];
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
      await saveSession(newSavedSession(name, ids));
      await goto('/sessoes');
    });
  }
  async function saveRoutineForm(event: SubmitEvent) {
    event.preventDefault();
    await run(async () => {
      await saveRoutine({
        id: routineId,
        name: routineName,
        description,
        days,
        startDate: start,
        entries,
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
  <p role="status">{notice}</p>
  {#if view === 'agenda' || view === 'recovery'}
    <div class="workspace-controls">
      <label
        >{view === 'recovery'
          ? 'Consultar ocorrências de'
          : 'Primeiro dia'}<input type="date" bind:value={day} /></label
      >{#if view === 'agenda'}<Button
          variant="secondary"
          aria-pressed={!week}
          onclick={() => (week = false)}>Dia</Button
        ><Button
          variant="secondary"
          aria-pressed={week}
          onclick={() => (week = true)}>Semana</Button
        >{/if}<Button variant="quiet" onclick={() => (day = dateKey())}
        >Hoje</Button
      >
    </div>
    {#if view === 'agenda' && tips.length}<aside
        class="rpg-frame suggestions"
        aria-label="Sugestões locais"
      >
        {#each tips as tip (tip.id)}<div>
            <strong>{tip.title}</strong>
            <p>{tip.reason}</p>
            <Button
              variant="quiet"
              onclick={() => (dismiss = [...dismiss, tip.id])}
              >Dispensar sugestão</Button
            >
          </div>{/each}
      </aside>{/if}
    {#if selected.length}<Button
        disabled={busy}
        onclick={() =>
          startSession(rows.filter((row) => selected.includes(row.id)))}
        >Executar seleção como sessão ({selected.length})</Button
      >{/if}
    <div class="calendar" class:daily={!week || view === 'recovery'}>
      {#each view === 'recovery' ? [day] : agendaDays as date (date)}
        <section class="calendar-day rpg-frame">
          <h2>
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
            })}
          </h2>
          {#each ['timed', 'flexible'] as group (group)}
            <h3>{group === 'timed' ? 'Com horário' : 'Horário flexível'}</h3>
            {#each rows.filter((row) => row.plannedDate === date && (group === 'timed' ? !!row.plannedTime : !row.plannedTime) && (view === 'recovery' || !['discarded', 'excused'].includes(row.status))) as row (row.id)}
              <article
                class="agenda-item"
                class:completed={row.status === 'completed'}
              >
                <label class="select-occurrence"
                  ><input
                    type="checkbox"
                    aria-label={'Selecionar ' + row.title}
                    checked={selected.includes(row.id)}
                    onchange={(e) =>
                      (selected = e.currentTarget.checked
                        ? [...selected, row.id]
                        : selected.filter((id) => id !== row.id))}
                  /><span>{row.plannedTime ?? 'Flexível'}</span></label
                >
                <strong>{row.title}</strong><span class="state"
                  >{labels[occurrenceSituation(row, now)]}</span
                >
                {#if row.originDate !== row.plannedDate}<small
                    >Origem: {row.originDate}</small
                  >{/if}
                {#if row.value > 0}<progress
                    max="100"
                    value={fraction(row) * 100}
                    aria-label={'Progresso de ' + row.title}
                  ></progress>{/if}
                <Button disabled={busy} onclick={() => open(row)}
                  >{row.status === 'completed'
                    ? 'Ver ou corrigir'
                    : view === 'recovery'
                      ? 'Recuperar ocorrência'
                      : 'Executar agora'}</Button
                >
                <div class="item-actions">
                  <Button variant="quiet" onclick={() => open(row)}
                    >Reagendar</Button
                  ><Button
                    variant="quiet"
                    onclick={() => {
                      editTask = tasks.find((task) => task.id === row.taskId);
                      editOpen = true;
                    }}>Editar futuras</Button
                  >
                </div>
              </article>
            {/each}
          {/each}
          {#if !rows.some((row) => row.plannedDate === date)}<p
              class="lmu-muted"
            >
              Sem compromissos neste dia.
            </p>{/if}
        </section>
      {/each}
    </div>
    {#if view === 'agenda'}<details>
        <summary>Encontrar um intervalo livre</summary>
        <p class="lmu-hint">
          Janela inicial: 08h–22h. Atividades sem estimativa reservam 30 minutos
          somente nesta sugestão.
        </p>
        {#each rows
          .filter((row) => row.plannedDate >= dateKey() && !row.plannedTime && !['completed', 'discarded', 'excused'].includes(row.status))
          .slice(0, 3) as row (row.id)}<p>
            {row.title}: {freeSlot(
              contextRows,
              row.plannedDate,
              row.estimatedMinutes ?? 30,
              earliestSlot(row.plannedDate),
            ) ?? 'sem intervalo encontrado'} · sugestão para sua revisão.
          </p>{/each}
      </details>{/if}
    {#if view === 'recovery'}<details>
        <summary>Reconstruir uma atividade antiga</summary>
        <p>
          Use apenas para atividade realizada ou planejada cuja ocorrência não
          foi preservada. O registro será identificado como reconstrução;
          recompensas legadas não serão recalculadas.
        </p>
        <label
          >Missão<select bind:value={reconstructTask}
            ><option value="">Escolher missão</option
            >{#each tasks.filter((task) => !task.archived && !task.reviewEnabled) as task (task.id)}<option
                value={String(task.id)}>{task.title}</option
              >{/each}</select
          ></label
        ><label
          >Data de origem<input
            type="date"
            bind:value={reconstructDate}
          /></label
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
      </details>{/if}
  {:else if view === 'routines'}
    <div class="workspace-controls">
      <h2>Suas rotinas</h2>
      <Button onclick={() => editRoutine()}>Nova rotina</Button>
    </div>
    {#if editing}<form
        class="rpg-frame routine-form"
        onsubmit={saveRoutineForm}
      >
        <h3>{routineRevision ? 'Editar rotina' : 'Montar rotina'}</h3>
        <label
          >Nome da rotina<input
            maxlength="160"
            bind:value={routineName}
            required
          /></label
        ><label>Descrição<textarea bind:value={description}></textarea></label
        ><label>Início da rotina<input type="date" bind:value={start} /></label>
        <fieldset>
          <legend>Dias de execução</legend
          >{#each WEEKDAYS as weekday (weekday.value)}<label class="check"
              ><input
                type="checkbox"
                checked={days.includes(weekday.value)}
                onchange={(e) =>
                  (days = e.currentTarget.checked
                    ? [...days, weekday.value]
                    : days.filter((day) => day !== weekday.value))}
              />{weekday.short}</label
            >{/each}
        </fieldset>
        <fieldset>
          <legend>Missões e horários</legend
          >{#each tasks.filter((task) => !task.archived && !task.reviewEnabled && (!task.routineId || task.routineId === routineId)) as task (task.id)}<label
              class="check"
              ><input
                type="checkbox"
                checked={entries.some((entry) => entry.taskId === task.id)}
                onchange={(e) =>
                  (entries = e.currentTarget.checked
                    ? [
                        ...entries,
                        { taskId: task.id!, time: task.plannedTime ?? null },
                      ]
                    : entries.filter((entry) => entry.taskId !== task.id))}
              />{task.title}</label
            >{/each}
        </fieldset>
        <ol>
          {#each entries as entry, index (index)}<li>
              <span
                >{tasks.find((task) => task.id === entry.taskId)?.title}</span
              ><input
                type="time"
                aria-label={'Horário de ' +
                  tasks.find((task) => task.id === entry.taskId)?.title}
                value={entry.time ?? ''}
                onchange={(e) =>
                  (entries = entries.map((item, i) =>
                    i === index
                      ? { ...item, time: e.currentTarget.value || null }
                      : item,
                  ))}
              /><Button
                variant="quiet"
                disabled={index === 0}
                onclick={() => move(index, -1)}>↑</Button
              ><Button
                variant="quiet"
                disabled={index === entries.length - 1}
                onclick={() => move(index, 1)}>↓</Button
              >
            </li>{/each}
        </ol>
        <details>
          <summary>Pausas justificadas</summary>
          <p>
            Padrão provisório: 2 pausas por período de 30 dias. Uma pausa não
            conta como execução nem concede recursos.
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
        <div class="journey-actions">
          <Button type="submit" disabled={busy}>Salvar rotina</Button><Button
            variant="quiet"
            onclick={() => (editing = false)}>Cancelar</Button
          >
        </div>
      </form>{/if}
    <div class="routine-list">
      {#each routines as routine (routine.id)}<article
          class="rpg-frame routine-card"
        >
          <h3>{routine.name}</h3>
          <p>{routine.description}</p>
          <p>
            {routine.entries.length} atividades · {routine.status === 'active'
              ? 'Ativa'
              : routine.status === 'paused'
                ? 'Pausada'
                : 'Arquivada'}
          </p>
          <Button
            disabled={busy}
            onclick={async () => {
              const candidates = await plannedOccurrences(dateKey(), dateKey());
              await startSession(
                candidates.filter((row) => row.routineId === routine.id),
                routine.name,
              );
            }}>Executar rotina</Button
          ><Button variant="secondary" onclick={() => editRoutine(routine)}
            >Editar rotina</Button
          ><Button
            variant="quiet"
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
          ><Button
            variant="quiet"
            onclick={() =>
              run(
                () =>
                  setRoutineStatus(routine.id, 'archived', routine.revision),
                'Rotina arquivada; histórico preservado.',
              )}>Arquivar</Button
          >
        </article>{/each}{#if !routines.length}<p>
          Crie uma rotina para reunir suas atividades e horários.
        </p>{/if}
    </div>
  {:else}
    <h2>Sessões salvas</h2>
    <p>
      Uma sessão pode atravessar dias. O progresso pertence à ocorrência e é
      compartilhado entre sessões.
    </p>
    {#each sessions as session (session.id)}<article
        class="rpg-frame routine-card"
      >
        <h3>{session.name}</h3>
        <p>
          {session.occurrenceIds.length} atividades · {session.status ===
          'active'
            ? 'Em foco'
            : session.status === 'paused'
              ? 'Pausada'
              : 'Encerrada'}
        </p>
        <Button
          disabled={!session.occurrenceIds.length}
          onclick={() =>
            run(async () => {
              await saveSession(
                { ...session, status: 'active' },
                session.revision,
              );
              await goto('/sessoes');
            })}>Retomar sessão</Button
        >
      </article>{/each}
    {#if !sessions.length}<p>
        Selecione atividades na agenda para montar sua primeira sessão.
      </p>{/if}
  {/if}
  <QuickCreate bind:open={editOpen} {snapshot} {editTask} />
</section>

<style>
  .productivity-workspace {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
  }
  .workspace-controls {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    align-items: end;
  }
  .calendar {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.45rem;
  }
  .calendar.daily {
    grid-template-columns: 1fr;
  }
  .calendar-day {
    min-width: 0;
    padding: 0.65rem;
  }
  .calendar-day h2 {
    font-size: 1rem;
    color: #e5c284;
  }
  .calendar-day h3 {
    font-size: 0.75rem;
    color: #aebfae;
    margin: 0.8rem 0;
  }
  .agenda-item {
    display: grid;
    gap: 0.45rem;
    padding: 0.7rem 0.3rem;
    border-top: 1px solid #a27c4345;
    overflow-wrap: anywhere;
  }
  .agenda-item strong {
    font-size: 0.9rem;
    color: #ece2ce;
  }
  .agenda-item.completed {
    opacity: 0.7;
  }
  .select-occurrence {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
  }
  .state,
  small {
    font-size: 0.74rem;
    color: #b9c8ba;
  }
  .item-actions {
    display: flex;
    flex-wrap: wrap;
  }
  .suggestions {
    padding: 1rem;
    display: flex;
    gap: 1rem;
  }
  .suggestions > div {
    flex: 1;
  }
  p {
    color: #bac8b9;
    font-size: 0.9rem;
  }
  label {
    display: grid;
    gap: 0.4rem;
  }
  input,
  textarea,
  select {
    background: #17221f;
    color: #eee4cf;
    border: 1px solid #8d7147;
    border-radius: 0.4rem;
    padding: 0.5rem;
    max-width: 100%;
  }
  .routine-form {
    padding: 1.2rem;
    display: grid;
    gap: 1rem;
  }
  .check {
    display: inline-flex;
    gap: 0.4rem;
    margin: 0.4rem 0.7rem 0.4rem 0;
    align-items: center;
  }
  li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin: 0.5rem 0;
  }
  li span {
    flex: 1;
  }
  .routine-card {
    padding: 1rem;
  }
  .routine-list {
    display: grid;
    gap: 0.8rem;
  }
  progress {
    width: 100%;
    accent-color: #cda960;
  }
  @media (max-width: 900px) {
    .calendar {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .suggestions {
      display: grid;
    }
  }
  @media (max-width: 480px) {
    .calendar {
      grid-template-columns: 1fr;
    }
  }
</style>
