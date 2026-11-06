<script lang="ts">
  import { onMount } from 'svelte';
  import { profileQuery, type ProfileSnapshot } from '$services/profileQuery';
  import { getTitleForLevel, MAX_LEVEL } from '$services/progression';
  import { companionBonusLabel } from '$services/companionService';
  import { slotLabels } from '$services/collectionRules';
  import { identity } from '$lib/content/experience';
  import EditProfileModal from '$lib/EditProfileModal.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import ProfileAchievements from './ProfileAchievements.svelte';
  import HeroPortrait from './HeroPortrait.svelte';
  import HeroSlots from './HeroSlots.svelte';
  import HeroGearDetail from './HeroGearDetail.svelte';
  let data = $state<ProfileSnapshot>(),
    error = $state(''),
    editing = $state(false);
  onMount(() => {
    const sub = profileQuery().subscribe({
      next: (value) => {
        data = value;
        error = '';
      },
      error: (cause) => {
        error =
          cause instanceof Error
            ? cause.message
            : 'Não foi possível abrir seu perfil. Seus dados continuam guardados.';
      },
    });
    return () => sub.unsubscribe();
  });
  const slots = $derived(
    Object.entries(slotLabels).map(([key, label]) => ({
      key,
      label,
      item: data?.equipped.find((row) => row.item.slot === key)?.item,
    })),
  );
  let chosen = $state('');
  const selected = $derived(
    slots.find((slot) => slot.key === chosen) ??
      slots.find((slot) => slot.item) ??
      null,
  );
  const maximum = $derived((data?.profile.level ?? 0) >= MAX_LEVEL);
  const effects = $derived(
    data
      ? [
          `Ambiente: +${Math.round((data.sanctuary.xpBonusMultiplier - 1) * 100)}% XP.`,
          `Companhia: ${data.active && data.companion ? companionBonusLabel(data.companion) : 'sem bônus ativo'}.`,
          `Equipamento em missões e revisões: +${data.mods.taskXpBonusPercent ?? 0}% XP.`,
          `Equipamento: +${Math.round((data.mods.goldMultiplier - 1) * 100)}% Gold.`,
          `Equipamento no ambiente: +${data.mods.sanctuaryBonusExtraPercent} ponto(s) percentual(is) de XP.`,
          `Equipamento no bônus de projeto: +${Math.round(data.mods.projectBonusExtraFraction * 100)} ponto(s) percentual(is).`,
          `Proteção de sequência: ${data.mods.streakProtectionDays} dia(s).`,
          `Espaços extras na coleção: ${data.mods.inventoryExtraSlots}.`,
        ]
      : [],
  );
</script>

<svelte:head><title>Herói · {identity.name}</title></svelte:head>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Sua ficha de personagem</p>
    <h1>Herói</h1>
    <p>
      Seu nível, seu equipamento e as conquistas que acompanham o que você faz.
    </p>
  </div>
  {#if data && !error}<Button
      onclick={() => {
        editing = true;
      }}><Icon name="settings" size={18} />Editar perfil</Button
    >{/if}
</header>
{#if error}<p role="alert" class="journey-error">
    {error}<a class="journey-link" href="/perfil" data-sveltekit-reload
      >Tentar novamente</a
    >
  </p>
{:else if !data}<p role="status">Abrindo seu perfil…</p>
{:else}
  <div class="sheet rpg-frame">
    <section class="stage" aria-label="Seu personagem e equipamentos">
      <HeroSlots
        {slots}
        selectedKey={selected?.key ?? ''}
        onselect={(key) => (chosen = key)}
      >
        <div class="who">
          <HeroPortrait
            name={data.profile.name}
            avatarUrl={data.profile.avatarUrl ?? ''}
          />
          <h2><span>{data.profile.name}</span></h2>
          <p class="title">
            Nível {data.profile.level} · {getTitleForLevel(data.profile.level)}
          </p>
        </div>
      </HeroSlots>
    </section>
    <section class="progress" aria-label="Seu progresso">
      <div class="level-row">
        <div class="seal" aria-hidden="true">
          <svg viewBox="0 0 96 112" focusable="false">
            <path
              class="seal-body"
              d="M48 3 90 17v41c0 26-20 42-42 51C26 100 6 84 6 58V17Z"
            />
            <path
              class="seal-inner"
              d="M48 11 82 22v36c0 21-16 34-34 42-18-8-34-21-34-42V22Z"
            />
          </svg>
          <span class="seal-label">Nível</span>
          <span class="seal-num">{data.profile.level}</span>
        </div>
        {#if maximum}<p class="journey-banner">
            Nível máximo disponível. Seu XP acumulado continua registrado.
          </p>{:else}<div class="xp">
            <label for="profile-level-progress" class="xp-label"
              ><strong>{data.profile.xpCurrent}</strong> / {data.profile.xpNext} XP
              neste nível</label
            ><progress
              id="profile-level-progress"
              value={data.profile.xpCurrent}
              max={Math.max(1, data.profile.xpNext)}
            ></progress>
            <p class="lmu-hint">
              Faltam {Math.max(0, data.profile.xpNext - data.profile.xpCurrent)}
              XP para o nível {data.profile.level + 1}.
            </p>
          </div>{/if}
      </div>
      <dl class="resources">
        <div>
          <ApprovedIcon name="xp" size={40} />
          <dd>{data.profile.totalXpEarned}</dd>
          <dt>XP acumulado</dt>
        </div>
        <div>
          <ApprovedIcon name="ouro" size={40} />
          <dd>{data.profile.gold}</dd>
          <dt>Gold disponível</dt>
        </div>
        <div>
          <ApprovedIcon name="alimentacao" size={40} />
          <dd>{data.profile.food ?? 0}</dd>
          <dt>Comida disponível</dt>
        </div>
      </dl>
      <div class="gear-detail">
        <HeroGearDetail
          {selected}
          {effects}
          unknownEquipment={data.unknownEquipment}
        />
      </div>
      <a class="lmu-button lmu-button--secondary" href="/progresso"
        >Ver meu progresso e histórico <Icon name="arrow" size={18} /></a
      >
    </section>
    <div class="trophies"><ProfileAchievements /></div>
  </div>
{/if}

{#if editing && data}<EditProfileModal
    profile={data.profile}
    close={() => {
      editing = false;
    }}
  />{/if}

<style>
  .sheet {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    overflow: hidden;
    border-color: #b08d52c0;
    box-shadow:
      var(--rpg-depth),
      inset 0 0 0 1px #02090c,
      inset 0 0 0 2px #b08d5233,
      inset 0 1px 24px #00000080;
  }
  /* Cantos discretos nos quatro cantos do quadro principal, em dourado envelhecido. */
  .sheet::before {
    content: '';
    position: absolute;
    inset: 0.45rem;
    pointer-events: none;
    z-index: 2;
    --c: #d1ad6a;
    --s: 1.25rem;
    background:
      linear-gradient(var(--c), var(--c)) 0 0 / var(--s) 2px,
      linear-gradient(var(--c), var(--c)) 0 0 / 2px var(--s),
      linear-gradient(var(--c), var(--c)) 100% 0 / var(--s) 2px,
      linear-gradient(var(--c), var(--c)) 100% 0 / 2px var(--s),
      linear-gradient(var(--c), var(--c)) 0 100% / var(--s) 2px,
      linear-gradient(var(--c), var(--c)) 0 100% / 2px var(--s),
      linear-gradient(var(--c), var(--c)) 100% 100% / var(--s) 2px,
      linear-gradient(var(--c), var(--c)) 100% 100% / 2px var(--s);
    background-repeat: no-repeat;
  }
  .stage {
    display: grid;
    align-content: center;
    position: relative;
    padding: clamp(1rem, 2.2vw, 2rem);
    isolation: isolate;
  }
  .stage::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: url('/art/bg/bg-hero.webp') center 62% / cover no-repeat;
    opacity: 0.5;
    filter: contrast(1.05) brightness(0.88) saturate(0.78);
    mask-image: radial-gradient(ellipse at 50% 50%, #000 42%, transparent 88%);
  }
  .stage::after {
    /* Escurece só a base do palco, onde ficam nome e título. */
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 38%;
    z-index: -1;
    background: linear-gradient(to top, #02090ccc, transparent);
  }
  .who {
    display: grid;
    justify-items: center;
    text-align: center;
    gap: 0.15rem;
  }
  .who h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    margin: 0.5rem 0 0.2rem;
    font: 500 clamp(2.1rem, 3.5vw, 3.2rem) / 1.08 var(--lmu-display);
    text-shadow: 0 2px 6px #000;
  }
  .who h2 span {
    overflow-wrap: anywhere;
  }
  .who h2::before,
  .who h2::after {
    content: '';
    flex: 0 1 3rem;
    min-width: 0.75rem;
    height: 1px;
    background: linear-gradient(to right, transparent, #b08d52);
  }
  .who h2::after {
    transform: scaleX(-1);
  }
  .who .title {
    margin: 0.2rem 0 0;
    padding: 0.15rem 0.9rem;
    border: 1px solid #b08d5266;
    border-radius: 999px;
    background: #02090ccc;
    color: #e8dcc0;
    font-size: 0.95rem;
  }
  .gear-detail {
    display: grid;
    gap: 0.9rem;
    padding-top: 1.1rem;
    border-top: 1px solid var(--lmu-line);
  }
  .progress {
    display: grid;
    align-content: start;
    gap: 1.4rem;
    padding: clamp(1.25rem, 2.6vw, 2.25rem);
    border-left: 1px solid var(--lmu-line);
  }
  .level-row {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .level-row > :global(.xp),
  .level-row > :global(.journey-banner) {
    flex: 1;
    min-width: 0;
  }
  .seal {
    position: relative;
    flex: none;
    width: clamp(5rem, 7.6vw, 6.5rem);
    aspect-ratio: 96 / 112;
    display: grid;
    place-items: center;
  }
  .seal svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 3px 5px #000a);
  }
  .seal-body {
    fill: #0b1d1d;
    stroke: #c9a45f;
    stroke-width: 3;
    stroke-linejoin: round;
  }
  .seal-inner {
    fill: none;
    stroke: #b08d5266;
    stroke-width: 1.5;
  }
  .seal-label {
    position: absolute;
    top: 14%;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 0.8rem;
    color: var(--lmu-muted);
  }
  .seal-num {
    position: relative;
    margin-top: 0.6rem;
    font: 600 clamp(2.25rem, 3.8vw, 3.1rem) / 1 var(--lmu-font, system-ui);
    font-variant-numeric: lining-nums;
    color: var(--rpg-gold-bright, #ffe0a0);
  }
  .xp {
    display: grid;
    gap: 0.5rem;
  }
  .xp-label {
    font-size: 1.3rem;
  }
  .xp .lmu-hint,
  .xp p {
    font-size: 1.05rem;
  }
  .xp-label strong {
    font: 600 2rem var(--lmu-font, system-ui);
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--rpg-gold-bright, #ffe0a0);
  }
  progress {
    appearance: none;
    width: 100%;
    height: 1.05rem;
    border: 1px solid var(--rpg-line, #a27c43a6);
    border-radius: 999px;
    background: #02090c;
    overflow: hidden;
  }
  progress::-webkit-progress-bar {
    background: #02090c;
  }
  progress::-webkit-progress-value {
    background: var(--rpg-xp, #f7c66b);
    border-radius: 999px;
  }
  progress::-moz-progress-bar {
    background: var(--rpg-xp, #f7c66b);
    border-radius: 999px;
  }
  .progress > a.lmu-button {
    min-height: 3.4rem;
    font-size: 1.1rem;
  }
  .resources {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin: 0;
  }
  .resources > div {
    display: grid;
    align-content: start;
    justify-items: center;
    gap: 0.2rem;
    padding: 0.9rem 0.25rem;
    border: 1px solid var(--lmu-line);
    border-radius: 0.6rem;
    background: #061115a6;
    text-align: center;
  }
  .resources dd {
    margin: 0;
    font: 600 2rem/1 var(--lmu-font, system-ui);
    font-variant-numeric: lining-nums tabular-nums;
  }
  .resources dt {
    text-wrap: balance;
    line-height: 1.25;
    font-size: 0.92rem;
    color: var(--lmu-muted);
    order: 3;
  }
  .trophies {
    grid-column: 1 / -1;
    padding: clamp(1rem, 2.2vw, 2rem);
    border-top: 1px solid var(--lmu-line);
  }
  :global(.profile-effects) {
    padding-left: 1.25rem;
    margin-top: 0.75rem;
  }
  :global(.profile-effects li + li) {
    margin-top: 0.4rem;
  }
  @media (max-width: 420px) {
    .resources {
      grid-template-columns: 1fr;
    }
    .resources > div {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.9rem;
      text-align: left;
    }
    .resources dt {
      order: 2;
      flex: 1;
      font-size: 1rem;
    }
    .resources dd {
      order: 3;
    }
  }
  @media (max-width: 640px) {
    .who h2::before,
    .who h2::after {
      display: none;
    }
  }
  @media (max-width: 900px) {
    .sheet {
      grid-template-columns: 1fr;
    }
    .progress {
      border-left: 0;
      border-top: 1px solid var(--lmu-line);
    }
  }
</style>
