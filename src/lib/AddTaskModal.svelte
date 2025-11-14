<!-- src/lib/AddTaskModal.svelte -->
<script lang="ts">
  import { db, type Area, type Task, type HeroProject } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  // --- Props ---
  let { close, taskToEdit = null } = $props<{
    close: () => void;
    taskToEdit: Task | null;
  }>();

  type Rarity = Task['rarity'];

  // --- Estado de formulário ---
  let title = $state('');
  let description = $state('');

  // HTML <select> sempre entrega string; convertemos no submit
  let areaIdStr = $state('0');
  let projectIdStr = $state<'none' | string>('none');

  let areas = $state<Area[]>([]);
  let projects = $state<HeroProject[]>([]);
  let subtasks = $state<string[]>(['']);

  // modal não precisa reatividade na prop; ela não muda depois de aberto
  const isEditMode = taskToEdit !== null;

  const rarityLabels: Record<Rarity, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária',
  };

  const rarityXp: Record<Rarity, number> = {
    common: 50,
    rare: 100,
    epic: 250,
    legendary: 500,
  };

  function rarityFromSubtaskCount(count: number): Rarity {
    if (count >= 10) return 'legendary';
    if (count >= 5) return 'epic';
    if (count >= 3) return 'rare';
    return 'common';
  }

  // --------- DERIVED para UI (dependências explícitas!) ---------
  const subtaskCount = $derived(
    subtasks.map((s) => s.trim()).filter((s) => s.length > 0).length || 1,
  );

  const autoRarity = $derived(rarityFromSubtaskCount(subtaskCount));
  const autoXp = $derived(rarityXp[autoRarity]);

  // ------------------------------------------------------------------

  const areasQuery = liveQuery(() => db.areas.toArray());
  const projectsQuery = liveQuery(() => db.projects.toArray());

  onMount(() => {
    const subAreas = areasQuery.subscribe((dbAreas) => {
      areas = dbAreas ?? [];
    });

    const subProjects = projectsQuery.subscribe((dbProjects) => {
      projects = dbProjects ?? [];
    });

    if (isEditMode && taskToEdit) {
      title = taskToEdit.title;
      areaIdStr = String(taskToEdit.areaId ?? 0);

      const anyTask = taskToEdit as any;
      description = anyTask.description ?? '';

      if (Array.isArray(anyTask.subtasks) && anyTask.subtasks.length > 0) {
        subtasks = anyTask.subtasks.map((s: any) => String(s ?? ''));
      } else {
        subtasks = [''];
      }

      if (anyTask.projectId != null) {
        projectIdStr = String(anyTask.projectId);
      } else {
        projectIdStr = 'none';
      }
    }

    return () => {
      subAreas.unsubscribe();
      subProjects.unsubscribe();
    };
  });

  // --------- Subtarefas helpers ---------
  function addSubtask() {
    subtasks = [...subtasks, ''];
  }

  function updateSubtask(index: number, value: string) {
    const copy = [...subtasks];
    copy[index] = value;
    subtasks = copy;
  }

  function removeSubtask(index: number) {
    if (subtasks.length === 1) {
      subtasks = [''];
      return;
    }
    subtasks = subtasks.filter((_, i) => i !== index);
  }

  // --------- Submit ---------
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const taskTitle = title.trim();
    if (!taskTitle) return;

    // Limpa subtarefas para gravar
    const finalSubtasks = subtasks
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const count = finalSubtasks.length || 1;
    const rarity: Rarity = rarityFromSubtaskCount(count);
    const xp = rarityXp[rarity];

    const now = new Date();

    const projectId =
      projectIdStr === 'none'
        ? null
        : Number.parseInt(projectIdStr, 10) || null;

    const taskData: any = {
      areaId: Number.parseInt(areaIdStr, 10) || 0,
      title: taskTitle,
      rarity,
      xp,
      projectId,
      completed: isEditMode && taskToEdit ? taskToEdit.completed : false,
      status:
        isEditMode && taskToEdit
          ? ((taskToEdit as any).status ?? 'available')
          : 'available',
      createdAt: isEditMode && taskToEdit ? taskToEdit.createdAt : now,
      updatedAt: now,
      description: description.trim() || null,
      subtasks: finalSubtasks,
    };

    try {
      if (isEditMode && taskToEdit?.id) {
        await db.tasks.update(taskToEdit.id, taskData);
      } else {
        await db.tasks.add(taskData);
      }
      close();
    } catch (error) {
      console.error('Erro ao salvar missão:', error);
      alert('Falha ao salvar a missão.');
    }
  }
</script>

<!-- overlay -->
<div
  class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
  onclick={close}
  aria-hidden="true"
></div>

<!-- modal -->
<div
  class="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2
    bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title" class="text-xl font-bold text-[#ffb74d] font-serif mb-6">
    {isEditMode ? 'Editar Missão' : 'Forjar Nova Missão'}
  </h2>

  <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
    <!-- Título -->
    <div>
      <label for="title" class="block text-sm font-medium text-slate-300 mb-1">
        Título da Missão
      </label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="Ex: Estudar capítulo de algoritmos..."
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
          focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        required
      />
    </div>

    <!-- Descrição -->
    <div>
      <label
        for="description"
        class="block text-sm font-medium text-slate-300 mb-1"
      >
        Descrição (opcional)
      </label>
      <textarea
        id="description"
        rows="3"
        bind:value={description}
        placeholder="Detalhe o objetivo, links importantes ou observações desta missão..."
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
          focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30 resize-none"
      ></textarea>
    </div>

    <!-- Área + Projeto + Raridade automática -->
    <div class="flex flex-col gap-3">
      <div class="flex gap-4">
        <!-- Área -->
        <div class="flex-1">
          <label
            for="area"
            class="block text-sm font-medium text-slate-300 mb-1"
          >
            Área de Foco
          </label>
          <select
            id="area"
            bind:value={areaIdStr}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
          >
            <option value="0">Geral</option>
            {#each areas as area (area.id)}
              <option value={String(area.id)}>{area.nome}</option>
            {/each}
          </select>
        </div>

        <!-- Projeto -->
        <div class="flex-1">
          <label
            for="project"
            class="block text-sm font-medium text-slate-300 mb-1"
          >
            Projeto (opcional)
          </label>
          <select
            id="project"
            bind:value={projectIdStr}
            class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
          >
            <option value="none">Sem projeto</option>
            {#each projects as project (project.id)}
              <option value={String(project.id)}>{project.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Raridade / XP auto -->
      <div
        class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"
      >
        <div class="flex flex-col">
          <span
            class="text-[0.7rem] text-slate-400 uppercase tracking-[0.18em]"
          >
            Dificuldade / Recompensa
          </span>
          <span class="text-sm font-semibold text-slate-100">
            {rarityLabels[autoRarity]} · {autoXp} XP
          </span>
        </div>
        <span
          class="rounded-full bg-slate-800/80 px-3 py-1 text-[0.7rem] text-slate-200"
        >
          {subtaskCount}
          {subtaskCount === 1 ? 'subtarefa' : 'subtarefas'}
        </span>
      </div>
    </div>

    <!-- Subtarefas -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <p class="block text-sm font-medium text-slate-300">
          Subtarefas (passos da missão)
        </p>
        <button
          type="button"
          class="text-xs font-medium text-primary hover:underline"
          onclick={addSubtask}
        >
          + Adicionar passo
        </button>
      </div>

      <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
        {#each subtasks as subtask, index (index)}
          <div class="flex gap-2">
            <input
              type="text"
              class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200
                focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
              placeholder={`Passo ${index + 1}`}
              value={subtask}
              oninput={(event) =>
                updateSubtask(
                  index,
                  (event.currentTarget as HTMLInputElement).value,
                )}
            />
            <button
              type="button"
              class="rounded-lg border border-slate-700 px-2 text-xs text-slate-300 hover:bg-slate-800"
              onclick={() => removeSubtask(index)}
            >
              ✕
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- Ações -->
    <div class="mt-4 flex justify-end gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        onclick={close}
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="rounded-lg bg-[#ffb74d] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#ffca6b]"
      >
        {isEditMode ? 'Salvar alterações' : 'Criar missão'}
      </button>
    </div>
  </form>
</div>
