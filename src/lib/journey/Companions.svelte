<script lang="ts">
  import { protectMutation } from './protectMutation';
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import {
    companionAvailable,
    getCompanionEvolutionState,
    getCompanionStageImage,
    companionBonusLabel,
    careQuote,
    feedCompanion,
    selectCompanion,
  } from '$services/companionService';
  import type { Companion } from '$services/db';
  import CollectionNav from './CollectionNav.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Dialog from '$lib/ui/Dialog.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state(''),
    notice = $state(''),
    busy = $state(false),
    open = $state(false);
  let draft = $state<{
    id: number;
    name: string;
    requestId: string;
    expectedInvested: number;
    cost: number;
    stage: number;
    beforeStage: number;
  } | null>(null);
  protectMutation(
    () => busy,
    () => {
      notice = 'Aguarde a confirmação antes de sair.';
    },
  );
  onMount(() => {
    const sub = journeyQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler os companheiros.';
      },
    });
    return () => sub.unsubscribe();
  });
  function prepare(pet: Companion, amount: number) {
    try {
      const quote = careQuote(pet, amount);
      draft = {
        id: pet.id!,
        name: pet.name,
        requestId: crypto.randomUUID(),
        expectedInvested: pet.foodInvested ?? 0,
        cost: quote.cost,
        stage: quote.stage,
        beforeStage: getCompanionEvolutionState(pet)!.currentStage.stage,
      };
      error = '';
      open = true;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível preparar o cuidado.';
    }
  }
  async function choose(id: number) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await selectCompanion(id);
      notice = 'Companheiro ativo atualizado.';
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível selecionar.';
    } finally {
      busy = false;
    }
  }
  async function care() {
    if (!draft || busy) return;
    busy = true;
    error = '';
    try {
      await feedCompanion(draft.id, draft.cost, {
        requestId: draft.requestId,
        expectedInvested: draft.expectedInvested,
      });
      notice =
        draft.name +
        ' recebeu ' +
        draft.cost +
        ' Comida.' +
        (draft.stage > draft.beforeStage
          ? ' Evolução ' + draft.stage + ' alcançada!'
          : '');
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível alimentar. Nada foi confirmado.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Companheiros · Level Me Up</title></svelte:head>
<header class="journey-heading collection-heading">
  <div>
    <p class="lmu-eyebrow">Uma presença no seu caminho</p>
    <h1>Companheiros</h1>
    <p>Escolha sua companhia. Evolua no seu ritmo.</p>
  </div>
  <p class="collection-balance">{data?.profile?.food ?? 0} Comida disponível</p>
</header>
<CollectionNav />
<p class="journey-banner">
  O bônus vale enquanto o companheiro está ativo e disponível no seu nível. Não
  há fome nem perda de evolução por ficar longe.
</p>
<p role="status">{notice}</p>
{#if error && !open}<p role="alert" class="journey-error">{error}</p>{/if}
{#if data?.profile}<div class="collection-grid">
    {#each data.companions as pet (pet.id)}{@const state =
        getCompanionEvolutionState(pet)}{@const available = companionAvailable(
        pet,
        data.profile.level,
      )}{@const active = data.profile.activeCompanionId === pet.id}
      <Card class={'collection-pet ' + (active ? 'collection-selected' : '')}
        ><div class="collection-card-art">
          <Artwork
            src={getCompanionStageImage(pet) ?? pet.imagePath ?? ''}
            alt={pet.name}
          /><span class="collection-badge"
            >{!available
              ? 'Nível ' + pet.requiredLevel
              : active
                ? 'Sua companhia'
                : 'Disponível'}</span
          >
        </div>
        <div class="journey-stack">
          <h2>{pet.name}</h2>
          <p class="lmu-muted">
            Evolução {state?.currentStage.stage ?? 1} de 3 · {companionBonusLabel(
              pet,
            )}
          </p>
          {#if state}<p>
              {state.foodInvested} Comida investida{#if state.nextStage}
                · próxima evolução em {state.nextStage.totalFoodRequired}{/if}
            </p>
            <progress
              value={Math.min(state.foodInvested, 300)}
              max="300"
              aria-label={'Evolução de ' + pet.name}
            ></progress>{/if}
          <div class="journey-actions">
            <Button
              variant={active ? 'quiet' : 'secondary'}
              disabled={busy || !available || active}
              onclick={() => choose(pet.id!)}
              >{active
                ? 'Companheiro ativo'
                : available
                  ? 'Escolher companhia'
                  : 'Disponível no nível ' + pet.requiredLevel}</Button
            >
          </div>
          {#if available && state?.nextStage}<div class="journey-actions">
              <Button
                variant="secondary"
                disabled={busy ||
                  (data.profile.food ?? 0) <
                    Math.min(10, 300 - state.foodInvested)}
                onclick={() => prepare(pet, 10)}>Alimentar +10</Button
              ><Button
                disabled={busy ||
                  (data.profile.food ?? 0) <
                    Math.max(
                      0,
                      state.nextStage.totalFoodRequired - state.foodInvested,
                    )}
                onclick={() =>
                  prepare(
                    pet,
                    state.nextStage!.totalFoodRequired - state.foodInvested,
                  )}
                >Evoluir · {Math.max(
                  0,
                  state.nextStage.totalFoodRequired - state.foodInvested,
                )} Comida</Button
              >
            </div>
            <p class="lmu-hint">
              A prévia mostra o custo e o novo bônus antes de confirmar.
            </p>{:else if available}<p class="journey-status">
              Evolução máxima. Você pode continuar com esta companhia sem gastar
              comida.
            </p>{/if}{#if pet.careHistory?.length}<details>
              <summary>Últimos cuidados</summary>
              <ul class="lmu-list">
                {#each pet.careHistory
                  .slice(-3)
                  .reverse() as receipt (receipt.id)}<li>
                    {new Date(receipt.occurredAt).toLocaleDateString('pt-BR')} ·
                    {receipt.amount} Comida{receipt.toStage > receipt.fromStage
                      ? ' · evolução ' + receipt.toStage
                      : ''}
                  </li>{/each}
              </ul>
            </details>{/if}
        </div></Card
      >
    {/each}
  </div>{:else}<p role="status">Abrindo companheiros…</p>{/if}
<Dialog bind:open title="Confirmar cuidado" dismissible={!busy}
  >{#if draft}{@const pet = data?.companions.find(
      (pet) => pet.id === draft?.id,
    )}
    <div class="collection-confirm">
      <p><strong>{draft.name}</strong> receberá {draft.cost} Comida.</p>
      <p>
        Investimento: {draft.expectedInvested} → {draft.expectedInvested +
          draft.cost}. Evolução: {draft.beforeStage} → {draft.stage}.
      </p>
      {#if pet}<p>
          Novo bônus: {companionBonusLabel({
            ...pet,
            foodInvested: draft.expectedInvested + draft.cost,
            evolutionStage: draft.stage,
          })}.
        </p>{/if}
      <p class="lmu-hint">
        O custo é descontado ao confirmar. Este investimento não pode ser
        desfeito.
      </p>
      {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
      <footer>
        <Button
          variant="quiet"
          disabled={busy}
          onclick={() => {
            open = false;
          }}>Cancelar</Button
        ><Button loading={busy} onclick={care}
          >Confirmar · {draft.cost} Comida</Button
        >
      </footer>
    </div>{/if}</Dialog
>
