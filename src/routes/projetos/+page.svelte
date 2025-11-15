<!-- src/routes/projetos/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type HeroProject, type Task, type Profile } from '$services/db';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import {
    getProjectBaseXp,
    getProjectDifficultyInfoForTasks,
    deleteHeroProject,
  } from '$services/projectService';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';

  let projects = $state<HeroProject[]>([]);
  let tasks = $state<Task[]>([]);
  let hero = $state<Profile | null>(null);
  let isLoading = $state(true);

  // --- estado do modal de criação ---
  let showCreateModal = $state(false);
  let newProjectName = $state('');
  let newProjectVision = $state('');
  let newProjectTargetDate = $state(''); // yyyy-mm-dd
  let isCreating = $state(false);

  // --- exclusão ---
  let isDeletingId = $state<number | null>(null);

  const projectsQuery = liveQuery(() => db.projects.toArray());
  const tasksQuery = liveQuery(() => db.tasks.toArray());
  const heroQuery = liveQuery(() => db.profile.get(1));

  onMount(() => {
    const projSub = projectsQuery.subscribe((rows) => {
      projects = rows ?? [];
      isLoading = false;
    });

    const taskSub = tasksQuery.subscribe((rows) => {
      tasks = rows ?? [];
    });

    const heroSub = heroQuery.subscribe((profileData) => {
      hero = profileData ?? null;
    });

    return () => {
      projSub.unsubscribe();
      taskSub.unsubscribe();
      heroSub.unsubscribe();
    };
  });

  // -------- Modal de criação --------
  function openCreateModal() {
    newProjectName = '';
    newProjectVision = '';
    newProjectTargetDate = '';
    showCreateModal = true;
  }

  function closeCreateModal() {
    if (isCreating) return;
    showCreateModal = false;
  }

  async function confirmCreateProject(event: SubmitEvent) {
    event.preventDefault();

    const name = newProjectName.trim();
    if (!name) return;

    try {
      isCreating = true;

      await db.projects.add({
        name,
        vision: newProjectVision.trim() || null,
        status: 'planejando',
        createdAt: new Date(),
        targetDate: newProjectTargetDate
          ? new Date(newProjectTargetDate)
          : null,
      } as HeroProject);

      newProjectName = '';
      newProjectVision = '';
      newProjectTargetDate = '';
      showCreateModal = false;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Não foi possível criar o projeto.');
    } finally {
      isCreating = false;
    }
  }

  // -------- Exclusão de projeto --------
  async function handleDeleteProject(id?: number) {
    if (!id) return;
    const ok = confirm(
      'Tem certeza de que deseja excluir este projeto? As missões continuarão existindo, mas sem vínculo com ele.',
    );
    if (!ok) return;

    try {
      isDeletingId = id;
      await deleteHeroProject(id);
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Não foi possível excluir o projeto.');
    } finally {
      isDeletingId = null;
    }
  }

  type ProjectStatus = HeroProject['status'];

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

  // --------- Dificuldade / bônus de projeto ---------

  type DifficultyKey = 'none' | 'facil' | 'media' | 'dificil' | 'expert';

  type DifficultyUiInfo = {
    label: string;
    range: string;
    classes: string;
  };

  const DIFFICULTY_UI: Record<DifficultyKey, DifficultyUiInfo> = {
    none: {
      label: 'Sem missões',
      range: '0 missões',
      classes: 'border-slate-600 text-slate-300 bg-slate-900/80',
    },
    facil: {
      label: 'Fácil',
      range: '1–2 missões',
      classes: 'border-emerald-400 text-emerald-200 bg-emerald-900/40',
    },
    media: {
      label: 'Média',
      range: '3–4 missões',
      classes: 'border-sky-400 text-sky-200 bg-sky-900/40',
    },
    dificil: {
      label: 'Difícil',
      range: '5–9 missões',
      classes: 'border-purple-400 text-purple-200 bg-purple-900/40',
    },
    expert: {
      label: 'Expert',
      range: '10+ missões',
      classes: 'border-[#ffb74d] text-[#ffb74d] bg-[rgba(255,183,77,0.12)]',
    },
  };

  type ProjectDifficultyInfoReturn = {
    totalTasks: number;
    difficultyKey: DifficultyKey;
    bonusXpFraction: number;
    bonusXpPercent: number;
  };

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

  // --- Bônus do Santuário global ---

  const sanctuaryMultiplier = $derived(
    (() => {
      if (!hero || hero.totalXpEarned == null) return 1;
      const stage = getEcoStageForTotalXp(hero.totalXpEarned ?? 0);
      return stage.xpBonusMultiplier ?? 1;
    })(),
  );

  const sanctuaryBonusPercent = $derived(
    Math.round((Number(sanctuaryMultiplier) - 1) * 100),
  );

  const projectsWithStats = $derived(
    (() => {
      return projects.map((project) => {
        if (!project.id) {
          return {
            project,
            totalTasks: 0,
            completedTasks: 0,
            completionPercent: 0,
            difficulty: DIFFICULTY_UI.none,
            baseXp: 0,
            bonusXpBase: 0,
            bonusXpPercent: 0,
            bonusXpWithSanctuary: 0,
            bonusGoldWithSanctuary: 0,
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

        const projectDiffInfo = getProjectDifficultyInfoForTasks(
          relatedTasks,
        ) as ProjectDifficultyInfoReturn;

        const difficultyKey = (projectDiffInfo.difficultyKey ??
          'none') as DifficultyKey;
        const difficulty = DIFFICULTY_UI[difficultyKey];

        const baseXp = Number(getProjectBaseXp(relatedTasks) ?? 0);

        const bonusXpBase = Math.floor(
          Number(baseXp) * Number(projectDiffInfo.bonusXpFraction ?? 0),
        );

        const bonusXpWithSanctuary = Math.round(
          Number(bonusXpBase) * Number(sanctuaryMultiplier),
        );

        const bonusGoldWithSanctuary = Math.floor(
          Math.abs(Number(bonusXpWithSanctuary)) * 0.5,
        );

        return {
          project,
          totalTasks,
          completedTasks,
          completionPercent,
          difficulty,
          baseXp,
          bonusXpBase,
          bonusXpPercent: projectDiffInfo.bonusXpPercent ?? 0,
          bonusXpWithSanctuary,
          bonusGoldWithSanctuary,
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
</script>

<svelte:head>
  <title>Projetos do Herói • Level Me Up</title>
</svelte:head>

<!-- fecha modal com ESC -->
<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && showCreateModal && !isCreating) {
      showCreateModal = false;
    }
  }}
/>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Projetos do Herói"
    subtitle="Enxergue suas grandes Sagas, quantas missões cada uma carrega e o quão desafiadoras elas são."
    iconSrc="/art/icones/icon-projetos.png"
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
          Dificuldade é baseada na quantidade de missões ligadas ao projeto e
          define o bônus de XP ao concluir a Saga.
        </p>
      </div>

      <div class="flex flex-col items-end gap-2">
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

        <button
          type="button"
          class="mt-1 inline-flex items-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          onclick={openCreateModal}
        >
          Novo projeto
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
          Crie sua primeira Saga clicando em &quot;Novo projeto&quot;.
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

              {#if item.baseXp > 0}
                <div class="mt-1 space-y-0.5 text-[0.65rem]">
                  <p>
                    XP base das missões:
                    <strong>{item.baseXp} XP</strong>
                  </p>

                  <p>
                    Bônus de projeto:
                    <strong>+{item.bonusXpPercent}%</strong>
                    →
                    <strong>+{item.bonusXpBase} XP</strong>
                    (antes do Santuário)
                  </p>

                  <p>
                    Bônus do Santuário atual:
                    <strong>
                      {sanctuaryBonusPercent > 0
                        ? `+${sanctuaryBonusPercent}%`
                        : '0%'}
                    </strong>
                  </p>

                  <p class="text-emerald-200">
                    Se você concluísse esta Saga agora, o bônus renderia
                    aproximadamente
                    <strong> {item.bonusXpWithSanctuary} XP</strong>
                    e
                    <strong> {item.bonusGoldWithSanctuary} Gold</strong>
                    já com o efeito do Santuário.
                  </p>
                </div>
              {:else}
                <p class="mt-1 text-[0.65rem] text-slate-500">
                  Ainda sem XP acumulado neste projeto — conclua missões
                  vinculadas para gerar bônus de conclusão.
                </p>
              {/if}
            </div>

            <footer
              class="mt-4 flex items-center justify-between gap-3 text-[0.7rem]"
            >
              <div class="flex items-center gap-2">
                <a
                  href={`/projetos/${project.id}`}
                  class="rounded-lg border border-slate-600 px-3 py-1.5 font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-200"
                >
                  Detalhes do projeto
                </a>

                {#if project.id}
                  <button
                    type="button"
                    class="rounded-lg border border-red-500/70 px-3 py-1.5 font-semibold text-red-200 hover:bg-red-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    onclick={() => handleDeleteProject(project.id)}
                    disabled={isDeletingId === project.id}
                  >
                    {isDeletingId === project.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                {/if}
              </div>

              {#if project.id}
                <a
                  href={`/missoes?projectId=${project.id}`}
                  class="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Ver missões deste projeto
                </a>
              {/if}
            </footer>
          </article>
        {/each}
      </div>
    {/if}
  </section>

  {#if showCreateModal}
    <div
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4"
      role="button"
      tabindex="0"
      onclick={(e) => {
        // fecha só se clicar no fundo escuro, não no card
        if (e.target === e.currentTarget) {
          closeCreateModal();
        }
      }}
      onkeydown={(e) => {
        // fecha com Esc, Enter ou Espaço quando o foco está no overlay
        if (e.target !== e.currentTarget) return;

        if (e.key === 'Escape') {
          closeCreateModal();
        }

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeCreateModal();
        }
      }}
    >
      <div
        class="w-full max-w-md rounded-2xl border border-emerald-500/70 bg-slate-950/95 px-5 py-4 shadow-[0_0_32px_rgba(16,185,129,0.55)]"
      >
        <h2 class="text-sm font-semibold text-slate-50">Criar novo projeto</h2>
        <p class="mt-1 text-[0.75rem] text-slate-400">
          Dê um nome para a sua nova Saga e, se quiser, já defina uma visão e
          uma data-meta para ela.
        </p>

        <form
          class="mt-3 space-y-3 text-[0.8rem]"
          onsubmit={confirmCreateProject}
        >
          <div class="space-y-1">
            <label
              for="project-name"
              class="block text-[0.7rem] font-semibold text-slate-200"
            >
              Nome do projeto
            </label>
            <input
              id="project-name"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              bind:value={newProjectName}
              placeholder="Ex.: Projeto Ombro do Freeza"
            />
          </div>

          <div class="space-y-1">
            <label
              for="project-vision"
              class="block text-[0.7rem] font-semibold text-slate-200"
            >
              Visão (opcional)
            </label>
            <textarea
              id="project-vision"
              class="min-h-[70px] w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              bind:value={newProjectVision}
              placeholder="Como você descreveria essa grande Saga?"
            ></textarea>
          </div>

          <div class="space-y-1">
            <label
              for="project-target-date"
              class="block text-[0.7rem] font-semibold text-slate-200"
            >
              Data-meta (opcional)
            </label>
            <input
              id="project-target-date"
              type="date"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              bind:value={newProjectTargetDate}
            />
          </div>

          <div class="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-600 px-3 py-1.5 text-[0.75rem] font-semibold text-slate-200 hover:bg-slate-800"
              onclick={closeCreateModal}
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-emerald-500 px-4 py-1.5 text-[0.75rem] font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
