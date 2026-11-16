<script lang="ts">
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import type { Task } from '$services/db';
  import { dayCounts } from '$services/inbox';
  import { dayLabel } from '$services/capture';
  import { dateKey } from '$services/rewardService';

  // "Escolher dia" (design P2): os próximos 7 dias com a contagem de cada um.
  let {
    tasks,
    title,
    text = 'Escolher dia ▾',
    onchoose,
  }: {
    tasks: Task[];
    /** Missão, para o nome acessível do menu. */
    title: string;
    text?: string;
    onchoose: (day: string) => void;
  } = $props();
  const uid = $props.id();
  const today = dateKey();
  const counts = $derived([...dayCounts(tasks, today).entries()]);
  let other = $state('');
</script>

<ContextMenu label={`Escolher dia para ${title}`} {text}>
  <div class="day-picker">
    {#each counts as [day, count] (day)}<button
        type="button"
        class="day-option"
        onclick={() => onchoose(day)}
        ><span>{dayLabel(day, today)}</span><small
          >{count === 0
            ? 'livre'
            : count === 1
              ? '1 item'
              : `${count} itens`}</small
        ></button
      >{/each}
    <div class="day-other">
      <label for={`${uid}-other`}>Outro dia</label>
      <input id={`${uid}-other`} type="date" min={today} bind:value={other} />
      <button
        type="button"
        class="day-option day-go"
        disabled={!other || other < today}
        onclick={() => onchoose(other)}>Levar</button
      >
    </div>
  </div>
</ContextMenu>

<style>
  .day-picker {
    display: grid;
    gap: 2px;
    min-width: 220px;
  }
  .day-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 6px 10px;
    border: 0;
    border-radius: 6px;
    background: none;
    color: var(--lmu-text, #eee9db);
    font: inherit;
    font-size: 0.92rem;
    text-align: left;
    cursor: pointer;
  }
  .day-option:hover,
  .day-option:focus-visible {
    background: var(--lmu-raised, #1d302d);
  }
  .day-option:focus-visible {
    outline: 2px solid var(--lmu-focus, #b8e5dc);
    outline-offset: -2px;
  }
  .day-option small {
    color: var(--lmu-muted, #a6b9a6);
    font-size: 0.8rem;
  }
  .day-other {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 8px 10px 4px;
    border-top: 1px solid var(--lmu-line, #3b5047);
    font-size: 0.85rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .day-other input {
    min-height: 40px;
    padding: 4px 8px;
    border: 1px solid var(--lmu-control-line, #70868b);
    border-radius: 6px;
    background: var(--lmu-bg, #071114);
    color: var(--lmu-text, #eee9db);
    color-scheme: dark;
  }
  .day-go {
    justify-content: center;
    min-width: 64px;
    border: 1px solid var(--lmu-control-line, #70868b);
  }
  .day-go:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
