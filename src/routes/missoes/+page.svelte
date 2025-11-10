<script lang="ts">
  import { db, type Task, type Area } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { xpService } from '$services/xpService';
  import AreaManager from '$lib/AreaManager.svelte';
  import AddTaskModal from '$lib/AddTaskModal.svelte';
  import XpByAreaChart from '$lib/XpByAreaChart.svelte';
  import StatsManager from '$lib/StatsManager.svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import SelfComparisonPanel from '$lib/SelfComparisonPanel.svelte';

  let tasks = $state<Task[]>([]);
  let areas = $state<Area[]>([]);
  let filter = $state<'active' | 'completed'>('active');
  let selectedAreaId = $state<'all' | number>('all');

  // Tipagem baseada no próprio Task
  type Rarity = Task['rarity'];
  const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

  let selectedRarity = $state<null | Rarity>(null);

  let isModalOpen = $state(false);
  let taskToEdit = $state<Task | null>(null);

  const tasksQuery = liveQuery(() =>
    db.tasks.orderBy('createdAt').reverse().toArray(),
  );
  const areasQuery = liveQuery(() => db.areas.toArray());

  onMount(() => {
    const tasksSub = tasksQuery.subscribe((dbTasks) => (tasks = dbTasks));
    const areasSub = areasQuery.subscribe((dbAreas) => (areas = dbAreas));
    return () => {
      tasksSub.unsubscribe();
      areasSub.unsubscribe();
    };
  });

  const areaMap = $derived(
    areas.reduce(
      (map, area) => {
        if (area.id) map[area.id] = area.nome;
        return map;
      },
      { 0: 'Geral' } as Record<number, string>,
    ),
  );

  // Cores de borda/texto por raridade (cards da lista)
  const rarityColors: Record<Rarity, string> = {
    common: 'border-slate-600 text-slate-400',
    rare: 'border-blue-500 text-blue-400',
    epic: 'border-purple-500 text-purple-400',
    legendary: 'border-[#ffb74d] text-[#ffb74d]',
  };

  // Labels em PT-BR por raridade
  const rarityLabels: Record<Rarity, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária',
  };

  // Estilos dos chips de filtro
  const chipBase =
    'px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors';
  const chipOn: Record<Rarity, string> = {
    common: 'bg-slate-700 text-slate-100 border-slate-400',
    rare: 'bg-blue-500/20 text-blue-300 border-blue-400',
    epic: 'bg-purple-500/20 text-purple-300 border-purple-400',
    legendary: 'bg-[#ffb74d]/20 text-[#ffb74d] border-[#ffb74d]',
  };
  const chipOff: Record<Rarity, string> = {
    common: 'border-slate-600 text-slate-400 hover:bg-slate-800',
    rare: 'border-blue-500 text-blue-400 hover:bg-blue-950/40',
    epic: 'border-purple-500 text-purple-400 hover:bg-purple-950/40',
    legendary:
      'border-[#ffb74d] text-[#ffb74d] hover:bg-[rgba(255,183,77,0.12)]',
  };

  function chipClass(r: Rarity): string {
    const state = selectedRarity === r ? chipOn[r] : chipOff[r];
    return `${chipBase} ${state}`;
  }

  function toggleRarity(r: Rarity) {
    selectedRarity = selectedRarity === r ? null : r;
  }

  // Lista filtrada (status + área + raridade)
  let filteredTasks = $derived(
    tasks
      .filter((t) => (filter === 'active' ? !t.completed : t.completed))
      .filter((t) =>
        selectedAreaId === 'all' ? true : t.areaId === selectedAreaId,
      )
      .filter((t) => (selectedRarity ? t.rarity === selectedRarity : true)),
  );

  async function toggleTask(id: number | undefined) {
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Não permite "desmarcar" missão concluída
    if (task.completed) return;

    // Marca como concluída
    await db.tasks.update(id, { completed: true });

    // Dá XP (e gold é calculado dentro do xpService)
    await xpService.addXp(task.xp);
  }

  function openAddTaskModal() {
    taskToEdit = null;
    isModalOpen = true;
  }

  function openEditTaskModal(task: Task) {
    taskToEdit = task;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    taskToEdit = null;
  }

  async function handleDeleteTask(task: Task) {
    if (!task.id) return;
    if (!confirm(`Tem certeza que deseja apagar a missão "${task.title}"?`)) {
      return;
    }

    try {
      if (task.completed) {
        await xpService.removeXp(task.xp);
      }
      await db.tasks.delete(task.id);
    } catch (error) {
      console.error('Erro ao excluir missão:', error);
      alert('Falha ao excluir missão.');
    }
  }
</script>

{#if isModalOpen}
  <AddTaskModal {taskToEdit} close={closeModal} />
{/if}

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Quadro de Missões"
    subtitle="Complete tarefas para ganhar XP, manter a chama da consistência acesa e evoluir seu herói!"
    align="center"
  />

  <!-- Painel principal de status -->
  <StatsManager />

  <!-- Tudo abaixo alinhado à mesma largura do StatsManager -->
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <!-- XP por área + comparação consigo mesmo + áreas -->
    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <XpByAreaChart />
      <SelfComparisonPanel />
      <AreaManager bind:selectedId={selectedAreaId} />
    </div>

    <!-- Card de filtro de raridade -->
    <section class="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-slate-400">
          Filtrar por raridade (opcional)
          {#if selectedRarity}
            <span class="ml-1 text-slate-500">
              • Mostrando apenas
              <strong class="uppercase">
                {rarityLabels[selectedRarity]}
              </strong>
            </span>
          {/if}
        </p>
        {#if selectedRarity}
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-slate-200 underline"
            onclick={() => (selectedRarity = null)}
          >
            Limpar
          </button>
        {/if}
      </div>

      <div class="flex flex-wrap gap-2">
        {#each rarityOrder as r (r)}
          <button
            type="button"
            class={chipClass(r)}
            onclick={() => toggleRarity(r)}
            aria-pressed={selectedRarity === r}
            aria-label={`Filtrar por raridade ${rarityLabels[r]}`}
          >
            {rarityLabels[r]}
          </button>
        {/each}
      </div>
    </section>

    <!-- Filtro de status + botão nova missão -->
    <div
      class="flex items-center justify-between gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800"
    >
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {filter ===
          'active'
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-slate-400 hover:bg-slate-800'}"
          onclick={() => (filter = 'active')}
        >
          Ativas
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {filter ===
          'completed'
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'text-slate-400 hover:bg-slate-800'}"
          onclick={() => (filter = 'completed')}
        >
          Concluídas
        </button>
      </div>

      <button
        onclick={openAddTaskModal}
        class="flex items-center gap-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
      >
        <span>+</span> Nova Missão
      </button>
    </div>

    <!-- Lista de missões -->
    <div class="grid grid-cols-1 gap-3">
      {#if filteredTasks.length === 0}
        <div
          class="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed"
        >
          <p>Nenhuma missão encontrada para esta seleção.</p>
          <button
            class="text-sm text-primary hover:underline mt-2"
            onclick={openAddTaskModal}
          >
            Adicionar uma missão?
          </button>
        </div>
      {:else}
        {#each filteredTasks as task (task.id)}
          <div
            class="group flex items-center gap-4 p-4 bg-slate-900/80 border rounded-xl transition-colors {rarityColors[
              task.rarity
            ]} {task.completed ? 'opacity-50 grayscale' : 'shadow-md'}"
          >
            <!-- Botão de completar -->
            <button
              onclick={() => toggleTask(task.id)}
              class="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                {task.completed
                ? 'bg-green-500/20 border-green-500 text-green-500'
                : 'border-slate-600 hover:border-[#ffb74d] text-transparent'}"
              aria-label="Completar missão"
            >
              {#if task.completed}✓{/if}
            </button>

            <!-- Título / área / raridade -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs font-bold uppercase tracking-wider opacity-70 {rarityColors[
                    task.rarity
                  ]}"
                >
                  {rarityLabels[task.rarity]}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                >
                  {areaMap[task.areaId] || 'Sem Área'}
                </span>
              </div>
              <h3
                class="text-slate-100 font-medium break-words whitespace-pre-line {task.completed
                  ? 'line-through'
                  : ''}"
              >
                {task.title}
              </h3>
            </div>

            <!-- Recompensas (XP + Gold) -->
            <div class="shrink-0 flex flex-col items-end gap-1 text-xs">
              <!-- XP -->
              <div class="flex items-center gap-1">
                <img
                  src="/art/icones/icon-xp.png"
                  alt="XP"
                  class="h-6 w-6 object-contain"
                />
                <span class="text-[#eec39a] font-bold">+{task.xp} XP</span>
              </div>

              <!-- Gold (50% do XP) -->
              <div class="flex items-center gap-1 text-amber-200">
                <img
                  src="/art/icones/gold-icon.png"
                  alt="Gold"
                  class="h-6 w-6 object-contain"
                />
                <span class="font-semibold">
                  +{Math.floor(task.xp * 0.5)} Gold
                </span>
              </div>
            </div>

            <!-- Ações (editar / excluir) -->
            <div
              class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                onclick={() => openEditTaskModal(task)}
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-slate-800"
                aria-label="Editar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A.75.75 0 0 1 17.25 19.75H6.75A.75.75 0 0 1 6 18.75V8.25A.75.75 0 0 1 6.75 7.5H10"
                  />
                </svg>
              </button>

              <button
                onclick={() => handleDeleteTask(task)}
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800"
                aria-label="Excluir"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 7.5h12M9.75 7.5v9.75m4.5-9.75v9.75M9 4.5h6a.75.75 0 0 1 .75.75V6H8.25v-.75A.75.75 0 0 1 9 4.5zm-3 2.25h12v12A2.25 2.25 0 0 1 15.75 21H8.25A.75.75 0 0 1 6 18.75v-12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
