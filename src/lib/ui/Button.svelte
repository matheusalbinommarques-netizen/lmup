<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  let {
    variant = 'primary',
    loading = false,
    disabled = false,
    children,
    class: className = '',
    ...rest
  }: HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
    loading?: boolean;
    children?: Snippet;
  } = $props();
</script>

<button
  type="button"
  {...rest}
  class={`lmu-button lmu-button--${variant} ${className}`}
  disabled={disabled || loading}
  aria-busy={loading}
>
  {#if loading}<span class="lmu-spinner" aria-hidden="true"></span><span
      >Carregando…</span
    >{:else if children}{@render children()}{/if}
</button>
