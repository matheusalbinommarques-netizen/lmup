<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import RewardSummary from './rewards/RewardSummary.svelte';
  import { isUpdateLocked } from '$services/updateSafety';
  import { storageError } from '$services/storageErrors';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { dateKey } from '$services/rewardService';
  import { recurrenceLabel, nextPlannedDate } from '$services/recurrence';
  import { formatCalendar } from '$services/calendar';
  import { takeRewardCelebration } from '$services/rewardPresentation';
  import type { Task } from '$services/db';
  import QuickCreate from './QuickCreate.svelte';
  import ReviewForm from './ReviewForm.svelte';
  import ReviewHistory from './ReviewHistory.svelte';
  import { beforeNavigate, goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import {
    beginTask,
    isAvailable,
    pauseTask,
    saveTaskNotes,
    setTaskStep,
    taskSteps,
  } from '$services/journeyService';
  import { completeTask, undoTask } from '$services/taskService';
  import Button from '$lib/ui/Button.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  let {
    id,
    sessionMode = false,
    onSessionContinue,
    onSessionBusyChange,
  }: {
    id: number;
    sessionMode?: boolean;
    onSessionContinue?: () => void;
    onSessionBusyChange?: (blocked: boolean) => void;
  } = $props();
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let editOpen = $state(false),
    reviewOpen = $state(false),
    revealNotes = $state(false);
  let reviewOutcome = $state<'' | 'recalled' | 'partial' | 'again'>('');
  let busy = $state(false);
  let freshEventId = $state('');
  let today = $state(dateKey());
  const requestedReceipt = $derived(page.url.searchParams.get('evento'));
  let startedToken = '';
  let starting = $state(0);
  guardUpdates(() => !data || dirty || saves > 0 || busy || starting > 0);
  function startCurrent(current: Task) {
    if (requestedReceipt || isUpdateLocked() || !isAvailable(current)) return;
    const token = current.reviewEnabled
      ? `review:${current.id}:${String(current.reviewStartedAt ?? current.createdAt)}:${current.completionRevision ?? 0}`
      : `task:${current.id}:${current.recurrence ? today : ''}:${current.completionRevision ?? 0}`;
    if (startedToken === token) return;
    startedToken = token;
    starting++;
    beginTask(id)
      .catch((cause) => {
        error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível iniciar. Tente novamente.';
        startedToken = '';
      })
      .finally(() => {
        starting--;
      });
  }
  let notes = $state('');
  let dirty = $state(false);
  let saves = $state(0);
  let noteError = $state('');
  let revision = 0;
  let queue = Promise.resolve();
  $effect(() => {
    if (sessionMode) onSessionBusyChange?.(dirty || saves > 0 || busy || starting > 0 || !!noteError);
  });
  const task = $derived(
    data?.tasks.find((item) => item.id === id && !item.archived),
  );
  const steps = $derived(task ? taskSteps(task) : []);
  const event = $derived(
    requestedReceipt
      ? data?.events.find(
          (item) =>
            item.id === requestedReceipt &&
            item.taskId === id &&
            ['task', 'review'].includes(item.kind),
        )
      : task?.completionEventId
        ? data?.events.find(
            (item) => item.id === task.completionEventId && !item.reversedAt,
          )
        : undefined,
  );
  const canExecute = $derived(
    !!task && isAvailable(task, new Date(`${today}T12:00:00`)),
  );
  const finished = $derived(
    (!!event && !!requestedReceipt) ||
      (task &&
        !!task.completed &&
        (task.recurrence
          ? task.lastOccurrenceDate === today || task.lastReviewDate === today
          : !task.reviewEnabled || !canExecute)),
  );
  const projectEvent = $derived(
    event
      ? data?.events.find(
          (item) =>
            item.kind === 'project' &&
            item.projectId === event.projectId &&
            item.sequence === event.sequence + 1 &&
            !item.reversedAt,
        )
      : undefined,
  );
  const ready = $derived(
    steps.every((step) => task?.completedSubtasks?.includes(step.index)),
  );
  const reward = $derived(data?.rewards[id]);
  const lastTaskEvent = $derived(
    data?.events
      .filter((entry) => entry.taskId === id)
      .sort((a, b) => b.sequence - a.sequence)[0],
  );
  onMount(() => {
    freshEventId = takeRewardCelebration();
    const subscription = journeyQuery().subscribe({
      next: (value) => {
        data = value;
        const current = value.tasks.find((item) => item.id === id);
        if (current && !dirty && saves === 0) {
          notes = current.executionNotes ?? '';
          revision = current.notesRevision ?? 0;
        }
        // Opening mission details never begins execution automatically.
      },
      error: () => {
        error =
          'Não foi possível ler a missão. Seu texto continua aqui. Tente recarregar depois de copiá-lo.';
      },
    });
    const protect = (event: BeforeUnloadEvent) => {
      if (dirty || saves || busy) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    const refresh = () => {
      today = dateKey();

    };
    const dayClock = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('beforeunload', protect);
    return () => {
      subscription.unsubscribe();
      clearInterval(dayClock);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('beforeunload', protect);
    };
  });
  beforeNavigate(({ cancel }) => {
    if (dirty || saves || busy) {
      cancel();
      if (!noteError)
        error =
          'Aguarde salvar antes de sair. Se houver erro, copie suas notas ou tente salvá-las novamente.';
    }
  });
  function persist(value: string, overwrite = false) {
    notes = value;
    dirty = true;
    saves++;
    queue = queue
      .then(async () => {
        if (noteError && !overwrite) return;
        try {
          revision = await saveTaskNotes(id, value, revision, overwrite);
          noteError = '';
          if (notes === value) dirty = false;
        } catch (cause) {
          noteError = storageError(
            cause,
            'Não foi possível salvar. Seu texto foi mantido.',
            true,
          );
        }
      })
      .finally(() => {
        saves--;
      });
  }
  async function stepChange(event: Event, index: number) {
    const input = event.currentTarget as HTMLInputElement;
    busy = true;
    error = '';
    try {
      await setTaskStep(id, index, input.checked);
    } catch (cause) {
      input.checked = !!task?.completedSubtasks?.includes(index);
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o passo. Tente novamente.';
    } finally {
      busy = false;
    }
  }
  async function conclude() {
    if (busy) return;
    await queue;
    if (dirty || noteError) {
      error = 'Salve suas notas antes de concluir.';
      return;
    }
    busy = true;
    error = '';
    try {
      const receipt = await completeTask(id, {
        reviewOutcome: reviewOutcome || undefined,
        occurrenceDate: task?.recurrence
          ? (task.occurrenceSession ?? today)
          : undefined,
      });
      freshEventId = receipt?.id ?? '';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível concluir. Tente novamente.';
    } finally {
      busy = false;
    }
  }
  async function pause() {
    if (busy) return;
    await queue;
    if (dirty || noteError) {
      error =
        'Seu texto ainda não foi salvo. Copie-o ou tente salvar novamente antes de sair.';
      return;
    }
    busy = true;
    error = '';
    try {
      await pauseTask(id);
      busy = false;
      await goto('/missoes');
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível pausar.';
    } finally {
      busy = false;
    }
  }
  async function undo() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await undoTask(id, event?.id);
      freshEventId = '';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível desfazer.';
    } finally {
      busy = false;
    }
  }
  async function leaveUnsaved() {
    await queue;
    dirty = false;
    noteError = '';
    await goto('/missoes');
  }
</script>

<svelte:head><title>{task?.title ?? 'Missão'} · Level Me Up</title></svelte:head
>
<div class="journey-execution">
  {#if !sessionMode}<a class="journey-link" href="/missoes"
      ><Icon name="back" size={18} />Voltar às missões</a
    >{/if}
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if !finished && lastTaskEvent?.kind === 'reversal'}
    <p role="status" class="journey-banner">
      Conclusão desfeita. Recompensa estornada: {lastTaskEvent.reward.xp} XP · {lastTaskEvent
        .reward.gold} Ouro · {lastTaskEvent.reward.food} Comida.
    </p>
  {/if}
  {#if !data}<p role="status">Abrindo sua missão…</p>{:else if !task}<Card
      ><div class="journey-empty">
        <h1>Missão não encontrada</h1>
        <p class="lmu-muted">Ela pode ter sido arquivada ou removida.</p>
        <a class="lmu-button lmu-button--secondary" href="/missoes"
          >Ver minhas missões</a
        >
      </div></Card
    >
  {:else if finished}
    {#key event?.id}
      <RewardSummary
        title={event?.taskTitle ?? task.title}
        {event}
        {projectEvent}
        projectName={data.projects.find((item) => item.id === task.projectId)
          ?.name}
        fresh={!!event && event.id === freshEventId}
        continueLabel={sessionMode ? 'Próxima missão' : 'Continuar'}
        onContinue={sessionMode ? onSessionContinue : undefined}
      />
    {/key}
    <div class="completion-details">
      {#if event && !event.reversedAt && (event.occurrenceDate || task.completionEventId === event.id)}<Button
          variant="quiet"
          disabled={busy}
          onclick={undo}
          >{event.kind === 'review'
            ? 'Desfazer última sessão'
            : 'Desfazer conclusão'}</Button
        >{/if}
      {#if notes}<Card
          ><h3>Suas notas</h3>
          <p style="white-space: pre-wrap; text-align: left">{notes}</p></Card
        >{/if}
    </div>
  {:else}<header class="journey-heading">
      <div>
        <p class="lmu-eyebrow">
          {data.projects.find((item) => item.id === task.projectId)?.name ??
            'Um passo na sua jornada'}
        </p>
        <h1>{task.title}</h1>
        <p class="lmu-hint">
          {data.areas.find((area) => area.id === task.areaId)?.nome ?? 'Geral'} ·
          {recurrenceLabel(task)}{task.plannedDate
            ? ` · ${formatCalendar(task.plannedDate)}`
            : ''}
        </p>
        {#if task.recurrence}<p class="lmu-hint">
            Próxima ocorrência: {formatCalendar(nextPlannedDate(task, today))}
          </p>{/if}
        {#if task.description}<p style="white-space: pre-wrap">
            {task.description}
          </p>{/if}
      </div>
    </header>
    {#if canExecute && !['active', 'paused'].includes(task.executionState ?? '')}<div class="journey-actions">
        <Button
          variant="secondary"
          disabled={starting > 0 || busy}
          onclick={() => startCurrent(task)}
          >Iniciar missão</Button
        >
        <p class="lmu-hint">Consultar a missão não inicia sua execução.</p>
      </div>{:else if canExecute && task.executionState === 'paused'}<div class="journey-actions">
        <Button variant="secondary" disabled={starting > 0 || busy} onclick={() => startCurrent(task)}
          >Retomar missão</Button
        >
      </div>{/if}
    {#if !canExecute}<p class="journey-banner">
        {task.reviewEnabled
          ? 'Sua próxima revisão ainda não está disponível.'
          : task.recurrence
            ? 'Esta rotina não está prevista para hoje. Você pode editar seu planejamento.'
            : 'Esta missão está planejada para uma data futura.'}
      </p>{:else}<Card
        >{#if steps.length}<p class="lmu-muted">
            {steps.filter((step) =>
              task.completedSubtasks?.includes(step.index),
            ).length} de {steps.length} passos
          </p>
          <progress
            max={steps.length}
            value={steps.filter((step) =>
              task.completedSubtasks?.includes(step.index),
            ).length}
            aria-label="Passos concluídos"
          ></progress>
          <ul class="journey-step-list">
            {#each steps as step (step.index)}<li>
                <label class:done={task.completedSubtasks?.includes(step.index)}
                  ><input
                    type="checkbox"
                    checked={task.completedSubtasks?.includes(step.index) ??
                      false}
                    disabled={busy}
                    onchange={(event) => stepChange(event, step.index)}
                  /><span>{step.label}</span></label
                >
              </li>{/each}
          </ul>{:else}<h2>Um passo simples já conta.</h2>
          <p class="lmu-muted">
            Conclua quando terminar esta atividade.
          </p>{/if}</Card
      >
      {#if task.reviewEnabled}<p class="journey-banner">
          Tente explicar o que lembra antes de consultar as notas. Sua avaliação
          registra a prática; não altera o intervalo automaticamente.
        </p>
        <label class="journey-label"
          >Como foi lembrar? (opcional)<select bind:value={reviewOutcome}
            ><option value="">Não registrar avaliação</option><option
              value="recalled">Lembrei bem</option
            ><option value="partial">Lembrei em parte</option><option
              value="again">Quero praticar mais</option
            ></select
          ></label
        >{/if}
      {#if !task.reviewEnabled || revealNotes || dirty || noteError}
        <section class="journey-notes">
          <label class="journey-label" for="execution-notes" id="notes-label"
            >Notas da missão<textarea
              id="execution-notes"
              value={notes}
              oninput={(event) => persist(event.currentTarget.value)}
              maxlength="20000"
              rows="5"
              placeholder="Guarde uma descoberta ou de onde quer retomar."
            ></textarea></label
          >
          <p class="journey-save-status" role="status" aria-live="polite">
            {noteError
              ? 'Notas ainda não salvas'
              : saves
                ? 'Salvando notas…'
                : dirty
                  ? 'Há alterações para salvar'
                  : 'Tudo salvo neste navegador'}
          </p>
          {#if noteError}<p role="alert" class="journey-error">{noteError}</p>
            <Button variant="secondary" onclick={() => persist(notes, true)}
              >Usar minhas notas e tentar salvar</Button
            ><Button variant="quiet" onclick={leaveUnsaved}
              >Voltar sem salvar notas</Button
            >{/if}
        </section>
      {:else}<Button
          variant="secondary"
          onclick={() => {
            revealNotes = true;
          }}>Consultar e editar notas</Button
        >{/if}
      <div class="journey-actions">
        <Button variant="secondary" disabled={busy || saves > 0} onclick={pause}
          ><Icon name="pause" size={18} />{sessionMode ? 'Pausar e voltar às missões' : 'Pausar e voltar'}</Button
        ><Button
          disabled={!ready ||
            busy ||
            saves > 0 ||
            dirty ||
            starting > 0 ||
            !canExecute}
          onclick={conclude}
          >Concluir missão<Icon name="check" size={18} /></Button
        >
      </div>
      {#if !ready}<p class="lmu-hint">
          Marque os passos para concluir.
        </p>{/if}{#if reward}<p class="lmu-hint">
          Prévia atual: +{reward.xp} XP · +{reward.gold} Gold · +{reward.food} Comida.
          Bônus de projeto são registrados separadamente.
        </p>{/if}{/if}
  {/if}
  {#if finished && (dirty || saves || noteError)}<section class="journey-notes">
      <p role="status">
        {saves ? 'Salvando notas…' : 'Notas ainda não salvas'}
      </p>
      <p role="alert" class="journey-error">
        {noteError ||
          'A missão foi concluída em outra aba. Seu rascunho continua nesta tela.'}
      </p>
      <Button
        variant="secondary"
        disabled={saves > 0}
        onclick={() => persist(notes, true)}
        >Usar minhas notas e tentar salvar</Button
      ><Button variant="quiet" onclick={leaveUnsaved}
        >Voltar sem salvar notas</Button
      >
    </section>{/if}
  {#if data && !task && dirty}<section class="journey-notes">
      <p role="alert">
        Seu rascunho não foi salvo porque a missão mudou. Copie o texto antes de
        sair.
      </p>
      <label class="journey-label"
        >Rascunho preservado<textarea readonly value={notes} rows="5"
        ></textarea></label
      ><Button variant="quiet" onclick={leaveUnsaved}
        >Voltar sem salvar notas</Button
      >
    </section>{/if}
  {#if task && data}<div class="journey-actions">
      <Button
        variant="secondary"
        disabled={busy || saves > 0 || dirty}
        onclick={() => {
          editOpen = true;
        }}>Editar missão</Button
      ><Button
        variant="secondary"
        disabled={busy || saves > 0 || dirty}
        onclick={() => {
          reviewOpen = true;
        }}>Configurar revisão</Button
      >
    </div>
    <ReviewHistory {task} events={data.events} /><QuickCreate
      bind:open={editOpen}
      snapshot={data}
      editTask={task}
    /><ReviewForm bind:open={reviewOpen} {task} />{/if}
</div>
