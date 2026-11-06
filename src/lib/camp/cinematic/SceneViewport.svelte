<script lang="ts">
  import { tick, untrack } from 'svelte';
  import LayeredScene from '$lib/scenes/LayeredScene.svelte';
  import type { CampScene } from './scenes';
  let {
    scene,
    busy = false,
    onPoint,
    onCenter,
  }: {
    scene: CampScene;
    busy?: boolean;
    onPoint: (id: string) => void;
    onCenter: () => void;
  } = $props();
  let heading = $state<HTMLHeadingElement>();
  let scroll = $state<HTMLDivElement>();
  $effect(() => {
    const id = scene.id;
    untrack(() => {
      void id;
      void tick().then(() => {
        heading?.focus({ preventScroll: true });
        if (scroll)
          scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
      });
    });
  });
</script>

<section
  class="scene-stage"
  aria-label={scene.title}
  data-testid="camp-scene"
  data-scene={scene.id}
>
  {#if scene.id === 'preparation'}
    <div class="preparing">
      <span aria-hidden="true">✧</span>
      <h1 bind:this={heading} tabindex="-1">Região em preparação</h1>
      <p>{scene.subtitle}</p>
      <button onclick={onCenter}>Voltar ao Centro</button>
    </div>
  {:else}
    <header class="scene-heading">
      <h1 bind:this={heading} tabindex="-1">{scene.title}</h1>
      <p>{scene.subtitle}</p>
    </header>
    <div class="scene-frame">
      <div class="scene-scroll" bind:this={scroll}>
        <div class="painting" class:center={scene.id === 'center'}>
          <LayeredScene
            scene={scene.canvas}
            disabled={busy}
            onpoint={onPoint}
            oninspect={scene.id === 'garden'
              ? () => onPoint('tree')
              : undefined}
          />
        </div>
      </div>
      {#if scene.id === 'center'}<a class="scene-back" href="/mundo#mapa"
          >‹ Voltar ao Mundo</a
        >{/if}
    </div>
    <p class="mobile-hint">
      ↔ Deslize a paisagem para explorar. Todos os acessos também estão abaixo.
    </p>
    <nav class="mobile-access" aria-label="Acessos da cena">
      {#each scene.points as item (item.id)}<button
          disabled={busy}
          onclick={() => onPoint(item.id)}>{item.label}</button
        >{/each}
    </nav>
    {#if scene.id !== 'center'}<footer>
        <button disabled={busy} onclick={onCenter}>‹ Voltar ao Centro</button>
      </footer>{/if}
  {/if}
</section>

<style>
  .scene-stage {
    position: relative;
    isolation: isolate;
    background: #0d1913;
    color: #f5e3b9;
    overflow: clip;
  }
  .scene-heading {
    position: absolute;
    left: 50%;
    top: 4%;
    transform: translateX(-50%);
    text-align: center;
    width: 66%;
    z-index: 35;
    pointer-events: none;
  }
  .scene-heading h1 {
    display: inline-block;
    margin: 0;
    padding: 10px 26px;
    background: #0c1713ed;
    border: 1px solid #bd9a53;
    border-radius: 12px;
    color: #f4d58e;
    font:
      400 clamp(24px, 2.7vw, 43px)/1.15 var(--lmu-display, Georgia),
      Georgia,
      serif;
    box-shadow: 0 5px 20px #0005;
  }
  .scene-heading h1:focus {
    outline: none;
  }
  .scene-heading p {
    margin: 10px 0;
    color: #f8e5b5;
    text-shadow: 0 2px 5px #000;
    font:
      clamp(12px, 1.4vw, 20px) Georgia,
      serif;
  }
  .scene-frame {
    position: relative;
  }
  .scene-back {
    position: absolute;
    left: 16px;
    bottom: 16px;
    z-index: 35;
  }
  .scene-scroll {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #937b47 #122219;
  }
  .painting {
    width: 100%;
    min-width: 100%;
  }
  footer {
    display: flex;
    justify-content: flex-start;
    padding: 12px 16px;
    border-top: 1px solid #a68b4933;
  }
  footer button,
  .scene-back,
  .mobile-access button,
  .preparing button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 9px 16px;
    color: #f4db9a;
    background: #111e16;
    border: 1px solid #ad8e4f;
    border-radius: 6px;
    text-decoration: none;
    font:
      16px Georgia,
      serif;
    cursor: pointer;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid #ffdfa1;
    outline-offset: 3px;
  }
  .mobile-hint,
  .mobile-access {
    display: none;
  }
  .preparing {
    display: grid;
    justify-items: center;
    align-content: center;
    text-align: center;
    gap: 20px;
    min-height: 70vh;
    padding: 30px;
    background: radial-gradient(ellipse, #32432c77, transparent);
  }
  .preparing > span {
    font: 70px Georgia;
    color: #bd9a53;
  }
  .preparing h1 {
    font: 38px Georgia;
    margin: 0;
  }
  .preparing p {
    color: #b7c2ac;
  }
  @media (max-width: 900px) {
    .scene-heading {
      position: static;
      transform: none;
      width: 100%;
      padding: 16px 12px 12px;
    }
    .scene-heading h1 {
      font-size: 26px;
      padding: 8px 16px;
    }
    .scene-heading p {
      font-size: 13px;
      line-height: 1.4;
      margin: 8px 0 0;
    }
    .painting {
      width: 840px;
    }
    .painting.center {
      width: 1060px;
    }
    .mobile-hint {
      display: block;
      margin: 0;
      padding: 9px 12px;
      font-size: 10px;
      color: #aab794;
      border-top: 1px solid #b3934e33;
    }
    .mobile-access {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 12px 12px;
    }
    .mobile-access button {
      font-size: 13px;
      flex: 1 1 100px;
      padding: 8px;
    }
    footer {
      padding: 12px;
    }
    .preparing h1 {
      font-size: 30px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
</style>
