<script lang="ts">
  import { db, type Task, type Area } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';

  let completedTasks = $state<Task[]>([]);
  let areas = $state<Area[]>([]);

  onMount(() => {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend, Colors);

    const tasksSub = liveQuery(() =>
      db.tasks.filter((task) => task.completed === true).toArray(),
    ).subscribe((tasks) => {
      completedTasks = tasks;
    });

    const areasSub = liveQuery(() => db.areas.toArray()).subscribe(
      (dbAreas) => {
        areas = dbAreas;
      },
    );

    return () => {
      tasksSub.unsubscribe();
      areasSub.unsubscribe();
    };
  });

  let chartStats = $derived(() => {
    const areaMap = areas.reduce(
      (map, area) => {
        if (area.id) map[area.id] = area.nome;
        return map;
      },
      { 0: 'Geral' } as Record<number, string>,
    );

    const xpByArea = completedTasks.reduce(
      (acc, task) => {
        const areaName = areaMap[task.areaId] || 'Geral';
        if (!acc[areaName]) {
          acc[areaName] = 0;
        }
        acc[areaName] += task.xp;
        return acc;
      },
      {} as Record<string, number>,
    );

    const labels = Object.keys(xpByArea);
    const data = Object.values(xpByArea);

    return { labels, data };
  });

  let canvasElement = $state<HTMLCanvasElement | undefined>();
  let chartInstance: Chart | null = null;

  $effect(() => {
    if (canvasElement) {
      const stats = chartStats(); // Acessa como função no <script>

      if (stats.data.length > 0) {
        chartInstance?.destroy();
        chartInstance = new Chart(canvasElement, {
          type: 'doughnut',
          data: {
            labels: stats.labels,
            datasets: [
              {
                label: 'XP Ganho',
                data: stats.data,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#94a3b8',
                  boxWidth: 20,
                },
              },
              tooltip: {
                bodyFont: { size: 14 },
                callbacks: {
                  label: (context) => ` ${context.label}: ${context.raw} XP`,
                },
              },
            },
          },
        });
      } else if (chartInstance && stats.data.length === 0) {
        chartInstance.destroy();
        chartInstance = null;
      }
    }
    return () => {
      chartInstance?.destroy();
    };
  });
</script>

<section
  class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-md"
>
  <h2
    class="text-center text-xl font-bold text-slate-200 mb-6 pb-4 border-b border-slate-800/50"
  >
    Estatísticas de XP por Área
  </h2>

  <div class="h-64 lg:h-80 relative">
    {#if chartStats().data.length > 0}
      <canvas bind:this={canvasElement}></canvas>
    {:else}
      <div class="flex items-center justify-center h-full text-slate-500">
        <p>Complete missões para ver suas estatísticas aqui!</p>
      </div>
    {/if}
  </div>
</section>
