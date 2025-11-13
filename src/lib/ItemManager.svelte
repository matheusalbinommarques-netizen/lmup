<!-- src/lib/ItemManager.svelte -->
<script lang="ts">
  import { db } from '$services/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { xpService } from '$services/xpService';

  // props
  let { areaId } = $props<{ areaId: number }>();

  // Alinhado com o schema legado ItemV1 (tabela items)
  type LegacyItem = {
    id?: number;
    areaId: number;
    titulo: string;
    xp?: number;
  };

  let items = $state<LegacyItem[]>([]);
  let novoItemNome = $state('');
  let novoItemXp = $state(10);

  // liveQuery só no client
  if (browser) {
    const sub = liveQuery(() =>
      db.items.where('areaId').equals(areaId).toArray(),
    ).subscribe((rows) => {
      items = rows as LegacyItem[];
    });

    $effect(() => () => sub.unsubscribe());
  }

  async function addItem() {
    const nome = novoItemNome.trim();
    const xp = Number(novoItemXp) || 0;
    if (!nome || xp <= 0) return;

    // ItemV1: { id, areaId, titulo, xp }
    await db.items.add({
      areaId,
      titulo: nome,
      xp,
    });

    novoItemNome = '';
    novoItemXp = 10;
  }

  async function completar(item: LegacyItem) {
    const xp = item.xp ?? 0;

    if (xp > 0) {
      // usa o serviço novo unificado de XP
      await xpService.addXp(xp);
    }

    if (item.id != null) {
      await db.items.delete(item.id);
    }
  }

  async function remover(item: LegacyItem) {
    if (item.id != null) {
      await db.items.delete(item.id);
    }
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
        class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90"
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
            <span class="text-text">{item.titulo}</span>
            <span class="ml-1 text-xs text-text-secondary"
              >(+{item.xp ?? 0} XP)</span
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
