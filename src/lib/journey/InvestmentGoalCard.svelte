<script lang="ts">
  import Dialog from '$lib/ui/Dialog.svelte';
  import Button from '$lib/ui/Button.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import {
    chooseInvestmentGoal,
    evaluateGoal,
    listGoalOptions,
    missingText,
    type GoalSnapshot,
  } from '$services/investmentGoal';

  let { data }: { data: GoalSnapshot } = $props();
  let open = $state(false),
    busy = $state(false),
    error = $state('');
  const goal = $derived(data.profile?.investmentGoal);
  const status = $derived(evaluateGoal(goal, data));
  const options = $derived(open ? listGoalOptions(data) : []);
  const cost = (resources: { need: number; label: string }[]) =>
    resources.map((row) => `${row.need} ${row.label}`).join(' · ');

  async function choose(id: string | null) {
    if (busy) return;
    busy = true;
    error = '';
    try {
      await chooseInvestmentGoal(id, goal?.id ?? null);
      open = false;
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar o objetivo.';
    } finally {
      busy = false;
    }
  }
</script>

<section class="rpg-frame investment-goal" aria-labelledby="goal-title">
  <p class="gold-label">Seu objetivo</p>
  {#if status}
    <h2 id="goal-title">{status.title}</h2>
    {#if status.state === 'achieved'}
      <p class="goal-note">
        Objetivo alcançado. Escolha o próximo quando quiser.
      </p>
    {:else if status.state === 'unavailable'}
      <p class="goal-note">Este investimento não está mais disponível.</p>
    {:else}
      <div
        class="goal-track"
        role="progressbar"
        aria-label={`Progresso para ${status.title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={status.percent}
        aria-valuetext={status.missing || 'Pronto para investir'}
      >
        <span style={`width:${status.percent}%`}></span>
      </div>
      <ul class="goal-needs">
        {#each status.resources as row (row.key)}<li
            class:met={row.have >= row.need}
          >
            <ApprovedIcon
              name={row.key === 'gold' ? 'ouro' : 'alimentacao'}
              size={20}
            />{Math.min(row.have, row.need)} / {row.need}
            {row.label}
          </li>{/each}
        {#each status.conditions as row (row.key)}<li class:met={row.met}>
            {row.met ? '✓' : '○'}
            {row.label}
          </li>{/each}
      </ul>
      {#if status.state === 'ready'}<a class="goal-link" href={status.href}
          >Pronto para investir →</a
        >{/if}
    {/if}
    <button type="button" class="goal-change" onclick={() => (open = true)}
      >{status.state === 'achieved' || status.state === 'unavailable'
        ? 'Escolher o próximo'
        : 'Trocar objetivo'}</button
    >
  {:else}
    <h2 id="goal-title">No que investir?</h2>
    <p class="goal-note">
      Escolha uma construção, item ou evolução e acompanhe aqui quanto falta.
    </p>
    <button type="button" class="goal-change" onclick={() => (open = true)}
      >Escolher objetivo</button
    >
  {/if}
</section>

<Dialog
  bind:open
  title="Escolher objetivo"
  description="O objetivo só mostra a distância. Seu ouro continua livre para qualquer compra."
>
  {#if error}<p role="alert" class="journey-error">{error}</p>{/if}
  <ul class="goal-options">
    {#each options as option (option.id)}
      {@const missing = missingText(option.resources, option.conditions)}
      <li>
        <button
          type="button"
          disabled={busy}
          aria-pressed={goal?.id === option.id}
          onclick={() => choose(option.id)}
        >
          <strong>{option.title}</strong>
          <span>{cost(option.resources)}</span>
          <small>{missing || 'Você já tem o necessário'}</small>
        </button>
      </li>
    {/each}
  </ul>
  {#if goal}<Button variant="quiet" disabled={busy} onclick={() => choose(null)}
      >Ficar sem objetivo</Button
    >{/if}
</Dialog>

<style>
  .investment-goal {
    padding: 16px;
  }
  .gold-label {
    color: #f0d189;
    font: 600 1.2rem var(--lmu-display);
    margin: 0 0 3px;
  }
  .investment-goal h2 {
    margin: 0 0 8px;
    overflow-wrap: anywhere;
  }
  .goal-track {
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #0b1a1c;
    border: 1px solid #7d6a3f66;
  }
  .goal-track span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #8a6a2c, #c9a356);
  }
  .goal-needs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    font-size: 0.82rem;
    color: #c9ccbd;
  }
  .goal-needs li {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .goal-needs li.met {
    color: #a9d3a2;
  }
  .goal-note {
    margin: 0;
    font-size: 0.8rem;
    color: #afbfad;
  }
  .goal-link,
  .goal-change {
    display: inline-block;
    margin-top: 10px;
    color: #edcb83;
    font-size: 0.8rem;
    text-decoration: none;
  }
  .goal-change {
    border: 0;
    background: none;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }
  .goal-link + .goal-change {
    margin-left: 14px;
  }
  .goal-options {
    display: grid;
    gap: 8px;
    max-height: min(60vh, 520px);
    overflow: auto;
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
  }
  .goal-options button {
    display: grid;
    gap: 2px;
    width: 100%;
    padding: 10px 12px;
    text-align: left;
    border: 1px solid var(--lmu-border, #5c6b5166);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .goal-options button[aria-pressed='true'] {
    border-color: #c9a356;
  }
  .goal-options span,
  .goal-options small {
    font-size: 0.8rem;
    opacity: 0.85;
  }
</style>
