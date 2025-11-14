<!-- src/routes/projetos/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type HeroProject, type Task, type Profile } from '$services/db';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import {
    getProjectBaseXp,
    getProjectDifficultyInfoForTasks,
  } from '$services/projectService';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';

  // receber data do +page.ts (sem genérico em $props)
  let { data }: { data: PageData } = $props();

  const initialProjectId = data.projectId ?? null;

  let projectId = $state<number | null>(initialProjectId);
  let project = $state<HeroProject | null>(null);
  let tasks = $state<Task[]>([]);
  let hero = $state<Profile | null>(null);
  let isLoading = $state(true);
  let isInvalid = $state(false);

  // --- Dificuldade (UI) ---
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

  // tipo de retorno esperado do helper de dificuldade
  type ProjectDifficultyInfoReturn = {
    totalTasks: number;
    difficultyKey: DifficultyKey;
    bonusXpFraction: number; // 0.10 / 0.15 / 0.20 / 0.25
    bonusXpPercent: number; // 10 / 15 / 20 / 25
  };

  function isTaskCompleted(task: Task): boolean {
    const anyTask = task as any;
    if (anyTask.archived) return true;
    if (task.completed) return true;
    if (anyTask.status === 'completed') return true;
    return false;
  }

  function formatDate(dateLike?: Date | string | null): string {
    if (!dateLike) return '';
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike as any);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  }

  onMount(() => {
    if (!projectId || !Number.isFinite(projectId)) {
      isInvalid = true;
      isLoading = false;
      return;
    }

    const proj$ = liveQuery(() => db.projects.get(projectId!));
    const tasks$ = liveQuery(() =>
      db.tasks.where('projectId').equals(projectId!).toArray(),
    );
    const hero$ = liveQuery(() => db.profile.get(1));

    const projSub = proj$.subscribe((row) => {
      project = row ?? null;
      if (!row) {
        isInvalid = true;
      }
      isLoading = false;
    });

    const tasksSub = tasks$.subscribe((rows) => {
      tasks = rows ?? [];
    });

    const heroSub = hero$.subscribe((profileData) => {
      hero = profileData ?? null;
    });

    return () => {
      projSub.unsubscribe();
      tasksSub.unsubscribe();
      heroSub.unsubscribe();
    };
  });

  // --- Derivados de missões / dificuldade ---

  // só consideramos missões não arquivadas para progresso, dificuldade e XP base
  const activeProjectTasks = $derived(
    tasks.filter((t) => !(t as any).archived),
  );

  const totalTasks = $derived(activeProjectTasks.length);
  const completedTasks = $derived(
    activeProjectTasks.filter((t) => isTaskCompleted(t)).length,
  );

  const completionPercent = $derived(
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  );

  // força o resultado como number
  const projectBaseXp = $derived(
    Number(getProjectBaseXp(activeProjectTasks) ?? 0),
  );

  const projectDifficultyInfo = $derived(
    getProjectDifficultyInfoForTasks(
      activeProjectTasks,
    ) as ProjectDifficultyInfoReturn,
  );

  const difficultyKey = $derived(
    (projectDifficultyInfo.difficultyKey ?? 'none') as DifficultyKey,
  );

  const difficultyUi = $derived(DIFFICULTY_UI[difficultyKey]);

  const projectBonusXpBase = $derived(
    Math.floor(
      Number(projectBaseXp) *
        Number(projectDifficultyInfo.bonusXpFraction ?? 0),
    ),
  );

  // --- Bônus do Santuário baseado no XP total atual do herói ---

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

  const projectBonusXpWithSanctuary = $derived(
    Math.round(Number(projectBonusXpBase) * Number(sanctuaryMultiplier)),
  );

  const projectBonusGoldWithSanctuary = $derived(
    Math.floor(Math.abs(Number(projectBonusXpWithSanctuary)) * 0.5),
  );

  // título da página sem bloco dentro do <title>
  const pageTitle = $derived(
    project
      ? `${project.name} • Projetos do Herói`
      : 'Projeto inválido • Projetos do Herói',
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title={project ? project.name : 'Projeto inválido'}
    subtitle={project
      ? 'Veja as missões ligadas a esta Saga e acompanhe seu progresso.'
      : 'Não foi possível localizar este projeto.'}
    align="center"
  />

  {#if isLoading}
    <section
      class="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-6 text-center text-sm text-slate-200"
    >
      Carregando projeto...
    </section>
  {:else if isInvalid || !project}
    <section
      class="mx-auto w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-8 text-center text-sm text-slate-200"
    >
      <p class="mb-3 text-base font-semibold">Projeto inválido.</p>
      <a
        href="/projetos"
        class="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
      >
        Voltar para Projetos
      </a>
    </section>
  {:else}
    <section
      class="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-3xl border border-amber-500/70 bg-slate-950/85 px-5 py-5 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
    >
      <!-- Cabeçalho básico do projeto -->
      <header class="flex flex-col gap-2">
        <h2 class="text-lg font-semibold text-slate-50">
          {project.name}
        </h2>

        {#if project.vision}
          <p class="text-sm text-slate-300">
            {project.vision}
          </p>
        {/if}

        <div class="mt-1 flex flex-wrap gap-2 text-[0.7rem] text-slate-400">
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

      <!-- Resumo de recompensa ao concluir o projeto -->
      <div
        class="mt-3 rounded-2xl border border-emerald-500/60 bg-slate-950/80 px-4 py-3 text-xs text-slate-100"
      >
        <p
          class="text-[0.7rem] uppercase tracking-[0.22em] text-emerald-300/80"
        >
          Recompensa ao concluir este projeto
        </p>

        {#if projectBaseXp > 0}
          <div class="mt-2 space-y-1.5">
            <p>
              XP base das missões deste projeto (ignorando arquivadas):
              <strong>{projectBaseXp} XP</strong>
            </p>

            <p>
              Bônus de dificuldade:
              <strong>{projectDifficultyInfo.bonusXpPercent}%</strong>
              →
              <strong>+{projectBonusXpBase} XP base</strong>
              (antes do Santuário)
            </p>

            <p>
              Bônus atual do Santuário:
              <strong>+{sanctuaryBonusPercent}%</strong>
              sobre qualquer XP que você ganhar.
            </p>

            <p class="mt-1 text-emerald-200">
              Se você concluísse este projeto agora, o
              <strong>bônus de projeto</strong> renderia aproximadamente:
              <br />
              <strong>{projectBonusXpWithSanctuary} XP</strong>
              e
              <strong>{projectBonusGoldWithSanctuary} Gold</strong>
              já com o efeito do Santuário aplicado.
            </p>

            <p class="text-[0.65rem] text-slate-400">
              (Os valores reais podem variar um pouco se você subir de estágio
              no Santuário antes de concluir o projeto.)
            </p>
          </div>
        {:else}
          <p class="mt-2 text-slate-400">
            Este projeto ainda não tem missões ligadas suficientes para gerar
            bônus de conclusão.
          </p>
        {/if}
      </div>

      <!-- Progresso geral + dificuldade -->
      <div class="mt-2 space-y-2 text-[0.8rem] text-slate-300">
        <div class="flex items-center justify-between">
          <p class="font-semibold text-slate-200">Progresso do projeto</p>
          <p>
            {completedTasks} / {totalTasks} missões
          </p>
        </div>

        <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/90">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"
            style={`width: ${completionPercent}%;`}
          ></div>
        </div>

        <p class="text-[0.7rem] text-slate-400">
          {#if totalTasks === 0}
            Nenhuma missão ligada ainda.
          {:else}
            Você concluiu {completionPercent}% das missões deste projeto.
          {/if}
        </p>

        <div class="mt-1 flex flex-wrap gap-2 text-[0.7rem]">
          <span
            class={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${difficultyUi.classes}`}
          >
            {difficultyUi.label}
            <span class="ml-1 opacity-80">({difficultyUi.range})</span>
          </span>

          {#if projectDifficultyInfo.bonusXpPercent > 0}
            <span
              class="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200"
            >
              Bônus de projeto: +{projectDifficultyInfo.bonusXpPercent}% XP
            </span>
          {/if}
        </div>
      </div>

      <!-- Lista de missões do projeto -->
      <div class="mt-4 space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-100">
            Missões deste projeto
          </h3>
          <a
            href={`/missoes?projectId=${project.id}`}
            class="rounded-lg bg-emerald-500 px-3 py-1.5 text-[0.75rem] font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Ver no quadro de missões
          </a>
        </div>

        {#if totalTasks === 0}
          <p class="text-[0.75rem] text-slate-400">
            Nenhuma missão vinculada ainda. Você pode criar missões e escolher
            este projeto no campo "Projeto" do formulário.
          </p>
        {:else}
          <ul class="space-y-1.5 text-[0.8rem]">
            {#each activeProjectTasks as task (task.id)}
              <li
                class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
              >
                <div class="min-w-0">
                  <p
                    class={`text-slate-100 ${
                      isTaskCompleted(task) ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <p class="text-[0.7rem] text-slate-400">
                    +{task.xp} XP
                  </p>
                </div>
                <span
                  class={`ml-3 rounded-full px-2 py-0.5 text-[0.65rem] ${
                    isTaskCompleted(task)
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isTaskCompleted(task) ? 'Concluída' : 'Pendente'}
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>
  {/if}
</div>
