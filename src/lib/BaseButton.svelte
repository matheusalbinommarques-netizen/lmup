<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  let {
    variant = 'primary',
    class: userClass = '',
    type = 'button' as const,
    children,
    onclick = () => {},
    ...rest
  } = $props<{
    variant?: string;
    class?: string;
    type?: 'button' | 'reset' | 'submit';
    children?: Snippet;
    onclick?: MouseEventHandler<HTMLButtonElement>;
  }>();

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light focus-visible:ring-primary',
    success: 'bg-success text-white hover:bg-success/80 focus-visible:ring-success',
    danger: 'bg-danger text-white hover:bg-danger/80 focus-visible:ring-danger',
  };

  let baseClasses = 'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';
  let selectedVariant = variants[variant] || variants.primary;
</script>

<button type={type} {...rest} class="{baseClasses} {selectedVariant} {userClass}" onclick={onclick}>
  {@render children?.()}
</button>