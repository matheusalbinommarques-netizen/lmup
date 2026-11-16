<script lang="ts">
  import { tick } from 'svelte';
  import { liveQuery } from 'dexie';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import type { Task } from '$services/db';
  import { db } from '$services/db';
  import type { Occurrence, Routine } from '$services/productivityTypes';
  import { plannedOccurrences } from '$services/occurrenceService';
  import { addCalendarDays, calendarDate } from '$services/calendar';
  import { dateKey } from '$services/rewardService';
  import { moveId, saveDayOrder } from '$services/dayOrder';
  import { inboxView, setTaskDay } from '$services/inbox';
  import { dayLabel, minutesLabel, sentence } from '$services/capture';
  import {
    dayName,
    daySummary,
    moveToDay,
    rangeLabel,
    routinesLabel,
    weekView,
    type WeekDay,
    type WeekItem,
  } from '$services/week';
  import Button from '$lib/ui/Button.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import DayPicker from './DayPicker.svelte';
  import { todayView } from './todayView';

  // Missões › Semana (lote 5b, design P1 desktop e S1 mobile).
  let { snapshot }: { snapshot: JourneySnapshot } = $props();
  const INBOX_PREVIEW = 4;
  const today = dateKey();
  const start = $derived.by(() => {
    const date = calendarDate(page.url.searchParams.get('date') ?? '');
    return date ?? today;
  });
  let rows = $state.raw<Occurrence[]>([]),
    routines = $state.raw<Routine[]>([]),
    loaded = $state(false);
  let showRoutines = $state(false),
    reorder = $state(false),
    busy = $state(false),
    notice = $state(''),
    error = $state('');
  // Layout pela largura disponível: colunas com o Sem dia (design P1),
  // colunas sem ele, ou um dia por vez (design S1). Limites em rem: com
  // texto grande, as colunas precisam de mais espaço.
  let width = $state(0);
  const rem = $derived.by(() => {
    void width;
    return (
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    );
  });
  const narrow = $derived(width > 0 && width < 47.5 * rem);
  const wide = $derived(width >= 72 * rem);
  let open = $state<string | null>(null);
  let dragging = $state<
    { kind: 'row'; item: WeekItem; date: string } | { kind: 'task'; task: Task }
  >();
  let dropDate = $state<string | null>(null),
    dropBefore = $state<string | null>(null);
  let focusAfter = $state<{ id: string; date: string } | null>(null);
  let root = $state<HTMLElement>();

  $effect(() => {
    const from = start;
    const sub = liveQuery(async () => ({
      rows: await plannedOccurrences(from, addCalendarDays(from, 6)),
      routines: await db.routines.toArray(),
    })).subscribe({
      next: (data) => {
        rows = data.rows;
        routines = data.routines;
        loaded = true;
        error = '';
      },
      error: (cause) =>
        (error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível ler a semana.'),
    });
    return () => sub.unsubscribe();
  });
  const days = $derived(
    weekView({
      start,
      today,
      rows,
      todayRows: todayView(snapshot, today).planned,
      tasks: snapshot.tasks,
      routines,
    }),
  );
  const undated = $derived(inboxView(snapshot, today));
  // No celular, um dia aberto por vez; começa por hoje.
  $effect(() => {
    if (!open || !days.some((day) => day.date === open))
      open = days.some((day) => day.date === today) ? today : days[0].date;
  });
  // Depois de mover, o foco volta à linha (ela é redesenhada).
  $effect(() => {
    void days;
    if (!focusAfter || !root) return;
    const target = root.querySelector<HTMLElement>(
      `[data-day="${focusAfter.date}"] [data-row="${CSS.escape(focusAfter.id)}"] .item-title`,
    );
    if (target) {
      target.focus();
      focusAfter = null;
    }
  });

  function navigate(date: string | null) {
    const url = new URL(page.url);
    url.searchParams.set('view', 'agenda');
    url.searchParams.delete('mode');
    if (date && date !== today) url.searchParams.set('date', date);
    else url.searchParams.delete('date');
    void goto(url.pathname + url.search, { noScroll: true, keepFocus: true });
  }
  const dayHref = (date: string) =>
    `/missoes?view=agenda&mode=day&date=${date}`;
  const itemMinutes = (item: WeekItem) =>
    item.row.estimatedMinutes ? minutesLabel(item.row.estimatedMinutes) : null;

  async function run(work: () => Promise<unknown>, message: string) {
    if (busy) return false;
    busy = true;
    error = '';
    try {
      await work();
      notice = message;
      return true;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível mover.';
      return false;
    } finally {
      busy = false;
    }
  }
  async function moveItem(item: WeekItem, target: string) {
    if (target === item.row.plannedDate) return;
    if (
      await run(
        () => moveToDay(item.row, target, crypto.randomUUID()),
        sentence(`${item.row.title} foi para ${dayLabel(target, today)}`),
      )
    ) {
      if (narrow) open = target;
      focusAfter = { id: item.row.id, date: target };
    }
  }
  async function toInbox(item: WeekItem) {
    if (
      await run(
        () => setTaskDay(item.row.taskId, 'inbox', crypto.randomUUID()),
        `${item.row.title} voltou para a Caixa de entrada.`,
      )
    ) {
      await tick();
      root?.querySelector<HTMLElement>('.week-title')?.focus();
    }
  }
  async function scheduleTask(task: Task, target: string) {
    await run(
      () => setTaskDay(task.id!, { day: target }, crypto.randomUUID()),
      sentence(`${task.title} foi para ${dayLabel(target, today)}`),
    );
  }
  // A ordem muda dentro da lista visível (avulsas ou recorrentes); as
  // outras linhas do dia ficam onde estão.
  const listOf = (day: WeekDay, item: WeekItem) =>
    (day.items.some((entry) => entry.row.id === item.row.id)
      ? day.items
      : day.recurring
    ).map((entry) => entry.row.id);
  async function reorderTo(day: WeekDay, list: string[], item: WeekItem) {
    const members = new Set(list);
    let next = 0;
    const byId = new Map(day.rows.map((row) => [row.id, row]));
    const ordered = day.rows
      .map((row) => (members.has(row.id) ? list[next++] : row.id))
      .map((id) => byId.get(id)!);
    const position = list.indexOf(item.row.id) + 1;
    if (
      await run(
        () => saveDayOrder(day.date, ordered),
        `${item.row.title}: posição ${position} de ${list.length}.`,
      )
    )
      focusAfter = { id: item.row.id, date: day.date };
  }
  function shift(day: WeekDay, item: WeekItem, delta: number) {
    const list = listOf(day, item);
    const moved = moveId(list, item.row.id, delta);
    if (moved !== list) void reorderTo(day, moved, item);
  }
  function keys(event: KeyboardEvent, day: WeekDay, item: WeekItem) {
    if (!event.altKey || !item.movable) return;
    const delta = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (delta) {
      event.preventDefault();
      shift(day, item, delta);
      return;
    }
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const target = addCalendarDays(day.date, step);
    if (target < today) {
      notice = 'A Semana não leva missões para dias que já passaram.';
      return;
    }
    void moveItem(item, target);
  }

  // Arrastar (desktop): entre dias muda o dia; no mesmo dia, a ordem.
  function dragStart(event: DragEvent, payload: NonNullable<typeof dragging>) {
    dragging = payload;
    event.dataTransfer?.setData('text/plain', 'lmup-week');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }
  function dragEnd() {
    dragging = undefined;
    dropDate = null;
    dropBefore = null;
  }
  function dragOver(event: DragEvent, date: string, before: string | null) {
    if (!dragging || date < today) return;
    event.preventDefault();
    dropDate = date;
    dropBefore = before;
  }
  async function drop(event: DragEvent, day: WeekDay) {
    event.preventDefault();
    const payload = dragging,
      before = dropBefore;
    dragEnd();
    if (!payload || day.date < today) return;
    if (payload.kind === 'task') return scheduleTask(payload.task, day.date);
    if (payload.date !== day.date) return moveItem(payload.item, day.date);
    const ids = listOf(day, payload.item).filter(
      (id) => id !== payload.item.row.id,
    );
    const at = before ? ids.indexOf(before) : -1;
    ids.splice(at < 0 ? ids.length : at, 0, payload.item.row.id);
    await reorderTo(day, ids, payload.item);
  }
</script>

{#snippet itemCard(day: WeekDay, item: WeekItem, index: number, count: number)}
  {#if dragging?.kind === 'row' && dropDate === day.date && dropBefore === item.row.id && dragging.item.row.id !== item.row.id}<li
      class="week-drop"
      aria-hidden="true"
    >
      Solte aqui
    </li>{/if}
  <li
    class="week-item"
    class:done={item.done}
    class:dragging={dragging?.kind === 'row' &&
      dragging.item.row.id === item.row.id}
    data-row={item.row.id}
    draggable={item.movable && !narrow}
    ondragstart={(event) =>
      dragStart(event, { kind: 'row', item, date: day.date })}
    ondragend={dragEnd}
    ondragover={(event) => dragOver(event, day.date, item.row.id)}
  >
    <div class="item-body">
      <span class="item-time"
        >{#if item.done}✓ feita{:else if item.row.plannedTime}<span
            class="anchor"
            aria-hidden="true"
          ></span><strong>{item.row.plannedTime}</strong>{:else}sem hora{/if}</span
      >
      <a
        class="item-title"
        href={`/missao/${item.row.taskId}`}
        onkeydown={(event) => keys(event, day, item)}>{item.row.title}</a
      >
      <span class="item-minutes"
        >{itemMinutes(item) ?? '15 min*'}{#if !itemMinutes(item)}<span
            class="sr-only"
          >
            (sem duração, conta 15 min)</span
          >{/if}</span
      >
    </div>
    {#if item.movable}
      {#if reorder && narrow}<div class="item-order">
          <button
            type="button"
            aria-label={`Subir ${item.row.title}`}
            disabled={busy || index === 0}
            onclick={() => shift(day, item, -1)}>▲</button
          ><button
            type="button"
            aria-label={`Descer ${item.row.title}`}
            disabled={busy || index === count - 1}
            onclick={() => shift(day, item, 1)}>▼</button
          >
        </div>{:else}<DayPicker
          tasks={snapshot.tasks}
          title={item.row.title}
          text="⋯"
          label={`Mais ações para ${item.row.title}`}
          onchoose={(target) => moveItem(item, target)}
        >
          {#snippet extra()}
            {#if item.toInbox}<button
                type="button"
                class="menu-action"
                onclick={() => toInbox(item)}>Sem dia</button
              >{/if}
            <button
              type="button"
              class="menu-action"
              onclick={() => goto(`/missao/${item.row.taskId}`)}>Editar</button
            >
          {/snippet}
        </DayPicker>{/if}
    {/if}
  </li>
{/snippet}

{#snippet dayBody(day: WeekDay)}
  {#if day.routines.length || day.recurring.length}
    {#if showRoutines}<ul
        class="week-blocks"
        aria-label="Rotinas e recorrentes"
      >
        {#each day.routines as block (block.id)}<li class="week-block">
            <ApprovedIcon name="rotina" size={18} /><span class="block-name"
              >{block.name}</span
            ><span class="block-meta"
              >{block.time ?? ''}{block.time ? ' · ' : ''}{block.count === 1
                ? '1 item'
                : `${block.count} itens`}{block.done
                ? ` · ${block.done} feitos`
                : ''}</span
            >
          </li>{/each}
        {#each day.recurring as item, index (item.row.id)}{@render itemCard(
            day,
            item,
            index,
            day.recurring.length,
          )}{/each}
      </ul>{:else}<span class="week-chip"
        ><span aria-hidden="true">↻</span> {routinesLabel(day)}</span
      >{/if}
  {/if}
  <ul class="week-items" aria-label={`Missões de ${dayLabel(day.date, today)}`}>
    {#each day.items as item, index (item.row.id)}{@render itemCard(
        day,
        item,
        index,
        day.items.length,
      )}{/each}
    {#if dragging && dropDate === day.date && !dropBefore}<li
        class="week-drop"
        aria-hidden="true"
      >
        Solte aqui{day.date > today ? ' · entra no fim do dia' : ''}
      </li>{/if}
  </ul>
  {#if !day.items.length && !day.routines.length && !day.recurring.length && day.date >= today}<p
      class="week-empty"
    >
      Livre
    </p>{/if}
{/snippet}

{#snippet undatedLink()}
  <a class="week-undated-link" href="/missoes?view=semdia"
    ><strong>Sem dia</strong><span
      >{undated.inbox.length} na caixa · {undated.someday.length} algum dia</span
    ><span class="open">Abrir ›</span></a
  >
{/snippet}

<div class="week" bind:this={root} bind:clientWidth={width}>
  <div class="week-head">
    <h2 class="week-title" tabindex="-1">
      {start === today ? 'Próximos 7 dias' : 'Semana'}
    </h2>
    <span class="week-range">{rangeLabel(start)}</span>
    <span class="week-spacer"></span>
    {#if narrow}<Button
        variant={reorder ? 'primary' : 'quiet'}
        size="s"
        aria-pressed={reorder}
        onclick={() => (reorder = !reorder)}
        >{reorder ? 'Pronto' : 'Reordenar'}</Button
      >{/if}
    <Button
      variant="quiet"
      size="s"
      aria-pressed={showRoutines}
      onclick={() => (showRoutines = !showRoutines)}>Mostrar rotinas</Button
    >
    <div class="week-nav">
      <Button
        variant="secondary"
        size="s"
        aria-label="Semana anterior"
        onclick={() => navigate(addCalendarDays(start, -7))}>‹</Button
      >
      <Button
        variant="secondary"
        size="s"
        disabled={start === today}
        onclick={() => navigate(null)}>Hoje</Button
      >
      <Button
        variant="secondary"
        size="s"
        aria-label="Próxima semana"
        onclick={() => navigate(addCalendarDays(start, 7))}>›</Button
      >
    </div>
  </div>
  {#if error}<p role="alert" class="week-error">{error}</p>{/if}
  <p role="status" class="week-notice">{notice}</p>

  {#if !loaded}<p>Abrindo a semana…</p>{:else if narrow}
    {@render undatedLink()}
    {#if !reorder}<p class="week-tip">
        No ⋯ de cada item: escolher dia, Sem dia ou editar.
      </p>{/if}
    <div class="week-accordion">
      {#each days as day (day.date)}<section
          class="week-fold"
          data-day={day.date}
          class:today={day.date === today}
          aria-label={dayLabel(day.date, today)}
        >
          <h3>
            <button
              type="button"
              class="fold-toggle"
              aria-expanded={open === day.date}
              onclick={() => (open = open === day.date ? null : day.date)}
              ><span class="fold-name">{dayName(day.date, today)}</span><span
                class="fold-sum"
                >{daySummary(day)}{routinesLabel(day)
                  ? ` · ↻ ${routinesLabel(day)}`
                  : ''}</span
              ><span class="fold-caret" aria-hidden="true"
                >{open === day.date ? '▾' : '▸'}</span
              ></button
            >
          </h3>
          {#if open === day.date}<div class="fold-body">
              {@render dayBody(day)}
              <a class="day-link" href={dayHref(day.date)}>Abrir o dia →</a>
            </div>{/if}
        </section>{/each}
    </div>
  {:else}
    {#if !wide}{@render undatedLink()}{/if}
    <div class="week-grid" class:with-inbox={wide}>
      {#if wide}<section class="week-inbox" aria-labelledby="week-inbox-title">
          <div class="inbox-head">
            <h3 id="week-inbox-title">Sem dia</h3>
            <span>{undated.inbox.length} na caixa</span>
          </div>
          <p class="inbox-tip">Arraste para um dia ou use “Escolher dia”.</p>
          <ul>
            {#each undated.inbox.slice(0, INBOX_PREVIEW) as entry (entry.task.id)}<li
                class="inbox-card"
                draggable="true"
                ondragstart={(event) =>
                  dragStart(event, { kind: 'task', task: entry.task })}
                ondragend={dragEnd}
              >
                <span class="inbox-title"
                  ><span class="grip" aria-hidden="true">⠿</span><a
                    href={`/missao/${entry.task.id}`}>{entry.task.title}</a
                  ></span
                >
                <span class="inbox-foot"
                  >{entry.task.estimatedMinutes
                    ? minutesLabel(entry.task.estimatedMinutes)
                    : 'sem duração'}<DayPicker
                    tasks={snapshot.tasks}
                    title={entry.task.title}
                    onchoose={(target) => scheduleTask(entry.task, target)}
                  /></span
                >
              </li>{/each}
          </ul>
          {#if !undated.inbox.length}<p class="inbox-tip">Caixa vazia.</p>{/if}
          <a class="day-link" href="/missoes?view=semdia"
            >{undated.inbox.length > INBOX_PREVIEW
              ? `Ver as ${undated.inbox.length} →`
              : 'Abrir Sem dia →'}</a
          >
        </section>{/if}
      {#each days as day (day.date)}<section
          class="week-day"
          data-day={day.date}
          class:today={day.date === today}
          class:past={day.date < today}
          class:drop-target={dragging && dropDate === day.date}
          aria-label={dayLabel(day.date, today)}
          ondragover={(event) => dragOver(event, day.date, null)}
          ondragleave={(event) => {
            if (
              !(event.currentTarget as HTMLElement).contains(
                event.relatedTarget as Node,
              )
            )
              dropDate = null;
          }}
          ondrop={(event) => drop(event, day)}
        >
          <h3 class="day-head">
            <a href={dayHref(day.date)}>{dayName(day.date, today)}</a>
            <span class="day-sum">{daySummary(day)}</span>
          </h3>
          {@render dayBody(day)}
        </section>{/each}
    </div>
    <p class="week-tip">
      Arraste entre os dias ou use o ⋯ de cada item. No teclado, Alt + ←/→ muda
      o dia e Alt + ↑/↓ muda a ordem. Itens sem hora entram no fim do dia; horas
      fixas ficam na hora.
    </p>
  {/if}
</div>

<style>
  .week {
    display: grid;
    gap: 14px;
    min-width: 0;
  }
  .week-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }
  .week-title {
    margin: 0;
    font:
      500 2rem 'LMUP Cormorant',
      Georgia,
      serif;
    color: var(--lmu-heading, #fff1d6);
  }
  .week-title:focus-visible {
    outline: 2px solid var(--lmu-focus, #b8e5dc);
    outline-offset: 2px;
  }
  .week-range,
  .week-tip,
  .inbox-tip,
  .day-sum,
  .fold-sum,
  .item-time,
  .item-minutes,
  .block-meta,
  .week-empty {
    color: var(--lmu-muted, #a6b9a6);
  }
  .week-range {
    font-size: 0.875rem;
  }
  .week-spacer {
    flex: 1;
  }
  .week-nav {
    display: flex;
    gap: 6px;
  }
  .week-tip {
    margin: 0;
    font-size: 0.85rem;
  }
  .week-notice:empty {
    display: none;
  }
  .week-notice,
  .week-error {
    margin: 0;
  }
  .week-error {
    color: var(--lmu-danger, #f0a093);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
    align-items: start;
  }
  .week-grid.with-inbox {
    grid-template-columns: minmax(170px, 210px) repeat(7, minmax(0, 1fr));
  }
  .week-inbox {
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 10px;
    background: var(--lmu-surface, #101f23);
  }
  .inbox-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
  }
  .inbox-head h3 {
    margin: 0;
    font-size: 0.95rem;
  }
  .inbox-head span {
    font-size: 0.8rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .inbox-tip {
    margin: 0;
    font-size: 0.75rem;
  }
  .week-inbox ul {
    display: grid;
    gap: 8px;
  }
  .inbox-card {
    display: grid;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 8px;
    background: var(--lmu-bg, #0b181b);
    cursor: grab;
  }
  .inbox-title {
    display: flex;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    overflow-wrap: break-word;
  }
  .grip {
    color: #5d6f69;
  }
  .inbox-foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .week-day {
    display: grid;
    gap: 6px;
    align-content: start;
    min-width: 0;
    min-height: 160px;
    padding: 2px;
    border-radius: 10px;
  }
  .week-day.drop-target {
    background: #b8e5dc0d;
  }
  .day-head {
    display: grid;
    margin: 0;
    padding: 8px 10px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 8px;
    font-size: 0.875rem;
  }
  .today .day-head {
    border-color: #73694a;
    background: var(--lmu-raised, #1d302d);
  }
  .day-head a {
    color: inherit;
    font-weight: 700;
    text-decoration: none;
  }
  .day-head a:hover,
  .day-head a:focus-visible {
    text-decoration: underline;
  }
  .day-sum {
    font-size: 0.75rem;
    font-weight: 400;
  }
  .past {
    opacity: 0.8;
  }
  .week-chip {
    justify-self: start;
    padding: 1px 8px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 999px;
    font-size: 0.75rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .week-blocks,
  .week-items {
    display: grid;
    gap: 6px;
  }
  .week-block {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 7px 8px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 8px;
    background: var(--lmu-bg, #0b181b);
    font-size: 0.8rem;
  }
  .block-name {
    flex: 1 1 6rem;
    min-width: 0;
    font-weight: 600;
    overflow-wrap: break-word;
  }
  .block-meta {
    font-size: 0.75rem;
  }
  .week-item {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    padding: 7px 4px 7px 8px;
    border: 1px solid var(--lmu-raised, #1d302d);
    border-radius: 8px;
    background: var(--lmu-surface, #101f23);
    font-size: 0.8rem;
  }
  .week-item[draggable='true'] {
    cursor: grab;
  }
  .week-item.dragging {
    opacity: 0.5;
  }
  .item-body {
    display: grid;
    flex: 1;
    gap: 2px;
    min-width: 0;
  }
  .item-time {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
  }
  .item-time strong {
    color: var(--lmu-text, #eee9db);
  }
  .anchor {
    width: 6px;
    height: 6px;
    background: var(--lmu-text, #eee9db);
    transform: rotate(45deg);
  }
  .item-title {
    color: var(--lmu-text, #eee9db);
    font-weight: 600;
    line-height: 1.3;
    text-decoration: none;
    overflow-wrap: break-word;
  }
  .item-title:hover,
  .item-title:focus-visible {
    text-decoration: underline;
  }
  .done .item-title {
    text-decoration: line-through;
    color: var(--lmu-muted, #a6b9a6);
  }
  .item-minutes {
    font-size: 0.75rem;
  }
  .item-order {
    display: flex;
    gap: 4px;
  }
  .item-order button {
    width: 44px;
    height: 44px;
    border: 1px solid var(--lmu-control-line, #70868b);
    border-radius: 6px;
    background: var(--lmu-surface, #101f23);
    color: var(--lmu-text, #eee9db);
  }
  .item-order button:disabled {
    opacity: 0.4;
  }
  .menu-action {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 6px 10px;
    border: 0;
    border-radius: 6px;
    background: none;
    color: var(--lmu-text, #eee9db);
    font: inherit;
    font-size: 0.92rem;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  .menu-action:hover,
  .menu-action:focus-visible {
    background: var(--lmu-raised, #1d302d);
  }
  .week-drop {
    display: grid;
    place-items: center;
    min-height: 56px;
    padding: 6px;
    border: 2px dashed var(--lmu-focus, #b8e5dc);
    border-radius: 8px;
    font-size: 0.75rem;
    color: var(--lmu-focus, #b8e5dc);
    text-align: center;
  }
  .week-empty {
    margin: 0;
    padding: 4px 10px;
    font-size: 0.75rem;
  }
  .day-link {
    font-size: 0.8rem;
    color: var(--lmu-link, #d6e2db);
  }
  .week-undated-link {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    min-height: 48px;
    padding: 6px 12px;
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 10px;
    background: var(--lmu-surface, #101f23);
    color: var(--lmu-text, #eee9db);
    font-size: 0.875rem;
    text-decoration: none;
  }
  .week-undated-link span {
    color: var(--lmu-muted, #a6b9a6);
  }
  .week-undated-link .open {
    margin-left: auto;
    color: var(--lmu-link, #d6e2db);
  }
  .week-accordion {
    display: grid;
    gap: 8px;
  }
  .week-fold {
    border: 1px solid var(--lmu-line, #3b5047);
    border-radius: 10px;
  }
  .week-fold.today {
    border-color: #73694a;
  }
  .week-fold h3 {
    margin: 0;
  }
  .fold-toggle {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 8px;
    width: 100%;
    min-height: 52px;
    padding: 6px 12px;
    border: 0;
    background: none;
    color: var(--lmu-text, #eee9db);
    font: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }
  .fold-toggle:focus-visible {
    outline: 2px solid var(--lmu-focus, #b8e5dc);
    outline-offset: -2px;
  }
  .fold-sum {
    flex: 1 1 10rem;
    font-size: 0.8rem;
    font-weight: 400;
  }
  .fold-caret {
    margin-left: auto;
    color: var(--lmu-muted, #a6b9a6);
  }
  .fold-body {
    display: grid;
    gap: 8px;
    padding: 0 8px 10px;
  }
  .week-fold .week-item {
    font-size: 0.92rem;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
