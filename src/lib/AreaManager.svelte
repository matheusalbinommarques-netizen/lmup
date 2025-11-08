<script lang="ts">
  import { db, type Area } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  // --- Props ---
  let { selectedId = $bindable('all') } = $props<{
    selectedId: 'all' | number;
  }>();

  // --- Estado Local ---
  let areas = $state<Area[]>([]);
  let newAreaName = $state('');

  // --- Conexão com DB ---
  const areasQuery = liveQuery(() => db.areas.orderBy('nome').toArray());

  onMount(() => {
    const sub = areasQuery.subscribe((dbAreas) => {
      areas = dbAreas;
    });
    return () => sub.unsubscribe();
  });

  // --- Ações ---
  async function handleAddArea(event: SubmitEvent) {
    event.preventDefault();
    const name = newAreaName.trim();
    if (!name) return;

    try {
      await db.areas.add({
        nome: name,
        cor: '#888888', // Placeholder
      });
      newAreaName = '';
    } catch (error) {
      console.error('Erro ao adicionar área:', error);
      alert('Falha ao adicionar área. Já existe uma com esse nome?');
    }
  }

  async function handleDeleteArea(
    areaId: number | undefined,
    areaName: string,
  ) {
    if (areaId === undefined) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir a área "${areaName}"?\n\nTodas as missões desta área serão movidas para "Geral".`,
      )
    ) {
      return;
    }

    try {
      await db.transaction('rw', db.areas, db.tasks, async () => {
        // 1. Reatribui missões órfãs para a área "Geral" (ID 0)
        await db.tasks.where('areaId').equals(areaId).modify({ areaId: 0 });
        // 2. Exclui a área
        await db.areas.delete(areaId);
      });

      if (selectedId === areaId) {
        selectedId = 'all';
      }
    } catch (error) {
      console.error('Erro ao excluir área:', error);
      alert('Falha ao excluir a área.');
    }
  }
</script>

<section class="flex flex-col gap-3">
  <h3 class="text-xl font-bold text-slate-200 font-serif">Áreas de Foco</h3>

  <div
    class="flex flex-row gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2"
    role="tablist"
    aria-label="Filtro de Áreas"
  >
    <button
      onclick={() => (selectedId = 'all')}
      class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                   {selectedId === 'all'
        ? 'bg-primary/20 text-primary border-primary/30'
        : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800'}"
      role="tab"
      aria-selected={selectedId === 'all'}
    >
      Todas
    </button>

    {#each areas as area (area.id)}
      <div
        class="relative shrink-0 group"
        role="tab"
        aria-selected={selectedId === area.id}
      >
        <button
          onclick={() => {
            if (area.id !== undefined) {
              selectedId = area.id;
            }
          }}
          class="w-full h-full pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors border
                           {selectedId === area.id
            ? 'bg-primary/20 text-primary border-primary/30'
            : 'text-slate-400 bg-slate-900/50 border-slate-800 hover:bg-slate-800'}"
        >
          {area.nome}
        </button>

        <button
          title="Excluir Área"
          aria-label="Excluir Área"
          onclick={() => handleDeleteArea(area.id, area.nome)}
          class="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full
                           bg-slate-700 text-slate-300 text-xs font-bold
                           flex items-center justify-center border-2 border-slate-900
                           opacity-0 group-hover:opacity-100 transition-opacity hover:!opacity-100 hover:bg-red-500 hover:text-white"
        >
          X
        </button>
      </div>
    {/each}
  </div>

  <form class="flex gap-2" onsubmit={handleAddArea}>
    <input
      type="text"
      bind:value={newAreaName}
      placeholder="Nova Área (ex: Programação)"
      class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
                   focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
    />
    <button
      type="submit"
      class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!newAreaName.trim()}
    >
      Criar Área
    </button>
  </form>
</section>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none; /* IE e Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
