<script module lang="ts">
  export type TabItem = {
    id: string;
    label: string;
    icon?: string;
    count?: number;
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import ApprovedIcon from './ApprovedIcon.svelte';
  let {
    label,
    items,
    selected,
    onselect,
    layout = 'row',
    class: className = '',
  }: {
    /** Accessible name of the tab list. */
    label: string;
    items: TabItem[];
    /** Selected id; `null` when the current view is none of these tabs. */
    selected: string | null;
    onselect: (id: string) => void;
    /** `grid` spreads the tabs evenly; `row` keeps natural widths. */
    layout?: 'row' | 'grid';
    class?: string;
  } = $props();
  const uid = $props.id();
  let list: HTMLDivElement;
  const enabled = $derived(items.filter((item) => !item.disabled));
  // Roving tabindex: the selected tab, or the first one when none is selected.
  const focusable = $derived(
    enabled.some((item) => item.id === selected) ? selected : enabled[0]?.id,
  );

  function move(event: KeyboardEvent, id: string) {
    const index = enabled.findIndex((item) => item.id === id);
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? enabled[(index + 1) % enabled.length]
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? enabled[(index - 1 + enabled.length) % enabled.length]
          : event.key === 'Home'
            ? enabled[0]
            : event.key === 'End'
              ? enabled[enabled.length - 1]
              : undefined;
    if (!next) return;
    event.preventDefault();
    list
      .querySelector<HTMLButtonElement>(`[data-tab="${CSS.escape(next.id)}"]`)
      ?.focus();
    // Automatic activation: the views are local and cheap to switch.
    onselect(next.id);
  }
</script>

<div
  bind:this={list}
  class={`lmu-tabs lmu-tabs--${layout} ${className}`}
  role="tablist"
  aria-label={label}
>
  {#each items as item (item.id)}
    <button
      type="button"
      role="tab"
      id={`${uid}-${item.id}`}
      data-tab={item.id}
      class="lmu-tab"
      aria-selected={item.id === selected}
      tabindex={item.id === focusable ? 0 : -1}
      disabled={item.disabled}
      onclick={() => onselect(item.id)}
      onkeydown={(event) => move(event, item.id)}
    >
      {#if item.icon}<ApprovedIcon name={item.icon} size={22} />{/if}
      <span>{item.label}</span>
      {#if item.count !== undefined}<small aria-hidden="true"
          >{item.count}</small
        >{/if}
    </button>
  {/each}
</div>

<style>
  .lmu-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    padding: 2px;
    border: 1px solid #5f6f6466;
    border-radius: 8px;
    background: #071214b3;
  }
  .lmu-tabs--grid {
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
  }
  .lmu-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    min-height: 36px;
    padding: 5px 12px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: #c9d1c3;
    font: 500 0.92rem/1.2 var(--lmu-font, system-ui);
    cursor: pointer;
  }
  .lmu-tab:hover:enabled {
    color: #f1ede2;
    background: #1c292e;
  }
  /* Selected = raised neutral surface + underline; never the action gradient. */
  .lmu-tab[aria-selected='true'] {
    color: #fff3d6;
    background: #24343a;
    border-color: #70868b66;
  }
  .lmu-tab[aria-selected='true']::after {
    content: '';
    position: absolute;
    inset: auto 10px 3px;
    height: 2px;
    border-radius: 2px;
    background: #e8ad57;
  }
  .lmu-tab:focus-visible {
    outline: 3px solid #b8e5dc;
    outline-offset: 1px;
  }
  .lmu-tab:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .lmu-tab small {
    min-width: 1.4em;
    padding: 0 5px;
    border-radius: 999px;
    background: #ffffff14;
    font-size: 0.75rem;
    text-align: center;
  }
  .lmu-tab span {
    overflow-wrap: anywhere;
  }
  @media (max-width: 760px), (pointer: coarse) {
    .lmu-tab {
      min-height: 44px;
    }
  }
</style>
