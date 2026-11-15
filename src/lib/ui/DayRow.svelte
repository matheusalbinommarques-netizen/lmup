<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import LineIcon from './LineIcon.svelte';
  import type { TimeKind, TimeScope } from '$services/dayOrder';
  /**
   * Linha de Missão (design "LMUP Revisão e Proposta", 15/11/2026).
   * Lote 2: ◆ fixed time, ≈ calculated time, "15 min*", time edited on the
   * row ("Só hoje" / "Daqui para frente"), ▲▼ and Alt + ↑/↓ to move,
   * F2 to edit the time, concluded rows kept in place.
   */
  let {
    title,
    time = null,
    timeKind = time ? 'anchor' : 'none',
    defaultDuration = false,
    support = '',
    icon = null,
    progress = 0,
    progressLabel = '',
    important = false,
    staleDays = null,
    focus = false,
    recurring = false,
    state: rowState = 'normal',
    canComplete = false,
    canUndo = false,
    busy = false,
    reorder = false,
    canMoveUp = false,
    canMoveDown = false,
    dragging = false,
    primary = true,
    oncomplete,
    onundo,
    onopen,
    onmove,
    ontime,
    onreschedule,
    ondragstart,
    ondragend,
    menu,
  }: {
    title: string;
    time?: string | null;
    timeKind?: TimeKind;
    defaultDuration?: boolean;
    support?: string;
    icon?: string | null;
    progress?: number;
    progressLabel?: string;
    important?: boolean;
    staleDays?: number | null;
    focus?: boolean;
    recurring?: boolean;
    state?: 'normal' | 'next' | 'done';
    canComplete?: boolean;
    canUndo?: boolean;
    busy?: boolean;
    reorder?: boolean;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    dragging?: boolean;
    /** Gold "Iniciar" on the next row; off when the page already has one. */
    primary?: boolean;
    oncomplete?: () => void;
    onundo?: () => void;
    onopen?: () => void;
    onmove?: (delta: number) => void;
    ontime?: (time: string | null, scope: TimeScope) => void;
    onreschedule?: () => void;
    ondragstart?: (event: DragEvent) => void;
    ondragend?: () => void;
    menu?: Snippet;
  } = $props();
  const done = $derived(rowState === 'done');
  const missed = $derived(!done && timeKind === 'missed');
  const partial = $derived(!done && progress > 0);
  const pct = $derived(Math.max(0, Math.min(100, Math.round(progress * 100))));
  const action = $derived(
    partial ? 'Retomar' : rowState === 'next' ? 'Iniciar' : '',
  );
  const movable = $derived(!!onmove && (canMoveUp || canMoveDown));

  let editing = $state(false),
    draft = $state(''),
    scope = $state<TimeScope>('today'),
    input = $state<HTMLInputElement>(),
    timeButton = $state<HTMLButtonElement>();
  async function startEdit() {
    if (!ontime || done || busy) return;
    draft = time ?? '';
    scope = 'today';
    editing = true;
    await tick();
    input?.focus();
  }
  async function stopEdit() {
    editing = false;
    await tick();
    timeButton?.focus();
  }
  function confirm(value: string | null) {
    const next = value || null;
    void stopEdit();
    // Confirming the calculated time fixes it; unchanged fixed time is a no-op.
    if (timeKind === 'anchor' && next === time) return;
    if (!next && timeKind !== 'anchor' && timeKind !== 'missed') return;
    ontime?.(next, recurring ? scope : 'forward');
  }
  function editorKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      confirm(draft);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      void stopEdit();
    }
  }
  function rowKey(event: KeyboardEvent) {
    if (editing) return;
    if (
      event.altKey &&
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
    ) {
      const delta = event.key === 'ArrowUp' ? -1 : 1;
      if ((delta < 0 ? canMoveUp : canMoveDown) && !busy) {
        event.preventDefault();
        onmove?.(delta);
      }
    } else if (event.key === 'F2' && ontime && !done) {
      event.preventDefault();
      void startEdit();
    }
  }
  const timeLabel = $derived(
    timeKind === 'anchor'
      ? `Hora fixa ${time}`
      : timeKind === 'computed'
        ? `Hora calculada, cerca de ${time}`
        : timeKind === 'missed'
          ? `Hora fixa ${time}, já passou`
          : timeKind === 'done'
            ? `Concluída, ${time}`
            : 'Sem horário',
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="row-shell">
  <div
    class="day-row"
    class:next={rowState === 'next'}
    class:done
    class:missed
    class:dragging
    class:reorder
    data-state={partial ? 'partial' : missed ? 'missed' : rowState}
    onkeydown={rowKey}
  >
    {#if ondragstart && !reorder}<span
        class="handle"
        draggable="true"
        aria-hidden="true"
        title="Arraste para mudar a ordem"
        {ondragstart}
        {ondragend}>⠿</span
      >{:else}<span class="handle-gap" aria-hidden="true"></span>{/if}
    {#if done}{#if canUndo}<button
          type="button"
          class="check"
          aria-label={`Desfazer conclusão de ${title}`}
          disabled={busy}
          onclick={onundo}
          ><span class="check-done" aria-hidden="true">✓</span></button
        >{:else}<span class="check" role="img" aria-label="Concluída"
          ><span class="check-done" aria-hidden="true">✓</span></span
        >{/if}{:else if canComplete}<button
        type="button"
        class="check"
        class:check-next={rowState === 'next'}
        aria-label={`Concluir ${title}`}
        disabled={busy}
        onclick={oncomplete}><span aria-hidden="true"></span></button
      >{:else}<button
        type="button"
        class="check"
        aria-label={`Abrir ${title}`}
        disabled={busy}
        onclick={onopen}
        ><span
          class:ring={partial}
          style:--pct={`${pct * 3.6}deg`}
          aria-hidden="true"
        ></span></button
      >{/if}
    <span class="time" class:empty={!time}>
      {#if editing}<input
          bind:this={input}
          bind:value={draft}
          type="time"
          step="300"
          aria-label={`Hora de ${title}`}
          onkeydown={editorKey}
        />{:else if ontime && !done}<button
          bind:this={timeButton}
          type="button"
          class="time-button"
          aria-label={`${timeLabel}. ${
            timeKind === 'anchor' || timeKind === 'missed' ? 'Alterar' : 'Fixar'
          } hora de ${title}`}
          title="F2 edita a hora"
          disabled={busy}
          onclick={startEdit}>{@render timeText()}</button
        >{:else}<span aria-label={timeLabel}>{@render timeText()}</span>{/if}
    </span>
    {#snippet timeText()}
      {#if timeKind === 'anchor'}<span class="anchor" aria-hidden="true"
        ></span><span>{time}</span>{:else if timeKind === 'missed'}<span
          class="anchor anchor-missed"
          aria-hidden="true"
        ></span><span class="muted">{time} · passou</span
        >{:else if timeKind === 'computed'}<span class="muted">≈ {time}</span
        >{:else if time}<span class="muted">{time}</span>{:else}<span
          class="muted"
          aria-hidden="true">—</span
        >{/if}
    {/snippet}
    <!-- No area icon: leave the slot empty; a generic circle reads as a second checkbox. -->
    <span class="icon"
      >{#if icon}<LineIcon name={icon} />{/if}</span
    >
    <div class="body">
      <span class="title-line">
        <button type="button" class="title" onclick={onopen} disabled={busy}
          >{title}</button
        >{#if recurring}<span class="recurring" title="Rotina ou recorrência"
            >↻<span class="sr"> recorrente</span></span
          >{/if}
      </span>
      <span class="meta">
        {#if partial && progressLabel}<span>{progressLabel}</span>{/if}
        {#if defaultDuration && !done}<span
            class="default-duration"
            title="Sem duração informada; usa 15 min para calcular as horas"
            ><span aria-hidden="true">15 min*</span><span class="sr"
              >Sem duração informada; usa 15 min para calcular as horas</span
            ></span
          >{/if}
        {#if support}<span>{support}</span>{/if}
        {#if !done}
          {#if important}<span class="badge badge-important"
              >Importância alta</span
            >{/if}
          {#if staleDays}<span class="badge badge-stale"
              >Parada há {staleDays} dias</span
            >{/if}
          {#if focus}<span class="badge badge-focus">Em foco</span>{/if}
        {/if}
      </span>
      {#if partial}<span class="bar" aria-hidden="true"
          ><span style:width={`${pct}%`}></span></span
        >{/if}
    </div>
    <span class="slot-action"
      >{#if missed && onreschedule}<button
          type="button"
          class="row-action quiet"
          disabled={busy}
          onclick={onreschedule}>Remarcar</button
        >{:else if action}<button
          type="button"
          class="row-action"
          class:primary={primary && rowState === 'next'}
          disabled={busy}
          onclick={onopen}>{action}</button
        >{/if}</span
    >
    <span class="slot-move"
      >{#if movable && reorder}<span class="move"
          ><button
            type="button"
            aria-label={`Mover ${title} para cima`}
            disabled={busy || !canMoveUp}
            onclick={() => onmove?.(-1)}>▲</button
          ><button
            type="button"
            aria-label={`Mover ${title} para baixo`}
            disabled={busy || !canMoveDown}
            onclick={() => onmove?.(1)}>▼</button
          ></span
        >{/if}</span
    >
    <span class="slot-menu"
      >{#if menu && !reorder}<span class="menu">{@render menu()}</span
        >{/if}</span
    >
    {#if editing}<div class="editor">
        {#if recurring}<span>Vale para</span>
          <span class="scope" role="group" aria-label="Alcance da nova hora"
            ><button
              type="button"
              aria-pressed={scope === 'today'}
              onclick={() => (scope = 'today')}>Só hoje</button
            ><button
              type="button"
              aria-pressed={scope === 'forward'}
              onclick={() => (scope = 'forward')}>Daqui para frente</button
            ></span
          >{/if}
        <button type="button" class="editor-ok" onclick={() => confirm(draft)}
          >Salvar hora</button
        >
        {#if timeKind === 'anchor' || timeKind === 'missed'}<button
            type="button"
            class="editor-quiet"
            onclick={() => confirm(null)}>Sem hora fixa</button
          >{/if}
        <button type="button" class="editor-quiet" onclick={() => stopEdit()}
          >Cancelar</button
        >
        <span class="hint">Enter confirma · Esc cancela</span>
      </div>{/if}
  </div>
</div>

<style>
  .row-shell {
    container-type: inline-size;
  }
  .day-row {
    --row-text: #eee9db;
    --row-muted: #a6b9a6;
    --row-line: #3b5047;
    --row-control: #8fa39a;
    --row-action: #ecc36f;
    --row-positive: #7bc4b1;
    position: relative;
    display: grid;
    grid-template-columns: 18px 44px 92px 24px minmax(0, 1fr) auto auto auto;
    align-items: center;
    gap: 8px;
    min-height: 56px;
    padding: 6px 6px 6px 0;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--row-text);
    font-family: var(--lmu-font);
  }
  .day-row.next {
    background: #15272a;
    border-color: #73694a;
  }
  .day-row.dragging {
    background: #1d302d;
    border-color: #a6b9a6;
    box-shadow: 0 14px 30px #000a;
  }
  .day-row.missed > :not(.row-action):not(.menu):not(.move) {
    opacity: 0.72;
  }
  .handle,
  .handle-gap {
    width: 18px;
    text-align: center;
  }
  .handle {
    color: var(--row-control);
    font-size: 16px;
    cursor: grab;
    user-select: none;
    opacity: 0;
  }
  .day-row:hover .handle,
  .day-row:focus-within .handle {
    opacity: 1;
  }
  .check {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    border-radius: 50%;
  }
  span.check {
    cursor: default;
  }
  .check > span:not(.check-done) {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--row-control);
  }
  .check-next > span {
    border-color: var(--row-action) !important;
  }
  .check .ring {
    background: conic-gradient(var(--row-positive) var(--pct), transparent 0);
  }
  .check:hover > span:not(.check-done) {
    border-color: var(--row-text);
  }
  .check-done {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--row-positive);
    color: #071114;
    font-size: 14px;
    font-weight: 700;
  }
  .time {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .time-button,
  .time > span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 32px;
    padding: 0 6px;
    margin-left: -6px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: none;
    color: inherit;
    font: inherit;
  }
  .time-button {
    cursor: pointer;
  }
  .time-button:hover {
    border-color: var(--row-line);
  }
  .time input {
    width: 92px;
    min-height: 32px;
    padding: 2px 4px;
    border: 2px solid #b8e5dc;
    border-radius: 6px;
    background: #071114;
    color: var(--row-text);
    font: 600 14px var(--lmu-font);
    color-scheme: dark;
  }
  .muted {
    color: var(--row-muted);
    font-weight: 400;
  }
  .anchor {
    width: 7px;
    height: 7px;
    background: var(--row-text);
    transform: rotate(45deg);
    flex: none;
  }
  .anchor-missed {
    background: none;
    border: 1.5px solid var(--row-muted);
  }
  .icon {
    color: var(--row-muted);
    display: grid;
    place-items: center;
  }
  .body {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  .title-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .title {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: 600 16px/1.3 var(--lmu-font);
    text-align: left;
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  .title:hover {
    text-decoration: underline;
  }
  .done .title {
    color: var(--row-muted);
    text-decoration: line-through;
    text-decoration-color: #a6b9a688;
  }
  .missed .title {
    color: var(--row-muted);
  }
  .recurring {
    font-size: 13px;
    color: var(--row-control);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    font-size: 13px;
    color: var(--row-muted);
  }
  .meta > span:not(.badge) + span:not(.badge)::before {
    content: '· ';
  }
  .default-duration > span[aria-hidden] {
    border-bottom: 1px dashed var(--row-control);
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
  .bar {
    display: block;
    height: 3px;
    max-width: 240px;
    border-radius: 2px;
    background: #1d302d;
    margin-top: 2px;
  }
  .bar > span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--row-positive);
  }
  .row-action {
    min-height: 36px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid #70868b;
    background: #101f23;
    color: var(--row-text);
    font: 600 14px var(--lmu-font);
    cursor: pointer;
  }
  .row-action.primary {
    border: 0;
    background: var(--row-action);
    color: #172024;
  }
  .row-action.quiet {
    border: 0;
    background: none;
    color: #d6e2db;
  }
  /* ▲▼ only in "Reordenar"; otherwise drag (⠿) or Alt + ↑/↓. */
  .move {
    display: flex;
    gap: 2px;
  }
  .slot-action,
  .slot-move,
  .slot-menu {
    display: flex;
    align-items: center;
  }
  .move button {
    width: 32px;
    height: 32px;
    border: 1px solid var(--row-line);
    border-radius: 6px;
    background: #101f23;
    color: var(--row-text);
    font-size: 11px;
    cursor: pointer;
  }
  .move button:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .menu {
    display: flex;
  }
  .editor {
    grid-column: 3 / -1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 2px 0 6px;
    font-size: 13px;
    color: var(--row-muted);
  }
  .scope {
    display: flex;
    gap: 6px;
  }
  .editor button {
    min-height: 32px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid var(--row-line);
    background: none;
    color: var(--row-text);
    font: 600 13px var(--lmu-font);
    cursor: pointer;
  }
  .scope button[aria-pressed='true'] {
    border-color: #b8e5dc;
    background: #1d302d;
  }
  .editor .editor-ok {
    border-radius: 6px;
    border-color: #70868b;
    background: #101f23;
  }
  .editor .editor-quiet {
    border-color: transparent;
    color: var(--row-muted);
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  button:focus-visible,
  input:focus-visible {
    outline: 3px solid #b8e5dc;
    outline-offset: 2px;
  }
  button:disabled {
    cursor: progress;
  }
  @media (prefers-reduced-motion: no-preference) {
    .handle {
      transition: opacity 0.12s;
    }
  }
  @container (max-width: 600px) {
    .day-row {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      grid-template-areas:
        'check time side'
        'check body side'
        'check action action'
        'editor editor editor';
      align-items: start;
      row-gap: 2px;
      min-height: 64px;
      padding-left: 0;
    }
    .handle,
    .handle-gap,
    .icon,
    .slot-action:empty,
    .slot-move:empty,
    .slot-menu:empty {
      display: none;
    }
    .check {
      grid-area: check;
    }
    .time {
      grid-area: time;
      padding-top: 4px;
      font-size: 13px;
    }
    .body {
      grid-area: body;
    }
    .slot-menu,
    .slot-move {
      grid-area: side;
    }
    .move {
      gap: 0;
    }
    .move button {
      width: 44px;
      height: 44px;
      font-size: 12px;
    }
    .slot-action {
      grid-area: action;
    }
    .row-action {
      justify-self: start;
      min-height: 44px;
      margin: 4px 0;
    }
    .editor {
      grid-area: editor;
      padding-left: 44px;
    }
    .editor button {
      min-height: 44px;
    }
  }
</style>
