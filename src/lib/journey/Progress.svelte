<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { reportFor, ledgerLabels } from '$services/progressReport';
  import { dateKey } from '$services/rewardService';
  import { formatCalendar } from '$services/calendar';
  import { getLevelStateFromTotalXp, MAX_LEVEL } from '$services/progression';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    range = $state<'7' | '30' | 'all'>('7'),
    kind = $state(''),
    limit = $state(20),
    today = $state(dateKey());
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error =
          'Não foi possível ler seu histórico. Seus dados foram preservados.';
      },
    });
    const refresh = () => {
      today = dateKey();
    };
    const timer = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  });
  const report = $derived(
    data?.profile
      ? reportFor({ ...data, profile: data.profile }, range, today)
      : null,
  );
  const level = $derived(
    getLevelStateFromTotalXp(data?.profile?.totalXpEarned ?? 0),
  );
  const visible = $derived(
    report?.rows.filter((row) => !kind || row.kind === kind) ?? [],
  );
  const scale = $derived(
    Math.max(1, ...(report?.points.map((point) => Math.abs(point.xp)) ?? [])),
  );
  function signed(value: number) {
    return (value > 0 ? '+' : '') + value;
  }
</script>

<svelte:head><title>Meu progresso · Level Me Up</title></svelte:head>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">Um caminho que você pode conferir</p>
    <h1>Meu progresso</h1>
    <p>Missões, práticas e recompensas com os registros à vista.</p>
  </div>
  <a class="journey-link" href="/config">Configurações e backup →</a>
</header>
{#if error}<p role="alert">{error}</p>{:else if !data?.profile || !report}<p
    role="status"
  >
    Abrindo seu progresso…
  </p>{:else}
  <Card
    ><div class="progress-level">
      <div>
        <p class="lmu-eyebrow">Seu progresso acumulado</p>
        <h2>
          Nível {level.level}{level.level === MAX_LEVEL
            ? ' · limite atual'
            : ''}
        </h2>
        <p>
          {data.profile.totalXpEarned} XP acumulado{#if level.level < MAX_LEVEL}
            · {Math.max(0, level.xpForNext - level.xpIntoLevel)} XP até o próximo
            nível{/if}
        </p>
      </div>
      <a class="journey-link" href="/trofeus">Ver conquistas →</a>
    </div>
    <progress
      value={level.level === MAX_LEVEL ? 1 : level.xpIntoLevel}
      max={level.level === MAX_LEVEL ? 1 : level.xpForNext}
      aria-label="Progresso no nível"
    ></progress></Card
  >
  <div class="journey-filters" aria-label="Período do progresso">
    {#each [['7', '7 dias'], ['30', '30 dias'], ['all', 'Todo o histórico']] as [value, label] (value)}<Button
        variant="secondary"
        aria-pressed={range === value}
        onclick={() => {
          range = value as typeof range;
          limit = 20;
        }}>{label}</Button
      >{/each}
  </div>
  <div class="progress-metrics">
    <Card
      ><span class="lmu-muted">XP líquido no período</span><strong
        >{signed(report.net.xp)}</strong
      ></Card
    ><Card
      ><span class="lmu-muted">Missões distintas</span><strong
        >{report.distinctMissions}</strong
      ></Card
    ><Card
      ><span class="lmu-muted">Sessões de revisão válidas</span><strong
        >{report.reviews}</strong
      ></Card
    ><Card
      ><span class="lmu-muted">Bônus de projeto válidos</span><strong
        >{report.projects}</strong
      ></Card
    >
  </div>
  <p class="lmu-hint">
    Uma missão continua contando uma vez, mesmo quando tem várias práticas. {report.reversals}
    estornos registrados neste período. XP líquido inclui ganhos, ajustes e estornos
    nas datas em que foram registrados.
  </p>
  <div class="progress-charts">
    <Card
      ><h2>XP por dia</h2>
      <p class="lmu-hint">
        {range === 'all'
          ? 'Até 30 dias mais recentes com registros; os totais incluem todo o histórico.'
          : 'Dias sem movimento aparecem com zero. Estornos podem deixar o dia negativo.'}
      </p>
      {#if report.points.length}<ol
          class="progress-days"
          aria-label="XP líquido por dia"
        >
          {#each report.points as point (point.date)}<li>
              <span>{formatCalendar(point.date)}</span>
              <div class="progress-track" aria-hidden="true">
                <i
                  class:negative={point.xp < 0}
                  style:width={(Math.abs(point.xp) / scale) * 48 + '%'}
                  style:left={point.xp < 0
                    ? 50 - (Math.abs(point.xp) / scale) * 48 + '%'
                    : '50%'}
                ></i>
              </div>
              <strong>{signed(point.xp)} XP</strong>
            </li>{/each}
        </ol>{:else}<p class="lmu-muted">
          Ainda não há movimentos de XP com registro detalhado.
        </p>{/if}</Card
    >
    <Card
      ><h2>XP por área</h2>
      <p class="lmu-hint">
        Saldo líquido dos recibos no período. Bônus sem área ficam em Geral.
      </p>
      <ul class="lmu-list progress-areas">
        {#each report.byArea as area (area.id)}<li>
            <span>{area.name}</span><strong>{signed(area.xp)} XP</strong>
          </li>{/each}
      </ul>
      {#if !report.byArea.length}<p class="lmu-muted">
          Nenhum recibo com XP neste período.
        </p>{/if}</Card
    >
  </div>
  <section class="journey-stack">
    <div>
      <p class="lmu-eyebrow">Entenda seus recursos</p>
      <h2>Como o saldo atual se compõe</h2>
      <p class="lmu-hint">
        Esta composição usa todo o histórico disponível. A diferença anterior ou
        sem registro é calculada para conciliar com o saldo atual; ela não
        reconstrói transações antigas.
      </p>
    </div>
    <div class="progress-balance-grid">
      {#each [['xp', 'XP', data.profile.totalXpEarned], ['gold', 'Gold', data.profile.gold], ['food', 'Comida', data.profile.food ?? 0]] as [key, label, current] (key)}<Card
          ><h3>{label}</h3>
          <p>
            Anterior ou sem registro: {signed(
              report.unrecorded[key as 'xp' | 'gold' | 'food'],
            )}
          </p>
          <p>
            Movimento registrado: {signed(
              report.recorded[key as 'xp' | 'gold' | 'food'],
            )}
          </p>
          <p class="journey-status">Saldo atual: {current}</p></Card
        >{/each}
    </div>
    {#if report.legacyLogs || report.unknownPrices}<p class="journey-banner">
        {report.legacyLogs} registros antigos de XP sem recibo vinculado e {report.unknownPrices}
        compras sem preço registrado. Esses valores não são transformados em novos
        eventos.
      </p>{/if}
  </section>
  <section class="journey-stack">
    <div class="journey-section-heading">
      <h2>Histórico de movimentos</h2>
      <div class="lmu-field">
        <label for="movement-kind">Mostrar</label><select
          id="movement-kind"
          bind:value={kind}
          onchange={() => {
            limit = 20;
          }}
          ><option value="">Todos os movimentos</option
          >{#each Object.entries(ledgerLabels) as [value, label] (value)}<option
              {value}>{label}</option
            >{/each}</select
        >
      </div>
    </div>
    <p class="lmu-hint">
      Datas de missões preservam o dia registrado. Compras e cuidados usam o
      fuso deste navegador. Os nomes exibidos são os nomes atuais das missões e
      projetos.
    </p>
    <Card
      >{#if visible.length}<ol class="lmu-list progress-ledger">
          {#each visible.slice(0, limit) as row (row.id)}<li>
              <div>
                <p class="lmu-eyebrow">
                  {ledgerLabels[row.kind]} · {formatCalendar(row.date)}
                </p>
                <h3>{row.title}</h3>
                {#if row.reversed}<p class="lmu-hint">
                    Este recibo foi estornado. O movimento de estorno aparece
                    separadamente.
                  </p>{/if}
              </div>
              <p
                class="progress-receipt"
                class:progress-debit={row.xp < 0 ||
                  row.gold < 0 ||
                  row.food < 0}
              >
                {signed(row.xp)} XP · {row.unknownCost
                  ? 'Gold sem valor registrado'
                  : signed(row.gold) + ' Gold'} · {signed(row.food)} Comida
              </p>
              {#if row.event}<details>
                  <summary>Ver recibo</summary>
                  <p>
                    XP base: {row.event.baseXp}. Multiplicadores registrados: XP {row.event.modifiers.xpMultiplier.toFixed(
                      2,
                    )} · Gold {row.event.modifiers.goldMultiplier.toFixed(2)} · Comida
                    {row.event.modifiers.foodMultiplier.toFixed(2)}.
                  </p>
                  {#if row.event.taskId}<a
                      class="journey-link"
                      href={'/missao/' + row.event.taskId}>Abrir missão →</a
                    >{/if}
                </details>{/if}
            </li>{/each}
        </ol>{:else}<div class="journey-empty">
          <h3>Nenhum movimento nesta seleção.</h3>
          <p class="lmu-muted">
            Os dados antigos permanecem preservados. Escolha outro período ou
            registre seu próximo passo.
          </p>
          <a class="journey-link" href="/">Voltar para hoje →</a>
        </div>{/if}</Card
    >{#if visible.length > limit}<Button
        variant="secondary"
        onclick={() => {
          limit += 20;
        }}>Mostrar mais movimentos</Button
      >{/if}
  </section>{/if}
