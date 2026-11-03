<script lang="ts">
  import { todayView } from './todayView';
  import {
    changeToday,
    dayChangeNeedsConfirmation,
  } from '$services/dailyPlanningService';
  import ContextMenu from '$lib/ui/ContextMenu.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  import { addCalendarDays, formatCalendar } from '$services/calendar';
  import { areaIconKey } from '$services/areaIcons';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import { ensureOccurrence } from '$services/occurrenceService';
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
  import { guardUpdates } from './guardUpdates';
  import {
    readPriority,
    savePriority,
    PRIORITY_KEY,
    selectNextOccurrence,
    usesTaskExecution,
  } from './homePriority';
  let data = $state<JourneySnapshot>();
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
  const view = $derived(data ? todayView(data, today) : undefined);
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
      : (selectNextOccurrence(view?.planned ?? []) ??
          selectNextOccurrence(view?.flexible ?? []));
  });
  const completed = $derived(
    planned.filter((row) => row.status === 'completed').length,
  );
  const remaining = $derived(
    planned.filter((row) => row.id !== next?.id && row.status !== 'completed'),
  );
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
    );
  async function execute(row: Occurrence) {
    if (busy) return;
    busy = true;
    try {
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
  {#if actionError}<p class="journey-error" role="alert">{actionError}</p>{/if}
  {#if !data}<p role="status">Abrindo sua jornada…</p>{:else}
    <header class="journey-heading today-hero">
      <img
        src={paintings.vedria}
        alt="Viajante contemplando Vèdria ao pôr do sol"
        fetchpriority="high"
      />
      <div class="hero-copy">
        <p class="lmu-eyebrow">Hoje · Level Me Up</p>
        <h1>{greeting}{name ? `, ${name}` : ''}.</h1>
        <p>Seu plano de hoje, em um só lugar.</p>
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
                Escolha uma missão para começar sua jornada de hoje.
              </p>{/if}
          </div>
          {#if next}<Button disabled={busy} onclick={() => execute(next)}
              ><ApprovedIcon name="comecar" size={28} />{[
                'active',
                'paused',
                'partial',
              ].includes(next.status)
                ? 'Continuar'
                : 'Começar'}</Button
            >{:else}<Button onclick={() => (open = true)}>Nova missão</Button
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
              Plano do dia <small>({planned.length} ocorrências)</small>
            </h2>
            <a href="/missoes?view=agenda&mode=day"
              ><ApprovedIcon name="agenda" size={24} />Ver agenda →</a
            >
          </header>
          {#if remaining.length}<ul>
              {#each remaining as row (row.id)}<li>
                  <span class="time-chip">{row.plannedTime ?? 'Flex.'}</span
                  ><ApprovedIcon name={taskIcon(row)} size={32} />
                  <div>
                    <button class="text-action" onclick={() => execute(row)}
                      >{row.title}</button
                    ><small
                      >{row.estimatedMinutes
                        ? `${row.estimatedMinutes} min · `
                        : ''}{data.areas.find((area) => area.id === row.areaId)
                        ?.nome ?? 'Geral'}{row.value > 0
                        ? ` · ${Math.round(fraction(row) * 100)}%`
                        : ''}</small
                    >
                  </div>
                  <ContextMenu label={`Ações de hoje para ${row.title}`}
                    ><Button
                      variant="quiet"
                      disabled={busy}
                      onclick={() => execute(row)}>Executar atividade</Button
                    ><Button
                      variant="quiet"
                      disabled={busy}
                      onclick={() => chooseAction(row, 'remove')}
                      >Remover de hoje</Button
                    ><Button
                      variant="quiet"
                      disabled={busy}
                      onclick={() => chooseAction(row, 'reschedule')}
                      >Reagendar</Button
                    ></ContextMenu
                  >
                </li>{/each}
            </ul>{:else}<p class="empty-plan">
              {planned.length
                ? 'Nenhuma outra missão pendente. Seu progresso está registrado.'
                : 'Seu dia ainda está livre. Adicione uma missão para montar seu plano.'}
            </p>{/if}
          <div class="day-plan-footer">
            {#if next}<Button variant="quiet" onclick={() => (open = true)}
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
            <DayProgress
              {completed}
              total={planned.length}
              noun="ocorrências"
            />
            <small>Somente o planejamento atual</small>
            <div class="daily-rewards">
              <span
                ><ApprovedIcon name="xp" size={32} />{received.xp >= 0
                  ? '+'
                  : ''}{received.xp} XP</span
              ><span
                ><ApprovedIcon name="ouro" size={32} />{received.gold >= 0
                  ? '+'
                  : ''}{received.gold} Ouro</span
              ><span
                ><ApprovedIcon name="alimentacao" size={26} />{received.food >=
                0
                  ? '+'
                  : ''}{received.food} Comida</span
              ><small>Recebidos hoje · ganhos líquidos</small>
            </div>
          </div>
        </section>
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
            >({(view?.completedEvents.length ?? 0) + (view?.legacy.length ?? 0)} conclusões)</small
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
                  >{event.occurrenceDate && event.occurrenceDate !== today
                    ? `Ocorrência original: ${formatCalendar(event.occurrenceDate)}`
                    : 'Realizada hoje'} · +{event.reward.xp} XP · +{event.reward
                    .gold} Ouro</small
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
    {#if view?.old.length}<details class="rpg-frame today-secondary" open>
        <summary>Atividades de outros dias ({view.old.length})</summary>
        <p class="lmu-hint">
          Ficaram pendentes. Traga para hoje ou escolha outra data, mantendo o
          progresso já registrado.
        </p>
        <ul>
          {#each view.old as row (row.id)}<li class="overdue-row">
              <div>
                <strong>{row.title}</strong><small
                  >Planejada para {formatCalendar(row.plannedDate)}{row.value >
                  0
                    ? ' · Progresso parcial preservado'
                    : ''}</small
                >
              </div>
              <div class="old-actions">
                <Button
                  disabled={busy}
                  onclick={() => chooseAction(row, 'reschedule', today)}
                  >Trazer para hoje</Button
                >
                <Button
                  variant="secondary"
                  disabled={busy}
                  onclick={() => chooseAction(row, 'reschedule')}
                  >Escolher data</Button
                >
              </div>
              <ContextMenu label={`Organizar atividade antiga ${row.title}`}
                ><Button variant="quiet" onclick={() => execute(row)}
                  >Retomar atividade</Button
                ><Button
                  variant="quiet"
                  onclick={() => chooseAction(row, 'reschedule')}
                  >Reagendar</Button
                ><a
                  class="lmu-button lmu-button--quiet"
                  href="/missoes?view=recovery"
                  >Ver recuperação de ocorrências</a
                ></ContextMenu
              >
            </li>{/each}
        </ul>
      </details>{/if}
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
    color: #edce91;
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
    border: 1px solid #8d744a44;
    border-radius: 7px;
  }
  .today-completions li div,
  .today-secondary li div {
    flex: 1;
    min-width: 0;
  }
  .today-completions small,
  .today-secondary small {
    display: block;
    color: #afbfaa;
    font-size: 0.77rem;
  }
  .today-secondary summary {
    cursor: pointer;
    color: #e4c78d;
  }
  .today-secondary li .old-actions {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    gap: 8px;
    grid-column: 1 / -1;
    grid-row: 2;
  }
  .today-secondary li.overdue-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .overdue-row :global(.context-trigger) {
    grid-column: 2;
    grid-row: 1;
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
    border: 1px solid #8f7847;
    border-radius: 6px;
    padding: 8px;
  }
  @media (max-width: 700px) {
    .today-secondary li {
      flex-wrap: wrap;
    }
    .today-secondary li > div:first-child {
      flex-basis: calc(100% - 60px);
    }
    .today-secondary li .old-actions {
      flex: 1 1 100%;
    }
  }

  .today-view {
    display: grid;
    gap: 16px;
    min-width: 0;
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
    border: 1px solid #927143;
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
  .hero-copy .lmu-eyebrow {
    color: #ffe19a;
    font-size: 0.66rem;
    margin: 0;
    letter-spacing: 0.04em;
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
    border: 1px solid #9e7b3e;
    border-radius: 6px;
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
  .hero-profile {
    position: relative;
    grid-area: profile;
    z-index: 1;
    font-size: 0.7rem;
    color: #d7dfcf;
    text-decoration: none;
  }
  .today-main {
    display: grid;
    grid-template-columns: minmax(0, 1.85fr) minmax(285px, 1fr);
    gap: 16px;
  }
  .today-plan {
    grid-template-rows: auto 1fr;
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
    color: #f0d189;
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
    color: #f2dda9;
  }
  .day-plan h2 small {
    font-size: 0.85rem;
  }
  .day-plan a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #edcb83;
    text-decoration: none;
    font-size: 0.8rem;
  }
  .day-plan ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .day-plan li {
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #55624e55;
    padding: 7px 0;
  }
  .day-plan li > div {
    flex: 1;
    min-width: 0;
  }
  .day-plan li small {
    display: block;
    font-size: 0.72rem;
    color: #a7b9ab;
  }
  .time-chip {
    background: #26342b66;
    border: 1px solid #5c6b5144;
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    font-size: 0.82rem;
    min-width: 58px;
    text-align: center;
  }
  .text-action {
    border: 0;
    background: none;
    color: #efecdf;
    font: 600 1.1rem var(--lmu-display);
    padding: 0;
    text-align: left;
  }
  .day-plan li :global(.lmu-button) {
    min-height: 34px;
    min-width: 34px;
    padding: 4px;
  }
  .day-plan-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .day-plan-footer :global(.lmu-button) {
    font-size: 0.75rem;
    min-height: 32px;
    padding: 0.3rem;
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
    display: flex;
    gap: 22px;
    justify-content: space-evenly;
    align-items: center;
    margin-top: 12px;
  }
  .daily-rewards {
    display: grid;
    gap: 6px;
    border-left: 1px solid #8d7d4b77;
    padding-left: 20px;
  }
  .daily-rewards > span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
  }
  .daily-rewards small {
    color: #98ae9f;
    font-size: 0.65rem;
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
    color: #efd399;
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
    color: #f1ce82;
  }
  .day-plan,
  .daily-summary,
  .upcoming-achievement,
  .horizons {
    --rpg-line: #a18a5b80;
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
    color: #f4e4b9;
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
    color: #edcc86;
  }
  .horizons :global(progress) {
    width: 100%;
    margin: 8px 0;
  }
  .horizons :global(.world-progress h2) {
    font-size: 1.4rem;
  }
  .horizons :global(.world-progress .lmu-eyebrow) {
    font-size: 0.65rem;
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
    }
    .hero-copy h1 {
      font-size: 1.9rem;
    }
    .hero-copy .lmu-eyebrow {
      max-width: calc(100% - 125px);
    }
    .today-hero > img {
      object-position: 76% center;
    }
    .today-date {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 0.65rem;
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
      flex-wrap: wrap;
    }
    .daily-rewards {
      border: 0;
      padding: 0;
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
    .day-plan li {
      gap: 8px;
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
      font-size: 0.68rem;
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
