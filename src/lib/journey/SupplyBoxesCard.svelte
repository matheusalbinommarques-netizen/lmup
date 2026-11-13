<script lang="ts">
  import { onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '$services/db';
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import {
    BOX_XP,
    BOXES_PER_DAY,
    boxAmount,
    openSupplyBox,
    supplyBoxStatus,
    type BoxStatus,
  } from '$services/supplyBoxes';
  import {
    MATERIALS,
    MATERIAL_LABEL,
    type Material,
  } from '$services/resourceLedger';

  let { today }: { today: string } = $props();
  let status = $state.raw<BoxStatus>();
  let stock = $state<Record<Material, number>>({ wood: 0, stone: 0, ore: 0 });
  let debt = $state<Record<Material, number>>({ wood: 0, stone: 0, ore: 0 });
  let open = $state(false),
    busy = $state(false),
    error = $state(''),
    notice = $state('');

  onMount(() => {
    const sub = liveQuery(async () => ({
      status: await supplyBoxStatus(today),
      profile: await db.profile.get(1),
    })).subscribe({
      next: (value) => {
        status = value.status;
        stock = { wood: 0, stone: 0, ore: 0, ...value.profile?.materials };
        debt = { wood: 0, stone: 0, ore: 0, ...value.profile?.materialDebt };
      },
      error: () => (error = 'Não foi possível ler as caixas.'),
    });
    return () => sub.unsubscribe();
  });

  const next = $derived(status?.available[0]);
  const owes = $derived(MATERIALS.some((key) => debt[key] > 0));
  const day = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

  async function choose(material: Material) {
    if (!next || busy) return;
    busy = true;
    error = '';
    try {
      await openSupplyBox({ date: next.date, index: next.index, material });
      notice = `+${boxAmount(next.index, material)} ${MATERIAL_LABEL[material]} guardados.`;
      if ((status?.available.length ?? 0) <= 1) open = false;
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível abrir.';
    } finally {
      busy = false;
    }
  }
</script>

{#if status}
  <section class="rpg-frame supply-boxes" aria-labelledby="boxes-title">
    <p class="gold-label">Suprimentos</p>
    <h2 id="boxes-title">
      Caixas de hoje: {status.today.earned} de {BOXES_PER_DAY}
    </h2>
    {#if status.today.earned >= BOXES_PER_DAY}
      <p class="boxes-note">
        Limite do dia alcançado. Suas missões continuam rendendo XP e ouro.
      </p>
    {:else}
      <div
        class="boxes-track"
        role="progressbar"
        aria-label="Progresso até a próxima caixa"
        aria-valuemin={0}
        aria-valuemax={BOX_XP}
        aria-valuenow={status.today.progress}
        aria-valuetext={`${status.today.progress} de ${BOX_XP} XP`}
      >
        <span style={`width:${(status.today.progress / BOX_XP) * 100}%`}></span>
      </div>
      <p class="boxes-note">
        {status.today.progress} / {BOX_XP} XP para a próxima caixa
      </p>
    {/if}
    <ul class="boxes-stock" aria-label="Materiais guardados">
      {#each MATERIALS as key (key)}<li>
          <strong>{stock[key]}</strong>
          {MATERIAL_LABEL[key]}{#if debt[key]}<small>
              (deve {debt[key]})</small
            >{/if}
        </li>{/each}
    </ul>
    {#if owes}<p class="boxes-note">
        Uma caixa foi estornada depois de usada; as próximas pagam o que falta.
      </p>{/if}
    {#if status.available.length}<Button
        variant="secondary"
        size="s"
        onclick={() => {
          notice = '';
          open = true;
        }}
        >Abrir caixa{status.available.length > 1
          ? ` (${status.available.length})`
          : ''}</Button
      >{/if}
    {#if notice && !open}<p class="boxes-note" role="status">{notice}</p>{/if}
  </section>

  <Dialog
    bind:open
    title="Abrir caixa de suprimentos"
    description="Escolha o material. Ele fica guardado para as construções do acampamento."
  >
    {#if next}
      <p class="lmu-hint">
        Caixa {next.index} de {BOXES_PER_DAY} de {day(next.date)} · vale {Math.round(
          next.factor * 100,
        )}%
      </p>
      <div class="boxes-choices">
        {#each MATERIALS as key (key)}<Button
            variant="secondary"
            disabled={busy}
            onclick={() => choose(key)}
            >{boxAmount(next.index, key)} {MATERIAL_LABEL[key]}</Button
          >{/each}
      </div>
    {:else}<p>{notice || 'Nenhuma caixa para abrir agora.'}</p>{/if}
    {#if notice && next}<p class="lmu-hint" role="status">{notice}</p>{/if}
    {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  </Dialog>
{/if}

<style>
  .supply-boxes {
    display: grid;
    gap: 8px;
    padding: 16px;
  }
  .gold-label {
    color: var(--d05-label, #f0d189);
    font: 600 1.2rem var(--lmu-display);
    margin: 0;
  }
  .supply-boxes h2 {
    margin: 0;
  }
  .boxes-track {
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #0b1a1c;
    border: 1px solid #5f6f6a66;
  }
  .boxes-track span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #8a6a2c, #c9a356);
  }
  .boxes-note {
    margin: 0;
    font-size: 0.8rem;
    color: #afbfad;
  }
  .boxes-stock {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.85rem;
  }
  .boxes-stock small {
    color: #e6b4a4;
  }
  .boxes-choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
</style>
