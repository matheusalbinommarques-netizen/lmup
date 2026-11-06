<script lang="ts">
  import { onMount } from 'svelte';
  import { profileQuery, type ProfileSnapshot } from '$services/profileQuery';
  import { getTitleForLevel, MAX_LEVEL } from '$services/progression';
  import { companionBonusLabel } from '$services/companionService';
  import { slotLabels } from '$services/collectionRules';
  import { identity } from '$lib/content/experience';
  import EditProfileModal from '$lib/EditProfileModal.svelte';
  import Card from '$lib/ui/Card.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  import ProfileAchievements from './ProfileAchievements.svelte';
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
  const maximum = $derived((data?.profile.level ?? 0) >= MAX_LEVEL);
</script>

<svelte:head><title>Perfil e equipamentos · {identity.name}</title></svelte:head
>
<header class="journey-heading">
  <div>
    <p class="lmu-eyebrow">Sua identidade na jornada</p>
    <h1>Perfil e equipamentos</h1>
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
  <div class="profile-grid">
    <section aria-label="Sua identidade">
      <Card class="journey-stack">
        <div class="journey-section-heading">
          <p class="lmu-eyebrow">Sua identidade</p>
          <a class="lmu-button lmu-button--secondary" href="/progresso"
            >Ver meu progresso e histórico <Icon name="arrow" size={18} /></a
          >
        </div>
        <div class="profile-identity-header">
          <div class="profile-avatar">
            {#if data.profile.avatarUrl}<Artwork
                src={data.profile.avatarUrl}
                alt={'Avatar de ' + data.profile.name}
                sizes="96px"
                eager
              />{:else}<Icon name="spark" size={40} />{/if}
          </div>
          <div>
            <h2>{data.profile.name}</h2>
            <p class="lmu-muted">
              Nível {data.profile.level} · {getTitleForLevel(
                data.profile.level,
              )}
            </p>
          </div>
        </div>
        {#if maximum}<p class="journey-banner">
            Nível máximo disponível. Seu XP acumulado continua registrado.
          </p>{:else}<div>
            <label for="profile-level-progress" class="journey-label"
              >{data.profile.xpCurrent} de {data.profile.xpNext} XP neste nível</label
            ><progress
              id="profile-level-progress"
              value={data.profile.xpCurrent}
              max={Math.max(1, data.profile.xpNext)}
            ></progress>
            <p class="lmu-hint">
              Faltam {Math.max(0, data.profile.xpNext - data.profile.xpCurrent)}
              XP para o próximo nível.
            </p>
          </div>{/if}
        <dl class="profile-resources">
          <div>
            <dt><ApprovedIcon name="xp" size={32} />XP acumulado</dt>
            <dd>{data.profile.totalXpEarned}</dd>
          </div>
          <div>
            <dt><ApprovedIcon name="ouro" size={32} />Gold disponível</dt>
            <dd>{data.profile.gold}</dd>
          </div>
          <div>
            <dt>
              <ApprovedIcon name="alimentacao" size={32} />Comida disponível
            </dt>
            <dd>{data.profile.food ?? 0}</dd>
          </div>
        </dl>
        <ProfileAchievements />
      </Card>
    </section>
    <section aria-labelledby="profile-equipment">
      <Card class="journey-stack">
        <p class="lmu-eyebrow">Em uso agora</p>
        <h2 id="profile-equipment">Equipamentos em uso</h2>
        <ul class="profile-slot-list">
          {#each slots as slot (slot.key)}<li>
              <div class="profile-slot-copy">
                <p class="lmu-eyebrow">{slot.label}</p>
                {#if slot.item}<h3>{slot.item.name}</h3>
                  <p class="lmu-hint">{slot.item.description}</p>{:else}<p
                    class="lmu-muted"
                  >
                    Sem equipamento
                  </p>{/if}
              </div>
              {#if slot.item?.iconSrc}<Artwork
                  src={slot.item.iconSrc}
                  alt=""
                  sizes="64px"
                  class="profile-gear-art"
                />{/if}
            </li>{/each}
        </ul>
        {#if data.unknownEquipment}<p class="journey-banner">
            Há {data.unknownEquipment} item(ns) equipado(s) de versão anterior sem
            efeito reconhecido. Eles continuam nos seus dados.
          </p>{/if}
        <details>
          <summary>Entender os efeitos ativos</summary>
          <ul class="profile-effects">
            <li>
              Ambiente: +{Math.round(
                (data.sanctuary.xpBonusMultiplier - 1) * 100,
              )}% XP.
            </li>
            <li>
              Companhia: {data.active && data.companion
                ? companionBonusLabel(data.companion)
                : 'sem bônus ativo'}.
            </li>
            <li>
              Equipamento em missões e revisões: +{data.mods
                .taskXpBonusPercent ?? 0}% XP.
            </li>
            <li>
              Equipamento: +{Math.round((data.mods.goldMultiplier - 1) * 100)}%
              Gold.
            </li>
            <li>
              Equipamento no ambiente: +{data.mods.sanctuaryBonusExtraPercent} ponto(s)
              percentual(is) de XP.
            </li>
            <li>
              Equipamento no bônus de projeto: +{Math.round(
                data.mods.projectBonusExtraFraction * 100,
              )} ponto(s) percentual(is).
            </li>
            <li>
              Proteção de sequência: {data.mods.streakProtectionDays} dia(s).
            </li>
            <li>Espaços extras na coleção: {data.mods.inventoryExtraSlots}.</li>
          </ul>
          <p class="lmu-hint">
            Os efeitos são combinados pelas regras de cada recompensa; a soma
            dos percentuais não é o resultado final.
          </p>
        </details>
        <a class="lmu-button lmu-button--secondary" href="/inventario"
          >Gerenciar equipamento <Icon name="arrow" size={18} /></a
        >
      </Card>
    </section>
  </div>
{/if}

{#if editing && data}<EditProfileModal
    profile={data.profile}
    close={() => {
      editing = false;
    }}
  />{/if}
