<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import {
    isAvailable,
    planTask,
    pinTask,
    taskSteps,
  } from '$services/journeyService';
  import { completeTask, undoTask } from '$services/taskService';
  import { dateKey } from '$services/rewardService';
  import { reviewDueDate } from '$services/reviewRules';
  import { formatCalendar } from '$services/calendar';
  import type { Task } from '$services/db';
  import QuickCreate from './QuickCreate.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let notice = $state('');
  let open = $state(false);
  let search = $state('');
  let filter = $state<'available' | 'today' | 'completed'>('available');
  let pending = $state<number[]>([]);
  let project = $state('');
  let today = $state(dateKey());
  guardUpdates(() => !data || pending.length > 0);
  onMount(() => {
    project = new URLSearchParams(location.search).get('projectId') ?? '';
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error =
          'Não foi possível carregar as missões. Recarregue para tentar novamente.';
      },
    });
    const refreshDay = () => {
      today = dateKey();
    };
    const clock = setInterval(refreshDay, 30000);
    window.addEventListener('focus', refreshDay);
    return () => {
      sub.unsubscribe();
      clearInterval(clock);
      window.removeEventListener('focus', refreshDay);
    };
  });
  function available(task: Task) {
    return isAvailable(task, new Date(`${today}T12:00:00`));
  }
  const visible = $derived(
    data?.tasks
      .filter(
        (task) =>
          !task.archived &&
          task.title
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')) &&
          (!project || task.projectId === Number(project)) &&
          (filter === 'today'
            ? task.plannedDate === today
            : filter === 'completed'
              ? !!task.completed && !available(task)
              : available(task)),
      )
      .sort(
        (a, b) =>
          Number(!!b.pinned) - Number(!!a.pinned) || (b.id ?? 0) - (a.id ?? 0),
      ) ?? [],
  );
  async function act(
    id: number,
    operation: () => Promise<unknown>,
    message: string,
  ) {
    if (pending.includes(id)) return;
    pending = [...pending, id];
    error = '';
    try {
      await operation();
      notice = message;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Tente novamente.';
    } finally {
      pending = pending.filter((value) => value !== id);
    }
  }
  async function complete(id: number) {
    await act(
      id,
      async () => {
        const result = await completeTask(id);
        if (result) await goto(`/missao/${id}`);
      },
      '',
    );
  }
</script>

<svelte:head><title>Missões · Level Me Up</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Organize para agir</p>
    <h1>Missões</h1>
    <p>Guarde ideias. Escolha um próximo passo.</p>
  </div>
  {#if data}<Button
      onclick={() => {
        open = true;
      }}><Icon name="plus" size={18} />Nova missão</Button
    >{/if}
</header>
{#if error}<p role="alert" class="journey-error">{error}</p>{/if}
<p role="status" class="journey-save-status">{notice}</p>
{#if !data}<p>Abrindo suas missões…</p>{:else}
  <Field
    label="Buscar missão"
    type="search"
    bind:value={search}
    placeholder="O que você quer encontrar?"
  />
  <div class="journey-filters" aria-label="Filtrar missões">
    <Button
      variant="secondary"
      aria-pressed={filter === 'available'}
      onclick={() => {
        filter = 'available';
      }}>Disponíveis</Button
    ><Button
      variant="secondary"
      aria-pressed={filter === 'today'}
      onclick={() => {
        filter = 'today';
      }}>Hoje</Button
    ><Button
      variant="secondary"
      aria-pressed={filter === 'completed'}
      onclick={() => {
        filter = 'completed';
      }}>Concluídas</Button
    >
  </div>
  {#if project}<p class="lmu-muted">
      Filtrando por projeto. <button
        class="journey-link"
        onclick={() => {
          project = '';
        }}>Mostrar todos</button
      >
    </p>{/if}
  <Card
    >{#if visible.length}<ul class="lmu-list">
        {#each visible as task (task.id)}<li class="journey-task">
            <a href={`/missao/${task.id}`}>{task.title}</a>
            <div class="journey-task-meta">
              {data.areas.find((area) => area.id === task.areaId)?.nome ??
                'Geral'}{#if task.projectId}
                · {data.projects.find((item) => item.id === task.projectId)
                  ?.name ?? 'Projeto'}{/if}{#if taskSteps(task).length}
                · {taskSteps(task).filter((step) =>
                  task.completedSubtasks?.includes(step.index),
                ).length}/{taskSteps(task).length} passos{/if}{#if data.rewards[task.id!]}
                · +{data.rewards[task.id!].xp} XP{/if}{#if task.pinned}
                · Fixada{/if}{#if task.reviewEnabled}
                · {available(task)
                  ? 'Revisão disponível'
                  : `Próxima revisão: ${formatCalendar(reviewDueDate(task))}`}{/if}
            </div>
            <div class="journey-actions">
              {#if available(task)}<Button
                  variant="secondary"
                  disabled={pending.includes(task.id!)}
                  onclick={() =>
                    act(
                      task.id!,
                      () => planTask(task.id!, task.plannedDate !== dateKey()),
                      'Plano atualizado.',
                    )}
                  >{task.plannedDate === dateKey()
                    ? 'Tirar de hoje'
                    : 'Planejar para hoje'}</Button
                ><Button
                  variant="quiet"
                  aria-pressed={!!task.pinned}
                  disabled={pending.includes(task.id!)}
                  onclick={() =>
                    act(
                      task.id!,
                      () => pinTask(task.id!, !task.pinned),
                      'Destaque atualizado.',
                    )}>{task.pinned ? 'Desafixar' : 'Fixar'}</Button
                >{#if !taskSteps(task).length}<Button
                    disabled={pending.includes(task.id!)}
                    onclick={() => complete(task.id!)}>Completar missão</Button
                  >{:else}<a class="journey-link" href={`/missao/${task.id}`}
                    >Abrir missão<Icon name="arrow" size={18} /></a
                  >{/if}{:else if task.completed && task.completionEventId}<Button
                  variant="quiet"
                  disabled={pending.includes(task.id!)}
                  onclick={() =>
                    act(
                      task.id!,
                      () => undoTask(task.id!),
                      'Conclusão desfeita e recompensa estornada.',
                    )}
                  >{data.events.find(
                    (event) => event.id === task.completionEventId,
                  )?.kind === 'review'
                    ? 'Desfazer última sessão'
                    : 'Voltar para disponível'}</Button
                >{/if}
            </div>
          </li>{/each}
      </ul>{:else}<div class="journey-empty">
        <Icon name="missions" size={36} />
        <h2>Nenhuma missão nesta seleção.</h2>
        <p class="lmu-muted">
          Experimente outra busca ou crie uma atividade pequena.
        </p>
        <Button
          variant="secondary"
          onclick={() => {
            open = true;
          }}>Criar missão</Button
        >
      </div>{/if}</Card
  >
  <a class="journey-link" href="/revisoes">Revisões e suas sessões</a>
  <a class="journey-link" href="/arquivo/missoes"
    >Áreas e organização avançada<Icon name="arrow" size={18} /></a
  ><QuickCreate bind:open snapshot={data} />
{/if}
