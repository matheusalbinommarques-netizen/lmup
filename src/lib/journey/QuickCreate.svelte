<script lang="ts">
  import '$lib/rpg-theme.css';
  import { guardUpdates } from './guardUpdates';
  import type { MissionStarter } from '$lib/content/experience';
  import { untrack, tick } from 'svelte';
  import type { Task } from '$services/db';
  import { EFFORTS, effortDefinition, type Effort } from '$services/effort';
  import { calculateReward } from '$services/rewardService';
  import { createQuickTask } from '$services/journeyService';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Field from '$lib/ui/Field.svelte';
  import AreasDialog from './AreasDialog.svelte';
  import ScheduleFields from './ScheduleFields.svelte';
  import PlanningDetails from './PlanningDetails.svelte';
  import type { Planning } from '$services/productivityTypes';
  import { dateKey } from '$services/rewardService';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import { routineRecurrenceLabel } from '$services/recurrence';
  import { formatCalendar } from '$services/calendar';
  import { areaIconKey } from '$services/areaIcons';
  let {
    open = $bindable(false),
    snapshot,
    oncreated,
    editTask,
    defaultProjectId,
    defaultStageId,
    starter,
    defaultAreaId,
    routineContext,
    allowSaveAnother = true,
  }: {
    defaultAreaId?: number;
    routineContext?: { name: string; startDate: string; days: number[] };
    allowSaveAnother?: boolean;
    starter?: MissionStarter;
    open?: boolean;
    snapshot: JourneySnapshot;
    oncreated?: (id: number, plannedTime?: string | null) => void;
    editTask?: Task;
    defaultProjectId?: number;
    defaultStageId?: string | null;
  } = $props();
  const inheritedRoutine = $derived(
    routineContext ??
      snapshot.routines.find((row) => row.id === editTask?.routineId),
  );
  let steps = $state<{ id: string; label: string }[]>([]);
  let title = $state(''),
    description = $state(''),
    project = $state(''),
    projectStage = $state(''),
    area = $state('0'),
    error = $state('');
  let plannedDate = $state('');
  let planning = $state<Planning>({});
  let recurrenceKind = $state('none');
  let recurrenceDays = $state<number[]>([1]);
  let areasOpen = $state(false);
  let pinned = $state(false);
  let today = $state(true),
    busy = $state(false);
  let effort = $state<Effort | 'legacy'>('small');
  const uid = $props.id();
  const sections = [
    { id: 'general', label: 'Geral', icon: 'perfil' },
    { id: 'planning', label: 'Planejamento', icon: 'agenda' },
    { id: 'tracking', label: 'Acompanhamento', icon: 'progresso' },
    { id: 'details', label: 'Passos e detalhes', icon: 'missions' },
  ] as const;
  let section = $state<string>('general');
  let initialGroups = $state<Record<string, string>>({});
  let savedNotice = $state('');
  function groups() {
    return {
      general: JSON.stringify([title, area, description, effort]),
      planning: JSON.stringify([
        plannedDate,
        recurrenceKind,
        recurrenceDays,
        planning.plannedTime,
        planning.importance,
        planning.deadline,
      ]),
      tracking: JSON.stringify([planning.estimatedMinutes, planning.tracking]),
      details: JSON.stringify([steps, project, projectStage, pinned]),
    };
  }
  const changed = $derived.by(() => {
    const current = groups();
    return sections.filter(
      (item) => current[item.id] !== initialGroups[item.id],
    );
  });
  async function addStep() {
    const id = crypto.randomUUID();
    steps = [...steps, { id, label: '' }];
    await tick();
    document.getElementById(id)?.focus();
  }
  function moveStep(index: number, direction: number) {
    const next = [...steps],
      target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    steps = next;
  }
  function tabsKey(event: KeyboardEvent) {
    if (
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const index = sections.findIndex((item) => item.id === section);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? sections.length - 1
          : (index +
              (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) +
              sections.length) %
            sections.length;
    section = sections[next].id;
    document.getElementById(`${uid}-tab-${section}`)?.focus();
  }
  let saveAnother = $state(false);
  let requestId = $state('');
  let definitionRevision = 0;
  guardUpdates(() => open || busy);
  $effect(() => {
    if (open)
      untrack(() => {
        section = 'general';
        savedNotice = '';
        title = editTask?.title ?? starter?.title ?? '';
        steps = (editTask?.subtasks ?? starter?.steps ?? []).map((label) => ({
          id: crypto.randomUUID(),
          label,
        }));
        description = editTask?.description ?? '';
        error = '';
        project = String(editTask?.projectId ?? defaultProjectId ?? '');
        projectStage = editTask?.projectStageId ?? defaultStageId ?? '';
        area = String(editTask?.areaId ?? defaultAreaId ?? 0);
        plannedDate = editTask
          ? (editTask.plannedDate ?? editTask.recurrence?.startDate ?? '')
          : dateKey();
        recurrenceKind = editTask?.recurrence?.kind ?? 'none';
        recurrenceDays = [...(editTask?.recurrence?.days ?? [1])];
        pinned = editTask?.pinned ?? false;
        planning = {
          plannedTime: editTask?.plannedTime,
          estimatedMinutes: editTask?.estimatedMinutes,
          importance: editTask?.importance,
          deadline: editTask?.deadline,
          tracking: editTask?.tracking,
        };
        today = true;
        requestId = crypto.randomUUID();
        saveAnother = false;
        effort = editTask?.effort ?? (editTask ? 'legacy' : 'small');
        definitionRevision = editTask?.definitionRevision ?? 0;
        initialGroups = groups();
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
    if (!title.trim()) {
      error = 'Escreva um nome para a missão.';
      section = 'general';
      await tick();
      document.getElementById(`${uid}-title`)?.focus();
      return;
    }
    busy = true;
    error = '';
    try {
      const id = await createQuickTask({
        ...planning,
        title,
        requestId,
        steps: steps.map((step) => step.label),
        description,
        projectId: project ? Number(project) : null,
        projectStageId: projectStage || null,
        areaId: Number(area),
        planToday: today,
        plannedDate,
        pinned,
        recurrence:
          recurrenceKind === 'none'
            ? null
            : {
                kind: recurrenceKind as 'daily' | 'weekdays' | 'weekly',
                startDate: plannedDate || dateKey(),
                days: recurrenceDays,
              },
        effort: effort === 'legacy' ? undefined : effort,
        editId: editTask?.id,
        expectedRevision: definitionRevision,
      });
      await oncreated?.(id, planning.plannedTime ?? null);
      if (!editTask && saveAnother) {
        // Preserve area, effort and schedule for fast planning of several missions.
        savedNotice = `Missão “${title.trim()}” criada. Pronta para a próxima.`;
        section = 'general';
        title = '';
        steps = [];
        description = '';
        requestId = crypto.randomUUID();
        saveAnother = false;
        await tick();
        document.getElementById(`${uid}-title`)?.focus();
      } else {
        open = false;
      }
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Seu rascunho continua aqui.';
      if (/meta|acompanhamento|duração/i.test(error)) section = 'tracking';
      else if (/projeto|etapa|passos/i.test(error)) section = 'details';
      else if (/data|recorrência|calendário|horário|dias/i.test(error))
        section = 'planning';
    } finally {
      busy = false;
    }
  }
</script>

<div class="rpg-theme">
  <Dialog
    bind:open
    dismissible={!busy}
    wide
    title={editTask ? 'Editar missão' : 'Uma nova missão'}
    description={editTask
      ? 'Ajuste o que precisa. Os demais valores continuam preservados.'
      : 'Dê um nome à missão. Planeje os detalhes quando precisar.'}
  >
    <form class="quick-mission-form" onsubmit={submit} novalidate>
      {#if error}<p class="form-feedback form-error" role="alert">
          {error}
        </p>{/if}
      {#if savedNotice}<p class="form-feedback" role="status">
          {savedNotice}
        </p>{/if}
      <div class="mission-editor">
        <div
          class="editor-tabs"
          role="tablist"
          aria-label="Seções da missão"
          aria-orientation="horizontal"
          tabindex="-1"
          onkeydown={tabsKey}
        >
          {#each sections as item (item.id)}<button
              type="button"
              role="tab"
              id={`${uid}-tab-${item.id}`}
              aria-controls={`${uid}-panel-${item.id}`}
              aria-selected={section === item.id}
              tabindex={section === item.id ? 0 : -1}
              onclick={() => (section = item.id)}
              ><ApprovedIcon name={item.icon} size={22} /><span
                >{item.label}</span
              >{#if editTask && changed.some((change) => change.id === item.id)}<span
                  class="changed-dot"
                  aria-hidden="true"
                  title="Alterações não salvas">•</span
                >{/if}</button
            >{/each}
        </div>
        <div class="editor-content">
          <div
            role="tabpanel"
            tabindex="0"
            id={`${uid}-panel-general`}
            aria-labelledby={`${uid}-tab-general`}
            hidden={section !== 'general'}
          >
            <h3>Geral</h3>
            <p class="section-hint">O essencial para dar o próximo passo.</p>
            <Field
              label="O que você quer fazer?"
              id={`${uid}-title`}
              bind:value={title}
              data-initial-focus
              maxlength={160}
              placeholder="Ex.: fazer exercício físico"
            />
            <div class="area-field">
              <label class="journey-label"
                >Área<select bind:value={area}
                  ><option value="0">Geral</option
                  >{#each snapshot.areas as item (item.id)}<option
                      value={String(item.id)}>{item.nome}</option
                    >{/each}</select
                ></label
              ><Button variant="secondary" onclick={() => (areasOpen = true)}
                >Gerenciar áreas</Button
              >
            </div>
            <p class="lmu-hint area-icon-preview">
              <ApprovedIcon
                name={areaIconKey(
                  { areaId: Number(area) },
                  snapshot.areas,
                  snapshot.profile?.generalAreaIconKey,
                )}
                size={26}
              />Ícone herdado da área.
            </p>
            <label class="journey-label"
              >Esforço desta missão<select bind:value={effort}
                >{#if editTask && !editTask.effort}<option value="legacy"
                    >Manter recompensa anterior ({editTask.xp} XP base)</option
                  >{/if}{#each EFFORTS as item (item.key)}<option
                    value={item.key}
                    >{item.label} · {item.xp} XP / {Math.floor(item.xp * 0.5)} Ouro
                    base</option
                  >{/each}</select
              ></label
            >
            {#if preview}<p class="reward-preview">
                <ApprovedIcon name="xp" size={24} /><span
                  >Prévia com seus bônus atuais<br /><strong
                    >+{preview.xp} XP <span>·</span> +{preview.gold} Ouro
                    <span>·</span>
                    +{preview.food} Comida</strong
                  ></span
                >
              </p>{/if}
            <label class="journey-label"
              >Descrição (opcional)<textarea
                bind:value={description}
                rows="3"
                maxlength="10000"
                placeholder="O que você quer realizar?"
              ></textarea></label
            >
          </div>
          <div
            role="tabpanel"
            tabindex="0"
            id={`${uid}-panel-planning`}
            aria-labelledby={`${uid}-tab-planning`}
            hidden={section !== 'planning'}
          >
            <h3>Planejamento</h3>
            <p class="section-hint">
              Escolha quando esta missão cabe no seu dia.
            </p>
            {#if inheritedRoutine}<div
                class="routine-inheritance"
                role="note"
                aria-label="Recorrência herdada da rotina"
              >
                <strong>Recorrência definida pela rotina</strong>
                <span
                  >{inheritedRoutine.name || 'Esta rotina'} · {routineRecurrenceLabel(
                    inheritedRoutine.days,
                  )}</span
                >
                <small
                  >A partir de {formatCalendar(
                    inheritedRoutine.startDate,
                  )}</small
                >
                <p>
                  Altere os dias na rotina. {routineContext
                    ? 'A recorrência e o vínculo serão aplicados ao salvar a rotina.'
                    : 'Esta missão acompanha o calendário da rotina.'}
                </p>
              </div>
            {:else}
              {#key requestId}<fieldset
                  disabled={!!editTask?.routineId}
                  class="calendar-fields"
                >
                  <legend class="sr-only">Calendário da missão</legend
                  ><ScheduleFields
                    bind:plannedDate
                    bind:kind={recurrenceKind}
                    bind:days={recurrenceDays}
                    review={!!editTask?.reviewEnabled}
                  />
                </fieldset>{/key}
              {#if editTask?.routineId}<p class="form-feedback">
                  Os dias desta missão são controlados pela rotina.
                </p>{/if}
            {/if}
            <PlanningDetails
              section="planning"
              bind:value={planning}
              legacy={!!editTask && !editTask.productivityVersion}
            />
          </div>
          <div
            role="tabpanel"
            tabindex="0"
            id={`${uid}-panel-tracking`}
            aria-labelledby={`${uid}-tab-tracking`}
            hidden={section !== 'tracking'}
          >
            <h3>Acompanhamento</h3>
            <p class="section-hint">
              Defina como acompanhar sua execução, se precisar.
            </p>
            <PlanningDetails
              section="tracking"
              stepCount={steps.filter((step) => step.label.trim()).length}
              onEditSteps={() => (section = 'details')}
              bind:value={planning}
              legacy={!!editTask && !editTask.productivityVersion}
            />
          </div>
          <div
            role="tabpanel"
            tabindex="0"
            id={`${uid}-panel-details`}
            aria-labelledby={`${uid}-tab-details`}
            hidden={section !== 'details'}
          >
            <h3>Passos e detalhes</h3>
            <p class="section-hint">
              Divida o trabalho e conecte esta missão aos seus projetos.
            </p>
            <div class="step-builder">
              <div class="step-heading">
                <h4>Passos da missão</h4>
                <span
                  >{steps.length}
                  {steps.length === 1 ? 'passo' : 'passos'}</span
                >
              </div>
              {#if !steps.length}<p class="lmu-hint">
                  Divida a missão em ações menores, se precisar.
                </p>{/if}
              <ol>
                {#each steps as step, index (step.id)}
                  <li>
                    <span class="step-number" aria-hidden="true"
                      >{index + 1}</span
                    >
                    <input
                      id={step.id}
                      aria-label={`Passo ${index + 1}`}
                      bind:value={step.label}
                      maxlength="500"
                      placeholder="O que fazer neste passo?"
                      onkeydown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void addStep();
                        }
                      }}
                    />
                    <div class="step-controls">
                      <Button
                        variant="secondary"
                        aria-label={`Mover passo ${index + 1} para cima`}
                        disabled={index === 0}
                        onclick={() => moveStep(index, -1)}>↑</Button
                      ><Button
                        variant="secondary"
                        aria-label={`Mover passo ${index + 1} para baixo`}
                        disabled={index === steps.length - 1}
                        onclick={() => moveStep(index, 1)}>↓</Button
                      ><Button
                        variant="secondary"
                        aria-label={`Remover passo ${index + 1}`}
                        onclick={() => {
                          steps = steps.filter((item) => item.id !== step.id);
                        }}>✕</Button
                      >
                    </div>
                  </li>
                {/each}
              </ol>
              <div class="step-add-row">
                <Button variant="secondary" onclick={addStep}
                  >+ Adicionar passo</Button
                >
              </div>
              <p class="lmu-hint">
                A quantidade de passos não aumenta a recompensa total.
              </p>
            </div>
            <label class="journey-label"
              >Projeto<select
                bind:value={project}
                onchange={() => (projectStage = '')}
                ><option value="">Sem projeto</option
                >{#each snapshot.projects.filter((item) => item.status !== 'arquivado' || item.id === editTask?.projectId) as item (item.id)}<option
                    value={String(item.id)}>{item.name}</option
                  >{/each}</select
              ></label
            >
            {#if stages.length}<label class="journey-label"
                >Etapa do projeto<select bind:value={projectStage}
                  ><option value="">Sem etapa</option
                  >{#each stages as stage (stage.id)}<option value={stage.id}
                      >{stage.title}</option
                    >{/each}</select
                ></label
              >{/if}
            <label class="journey-check"
              ><input type="checkbox" bind:checked={pinned} />Fixar missão em
              destaque</label
            >
          </div>
        </div>
      </div>
      <footer>
        <Button variant="quiet" disabled={busy} onclick={() => (open = false)}
          >Cancelar</Button
        >{#if !editTask && allowSaveAnother}<Button
            type="submit"
            variant="secondary"
            loading={busy}
            onclick={() => (saveAnother = true)}>Salvar e criar outra</Button
          >{/if}<Button
          type="submit"
          loading={busy}
          onclick={() => (saveAnother = false)}
          >{editTask ? 'Salvar missão' : 'Criar missão'}</Button
        >
      </footer>
    </form>
  </Dialog>
  <AreasDialog
    bind:open={areasOpen}
    {snapshot}
    oncreated={(id) => (area = String(id))}
  />
</div>

<style>
  .routine-inheritance {
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid #a8874555;
    border-radius: 8px;
    background: #a7873516;
    color: #d8d3bd;
  }
  .routine-inheritance strong {
    color: #edce85;
  }
  .routine-inheritance small,
  .routine-inheritance p {
    color: #aebfae;
    font-size: 0.8rem;
  }
  .routine-inheritance p {
    margin: 4px 0 0;
  }

  .step-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .step-heading h4 {
    margin: 0;
    color: #edcf91;
    font-size: 1rem;
  }
  .step-heading span {
    font-size: 0.75rem;
    color: #afbdac;
  }
  .step-builder ol {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
    margin: 0;
  }
  .step-builder {
    display: grid;
    gap: 12px;
  }
  .step-builder > p {
    margin: 0;
  }
  .step-add-row {
    padding-left: 28px;
    padding-top: 4px;
  }
  .step-builder li {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
  }
  .step-builder input {
    width: 100%;
    min-width: 0;
    background: #07171a;
    color: #e9e2cb;
    border: 1px solid #8d744a88;
    border-radius: 7px;
    padding: 10px 12px;
    font: inherit;
    font-size: 0.85rem;
  }
  .step-builder input:focus-visible {
    outline: 2px solid #e0b45b;
    outline-offset: 2px;
  }
  .step-number {
    color: #c5a568;
    font-size: 0.8rem;
  }
  .step-controls {
    display: flex;
    gap: 4px;
  }
  .step-controls :global(button) {
    padding: 6px;
    min-width: 32px;
    min-height: 36px;
  }
  @media (max-width: 600px) {
    .step-builder li {
      grid-template-columns: 18px minmax(0, 1fr);
    }
    .step-controls {
      grid-column: 2;
      justify-content: flex-end;
    }
  }

  .quick-mission-form {
    display: flex !important;
    flex-direction: column;
    gap: 12px !important;
    margin-top: 16px !important;
    min-height: 0;
    max-height: calc(90dvh - 160px);
    overflow: hidden;
  }
  .mission-editor {
    display: grid;
    grid-template-columns: 177px minmax(0, 1fr);
    min-height: 0;
    grid-template-rows: minmax(0, 1fr);
    max-height: calc(90dvh - 220px);
  }
  .editor-tabs {
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-right: 1px solid #9a7b4740;
    padding-right: 14px;
  }
  .editor-tabs button {
    display: flex;
    gap: 9px;
    align-items: center;
    min-height: 43px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: #c6d0bd;
    font-size: 0.82rem;
    text-align: left;
    padding: 8px;
    cursor: pointer;
    white-space: nowrap;
  }
  .editor-tabs button[aria-selected='true'] {
    background: linear-gradient(110deg, #5b4626, #292c20);
    border-color: #b28a3a;
    color: #ffe4a2;
  }
  .editor-tabs button:focus-visible {
    outline: 2px solid #edc36b;
    outline-offset: 2px;
  }
  .changed-dot {
    color: #eac16c;
    margin-left: auto;
  }
  .editor-content {
    overflow-y: auto;
    min-width: 0;
    min-height: 0;
    padding: 0 8px 4px 22px;
  }
  .editor-content [role='tabpanel'] {
    display: grid;
    gap: 11px;
  }
  .editor-content [role='tabpanel'][hidden] {
    display: none;
  }
  h3 {
    font: 500 1.65rem var(--lmu-display);
    color: #ebd39c;
    margin: 0;
  }
  .section-hint {
    margin: -4px 0 4px;
    font-size: 0.8rem;
    color: #aebfb0;
  }
  .area-field {
    display: flex;
    align-items: end;
    gap: 8px;
  }
  .area-field label {
    flex: 1;
    min-width: 0;
  }
  .area-field :global(.lmu-button) {
    font-size: 0.77rem;
    padding: 8px;
    min-height: 48px;
  }
  .area-icon-preview {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: -5px 0 0;
  }
  .reward-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 10px;
    background: #ad803414;
    border: 1px solid #9b7b3f40;
    border-radius: 6px;
    font-size: 0.76rem;
    color: #b7c4b2;
  }
  .reward-preview strong {
    color: #edce85;
    font-size: 0.86rem;
    font-weight: 500;
    line-height: 1.8;
  }
  .reward-preview strong span {
    color: #748d7f;
    padding: 0 3px;
  }
  .calendar-fields {
    border: 0;
    padding: 0;
    min-width: 0;
    margin: 0;
  }
  footer {
    gap: 8px !important;
    flex-shrink: 0;
    padding: 0 !important;
  }
  footer :global(.lmu-button) {
    font-size: 0.82rem;
    min-height: 40px;
    padding: 8px 13px;
  }
  .form-feedback {
    margin: 0;
    border: 1px solid #9c853f66;
    background: #aa86301a;
    padding: 9px 12px;
    border-radius: 5px;
    font-size: 0.82rem;
    color: #e2ce9c;
  }
  .form-error {
    border-color: #d3876b;
    color: #f3c0ab;
  }
  @media (max-width: 600px) {
    .quick-mission-form {
      gap: 10px !important;
    }
    .mission-editor {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 460px;
      max-height: calc(90dvh - 270px);
    }
    .editor-tabs {
      flex-direction: row;
      flex-shrink: 0;
      gap: 5px;
      border-right: 0;
      border-bottom: 1px solid #9a7b4740;
      padding: 2px 2px 10px;
      overflow-x: auto;
      margin-bottom: 12px;
    }
    .editor-tabs button {
      min-height: 40px;
      padding: 7px 9px;
      font-size: 0.76rem;
      flex-shrink: 0;
    }
    .editor-tabs :global(img) {
      width: 18px;
      height: 18px;
    }
    .editor-content {
      padding: 0 4px 4px;
    }
    .editor-content [role='tabpanel'] {
      gap: 10px;
    }
    footer {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
    }
    footer :global(.lmu-button:last-child) {
      grid-column: 2;
      grid-row: 1;
    }
    footer :global(.lmu-button--secondary) {
      grid-column: 1/-1;
      grid-row: 2;
    }
    h3 {
      font-size: 1.45rem;
    }
  }
</style>
