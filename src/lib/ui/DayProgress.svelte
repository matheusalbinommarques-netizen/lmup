<script lang="ts">
  let {
    completed,
    total,
    compact = false,
  }: { completed: number; total: number; compact?: boolean } = $props();
  const percentage = $derived(
    total ? Math.round((completed / total) * 100) : 0,
  );
</script>

<span class="day-progress" class:compact>
  <span
    class="day-ring"
    role="progressbar"
    aria-label="Missões concluídas"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={percentage}
    aria-valuetext={total
      ? `${completed} de ${total} missões concluídas`
      : 'Sem missões planejadas'}
    style:--progress={`${percentage}%`}
  >
    <strong>{percentage}%</strong>
  </span>
  <span
    >{total
      ? `${completed} de ${total} missões`
      : 'Sem missões planejadas'}</span
  >
</span>

<style>
  .day-progress {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
  }
  .compact {
    font-size: 0.78rem;
    gap: 6px;
  }
  .compact .day-ring {
    width: 64px;
    height: 64px;
  }
  .compact .day-ring::before {
    inset: 6px;
  }
  .compact strong {
    font-size: 1rem;
  }
  .day-ring {
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: conic-gradient(#f3bc43 var(--progress), #56605255 0);
    position: relative;
  }
  .day-ring::before {
    content: '';
    position: absolute;
    inset: 8px;
    background: #091619;
    border-radius: 50%;
  }
  strong {
    position: relative;
    font-size: 1.4rem;
    font-weight: 600;
    color: #f5efdd;
  }
</style>
