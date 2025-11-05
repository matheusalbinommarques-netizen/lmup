<script lang="ts">
  import { db, type Item } from '../services/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { addXp, checkStreak } from '../services/xpService';

  let { areaId } = $props<{ areaId: number }>();

  let items = $state<Item[]>([]);
  let novoItemNome = $state('');
  let novoItemXp = $state(10);

  if (browser) {
    const sub = liveQuery(() =>
      db.items.where('areaId').equals(areaId).toArray(),
    ).subscribe((rows) => {
      items = rows;
    });

    $effect(() => () => sub.unsubscribe());
  }

  async function addItem() {
    const nome = novoItemNome.trim();
    const xp = Number(novoItemXp) || 0;
    if (!nome || xp <= 0) return;

    await db.items.add({ areaId, nome, xp, done: false });
    novoItemNome = '';
    novoItemXp = 10;
  }

  async function completar(item: Item) {
    await addXp(item.xp);
    checkStreak();
    await db.items.delete(item.id!);
  }

  async function remover(item: Item) {
    await db.items.delete(item.id!);
  }
</script>

<section class="space-y-4">
  <div class="flex gap-2">
    <input
      class="w-full rounded-md border bg-transparent px-3 py-2"
      placeholder="Nome do novo item (ex: Estudar Svelte 5)"
      bind:value={novoItemNome}
    />
    <input
      class="w-24 rounded-md border bg-transparent px-3 py-2 text-right"
      type="number"
      min="1"
      bind:value={novoItemXp}
    />
    <button
      class="px-4 py-2 rounded-md bg-blue-600 text-white"
      onclick={addItem}
    >
      Adicionar Item
    </button>
  </div>

  {#if items.length > 0}
    <ul class="space-y-2">
      {#each items as item (item.id)}
        <li class="rounded-md border p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-text">{item.nome}</span>
            <span class="text-sm opacity-70 ml-2">(+{item.xp} XP)</span>
          </div>
          <div class="flex gap-2">
            <button
              class="text-sm text-green-600"
              onclick={() => completar(item)}
            >
              concluir
            </button>
            <button class="text-sm text-red-500" onclick={() => remover(item)}>
              remover
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-sm opacity-70">Nenhum item cadastrado para esta área.</p>
  {/if}
</section>
