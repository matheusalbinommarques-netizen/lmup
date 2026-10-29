<script lang="ts">
  import { goto } from '$app/navigation';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import { createQuickTask } from '$services/journeyService';
  let {
    open = $bindable(false),
    snapshot,
    oncreated,
  }: {
    open?: boolean;
    snapshot: JourneySnapshot;
    oncreated?: (id: number) => void;
  } = $props();
  let title = $state('');
  let steps = $state('');
  let description = $state('');
  let name = $state('');
  let project = $state('');
  let area = $state('0');
  let today = $state(true);
  let error = $state('');
  let busy = $state(false);
  let requestId = '';
  $effect(() => {
    if (open) {
      title = '';
      steps = '';
      description = '';
      error = '';
      project = '';
      area = '0';
      today = true;
      name = '';
      requestId = crypto.randomUUID();
    }
  });
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    error = '';
    try {
      const id = await createQuickTask({
        title,
        requestId,
        steps: steps.split('\n'),
        description,
        projectId: project ? Number(project) : null,
        areaId: Number(area),
        planToday: today,
        heroName: name,
      });
      open = false;
      oncreated?.(id);
      await goto(`/missao/${id}`);
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
  dismissible={!busy}
  bind:open
  title="Uma nova missão"
  description="Comece pelo que você quer fazer. Os detalhes podem vir depois."
>
  <form onsubmit={submit} novalidate>
    <Field
      label="O que você quer fazer?"
      bind:value={title}
      {error}
      data-initial-focus
      maxlength={160}
      placeholder="Ex.: praticar uma ideia por 10 minutos"
    />
    {#if snapshot.profile?.name === 'Herói sem nome'}<Field
        label="Como quer ser chamado? (opcional)"
        bind:value={name}
        maxlength={80}
      />{/if}
    <label class="journey-check"
      ><input type="checkbox" bind:checked={today} />Incluir no meu plano de
      hoje</label
    >
    <details>
      <summary>Passos e outros detalhes</summary>
      <div class="journey-form-details">
        <label class="journey-label"
          >Passos, um por linha<textarea
            bind:value={steps}
            rows="4"
            placeholder="Escolher uma referência&#10;Experimentar uma possibilidade"
          ></textarea></label
        ><label class="journey-label"
          >Descrição (opcional)<textarea
            bind:value={description}
            rows="3"
            maxlength="10000"
          ></textarea></label
        ><label class="journey-label"
          >Projeto<select bind:value={project}
            ><option value="">Sem projeto</option
            >{#each snapshot.projects.filter((item) => item.status !== 'arquivado') as item (item.id)}<option
                value={String(item.id)}>{item.name}</option
              >{/each}</select
          ></label
        ><label class="journey-label"
          >Área<select bind:value={area}
            ><option value="0">Geral</option
            >{#each snapshot.areas as item (item.id)}<option
                value={String(item.id)}>{item.nome}</option
              >{/each}</select
          ></label
        >
      </div>
    </details>
    <footer>
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          open = false;
        }}>Cancelar</Button
      ><Button type="submit" loading={busy}>Criar missão</Button>
    </footer>
  </form>
</Dialog>
