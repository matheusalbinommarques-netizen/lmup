<script lang="ts">
  import { db } from '../services/db.js';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import BaseButton from './BaseButton.svelte';
  import ItemManager from './ItemManager.svelte';

  let newAreaName = $state('');
  let areas = $state([]);

  $effect(() => {
    if (!browser) {
      areas = [];
      return;
    }
    const observable = liveQuery(() => db.areas.toArray());
    const subscription = observable.subscribe((newAreas) => {
      areas = newAreas;
    });
    return () => subscription.unsubscribe();
  });

  async function handleAddArea(event: Event) {
    event.preventDefault();
    const name = newAreaName.trim();
    if (!name || !db) return;
    try {
      await db.areas.add({ nome: name });
      newAreaName = '';
    } catch (e) {
      console.error('Falha ao adicionar área:', e);
    }
  }
</script>

<div class="area-manager">
  <form
    onsubmit={handleAddArea}
    class="add-form flex gap-2 mb-6 p-4 bg-card border border-border rounded-lg shadow"
  >
    <input
      type="text"
      placeholder="Nome da nova área (ex: SvelteKit, Finanças)"
      bind:value={newAreaName}
      class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"
    />

    <BaseButton type="submit" variant="primary">
      Adicionar Área
    </BaseButton>
  </form>

  <div class="area-list flex flex-col gap-6">
    {#if areas.length > 0}
      {#each areas as area (area.id)}
        <ItemManager {area} />
      {/each}
    {:else}
      <p class="empty-message text-center text-text-secondary p-6">
        Nenhuma área de foco cadastrada. Crie uma acima para começar!
      </p>
    {/if}
  </div>
</div>