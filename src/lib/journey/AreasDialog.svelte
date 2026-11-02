<script lang="ts">
  import type { JourneySnapshot } from '$services/journeyQuery';
  import { saveArea, deleteArea } from '$services/areaService';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import IconPicker from '$lib/ui/IconPicker.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import { guardUpdates } from './guardUpdates';
  let {
    open = $bindable(false),
    snapshot,
    oncreated,
  }: {
    open?: boolean;
    snapshot: JourneySnapshot;
    oncreated?: (id: number) => void;
  } = $props();
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
  guardUpdates(() => open || busy);
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

<Dialog
  bind:open
  title="Minhas áreas"
  description="Organize sua vida do seu jeito. Suas missões e seu histórico são preservados."
  dismissible={!busy}
>
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  <p class="lmu-hint" role="status">{notice}</p>
  <form
    class="area-create"
    onsubmit={(event) => {
      event.preventDefault();
      void act(async () => {
        const id = await saveArea(name, undefined, newIcon);
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
    <fieldset disabled={busy} class="area-icon-field">
      <IconPicker bind:value={newIcon} />
    </fieldset>
    <Button type="submit" disabled={busy || !name.trim()}>Criar área</Button>
  </form>
  <ul class="area-list">
    <li>
      <div>
        <strong><ApprovedIcon size={28} /> Geral</strong><small
          >{snapshot.tasks.filter((task) => !task.archived && !task.areaId)
            .length} missões · Área padrão</small
        >
      </div>
    </li>
    {#each [...snapshot.areas].sort( (a, b) => a.nome.localeCompare(b.nome, 'pt-BR') ) as area (area.id)}
      <li>
        {#if editing === area.id}
          <form
            onsubmit={(event) => {
              event.preventDefault();
              void act(async () => {
                await saveArea(rename, area.id, editIcon);
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
              ).length} missões</small
            >
          </div>
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
                removing = null;
              }}>Editar</Button
            ><Button
              variant="quiet"
              disabled={busy}
              aria-label={`Excluir ${area.nome}`}
              onclick={() => {
                removing = area.id!;
                destination = '0';
                editing = null;
              }}>Excluir</Button
            >
          </div>
        {/if}
        {#if removing === area.id}<div class="area-confirm">
            <p>
              Excluir a área “{area.nome}”? Suas missões serão transferidas. Os
              registros de XP e recompensas serão mantidos.
            </p>
            <label class="journey-label lmu-field"
              >Transferir missões para<select bind:value={destination}
                ><option value="0">Geral</option
                >{#each snapshot.areas.filter((item) => item.id !== area.id) as item (item.id)}<option
                    value={String(item.id)}>{item.nome}</option
                  >{/each}</select
              ></label
            >
            <div class="journey-actions">
              <Button
                variant="danger"
                disabled={busy}
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
</Dialog>

<style>
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
  .area-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
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
