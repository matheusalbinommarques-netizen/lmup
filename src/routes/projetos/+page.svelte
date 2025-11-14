<script lang="ts">
  import { onMount } from 'svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import {
    createProject,
    subscribeToProjects,
    computeProjectDerived,
    inferDifficultyFromTasks,
    type ProjectWithComputed,
    type ProjectStatus,
    type ProjectDifficulty,
  } from '$services/projectService';

  type ProjectFormState = {
    title: string;
    description: string;
    totalTasks: string;
    baseXp: string;
    targetDate: string;
  };

  const form = $state<ProjectFormState>({
    title: '',
    description: '',
    totalTasks: '3',
    baseXp: '300',
    targetDate: '',
  });

  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);
  let loadError = $state<string | null>(null);

  let projects = $state<ProjectWithComputed[]>([]);
  let isLoadingProjects = $state(true);

  const hasProjects = $derived(projects.length > 0);

  const currentDifficulty = $derived(
    inferDifficultyFromTasks(parseInt(form.totalTasks || '0', 10)),
  );

  function difficultyLabel(d: ProjectDifficulty): string {
    switch (d) {
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

  function difficultyClass(d: ProjectDifficulty): string {
    switch (d) {
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

  function formatDateFromIso(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  }

  function toIsoFromInput(input: string): string | undefined {
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    const [dd, mm, yyyy] = trimmed.split('/');
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);

    if (!day || !month || !year) return undefined;

    const d = new Date(year, month - 1, day);
    if (Number.isNaN(d.getTime())) return undefined;

    return d.toISOString();
  }

  async function handleCreateProject(event: SubmitEvent) {
    event.preventDefault();
    formError = null;

    const title = form.title.trim();
    const description = form.description.trim();
    const totalTasksNumber = parseInt(form.totalTasks || '0', 10);
    const baseXpNumber = parseInt(form.baseXp || '0', 10);

    if (!title) {
      formError = 'Dê um nome ao seu projeto.';
      return;
    }

    if (!description) {
      formError = 'Descreva rapidamente o objetivo do projeto.';
      return;
    }

    if (!Number.isFinite(totalTasksNumber) || totalTasksNumber <= 0) {
      formError = 'Informe um número de tarefas maior que zero.';
      return;
    }

    if (!Number.isFinite(baseXpNumber) || baseXpNumber <= 0) {
      formError = 'Informe um XP base total maior que zero.';
      return;
    }

    const targetIso = toIsoFromInput(form.targetDate);

    isSubmitting = true;

    try {
      await createProject({
        title,
        description,
        totalTasks: totalTasksNumber,
        baseXp: baseXpNumber,
        targetDate: targetIso,
      });

      form.title = '';
      form.description = '';
      form.totalTasks = '3';
      form.baseXp = '300';
      form.targetDate = '';
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      formError =
        'Não foi possível criar o projeto agora. Tente novamente em alguns instantes.';
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    const unsubscribe = subscribeToProjects(
      (projectsFromDb) => {
        projects = (projectsFromDb ?? []).map(computeProjectDerived);
        isLoadingProjects = false;
        loadError = null;
      },
      (err) => {
        console.error('Erro ao carregar projetos:', err);
        isLoadingProjects = false;
        loadError =
          'Não foi possível carregar seus projetos agora. Tente novamente mais tarde.';
      },
    );

    return () => {
      unsubscribe();
    };
  });
</script>

<div class="min-h-full bg-slate-950/80">
  <div class="flex flex-col gap-6">
    <PageTitleCard
      title="Projetos do Herói"
      subtitle="Transforme objetivos grandes em missões organizadas. Cada projeto concluído rende +25% de XP extra."
      align="center"
    />

    {#if loadError}
      <div
        class="rounded-2xl border border-red-500/60 bg-red-950/70 px-4 py-3 text-sm text-red-100"
      >
        {loadError}
      </div>
    {/if}

    <div
      class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] items-start"
    >
      <!-- FORMULÁRIO -->
      <section
        class="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_0_30px_rgba(15,23,42,0.8)] space-y-4"
      >
        <header class="space-y-1">
          <p
            class="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-slate-500"
          >
            Novo projeto do herói
          </p>
          <p class="text-[0.75rem] text-slate-400">
            Defina um objetivo grande e quebre em tarefas. A dificuldade é
            calculada automaticamente pelo número de tarefas.
          </p>
        </header>

        <form class="space-y-4" onsubmit={handleCreateProject}>
          <div class="space-y-1">
            <label
              for="project-title"
              class="text-xs font-medium text-slate-200"
            >
              Nome do projeto
            </label>
            <input
              id="project-title"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/70"
              placeholder="Ex: Certificação Banco do Brasil"
              bind:value={form.title}
            />
          </div>

          <div class="space-y-1">
            <label
              for="project-description"
              class="text-xs font-medium text-slate-200"
            >
              Descrição
            </label>
            <textarea
              id="project-description"
              rows="3"
              class="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/70"
              placeholder="Ex: Estudar conteúdos, fazer simulados e revisar pontos fracos."
              bind:value={form.description}
            ></textarea>/>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1">
              <label
                for="project-tasks"
                class="text-xs font-medium text-slate-200"
              >
                Número de tarefas
              </label>
              <input
                id="project-tasks"
                type="number"
                min="1"
                class="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/70"
                bind:value={form.totalTasks}
              />
              <p class="text-[0.65rem] text-slate-500">
                Até 3 tarefas: FÁCIL · 4: MÉDIA · 5–9: DIFÍCIL · 10+: EXPERT.
              </p>
            </div>

            <div class="space-y-1">
              <label
                for="project-xp"
                class="text-xs font-medium text-slate-200"
              >
                XP base total do projeto
              </label>
              <input
                id="project-xp"
                type="number"
                min="1"
                class="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/70"
                bind:value={form.baseXp}
              />
              <p class="text-[0.65rem] text-slate-500">
                É o somatório do XP de todas as tarefas, sem o bônus de 25%.
              </p>
            </div>
          </div>

          <div class="space-y-1">
            <label
              for="project-target"
              class="text-xs font-medium text-slate-200"
            >
              Data alvo (opcional)
            </label>
            <input
              id="project-target"
              type="text"
              inputmode="numeric"
              placeholder="dd/mm/aaaa"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/70"
              bind:value={form.targetDate}
            />
          </div>

          <div class="flex items-center justify-between text-[0.7rem]">
            <div class="flex items-center gap-2">
              <span
                class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${difficultyClass(
                  currentDifficulty,
                )}`}
              >
                {difficultyLabel(currentDifficulty)}
              </span>
              <span class="text-slate-500">
                A dificuldade é calculada pela quantidade de tarefas.
              </span>
            </div>
          </div>

          {#if formError}
            <div
              class="rounded-lg border border-red-500/70 bg-red-950/70 px-3 py-2 text-[0.75rem] text-red-100"
            >
              {formError}
            </div>
          {/if}

          <button
            type="submit"
            class="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              Criando projeto...
            {:else}
              Criar projeto
            {/if}
          </button>
        </form>
      </section>

      <!-- LISTA DE PROJETOS -->
      <section
        class="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-[0_0_30px_rgba(15,23,42,0.8)] flex flex-col gap-4"
      >
        <header class="flex items-center justify-between">
          <div>
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-slate-500"
            >
              Projetos em andamento
            </p>
            <p class="text-xs text-slate-400">
              Entregue todas as tarefas de um projeto para receber +25% de XP e
              Gold extra.
            </p>
          </div>
        </header>

        {#if isLoadingProjects}
          <div
            class="flex-1 flex items-center justify-center text-sm text-slate-400"
          >
            Carregando seus projetos...
          </div>
        {:else if !hasProjects}
          <div
            class="flex-1 flex items-center justify-center text-sm text-slate-500 text-center"
          >
            Nenhum projeto cadastrado ainda. Crie seu primeiro objetivo do herói
            ao lado.
          </div>
        {:else}
          <div class="grid gap-4 xl:grid-cols-2">
            {#each projects as project (project.id)}
              <article
                class="flex h-full flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_30px_rgba(15,23,42,0.8)]"
              >
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
                    <span
                      class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${statusClass(
                        project.status,
                      )}`}
                    >
                      {statusLabel(project.status)}
                    </span>
                    <span
                      class={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${difficultyClass(
                        project.difficulty,
                      )}`}
                    >
                      {difficultyLabel(project.difficulty)}
                    </span>
                  </div>
                </header>

                <div class="space-y-2">
                  <div
                    class="flex items-center justify-between text-[0.7rem] text-slate-400"
                  >
                    <span>
                      {project.completedTasks}/{project.totalTasks} tarefas concluídas
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

                <footer
                  class="mt-4 flex flex-col gap-2 border-t border-slate-800 pt-3 text-[0.7rem] text-slate-500"
                >
                  <div class="flex items-center justify-between">
                    <span>
                      Criado em
                      <span class="font-medium text-slate-300">
                        {formatDateFromIso(project.createdAt)}
                      </span>
                    </span>
                    <span>
                      Alvo:
                      <span class="font-medium text-slate-300">
                        {project.targetDate
                          ? formatDateFromIso(project.targetDate)
                          : '—'}
                      </span>
                    </span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-amber-300 font-semibold">
                      Recompensa: {project.finalXp} XP • {project.finalGold} Gold
                    </span>
                    <button
                      type="button"
                      class="rounded-full border border-slate-700 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-300 hover:border-primary hover:text-primary transition-colors"
                      onclick={() =>
                        console.log('ver detalhes do projeto', project.id)}
                    >
                      Detalhes
                    </button>
                  </div>
                </footer>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  </div>
</div>
