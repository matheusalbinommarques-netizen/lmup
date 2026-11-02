<script lang="ts">
  import { approvedIcons } from '$lib/content/visualAssets';
  import ApprovedIcon from './ApprovedIcon.svelte';
  let { value = $bindable<string | null>(null) } = $props();
  let search = $state('');
  let expanded = $state(false);
  const choices = $derived(
    approvedIcons.filter(
      (item) =>
        !item.key.startsWith('chip_') &&
        item.label
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR')),
    ),
  );
</script>

<details class="icon-picker" bind:open={expanded}>
  <summary
    ><ApprovedIcon name={value} size={32} /><span>Ícone da área</span></summary
  >
  <p class="lmu-hint">
    Todas as missões desta área usam este símbolo. Sem escolha, usamos o ícone
    padrão de Missões.
  </p>
  <label class="journey-label lmu-field"
    >Buscar ícone<input
      type="search"
      bind:value={search}
      placeholder="Ex.: estudo, exercício"
    /></label
  >
  <div class="icon-choices" role="group" aria-label="Ícone da área">
    <button
      type="button"
      aria-pressed={!value}
      onclick={() => {
        value = null;
        expanded = false;
      }}><ApprovedIcon size={32} /><span>Padrão</span></button
    >
    {#each choices as item (item.key)}<button
        type="button"
        aria-pressed={value === item.key}
        onclick={() => {
          value = item.key;
          expanded = false;
        }}
        ><ApprovedIcon name={item.key} size={32} /><span>{item.label}</span
        ></button
      >{/each}
  </div>
</details>

<style>
  summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #e9cc91;
    min-height: 44px;
  }
  .icon-choices {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
    gap: 0.4rem;
    max-height: 240px;
    overflow: auto;
    margin: 0.6rem 0;
  }
  button {
    display: grid;
    justify-items: center;
    gap: 0.2rem;
    border: 1px solid #536359;
    border-radius: 6px;
    background: #0a1a1d;
    color: #e8e5d7;
    padding: 0.5rem 0.2rem;
    font-size: 0.65rem;
  }
  button[aria-pressed='true'] {
    border-color: #eac06a;
    background: #70502644;
  }
</style>
