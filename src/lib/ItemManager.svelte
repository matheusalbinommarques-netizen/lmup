<script>
  // Palavras-chave globais (NÃO PRECISA IMPORTAR)
  // $state, $effect

  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';

  // --- PROPRIEDADES ---

  // Recebemos a 'area' selecionada como uma prop
  let { area } = $props();

  // --- ESTADO ---

  let newItemName = $state('');

  // 1. Declaramos 'items' como um array vazio
  let items = $state([]);

  // 2. Usamos '$effect' para assinar o liveQuery
  $effect(() => {
    // 3. Criamos o "Observable" do Dexie,
    //    mas desta vez filtrando por 'areaId'
    const observable = liveQuery(
      () =>
        db['itens']
          .where('areaId') // Onde 'areaId'
          .equals(area.id) // for igual ao ID da área que recebemos
          .toArray(), // E converte para array
    );

    // 4. Nós nos "inscrevemos" (subscribe) nele
    const subscription = observable.subscribe((newItemsFromDB) => {
      // 5. Quando o banco de dados mudar, atualizamos nosso $state
      items = newItemsFromDB;
    });

    // 6. Limpeza (cleanup) quando o componente for destruído
    //    ou quando a prop 'area' mudar
    return () => {
      subscription.unsubscribe();
    };
  });

  // --- AÇÕES (CREATE / DELETE) ---

  async function handleAddItem(event) {
    event.preventDefault();
    const name = newItemName.trim();
    if (!name) return;

    try {
      // Adicionamos o 'areaId' e um 'xp' padrão
      await db['itens'].add({
        nome: name,
        areaId: area.id,
        xp: 10, // <- AQUI ESTÁ A LÓGICA DE XP
        tipo: 'task',
      });
      newItemName = '';
    } catch (e) {
      console.error('Falha ao adicionar item:', e);
    }
  }

  async function handleDeleteItem(id) {
    try {
      await db['itens'].delete(id);
    } catch (e) {
      console.error('Falha ao deletar item:', e);
    }
  }
</script>

<!-- 
  Este BaseCard mostra os itens para a área específica
  que foi passada via $props()
-->
<BaseCard>
  <h3>Itens em: {area.nome}</h3>

  <form onsubmit={handleAddItem} class="add-form">
    <input
      type="text"
      placeholder="Nome do novo item (ex: Estudar Svelte 5)"
      bind:value={newItemName}
    />
    <BaseButton type="submit" variant="primary">Adicionar Item</BaseButton>
  </form>

  <div class="item-list">
    {#if items.length > 0}
      {#each items as item (item.id)}
        <div class="item">
          <span>{item.nome} (+{item.xp} XP)</span>
          <BaseButton
            onclick={() => handleDeleteItem(item.id)}
            variant="danger"
            class="btn-delete"
          >
            Excluir
          </BaseButton>
        </div>
      {/each}
    {:else}
      <p class="empty-message">Nenhum item cadastrado para esta área.</p>
    {/if}
  </div>
</BaseCard>

<style>
  h3 {
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

  .item-list {
    display: flex;
    flex-direction: column;
    gap: var(--espacamento-md);
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--espacamento-md);
    background-color: var(--cor-fundo);
    border-radius: var(--raio-borda-sm);
    border: 1px solid var(--cor-borda);
  }

  .item span {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .empty-message {
    text-align: center;
    color: var(--cor-texto-secundario);
    padding: var(--espacamento-lg);
  }

  /* O seletor :global que corrigimos antes */
  :global(.btn-delete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }
</style>
