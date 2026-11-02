<script lang="ts">
  import type { SceneSpriteDefinition } from './campSprites';
  import { groundHeading, type GroundRotation } from './campPlacement';
  import CampBuildingIcon from './CampBuildingIcon.svelte';
  let {
    id,
    name,
    x,
    y,
    sprite,
    selected = false,
    phase = 'ready',
    muted = false,
    rotation = 0,
    kind = 'hall',
    producing = false,
    level = 1,
    onselect,
  }: {
    id: string;
    name: string;
    x: number;
    y: number;
    sprite: SceneSpriteDefinition;
    selected?: boolean;
    phase?: 'ready' | 'building';
    muted?: boolean;
    rotation?: GroundRotation;
    kind?: 'hall' | 'store' | 'forge' | 'sawmill' | 'quarry' | 'mine';
    producing?: boolean;
    level?: number;
    onselect: () => void;
  } = $props();
  const scale = $derived(sprite.worldWidth / sprite.source.width);
  const heading = $derived(groundHeading(rotation, sprite.footprint.height));
  let failed = $state(false);
</script>

<div
  class="scene-sprite"
  class:selected
  class:constructing={phase === 'building'}
  class:muted
  class:producing
  data-kind={kind}
  data-instance-id={id}
  data-rotation={rotation}
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
    /><path
      class="heading"
      d={`M${sprite.footprint.width / 2},${sprite.footprint.height / 2} l${heading.x},${heading.y + sprite.footprint.height / 2}`}
    /><circle
      class="heading"
      cx={sprite.footprint.width / 2 + heading.x}
      cy={sprite.footprint.height + heading.y}
      r="5"
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
    style:transform-origin={`${sprite.pivot.x * scale}px ${sprite.pivot.y * scale}px`}
    style:transform={rotation === 180 ? 'scaleX(-1)' : 'none'}
    style:filter={sprite.tint ?? ''}
    onerror={() => (failed = true)}
  />
  <button
    class="sprite-footprint"
    type="button"
    aria-label={`Selecionar ${name}`}
    title={rotation === 180 ? 'Construção espelhada' : 'Orientação original'}
    aria-pressed={selected}
    onclick={onselect}
    style:width={`${sprite.footprint.width}px`}
    style:height={`${sprite.footprint.height}px`}
    style:left={`${-sprite.footprint.width / 2}px`}
    style:top={`${-sprite.footprint.height}px`}
  ></button>
  <span class="sprite-label" aria-hidden="true"
    ><span class="label-emblem"><CampBuildingIcon {kind} /></span><span
      >{name}{#if phase === 'building'}<small>Em construção</small
        >{:else if producing}<small class="production-label"
          >Produzindo · N{level}</small
        >{:else if selected}<small>Nível {level}</small>{/if}</span
    >{#if producing}<i class="production-dot"></i>{/if}</span
  >
  {#if phase === 'building'}<svg
      class="work-marker"
      aria-hidden="true"
      width="100"
      height="70"
      viewBox="0 0 100 70"
      ><path
        d="M10 62V12M50 62V2M90 62V12M5 20L95 20M5 40L95 40M10 60L90 10M10 10L90 60"
      /></svg
    >{/if}
  {#if failed}<span class="asset-error" role="status">Sprite indisponível</span
    >{/if}
</div>

<style>
  .label-emblem {
    display: inline-flex;
    align-items: center;
    color: #c9b780;
  }
  .sprite-label {
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 3px;
    font-weight: 500;
    letter-spacing: 0.02em;
    box-shadow: 0 3px 7px #0006;
  }
  .sprite-label .label-emblem :global(svg) {
    width: 15px;
    height: 15px;
  }
  .production-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #a4cba2;
    box-shadow: 0 0 5px #74a97680;
  }
  .sprite-label .production-label {
    color: #b5d1a9;
  }
  .scene-sprite[data-kind='quarry'] .label-emblem {
    color: #b8c5cb;
  }
  .scene-sprite[data-kind='mine'] .label-emblem {
    color: #aabbd2;
  }
  .scene-sprite[data-kind='forge'] .label-emblem {
    color: #dfad79;
  }
  .scene-sprite[data-kind='sawmill'] .label-emblem {
    color: #bac898;
  }
  .scene-sprite[data-kind='store'] .label-emblem {
    color: #d8c39a;
  }
  .scene-sprite .heading {
    opacity: 0;
  }
  .scene-sprite.selected .heading {
    opacity: 0.7;
    stroke-width: 2;
  }
  .scene-sprite .selection-ring polygon {
    fill: transparent;
    stroke: #d5c59425;
    stroke-width: 1;
  }
  .scene-sprite.selected .selection-ring polygon {
    fill: #e9cf8920;
    stroke: #efdb9e;
    stroke-width: 2;
    filter: drop-shadow(0 0 3px #ffe6ab60);
  }
  .scene-sprite:has(.sprite-footprint:hover) .selection-ring polygon {
    stroke: #e4d4a9;
  }
  .heading {
    stroke: #fff0b5;
    stroke-width: 4;
    fill: #fff0b5;
  }
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
    z-index: 1;
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
  .constructing img {
    opacity: 0.5;
    filter: sepia(0.4) saturate(0.6);
  }
  .muted .sprite-footprint {
    pointer-events: none;
  }
  .muted {
    opacity: 0.25;
  }
  .constructing .selection-ring polygon {
    stroke: #f4c779;
    stroke-dasharray: 8 4;
  }
  .sprite-label small {
    display: block;
    font-size: 10px;
    color: #ffdc95;
  }
  .work-marker {
    position: absolute;
    left: -50px;
    top: -85px;
    pointer-events: none;
  }
  .work-marker path {
    fill: none;
    stroke: #ae8753;
    stroke-width: 4;
    paint-order: stroke;
    filter: drop-shadow(1px 2px 1px #221b14);
  }
</style>
