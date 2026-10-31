<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  const uid = $props.id();
  let {
    open = $bindable(false),
    title,
    description = '',
    children,
    dismissible = true,
  }: {
    open?: boolean;
    title: string;
    description?: string;
    children: Snippet;
    dismissible?: boolean;
  } = $props();
  let element: HTMLDialogElement;
  function containFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const controls = [
      ...element.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
      ),
    ].filter((node) => node.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  $effect(() => {
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    (
      element.querySelector('[data-initial-focus]') as HTMLElement | null
    )?.focus();
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = oldOverflow;
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  });
</script>

<dialog
  onkeydown={containFocus}
  bind:this={element}
  class="lmu-dialog"
  aria-labelledby={`${uid}-title`}
  aria-describedby={description ? `${uid}-description` : undefined}
  oncancel={(event) => {
    if (!dismissible) event.preventDefault();
    else open = false;
  }}
  onclose={() => {
    open = false;
  }}
>
  <header>
    <h2 id={`${uid}-title`}>{title}</h2>
    <Button
      variant="quiet"
      disabled={!dismissible}
      aria-label="Fechar diálogo"
      onclick={() => {
        open = false;
      }}>✕</Button
    >
  </header>
  {#if description}<p id={`${uid}-description`} class="lmu-muted">
      {description}
    </p>{/if}
  {@render children()}
</dialog>
