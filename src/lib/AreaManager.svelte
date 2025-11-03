<script>
  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';
  import ItemManager from './ItemManager.svelte';

  // --- ESTADO ---

  let newAreaName = $state('');
  let areas = $state([]);
  let selectedArea = $state(null);

  // O $effect (sem alteração)
  $effect(() => {
    const observable = liveQuery(() => db['areas'].toArray());

    const subscription = observable.subscribe((newAreasFromDB) => {
      areas = newAreasFromDB;
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  // --- AÇÕES (Sem alteração) ---

  async function handleAddArea(event) {
    event.preventDefault();
    const name = newAreaName.trim();
    if (!name) return;

    try {
      await db['areas'].add({ nome: name });
      newAreaName = '';
    } catch (e) {
      console.error('Falha ao adicionar área:', e);
    }
  }

  async function handleDeleteArea(id) {
    try {
      await db['areas'].delete(id);
    } catch (e) {
      console.error('Falha ao deletar área:', e);
    }
  }

  function handleSelectArea(area) {
    selectedArea = area;
  }

  function handleGoBack() {
    selectedArea = null;
  }
</script>

{#if selectedArea}
  <!-- TELA DE ITENS (Sem alteração) -->
  <div class="header-nav">
    <BaseButton onclick={handleGoBack} variant="secondary">
      ← Voltar para Áreas
    </BaseButton>
  </div>
  <ItemManager area={selectedArea} />
{:else}
  <!-- TELA DE ÁREAS (Sem alteração no HTML) -->
  <BaseCard>
    <h2>Minhas Áreas de Foco</h2>

    <form onsubmit={handleAddArea} class="add-form">
      <input
        type="text"
        placeholder="Nome da nova área (ex: Programação)"
        bind:value={newAreaName}
      />
      <BaseButton type="submit" variant="primary">Adicionar</BaseButton>
    </form>

    <div class="area-list">
      {#if areas.length > 0}
        {#each areas as area (area.id)}
          <div class="area-item">
            <button
              type="button"
              class="area-name-button"
              onclick={() => handleSelectArea(area)}
            >
              {area.nome}
            </button>

            <BaseButton
              onclick={(e) => {
                e.stopPropagation();
                handleDeleteArea(area.id);
              }}
              variant="danger"
              class="btn-delete"
            >
              Excluir
            </BaseButton>
          </div>
        {/each}
      {:else}
        <p class="empty-message">Nenhuma área cadastrada ainda.</p>
      {/if}
    </div>
  </BaseCard>
{/if}

<style>
  /* --- Botão de Navegação (Texto da Área) --- */
  .area-name-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    cursor: pointer;
    text-align: left;
    flex-grow: 1;

    font-size: 1.1rem;
    font-weight: 500;

    /* * CORREÇÃO DE COR:
     * O botão (texto) deve ser PRETO (--cor-texto-primario)
     */
    color: var(--cor-texto-primario);
  }

  .area-name-button:hover {
    text-decoration: underline;
  }

  .header-nav {
    margin-bottom: var(--espacamento-md);
  }

  /* * CORREÇÃO DE COR:
   * Título ("Minhas Áreas de Foco") deve ser BRANCO
   * para contrastar com o BaseCard azul.
   */
  h2 {
    text-align: center;
    color: white; /* Estava var(--cor-texto-primario) */
    margin-bottom: var(--espacamento-lg);
  }

  .add-form {
    display: flex;
    gap: var(--espacamento-sm);
    margin-bottom: var(--espacamento-lg);
  }

  .add-form input {
    flex-grow: 1;
    padding: var(--espacamento-sm) var(--espacamento-md);
    font-size: 1rem;
    border: 1px solid var(--cor-borda);
    border-radius: var(--raio-borda-sm);
  }

  .area-list {
    display: flex;
    flex-direction: column;
    gap: var(--espacamento-md);
  }

  /* * CORREÇÃO DE COR:
   * O item da lista (Área) deve ter o fundo BRANCO
   * para contrastar com o BaseCard azul.
   */
  .area-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--espacamento-md);

    background-color: var(--cor-fundo-card); /* Era --cor-fundo */
    border-radius: var(--raio-borda-sm);
    border: 1px solid var(--cor-borda);
  }

  /* * CORREÇÃO DE COR:
   * Mensagem de "vazio" deve ser BRANCA
   * para contrastar com o BaseCard azul.
   */
  .empty-message {
    text-align: center;
    color: white; /* Estava var(--cor-texto-primario) */
    padding: var(--espacamento-lg);
  }

  :global(.btn-delete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }
</style>
