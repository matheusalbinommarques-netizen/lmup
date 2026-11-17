<script lang="ts">
  /**
   * Uma tela de execução (lote 3, design "LMUP Fluxos" E1–E4). Serves a
   * mission on its own, the queue of the Dia ("Iniciar dia / Continuar o dia")
   * and a block (consecutive items of a routine, "Iniciar bloco"). The queue
   * is always a slice of the Dia: moving here moves the Dia.
   */
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { beforeNavigate, goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import { completeTask, undoTask } from '$services/taskService';
  import { celebrateReward } from '$services/rewardPresentation';
  import {
    ensureOccurrence,
    recordProgress,
  } from '$services/occurrenceService';
  import { progressTarget, fraction } from '$services/productivityRules';
  import {
    beginTask,
    isAvailable,
    saveTaskNotes,
    setTaskStep,
    taskSteps,
  } from '$services/journeyService';
  import {
    clock,
    dayTimeline,
    DEFAULT_MINUTES,
    moveId,
    saveDayOrder,
  } from '$services/dayOrder';
  import { inFocus, staleDays } from '$services/dayRow';
  import { db, type ActivityEvent } from '$services/db';
  import type { Occurrence } from '$services/productivityTypes';
  import Button from '$lib/ui/Button.svelte';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import {
    dayRows,
    executionHref,
    executionQueue,
    isPending,
    nextInQueue,
    type QueueKind,
  } from './dayQueue';
  import {
    elapsedMs,
    formatElapsed,
    measurement,
    pauseTimer,
    readTimer,
    resumeTimer,
    saveTimer,
    startTimer,
    type TimerState,
  } from './executionTimer';

  let {
    id,
    kind,
    ids = [],
  }: { id: string; kind?: QueueKind; ids?: string[] } = $props();

  let data = $state.raw<JourneySnapshot>();
  let today = $state(dateKey());
  let now = $state(new Date());
  let error = $state(''),
    notice = $state('');
  let busy = $state(false);
  let timer = $state<TimerState | null>(null);
  let selected = $state<number[]>([]),
    amount = $state<number | undefined>();
  let done = $state<{ event: ActivityEvent | null; title: string }>();
  let notes = $state(''),
    notesRevision = 0,
    notesDirty = $state(false),
    notesSaving = $state(false);
  let ensured = '';
  let begun = '';
  let syncedRow = '';
  // The queue starts open on desktop and folded on mobile (design E3).
  let queueOpen = $state(true);

  const projected = $derived(
    data ? dayRows(data, today, now) : ([] as Occurrence[]),
  );
  // Read by id as well: some stored rows (legacy missions) are not part of
  // the planning projection.
  let direct = $state<Occurrence>();
  const stored = $derived(
    data?.occurrences.find((row) => row.id === id) ?? direct,
  );
  const row = $derived(
    stored ??
      projected.find((item) => item.id === id) ??
      data?.plannedToday.find((item) => item.id === id),
  );
  const task = $derived(
    row ? data?.tasks.find((item) => item.id === row.taskId) : undefined,
  );
  const legacy = $derived(!!task && !task.productivityVersion);
  const method = $derived(
    row?.tracking?.method ?? task?.tracking?.method ?? 'direct',
  );
  // A recurring row of a past day is recovered on its own occurrence.
  const oldDay = $derived(
    !!task?.recurrence && !!row && row.originDate !== today,
  );
  // Steps of today's mission are saved on each check (as before lote 3);
  // only a past day's row keeps them on screen until "Registrar parte".
  const taskStepMode = $derived(
    legacy || (['steps', 'direct'].includes(method) && !oldDay),
  );
  const steps = $derived(
    taskStepMode && task
      ? taskSteps(task).map((step) => ({
          index: step.index,
          label: step.label,
        }))
      : (row?.steps ?? [])
          .map((label, index) => ({ index, label: label.trim() }))
          .filter((step) => step.label),
  );
  const checked = $derived(
    taskStepMode
      ? task?.recurrence && task.occurrenceSession !== row?.originDate
        ? []
        : (task?.completedSubtasks ?? [])
      : selected,
  );
  // Auxiliary steps of a direct mission never block "Concluir".
  const stepsReady = $derived(
    !(legacy || method === 'steps') ||
      steps.every((step) => checked.includes(step.index)),
  );
  const measurable = $derived(
    !legacy && ['quantity', 'time', 'percentage'].includes(method),
  );
  const canPart = $derived(!legacy && (measurable || method === 'steps'));
  const target = $derived(row ? progressTarget(row) : 1);
  const closed = $derived(
    !!row && ['completed', 'discarded', 'excused'].includes(row.status),
  );
  const unavailable = $derived(
    !!task &&
      (task.archived ||
        task.reviewEnabled ||
        !!row?.skipped ||
        !!row?.supersededBy ||
        row!.plannedDate > today),
  );

  // Queue of this screen: a slice of the Dia, in the Dia's order.
  const queue = $derived(
    kind && row ? executionQueue(projected, kind, id, ids) : [],
  );
  const position = $derived(queue.findIndex((item) => item.id === id));
  // Without a queue (mission on its own, design E2) the next row of the Dia
  // is only shown as "Depois"; nothing starts by itself.
  const next = $derived(
    queue.length
      ? nextInQueue(queue, id)
      : projected.some((item) => item.id === id)
        ? nextInQueue(projected, id)
        : undefined,
  );
  const timeline = $derived(dayTimeline(projected, now));
  const slots = $derived(new Map(timeline.slots.map((s) => [s.id, s])));
  const routine = $derived(
    row?.routineId
      ? data?.routines.find((item) => item.id === row.routineId)
      : undefined,
  );
  const blockRange = $derived.by(() => {
    if (kind !== 'bloco' || !queue.length) return '';
    const first = slots.get(queue[0].id);
    const last = queue.at(-1)!;
    const lastSlot = slots.get(last.id);
    if (!first?.time || !lastSlot?.time) return '';
    const [h, m] = lastSlot.time.split(':').map(Number);
    const end = clock(h * 60 + m + (last.estimatedMinutes || DEFAULT_MINUTES));
    return `${first.kind === 'anchor' ? '◆' : '≈'} ${first.time}–${end}`;
  });
  const afterBlock = $derived.by(() => {
    if (kind !== 'bloco' || !queue.length) return undefined;
    const index = projected.findIndex((item) => item.id === queue.at(-1)!.id);
    return projected.slice(index + 1).find(isPending);
  });

  function timeText(item: Occurrence | undefined) {
    if (!item) return '';
    const slot = slots.get(item.id);
    if (!slot?.time) return '';
    return slot.kind === 'anchor' ? `◆ ${slot.time}` : `≈ ${slot.time}`;
  }
  const support = $derived.by(() => {
    if (!row) return [] as string[];
    const area = data?.areas.find((item) => item.id === row.areaId)?.nome;
    return [
      timeText(row),
      row.estimatedMinutes ? `${row.estimatedMinutes} min` : '15 min*',
      area ?? 'Geral',
    ].filter(Boolean);
  });
  const stale = $derived(
    task && data
      ? staleDays(task, today, data.occurrences, data.executionRecords)
      : null,
  );
  const important = $derived((row?.importance ?? task?.importance) === 'high');
  const focus = $derived(
    !!row && !!data && inFocus(row.areaId, data.areas, data.profile),
  );
  // A conclusion that also closed a project (bonus event right after it).
  const projectDone = $derived.by(() => {
    const event = done?.event;
    if (!event || !data) return undefined;
    const bonus = data.events.find(
      (item) =>
        item.kind === 'project' &&
        item.projectId === event.projectId &&
        item.sequence === event.sequence + 1 &&
        !item.reversedAt,
    );
    return bonus
      ? (data.projects.find((item) => item.id === bonus.projectId)?.name ??
          'Seu projeto')
      : undefined;
  });
  let notesError = $state(false);
  const elapsed = $derived(timer ? elapsedMs(timer, now) : 0);
  const estimateMs = $derived((row?.estimatedMinutes || 0) * 60000);

  onMount(() => {
    timer = readTimer(id);
    const byId = liveQuery(() => db.occurrences.get(id)).subscribe({
      next: (value) => (direct = value),
    });
    queueOpen = window.matchMedia('(min-width: 801px)').matches;
    const subscription = journeyQuery().subscribe({
      next: (value) => (data = value),
      error: () => (error = 'Não foi possível abrir a missão.'),
    });
    const tick = setInterval(() => {
      now = new Date();
      today = dateKey();
    }, 1000);
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        void conclude();
      }
    };
    window.addEventListener('keydown', keys);
    return () => {
      subscription.unsubscribe();
      byId.unsubscribe();
      clearInterval(tick);
      window.removeEventListener('keydown', keys);
    };
  });

  beforeNavigate(({ cancel }) => {
    if (notesSaving || busy) {
      cancel();
      error = 'Aguarde salvar antes de sair.';
    }
  });

  // A row that only exists as a projection is stored on open (as before).
  $effect(() => {
    if (!data || stored || !row || ensured === id) return;
    // Legacy missions are executed on the projection (no occurrence).
    if (!task?.productivityVersion) return;
    ensured = id;
    void ensureOccurrence(row.taskId, row.originDate, row.reconstructed).catch(
      (cause) =>
        (error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível abrir a missão.'),
    );
  });
  // Opening the screen is "Iniciar": the mission becomes in progress.
  $effect(() => {
    if (!task || begun === id || closed || unavailable) return;
    if (!isAvailable(task) || task.executionState === 'active') return;
    begun = id;
    void beginTask(task.id!).catch(() => undefined);
  });
  $effect(() => {
    if (!row || !task) return;
    const key = `${row.id}:${row.revision}`;
    if (syncedRow === key) return;
    syncedRow = key;
    selected = [...row.checkedSteps];
    amount = row.value || undefined;
    if (!notesDirty) {
      notes = task.executionNotes ?? '';
      notesRevision = task.notesRevision ?? 0;
    }
  });

  function setTimer(next: TimerState | null) {
    timer = next;
    saveTimer(id, next);
  }

  let notesTimer: ReturnType<typeof setTimeout> | undefined;
  let notesQueue = Promise.resolve();
  function editNotes(value: string) {
    notes = value;
    notesDirty = true;
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => void flushNotes(), 600);
  }
  function flushNotes(overwrite = false) {
    clearTimeout(notesTimer);
    if (!notesDirty || !task) return notesQueue;
    const value = notes;
    notesSaving = true;
    notesQueue = notesQueue.then(async () => {
      try {
        notesRevision = await saveTaskNotes(
          task!.id!,
          value,
          notesRevision,
          overwrite,
        );
        if (notes === value) notesDirty = false;
        notesError = false;
      } catch (cause) {
        notesError = true;
        error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível salvar a nota. Seu texto continua aqui.';
      } finally {
        notesSaving = false;
      }
    });
    return notesQueue;
  }

  async function run(work: () => Promise<void>) {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      await work();
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Seus dados foram preservados.';
    } finally {
      busy = false;
    }
  }

  async function conclude() {
    if (!row || !task || closed || unavailable || done || !stepsReady) return;
    await run(async () => {
      await flushNotes();
      if (notesDirty)
        throw new Error(
          'Salve sua nota antes de concluir. Seu texto continua aqui.',
        );
      const measured = measurement(timer, new Date());
      const timed = {
        minutes: measured.minutes,
        ...(measured.startedAt ? { startedAt: measured.startedAt } : {}),
      };
      let event: ActivityEvent | null;
      if (legacy || (['direct', 'steps'].includes(method) && !oldDay))
        event = await completeTask(task.id!, {
          occurrenceDate: task.recurrence ? dateKey() : undefined,
          ...(legacy ? {} : timed),
        });
      else {
        const current = await storedRow(row);
        event = await recordProgress({
          requestId: `complete:${current.id}:${current.revision}`,
          occurrenceId: current.id,
          expectedRevision: current.revision,
          value: progressTarget(current),
          checkedSteps:
            method === 'steps'
              ? current.steps.map((_, index) => index)
              : current.checkedSteps,
          executedAt: new Date().toISOString(),
          ...timed,
        });
      }
      setTimer(null);
      done = { event, title: row.title };
    });
  }

  async function storedRow(item: Occurrence) {
    return (
      (await db.occurrences.get(item.id)) ??
      (await ensureOccurrence(item.taskId, item.originDate, item.reconstructed))
    );
  }

  async function registerPart() {
    if (!row || !canPart || closed || unavailable) return;
    await run(async () => {
      const current = await storedRow(row);
      const value =
        method === 'steps' ? checked.length : Number(amount ?? current.value);
      if (!Number.isFinite(value) || value < 0)
        throw new Error('Informe quanto você fez até agora.');
      const measured = measurement(timer, new Date());
      if (value <= current.value && !measured.minutes)
        throw new Error(
          method === 'steps'
            ? 'Marque um passo novo para registrar uma parte.'
            : 'Informe um total maior que o já registrado.',
        );
      const event = await recordProgress({
        requestId: crypto.randomUUID(),
        occurrenceId: current.id,
        expectedRevision: current.revision,
        value: Math.max(value, current.value),
        checkedSteps: method === 'steps' ? [...checked] : current.checkedSteps,
        executedAt: new Date().toISOString(),
        minutes: measured.minutes,
        ...(measured.startedAt ? { startedAt: measured.startedAt } : {}),
      });
      setTimer(null);
      if (value >= progressTarget(current))
        done = { event, title: current.title };
      else
        notice = `Parte registrada: ${value} de ${progressTarget(current)}${method === 'time' ? ' min' : ''}.`;
    });
  }

  async function undo() {
    if (!done?.event || !row) return;
    const event = done.event;
    await run(async () => {
      await undoTask(row.taskId, event.id);
      done = undefined;
      notice =
        'Conclusão desfeita. O que já foi ganho vira débito, compensado pelos próximos ganhos.';
    });
  }

  async function toggleStep(index: number, value: boolean) {
    if (taskStepMode) {
      await run(() => setTaskStep(task!.id!, index, value));
      return;
    }
    selected = value
      ? [...new Set([...selected, index])].sort((a, b) => a - b)
      : selected.filter((item) => item !== index);
  }

  function skip() {
    if (!next) return;
    if (timer?.runningSince) setTimer(pauseTimer(timer, new Date()));
    void goto(executionHref(next.id, kind, ids));
  }

  async function moveInQueue(itemId: string, delta: number) {
    const ids = queue.map((item) => item.id);
    const neighbour = ids[ids.indexOf(itemId) + delta];
    if (!neighbour) return;
    const all = projected.map((item) => item.id);
    const order = moveId(
      all,
      itemId,
      all.indexOf(neighbour) - all.indexOf(itemId),
    );
    const byId = new Map(projected.map((item) => [item.id, item]));
    await run(() =>
      saveDayOrder(
        today,
        order.map((value) => byId.get(value)!),
      ),
    );
  }

  const contextLabel = $derived(
    kind === 'bloco' && queue.length
      ? 'Bloco'
      : kind === 'dia' && queue.length
        ? 'Dia'
        : kind === 'selecao' && queue.length
          ? 'Seleção'
          : task?.recurrence
            ? 'Rotina'
            : 'Missão avulsa',
  );
  const queueTitle = $derived(
    kind === 'bloco'
      ? 'Fila deste bloco'
      : kind === 'selecao'
        ? 'Fila da seleção'
        : 'Fila do dia',
  );
</script>

<svelte:head
  ><title>{row?.title ?? 'Execução'} · Level Me Up</title></svelte:head
>

<div class="execution" class:with-queue={queue.length > 1}>
  <header class="bar">
    <a class="back" href="/">← Dia</a>
    <span class="context"
      >{contextLabel}{#if kind === 'bloco' && routine && queue.length}&nbsp;<strong
          >{routine.name}</strong
        >{/if}{#if queue.length > 1 && position >= 0}{` · ${position + 1} de ${queue.length}`}{/if}{#if blockRange}{` · ${blockRange}`}{/if}</span
    >
    <span class="spacer"></span>
    {#if kind === 'bloco' && queue.length}<a
        class="quiet-link end-block"
        href="/">Encerrar bloco</a
      >{/if}
  </header>

  <div class="layout">
    <main class="focus">
      {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
      <p role="status" class="status-line">{notice}</p>

      {#if !data}<p role="status">Abrindo a missão…</p>
      {:else if !row || !task}
        <h1>Missão não encontrada</h1>
        <p class="muted">
          Ela pode ter sido removida do Dia ou arquivada. Nada foi alterado.
        </p>
        <a class="lmu-button lmu-button--secondary" href="/">Voltar ao Dia</a>
      {:else if done}
        <div class="done-banner" role="status">
          <span class="tick" aria-hidden="true">✓</span>
          <span class="grow"
            >{done.title} concluída.{#if done.event?.reward?.xp}<span
                data-game="xp">{` +${done.event.reward.xp} XP`}</span
              >{/if}{#if done.event?.reward?.gold}<span data-game="loot"
                >{` · +${done.event.reward.gold} Ouro`}</span
              >{/if}</span
          >
          {#if projectDone}<strong class="project-done"
              >Projeto concluído: {projectDone}</strong
            >{/if}
          {#if done.event}<a
              data-game="xp"
              href={`/missao/${row.taskId}?evento=${encodeURIComponent(done.event.id)}`}
              onclick={() => celebrateReward(done!.event!.id)}>Por quê?</a
            >{/if}
          {#if done.event}<button
              type="button"
              class="link-button"
              disabled={busy}
              onclick={undo}>Desfazer</button
            >{/if}
        </div>
        {#if next}
          <p class="eyebrow">
            {[
              'A seguir',
              timeText(next),
              next.estimatedMinutes
                ? `${next.estimatedMinutes} min`
                : '15 min*',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h1>{next.title}</h1>
          <p class="muted">
            Nada começa sozinho. Inicie quando quiser, ou volte ao Dia.
          </p>
          <div class="actions">
            <a
              class="lmu-button lmu-button--primary big"
              href={executionHref(next.id, kind, ids)}>Iniciar</a
            >
            <a class="quiet-link big" href="/">Voltar ao Dia</a>
          </div>
        {:else}
          <h1>
            {kind === 'bloco'
              ? 'Bloco concluído'
              : kind === 'dia'
                ? 'Fila do dia concluída'
                : kind === 'selecao'
                  ? 'Seleção concluída'
                  : 'Concluída'}
          </h1>
          <p class="muted">Seu progresso está registrado.</p>
          <div class="actions">
            <a class="lmu-button lmu-button--primary big" href="/"
              >Voltar ao Dia</a
            >
          </div>
        {/if}
      {:else}
        <div class="heading">
          <span class="meta">
            {#each support as part, index (index)}<span>{part}</span>{/each}
            {#if important}<span class="badge badge-important"
                >Importância alta</span
              >{/if}
            {#if stale}<span class="badge badge-stale"
                >Parada há {stale} dias</span
              >{/if}
            {#if focus}<span class="badge badge-focus">Em foco</span>{/if}
          </span>
          <h1>{row.title}</h1>
        </div>

        {#if closed}
          <p class="banner">
            {row.status === 'completed'
              ? 'Esta missão já está concluída. A recompensa foi preservada.'
              : 'Esta missão está fora do planejamento ativo.'}
          </p>
          <div class="actions">
            {#if next}<a
                class="lmu-button lmu-button--primary big"
                href={executionHref(next.id, kind, ids)}>Iniciar a próxima</a
              >{/if}
            <a class="quiet-link big" href="/">Voltar ao Dia</a>
          </div>
          <a class="quiet-link" href={'/missao/' + row.taskId}
            >Ver recibo ou desfazer na página da missão →</a
          >
        {:else if unavailable}
          <p class="banner">
            {task.archived
              ? 'Missão arquivada. A execução está desativada; o histórico foi preservado.'
              : row.plannedDate > today
                ? 'Esta missão está planejada para uma data futura.'
                : 'Esta missão não está disponível para execução agora.'}
          </p>
          <a class="quiet-link" href={'/missao/' + row.taskId}>Abrir a missão</a
          >
        {:else}
          {#if timer}
            <section class="timer on" aria-label="Cronômetro">
              <span class="clock" aria-live="off">{formatElapsed(elapsed)}</span
              >
              <div class="timer-copy">
                <span class="muted"
                  >{estimateMs
                    ? `de ${formatElapsed(estimateMs)} estimados · `
                    : ''}cronômetro opcional{timer.runningSince
                    ? ''
                    : ' · pausado'}</span
                >
                {#if estimateMs}<span class="track" aria-hidden="true"
                    ><span
                      style:width={`${Math.min(100, Math.round((elapsed / estimateMs) * 100))}%`}
                    ></span></span
                  >{/if}
              </div>
              <div class="timer-actions">
                {#if timer.runningSince}<Button
                    variant="secondary"
                    onclick={() => setTimer(pauseTimer(timer!, new Date()))}
                    >Pausar</Button
                  >{:else}<Button
                    variant="secondary"
                    onclick={() => setTimer(resumeTimer(timer!, new Date()))}
                    >Retomar</Button
                  >{/if}
                <Button variant="quiet" onclick={() => setTimer(null)}
                  >Desligar</Button
                >
              </div>
            </section>
          {:else}
            <section class="timer off" aria-label="Cronômetro">
              <span class="muted grow"
                >Cronômetro desligado. Ligue se quiser medir.</span
              >
              <Button
                variant="secondary"
                onclick={() => setTimer(startTimer(new Date()))}
                >Ligar cronômetro</Button
              >
            </section>
          {/if}

          {#if steps.length}
            <section class="steps" aria-labelledby="steps-title">
              <h2 id="steps-title">Passos</h2>
              {#each steps as step (step.index)}<label class="step">
                  <input
                    type="checkbox"
                    checked={checked.includes(step.index)}
                    disabled={busy}
                    onchange={(event) =>
                      toggleStep(step.index, event.currentTarget.checked)}
                  /><span class:struck={checked.includes(step.index)}
                    >{step.label}</span
                  >
                </label>{/each}
            </section>
          {:else if measurable}
            <label class="amount"
              >{method === 'time'
                ? 'Minutos feitos até agora'
                : method === 'quantity'
                  ? `Total feito até agora (${row.tracking?.unit ?? 'unidades'})`
                  : 'Porcentagem feita até agora'}
              <input type="number" min="0" step="any" bind:value={amount} />
              <small class="muted"
                >Meta: {target}{method === 'time' ? ' min' : ''} · {Math.round(
                  fraction(row) * 100,
                )}% registrado</small
              >
            </label>
          {/if}

          <div class="notes">
            <label for="execution-note">Nota (opcional)</label>
            <textarea
              id="execution-note"
              rows="3"
              maxlength="20000"
              value={notes}
              oninput={(event) => editNotes(event.currentTarget.value)}
              onblur={() => void flushNotes()}
            ></textarea>
            <small class="muted" aria-live="polite"
              >{notesError
                ? 'Nota ainda não salva'
                : notesSaving
                  ? 'Salvando nota…'
                  : notesDirty
                    ? 'Há alterações para salvar'
                    : notes
                      ? 'Tudo salvo neste navegador'
                      : ''}</small
            >
            {#if notesError}<Button
                variant="secondary"
                disabled={notesSaving}
                onclick={() => void flushNotes(true)}
                >Tentar salvar a nota de novo</Button
              >{/if}
          </div>

          <div class="actions action-bar">
            {#if next}<p class="next-hint" class:inline={!queue.length}>
                {queue.length ? 'Próxima' : 'Depois'}: {timeText(next)}
                {next.title}
              </p>{/if}
            <Button
              class="big conclude"
              disabled={busy || !stepsReady || notesSaving}
              onclick={conclude}>Concluir</Button
            >
            {#if canPart}<Button
                class="big desktop-only"
                variant="secondary"
                disabled={busy}
                onclick={registerPart}>Registrar parte</Button
              >{/if}
            {#if next && queue.length}<Button
                class="big desktop-only"
                variant="quiet"
                disabled={busy}
                onclick={skip}>Pular para depois</Button
              >{/if}
            {#if queue.length || !next}<span class="shortcut desktop-only"
                >Ctrl + Enter conclui</span
              >{/if}
            {#if canPart || (next && queue.length)}<span class="mobile-only"
                ><ContextMenu label="Mais ações"
                  >{#if canPart}<Button
                      variant="quiet"
                      disabled={busy}
                      onclick={registerPart}>Registrar parte</Button
                    >{/if}{#if next && queue.length}<Button
                      variant="quiet"
                      disabled={busy}
                      onclick={skip}>Pular para depois</Button
                    >{/if}</ContextMenu
                ></span
              >{/if}
          </div>
          {#if !stepsReady}<p class="muted step-hint">
              Marque os passos para concluir.
            </p>{/if}
          {#if !queue.length}<a
              class="quiet-link details-link"
              href={'/missao/' + row.taskId}>Detalhes da missão →</a
            >{/if}
        {/if}
      {/if}
    </main>

    {#if queue.length > 1}
      <aside class="queue" aria-labelledby="queue-title">
        <details bind:open={queueOpen}>
          <summary
            ><h2 id="queue-title">{queueTitle}</h2>
            <span class="mobile-only muted"
              >{position + 1} de {queue.length}</span
            ></summary
          >
          <ol>
            {#each queue as item, index (item.id)}
              {@const isCurrent = item.id === id}
              {@const finished = item.status === 'completed'}
              <li class:current={isCurrent} class:finished>
                <span class="q-time"
                  >{finished
                    ? '✓'
                    : (timeText(item) || '').replace('◆ ', '')}</span
                >
                {#if isCurrent}<span class="q-title"
                    ><strong>{item.title}</strong></span
                  ><span class="q-now">agora</span>{:else}<a
                    class="q-title"
                    href={executionHref(item.id, kind, ids)}>{item.title}</a
                  >{/if}
                {#if !finished && !isCurrent}<span class="q-move">
                    <button
                      type="button"
                      aria-label={`Mover ${item.title} para cima`}
                      disabled={busy || index === 0}
                      onclick={() => moveInQueue(item.id, -1)}>▲</button
                    ><button
                      type="button"
                      aria-label={`Mover ${item.title} para baixo`}
                      disabled={busy || index === queue.length - 1}
                      onclick={() => moveInQueue(item.id, 1)}>▼</button
                    >
                  </span>{/if}
              </li>
            {/each}
          </ol>
          {#if afterBlock}<p class="muted after">
              Depois do bloco: {timeText(afterBlock)}
              {afterBlock.title}
            </p>{/if}
          <p class="hint">
            Mudar a ordem aqui muda o Dia. A fila não tem ordem própria.
          </p>
        </details>
      </aside>
    {/if}
  </div>
</div>

<style>
  .execution {
    --x-bg: #061114;
    --x-text: #eee9db;
    --x-muted: #a6b9a6;
    --x-line: #3b5047;
    --x-positive: #7bc4b1;
    --x-title: #fff1d6;
    min-height: 100dvh;
    background: var(--x-bg);
    color: var(--x-text);
    font: 400 16px/1.5 var(--lmu-font);
    display: grid;
    grid-template-rows: 64px 1fr;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 24px;
    border-bottom: 1px solid var(--x-line);
    min-width: 0;
  }
  .back {
    display: flex;
    align-items: center;
    min-height: 44px;
    color: #d6e2db;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
  }
  .context {
    color: var(--x-muted);
    font-size: 14px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .context strong {
    color: var(--x-text);
  }
  .spacer,
  .grow {
    flex: 1;
  }
  .quiet-link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    color: var(--x-muted);
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
  }
  .quiet-link:hover,
  .back:hover {
    color: #ecc36f;
  }
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
  }
  .with-queue .layout {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
  .focus {
    padding: 48px 64px;
    display: grid;
    gap: 28px;
    align-content: start;
    max-width: 820px;
    width: 100%;
    justify-self: center;
    box-sizing: border-box;
    min-width: 0;
  }
  .status-line:empty {
    display: none;
  }
  .heading {
    display: grid;
    gap: 6px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--x-muted);
  }
  .meta > span:not(.badge) + span:not(.badge)::before {
    content: '· ';
  }
  .badge {
    font-size: 12px;
    font-weight: 600;
    padding: 0 6px;
    border-radius: 4px;
    border: 1px solid;
  }
  .badge-important {
    color: #ead9ad;
    background: #ecc36f12;
    border-color: #ecc36f66;
  }
  .badge-stale {
    color: #dcd0ee;
    background: #c0afd91a;
    border-color: #c0afd955;
  }
  .badge-focus {
    color: #b3e2d6;
    background: #7bc4b11a;
    border-color: #7bc4b155;
  }
  h1 {
    margin: 0;
    font: 500 44px/1.1 var(--lmu-display);
    color: var(--x-title);
    overflow-wrap: anywhere;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
  }
  .muted {
    color: var(--x-muted);
  }
  .banner {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid var(--x-line);
    border-radius: 8px;
    background: #101f23;
  }
  .timer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-radius: 10px;
  }
  .timer.off {
    border: 1px dashed var(--x-line);
  }
  .timer.on {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 20px;
    padding: 20px 24px;
    border: 1px solid var(--x-positive);
    background: #0d2124;
  }
  .clock {
    font-size: 48px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .timer-copy {
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .track {
    display: block;
    height: 6px;
    border-radius: 20px;
    background: #030d10;
    overflow: hidden;
  }
  .track > span {
    display: block;
    height: 100%;
    background: var(--x-positive);
  }
  .timer-actions {
    display: flex;
    gap: 8px;
  }
  .steps {
    display: grid;
    gap: 4px;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    border-bottom: 1px solid #1d302d;
    cursor: pointer;
  }
  .step input {
    width: 22px;
    height: 22px;
    accent-color: var(--x-positive);
  }
  .struck {
    color: var(--x-muted);
    text-decoration: line-through;
  }
  .amount,
  .notes {
    display: grid;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
  }
  .amount input,
  .notes textarea {
    font: 400 16px/1.5 var(--lmu-font);
    padding: 10px 12px;
    border: 1px solid #70868b;
    border-radius: 8px;
    background: #071114;
    color: var(--x-text);
    max-width: 100%;
    box-sizing: border-box;
  }
  .amount input {
    max-width: 200px;
  }
  .notes small,
  .amount small {
    font-weight: 400;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding-top: 8px;
  }
  .actions :global(.big) {
    min-height: 48px;
  }
  .actions :global(.conclude) {
    padding-inline: 28px;
  }
  .next-hint {
    display: none;
    margin: 0;
    width: 100%;
    font-size: 13px;
    color: var(--x-muted);
  }
  .next-hint.inline {
    display: block;
    order: 9;
    width: auto;
    margin-left: auto;
    font-size: 14px;
  }
  .shortcut {
    margin-left: auto;
    font-size: 13px;
    color: var(--x-muted);
  }
  .mobile-only {
    display: none;
  }
  .done-banner {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid var(--x-line);
    border-radius: 8px;
    background: #101f23;
    font-size: 14px;
  }
  .project-done {
    width: 100%;
    order: 9;
    color: #ecc36f;
    font-size: 14px;
  }
  .tick {
    color: #9fd6c8;
    font-weight: 700;
  }
  .link-button {
    border: 0;
    background: none;
    color: #d6e2db;
    text-decoration: underline;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    min-height: 32px;
  }
  .done-banner a {
    font-size: 13px;
    color: #d6e2db;
  }
  .eyebrow {
    margin: 8px 0 -18px;
    font-size: 13px;
    color: var(--x-muted);
  }
  .queue {
    border-left: 1px solid var(--x-line);
    padding: 24px 16px;
    background: #081417;
    min-width: 0;
  }
  .queue summary {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }
  .queue summary::-webkit-details-marker {
    display: none;
  }
  .queue h2 {
    margin: 0 4px 10px;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--x-muted);
  }
  .queue ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .queue li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    min-height: 28px;
  }
  .queue li.current {
    background: #11272a;
    border-color: var(--x-positive);
  }
  .queue li.finished .q-title {
    color: var(--x-muted);
    text-decoration: line-through;
  }
  .q-time {
    width: 48px;
    flex: none;
    font-size: 13px;
    color: var(--x-muted);
    font-variant-numeric: tabular-nums;
  }
  .current .q-time,
  .q-now {
    color: #9fd6c8;
  }
  .q-title {
    flex: 1;
    min-width: 0;
    color: var(--x-text);
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  a.q-title:hover {
    color: #ecc36f;
  }
  .q-now {
    font-size: 12px;
  }
  .q-move {
    display: flex;
    gap: 2px;
  }
  .q-move button {
    width: 28px;
    height: 28px;
    border: 1px solid var(--x-line);
    border-radius: 6px;
    background: #101f23;
    color: var(--x-text);
    font-size: 10px;
    cursor: pointer;
  }
  .q-move button:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .after {
    margin: 12px 4px 0;
    font-size: 13px;
  }
  .hint {
    margin: 16px 0 0;
    padding: 12px 14px;
    border: 1px solid var(--x-line);
    border-radius: 8px;
    background: #101f23;
    font-size: 13px;
    color: #c9d3cc;
  }

  @media (max-width: 800px) {
    .execution {
      grid-template-rows: 56px 1fr;
    }
    .bar {
      gap: 8px;
      padding: 0 8px;
    }
    .end-block {
      display: none;
    }
    .back {
      padding: 0 8px;
    }
    .context {
      font-size: 13px;
    }
    .with-queue .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .focus {
      padding: 20px 16px 24px;
      gap: 18px;
    }
    h1 {
      font-size: 32px;
    }
    .meta {
      font-size: 13px;
    }
    .timer.on {
      grid-template-columns: auto 1fr;
      padding: 14px;
      gap: 12px;
    }
    .timer.on .timer-actions {
      grid-column: 1 / -1;
    }
    .timer.off {
      flex-wrap: wrap;
    }
    .clock {
      font-size: 32px;
    }
    .action-bar {
      position: sticky;
      bottom: 0;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      margin: 0 -16px -24px;
      padding: 12px 16px 16px;
      border-top: 1px solid var(--x-line);
      background: #081417;
    }
    .next-hint,
    .next-hint.inline {
      display: block;
      order: 0;
      margin: 0;
      font-size: 13px;
      grid-column: 1 / -1;
    }
    .actions :global(.desktop-only) {
      display: none !important;
    }
    .mobile-only {
      display: inline-flex;
      justify-self: end;
    }
    .action-bar .mobile-only :global(button) {
      min-height: 48px;
      min-width: 48px;
    }
    .queue {
      border-left: 0;
      border-top: 1px solid var(--x-line);
      padding: 12px 16px;
    }
    .queue summary {
      pointer-events: auto;
      cursor: pointer;
      min-height: 44px;
    }
    .queue h2 {
      margin: 0;
    }
    .q-move button {
      width: 44px;
      height: 44px;
    }
  }
</style>
