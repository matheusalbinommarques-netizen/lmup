<!-- src/lib/XpByAreaPanel.svelte -->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '../services/db';

  type AreaXp = {
    areaId: number;
    nome: string;
    xp: number;
  };

  type PieSlice = {
    areaId: number;
    nome: string;
    xp: number;
    percent: number;
    startAngle: number;
    endAngle: number;
    color: string;
  };

  let areasXp = $state<AreaXp[]>([]);

  const totalAreasXp = $derived(
    areasXp.reduce((sum, area) => sum + area.xp, 0),
  );

  // fatias da pizza (só áreas com XP > 0)
  const pieSlices = $derived<PieSlice[]>(
    (() => {
      if (totalAreasXp <= 0) return [];

      const palette = [
        '#22c55e', // emerald
        '#0ea5e9', // sky
        '#a855f7', // purple
        '#f97316', // orange
        '#eab308', // amber
        '#22d3ee', // cyan
      ];

      let start = 0;
      const slices: PieSlice[] = [];

      for (let i = 0; i < areasXp.length; i += 1) {
        const area = areasXp[i];
        if (area.xp <= 0) continue;

        const frac = area.xp / totalAreasXp;
        const angle = frac * 360;

        slices.push({
          areaId: area.areaId,
          nome: area.nome,
          xp: area.xp,
          percent: Math.round(frac * 100),
          startAngle: start,
          endAngle: start + angle,
          color: palette[i % palette.length],
        });

        start += angle;
      }

      return slices;
    })(),
  );

  let unsubscribe: (() => void) | null = null;

  if (typeof window !== 'undefined') {
    const observable = liveQuery(async () => {
      const [areas, items] = await Promise.all([
        db.areas.toArray(),
        db.items.toArray(),
      ]);

      // usando objeto simples em vez de Map para agradar o eslint
      const xpPorArea: Record<number, number> = {};

      for (const item of items) {
        const areaId = Number(item.areaId);
        const xp = Number(item.xp) || 0;
        if (!Number.isFinite(areaId)) continue;

        xpPorArea[areaId] = (xpPorArea[areaId] ?? 0) + xp;
      }

      const resultado: AreaXp[] = areas.map((area) => {
        const id = Number(area.id);
        return {
          areaId: id,
          nome: area.nome ?? 'Área sem nome',
          xp: xpPorArea[id] ?? 0,
        };
      });

      // mais XP primeiro
      resultado.sort((a, b) => b.xp - a.xp);

      return resultado;
    });

    const sub = observable.subscribe({
      next(value) {
        areasXp = value;
      },
      error(err) {
        console.error('[XpByAreaPanel] erro no liveQuery:', err);
      },
    });

    unsubscribe = () => sub.unsubscribe();
  }

  onDestroy(() => {
    unsubscribe?.();
  });

  // helpers para desenhar arco em SVG (wedge da pizza)
  function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angleDeg: number,
  ): { x: number; y: number } {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  }

  function describeArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // Move para o centro, linha até início do arco, arco e volta pro centro (fatia)
    const d = [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');

    return d;
  }
</script>

<section
  class="mx-auto w-full max-w-4xl rounded-2xl border border-sky-500/60 bg-slate-900/70 px-4 py-3
           shadow-[0_0_20px_rgba(56,189,248,0.45)]"
>
  <div
    class="mx-auto w-full max-w-4xl rounded-2xl border border-sky-500/60 bg-slate-900/70 px-4 py-3
           shadow-[0_0_20px_rgba(56,189,248,0.45)]"
  >
    <div
      class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p
          class="text-[0.65rem] uppercase tracking-[0.25em] text-emerald-400/80"
        >
          Foco do herói
        </p>
        <h2 class="text-xl font-bold text-white md:text-2xl">
          XP por área de foco
        </h2>
        <p class="text-xs text-emerald-50/80">
          Veja onde está concentrado seu XP potencial nas missões que você
          criou.
        </p>
      </div>

      <div class="text-right text-xs text-emerald-100/80">
        <div
          class="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-400/90"
        >
          XP total nas áreas
        </div>
        <div class="text-base font-semibold text-emerald-200">
          {totalAreasXp} XP
        </div>
      </div>
    </div>

    {#if totalAreasXp <= 0 || pieSlices.length === 0}
      <div
        class="mt-2 rounded-2xl border border-dashed border-emerald-700/70 bg-slate-950/80 px-4 py-3 text-xs text-emerald-100/80"
      >
        Nenhuma área de foco ainda. Crie áreas e missões para ver o mapa de XP
        do seu reino.
      </div>
    {:else}
      <div class="mt-2 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <!-- Pizza / donut -->
        <div class="flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            class="h-52 w-52 md:h-60 md:w-60"
            aria-label="Distribuição de XP por área"
          >
            <!-- fundo do donut -->
            <circle cx="60" cy="60" r="52" fill="#022c22" opacity="0.6"
            ></circle>

            {#each pieSlices as slice (slice.areaId)}
              <path
                d={describeArc(60, 60, 52, slice.startAngle, slice.endAngle)}
                fill={slice.color}
                fill-opacity="0.9"
              ></path>
            {/each}

            <!-- furo do donut -->
            <circle cx="60" cy="60" r="30" fill="#020617"></circle>

            <!-- texto central -->
            <text
              x="60"
              y="56"
              text-anchor="middle"
              class="fill-emerald-100"
              style="font-size: 10px; font-weight: 600;"
            >
              XP nas áreas
            </text>
            <text
              x="60"
              y="70"
              text-anchor="middle"
              class="fill-emerald-300"
              style="font-size: 11px; font-weight: 700;"
            >
              {totalAreasXp} XP
            </text>
          </svg>
        </div>

        <!-- Legenda / lista -->
        <div class="space-y-2">
          {#each pieSlices as slice (slice.areaId)}
            <div
              class="flex items-center gap-3 rounded-xl border border-emerald-900/80 bg-slate-950/90 px-3 py-2 text-xs text-emerald-50/90"
            >
              <span
                class="h-3 w-3 rounded-full"
                style={`background-color: ${slice.color};`}
              ></span>

              <div class="flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[0.8rem] font-semibold">
                    {slice.nome}
                  </span>
                  <span class="text-[0.7rem] text-emerald-300/90">
                    {slice.percent}%
                  </span>
                </div>
                <div class="text-[0.7rem] text-emerald-200/80">
                  {slice.xp} XP disponíveis
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>
