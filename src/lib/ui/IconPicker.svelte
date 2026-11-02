<script lang="ts">
  import { approvedIcons } from '$lib/content/visualAssets';
  import ApprovedIcon from './ApprovedIcon.svelte';
  let {
    value = $bindable<string | null>(null),
    buttonTrigger = false,
    label = 'Ícone da área',
  }: {
    value?: string | null;
    buttonTrigger?: boolean;
    label?: string;
  } = $props();
  const uid = $props.id();
  function close() {
    expanded = false;
    document.getElementById(uid)?.hidePopover();
  }
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

{#snippet choicesPanel()}
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
        close();
      }}><ApprovedIcon size={32} /><span>Padrão</span></button
    >
    {#each choices as item (item.key)}<button
        type="button"
        aria-pressed={value === item.key}
        onclick={() => {
          value = item.key;
          close();
        }}
        ><ApprovedIcon name={item.key} size={32} /><span>{item.label}</span
        ></button
      >{/each}
  </div>
{/snippet}
{#if buttonTrigger}
  <button
    type="button"
    class="lmu-button lmu-button--secondary icon-trigger"
    popovertarget={uid}>{label}</button
  >
  <div
    id={uid}
    popover="auto"
    class="icon-popover"
    role="dialog"
    aria-label="Escolher ícone da área"
  >
    <header>
      <strong>Escolher ícone da área</strong><button
        type="button"
        popovertarget={uid}
        popovertargetaction="hide"
        aria-label="Fechar seleção de ícone">✕</button
      >
    </header>
    {@render choicesPanel()}
  </div>
{:else}
  <details class="icon-picker" bind:open={expanded}>
    <summary
      ><ApprovedIcon name={value} size={28} /><span>{label}</span></summary
    >{@render choicesPanel()}
  </details>
{/if}

<style>
  .icon-trigger {
    max-width: 100%;
    min-width: 0;
    font-size: 0.82rem;
    min-height: 42px;
  }
  .icon-popover {
    position: fixed;
    inset: 0;
    margin: auto;
    width: min(520px, calc(100% - 32px));
    height: fit-content;
    max-height: 85dvh;
    overflow: auto;
    background: #0b2023;
    border: 1px solid #ae8848;
    border-radius: 12px;
    padding: 18px;
    color: #e9d8ab;
    box-shadow: 0 16px 50px #0009;
  }
  .icon-popover::backdrop {
    background: #03101488;
  }
  .icon-popover header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .icon-popover header button {
    background: transparent;
    border: 0;
    color: #dfcca3;
    padding: 10px;
    cursor: pointer;
  }

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
  .icon-choices button {
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
  .icon-choices button[aria-pressed='true'] {
    border-color: #eac06a;
    background: #70502644;
  }
</style>
