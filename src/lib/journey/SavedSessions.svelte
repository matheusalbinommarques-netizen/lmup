<script lang="ts">
  import SessionSummary from './SessionSummary.svelte';
  import { isOpenSession } from '$services/sessionLifecycle';
  import { reconcileSessions } from '$services/savedSessionService';
  import SessionSelection from './SessionSelection.svelte';
  import EndSessionButton from './EndSessionButton.svelte';
  import { summarizeSession } from '$services/sessionSummary';
  import { formatCalendar } from '$services/calendar';
  import { onMount } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import {
    saveSession,
    completeSessionOccurrence,
  } from '$services/savedSessionService';
  import {
    readJourneySnapshot,
    type JourneySnapshot,
  } from '$services/journeyQuery';
  import { calculateReward } from '$services/rewardService';
  import { occurrenceDue, progressTarget } from '$services/productivityRules';
  import { areaIconKey } from '$services/areaIcons';
  import { isPersonalTask } from '$services/personalTaskDeletion';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import ReviewForm from './ReviewForm.svelte';
  import TaskRemovalDialog from './TaskRemovalDialog.svelte';
  import type { RemovalMode } from '$services/taskRemoval';
  import { guardUpdates } from './guardUpdates';
  import type {
    SavedMissionSession,
    Occurrence,
  } from '$services/productivityTypes';
  import { fraction } from '$services/productivityRules';
  import OccurrenceExecution from './OccurrenceExecution.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Execution from './Execution.svelte';
  import { dateKey } from '$services/rewardService';
  import { goto } from '$app/navigation';
  import type { Task } from '$services/db';
  let session = $state<SavedMissionSession>(),
    rows = $state<Occurrence[]>([]),
    tasks = $state<Task[]>([]),
    error = $state(''),
    busy = $state(false);
  let executionBusy = $state(false);
  let snapshot = $state<JourneySnapshot>();
  let forceOccurrence = $state(false);
  let detailed = $state(false),
    sequenceOpen = $state(false);
  let editOpen = $state(false),
    reviewOpen = $state(false),
    removalOpen = $state(false);
  let removalMode = $state<RemovalMode>('archive');
  let feedback = $state('');
  let addOpen = $state(false);
  let finishedSession = $state<SavedMissionSession>();
  guardUpdates(
    () =>
      busy || executionBusy || editOpen || reviewOpen || removalOpen || addOpen,
  );
  $effect(() => {
    if (!session) executionBusy = false;
  });
  const observedRevisions = new SvelteMap<string, number>();
  onMount(() => {
    void reconcileSessions().catch(
      () => (error = 'Não foi possível atualizar as sessões.'),
    );
    const sub = liveQuery(async () => ({
      sessions: await db.savedMissionSessions.toArray(),
      journey: await readJourneySnapshot(),
    })).subscribe({
      next: (data) => {
        if (
          session &&
          data.sessions.some(
            (row) => row.id === session!.id && !isOpenSession(row),
          )
        ) {
          const closed = data.sessions.find((row) => row.id === session!.id)!;
          if (closed.closedReason === 'completed') finishedSession = session;
          session = undefined;
        }
        const active = data.sessions.find((row) => row.status === 'active');
        if (!active || finishedSession) session = undefined;
        else if (active.revision >= (observedRevisions.get(active.id) ?? 0)) {
          session = active;
          observedRevisions.set(active.id, active.revision);
        }
        snapshot = data.journey;
        rows = data.journey.occurrences;
        tasks = data.journey.tasks;
      },
      error: () => (error = 'Não foi possível abrir sua sessão.'),
    });
    const media = window.matchMedia('(min-width: 761px)');
    const resize = () => (sequenceOpen = media.matches);
    resize();
    media.addEventListener('change', resize);
    return () => {
      sub.unsubscribe();
      media.removeEventListener('change', resize);
    };
  });
  const summary = $derived(
    session && snapshot ? summarizeSession(session, snapshot) : undefined,
  );
  const current = $derived(
    session
      ? rows.find((row) => row.id === session!.occurrenceIds[session!.cursor])
      : undefined,
  );
  const currentTask = $derived(
    tasks.find((task) => task.id === current?.taskId),
  );
  const canUseTaskExecution = $derived(
    current &&
      currentTask &&
      (!currentTask.recurrence || current.originDate === dateKey()) &&
      ['direct', 'steps'].includes(current.tracking?.method ?? 'direct') &&
      JSON.stringify(current.tracking) ===
        JSON.stringify(currentTask.tracking) &&
      JSON.stringify(current.steps) ===
        JSON.stringify(currentTask.subtasks ?? []) &&
      current.baseXp === currentTask.xp &&
      (current.definitionRevision === undefined ||
        current.definitionRevision === (currentTask.definitionRevision ?? 0)) &&
      current.title === currentTask.title &&
      current.areaId === (currentTask.areaId ?? 0) &&
      (current.projectId ?? null) === (currentTask.projectId ?? null) &&
      (current.plannedTime ?? null) === (currentTask.plannedTime ?? null),
  );
  async function update(patch: Partial<SavedMissionSession>) {
    if (!session || busy || executionBusy) return false;
    busy = true;
    error = '';
    try {
      const saved = await saveSession(
        { ...session, ...patch },
        session.revision,
      );
      observedRevisions.set(saved.id, saved.revision);
      session = saved.status === 'active' ? saved : undefined;
      return true;
    } catch (cause) {
      error =
        'Não foi possível salvar a sessão. ' +
        (cause instanceof Error ? cause.message : 'Tente novamente.');
      return false;
    } finally {
      busy = false;
    }
  }
  function move(index: number, direction: number) {
    if (!session) return;
    const ids = [...session.occurrenceIds],
      target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const selected = ids[session.cursor];
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void update({
      occurrenceIds: ids,
      cursor: Math.max(0, ids.indexOf(selected)),
    });
  }
  function remove(id: string) {
    if (!session) return;
    const ids = session.occurrenceIds.filter((item) => item !== id);
    if (!ids.length) {
      void update({ status: 'ended', occurrenceIds: [], cursor: 0 });
      return;
    }
    void update({
      occurrenceIds: ids,
      cursor: Math.max(
        0,
        Math.min(
          ids.length,
          session.cursor -
            (session.occurrenceIds.indexOf(id) < session.cursor ? 1 : 0),
        ),
      ),
    });
  }
  const completed = $derived(
    session?.occurrenceIds.filter(
      (id) => rows.find((row) => row.id === id)?.status === 'completed',
    ).length ?? 0,
  );
  const total = $derived(session?.occurrenceIds.length ?? 0);
  const percent = $derived(total ? Math.round((completed * 100) / total) : 0);
  const quickEligible = $derived(
    !!current &&
      !!currentTask &&
      !currentTask.archived &&
      !currentTask.reviewEnabled &&
      !current.planningSuspended &&
      current.plannedDate <= dateKey() &&
      !['completed', 'excused', 'discarded'].includes(current.status) &&
      (current.tracking?.method ?? 'direct') === 'direct',
  );
  const reward = $derived.by(() => {
    if (!current || !snapshot?.profile) return null;
    try {
      const modifiers =
        current.modifiers ??
        calculateReward(
          current.baseXp,
          snapshot.profile,
          snapshot.mods,
          snapshot.buffs,
        ).modifiers;
      const target = occurrenceDue(
        { ...current, modifiers },
        progressTarget(current),
      );
      return {
        xp: Math.max(0, target.xp - current.due.xp),
        gold: Math.max(0, target.gold - current.due.gold),
        food: Math.max(0, target.food - current.due.food),
      };
    } catch {
      return null;
    }
  });
  const areaLabel = (row: Occurrence) =>
    snapshot?.areas.find((area) => area.id === row.areaId)?.nome ?? 'Geral';
  const icon = (row: Occurrence) =>
    areaIconKey(
      { areaId: row.areaId },
      snapshot?.areas ?? [],
      snapshot?.profile?.generalAreaIconKey,
    );
  function select(index: number) {
    if (executionBusy || busy) return;
    detailed = false;
    forceOccurrence = false;
    sequenceOpen = window.matchMedia('(min-width: 761px)').matches;
    void update({ cursor: index });
  }
  function skip() {
    if (!session) return;
    select(Math.min(session.cursor + 1, total));
  }
  async function quickComplete() {
    if (!session || !current || !quickEligible || busy || executionBusy) return;
    const title = current.title;
    const running = session;
    busy = true;
    error = '';
    try {
      const result = await completeSessionOccurrence({
        sessionId: session.id,
        expectedSessionRevision: session.revision,
        occurrenceId: current.id,
        expectedOccurrenceRevision: current.revision,
        requestId: `quick:${session.id}:${current.id}:${current.revision}`,
      });
      observedRevisions.set(result.session.id, result.session.revision);
      if (result.session.status === 'ended') {
        finishedSession = running;
        session = undefined;
      } else session = result.session;
      feedback = result.event
        ? `${title} concluída · +${result.event.reward.xp} XP · +${result.event.reward.gold} Ouro${result.event.reward.food ? ` · +${result.event.reward.food} Comida` : ''}`
        : 'Esta conclusão já estava registrada. Nenhuma recompensa foi duplicada.';
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível concluir. Seu progresso foi preservado.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Sessão de missões · Level Me Up</title></svelte:head>
<section class="rpg-theme saved-sessions">
  <a class="journey-link session-back" href="/missoes">← Voltar às missões</a>
  {#if session}
    <header class="session-heading">
      <div>
        <p class="lmu-eyebrow">Uma atividade de cada vez</p>
        <h1>{session.name}</h1>
      </div>
      <div class="session-tools">
        <Button
          variant="secondary"
          disabled={busy || executionBusy}
          onclick={() => (addOpen = true)}>+ Adicionar missões</Button
        >
        <Button
          variant="secondary"
          disabled={busy || executionBusy}
          onclick={() =>
            update({ mode: session!.mode === 'focus' ? 'overview' : 'focus' })}
          >{session.mode === 'focus' ? 'Visão geral' : 'Modo foco'}</Button
        >
        <Button
          variant="secondary"
          disabled={busy || executionBusy}
          onclick={async () => {
            if (await update({ status: 'paused' }))
              await goto('/missoes?view=sessions');
          }}>Pausar sessão</Button
        >
        <EndSessionButton
          {session}
          disabled={busy || executionBusy}
          onbusy={(value) => (busy = value)}
          onended={() => goto('/missoes')}
        />
      </div>
    </header>
    <div class="session-progress rpg-frame">
      <span>Progresso da sessão</span><progress
        value={completed}
        max={Math.max(1, total)}
        aria-label="Progresso da sessão"
      ></progress><strong
        >{completed} de {total} concluídas <small>({percent}%)</small></strong
      >
    </div>
    {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
    {#if summary?.dates.some((day) => day !== dateKey())}<p
        class="journey-banner"
      >
        Execução anterior: {summary.dates.map(formatCalendar).join(' · ')}. As
        ocorrências originais foram preservadas.
        <a href="/missoes?view=routines">Ver rotinas do dia atual</a>
      </p>{/if}
    <div class="session-layout" class:overview={session.mode === 'overview'}>
      <aside aria-label="Fila de missões">
        <details class="queue-panel rpg-frame" bind:open={sequenceOpen}>
          <summary>Sequência <span>{total} atividades</span></summary>
          <ol>
            {#each session.occurrenceIds as id, index (id)}{@const row =
                rows.find((row) => row.id === id)}
              <li class:chosen={index === session.cursor}>
                <button
                  class="queue-title"
                  aria-label={`${row?.title} ${row?.status === 'completed' ? 'Concluída' : row?.value ? 'Parcial' : 'Pendente'}`}
                  aria-pressed={index === session.cursor}
                  disabled={busy || executionBusy}
                  onclick={() => select(index)}
                  ><span class="sequence-state"
                    >{row?.status === 'completed' ? '✓' : index + 1}</span
                  >{#if row}<ApprovedIcon
                      name={icon(row)}
                      size={26}
                    />{/if}<span class="queue-copy"
                    ><strong>{row?.title ?? 'Ocorrência indisponível'}</strong
                    ><small
                      >{row?.status === 'completed'
                        ? 'Concluída'
                        : row?.value
                          ? 'Parcial'
                          : 'Pendente'} · {row
                        ? Math.round(fraction(row) * 100)
                        : 0}%</small
                    ></span
                  ></button
                >
                <ContextMenu label={`Organizar ${row?.title ?? 'atividade'}`}
                  ><Button
                    variant="quiet"
                    disabled={busy || executionBusy || index === 0}
                    aria-label={`Mover ${row?.title} para cima`}
                    onclick={() => move(index, -1)}>Mover para cima</Button
                  ><Button
                    variant="quiet"
                    disabled={busy || executionBusy || index === total - 1}
                    aria-label={`Mover ${row?.title} para baixo`}
                    onclick={() => move(index, 1)}>Mover para baixo</Button
                  >{#if row?.status !== 'completed'}<Button
                      variant="quiet"
                      disabled={busy || executionBusy}
                      aria-label={`Remover da sessão: ${row?.title}`}
                      onclick={() => remove(id)}>Remover da sessão</Button
                    >{/if}</ContextMenu
                >
              </li>
            {/each}
          </ol>
        </details>
      </aside>
      {#if current}<section
          class="activity-panel rpg-frame"
          aria-label="Atividade selecionada"
        >
          <div class="activity-top">
            <p class="lmu-eyebrow">Atividade {session.cursor + 1} de {total}</p>
            <ContextMenu label="Ações da atividade selecionada"
              ><Button
                variant="quiet"
                disabled={busy ||
                  executionBusy ||
                  !currentTask ||
                  currentTask.archived}
                onclick={() => (editOpen = true)}>Editar missão</Button
              ><Button
                variant="quiet"
                disabled={busy ||
                  executionBusy ||
                  !currentTask ||
                  currentTask.archived}
                onclick={() => (reviewOpen = true)}>Configurar revisão</Button
              ><Button
                variant="quiet"
                disabled={busy || executionBusy}
                onclick={() => {
                  forceOccurrence = true;
                  detailed = true;
                }}>Registrar progresso parcial</Button
              >{#if current.status !== 'completed'}<Button
                  variant="quiet"
                  disabled={busy || executionBusy}
                  onclick={() => remove(current!.id)}>Remover da sessão</Button
                >{/if}{#if currentTask && !currentTask.archived}<Button
                  variant="quiet"
                  disabled={busy || executionBusy}
                  onclick={() => {
                    removalMode = 'archive';
                    removalOpen = true;
                  }}>Arquivar missão</Button
                >{/if}{#if currentTask && isPersonalTask(currentTask)}<Button
                  variant="danger"
                  disabled={busy || executionBusy}
                  onclick={() => {
                    removalMode = 'delete';
                    removalOpen = true;
                  }}>Excluir definitivamente</Button
                >{/if}</ContextMenu
            >
          </div>
          <div class="activity-identity">
            <ApprovedIcon name={icon(current)} size={48} />
            <div>
              <h2>{current.title}</h2>
              <p>
                {areaLabel(current)} · {current.plannedDate
                  .split('-')
                  .reverse()
                  .join('/')}{current.plannedTime
                  ? ` · ${current.plannedTime}`
                  : ' · Flexível'}
              </p>
            </div>
          </div>
          {#if currentTask && current.definitionRevision !== undefined && current.definitionRevision !== (currentTask.definitionRevision ?? 0)}<details
              class="journey-banner frozen-notice"
              open={detailed}
            >
              <summary>Configuração desta execução preservada</summary>
              <p>
                Esta execução mantém a configuração anterior da missão. As
                alterações do cadastro valem para as próximas ocorrências.
              </p>
            </details>{/if}
          {#if summary?.outside.includes(current.id)}<p class="lmu-hint">
              Concluída individualmente, fora desta sessão. A mesma ocorrência
              conta no progresso, sem nova recompensa.
            </p>{/if}
          <div
            class="execution-mode"
            role="group"
            aria-label="Modo de execução"
          >
            <Button
              variant="secondary"
              aria-pressed={!detailed}
              disabled={busy || executionBusy}
              onclick={() => (detailed = false)}>Conclusão rápida</Button
            ><Button
              variant="secondary"
              aria-pressed={detailed}
              disabled={busy || executionBusy}
              onclick={() => (detailed = true)}>Execução detalhada</Button
            >
          </div>
          {#if !detailed}
            <div class="quick-execution" class:eligible={quickEligible}>
              <p>
                {current.status === 'completed'
                  ? 'Esta atividade já está concluída. Sua recompensa continua registrada.'
                  : quickEligible
                    ? 'Terminou esta atividade? Registre a conclusão e siga para a próxima pendente.'
                    : 'Esta atividade usa acompanhamento específico. Registre o progresso na execução detalhada.'}
              </p>
              {#if reward && current.status !== 'completed'}<div
                  class="expected-reward"
                >
                  <span>Recompensa restante na meta</span><strong
                    ><ApprovedIcon name="xp" size={23} />+{reward.xp} XP</strong
                  ><strong
                    ><ApprovedIcon name="ouro" size={23} />+{reward.gold} Ouro</strong
                  >{#if reward.food}<small>+{reward.food} Comida</small>{/if}
                </div>{/if}
              {#if quickEligible}<Button
                  aria-label="Concluir missão"
                  disabled={busy || executionBusy}
                  loading={busy}
                  onclick={quickComplete}>✓ Concluir missão</Button
                >{:else if current.status !== 'completed'}<Button
                  variant="secondary"
                  onclick={() => (detailed = true)}
                  >Abrir execução detalhada</Button
                >{/if}
            </div>
            {#if feedback}<p class="session-feedback" role="status">
                {feedback}
              </p>{/if}
            <div class="activity-navigation">
              <Button
                variant="quiet"
                disabled={busy || executionBusy || session.cursor === 0}
                onclick={() => select(session!.cursor - 1)}>Anterior</Button
              ><Button
                variant="quiet"
                disabled={busy || executionBusy}
                onclick={skip}>Pular por agora</Button
              ><Button
                variant="secondary"
                disabled={busy || executionBusy || session.cursor >= total - 1}
                onclick={() => select(session!.cursor + 1)}
                >Próxima atividade</Button
              >
            </div>
            <details class="session-notes">
              <summary>Notas da missão</summary>
              <p>{currentTask?.executionNotes || 'Nenhuma nota registrada.'}</p>
              <Button variant="quiet" onclick={() => (detailed = true)}
                >Consultar e editar notas</Button
              >
            </details>
          {:else}
            <div class="detailed-execution">
              {#key current.id}{#if currentTask && canUseTaskExecution && !forceOccurrence}<Execution
                    id={currentTask.id!}
                    sessionMode
                    sessionId={session.id}
                    compact
                    onOpenProgress={() => (forceOccurrence = true)}
                    onSessionContinue={() =>
                      select(Math.min(session!.cursor + 1, total))}
                    onSessionBusyChange={(value) => (executionBusy = value)}
                    onSessionSkip={skip}
                  />{:else}<OccurrenceExecution
                    id={current.id}
                    sessionId={session.id}
                    onBusyChange={(value) => (executionBusy = value)}
                  />{/if}{/key}
            </div>
            {#if feedback}<p class="session-feedback" role="status">
                {feedback}
              </p>{/if}
            <div class="activity-navigation">
              <Button
                variant="quiet"
                disabled={busy || executionBusy || session.cursor === 0}
                onclick={() => select(session!.cursor - 1)}>Anterior</Button
              ><Button
                variant="secondary"
                disabled={busy || executionBusy || session.cursor >= total - 1}
                onclick={() => select(session!.cursor + 1)}
                >Próxima atividade</Button
              >
            </div>
          {/if}
        </section>{:else}<section class="rpg-frame session-empty">
          <ApprovedIcon name="concluida" size={50} />
          <h2>Fim da sequência</h2>
          {#if feedback}<p class="session-feedback" role="status">
              {feedback}
            </p>{/if}
          <p>
            {completed === total
              ? 'Todas as atividades foram concluídas. As recompensas já estão registradas.'
              : 'As atividades pendentes e seu progresso foram preservados.'}
          </p>
          <div class="session-tools">
            <Button
              variant="secondary"
              onclick={() =>
                select(
                  Math.max(
                    0,
                    session!.occurrenceIds.findIndex(
                      (id) =>
                        rows.find((row) => row.id === id)?.status !==
                        'completed',
                    ),
                  ),
                )}>Revisar pendentes</Button
            ><EndSessionButton
              {session}
              disabled={busy || executionBusy}
              onbusy={(value) => (busy = value)}
              onended={() => goto('/missoes')}
            />
          </div>
        </section>{/if}
    </div>
    {#if snapshot}<SessionSummary {session} data={snapshot} />{/if}
    {#if snapshot}
      <SessionSelection
        bind:open={addOpen}
        {snapshot}
        targetSession={session}
        onadded={() =>
          (feedback =
            'Missões adicionadas ao fim da fila. Seu progresso foi preservado.')}
      />
    {/if}
    {#if snapshot && currentTask}<QuickCreate
        bind:open={editOpen}
        {snapshot}
        editTask={currentTask}
        oncreated={() =>
          (feedback =
            'Missão atualizada. A configuração desta execução foi preservada.')}
      /><ReviewForm
        bind:open={reviewOpen}
        task={currentTask}
      /><TaskRemovalDialog
        bind:open={removalOpen}
        task={currentTask}
        mode={removalMode}
        onremoved={(mode) =>
          (feedback =
            mode === 'delete'
              ? 'Missão excluída definitivamente. Seus saldos foram preservados.'
              : 'Missão arquivada. As demais atividades foram preservadas.')}
      />{/if}
  {:else if finishedSession && snapshot}<div
      class="rpg-frame session-empty"
      role="status"
    >
      <ApprovedIcon name="concluida" size={64} />
      <h1>Sessão concluída</h1>
      <p>
        {finishedSession.occurrenceIds.length} de {finishedSession.occurrenceIds
          .length} atividades concluídas.
      </p>
      <p>
        As recompensas já foram registradas nas missões. Esta sessão não aparece
        mais em Sessões ativas.
      </p>
      <SessionSummary session={finishedSession} data={snapshot} />
      <a class="lmu-button lmu-button--primary" href="/missoes"
        >Voltar às missões</a
      >
    </div>
  {:else}<div class="rpg-frame session-empty">
      <h1>Nenhuma sessão em foco.</h1>
      <p>
        Retome uma sessão pausada ou monte outra nas missões. Seu progresso
        continua preservado.
      </p>
      <a class="lmu-button lmu-button--primary" href="/missoes?view=sessions"
        >Ver sessões ativas</a
      >
    </div>{/if}
</section>

<style>
  .saved-sessions {
    max-width: 1260px;
    margin: auto;
    min-width: 0;
  }
  .session-back {
    display: inline-flex;
    margin-bottom: 12px;
    font-size: 0.8rem;
  }
  .session-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 14px;
  }
  .session-heading h1 {
    font: 500 clamp(1.8rem, 3vw, 2.6rem) var(--lmu-display);
    color: #efcf87;
    margin: 3px 0 0;
  }
  .session-heading .lmu-eyebrow {
    font-size: 0.67rem;
    margin: 0;
  }
  .session-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .session-tools :global(.lmu-button) {
    font-size: 0.78rem;
    padding: 7px 10px;
    min-height: 36px;
  }
  .session-progress {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 13px;
    margin-bottom: 14px;
    font-size: 0.78rem;
  }
  progress {
    accent-color: #e1b959;
    height: 9px;
    min-width: 70px;
    flex: 1;
  }
  .session-progress strong {
    color: #ead4a2;
    font-weight: 500;
    white-space: nowrap;
  }
  .session-progress small {
    color: #adbfae;
  }
  .session-layout {
    display: grid;
    grid-template-columns: 278px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }
  .session-layout.overview {
    grid-template-columns: 1fr;
  }
  .session-layout.overview ol {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 5px;
  }
  aside {
    min-width: 0;
  }
  .queue-panel {
    overflow: hidden;
  }
  .queue-panel > summary {
    cursor: pointer;
    padding: 12px;
    font: 500 1.2rem var(--lmu-display);
    color: #e7d2a0;
    border-bottom: 1px solid #8a72433d;
  }
  .queue-panel > summary span {
    float: right;
    color: #aabcae;
    font: 400 0.76rem var(--lmu-font);
    margin-top: 4px;
  }
  ol {
    list-style: none;
    margin: 0;
    padding: 5px;
    max-height: 60dvh;
    overflow-y: auto;
  }
  li {
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    border-bottom-color: #89704430;
    border-radius: 5px;
    min-width: 0;
  }
  li.chosen {
    background: #bd91432b;
    border-color: #b38b42;
  }
  .queue-title {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    background: transparent;
    border: 0;
    color: #e5dfc7;
    padding: 9px 5px;
    text-align: left;
    cursor: pointer;
    min-width: 0;
  }
  .sequence-state {
    color: #d2b368;
    font-size: 0.75rem;
    min-width: 14px;
  }
  .queue-copy {
    min-width: 0;
  }
  .queue-copy strong {
    display: block;
    font: 500 1.05rem var(--lmu-display);
    overflow-wrap: anywhere;
  }
  .queue-copy small {
    display: block;
    color: #a8baa9;
    font-size: 0.68rem;
    margin-top: 4px;
  }
  .activity-panel {
    padding: 16px;
    min-width: 0;
  }
  .activity-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .activity-top p {
    margin: 0;
    font-size: 0.7rem;
  }
  .activity-identity {
    display: flex;
    align-items: center;
    gap: 13px;
    margin: 2px 0 16px;
  }
  .activity-identity > div {
    min-width: 0;
  }
  .activity-identity h2 {
    color: #eddbaf;
    font: 500 clamp(1.7rem, 2.6vw, 2.2rem)/1.15 var(--lmu-display);
    margin: 0 0 7px;
    overflow-wrap: anywhere;
  }
  .activity-identity p {
    color: #aebfae;
    font-size: 0.78rem;
    margin: 0;
  }
  .execution-mode {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    padding-bottom: 12px;
    border-bottom: 1px solid #8b704534;
  }
  .execution-mode :global(.lmu-button) {
    min-height: 39px;
    font-size: 0.83rem;
    padding: 7px;
  }
  .execution-mode :global([aria-pressed='true']) {
    background: linear-gradient(#765725, #352c1c);
    border-color: #b68a3e;
    color: #ffe3a6;
  }
  .quick-execution {
    display: grid;
    gap: 16px;
    padding: 14px 0;
  }
  .quick-execution > p {
    font-size: 0.87rem;
    line-height: 1.5;
    color: #c2cfbd;
    margin: 0;
  }
  .quick-execution > :global(.lmu-button) {
    width: 100%;
    min-height: 48px;
    font-size: 1.05rem;
  }
  .expected-reward {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.8rem;
    color: #c8b888;
  }
  .expected-reward > span {
    width: 100%;
  }
  .expected-reward strong {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #f0cd7b;
    font-weight: 500;
  }
  .expected-reward small {
    color: #b7c7ac;
  }
  .activity-navigation {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 6px;
    margin-top: 5px;
  }
  .activity-navigation :global(.lmu-button) {
    padding: 7px 10px;
    font-size: 0.77rem;
    min-height: 36px;
  }
  .session-notes {
    border-top: 1px solid #8b704534;
    padding-top: 12px;
    margin-top: 14px;
    color: #c8c7ae;
    font-size: 0.8rem;
  }
  .session-notes summary {
    cursor: pointer;
  }
  .session-notes p {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .detailed-execution {
    margin-top: 12px;
  }
  .frozen-notice {
    font-size: 0.75rem;
    padding: 8px;
  }
  .session-feedback {
    padding: 9px 12px;
    border: 1px solid #8c794c66;
    border-radius: 6px;
    background: #9c7b2a16;
    color: #e6ce92;
    font-size: 0.83rem;
  }
  .session-empty {
    padding: 24px;
    color: #bccbb4;
  }
  .session-empty h1,
  .session-empty h2 {
    font-family: var(--lmu-display);
    color: #e9d097;
    margin: 8px 0;
  }
  @media (max-width: 760px) {
    .session-layout {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .session-back {
      margin-bottom: 6px;
    }
    .session-heading {
      gap: 6px;
      margin-bottom: 8px;
    }
    .session-tools {
      width: 100%;
    }
    .session-tools :global(.lmu-button) {
      flex: 1;
      min-width: 0;
      font-size: 0.73rem;
      padding: 7px 6px;
    }
    .session-progress {
      padding: 6px 10px;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .session-progress > span {
      flex-basis: 100%;
    }
    .session-progress strong {
      font-size: 0.73rem;
    }
    .quick-execution.eligible > p {
      display: none;
    }
    .quick-execution > p {
      margin: 0;
      font-size: 0.8rem;
    }
    .quick-execution {
      padding: 10px 0;
      gap: 8px;
    }
    .activity-identity {
      margin: 4px 0;
    }
    .session-heading h1 {
      font-size: 1.7rem;
    }
    .session-heading .lmu-eyebrow {
      display: none;
      margin-bottom: 4px;
    }
    .activity-panel {
      padding: 12px;
    }
    .activity-identity h2 {
      font-size: 1.65rem;
    }
    .activity-navigation :global(.lmu-button) {
      padding: 6px;
      font-size: 0.7rem;
    }
    .execution-mode :global(.lmu-button) {
      font-size: 0.75rem;
    }
    ol {
      max-height: 300px;
    }
  }
</style>
