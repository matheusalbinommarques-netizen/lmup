<script lang="ts">
  type Variant = 'primary' | 'success' | 'danger';

  const props = $props<{
    children?: () => unknown;
    variant?: Variant;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
  }>();

  // pega só o que a gente precisa do objeto de props
  let { children, onclick } = props;
  let disabled = props.disabled ?? false;
  let variant: Variant = props.variant ?? 'primary';
  let type: 'button' | 'submit' | 'reset' = props.type ?? 'button';

  const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };

  const base =
    'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';
</script>

<button {type} {disabled} class={`${base} ${variants[variant]}`} {onclick}>
  {@render children?.()}
</button>
