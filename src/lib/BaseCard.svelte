<script>
  // Capturamos 'children' (para o slot) e '...rest' (para eventos como 'onclick')
  let { children, ...rest } = $props();

  // --- CORREÇÃO AQUI ---
  // A lógica '.self' (para não capturar cliques de input)
  // é tratada manualmente, como você sugeriu.
  function handleKeydown(event) {
    // Se o evento não for no próprio card, ignore.
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }
</script>

<div
  class="base-card bg-card border border-border rounded-md p-4 shadow-lg focus-visible:outline-primary focus-visible:outline-offset-2"
  role="button"
  tabindex="0"
  {...rest}
  onkeydown={handleKeydown}
>
  {@render children?.()}
</div>
