<script lang="ts">
  import { onMount } from 'svelte';
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
  let { id }: { id: number } = $props();
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let busy = $state(false);
  let started = false;
  let notes = $state('');
  let dirty = $state(false);
  let saves = $state(0);
  let noteError = $state('');
  let revision = 0;
  let queue = Promise.resolve();
  const task = $derived(
    data?.tasks.find((item) => item.id === id && !item.archived),
  );
  const steps = $derived(task ? taskSteps(task) : []);
  const finished = $derived(
    task && !!task.completed && (!task.reviewEnabled || !isAvailable(task)),
  );
  const event = $derived(
    task?.completionEventId
      ? data?.events.find(
          (item) => item.id === task.completionEventId && !item.reversedAt,
        )
      : undefined,
  );
  const projectEvent = $derived(
    event
      ? data?.events.find(
          (item) =>
            item.kind === 'project' &&
            item.projectId === task?.projectId &&
            item.sequence === event.sequence + 1 &&
            !item.reversedAt,
        )
      : undefined,
  );
  const ready = $derived(
    steps.every((step) => task?.completedSubtasks?.includes(step.index)),
  );
  const reward = $derived(data?.rewards[id]);
  onMount(() => {
    const subscription = journeyQuery().subscribe({
      next: (value) => {
        data = value;
        const current = value.tasks.find((item) => item.id === id);
        if (current && !dirty && saves === 0) {
          notes = current.executionNotes ?? '';
          revision = current.notesRevision ?? 0;
        }
        if (current && !started && isAvailable(current)) {
          started = true;
          beginTask(id).catch((cause) => {
            error =
              cause instanceof Error
                ? cause.message
                : 'Não foi possível iniciar. Tente novamente.';
            started = false;
          });
        }
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
    window.addEventListener('beforeunload', protect);
    return () => {
      subscription.unsubscribe();
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
          noteError =
            cause instanceof Error
              ? cause.message
              : 'Não foi possível salvar. Seu texto foi mantido.';
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
      await completeTask(id);
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
      await goto('/');
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
      await undoTask(id);
      started = false;
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
    await goto('/');
  }
</script>

<svelte:head><title>{task?.title ?? 'Missão'} · Level Me Up</title></svelte:head
>
<div class="journey-execution">
  <a class="journey-link" href="/"
    ><Icon name="back" size={18} />Voltar para hoje</a
  >
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if !data}<p role="status">Abrindo sua missão…</p>{:else if !task}<Card
      ><div class="journey-empty">
        <h1>Missão não encontrada</h1>
        <p class="lmu-muted">Ela pode ter sido arquivada ou removida.</p>
        <a class="lmu-button lmu-button--secondary" href="/missoes"
          >Ver minhas missões</a
        >
      </div></Card
    >
  {:else if finished}<div class="journey-completion">
      <Icon name="check" size={44} />
      <p class="lmu-eyebrow">
        {projectEvent
          ? 'Um projeto ganhou seu marco'
          : task.reviewEnabled
            ? 'Revisão realizada'
            : 'Missão concluída'}
      </p>
      <h1>Esse passo é seu.</h1>
      <h2>{task.title}</h2>
      {#if event}<div class="journey-reward" aria-label="Recompensa recebida">
          <span>+{event.reward.xp} XP</span><span
            >+{event.reward.gold} Gold</span
          ><span>+{event.reward.food} Comida</span>
        </div>
        {#if projectEvent}<Card
            ><h3>Projeto concluído</h3>
            <p>
              {data.projects.find((item) => item.id === task.projectId)?.name}
            </p>
            <p>
              +{projectEvent.reward.xp} XP · +{projectEvent.reward.gold} Gold · +{projectEvent
                .reward.food} Comida de bônus
            </p></Card
          >{/if}{:else}<p class="lmu-muted">
          Esta conclusão é anterior ao histórico detalhado. Seu progresso foi
          preservado.
        </p>{/if}
      <p class="lmu-muted">Agora você pode continuar ou ficar por aqui hoje.</p>
      <a class="lmu-button lmu-button--primary" href="/"
        >Voltar para hoje<Icon name="arrow" size={18} /></a
      >{#if event}<Button variant="quiet" disabled={busy} onclick={undo}
          >Desfazer conclusão</Button
        >{/if}{#if notes}<Card
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
        {#if task.description}<p style="white-space: pre-wrap">
            {task.description}
          </p>{/if}
      </div>
    </header>
    {#if task.reviewEnabled && !isAvailable(task)}<p class="journey-banner">
        Sua próxima revisão ainda não está disponível.
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
      <div class="journey-actions">
        <Button variant="secondary" disabled={busy || saves > 0} onclick={pause}
          ><Icon name="pause" size={18} />Pausar e voltar</Button
        ><Button
          disabled={!ready || busy || saves > 0 || dirty}
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
</div>
