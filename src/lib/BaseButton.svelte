<script>
  // Em Svelte 5 (Runes) com JavaScript:

  // 1. Pegamos as props que usamos manualmente (children, variant)
  // 2. Pegamos uma prop 'class' (que o usuário pode passar) e damos a ela um
  //    valor padrão e um nome ('extraClass')
  // 3. Pegamos '...rest', que é um objeto com TODAS as outras props
  //    (incluindo 'onclick', 'disabled', 'aria-label', etc.)
  let {
    children,
    variant = 'primary',
    class: extraClass = '',
    ...rest
  } = $props();
</script>

<!-- 
  Agora nós:
  1. Juntamos nossas classes internas (`btn`, `variant`) com a 'extraClass'.
  2. Espalhamos (`{...rest}`) todas as outras props no botão.
     O 'onclick={increment}' do App.svelte será aplicado aqui.
-->
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
</style>
