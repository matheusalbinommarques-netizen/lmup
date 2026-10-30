<script lang="ts">
  import type { Profile, OwnedShopItem } from '$services/db';
  import { equippedItemsForOwned } from '$services/gearService';
  import { getTitleForLevel, MAX_LEVEL } from '$services/progression';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon from '$lib/ui/Icon.svelte';

  let {
    profile,
    owned = [],
    achievements = [],
  }: {
    profile: Profile;
    owned?: OwnedShopItem[];
    achievements?: string[];
  } = $props();
  const equipped = $derived(equippedItemsForOwned(owned));
</script>

<section class="hero-identity" aria-label="Seu personagem">
  <a
    href="/perfil"
    class="hero-portrait"
    aria-label="Ver perfil e equipamentos"
  >
    {#if profile.avatarUrl}
      <Artwork
        src={profile.avatarUrl}
        alt={`Avatar de ${profile.name}`}
        sizes="112px"
        eager
      />
    {:else}
      <svg
        viewBox="0 0 100 120"
        role="img"
        aria-label="Emblema provisório do viajante"
      >
        <path
          d="M50 8 85 28v46c0 20-20 32-35 39C35 106 15 94 15 74V28Z"
          fill="#182b30"
          stroke="#c7a768"
        />
        <path
          d="M50 24c-12 0-22 16-24 36l13-7h22l13 7c-2-20-12-36-24-36Z"
          fill="#71847d"
        />
        <path d="m37 50 13-15 13 15-5 25H42Z" fill="#0d1b22" />
        <path d="M24 89 34 65l16 14 16-14 10 24-26 14Z" fill="#435d5b" />
        <path d="m50 79 0 24M39 53h22" stroke="#c7a768" />
      </svg>
    {/if}
  </a>
  <div class="hero-details">
    <p class="lmu-eyebrow">Seu personagem · Nível {profile.level}</p>
    <h2>{profile.name}</h2>
    <p class="hero-title">{profile.title || getTitleForLevel(profile.level)}</p>
    {#if profile.level >= MAX_LEVEL}
      <p class="lmu-hint">
        Nível máximo · {profile.totalXpEarned} XP acumulados
      </p>
    {:else}
      <label for="home-level-xp" class="hero-xp-label"
        >{profile.xpCurrent} / {profile.xpNext} XP
        <span>Próximo nível</span></label
      >
      <progress
        id="home-level-xp"
        aria-label="Experiência do personagem"
        value={profile.xpCurrent}
        max={Math.max(1, profile.xpNext)}
      ></progress>
    {/if}
    <div class="hero-resources">
      <span><Icon name="spark" size={15} /> {profile.gold} Gold</span>
      <a
        href="/trofeus"
        title={achievements.join(' · ') || 'Conheça as conquistas disponíveis'}
        >{achievements.length}
        {achievements.length === 1 ? 'conquista' : 'conquistas'}
        <Icon name="arrow" size={14} /></a
      >
    </div>
    {#if equipped.length}
      <ul class="hero-equipment" aria-label="Equipamentos em uso">
        {#each equipped as { item } (item.id)}
          <li>
            <a
              href="/inventario"
              aria-label={`Equipado: ${item.name}`}
              title={item.name}
            >
              {#if item.iconSrc}<Artwork
                  src={item.iconSrc}
                  alt=""
                  sizes="32px"
                />{:else}<Icon name="spark" size={20} />{/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .hero-identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.4rem;
    min-width: 0;
  }
  .hero-portrait {
    flex: 0 0 7rem;
    width: 7rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    background: #102027d9;
    border: 1px solid #c7a7688a;
    border-radius: 50% 50% 42% 42%;
    box-shadow: 0 8px 40px #0007;
  }
  .hero-portrait :global(img),
  .hero-portrait :global(.lmu-art-fallback) {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: inherit;
  }
  .hero-portrait svg {
    width: 72%;
    height: 90%;
  }
  .hero-details {
    min-width: 0;
    flex: 1 1 10rem;
    max-width: 25rem;
  }
  .hero-details h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin: 0.25rem 0;
  }
  .hero-title {
    color: #e4d6b5;
    font-size: 0.875rem;
    margin-bottom: 0.9rem;
  }
  .hero-xp-label {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: #f1ede2;
  }
  .hero-xp-label span {
    color: #c7d3cb;
  }
  .hero-details progress {
    display: block;
    height: 0.35rem;
    margin: 0.5rem 0 0.7rem;
  }
  .hero-resources {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem 1.5rem;
    font-size: 0.8rem;
  }
  .hero-resources span,
  .hero-resources a {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .hero-resources a {
    min-height: 2rem;
    color: #ead0a1;
  }
  .hero-equipment {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
  }
  .hero-equipment a {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    background: #102027;
    border: 1px solid #74674c;
    border-radius: 0.3rem;
  }
  .hero-equipment :global(img) {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
  }
  @media (max-width: 600px) {
    .hero-identity {
      gap: 0.8rem;
    }
    .hero-portrait {
      flex-basis: 4.5rem;
      width: 4.5rem;
    }
    .hero-details h2 {
      font-size: 1.65rem;
    }
  }
  @media (max-width: 360px) {
    .hero-identity {
      align-items: flex-start;
    }
    .hero-portrait {
      flex-basis: 3.25rem;
      width: 3.25rem;
    }
  }
</style>
