<script lang="ts">
  import type { Snippet } from 'svelte';
  import LineIcon from './LineIcon.svelte';
  /**
   * Linha de Missão (design "LMUP Revisão e Proposta", 15/11/2026).
   * Lote 1: used by the Hoje plan. Times are only shown when fixed (◆);
   * calculated times arrive with the single day order (lote 2).
   */
  let {
    title,
    time = null,
    support = '',
    icon = null,
    progress = 0,
    progressLabel = '',
    important = false,
    staleDays = null,
    focus = false,
    recurring = false,
    state = 'normal',
    canComplete = false,
    busy = false,
    oncomplete,
    onopen,
    menu,
  }: {
    title: string;
    time?: string | null;
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
    busy?: boolean;
    oncomplete?: () => void;
    onopen?: () => void;
    menu?: Snippet;
  } = $props();
  const partial = $derived(state !== 'done' && progress > 0);
  const pct = $derived(Math.max(0, Math.min(100, Math.round(progress * 100))));
  const action = $derived(
    partial ? 'Retomar' : state === 'next' ? 'Iniciar' : '',
  );
</script>

<div
  class="day-row"
  class:next={state === 'next'}
  class:done={state === 'done'}
  data-state={partial ? 'partial' : state}
>
  {#if canComplete && state !== 'done'}<button
      type="button"
      class="check"
      class:check-next={state === 'next'}
      aria-label={`Concluir ${title}`}
      disabled={busy}
      onclick={oncomplete}><span aria-hidden="true"></span></button
    >{:else if state === 'done'}<span class="check" aria-label="Concluída"
      ><span class="check-done" aria-hidden="true">✓</span></span
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
    {#if time}<span class="anchor" aria-hidden="true"></span><span
        ><span class="sr">hora fixa </span>{time}</span
      >{:else}<span class="no-time" aria-hidden="true">—</span><span class="sr"
        >sem horário</span
      >{/if}
  </span>
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
      {#if support}<span>{support}</span>{/if}
      {#if important}<span class="badge badge-important">Importância alta</span
        >{/if}
      {#if staleDays}<span class="badge badge-stale"
          >Parada há {staleDays} dias</span
        >{/if}
      {#if focus}<span class="badge badge-focus">Em foco</span>{/if}
    </span>
    {#if partial}<span class="bar" aria-hidden="true"
        ><span style:width={`${pct}%`}></span></span
      >{/if}
  </div>
  {#if action}<button
      type="button"
      class="row-action"
      class:primary={state === 'next'}
      disabled={busy}
      onclick={onopen}>{action}</button
    >{/if}
  {#if menu}<span class="menu">{@render menu()}</span>{/if}
</div>

<style>
  .day-row {
    --row-text: #eee9db;
    --row-muted: #a6b9a6;
    --row-line: #3b5047;
    --row-control: #8fa39a;
    --row-action: #ecc36f;
    --row-positive: #7bc4b1;
    position: relative;
    display: grid;
    grid-template-columns: 44px 64px 24px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 8px;
    min-height: 56px;
    padding: 6px 6px 6px 2px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--row-text);
    font-family: var(--lmu-font);
  }
  .day-row.next {
    background: #15272a;
    border-color: #73694a;
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
    gap: 5px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
  .anchor {
    width: 7px;
    height: 7px;
    background: var(--row-text);
    transform: rotate(45deg);
    flex: none;
  }
  .no-time {
    color: var(--row-muted);
    font-weight: 400;
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
  .menu {
    display: flex;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  button:focus-visible {
    outline: 3px solid #b8e5dc;
    outline-offset: 2px;
  }
  button:disabled {
    cursor: progress;
  }
  @media (max-width: 640px) {
    .day-row {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      grid-template-areas:
        'check time menu'
        'check body menu'
        'check action action';
      align-items: start;
      row-gap: 2px;
      min-height: 64px;
    }
    .check {
      grid-area: check;
    }
    .time {
      grid-area: time;
      padding-top: 6px;
      font-size: 13px;
    }
    .icon,
    .time.empty {
      display: none;
    }
    .body {
      grid-area: body;
      padding-top: 10px;
    }
    .time:not(.empty) + .icon + .body {
      padding-top: 0;
    }
    .menu {
      grid-area: menu;
    }
    .row-action {
      grid-area: action;
      justify-self: start;
      min-height: 44px;
      margin: 4px 0;
    }
  }
</style>
