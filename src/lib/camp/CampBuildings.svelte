<script lang="ts">
  import { onMount } from 'svelte';
  import type { Profile } from '$services/db';
  import Button from '$lib/ui/Button.svelte';
  import { building, STORAGE_CAP, type Cost } from './buildings';
  import {
    buildOrUpgrade,
    buildingViews,
    collectProduction,
  } from '$services/campBuildingsService';
  import { MATERIAL_LABEL, type Material } from '$services/resourceLedger';

  let { profile }: { profile: Profile } = $props();
  let now = $state(Date.now()),
    busy = $state(false),
    error = $state(''),
    notice = $state('');
  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 60_000);
    return () => clearInterval(timer);
  });
  const views = $derived(buildingViews(profile, now));
  const label = (key: string) =>
    key === 'gold'
      ? 'Ouro'
      : key === 'food'
        ? 'Comida'
        : MATERIAL_LABEL[key as Material];
  const have = (key: string) =>
    key === 'gold' ? profile.gold : (profile.materials?.[key as Material] ?? 0);
  const parts = (cost: Cost) =>
    Object.entries(cost).filter(([, value]) => value) as [string, number][];
  const affordable = (cost: Cost) =>
    parts(cost).every(([key, value]) => have(key) >= value);

  async function act(run: () => Promise<unknown>, done: string) {
    if (busy) return;
    busy = true;
    error = '';
    notice = '';
    try {
      await run();
      notice = done;
      now = Date.now();
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível concluir.';
    } finally {
      busy = false;
    }
  }
</script>

<section class="camp-buildings" aria-labelledby="camp-buildings-title">
  <header>
    <h2 id="camp-buildings-title">Construções</h2>
    <p class="lmu-hint">
      Produzem sozinhas enquanto você cuida da vida, até {STORAGE_CAP} de cada material
      esperando coleta.
    </p>
  </header>
  <ul>
    {#each views as view (view.id)}
      {@const def = building(view.id)}
      <li class="building-card" aria-label={def.name}>
        <div class="building-head">
          <strong>{def.name}</strong>
          <span>{view.level ? `Nível ${view.level}` : 'Não construída'}</span>
        </div>
        {#if view.level}
          <p>
            {def.levels[view.level - 1].perDay}
            {label(def.produces)} por dia · cuidada pela {def.worker}.
          </p>
          <div class="building-actions">
            <Button
              variant="secondary"
              size="s"
              disabled={busy || !view.pending}
              onclick={() =>
                act(
                  () => collectProduction(view.id),
                  `+${view.pending} ${label(def.produces)} coletados.`,
                )}>Coletar {view.pending} {label(def.produces)}</Button
            >
          </div>
        {:else if !view.blocked}
          <p class="building-referral">{def.referral}</p>
        {/if}
        {#if view.next && !view.blocked}
          <p class="building-cost">
            {view.level
              ? 'Melhorar para o nível ' + (view.level + 1)
              : 'Custo'}:
            {#each parts(view.next.cost) as [key, value], index (key)}{index
                ? ' · '
                : ''}<span class:missing={have(key) < value}
                >{value} {label(key)}</span
              >{/each}
          </p>
          <Button
            variant="secondary"
            size="s"
            disabled={busy || !affordable(view.next.cost)}
            onclick={() =>
              act(
                () => buildOrUpgrade(view.id, view.level),
                view.level
                  ? `${def.name} melhorada para o nível ${view.level + 1}.`
                  : `${def.name} construída. A ${def.worker} já começou.`,
              )}>{view.level ? 'Melhorar' : 'Construir'}</Button
          >
        {:else if view.blocked}
          <p class="lmu-hint">{view.blocked}</p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  {#if notice}<p class="lmu-hint" role="status">{notice}</p>{/if}
  <p class="lmu-hint">
    Ilustrações das construções ainda virão; por enquanto, elas aparecem só
    aqui.
  </p>
</section>

<style>
  .camp-buildings {
    display: grid;
    gap: 12px;
    max-width: 960px;
    margin: 16px auto;
    padding: 16px;
    border: 1px solid #5f6f6a66;
    border-radius: 10px;
    background: #061115f0;
    color: #ece4d0;
  }
  header h2 {
    margin: 0;
    font: 500 1.55rem var(--lmu-display, serif);
  }
  header p {
    margin: 4px 0 0;
  }
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .building-card {
    display: grid;
    align-content: start;
    gap: 8px;
    padding: 12px;
    border: 1px solid #5f6f6a66;
    border-radius: 8px;
    background: #0c1b1e;
  }
  .building-card p {
    margin: 0;
    font-size: 0.88rem;
  }
  .building-head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: baseline;
  }
  .building-head strong {
    font: 600 1.2rem var(--lmu-display, serif);
  }
  .building-head span {
    font-size: 0.8rem;
    color: #c3cabd;
  }
  .building-referral {
    font-style: italic;
    color: #c3cabd;
  }
  .missing {
    color: #e6b4a4;
  }
  .building-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
