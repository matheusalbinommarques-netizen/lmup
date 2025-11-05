<script lang="ts">
  import { db, type Area } from '../services/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';

  let areas = $state<Area[]>([]);
  let novaArea = $state('');

  if (browser) {
    const sub = liveQuery(() => db.areas.toArray()).subscribe((rows) => {
      areas = rows;
    });

    $effect(() => () => sub.unsubscribe());
  }

  async function addArea() {
    const nome = novaArea.trim();
    if (!nome) return;
    await db.areas.add({ nome });
    novaArea = '';
  }

  async function removeArea(id: number) {
    await db.areas.delete(id);
  }
</script>

<section class="space-y-4">
  <div class="flex gap-2">
    <input
      class="w-full rounded-md border bg-transparent px-3 py-2"
      placeholder="Nome da nova área (ex: SvelteKit, Finanças)"
      bind:value={novaArea}
    />
    <button
      class="px-4 py-2 rounded-md bg-blue-600 text-white"
      onclick={addArea}
    >
      Adicionar Área
    </button>
  </div>

  {#if areas.length === 0}
    <p class="text-sm opacity-70">Nenhuma área cadastrada ainda.</p>
  {:else}
    <ul class="space-y-2">
      {#each areas as area (area.id)}
        <li class="rounded-md border p-3 flex items-center justify-between">
          <span class="font-medium">{area.nome}</span>
          <button
            class="text-sm text-red-500"
            onclick={() => removeArea(area.id!)}
          >
            remover
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</section>
