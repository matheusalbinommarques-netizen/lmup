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
  let rarity = $state<Rarity>('common');
  let areaId = $state(0);
  let areas = $state<Area[]>([]);

  const isEditMode = $derived(taskToEdit !== null);

  const rarityOptions: Record<Rarity, number> = {
    common: 50,
    rare: 100,
    epic: 250,
    legendary: 500,
  };

  const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

  const rarityLabels: Record<Rarity, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária',
  };

  const areasQuery = liveQuery(() => db.areas.toArray());

  onMount(() => {
    const sub = areasQuery.subscribe((dbAreas) => {
      areas = dbAreas;
    });

    if (isEditMode && taskToEdit) {
      title = taskToEdit.title;
      rarity = taskToEdit.rarity;
      areaId = taskToEdit.areaId;
    }

    return () => sub.unsubscribe();
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const taskTitle = title.trim();
    if (!taskTitle) return;

    try {
      const taskData = {
        areaId: +areaId,
        title: taskTitle,
        rarity,
        xp: rarityOptions[rarity],
        completed: isEditMode && taskToEdit ? taskToEdit.completed : false,
        createdAt: isEditMode && taskToEdit ? taskToEdit.createdAt : new Date(),
      };

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
    <div>
      <label for="title" class="block text-sm font-medium text-slate-300 mb-1">
        Título da Missão
      </label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="Ex: Ler 20 páginas..."
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
          focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        required
      />
    </div>

    <div class="flex gap-4">
      <div class="flex-1">
        <label
          for="rarity"
          class="block text-sm font-medium text-slate-300 mb-1"
        >
          Raridade (XP)
        </label>
        <select
          id="rarity"
          bind:value={rarity}
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200
            focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        >
          {#each rarityOrder as key (key)}
            <option value={key}>
              {rarityLabels[key]} (+{rarityOptions[key]} XP)
            </option>
          {/each}
        </select>
      </div>

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
