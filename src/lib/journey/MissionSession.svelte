<script lang="ts">
  import '$lib/rpg-theme.css';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import { formatCalendar } from '$services/calendar';
  import {
    MISSION_SESSION_KEY,
    clearMissionSession,
    readMissionSession,
    removeMissionFromSession,
    saveMissionSession,
    type MissionSession,
  } from '$services/missionSession';
  import Execution from './Execution.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';

  let session = $state<MissionSession | null>(null);
  let snapshot = $state<JourneySnapshot>();
  let today = $state(dateKey());
  let error = $state('');
  let navigationBlocked = $state(false);

  onMount(() => {
    session = readMissionSession(today);
    const subscription = journeyQuery().subscribe({
      next: (value) => (snapshot = value),
      error: () => (error = 'Não foi possível carregar suas missões.'),
    });
    const refresh = () => {
      const current = dateKey();
      if (current !== today) {
        today = current;
        session = readMissionSession(current);
      }
    };
    const sync = (event: StorageEvent) => {
      if (event.key === MISSION_SESSION_KEY || event.key === null)
        session = readMissionSession(today);
    };
    const clock = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', sync);
    return () => {
      subscription.unsubscribe();
      clearInterval(clock);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', sync);
    };
  });

  const missions = $derived(
    session?.taskIds.map((id) =>
      snapshot?.tasks.find((task) => task.id === id && !task.archived),
    ) ?? [],
  );
  const completedIds = $derived(
    new Set(
      snapshot?.events
        .filter(
          (event) =>
            ['task', 'review'].includes(event.kind) &&
            !event.reversedAt &&
            (event.occurrenceDate ?? event.date) === today,
        )
        .map((event) => event.taskId) ?? [],
    ),
  );
  const finishedCount = $derived(
    session?.taskIds.filter((id) => completedIds.has(id)).length ?? 0,
  );
  const currentTask = $derived(
    session ? missions[session.cursor] : undefined,
  );

  function choose(index: number) {
    if (!session) return;
    if (navigationBlocked && index !== session.cursor) {
      error = 'Aguarde suas notas serem salvas antes de trocar de missão.';
      return;
    }
    const next = { ...session, cursor: index };
    try {
      saveMissionSession(next);
      session = next;
      error = '';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Não foi possível salvar a sessão.';
    }
  }

  function reorder(index: number, offset: number) {
    if (!session || navigationBlocked) return;
    const target = index + offset;
    if (target < 0 || target >= session.taskIds.length) return;
    const taskIds = [...session.taskIds];
    const selectedId = session.taskIds[session.cursor];
    const [moved] = taskIds.splice(index, 1);
    taskIds.splice(target, 0, moved);
    const cursor = selectedId ? taskIds.indexOf(selectedId) : taskIds.length;
    const next = { ...session, taskIds, cursor };
    try {
      saveMissionSession(next);
      session = next;
      error = '';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Não foi possível reorganizar a sessão.';
    }
  }

  function remove(id: number) {
    if (!session || navigationBlocked || completedIds.has(id)) return;
    const next = removeMissionFromSession(session, id);
    try {
      saveMissionSession(next);
      session = next;
      error = '';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Não foi possível remover da sessão.';
    }
  }

  function advance() {
    if (!session) return;
    const next = session.taskIds.findIndex(
      (id, index) => index > session!.cursor && !completedIds.has(id),
    );
    choose(next < 0 ? session.taskIds.length : next);
  }

  function revisit() {
    if (!session) return;
    const first = session.taskIds.findIndex((id) => !completedIds.has(id));
    if (first >= 0) choose(first);
  }

  async function finishSession() {
    if (navigationBlocked) {
      error = 'Aguarde o salvamento das notas antes de encerrar a sessão.';
      return;
    }
    clearMissionSession();
    session = null;
    await goto('/missoes');
  }
</script>

<svelte:head><title>Sessão de Missões · Level Me Up</title></svelte:head>

<section class="rpg-theme session-page">
  <header class="journey-heading">
    <div>
      <p class="lmu-eyebrow">Seu ritmo, suas escolhas</p>
      <h1>Sessão de Missões</h1>
      <p>Uma atividade de cada vez. Você pode pausar ou mudar a ordem.</p>
    </div>
    <a class="lmu-button lmu-button--secondary" href="/missoes">Pausar sessão</a>
  </header>

  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  {#if !session}
    <div class="rpg-frame session-empty">
      <RpgTrim />
      <h2>Nenhuma sessão ativa para hoje.</h2>
      <p>Monte sua sequência na lista de Missões. Suas conclusões anteriores continuam salvas.</p>
      <a class="lmu-button lmu-button--primary" href="/missoes">Escolher missões</a>
    </div>
  {:else if !snapshot}
    <p role="status">Carregando sua sessão…</p>
  {:else}
    <div class="session-progress rpg-frame">
      <RpgTrim />
      <div class="session-progress-heading">
        <strong>{finishedCount} de {session.taskIds.length} missões concluídas hoje</strong>
        <span>{formatCalendar(today)}</span>
      </div>
      <progress max={session.taskIds.length} value={finishedCount} aria-label="Missões da sessão concluídas"></progress>
    </div>
    <div class="session-columns">
      <aside class="rpg-frame session-queue" aria-label="Fila de missões">
        <RpgTrim />
        <h2>Sua sequência</h2>
        <ol>
          {#each session.taskIds as id, index (id)}
            {@const task = missions[index]}
            <li>
              <div class="queue-entry">
                <button
                  class:chosen={session.cursor === index}
                  type="button"
                  aria-current={session.cursor === index ? 'step' : undefined}
                  disabled={navigationBlocked && session.cursor !== index}
                  onclick={() => choose(index)}
                >
                  <span class="queue-number">{completedIds.has(id) ? '✓' : index + 1}</span>
                  <span class="queue-copy">
                    <strong>{task?.title ?? 'Missão indisponível'}</strong>
                    <small>{completedIds.has(id) ? 'Concluída hoje' : task?.executionState === 'paused' ? 'Pausada' : 'Pendente'}</small>
                  </span>
                </button>
                <div class="queue-reorder">
                  <button type="button" disabled={navigationBlocked || index === 0} aria-label={`Mover ${task?.title ?? 'missão'} para cima`} onclick={() => reorder(index, -1)}>↑</button>
                  <button type="button" disabled={navigationBlocked || index === session!.taskIds.length - 1} aria-label={`Mover ${task?.title ?? 'missão'} para baixo`} onclick={() => reorder(index, 1)}>↓</button>
                </div>
              </div>
              {#if !completedIds.has(id)}
                <button class="queue-remove" type="button" disabled={navigationBlocked} aria-label={`Remover da sessão: ${task?.title ?? 'missão'}`} onclick={() => remove(id)}>Remover da sessão</button>
              {/if}
            </li>
          {/each}
        </ol>
        <p class="lmu-hint">Pular uma missão não a conclui nem gera recompensas. Toque em uma atividade da lista para voltar a ela.</p>
        <Button variant="quiet" disabled={navigationBlocked} onclick={finishSession}>Encerrar e limpar esta sequência</Button>
      </aside>
      <div class="session-current">
        {#if session.cursor >= session.taskIds.length}
          <div class="rpg-frame session-empty">
            <RpgTrim />
            <Icon name="check" size={32} />
            <h2>Fim da sequência</h2>
            <p>Você concluiu {finishedCount} de {session.taskIds.length} atividades. As pendentes continuam disponíveis fora da sessão.</p>
            {#if finishedCount < session.taskIds.length}
              <Button variant="secondary" onclick={revisit}>Revisar pendentes</Button>
            {/if}
            <Button onclick={finishSession}>Finalizar sessão</Button>
          </div>
        {:else if currentTask?.id}
          <div class="session-current-heading">
            <span>Missão {session.cursor + 1} de {session.taskIds.length}</span>
          </div>
          {#key currentTask.id}
            <Execution id={currentTask.id} sessionMode onSessionContinue={advance} onSessionSkip={advance} onSessionBusyChange={(blocked) => (navigationBlocked = blocked)} />
          {/key}
        {:else}
          <div class="rpg-frame session-empty">
            <RpgTrim />
            <h2>Esta missão não está mais disponível.</h2>
            <p>Ela pode ter sido arquivada. Nenhuma recompensa foi modificada.</p>
            <Button onclick={advance}>Ir para a próxima</Button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .session-page { max-width: 1180px; margin: 0 auto; }
  .session-progress { padding: 1rem 1.25rem; margin: 1rem 0; }
  .session-progress-heading { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: .6rem; flex-wrap: wrap; }
  .session-progress-heading span { color: #b7c5bb; font-size: .85rem; }
  progress { display: block; width: 100%; accent-color: #d8a755; }
  .session-columns { display: grid; grid-template-columns: minmax(210px, 280px) minmax(0, 1fr); gap: 1rem; align-items: start; }
  .session-queue { padding: 1.1rem; }
  .session-queue h2, .session-empty h2 { font: 500 1.45rem var(--lmu-display); margin: .2rem 0 1rem; }
  .session-queue ol { padding: 0; list-style: none; margin: 0 0 .7rem; }
  .session-queue li { border-top: 1px solid #a27c433b; }
  .queue-entry { display: flex; align-items: center; }
  .session-queue li .queue-entry > button { flex: 1; min-width: 0; border: 0; border-left: 3px solid transparent; background: none; color: #e8e1d3; display: flex; gap: .7rem; align-items: center; text-align: left; padding: .7rem .25rem; cursor: pointer; }
  .queue-reorder { display: flex; flex-direction: column; }
  .queue-remove { display: block; max-width: 100%; margin: 0 .25rem .6rem; padding: .4rem; color: #d8b16e; border: 1px solid #a27c4377; border-radius: .3rem; background: transparent; font: inherit; font-size: .78rem; cursor: pointer; }
  .queue-remove:hover { background: #a27c4326; }
  .queue-remove:disabled { opacity: .4; cursor: default; }
  .queue-reorder button { color: #d8b16e; border: 0; background: transparent; padding: .15rem .4rem; cursor: pointer; }
  .queue-reorder button:disabled { opacity: .22; cursor: default; }
  .session-queue li .queue-entry > button:hover, .session-queue li .queue-entry > button.chosen { background: #a27c4326; border-left-color: #deb466; }
  .queue-number { display: grid; place-items: center; width: 27px; height: 27px; flex: 0 0 27px; border: 1px solid #a27c4377; border-radius: .3rem; font-variant-numeric: tabular-nums; }
  .queue-copy { min-width: 0; }
  .queue-copy strong { display: block; font-size: .88rem; overflow-wrap: anywhere; }
  .queue-copy small { display: block; font-size: .73rem; color: #b8c5bd; margin-top: .2rem; }
  .session-queue .lmu-hint { color: #b3c0b7; font-size: .78rem; }
  .session-current { min-width: 0; }
  .session-current-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; color: #e7c782; font-size: .85rem; }
  .session-empty { padding: 1.5rem; display: grid; justify-items: start; gap: .7rem; }
  .session-empty p { color: #bcc7bb; }
  @media (max-width: 800px) {
    .session-columns { grid-template-columns: minmax(0, 1fr); }
    .session-queue { padding: .8rem; }
    .session-queue ol { display: flex; overflow-x: auto; gap: .4rem; }
    .session-queue li { flex: 0 0 165px; border-top: 0; border: 1px solid #a27c433b; }
  }
</style>
