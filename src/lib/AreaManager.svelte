<script>
  // Palavras-chave globais - NENHUM IMPORT de $state, $derived, ou $effect

  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';

  // --- ESTADO ---

  let newAreaName = $state('');

  //
  // CORREÇÃO DEFINITIVA (Zero Erros)
  //
  // 1. Declaramos 'areas' como um array vazio usando $state.
  //    Isso resolve TODOS os 5 erros de tipo (length, iterable, id, nome)
  //    porque 'areas' é sempre um array.
  //
  let areas = $state([]);

  // 2. Usamos '$effect' (o novo 'onMount') para assinar o liveQuery.
  $effect(() => {
    // 3. Criamos o "Observable" do Dexie
    const observable = liveQuery(() => db['areas'].toArray());

    // 4. Nós nos "inscrevemos" (subscribe) nele
    const subscription = observable.subscribe((newAreasFromDB) => {
      // 5. Quando o banco de dados mudar, atualizamos nosso $state
      areas = newAreasFromDB;
    });

    // 6. O $effect retorna uma função de "limpeza" (cleanup)
    //    Isso cancela a inscrição (unsubscribe) quando o componente é destruído.
    return () => {
      subscription.unsubscribe();
    };
  });

  // --- AÇÕES (CREATE / DELETE) ---

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
</script>

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
    <!-- 
      Agora isso funciona perfeitamente,
      porque 'areas' começa como '[]'
    -->
    {#if areas.length > 0}
      <!-- 
        Isso também funciona, porque 'areas' é um array,
        então 'area' é um item (não 'unknown')
      -->
      {#each areas as area (area.id)}
        <div class="area-item">
          <span>{area.nome}</span>
          <BaseButton
            onclick={() => handleDeleteArea(area.id)}
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

<style>
  /* O CSS não muda */
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

  .area-item span {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .empty-message {
    text-align: center;
    color: var(--cor-texto-secundario);
    padding: var(--espacamento-lg);
  }

  :global(.btn-delete) {
    padding: var(--espacamento-xs) var(--espacamento-sm);
  }
</style>
