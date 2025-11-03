<!--
  Um componente de cartão reutilizável.
  Qualquer conteúdo colocado entre <BaseCard>...</BaseCard>
  será renderizado onde o <slot /> está.
-->
<div class="card">
  <slot />
</div>

<style>
  .card {
    background-color: var(--cor-fundo-card);
    border: 1px solid var(--cor-borda);
    border-radius: var(--raio-borda-md);
    padding: var(--espacamento-lg);
    box-shadow: var(--sombra-card);
  }
</style>
