<script lang="ts">
  import type { Snippet } from 'svelte';
  let {
    children,
    class: className = '',
    variant = 'default',
  }: {
    children: Snippet;
    class?: string;
    variant?: 'default' | 'featured' | 'subtle';
  } = $props();
</script>

<div class={`lmu-card lmu-card--${variant} ${className}`}>
  {@render children()}
</div>
