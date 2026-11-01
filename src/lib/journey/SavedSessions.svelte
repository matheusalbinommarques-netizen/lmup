<script lang="ts">
  import { onMount } from 'svelte';
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
  let session = $state<SavedMissionSession>(),
    rows = $state<Occurrence[]>([]),
    error = $state(''),
    busy = $state(false);
  onMount(() => {
    const sub = liveQuery(async () => ({
      sessions: await db.savedMissionSessions.toArray(),
      rows: await db.occurrences.toArray(),
    })).subscribe({
      next: (data) => {
        session = data.sessions.find((row) => row.status === 'active');
        rows = data.rows;
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
  async function update(patch: Partial<SavedMissionSession>) {
    if (!session || busy) return;
    busy = true;
    error = '';
    try {
      await saveSession({ ...session, ...patch }, session.revision);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar a sessão.';
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
      void update({ status: 'ended' });
      return;
    }
    void update({
      occurrenceIds: ids,
      cursor: Math.min(session.cursor, ids.length - 1),
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
          onclick={() =>
            update({ mode: session!.mode === 'focus' ? 'overview' : 'focus' })}
          >{session.mode === 'focus' ? 'Visão geral' : 'Modo foco'}</Button
        ><Button variant="quiet" onclick={() => update({ status: 'paused' })}
          >Pausar sessão</Button
        ><Button variant="quiet" onclick={() => update({ status: 'ended' })}
          >Encerrar sessão</Button
        >
      </div>
    </header>
    <p>
      {session.occurrenceIds.filter(
        (id) => rows.find((row) => row.id === id)?.status === 'completed',
      ).length} de {session.occurrenceIds.length} concluídas. Você pode sair e retomar
      sem perder progresso.
    </p>
    <div class="session-layout" class:overview={session.mode === 'overview'}>
      <aside class="rpg-frame">
        <ol>
          {#each session.occurrenceIds as id, index (index)}{@const row =
              rows.find((row) => row.id === id)}
            <li>
              <button
                class:chosen={index === session.cursor}
                disabled={busy}
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
                  disabled={index === 0}
                  onclick={() => move(index, -1)}>↑</Button
                ><Button
                  variant="quiet"
                  disabled={index === session.occurrenceIds.length - 1}
                  onclick={() => move(index, 1)}>↓</Button
                ><Button variant="quiet" onclick={() => remove(id)}
                  >Remover da sessão</Button
                >
              </div>
            </li>{/each}
        </ol>
      </aside>
      {#if current}<main>
          <p>
            Atividade {session.cursor + 1} de {session.occurrenceIds.length}
          </p>
          {#key current.id}<OccurrenceExecution id={current.id} />{/key}
          <div class="journey-actions">
            <Button
              variant="secondary"
              disabled={session.cursor === 0}
              onclick={() => update({ cursor: session!.cursor - 1 })}
              >Anterior</Button
            ><Button
              disabled={session.cursor >= session.occurrenceIds.length - 1}
              onclick={() => update({ cursor: session!.cursor + 1 })}
              >Próxima atividade</Button
            >
          </div>
        </main>{:else}<p>Selecione uma atividade da sequência.</p>{/if}
    </div>
  {:else}<div class="rpg-frame empty">
      <h1>Sessão preservada</h1>
      <p>
        Nenhuma sessão está em foco. Retome uma sessão salva ou monte outra na
        agenda.
      </p>
      <a class="journey-link" href="/missoes"
        >Abrir missões e sessões salvas →</a
      >
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
  main {
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
