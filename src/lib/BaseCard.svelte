<script>
  // Função helper para lidar com o clique do teclado
  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      // Impede o espaço de rolar a página
      event.preventDefault();
      // Dispara o evento de clique no próprio elemento
      event.currentTarget.click();
    }
  }
</script>

<div
  class="base-card"
  role="button"
  tabindex="0"
  on:click
  on:keydown={handleKeydown}
>
  <slot />
</div>

<style>
  .base-card {
    /* Estilos que você provavelmente tinha no BaseCard */
    background-color: var(--cor-fundo-card, #2a2a2a);
    border-radius: var(--raio-borda-md, 8px);
    border: 1px solid var(--cor-borda, #444);
    padding: var(--espacamento-md, 16px);
    box-shadow: var(--sombra-card, 0 4px 6px rgba(0, 0, 0, 0.1));

    /* Adiciona um feedback visual para foco (bom para acessibilidade) */
    transition: outline 0.1s ease-out;
  }

  .base-card:focus-visible {
    outline: 2px solid var(--cor-marca-primaria, #4f46e5);
    outline-offset: 2px;
  }
</style>
