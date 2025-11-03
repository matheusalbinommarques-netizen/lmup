<script>
  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';

  // 1. Importamos o novo componente
  import ItemManager from './ItemManager.svelte';

  // --- ESTADO ---

  let newAreaName = $state('');
  let areas = $state([]);

  // 2. Adicionamos um estado para 'selecionar' uma área
  //    Começa como 'null' (mostrando a lista de áreas)
  let selectedArea = $state(null);

  // O $effect (que já funcionava)
  $effect(() => {
    const observable = liveQuery(() => db['areas'].toArray());

    const subscription = observable.subscribe((newAreasFromDB) => {
      areas = newAreasFromDB;
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  // --- AÇÕES (CREATE / DELETE / NAVEGAÇÃO) ---

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
  <!-- TELA DE ITENS (Sem mudança) -->
  <div class="header-nav">
    <BaseButton onclick={handleGoBack} variant="secondary">
      ← Voltar para Áreas
    </BaseButton>
  </div>
  <ItemManager area={selectedArea} />
{:else}
  <!-- TELA DE ÁREAS (Sem mudança no HTML) -->
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
  /* --- Estilos Adicionados (Para o novo botão) --- */
  .area-name-button {
    /* Reseta o estilo do botão para parecer texto */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit; /* Usa a fonte do elemento pai */
    color: inherit; /* Usa a cor do elemento pai */
    cursor: pointer;
    text-align: left; /* Alinha o texto à esquerda */
    flex-grow: 1; /* Faz ele ocupar o espaço */

    /* Estilização específica do item */
    font-size: 1.1rem;
    font-weight: 500;
  }

  .area-name-button:hover {
    text-decoration: underline; /* Efeito hover para mostrar que é clicável */
  }

  /* --- Estilos Antigos (AGORA CORRIGIDOS) --- */
  .header-nav {
    margin-bottom: var(--espacamento-md);
  }

  /* OS SELETORES EM BRANCO E COMENTADOS FORAM REMOVIDOS.
    Isso corrige os 4 erros de CSS.
  */

  h2 {
    text-align: center;
    color: var(--cor-texto-secundario);
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

  .area-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--espacamento-md);
    background-color: var(--cor-fundo);
    border-radius: var(--raio-borda-sm);
    border: 1px solid var(--cor-borda);
  }

  /* O SELETOR .area-item span FOI REMOVIDO,
    pois o estilo dele agora está em .area-name-button.
  */

  .empty-message {
    text-align: center;
    color: var(--cor-texto-secundario);
    padding: var(--espacamento-lg);
  }

  :global(.btn-delete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }
</style>
