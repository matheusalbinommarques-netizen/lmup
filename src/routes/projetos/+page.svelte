<!-- src/routes/projetos/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type HeroProject, type Task } from '$services/db';
  import PageTitleCard from '$lib/PageTitleCard.svelte';

  let projects = $state<HeroProject[]>([]);
  let tasks = $state<Task[]>([]);
  let isLoading = $state(true);

  const projectsQuery = liveQuery(() => db.projects.toArray());
  const tasksQuery = liveQuery(() => db.tasks.toArray());

  onMount(() => {
    const projSub = projectsQuery.subscribe((rows) => {
      projects = rows ?? [];
      isLoading = false;
    });

    const taskSub = tasksQuery.subscribe((rows) => {
      tasks = rows ?? [];
    });

    return () => {
      projSub.unsubscribe();
      taskSub.unsubscribe();
    };
  });

  type ProjectStatus = HeroProject['status'];

  // --------- helpers de status / dificuldade ---------

  const STATUS_ORDER: Record<ProjectStatus, number> = {
    em_andamento: 0,
    planejando: 1,
    pausado: 2,
    concluido: 3,
    arquivado: 4,
  };

  function getStatusLabel(status: ProjectStatus): string {
    switch (status) {
      case 'planejando':
        return 'Planejando';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluido':
        return 'Concluído';
      case 'pausado':
        return 'Pausado';
      case 'arquivado':
        return 'Arquivado';
      default:
        return status;
    }
  }

  function getStatusClasses(status: ProjectStatus): string {
    switch (status) {
      case 'planejando':
        return 'border-sky-400/70 text-sky-200 bg-sky-900/40';
      case 'em_andamento':
        return 'border-emerald-400/80 text-emerald-200 bg-emerald-900/40';
      case 'concluido':
        return 'border-amber-400/80 text-amber-200 bg-amber-900/35';
      case 'pausado':
        return 'border-slate-500/70 text-slate-200 bg-slate-900/60';
      case 'arquivado':
        return 'border-slate-700/80 text-slate-400 bg-slate-950/80';
      default:
        return 'border-slate-600 text-slate-200 bg-slate-900/70';
    }
  }

  type DifficultyKey = 'none' | 'facil' | 'media' | 'dificil' | 'expert';

  type DifficultyInfo = {
    key: DifficultyKey;
    label: string;
    range: string;
    classes: string;
  };

  function getDifficulty(totalTasks: number): DifficultyInfo {
    if (totalTasks <= 0) {
      return {
        key: 'none',
        label: 'Sem missões',
        range: '0 missões',
        classes: 'border-slate-600 text-slate-300 bg-slate-900/80',
      };
    }
    if (totalTasks <= 2) {
      return {
        key: 'facil',
        label: 'Fácil',
        range: '1–2 missões',
        classes: 'border-emerald-400 text-emerald-200 bg-emerald-900/40',
      };
    }
    if (totalTasks <= 4) {
      return {
        key: 'media',
        label: 'Média',
        range: '3–4 missões',
        classes: 'border-sky-400 text-sky-200 bg-sky-900/40',
      };
    }
    if (totalTasks <= 9) {
      return {
        key: 'dificil',
        label: 'Difícil',
        range: '5–9 missões',
        classes: 'border-purple-400 text-purple-200 bg-purple-900/40',
      };
    }
    return {
      key: 'expert',
      label: 'Expert',
      range: '10+ missões',
      classes: 'border-[#ffb74d] text-[#ffb74d] bg-[rgba(255,183,77,0.12)]',
    };
  }

  function isTaskCompleted(task: Task): boolean {
    const anyTask = task as any;
    if (anyTask.archived) return true;
    if (task.completed) return true;
    if (anyTask.status === 'completed') return true;
    return false;
  }

  type ProjectFilterTab = 'ativos' | 'concluidos' | 'todos';
  let statusFilter = $state<ProjectFilterTab>('ativos');

  const activeStatuses: ProjectStatus[] = [
    'planejando',
    'em_andamento',
    'pausado',
  ];

  type ProjectWithStats = {
    project: HeroProject;
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    difficulty: DifficultyInfo;
  };

  const projectsWithStats: ProjectWithStats[] = $derived(
    (() => {
      return projects.map((project) => {
        if (!project.id) {
          return {
            project,
            totalTasks: 0,
            completedTasks: 0,
            completionPercent: 0,
            difficulty: getDifficulty(0),
          };
        }

        const relatedTasks = tasks.filter(
          (t) => (t as any).projectId === project.id && !(t as any).archived,
        );

        const totalTasks = relatedTasks.length;
        const completedTasks = relatedTasks.filter((t) =>
          isTaskCompleted(t),
        ).length;
        const completionPercent =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const difficulty = getDifficulty(totalTasks);

        return {
          project,
          totalTasks,
          completedTasks,
          completionPercent,
          difficulty,
        };
      });
    })(),
  );

  const visibleProjects = $derived(
    (() => {
      const filtered = projectsWithStats.filter(({ project }) => {
        if (statusFilter === 'todos') return true;
        if (statusFilter === 'ativos') {
          return activeStatuses.includes(project.status);
        }
        // concluídos
        return project.status === 'concluido';
      });

      const copy = [...filtered];
      copy.sort((a, b) => {
        const orderA = STATUS_ORDER[a.project.status] ?? 99;
        const orderB = STATUS_ORDER[b.project.status] ?? 99;
        if (orderA !== orderB) return orderA - orderB;

        const aCreated = a.project.createdAt
          ? new Date(a.project.createdAt as any).getTime()
          : 0;
        const bCreated = b.project.createdAt
          ? new Date(b.project.createdAt as any).getTime()
          : 0;
        return aCreated - bCreated;
      });

      return copy;
    })(),
  );

  function formatDate(dateLike?: Date | string | null): string {
    if (!dateLike) return '';
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike as any);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  }

  // ------------- CRIAÇÃO DE PROJETO -------------

  let isCreateModalOpen = $state(false);
  let draftName = $state('');
  let draftVision = $state('');
  let draftStatus = $state<ProjectStatus>('planejando');
  let draftTargetDate = $state('');
  let createError = $state<string | null>(null);

  function openCreateModal() {
    draftName = '';
    draftVision = '';
    draftStatus = 'planejando';
    draftTargetDate = '';
    createError = null;
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
  }

  async function handleCreateProject(event: SubmitEvent) {
    event.preventDefault();
    createError = null;

    const name = draftName.trim();
    if (!name) {
      createError = 'Dê um nome para a Saga.';
      return;
    }

    const now = new Date();
    const targetDate = draftTargetDate ? new Date(draftTargetDate) : null;

    try {
      await db.projects.add({
        name,
        vision: draftVision.trim() || undefined,
        status: draftStatus,
        createdAt: now,
        targetDate,
      } as HeroProject);

      isCreateModalOpen = false;
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      createError = 'Não foi possível criar o projeto. Tente novamente.';
    }
  }

  // ------------- EXCLUSÃO DE PROJETO -------------

  let projectIdPendingDelete = $state<number | null>(null);

  function askDeleteProject(id: number | undefined) {
    if (!id) return;
    projectIdPendingDelete = id;
  }

  function cancelDeleteProject() {
    projectIdPendingDelete = null;
  }

  async function confirmDeleteProject() {
    if (!projectIdPendingDelete) return;
    const id = projectIdPendingDelete;
    projectIdPendingDelete = null;
    isLoading = true;

    try {
      await db.transaction('rw', db.projects, db.tasks, async () => {
        await db.tasks
          .where('projectId')
          .equals(id)
          .modify({ projectId: null } as any);

        await db.projects.delete(id);
      });
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Projetos do Herói • Level Me Up</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Projetos do Herói"
    subtitle="Enxergue suas grandes Sagas, quantas missões cada uma carrega e o quão desafiadoras elas são."
    align="center"
  />

  <section
    class="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-amber-500/70 bg-slate-950/80 px-5 py-4 shadow-[0_0_32px_rgba(245,158,11,0.45)]"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[0.7rem] uppercase tracking-[0.22em] text-amber-300/80">
          Visão geral das Sagas
        </p>
        <p class="mt-1 text-xs text-slate-300">
          Dificuldade é baseada na quantidade de missões ligadas ao projeto.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Filtros de status -->
        <div
          class="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 p-1 text-[0.7rem]"
        >
          <button
            type="button"
            class={`rounded-full px-3 py-1 font-semibold transition-colors ${
              statusFilter === 'ativos'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onclick={() => (statusFilter = 'ativos')}
          >
            Ativos
          </button>
          <button
            type="button"
            class={`rounded-full px-3 py-1 font-semibold transition-colors ${
              statusFilter === 'concluidos'
                ? 'bg-[#ffb74d] text-slate-950'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onclick={() => (statusFilter = 'concluidos')}
          >
            Concluídos
          </button>
          <button
            type="button"
            class={`rounded-full px-3 py-1 font-semibold transition-colors ${
              statusFilter === 'todos'
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            onclick={() => (statusFilter = 'todos')}
          >
            Todos
          </button>
        </div>

        <!-- Botão Novo Projeto -->
        <button
          type="button"
          class="rounded-lg bg-[#ffb74d] px-4 py-2 text-xs font-bold text-slate-950 hover:bg-[#ffa726] transition-colors"
          onclick={openCreateModal}
        >
          + Novo Projeto
        </button>
      </div>
    </header>

    {#if isLoading}
      <div
        class="mt-4 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-sm text-slate-300"
      >
        Carregando projetos...
      </div>
    {:else if visibleProjects.length === 0}
      <div
        class="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-center text-sm text-slate-300"
      >
        <p>Nenhum projeto encontrado para este filtro.</p>
        <p class="text-xs text-slate-500">
          Comece criando sua primeira Saga no botão &quot;Novo Projeto&quot;.
        </p>
      </div>
    {:else}
      <p class="mt-3 text-[0.7rem] text-slate-400">
        {visibleProjects.length}
        {visibleProjects.length === 1
          ? ' projeto listado'
          : ' projetos listados'}
      </p>

      <div class="mt-2 grid gap-4 md:grid-cols-2">
        {#each visibleProjects as item (item.project.id)}
          {@const project = item.project}
          <article
            class="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/95 px-4 py-4 shadow-[0_0_20px_rgba(15,23,42,0.7)]"
          >
            <header class="flex flex-col gap-2">
              <div class="flex items-start justify-between gap-3">
                <h2 class="text-sm font-semibold text-slate-50">
                  {project.name}
                </h2>
                <div class="flex flex-col items-end gap-1 text-[0.7rem]">
                  <span
                    class={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${getStatusClasses(
                      project.status,
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <span
                    class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] ${item.difficulty.classes}`}
                  >
                    {item.difficulty.label}
                    <span class="ml-1 opacity-80">
                      ({item.difficulty.range})
                    </span>
                  </span>
                </div>
              </div>

              {#if project.vision}
                <p class="text-xs text-slate-300">
                  {project.vision}
                </p>
              {/if}

              <div
                class="mt-1 flex flex-wrap gap-2 text-[0.65rem] text-slate-400"
              >
                {#if project.createdAt}
                  <span class="rounded-full bg-slate-900/80 px-2 py-0.5">
                    Criado em {formatDate(project.createdAt)}
                  </span>
                {/if}
                {#if project.targetDate}
                  <span class="rounded-full bg-slate-900/80 px-2 py-0.5">
                    Meta: {formatDate(project.targetDate)}
                  </span>
                {/if}
              </div>
            </header>

            <div class="mt-3 space-y-2 text-[0.7rem] text-slate-300">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-slate-200">Missões ligadas</p>
                <p>
                  {item.completedTasks} / {item.totalTasks}
                </p>
              </div>

              <div
                class="h-2 w-full overflow-hidden rounded-full bg-slate-900/90"
              >
                <div
                  class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"
                  style={`width: ${item.completionPercent}%;`}
                ></div>
              </div>

              <p class="text-[0.65rem] text-slate-400">
                {#if item.totalTasks === 0}
                  Nenhuma missão ligada ainda — em breve você poderá associar
                  missões diretamente ao projeto.
                {:else}
                  Você concluiu {item.completionPercent}% das missões deste
                  projeto.
                {/if}
              </p>
            </div>

            <footer
              class="mt-4 flex items-center justify-between gap-3 text-[0.7rem]"
            >
              <div class="flex gap-2">
                <a
                  href={`/projetos/${project.id}`}
                  class="rounded-lg border border-slate-600 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
                >
                  Detalhes do projeto
                </a>

                {#if project.id}
                  <a
                    href={`/missoes?projectId=${project.id}`}
                    class="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    Ver missões deste projeto
                  </a>
                {/if}
              </div>

              {#if project.id}
                <button
                  type="button"
                  class="rounded-lg border border-red-500/70 px-3 py-1.5 font-semibold text-red-300 hover:bg-red-900/40"
                  onclick={() => askDeleteProject(project.id)}
                >
                  Excluir
                </button>
              {/if}
            </footer>
          </article>
        {/each}
      </div>
    {/if}
  </section>

  <!-- MODAL DE NOVO PROJETO -->
  {#if isCreateModalOpen}
    <div
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-amber-500/70 bg-slate-950 px-5 py-5 shadow-[0_0_30px_rgba(245,158,11,0.7)]"
      >
        <header class="mb-3">
          <p
            class="text-[0.65rem] uppercase tracking-[0.22em] text-amber-300/80"
          >
            Nova Saga
          </p>
          <h2 class="mt-1 text-base font-semibold text-slate-50">
            Criar projeto do herói
          </h2>
          <p class="mt-1 text-xs text-slate-400">
            Dê um nome e uma visão curta para este projeto. Você poderá ligar
            missões a ele pelo quadro de missões.
          </p>
        </header>

        <form class="space-y-3" onsubmit={handleCreateProject}>
          <div class="space-y-1">
            <label
              for="project-name"
              class="text-xs font-semibold text-slate-200"
            >
              Nome do projeto
            </label>
            <input
              id="project-name"
              type="text"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
              bind:value={draftName}
              autocomplete="off"
            />
          </div>

          <div class="space-y-1">
            <label
              for="project-vision"
              class="text-xs font-semibold text-slate-200"
            >
              Visão (opcional)
            </label>
            <textarea
              id="project-vision"
              rows="3"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
              bind:value={draftVision}
            ></textarea>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="space-y-1">
              <label
                for="project-status"
                class="text-xs font-semibold text-slate-200"
              >
                Status inicial
              </label>
              <select
                id="project-status"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
                bind:value={draftStatus}
              >
                <option value="planejando">Planejando</option>
                <option value="em_andamento">Em andamento</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>

            <div class="space-y-1">
              <label
                for="project-target"
                class="text-xs font-semibold text-slate-200"
              >
                Data-meta (opcional)
              </label>
              <input
                id="project-target"
                type="date"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
                bind:value={draftTargetDate}
              />
            </div>
          </div>

          {#if createError}
            <p class="text-[0.7rem] text-red-400">
              {createError}
            </p>
          {/if}

          <div class="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
              onclick={closeCreateModal}
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-[#ffb74d] px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-[#ffa726]"
            >
              Criar projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- MINI CONFIRMAÇÃO DE EXCLUSÃO -->
  {#if projectIdPendingDelete}
    <div
      class="fixed inset-x-0 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-red-500/70 bg-slate-950 px-4 py-3 text-xs text-slate-100 shadow-[0_0_24px_rgba(239,68,68,0.7)]"
    >
      <p class="text-[0.75rem]">
        Tem certeza que deseja excluir este projeto? As missões ligadas
        continuarão existindo, apenas ficarão sem projeto.
      </p>
      <div class="flex shrink-0 gap-2">
        <button
          type="button"
          class="rounded-lg bg-slate-800 px-3 py-1 text-[0.7rem] hover:bg-slate-700"
          onclick={cancelDeleteProject}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="rounded-lg bg-red-500 px-3 py-1 text-[0.7rem] font-semibold text-slate-950 hover:bg-red-400"
          onclick={confirmDeleteProject}
        >
          Excluir
        </button>
      </div>
    </div>
  {/if}
</div>
