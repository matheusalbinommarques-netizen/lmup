<script lang="ts">
  import { onMount } from 'svelte';
  import { journeyQuery, type JourneySnapshot } from '$services/journeyQuery';
  import { selectNext, isAvailable, taskSteps } from '$services/journeyService';
  import { dateKey } from '$services/rewardService';
  import { getEcoStageForTotalXp } from '$services/ecoConfig';
  import { sanctuaryContent, companionContent } from '$lib/content/world';
  import { getCompanionStageImage } from '$services/companionService';
  import Button from '$lib/ui/Button.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import QuickCreate from './QuickCreate.svelte';
  let data = $state<JourneySnapshot>();
  let error = $state('');
  let open = $state(false);
  let today = $state(dateKey());
  onMount(() => {
    const subscription = journeyQuery().subscribe({
      next: (value) => {
        data = value;
        error = '';
      },
      error: () => {
        error =
          'Não foi possível ler sua jornada. Seus dados foram preservados.';
      },
    });
    const refreshDay = () => {
      today = dateKey();
    };
    window.addEventListener('focus', refreshDay);
    const clock = setInterval(refreshDay, 30000);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', refreshDay);
      clearInterval(clock);
    };
  });
  const next = $derived(data ? selectNext(data.tasks, today) : null);
  const plan = $derived(
    data?.tasks.filter(
      (task) => !task.archived && task.plannedDate === today,
    ) ?? [],
  );
  const stage = $derived(
    getEcoStageForTotalXp(data?.profile?.totalXpEarned ?? 0).id,
  );
  const reward = $derived(next ? data?.rewards[next.task.id!] : null);
</script>

<svelte:head><title>Hoje · Level Me Up</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Seu tempo. Sua jornada.</p>
    <h1>Um passo de cada vez.</h1>
    <p>
      {data?.tasks.length
        ? 'Seu próximo passo está aqui.'
        : 'Escolha uma atividade pequena para começar.'}
    </p>
  </div>
  {#if data}<Button
      variant="secondary"
      aria-label="Nova missão"
      onclick={() => {
        open = true;
      }}
      ><Icon name="plus" size={18} /><span class="journey-create-label"
        >Nova missão</span
      ></Button
    >{/if}
</header>
{#if error}<div role="alert" class="journey-error">
    {error}<a class="journey-link" href="/" data-sveltekit-reload
      >Tentar novamente</a
    >
  </div>{:else if !data}<p role="status">Abrindo sua jornada…</p>{:else}
  <div class="journey-grid">
    <div class="journey-stack">
      {#if next}<Card variant="featured" class="journey-feature"
          ><p class="journey-status">{next.reason}</p>
          <h2>{next.task.title}</h2>
          <p class="lmu-muted journey-selection-reason">{next.explanation}</p>
          {#if taskSteps(next.task).length}<progress
              max={taskSteps(next.task).length}
              value={taskSteps(next.task).filter((step) =>
                next.task.completedSubtasks?.includes(step.index),
              ).length}
              aria-label="Passos da próxima missão"
            ></progress>
            <p class="lmu-muted">
              {taskSteps(next.task).find(
                (step) => !next.task.completedSubtasks?.includes(step.index),
              )?.label ?? 'Pronta para concluir'}
            </p>{/if}{#if reward}<p class="lmu-hint">
              Prévia: +{reward.xp} XP
            </p>{/if}<a
            class="lmu-button lmu-button--primary"
            href={`/missao/${next.task.id}`}
            >{next.reason === 'Em andamento'
              ? 'Continuar missão'
              : 'Começar missão'}<Icon name="arrow" size={18} /></a
          ></Card
        >
      {:else}<Card
          ><div class="journey-empty">
            <Icon name="today" size={36} />
            <h2>
              {data.tasks.length
                ? 'Você está em dia.'
                : 'Toda jornada começa pequena.'}
            </h2>
            <p class="lmu-muted">
              {data.tasks.length
                ? 'Você pode encerrar por aqui ou escolher algo novo, quando fizer sentido.'
                : 'Pode ser ler uma página, praticar uma ideia ou dar o primeiro passo em um projeto.'}
            </p>
            <Button
              onclick={() => {
                open = true;
              }}
              >{data.tasks.length
                ? 'Criar outra missão'
                : 'Criar minha primeira missão'}<Icon
                name="plus"
                size={18}
              /></Button
            >
          </div></Card
        >{/if}
      <section aria-labelledby="plan-title">
        <div class="journey-section-heading">
          <h2 id="plan-title">Seu plano de hoje</h2>
          <a class="journey-link" href="/missoes">Escolher missões</a>
        </div>
        <Card
          >{#if plan.length}<ul class="lmu-list">
              {#each plan as task (task.id)}<li class="journey-task">
                  <a href={`/missao/${task.id}`}>{task.title}</a><span
                    class="journey-task-meta"
                    >{isAvailable(task)
                      ? 'Escolhida por você para hoje'
                      : task.reviewEnabled
                        ? 'Revisão já realizada'
                        : 'Concluída'}</span
                  >
                </li>{/each}
            </ul>{:else}<p class="lmu-muted">
              Você ainda não escolheu missões para hoje. O plano é seu; nenhuma
              sugestão é adicionada automaticamente.
            </p>{/if}</Card
        >
      </section>
    </div>
    <aside class="journey-stack">
      <Card class="journey-world"
        ><div class="lmu-decorative">
          <Artwork
            src={sanctuaryContent[stage].pilot}
            alt={`Seu ambiente no estágio ${sanctuaryContent[stage].label}`}
            eager
          />
        </div>
        <div class="journey-world-copy">
          <p class="lmu-eyebrow">Sua jornada ganha forma</p>
          <h2>{sanctuaryContent[stage].label}</h2>
          <p class="lmu-muted">{sanctuaryContent[stage].description}</p>
          <a class="journey-link" href="/refugio"
            >Visitar refúgio<Icon name="arrow" size={18} /></a
          >
        </div></Card
      >{#if data.companion}<div class="journey-pet">
          <Artwork
            src={data.companion.key === 'wolf' &&
            (data.companion.evolutionStage ?? 1) === 1
              ? companionContent.wolf.pilot
              : (getCompanionStageImage(data.companion) ??
                data.companion.imagePath ??
                '')}
            alt={data.companion.name}
            class="lmu-decorative"
          />
          <div>
            <p class="lmu-eyebrow">Boa companhia</p>
            <p>{data.companion.name}</p>
            <p class="lmu-hint">Segue com você. No seu ritmo.</p>
          </div>
        </div>{/if}<Card
        ><p class="lmu-eyebrow">{data.profile?.name}</p>
        <h3>Nível {data.profile?.level}</h3>
        <p class="lmu-muted">
          {data.profile?.totalXpEarned ?? 0} XP na sua jornada
        </p>
        <a class="journey-link" href="/perfil">Ver perfil e progresso</a></Card
      >
    </aside>
  </div>
  <QuickCreate bind:open snapshot={data} />
{/if}
