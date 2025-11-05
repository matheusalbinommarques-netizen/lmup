<script lang="ts">
  import type { Snippet } from 'svelte';
  import type {
    KeyboardEventHandler,
    MouseEventHandler,
  } from 'svelte/elements';

  let {
    children,
    onclick = () => {},
    onkeydown = () => {},
    ...rest
  } = $props<{
    children?: Snippet;
    onclick?: MouseEventHandler<HTMLDivElement>;
    onkeydown?: KeyboardEventHandler<HTMLDivElement>;
  }>();

  function handleKeydown(event: KeyboardEvent) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }
</script>

<div
  class="base-card bg-card border border-border rounded-md p-4 shadow-lg focus-visible:outline-primary focus-visible:outline-offset-2"
  role="button"
  tabindex="0"
  {...rest}
  {onclick}
  onkeydown={handleKeydown || onkeydown}
>
  {@render children?.()}
</div>
