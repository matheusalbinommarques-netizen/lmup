<!-- src/routes/projetos/+page.svelte -->
<script lang="ts">
  import { db, type Task, type HeroProject } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';

  type DifficultyKey = 'facil' | 'media' | 'dificil' | 'expert';

  type ProjectWithStats = HeroProject & {
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    difficulty: DifficultyKey;
  };

  let projects = $state<HeroProject[]>([]);
  let tasks = $state<Task[]>([]);

  const projectsQuery = liveQuery(() =>
    db.projects.orderBy('createdAt').reverse().toArray(),
  );
  const tasksQuery = liveQuery(() => db.tasks.toArray());

  onMount(() => {
    // garante que exista algo visual pra olhar na tela
    ensureInitialProjectsSeeded();

    const projSub = projectsQuery.subscribe((rows) => {
      projects = rows ?? [];
    });

    const tasksSub = tasksQuery.subscribe((rows) => {
      tasks = rows ?? [];
    });

    return () => {
      projSub.unsubscribe();
      tasksSub.unsubscribe();
    };
  });

  async function ensureInitialProjectsSeeded() {
    try {
      const count = await db.projects.count();
      if (count > 0) return;

      const now = new Date();

      await db.projects.bulkAdd([
        {
          name: 'Reescrever o Level Me Up!',
          vision:
            'Transformar o app em um hub de evolução pessoal mais estável, bonito e divertido.',
          status: 'em_andamento',
          createdAt: now,
        },
        {
          name: 'Projeto Shape 2025',
          vision:
            'Treinar de segunda a sexta, manter alimentação decente e ficar “sheipado” saudável.',
          status: 'planejando',
          createdAt: now,
        },
        {
          name: 'Plano de Estudos Banco do Brasil',
          vision:
            'Fechar o edital com rotina sustentável e revisões constantes.',
          status: 'pausado',
          createdAt: now,
        },
      ]);
    } catch (error) {
      console.error('Erro ao seedar projetos iniciais', error);
    }
  }

  function getStatusLabel(status: HeroProject['status']): string {
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

  function getStatusClasses(status: HeroProject['status']): string {
    switch (status) {
      case 'planejando':
        return 'border-sky-500/70 bg-sky-900/40 text-sky-200';
      case 'em_andamento':
        return 'border-emerald-500/80 bg-emerald-900/40 text-emerald-200';
      case 'concluido':
        return 'border-amber-400/80 bg-amber-900/30 text-amber-200';
      case 'pausado':
        return 'border-slate-500/70 bg-slate-900/60 text-slate-200';
      case 'arquivado':
        return 'border-slate-700/80 bg-slate-950/80 text-slate-400';
      default:
        return 'border-slate-600 bg-slate-900 text-slate-200';
    }
  }

  function getDifficultyKey(taskCount: number): DifficultyKey {
    if (taskCount <= 0) return 'facil';
    if (taskCount <= 2) return 'facil';
    if (taskCount <= 4) return 'media';
    if (taskCount <= 9) return 'dificil';
    return 'expert';
  }

  function getDifficultyLabel(key: DifficultyKey): string {
    switch (key) {
      case 'facil':
        return 'Fácil (1–2 missões)';
      case 'media':
        return 'Média (3–4 missões)';
      case 'dificil':
        return 'Difícil (5–9 missões)';
      case 'expert':
        return 'Expert (10+ missões)';
      default:
        return 'Desconhecida';
    }
  }

  function getDifficultyClasses(key: DifficultyKey): string {
    switch (key) {
      case 'facil':
        return 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/70';
      case 'media':
        return 'bg-sky-900/40 text-sky-200 border border-sky-500/70';
      case 'dificil':
        return 'bg-purple-900/40 text-purple-200 border border-purple-500/70';
      case 'expert':
        return 'bg-rose-900/40 text-rose-200 border border-rose-500/80';
      default:
        return 'bg-slate-900/60 text-slate-200 border border-slate-600';
    }
  }

  function formatDate(dateLike?: Date | string | null): string {
    if (!dateLike) return '';
    const date =
      dateLike instanceof Date ? dateLike : new Date(dateLike as string);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR');
  }

  const projectsWithStats = $derived(
    projects.map((project) => {
      const id = project.id;
      const projectTasks = id ? tasks.filter((t) => t.projectId === id) : [];

      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.completed).length;

      const completionPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const difficulty = getDifficultyKey(totalTasks);

      return {
        ...project,
        totalTasks,
        completedTasks,
        completionPercent,
        difficulty,
      } as ProjectWithStats;
    }),
  );

  const hasProjects = $derived(projectsWithStats.length > 0);
</script>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Projetos do Herói"
    subtitle="Enxergue suas grandes Sagas, quantas missões cada uma carrega e o quão desafiadoras elas são."
    iconSrc="/art/icones/icon-projetos.png"
    iconAlt="Projetos do herói"
  />

  {#if hasProjects}
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <header class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-[0.7rem] text-slate-400">
          {projectsWithStats.length}
          {projectsWithStats.length === 1 ? ' projeto' : ' projetos'} cadastrados
        </p>
        <p class="text-[0.7rem] text-slate-500">
          Dificuldade é baseada na quantidade de missões ligadas ao projeto.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-2">
        {#each projectsWithStats as project (project.id ?? project.name)}
          <article
            class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-[0_0_24px_rgba(15,23,42,0.9)]"
          >
            <header class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <h2 class="text-sm font-semibold text-slate-100">
                  {project.name}
                </h2>
                {#if project.vision}
                  <p class="text-[0.7rem] text-slate-400">
                    {project.vision}
                  </p>
                {/if}

                {#if project.targetDate}
                  <p class="text-[0.65rem] text-slate-500">
                    Prazo alvo: {formatDate(project.targetDate)}
                  </p>
                {/if}
              </div>

              <div class="flex flex-col items-end gap-1">
                <span
                  class={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                    project.status,
                  )}`}
                >
                  {getStatusLabel(project.status)}
                </span>

                <span
                  class={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${getDifficultyClasses(
                    project.difficulty,
                  )}`}
                >
                  {getDifficultyLabel(project.difficulty)}
                </span>
              </div>
            </header>

            <div class="mt-1 flex flex-col gap-2 text-[0.7rem] text-slate-200">
              <div class="flex items-center justify-between">
                <span>Missões ligadas</span>
                <span>
                  {project.completedTasks} / {project.totalTasks}
                </span>
              </div>

              <div
                class="h-2 w-full overflow-hidden rounded-full bg-slate-800/70"
              >
                <div
                  class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"
                  style={`width: ${project.completionPercent}%;`}
                ></div>
              </div>

              <p class="text-[0.65rem] text-slate-400">
                {#if project.totalTasks === 0}
                  Nenhuma missão linkada ainda — em breve você poderá associar
                  missões diretamente ao projeto.
                {:else}
                  Você concluiu {project.completionPercent}% das missões deste
                  projeto.
                {/if}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {:else}
    <section
      class="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/85 p-6 text-center shadow-[0_0_24px_rgba(15,23,42,0.9)]"
    >
      <p class="text-sm font-medium text-slate-100">
        Você ainda não tem projetos cadastrados.
      </p>
      <p class="text-[0.75rem] text-slate-400">
        Nesta fase, os projetos são lidos do banco. Em breve vamos conectar a
        criação/edição de missões para linkar tudo automaticamente.
      </p>
    </section>
  {/if}
</div>
