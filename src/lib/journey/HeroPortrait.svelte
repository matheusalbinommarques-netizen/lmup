<script lang="ts">
  import ApprovedIcon from '$lib/ui/ApprovedIcon.svelte';
  let { name, avatarUrl = '' }: { name: string; avatarUrl?: string } = $props();
  let failed = $state(false);
  $effect(() => {
    if (avatarUrl) failed = false;
  });
</script>

<!-- Moldura rúnica existente (art/hero-avatar-default.png). O retrato enviado pelo usuário sempre vence;
     sem ele, o ícone encapuzado aprovado serve de retrato provisório, sem definir a aparência do herói. -->
<figure class="portrait">
  <div class="portrait-inner">
    {#if avatarUrl && !failed}<img
        src={avatarUrl}
        alt={'Retrato de ' + name}
        onerror={() => (failed = true)}
      />{:else}<span class="placeholder"
        ><ApprovedIcon name="heroi" size={96} /></span
      >{/if}
  </div>
  <img class="frame" src="/art/hero-avatar-default.webp" alt="" />
  {#if !avatarUrl || failed}<figcaption>Retrato provisório</figcaption>{/if}
</figure>

<style>
  .portrait {
    position: relative;
    margin: 0;
    width: min(100%, clamp(13rem, 29vw, 25rem));
    aspect-ratio: 1;
    display: grid;
    place-items: center;
  }
  .frame,
  .portrait-inner {
    grid-area: 1 / 1;
  }
  .frame {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    z-index: 1;
  }
  .portrait-inner {
    width: 57%;
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    background: radial-gradient(circle at 50% 42%, #24494a, #061115 78%);
    display: grid;
    place-items: center;
  }
  .portrait-inner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .placeholder {
    display: grid;
    place-items: center;
    width: 90%;
    height: 90%;
    opacity: 0.95;
  }
  .placeholder :global(.approved-icon) {
    width: 100% !important;
    height: 100% !important;
  }
  figcaption {
    position: absolute;
    bottom: 0.4rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--lmu-muted);
    background: #061115d9;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    white-space: nowrap;
  }
</style>
