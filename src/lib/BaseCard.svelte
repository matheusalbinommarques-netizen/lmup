<script>
  let {
    variant = 'primary',
    class: userClass = '',
    type = 'button',

    // --- CORREÇÃO (ERRO 3) ---
    // A <slot> agora é passada como a prop 'children'
    children,

    // --- CORREÇÃO (ERRO 2) ---
    // 'on:click' está depreciado, recebemos 'onclick' como uma prop
    onclick = () => {},

    ...rest
  } = $props();

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-light focus-visible:ring-primary',
    success:
      'bg-success text-white hover:bg-success/80 focus-visible:ring-success',
    danger: 'bg-danger text-white hover:bg-danger/80 focus-visible:ring-danger',
  };

  let baseClasses =
    'px-4 py-2 rounded-md font-semibold text-sm shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';
</script>

<button
  {type}
  {...rest}
  class="{baseClasses} {variants[variant]} {userClass}"
  {onclick}
>
  {@render children?.()}
</button>
