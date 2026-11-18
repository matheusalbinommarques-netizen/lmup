<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { goto } from '$app/navigation';
  import { db, type Task } from '$services/db';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import { plannedOccurrences } from '$services/occurrenceService';
  import type {
    Occurrence,
    ProductivityAudit,
  } from '$services/productivityTypes';
  import {
    completeReview,
    decisionRequestId,
    recordDecision,
    REVIEW_STEPS,
    rescheduleSuggestions,
    reviewWeek,
    routineToWeekdays,
    routineSuggestions,
    weekSummary,
    type ReviewStep,
  } from '$services/weeklyReview';
  import { rangeLabel, moveToDay } from '$services/week';
  import {
    acceptSuggestion,
    declineSuggestion,
    suggestions as suggestionsFor,
    type Suggestion,
  } from '$services/suggestions';
  import { inboxView, setTaskDay, ageLabel } from '$services/inbox';
  import { previewTaskRemoval, removeTask } from '$services/taskRemoval';
  import { saveCheckin, setFocus, wheelView } from '$services/lifeWheelService';
  import type { DomainKey } from '$lib/content/domains';
  import { staleDays } from '$services/dayRow';
  import { todayView } from './todayView';
  import { countLabel } from '$lib/plural';
  import { sentence, dayLabel } from '$services/capture';
  import Button from '$lib/ui/Button.svelte';
  import DayPicker from './DayPicker.svelte';
  import { guardUpdates } from './guardUpdates';

  // Revisão semanal (lote 6a, design R1–R3): três passos opcionais. Nada
  // muda sem um clique; aceitar executa uma ação confirmada, recusar só
  // registra, ignorar não grava nada.
  const today = dateKey();
  const week = reviewWeek(today);
  let data = $state.raw<JourneySnapshot>();
  let rows = $state.raw<Occurrence[]>([]);
  let audits = $state.raw<ProductivityAudit[]>([]);
  let step = $state<ReviewStep | 'done'>('week');
  let skipped = $state<ReviewStep[]>([]);
  let busy = $state(false),
    error = $state(''),
    notice = $state('');
  /** Ação que pede confirmação antes de mudar algo. */
  let confirming = $state<{
    id: string;
    text: string;
    run: () => Promise<void>;
  }>();
  guardUpdates(() => busy || !!confirming);
  onMount(() => {
    const subs = [
      journeyQuery().subscribe({
        next: (value) => (data = value),
        error: () =>
          (error = 'Não foi possível ler a semana. Nada foi alterado.'),
      }),
      liveQuery(() =>
        plannedOccurrences(week, addCalendarDays(week, 6)),
      ).subscribe({
        next: (value) => (rows = value),
      }),
      liveQuery(() => db.productivityAudit.toArray()).subscribe({
        next: (value) => (audits = value),
      }),
    ];
    return () => subs.forEach((sub) => sub.unsubscribe());
  });
  const input = $derived(
    data
      ? {
          tasks: data.tasks,
          events: data.events,
          occurrences: data.occurrences,
          rows,
          executionRecords: data.executionRecords,
          areas: data.areas,
          routines: data.routines,
          audits,
        }
      : undefined,
  );
  const summary = $derived(input ? weekSummary(input, week, today) : undefined);
  const entry = $derived(
    data?.profile?.weeklyReview?.reviews.find((row) => row.week === week),
  );
  const decided = $derived(
    new Map((entry?.decisions ?? []).map((item) => [item.id, item])),
  );
  const routineIdeas = $derived(
    input ? routineSuggestions(input, week, today) : [],
  );
  const rescheduleIdeas = $derived(
    input ? rescheduleSuggestions(input, week, today) : [],
  );
  // Sugestões de horário e duração (lote 6b): uma por vez. "Agora não" só
  // vale nesta visita; a mesma pode voltar ao reabrir a revisão.
  const ideas = $derived(
    data
      ? suggestionsFor(
          {
            tasks: data.tasks,
            occurrences: data.occurrences,
            executionRecords: data.executionRecords,
            weeklyReview: data.profile?.weeklyReview,
          },
          week,
          today,
        )
      : [],
  );
  let later = $state<string[]>([]);
  const pending = $derived(
    ideas.filter((idea) => !decided.has(idea.id) && !later.includes(idea.id)),
  );
  const idea = $derived(pending[0]);
  /** Sugestões já decididas nesta semana (aparecem ao refazer). */
  const handled = $derived(
    (entry?.decisions ?? []).flatMap((item) => {
      const match = /^(time|duration):(\d+)$/.exec(item.id);
      const task = match && data?.tasks.find((t) => t.id === Number(match[2]));
      return match && task
        ? [{ item, task, kind: match[1] as Suggestion['kind'] }]
        : [];
    }),
  );
  const minutesText = (values: number[]) =>
    values.length > 1
      ? `${values.slice(0, -1).join(', ')} e ${values.at(-1)} min`
      : `${values[0]} min`;
  const valueText = (idea: Suggestion) =>
    idea.kind === 'time' ? idea.suggested : `${idea.suggested} min`;
  function useSuggestion(idea: Suggestion) {
    const title = idea.task.title;
    confirming = {
      id: idea.id,
      text:
        idea.kind === 'time'
          ? idea.current
            ? `“${title}” passa de ${idea.current} para ${idea.suggested} de hoje em diante. Os dias passados ficam como estão.`
            : `“${title}” passa a ter hora fixa às ${idea.suggested} de hoje em diante. Os dias passados ficam como estão.`
          : `“${title}” passa a ter duração de ${idea.suggested} min de hoje em diante, para planejar o dia. XP e histórico não mudam.`,
      run: () =>
        run(
          () =>
            acceptSuggestion(
              week,
              idea.kind === 'time'
                ? {
                    id: idea.id,
                    kind: 'time',
                    taskId: idea.task.id!,
                    value: idea.suggested,
                  }
                : {
                    id: idea.id,
                    kind: 'duration',
                    taskId: idea.task.id!,
                    value: idea.suggested,
                  },
            ).then(() => {}),
          idea.kind === 'time'
            ? `“${title}” agora fica às ${idea.suggested}`
            : `“${title}” agora tem ${idea.suggested} min`,
        ),
    };
  }
  const triage = $derived(
    data
      ? inboxView(
          {
            tasks: data.tasks,
            occurrences: data.occurrences,
            sessions: data.sessions,
          },
          today,
        ).inbox.filter((item) => item.triage)
      : [],
  );
  // Paradas: avulsas com dia e 14 dias sem ação, como no Hoje.
  const stalled = $derived(
    data
      ? todayView(data, today)
          .planned.map((row) => ({
            row,
            task: data!.tasks.find((task) => task.id === row.taskId),
          }))
          .flatMap(({ row, task }) => {
            const days =
              task &&
              staleDays(task, today, data!.occurrences, data!.executionRecords);
            return task && days !== null && days !== undefined
              ? [{ row, task, days }]
              : [];
          })
      : [],
  );
  // Passo 2: a Roda, com o que a pessoa mudar nesta revisão.
  const domains = $derived(data ? wheelView(data, today) : []);
  let ratings = $state<Partial<Record<DomainKey, number>>>({});
  const focusCount = $derived(domains.filter((row) => row.focus).length);

  const stepTitle: Record<ReviewStep, string> = {
    week: 'A semana',
    wheel: 'A Roda',
    next: 'A próxima semana',
  };
  const position = $derived(
    step === 'done' ? 3 : REVIEW_STEPS.indexOf(step) + 1,
  );

  async function run(work: () => Promise<void>, done = '') {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await work();
      if (done) notice = sentence(done);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível concluir. Nada foi perdido.';
    } finally {
      busy = false;
      confirming = undefined;
    }
  }
  const accept = (
    id: string,
    action: string,
    work: () => Promise<void>,
    done: string,
  ) =>
    run(async () => {
      await work();
      await recordDecision(week, { id, outcome: 'accepted', action });
    }, done);
  const decline = (id: string, done: string) =>
    run(
      () => recordDecision(week, { id, outcome: 'declined' }).then(() => {}),
      done,
    );
  const requestId = (id: string, action: string) =>
    decisionRequestId(week, `${id}:${action}`).slice(0, 120);

  // Sair da Roda grava só as notas mudadas; se falhar, fica no passo.
  async function leaveWheel(next: ReviewStep) {
    const changed = Object.fromEntries(
      Object.entries(ratings).filter(
        ([key, value]) =>
          domains.find((row) => row.key === key)?.rating !== value,
      ),
    );
    let saved = true;
    if (Object.keys(changed).length)
      await run(async () => {
        saved = false;
        await saveCheckin(changed);
        ratings = {};
        saved = true;
      });
    if (!saved) return;
    if (next === 'next') advance('wheel', next);
    else step = next;
  }
  function advance(current: ReviewStep, next: ReviewStep) {
    skipped = skipped.filter((item) => item !== current);
    step = next;
  }
  function skip(current: ReviewStep, next: ReviewStep | 'done') {
    if (!skipped.includes(current)) skipped = [...skipped, current];
    if (current === 'wheel') ratings = {};
    if (next === 'done') void finish();
    else step = next;
  }
  async function finish() {
    await run(async () => {
      await completeReview(
        week,
        skipped,
        summary && !skipped.includes('week')
          ? {
              completed: summary.completed,
              planned: summary.planned,
              activeDays: summary.activeDays,
            }
          : undefined,
      );
      step = 'done';
    });
  }
  const archive = (task: Task) => async () => {
    const preview = await previewTaskRemoval(task.id!);
    await removeTask(
      task.id!,
      preview.token,
      requestId(`archive:${task.id}`, 'archive'),
      'archive',
    );
  };
  const decisionText = (id: string) => {
    const item = decided.get(id);
    if (!item) return '';
    if (item.outcome === 'declined') return 'Decidido: manter como está.';
    return (
      {
        weekdays: 'Feito: só dias úteis.',
        someday: 'Feito: foi para Algum dia.',
        day: 'Feito: ganhou um dia.',
        archive: 'Feito: arquivada.',
      }[item.action ?? ''] ?? 'Feito.'
    );
  };
</script>

<svelte:head><title>Revisão semanal · Level Me Up</title></svelte:head>

<div class="review">
  <header class="bar">
    <a class="back" href="/evolucao">← Sair</a>
    <ol class="steps" aria-label="Passos da revisão">
      {#each REVIEW_STEPS as item, index (item)}<li
          aria-current={step === item ? 'step' : undefined}
          class:passed={step === 'done' ||
            REVIEW_STEPS.indexOf(step as ReviewStep) > index}
        >
          {step === 'done' || REVIEW_STEPS.indexOf(step as ReviewStep) > index
            ? '✓ '
            : ''}{index + 1} · {stepTitle[item]}
        </li>{/each}
    </ol>
    <span class="muted small">Passo {position} de 3 · cerca de 5 min</span>
  </header>

  <main class="body">
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <p class="notice" role="status">{notice}</p>

    {#if !data || !summary}<p class="muted">Lendo a semana…</p>
    {:else if step === 'week'}
      <h1>A semana de {rangeLabel(week)}</h1>
      <div class="numbers">
        <div class="number">
          <strong>{summary.completed} de {summary.planned}</strong>
          <span class="muted">itens concluídos</span>
        </div>
        <div class="number">
          <strong>{summary.activeDays} de {summary.days}</strong>
          <span class="muted">dias com ação</span>
        </div>
        <div class="number">
          <strong>{summary.unlocked}</strong>
          <span class="muted"
            >{summary.unlocked === 1
              ? 'parada destravada'
              : 'paradas destravadas'}</span
          >
        </div>
      </div>
      {#if summary.effort.length}<div class="effort">
          <strong>Esforço das concluídas</strong>
          <span
            >{summary.effort
              .map((item) => `${item.label} ${item.count}`)
              .join(' · ')}</span
          >
          <span class="muted small">Esforço é dificuldade, não tempo.</span>
        </div>{/if}
      {#if summary.byArea.length}<h2>Por área</h2>
        <ul class="areas">
          {#each summary.byArea as area (area.areaId)}<li>
              <strong>{area.name}</strong>
              <span
                >{countLabel(area.completed, 'concluída', 'concluídas')} · ação em
                {area.activeDays} de {summary.days} dias</span
              >
            </li>{/each}
        </ul>{/if}
      <p class="muted small">
        Só conta o que passa pelo app. Ausência de registro não é ausência de
        esforço.
      </p>
      <div class="actions">
        <Button size="l" onclick={() => advance('week', 'wheel')}
          >Próximo: a Roda</Button
        >
        <Button variant="quiet" onclick={() => skip('week', 'wheel')}
          >Pular este passo</Button
        >
      </div>
    {:else if step === 'wheel'}
      <h1>Como estão as áreas?</h1>
      <p class="muted">
        Sentimento de 0 a 10 e dias com ação nos últimos 30 dias. Se quiser,
        escolha até 2 focos; mudar aqui é opcional.
      </p>
      <div class="domains-head" aria-hidden="true">
        <span>Área · dias com ação</span><span>Sentimento</span><span>Foco</span
        >
      </div>
      <ul class="domains">
        {#each domains as domain (domain.key)}
          {@const value = ratings[domain.key] ?? domain.rating}
          <li>
            <div class="domain-name">
              <strong>{domain.label}</strong>
              <span
                class="bar-track"
                role="img"
                aria-label={`${domain.activeDays} de 30 dias com ação`}
                ><span
                  class="bar-fill"
                  style:width={`${Math.round((domain.activeDays / 30) * 100)}%`}
                ></span></span
              >
            </div>
            <select
              aria-label={`Sentimento em ${domain.label}`}
              value={value === null ? '' : String(value)}
              onchange={(event) => {
                const raw = event.currentTarget.value;
                if (raw === '') {
                  const rest = { ...ratings };
                  delete rest[domain.key];
                  ratings = rest;
                } else ratings = { ...ratings, [domain.key]: Number(raw) };
              }}
              ><option value="">–</option
              >{#each Array.from({ length: 11 }, (_, n) => n) as n (n)}<option
                  value={String(n)}>{n}</option
                >{/each}</select
            >
            <label class="focus"
              ><input
                type="checkbox"
                checked={!!domain.focus}
                disabled={busy}
                onchange={(event) =>
                  run(() =>
                    setFocus(domain.key, event.currentTarget.checked).then(
                      () => {},
                    ),
                  )}
              /><span class="sr-only">Foco em {domain.label}</span></label
            >
          </li>
        {/each}
      </ul>
      {#if focusCount > 2}<p class="muted small">
          {focusCount} focos agora. Com até 2, fica mais fácil dar atenção a cada
          um.
        </p>{/if}
      <div class="actions">
        <Button size="l" disabled={busy} onclick={() => leaveWheel('next')}
          >Próximo: a próxima semana</Button
        >
        <Button variant="quiet" onclick={() => skip('wheel', 'next')}
          >Pular este passo</Button
        >
        <Button variant="quiet" onclick={() => leaveWheel('week')}
          >Voltar ao passo 1</Button
        >
      </div>
    {:else if step === 'next'}
      {#snippet confirmPanel()}{#if confirming}<div
            class="confirm"
            role="alertdialog"
            aria-label="Confirmar"
          >
            <p>{confirming.text}</p>
            <Button disabled={busy} onclick={() => confirming?.run()}
              >Confirmar</Button
            ><Button variant="quiet" onclick={() => (confirming = undefined)}
              >Cancelar</Button
            >
          </div>{/if}{/snippet}
      <h1>Ajustes para a próxima semana</h1>
      <p class="muted">
        Sugestões a partir do que aconteceu. Aceite, recuse ou ignore; nada muda
        sem você.
      </p>
      {#if idea}<section class="card" aria-labelledby="suggestion-title">
          <span class="kind" id="suggestion-title"
            >{idea.kind === 'time' ? 'Horário' : 'Duração'} · observação do cronômetro</span
          >
          {#if idea.kind === 'time'}<p>
              {idea.current
                ? `“${idea.task.title}” está marcada para ${idea.current}, e nos últimos 21 dias você começou por volta de ${idea.suggested}.`
                : `“${idea.task.title}” não tem hora fixa, e nos últimos 21 dias você começou por volta de ${idea.suggested}.`}
            </p>
            <p class="muted small">
              Base: {idea.samples.length} dias com início medido pelo cronômetro{idea
                .close.count === idea.samples.length
                ? `, todos entre ${idea.close.from} e ${idea.close.to}.`
                : `; ${idea.close.count} deles entre ${idea.close.from} e ${idea.close.to}.`}
            </p>{:else}<p>
              {idea.current
                ? `“${idea.task.title}” está com ${idea.current} min, e as últimas ${idea.samples.length} conclusões medidas levaram ${minutesText(idea.samples)}.`
                : `“${idea.task.title}” não tem duração (conta 15 min*), e as últimas ${idea.samples.length} conclusões medidas levaram ${minutesText(idea.samples)}.`}
            </p>
            <p class="muted small">
              É uma estimativa para planejar o dia, não uma meta: levar mais ou
              menos tempo não muda XP.
            </p>{/if}
          <div class="choices">
            <Button
              variant="secondary"
              disabled={busy}
              onclick={() => useSuggestion(idea)}>Usar {valueText(idea)}</Button
            >
            <Button
              variant="quiet"
              disabled={busy}
              onclick={() => {
                confirming = undefined;
                later = [...later, idea.id];
              }}>Agora não</Button
            >
            <Button
              variant="quiet"
              disabled={busy}
              onclick={() =>
                run(
                  () => declineSuggestion(week, idea.id).then(() => {}),
                  idea.kind === 'time'
                    ? `Sem sugestões de horário para “${idea.task.title}”`
                    : `Sem sugestões de duração para “${idea.task.title}”`,
                )}>Não sugerir mais</Button
            >
          </div>
          {#if confirming?.id === idea.id}{@render confirmPanel()}{/if}
          {#if pending.length > 1}<p class="muted small">
              {pending.length - 1 === 1
                ? 'Mais 1 observação depois desta.'
                : `Mais ${pending.length - 1} observações depois desta.`}
            </p>{/if}
        </section>{/if}
      {#if handled.length}<section class="card">
          <span class="kind">Observações do cronômetro decididas</span>
          <ul class="list">
            {#each handled as { item, task, kind } (item.id)}<li>
                <strong>{task.title}</strong>
                <span class="decided"
                  >{item.outcome === 'declined'
                    ? kind === 'time'
                      ? 'Não sugerir mais horário.'
                      : 'Não sugerir mais duração.'
                    : kind === 'time'
                      ? `Feito: ${item.action?.slice(5)} de hoje em diante.`
                      : `Feito: ${item.action?.slice(9)} min de hoje em diante.`}</span
                >
              </li>{/each}
          </ul>
        </section>{/if}
      {#each routineIdeas as idea (idea.id)}<section class="card">
          <span class="kind">Rotina</span>
          <p>
            {idea.routine.name}: concluída em {idea.doneDays} de {idea.scheduledDays}
            dias.{idea.weekdaysOption
              ? ' Mudar para dias úteis, pausar ou manter?'
              : ' Pausar ou manter?'}
          </p>
          <p class="muted small">Base: ocorrências da rotina nesta semana.</p>
          {#if decided.has(idea.id)}<p class="decided">
              {decisionText(idea.id)}
            </p>{:else}<div class="choices">
              {#if idea.weekdaysOption}<Button
                  variant="secondary"
                  disabled={busy}
                  onclick={() =>
                    (confirming = {
                      id: idea.id,
                      text: `${idea.routine.name} passa a valer de segunda a sexta. O histórico fica como está.`,
                      run: () =>
                        accept(
                          idea.id,
                          'weekdays',
                          () =>
                            routineToWeekdays(idea.routine.id).then(() => {}),
                          `${idea.routine.name} agora vale só em dias úteis`,
                        ),
                    })}>Só dias úteis</Button
                >{/if}
              <a
                class="lmu-button lmu-button--secondary"
                href="/missoes?view=routines">Abrir rotina para pausar</a
              >
              <Button
                variant="quiet"
                disabled={busy}
                onclick={() =>
                  decline(idea.id, `${idea.routine.name} fica como está`)}
                >Manter</Button
              >
            </div>{/if}
        </section>{/each}
      {#each rescheduleIdeas as idea (idea.id)}<section class="card">
          <span class="kind">Remarcações</span>
          <p>
            “{idea.task.title}” foi remarcada {idea.count} vezes em 4 semanas.
            {idea.somedayOption
              ? 'Dividir em um passo menor ou pôr em Algum dia?'
              : 'Dividir em um passo menor?'}
          </p>
          <p class="muted small">Base: remarcações registradas.</p>
          {#if decided.has(idea.id)}<p class="decided">
              {decisionText(idea.id)}
            </p>{:else}<div class="choices">
              <a
                class="lmu-button lmu-button--secondary"
                href={`/missao/${idea.task.id}`}>Dividir em passo menor</a
              >
              {#if idea.somedayOption}<Button
                  variant="secondary"
                  disabled={busy}
                  onclick={() =>
                    (confirming = {
                      id: idea.id,
                      text: `“${idea.task.title}” sai do plano e vai para Algum dia.`,
                      run: () =>
                        accept(
                          idea.id,
                          'someday',
                          () =>
                            setTaskDay(
                              idea.task.id!,
                              'someday',
                              requestId(idea.id, 'someday'),
                            ),
                          `“${idea.task.title}” foi para Algum dia`,
                        ),
                    })}>Algum dia</Button
                >{/if}
              <Button
                variant="quiet"
                disabled={busy}
                onclick={() =>
                  decline(idea.id, `“${idea.task.title}” fica como está`)}
                >Deixar</Button
              >
            </div>{/if}
        </section>{/each}
      {#if triage.length}<section class="card">
          <span class="kind">Triagem · sem dia há 14 dias ou mais</span>
          <ul class="list">
            {#each triage as item (item.task.id)}
              {@const id = `triage:${item.task.id}`}
              <li>
                <strong>{item.task.title}</strong>
                <span class="muted small">{ageLabel(item)}</span>
                {#if decided.has(id)}<span class="decided"
                    >{decisionText(id)}</span
                  >{:else}<span class="choices"
                    ><DayPicker
                      tasks={data.tasks}
                      title={item.task.title}
                      onchoose={(day) =>
                        accept(
                          id,
                          'day',
                          () =>
                            setTaskDay(
                              item.task.id!,
                              { day },
                              requestId(id, 'day'),
                            ),
                          `${item.task.title} foi para ${dayLabel(day, today)}`,
                        )}
                    /><Button
                      variant="secondary"
                      size="s"
                      disabled={busy}
                      onclick={() =>
                        accept(
                          id,
                          'someday',
                          () =>
                            setTaskDay(
                              item.task.id!,
                              'someday',
                              requestId(id, 'someday'),
                            ),
                          `${item.task.title} foi para Algum dia`,
                        )}>Algum dia</Button
                    ><Button
                      variant="quiet"
                      size="s"
                      disabled={busy}
                      onclick={() =>
                        (confirming = {
                          id,
                          text: `Arquivar “${item.task.title}”? Dá para restaurar depois; o histórico fica.`,
                          run: () =>
                            accept(
                              id,
                              'archive',
                              archive(item.task),
                              `${item.task.title} foi arquivada`,
                            ),
                        })}>Arquivar</Button
                    ></span
                  >{/if}
              </li>
            {/each}
          </ul>
        </section>{/if}
      {#if stalled.length}<section class="card">
          <span class="kind">Paradas (itens com dia)</span>
          <ul class="list">
            {#each stalled as item (item.task.id)}
              {@const id = `stale:${item.task.id}`}
              <li>
                <strong>{item.task.title}</strong>
                <span class="tag">Parada há {item.days} dias</span>
                {#if decided.has(id)}<span class="decided"
                    >{decisionText(id)}</span
                  >{:else}<span class="choices"
                    ><DayPicker
                      tasks={data.tasks}
                      title={item.task.title}
                      text="Pôr na semana ▾"
                      label={`Pôr na semana: ${item.task.title}`}
                      onchoose={(day) =>
                        accept(
                          id,
                          'day',
                          () => moveToDay(item.row, day, requestId(id, 'day')),
                          `${item.task.title} foi para ${dayLabel(day, today)}`,
                        )}
                    /><a
                      class="lmu-button lmu-button--secondary lmu-button--s"
                      href={`/missao/${item.task.id}`}>Dividir em passo menor</a
                    ><Button
                      variant="quiet"
                      size="s"
                      disabled={busy}
                      onclick={() =>
                        (confirming = {
                          id,
                          text: `Arquivar “${item.task.title}”? Dá para restaurar depois; o histórico fica.`,
                          run: () =>
                            accept(
                              id,
                              'archive',
                              archive(item.task),
                              `${item.task.title} foi arquivada`,
                            ),
                        })}>Arquivar</Button
                    ></span
                  >{/if}
              </li>
            {/each}
          </ul>
        </section>{/if}
      {#if !idea && !handled.length && !routineIdeas.length && !rescheduleIdeas.length && !triage.length && !stalled.length}<p
          class="muted"
        >
          Nada pede ajuste nesta semana. Pode concluir.
        </p>{/if}
      {#if confirming?.id !== idea?.id}{@render confirmPanel()}{/if}
      <div class="actions">
        <Button
          size="l"
          disabled={busy}
          onclick={() => {
            skipped = skipped.filter((item) => item !== 'next');
            void finish();
          }}>Concluir revisão</Button
        >
        <Button
          variant="quiet"
          disabled={busy}
          onclick={() => skip('next', 'done')}>Pular e concluir</Button
        >
        <Button variant="quiet" onclick={() => (step = 'wheel')}
          >Voltar ao passo 2</Button
        >
      </div>
    {:else}
      <h1>Revisão concluída</h1>
      <p>
        Semana de {rangeLabel(week)} revisada. A próxima abre no sábado, {new Date(
          `${addCalendarDays(week, 13)}T12:00:00`,
        ).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
      </p>
      <div class="actions">
        <Button size="l" onclick={() => goto('/evolucao')}
          >Voltar à Evolução</Button
        >
      </div>
    {/if}
  </main>
</div>

<style>
  .review {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    min-height: 100%;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.25rem;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid var(--lmu-line);
  }
  .back {
    display: flex;
    align-items: center;
    min-height: 44px;
    font-weight: 600;
    text-decoration: none;
  }
  .steps {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0 auto;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
  }
  .steps li {
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    color: var(--lmu-muted);
  }
  .steps li.passed {
    color: var(--lmu-positive);
  }
  .steps li[aria-current='step'] {
    color: var(--lmu-text);
    font-weight: 600;
    background: var(--lmu-raised);
    border: 1px solid var(--lmu-border);
  }
  .body {
    display: grid;
    gap: 1.25rem;
    align-content: start;
    width: 100%;
    max-width: 55rem;
    justify-self: center;
    padding: 2rem 1.5rem 3rem;
    box-sizing: border-box;
  }
  h1 {
    margin: 0;
    font-family: var(--lmu-font-display, 'LMUP Cormorant', Georgia, serif);
    font-weight: 500;
    font-size: 2.25rem;
    line-height: 1.1;
  }
  h2 {
    margin: 0.25rem 0 0;
    font-size: 1rem;
  }
  .muted {
    color: var(--lmu-muted);
  }
  .small {
    font-size: 0.82rem;
  }
  .numbers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(10rem, 100%), 1fr));
    gap: 0.6rem;
  }
  .number,
  .card {
    display: grid;
    gap: 0.35rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--lmu-line);
    border-radius: 10px;
    background: var(--lmu-surface);
  }
  .number strong {
    font-size: 1.5rem;
  }
  .effort {
    display: grid;
    gap: 0.25rem;
  }
  .areas,
  .list,
  .domains {
    display: grid;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .areas li {
    display: grid;
    gap: 0.2rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--lmu-raised);
  }
  .domains li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 4.5rem 2.75rem;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    border-bottom: 1px solid var(--lmu-raised);
  }
  .domains-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 4.5rem 2.75rem;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--lmu-muted);
  }
  .domains-head span:not(:first-child) {
    text-align: center;
  }
  .domain-name {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
  }
  .bar-track {
    display: block;
    height: 6px;
    border-radius: 0 4px 4px 0;
    background: var(--lmu-bg);
    overflow: hidden;
  }
  .bar-fill {
    display: block;
    height: 100%;
    background: var(--lmu-positive);
  }
  .focus {
    display: grid;
    place-items: center;
    min-height: 44px;
  }
  .focus input {
    width: 1.4rem;
    height: 1.4rem;
  }
  .kind {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--lmu-muted);
  }
  .card p {
    margin: 0;
  }
  .choices {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .list li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    padding: 0.5rem 0;
    border-top: 1px solid var(--lmu-raised);
  }
  .list li strong {
    flex: 1 1 12rem;
    min-width: 0;
    overflow-wrap: break-word;
  }
  .tag {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0 0.4rem;
    border-radius: 4px;
    color: #dcd0ee;
    border: 1px solid #c0afd955;
  }
  .decided {
    color: var(--lmu-positive);
    font-weight: 600;
    font-size: 0.9rem;
  }
  .confirm {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--lmu-border);
    border-radius: 10px;
    background: var(--lmu-raised);
  }
  .confirm p {
    flex: 1 1 18rem;
    margin: 0;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    padding-top: 0.5rem;
  }
  .error {
    margin: 0;
    color: var(--lmu-danger);
  }
  .notice:empty {
    display: none;
  }
  .notice {
    margin: 0;
    color: var(--lmu-positive);
  }
  @media (max-width: 47.5rem) {
    .bar {
      padding: 0.5rem 1rem;
    }
    .steps {
      display: none;
    }
    .body {
      padding: 1.25rem 1rem 2rem;
    }
    h1 {
      font-size: 1.85rem;
    }
  }
</style>
