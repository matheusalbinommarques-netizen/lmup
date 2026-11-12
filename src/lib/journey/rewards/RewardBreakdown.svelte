<script lang="ts">
  import type { ActivityEvent } from '$services/db';
  import { explainReward } from '$services/rewardExplanation';

  let { event, open = false }: { event: ActivityEvent; open?: boolean } =
    $props();
  const account = $derived(explainReward(event));
  const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
</script>

{#if account}<details class="reward-why" {open}>
    <summary>Por que ganhei isso?</summary>
    <table>
      <caption class="visually-hidden">Conta da recompensa</caption>
      <thead
        ><tr
          ><th scope="col">Origem</th><th scope="col">XP</th><th scope="col"
            >Ouro</th
          ><th scope="col">Comida</th></tr
        ></thead
      >
      <tbody>
        {#each account.rows as row (row.label)}<tr>
            <th scope="row"
              >{row.label}{#if row.note}<small>{row.note}</small>{/if}</th
            >
            <td>{signed(row.xp)}</td><td>{signed(row.gold)}</td><td
              >{signed(row.food)}</td
            >
          </tr>{/each}
      </tbody>
      <tfoot
        ><tr
          ><th scope="row">Total recebido</th><td>{signed(account.total.xp)}</td
          ><td>{signed(account.total.gold)}</td><td
            >{signed(account.total.food)}</td
          ></tr
        ></tfoot
      >
    </table>
    {#if event.reversedAt}<p class="why-note">
        Este recibo foi corrigido depois; a conta mostra o que foi concedido na
        época.
      </p>{/if}
  </details>{/if}

<style>
  .reward-why {
    margin: 0.6rem 0;
    text-align: left;
    font-size: 0.85rem;
  }
  .reward-why summary {
    cursor: pointer;
    text-decoration: underline;
    color: inherit;
  }
  table {
    width: 100%;
    margin-top: 0.5rem;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.35rem 0.4rem;
    border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    vertical-align: top;
  }
  thead th,
  td {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  thead th:first-child,
  tbody th,
  tfoot th {
    text-align: left;
    font-weight: 500;
  }
  tbody th small {
    display: block;
    font-weight: 400;
    font-size: 0.75rem;
    opacity: 0.75;
    white-space: normal;
  }
  tfoot th,
  tfoot td {
    font-weight: 600;
    border-bottom: 0;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .why-note {
    margin: 0.4rem 0 0;
    font-size: 0.75rem;
    opacity: 0.8;
  }
</style>
