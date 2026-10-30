<script lang="ts">
  import { companionArtwork } from './companionArtwork';
  import { protectMutation } from './protectMutation';
  import { onMount } from 'svelte';
  import {
    companionsQuery,
    type CompanionsSnapshot,
  } from '$services/companionsQuery';
  import { guardUpdates } from './guardUpdates';
  import {
    companionAvailable,
    companionRequiredLevel,
    getCompanionEvolutionState,
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
  let data = $state<CompanionsSnapshot>();
  let previewPet = $state<Companion | null>(null);
  let previewOpen = $state(false);
  guardUpdates(() => open || previewOpen);
  let error = $state(''),
    notice = $state(''),
    busy = $state(false),
    open = $state(false);
  let draft = $state<{
    id: number;
    kind: 'feed' | 'evolve';
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
    const sub = companionsQuery().subscribe({
      next: (value) => {
        data = value;
      },
      error: () => {
        error = 'Não foi possível ler os companheiros.';
      },
    });
    return () => sub.unsubscribe();
  });
  const currentPet = $derived(
    data?.companions.find((pet) => pet.id === draft?.id),
  );
  const careProblem = $derived.by(() => {
    if (!draft || !data) return '';
    if (!currentPet || !companionAvailable(currentPet, data.profile.level))
      return 'Esta companhia não está disponível no seu nível atual.';
    if (
      (currentPet.foodInvested ?? 0) !== draft.expectedInvested ||
      getCompanionEvolutionState(currentPet)?.currentStage.stage !==
        draft.beforeStage
    )
      return 'O investimento mudou em outra aba. Confira a nova prévia antes de alimentar.';
    if ((data.profile.food ?? 0) < draft.cost)
      return 'Seu saldo mudou. Não há Comida suficiente para este cuidado.';
    return '';
  });
  function prepare(pet: Companion, kind: 'feed' | 'evolve') {
    try {
      const state = getCompanionEvolutionState(pet);
      const amount =
        kind === 'feed'
          ? 10
          : (state?.nextStage?.totalFoodRequired ?? 0) -
            (pet.foodInvested ?? 0);
      const quote = careQuote(pet, amount);
      draft = {
        id: pet.id!,
        kind,
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
    if (!draft || busy || careProblem) return;
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
{#if data?.profile}
  {@const selected = data.companions.find(
    (pet) => pet.id === data?.profile.activeCompanionId,
  )}
  <section class="companion-summary lmu-card" aria-label="Sua companhia atual">
    {#if selected && companionAvailable(selected, data.profile.level)}
      <p class="lmu-eyebrow">Com você agora</p>
      <h2>{selected.name}</h2>
      <p>{companionBonusLabel(selected)} enquanto estiver ativo.</p>
    {:else}<h2>Escolha uma companhia disponível</h2>
      <p>A seleção atual não concede bônus no seu nível.</p>{/if}
    <a href="/perfil">Conferir todos os bônus no perfil →</a>
  </section>
  <div class="collection-grid companion-grid">
    {#each data.companions as pet (pet.id)}{@const state =
        getCompanionEvolutionState(pet)}{@const available = companionAvailable(
        pet,
        data.profile.level,
      )}{@const active = data.profile.activeCompanionId === pet.id}
      <Card
        class={'collection-pet ' +
          (active && available ? 'collection-selected' : '')}
        ><div class="collection-card-art">
          <Artwork src={companionArtwork(pet)} alt={pet.name} /><span
            class="collection-badge"
            >{!available
              ? 'Nível ' + companionRequiredLevel(pet)
              : active
                ? 'Sua companhia'
                : 'Disponível'}</span
          >
        </div>
        <div class="journey-stack">
          <h2>{pet.name}</h2>
          <p class="lmu-muted">
            Evolução {state?.currentStage.stage ?? 1} de {state?.maxStage ?? 3} ·
            {companionBonusLabel(pet)}
          </p>
          {#if state}<p>
              {state.foodInvested} Comida investida{#if state.nextStage}
                · próxima evolução em {state.nextStage.totalFoodRequired}{/if}
            </p>
            <progress
              value={state.nextStage
                ? Math.max(
                    0,
                    state.foodInvested - state.currentStage.totalFoodRequired,
                  )
                : 1}
              max={state.nextStage
                ? state.nextStage.totalFoodRequired -
                  state.currentStage.totalFoodRequired
                : 1}
              aria-label={'Evolução de ' + pet.name}
              aria-valuetext={state.nextStage
                ? state.nextStage.totalFoodRequired -
                  state.foodInvested +
                  ' Comida até a evolução ' +
                  state.nextStage.stage
                : 'Evolução máxima'}
            ></progress>{/if}
          <div class="journey-actions">
            <Button
              variant={active ? 'quiet' : 'secondary'}
              disabled={busy || !available || active}
              onclick={() => choose(pet.id!)}
              >{active && available
                ? 'Companheiro ativo'
                : available
                  ? 'Escolher companhia'
                  : 'Disponível no nível ' +
                    companionRequiredLevel(pet)}</Button
            >
          </div>
          {#if available && state?.nextStage}<div class="journey-actions">
              <Button
                variant="secondary"
                disabled={busy ||
                  (data.profile.food ?? 0) <
                    Math.min(10, 300 - state.foodInvested)}
                onclick={() => prepare(pet, 'feed')}>Alimentar +10</Button
              ><Button
                disabled={busy ||
                  (data.profile.food ?? 0) <
                    Math.max(
                      0,
                      state.nextStage.totalFoodRequired - state.foodInvested,
                    )}
                onclick={() => prepare(pet, 'evolve')}
                >Evoluir · {Math.max(
                  0,
                  state.nextStage.totalFoodRequired - state.foodInvested,
                )} Comida</Button
              >
            </div>
            <p class="lmu-hint">
              Faltam {state.nextStage.totalFoodRequired - state.foodInvested} Comida
              investida para a evolução {state.nextStage.stage}.
              {#if (data.profile.food ?? 0) < state.nextStage.totalFoodRequired - state.foodInvested}
                Seu saldo ainda precisa de {state.nextStage.totalFoodRequired -
                  state.foodInvested -
                  (data.profile.food ?? 0)} Comida para evoluir de uma vez.
              {/if}
              A prévia mostra o custo antes de confirmar.
            </p>{:else if available}<p class="journey-status">
              Evolução máxima. Você pode continuar com esta companhia sem gastar
              comida.
            </p>{/if}
          {#if state}<Button
              variant="quiet"
              onclick={() => {
                previewPet = pet;
                previewOpen = true;
              }}
              aria-label={'Ver evoluções de ' + pet.name}>Ver evoluções</Button
            >
          {:else}<p class="lmu-hint">
              Evoluções indisponíveis para este registro. Nenhum cuidado será
              descontado.
            </p>{/if}
          {#if !available}<p class="lmu-hint">
              {state
                ? 'Seleção e cuidado disponíveis no nível ' +
                  companionRequiredLevel(pet) +
                  '. As prévias não desbloqueiam a companhia.'
                : 'Esta companhia não tem configuração reconhecida.'}
            </p>{/if}
          {#if pet.careHistory?.length}<details>
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
      <p tabindex="-1" data-initial-focus>
        <strong>{draft.name}</strong> receberá {draft.cost} Comida.
      </p>
      <p>
        Saldo atual: {data?.profile.food ?? 0} Comida. {#if (data?.profile.food ?? 0) >= draft.cost}Após
          confirmar: {(data?.profile.food ?? 0) - draft.cost} Comida.{/if}
      </p>
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
      {#if careProblem}<p role="alert" class="journey-error">{careProblem}</p>
        {#if currentPet && companionAvailable(currentPet, data?.profile.level ?? 0) && getCompanionEvolutionState(currentPet)?.nextStage}
          <Button
            variant="secondary"
            disabled={busy}
            onclick={() => prepare(currentPet!, draft!.kind)}
            >Atualizar prévia</Button
          >
        {/if}
      {:else if error}<p role="alert" class="journey-error">{error}</p>{/if}
      {#if currentPet && data && data.profile.activeCompanionId !== currentPet.id}<p
          class="lmu-hint"
        >
          Cuidar não escolhe a companhia. O bônus só vale quando ela estiver
          ativa e disponível.
        </p>{/if}
      <footer>
        <Button
          variant="quiet"
          disabled={busy}
          onclick={() => {
            open = false;
          }}>Cancelar</Button
        ><Button loading={busy} disabled={!!careProblem} onclick={care}
          >Confirmar · {draft.cost} Comida</Button
        >
      </footer>
    </div>{/if}</Dialog
>

<Dialog
  bind:open={previewOpen}
  title={'Evoluções: ' + (previewPet?.name ?? '')}
>
  {#if previewOpen && previewPet}{@const state =
      getCompanionEvolutionState(previewPet)}
    <p tabindex="-1" data-initial-focus>
      Prévia visual. Não gasta Comida, não evolui nem seleciona a companhia.
    </p>
    {#if state}<div class="companion-evolutions">
        {#each state.stages as stage (stage.stage)}
          {@const sample = {
            ...previewPet,
            foodInvested: stage.totalFoodRequired,
            evolutionStage: stage.stage,
          }}
          <section class="companion-evolution">
            <div class="companion-evolution-art">
              <Artwork
                src={companionArtwork(sample)}
                alt={'Evolução ' + stage.stage + ' de ' + previewPet.name}
                sizes="160px"
                eager
              />
            </div>
            <h3>Evolução {stage.stage}</h3>
            <p>{companionBonusLabel(sample)}</p>
            <p class="lmu-hint">
              {stage.totalFoodRequired} Comida investida no total.
            </p>
            {#if stage.stage === state.currentStage.stage}<p
                class="journey-status"
              >
                Evolução atual
              </p>{/if}
          </section>
        {/each}
      </div>{/if}
    <p class="lmu-hint">
      Bônus valem apenas com a companhia ativa e disponível no seu nível.
    </p>
    <footer>
      <Button onclick={() => (previewOpen = false)}>Fechar prévia</Button>
    </footer>
  {/if}
</Dialog>
