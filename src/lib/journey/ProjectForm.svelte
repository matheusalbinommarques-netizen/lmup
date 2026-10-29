<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import { untrack } from 'svelte';
  import type { HeroProject } from '$services/db';
  import { saveHeroProject } from '$services/projectService';
  import { calendarDate } from '$services/calendar';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Button from '$lib/ui/Button.svelte';
  let {
    open = $bindable(false),
    project,
    onSaved,
  }: {
    open?: boolean;
    project?: HeroProject;
    onSaved?: (id: number) => void;
  } = $props();
  let name = $state(''),
    vision = $state(''),
    target = $state(''),
    error = $state(''),
    busy = $state(false);
  let stages = $state<{ id: string; title: string }[]>([]);
  let revision = 0,
    requestId = '';
  guardUpdates(() => open || busy);
  $effect(() => {
    if (open)
      untrack(() => {
        name = project?.name ?? '';
        vision = project?.vision ?? '';
        try {
          target = calendarDate(project?.targetDate) ?? '';
        } catch {
          target = '';
        }
        stages = (project?.stages ?? []).map((stage) => ({ ...stage }));
        revision = project?.revision ?? 0;
        requestId = crypto.randomUUID();
        error = '';
      });
  });
  async function save(event: SubmitEvent) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    error = '';
    try {
      const id = await saveHeroProject(
        { name, vision, targetDate: target, stages, requestId },
        project?.id,
        revision,
      );
      open = false;
      onSaved?.(id);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Seu rascunho continua aqui.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog
  bind:open
  dismissible={!busy}
  title={project ? 'Editar projeto' : 'Novo projeto'}
  description="Uma direção clara e etapas que você pode ajustar pelo caminho."
  ><form onsubmit={save} novalidate>
    <Field
      label="Nome do projeto"
      bind:value={name}
      data-initial-focus
      maxlength={160}
    /><label class="journey-label"
      >Resultado que quero alcançar<textarea
        bind:value={vision}
        rows="3"
        maxlength="10000"
        placeholder="Como vou saber que este projeto deu certo?"
      ></textarea></label
    ><Field label="Data desejada (opcional)" type="date" bind:value={target} />
    <fieldset>
      <legend>Etapas (opcional)</legend>
      <div class="journey-stack">
        {#each stages as stage, index (stage.id)}<div
            class="project-stage-edit"
          >
            <Field
              label={`Etapa ${index + 1}`}
              bind:value={stage.title}
              maxlength={160}
            /><Button
              variant="quiet"
              aria-label={`Subir etapa ${index + 1}`}
              disabled={index === 0}
              onclick={() => {
                const copy = [...stages];
                [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                stages = copy;
              }}>↑</Button
            ><Button
              variant="quiet"
              aria-label={`Remover etapa ${index + 1}`}
              onclick={() => {
                stages = stages.filter((item) => item.id !== stage.id);
              }}>✕</Button
            >
          </div>{/each}
      </div>
      <Button
        variant="secondary"
        onclick={() => {
          stages = [...stages, { id: crypto.randomUUID(), title: '' }];
        }}>Adicionar etapa</Button
      >
    </fieldset>
    {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
    <footer>
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          open = false;
        }}>Cancelar</Button
      ><Button type="submit" loading={busy}
        >{project ? 'Salvar projeto' : 'Criar projeto'}</Button
      >
    </footer>
  </form></Dialog
>
