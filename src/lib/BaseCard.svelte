<script>
  // A lógica de acessibilidade permanece
  function handleKeydown(event) {
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
  on:click
  on:keydown={handleKeydown}
>
  <slot />
</div>
