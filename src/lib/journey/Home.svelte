<script lang="ts">
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
    homeOccurrences,
    usesTaskExecution,
  } from './homePriority';
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    busy = $state(false),
    open = $state(false);
  let now = $state(new Date()),
    pinned = $state<number | null>(null);
  const today = $derived(dateKey(now));
  guardUpdates(() => !data || busy);
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
  const todayRows = $derived(
    homeOccurrences(data?.plannedToday ?? [], data?.tasks ?? [], today),
  );
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
  const planned = $derived(
    todayRows.filter((row) => {
      const task = data?.tasks.find((task) => task.id === row.taskId);
      return (
        row.value > 0 ||
        !!task?.plannedDate ||
        !!task?.recurrence ||
        row.originDate !== row.plannedDate
      );
    }),
  );
  const next = $derived(
    selectNextOccurrence(
      todayRows,
      pinned ?? data?.tasks.find((task) => task.pinned)?.id ?? null,
    ),
  );
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
          !event.reversedAt &&
          ['task', 'review', 'project'].includes(event.kind),
      )
      .reduce(
        (sum, event) => ({
          xp: sum.xp + event.reward.xp,
          gold: sum.gold + event.reward.gold,
        }),
        { xp: 0, gold: 0 },
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
      title: 'Aventura',
      icon: 'aventura',
      image: paintings.adventure,
      href: '/aventura?campanha=ermos',
      copy: 'Continue a narrativa e descubra o próximo capítulo.',
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
    {
      title: 'Mapa',
      icon: 'mapa',
      image: paintings.map,
      href: '/mundo',
      copy: 'Explore os Ermos Centrais e investigue com Lucan.',
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
  {#if !data}<p role="status">Abrindo sua jornada…</p>{:else}
    <header class="today-hero">
      <img
        src={paintings.vedria}
        alt="Viajante contemplando Vèdria ao pôr do sol"
        fetchpriority="high"
      />
      <div class="hero-copy">
        <p class="lmu-eyebrow">Level Me Up · Seu mundo, sua jornada</p>
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
          <details class="next-options">
            <summary aria-label="Escolher próxima missão">⋯</summary><label
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
          </details>
        </section>
        <section class="day-plan rpg-frame" aria-labelledby="plan-title">
          <header>
            <h2 id="plan-title">
              Plano do dia <small>({planned.length} missões)</small>
            </h2>
            <a href="/missoes?view=agenda&mode=day"
              ><ApprovedIcon name="agenda" size={24} />Ver agenda →</a
            >
          </header>
          {#if remaining.length}<ul>
              {#each remaining.slice(0, 3) as row (row.id)}<li>
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
                  <Button
                    variant="quiet"
                    disabled={busy}
                    aria-label={`Executar ${row.title}`}
                    onclick={() => execute(row)}>→</Button
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
            <DayProgress {completed} total={planned.length} />
            <div class="daily-rewards">
              <span><ApprovedIcon name="xp" size={32} />+{received.xp} XP</span
              ><span
                ><ApprovedIcon name="ouro" size={32} />+{received.gold} Ouro</span
              ><small>Recebidos hoje</small>
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
    <nav class="world-cards" aria-label="Explore seu mundo">
      {#each cards as card (card.href + card.title)}<a
          class="rpg-frame world-card"
          href={card.href}
          id={card.title === 'Mapa' ? 'home-map' : undefined}
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

<style>
  .today-view {
    display: grid;
    gap: 16px;
    min-width: 0;
  }
  .today-hero {
    position: relative;
    height: 240px;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid #927143;
  }
  .today-hero > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 55% 45%;
  }
  .today-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, #02090bb8, transparent 65%),
      linear-gradient(0deg, #02090b80, transparent 40%);
    pointer-events: none;
  }
  .hero-copy {
    position: absolute;
    z-index: 1;
    top: 28px;
    left: 28px;
    max-width: 65%;
  }
  .hero-copy .lmu-eyebrow {
    color: #ffe19a;
    font-size: 0.66rem;
  }
  .hero-copy h1 {
    font: 500 clamp(2.1rem, 3.6vw, 3.5rem)/1.08 var(--lmu-display);
    color: #fff1d6;
    margin: 10px 0;
  }
  .hero-copy > p:last-child {
    font: 500 1.2rem var(--lmu-display);
    color: #fff3da;
  }
  .today-date {
    position: absolute;
    right: 18px;
    top: 16px;
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
    position: absolute;
    left: 28px;
    bottom: 14px;
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
  .next-options {
    position: relative;
  }
  .next-options summary {
    cursor: pointer;
    font-size: 1.7rem;
    list-style: none;
  }
  .next-options label {
    position: absolute;
    right: 0;
    top: 40px;
    z-index: 8;
    width: 240px;
    padding: 14px;
    background: #102328;
    border: 1px solid #a28548;
    display: grid;
    font-size: 0.8rem;
  }
  .next-options select {
    width: 100%;
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
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
      height: 280px;
    }
    .hero-copy {
      max-width: 90%;
      left: 18px;
      top: 54px;
    }
    .hero-copy h1 {
      font-size: 2.3rem;
    }
    .today-hero > img {
      object-position: 76% center;
    }
    .today-date {
      font-size: 0.7rem;
      padding: 0.25rem 0.4rem;
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
    .next-options {
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
