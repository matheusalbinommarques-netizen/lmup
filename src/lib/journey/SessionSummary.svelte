<script lang="ts">
  import type { JourneySnapshot } from '$services/journeyQuery';
  import type {
    SavedMissionSession,
    Resources,
  } from '$services/productivityTypes';
  import { summarizeSession } from '$services/sessionSummary';
  let {
    session,
    data,
    compact = false,
  }: {
    session: SavedMissionSession;
    data: JourneySnapshot;
    compact?: boolean;
  } = $props();
  const summary = $derived(summarizeSession(session, data));
  const values = (value: Resources) =>
    `${value.xp} XP · ${value.gold} Ouro · ${value.food} Comida`;
</script>

<section class="session-economy" class:compact aria-label="Resumo da sessão">
  <div class="session-counts">
    <span>{summary.completed} concluídas</span><span
      >{summary.partial} parciais</span
    ><span>{summary.pending} pendentes</span>
  </div>
  <div class="session-totals">
    <div>
      <small>Recebido líquido nas atividades</small><strong
        >{values(summary.received)}</strong
      >
    </div>
    <div>
      <small>Direito restante na meta</small><span
        >{values(summary.remaining)}</span
      >
    </div>
  </div>
  <details>
    <summary>Detalhes das recompensas</summary>
    <dl>
      <dt>Recompensa prevista na meta</dt>
      <dd>{values(summary.atTarget)}</dd>
      <dt>Bruto registrado</dt>
      <dd>{values(summary.gross)}</dd>
      <dt>Compensações já aplicadas</dt>
      <dd>{values(summary.compensation)}</dd>
      <dt>Débitos de correções</dt>
      <dd>{values(summary.corrections)}</dd>
      <dt>Ouro bruto de marcos</dt>
      <dd>{summary.milestones} Ouro · incluído nos recibos das atividades</dd>
    </dl>
    {#if summary.extraTime}<p>
        Atividades de tempo podem conceder XP adicional acima da meta, dentro do
        limite econômico existente.
      </p>{/if}
    {#if summary.projectBonuses.length}<p>
        Bônus e correções dos projetos vinculados, apresentados separadamente e
        não somados ao recebido das atividades:
      </p>
      <ul>
        {#each summary.projectBonuses as event (event.id)}<li>
            {event.date} · {values(event.reward)}{event.reversedAt
              ? ' · corrigido'
              : ''}
          </li>{/each}
      </ul>{/if}
    <p>
      O restante considera o direito acumulado da ocorrência, antes das
      compensações. Encerrar a sessão não concede bônus.
    </p>
  </details>
</section>

<style>
  .session-economy {
    padding: 12px;
    border: 1px solid #8d744a55;
    border-radius: 8px;
    background: #0a1b1d;
    margin: 12px 0;
    color: #c0cbb8;
    font-size: 0.8rem;
  }
  .session-counts {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .session-totals {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .session-totals small,
  .session-totals strong,
  .session-totals span {
    display: block;
  }
  .session-totals strong {
    color: #edce85;
    font-size: 0.95rem;
  }
  .session-totals small {
    font-size: 0.75rem;
    margin-bottom: 4px;
  }
  details {
    margin-top: 10px;
  }
  summary {
    cursor: pointer;
    color: #e4c78d;
  }
  dl {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    font-size: 0.77rem;
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
  p,
  li {
    font-size: 0.75rem;
    line-height: 1.5;
  }
  .compact .session-totals strong {
    font-size: 0.85rem;
  }
</style>
