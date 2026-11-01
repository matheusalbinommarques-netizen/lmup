<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import { plannedOccurrences } from '$services/occurrenceService';
  import { productivityReport } from '$services/productivityInsights';
  import Button from '$lib/ui/Button.svelte';
  let range = $state(30),
    report = $state<ReturnType<typeof productivityReport>>(),
    names = $state<Record<number, string>>({}),
    error = $state('');
  $effect(() => {
    const to = dateKey(),
      from = addCalendarDays(to, 1 - range);
    const sub = liveQuery(async () => {
      const stored = await db.occurrences.toArray(),
        schedule = await plannedOccurrences(from, to);
      const rows = [
        ...new Map(
          [...stored, ...schedule].map((row) => [row.id, row]),
        ).values(),
      ];
      return {
        report: productivityReport(
          rows,
          await db.executionRecords.toArray(),
          await db.productivityAudit.toArray(),
          await db.routines.toArray(),
          from,
          to,
        ),
        areas: await db.areas.toArray(),
      };
    }).subscribe({
      next: (data) => {
        report = data.report;
        names = {
          0: 'Geral',
          ...Object.fromEntries(
            data.areas.map((area) => [area.id!, area.nome]),
          ),
        };
      },
      error: () =>
        (error =
          'Não foi possível calcular os indicadores. Seus dados foram preservados.'),
    });
    return () => sub.unsubscribe();
  });
</script>

<section class="rpg-frame productivity-progress">
  <div class="heading">
    <div>
      <p class="lmu-eyebrow">Planejamento e realização</p>
      <h2>Sua evolução nas atividades</h2>
    </div>
    <div>
      <Button
        variant="secondary"
        aria-pressed={range === 7}
        onclick={() => (range = 7)}>7 dias</Button
      ><Button
        variant="secondary"
        aria-pressed={range === 30}
        onclick={() => (range = 30)}>30 dias</Button
      >
    </div>
  </div>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if report}<div class="metrics">
      <div>
        <strong
          >{report.completionRate === null
            ? '—'
            : report.completionRate + '%'}</strong
        ><span>Conclusão · {report.completed}/{report.expected} previstas</span>
      </div>
      <div>
        <strong>{Math.round(report.minutes)} min</strong><span
          >Tempo realizado registrado</span
        >
      </div>
      <div>
        <strong>{report.estimatedMinutes} min</strong><span
          >Tempo estimado no planejamento</span
        >
      </div>
      <div>
        <strong>{report.reschedules}</strong><span
          >Reagendamentos no período</span
        >
      </div>
    </div>
    <p>
      {report.recovered} recuperadas · {report.excused} pausas justificadas. Pausas
      não contam como execução. Tempo sem registro não é estimado como realizado.
    </p>
    <details>
      <summary>Distribuição por área e atividades negligenciadas</summary
      >{#each report.byArea as area (area.id)}<p>
          {names[area.id] ?? 'Área histórica'}: {area.completed}/{area.planned} concluídas
          · {Math.max(0, Math.round(area.minutes))} minutos{report.neglected.includes(
            area.id,
          )
            ? ' · baixo cumprimento recente'
            : ''}
        </p>{/each}
      <p class="lmu-hint">
        Baixo cumprimento exige ao menos três atividades previstas e menos da
        metade concluída; ausência de planejamento não é negligência.
      </p>
    </details>
    <details>
      <summary>Consistência das rotinas</summary
      >{#each report.routineProgress as routine (routine.id)}<p>
          <strong>{routine.name}</strong> · {routine.completion}% do progresso
          previsto · sequência de {routine.streak} dias de cumprimento integral.
        </p>{/each}{#if !report.routineProgress.length}<p>
          Configure uma rotina para acompanhar sua consistência.
        </p>{/if}
    </details>
    <details>
      <summary>Tendência semanal e horários</summary
      >{#each report.weekly as point (point.from)}<div class="trend">
          <span>{point.from}</span><progress
            max={Math.max(1, ...report.weekly.map((item) => item.completed))}
            value={point.completed}
            aria-label={'Conclusões na semana de ' + point.from}
          ></progress><span>{point.completed}</span>
        </div>{/each}
      {#if report.productiveHours.length > 1}<p>
          Maior avanço registrado: {report.productiveHours[0]}h. Menor avanço
          entre os horários com registros: {report.productiveHours.at(-1)}h.
        </p>
        <p class="lmu-hint">
          Comparação local baseada no avanço declarado, sem inferir
          disponibilidade ou medir desempenho fora do aplicativo.
        </p>{:else}<p>
          Ainda não há registros em horários distintos para comparação.
        </p>{/if}
    </details>
  {:else}<p>Calculando seu planejamento…</p>{/if}
</section>

<style>
  .productivity-progress {
    padding: 1.2rem;
    margin: 1rem 0;
  }
  .heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  .metrics > div {
    display: grid;
    gap: 0.4rem;
  }
  .metrics strong {
    font-size: 1.6rem;
    color: #e1be7c;
  }
  .metrics span,
  p {
    color: #bcc9b9;
    font-size: 0.9rem;
  }
  details {
    padding: 0.6rem 0;
    border-top: 1px solid #a27c4340;
  }
  summary {
    cursor: pointer;
  }
  .trend {
    display: flex;
    gap: 0.7rem;
    align-items: center;
    margin: 0.6rem 0;
  }
  progress {
    accent-color: #c8a463;
  }
</style>
