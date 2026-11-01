<script lang="ts">
  import type { Planning, ProgressMethod } from '$services/productivityTypes';
  let {
    value = $bindable<Planning>({}),
    legacy = false,
    calendarLocked = false,
  }: {
    value?: Planning;
    legacy?: boolean;
    calendarLocked?: boolean;
  } = $props();
  let method = $derived<ProgressMethod | ''>(value.tracking?.method ?? '');
</script>

<details>
  <summary>Horário, prioridade e acompanhamento</summary>
  <div class="planning-details">
    <label
      >Início desejado<input
        type="time"
        disabled={calendarLocked}
        value={value.plannedTime ?? ''}
        onchange={(e) =>
          (value = { ...value, plannedTime: e.currentTarget.value || null })}
      /></label
    >
    <label
      >Duração estimada (minutos)<input
        type="number"
        min="1"
        value={value.estimatedMinutes ?? ''}
        onchange={(e) =>
          (value = {
            ...value,
            estimatedMinutes: e.currentTarget.value
              ? Number(e.currentTarget.value)
              : null,
          })}
      /></label
    >
    <label
      >Prazo final opcional<input
        type="datetime-local"
        value={value.deadline ?? ''}
        onchange={(e) =>
          (value = { ...value, deadline: e.currentTarget.value || null })}
      /></label
    >
    <label
      >Importância<select
        value={value.importance ?? 'normal'}
        onchange={(e) =>
          (value = {
            ...value,
            importance: e.currentTarget.value as Planning['importance'],
          })}
        ><option value="low">Baixa</option><option value="normal">Normal</option
        ><option value="high">Alta</option></select
      ></label
    >
    <label
      >Acompanhar progresso por<select
        value={method}
        onchange={(e) => {
          const next = e.currentTarget.value as ProgressMethod | '';
          value = {
            ...value,
            tracking: next
              ? {
                  method: next,
                  target:
                    next === 'time' ? 40 : next === 'quantity' ? 20 : undefined,
                }
              : undefined,
          };
        }}
        ><option value=""
          >{legacy
            ? 'Manter comportamento anterior'
            : 'Conclusão simples ou passos cadastrados'}</option
        ><option value="direct">Conclusão direta</option><option value="time"
          >Tempo</option
        ><option value="quantity">Quantidade</option><option value="percentage"
          >Porcentagem</option
        ><option value="steps">Etapas</option></select
      ></label
    >
    {#if method === 'time' || method === 'quantity'}
      <label
        >{method === 'time'
          ? 'Meta de tempo recompensável (minutos)'
          : 'Quantidade da meta'}<input
          type="number"
          min="0.001"
          step="any"
          value={value.tracking?.target ?? ''}
          onchange={(e) =>
            (value = {
              ...value,
              tracking: {
                method: method as ProgressMethod,
                target: Number(e.currentTarget.value),
                unit: value.tracking?.unit,
              },
            })}
        /></label
      >
      {#if method === 'quantity'}<label
          >Unidade (páginas, exercícios…)<input
            maxlength="40"
            value={value.tracking?.unit ?? ''}
            onchange={(e) =>
              (value = {
                ...value,
                tracking: {
                  method: 'quantity',
                  target: value.tracking?.target,
                  unit: e.currentTarget.value,
                },
              })}
          /></label
        >{/if}
    {/if}
    <p class="lmu-hint">
      Importância orienta sugestões. Dificuldade define XP. A estimativa
      organiza a agenda; somente a meta de tempo define a recompensa por
      minutos.
    </p>
  </div>
</details>

<style>
  .planning-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 0.9rem;
    padding: 1rem 0;
  }
  label {
    display: grid;
    gap: 0.35rem;
    color: #d9d3c4;
    font-size: 0.9rem;
  }
  input,
  select {
    width: 100%;
    background: #17221f;
    color: #eee4cf;
    border: 1px solid #8d7147;
    border-radius: 0.4rem;
    padding: 0.6rem;
  }
  p {
    grid-column: 1/-1;
  }
</style>
