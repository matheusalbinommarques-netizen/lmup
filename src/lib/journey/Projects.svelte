<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { projectProgress } from '$services/projectRules';
  import { formatCalendar } from '$services/calendar';
  import { changeProjectStatus } from '$services/projectService';
  import type { HeroProject } from '$services/db';
  import ProjectForm from './ProjectForm.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let data = $state<JourneySnapshot>();
  let open = $state(false),
    search = $state(''),
    archived = $state(false),
    error = $state(''),
    notice = $state(''),
    busy = $state(false),
    archiveOpen = $state(false);
  let selected = $state<HeroProject>();
  guardUpdates(() => !data || busy);
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler seus projetos.';
      },
    });
    return () => sub.unsubscribe();
  });
  const projects = $derived(
    data?.projects
      .filter(
        (project) =>
          (project.status === 'arquivado') === archived &&
          project.name
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR')),
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0)) ?? [],
  );
  async function archive() {
    if (!selected?.id || busy) return;
    busy = true;
    try {
      await changeProjectStatus(selected.id, 'arquivado');
      archiveOpen = false;
      notice =
        'Projeto arquivado. Missões, histórico e recompensas foram preservados.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível arquivar.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Projetos · Level Me Up</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Uma direção para seus passos</p>
    <h1>Projetos</h1>
    <p>Transforme uma intenção em algo que você consegue começar.</p>
  </div>
  <Button
    onclick={() => {
      selected = undefined;
      open = true;
    }}><Icon name="plus" size={18} />Novo projeto</Button
  >
</header>
<Field label="Buscar projeto" type="search" bind:value={search} />
<div class="journey-filters">
  <Button
    variant="secondary"
    aria-pressed={!archived}
    onclick={() => {
      archived = false;
    }}>Meus projetos</Button
  ><Button
    variant="secondary"
    aria-pressed={archived}
    onclick={() => {
      archived = true;
    }}>Arquivados</Button
  >
</div>
{#if error}<p role="alert" class="journey-error">{error}</p>{/if}
<p role="status" class="journey-save-status">{notice}</p>
{#if !data}<p>Abrindo seus projetos…</p>{:else}<div class="projects-grid">
    {#each projects as project (project.id)}{@const tasks = data.tasks.filter(
        (task) => task.projectId === project.id && !task.archived,
      )}{@const done = tasks.filter((task) => task.completed).length}
      {@const progress = projectProgress(project, tasks)}<Card
        class="project-list-card"
        ><p class="lmu-eyebrow">
          {{
            planejando: 'Planejando',
            em_andamento: 'Em andamento',
            pausado: 'Pausado',
            concluido: 'Concluído',
            arquivado: 'Arquivado',
          }[project.status]}
        </p>
        <h2>{project.name}</h2>
        <p class="lmu-muted">
          {project.vision || 'Um resultado para construir, passo a passo.'}
        </p>
        <p class="lmu-hint">
          {formatCalendar(project.targetDate)} · {done}/{tasks.length} missões ·
          {project.stages?.length ?? 0} etapas
        </p>
        <progress
          value={progress.value}
          max={progress.max}
          aria-label={`${progress.label}: ${project.name}`}
        ></progress><a
          class="journey-link"
          href={`/projetos/${project.id}`}
          aria-label="Detalhes do projeto"
          >Abrir projeto<Icon name="arrow" size={18} /></a
        >{#if project.status !== 'arquivado'}<div class="journey-actions">
            <Button
              variant="quiet"
              onclick={() => {
                selected = project;
                open = true;
              }}>Editar projeto</Button
            ><Button
              variant="quiet"
              onclick={() => {
                selected = project;
                archiveOpen = true;
              }}>Arquivar</Button
            >
          </div>{/if}</Card
      >{/each}
  </div>
  {#if !projects.length}<Card
      ><div class="journey-empty">
        <Icon name="projects" size={36} />
        <h2>
          {archived
            ? 'Nenhum projeto arquivado.'
            : 'O que você quer construir?'}
        </h2>
        <p class="lmu-muted">
          Comece com um resultado possível e acrescente etapas quando precisar.
        </p>
        {#if !archived}<Button
            variant="secondary"
            onclick={() => {
              selected = undefined;
              open = true;
            }}>Criar meu primeiro projeto</Button
          >{/if}
      </div></Card
    >{/if}{/if}<ProjectForm
  bind:open
  project={selected}
  onSaved={() => {
    notice = 'Projeto salvo neste navegador.';
  }}
/><Dialog
  bind:open={archiveOpen}
  dismissible={!busy}
  title="Arquivar projeto?"
  description="O projeto sai da lista principal. Suas missões, vínculos, histórico e recompensas continuam guardados; você pode restaurá-lo depois."
  ><div class="journey-actions">
    <Button
      variant="quiet"
      onclick={() => {
        archiveOpen = false;
      }}>Cancelar</Button
    ><Button variant="secondary" loading={busy} onclick={archive}
      >Arquivar projeto</Button
    >
  </div></Dialog
>
