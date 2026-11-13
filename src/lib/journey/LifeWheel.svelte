<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { dateKey } from '$services/rewardService';
  import {
    saveCheckin,
    setAreaDomain,
    setFocus,
    setIntention,
    wheelView,
    type DomainView,
  } from '$services/lifeWheelService';
  import { DOMAINS, type DomainKey } from '$lib/content/domains';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import QuickCreate from './QuickCreate.svelte';

  let data = $state.raw<JourneySnapshot>();
  let error = $state(''),
    notice = $state(''),
    busy = $state(false),
    checkinOpen = $state(false),
    createOpen = $state(false),
    createArea = $state<number | undefined>(undefined);
  let draft = $state<Record<string, string>>({});
  let notes = $state<Record<string, string>>({});
  let intentions = $state<Record<string, string>>({});
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => (data = value),
      error: () => (error = 'Não foi possível abrir a Roda da Vida.'),
    });
    return () => sub.unsubscribe();
  });
  const today = $derived(dateKey());
  const rows = $derived(
    data
      ? wheelView(
          {
            profile: data.profile,
            areas: data.areas,
            tasks: data.tasks,
            events: data.events,
            routines: data.routines,
            occurrences: data.occurrences,
          },
          today,
        )
      : [],
  );
  const ordered = $derived(
    [...rows].sort((a, b) => Number(!!b.focus) - Number(!!a.focus)),
  );
  const lastCheckin = $derived(
    data?.profile?.lifeWheel?.checkins.at(-1)?.at ?? null,
  );
  const unlinkedAreas = $derived([
    ...(data?.profile?.generalAreaDomain ? [] : [{ id: 0, nome: 'Geral' }]),
    ...(data?.areas ?? [])
      .filter((area) => !area.domain && area.id !== undefined)
      .map((area) => ({ id: area.id!, nome: area.nome })),
  ]);
  const date = (value: string) =>
    new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Radar geometry: 10 axes, 0–10 scale; unrated axes are drawn hollow at 0.
  const SIZE = 320,
    C = SIZE / 2,
    R = 118;
  const point = (index: number, value: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / DOMAINS.length;
    const r = (R * value) / 10;
    return [C + r * Math.cos(angle), C + r * Math.sin(angle)];
  };
  // Only rated axes form the shape; an unrated area is not a zero.
  const polygon = $derived(
    rows
      .map((row, i) => (row.rating === null ? null : point(i, row.rating)))
      .filter((p) => p !== null)
      .map((p) => p!.join(','))
      .join(' '),
  );
  const ratedCount = $derived(rows.filter((row) => row.rating !== null).length);
  const labelPos = (index: number) => point(index, 12.6);

  async function run(action: () => Promise<unknown>, done = '') {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      await action();
      notice = done;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível salvar.';
    } finally {
      busy = false;
    }
  }
  function openCheckin() {
    draft = Object.fromEntries(
      rows.map((row) => [
        row.key,
        row.rating === null ? '' : String(row.rating),
      ]),
    );
    notes = {};
    checkinOpen = true;
  }
  async function submitCheckin() {
    const ratings = Object.fromEntries(
      Object.entries(draft)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => [key, Number(value)]),
    ) as Partial<Record<DomainKey, number>>;
    await run(async () => {
      await saveCheckin(ratings, notes as Partial<Record<DomainKey, string>>);
      checkinOpen = false;
    }, 'Avaliação salva.');
  }
  function newMission(row: DomainView) {
    createArea = row.areas[0]?.id;
    createOpen = true;
  }
  const trend = (row: DomainView) => row.activeDays - row.previousActiveDays;
</script>

<svelte:head><title>Roda da Vida · Level Me Up</title></svelte:head>
<section class="life-wheel" aria-labelledby="wheel-title">
  <header class="wheel-heading">
    <div>
      <h1 id="wheel-title">Roda da Vida</h1>
      <p>
        Como você se sente em cada área e onde está agindo. Nada aqui é
        obrigatório e o app não diz o que você deveria fazer.
      </p>
    </div>
    <Button size="m" onclick={openCheckin}
      >{lastCheckin ? 'Avaliar de novo' : 'Fazer uma avaliação'}</Button
    >
  </header>
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  {#if notice}<p class="lmu-hint" role="status">{notice}</p>{/if}
  {#if !data}<p role="status">Abrindo…</p>{:else}
    <div class="wheel-charts">
      <figure class="wheel-card">
        <figcaption>
          <strong>Como você se sente</strong>
          <span
            >{lastCheckin
              ? `Sua avaliação de 0 a 10 · última em ${date(lastCheckin)}`
              : 'Ainda sem avaliação. Avalie só as áreas que quiser.'}</span
          >
        </figcaption>
        <svg
          viewBox={`-105 -10 ${SIZE + 210} ${SIZE + 20}`}
          role="img"
          aria-label="Radar da sua avaliação por área da vida"
        >
          {#each [2.5, 5, 7.5, 10] as ring (ring)}<polygon
              class="ring"
              points={rows.map((_, i) => point(i, ring).join(',')).join(' ')}
            />{/each}
          {#each rows as row, i (row.key)}<line
              class="axis"
              x1={C}
              y1={C}
              x2={point(i, 10)[0]}
              y2={point(i, 10)[1]}
            />{/each}
          {#if ratedCount >= 3}<polygon class="area" points={polygon} />{/if}
          {#each rows as row, i (row.key)}
            {@const [x, y] = point(i, row.rating ?? 0)}
            {@const [lx, ly] = labelPos(i)}
            <circle
              class="dot"
              class:empty={row.rating === null}
              cx={x}
              cy={y}
              r="5"
              ><title
                >{row.label}: {row.rating === null
                  ? 'sem avaliação'
                  : `${row.rating}/10`}</title
              ></circle
            >
            <text
              class="label"
              class:focus={!!row.focus}
              x={lx}
              y={ly}
              text-anchor={Math.abs(lx - C) < 8
                ? 'middle'
                : lx > C
                  ? 'start'
                  : 'end'}
              dominant-baseline="middle"
              >{row.focus ? '● ' : ''}{DOMAINS[i].short} · {row.rating ??
                '—'}</text
            >
          {/each}
        </svg>
        <p class="wheel-note">● em foco. Avaliação pessoal, não diagnóstico.</p>
      </figure>

      <figure class="wheel-card">
        <figcaption>
          <strong>Onde você agiu</strong>
          <span>Dias com alguma conclusão nos últimos 30 dias</span>
        </figcaption>
        <ul
          class="activity"
          aria-label="Dias com ação por área nos últimos 30 dias"
        >
          {#each rows as row (row.key)}<li
              title={`${row.label}: ${row.activeDays} de 30 dias; antes: ${row.previousActiveDays}`}
            >
              <span class="activity-label" class:focus={!!row.focus}
                >{row.label}</span
              >
              <span class="activity-track"
                ><span style={`width:${(row.activeDays / 30) * 100}%`}
                ></span></span
              >
              <span class="activity-value"
                >{row.areas.length
                  ? row.activeDays
                  : '—'}{#if row.areas.length && trend(row)}<small
                    >{trend(row) > 0 ? ' +' : ' −'}{Math.abs(trend(row))}</small
                  >{/if}</span
              >
            </li>{/each}
        </ul>
        <p class="wheel-note">
          +/− = comparado aos 30 dias anteriores. — = nenhuma área ligada. Só
          conta o que passa pelo app: ausência de registro não quer dizer
          ausência de esforço.
        </p>
      </figure>
    </div>

    <h2 class="wheel-subtitle">Suas áreas da vida</h2>
    <ul class="domain-list">
      {#each ordered as row (row.key)}
        <li
          class="domain-card"
          class:in-focus={!!row.focus}
          aria-label={row.label}
        >
          <div class="domain-head">
            <strong>{row.label}</strong>
            <span
              >{row.rating === null
                ? 'Sem avaliação'
                : `${row.rating}/10${row.previousRating !== null ? ` (antes ${row.previousRating})` : ''}`}</span
            >
            <label class="focus-toggle"
              ><input
                type="checkbox"
                checked={!!row.focus}
                disabled={busy}
                onchange={(event) =>
                  run(() => setFocus(row.key, event.currentTarget.checked))}
              />Em foco</label
            >
          </div>
          {#if row.focus}
            <label class="intention"
              >O que eu quero melhorar aqui
              <input
                type="text"
                maxlength="200"
                placeholder="O que você quer que mude nesta área"
                value={intentions[row.key] ?? row.focus.intention ?? ''}
                oninput={(event) =>
                  (intentions[row.key] = event.currentTarget.value)}
                onchange={(event) =>
                  run(
                    () => setIntention(row.key, event.currentTarget.value),
                    'Intenção salva.',
                  )}
              /></label
            >
          {/if}
          <p class="domain-meta">
            {row.areas.length
              ? `Áreas: ${row.areas.map((area) => area.nome).join(', ')}`
              : 'Nenhuma área ligada a esta parte da vida.'}
            · {row.activeDays} dias com ação nos últimos 30
          </p>
          {#if row.routines.length}<p class="domain-meta">
              Rotinas: {row.routines.join(', ')}
            </p>{/if}
          {#if row.pending.length}<p class="domain-meta">
              Pendentes: {row.pending.length}{row.pending.some(
                (task) => task.stalled,
              )
                ? ` · ${row.pending.filter((task) => task.stalled).length} parada(s) há mais de 30 dias`
                : ''} · próxima:
              <a href={'/missao/' + row.pending[0].id}>{row.pending[0].title}</a
              >
            </p>{/if}
          <div class="domain-actions">
            {#if row.areas.length}<Button
                variant="secondary"
                size="s"
                onclick={() => newMission(row)}>Nova missão aqui</Button
              >{/if}
            {#if unlinkedAreas.length}<label class="link-area"
                ><span class="visually-hidden"
                  >Ligar uma área a {row.label}</span
                ><select
                  disabled={busy}
                  onchange={(event) => {
                    const id = event.currentTarget.value;
                    event.currentTarget.value = '';
                    if (id !== '')
                      void run(
                        () => setAreaDomain(Number(id), row.key),
                        'Área ligada.',
                      );
                  }}
                  ><option value="">Ligar uma área…</option>
                  {#each unlinkedAreas as area (area.id)}<option value={area.id}
                      >{area.nome}</option
                    >{/each}</select
                ></label
              >{/if}
            {#each row.areas as area (area.id)}<button
                type="button"
                class="unlink"
                disabled={busy}
                aria-label={`Desligar ${area.nome} de ${row.label}`}
                onclick={() => run(() => setAreaDomain(area.id, null))}
                >{area.nome} ✕</button
              >{/each}
          </div>
        </li>
      {/each}
    </ul>
    <QuickCreate
      bind:open={createOpen}
      snapshot={data}
      defaultAreaId={createArea}
    />
  {/if}
</section>

<Dialog
  bind:open={checkinOpen}
  wide
  title="Como você se sente em cada área?"
  description="De 0 a 10. Avalie só as que quiser; o resto fica como está."
>
  <form
    class="checkin"
    onsubmit={(event) => {
      event.preventDefault();
      void submitCheckin();
    }}
  >
    {#each DOMAINS as domain (domain.key)}
      <div class="checkin-row">
        <label for={'rate-' + domain.key}>{domain.label}</label>
        <select id={'rate-' + domain.key} bind:value={draft[domain.key]}>
          <option value="">Pular</option>
          {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as n (n)}<option
              value={String(n)}>{n}</option
            >{/each}
        </select>
        {#if draft[domain.key] !== '' && draft[domain.key] !== undefined}<input
            type="text"
            maxlength="280"
            aria-label={'Observação sobre ' + domain.label}
            placeholder="Observação (opcional)"
            bind:value={notes[domain.key]}
          />{/if}
      </div>
    {/each}
    <div class="journey-actions">
      <Button type="submit" loading={busy}>Salvar avaliação</Button>
      <Button variant="quiet" onclick={() => (checkinOpen = false)}
        >Cancelar</Button
      >
    </div>
  </form>
</Dialog>

<style>
  .life-wheel {
    display: grid;
    gap: 16px;
    max-width: 1180px;
    margin: 0 auto;
    color: #ece4d0;
  }
  .wheel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .wheel-heading h1 {
    margin: 0;
    font: 500 2.2rem var(--lmu-display, serif);
  }
  .wheel-heading p {
    margin: 4px 0 0;
    color: #c3cabd;
    max-width: 60ch;
  }
  .wheel-charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }
  .wheel-card {
    margin: 0;
    padding: 16px;
    border: 1px solid #5f6f6a66;
    border-radius: 10px;
    background: #061115f0;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  figcaption {
    display: grid;
    gap: 2px;
  }
  figcaption strong {
    font: 500 1.35rem var(--lmu-display, serif);
  }
  figcaption span,
  .wheel-note {
    font-size: 0.82rem;
    color: #c3cabd;
    margin: 0;
  }
  svg {
    width: 100%;
    max-width: 460px;
    justify-self: center;
    overflow: visible;
  }
  .ring {
    fill: none;
    stroke: #5f6f6a55;
  }
  .axis {
    stroke: #5f6f6a55;
  }
  .area {
    fill: #e8ad5733;
    stroke: #e8ad57;
    stroke-width: 2;
  }
  .dot {
    fill: #e8ad57;
    stroke: #061115;
    stroke-width: 2;
  }
  .dot.empty {
    fill: #061115;
    stroke: #8c9a94;
  }
  .label {
    fill: #c3cabd;
    font-size: 12px;
  }
  .label.focus {
    fill: #ece4d0;
    font-weight: 700;
  }
  .activity {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .activity li {
    display: grid;
    grid-template-columns: minmax(110px, 160px) 1fr 48px;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
  }
  .activity-label.focus {
    font-weight: 700;
  }
  .activity-track {
    height: 10px;
    border-radius: 0 4px 4px 0;
    background: #0b1a1c;
    overflow: hidden;
  }
  .activity-track span {
    display: block;
    height: 100%;
    background: #7bc4b1;
    border-radius: 0 4px 4px 0;
  }
  .activity-value {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .activity-value small {
    color: #c3cabd;
  }
  .wheel-subtitle {
    margin: 8px 0 0;
    font: 500 1.55rem var(--lmu-display, serif);
  }
  .domain-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 12px;
  }
  .domain-card {
    display: grid;
    gap: 8px;
    align-content: start;
    padding: 12px;
    border: 1px solid #5f6f6a66;
    border-radius: 8px;
    background: #0c1b1e;
  }
  .domain-card.in-focus {
    border-color: #e8ad5799;
  }
  .domain-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 12px;
  }
  .domain-head strong {
    font: 600 1.15rem var(--lmu-display, serif);
  }
  .domain-head span {
    font-size: 0.82rem;
    color: #c3cabd;
  }
  .focus-toggle {
    margin-left: auto;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 0.85rem;
  }
  .intention {
    display: grid;
    gap: 4px;
    font-size: 0.82rem;
    color: #c3cabd;
  }
  .intention input,
  .link-area select,
  .checkin select,
  .checkin input {
    min-height: 36px;
    padding: 4px 8px;
    border: 1px solid #6f7f79;
    border-radius: 6px;
    background: #071114;
    color: #ece4d0;
  }
  .domain-meta {
    margin: 0;
    font-size: 0.82rem;
    color: #c3cabd;
  }
  .domain-meta a {
    color: #d6e2db;
  }
  .domain-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .unlink {
    border: 1px solid #5f6f6a66;
    border-radius: 999px;
    background: transparent;
    color: #c3cabd;
    padding: 2px 10px;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .checkin {
    display: grid;
    gap: 8px;
  }
  .checkin-row {
    display: grid;
    grid-template-columns: minmax(150px, 1fr) 96px minmax(0, 2fr);
    gap: 8px;
    align-items: center;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (max-width: 600px) {
    /* The radar scales down with the screen; keep labels at >= 12px. */
    .label {
      font-size: 17px;
    }
    .checkin-row {
      grid-template-columns: 1fr 88px;
    }
    .checkin-row input {
      grid-column: 1 / -1;
    }
    .activity li {
      grid-template-columns: 100px 1fr 44px;
    }
    .intention input,
    .link-area select,
    .checkin select,
    .checkin input {
      min-height: 44px;
    }
  }
</style>
