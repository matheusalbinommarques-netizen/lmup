<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  let {
    variant = 'primary',
    size,
    loading = false,
    disabled = false,
    children,
    class: className = '',
    ...rest
  }: HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
    /** D03 scale; screens not yet migrated keep their own sizing. */
    size?: 's' | 'm' | 'l';
    loading?: boolean;
    children?: Snippet;
  } = $props();
</script>

<button
  type="button"
  {...rest}
  class={`lmu-button lmu-button--${variant}${size ? ` lmu-button--${size}` : ''} ${className}`}
  disabled={disabled || loading}
  aria-busy={loading}
>
  {#if loading}<span class="lmu-spinner" aria-hidden="true"></span><span
      >Carregando…</span
    >{:else if children}{@render children()}{/if}
</button>
