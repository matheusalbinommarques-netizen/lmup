<script lang="ts">
  import Icon from '$lib/ui/Icon.svelte';
  import {
    sortSceneLayers,
    type SceneDefinition,
    type SceneLayer,
  } from './sceneTypes';
  let {
    scene,
    debug = false,
    oninspect,
    onpoint,
    disabled = false,
  }: {
    scene: SceneDefinition;
    debug?: boolean;
    oninspect?: () => void;
    onpoint?: (id: string) => void;
    disabled?: boolean;
  } = $props();
  const layers = $derived(sortSceneLayers(scene.layers));
  function style(layer: SceneLayer) {
    return (
      'left:' +
      layer.position[0] +
      '%;top:' +
      layer.position[1] +
      '%;width:' +
      layer.width +
      '%;' +
      'transform:translate(-' +
      layer.anchor[0] +
      '%,-' +
      layer.anchor[1] +
      '%);z-index:' +
      layer.depth +
      ';' +
      'opacity:' +
      (layer.opacity ?? 1) +
      ';' +
      (layer.mask
        ? 'height:100%;mask-image:url(' +
          layer.mask +
          ');mask-size:100% 100%;mask-repeat:no-repeat;'
        : '') +
      (layer.kind === 'shadow' ? 'height:' + layer.height + '%;' : '') +
      'filter:' +
      (layer.tone ??
        (layer.cleanAlpha ? 'url(#' + scene.id + '-alpha)' : 'none')) +
      ';'
    );
  }
</script>

<figure
  class:debug
  class="layered-scene"
  style:aspect-ratio={scene.width + '/' + scene.height}
  aria-label={scene.label}
  data-testid="layered-scene"
  data-scene={scene.id}
>
  <svg width="0" height="0" aria-hidden="true" class="definitions"
    ><defs>
      <filter id={scene.id + '-alpha'} color-interpolation-filters="sRGB">
        <feComponentTransfer
          ><feFuncA
            type="table"
            tableValues="0 0 0 0 0 0 0 0 0 .12 1 1"
          /></feComponentTransfer
        >
      </filter>
    </defs></svg
  >
  <img
    class="scene-background"
    src={scene.background}
    alt=""
    draggable="false"
    fetchpriority="high"
  />
  {#each layers as layer (layer.id)}
    {#if layer.kind === 'shadow'}
      <div
        class="scene-layer contact-shadow"
        data-layer={layer.id}
        style={style(layer)}
      ></div>
    {:else if (layer.opacity ?? 1) > 0}
      <img
        class="scene-layer"
        class:tree={layer.id === 'tree'}
        data-layer={layer.id}
        src={layer.src}
        style={style(layer)}
        alt=""
        draggable="false"
        decoding="sync"
      />
    {/if}
  {/each}
  {#if debug}
    <div
      class="anchor-mark"
      style:left={scene.layers.find((l) => l.id === 'tree')?.position[0] + '%'}
      style:top={scene.layers.find((l) => l.id === 'tree')?.position[1] + '%'}
      aria-hidden="true"
    >
      <span>Raiz fixa</span>
    </div>
  {/if}
  {#each scene.points ?? [] as point (point.id)}
    <button
      class="element-hotspot"
      class:below={point.placement === 'below'}
      data-testid={'point-' + point.id}
      style:left={point.position[0] + '%'}
      style:top={point.position[1] + '%'}
      {disabled}
      aria-label={point.label}
      onclick={() => onpoint?.(point.id)}
      onfocus={(event) =>
        event.currentTarget.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })}
    >
      {#if point.icon}<Icon name={point.icon} size={22} />{/if}<span
        >{point.label}</span
      >
    </button>
  {/each}
  {#if oninspect}
    <button
      class="scene-hotspot"
      data-testid="tree-hotspot"
      {disabled}
      style:left={scene.hotspot.position[0] + '%'}
      style:top={scene.hotspot.position[1] + '%'}
      onclick={oninspect}
      aria-label={scene.hotspot.label}>✧ <span>Árvore de Evolução</span></button
    >
  {/if}
  <figcaption class="sr-only">
    {scene.label}. Paisagem e câmera fixas.
  </figcaption>
</figure>

<style>
  .element-hotspot {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transform: translate(-50%, -100%);
    z-index: 30;
    min-height: 44px;
    white-space: nowrap;
    padding: 9px 13px;
    color: #fae3a3;
    background: #0c1712f5;
    border: 1px solid #c3a15e;
    border-radius: 7px;
    font:
      500 clamp(12px, 1.1vw, 18px)/1.2 Georgia,
      serif;
    cursor: pointer;
    box-shadow: 0 4px 14px #0006;
  }
  .element-hotspot.below {
    transform: translate(-50%, 0);
  }
  .element-hotspot:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    width: 8px;
    height: 8px;
    transform: translateX(-50%) rotate(45deg);
    background: #101c14;
    border-bottom: 1px solid #b99c5d;
    border-right: 1px solid #b99c5d;
  }
  .element-hotspot:hover {
    background: #26392a;
  }
  .element-hotspot:focus-visible {
    outline: 3px solid #fff0b4;
    outline-offset: 3px;
  }
  .element-hotspot:disabled {
    opacity: 0.65;
    cursor: wait;
  }
  @media (max-width: 900px) {
    .element-hotspot {
      font-size: 13px;
      padding: 8px 10px;
    }
  }

  .layered-scene {
    position: relative;
    width: 100%;
    margin: 0;
    isolation: isolate;
    overflow: hidden;
    background: #362c21;
  }
  .scene-background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
    user-select: none;
  }
  .scene-layer {
    position: absolute;
    display: block;
    pointer-events: none;
    user-select: none;
    max-width: none;
    height: auto;
  }
  .definitions {
    position: absolute;
  }
  .contact-shadow {
    border-radius: 50%;
    background: #1e160d;
    filter: blur(3px) !important;
    mix-blend-mode: multiply;
  }
  .scene-hotspot {
    position: absolute;
    transform: translate(-50%, 0);
    z-index: 20;
    min-height: 42px;
    padding: 0.45rem 0.85rem;
    border: 1px solid #b9914e;
    border-radius: 6px;
    background: #101914ef;
    color: #f6d99b;
    font:
      500 clamp(0.65rem, 1.15vw, 0.88rem)/1.3 Georgia,
      serif;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 3px 14px #0007;
  }
  .scene-hotspot:hover {
    background: #263329;
  }
  .scene-hotspot:focus-visible {
    outline: 3px solid #fff0b2;
    outline-offset: 3px;
  }
  .anchor-mark {
    position: absolute;
    z-index: 30;
    width: 15px;
    height: 15px;
    border: 1px solid #a7f9d1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .anchor-mark:before,
  .anchor-mark:after {
    content: '';
    position: absolute;
    background: #a7f9d1;
  }
  .anchor-mark:before {
    width: 25px;
    height: 1px;
    left: -6px;
    top: 6px;
  }
  .anchor-mark:after {
    height: 25px;
    width: 1px;
    left: 6px;
    top: -6px;
  }
  .anchor-mark span {
    position: absolute;
    left: 20px;
    top: 6px;
    color: #caffdf;
    background: #12251ee6;
    font: 11px/1.4 system-ui;
    white-space: nowrap;
    padding: 2px 5px;
  }
  .debug .tree {
    outline: 1px dashed #a7f9d1;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (max-width: 640px) {
    .scene-hotspot {
      min-height: 44px;
      font-size: 0.72rem;
      padding: 0.4rem 0.6rem;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
