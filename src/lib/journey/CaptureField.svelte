<script lang="ts">
  import Button from '$lib/ui/Button.svelte';
  import { saveTaskDefinition } from '$services/taskDefinitionService';
  import { dateKey } from '$services/rewardService';
  import {
    destinationLabel,
    minutesLabel,
    parseCapture,
    type CaptureFallback,
  } from '$services/capture';

  // Captura em linguagem natural (design P2): o destino aparece antes de
  // confirmar. Na aba Sem dia, sem data vai para a caixa; no Hoje, para o Dia.
  let {
    fallback = 'inbox',
    label = 'Capturar uma missão',
    placeholder = 'Ex.: Ligar para o seguro 30min sex',
    oncreated,
  }: {
    fallback?: CaptureFallback;
    label?: string;
    placeholder?: string;
    oncreated?: (id: number, destination: string) => void;
  } = $props();
  const uid = $props.id();
  let text = $state(''),
    literal = $state(false),
    busy = $state(false),
    error = $state(''),
    notice = $state('');
  let today = $state(dateKey());
  const capture = $derived(parseCapture(text, today, fallback, literal));
  const destination = $derived(destinationLabel(capture, today));
  $effect(() => {
    if (!text) literal = false;
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (busy) return;
    today = dateKey();
    // Capturado antes de gravar: o que se digita durante o salvamento fica.
    const chosen = parseCapture(text, today, fallback, literal);
    const typed = text;
    if (!chosen.title) {
      error = 'Escreva o que precisa ser feito.';
      return;
    }
    error = '';
    busy = true;
    const label = destinationLabel(chosen, today);
    try {
      const id = await saveTaskDefinition({
        title: chosen.title,
        requestId: crypto.randomUUID(),
        planToday: false,
        plannedDate: chosen.plannedDate,
        someday: chosen.someday,
        plannedTime: chosen.plannedTime,
        estimatedMinutes: chosen.estimatedMinutes,
      });
      if (text === typed) text = '';
      literal = false;
      notice = `Adicionada em ${label}: ${chosen.title}.`;
      oncreated?.(id, label);
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Não foi possível adicionar.';
    } finally {
      busy = false;
    }
  }
</script>

<form class="capture" onsubmit={submit} novalidate>
  <label class="capture-label" for={`${uid}-text`}>{label}</label>
  <div class="capture-box">
    <input
      id={`${uid}-text`}
      bind:value={text}
      {placeholder}
      autocomplete="off"
      maxlength="200"
      aria-describedby={`${uid}-preview`}
      aria-invalid={!!error}
      oninput={() => {
        error = '';
        notice = '';
      }}
    />
    <Button type="submit" size="m" disabled={busy}>Adicionar</Button>
  </div>
  <p class="capture-preview" id={`${uid}-preview`} aria-live="polite">
    {#if text.trim()}<strong>Vai para: {destination}</strong
      >{#if capture.title}<span>
          · {capture.title}</span
        >{/if}{#if capture.estimatedMinutes}<span>
          · {minutesLabel(capture.estimatedMinutes)}</span
        >{/if}{#if capture.tokens.length}<span class="capture-tokens"
          >· Reconhecido: {#each capture.tokens as token (token.start)}<mark
              >{token.text}</mark
            >{/each}</span
        ><button
          type="button"
          class="capture-literal"
          onclick={() => (literal = true)}>Usar só o texto</button
        >{:else if literal}<button
          type="button"
          class="capture-literal"
          onclick={() => (literal = false)}>Ler datas de novo</button
        >{/if}{:else}<span
        >Escreva o dia e a duração na frase: “amanhã”, “sex”, “20/11”, “às 14h”,
        “30min”, “algum dia”. Sem dia, vai para {fallback === 'today'
          ? 'o Dia de hoje'
          : 'a Caixa de entrada'}.</span
      >{/if}
  </p>
  {#if error}<p class="capture-error" role="alert">{error}</p>{/if}
  <p class="capture-notice" role="status">{notice}</p>
</form>

<style>
  .capture {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    min-width: 0;
    max-width: 880px;
  }
  .capture-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--lmu-muted, #a6b9a6);
  }
  .capture-box {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 52px;
    padding: 4px 6px 4px 14px;
    border: 1px solid var(--lmu-control-line, #70868b);
    border-radius: 8px;
    background: var(--lmu-bg, #071114);
  }
  .capture-box:focus-within {
    border-color: var(--lmu-focus, #b8e5dc);
    box-shadow: 0 0 0 1px var(--lmu-focus, #b8e5dc);
  }
  .capture-box input {
    flex: 1 1 0;
    width: 0;
    min-width: 0;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: var(--lmu-text, #eee9db);
    font: inherit;
    font-size: 1rem;
  }
  .capture-box input:focus {
    outline: none;
  }
  .capture-preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    margin: 0;
    min-height: 1.5em;
    font-size: 0.82rem;
    color: var(--lmu-muted, #a6b9a6);
  }
  .capture-preview strong {
    font-size: 0.88rem;
    color: var(--lmu-text, #eee9db);
  }
  .capture-tokens {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }
  mark {
    padding: 0 4px;
    border-radius: 4px;
    background: #7bc4b126;
    color: var(--lmu-text, #eee9db);
  }
  .capture-literal {
    min-height: 32px;
    padding: 2px 8px;
    border: 0;
    background: none;
    color: #d6e2db;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
  .capture-literal:focus-visible {
    outline: 2px solid var(--lmu-focus, #b8e5dc);
    outline-offset: 2px;
  }
  .capture-error {
    margin: 0;
    font-size: 0.85rem;
    color: var(--lmu-danger, #ffb4a9);
  }
  .capture-notice {
    margin: 0;
    font-size: 0.85rem;
    color: var(--lmu-positive, #7bc4b1);
  }
  .capture-notice:empty {
    display: none;
  }
</style>
