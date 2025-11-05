<script lang="ts">
  import type { Snippet } from 'svelte';

  const props = $props<{
    title?: string;
    class?: string;
    children?: Snippet;
  }>();
</script>

<section
  class={`bg-card rounded-xl shadow-lg border border-border/60 p-6 md:p-8 space-y-4 ${props.class ?? ''}`}
>
  {#if props.title}
    <header class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-text">
        {props.title}
      </h2>
    </header>
  {/if}

  <div>
    {@render props.children?.()}
  </div>
</section>
