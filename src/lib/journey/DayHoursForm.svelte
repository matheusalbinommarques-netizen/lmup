<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from '$lib/ui/Button.svelte';
  import {
    dayHoursProblem,
    saveDayHours,
    type DayHours,
  } from '$services/firstUse';

  /**
   * Início e fim do dia (lote 7). Os dois são opcionais e só servem de
   * referência para as horas ≈ do plano.
   */
  let {
    hours = {},
    saveLabel = 'Salvar horários',
    allowClear = false,
    onsaved,
    actions,
  }: {
    hours?: DayHours;
    saveLabel?: string;
    allowClear?: boolean;
    onsaved?: (saved: DayHours) => void;
    actions?: Snippet;
  } = $props();
  const uid = $props.id();
  // svelte-ignore state_referenced_locally
  let start = $state(hours.start ?? ''),
    end = $state(hours.end ?? ''),
    busy = $state(false),
    error = $state('');
  const problem = $derived(
    dayHoursProblem({ start: start || undefined, end: end || undefined }),
  );
  const empty = $derived(!start && !end);
  const unchanged = $derived(
    start === (hours.start ?? '') && end === (hours.end ?? ''),
  );
  async function save(next = { start, end }) {
    error = '';
    busy = true;
    try {
      const saved = await saveDayHours(next);
      start = saved.start ?? '';
      end = saved.end ?? '';
      onsaved?.(saved);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar os horários.';
    } finally {
      busy = false;
    }
  }
</script>

<div class="day-hours">
  <div class="day-hours-fields">
    <label for={`${uid}-start`}
      >Começa<input
        id={`${uid}-start`}
        type="time"
        step="300"
        bind:value={start}
        aria-invalid={problem ? 'true' : undefined}
        aria-describedby={problem || error ? `${uid}-error` : undefined}
      /></label
    >
    <label for={`${uid}-end`}
      >Termina<input
        id={`${uid}-end`}
        type="time"
        step="300"
        bind:value={end}
        aria-invalid={problem ? 'true' : undefined}
        aria-describedby={problem || error ? `${uid}-error` : undefined}
      /></label
    >
  </div>
  {#if problem || error}<p
      id={`${uid}-error`}
      class="lmu-field-error"
      role="alert"
    >
      {problem || error}
    </p>{/if}
  <div class="journey-actions">
    <Button
      size="s"
      loading={busy}
      disabled={!!problem ||
        (empty && !allowClear) ||
        (allowClear && unchanged)}
      onclick={() => save()}>{saveLabel}</Button
    >{#if allowClear && (hours.start || hours.end)}<Button
        size="s"
        variant="quiet"
        disabled={busy}
        onclick={() => save({ start: '', end: '' })}>Limpar horários</Button
      >{/if}{@render actions?.()}
  </div>
</div>

<style>
  .day-hours {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
  }
  .day-hours-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .day-hours-fields label {
    display: grid;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--lmu-muted);
  }
  .day-hours-fields input {
    min-height: var(--lmu-control, 2.5rem);
    min-width: min(8.5rem, 100%);
    padding: 0 10px;
    border: 1px solid var(--lmu-control-line);
    border-radius: 8px;
    background: var(--lmu-bg);
    color: var(--lmu-text);
    font: inherit;
    color-scheme: dark;
  }
  .day-hours-fields input[aria-invalid='true'] {
    border-color: var(--lmu-danger);
  }
  .day-hours :global(.lmu-field-error) {
    margin: 0;
  }
</style>
