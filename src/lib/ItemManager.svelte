<script lang="ts">
  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';
  import { browser } from '$app/environment';
  import { addXp, checkStreak } from '../services/xpService.js';

  let { area } = $props<{ area: any }>();
  let newItemName = $state('');
  let items = $state([]);

  $effect(() => {
    if (!area || !browser) {
      items = [];
      return;
    }
    const observable = liveQuery(() =>
      db.itens.where('areaId').equals(area.id).toArray(),
    );
    const subscription = observable.subscribe((newItemsFromDB) => {
      items = newItemsFromDB;
    });
    return () => subscription.unsubscribe();
  });

  async function handleAddItem(event: Event) {
    event.preventDefault();
    const name = newItemName.trim();
    if (!name || !db) return;
    try {
      await db.itens.add({
        nome: name,
        areaId: area.id,
        xp: 10,
        tipo: 'task',
      });
      newItemName = '';
    } catch (e) {
      console.error('Falha ao adicionar item:', e);
    }
  }

  async function handleCompleteItem(item: any) {
    if (!db) return;
    try {
      await db.transaction('rw', db.itens, db.meta, async () => {
        await addXp(item.xp);
        await checkStreak();
        await db.itens.delete(item.id);
      });
    } catch (e) {
      console.error('Falha ao completar item:', e);
    }
  }
</script>

<BaseCard>
  <h3 class="text-xl font-semibold text-center text-text mb-4">{area.nome}</h3>

  <form onsubmit={handleAddItem} class="flex gap-2 mb-4">
    <input
      type="text"
      placeholder="Nome do novo item (ex: Estudar Svelte 5)"
      bind:value={newItemName}
      class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
    />
    <BaseButton type="submit" variant="primary">Adicionar Item</BaseButton>
  </form>

  <div class="item-list flex flex-col gap-3">
    {#if items.length > 0}
      {#each items as item (item.id)}
        <div
          class="item flex justify-between items-center p-3 bg-background rounded-md border border-border"
        >
          <span class="text-text">
            {item.nome}
            <span class="text-sm text-text-secondary ml-2">(+{item.xp} XP)</span
            >
          </span>

          <BaseButton
            onclick={() => handleCompleteItem(item)}
            variant="success"
            class="py-1 px-3 text-sm"
          >
            Completar
          </BaseButton>
        </div>
      {/each}
    {:else}
      <p class="empty-message text-center text-text-secondary p-4">
        Nenhum item cadastrado para esta área.
      </p>
    {/if}
  </div>
</BaseCard>