<script lang="ts">
  import { db, type Task, type Area, type XpLog } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { xpService } from '$services/xpService';
  import AreaManager from '$lib/AreaManager.svelte';
  import AddTaskModal from '$lib/AddTaskModal.svelte';
  import XpByAreaChart from '$lib/XpByAreaChart.svelte';
  import StatsManager from '$lib/StatsManager.svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
  import SelfComparisonPanel from '$lib/SelfComparisonPanel.svelte';

  let tasks = $state<Task[]>([]);
  let areas = $state<Area[]>([]);
  let xpLogs = $state<XpLog[]>([]); // <-- NOVO

  type FilterTab = 'available' | 'todo' | 'completed';
  let filter = $state<FilterTab>('available');
  let selectedAreaId = $state<'all' | number>('all');

  // Tipagem baseada no próprio Task
  type Rarity = Task['rarity'];
  const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

  let selectedRarity = $state<null | Rarity>(null);

  let isModalOpen = $state(false);
  let taskToEdit = $state<Task | null>(null);

  const tasksQuery = liveQuery(() =>
    db.tasks.orderBy('createdAt').reverse().toArray(),
  );
  const areasQuery = liveQuery(() => db.areas.toArray());
  const xpLogsQuery = liveQuery(() => db.xpLogs.toArray()); // <-- NOVO

  onMount(() => {
    const tasksSub = tasksQuery.subscribe((dbTasks) => (tasks = dbTasks));
    const areasSub = areasQuery.subscribe((dbAreas) => (areas = dbAreas));
    const logsSub = xpLogsQuery.subscribe((rows) => (xpLogs = rows ?? [])); // <-- NOVO
    return () => {
      tasksSub.unsubscribe();
      areasSub.unsubscribe();
      logsSub.unsubscribe(); // <-- NOVO
    };
  });

  const areaMap = $derived(
    areas.reduce(
      (map, area) => {
        if (area.id) map[area.id] = area.nome;
        return map;
      },
      { 0: 'Geral' } as Record<number, string>,
    ),
  );

  // --- Missão sugerida do dia (baseada em área negligenciada) ---
  function computeSuggestedDailyTask(): Task | null {
    if (!tasks.length) return null;

    type AreaStats = {
      completedCount: number;
      pendingTasks: Task[];
      oldestPendingCreatedAt: number;
    };

    const statsByArea: Record<number, AreaStats> = {};

    for (const task of tasks) {
      const areaId = (task.areaId ?? 0) as number;

      let stats = statsByArea[areaId];
      if (!stats) {
        stats = {
          completedCount: 0,
          pendingTasks: [],
          oldestPendingCreatedAt: Number.POSITIVE_INFINITY,
        };
        statsByArea[areaId] = stats;
      }

      if (task.completed) {
        stats.completedCount += 1;
      } else {
        stats.pendingTasks.push(task);

        const createdAtValue = task.createdAt;
        const createdAtTime =
          createdAtValue instanceof Date
            ? createdAtValue.getTime()
            : new Date(createdAtValue as any).getTime();

        if (createdAtTime < stats.oldestPendingCreatedAt) {
          stats.oldestPendingCreatedAt = createdAtTime;
        }
      }
    }

    const candidates = Object.values(statsByArea).filter(
      (stats) => stats.pendingTasks.length > 0,
    );

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
      if (a.completedCount !== b.completedCount) {
        return a.completedCount - b.completedCount;
      }
      if (a.oldestPendingCreatedAt !== b.oldestPendingCreatedAt) {
        return a.oldestPendingCreatedAt - b.oldestPendingCreatedAt;
      }
      return 0;
    });

    const worstAreaStats = candidates[0];

    const sortedPendings = [...worstAreaStats.pendingTasks].sort((t1, t2) => {
      const aVal = t1.createdAt;
      const bVal = t2.createdAt;

      const a =
        aVal instanceof Date ? aVal.getTime() : new Date(aVal as any).getTime();
      const b =
        bVal instanceof Date ? bVal.getTime() : new Date(bVal as any).getTime();

      return a - b;
    });

    return sortedPendings[0] ?? null;
  }

  const suggestedDailyTask = $derived(computeSuggestedDailyTask());

  // ---------- Helpers de data ----------
  function parseYMD(dateStr: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) return null;
    const y = +m[1],
      mm = +m[2],
      d = +m[3];
    return new Date(y, mm - 1, d);
  }

  function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // --- Retrospectiva semanal (últimos 7 dias) — AGORA VIA xpLogs ---
  type WeeklyStats = {
    missions: number;
    xp: number;
    gold: number;
  };

  function computeWeeklyStats(): WeeklyStats {
    // mapa YYYY-MM-DD -> soma de XP do dia
    const byDay: Record<string, number> = {};
    for (const log of xpLogs) {
      const key = log.date;
      byDay[key] = (byDay[key] ?? 0) + (log.amount ?? 0);
    }

    const today = new Date();
    let total = 0;

    // últimos 7 dias (inclui hoje) — sempre 7 pontos, com zeros
    for (let i = 6; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const key = toDateKey(d);
      const dayXp = byDay[key] ?? 0;
      total += dayXp;
    }

    // "missões concluídas" ~ quantidade de logs positivos no intervalo
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6,
    );
    let missions = 0;
    for (const log of xpLogs) {
      const d = parseYMD(log.date);
      if (!d) continue;
      // entre start e hoje (fechado em dias)
      const dFloor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const todayFloor = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      if (dFloor >= start && dFloor <= todayFloor) {
        if ((log.amount ?? 0) > 0) missions++;
      }
    }

    const gold = Math.floor(total * 0.5);
    return { missions, xp: total, gold };
  }

  const weeklyStats = $derived(computeWeeklyStats());

  // --- Revisões com intervalo configurável ---
  type ReviewMission = {
    task: Task;
    intervalDays: number;
    nextReviewDate: Date;
  };

  const REVIEW_PRESETS = [1, 3, 7, 14, 30];

  let reviewConfigTask = $state<Task | null>(null);
  let reviewIntervalDraft = $state<number>(7);

  function isReviewEnabled(task: Task | null | undefined): boolean {
    if (!task) return false;
    return (task as any).reviewEnabled === true;
  }

  function openReviewConfig(task: Task) {
    reviewConfigTask = task;
    const anyTask = task as any;
    const currentInterval = Number(anyTask.reviewIntervalDays ?? 7);
    reviewIntervalDraft = REVIEW_PRESETS.includes(currentInterval)
      ? currentInterval
      : 7;
  }

  function closeReviewConfig() {
    reviewConfigTask = null;
  }

  async function confirmReviewConfig() {
    if (!reviewConfigTask?.id) {
      reviewConfigTask = null;
      return;
    }

    const now = new Date();

    await db.tasks.update(reviewConfigTask.id, {
      reviewEnabled: true,
      reviewIntervalDays: reviewIntervalDraft,
      reviewStartedAt: now,
    } as any);

    reviewConfigTask = null;
  }

  async function clearReview(task: Task | null) {
    if (!task?.id) return;

    await db.tasks.update(task.id, {
      reviewEnabled: false,
      reviewIntervalDays: null,
      reviewStartedAt: null,
    } as any);

    reviewConfigTask = null;
  }

  function computeReviewMissions(): ReviewMission[] {
    const list: ReviewMission[] = [];

    for (const task of tasks) {
      const anyTask = task as any;
      if (!anyTask.reviewEnabled) continue;

      const interval = Number(anyTask.reviewIntervalDays ?? 0);
      if (!interval || interval <= 0) continue;

      const startedRaw = anyTask.reviewStartedAt ?? task.createdAt;
      if (!startedRaw) continue;

      const started =
        startedRaw instanceof Date ? startedRaw : new Date(startedRaw as any);
      if (isNaN(started.getTime())) continue;

      const nextReview = new Date(
        started.getTime() + interval * 24 * 60 * 60 * 1000,
      );

      list.push({
        task,
        intervalDays: interval,
        nextReviewDate: nextReview,
      });
    }

    list.sort(
      (a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime(),
    );
    return list;
  }

  const reviewMissions = $derived(computeReviewMissions());

  function formatDateShort(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  // Cores de borda/texto por raridade (cards da lista)
  const rarityColors: Record<Rarity, string> = {
    common: 'border-slate-600 text-slate-400',
    rare: 'border-blue-500 text-blue-400',
    epic: 'border-purple-500 text-purple-400',
    legendary: 'border-[#ffb74d] text-[#ffb74d]',
  };

  // Labels em PT-BR por raridade
  const rarityLabels: Record<Rarity, string> = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária',
  };

  // Estilos dos chips de filtro
  const chipBase =
    'px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors';
  const chipOn: Record<Rarity, string> = {
    common: 'bg-slate-700 text-slate-100 border-slate-400',
    rare: 'bg-blue-500/20 text-blue-300 border-blue-400',
    epic: 'bg-purple-500/20 text-purple-300 border-purple-400',
    legendary: 'bg-[#ffb74d]/20 text-[#ffb74d] border-[#ffb74d]',
  };
  const chipOff: Record<Rarity, string> = {
    common: 'border-slate-600 text-slate-400 hover:bg-slate-800',
    rare: 'border-blue-500 text-blue-400 hover:bg-blue-950/40',
    epic: 'border-purple-500 text-purple-400 hover:bg-purple-950/40',
    legendary:
      'border-[#ffb74d] text-[#ffb74d] hover:bg-[rgba(255,183,77,0.12)]',
  };

  function chipClass(r: Rarity): string {
    const state = selectedRarity === r ? chipOn[r] : chipOff[r];
    return `${chipBase} ${state}`;
  }

  function toggleRarity(r: Rarity) {
    selectedRarity = selectedRarity === r ? null : r;
  }

  // --- Status da missão: Disponível / A Fazer / Concluída ---
  type TaskStatus = 'available' | 'todo' | 'completed';

  function getTaskStatus(task: Task): TaskStatus {
    const anyTask = task as any;

    if (task.completed || anyTask.status === 'completed') return 'completed';
    if (anyTask.status === 'todo') return 'todo';

    return 'available';
  }

  // Lista filtrada (status + área + raridade)
  let filteredTasks = $derived(
    tasks
      .filter((t) => {
        const status = getTaskStatus(t);
        if (filter === 'completed') return status === 'completed';
        if (filter === 'todo') return status === 'todo';
        return status === 'available';
      })
      .filter((t) =>
        selectedAreaId === 'all' ? true : t.areaId === selectedAreaId,
      )
      .filter((t) => (selectedRarity ? t.rarity === selectedRarity : true)),
  );

  async function toggleTask(id: number | undefined) {
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.completed) return;

    await db.tasks.update(id, {
      completed: true,
      status: 'completed',
    } as any);

    await xpService.addXp(task.xp);
  }

  async function toggleTodo(task: Task) {
    if (!task.id) return;
    const current = getTaskStatus(task);
    if (current === 'completed') return;

    const newStatus: TaskStatus = current === 'todo' ? 'available' : 'todo';

    await db.tasks.update(task.id, {
      status: newStatus,
    } as any);
  }

  function openAddTaskModal() {
    taskToEdit = null;
    isModalOpen = true;
  }

  function openEditTaskModal(task: Task) {
    taskToEdit = task;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    taskToEdit = null;
  }

  async function handleDeleteTask(task: Task) {
    if (!task.id) return;
    if (!confirm(`Tem certeza que deseja apagar a missão "${task.title}"?`)) {
      return;
    }

    try {
      if (task.completed) {
        await xpService.removeXp(task.xp);
      }
      await db.tasks.delete(task.id);
    } catch (error) {
      console.error('Erro ao excluir missão:', error);
      alert('Falha ao excluir missão.');
    }
  }
</script>

{#if isModalOpen}
  <AddTaskModal {taskToEdit} close={closeModal} />
{/if}

<!-- Modal de configuração de revisão -->
{#if reviewConfigTask}
  <div
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
  >
    <div
      class="w-full max-w-sm rounded-2xl border border-sky-500/70 bg-slate-950 px-4 py-4 shadow-[0_0_28px_rgba(56,189,248,0.7)]"
    >
      <header class="mb-3 flex items-start justify-between gap-3">
        <div>
          <p class="text-[0.65rem] uppercase tracking-[0.22em] text-sky-300/80">
            Configurar revisão
          </p>
          <h3 class="mt-1 text-sm font-semibold text-slate-100 line-clamp-2">
            {reviewConfigTask.title}
          </h3>
        </div>
        <button
          type="button"
          class="rounded-full p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          onclick={closeReviewConfig}
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
        </button>
      </header>

      <p class="text-xs text-slate-400 mb-3">
        De quanto em quanto tempo você quer revisar esta missão?
      </p>

      <div class="mb-4 flex flex-wrap gap-2">
        {#each REVIEW_PRESETS as days (days)}
          <button
            type="button"
            class={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
              reviewIntervalDraft === days
                ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-400/80 hover:text-sky-100'
            }`}
            onclick={() => (reviewIntervalDraft = days)}
          >
            {days}
            {days === 1 ? 'dia' : 'dias'}
          </button>
        {/each}
      </div>

      <div class="flex items-center justify-between gap-2 text-xs">
        {#if isReviewEnabled(reviewConfigTask)}
          <button
            type="button"
            class="text-[0.7rem] text-slate-500 hover:text-red-400"
            onclick={() => clearReview(reviewConfigTask)}
          >
            Remover revisão
          </button>
        {:else}
          <span></span>
        {/if}

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700"
            onclick={closeReviewConfig}
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400"
            onclick={confirmReviewConfig}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Quadro de Missões"
    subtitle="Complete tarefas para ganhar XP, manter a chama da consistência acesa e evoluir seu herói!"
    align="center"
  />

  <!-- Painel principal de status -->
  <StatsManager />

  <!-- Missão sugerida do dia (área negligenciada) -->
  {#if suggestedDailyTask}
    {@const task = suggestedDailyTask}
    <section
      class="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-500/60 bg-emerald-950/40 px-4 py-3
             shadow-[0_0_20px_rgba(16,185,129,0.35)] flex flex-col gap-3
             md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-start gap-3">
        <div
          class="mt-1 hidden h-9 w-9 items-center justify-center rounded-xl
                 bg-emerald-500/20 text-2xl md:flex"
        >
          📌
        </div>

        <div>
          <p
            class="text-[0.65rem] uppercase tracking-[0.22em] text-emerald-300/80"
          >
            Missão sugerida do dia
          </p>
          <h3 class="mt-1 text-sm font-semibold text-emerald-100">
            {task.title}
          </h3>
          <p class="mt-1 text-xs text-emerald-100/80">
            Foque em
            <span class="font-semibold">
              {areaMap[task.areaId ?? 0] ?? 'Geral'}
            </span>
            para equilibrar suas áreas de foco.
          </p>
        </div>
      </div>

      <div class="mt-2 flex items-center gap-3 md:mt-0">
        <span
          class="inline-flex items-center gap-1 rounded-full bg-amber-400/20
                 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100"
        >
          +{task.xp} XP
        </span>

        <button
          type="button"
          class="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold
                 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.6)]
                 hover:bg-emerald-400 transition-colors"
          onclick={() => {
            selectedAreaId = task.areaId ?? 'all';
            filter = 'available';
          }}
        >
          Ver na lista
        </button>
      </div>
    </section>
  {/if}

  <!-- Retrospectiva semanal (agora 100% baseada em xpLogs) -->
  <section
    class="mx-auto w-full max-w-4xl rounded-2xl
         border border-amber-500/70
         bg-slate-950/70
         px-4 py-3
         shadow-[0_0_26px_rgba(16,185,129,0.65)]
         flex flex-col gap-3
         md:flex-row md:items-center md:justify-between"
  >
    <div>
      <p class="text-[1.5 rem] uppercase tracking-[0.22em] text-amber-400">
        Retrospectiva da última semana
      </p>
      <p class="mt-1 text-xs text-slate-400">
        Considerando as missões concluídas (logs) nos últimos 7 dias.
      </p>
    </div>

    <div
      class="mt-2 grid grid-cols-3 gap-3 text-center text-xs md:mt-0 md:text-right"
    >
      <div>
        <p class="text-slate-400">Missões concluídas</p>
        <p class="mt-1 text-base font-semibold text-slate-100">
          {weeklyStats.missions}
        </p>
      </div>
      <div>
        <p class="text-slate-400">XP ganho</p>
        <p class="mt-1 text-base font-semibold text-[#eec39a]">
          {weeklyStats.xp}
        </p>
      </div>
      <div>
        <p class="text-slate-400">Gold ganho</p>
        <p
          class="mt-1 flex items-center justify-center gap-1 text-base font-semibold text-amber-300 md:justify-end"
        >
          {weeklyStats.gold}
          <img
            src="/art/icones/gold-icon.png"
            alt="Gold"
            class="h-4 w-4 object-contain"
          />
        </p>
      </div>
    </div>
  </section>

  <!-- Tudo abaixo alinhado à mesma largura do StatsManager -->
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <!-- XP por área + comparação consigo mesmo + áreas -->
    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <XpByAreaChart />
      <SelfComparisonPanel />
    </div>

    <!-- Missões para Revisão -->
    <section
      class="mx-auto w-full max-w-4xl rounded-2xl border border-sky-500/60 bg-slate-900/70 px-4 py-3
           shadow-[0_0_20px_rgba(56,189,248,0.45)]"
    >
      <div class="flex items-center justify-between gap-3 mb-2">
        <div>
          <p class="text-[1.5 rem] uppercase tracking-[0.22em] text-sky-300/80">
            Missões para Revisão
          </p>
          <p class="mt-1 text-xs text-slate-400">
            Missões com revisão ativada, seus intervalos e próxima revisão.
          </p>
        </div>
        <span
          class="rounded-full bg-slate-800/80 px-3 py-1 text-[0.7rem] text-slate-200"
        >
          {reviewMissions.length}
          {reviewMissions.length === 1 ? ' missão' : ' missões'}
        </span>
      </div>

      {#if reviewMissions.length === 0}
        <p class="mt-1 text-xs text-slate-500">
          Nenhuma missão configurada para revisão. Use o ícone de marcador nas
          missões abaixo para definir um intervalo de revisão.
        </p>
      {:else}
        <div class="mt-3 space-y-2">
          {#each reviewMissions as item (item.task.id)}
            {@const task = item.task}
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs"
            >
              <div class="min-w-0">
                <p class="truncate text-slate-100 font-medium">
                  {task.title}
                </p>
                <p class="mt-0.5 text-[0.7rem] text-slate-400">
                  Área: {areaMap[task.areaId ?? 0] ?? 'Geral'}
                </p>
                <p class="mt-0.5 text-[0.7rem] text-sky-300">
                  Revisar a cada {item.intervalDays}
                  {item.intervalDays === 1 ? ' dia' : ' dias'} • Próxima revisão:
                  {formatDateShort(item.nextReviewDate)}
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg bg-sky-500 px-3 py-1 text-[0.7rem] font-semibold text-slate-950 hover:bg-sky-400 transition-colors"
                onclick={() => {
                  selectedAreaId = task.areaId ?? 'all';
                  filter = task.completed ? 'completed' : 'available';
                }}
              >
                Ir para missão
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card de filtro de raridade -->
    <section
      class="mx-auto w-full max-w-4xl rounded-2xl border border-amber-500/60 bg-slate-900/70 px-4 py-3
           shadow-[0_0_20px_rgba(56,189,248,0.45)]"
    >
      <div class="flex items-center justify-between mb-2">
        <AreaManager bind:selectedId={selectedAreaId} />

        <p class="text-xs text-slate-400">
          {#if selectedRarity}
            <span class="ml-1 text-slate-500">
              • Mostrando apenas
              <strong class="uppercase">
                {rarityLabels[selectedRarity]}
              </strong>
            </span>
          {/if}
        </p>
        {#if selectedRarity}
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-slate-200 underline"
            onclick={() => (selectedRarity = null)}
          >
            Limpar
          </button>
        {/if}
      </div>

      <div class="flex flex-wrap gap-2">
        {#each rarityOrder as r (r)}
          <button
            type="button"
            class={chipClass(r)}
            onclick={() => toggleRarity(r)}
            aria-pressed={selectedRarity === r}
            aria-label={`Filtrar por raridade ${rarityLabels[r]}`}
          >
            {rarityLabels[r]}
          </button>
        {/each}
      </div>
    </section>

    <!-- Filtro de status + botão nova missão -->
    <div
      class="flex items-center justify-between gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800"
    >
      <div class="flex gap-2">
        <!-- Disponíveis (azul) -->
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {filter ===
          'available'
            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
            : 'text-slate-400 hover:bg-slate-800'}"
          onclick={() => (filter = 'available')}
        >
          Disponíveis
        </button>

        <!-- A Fazer (verde) -->
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {filter ===
          'todo'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
            : 'text-slate-400 hover:bg-slate-800'}"
          onclick={() => (filter = 'todo')}
        >
          A Fazer
        </button>

        <!-- Concluídas (dourado) -->
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {filter ===
          'completed'
            ? 'bg-[#ffb74d]/20 text-[#ffb74d] border border-[#ffb74d]/50'
            : 'text-slate-400 hover:bg-slate-800'}"
          onclick={() => (filter = 'completed')}
        >
          Concluídas
        </button>
      </div>

      <button
        onclick={openAddTaskModal}
        class="flex items-center gap-2 bg-[#ffb74d] hover:bg-[#ffa726] text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
      >
        <span>+</span> Nova Missão
      </button>
    </div>

    <!-- Lista de missões -->
    <div class="grid grid-cols-1 gap-3">
      {#if filteredTasks.length === 0}
        <div
          class="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed"
        >
          <p>Nenhuma missão encontrada para esta seleção.</p>
          <button
            class="text-sm text-primary hover:underline mt-2"
            onclick={openAddTaskModal}
          >
            Adicionar uma missão?
          </button>
        </div>
      {:else}
        {#each filteredTasks as task (task.id)}
          <div
            class="group flex items-center gap-4 p-4 bg-slate-900/80 border rounded-xl transition-colors {rarityColors[
              task.rarity
            ]} {task.completed ? 'opacity-50 grayscale' : 'shadow-md'}"
          >
            <!-- Botão de completar -->
            <button
              onclick={() => toggleTask(task.id)}
              class="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                {task.completed
                ? 'bg-green-500/20 border-green-500 text-green-500'
                : 'border-slate-600 hover:border-[#ffb74d] text-transparent'}"
              aria-label="Completar missão"
            >
              {#if task.completed}✓{/if}
            </button>

            <!-- Título / área / raridade -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-xs font-bold uppercase tracking-wider opacity-70 {rarityColors[
                    task.rarity
                  ]}"
                >
                  {rarityLabels[task.rarity]}
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                >
                  {areaMap[task.areaId] || 'Sem Área'}
                </span>

                <!-- Botão A Fazer -->
                <button
                  type="button"
                  class="text-[0.65rem] px-2 py-0.5 rounded-full border transition-colors {getTaskStatus(
                    task,
                  ) === 'todo'
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300'}"
                  onclick={() => toggleTodo(task)}
                >
                  A Fazer
                </button>
              </div>
              <h3
                class="text-slate-100 font-medium break-words whitespace-pre-line {task.completed
                  ? 'line-through'
                  : ''}"
              >
                {task.title}
              </h3>
            </div>

            <!-- Recompensas (XP + Gold) -->
            <div class="shrink-0 flex flex-col items-end gap-1 text-xs">
              <!-- XP -->
              <div class="flex items-center gap-1">
                <img
                  src="/art/icones/icon-xp.png"
                  alt="XP"
                  class="h-6 w-6 object-contain"
                />
                <span class="text-[#eec39a] font-bold">+{task.xp} XP</span>
              </div>

              <!-- Gold (50% do XP) -->
              <div class="flex items-center gap-1 text-amber-200">
                <img
                  src="/art/icones/gold-icon.png"
                  alt="Gold"
                  class="h-6 w-6 object-contain"
                />
                <span class="font-semibold">
                  +{Math.floor(task.xp * 0.5)} Gold
                </span>
              </div>
            </div>

            <!-- Ações (revisão / editar / excluir) -->
            <div
              class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <!-- Configurar revisão -->
              <button
                onclick={() => openReviewConfig(task)}
                class="w-8 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-200 hover:bg-slate-800"
                aria-label="Configurar revisão"
              >
                {#if isReviewEnabled(task)}
                  <!-- bookmark cheio -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="w-4 h-4"
                    fill="currentColor"
                  >
                    <path d="M6 4.5h12v15l-6-3-6 3z" />
                  </svg>
                {:else}
                  <!-- bookmark contorno -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path d="M6 4.5h12v15l-6-3-6 3z" />
                  </svg>
                {/if}
              </button>

              <button
                onclick={() => openEditTaskModal(task)}
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-slate-800"
                aria-label="Editar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A.75.75 0 0 1 17.25 19.75H6.75A.75.75 0 0 1 6 18.75v-12z"
                  />
                </svg>
              </button>

              <button
                onclick={() => handleDeleteTask(task)}
                class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800"
                aria-label="Excluir"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 7.5h12M9.75 7.5v9.75m4.5-9.75v9.75M9 4.5h6a.75.75 0 0 1 .75.75V6H8.25v-.75A.75.75 0 0 1 9 4.5zm-3 2.25h12v12A2.25 2.25 0 0 1 15.75 21H8.25A.75.75 0 0 1 6 18.75v-12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
