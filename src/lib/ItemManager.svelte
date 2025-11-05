<script lang="ts">
  import { db, type Item } from '../services/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { addXp, checkStreak } from '../services/xpService';

  // props
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

  // IDs únicos por área pra acessibilidade
  const nomeId = $derived(`nova-missao-${areaId}`);
  const xpId = $derived(`xp-missao-${areaId}`);
</script>

<section class="space-y-4">
  <!-- Form de nova missão -->
  <div
    class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3 md:flex-row md:items-end md:gap-4"
  >
    <div class="flex-1 space-y-1">
      <label class="text-xs font-medium text-text" for={nomeId}>
        Nova missão
      </label>
      <input
        id={nomeId}
        class="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70"
        placeholder="Nome do novo item (ex: Estudar Svelte 5)"
        bind:value={novoItemNome}
      />
    </div>

    <div class="flex items-end gap-2">
      <div class="space-y-1">
        <label class="text-xs font-medium text-text" for={xpId}> XP </label>
        <input
          id={xpId}
          class="w-20 rounded-lg border border-border bg-card/70 px-2 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/70"
          type="number"
          min="1"
          bind:value={novoItemXp}
        />
      </div>

      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duração-150 ease-in-out hover:bg-primary/90"
        onclick={addItem}
      >
        Adicionar
      </button>
    </div>
  </div>

  <!-- Lista de missões -->
  {#if items.length > 0}
    <ul class="space-y-2">
      {#each items as item (item.id)}
        <li
          class="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm shadow-sm"
        >
          <div class="flex items-center gap-2">
            <span class="text-text">{item.nome}</span>
            <span class="ml-1 text-xs text-text-secondary">(+{item.xp} XP)</span
            >
          </div>

          <div class="flex gap-2 text-xs">
            <button
              class="font-semibold text-emerald-400 hover:text-emerald-300"
              onclick={() => completar(item)}
            >
              concluir
            </button>
            <button
              class="font-semibold text-red-400 hover:text-red-300"
              onclick={() => remover(item)}
            >
              remover
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-xs text-text-secondary">
      Nenhum item cadastrado para esta área.
    </p>
  {/if}
</section>
