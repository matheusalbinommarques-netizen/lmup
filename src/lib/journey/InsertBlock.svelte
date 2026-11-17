<script lang="ts">
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import type { JourneySnapshot } from '$services/journeyQuery';
  import type { Occurrence } from '$services/productivityTypes';
  import { clock, dayTimeline, DEFAULT_MINUTES } from '$services/dayOrder';
  import { insertBlock } from '$services/routineBlocks';
  import { countLabel } from '$lib/plural';
  import { untrack } from 'svelte';

  // Design P3: brings a routine into today's Dia, only for today.
  let {
    open = $bindable(false),
    snapshot,
    today,
    now,
    dayList,
    afterId = null,
    oninserted,
  }: {
    open?: boolean;
    snapshot: JourneySnapshot;
    today: string;
    now: Date;
    /** The Dia in its single order (without the stalled group). */
    dayList: Occurrence[];
    /** Row chosen with "Inserir bloco depois desta". */
    afterId?: string | null;
    oninserted?: (message: string) => void;
  } = $props();

  const routines = $derived(
    snapshot.routines.filter(
      (routine) => routine.status === 'active' && routine.entries.length,
    ),
  );
  let routineId = $state(''),
    checked = $state<number[]>([]),
    where = $state<'after' | 'time' | 'end'>('end'),
    target = $state(''),
    time = $state(''),
    busy = $state(false),
    error = $state('');
  const pending = $derived(dayList.filter((row) => row.status !== 'completed'));
  const inDay = $derived(new Set(dayList.map((row) => row.taskId)));
  const routine = $derived(routines.find((row) => row.id === routineId));
  const items = $derived(
    (routine?.entries ?? []).map((entry) => {
      const task = snapshot.tasks.find((item) => item.id === entry.taskId);
      return {
        taskId: entry.taskId,
        title: task?.title ?? 'Missão',
        minutes: task?.estimatedMinutes || 0,
        present: inDay.has(entry.taskId),
      };
    }),
  );
  const chosen = $derived(
    items.filter((item) => !item.present && checked.includes(item.taskId)),
  );
  function pick(id: string) {
    routineId = id;
    const entries = routines.find((row) => row.id === id)?.entries ?? [];
    checked = entries
      .map((entry) => entry.taskId)
      .filter((taskId) => !inDay.has(taskId));
  }
  // Each opening starts from the routine that still has something to bring.
  $effect(() => {
    if (!open) return;
    untrack(reset);
  });
  function reset() {
    error = '';
    const first =
      routines.find((row) =>
        row.entries.some((entry) => !inDay.has(entry.taskId)),
      ) ?? routines[0];
    pick(first?.id ?? '');
    const after = afterId && pending.find((row) => row.id === afterId);
    target = after ? after.id : (pending.at(-1)?.id ?? '');
    where = after ? 'after' : 'end';
    time = '';
  }
  const slots = $derived(
    new Map(dayTimeline(dayList, now).slots.map((slot) => [slot.id, slot])),
  );
  // Position of the block in the Dia's order.
  const at = $derived.by(() => {
    if (where === 'after' && target)
      return dayList.findIndex((row) => row.id === target) + 1;
    if (where === 'time' && time) {
      const index = dayList.findIndex((row) => {
        const slot = slots.get(row.id);
        return (
          !!slot?.time &&
          (slot.kind === 'anchor' || slot.kind === 'computed') &&
          slot.time > time
        );
      });
      return index < 0 ? dayList.length : index;
    }
    return dayList.length;
  });
  const timeLabel = (row: Occurrence) => {
    const slot = slots.get(row.id);
    return slot?.time
      ? ` (${slot.kind === 'anchor' ? '' : '≈ '}${slot.time})`
      : '';
  };
  // The Dia with the block in place, to tell where it ends before saving.
  const preview = $derived.by(() => {
    if (!chosen.length || (where === 'time' && !time)) return '';
    const draft = chosen.map((item, index) => ({
      id: `draft:${item.taskId}`,
      plannedTime: where === 'time' && index === 0 ? time : null,
      status: 'planned' as const,
      value: 0,
      estimatedMinutes: item.minutes || null,
    }));
    const rows = [...dayList.slice(0, at), ...draft, ...dayList.slice(at)];
    const timeline = dayTimeline(rows, now);
    const first = timeline.slots.find((slot) => slot.id === draft[0].id);
    const last = timeline.slots.find((slot) => slot.id === draft.at(-1)!.id);
    if (!first?.time || !last?.time) return '';
    const lastItem = chosen.at(-1)!;
    const end = clock(
      Number(last.time.slice(0, 2)) * 60 +
        Number(last.time.slice(3, 5)) +
        (lastItem.minutes || DEFAULT_MINUTES),
    );
    const loose = chosen.filter((item) => !item.minutes).length;
    const nextAnchor = dayList
      .slice(at)
      .find((row) => row.plannedTime && row.status !== 'completed');
    const parts = [
      `Começa ${first.kind === 'anchor' ? 'às' : '≈'} ${first.time} e termina ≈ ${end}${
        loose
          ? ` se ${loose === 1 ? 'o item sem duração levar' : `os ${loose} itens sem duração levarem`} 15 min`
          : ''
      }.`,
    ];
    if (nextAnchor) {
      const over =
        Number(end.slice(0, 2)) * 60 +
        Number(end.slice(3, 5)) -
        (Number(nextAnchor.plannedTime!.slice(0, 2)) * 60 +
          Number(nextAnchor.plannedTime!.slice(3, 5)));
      parts.push(
        over > 0
          ? `Passa da hora de ${nextAnchor.title} (${nextAnchor.plannedTime}) em ${over} min.`
          : `Fica antes de ${nextAnchor.title} (${nextAnchor.plannedTime}).`,
      );
    }
    return parts.join(' ');
  });
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (busy || !routine || !chosen.length) return;
    if (where === 'time' && !time) {
      error = 'Escolha a hora do bloco.';
      return;
    }
    busy = true;
    error = '';
    try {
      const result = await insertBlock({
        routineId: routine.id,
        taskIds: chosen.map((item) => item.taskId),
        day: today,
        rows: dayList,
        at,
        time: where === 'time' ? time : null,
        requestId: crypto.randomUUID(),
      });
      const left = result.skipped.map(
        (item) => `${item.title} ficou de fora (${item.reason})`,
      );
      oninserted?.(
        [
          result.inserted.length
            ? `${routine.name} entrou no Dia: ${countLabel(result.inserted.length, 'item', 'itens')}, só hoje.`
            : `Nada de ${routine.name} entrou no Dia.`,
          ...left.map((line) => `${line}.`),
        ].join(' '),
      );
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível inserir o bloco. Seu Dia foi preservado.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog bind:open title="Inserir bloco" side>
  {#if !routines.length}<p class="lmu-muted">
      Nenhuma rotina ativa. Crie uma em Missões › Rotinas.
    </p>
    <a class="lmu-button lmu-button--secondary" href="/missoes?view=routines"
      >Abrir Rotinas</a
    >{:else}<form class="insert-block" onsubmit={submit}>
      <fieldset>
        <legend>Rotina</legend>
        {#each routines as row (row.id)}<label
            class="choice"
            class:on={row.id === routineId}
            ><input
              type="radio"
              name="routine"
              value={row.id}
              checked={row.id === routineId}
              data-initial-focus={row.id === routineId ? '' : undefined}
              onchange={() => pick(row.id)}
            /><span class="choice-name">{row.name}</span><small
              >{countLabel(row.entries.length, 'item', 'itens')}</small
            ></label
          >{/each}
      </fieldset>
      <fieldset>
        <legend>Itens (pode desmarcar só para hoje)</legend>
        {#each items as item (item.taskId)}<label class="item"
            ><input
              type="checkbox"
              disabled={item.present}
              checked={!item.present && checked.includes(item.taskId)}
              onchange={(event) =>
                (checked = event.currentTarget.checked
                  ? [...checked, item.taskId]
                  : checked.filter((id) => id !== item.taskId))}
            /><span class="item-title">{item.title}</span><small
              >{item.present
                ? 'já no Dia'
                : item.minutes
                  ? `${item.minutes} min`
                  : '15 min*'}</small
            ></label
          >{/each}
      </fieldset>
      <fieldset>
        <legend>Onde</legend>
        {#if pending.length}<label class="where"
            ><input
              type="radio"
              name="where"
              value="after"
              checked={where === 'after'}
              onchange={() => (where = 'after')}
            />Depois de
            <select
              aria-label="Depois de qual missão"
              bind:value={target}
              onfocus={() => (where = 'after')}
              >{#each pending as row (row.id)}<option value={row.id}
                  >{row.title}{timeLabel(row)}</option
                >{/each}</select
            ></label
          >{/if}
        <label class="where"
          ><input
            type="radio"
            name="where"
            value="time"
            checked={where === 'time'}
            onchange={() => (where = 'time')}
          />Em hora fixa
          <input
            type="time"
            aria-label="Hora do bloco"
            bind:value={time}
            onfocus={() => (where = 'time')}
          /></label
        >
        <label class="where"
          ><input
            type="radio"
            name="where"
            value="end"
            checked={where === 'end'}
            onchange={() => (where = 'end')}
          />No fim do dia</label
        >
      </fieldset>
      {#if preview}<p class="preview" role="status">{preview}</p>{/if}
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      <p class="lmu-hint">
        Vale só para hoje. A rotina e os dias dela continuam como estão.
      </p>
      <div class="actions">
        <Button type="submit" disabled={busy || !chosen.length}
          >{chosen.length
            ? `Inserir ${countLabel(chosen.length, 'item', 'itens')}`
            : 'Nada para inserir'}</Button
        ><Button variant="quiet" onclick={() => (open = false)}>Cancelar</Button
        >
      </div>
    </form>{/if}
</Dialog>

<style>
  .insert-block {
    display: grid;
    gap: 1.1rem;
  }
  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    display: grid;
    gap: 0.4rem;
    min-width: 0;
  }
  legend {
    margin-bottom: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--lmu-muted);
  }
  .choice {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 44px;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--lmu-line);
    border-radius: 8px;
  }
  .choice.on {
    border: 2px solid var(--lmu-action);
  }
  .choice-name,
  .item-title {
    flex: 1;
    min-width: 0;
    overflow-wrap: break-word;
  }
  .item,
  .where {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
  }
  .where select {
    flex: 1;
    min-width: 0;
    max-width: 100%;
  }
  small {
    color: var(--lmu-muted);
  }
  .preview {
    margin: 0;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--lmu-line);
    border-radius: 8px;
    font-size: 0.85rem;
  }
  .error {
    margin: 0;
    color: var(--lmu-danger);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
</style>
