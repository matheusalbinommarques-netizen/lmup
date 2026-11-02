<script lang="ts">
  import { isPersonalTask } from '$services/personalTaskDeletion';
  import type { RemovalMode } from '$services/taskRemoval';
  let removalMode = $state<RemovalMode>('delete');
  import TaskRemovalDialog from './TaskRemovalDialog.svelte';
  let removalOpen = $state(false);
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
  import {
    completeTask,
    undoTask,
    previewTaskUndo,
  } from '$services/taskService';
  import Dialog from '$lib/ui/Dialog.svelte';
  import type { Resources } from '$services/productivityTypes';
  let undoOpen = $state(false),
    undoImpact = $state<Resources>();
  let correctionNotice = $state('');
  import { ensureOccurrence } from '$services/occurrenceService';
  import Button from '$lib/ui/Button.svelte';
  import Card from '$lib/ui/Card.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  let {
    id,
    sessionMode = false,
    sessionId,
    compact = false,
    onOpenProgress,
    onSessionContinue,
    onSessionSkip,
    onSessionBusyChange,
  }: {
    id: number;
    sessionMode?: boolean;
    sessionId?: string;
    compact?: boolean;
    onOpenProgress?: () => void;
    onSessionContinue?: () => void;
    onSessionSkip?: () => void;
    onSessionBusyChange?: (blocked: boolean) => void;
  } = $props();
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let editOpen = $state(false),
    reviewOpen = $state(false),
    revealNotes = $state(false);
  let notesExpanded = $state(false);
  $effect(() => {
    if (!compact || dirty || noteError) notesExpanded = true;
  });
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
    if (sessionMode)
      onSessionBusyChange?.(
        dirty || saves > 0 || busy || starting > 0 || !!noteError,
      );
  });
  const task = $derived(data?.tasks.find((item) => item.id === id));
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
  const currentStepSession = $derived.by(() => {
    if (!task) return false;
    if (task.recurrence) return task.occurrenceSession === today;
    if (!task.reviewEnabled) return true;
    const base = new Date(task.reviewStartedAt ?? task.createdAt).toISOString();
    return (
      task.reviewSession === `${base}:${task.completionRevision ?? 0}` ||
      (task.reviewSession === base &&
        ['active', 'paused'].includes(task.executionState ?? ''))
    );
  });
  const checkedSteps = $derived(
    currentStepSession ? (task?.completedSubtasks ?? []) : [],
  );
  const ready = $derived(
    (task?.productivityVersion &&
      !task.reviewEnabled &&
      task.tracking?.method !== 'steps') ||
      steps.every((step) => checkedSteps.includes(step.index)),
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
        sessionId,
        reviewOutcome: reviewOutcome || undefined,
        occurrenceDate: task?.recurrence ? today : undefined,
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
    if (busy || starting > 0) return;
    await queue;
    if (dirty || noteError) {
      error =
        'Seu texto ainda não foi salvo. Copie-o ou tente salvar novamente antes de sair.';
      return;
    }
    busy = true;
    error = '';
    try {
      if (task && ['active', 'paused'].includes(task.executionState ?? ''))
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
  async function undo(confirmed = false) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      if (!confirmed) {
        undoImpact = await previewTaskUndo(id, event?.id);
        undoOpen = true;
        return;
      }
      await undoTask(id, event?.id, undoImpact);
      undoOpen = false;
      freshEventId = '';
      correctionNotice = `Conclusão desfeita. Débito a compensar: ${undoImpact?.xp ?? 0} XP · ${undoImpact?.gold ?? 0} Ouro · ${undoImpact?.food ?? 0} Comida.`;
      busy = false;
      if (requestedReceipt) await goto(`/missao/${id}`, { replaceState: true });
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível desfazer.';
    } finally {
      busy = false;
    }
  }
  async function openProgress() {
    if (!task) return;
    if (onOpenProgress) {
      onOpenProgress();
      return;
    }
    busy = true;
    error = '';
    try {
      const row = await ensureOccurrence(
        task.id!,
        task.recurrence ? today : (task.plannedDate ?? today),
      );
      busy = false;
      await goto('/ocorrencia/' + encodeURIComponent(row.id));
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível abrir o progresso.';
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
<div class="journey-execution" class:compact>
  {#if !sessionMode}<a class="journey-link" href="/missoes"
      ><Icon name="back" size={18} />Voltar às missões</a
    >{/if}
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if correctionNotice}<p role="status" class="journey-banner">
      {correctionNotice}
    </p>{/if}
  {#if task && !compact}<TaskRemovalDialog
      bind:open={removalOpen}
      {task}
      mode={removalMode}
      onremoved={(mode) =>
        (correctionNotice =
          mode === 'delete'
            ? 'Missão excluída definitivamente. Os saldos foram preservados.'
            : 'Missão arquivada. Seus registros foram preservados.')}
    />
    <div class="journey-actions">
      {#if !task.archived}<Button
          variant="quiet"
          disabled={busy || dirty || saves > 0 || starting > 0}
          onclick={() => {
            removalMode = 'archive';
            removalOpen = true;
          }}>Arquivar missão</Button
        >{/if}{#if isPersonalTask(task)}<Button
          variant="danger"
          disabled={busy || dirty || saves > 0 || starting > 0}
          onclick={() => {
            removalMode = 'delete';
            removalOpen = true;
          }}>Excluir definitivamente</Button
        >{/if}
    </div>
  {/if}
  {#if !finished && lastTaskEvent?.kind === 'reversal'}
    <p role="status" class="journey-banner">
      Conclusão desfeita. {#if lastTaskEvent.debtAdded}Débito a compensar: {lastTaskEvent
          .debtAdded.xp} XP · {lastTaskEvent.debtAdded.gold} Ouro · {lastTaskEvent
          .debtAdded.food} Comida.{:else}Recompensa estornada: {lastTaskEvent
          .reward.xp} XP · {lastTaskEvent.reward.gold} Ouro · {lastTaskEvent
          .reward.food} Comida.{/if}
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
  {:else if task.archived}
    <Card
      ><h1>{task.title}</h1>
      <p class="journey-banner">
        Missão arquivada. Execução desativada; histórico e recompensas
        preservados.
      </p>
      {#if task.description}<p>{task.description}</p>{/if}
      {#if task.executionNotes}<h2>Suas notas</h2>
        <p style="white-space: pre-wrap">{task.executionNotes}</p>{/if}
      {#if dirty}<p role="alert">
          Esta missão foi arquivada em outra aba. Seu rascunho não salvo está
          abaixo; copie o texto antes de sair.
        </p>
        <textarea aria-label="Rascunho preservado" readonly value={notes}
        ></textarea><Button variant="quiet" onclick={leaveUnsaved}
          >Descartar rascunho e voltar</Button
        >{/if}
      <h2>Registros preservados</h2>
      <ul>
        {#each data.events.filter((row) => row.taskId === task.id) as record (record.id)}<li
          >
            {record.date} · {record.reward.xp} XP · {record.reward.gold} Ouro{record.reversedAt
              ? ' · Estornado'
              : ''}
          </li>{/each}
      </ul>
      {#each data.occurrences.filter((row) => row.taskId === task.id && row.value > 0) as occurrence (occurrence.id)}<a
          class="journey-link"
          href={'/ocorrencia/' + encodeURIComponent(occurrence.id)}
          >Consultar execução de {occurrence.originDate} →</a
        >{/each}
      <a class="journey-link" href="/missoes">Voltar às missões →</a>
    </Card>
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
          onclick={() => undo()}
          >{event.kind === 'review'
            ? 'Desfazer última sessão'
            : 'Desfazer conclusão'}</Button
        >{/if}
      {#if notes}<Card
          ><h3>Suas notas</h3>
          <p style="white-space: pre-wrap; text-align: left">{notes}</p></Card
        >{/if}
    </div>
  {:else}
    <details class="execution-context" open={!compact}>
      <summary hidden={!compact}>Descrição e contexto</summary>
      <header class="journey-heading">
        <div>
          <p class="lmu-eyebrow">
            {data.projects.find((item) => item.id === task.projectId)?.name ??
              'Um passo na sua jornada'}
          </p>
          <h1>{task.title}</h1>
          <p class="lmu-hint">
            {data.areas.find((area) => area.id === task.areaId)?.nome ??
              'Geral'} ·
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
    </details>
    {#if canExecute && !['active', 'paused'].includes(task.executionState ?? '')}<div
        class="journey-actions"
      >
        <Button
          variant="secondary"
          disabled={starting > 0 || busy}
          onclick={() => startCurrent(task)}>Iniciar missão</Button
        >
        <p class="lmu-hint">Consultar a missão não inicia sua execução.</p>
      </div>{:else if canExecute && task.executionState === 'paused'}<div
        class="journey-actions"
      >
        <Button
          variant="secondary"
          disabled={starting > 0 || busy}
          onclick={() => startCurrent(task)}>Retomar missão</Button
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
            {steps.filter((step) => checkedSteps.includes(step.index)).length} de
            {steps.length} passos
          </p>
          <progress
            max={steps.length}
            value={steps.filter((step) => checkedSteps.includes(step.index))
              .length}
            aria-label="Passos concluídos"
          ></progress>
          <ul class="journey-step-list">
            {#each steps as step (step.index)}<li>
                <label class:done={checkedSteps.includes(step.index)}
                  ><input
                    type="checkbox"
                    checked={checkedSteps.includes(step.index)}
                    disabled={busy}
                    onchange={(event) => stepChange(event, step.index)}
                  /><span>{step.label}</span></label
                >
              </li>{/each}
          </ul>{:else}<div class="execution-guidance">
            <strong
              >{task.executionState === 'active'
                ? 'Em andamento'
                : 'No seu ritmo'}</strong
            >
            <p>Conclua quando terminar esta atividade.</p>
          </div>{/if}</Card
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
      {#if reward}<div class="execution-reward">
          <span>Recompensa prevista</span><strong
            ><ApprovedIcon name="xp" size={23} />+{reward.xp} XP</strong
          ><strong
            ><ApprovedIcon name="ouro" size={23} />+{reward.gold} Ouro</strong
          >{#if reward.food}<small>+{reward.food} Comida</small>{/if}
        </div>{/if}
      <div class="journey-actions completion-actions">
        <Button
          variant="secondary"
          disabled={busy || saves > 0 || starting > 0}
          onclick={pause}
          ><Icon name="pause" size={18} />{!task ||
          !['active', 'paused'].includes(task.executionState ?? '')
            ? 'Voltar às missões'
            : sessionMode
              ? 'Pausar e voltar às missões'
              : 'Pausar e voltar'}</Button
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
      {#if !ready}<p class="lmu-hint">Marque os passos para concluir.</p>{/if}
      {#if !task.reviewEnabled || revealNotes || dirty || noteError}
        <details class="journey-notes" bind:open={notesExpanded}>
          <summary>Notas da missão</summary>
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
        </details>
      {:else}<Button
          variant="secondary"
          onclick={() => {
            revealNotes = true;
          }}>Consultar e editar notas</Button
        >{/if}
    {/if}
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
  {#if task && data}<details class="execution-more" open={!compact}>
      <summary hidden={!compact}>Ações e revisão</summary>
      <div class="journey-actions" class:session-mission-actions={sessionMode}>
        {#if task.productivityVersion && !task.reviewEnabled}<Button
            disabled={busy || saves > 0 || dirty}
            onclick={openProgress}
            >{finished
              ? 'Corrigir progresso'
              : 'Registrar progresso parcial'}</Button
          >{/if}
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
        {#if sessionMode && onSessionSkip}
          <Button
            variant="quiet"
            disabled={busy || saves > 0 || dirty || starting > 0 || !!noteError}
            onclick={onSessionSkip}
            >Pular por agora <Icon name="arrow" size={16} /></Button
          >
        {/if}
      </div>
      <ReviewHistory {task} events={data.events} />
    </details>
    <QuickCreate
      bind:open={editOpen}
      snapshot={data}
      editTask={task}
    /><ReviewForm bind:open={reviewOpen} {task} />{/if}
</div>
<Dialog
  bind:open={undoOpen}
  title="Corrigir esta conclusão?"
  dismissible={!busy}
>
  {#if undoImpact}<p>
      Débito a compensar: {undoImpact.xp} XP · {undoImpact.gold} ouro · {undoImpact.food}
      comida.
    </p>
    <p>
      Nível, recursos disponíveis, compras e cuidados já realizados serão
      preservados. Os próximos ganhos compensam o débito.
    </p>{/if}
  <Button disabled={busy} onclick={() => undo(true)}>Confirmar correção</Button
  ><Button variant="quiet" disabled={busy} onclick={() => (undoOpen = false)}
    >Cancelar</Button
  >
</Dialog>

<style>
  .session-mission-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
  }

  .execution-reward {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 18px;
    padding: 12px 0;
    border-top: 1px solid #8b704534;
  }
  .execution-reward > span {
    width: 100%;
    color: #b7c5b1;
    font-size: 0.77rem;
  }
  .execution-reward strong {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #edce85;
    font-size: 0.88rem;
  }
  .execution-reward small {
    color: #afbfaa;
  }
  .completion-actions {
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
  }
  .completion-actions :global(button:last-child) {
    width: 100%;
    min-height: 48px;
    font-size: 1rem;
  }
  .completion-actions :global(button:first-child) {
    align-self: start;
  }
  .execution-guidance strong {
    color: #e5c686;
    font-size: 0.85rem;
  }
  .execution-guidance p {
    color: #b9c6b1;
    font-size: 0.85rem;
    margin: 6px 0 0;
  }
  .compact :global(.lmu-card) {
    padding: 12px 14px;
    border-radius: 8px;
  }
  .compact .journey-notes {
    margin-top: 0;
  }
  .compact .execution-more {
    margin-top: 0;
  }
  .compact .journey-actions {
    margin: 0;
  }
  .compact details {
    margin-top: 0;
    margin-bottom: 0;
  }
  .compact {
    width: 100%;
    max-width: none;
    display: grid;
    gap: 10px;
  }
  .compact .execution-context,
  .compact .execution-more,
  .compact .journey-notes {
    border-top: 1px solid #8b704534;
    padding-top: 10px;
    font-size: 0.82rem;
  }
  .compact summary {
    cursor: pointer;
    color: #ccb784;
    margin-bottom: 8px;
  }
  .compact :global(.journey-heading) {
    margin-bottom: 8px;
  }
  .compact :global(.journey-heading h1) {
    font-size: 1.5rem;
  }
</style>
