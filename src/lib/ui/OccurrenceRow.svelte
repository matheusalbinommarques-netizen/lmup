<script lang="ts">
  import type { Occurrence } from '$services/productivityTypes';
  import { fraction } from '$services/productivityRules';
  import { occurrenceSituation } from '$services/productivityInsights';
  import ApprovedIcon from './ApprovedIcon.svelte';
  import Button from './Button.svelte';
  let {
    row,
    iconKey,
    area = 'Geral',
    busy = false,
    recovery = false,
    checked = false,
    onselect,
    onopen,
    onedit,
  }: {
    row: Occurrence;
    iconKey?: string | null;
    area?: string;
    busy?: boolean;
    recovery?: boolean;
    checked?: boolean;
    onselect?: (checked: boolean) => void;
    onopen: () => void;
    onedit?: () => void;
  } = $props();
  const labels: Record<string, string> = {
    planned: 'Planejada',
    active: 'Em andamento',
    paused: 'Pausada',
    partial: 'Parcial',
    completed: 'Concluída',
    late: 'Início atrasado',
    expired: 'Prazo vencido',
    discarded: 'Descartada',
    excused: 'Pausa justificada',
  };
  const state = $derived(occurrenceSituation(row));
</script>

<article
  class="occurrence-row"
  class:selectable={!!onselect}
  class:completed={row.status === 'completed'}
>
  {#if onselect}<input
      type="checkbox"
      aria-label={`Selecionar ${row.title}`}
      {checked}
      onchange={(event) => onselect?.(event.currentTarget.checked)}
    />{/if}
  <span class="occurrence-time">{row.plannedTime ?? 'Flex.'}</span><ApprovedIcon
    name={iconKey}
    size={32}
  />
  <div class="occurrence-copy">
    <button class="row-title" onclick={onopen}>{row.title}</button>
    <div class="row-meta">
      <span
        >{row.estimatedMinutes
          ? `${row.estimatedMinutes} min`
          : 'Sem estimativa'}</span
      ><span class="area-chip">{area}</span><span
        class="state-chip"
        class:attention={['late', 'expired'].includes(state)}
        >{labels[state]}</span
      >{#if recovery || row.originDate !== row.plannedDate}<span
          >Origem: {row.originDate.split('-').reverse().join('/')}</span
        >{/if}
    </div>
  </div>
  <div class="occurrence-execution">
    <div class="occurrence-progress">
      <progress
        value={fraction(row) * 100}
        max="100"
        aria-label={`Progresso de ${row.title}`}
      ></progress><span>{Math.round(fraction(row) * 100)}%</span>
    </div>
    <div class="occurrence-action">
      <Button disabled={busy} onclick={onopen}
        ><ApprovedIcon
          name={recovery ? 'recover' : 'comecar'}
          size={24}
        />{row.status === 'completed'
          ? 'Ver ou corrigir'
          : recovery
            ? 'Recuperar'
            : row.value
              ? 'Continuar'
              : 'Executar agora'}</Button
      >
    </div>
  </div>
  <details class="row-menu">
    <summary aria-label={`Ações para ${row.title}`}
      ><ApprovedIcon name="opcoes" size={24} /></summary
    >
    <div>
      <Button variant="quiet" onclick={onopen}>Reagendar</Button
      >{#if onedit}<Button variant="quiet" onclick={onedit}
          >Editar futuras</Button
        >{/if}
    </div>
  </details>
</article>

<style>
  .occurrence-row {
    display: grid;
    grid-template-columns: 46px 32px minmax(0, 1fr) auto 32px;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #69745055;
    border-radius: 7px;
    background: linear-gradient(110deg, #1b2c2a80, #081317);
    min-width: 0;
  }
  .occurrence-row.selectable {
    grid-template-columns: 20px 46px 32px minmax(0, 1fr) auto 32px;
  }
  .occurrence-row.completed {
    background: #17332644;
  }
  .occurrence-time {
    font-size: 0.82rem;
    color: #e8e4cd;
    font-variant-numeric: tabular-nums;
  }
  .occurrence-copy {
    min-width: 0;
  }
  .row-title {
    background: none;
    border: 0;
    color: #f1ebd8;
    padding: 0;
    font: 600 1.15rem/1.25 var(--lmu-display);
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
  }
  .row-meta {
    display: flex;
    gap: 4px 8px;
    flex-wrap: wrap;
    font-size: 0.78rem;
    line-height: 1.45;
    color: #bcc9b9;
    margin-top: 4px;
  }
  .area-chip,
  .state-chip {
    border-radius: 12px;
    background: #65502c44;
    padding: 1px 7px;
    color: #dfdfc5;
  }
  .state-chip {
    background: #354b4344;
    color: #c8d7cc;
  }
  .state-chip.attention {
    background: #6b342c77;
    color: #ffd0ac;
  }
  .completed .state-chip {
    background: #24533477;
    color: #c2ebc7;
  }
  .occurrence-execution {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .occurrence-progress {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.78rem;
    color: #c5d1bc;
    font-variant-numeric: tabular-nums;
  }
  .occurrence-progress progress {
    width: 64px;
    min-width: 0;
  }
  .occurrence-row :global(.lmu-button) {
    min-height: 36px;
    min-width: 32px;
    padding: 5px 8px;
    font-size: 0.82rem;
  }
  .row-menu {
    position: relative;
  }
  .row-menu summary {
    list-style: none;
    cursor: pointer;
    min-height: 36px;
    display: grid;
    place-items: center;
  }
  .row-menu > div {
    position: absolute;
    right: 0;
    top: 35px;
    background: #14292b;
    border: 1px solid #9e8548;
    padding: 8px;
    z-index: 7;
    min-width: 170px;
    display: grid;
  }
  input {
    accent-color: #e5b75c;
    width: 18px;
    height: 18px;
  }
  @media (max-width: 1100px) and (min-width: 701px) {
    .occurrence-execution {
      flex-direction: column;
      align-items: end;
      gap: 6px;
    }
  }
  @media (max-width: 700px) {
    .occurrence-row,
    .occurrence-row.selectable {
      grid-template-columns: 40px 28px minmax(0, 1fr) 30px;
      gap: 8px;
      padding: 10px 8px;
    }
    .occurrence-time {
      grid-column: 1;
      grid-row: 1;
      font-size: 0.8rem;
      align-self: start;
      padding-top: 4px;
    }
    .occurrence-row > :global(.approved-icon) {
      grid-column: 2;
      grid-row: 1;
    }
    .occurrence-copy {
      grid-column: 3;
      grid-row: 1;
    }
    .row-menu {
      grid-column: 4;
      grid-row: 1;
      align-self: start;
    }
    input {
      grid-column: 1;
      grid-row: 2;
      justify-self: center;
    }
    .occurrence-execution {
      grid-column: 2/5;
      grid-row: 2;
      gap: 8px;
    }
    .occurrence-progress progress {
      width: 48px;
    }
    .row-title {
      font-size: 1.1rem;
    }
    .row-meta {
      font-size: 0.78rem;
    }
  }
</style>
