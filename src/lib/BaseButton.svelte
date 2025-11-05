<script lang="ts">
  import type { Snippet } from 'svelte';

  // Variantes aceitas
  export type Variant = 'primary' | 'secondary' | 'success' | 'danger';

  const props = $props<{
    variant?: Variant;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }>();

  const variants: Record<Variant, string> = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-card hover:bg-card/80 text-text',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const baseClasses =
    'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';

  // rune reativa pro variant atual
  const currentVariant = $derived((props.variant ?? 'primary') as Variant);
</script>

<button
  type={props.type ?? 'button'}
  class={`${baseClasses} ${variants[currentVariant]}`}
  disabled={props.disabled}
  onclick={props.onclick}
>
  {@render props.children?.()}
</button>
