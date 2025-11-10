<script lang="ts">
  import { db, type Area, type Task } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  let { close, taskToEdit = null } = $props<{
    close: () => void;
    taskToEdit: Task | null;
  }>();

  type Rarity = Task['rarity'];

  let title = $state('');
  let description = $state('');
  let areaId = $state(0);
  let areas = $state<Area[]>([]);
  let subtasks = $state<string[]>(['']);

  const isEditMode = $derived(taskToEdit !== null);

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
    // 1–2 subtarefas → comum
    return 'common';
  }

  const cleanSubtasks = $derived(
    subtasks.map((s) => s.trim()).filter((s) => s.length > 0),
  );

  const subtaskCount = $derived(cleanSubtasks.length || 1);

  const autoRarity = $derived(rarityFromSubtaskCount(subtaskCount));

  const autoXp = $derived(rarityXp[autoRarity]);

  const areasQuery = liveQuery(() => db.areas.toArray());

  onMount(() => {
    const sub = areasQuery.subscribe((dbAreas) => {
      areas = dbAreas;
    });

    if (isEditMode && taskToEdit) {
      title = taskToEdit.title;
      areaId = taskToEdit.areaId ?? 0;

      const anyTask = taskToEdit as any;
      description = anyTask.description ?? '';

      if (Array.isArray(anyTask.subtasks) && anyTask.subtasks.length > 0) {
        subtasks = anyTask.subtasks.map((s: any) => String(s ?? ''));
      } else {
        subtasks = [''];
      }
    }

    return () => sub.unsubscribe();
  });

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
      // mantém pelo menos um campo
      subtasks = [''];
      return;
    }
    subtasks = subtasks.filter((_, i) => i !== index);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const taskTitle = title.trim();
    if (!taskTitle) return;

    const finalSubtasks = cleanSubtasks;
    const count = finalSubtasks.length || 1;
    const rarity = rarityFromSubtaskCount(count);
    const xp = rarityXp[rarity];

    const taskData: any = {
      areaId: +areaId,
      title: taskTitle,
      rarity,
      xp,
      completed: isEditMode && taskToEdit ? taskToEdit.completed : false,
      createdAt: isEditMode && taskToEdit ? taskToEdit.createdAt : new Date(),
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

<div
  class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
  onclick={close}
  aria-hidden="true"
></div>

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

    <!-- Área + Raridade automática -->
    <div class="flex gap-4">
      <div class="flex-1">
        <label for="area" class="block text-sm font-medium text-slate-300 mb-1">
          Área de Foco
        </label>
        <select
          id="area"
          bind:value={areaId}
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
            focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        >
          <option value={0}>Geral</option>
          {#each areas as area (area.id)}
            <option value={area.id}>{area.nome}</option>
          {/each}
        </select>
      </div>

      <div class="flex-1">
        <!-- AQUI era <label>, agora é só texto -->
        <p class="block text-sm font-medium text-slate-300 mb-1">
          Raridade (automática)
        </p>
        <div
          class="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
        >
          <p class="font-semibold text-slate-100">
            {rarityLabels[autoRarity]} (+{autoXp} XP)
          </p>
          <p class="mt-1 text-[0.7rem] text-slate-400">
            Calculada a partir de {subtaskCount}
            {subtaskCount === 1 ? ' subtarefa' : ' subtarefas'}.
          </p>
          <p class="mt-1 text-[0.65rem] text-slate-500">
            1 = Comum • 3 = Rara • 5 = Épica • 10+ = Lendária
          </p>
        </div>
      </div>
    </div>

    <!-- Subtarefas -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <!-- AQUI também era <label>, trocado por <p> -->
        <p class="block text-sm font-medium text-slate-300">
          Subtarefas da Missão
        </p>
        <button
          type="button"
          class="text-[0.75rem] text-primary hover:underline"
          onclick={addSubtask}
        >
          + Adicionar subtask
        </button>
      </div>
      <p class="text-[0.7rem] text-slate-500 mb-2">
        Quebre a missão em passos menores. A quantidade total define a raridade.
      </p>

      <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
        {#each subtasks as subtask, index (index)}
          <div class="flex items-center gap-2">
            <input
              type="text"
              value={subtask}
              oninput={(e) =>
                updateSubtask(
                  index,
                  (e.currentTarget as HTMLInputElement).value,
                )}
              placeholder={`Subtarefa ${index + 1}`}
              class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200
                focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="button"
              class="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-red-400 text-xs"
              onclick={() => removeSubtask(index)}
              disabled={subtasks.length === 1}
            >
              ✕
            </button>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        type="button"
        onclick={close}
        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 font-bold text-sm rounded-lg transition-colors"
        disabled={!title.trim()}
      >
        {isEditMode ? 'Salvar Alterações' : '+ Criar Missão'}
      </button>
    </div>
  </form>
</div>
