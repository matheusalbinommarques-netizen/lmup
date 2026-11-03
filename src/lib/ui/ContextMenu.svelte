<script lang="ts">
  import type { Snippet } from 'svelte';
  import ApprovedIcon from './ApprovedIcon.svelte';
  let {
    label,
    text = '⋯',
    tabStyle = false,
    icon,
    children,
  }: {
    label: string;
    text?: string;
    tabStyle?: boolean;
    icon?: string;
    children: Snippet;
  } = $props();
  const uid = $props.id();
  let trigger: HTMLButtonElement;
  let panel: HTMLDivElement;
  let expanded = $state(false);
  function position() {
    const rect = trigger.getBoundingClientRect();
    panel.style.maxHeight = `${Math.max(120, window.innerHeight - 24)}px`;
    const box = panel.getBoundingClientRect();
    panel.style.left = `${Math.max(12, Math.min(rect.right - box.width, window.innerWidth - box.width - 12))}px`;
    panel.style.top = `${Math.max(12, rect.bottom + box.height + 8 > window.innerHeight ? rect.top - box.height - 6 : rect.bottom + 6)}px`;
  }
  function toggle() {
    if (expanded) panel.hidePopover();
    else {
      panel.showPopover();
      position();
      panel
        .querySelector<HTMLElement>('button:not(:disabled), a[href]')
        ?.focus({ preventScroll: true });
    }
  }
  function keys(event: KeyboardEvent) {
    if ((event.target as HTMLElement).matches('select, input, textarea'))
      return;
    const items = [
      ...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'),
    ];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      items[
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
              items.length
      ]?.focus();
    }
  }
</script>

<svelte:window
  onresize={() => panel?.hidePopover()}
  onscroll={() => {
    if (expanded) position();
  }}
/>
<button
  bind:this={trigger}
  type="button"
  class:with-label={!tabStyle && text !== '⋯'}
  class={tabStyle
    ? 'lmu-button lmu-button--secondary context-tab'
    : 'context-trigger'}
  aria-label={label}
  aria-haspopup="dialog"
  aria-expanded={expanded}
  aria-controls={uid}
  onclick={toggle}
  onkeydown={(event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!expanded) toggle();
    }
  }}
  >{#if icon}<ApprovedIcon name={icon} size={24} />{/if}{text}</button
>
<div
  bind:this={panel}
  id={uid}
  popover="auto"
  class="ux-menu"
  role="dialog"
  aria-label={`Menu: ${label}`}
  tabindex="-1"
  ontoggle={(event) => (expanded = event.newState === 'open')}
  onkeydown={keys}
  onclick={(event) => {
    if ((event.target as HTMLElement).closest('button, a')) panel.hidePopover();
  }}
>
  {@render children()}
</div>

<style>
  .context-tab {
    min-height: 42px;
    padding: 7px 10px;
    font-size: 0.88rem;
  }
  .context-tab[aria-expanded='true'] {
    border-color: #c99b46;
    background: linear-gradient(#765626, #362b1c);
    color: #ffe3a1;
  }
  .context-trigger {
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: #ead8ad;
    cursor: pointer;
    min-width: 36px;
    min-height: 38px;
    font-size: 1.35rem;
    flex-shrink: 0;
  }
  .context-trigger.with-label {
    font: inherit;
    font-size: 0.82rem;
    padding: 7px 12px;
    border-color: #79623e;
    background: #0b1b1c;
  }
  .context-trigger:hover,
  .context-trigger[aria-expanded='true'] {
    border-color: #d1a550;
    background: #8f672526;
    color: #ffe4a4;
  }
  .context-trigger:focus-visible {
    outline: 2px solid #e9c16d;
    outline-offset: 3px;
  }
  .ux-menu {
    position: fixed;
    inset: auto;
    margin: 0;
    width: 230px;
    max-width: calc(100vw - 24px);
    padding: 6px;
    border: 1px solid #a2834a;
    border-radius: 8px;
    color: #e9e2ce;
    background: linear-gradient(135deg, #142b2b, #071719);
    box-shadow: 0 12px 36px #0009;
    overflow-y: auto;
  }
  .ux-menu :global(.lmu-button),
  .ux-menu :global(.lmu-button.lmu-button--primary),
  .ux-menu :global(a) {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    min-height: 40px;
    padding: 9px 12px;
    margin: 0;
    text-align: left;
    font: 600 0.84rem/1.4 var(--lmu-font);
    text-shadow: none;
    text-decoration: none;
    border: 1px solid #8d744a66;
    background: #0b1b1c;
    box-shadow: none;
    border-radius: 5px;
    color: #e9e2ce;
    margin-bottom: 4px;
    cursor: pointer;
  }
  .ux-menu :global(a) {
    color: #ead6a5;
  }
  .ux-menu :global(button:hover),
  .ux-menu :global(a:hover),
  .ux-menu :global(:focus-visible) {
    background: #c59c3d22;
  }
  .ux-menu :global(.lmu-button--danger) {
    color: #f2b4a1;
    border-color: #be806b99;
    background: #5d291c22;
    margin-top: 4px;
  }
</style>
