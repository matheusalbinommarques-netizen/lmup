<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import { saveSession } from '$services/savedSessionService';
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
  const observedRevisions = new SvelteMap<string, number>();
  onMount(() => {
    const sub = liveQuery(async () => ({
      sessions: await db.savedMissionSessions.toArray(),
      rows: await db.occurrences.toArray(),
      tasks: await db.tasks.toArray(),
    })).subscribe({
      next: (data) => {
        const active = data.sessions.find((row) => row.status === 'active');
        if (!active) session = undefined;
        else if (active.revision >= (observedRevisions.get(active.id) ?? 0)) {
          session = active;
          observedRevisions.set(active.id, active.revision);
        }
        rows = data.rows;
        tasks = data.tasks;
      },
      error: () => (error = 'Não foi possível abrir sua sessão.'),
    });
    return () => sub.unsubscribe();
  });
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
      current.baseXp === currentTask.xp,
  );
  async function update(patch: Partial<SavedMissionSession>) {
    if (!session || busy || executionBusy) return;
    busy = true;
    error = '';
    try {
      const saved = await saveSession(
        { ...session, ...patch },
        session.revision,
      );
      observedRevisions.set(saved.id, saved.revision);
      session = saved.status === 'active' ? saved : undefined;
    } catch (cause) {
      error =
        'Não foi possível salvar a sessão. ' +
        (cause instanceof Error ? cause.message : 'Tente novamente.');
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
</script>

<svelte:head><title>Sessão de missões · Level Me Up</title></svelte:head>
<section class="rpg-theme saved-sessions">
  <a class="journey-link" href="/missoes">← Voltar às missões</a>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  {#if session}<header class="journey-heading">
      <div>
        <p class="lmu-eyebrow">Uma atividade de cada vez</p>
        <h1>{session.name}</h1>
      </div>
      <div class="journey-actions">
        <Button
          variant="secondary"
          disabled={busy || executionBusy}
          onclick={() =>
            update({ mode: session!.mode === 'focus' ? 'overview' : 'focus' })}
          >{session.mode === 'focus' ? 'Visão geral' : 'Modo foco'}</Button
        ><a
          class="journey-link"
          href="/missoes"
          onclick={async (event) => {
            event.preventDefault();
            if (busy || executionBusy) return;
            await update({ status: 'paused' });
            await goto('/missoes');
          }}>Pausar sessão</a
        ><Button
          variant="quiet"
          disabled={busy || executionBusy}
          onclick={() => update({ status: 'ended' })}>Encerrar sessão</Button
        >
      </div>
    </header>
    <p>
      {session.occurrenceIds.filter(
        (id) => rows.find((row) => row.id === id)?.status === 'completed',
      ).length} de {session.occurrenceIds.length} missões concluídas
    </p>
    <div class="session-layout" class:overview={session.mode === 'overview'}>
      <aside class="rpg-frame" aria-label="Fila de missões">
        <ol>
          {#each session.occurrenceIds as id, index (id)}{@const row =
              rows.find((row) => row.id === id)}
            <li>
              <button
                aria-label={`${row?.title} ${row?.status === 'completed' ? 'Concluída' : row?.value ? 'Parcial' : 'Pendente'}`}
                class:chosen={index === session.cursor}
                disabled={busy || executionBusy}
                onclick={() => update({ cursor: index })}
                ><span
                  >{index + 1}. {row?.title ?? 'Ocorrência indisponível'}</span
                ><small
                  >{row ? Math.round(fraction(row) * 100) : 0}% · {row?.originDate}</small
                ></button
              >
              <div class="queue-actions">
                <Button
                  variant="quiet"
                  disabled={busy || executionBusy || index === 0}
                  aria-label={`Mover ${row?.title} para cima`}
                  onclick={() => move(index, -1)}>↑</Button
                ><Button
                  variant="quiet"
                  disabled={busy ||
                    executionBusy ||
                    index === session.occurrenceIds.length - 1}
                  aria-label={`Mover ${row?.title} para baixo`}
                  onclick={() => move(index, 1)}>↓</Button
                >{#if row?.status !== 'completed'}<Button
                    variant="quiet"
                    aria-label={`Remover da sessão: ${row?.title}`}
                    disabled={busy || executionBusy}
                    onclick={() => remove(id)}>Remover da sessão</Button
                  >{/if}
              </div>
            </li>{/each}
        </ol>
      </aside>
      {#if current}<div class="session-current">
          <p>
            Atividade {session.cursor + 1} de {session.occurrenceIds.length}
          </p>
          {#key current.id}
            {#if currentTask && canUseTaskExecution}
              <Execution
                id={currentTask.id!}
                sessionMode
                onSessionContinue={() =>
                  update({
                    cursor: Math.min(
                      session!.cursor + 1,
                      session!.occurrenceIds.length,
                    ),
                  })}
                onSessionBusyChange={(value) => (executionBusy = value)}
                onSessionSkip={() =>
                  update({
                    cursor: Math.min(
                      session!.cursor + 1,
                      session!.occurrenceIds.length,
                    ),
                  })}
              />
            {:else}<OccurrenceExecution
                id={current.id}
                onBusyChange={(value) => (executionBusy = value)}
              />{/if}
          {/key}
          <div class="journey-actions">
            <Button
              variant="secondary"
              disabled={busy || executionBusy || session.cursor === 0}
              onclick={() => update({ cursor: session!.cursor - 1 })}
              >Anterior</Button
            ><Button
              disabled={busy ||
                executionBusy ||
                session.cursor >= session.occurrenceIds.length - 1}
              onclick={() => update({ cursor: session!.cursor + 1 })}
              >Próxima atividade</Button
            >
          </div>
        </div>{:else}<section class="rpg-frame empty">
          <h2>Fim da sequência</h2>
          <p>As atividades pendentes e seu progresso foram preservados.</p>
          <Button
            onclick={() =>
              update({
                cursor: Math.max(
                  0,
                  session!.occurrenceIds.findIndex(
                    (id) =>
                      rows.find((row) => row.id === id)?.status !== 'completed',
                  ),
                ),
              })}>Revisar pendentes</Button
          >
          <Button
            onclick={async () => {
              await update({ status: 'ended' });
              await goto('/missoes');
            }}>Finalizar sessão</Button
          >
        </section>{/if}
    </div>
  {:else}<div class="rpg-frame empty">
      <h1>Nenhuma sessão em foco.</h1>
      <p>
        Nenhuma sessão está em foco. Retome uma sessão salva ou monte outra na
        agenda.
      </p>
      <a class="journey-link" href="/missoes">Escolher missões</a>
    </div>{/if}
</section>

<style>
  .saved-sessions {
    max-width: 1200px;
    margin: auto;
  }
  .session-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 1rem;
  }
  .session-layout.overview {
    grid-template-columns: 1fr;
  }
  .overview ol {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .overview li {
    flex: 1 1 220px;
  }
  aside {
    padding: 0.8rem;
  }
  ol {
    padding: 0;
    list-style: none;
  }
  li {
    border-bottom: 1px solid #aa854449;
    padding: 0.5rem 0;
  }
  li > button {
    width: 100%;
    text-align: left;
    background: transparent;
    color: #e7dcc6;
    border: 0;
    padding: 0.6rem;
    display: grid;
    gap: 0.4rem;
    cursor: pointer;
  }
  li > button.chosen {
    background: #ac88482b;
    border-left: 3px solid #cba45d;
  }
  small {
    color: #b1c0b2;
  }
  .queue-actions {
    display: flex;
    flex-wrap: wrap;
  }
  .session-current {
    min-width: 0;
  }
  .empty {
    padding: 1.5rem;
  }
  @media (max-width: 700px) {
    .session-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
