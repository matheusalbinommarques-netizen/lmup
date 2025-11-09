<!-- src/lib/SelfComparisonPanel.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { liveQuery } from 'dexie';
  import { db, type XpLog } from '$services/db';

  // Range do gráfico
  type ChartRange = '7d' | '30d' | '6m' | '1y';

  // Ponto no gráfico
  type ChartPoint = {
    label: string; // Ex: "10/11" ou "Nov"
    value: number; // XP somado naquele dia/mês
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

    // Mapa de XP por "YYYY-MM"
    const mapMonthToXp = new SvelteMap<string, number>();
    for (const log of logs) {
      const d = parseDate(log.date);
      if (!d) continue;
      const key = toMonthKey(d);
      const current = mapMonthToXp.get(key) ?? 0;
      mapMonthToXp.set(key, current + (log.amount ?? 0));
    }

    // Gera últimos N meses
    const current = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const key = toMonthKey(d);
      const label = formatMonthLabel(d);
      const value = mapMonthToXp.get(key) ?? 0;
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
        'domingo',
        'segunda',
        'terça',
        'quarta',
        'quinta',
        'sexta',
        'sábado',
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
</script>

<section class="w-full">
  <div
    class="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-950/85 px-4 py-4 md:px-6 md:py-5 shadow-[0_0_30px_rgba(15,23,42,0.7)]"
  >
    <!-- Cabeçalho + botões de range -->
    <header
      class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.22em] text-slate-400">
          Comparação pessoal
        </p>
        <h3 class="text-base font-semibold text-slate-100 md:text-lg">
          {headerTitle}
        </h3>
        <p class="text-[0.7rem] text-slate-500">
          Gráfico atualizado em tempo real conforme você ganha XP.
        </p>
      </div>

      <div class="flex flex-wrap gap-2 text-[0.7rem]">
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
    </header>

    {#if hasData}
      <div class="grid gap-4 md:grid-cols-3 md:items-stretch">
        <!-- Gráfico -->
        <div class="md:col-span-2">
          <div
            class="relative h-52 w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-3 py-3"
          >
            <div
              class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_60%)] opacity-70"
              aria-hidden="true"
            ></div>

            <div class="relative flex h-full items-end gap-1.5">
              {#each points as point, index (point.label)}
                {@const fraction =
                  maxValue > 0 ? Math.max(point.value / maxValue, 0.05) : 0}
                {@const heightPercent = fraction * 100}

                <div
                  class="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                >
                  <!-- Barra -->
                  <div
                    class="relative flex h-full w-full items-end justify-center"
                  >
                    <div
                      class="w-2 rounded-full bg-gradient-to-t from-emerald-500 via-emerald-400 to-lime-300 shadow-[0_0_12px_rgba(74,222,128,0.7)]"
                      style={`height: ${heightPercent}%;`}
                      title={`${point.label}: ${point.value} XP`}
                    ></div>
                  </div>

                  <!-- Label do eixo X -->
                  <span class="truncate text-[0.6rem] text-slate-500">
                    {#if selectedRange === '30d' && points.length > 20}
                      {#if index % 3 === 0}
                        {point.label}
                      {/if}
                    {:else}
                      {point.label}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Resumo lateral -->
        <div class="space-y-3 text-xs text-slate-300">
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
            <p
              class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400"
            >
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
            <p
              class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400"
            >
              Melhor {isMonthlyRange(selectedRange) ? 'mês' : 'dia'} do período
            </p>
            <p class="mt-1 text-sm font-semibold text-emerald-300">
              {bestPointLabel}
            </p>
            <p class="text-[0.7rem] text-slate-400">
              Quando você mais acumulou XP dentro deste recorte.
            </p>
          </div>

          <div
            class="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5"
          >
            <p
              class="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400"
            >
              Dia da semana mais forte
            </p>
            <p class="mt-1 text-sm font-semibold text-emerald-300">
              {bestWeekdayLabel}
            </p>
            <p class="text-[0.7rem] text-slate-400">
              Considerando todo o histórico, é quando você tende a render mais.
            </p>
          </div>
        </div>
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
