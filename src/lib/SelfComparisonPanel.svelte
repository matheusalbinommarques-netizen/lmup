<!-- src/lib/SelfComparisonPanel.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type XpLog } from '$services/db';
  import {
    subscribeRange,
    setCurrentRange,
    getCurrentRange,
    type ChartRange,
  } from '$services/xpRangeService';

  // range compartilhado com o donut
  const RANGES: ChartRange[] = ['7d', '30d', '6m', '1y'];

  type ChartPoint = { label: string; value: number };
  type SvgBar = {
    label: string;
    value: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Histórico de XP vindo do Dexie
  let xpLogs = $state<XpLog[]>([]);

  // Range selecionado (global)
  let selectedRange = $state<ChartRange>(getCurrentRange());

  const xpLogsQuery = liveQuery(() => db.xpLogs.toArray());

  onMount(() => {
    const sub = xpLogsQuery.subscribe((rows) => {
      xpLogs = rows ?? [];
    });

    const unsubRange = subscribeRange((range) => {
      selectedRange = range;
    });

    return () => {
      sub.unsubscribe();
      unsubRange();
    };
  });

  // ---------- Helpers de data ----------
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  function parseDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = Number(yStr),
      m = Number(mStr),
      d = Number(dStr);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function formatDayLabel(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  function monthShort(d: Date): string {
    const M = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return M[d.getMonth()];
  }

  function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function toMonthKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // ---------- Construção dos pontos do gráfico ----------
  function buildPoints(logs: XpLog[], range: ChartRange): ChartPoint[] {
    if (!logs?.length) return [];
    const today = new Date();

    if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      const result: ChartPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * MS_PER_DAY);
        const key = toDateKey(d);
        const label = formatDayLabel(d);
        const value = logs
          .filter((log) => log.date === key)
          .reduce((s, log) => s + (log.amount ?? 0), 0);
        result.push({ label, value });
      }
      return result;
    }

    // mensal (6m / 1y)
    const monthsBack = range === '6m' ? 6 : 12;
    const result: ChartPoint[] = [];
    const monthMap: Record<string, number> = {};

    for (const log of logs) {
      const d = parseDate(log.date);
      if (!d) continue;
      const key = toMonthKey(d);
      monthMap[key] = (monthMap[key] ?? 0) + (log.amount ?? 0);
    }

    const firstDayThisMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(
        firstDayThisMonth.getFullYear(),
        firstDayThisMonth.getMonth() - i,
        1,
      );
      const key = toMonthKey(d);
      result.push({ label: monthShort(d), value: monthMap[key] ?? 0 });
    }
    return result;
  }

  // Pontos do gráfico para o range atual
  const points = $derived(buildPoints(xpLogs, selectedRange));

  // Maior valor para escalar as barras
  const maxValue = $derived(
    points.length ? points.reduce((m, p) => (p.value > m ? p.value : m), 0) : 0,
  );

  // Barras em coordenadas de SVG (0–100 x 0–100)
  const svgBars = $derived(
    (() => {
      if (!points.length) return [] as SvgBar[];

      const max = maxValue || 1;
      const chartWidth = 100,
        chartHeight = 100;
      const paddingX = 4,
        paddingTop = 4,
        paddingBottom = 12;

      const innerWidth = chartWidth - paddingX * 2;
      const innerHeight = chartHeight - paddingTop - paddingBottom;

      const n = points.length;
      const step = innerWidth / n;
      const barWidth = step * 0.7;

      return points.map((p, i) => {
        const rawHeight = (p.value / max) * innerHeight;
        const height = Math.max(rawHeight, 1);
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = chartHeight - paddingBottom - height;
        return {
          label: p.label,
          value: p.value,
          x,
          y,
          width: barWidth,
          height,
        } as SvgBar;
      });
    })(),
  );

  const hasData = $derived(points.some((p) => p.value !== 0));
  const totalInRange = $derived(points.reduce((sum, p) => sum + p.value, 0));
  const averageValue = $derived(
    points.length ? Math.round(totalInRange / points.length) : 0,
  );

  const bestPointLabel = $derived(
    (() => {
      if (!points.length) return '—';
      let best = points[0];
      for (const p of points) if (p.value > best.value) best = p;
      return best.value === 0 ? '—' : best.label;
    })(),
  );

  // Dia da semana mais produtivo (baseado em todos os logs)
  const bestWeekdayLabel = $derived(
    (() => {
      if (!xpLogs.length) return '—';
      const byWeekday = [0, 0, 0, 0, 0, 0, 0]; // domingo..sábado
      for (const log of xpLogs) {
        const d = parseDate(log.date);
        if (!d) continue;
        byWeekday[d.getDay()] += log.amount ?? 0;
      }
      const labels = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      let best = 0;
      for (let i = 1; i < 7; i++) if (byWeekday[i] > byWeekday[best]) best = i;
      return byWeekday[best] === 0 ? '—' : labels[best];
    })(),
  );

  const headerTitle = $derived(
    (() => {
      switch (selectedRange) {
        case '7d':
          return 'XP diário — últimos 7 dias';
        case '30d':
          return 'XP diário — últimos 30 dias';
        case '6m':
          return 'XP mensal — últimos 6 meses';
        case '1y':
          return 'XP mensal — últimos 12 meses';
      }
    })(),
  );

  const unitLabel = $derived(
    selectedRange === '6m' || selectedRange === '1y' ? 'mês' : 'dia',
  );

  // ---------- Helpers de labels do eixo X ----------
  function shouldShowLabel(
    index: number,
    total: number,
    range: ChartRange,
  ): boolean {
    if (range === '7d') return true;
    if (range === '30d') {
      const target = 8;
      const step = Math.max(1, Math.floor(total / target));
      return index % step === 0;
    }
    return true; // mensal: mostra todos
  }

  function formatAxisLabel(label: string, range: ChartRange): string {
    if (range === '7d' || range === '30d') return label.slice(0, 2); // exibe só o dia
    return label; // mensal já é "Jan", "Fev"...
  }
</script>

<section
  class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
>
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(15,23,42,0.7)]"
  >
    <!-- Cabeçalho -->
    <header class="mb-4 text-center space-y-1">
      <p class="text-[1rem] uppercase tracking-[0.22em] text-slate-400">
        Comparação pessoal
      </p>
      <h3 class="text-base font-semibold text-slate-100 md:text-lg">
        {headerTitle}
      </h3>
      <p class="text-[0.7rem] text-slate-500">
        Gráfico atualizado em tempo real conforme você ganha XP.
      </p>
    </header>

    {#if hasData}
      <!-- 3 cards -->
      <div class="mb-4 grid gap-3 text-xs text-slate-300 md:grid-cols-3">
        <div
          class="rounded-2xl border border-emerald-500/70 bg-emerald-950/40 px-3 py-2.5 shadow-[0_0_18px_rgba(16,185,129,0.45)]"
        >
          <p
            class="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200/80"
          >
            Total no período
          </p>
          <p class="mt-1 text-lg font-semibold text-emerald-100">
            {totalInRange} XP
          </p>
          <p class="text-[0.7rem] text-emerald-200/80">
            Somando tudo que você fez em cada {unitLabel}.
          </p>
        </div>

        <div
          class="rounded-2xl border border-yellow-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
        >
          <p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
            Média por {unitLabel}
          </p>
          <p class="mt-1 text-lg font-semibold text-slate-100">
            {averageValue} XP
          </p>
          <p class="text-[0.7rem] text-slate-400">
            Se mantiver esse ritmo, seu crescimento continua estável.
          </p>
        </div>

        <div
          class="rounded-2xl border border-blue-300/60 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
        >
          <p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
            Melhor {selectedRange === '6m' || selectedRange === '1y'
              ? 'mês'
              : 'dia'} do período
          </p>
          <p class="mt-1 text-sm font-semibold text-emerald-300">
            {bestPointLabel}
          </p>
          <p class="text-[0.7rem] text-slate-400">
            Quando você mais acumulou XP dentro deste recorte.
          </p>
        </div>
      </div>

      <!-- Filtros de range -->
      <div
        class="mb-4 flex flex-wrap items-center justify-center gap-2 text-[0.7rem]"
      >
        {#each RANGES as range (range)}
          <button
            type="button"
            onclick={() => setCurrentRange(range)}
            class={`rounded-full px-3 py-1.5 border transition-colors ${
              selectedRange === range
                ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'
            }`}
          >
            {range === '7d'
              ? '7 dias'
              : range === '30d'
                ? '30 dias'
                : range === '6m'
                  ? '6 meses'
                  : '1 ano'}
          </button>
        {/each}
      </div>

      <!-- Gráfico de barras em SVG -->
      <div
        class="mb-4 rounded-2xl border border-slate-800 bg-slate-950/90 px-3 py-3"
      >
        <svg
          viewBox="0 0 100 100"
          class="h-52 w-full"
          role="img"
          aria-label="XP por {unitLabel}"
        >
          <!-- linha de base (y = 100 - paddingBottom = 88) -->
          <line
            x1="0"
            y1="88"
            x2="100"
            y2="88"
            stroke="rgba(148,163,184,0.6)"
            stroke-width="0.5"
          />

          {#each svgBars as bar, index (bar.label)}
            <!-- barra -->
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx="1.5"
              fill="#22c55e"
            >
              <title>{bar.label}: {bar.value} XP</title>
            </rect>

            {#if shouldShowLabel(index, svgBars.length, selectedRange)}
              <text
                x={bar.x + bar.width / 2}
                y="96"
                font-size="4.2"
                fill="rgba(148,163,184,0.9)"
                text-anchor="middle"
              >
                {formatAxisLabel(bar.label, selectedRange)}
              </text>
            {/if}
          {/each}
        </svg>
      </div>

      <!-- Dia da semana mais forte -->
      <div
        class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
      >
        <p
          class="text-center text-[0.65rem] uppercase tracking-[0.18em] text-green-300/80"
        >
          Dia da semana mais forte
        </p>
        <p class="text-center text-lg font-semibold text-emerald-300">
          {bestWeekdayLabel}
        </p>
        <p class="text-[0.7rem] text-slate-400">
          Considerando todo o histórico, é quando você tende a render mais.
        </p>
      </div>
    {:else}
      <p class="text-sm text-slate-400">
        Complete algumas missões a partir de agora para que o painel comece a
        registrar seu XP diário e mensal. Assim que você ganhar XP, o gráfico
        será atualizado automaticamente.
      </p>
    {/if}
  </div>
</section>
