<script lang="ts">
  import { db, type Task, type Area } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { xpService } from '$services/xpService';
  import AreaManager from '$lib/AreaManager.svelte';
  import AddTaskModal from '$lib/AddTaskModal.svelte';
  import XpByAreaChart from '$lib/XpByAreaChart.svelte';
  import StatsManager from '$lib/StatsManager.svelte';

  let tasks = $state<Task[]>([]);
  let areas = $state<Area[]>([]);
  let filter = $state<'active' | 'completed'>('active');
  let selectedAreaId = $state<'all' | number>('all');

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

  let filteredTasks = $derived(
    tasks
      .filter((t) => (filter === 'active' ? !t.completed : t.completed))
      .filter((t) =>
        selectedAreaId === 'all' ? true : t.areaId === selectedAreaId,
      ),
  );

  async function toggleTask(id: number | undefined) {
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = !task.completed;
    await db.tasks.update(id, { completed: newStatus });

    if (newStatus === true) {
      await xpService.addXp(task.xp);
    } else {
      await xpService.removeXp(task.xp);
    }
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

  const rarityColors = {
    common: 'border-slate-600 text-slate-400',
    rare: 'border-blue-500 text-blue-400',
    epic: 'border-purple-500 text-purple-400',
    legendary: 'border-[#ffb74d] text-[#ffb74d]',
  } as const;
</script>

{#if isModalOpen}
  <AddTaskModal {taskToEdit} close={closeModal} />
{/if}

<div class="flex flex-col gap-6">
  <header class="mb-4 flex flex-col items-center gap-3 text-center">
    <div>
      <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
        Quadro de Missões
      </h1>
      <p class="text-slate-400">
        Complete tarefas para ganhar XP, manter o streak e evoluir seu herói.
      </p>
    </div>
  </header>

  <!-- Painel principal de status (largura de referência) -->
  <StatsManager />

  <!-- Tudo abaixo alinhado à mesma largura do StatsManager -->
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <XpByAreaChart />

    <AreaManager bind:selectedId={selectedAreaId} />

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

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs font-bold uppercase tracking-wider opacity-70 {rarityColors[
                    task.rarity
                  ]}"
                >
                  {task.rarity}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                >
                  {areaMap[task.areaId] || 'Sem Área'}
                </span>
              </div>
              <h3
                class="text-slate-100 font-medium truncate {task.completed
                  ? 'line-through'
                  : ''}"
              >
                {task.title}
              </h3>
            </div>

            <div class="shrink-0 flex flex-col items-end">
              <span class="text-[#eec39a] font-bold">+{task.xp} XP</span>
            </div>

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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
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
                    d="M6 7.5h12M9.75 7.5v9.75m4.5-9.75v9.75M9 4.5h6a.75.75 0 0 1 .75.75V6H8.25v-.75A.75.75 0 0 1 9 4.5zm-3 2.25h12v12A2.25 2.25 0 0 1 15.75 21H8.25A2.25 2.25 0 0 1 6 18.75v-12z"
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
