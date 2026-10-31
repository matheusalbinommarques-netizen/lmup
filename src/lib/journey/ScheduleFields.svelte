<script lang="ts">
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import { WEEKDAYS } from '$services/recurrence';
  import Button from '$lib/ui/Button.svelte';
  let {
    plannedDate = $bindable(''),
    kind = $bindable('none'),
    days = $bindable<number[]>([1]),
    review = false,
  }: {
    plannedDate?: string;
    kind?: string;
    days?: number[];
    review?: boolean;
  } = $props();
  let other = $state(false);
  const today = dateKey();
  const tomorrow = addCalendarDays(today, 1);
</script>

<fieldset class="schedule-fields">
  <legend>Planejamento</legend>
  <div class="date-presets">
    {#each [{ label: 'Hoje', value: today }, { label: 'Amanhã', value: tomorrow }, { label: 'Sem data', value: '' }] as option (option.label)}
      <Button
        variant="secondary"
        aria-pressed={!other && plannedDate === option.value}
        onclick={() => {
          plannedDate = option.value;
          other = false;
        }}>{option.label}</Button
      >
    {/each}
    <Button
      variant="secondary"
      aria-pressed={other}
      onclick={() => (other = true)}>Outra data</Button
    >
  </div>
  {#if other || (plannedDate && plannedDate !== today && plannedDate !== tomorrow)}<label
      class="journey-label lmu-field"
      >Data planejada<input type="date" bind:value={plannedDate} /></label
    >{/if}
  <label class="journey-label"
    >Recorrência<select
      bind:value={kind}
      disabled={review}
      onchange={(event) => {
        if (event.currentTarget.value === 'weekly') days = [days[0] ?? 1];
      }}
      ><option value="none">Sem repetição</option><option value="daily"
        >Diariamente</option
      ><option value="weekdays">Dias específicos da semana</option><option
        value="weekly">Semanalmente</option
      ></select
    ></label
  >
  {#if kind === 'weekdays'}<div
      class="weekday-picker"
      role="group"
      aria-label="Dias da rotina"
    >
      {#each WEEKDAYS as day (day.value)}<label
          ><input
            type="checkbox"
            aria-label={day.label}
            checked={days.includes(day.value)}
            onchange={(event) =>
              (days = event.currentTarget.checked
                ? [...days, day.value]
                : days.filter((item) => item !== day.value))}
          /><span>{day.short}</span><span class="sr-only">{day.label}</span
          ></label
        >{/each}
    </div>{:else if kind === 'weekly'}<label class="journey-label"
      >Dia da semana<select
        value={days[0] ?? 1}
        onchange={(event) => (days = [Number(event.currentTarget.value)])}
        >{#each WEEKDAYS as day (day.value)}<option value={day.value}
            >{day.label}</option
          >{/each}</select
      ></label
    >{/if}
  {#if kind !== 'none'}<p class="lmu-hint">
      Repetir a partir de {plannedDate
        ? `em ${plannedDate.split('-').reverse().join('/')}`
        : 'hoje'}. Cada dia previsto tem uma única recompensa. Dias não
      realizados não acumulam pendências.
    </p>{/if}
  {#if review}<p class="lmu-hint">
      Esta missão usa revisão espaçada. Desative a revisão para transformá-la em
      rotina; o histórico será preservado.
    </p>{/if}
</fieldset>

<style>
  .schedule-fields {
    border: 0;
    padding: 0;
    margin: 0.2rem 0;
    display: grid;
    gap: 0.65rem;
  }
  legend {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .date-presets {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.35rem;
  }
  .date-presets :global(button) {
    min-width: 0;
    padding: 0.55rem 0.35rem;
    font-size: 0.8rem;
  }
  .date-presets :global(button[aria-pressed='true']) {
    border-color: #d0a451;
    color: #ffe0a0;
    background: linear-gradient(180deg, #644b28, #31291d);
  }
  .weekday-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .weekday-picker label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem;
    border: 1px solid #a27c4366;
    border-radius: 0.35rem;
    cursor: pointer;
  }
  .weekday-picker label:has(input:checked) {
    color: #ffe0a0;
    background: #9c762c33;
    border-color: #d0a451;
  }
  .lmu-hint {
    margin: 0;
  }
  @media (max-width: 360px) {
    .date-presets {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
