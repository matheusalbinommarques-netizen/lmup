<script lang="ts">
  import type { SceneSpriteDefinition } from './campSprites';
  let {
    id,
    name,
    x,
    y,
    sprite,
    selected = false,
    onselect,
  }: {
    id: string;
    name: string;
    x: number;
    y: number;
    sprite: SceneSpriteDefinition;
    selected?: boolean;
    onselect: () => void;
  } = $props();
  const scale = $derived(sprite.worldWidth / sprite.source.width);
  let failed = $state(false);
</script>

<div
  class="scene-sprite"
  class:selected
  data-instance-id={id}
  style:left={`${x}px`}
  style:top={`${y}px`}
  style:z-index={Math.round(y)}
>
  <svg
    class="selection-ring"
    aria-hidden="true"
    width={sprite.footprint.width}
    height={sprite.footprint.height}
    viewBox={`0 0 ${sprite.footprint.width} ${sprite.footprint.height}`}
    style:left={`${-sprite.footprint.width / 2}px`}
    style:top={`${-sprite.footprint.height}px`}
    ><polygon
      points={`${sprite.footprint.width / 2},2 ${sprite.footprint.width - 2},${sprite.footprint.height / 2} ${sprite.footprint.width / 2},${sprite.footprint.height - 2} 2,${sprite.footprint.height / 2}`}
    /></svg
  >
  <img
    src={sprite.src}
    alt=""
    draggable="false"
    width={sprite.source.width}
    height={sprite.source.height}
    style:width={`${sprite.worldWidth}px`}
    style:height={`${sprite.source.height * scale}px`}
    style:left={`${-sprite.pivot.x * scale}px`}
    style:top={`${-sprite.pivot.y * scale}px`}
    onerror={() => (failed = true)}
  />
  <button
    class="sprite-footprint"
    type="button"
    aria-label={`Selecionar ${name}`}
    aria-pressed={selected}
    onclick={onselect}
    style:width={`${sprite.footprint.width}px`}
    style:height={`${sprite.footprint.height}px`}
    style:left={`${-sprite.footprint.width / 2}px`}
    style:top={`${-sprite.footprint.height}px`}
  ></button>
  <span class="sprite-label" aria-hidden="true">{name}</span>
  {#if failed}<span class="asset-error" role="status">Sprite indisponível</span
    >{/if}
</div>

<style>
  .scene-sprite {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  img {
    position: absolute;
    max-width: none;
    pointer-events: none;
    user-select: none;
  }
  .selection-ring {
    position: absolute;
    overflow: visible;
    pointer-events: none;
  }
  .selection-ring polygon {
    fill: #c9bf7920;
    stroke: #c9be8b70;
    stroke-width: 2;
  }
  .selected .selection-ring polygon,
  .scene-sprite:has(.sprite-footprint:focus-visible) .selection-ring polygon {
    fill: #ffe5a02b;
    stroke: #ffe4a3;
    stroke-width: 3;
  }
  .sprite-footprint {
    position: absolute;
    pointer-events: auto;
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
  }
  .sprite-label {
    position: absolute;
    top: 7px;
    left: 0;
    transform: translateX(-50%);
    padding: 5px 9px;
    border: 1px solid #ab9560;
    border-radius: 6px;
    background: #152521ed;
    color: #fff3d6;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .selected .sprite-label {
    background: #5b4526;
    border-color: #ffe7b0;
  }
  .asset-error {
    position: absolute;
    bottom: 25px;
    left: -75px;
    width: 150px;
    padding: 6px;
    background: #522;
    color: #fff;
  }
</style>
