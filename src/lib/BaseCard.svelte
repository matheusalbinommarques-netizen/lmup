<script>
  let {
    children,
    variant = 'primary',
    class: extraClass = '',
    ...rest
  } = $props();
</script>

<button class="btn {variant} {extraClass}" {...rest}>
  {@render children()}
</button>

<style>
  .btn {
    font-family: var(--fonte-sistema);
    font-weight: 600;
    font-size: 1rem;
    padding: var(--espacamento-sm) var(--espacamento-md);
    border: none;
    border-radius: var(--raio-borda-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:hover {
    opacity: 0.85;
  }

  /* Variantes de Cor */
  .primary {
    background-color: var(--cor-marca-primaria);
    color: white;
  }

  .secondary {
    background-color: var(--cor-texto-secundario);
    color: white;
  }

  .danger {
    background-color: var(--cor-perigo);
    color: white;
  }

  /* NOVA VARIANTE ADICIONADA:
  */
  .success {
    background-color: var(--cor-sucesso);
    color: white;
  }
</style>
