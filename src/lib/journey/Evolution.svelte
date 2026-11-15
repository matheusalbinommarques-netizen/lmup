<script lang="ts">
  import { guardUpdates } from './guardUpdates';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { evolutionView } from '$services/evolution';
  import { planTask } from '$services/journeyService';
  import { dateKey } from '$services/rewardService';
  import { addCalendarDays } from '$services/calendar';
  import { todayView } from './todayView';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import ProjectForm from './ProjectForm.svelte';

  // Evolução (lote 4): o hub do método. Superfície simples, sem cartões de
  // jogo; a revisão semanal entra no lote 6.
  const INVITE_KEY = 'lmup.evolucao.convite-roda';
  let data = $state.raw<JourneySnapshot>();
  let error = $state(''),
    notice = $state(''),
    busy = $state<number | null>(null),
    formOpen = $state(false),
    inviteHidden = $state(false);
  guardUpdates(() => !data || busy !== null);
  onMount(() => {
    try {
      inviteHidden = localStorage.getItem(INVITE_KEY) === '1';
    } catch {
      /* Sem armazenamento, o convite apenas volta a aparecer. */
    }
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler sua evolução. Nada foi alterado.';
      },
    });
    return () => sub.unsubscribe();
  });
  const today = dateKey();
  const view = $derived(
    data
      ? evolutionView(
          {
            profile: data.profile,
            areas: data.areas,
            tasks: data.tasks,
            events: data.events,
            routines: data.routines,
            occurrences: data.occurrences,
            projects: data.projects,
            executionRecords: data.executionRecords,
            // Mesma regra do "Planejar para hoje" de Missões.
            plannedToday: todayView(data, today).planned,
          },
          today,
        )
      : null,
  );
  const short = (day: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(`${day}T12:00:00Z`));
  const full = (day: string) => day.split('-').reverse().join('/');
  const delta = (now: number, before: number) =>
    now === before
      ? 'igual aos 30 dias anteriores'
      : `${now > before ? '+' : '−'}${Math.abs(now - before)} em relação aos 30 dias anteriores`;
  const hours = (minutes: number) => {
    const h = Math.floor(minutes / 60),
      m = minutes % 60;
    return h ? `${h}h${m ? ` ${m}min` : ''}` : `${m} min`;
  };
  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  function hideInvite() {
    inviteHidden = true;
    try {
      localStorage.setItem(INVITE_KEY, '1');
    } catch {
      /* Preferência só desta visita. */
    }
  }
  async function place(taskId: number, title: string) {
    if (busy !== null) return;
    busy = taskId;
    error = '';
    notice = '';
    try {
      await planTask(taskId, true);
      notice = `"${title}" está no dia de hoje.`;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível pôr no dia. Nada foi alterado.';
    } finally {
      busy = null;
    }
  }
</script>

<svelte:head><title>Evolução · Level Me Up</title></svelte:head>
<div class="evolution">
  <header class="evolution-head">
    <h1>Evolução</h1>
    <p>
      Para onde você está indo e o que já aconteceu. Só conta o que passa pelo
      app; ausência de registro não é ausência de esforço.
    </p>
  </header>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <p role="status" class="journey-save-status">{notice}</p>
  {#if !view}<p role="status">Abrindo sua evolução…</p>{:else}
    <section class="evolution-section" aria-labelledby="evolution-focus">
      <div class="evolution-section-head">
        <h2 id="evolution-focus">Focos atuais</h2>
        {#if view.lastCheckin}<span class="evolution-muted"
            >da Roda, avaliada em {full(view.lastCheckin)}</span
          >{/if}
        <a href="/roda">Abrir a Roda completa →</a>
      </div>
      {#if view.focus.length}<div class="evolution-focus-grid">
          {#each view.focus as focus (focus.key)}<article
              class="evolution-surface evolution-focus"
            >
              <strong class="evolution-focus-title">{focus.label}</strong>
              <dl class="evolution-focus-numbers">
                <div>
                  <dt>Sentimento</dt>
                  <dd>
                    {#if focus.rating === null}<span class="evolution-muted"
                        >sem nota</span
                      >{:else}<strong>{focus.rating}</strong><span
                        class="evolution-muted"
                      >
                        / 10</span
                      >{/if}
                  </dd>
                </div>
                <div>
                  <dt>Dias com ação, últimos 30</dt>
                  <dd>
                    <strong>{focus.activeDays}</strong><span
                      class="evolution-muted"
                    >
                      · {delta(
                        focus.activeDays,
                        focus.previousActiveDays,
                      )}</span
                    >
                  </dd>
                </div>
              </dl>
              <div
                class="evolution-strip"
                role="img"
                aria-label={`${focus.activeDays} de 30 dias com ação; cada ponto é um dia, do mais antigo para hoje`}
              >
                {#each focus.strip as on, index (index)}<span class:on
                  ></span>{/each}
              </div>
              <span class="evolution-strip-legend"
                ><span>{short(addCalendarDays(today, -29))}</span><span
                  >hoje</span
                ></span
              >
              {#if focus.intention}<p class="evolution-intent">
                  <span class="evolution-muted">Intenção:</span>
                  {focus.intention}
                </p>{/if}
            </article>{/each}
        </div>
      {:else if inviteHidden}<p class="evolution-muted">
          Sem focos por enquanto. <a href="/roda">Avaliar a Roda</a>
        </p>
      {:else}<div class="evolution-surface evolution-empty">
          <ApprovedIcon name="progresso" size={48} />
          <div>
            <strong>Sem focos por enquanto</strong>
            <p>
              {view.hasCheckins
                ? 'Se quiser, escolha até 3 áreas em foco na Roda. Dá para fazer depois.'
                : 'Se quiser, avalie as 10 áreas da Roda em cerca de 2 min e escolha até 3 focos. Dá para fazer depois.'}
            </p>
            <span class="evolution-actions"
              ><a class="evolution-button" href="/roda"
                >{view.hasCheckins ? 'Abrir a Roda' : 'Avaliar a Roda'}</a
              ><button
                type="button"
                class="evolution-quiet"
                onclick={hideInvite}>Agora não</button
              ></span
            >
          </div>
        </div>{/if}
    </section>

    <section class="evolution-section" aria-labelledby="evolution-projects">
      <div class="evolution-section-head evolution-ruled">
        <h2 id="evolution-projects">Projetos ativos</h2>
        <span class="evolution-muted">{view.projects.length}</span>
        <a href="/projetos">Todos os projetos →</a>
        <button
          type="button"
          class="evolution-button"
          onclick={() => {
            formOpen = true;
          }}>Novo projeto</button
        >
      </div>
      {#if view.projects.length}<ul class="evolution-projects">
          {#each view.projects as project (project.id)}<li
              class="evolution-project"
            >
              <div class="evolution-project-name">
                <a href={`/projetos/${project.id}`}>{project.name}</a>
                <span class="evolution-muted evolution-tags"
                  >{project.areaName}{#if project.status === 'pausado'}<span
                      class="evolution-tag">Pausado</span
                    >{/if}{#if project.staleDays}<span
                      class="evolution-tag evolution-stale"
                      >Parada há {project.staleDays} dias</span
                    >{/if}</span
                >
              </div>
              <div class="evolution-project-progress">
                <span>{project.done} de {project.total} missões</span>
                <span class="evolution-bar" aria-hidden="true"
                  ><span
                    style:width={`${project.total ? Math.round((project.done / project.total) * 100) : 0}%`}
                  ></span></span
                >
              </div>
              <div class="evolution-project-next">
                <span class="evolution-muted evolution-small">Próxima ação</span
                >
                {#if project.next}<span>{project.next.title}</span><span
                    class="evolution-muted evolution-small"
                    >{project.when === 'today'
                      ? 'já está no dia de hoje'
                      : project.when
                        ? `planejada para ${short(project.when)}`
                        : 'sem dia'}</span
                  >{:else}<span class="evolution-muted"
                    >{project.total
                      ? 'Todas concluídas'
                      : 'Nenhuma missão ainda'}</span
                  >{/if}
              </div>
              <div class="evolution-project-action">
                {#if project.next && project.when === 'today'}<span
                    class="evolution-placed">✓ No dia de hoje</span
                  >{:else if project.next}<button
                    type="button"
                    class="evolution-button"
                    aria-label={`Pôr no dia: ${project.next.title}`}
                    disabled={busy !== null}
                    onclick={() =>
                      place(project.next!.taskId, project.next!.title)}
                    >{busy === project.next.taskId
                      ? 'Salvando…'
                      : 'Pôr no dia'}</button
                  >{/if}
              </div>
            </li>{/each}
        </ul>
      {:else}<div class="evolution-surface evolution-empty">
          <ApprovedIcon name="projetos_navegacao" size={48} />
          <div>
            <strong>Nenhum projeto ativo</strong>
            <p>
              Projeto é o que leva mais de um dia: junta missões e mostra quanto
              já foi feito.
            </p>
            <span class="evolution-actions"
              ><button
                type="button"
                class="evolution-button"
                onclick={() => {
                  formOpen = true;
                }}>Novo projeto</button
              >{#if view.completedProjects}<a
                  class="evolution-quiet"
                  href="/projetos">Ver concluídos ({view.completedProjects})</a
                >{/if}</span
            >
          </div>
        </div>{/if}
    </section>

    <section
      class="evolution-surface evolution-progress"
      aria-labelledby="evolution-progress"
    >
      <div class="evolution-section-head">
        <h2 id="evolution-progress">Meu progresso</h2>
        <span class="evolution-muted">últimos 30 dias</span>
        <a href="/progresso">Ver extrato de XP →</a>
      </div>
      {#if !view.progress.missions && !view.progress.finished.length}<div>
          <strong>Ainda pouco registrado</strong>
          <p class="evolution-muted">
            Esforço, progresso e resultado aparecem aqui conforme você conclui
            missões e projetos. Nada aqui diminui por inatividade.
          </p>
        </div>{:else}<dl class="evolution-progress-grid">
          <div>
            <dt>Esforço</dt>
            <dd>
              <strong
                >{plural(view.progress.missions, 'missão', 'missões')}{view
                  .progress.minutes
                  ? ` · ${hours(view.progress.minutes)} medidas`
                  : ''}</strong
              ><span>Tempo só onde houve cronômetro ou execução.</span>
            </dd>
          </div>
          <div>
            <dt>Progresso</dt>
            <dd>
              <strong
                >{plural(
                  view.progress.projectMissions,
                  'missão de projeto',
                  'missões de projeto',
                )}</strong
              ><span
                >{view.projects.length
                  ? `Concluídas em ${view.progress.projectsTouched} dos ${view.projects.length} projetos ativos.`
                  : 'Nenhum projeto ativo agora.'}</span
              >
            </dd>
          </div>
          <div>
            <dt>Resultado</dt>
            <dd>
              <strong
                >{plural(
                  view.progress.finished.length,
                  'projeto concluído',
                  'projetos concluídos',
                )}</strong
              ><span
                >{view.progress.finished.length
                  ? view.progress.finished.map((name) => `"${name}"`).join(', ')
                  : 'Projeto concluído aparece aqui.'}</span
              >
            </dd>
          </div>
        </dl>
        <p class="evolution-muted evolution-small">
          Esforço: missões concluídas e tempo medido. Progresso: missões de
          projeto. Resultado: projetos concluídos.
        </p>{/if}
    </section>
  {/if}
</div>
<ProjectForm
  bind:open={formOpen}
  onSaved={() => {
    notice = 'Projeto criado neste navegador.';
  }}
/>

<style>
  .evolution {
    display: grid;
    gap: 28px;
    max-width: 1180px;
    padding: 12px 16px 40px;
    color: var(--lmu-text);
  }
  .evolution-head h1 {
    margin: 0;
    font: 500 2.5rem/1.1 var(--lmu-display);
    color: #fff1d6;
  }
  .evolution-head p {
    margin: 4px 0 0;
    max-width: 720px;
    color: #c9d3cc;
  }
  .evolution-section {
    display: grid;
    gap: 12px;
  }
  .evolution-section-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 12px;
  }
  .evolution-section-head h2 {
    margin: 0;
    font: 500 1.75rem var(--lmu-display);
    color: #f1ead6;
  }
  .evolution-section-head > a {
    margin-left: auto;
    font-size: 0.875rem;
  }
  .evolution-section-head > a + .evolution-button {
    margin-left: 0;
  }
  .evolution-ruled {
    padding-bottom: 8px;
    border-bottom: 1px solid var(--lmu-line);
  }
  .evolution a {
    color: #d6e2db;
  }
  .evolution a:hover {
    color: var(--lmu-action);
  }
  .evolution-muted {
    color: var(--lmu-muted);
  }
  .evolution-small {
    font-size: 0.75rem;
  }
  .evolution-surface {
    padding: 18px;
    border: 1px solid var(--lmu-line);
    border-radius: 10px;
    background: var(--lmu-surface);
  }
  .evolution-focus-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .evolution-focus {
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .evolution-focus-title {
    font-size: 1.125rem;
  }
  .evolution-focus-numbers {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 20px;
    margin: 0;
  }
  .evolution-focus-numbers dt,
  .evolution-progress-grid dt {
    font-size: 0.75rem;
    color: var(--lmu-muted);
  }
  .evolution-focus-numbers dd {
    margin: 0;
    font-size: 0.8125rem;
  }
  .evolution-focus-numbers dd strong {
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
  }
  .evolution-strip {
    display: grid;
    grid-template-columns: repeat(30, 1fr);
    gap: 2px;
  }
  .evolution-strip span {
    height: 10px;
    border-radius: 2px;
    background: var(--lmu-raised);
  }
  .evolution-strip span.on {
    background: var(--lmu-positive);
  }
  .evolution-strip-legend {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--lmu-muted);
  }
  .evolution-intent {
    margin: 0;
    font-size: 0.875rem;
    color: #c9d3cc;
  }
  .evolution-empty {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .evolution-empty p {
    margin: 4px 0 8px;
    font-size: 0.875rem;
    color: #c9d3cc;
  }
  .evolution-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .evolution-button {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 6px 14px;
    border: 1px solid var(--lmu-control-line);
    border-radius: 6px;
    background: var(--lmu-surface);
    color: var(--lmu-text);
    font: 600 0.875rem var(--lmu-font);
    text-decoration: none;
    cursor: pointer;
  }
  .evolution-button:hover:not(:disabled) {
    background: var(--lmu-raised);
    border-color: var(--lmu-muted);
    color: var(--lmu-text);
  }
  .evolution-button:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .evolution-quiet {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 6px 12px;
    border: 0;
    background: none;
    color: var(--lmu-muted);
    font: 600 0.875rem var(--lmu-font);
    cursor: pointer;
  }
  .evolution-projects {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .evolution-project {
    display: grid;
    grid-template-columns:
      minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.2fr)
      150px;
    gap: 16px;
    align-items: center;
    min-height: 72px;
    padding: 10px 4px;
    border-bottom: 1px solid var(--lmu-raised);
  }
  .evolution-project-name,
  .evolution-project-progress,
  .evolution-project-next {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .evolution-project-name a {
    font-weight: 600;
    color: var(--lmu-text);
    text-decoration: none;
  }
  .evolution-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 0.8125rem;
  }
  .evolution-tag {
    padding: 0 6px;
    border: 1px solid var(--lmu-line);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .evolution-stale {
    color: #dcd0ee;
    background: #c0afd91a;
    border-color: #c0afd955;
  }
  .evolution-project-progress > span:first-child {
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
  .evolution-bar {
    display: block;
    height: 4px;
    border-radius: 2px;
    background: var(--lmu-raised);
  }
  .evolution-bar span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--lmu-positive);
  }
  .evolution-project-next > span:nth-child(2) {
    font-size: 0.875rem;
  }
  .evolution-project-action {
    justify-self: end;
  }
  .evolution-placed {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #9fd6c8;
  }
  .evolution-progress {
    display: grid;
    gap: 12px;
  }
  .evolution-progress h2 {
    font-size: 1.5rem;
  }
  .evolution-progress p {
    margin: 0;
  }
  .evolution-progress-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
  }
  .evolution-progress-grid > div {
    padding: 4px 16px;
    border-left: 1px solid var(--lmu-line);
  }
  .evolution-progress-grid dt {
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .evolution-progress-grid dd {
    display: grid;
    gap: 4px;
    margin: 4px 0 0;
  }
  .evolution-progress-grid dd strong {
    font-size: 1.25rem;
  }
  .evolution-progress-grid dd span {
    font-size: 0.8125rem;
    color: #c9d3cc;
  }
  @media (max-width: 760px) {
    .evolution {
      gap: 20px;
      padding: 8px 0 24px;
    }
    .evolution-head h1 {
      font-size: 2rem;
    }
    .evolution-section-head h2 {
      font: 600 1.0625rem var(--lmu-font);
      color: var(--lmu-text);
    }
    .evolution-section-head > a {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
    .evolution-project {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px 8px;
    }
    .evolution-project-name,
    .evolution-project-progress {
      grid-column: 1 / -1;
    }
    .evolution-button {
      min-height: 44px;
    }
    .evolution-progress-grid {
      grid-template-columns: 1fr;
    }
    .evolution-progress-grid > div {
      padding: 8px 0;
      border-left: 0;
      border-bottom: 1px solid var(--lmu-raised);
    }
    .evolution-empty {
      align-items: flex-start;
    }
  }
</style>
