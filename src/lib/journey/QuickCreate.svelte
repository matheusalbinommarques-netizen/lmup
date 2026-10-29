<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import type { MissionStarter } from '$lib/content/experience';
  import { goto } from '$app/navigation';
  import { untrack } from 'svelte';
  import type { Task } from '$services/db';
  import { EFFORTS, effortDefinition, type Effort } from '$services/effort';
  import { calculateReward } from '$services/rewardService';
  import { createQuickTask } from '$services/journeyService';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  let {
    open = $bindable(false),
    snapshot,
    oncreated,
    editTask,
    defaultProjectId,
    defaultStageId,
    starter,
  }: {
    starter?: MissionStarter;
    open?: boolean;
    snapshot: JourneySnapshot;
    oncreated?: (id: number) => void;
    editTask?: Task;
    defaultProjectId?: number;
    defaultStageId?: string | null;
  } = $props();
  let title = $state(''),
    steps = $state(''),
    description = $state(''),
    name = $state(''),
    project = $state(''),
    projectStage = $state(''),
    area = $state('0'),
    error = $state('');
  let today = $state(true),
    busy = $state(false);
  let effort = $state<Effort | 'legacy'>('small');
  let detailsOpen = $state(false);
  let requestId = '',
    definitionRevision = 0;
  guardUpdates(() => open || busy);
  $effect(() => {
    if (open)
      untrack(() => {
        detailsOpen = !!starter && !editTask;
        title = editTask?.title ?? starter?.title ?? '';
        steps = (editTask?.subtasks ?? starter?.steps ?? []).join('\n');
        description = editTask?.description ?? '';
        error = '';
        project = String(editTask?.projectId ?? defaultProjectId ?? '');
        projectStage = editTask?.projectStageId ?? defaultStageId ?? '';
        area = String(editTask?.areaId ?? 0);
        today = true;
        name = '';
        requestId = crypto.randomUUID();
        effort = editTask?.effort ?? (editTask ? 'legacy' : 'small');
        definitionRevision = editTask?.definitionRevision ?? 0;
      });
  });
  const stages = $derived(
    snapshot.projects.find((item) => item.id === Number(project))?.stages ?? [],
  );
  const preview = $derived.by(() => {
    if (!snapshot.profile) return null;
    try {
      return calculateReward(
        effort === 'legacy'
          ? (editTask?.xp ?? 50)
          : effortDefinition(effort).xp,
        snapshot.profile,
        snapshot.mods,
        snapshot.buffs,
      );
    } catch {
      return null;
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
        projectStageId: projectStage || null,
        areaId: Number(area),
        planToday: today,
        heroName: name,
        effort: effort === 'legacy' ? undefined : effort,
        editId: editTask?.id,
        expectedRevision: definitionRevision,
      });
      open = false;
      oncreated?.(id);
      if (!editTask) await goto(`/missao/${id}`);
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
  title={editTask ? 'Editar missão' : 'Uma nova missão'}
  description="Comece pelo que você quer fazer. Os detalhes podem vir depois."
  ><form onsubmit={submit} novalidate>
    <Field
      label="O que você quer fazer?"
      bind:value={title}
      {error}
      data-initial-focus
      maxlength={160}
      placeholder="Ex.: praticar uma ideia por 10 minutos"
    />{#if !editTask && snapshot.profile?.name === 'Herói sem nome'}<Field
        label="Como quer ser chamado? (opcional)"
        bind:value={name}
        maxlength={80}
      />{/if}{#if !editTask}<label class="journey-check"
        ><input type="checkbox" bind:checked={today} />Incluir no meu plano de
        hoje</label
      >{/if}<label class="journey-label"
      >Esforço desta missão<select bind:value={effort}
        >{#if editTask && !editTask.effort}<option value="legacy"
            >Manter recompensa anterior ({editTask.xp} XP base)</option
          >{/if}{#each EFFORTS as item (item.key)}<option value={item.key}
            >{item.label} · {item.xp} XP base</option
          >{/each}</select
      ></label
    >
    <p class="lmu-hint">
      Passos ajudam a executar; sua quantidade não aumenta a recompensa. Escolha
      o esforço que faz sentido para você.
    </p>
    {#if preview}<p class="lmu-hint">
        Prévia com seus bônus atuais: +{preview.xp} XP · +{preview.gold} Gold · +{preview.food}
        Comida.
      </p>{/if}{#if editTask}<p class="lmu-hint">
        Mudar passos reinicia as marcações. Notas e recompensas já recebidas são
        preservadas. Desfaça a conclusão antes de mover uma missão concluída
        para outro projeto.
      </p>{/if}
    <details bind:open={detailsOpen}>
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
          >Projeto<select
            bind:value={project}
            onchange={() => {
              projectStage = '';
            }}
            ><option value="">Sem projeto</option
            >{#each snapshot.projects.filter((item) => item.status !== 'arquivado' || item.id === editTask?.projectId) as item (item.id)}<option
                value={String(item.id)}>{item.name}</option
              >{/each}</select
          ></label
        >{#if stages.length}<label class="journey-label"
            >Etapa do projeto<select bind:value={projectStage}
              ><option value="">Sem etapa</option
              >{#each stages as stage (stage.id)}<option value={stage.id}
                  >{stage.title}</option
                >{/each}</select
            ></label
          >{/if}<label class="journey-label"
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
      ><Button type="submit" loading={busy}
        >{editTask ? 'Salvar missão' : 'Criar missão'}</Button
      >
    </footer>
  </form></Dialog
>
