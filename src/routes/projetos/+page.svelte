<!-- src/routes/projetos/+page.svelte -->
<script lang="ts">
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import { onMount } from 'svelte';
  import {
    projectService,
    type ProjectStatus,
    type ProjectDifficulty,
    type ProjectComputed,
  } from '$services/projectService';

  // -----------------------------
  // STATE
  // -----------------------------

  let projects = $state<ProjectComputed[]>([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state<string | null>(null);

  // Formulário de novo projeto
  let formTitle = $state('');
  let formDescription = $state('');
  let formTotalTasks = $state(3);
  let formBaseXp = $state(300);
  let formTargetDate = $state(''); // "YYYY-MM-DD"

  // -----------------------------
  // HELPERS VISUAIS
  // -----------------------------

  function difficultyLabel(difficulty: ProjectDifficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'FÁCIL';
      case 'medium':
        return 'MÉDIA';
      case 'hard':
        return 'DIFÍCIL';
      case 'expert':
        return 'EXPERT';
      default:
        return '';
    }
  }

  function difficultyClass(difficulty: ProjectDifficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-400/40';
      case 'medium':
        return 'bg-sky-500/10 text-sky-300 border-sky-400/40';
      case 'hard':
        return 'bg-amber-500/10 text-amber-300 border-amber-400/40';
      case 'expert':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/40';
      default:
        return 'bg-slate-700/40 text-slate-200 border-slate-500/40';
    }
  }

  function statusLabel(status: ProjectStatus): string {
    switch (status) {
      case 'planning':
        return 'PLANEJANDO';
      case 'in_progress':
        return 'EM ANDAMENTO';
      case 'done':
        return 'CONCLUÍDO';
      default:
        return '';
    }
  }

  function statusClass(status: ProjectStatus): string {
    switch (status) {
      case 'planning':
        return 'bg-slate-800/80 text-slate-200 border-slate-600/70';
      case 'in_progress':
        return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/60';
      case 'done':
        return 'bg-primary/15 text-primary border-primary/60';
      default:
        return 'bg-slate-800/80 text-slate-200 border-slate-600/70';
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  }

  function nextStatus(status: ProjectStatus): ProjectStatus {
    if (status === 'planning') return 'in_progress';
    if (status === 'in_progress') return 'done';
    return 'done';
  }

  // -----------------------------
  // CARREGAR PROJETOS
  // -----------------------------

  async function loadProjects() {
    isLoading = true;
    try {
      const raw = await projectService.getAllProjects();
      projects = raw.map((p) => projectService.computeProjectStats(p));
      errorMessage = null;
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      errorMessage = 'Não foi possível carregar seus projetos agora.';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadProjects();
  });

  // -----------------------------
  // FORMULÁRIO: CRIAR PROJETO
  // -----------------------------

  async function handleCreateProject(event: SubmitEvent) {
    event.preventDefault();

    const title = formTitle.trim();
    const description = formDescription.trim();
    const totalTasksNum = Math.max(1, Math.floor(Number(formTotalTasks) || 0));
    const baseXpNum = Math.max(0, Math.floor(Number(formBaseXp) || 0));

    if (!title) {
      alert('Dê um nome para o projeto.');
      return;
    }
    if (!description) {
      alert('Descreva rapidamente o objetivo desse projeto.');
      return;
    }

    try {
      isSaving = true;

      const newProject = await projectService.createProject({
        title,
        description,
        totalTasks: totalTasksNum,
        baseXp: baseXpNum,
        targetDate: formTargetDate || undefined,
      });

      const computed = projectService.computeProjectStats(newProject);
      projects = [computed, ...projects];

      // resetar form
      formTitle = '';
      formDescription = '';
      formTotalTasks = 3;
      formBaseXp = 300;
      formTargetDate = '';
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      alert('Não foi possível criar o projeto agora.');
    } finally {
      isSaving = false;
    }
  }

  // -----------------------------
  // AÇÕES EM PROJETOS
  // -----------------------------

  async function handleToggleStatus(project: ProjectComputed) {
    if (!project.id) return;

    const newStatus = nextStatus(project.status);

    try {
      await projectService.setProjectStatus(project.id, newStatus);

      projects = projects.map((p) =>
        p.id === project.id
          ? projectService.computeProjectStats({ ...p, status: newStatus })
          : p,
      );
    } catch (err) {
      console.error('Erro ao alterar status do projeto:', err);
      alert('Não foi possível atualizar o status agora.');
    }
  }

  async function handleDeleteProject(project: ProjectComputed) {
    if (!project.id) return;
    const ok = confirm(
      `Remover o projeto "${project.title}"? Isso não afeta seu XP, apenas a organização.`,
    );
    if (!ok) return;

    try {
      await projectService.deleteProject(project.id);
      projects = projects.filter((p) => p.id !== project.id);
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      alert('Não foi possível excluir o projeto agora.');
    }
  }
</script>

<div class="min-h-full bg-slate-950/80">
  <div class="flex flex-col gap-6">
    <PageTitleCard
      title="Projetos do Herói"
      subtitle="Transforme objetivos grandes em missões organizadas. Cada projeto concluído rende +25% de XP extra."
      align="center"
    />

    <!-- Layout: Form + Lista -->
    <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.6fr)]">
      <!-- FORMULÁRIO DE NOVO PROJETO -->
      <section
        class="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_0_30px_rgba(15,23,42,0.8)]"
      >
        <header class="mb-3 space-y-1">
          <h2 class="text-sm font-semibold text-slate-100">
            Novo projeto do herói
          </h2>
          <p class="text-[0.75rem] text-slate-400">
            Defina um objetivo grande e quebre em tarefas. A dificuldade é
            calculada automaticamente pelo número de tarefas.
          </p>
        </header>

        <form class="space-y-4" onsubmit={handleCreateProject}>
          <div class="space-y-1.5">
            <label
              for="project-title"
              class="text-[0.75rem] font-medium text-slate-200"
            >
              Nome do projeto
            </label>
            <input
              id="project-title"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
              type="text"
              placeholder="Ex: Certificação Banco do Brasil"
              bind:value={formTitle}
            />
          </div>

          <div class="space-y-1.5">
            <label
              for="project-description"
              class="text-[0.75rem] font-medium text-slate-200"
            >
              Descrição
            </label>
            <textarea
              id="project-description"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
              rows="3"
              placeholder="Ex: Estudar conteúdos, fazer simulados e revisar pontos fracos."
              bind:value={formDescription}
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label
                for="project-tasks"
                class="text-[0.75rem] font-medium text-slate-200"
              >
                Número de tarefas
              </label>
              <input
                id="project-tasks"
                class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                type="number"
                min="1"
                bind:value={formTotalTasks}
              />
              <p class="text-[0.65rem] text-slate-500">
                Até 3 tarefas: FÁCIL · 4: MÉDIA · 5–9: DIFÍCIL · 10+: EXPERT.
              </p>
            </div>

            <div class="space-y-1.5">
              <label
                for="project-basexp"
                class="text-[0.75rem] font-medium text-slate-200"
              >
                XP base total do projeto
              </label>
              <input
                id="project-basexp"
                class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
                type="number"
                min="0"
                bind:value={formBaseXp}
              />
              <p class="text-[0.65rem] text-slate-500">
                Este é o somatório do XP de todas as tarefas (sem o bônus de
                +25%).
              </p>
            </div>
          </div>

          <div class="space-y-1.5">
            <label
              for="project-target"
              class="text-[0.75rem] font-medium text-slate-200"
            >
              Data alvo (opcional)
            </label>
            <input
              id="project-target"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60"
              type="date"
              bind:value={formTargetDate}
            />
          </div>

          <button
            type="submit"
            class="mt-1 inline-flex items-center justify-center rounded-full border border-primary/70 bg-primary/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-md hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {#if isSaving}
              Salvando...
            {:else}
              Criar projeto
            {/if}
          </button>
        </form>
      </section>

      <!-- LISTA DE PROJETOS -->
      <section class="flex flex-col gap-3">
        {#if isLoading}
          <div
            class="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 text-sm text-slate-300"
          >
            Carregando seus projetos...
          </div>
        {:else if errorMessage}
          <div
            class="rounded-3xl border border-red-500/60 bg-red-950/40 p-5 text-sm text-red-100"
          >
            {errorMessage}
          </div>
        {:else if projects.length === 0}
          <div
            class="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 text-sm text-slate-300"
          >
            Nenhum projeto cadastrado ainda. Crie um projeto na coluna ao lado
            para começar a organizar suas missões grandes.
          </div>
        {:else}
          <section class="grid gap-5 xl:grid-cols-2">
            {#each projects as project (project.id)}
              <article
                class="flex h-full flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_30px_rgba(15,23,42,0.8)]"
              >
                <!-- HEADER -->
                <header class="mb-3 flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <p
                      class="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-slate-500"
                    >
                      Projeto do herói
                    </p>
                    <h2 class="text-base font-semibold text-slate-50">
                      {project.title}
                    </h2>
                    <p
                      class="max-w-xs text-[0.75rem] leading-snug text-slate-400"
                    >
                      {project.description}
                    </p>
                  </div>

                  <div class="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${statusClass(
                        project.status,
                      )}`}
                      onclick={() => handleToggleStatus(project)}
                      title="Clique para avançar o status"
                    >
                      {statusLabel(project.status)}
                    </button>
                    <span
                      class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${difficultyClass(
                        project.difficulty,
                      )}`}
                    >
                      {difficultyLabel(project.difficulty)}
                    </span>
                  </div>
                </header>

                <!-- PROGRESSO -->
                <div class="space-y-2">
                  <div
                    class="flex items-center justify-between text-[0.7rem] text-slate-400"
                  >
                    <span>
                      {project.completedTasks} / {project.totalTasks} tarefas concluídas
                    </span>
                    <span>{project.completionPercent}%</span>
                  </div>
                  <div
                    class="h-2 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"
                      style={`width: ${project.completionPercent}%;`}
                    ></div>
                  </div>
                </div>

                <!-- STATS -->
                <div
                  class="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-slate-900/60 p-4"
                >
                  <div
                    class="grid w-full grid-cols-3 gap-3 text-[0.7rem] text-slate-300"
                  >
                    <div class="space-y-0.5">
                      <p
                        class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500"
                      >
                        Tarefas
                      </p>
                      <p class="font-semibold">
                        {project.completedTasks}/{project.totalTasks}
                      </p>
                    </div>
                    <div class="space-y-0.5 text-center">
                      <p
                        class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500"
                      >
                        XP base
                      </p>
                      <p class="font-semibold text-emerald-300">
                        {project.baseXp} XP
                      </p>
                    </div>
                    <div class="space-y-0.5 text-right">
                      <p
                        class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500"
                      >
                        XP final
                      </p>
                      <p class="font-semibold text-amber-300">
                        {project.finalXp} XP
                      </p>
                    </div>
                  </div>

                  <p class="mt-1 text-[0.7rem] text-slate-400 text-center">
                    Projetos concedem
                    <span class="font-semibold text-emerald-300">
                      +25% XP
                    </span>
                    quando
                    <span class="font-semibold"> todas as tarefas </span>
                    forem concluídas. O Gold é calculado sobre o XP final.
                  </p>
                </div>

                <!-- RODAPÉ -->
                <footer
                  class="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-3 text-[0.7rem] text-slate-500"
                >
                  <div class="flex items-center justify-between">
                    <span>
                      Criado em&nbsp;
                      <span class="font-medium text-slate-300">
                        {formatDate(project.createdAt)}
                      </span>
                    </span>
                    <span>
                      Alvo:&nbsp;
                      <span class="font-medium text-slate-300">
                        {formatDate(project.targetDate)}
                      </span>
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-[0.7rem]">
                    <span class="text-amber-300 font-semibold">
                      Recompensa: {project.finalXp} XP • {project.finalGold}
                      Gold
                    </span>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="rounded-full border border-slate-700 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-300 hover:border-primary hover:text-primary transition-colors"
                        onclick={() =>
                          console.log('detalhes do projeto', project.id)}
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        class="rounded-full border border-red-600/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-red-200 hover:bg-red-600/20 transition-colors"
                        onclick={() => handleDeleteProject(project)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </footer>
              </article>
            {/each}
          </section>
        {/if}
      </section>
    </div>
  </div>
</div>
