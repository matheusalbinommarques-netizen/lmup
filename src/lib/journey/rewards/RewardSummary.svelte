<script lang="ts">
  import '$lib/rpg-theme.css';
  import type { ActivityEvent } from '$services/db';
  import { comfort } from '$services/comfortService';
  import { getLevelStateFromTotalXp } from '$services/progression';
  import {
    getEcoStageForTotalXp,
    getEcoProgressForTotalXp,
  } from '$services/ecoConfig';
  import Icon from '$lib/ui/Icon.svelte';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import RewardProgress from './RewardProgress.svelte';
  import LevelMilestone from './LevelMilestone.svelte';
  import RefugeMilestone from './RefugeMilestone.svelte';

  let {
    title,
    event,
    projectEvent,
    projectName,
    fresh = false,
    continueLabel = 'Continuar',
    onContinue,
  }: {
    title: string;
    event?: ActivityEvent;
    projectEvent?: ActivityEvent;
    projectName?: string;
    fresh?: boolean;
    continueLabel?: string;
    onContinue?: () => void;
  } = $props();
  let skipped = $state(false);
  const animate = $derived(
    fresh && !skipped && !$comfort.reducedMotion && !$comfort.lowStimulus,
  );
  const active = $derived(event && !event.reversedAt);
  const bonus = $derived(
    projectEvent && !projectEvent.reversedAt ? projectEvent : undefined,
  );
  const before = $derived(active ? event?.progress?.before : undefined);
  const after = $derived(
    active ? (bonus?.progress?.after ?? event?.progress?.after) : undefined,
  );
  const levels = $derived(
    before !== undefined && after !== undefined
      ? {
          before: getLevelStateFromTotalXp(before),
          after: getLevelStateFromTotalXp(after),
        }
      : undefined,
  );
  const stages = $derived(
    before !== undefined && after !== undefined
      ? {
          before: getEcoStageForTotalXp(before),
          after: getEcoStageForTotalXp(after),
        }
      : undefined,
  );
  const leveled = $derived(
    !!levels && levels.after.level > levels.before.level,
  );
  const evolved = $derived(!!stages && stages.after.id > stages.before.id);
  const levelText = (state: ReturnType<typeof getLevelStateFromTotalXp>) =>
    state.xpForNext
      ? `Nível ${state.level} · ${state.xpIntoLevel} / ${state.xpForNext} XP`
      : `Nível ${state.level} · Nível máximo`;
  const levelPercent = (state: ReturnType<typeof getLevelStateFromTotalXp>) =>
    state.xpForNext ? (state.xpIntoLevel / state.xpForNext) * 100 : 100;
  const stageText = (total: number) => {
    const stage = getEcoStageForTotalXp(total);
    return stage.maxXp === null
      ? `${total} XP · Último estágio`
      : `${total - stage.minXp} / ${stage.maxXp - stage.minXp} XP neste estágio`;
  };
</script>

<section
  class="rpg-theme reward-summary"
  class:celebrate={animate}
  class:milestone={leveled || evolved}
  aria-label="Resumo da recompensa"
>
  <div class="rpg-frame reward-panel">
    <RpgTrim />
    <header>
      <div class="conquest-seal">
        <Icon name={leveled ? 'today' : 'spark'} size={44} />
      </div>
      <p class="lmu-eyebrow">
        {event?.reversedAt
          ? 'Recompensa estornada'
          : fresh
            ? 'Um passo registrado na sua jornada'
            : 'Conclusão registrada'}
      </p>
      <h1>Missão concluída!</h1>
      <h2 class="task-title">{title}</h2>
    </header>
    {#if event}
      <div
        class="resource-row"
        aria-label={event.reversedAt
          ? 'Recompensa estornada'
          : 'Recompensa recebida'}
      >
        {#each [{ icon: 'spark', value: event.reward.xp, label: 'XP' }, { icon: 'coin', value: event.reward.gold, label: 'Ouro' }, ...(event.reward.food ? [{ icon: 'food', value: event.reward.food, label: 'Comida' }] : [])] as resource (resource.label)}
          <div class="resource">
            <Icon
              name={resource.icon as 'spark' | 'coin' | 'food'}
              size={34}
            /><strong>{event.reversedAt ? '−' : '+'}{resource.value}</strong
            ><span>{resource.label}</span>
          </div>
        {/each}
      </div>
      {#if event.reversedAt}<p>
          Esta recompensa foi devolvida. Os saldos já foram atualizados.
        </p>{/if}
      {#if bonus}<div class="project-bonus">
          <h2>Projeto concluído</h2>
          <strong>{projectName ?? 'Seu projeto'}</strong>
          <p>
            +{bonus.reward.xp} XP · +{bonus.reward.gold} Ouro{bonus.reward.food
              ? ` · +${bonus.reward.food} Comida`
              : ''} de bônus
          </p>
        </div>{/if}
      {#if levels && stages && before !== undefined && after !== undefined}
        {#if leveled}<LevelMilestone
            before={levels.before.level}
            after={levels.after.level}
          />{/if}
        <div class="progress-stack">
          <RewardProgress
            label="Progresso do personagem"
            before={levelText(levels.before)}
            after={levelText(levels.after)}
            from={levelPercent(levels.before)}
            to={levelPercent(levels.after)}
            crossed={leveled}
            {animate}
          />
          <RewardProgress
            label={`Refúgio · ${stages.after.label}`}
            before={`${stageText(before)} · ${stages.before.label}`}
            after={stageText(after)}
            from={getEcoProgressForTotalXp(before)}
            to={getEcoProgressForTotalXp(after)}
            crossed={evolved}
            {animate}
          />
        </div>
        {#if evolved}<RefugeMilestone
            before={stages.before}
            after={stages.after}
          />{/if}
      {:else if active}<p class="receipt-note">
          Recursos registrados no histórico. Esta conclusão antiga não guardou
          as barras de antes e depois.
        </p>{/if}
    {:else}<p>
        Esta conclusão é anterior ao histórico detalhado. Seu progresso foi
        preservado.
      </p>{/if}
    <p class="closing">Pequenas ações constroem grandes jornadas.</p>
    <div class="reward-actions">
      {#if onContinue}<button
          type="button"
          class="lmu-button lmu-button--primary"
          onclick={onContinue}
          >{continueLabel}<Icon name="arrow" size={18} /></button
        >{:else}<a class="lmu-button lmu-button--primary" href="/"
          >{continueLabel}<Icon name="arrow" size={18} /></a
        >{/if}{#if evolved}<a class="lmu-button lmu-button--secondary" href="/refugio"
          >Ver Refúgio</a
        >{/if}
    </div>
    {#if fresh && !skipped}<button
        class="skip-effects"
        onclick={() => (skipped = true)}>Pular efeitos</button
      >{/if}
  </div>
</section>

<style>
  .reward-summary {
    max-width: 760px;
    margin: 1rem auto;
    color: #e6ebe3;
  }
  .reward-panel {
    padding: clamp(1.2rem, 4vw, 2.4rem);
    text-align: center;
    overflow: hidden;
    background:
      radial-gradient(ellipse at 50% 0%, #76531c4a, transparent 60%),
      linear-gradient(145deg, #102328, #061115 70%);
  }
  header {
    position: relative;
  }
  .conquest-seal {
    display: grid;
    place-items: center;
    width: 86px;
    height: 86px;
    margin: 0 auto 1rem;
    border: 1px solid #d0a24f;
    outline: 1px solid #9b763e70;
    outline-offset: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #c7963538, #09181d);
    color: #ffdc8e;
    box-shadow:
      0 0 40px #d7a34726,
      inset 0 0 20px #dcad4826;
  }
  h1 {
    margin: 0.3rem 0;
    color: #ffe1a0;
    font: 600 clamp(2rem, 6vw, 3rem) var(--lmu-display);
  }
  .task-title {
    font: 500 1.4rem var(--lmu-display);
    margin: 0.5rem 0 1.2rem;
    overflow-wrap: anywhere;
    color: #f1ead8;
  }
  .resource-row {
    display: flex;
    justify-content: center;
    gap: clamp(0.7rem, 4vw, 2rem);
    padding: 1rem;
    margin: 0 0 1rem;
    border-block: 1px solid #a27c435e;
    background: linear-gradient(90deg, transparent, #b67d1814, transparent);
  }
  .resource {
    display: grid;
    justify-items: center;
    gap: 0.25rem;
    min-width: 58px;
    color: #f3c975;
  }
  .resource strong {
    font: 600 1.8rem var(--lmu-display);
  }
  .resource span {
    font-size: 0.8rem;
    color: #ddd5c2;
  }
  .progress-stack {
    display: grid;
    gap: 1rem;
    margin: 1.2rem 0;
    padding: 1rem;
    border: 1px solid #a27c433d;
    border-radius: 0.4rem;
    background: #020d1170;
  }
  .project-bonus {
    padding: 0.7rem;
    border: 1px solid #9e7d3f66;
    font-size: 0.9rem;
  }
  .project-bonus p {
    margin: 0.4rem 0 0;
  }
  .receipt-note,
  .closing {
    font-size: 0.85rem;
    color: #b8c2b8;
  }
  .closing {
    margin: 1.2rem 0;
    font-style: italic;
  }
  .reward-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7rem;
  }
  .reward-actions a,
  .reward-actions button {
    flex: 1 1 160px;
  }
  .skip-effects {
    margin-top: 0.6rem;
    padding: 0.5rem;
    border: 0;
    background: none;
    color: #c7cabc;
    text-decoration: underline;
    cursor: pointer;
  }
  .reward-summary:not(.milestone) .reward-panel {
    padding: 1.2rem;
  }
  .reward-summary:not(.milestone) .conquest-seal {
    width: 64px;
    height: 64px;
    margin-bottom: 0.6rem;
  }
  .reward-summary:not(.milestone) header .lmu-eyebrow {
    margin: 0.7rem 0;
  }
  .reward-summary:not(.milestone) h1 {
    font-size: 2.5rem;
  }
  .reward-summary:not(.milestone) .resource-row {
    padding: 0.7rem;
  }
  .reward-summary:not(.milestone) .progress-stack {
    margin: 0.8rem 0;
    padding: 0.8rem;
    gap: 0.8rem;
  }
  .reward-summary:not(.milestone) .closing {
    margin: 0.7rem 0;
  }
  @media (max-width: 600px) {
    .reward-panel {
      padding: 1rem;
    }
    .conquest-seal,
    .reward-summary:not(.milestone) .conquest-seal {
      width: 54px;
      height: 54px;
      margin-bottom: 0.6rem;
    }
    .conquest-seal :global(svg) {
      width: 30px;
      height: 30px;
    }
    header .lmu-eyebrow {
      font-size: 0.65rem;
      letter-spacing: 0.07em;
      margin: 0.6rem 0;
    }
    h1,
    .reward-summary:not(.milestone) h1 {
      font-size: 1.95rem;
      line-height: 1.1;
    }
    .task-title {
      font-size: 1.25rem;
      margin: 0.4rem 0 0.7rem;
    }
    .resource-row {
      padding: 0.6rem;
      margin-bottom: 0.7rem;
    }
    .resource :global(svg) {
      width: 28px;
      height: 28px;
    }
    .resource strong {
      font-size: 1.6rem;
    }
    .progress-stack {
      padding: 0.7rem;
      margin: 0.8rem 0;
      gap: 0.7rem;
    }
    .closing {
      margin: 0.7rem 0;
      font-size: 0.75rem;
    }
    .skip-effects {
      margin-top: 0.2rem;
      padding: 0.3rem;
    }
  }
  .celebrate .conquest-seal {
    animation: seal 700ms ease-out;
  }
  .celebrate .resource-row {
    animation: arrive 450ms 100ms both ease-out;
  }
  .celebrate.milestone .conquest-seal {
    animation: triumph 1100ms ease-out;
  }
  @keyframes seal {
    from {
      transform: scale(0.85);
      opacity: 0.3;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes arrive {
    from {
      opacity: 0.3;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes triumph {
    0% {
      transform: scale(0.8) rotate(-30deg);
      box-shadow: 0 0 0 #ffca5c00;
    }
    50% {
      box-shadow: 0 0 65px #ffca5c66;
    }
    100% {
      transform: scale(1) rotate(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .celebrate .conquest-seal,
    .celebrate.milestone .conquest-seal,
    .celebrate .resource-row {
      animation: none;
    }
  }
</style>
