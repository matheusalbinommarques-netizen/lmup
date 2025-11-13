<!-- src/lib/XpByAreaChart.svelte -->
<script lang="ts">
  import { db, type Task, type Area } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';

  // Estado reativo (runes)
  let completedTasks = $state<Task[]>([]);
  let areas = $state<Area[]>([]);

  // Assinaturas Dexie
  onMount(() => {
    const tasksSub = liveQuery(() =>
      db.tasks.filter((t) => t.completed === true).toArray(),
    ).subscribe((rows) => {
      completedTasks = rows ?? [];
    });

    const areasSub = liveQuery(() => db.areas.toArray()).subscribe((rows) => {
      areas = rows ?? [];
    });

    return () => {
      tasksSub.unsubscribe();
      areasSub.unsubscribe();
    };
  });

  // Mapa idArea -> nome
  const areaMap = $derived(
    areas.reduce(
      (map, a) => {
        if (a.id) map[a.id] = a.nome;
        return map;
      },
      { 0: 'Geral' } as Record<number, string>,
    ),
  );

  type XpByAreaMap = Record<string, number>;

  // Acúmulo de XP por área (apenas concluídas) — como VALOR (não função)
  const xpByArea: XpByAreaMap = $derived(
    (() => {
      const acc: XpByAreaMap = {};
      for (const t of completedTasks) {
        const label = areaMap[t.areaId] ?? 'Geral';
        acc[label] = (acc[label] ?? 0) + (t.xp ?? 0);
      }
      return acc;
    })(),
  );

  // Labels/valores ordenados por XP desc
  const labels: string[] = $derived(
    Object.keys(xpByArea).sort(
      (a, b) => (xpByArea[b] ?? 0) - (xpByArea[a] ?? 0),
    ),
  );
  const values: number[] = $derived(labels.map((l) => xpByArea[l] ?? 0));
  const total: number = $derived(values.reduce((s, v) => s + v, 0));
  const hasData: boolean = $derived(total > 0);

  // Paleta — HSL distribuída
  function colorForIndex(i: number, n = 12): string {
    const hue = Math.round(((i % n) / n) * 360);
    return `hsl(${hue} 70% 55%)`;
  }

  // Donut via stroke-dasharray em círculos
  const R = 38; // raio do anel
  const C = $derived(2 * Math.PI * R); // circunferência

  type Segment = {
    label: string;
    value: number;
    percent: number; // 0..1
    len: number; // comprimento do traço no círculo
    offset: number; // deslocamento acumulado
    color: string;
  };

  const segments: Segment[] = $derived(
    (() => {
      if (!hasData) return [] as Segment[];
      let acc = 0;
      const out: Segment[] = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        const p = v / total;
        const len = C * p;
        out.push({
          label: labels[i],
          value: v,
          percent: p,
          len,
          offset: acc,
          color: colorForIndex(i),
        });
        acc += len;
      }
      return out;
    })(),
  );

  function pct(p: number): string {
    return `${Math.round(p * 100)}%`;
  }
</script>

<section
  class="mx-auto w-full max-w-4xl rounded-2xl border border-green-500/60 bg-slate-950/70 px-4 py-3 shadow-[0_0_20px_rgba(56,189,248,0.45)]"
>
  <!-- HEADER -->
  <header class="text-center space-y-1 mb-4">
    <p class="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
      Estatísticas
    </p>
    <h2 class="text-xl font-semibold text-slate-100">XP por Área</h2>
    <div
      class="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent"
    ></div>
  </header>

  {#if hasData}
    <!-- Layout em COLUNA: gráfico em cima, legendas embaixo -->
    <div class="flex flex-col items-center gap-5">
      <!-- Donut -->
      <div class="flex items-center justify-center w-full">
        <svg
          viewBox="0 0 100 100"
          class="w-full max-w-md h-64 lg:h-80"
          role="img"
          aria-label="Distribuição de XP por área"
        >
          <!-- anel base -->
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(148,163,184,0.15)"
            stroke-width="14"
          />

          <!-- segmentos -->
          <g transform="rotate(-90 50 50)">
            {#each segments as seg, i (i)}
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={seg.color}
                stroke-width="14"
                stroke-linecap="butt"
                stroke-dasharray={`${seg.len} ${C - seg.len}`}
                stroke-dashoffset={`-${seg.offset}`}
              >
                <title>{seg.label}: {seg.value} XP ({pct(seg.percent)})</title>
              </circle>
            {/each}
          </g>

          <!-- centro (total) -->
          <g aria-hidden="true">
            <circle cx="50" cy="50" r="22" fill="rgba(15,23,42,0.9)" />
            <text
              x="50"
              y="47"
              text-anchor="middle"
              class="fill-slate-300"
              font-size="8"
              font-weight="600"
            >
              Total XP
            </text>
            <text
              x="50"
              y="60"
              text-anchor="middle"
              class="fill-amber-300"
              font-size="10"
              font-weight="700"
            >
              {total}
            </text>
          </g>
        </svg>
      </div>

      <!-- Legenda embaixo -->
      <div class="mx-auto w-full max-w-md">
        <ul class="space-y-2">
          {#each segments as seg, i (i)}
            <li
              class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="inline-block h-3 w-3 rounded-sm"
                  style={`background:${seg.color}`}
                  aria-hidden="true"
                ></span>
                <span class="truncate text-slate-200">{seg.label}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-slate-400">{pct(seg.percent)}</span>
                <span class="text-amber-300 font-semibold">{seg.value} XP</span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center h-64 lg:h-80 text-slate-500">
      <p>Complete missões para ver suas estatísticas aqui!</p>
    </div>
  {/if}
</section>
