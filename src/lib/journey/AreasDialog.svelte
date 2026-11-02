<script lang="ts">
  import type { JourneySnapshot } from '$services/journeyQuery';
  import {
    saveArea,
    deleteArea,
    transferAreaTasks,
  } from '$services/areaService';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import IconPicker from '$lib/ui/IconPicker.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    snapshot,
    oncreated,
    embedded = false,
    onbrowse,
  }: {
    open?: boolean;
    embedded?: boolean;
    onbrowse?: (id: number) => void;
    snapshot: JourneySnapshot;
    oncreated?: (id: number) => void;
  } = $props();
  let search = $state('');
  let description = $state(''),
    editDescription = $state('');
  let selected = $state<number[]>([]),
    transferDestination = $state('');
  let transferSearch = $state('');
  let transferConfirm = $state(false);
  let expectedSelection = $state<
    { id: number; areaId: number; revision: number }[]
  >([]);
  function selectTask(id: number, checked: boolean) {
    const task = snapshot.tasks.find((task) => task.id === id);
    if (!task) return;
    selected = checked
      ? [...selected.filter((value) => value !== id), id]
      : selected.filter((value) => value !== id);
    expectedSelection = expectedSelection.filter((row) => row.id !== id);
    if (checked)
      expectedSelection = [
        ...expectedSelection,
        {
          id,
          areaId: task.areaId ?? 0,
          revision: task.definitionRevision ?? 0,
        },
      ];
    transferConfirm = false;
  }

  const matchingAreas = $derived(
    [...snapshot.areas]
      .filter((area) =>
        area.nome
          .toLocaleLowerCase('pt-BR')
          .includes(search.trim().toLocaleLowerCase('pt-BR')),
      )
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
  );
  const tasksFor = (id: number) =>
    snapshot.tasks.filter((task) => (task.areaId ?? 0) === id);
  const routinesFor = (id: number) =>
    (snapshot.routines ?? []).filter(
      (routine) =>
        (routine.defaultAreaId ?? 0) === id ||
        routine.entries.some((entry) =>
          tasksFor(id).some((task) => task.id === entry.taskId),
        ),
    );
  let name = $state(''),
    error = $state(''),
    notice = $state('');
  let newIcon = $state<string | null>(null);
  let editIcon = $state<string | null>(null);
  let editing = $state<number | null>(null),
    rename = $state(''),
    removing = $state<number | null>(null),
    destination = $state('0'),
    busy = $state(false);
  guardUpdates(
    () =>
      open ||
      busy ||
      selected.length > 0 ||
      (embedded && (!!name || editing !== null || removing !== null)),
  );
  async function act(work: () => Promise<unknown>, message: string) {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      await work();
      notice = message;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar a área.';
    } finally {
      busy = false;
    }
  }
</script>

{#snippet overview(id: number, label: string)}
  <div class="area-overview">
    <div class="area-counts">
      <span
        >{tasksFor(id).filter((task) => !task.archived && !task.completed)
          .length} ativas</span
      ><span
        >{tasksFor(id).filter((task) => !task.archived && task.completed)
          .length} concluídas</span
      ><span
        >{tasksFor(id).filter((task) => task.archived).length} arquivadas</span
      >
    </div>
    {#if onbrowse}<Button variant="secondary" onclick={() => onbrowse?.(id)}
        >Ver missões de {label}</Button
      >{/if}
    <details>
      <summary>Atividades vinculadas</summary>
      {#if !tasksFor(id).length && !routinesFor(id).length}<p class="lmu-hint">
          Esta área ainda não tem missões ou rotinas.
        </p>{/if}
      {#if tasksFor(id).length}<h3>Missões</h3>
        <ul class="linked-activities">
          {#each tasksFor(id) as task (task.id)}<li>
              <span>{task.title}</span><small
                >{task.archived
                  ? 'Arquivada'
                  : task.completed
                    ? 'Concluída'
                    : 'Pendente'}</small
              >
            </li>{/each}
        </ul>{/if}
      {#if routinesFor(id).length}<h3>Rotinas</h3>
        <ul class="linked-activities">
          {#each routinesFor(id) as routine (routine.id)}<li>
              <span>{routine.name}</span><small
                >{routine.defaultAreaId === id
                  ? 'Área padrão'
                  : 'Contém missões desta área'}</small
              >
            </li>{/each}
        </ul>{/if}
    </details>
  </div>
{/snippet}
{#snippet contents()}
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  <p class="lmu-hint" role="status">{notice}</p>
  <form
    class="area-create"
    onsubmit={(event) => {
      event.preventDefault();
      void act(async () => {
        const id = await saveArea(name, undefined, newIcon, description);
        description = '';
        name = '';
        newIcon = null;
        oncreated?.(id);
      }, 'Área criada.');
    }}
  >
    <label class="journey-label lmu-field"
      >Nome da nova área<input
        bind:value={name}
        maxlength="80"
        placeholder="Ex.: Casa"
        data-initial-focus
      /></label
    >
    <label class="journey-label area-description-input"
      >Descrição da área (opcional)<textarea
        bind:value={description}
        maxlength="4000"
        rows="2"
        placeholder="O que esta área representa?"
      ></textarea></label
    >
    <div class="area-create-actions">
      <fieldset disabled={busy} class="area-icon-trigger">
        <IconPicker
          bind:value={newIcon}
          buttonTrigger
          label="Editar ícone da área"
        />
      </fieldset>
      <Button type="submit" disabled={busy || !name.trim()}>Criar área</Button>
    </div>
  </form>
  <div class="area-browser-tools">
    <label class="journey-label"
      >Buscar área<input
        type="search"
        bind:value={search}
        placeholder="Encontre uma área"
      /></label
    >
    <p>
      {snapshot.areas.length + 1} áreas · {snapshot.tasks.filter(
        (task) => !task.archived,
      ).length} cadastros não arquivados
    </p>
  </div>
  <p class="lmu-hint">
    Os totais contam cadastros de missões, sem somar suas ocorrências
    recorrentes.
  </p>
  <ul class="area-list">
    {#if !search || 'geral'.includes(search.toLocaleLowerCase('pt-BR'))}<li>
        <div>
          <strong><ApprovedIcon size={28} /> Geral</strong><small
            >{snapshot.tasks.filter((task) => !task.archived && !task.areaId)
              .length} missões · Área padrão</small
          >
        </div>
        {@render overview(0, 'Geral')}
      </li>{/if}
    {#each matchingAreas as area (area.id)}
      <li>
        {#if editing === area.id}
          <form
            onsubmit={(event) => {
              event.preventDefault();
              void act(async () => {
                await saveArea(rename, area.id, editIcon, editDescription);
                editing = null;
              }, 'Área atualizada.');
            }}
          >
            <label class="journey-label lmu-field"
              >Novo nome de {area.nome}<input
                bind:value={rename}
                maxlength="80"
              /></label
            >
            <label class="journey-label"
              >Descrição da área (opcional)<textarea
                bind:value={editDescription}
                maxlength="4000"
                rows="2"
              ></textarea></label
            >
            <fieldset disabled={busy} class="area-icon-field">
              <IconPicker bind:value={editIcon} />
            </fieldset>
            <div class="journey-actions">
              <Button type="submit" disabled={busy}>Salvar área</Button><Button
                variant="quiet"
                disabled={busy}
                onclick={() => (editing = null)}>Cancelar</Button
              >
            </div>
          </form>
        {:else}<div>
            <strong
              ><ApprovedIcon name={area.iconKey} size={28} />
              {area.nome}</strong
            ><small
              >{snapshot.tasks.filter(
                (task) => !task.archived && task.areaId === area.id,
              ).length} missões · {routinesFor(area.id!).length} rotinas</small
            >
          </div>
          {#if area.descricao}<p class="area-description">
              {area.descricao}
            </p>{/if}
          {#if area.iconConflict}<p class="lmu-hint area-icon-conflict">
              Ícones anteriores diferentes. Edite a área para escolher um único
              símbolo.
            </p>{/if}
          <div class="area-actions">
            <Button
              variant="quiet"
              disabled={busy}
              aria-label={`Editar ${area.nome}`}
              onclick={() => {
                editing = area.id!;
                rename = area.nome;
                editIcon = area.iconKey ?? null;
                editDescription = area.descricao ?? '';
                removing = null;
              }}>Editar</Button
            ><Button
              variant="quiet"
              disabled={busy}
              aria-label={`Excluir ${area.nome}`}
              onclick={() => {
                removing = area.id!;
                destination = '';
                editing = null;
              }}>Excluir</Button
            >
          </div>
        {/if}
        {#if editing !== area.id}{@render overview(area.id!, area.nome)}{/if}
        {#if removing === area.id}<div class="area-confirm">
            <p>
              Excluir a área “{area.nome}”? Suas missões serão transferidas. Os
              registros de XP, progresso, ocorrências e recompensas serão
              mantidos. Rotinas que usam esta área como padrão também receberão
              o destino escolhido.
            </p>
            <label class="journey-label lmu-field"
              >Transferir missões para<select bind:value={destination}
                ><option value="" disabled>Escolha uma área de destino</option
                ><option value="0">Geral</option
                >{#each snapshot.areas.filter((item) => item.id !== area.id) as item (item.id)}<option
                    value={String(item.id)}>{item.nome}</option
                  >{/each}</select
              ></label
            >
            <div class="journey-actions">
              <Button
                variant="danger"
                disabled={busy || destination === ''}
                onclick={() =>
                  act(async () => {
                    await deleteArea(area.id!, Number(destination));
                    removing = null;
                  }, 'Área excluída; missões preservadas.')}
                >Confirmar exclusão da área</Button
              ><Button
                variant="quiet"
                disabled={busy}
                onclick={() => (removing = null)}>Cancelar exclusão</Button
              >
            </div>
          </div>{/if}
      </li>
    {/each}
  </ul>
  {#if search && !matchingAreas.length && !'geral'.includes(search.toLocaleLowerCase('pt-BR'))}<p
      role="status"
      class="lmu-hint"
    >
      Nenhuma área encontrada. Tente outro nome.
    </p>{/if}
{/snippet}
{#snippet transferPanel()}
  <details class="area-transfer">
    <summary>Transferir várias missões</summary>
    <p class="lmu-hint">
      Altera somente a área atual dos cadastros selecionados. Progresso,
      ocorrências, projetos, rotinas e recibos permanecem preservados.
    </p>
    <label class="journey-label"
      >Buscar missão para transferir<input
        type="search"
        bind:value={transferSearch}
      /></label
    >
    <fieldset disabled={busy || transferConfirm}>
      <legend>Selecione os cadastros</legend>
      <div class="transfer-list">
        {#each snapshot.tasks.filter((task) => task.title
            .toLocaleLowerCase('pt-BR')
            .includes(transferSearch.toLocaleLowerCase('pt-BR'))) as task (task.id)}<label
            ><input
              type="checkbox"
              checked={selected.includes(task.id!)}
              onchange={(event) =>
                selectTask(task.id!, event.currentTarget.checked)}
              aria-label={`Transferir ${task.title}`}
            /><span
              >{task.title}<small
                >{snapshot.areas.find((area) => area.id === task.areaId)
                  ?.nome ?? 'Geral'} · {task.archived
                  ? 'Arquivada'
                  : task.completed
                    ? 'Concluída'
                    : 'Ativa'}</small
              ></span
            ></label
          >{/each}
      </div>
      <label class="journey-label"
        >Área de destino<select bind:value={transferDestination}
          ><option value="" disabled>Escolha o destino</option><option value="0"
            >Geral</option
          >{#each snapshot.areas as area (area.id)}<option
              value={String(area.id)}>{area.nome}</option
            >{/each}</select
        ></label
      >
    </fieldset>
    {#if transferConfirm}<div class="area-confirm">
        <p>
          Transferir {selected.length}
          {selected.length === 1 ? 'missão' : 'missões'} para {snapshot.areas.find(
            (area) => area.id === Number(transferDestination),
          )?.nome ?? 'Geral'}? Esta ação não altera o histórico ou as
          recompensas.
        </p>
        <div class="journey-actions">
          <Button
            disabled={busy}
            onclick={() =>
              act(async () => {
                const count = await transferAreaTasks(
                  selected,
                  Number(transferDestination),
                  expectedSelection,
                );
                selected = [];
                expectedSelection = [];
                transferConfirm = false;
                notice = `${count} missões transferidas.`;
              }, 'Classificação atualizada; histórico preservado.')}
            >Confirmar transferência</Button
          ><Button
            variant="quiet"
            disabled={busy}
            onclick={() => (transferConfirm = false)}
            >Cancelar transferência</Button
          >
        </div>
      </div>
    {:else}<Button
        disabled={busy || !selected.length || transferDestination === ''}
        onclick={() => (transferConfirm = true)}
        >Revisar transferência ({selected.length})</Button
      >{/if}
  </details>
{/snippet}
{#if embedded}
  <section class="rpg-frame area-workspace" aria-label="Gerenciar áreas">
    <h2>Minhas áreas</h2>
    <p class="lmu-hint">
      Crie e edite seus símbolos. As missões herdam o ícone da área.
    </p>
    {@render contents()}
    {@render transferPanel()}
  </section>
{:else}
  <Dialog
    bind:open
    title="Minhas áreas"
    description="Organize sua vida do seu jeito. Suas missões e seu histórico são preservados."
    dismissible={!busy}
  >
    {@render contents()}
  </Dialog>
{/if}

<style>
  .area-browser-tools {
    display: flex;
    gap: 16px;
    align-items: end;
    flex-wrap: wrap;
    margin: 22px 0 8px;
  }
  .area-browser-tools label {
    flex: 1;
    min-width: 0;
  }
  .area-browser-tools p {
    font-size: 0.78rem;
    color: #aabca9;
  }
  .area-list > li {
    padding: 16px;
    border: 1px solid #8d744a55;
    border-radius: 9px;
    margin-bottom: 10px;
    background: #07191b;
  }
  .area-overview {
    width: 100%;
    display: grid;
    gap: 12px;
  }
  .area-counts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.76rem;
    color: #bdc9b7;
  }
  .area-counts span {
    background: #a18a3420;
    border-radius: 4px;
    padding: 3px 8px;
  }
  .area-overview :global(.lmu-button) {
    justify-self: start;
  }
  .area-overview summary {
    cursor: pointer;
    color: #d9c18a;
    font-size: 0.8rem;
  }
  .area-overview h3 {
    font-size: 0.85rem;
    margin: 14px 0 6px;
  }
  .linked-activities {
    list-style: none;
    padding: 0;
  }
  .linked-activities li {
    font-size: 0.82rem;
    overflow-wrap: anywhere;
  }

  .area-create-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: start;
    width: 100%;
  }
  .area-create-actions > :global(.lmu-button) {
    flex-shrink: 0;
  }
  .area-icon-trigger {
    flex: 0 1 auto;
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
  }
  .area-description-input {
    flex-basis: 100%;
  }
  .area-description {
    width: 100%;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.82rem;
    color: #b4c1ad;
    margin: 0;
  }
  .area-transfer {
    border-top: 1px solid #8d744a55;
    margin-top: 18px;
    padding-top: 18px;
    display: block;
  }
  .area-transfer summary {
    color: #e5c687;
    cursor: pointer;
  }
  .area-transfer fieldset {
    border: 0;
    padding: 0;
    margin: 14px 0;
    display: grid;
    gap: 14px;
  }
  .area-transfer legend {
    font-size: 0.8rem;
    color: #bdc9b7;
    margin-bottom: 10px;
  }
  .transfer-list {
    display: grid;
    max-height: 300px;
    overflow-y: auto;
    gap: 6px;
  }
  .transfer-list label {
    display: flex;
    gap: 10px;
    padding: 10px;
    border: 1px solid #8d744a44;
    border-radius: 6px;
    font-size: 0.85rem;
    align-items: center;
  }
  .transfer-list input {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  .transfer-list span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .area-workspace {
    padding: 18px;
  }
  .area-workspace h2 {
    font: 500 1.7rem var(--lmu-display);
    color: #ebce90;
    margin: 0 0 8px;
  }
  .area-create {
    display: flex;
    align-items: end;
    flex-wrap: wrap;
    gap: 0.7rem;
  }
  .area-icon-field {
    border: 0;
    padding: 0;
    min-width: 0;
    flex-basis: 100%;
  }
  .area-icon-conflict {
    flex-basis: 100%;
    margin: 0;
  }
  strong {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .area-create label {
    flex: 1;
    min-width: 0;
  }
  .area-browser-tools input,
  .area-transfer input[type='search'] {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid #8d744a77;
    border-radius: 7px;
    background: #07171a;
    color: #e5dfca;
  }
  .area-browser-tools input:focus-visible,
  .area-transfer input[type='search']:focus-visible {
    outline: 2px solid #e0b45b;
    outline-offset: 2px;
  }
  .area-overview details {
    margin: 0;
  }
  .area-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    gap: 12px;
    align-items: start;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.8rem 0;
    border-top: 1px solid #a27c4340;
  }
  small {
    display: block;
    color: var(--lmu-text-muted);
  }
  li form,
  .area-confirm {
    width: 100%;
  }
  .area-actions {
    display: flex;
    flex-wrap: wrap;
  }
  .area-confirm {
    padding: 0.8rem;
    background: #b55b1714;
    border: 1px solid #a27c4366;
    border-radius: 0.5rem;
  }
  @media (max-width: 430px) {
    .area-create {
      flex-wrap: wrap;
    }
    .area-create label {
      flex-basis: 100%;
    }
  }
</style>
