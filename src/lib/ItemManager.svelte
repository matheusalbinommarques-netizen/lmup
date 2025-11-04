<script>
  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';

  // 1. ADICIONADO: Importamos o 'browser' para evitar o hydration mismatch
  import { browser } from '$app/environment';

  // 2. CORRIGIDO: Importamos 'checkStreak' em vez de 'updateStreak'
  import { addXp, checkStreak } from '../services/xpService.js';

  let { area } = $props();
  let newItemName = $state('');
  let items = $state([]);

  // 3. CORRIGIDO: O $effect agora verifica se está no 'browser'
  $effect(() => {
    // Se não tiver 'area' OU se estiver no servidor, não faz nada.
    if (!area || !browser) {
      items = [];
      return;
    }

    // Este código agora só roda no navegador, evitando o mismatch
    const observable = liveQuery(() =>
      db['itens'].where('areaId').equals(area.id).toArray(),
    );

    const subscription = observable.subscribe((newItemsFromDB) => {
      items = newItemsFromDB;
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  async function handleAddItem(event) {
    event.preventDefault();
    const name = newItemName.trim();
    // Proteção extra para garantir que o db existe (só no browser)
    if (!name || !db) return;
    try {
      await db['itens'].add({
        nome: name,
        areaId: area.id,
        xp: 10, // Como no seu original
        tipo: 'task',
      });
      newItemName = '';
    } catch (e) {
      console.error('Falha ao adicionar item:', e);
    }
  }

  // 4. CORRIGIDO: A função chamada agora é 'checkStreak'
  async function handleCompleteItem(item) {
    // Proteção extra
    if (!db) return;
    try {
      await db.transaction('rw', db['itens'], db['meta'], async () => {
        // Ação 1: Adicionar o XP
        await addXp(item.xp);

        // Ação 2: Atualizar a Streak (NOME CORRIGIDO)
        await checkStreak();

        // Ação 3: Deletar o item
        await db['itens'].delete(item.id);
      });
    } catch (e) {
      console.error('Falha ao completar item:', e);
    }
  }
</script>

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
            onclick={() => handleCompleteItem(item)}
            variant="success"
            class="btn-complete"
          >
            Completar
          </BaseButton>
        </div>
      {/each}
    {:else}
      <p class="empty-message">Nenhum item cadastrado para esta área.</p>
    {/if}
  </div>
</BaseCard>

<style>
  :global(.btn-complete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }

  h3 {
    text-align: center;
    color: white;
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
    background-color: var(--cor-fundo-card);
    border-radius: var(--raio-borda-sm);
    border: 1px solid var(--cor-borda);
  }

  .item span {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--cor-texto-primario);
  }

  .empty-message {
    text-align: center;
    color: white;
    padding: var(--espacamento-lg);
  }

  :global(.btn-delete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }
</style>
