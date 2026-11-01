<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import {
    recordProgress,
    previewProgress,
    changeOccurrence,
    type ProgressInput,
  } from '$services/occurrenceService';
  import { fraction, progressTarget } from '$services/productivityRules';
  import type { Occurrence, Planning } from '$services/productivityTypes';
  import { justifyPause } from '$services/routineService';
  import { guardUpdates } from './guardUpdates';
  import Button from '$lib/ui/Button.svelte';
  import PlanningDetails from './PlanningDetails.svelte';
  let { id }: { id: string } = $props();
  let row = $state<Occurrence>();
  let error = $state(''),
    notice = $state('');
  let value = $state(0),
    minutes = $state<number | undefined>(),
    actual = $state(''),
    selected = $state<number[]>([]);
  let correction = $state(false),
    config = $state(false),
    planning = $state<Planning>({}),
    xp = $state(100);
  let preview = $state<Awaited<ReturnType<typeof previewProgress>>>();
  let saving = $state(false),
    date = $state(''),
    time = $state(''),
    reason = $state('');
  let payload: ProgressInput | undefined;
  let loaded = '';
  guardUpdates(() => saving || !!preview);
  $effect(() => {
    void value;
    void actual;
    void minutes;
    void selected;
    void correction;
    void planning;
    void xp;
    preview = undefined;
    payload = undefined;
  });
  function localNow() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  onMount(() => {
    const sub = liveQuery(() => db.occurrences.get(id)).subscribe({
      next: (next) => {
        row = next;
        if (next && loaded !== `${next.id}:${next.revision}`) {
          loaded = `${next.id}:${next.revision}`;
          value = next.value;
          selected = [...next.checkedSteps];
          actual = localNow();
          date = next.plannedDate;
          time = next.plannedTime ?? '';
          planning = { ...next };
          xp = next.baseXp;
        }
      },
      error: () => (error = 'Não foi possível abrir a ocorrência.'),
    });
    return () => sub.unsubscribe();
  });
  const target = $derived(row ? progressTarget(row) : 1);
  function input(): ProgressInput {
    if (!row) throw new Error('Reabra a ocorrência.');
    return {
      requestId: crypto.randomUUID(),
      occurrenceId: row.id,
      expectedRevision: row.revision,
      value,
      checkedSteps: [...selected],
      executedAt: new Date(actual).toISOString(),
      minutes: minutes ?? null,
      correction,
      configuration:
        correction && config
          ? { ...$state.snapshot(planning), baseXp: xp, steps: row.steps }
          : undefined,
    };
  }
  async function run(work: () => Promise<unknown>, message: string) {
    if (saving) return;
    saving = true;
    error = '';
    notice = '';
    try {
      await work();
      if (message) notice = message;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Seus dados foram preservados.';
    } finally {
      saving = false;
    }
  }
  async function prepare() {
    await run(async () => {
      payload = input();
      preview = await previewProgress(payload!);
    }, 'Confira os valores antes de confirmar.');
  }
  async function save() {
    await run(async () => {
      const receipt = await recordProgress(payload ?? input());
      preview = undefined;
      payload = undefined;
      if (receipt) {
        const gross = receipt.grossReward ?? receipt.reward;
        notice = `Bruto: ${gross.xp} XP, ${gross.gold} ouro, ${gross.food} comida. Compensado: ${receipt.compensation?.xp ?? 0} XP, ${receipt.compensation?.gold ?? 0} ouro, ${receipt.compensation?.food ?? 0} comida. Líquido: ${receipt.reward.xp} XP, ${receipt.reward.gold} ouro, ${receipt.reward.food} comida.`;
      }
    }, '');
  }
</script>

<section class="rpg-theme occurrence-execution rpg-frame">
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p role="status">{notice}</p>
  {#if row}
    <p class="lmu-eyebrow">
      Ocorrência de {row.originDate}{row.reconstructed
        ? ' · reconstruída manualmente'
        : ''}
    </p>
    <h2>{row.title}</h2>
    <p>
      Planejada: {row.plannedDate}
      {row.plannedTime ?? '· horário flexível'} · Início original: {row.originalTime ??
        'flexível'}
    </p>
    <progress
      max="100"
      value={Math.round(fraction(row) * 100)}
      aria-label="Progresso da ocorrência"
    ></progress>
    <p>
      {Math.round(fraction(row) * 100)}% · {row.status === 'completed'
        ? 'Concluída'
        : row.status === 'partial'
          ? 'Parcialmente realizada'
          : row.status === 'excused'
            ? 'Pausa justificada'
            : row.status === 'discarded'
              ? 'Fora do planejamento ativo'
              : 'Em planejamento'}
    </p>
    {#if !['excused', 'discarded'].includes(row.status)}
      <div class="execution-fields">
        {#if row.tracking?.method === 'steps'}
          <fieldset>
            <legend>Etapas realizadas</legend
            >{#each row.steps as step, index (index)}<label class="step"
                ><input
                  type="checkbox"
                  checked={selected.includes(index)}
                  onchange={(e) => {
                    selected = e.currentTarget.checked
                      ? [...selected, index]
                      : selected.filter((item) => item !== index);
                    value = selected.length;
                    preview = undefined;
                    payload = undefined;
                  }}
                />{step}</label
              >{/each}
          </fieldset>
        {:else if row.tracking?.method === 'direct' || !row.tracking}<label
            >Conclusão<select bind:value
              ><option value={0}>Pendente</option><option value={1}
                >Concluída</option
              ></select
            ></label
          >
        {:else}<label
            >{row.tracking.method === 'time'
              ? 'Minutos acumulados realizados'
              : row.tracking.method === 'quantity'
                ? `Quantidade acumulada (${row.tracking.unit ?? 'unidades'})`
                : 'Porcentagem realizada'}<input
              type="number"
              min="0"
              step="any"
              bind:value
            />
            <small
              >Meta: {target}{row.tracking.method === 'time'
                ? ' minutos'
                : ''}</small
            ></label
          >{/if}
        <label
          >Quando você executou<input
            type="datetime-local"
            bind:value={actual}
          /></label
        >
        {#if row.tracking?.method !== 'time'}<label
            >Minutos desta execução (opcional)<input
              type="number"
              min="0"
              step="any"
              bind:value={minutes}
            /></label
          >{/if}
      </div>
      <label class="step"
        ><input
          type="checkbox"
          bind:checked={correction}
          onchange={() => {
            preview = undefined;
            payload = undefined;
          }}
        />Corrigir registro anterior</label
      >
      {#if correction}<p class="lmu-hint">
          A correção preserva recursos já disponíveis e pode gerar débitos
          compensados por ganhos futuros.
        </p>
        <label class="step"
          ><input type="checkbox" bind:checked={config} />Corrigir também a
          configuração desta ocorrência</label
        >{#if config}<PlanningDetails bind:value={planning} /><label
            >XP-base desta ocorrência<input
              type="number"
              min="1"
              step="1"
              bind:value={xp}
            /></label
          >{/if}{/if}
      {#if preview}<div class="rpg-frame impact" role="status">
          <h3>Impacto da alteração</h3>
          <p>
            Diferença bruta: {preview.delta.xp} XP · {preview.delta.gold} ouro · {preview
              .delta.food} comida.
          </p>
          <p>
            Débito: {preview.debt.xp} XP · {preview.debt.gold} ouro · {preview
              .debt.food} comida.
          </p>
          <Button disabled={saving} onclick={save}>Confirmar registro</Button
          ><Button
            variant="quiet"
            onclick={() => {
              preview = undefined;
              payload = undefined;
            }}>Voltar</Button
          >
        </div>
      {:else}<div class="journey-actions">
          <Button disabled={saving} onclick={prepare}
            >{correction ? 'Revisar correção' : 'Registrar progresso'}</Button
          ><Button
            variant="secondary"
            disabled={saving}
            onclick={() =>
              run(
                () =>
                  changeOccurrence(
                    row!.id,
                    row!.revision,
                    { status: 'paused' },
                    crypto.randomUUID(),
                  ),
                'Progresso preservado. Você pode retomar depois.',
              )}>Pausar</Button
          >
        </div>{/if}
    {/if}
    <details>
      <summary>Reagendar e organizar</summary>
      <div class="execution-fields">
        <label>Nova data<input type="date" bind:value={date} /></label><label
          >Novo início desejado<input type="time" bind:value={time} /></label
        >
      </div>
      <Button
        variant="secondary"
        onclick={() =>
          run(
            () =>
              changeOccurrence(
                row!.id,
                row!.revision,
                { plannedDate: date, plannedTime: time || null },
                crypto.randomUUID(),
              ),
            'Ocorrência reagendada; origem preservada.',
          )}>Reagendar esta ocorrência</Button
      >
      {#if row.status === 'discarded'}<Button
          variant="quiet"
          onclick={() =>
            run(
              () =>
                changeOccurrence(
                  row!.id,
                  row!.revision,
                  { status: 'planned' },
                  crypto.randomUUID(),
                ),
              'Ocorrência restaurada.',
            )}>Restaurar</Button
        >{:else if row.value === 0 && row.status !== 'excused'}<Button
          variant="quiet"
          onclick={() =>
            run(
              () =>
                changeOccurrence(
                  row!.id,
                  row!.revision,
                  { status: 'discarded' },
                  crypto.randomUUID(),
                ),
              'Removida do planejamento ativo; histórico preservado.',
            )}>Descartar do planejamento ativo</Button
        ><label
          >Motivo da pausa justificada<input
            maxlength="500"
            bind:value={reason}
          /></label
        ><Button
          variant="quiet"
          onclick={() =>
            run(
              () => justifyPause([row!.id], reason, crypto.randomUUID()),
              'Pausa registrada sem recompensa.',
            )}>Justificar pausa</Button
        >{/if}
    </details>
    <a class="journey-link" href={'/missao/' + row.taskId}
      >Abrir definição da missão →</a
    >
  {:else}<p>Abrindo ocorrência…</p>{/if}
</section>

<style>
  .occurrence-execution {
    padding: 1.25rem;
    max-width: 900px;
    margin: 1rem auto;
    display: grid;
    gap: 0.85rem;
  }
  h2 {
    font: 500 1.8rem var(--lmu-display);
    color: #efd59c;
  }
  p {
    color: #c6cfbf;
  }
  progress {
    width: 100%;
    accent-color: #cfaa60;
  }
  .execution-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 1rem;
  }
  label {
    display: grid;
    gap: 0.35rem;
    color: #e3dbc9;
  }
  input,
  select {
    background: #17221f;
    color: #eee4cf;
    border: 1px solid #8d7147;
    border-radius: 0.4rem;
    padding: 0.6rem;
    max-width: 100%;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0.5rem 0;
  }
  .impact {
    padding: 1rem;
  }
  details {
    border-top: 1px solid #a27c4355;
    padding-top: 1rem;
  }
  summary {
    cursor: pointer;
    margin-bottom: 0.7rem;
  }
</style>
