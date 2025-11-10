<!-- src/lib/SelfComparisonPanel.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db, type XpLog } from '$services/db';

  // Range do gráfico
  type ChartRange = '7d' | '30d' | '6m' | '1y';

  type ChartPoint = {
    label: string;
    value: number;
  };

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

  // Range selecionado
  let selectedRange = $state<ChartRange>('7d');

  const xpLogsQuery = liveQuery(() => db.xpLogs.toArray());

  onMount(() => {
    const sub = xpLogsQuery.subscribe((rows) => {
      xpLogs = rows ?? [];
    });

    return () => sub.unsubscribe();
  });

  // ---------- Helpers de data ----------

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  function parseDate(dateStr: string | undefined | null): Date | null {
    if (!dateStr) return null;
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function formatDayLabel(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  function formatMonthLabel(d: Date): string {
    const monthNames = [
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
    return monthNames[d.getMonth()];
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
    if (!logs || logs.length === 0) return [];

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
          .reduce((sum, log) => sum + (log.amount ?? 0), 0);

        result.push({ label, value });
      }

      return result;
    }

    // range mensal (6m / 1y)
    const monthsBack = range === '6m' ? 6 : 12;
    const result: ChartPoint[] = [];

    // "YYYY-MM" -> XP
    const monthMap: Record<string, number> = {};

    for (const log of logs) {
      const d = parseDate(log.date);
      if (!d) continue;
      const key = toMonthKey(d);
      const current = monthMap[key] ?? 0;
      monthMap[key] = current + (log.amount ?? 0);
    }

    const current = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const key = toMonthKey(d);
      const label = formatMonthLabel(d);
      const value = monthMap[key] ?? 0;
      result.push({ label, value });
    }

    return result;
  }

  // Pontos do gráfico para o range atual
  const points = $derived(buildPoints(xpLogs, selectedRange));

  // Maior valor para escalar as barras
  const maxValue = $derived(
    points.length
      ? points.reduce((max, p) => (p.value > max ? p.value : max), 0)
      : 0,
  );

  // Barras em coordenadas de SVG (0–100 x 0–100)
  const svgBars = $derived(
    (() => {
      if (!points.length) return [] as SvgBar[];

      const max = maxValue || 1;

      const chartWidth = 100;
      const chartHeight = 100;
      const paddingX = 4;
      const paddingTop = 4;
      const paddingBottom = 12;

      const innerWidth = chartWidth - paddingX * 2;
      const innerHeight = chartHeight - paddingTop - paddingBottom;

      const n = points.length;
      const step = innerWidth / n;
      const barWidth = step * 0.7;

      return points.map((p, i) => {
        const rawHeight = (p.value / max) * innerHeight;
        const height = Math.max(rawHeight, 1); // nunca 0, pra sempre aparecer

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
    (() => {
      if (!points.length) return 0;
      return Math.round(totalInRange / points.length);
    })(),
  );

  const bestPointLabel = $derived(
    (() => {
      if (!points.length) return '—';
      let best = points[0];
      for (const p of points) {
        if (p.value > best.value) best = p;
      }
      if (best.value === 0) return '—';
      return best.label;
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
        const dow = d.getDay();
        byWeekday[dow] += log.amount ?? 0;
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
      for (let i = 1; i < 7; i++) {
        if (byWeekday[i] > byWeekday[best]) best = i;
      }

      if (byWeekday[best] === 0) return '—';
      return labels[best];
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

  function rangeLabel(range: ChartRange): string {
    switch (range) {
      case '7d':
        return '7 dias';
      case '30d':
        return '30 dias';
      case '6m':
        return '6 meses';
      case '1y':
        return '1 ano';
    }
  }

  function isMonthlyRange(range: ChartRange): boolean {
    return range === '6m' || range === '1y';
  }

  // ---------- Helpers de label do eixo X ----------

  function shouldShowLabel(
    index: number,
    total: number,
    range: ChartRange,
  ): boolean {
    if (range === '7d') return true;
    if (range === '30d') {
      // tenta ~8 labels distribuídos
      const target = 8;
      const step = Math.max(1, Math.floor(total / target));
      return index % step === 0;
    }
    // ranges mensais: sempre mostra todos os meses
    return true;
  }

  function formatAxisLabel(label: string, range: ChartRange): string {
    // label diário vem como "dd/mm"
    if (range === '7d' || range === '30d') {
      return label.slice(0, 2); // só o dia
    }
    // mensal já vem "Jan", "Fev"...
    return label;
  }
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(15,23,42,0.7)]"
  >
    <!-- Cabeçalho (somente textos, centralizado) -->
    <header class="mb-4 text-center space-y-1">
      <p class="text-[1 rem] uppercase tracking-[0.22em] text-slate-400">
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
      <!-- 3 cards em cima -->
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
          class="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5"
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
          class="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5"
        >
          <p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
            Melhor {isMonthlyRange(selectedRange) ? 'mês' : 'dia'} do período
          </p>
          <p class="mt-1 text-sm font-semibold text-emerald-300">
            {bestPointLabel}
          </p>
          <p class="text-[0.7rem] text-slate-400">
            Quando você mais acumulou XP dentro deste recorte.
          </p>
        </div>
      </div>

      <!-- Filtros de range: logo abaixo dos 3 cards, alinhados lado a lado -->
      <div
        class="mb-4 flex flex-wrap items-center justify-center gap-2 text-[0.7rem]"
      >
        {#each ['7d', '30d', '6m', '1y'] as ChartRange[] as range (range)}
          <button
            type="button"
            onclick={() => (selectedRange = range)}
            class={`rounded-full px-3 py-1.5 border transition-colors ${
              selectedRange === range
                ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200'
            }`}
          >
            {rangeLabel(range)}
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
          <!-- linha de base -->
          <line
            x1="0"
            y1="84"
            x2="100"
            y2="84"
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

      <!-- Card "Dia da semana mais forte" embaixo do gráfico -->
      <div
        class="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-300"
      >
        <p class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
          Dia da semana mais forte
        </p>
        <p class="mt-1 text-sm font-semibold text-emerald-300">
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
