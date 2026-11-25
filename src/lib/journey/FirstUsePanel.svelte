<script lang="ts">
  import Button from '$lib/ui/Button.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import DayHoursForm from './DayHoursForm.svelte';
  import { countLabel } from '$lib/plural';
  import type { Area, Profile } from '$services/db';
  import type { DomainKey } from '$lib/content/domains';
  import {
    GAME_LAYERS,
    gameLayerLabels,
    gameLayerOf,
    setGameLayer,
    type GameLayer,
  } from '$services/gameLayer';
  import {
    createFirstUseAreas,
    dayHoursOf,
    domainSuggestions,
    FIRST_USE_STEPS,
    nextFirstUseStep,
    postponeFirstUse,
    skipFirstUse,
    skipFirstUseStep,
    type FirstUseStep,
  } from '$services/firstUse';

  /**
   * Primeiro uso opcional (lote 7): três passos curtos, cada um pode ser
   * pulado; "Agora não" recolhe e "Pular tudo" encerra. O resto do Hoje
   * continua usável o tempo todo.
   */
  let {
    profile,
    areas,
    onnotice,
  }: {
    profile: Profile;
    areas: Area[];
    onnotice: (message: string) => void;
  } = $props();

  const step = $derived(nextFirstUseStep(profile));
  const position = $derived(step ? FIRST_USE_STEPS.indexOf(step) + 1 : 0);
  let busy = $state(false),
    error = $state('');

  async function run(action: () => Promise<unknown>, message = '') {
    error = '';
    busy = true;
    try {
      await action();
      if (message) onnotice(message);
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'Não foi possível salvar. Nada foi alterado.';
    } finally {
      busy = false;
    }
  }
  const last = (current: FirstUseStep) =>
    FIRST_USE_STEPS.every(
      (key) => key === current || profile.firstUse?.steps[key],
    );
  const doneMessage =
    'Pronto. Áreas, horários do dia e camada de jogo ficam em Configurações.';
  const after = (current: FirstUseStep, message: string) =>
    last(current) ? `${message} ${doneMessage}` : message;

  // Passo 1: áreas.
  const sameName = (a: string, b: string) =>
    a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR');
  const exists = (name: string) =>
    sameName(name, 'Geral') || areas.some((area) => sameName(area.nome, name));
  let picked = $state<DomainKey[]>([]),
    custom = $state<string[]>([]),
    draft = $state('');
  const chosen = $derived(picked.length + custom.length);
  function toggle(key: DomainKey) {
    picked = picked.includes(key)
      ? picked.filter((item) => item !== key)
      : [...picked, key];
  }
  function addCustom() {
    const name = draft.trim();
    if (!name) return;
    error = '';
    if (name.length > 80) {
      error = 'Escreva nomes de área com até 80 caracteres.';
      return;
    }
    if (exists(name)) {
      error = `Você já tem a área “${name}”. Ela continua como está.`;
      return;
    }
    const suggestion = domainSuggestions.find((row) =>
      sameName(row.name, name),
    );
    if (suggestion) {
      if (!picked.includes(suggestion.key)) toggle(suggestion.key);
    } else if (!custom.some((item) => sameName(item, name)))
      custom = [...custom, name];
    draft = '';
  }
  function createAreas() {
    const choices = [
      ...domainSuggestions
        .filter((row) => picked.includes(row.key))
        .map((row) => ({ name: row.name, domain: row.key })),
      ...custom.map((name) => ({ name })),
    ];
    return run(async () => {
      const result = await createFirstUseAreas(choices);
      const kept = result.kept.length
        ? ` ${result.kept.map((name) => `“${name}”`).join(', ')} já existia${result.kept.length > 1 ? 'm' : ''} e ficou como estava.`
        : '';
      onnotice(
        after(
          'areas',
          `${result.created.length ? `${countLabel(result.created.length, 'área criada', 'áreas criadas')}.` : 'Nenhuma área nova.'}${kept}`,
        ),
      );
    });
  }

  // Passo 3: camada.
  // svelte-ignore state_referenced_locally
  let layer = $state<GameLayer>(gameLayerOf(profile));
  const layerHint: Record<GameLayer, string> = {
    completa: 'Herói, Acampamento e recompensas sempre à vista.',
    discreta: 'Uma linha de XP no Hoje; a Jornada fica num canto.',
    desligada: 'Só produtividade e método.',
  };
</script>

{#if step}<section
    class="first-use"
    aria-labelledby="first-use-title"
    data-step={step}
  >
    <header>
      <div>
        <p class="first-use-eyebrow">
          Opcional · passo {position} de {FIRST_USE_STEPS.length}
        </p>
        <h2 id="first-use-title">Ajustar o LMUP para você</h2>
      </div>
      <div class="first-use-exit">
        <Button
          variant="quiet"
          size="s"
          disabled={busy}
          onclick={() =>
            run(
              postponeFirstUse,
              'Tudo bem. Quando quiser, continue em Configurações.',
            )}>Agora não</Button
        ><Button
          variant="quiet"
          size="s"
          disabled={busy}
          onclick={() =>
            run(
              skipFirstUse,
              'Preparação encerrada. Tudo pode ser ajustado em Configurações.',
            )}>Pular tudo</Button
        >
      </div>
    </header>

    {#if step === 'areas'}
      <h3>O que você quer acompanhar?</h3>
      <p class="first-use-hint">
        Ideias da Roda da Vida. Escolha quantas quiser, ou nenhuma. Você pode
        criar outras quando precisar.
      </p>
      <ul class="first-use-chips" aria-label="Sugestões de áreas">
        {#each domainSuggestions as row (row.key)}
          {@const taken = exists(row.name)}
          <li>
            <button
              type="button"
              class="chip"
              aria-pressed={taken ? undefined : picked.includes(row.key)}
              disabled={busy || taken}
              title={taken ? `Você já tem “${row.name}”` : row.label}
              onclick={() => toggle(row.key)}
              >{#if row.icon}<ApprovedIcon
                  name={row.icon}
                  size={20}
                />{/if}{row.name}{#if taken}<small>· já existe</small
                >{/if}</button
            >
          </li>{/each}
        {#each custom as name (name)}<li>
            <button
              type="button"
              class="chip"
              aria-pressed="true"
              disabled={busy}
              aria-label={`Remover ${name}`}
              onclick={() => (custom = custom.filter((item) => item !== name))}
              >{name} <span aria-hidden="true">✕</span></button
            >
          </li>{/each}
      </ul>
      <form
        class="first-use-custom"
        onsubmit={(event) => {
          event.preventDefault();
          addCustom();
        }}
      >
        <label for="first-use-area">Outra área</label>
        <input
          id="first-use-area"
          bind:value={draft}
          maxlength="80"
          autocomplete="off"
          placeholder="Ex.: Violão"
          disabled={busy}
        /><Button
          type="submit"
          variant="secondary"
          size="s"
          disabled={busy || !draft.trim()}>Adicionar</Button
        >
      </form>
      <div class="journey-actions">
        {#if chosen}<Button size="s" loading={busy} onclick={createAreas}
            >{chosen === 1 ? 'Criar 1 área' : `Criar ${chosen} áreas`}</Button
          >{/if}<Button
          variant={chosen ? 'quiet' : 'secondary'}
          size="s"
          disabled={busy}
          onclick={() =>
            run(
              () => skipFirstUseStep('areas'),
              after('areas', 'Sem áreas por enquanto.'),
            )}>Pular passo</Button
        >
      </div>
    {:else if step === 'day'}
      <h3>Quando seu dia costuma começar e terminar?</h3>
      <p class="first-use-hint">
        Serve só para estimar as horas ≈ do plano. Nada fica bloqueado: você faz
        coisas antes ou depois quando quiser. Preencha um, os dois ou nenhum.
      </p>
      <DayHoursForm
        hours={dayHoursOf(profile)}
        onsaved={() => onnotice(after('day', 'Horários do dia salvos.'))}
        >{#snippet actions()}<Button
            variant="quiet"
            size="s"
            disabled={busy}
            onclick={() =>
              run(
                () => skipFirstUseStep('day'),
                after('day', 'Sem horários por enquanto.'),
              )}>Pular passo</Button
          >{/snippet}</DayHoursForm
      >
    {:else}
      <fieldset class="first-use-layers">
        <legend><h3>Quanto do jogo você quer ver?</h3></legend>
        <p class="first-use-hint">
          XP e recompensas são guardados em qualquer opção; trocar depois não
          perde nada.
        </p>
        {#each GAME_LAYERS as option (option)}<label class="layer-option"
            ><input
              type="radio"
              name="first-use-layer"
              value={option}
              bind:group={layer}
              disabled={busy}
            /><span
              ><strong>{gameLayerLabels[option].title}</strong>
              <small>{layerHint[option]}</small></span
            ></label
          >{/each}
      </fieldset>
      <div class="journey-actions">
        <Button
          size="s"
          loading={busy}
          onclick={() =>
            run(
              () => setGameLayer(layer),
              after(
                'layer',
                `Camada de jogo: ${gameLayerLabels[layer].title}.`,
              ),
            )}>Usar {gameLayerLabels[layer].title}</Button
        ><Button
          variant="quiet"
          size="s"
          disabled={busy}
          onclick={() =>
            run(
              () => skipFirstUseStep('layer'),
              after(
                'layer',
                `Camada de jogo: ${gameLayerLabels[gameLayerOf(profile)].title}.`,
              ),
            )}>Pular passo</Button
        >
      </div>
    {/if}
    {#if error}<p class="journey-error" role="alert">{error}</p>{/if}
  </section>{/if}

<style>
  .first-use {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    min-width: 0;
    padding: 14px 16px;
    border: 1px solid var(--lmu-line);
    border-radius: 10px;
    background: var(--lmu-surface);
  }
  .first-use header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  /* Cormorant só de 22 px para cima: títulos do painel na fonte do sistema. */
  .first-use h2,
  .first-use h3 {
    margin: 0;
    font-family: var(--lmu-font);
    font-weight: 600;
  }
  .first-use h2 {
    font-size: 1.05rem;
  }
  .first-use h3 {
    font-size: 1rem;
  }
  .first-use-eyebrow {
    margin: 0 0 2px;
    color: var(--lmu-muted);
    font-size: 0.8rem;
  }
  .first-use-exit {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-left: auto;
  }
  .first-use-hint {
    margin: 0;
    color: var(--lmu-muted);
    font-size: 0.875rem;
  }
  .first-use-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 2.25rem;
    padding: 0 12px 0 8px;
    border: 1px solid var(--lmu-control-line);
    border-radius: 999px;
    background: transparent;
    color: var(--lmu-text);
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .chip[aria-pressed='true'] {
    border-color: var(--lmu-action);
    background: var(--lmu-raised);
    box-shadow: inset 0 0 0 1px var(--lmu-action);
  }
  .chip:disabled {
    cursor: default;
    opacity: 0.65;
  }
  .chip small {
    color: var(--lmu-muted);
  }
  .chip:focus-visible {
    outline: 2px solid var(--lmu-focus);
    outline-offset: 2px;
  }
  .first-use-custom {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .first-use-custom label {
    font-size: 0.875rem;
    color: var(--lmu-muted);
  }
  .first-use-custom input {
    flex: 1 1 8rem;
    min-width: 0;
    min-height: var(--lmu-control, 2.5rem);
    padding: 0 10px;
    border: 1px solid var(--lmu-control-line);
    border-radius: 8px;
    background: var(--lmu-bg);
    color: var(--lmu-text);
    font: inherit;
  }
  .first-use-layers {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .first-use-layers legend {
    padding: 0;
    margin-bottom: 4px;
  }
  .layer-option {
    display: flex;
    align-items: start;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid var(--lmu-line);
    border-radius: 8px;
    cursor: pointer;
  }
  .layer-option:has(input:checked) {
    border-color: var(--lmu-action);
    background: var(--lmu-raised);
  }
  .layer-option input {
    margin-top: 3px;
    accent-color: var(--lmu-action);
  }
  .layer-option span {
    display: grid;
    gap: 2px;
  }
  .layer-option small {
    color: var(--lmu-muted);
  }
  .first-use :global(.journey-actions) {
    margin: 0;
  }
</style>
