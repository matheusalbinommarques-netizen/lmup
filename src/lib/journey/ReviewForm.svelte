<script lang="ts">
  import { untrack } from 'svelte';
  import type { Task } from '$services/db';
  import { configureReview } from '$services/reviewService';
  import { reviewDueDate } from '$services/reviewRules';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Field from '$lib/ui/Field.svelte';
  import Button from '$lib/ui/Button.svelte';
  let { open = $bindable(false), task }: { open?: boolean; task: Task } =
    $props();
  let enabled = $state(true),
    interval = $state('7'),
    due = $state(''),
    error = $state(''),
    busy = $state(false);
  $effect(() => {
    if (open)
      untrack(() => {
        enabled = true;
        interval = String(task.reviewIntervalDays ?? 7);
        due = task.reviewEnabled
          ? reviewDueDate(task)
          : task.completed
            ? addCalendarDays(dateKey(), Number(interval))
            : dateKey();
        error = '';
      });
  });
  async function save(event: SubmitEvent) {
    event.preventDefault();
    if (!task.id || busy) return;
    busy = true;
    error = '';
    try {
      await configureReview(task.id, {
        enabled,
        intervalDays: Number(interval),
        dueDate: due,
      });
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Suas escolhas continuam aqui.';
    } finally {
      busy = false;
    }
  }
</script>

<Dialog
  bind:open
  dismissible={!busy}
  title="Revisões desta missão"
  description="Cada prática vira uma sessão no histórico; a missão continua sendo uma só."
  ><form onsubmit={save} novalidate>
    <label class="journey-check"
      ><input type="checkbox" bind:checked={enabled} />Manter revisões ativas</label
    ><Field
      label="Intervalo entre revisões (dias)"
      type="number"
      min="1"
      max="365"
      bind:value={interval}
    /><Field label="Próxima revisão" type="date" bind:value={due} />
    <p class="lmu-hint">
      Você escolhe o intervalo. Após praticar, a próxima data será calculada a
      partir do dia da sessão. Uma revisão por missão pode receber recompensa
      por dia; não há penalidade por atraso.
    </p>
    <p class="lmu-hint">
      Desativar mantém as sessões anteriores. Desfazer uma sessão estorna seu
      recibo e restaura a data anterior.
    </p>
    {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
    <footer>
      <Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          open = false;
        }}>Cancelar</Button
      ><Button type="submit" loading={busy}>Salvar revisões</Button>
    </footer>
  </form></Dialog
>
