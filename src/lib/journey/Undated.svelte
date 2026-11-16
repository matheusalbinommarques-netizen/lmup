<script lang="ts">
  import { tick } from 'svelte';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import type { Task } from '$services/db';
  import {
    ageLabel,
    inboxView,
    setTaskDay,
    TRIAGE_DAYS,
    type DayTarget,
  } from '$services/inbox';
  import { dayLabel, minutesLabel } from '$services/capture';
  import { dateKey } from '$services/rewardService';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import Button from '$lib/ui/Button.svelte';
  import CaptureField from './CaptureField.svelte';
  import DayPicker from './DayPicker.svelte';

  // Missões › Sem dia (design P2): Caixa de entrada + Algum dia.
  let { snapshot }: { snapshot: JourneySnapshot } = $props();
  const SOMEDAY_PREVIEW = 5;
  const view = $derived(inboxView(snapshot, dateKey()));
  let showAllSomeday = $state(false),
    busy = $state(false),
    notice = $state(''),
    error = $state('');
  let inboxHeading = $state<HTMLElement>(),
    somedayHeading = $state<HTMLElement>();
  const areaName = (task: Task) =>
    snapshot.areas.find((area) => area.id === (task.areaId ?? 0))?.nome ?? null;
  const meta = (task: Task) =>
    [
      task.estimatedMinutes
        ? minutesLabel(task.estimatedMinutes)
        : 'sem duração',
      areaName(task),
    ]
      .filter(Boolean)
      .join(' · ');
  const somedayShown = $derived(
    showAllSomeday ? view.someday : view.someday.slice(0, SOMEDAY_PREVIEW),
  );

  async function move(
    task: Task,
    target: DayTarget,
    from: 'inbox' | 'someday',
  ) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await setTaskDay(task.id!, target, crypto.randomUUID());
      const where =
        target === 'someday'
          ? 'Algum dia'
          : target === 'inbox'
            ? 'a Caixa de entrada'
            : dayLabel(target.day, dateKey());
      notice = `${task.title} foi para ${where}.`;
      // A linha sai da lista: o foco volta ao título da seção.
      await tick();
      (from === 'inbox' ? inboxHeading : somedayHeading)?.focus();
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível mover.';
    } finally {
      busy = false;
    }
  }
</script>

<div class="undated">
  <CaptureField />
  {#if error}<p role="alert" class="undated-error">{error}</p>{/if}
  <p role="status" class="undated-notice">{notice}</p>
  <div class="undated-columns">
    <section class="inbox" aria-labelledby="inbox-title">
      <header>
        <h2 id="inbox-title" tabindex="-1" bind:this={inboxHeading}>
          Caixa de entrada
        </h2>
        <span>{view.inbox.length} · capturadas, ainda sem decisão</span>
      </header>
      {#if view.inbox.length}<ul>
          {#each view.inbox as item (item.task.id)}<li class="inbox-row">
              <div class="inbox-text">
                <a href={`/missao/${item.task.id}`}>{item.task.title}</a>
                <span class="inbox-meta"
                  >{ageLabel(item)} · {meta(item.task)}{#if item.triage}&nbsp;·
                    entra na triagem da revisão semanal{/if}{#if item.task.importance === 'high'}<span
                      class="badge-high">Importância alta</span
                    >{/if}</span
                >
              </div>
              <div class="inbox-actions">
                <Button
                  variant="secondary"
                  size="s"
                  disabled={busy}
                  aria-label={`Levar ${item.task.title} para hoje`}
                  onclick={() => move(item.task, { day: dateKey() }, 'inbox')}
                  >Hoje</Button
                >
                <DayPicker
                  tasks={snapshot.tasks}
                  title={item.task.title}
                  text="Escolher dia"
                  onchoose={(day) => move(item.task, { day }, 'inbox')}
                />
                <Button
                  variant="quiet"
                  size="s"
                  disabled={busy}
                  aria-label={`Mover ${item.task.title} para Algum dia`}
                  onclick={() => move(item.task, 'someday', 'inbox')}
                  >Algum dia</Button
                >
              </div>
            </li>{/each}
        </ul>{:else}<p class="undated-empty">
          Caixa vazia. O que você capturar sem dia aparece aqui, até você
          decidir quando fazer.
        </p>{/if}
      <p class="undated-hint">
        Sem dia não entra no Hoje nem ganha selo de parada. Com {TRIAGE_DAYS} dias
        na caixa, o item entra na triagem da revisão semanal.
      </p>
    </section>
    <section class="someday" aria-labelledby="someday-title">
      <header>
        <h2 id="someday-title" tabindex="-1" bind:this={somedayHeading}>
          Algum dia
        </h2>
        <span
          >{view.someday.length === 1
            ? '1 ideia'
            : `${view.someday.length} ideias`}</span
        >
      </header>
      <p class="someday-note">
        Sem prazo e sem cobrança. Não entram no Hoje nem na triagem.
      </p>
      {#if view.someday.length}<ul>
          {#each somedayShown as task (task.id)}<li class="someday-row">
              <a href={`/missao/${task.id}`}>{task.title}</a>
              <DayPicker
                tasks={snapshot.tasks}
                title={task.title}
                text="Trazer para a semana"
                onchoose={(day) => move(task, { day }, 'someday')}
              />
              <ContextMenu label={`Mais ações para ${task.title}`}>
                <Button
                  variant="quiet"
                  onclick={() => move(task, 'inbox', 'someday')}
                  >Voltar para a caixa</Button
                >
              </ContextMenu>
            </li>{/each}
        </ul>
        {#if view.someday.length > SOMEDAY_PREVIEW}<Button
            variant="quiet"
            size="s"
            aria-expanded={showAllSomeday}
            onclick={() => (showAllSomeday = !showAllSomeday)}
            >{showAllSomeday
              ? 'Mostrar menos'
              : `Ver as ${view.someday.length} →`}</Button
          >{/if}
      {:else}<p class="undated-empty">
          Nada por aqui. Escreva “algum dia” na captura para guardar uma ideia
          sem prazo.
        </p>{/if}
    </section>
  </div>
</div>

<style>
  .undated {
    display: grid;
    gap: 18px;
  }
  .undated-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
  }
  h2 {
    margin: 0;
    font:
      500 1.625rem 'LMUP Cormorant',
      Georgia,
      serif;
    color: var(--lmu-text, #eee9db);
  }
  h2:focus-visible {
    outline: 2px solid var(--lmu-focus, #b8e5dc);
    outline-offset: 3px;
  }
  header span,
  .someday-note,
  .undated-hint,
  .undated-empty {
    font-size: 0.82rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .inbox header {
    padding-bottom: 8px;
    border-bottom: 1px solid var(--lmu-line, #3b5047);
  }
  .inbox-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    min-height: 56px;
    padding: 6px 4px;
    border-bottom: 1px solid var(--lmu-raised, #1d302d);
  }
  .inbox-text {
    flex: 1 1 260px;
    min-width: 0;
    display: grid;
    gap: 2px;
  }
  .inbox-text a,
  .someday-row a {
    color: var(--lmu-text, #eee9db);
    font-weight: 600;
    text-decoration: none;
  }
  .inbox-text a:hover,
  .someday-row a:hover {
    text-decoration: underline;
  }
  .inbox-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    font-size: 0.82rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .badge-high {
    padding: 0 6px;
    border: 1px solid #ecc36f66;
    border-radius: 4px;
    background: #ecc36f12;
    color: #ead9ad;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .inbox-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .someday {
    display: grid;
    gap: 10px;
    padding: 16px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 10px;
    background: var(--lmu-surface, #101f23);
  }
  .someday-note {
    margin: 0;
  }
  .someday-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    border-top: 1px solid var(--lmu-line, #3b5047);
  }
  .someday-row a {
    flex: 1 1 10rem;
    min-width: 0;
    font-weight: 400;
  }
  .undated-hint {
    margin: 10px 0 0;
  }
  .undated-error {
    margin: 0;
    color: var(--lmu-danger, #ffb4a9);
  }
  .undated-notice {
    margin: 0;
    color: var(--lmu-positive, #7bc4b1);
  }
  .undated-notice:empty {
    display: none;
  }
  @media (max-width: 900px) {
    .undated-columns {
      grid-template-columns: minmax(0, 1fr);
    }
    .inbox-actions {
      flex-wrap: wrap;
    }
    .inbox-actions :global(.lmu-button),
    .inbox-actions :global(.context-trigger) {
      min-height: 44px;
    }
  }
</style>
