<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { formatCalendar } from '$services/calendar';
  import { changeProjectStatus } from '$services/projectService';
  import {
    getProjectBaseXp,
    getProjectDifficultyInfoForTasks,
    projectRewardTasks,
    projectProgress,
  } from '$services/projectRules';
  import { calculateReward } from '$services/rewardService';
  import { saveTaskDefinition } from '$services/taskDefinitionService';
  import type { HeroProjectStatus } from '$services/db';
  import ProjectForm from './ProjectForm.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let { id }: { id: number | null } = $props();
  let data = $state<JourneySnapshot>();
  let edit = $state(false),
    create = $state(false),
    associate = $state(false),
    error = $state(''),
    notice = $state(''),
    busy = $state(false),
    stageId = $state(''),
    taskId = $state('');
  guardUpdates(() => !data || busy);
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler este projeto.';
      },
    });
    return () => sub.unsubscribe();
  });
  const project = $derived(data?.projects.find((item) => item.id === id));
  const tasks = $derived(
    data?.tasks.filter((task) => task.projectId === id && !task.archived) ?? [],
  );
  const done = $derived(tasks.filter((task) => task.completed).length);
  const groups = $derived([
    ...(project?.stages ?? []),
    { id: '', title: 'Sem etapa' },
  ]);
  const progress = $derived(
    project
      ? projectProgress(project, tasks)
      : { value: 0, max: 1, label: 'Missões concluídas' },
  );
  const bonusEvent = $derived(
    data?.events.find(
      (event) => event.id === project?.rewardEventId && !event.reversedAt,
    ),
  );
  const next = $derived(
    groups
      .flatMap((group) =>
        tasks.filter((task) => (task.projectStageId ?? '') === group.id),
      )
      .find((task) => !task.completed),
  );
  const bonus = $derived.by(() => {
    if (!data?.profile || !tasks.length) return null;
    const budget = projectRewardTasks(tasks, data.events);
    const base = Math.floor(
      getProjectBaseXp(budget) *
        (getProjectDifficultyInfoForTasks(budget).bonusXpFraction +
          data.mods.projectBonusExtraFraction),
    );
    return base
      ? calculateReward(base, data.profile, data.mods, data.buffs, 'project')
      : null;
  });
  async function status(value: HeroProjectStatus) {
    if (!id || busy) return;
    busy = true;
    error = '';
    try {
      await changeProjectStatus(id, value);
      notice = 'Projeto atualizado.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível atualizar.';
    } finally {
      busy = false;
    }
  }
  async function link(event: SubmitEvent) {
    event.preventDefault();
    if (!taskId || !project || !data) return;
    busy = true;
    error = '';
    try {
      const task = data.tasks.find((item) => item.id === Number(taskId));
      if (!task) throw new Error('Escolha uma missão disponível.');
      await saveTaskDefinition({
        editId: task.id,
        expectedRevision: task.definitionRevision ?? 0,
        requestId: crypto.randomUUID(),
        title: task.title,
        steps: task.subtasks,
        description: task.description ?? '',
        effort: task.effort,
        areaId: task.areaId,
        projectId: project.id,
        projectStageId: stageId || null,
      });
      associate = false;
      notice = 'Missão associada ao projeto.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível associar.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head
  ><title>{project?.name ?? 'Projeto'} · Level Me Up</title></svelte:head
><a class="journey-link" href="/projetos"
  ><Icon name="back" size={18} />Voltar para projetos</a
>{#if error}<p role="alert" class="journey-error">{error}</p>{/if}
<p class="journey-save-status" role="status">{notice}</p>
{#if !data}<p>Abrindo projeto…</p>{:else if !project}<Card
    ><h1>Projeto não encontrado</h1>
    <p class="lmu-muted">Ele não está disponível neste navegador.</p></Card
  >{:else}<header class="journey-heading">
    <div>
      <p class="lmu-eyebrow">
        {project.status === 'concluido'
          ? 'Projeto concluído'
          : project.status === 'arquivado'
            ? 'Projeto arquivado'
            : project.status === 'pausado'
              ? 'Projeto pausado'
              : 'Uma direção em construção'}
      </p>
      <h1>{project.name}</h1>
      <p>{formatCalendar(project.targetDate)}</p>
    </div>
    <Button
      variant="secondary"
      onclick={() => {
        edit = true;
      }}>Editar projeto</Button
    >
  </header>
  <Card class="journey-stack"
    ><h2>O que quero alcançar</h2>
    <p style="white-space:pre-wrap">
      {project.vision ||
        'Acrescente um objetivo para reconhecer sua próxima conquista.'}
    </p>
    <p class="lmu-muted">
      {done} de {tasks.length} missões concluídas. Revisões repetidas não criam novas
      missões.
    </p>
    <progress
      value={progress.value}
      max={progress.max}
      aria-label={progress.label}
    ></progress>{#if next}<a
        class="lmu-button lmu-button--primary"
        href={`/missao/${next.id}`}
        >Continuar: {next.title}<Icon name="arrow" size={18} /></a
      >{/if}
    <p class="lmu-hint">
      Etapas vazias mantêm o projeto em aberto. Você pode associar missões ou
      remover etapas sem uso.
    </p>
    <div class="journey-actions">
      {#if project.status === 'arquivado'}<Button
          variant="secondary"
          disabled={busy}
          onclick={() => status('em_andamento')}>Restaurar projeto</Button
        >{:else if project.rewardGranted}<Button
          variant="secondary"
          disabled={busy}
          onclick={() => status('em_andamento')}
          >Reabrir e estornar bônus</Button
        >{:else}<Button
          variant="secondary"
          disabled={busy}
          onclick={() =>
            status(project.status === 'pausado' ? 'em_andamento' : 'pausado')}
          >{project.status === 'pausado'
            ? 'Retomar projeto'
            : 'Pausar projeto'}</Button
        >{#if tasks.length && done === tasks.length && progress.value === progress.max}<Button
            disabled={busy}
            onclick={() => status('concluido')}>Concluir projeto</Button
          >{/if}{/if}
    </div>
    {#if bonusEvent}<p class="journey-status">
        Recibo do projeto: +{bonusEvent.reward.xp} XP · +{bonusEvent.reward
          .gold} Gold · +{bonusEvent.reward.food} Comida.
      </p>{/if}
    {#if bonus}<p class="lmu-hint">
        {project.rewardGranted
          ? 'Bônus já registrado.'
          : 'Prévia do próximo bônus:'}
        {#if !project.rewardGranted}+{bonus.xp} XP · +{bonus.gold} Gold · +{bonus.food}
          Comida.{/if} Base de 10% do XP das missões, acrescida do equipamento de
        projeto. Dividir em mais tarefas não aumenta esse percentual.
      </p>{/if}{#if project.rewardGranted}<p class="lmu-hint">
        Reabrir estorna somente o bônus do projeto. Recompensas das missões e
        suas notas são preservadas. Se o bônus já foi gasto, a operação será
        recusada.
      </p>{/if}</Card
  >
  <div class="journey-section-heading">
    <h2>Etapas e missões</h2>
    {#if project.status !== 'arquivado'}<Button
        variant="secondary"
        onclick={() => {
          stageId = '';
          create = true;
        }}>Nova missão</Button
      >{/if}
  </div>
  {#each groups as group (group.id)}{@const rows = tasks.filter(
      (task) => (task.projectStageId ?? '') === group.id,
    )}{#if group.id || rows.length}<Card class="project-stage"
        ><div class="journey-section-heading">
          <h3>{group.title}</h3>
          <span class="lmu-hint"
            >{rows.filter((task) => task.completed).length}/{rows.length}</span
          >
        </div>
        <ul class="lmu-list">
          {#each rows as task (task.id)}<li class="journey-task">
              <a href={`/missao/${task.id}`}>{task.title}</a>
              <p class="journey-task-meta">
                {task.completed
                  ? 'Primeira conclusão registrada'
                  : 'Próximo passo disponível'}{#if task.reviewEnabled}
                  · revisão recorrente{/if}
              </p>
            </li>{/each}
        </ul>
        {#if project.status !== 'arquivado'}<Button
            variant="quiet"
            onclick={() => {
              stageId = group.id;
              create = true;
            }}>Adicionar missão nesta etapa</Button
          >{/if}</Card
      >{/if}{/each}{#if project.status !== 'arquivado'}<div
      class="journey-actions"
    >
      <Button
        variant="secondary"
        onclick={() => {
          taskId = '';
          stageId = '';
          associate = true;
        }}>Associar missão existente</Button
      ><a class="journey-link" href={`/missoes?projectId=${project.id}`}
        >Ver todas no quadro de missões</a
      >
    </div>{/if}<ProjectForm bind:open={edit} {project} /><QuickCreate
    bind:open={create}
    snapshot={data}
    defaultProjectId={project.id}
    defaultStageId={stageId || null}
  /><Dialog bind:open={associate} dismissible={!busy} title="Associar missão"
    ><form onsubmit={link}>
      <label class="journey-label"
        >Missão disponível<select bind:value={taskId} required
          ><option value="">Escolher missão</option
          >{#each data.tasks.filter((task) => !task.archived && !task.completed && task.projectId !== project.id) as task (task.id)}<option
              value={String(task.id)}>{task.title}</option
            >{/each}</select
        ></label
      ><label class="journey-label"
        >Etapa<select bind:value={stageId}
          ><option value="">Sem etapa</option
          >{#each project.stages ?? [] as group (group.id)}<option
              value={group.id}>{group.title}</option
            >{/each}</select
        ></label
      >
      <p class="lmu-hint">
        Se o projeto já foi concluído, associar uma missão reabre o trabalho e
        estorna seu bônus anterior.
      </p>
      {#if error}<p role="alert">{error}</p>{/if}
      <footer>
        <Button
          variant="quiet"
          onclick={() => {
            associate = false;
          }}>Cancelar</Button
        ><Button type="submit" loading={busy}>Associar missão</Button>
      </footer>
    </form></Dialog
  >{/if}
