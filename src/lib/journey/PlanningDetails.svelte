<script lang="ts">
  import { timeEntry } from '$lib/ui/timeEntry';
  import type { Planning, ProgressMethod } from '$services/productivityTypes';
  let {
    value = $bindable<Planning>({}),
    legacy = false,
    calendarLocked = false,
    section = 'all',
    stepCount = 0,
    onEditSteps,
  }: {
    value?: Planning;
    legacy?: boolean;
    calendarLocked?: boolean;
    section?: 'all' | 'planning' | 'tracking';
    stepCount?: number;
    onEditSteps?: () => void;
  } = $props();
  let method = $derived<ProgressMethod | ''>(value.tracking?.method ?? '');
  const mode = $derived(
    method === 'steps' || (!method && stepCount > 0)
      ? 'steps'
      : ['time', 'quantity', 'percentage'].includes(method)
        ? 'measure'
        : 'direct',
  );
  function choose(next: ProgressMethod) {
    if (next === method) return;
    value = {
      ...value,
      tracking: {
        method: next,
        ...(next === 'time'
          ? { target: 40 }
          : next === 'quantity'
            ? { target: 20 }
            : {}),
      },
    };
  }
</script>

{#snippet fields()}
  <div class="planning-details">
    {#if section !== 'tracking'}<label
        >Início desejado<input
          type="text"
          inputmode="numeric"
          use:timeEntry
          maxlength="5"
          pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
          placeholder="HH:mm"
          disabled={calendarLocked}
          value={value.plannedTime ?? ''}
          onchange={(e) =>
            (value = { ...value, plannedTime: e.currentTarget.value || null })}
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
          ><option value="low">Baixa</option><option value="normal"
            >Normal</option
          ><option value="high">Alta</option></select
        ></label
      >
    {/if}
    {#if section !== 'planning'}
      {#if section === 'tracking'}
        <fieldset class="tracking-choice">
          <legend>Como quer acompanhar?</legend>
          <label class:chosen={mode === 'direct'}
            ><input
              type="radio"
              name="tracking-mode"
              checked={mode === 'direct'}
              onchange={() => choose('direct')}
            /><span
              ><strong>Concluir de uma vez</strong><small
                >Marque quando terminar.</small
              ></span
            ></label
          >
          <label class:chosen={mode === 'steps'}
            ><input
              type="radio"
              name="tracking-mode"
              checked={mode === 'steps'}
              onchange={() => choose('steps')}
            /><span
              ><strong>Concluir por passos</strong><small
                >Acompanhe cada ação da missão.</small
              ></span
            ></label
          >
          <label class:chosen={mode === 'measure'}
            ><input
              type="radio"
              name="tracking-mode"
              checked={mode === 'measure'}
              onchange={() => choose('time')}
            /><span
              ><strong>Medir progresso</strong><small
                >Registre tempo, quantidade ou porcentagem.</small
              ></span
            ></label
          >
        </fieldset>
        {#if mode === 'measure'}<label
            >O que medir?<select
              value={method}
              onchange={(event) =>
                choose(event.currentTarget.value as ProgressMethod)}
              ><option value="time">Tempo</option><option value="quantity"
                >Quantidade</option
              ><option value="percentage">Porcentagem</option></select
            ></label
          >{/if}
        {#if mode === 'steps'}<p class="lmu-hint">
            {stepCount
              ? `${stepCount} passos cadastrados.`
              : 'Adicione os passos para usar este acompanhamento.'}
            <button type="button" class="steps-link" onclick={onEditSteps}
              >Organizar passos</button
            >
          </p>{/if}
        {#if legacy && !method}<p class="lmu-hint">
            O acompanhamento anterior será mantido até você escolher outro.
          </p>{/if}
      {:else}
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
                        next === 'time'
                          ? 40
                          : next === 'quantity'
                            ? 20
                            : undefined,
                    }
                  : undefined,
              };
            }}
            ><option value=""
              >{legacy
                ? 'Manter comportamento anterior'
                : 'Conclusão simples ou passos cadastrados'}</option
            ><option value="direct">Conclusão direta</option><option
              value="time">Tempo</option
            ><option value="quantity">Quantidade</option><option
              value="percentage">Porcentagem</option
            ><option value="steps">Etapas</option></select
          ></label
        >
      {/if}
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
    {/if}
    <p class="lmu-hint">
      Importância orienta sugestões. Dificuldade define XP. A estimativa
      organiza a agenda; somente a meta de tempo define a recompensa por
      minutos.
    </p>
  </div>
{/snippet}
{#if section === 'all'}<details>
    <summary>Horário, prioridade e acompanhamento</summary>{@render fields()}
  </details>{:else}{@render fields()}{/if}

<style>
  .tracking-choice {
    grid-column: 1/-1;
    border: 0;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .tracking-choice legend {
    margin-bottom: 10px;
    color: #edcf91;
  }
  .tracking-choice label {
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #7e704754;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    background: #07191b;
  }
  .tracking-choice label.chosen {
    border-color: #d1a74b;
    background: #9c79321e;
  }
  .tracking-choice input {
    width: 18px;
    height: 18px;
    accent-color: #e0b45b;
    flex-shrink: 0;
  }
  .tracking-choice strong,
  .tracking-choice small {
    display: block;
  }
  .tracking-choice small {
    color: #aebfae;
    font-size: 0.77rem;
    margin-top: 3px;
  }
  .steps-link {
    background: none;
    border: 0;
    color: #edcf91;
    text-decoration: underline;
    padding: 8px;
    cursor: pointer;
  }

  .planning-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 185px), 1fr));
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
