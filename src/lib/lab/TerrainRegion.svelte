<script lang="ts">
  import type { TerrainRegionDefinition } from './campRegion';
  let { region }: { region: TerrainRegionDefinition } = $props();
  const width = $derived(
    ((region.columns + region.rows) * region.tileWidth) / 2,
  );
  const height = $derived(
    ((region.columns + region.rows) * region.tileHeight) / 2,
  );
</script>

<div
  class="terrain-region"
  data-region={region.id}
  aria-hidden="true"
  style:left={`${region.x}px`}
  style:top={`${region.y}px`}
  style:width={`${width}px`}
  style:height={`${height}px`}
>
  {#each region.tiles as tile (`${tile.material}-${tile.u}-${tile.v}`)}
    <span
      class="terrain-tile"
      data-material={tile.material}
      style:width={`${region.tileWidth + 0.5}px`}
      style:height={`${region.tileHeight + 0.5}px`}
      style:left={`${((region.rows - 1 + tile.u - tile.v) * region.tileWidth) / 2}px`}
      style:top={`${((tile.u + tile.v) * region.tileHeight) / 2}px`}
      style:background-image={`url('${region.sheets[tile.material]}')`}
      style:background-size={`${region.tileWidth * 8}px ${region.tileHeight * 7}px`}
      style:background-position={`${-(tile.frame % 8) * region.tileWidth}px ${-Math.floor(tile.frame / 8) * region.tileHeight}px`}
    ></span>
  {/each}
</div>
{#each region.decorations as item (item.id)}
  {@const scale = item.sprite.worldWidth / item.sprite.source.width}
  <img
    class="region-shadow"
    src={item.sprite.src}
    alt=""
    draggable="false"
    width={item.sprite.source.width}
    height={item.sprite.source.height}
    style:width={`${item.sprite.worldWidth}px`}
    style:height={`${item.sprite.source.height * scale}px`}
    style:left={`${item.x - item.sprite.pivot.x * scale}px`}
    style:top={`${item.y - item.sprite.pivot.y * scale}px`}
    style:transform-origin={`${item.sprite.pivot.x * scale}px ${item.sprite.pivot.y * scale}px`}
  />
  <img
    class="region-decoration"
    data-decoration={item.id}
    src={item.sprite.src}
    alt=""
    draggable="false"
    width={item.sprite.source.width}
    height={item.sprite.source.height}
    style:width={`${item.sprite.worldWidth}px`}
    style:height={`${item.sprite.source.height * scale}px`}
    style:left={`${item.x - item.sprite.pivot.x * scale}px`}
    style:top={`${item.y - item.sprite.pivot.y * scale}px`}
    style:z-index={Math.round(item.y)}
  />
{/each}

<style>
  .terrain-region {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    mask-image: radial-gradient(
      ellipse closest-side at center,
      #000 22%,
      #000d 40%,
      transparent 70%
    );
  }
  .terrain-tile {
    position: absolute;
    background-repeat: no-repeat;
    pointer-events: none;
  }
  .region-shadow {
    position: absolute;
    max-width: none;
    z-index: 2;
    pointer-events: none;
    transform: matrix(1, 0, 0.64, 0.32, 0, 0);
    filter: brightness(0) blur(2px);
    opacity: 0.28;
  }
  .region-decoration {
    position: absolute;
    max-width: none;
    pointer-events: none;
    user-select: none;
  }
</style>
