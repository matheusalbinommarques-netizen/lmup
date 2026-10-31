<script lang="ts">
  import type { Companion } from '$services/db';
  import { companionArtwork } from './companionArtwork';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon from '$lib/ui/Icon.svelte';
  let { companion }: { companion?: Companion } = $props();
  let failed = $state(false);
</script>

<div class="rpg-scene">
  {#if failed}
    <div
      class="rpg-scene-fallback"
      role="img"
      aria-label="Viajante diante de Védria, representação visual provisória"
    >
      <Icon name="world" size={60} />
    </div>
  {:else}
    <img
      class="rpg-panorama lmu-decorative"
      src="/art/home-rpg/vedria-traveler.webp"
      srcset="/art/home-rpg/vedria-traveler-small.webp 768w, /art/home-rpg/vedria-traveler.webp 1536w"
      sizes="(max-width: 900px) 100vw, 850px"
      alt="Viajante diante de Védria, representação visual provisória"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      onerror={() => {
        failed = true;
      }}
    />
  {/if}
  <p class="rpg-scene-caption">
    Védria <span>Viajante · visual provisório</span>
  </p>
  {#if companion}
    <a
      class="rpg-scene-companion"
      href="/bestiario"
      aria-label={`Seu companheiro: ${companion.name}`}
    >
      <Artwork
        src={companionArtwork(companion)}
        alt=""
        sizes="128px"
        class="lmu-decorative"
      />
      <span>{companion.name}</span>
    </a>
  {/if}
</div>
