<script lang="ts">
  import { todayView } from './todayView';
  import BackupReminder from './BackupReminder.svelte';
  import { hasBackupContent } from '$services/backupReminder';
  import { countLabel } from '$lib/plural';
  import {
    changeToday,
    dayChangeNeedsConfirmation,
  } from '$services/dailyPlanningService';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  import { addCalendarDays } from '$services/calendar';
  import { areaIconKey } from '$services/areaIcons';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import { ensureOccurrence } from '$services/occurrenceService';
  import { saveSession } from '$services/savedSessionService';
  import { fraction } from '$services/productivityRules';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';
  import { ALL_ACHIEVEMENTS } from '$services/achievementsCatalog';
  import type { Occurrence } from '$services/productivityTypes';
  import { paintings } from '$lib/content/visualAssets';
  import Button from '$lib/ui/Button.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import DayProgress from '$lib/ui/DayProgress.svelte';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import QuickCreate from './QuickCreate.svelte';
  import WorldProgress from './WorldProgress.svelte';
  import HeroIdentity from './HeroIdentity.svelte';
  import InvestmentGoalCard from './InvestmentGoalCard.svelte';
  import SupplyBoxesCard from './SupplyBoxesCard.svelte';
  import { guardUpdates } from './guardUpdates';
  import DayRow from '$lib/ui/DayRow.svelte';
  import { canCompleteInline, inFocus, staleDays } from '$services/dayRow';
  import { completeTask, undoTask } from '$services/taskService';
  import {
    dayTimeline,
    moveId,
    orderDay,
    saveDayOrder,
    setRowTime,
    type TimeScope,
  } from '$services/dayOrder';
  import { tick } from 'svelte';
  import {
    readPriority,
    savePriority,
    PRIORITY_KEY,
    selectNextOccurrence,
    usesTaskExecution,
  } from './homePriority';
  let data = $state.raw<JourneySnapshot>();
  let error = $state(''),
    busy = $state(false),
    open = $state(false);
  let now = $state(new Date()),
    pinned = $state<number | null>(null);
  const today = $derived(dateKey(now));
  guardUpdates(() => !data || busy || actionOpen);
  onMount(() => {
    pinned = readPriority();
    const sub = journeyQuery().subscribe({
      next: (value) => {
        now = new Date();
        data = value;
        error = '';
      },
      error: () =>
        (error =
          'Não foi possível carregar sua jornada. Seus dados foram preservados.'),
    });
    const update = () => (now = new Date());
    const sync = (event: StorageEvent) => {
      if (event.key === PRIORITY_KEY || event.key === null)
        pinned = readPriority();
    };
    const timer = setInterval(update, 30000);
    window.addEventListener('focus', update);
    window.addEventListener('storage', sync);
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
      window.removeEventListener('focus', update);
      window.removeEventListener('storage', sync);
    };
  });
  const greeting = $derived(
    now.getHours() < 12
      ? 'Bom dia'
      : now.getHours() < 18
        ? 'Boa tarde'
        : 'Boa noite',
  );
  const profileName = $derived(data?.profile?.name?.trim() ?? '');
  const name = $derived(
    profileName.toLocaleLowerCase('pt-BR') === 'herói sem nome'
      ? ''
      : profileName,
  );
  const view = $derived(data ? todayView(data, today, now) : undefined);
  const todayRows = $derived([
    ...(view?.planned ?? []),
    ...(view?.flexible ?? []),
  ]);
  let actionOpen = $state(false);
  let dayAction = $state<{
    row: Occurrence;
    action: 'remove' | 'reschedule';
    requiresConfirmation: boolean;
  }>();
  let rescheduleDate = $state(''),
    actionError = $state(''),
    notice = $state('');
  async function chooseAction(
    row: Occurrence,
    action: 'remove' | 'reschedule',
    targetDate?: string,
  ) {
    actionError = '';
    const confirm = await dayChangeNeedsConfirmation(row.id);
    if (action === 'remove' && !confirm) {
      await applyAction(row, action, false);
      return;
    }
    rescheduleDate =
      targetDate ??
      (row.plannedDate < today ? today : addCalendarDays(today, 1));
    if (targetDate && !confirm) {
      await applyAction(row, action, false);
      return;
    }
    actionOpen = true;
    dayAction = { row, action, requiresConfirmation: confirm };
  }
  async function applyAction(
    row: Occurrence,
    action: 'remove' | 'restore' | 'reschedule',
    acknowledged: boolean,
  ) {
    if (busy) return;
    busy = true;
    actionError = '';
    try {
      await changeToday({
        row,
        action,
        day: today,
        targetDate: rescheduleDate,
        acknowledged,
        requestId: crypto.randomUUID(),
      });
      actionOpen = false;
      dayAction = undefined;
      notice =
        action === 'remove'
          ? 'Removida de hoje. Cadastro, progresso e recompensas preservados.'
          : action === 'restore'
            ? 'Ocorrência devolvida ao planejamento.'
            : 'Ocorrência reagendada. Progresso e recompensas preservados.';
    } catch (cause) {
      actionError =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível alterar o planejamento.';
    } finally {
      busy = false;
    }
  }
  $effect(() => {
    if (
      data &&
      pinned !== null &&
      selectNextOccurrence(todayRows, pinned)?.taskId !== pinned
    ) {
      pinned = null;
      savePriority(null);
    }
  });
  const planned = $derived(view?.planned ?? []);
  const next = $derived.by(() => {
    const chosen =
      pinned ?? data?.tasks.find((task) => task.pinned)?.id ?? null;
    return chosen !== null &&
      todayRows.some(
        (row) => row.taskId === chosen && row.status !== 'completed',
      )
      ? selectNextOccurrence(todayRows, chosen)
      : (selectNextOccurrence(
          dayList.filter((row) => slots.get(row.id)?.kind !== 'missed'),
          null,
          true,
        ) ??
          selectNextOccurrence(view?.planned ?? [], null, true) ??
          selectNextOccurrence(view?.flexible ?? []));
  });
  const completed = $derived(
    planned.filter((row) => row.status === 'completed').length,
  );
  // Describes the day; never pushes (design: "o app descreve, não cobra").
  const heroLine = $derived(
    planned.length === 0
      ? 'Seu dia está livre. Um passo pequeno já conta como começo.'
      : completed === planned.length
        ? 'Plano de hoje cumprido. Seu progresso está registrado.'
        : `${completed} de ${planned.length} feitos${next ? ` · próxima: ${next.title}` : ''}`,
  );
  const remaining = $derived(
    planned.filter((row) => row.status !== 'completed'),
  );
  type RowInfo = {
    stale: number | null;
    focus: boolean;
    important: boolean;
    recurring: boolean;
    canComplete: boolean;
    support: string;
  };
  function rowInfo(row: Occurrence): RowInfo {
    const task = data?.tasks.find((item) => item.id === row.taskId);
    const area =
      data?.areas.find((item) => item.id === row.areaId)?.nome ?? 'Geral';
    return {
      stale: task
        ? staleDays(
            task,
            today,
            data?.occurrences ?? [],
            data?.executionRecords ?? [],
          )
        : null,
      focus: inFocus(row.areaId, data?.areas ?? [], data?.profile),
      important: (row.importance ?? task?.importance) === 'high',
      recurring: !!task?.recurrence,
      canComplete: canCompleteInline(task, row, today),
      support: [row.estimatedMinutes ? `${row.estimatedMinutes} min` : '', area]
        .filter(Boolean)
        .join(' · '),
    };
  }
  const rowInfos = $derived(
    new Map(planned.map((row) => [row.id, rowInfo(row)])),
  );
  // Long-stalled missions are grouped at the end of the plan, oldest first.
  const stalled = $derived(
    remaining
      .filter((row) => rowInfos.get(row.id)?.stale)
      .sort(
        (a, b) =>
          (rowInfos.get(b.id)?.stale ?? 0) - (rowInfos.get(a.id)?.stale ?? 0),
      ),
  );
  // Single order of the day (lote 2): everything planned except the stalled
  // group, concluded rows kept in place. A move shows at once (localOrder)
  // and is replaced by the stored order on the next snapshot.
  let localOrder = $state<string[] | null>(null);
  $effect(() => {
    if (!localOrder) return;
    const stored = orderDay(
      planned.filter((row) => !rowInfos.get(row.id)?.stale),
      today,
    ).map((row) => row.id);
    const wanted = localOrder.filter((id) => stored.includes(id));
    if (
      wanted.length === stored.length &&
      wanted.every((id, i) => id === stored[i])
    )
      localOrder = null;
  });
  const dayList = $derived.by(() => {
    const rows = planned.filter((row) => !rowInfos.get(row.id)?.stale);
    if (!localOrder) return rows;
    const at = new Map(localOrder.map((id, index) => [id, index]));
    return orderDay(
      rows.map((row) =>
        at.has(row.id)
          ? { ...row, dayOrder: { day: today, rank: at.get(row.id)! + 1 } }
          : row,
      ),
      today,
    );
  });
  let hideDone = $state(false),
    reorder = $state(false),
    dragId = $state<string | null>(null),
    moved = $state('');
  const doneCount = $derived(
    dayList.filter((row) => row.status === 'completed').length,
  );
  const visibleDay = $derived(
    hideDone ? dayList.filter((row) => row.status !== 'completed') : dayList,
  );
  const timeline = $derived(dayTimeline(dayList, now));
  const slots = $derived(
    new Map(timeline.slots.map((slot) => [slot.id, slot])),
  );
  const conflictBefore = $derived(
    new Map(timeline.conflicts.map((item) => [item.anchorId, item])),
  );
  const withoutDuration = $derived(
    dayList.filter((row) => row.status !== 'completed' && !row.estimatedMinutes)
      .length,
  );
  const titleOf = (id: string) =>
    dayList.find((row) => row.id === id)?.title ?? '';
  async function reorderTo(ids: string[], focusId: string, label: string) {
    if (busy) return;
    const byId = new Map(dayList.map((row) => [row.id, row]));
    localOrder = ids;
    busy = true;
    try {
      await saveDayOrder(today, ids.map((id) => byId.get(id)!).filter(Boolean));
      moved = label;
    } catch (cause) {
      localOrder = null;
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível guardar a nova ordem.';
    } finally {
      busy = false;
    }
    await tick();
    const row = document.querySelector<HTMLElement>(
      `[data-day-row="${CSS.escape(focusId)}"]`,
    );
    (
      row?.querySelector<HTMLElement>('.move button:not(:disabled)') ??
      row?.querySelector<HTMLElement>('.title')
    )?.focus();
  }
  // Moves among the visible rows; hidden concluded rows keep their place.
  function move(id: string, delta: number) {
    const visible = visibleDay.map((row) => row.id);
    const neighbour = visible[visible.indexOf(id) + delta];
    if (!neighbour) return;
    const all = dayList.map((row) => row.id);
    const ids = moveId(all, id, all.indexOf(neighbour) - all.indexOf(id));
    const position = ids.filter((item) => visible.includes(item)).indexOf(id);
    void reorderTo(
      ids,
      id,
      `${titleOf(id)}: posição ${position + 1} de ${visible.length}.`,
    );
  }
  function dropOn(targetId: string) {
    const id = dragId;
    dragId = null;
    if (!id || id === targetId) return;
    const all = dayList.map((row) => row.id);
    const ids = moveId(all, id, all.indexOf(targetId) - all.indexOf(id));
    void reorderTo(ids, id, `${titleOf(id)} mudou de posição.`);
  }
  async function changeTime(
    row: Occurrence,
    time: string | null,
    scope: TimeScope,
  ) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await setRowTime(row, time, scope);
      // A fixed time takes the row to where that time falls in the day.
      if (time && dayList.some((item) => item.id === row.id)) {
        const others = dayList.filter((item) => item.id !== row.id);
        const at = others.findIndex((item) => {
          const slot = slots.get(item.id);
          return (
            !!slot?.time &&
            (slot.kind === 'anchor' || slot.kind === 'computed') &&
            slot.time > time
          );
        });
        const ordered = [...others];
        ordered.splice(at < 0 ? ordered.length : at, 0, row);
        localOrder = ordered.map((item) => item.id);
        await saveDayOrder(today, ordered);
      }
      notice = time
        ? `Hora de “${row.title}” fixada em ${time}${
            rowInfos.get(row.id)?.recurring
              ? scope === 'today'
                ? ', só hoje'
                : ', daqui para frente'
              : ''
          }.`
        : `“${row.title}” sem hora fixa; a hora segue a ordem do dia.`;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível mudar a hora.';
    } finally {
      busy = false;
    }
    await tick();
    document
      .querySelector<HTMLElement>(
        `[data-day-row="${CSS.escape(row.id)}"] .time-button`,
      )
      ?.focus();
  }
  const completionOf = (row: Occurrence) =>
    view?.completedEvents.find((event) => event.taskId === row.taskId);
  async function undoRow(row: Occurrence) {
    const event = completionOf(row);
    if (busy || !event) return;
    busy = true;
    try {
      await undoTask(row.taskId, event.id);
      notice = `Conclusão de “${row.title}” desfeita.`;
      if (lastDone?.eventId === event.id) lastDone = undefined;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível desfazer.';
    } finally {
      busy = false;
    }
  }
  let showAllStalled = $state(false);
  const visibleStalled = $derived(
    showAllStalled ? stalled : stalled.slice(0, 3),
  );
  let lastDone = $state<{ title: string; taskId: number; eventId: string }>();
  async function quickComplete(row: Occurrence) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      const task = data?.tasks.find((item) => item.id === row.taskId);
      const event = await completeTask(row.taskId, {
        occurrenceDate: task?.recurrence ? today : undefined,
      });
      lastDone = event
        ? { title: row.title, taskId: row.taskId, eventId: event.id }
        : undefined;
      notice = event
        ? ''
        : 'Esta missão já estava concluída. Sua recompensa foi preservada.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível concluir.';
    } finally {
      busy = false;
    }
  }
  async function undoLast() {
    if (busy || !lastDone) return;
    busy = true;
    try {
      await undoTask(lastDone.taskId, lastDone.eventId);
      notice = `Conclusão de “${lastDone.title}” desfeita.`;
      lastDone = undefined;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível desfazer.';
    } finally {
      busy = false;
    }
  }
  const received = $derived(
    (data?.events ?? [])
      .filter(
        (event) =>
          event.date === today &&
          (['task', 'review', 'project'].includes(event.kind) ||
            (event.kind === 'adjustment' && !!event.sourceEventId)),
      )
      .reduce(
        (sum, event) => ({
          xp: sum.xp + event.reward.xp,
          gold: sum.gold + event.reward.gold,
          food: sum.food + event.reward.food,
        }),
        { xp: 0, gold: 0, food: 0 },
      ),
  );
  const earned = $derived(
    ALL_ACHIEVEMENTS.filter(
      (item) =>
        !item.future &&
        data?.achievementReceipts.some(
          (receipt) => receipt.id === item.id && !receipt.invalidatedAt,
        ),
    ),
  );
  const nextAchievement = $derived(
    ALL_ACHIEVEMENTS.find(
      (item) =>
        !item.future &&
        !earned.some((achievement) => achievement.id === item.id),
    ),
  );
  const stage = $derived(
    getEcoStageForTotalXp(data?.profile?.totalXpEarned ?? 0),
  );
  const cards = [
    {
      title: 'Mundo',
      icon: 'mundo',
      image: paintings.map,
      href: '/mundo',
      copy: 'Explore o mapa, acompanhe a campanha e continue suas aventuras.',
    },
    {
      title: 'Aposentos',
      icon: 'refugio',
      image: paintings.refuge,
      href: '/aposentos',
      copy: 'Consulte seu espaço pessoal, equipamentos e progresso preservado.',
    },
    {
      title: 'Projetos',
      icon: 'projetos_navegacao',
      image: paintings.projects,
      href: '/projetos',
      copy: 'Planeje e acompanhe seus projetos de longo prazo.',
    },
  ];
  const taskIcon = (row: Occurrence) =>
    areaIconKey(
      data?.tasks.find((task) => task.id === row.taskId),
      data?.areas ?? [],
      data?.profile?.generalAreaIconKey,
    );
  async function execute(row: Occurrence) {
    if (busy) return;
    busy = true;
    try {
      const session = data?.sessions.find(
        (session) =>
          session.status !== 'ended' && session.occurrenceIds.includes(row.id),
      );
      if (session) {
        await saveSession({ ...session, status: 'active' }, session.revision);
        await goto('/sessoes');
        return;
      }
      const task = data?.tasks.find((task) => task.id === row.taskId);
      if (task && usesTaskExecution(task, row, today)) {
        await goto('/missao/' + row.taskId);
        return;
      }
      await ensureOccurrence(row.taskId, row.originDate, row.reconstructed);
      await goto('/ocorrencia/' + encodeURIComponent(row.id));
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível abrir a ocorrência.';
    } finally {
      busy = false;
    }
  }
  function setPriority(value: string) {
    pinned = value ? Number(value) : null;
    if (!savePriority(pinned))
      error =
        'Sua escolha vale nesta visita, mas não pôde ser salva neste navegador.';
  }
</script>

<svelte:head><title>Hoje · Level Me Up</title></svelte:head>
<div class="today-view">
  {#if error}<p class="journey-error" role="alert">
      {error} <a href="/" data-sveltekit-reload>Tentar novamente</a>
    </p>{/if}
  {#if notice}<p class="journey-banner" role="status">{notice}</p>{/if}
  {#if lastDone}<div class="undo-toast" role="status">
      <span aria-hidden="true">✓</span>
      <span class="undo-text">“{lastDone.title}” concluída.</span>
      <a href="/progresso">Por que ganhei isso?</a>
      <button type="button" disabled={busy} onclick={undoLast}>Desfazer</button>
      <button
        type="button"
        class="undo-close"
        aria-label="Fechar aviso"
        onclick={() => (lastDone = undefined)}>✕</button
      >
    </div>{/if}
  {#if actionError}<p class="journey-error" role="alert">{actionError}</p>{/if}
  {#if !data}<p role="status">Abrindo sua jornada…</p>{:else}
    <header class="journey-heading today-hero">
      <img
        src={paintings.vedria}
        alt="Viajante contemplando Vèdria ao pôr do sol"
        fetchpriority="high"
      />
      <div class="hero-copy">
        <h1>{greeting}{name ? `, ${name}` : ''}.</h1>
        <p>{heroLine}</p>
      </div>
      <span class="today-date"
        ><ApprovedIcon name="agenda" size={26} />{now.toLocaleDateString(
          'pt-BR',
          { weekday: 'short', day: '2-digit', month: 'short' },
        )}</span
      >
      <a class="hero-profile" href="/perfil"
        >Seu personagem · Nível {data.profile?.level ?? 1}{data.companion
          ? ` · ${data.companion.name}`
          : ''}</a
      >
    </header>
    <BackupReminder
      hasContent={hasBackupContent({
        tasks: data.tasks.length,
        projects: data.projects.length,
        events: data.events.length,
        profile: data.profile,
      })}
    />
    <div class="today-main">
      <div class="today-plan">
        <section
          class="next-mission rpg-frame"
          class:next-empty={!next}
          aria-labelledby="next-title"
        >
          <ApprovedIcon
            name={next ? taskIcon(next) : 'missions'}
            size={next ? 56 : 48}
          />
          <div class="next-copy">
            <p class="gold-label">Próxima missão</p>
            <h2 id="next-title">
              {next?.title ??
                (planned.length
                  ? 'Seu plano está em dia'
                  : 'Qual será seu primeiro passo?')}
            </h2>
            {#if next}<p class="mission-meta">
                <ApprovedIcon name="horario" size={22} />{next.estimatedMinutes
                  ? `${next.estimatedMinutes} min`
                  : 'Tempo livre'} · {next.plannedTime ?? 'Horário flexível'} · {next.taskId ===
                pinned
                  ? 'Escolhida por você'
                  : ['active', 'paused', 'partial'].includes(next.status)
                    ? 'Em andamento'
                    : planned.some((row) => row.id === next.id)
                      ? 'Planejada para hoje'
                      : 'Sugestão flexível'}
              </p>{:else}<p>
                Escolha uma missão curta, de poucos minutos, para abrir sua
                jornada de hoje.
              </p>{/if}
          </div>
          {#if next}<Button
              size="l"
              disabled={busy}
              onclick={() => execute(next)}>Começar missão</Button
            >{:else}<Button size="l" onclick={() => (open = true)}
              >Nova missão</Button
            >{/if}
          <ContextMenu
            label={next
              ? `Ações de hoje para ${next.title}`
              : 'Escolher próxima missão'}
            >{#if next}<Button
                variant="quiet"
                disabled={busy}
                onclick={() => chooseAction(next!, 'remove')}
                >Remover de hoje</Button
              ><Button
                variant="quiet"
                disabled={busy}
                onclick={() => chooseAction(next!, 'reschedule')}
                >Reagendar</Button
              >{/if}<label class="priority-option"
              >Manter em destaque<select
                value={pinned ?? ''}
                onchange={(event) => setPriority(event.currentTarget.value)}
                ><option value="">Seleção automática</option
                >{#each todayRows.filter((row) => row.status !== 'completed') as row (row.id)}<option
                    value={row.taskId}
                    >{row.title} · {row.plannedTime ?? 'Flexível'}</option
                  >{/each}</select
              ></label
            >
          </ContextMenu>
        </section>
        <section class="day-plan rpg-frame" aria-labelledby="plan-title">
          <header>
            <h2 id="plan-title">
              Plano do dia <small
                >({countLabel(planned.length, 'missão', 'missões')})</small
              >
            </h2>
            <a href="/missoes?view=agenda&mode=day"
              ><ApprovedIcon name="agenda" size={24} />Ver agenda →</a
            >
          </header>
          {#if dayList.length}<div class="day-tools">
              <p class="day-legend">
                <span class="legend-anchor" aria-hidden="true"></span> hora fixa
                · ≈ hora calculada pela ordem e pela duração{#if withoutDuration}{` · ${countLabel(withoutDuration, 'item', 'itens')} sem duração (contam 15 min)`}{/if}
              </p>
              {#if doneCount}<Button
                  variant="quiet"
                  size="s"
                  aria-pressed={hideDone}
                  onclick={() => (hideDone = !hideDone)}
                  >{hideDone
                    ? `Mostrar concluídas (${doneCount})`
                    : `Ocultar concluídas (${doneCount})`}</Button
                >{/if}
              {#if visibleDay.length > 1}<Button
                  variant="quiet"
                  size="s"
                  aria-pressed={reorder}
                  onclick={() => (reorder = !reorder)}
                  >{reorder ? 'Pronto' : 'Reordenar'}</Button
                >{/if}
            </div>{/if}
          <p class="sr-only" role="status" aria-live="polite">{moved}</p>
          {#snippet planRow(row: Occurrence, ordered = false)}
            {@const info = rowInfos.get(row.id)}
            {@const slot = ordered ? slots.get(row.id) : undefined}
            {@const index = ordered ? visibleDay.indexOf(row) : -1}
            {@const isDone = row.status === 'completed'}
            {@const conflict = ordered ? conflictBefore.get(row.id) : undefined}
            {#if conflict}<li class="day-conflict" role="note">
                {`${titleOf(conflict.id)} termina às ${conflict.end} e invade ${row.title} (${row.plannedTime}) em ${conflict.minutes} min.`}
              </li>{/if}
            <li
              data-day-row={row.id}
              ondragover={(event) => {
                if (dragId && ordered) event.preventDefault();
              }}
              ondrop={(event) => {
                event.preventDefault();
                dropOn(row.id);
              }}
            >
              <DayRow
                title={row.title}
                time={slot ? slot.time : row.plannedTime}
                timeKind={slot?.kind}
                defaultDuration={slot?.defaultDuration}
                support={info?.support}
                icon={taskIcon(row)}
                progress={row.value > 0 ? fraction(row) : 0}
                progressLabel={row.value > 0
                  ? `${Math.round(fraction(row) * 100)}% feito`
                  : ''}
                important={info?.important}
                staleDays={info?.stale}
                focus={info?.focus}
                recurring={info?.recurring}
                state={isDone
                  ? 'done'
                  : row.id === next?.id
                    ? 'next'
                    : 'normal'}
                primary={false}
                canComplete={info?.canComplete}
                canUndo={isDone && !!completionOf(row)}
                {busy}
                reorder={ordered && reorder}
                canMoveUp={ordered && index > 0}
                canMoveDown={ordered &&
                  index >= 0 &&
                  index < visibleDay.length - 1}
                dragging={dragId === row.id}
                oncomplete={() => quickComplete(row)}
                onundo={() => undoRow(row)}
                onopen={() => execute(row)}
                onmove={ordered ? (delta) => move(row.id, delta) : undefined}
                ontime={isDone
                  ? undefined
                  : (time, scope) => changeTime(row, time, scope)}
                onreschedule={() => chooseAction(row, 'reschedule')}
                ondragstart={ordered && !isDone
                  ? (event) => {
                      dragId = row.id;
                      event.dataTransfer?.setData('text/plain', row.title);
                      if (event.dataTransfer)
                        event.dataTransfer.effectAllowed = 'move';
                    }
                  : undefined}
                ondragend={() => (dragId = null)}
              >
                {#snippet menu()}{#if !isDone}<ContextMenu
                      label={`Mais ações para ${row.title}`}
                      ><Button
                        variant="quiet"
                        disabled={busy}
                        onclick={() => execute(row)}
                        >{row.value > 0 ? 'Retomar' : 'Iniciar'}</Button
                      ><Button
                        variant="quiet"
                        disabled={busy}
                        onclick={() => chooseAction(row, 'remove')}
                        >Remover de hoje</Button
                      ><Button
                        variant="quiet"
                        disabled={busy}
                        onclick={() => chooseAction(row, 'reschedule')}
                        >Remarcar</Button
                      ></ContextMenu
                    >{/if}{/snippet}
              </DayRow>
            </li>
          {/snippet}
          {#if dayList.length || stalled.length}<ul class="day-list">
              {#each visibleDay as row (row.id)}{@render planRow(
                  row,
                  true,
                )}{/each}
            </ul>
            {#if stalled.length}<div
                class="stalled"
                aria-labelledby="stalled-title"
              >
                <h3 id="stalled-title">
                  Paradas há mais tempo <small>({stalled.length})</small>
                </h3>
                <p class="lmu-hint">
                  Nada aqui vence. Se uma couber hoje, comece por ela.
                </p>
                <ul>
                  {#each visibleStalled as row (row.id)}{@render planRow(
                      row,
                    )}{/each}
                </ul>
                {#if stalled.length > 3}<Button
                    variant="quiet"
                    size="s"
                    onclick={() => (showAllStalled = !showAllStalled)}
                    >{showAllStalled
                      ? 'Mostrar menos'
                      : `Ver as ${stalled.length} paradas`}</Button
                  >{/if}
              </div>{/if}
          {:else}<p class="empty-plan">
              {planned.length
                ? 'Nenhuma missão pendente. Seu progresso está registrado.'
                : 'Seu dia ainda está livre. Adicione uma missão para montar seu plano.'}
            </p>{/if}
          <div class="day-plan-footer">
            {#if next}<Button
                variant="quiet"
                size="s"
                onclick={() => (open = true)}
                ><ApprovedIcon name="criar" size={22} />Nova missão</Button
              >{/if}
            <a href="/missoes">Ver todas as missões</a>
          </div>
        </section>
      </div>
      <aside class="today-aside">
        <section class="rpg-frame daily-summary">
          <h2>Progresso do dia</h2>
          <div>
            <DayProgress {completed} total={planned.length} noun="missões" />
            <div class="daily-rewards">
              {#each [{ icon: 'xp', label: 'XP', amount: received.xp }, { icon: 'ouro', label: 'Ouro', amount: received.gold }, { icon: 'alimentacao', label: 'Comida', amount: received.food }] as resource (resource.label)}
                <span>
                  <ApprovedIcon name={resource.icon} size={32} />
                  <strong
                    >{resource.amount >= 0 ? '+' : ''}{resource.amount}</strong
                  >
                  <small>{resource.label}</small>
                </span>
              {/each}
            </div>
          </div>
        </section>
        <InvestmentGoalCard {data} />
        {#key today}<SupplyBoxesCard {today} />{/key}
        <section class="rpg-frame upcoming-achievement">
          <ApprovedIcon name="conquista" size={48} />
          <div>
            <p class="gold-label">Próxima conquista</p>
            <strong>{nextAchievement?.title ?? 'Suas conquistas'}</strong>
            <p>
              {nextAchievement?.description ?? 'Veja as marcas da sua jornada.'}
            </p>
            <a href="/trofeus">Ver conquistas →</a>
          </div>
        </section>
      </aside>
    </div>
    <section class="rpg-frame today-completions" aria-label="Concluídas hoje">
      <header>
        <h2>
          Concluídas hoje <small
            >({countLabel(
              (view?.completedEvents.length ?? 0) + (view?.legacy.length ?? 0),
              'conclusão',
              'conclusões',
            )})</small
          >
        </h2>
        <p>Execuções realizadas hoje, incluindo atividades de outras datas.</p>
      </header>
      {#if view?.completedEvents.length || view?.legacy.length}<ul>
          {#each view?.completedEvents ?? [] as event (event.id)}<li>
              <ApprovedIcon name="concluida" size={26} />
              <div>
                <strong
                  >{event.taskTitle ??
                    data.tasks.find((task) => task.id === event.taskId)
                      ?.title ??
                    'Atividade concluída'}</strong
                ><small
                  >Realizada hoje · +{event.reward.xp} XP · +{event.reward.gold} Ouro</small
                >
              </div>
            </li>{/each}{#each view?.legacy ?? [] as task (task.id)}<li>
              <strong>{task.title}</strong><small
                >Conclusão anterior preservada</small
              >
            </li>{/each}
        </ul>{:else}<p class="lmu-hint">
          Suas conclusões aparecerão aqui conforme você realizar as atividades.
        </p>{/if}
    </section>
    {#if view?.removed.length}<details class="rpg-frame today-secondary">
        <summary>Removidas de hoje ({view.removed.length})</summary>
        <p class="lmu-hint">
          Não são sugeridas novamente hoje. Cadastro e execução permanecem
          preservados.
        </p>
        <ul>
          {#each view.removed as row (row.id)}<li>
              <strong>{row.title}</strong><Button
                variant="quiet"
                disabled={busy}
                onclick={() => applyAction(row, 'restore', false)}
                >Devolver a hoje</Button
              >
            </li>{/each}
        </ul>
      </details>{/if}
    <nav class="world-cards" aria-label="Explore seu mundo">
      {#each cards as card (card.href + card.title)}<a
          class="rpg-frame world-card"
          href={card.href}
          id={card.title === 'Mundo' ? 'home-map' : undefined}
          ><img src={card.image} alt="" loading="lazy" />
          <div>
            <h2><ApprovedIcon name={card.icon} size={32} />{card.title}</h2>
            <p>{card.copy}</p>
            <span class="card-arrow" aria-hidden="true">→</span>
          </div></a
        >{/each}
    </nav>
    <section class="rpg-frame horizons" aria-label="O caminho adiante">
      <RpgTrim />
      <div class="horizon-title">
        <ApprovedIcon name="evolucao" size={40} />
        <h2>O caminho adiante</h2>
        <p>Seu progresso no mundo e na jornada pessoal.</p>
      </div>
      <WorldProgress totalXp={data.profile?.totalXpEarned ?? 0} />
      <div class="horizon-hero">
        {#if data.profile}<HeroIdentity
            profile={data.profile}
            owned={data.owned}
            achievements={earned.map((item) => item.title)}
            compact
          />{/if}
      </div>
      <div>
        <ApprovedIcon name="conquista" size={34} />
        <p class="gold-label">Suas conquistas</p>
        <h3>{earned.length} conquistadas</h3>
        <p>Seu mundo: {stage.label}</p>
        <a href="/trofeus">Ver conquistas →</a>
      </div>
    </section>
    <QuickCreate bind:open snapshot={data} />
  {/if}
</div>

<Dialog
  bind:open={actionOpen}
  title={dayAction?.action === 'remove'
    ? 'Remover somente de hoje?'
    : 'Reagendar ocorrência'}
>
  {#if dayAction}<p>{dayAction.row.title}</p>
    {#if dayAction.requiresConfirmation}<p>
        O progresso já registrado e os recibos serão preservados. Remover de
        hoje não remove a atividade da sessão iniciada. Reagendar não pode
        alterar uma ocorrência congelada por uma sessão.
      </p>{/if}{#if dayAction.action === 'reschedule'}<label
        class="journey-label lmu-field"
        >Nova data<input type="date" bind:value={rescheduleDate} /></label
      >{/if}{#if actionError}<p role="alert" class="journey-error">
        {actionError}
      </p>{/if}
    <div class="journey-actions">
      <Button
        disabled={busy}
        onclick={() => applyAction(dayAction!.row, dayAction!.action, true)}
        >{dayAction.action === 'remove'
          ? 'Remover de hoje'
          : 'Confirmar reagendamento'}</Button
      ><Button
        variant="quiet"
        disabled={busy}
        onclick={() => {
          actionOpen = false;
          dayAction = undefined;
        }}>Cancelar</Button
      >
    </div>{/if}
</Dialog>

<style>
  .today-completions,
  .today-secondary {
    padding: 18px;
    margin: 16px 0;
  }
  .today-completions h2 {
    font-family: var(--lmu-display);
    color: var(--d05-heading);
    font-size: 1.6rem;
    margin: 0;
  }
  .today-completions header p,
  .today-secondary p {
    color: #aebfae;
    font-size: 0.8rem;
  }
  .today-completions ul,
  .today-secondary ul {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
    display: grid;
    gap: 8px;
  }
  .today-completions li,
  .today-secondary li {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border: 1px solid var(--d05-border);
    border-radius: 7px;
  }
  .today-completions li div {
    flex: 1;
    min-width: 0;
  }
  .today-completions small {
    display: block;
    color: #afbfaa;
    font-size: 0.77rem;
  }
  .today-secondary summary {
    cursor: pointer;
    color: var(--d05-label);
  }
  .priority-option {
    display: grid;
    gap: 8px;
    padding: 10px 8px;
    color: #dfd5b5;
    font-size: 0.85rem;
  }
  .priority-option select {
    max-width: 100%;
    min-width: 0;
    background: #071416;
    color: #f1e5c9;
    border: 1px solid var(--d05-border);
    border-radius: 6px;
    padding: 8px;
  }
  @media (max-width: 700px) {
    .today-secondary li {
      flex-wrap: wrap;
    }
  }

  .today-view {
    display: grid;
    gap: 16px;
    min-width: 0;
    /* D05: gold only for the main action, rewards and progress. */
    --lmu-border: #6f7f79;
    --rpg-line: #6b7a7473;
    --rpg-engraving: #a7b2a740;
    --d05-heading: #ece4d0;
    --d05-label: #c3cabd;
    --d05-link: #d6e2db;
    --d05-border: #5f6f6a66;
    --d05-surface-1: #061115f5;
    --d05-surface-2: #0c1b1e;
    --d05-surface-3: #15272b;
  }
  .today-hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'copy date' 'profile date';
    align-content: center;
    gap: 8px 16px;
    min-height: 144px;
    padding: 16px 20px;
    margin: 0;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid var(--d05-border);
  }
  .today-hero > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 42%;
  }
  .today-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, #061115f5 20%, #06111580 65%, #06111522),
      linear-gradient(0deg, #02090b80, transparent 55%);
    pointer-events: none;
  }
  .hero-copy {
    position: relative;
    grid-area: copy;
    display: grid;
    gap: 6px;
    z-index: 1;
    max-width: 700px;
    min-width: 0;
  }
  .hero-copy h1 {
    font: 500 clamp(1.8rem, 2.8vw, 2.65rem)/1.1 var(--lmu-display);
    color: #fff1d6;
    margin: 0;
  }
  .hero-copy > p:last-child {
    font: 500 0.85rem/1.4 var(--lmu-font);
    color: #fff3da;
    margin: 0;
  }
  .today-date {
    position: relative;
    grid-area: date;
    align-self: start;
    justify-self: end;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #061115ee;
    border: 1px solid var(--d05-border);
    border-radius: 6px;
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
  .hero-profile {
    position: relative;
    grid-area: profile;
    z-index: 1;
    font-size: 0.75rem;
    color: #d7dfcf;
    text-decoration: none;
  }
  .today-main {
    display: grid;
    align-items: start;
    grid-template-columns: minmax(0, 1.85fr) minmax(285px, 1fr);
    gap: 16px;
  }
  .today-plan {
    grid-template-rows: auto auto;
  }
  .today-plan,
  .today-aside {
    display: grid;
    gap: 14px;
  }
  .next-mission {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background:
      linear-gradient(90deg, #2f2418f0, #111916df),
      url('/art/approved/paintings/04_Cartao_Projetos.webp') center/cover;
  }
  .next-mission.next-empty {
    padding: 14px 18px;
    gap: 12px;
  }
  .next-mission.next-empty > .next-copy h2 {
    font-size: 1.55rem;
    margin: 4px 0 6px;
  }
  .next-empty > .next-copy > p:last-child {
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 0;
  }
  .next-copy {
    flex: 1;
    min-width: 0;
  }
  .gold-label {
    color: var(--d05-label);
    font: 600 1.2rem var(--lmu-display);
    margin: 0 0 3px;
  }
  .next-copy h2 {
    font: 500 2rem/1.05 var(--lmu-display);
    color: #fff2d9;
    margin: 5px 0 10px;
  }
  .mission-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: #d5d8c9;
  }
  .day-plan {
    padding: 0 18px 8px;
  }
  .day-plan > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #61705b66;
  }
  .day-plan h2,
  .today-aside h2 {
    font: 500 1.55rem var(--lmu-display);
    color: var(--d05-heading);
  }
  .day-plan h2 small {
    font-size: 0.85rem;
  }
  .day-plan a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--d05-link);
    text-decoration: none;
    font-size: 0.8rem;
  }
  .day-plan ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .day-plan li {
    display: block;
    border-bottom: 1px solid #55624e55;
    padding: 2px 0;
  }
  .day-plan li :global(.lmu-button) {
    min-height: 36px;
    min-width: 36px;
    padding: 4px;
  }
  .day-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    padding: 8px 0 4px;
  }
  .day-legend {
    flex: 1 1 260px;
    margin: 0;
    font-size: 0.8rem;
    color: #a6b9a6;
  }
  .legend-anchor {
    display: inline-block;
    width: 7px;
    height: 7px;
    margin: 0 2px 1px;
    background: #eee9db;
    transform: rotate(45deg);
  }
  .day-plan li.day-conflict {
    margin: 4px 0;
    padding: 8px 12px;
    border: 1px solid #e08a6f88;
    border-radius: 8px;
    background: #e08a6f14;
    color: #f2c4b3;
    font-size: 0.85rem;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .stalled {
    margin-top: 14px;
    display: grid;
    gap: 4px;
  }
  .stalled h3 {
    margin: 0;
    font: 600 1rem var(--lmu-font);
    color: #eee9db;
  }
  .stalled h3 small {
    color: #a6b9a6;
    font-weight: 400;
  }
  .stalled .lmu-hint {
    margin: 0 0 4px;
    font-size: 0.8rem;
  }
  .undo-toast {
    position: fixed;
    z-index: 30;
    left: 50%;
    bottom: calc(84px + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    max-width: min(560px, calc(100vw - 32px));
    padding: 10px 14px;
    border: 1px solid #3b5047;
    border-radius: 8px;
    background: #101f23;
    color: #eee9db;
    box-shadow: 0 8px 24px #0009;
    font: 400 0.9rem var(--lmu-font);
  }
  .undo-toast > span:first-child {
    color: #9fd6c8;
    font-weight: 700;
  }
  .undo-text {
    flex: 1 1 160px;
  }
  .undo-toast a {
    color: #d6e2db;
    font-size: 0.85rem;
  }
  .undo-toast button {
    min-height: 36px;
    padding: 4px 12px;
    border: 1px solid #70868b;
    border-radius: 6px;
    background: #071114;
    color: #eee9db;
    font: 600 0.85rem var(--lmu-font);
    cursor: pointer;
  }
  .undo-toast .undo-close {
    border: 0;
    background: none;
    color: #a6b9a6;
    min-width: 36px;
  }
  @media (min-width: 1024px) {
    .undo-toast {
      bottom: 24px;
    }
  }
  .day-plan-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .empty-plan {
    padding: 18px 0;
    color: #aebfab;
    font-size: 0.85rem;
  }
  .daily-summary {
    padding: 14px 18px;
  }
  .daily-summary > div {
    display: grid;
    justify-items: center;
    gap: 14px;
    margin-top: 12px;
  }
  .daily-summary h2 {
    text-align: center;
    margin: 0;
  }
  .daily-rewards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
    gap: 8px;
    border-top: 1px solid var(--d05-border);
    padding-top: 12px;
  }
  .daily-rewards > span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 0.85rem;
    min-width: 0;
    overflow-wrap: anywhere;
    text-align: center;
  }
  .daily-rewards strong {
    font-weight: 600;
  }
  .daily-rewards small {
    color: #bdc9b7;
    font-size: 0.75rem;
  }
  .today-aside {
    align-content: start;
  }
  .upcoming-achievement {
    display: flex;
    gap: 12px;
    padding: 16px;
  }
  .upcoming-achievement > div {
    min-width: 0;
  }
  .upcoming-achievement strong {
    display: block;
    line-height: 1.25;
    overflow-wrap: anywhere;
    font: 500 1.3rem/1.25 var(--lmu-display);
  }
  .upcoming-achievement p:not(.gold-label) {
    font-size: 0.75rem;
    color: #afbfad;
    margin: 5px 0;
  }
  .upcoming-achievement a {
    color: var(--d05-link);
    font-size: 0.75rem;
  }
  .world-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .world-card {
    overflow: hidden;
    display: block;
    text-decoration: none;
  }
  .world-card > img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    object-position: center 48%;
    display: block;
  }
  .world-card > div {
    position: relative;
    padding: 10px 14px 14px;
    min-height: 105px;
  }
  .world-card h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font: 500 1.7rem var(--lmu-display);
    color: #f5e9c9;
  }
  .world-card p {
    font-size: 0.77rem;
    color: #bdcdbf;
    line-height: 1.5;
    max-width: 90%;
    margin-top: 5px;
  }
  .card-arrow {
    position: absolute;
    right: 12px;
    top: 18px;
    color: var(--d05-link);
  }
  .day-plan,
  .daily-summary,
  .upcoming-achievement,
  .horizons {
    --rpg-line: var(--d05-border);
  }
  .upcoming-achievement .gold-label,
  .horizons .gold-label {
    color: #d6c9a9;
  }
  .horizons {
    display: grid;
    grid-template-columns: 0.9fr 0.95fr 1.5fr 0.8fr;
    padding: 18px;
    gap: 16px;
  }
  .horizons > div,
  .horizons :global(.world-progress) {
    min-width: 0;
    border-left: 1px solid #897b4a55;
    padding-left: 16px;
  }
  .horizons > .horizon-title {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    align-content: start;
    align-items: center;
    gap: 6px 10px;
    border: 0;
    padding: 0;
  }
  .horizon-title > p {
    grid-column: 1 / -1;
  }
  .horizon-title h2 {
    font: 500 1.6rem var(--lmu-display);
    color: var(--d05-heading);
  }
  .horizons h3 {
    font: 500 1.4rem var(--lmu-display);
    color: #eee4c8;
  }
  .horizons p:not(.gold-label) {
    font-size: 0.75rem;
    color: #afc0ad;
    margin: 6px 0;
  }
  .horizons a {
    font-size: 0.75rem;
    color: var(--d05-link);
  }
  .horizons :global(progress) {
    width: 100%;
    margin: 8px 0;
  }
  .horizons :global(.world-progress h2) {
    font-size: 1.4rem;
  }
  .horizons :global(.world-progress .lmu-eyebrow) {
    font-size: 0.75rem;
  }
  .horizons :global(.world-progress a) {
    min-height: 28px;
  }
  .horizons .gold-label {
    font-size: 0.95rem;
  }
  @media (max-width: 1100px) {
    .today-main {
      grid-template-columns: 1.6fr 1fr;
    }
    .next-mission {
      flex-wrap: wrap;
    }
    .next-mission > :global(.lmu-button) {
      margin-left: auto;
    }
    .horizons {
      grid-template-columns: repeat(2, 1fr);
    }
    .world-cards {
      gap: 10px;
    }
    .world-card h2 {
      font-size: 1.4rem;
    }
  }
  @media (max-width: 760px) {
    .today-hero {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'copy' 'profile';
      padding: 16px;
      min-height: 156px;
    }
    .hero-copy {
      max-width: 100%;
      padding-top: 24px;
    }
    .hero-copy h1 {
      font-size: 1.9rem;
    }
    .today-hero > img {
      object-position: 76% center;
    }
    .today-date {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 0.75rem;
      padding: 0.2rem 0.35rem;
    }
    .today-date :global(img) {
      width: 20px;
      height: 20px;
    }
    .today-main {
      grid-template-columns: 1fr;
    }
    .today-aside {
      grid-template-columns: 1fr;
    }
    .daily-summary > div {
      gap: 8px;
    }
    .daily-summary {
      padding: 14px;
    }
    .upcoming-achievement {
      align-items: flex-start;
    }
    .next-copy h2 {
      font-size: 1.8rem;
    }
    .next-mission {
      gap: 10px;
      padding: 16px;
    }
    .world-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .horizons {
      gap: 14px;
      padding: 16px;
    }
    .horizons > div,
    .horizons :global(.world-progress) {
      padding-left: 0;
      border: 0;
    }
    .day-plan > header {
      flex-wrap: wrap;
    }
    .day-plan li :global(.lmu-button) {
      min-height: 44px;
      min-width: 44px;
    }
    .day-plan h2 {
      font-size: 1.35rem;
    }
    .world-card > img {
      height: 110px;
    }
    .horizons .horizon-title {
      grid-column: 1/-1;
    }
    .world-card > div {
      padding: 10px;
      min-height: 120px;
    }
    .day-plan-footer {
      flex-wrap: wrap;
    }
    .today-aside h2 {
      font-size: 1.3rem;
    }
  }

  @media (max-width: 760px) {
    .next-mission {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) auto;
      align-items: start;
    }
    .next-mission > .next-copy {
      grid-column: 2/4;
    }
    .next-mission > .next-copy h2 {
      font-size: 1.7rem;
    }
    .next-mission :global(.lmu-button) {
      grid-column: 2;
      justify-self: start;
    }
    .next-mission :global(.context-trigger) {
      grid-column: 3;
    }
    .next-copy .gold-label {
      font-size: 1rem;
    }
    .mission-meta {
      font-size: 0.75rem;
    }
  }
  @media (max-width: 360px) {
    .world-card h2 {
      font-size: 1.15rem;
      gap: 6px;
      white-space: nowrap;
    }
    .card-arrow {
      top: auto;
      bottom: 10px;
      right: 8px;
    }
  }
  .horizons .horizon-hero :global(.hero-identity) {
    gap: 12px;
    align-items: flex-start;
  }
  .horizons .horizon-hero :global(.hero-details) {
    grid-template-columns: minmax(0, 1fr);
  }
  .horizons .horizon-hero :global(.hero-resources) {
    grid-column: 1;
    grid-row: auto;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.3rem 0.8rem;
  }
  @media (max-width: 760px) {
    .horizons {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
