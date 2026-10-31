<script lang="ts">
  import type { EcoStageConfig } from '$services/ecoConfig';
  import Artwork from '$lib/ui/Artwork.svelte';
  let { before, after }: { before: EcoStageConfig; after: EcoStageConfig } =
    $props();
</script>

<section class="refuge-milestone" aria-label="Evolução do Refúgio">
  <h2>Refúgio evoluiu!</h2>
  <div class="comparison">
    {#each [{ caption: 'Antes', stage: before }, { caption: 'Depois', stage: after }] as scene (scene.caption)}
      <figure>
        <Artwork
          src={scene.stage.image}
          alt={`${scene.caption}: Refúgio no estágio ${scene.stage.id}, ${scene.stage.label}`}
          eager
          sizes="(max-width: 600px) 42vw, 300px"
        />
        <figcaption>
          {scene.caption} · {scene.stage.label}<small
            >Estágio {scene.stage.id}</small
          >
        </figcaption>
      </figure>
    {/each}
  </div>
</section>

<style>
  h2 {
    color: var(--rpg-gold);
    margin: 0 0 0.7rem;
    font: 600 1.8rem var(--lmu-display);
  }
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
  }
  figure {
    margin: 0;
    min-width: 0;
  }
  figure :global(img),
  figure :global(.lmu-art-fallback) {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    border: 1px solid #ad874b;
    border-radius: 0.35rem;
  }
  figcaption {
    color: #e9d8b7;
    margin-top: 0.35rem;
    font-size: 0.85rem;
  }
  small {
    display: block;
    color: #acb9b5;
    font-size: 0.75rem;
  }
</style>
