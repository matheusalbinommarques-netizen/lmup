<script lang="ts">
  import { onMount } from 'svelte';
  import {
    lake,
    campRoads,
    lakeRadius,
    type TerrainRegionDefinition,
  } from './campRegion';
  let { region }: { region: TerrainRegionDefinition } = $props();
  let canvas: HTMLCanvasElement;
  let ready = $state(false);
  let failed = $state(false);
  onMount(() => {
    let disposed = false;
    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    // Ground is composed once from reusable atlas cells, not thousands of DOM nodes
    // recreated/moved during camera gestures. Trees and buildings remain separate.
    Promise.all(
      Object.entries(region.sheets).map(
        async ([key, src]) => [key, await load(src)] as const,
      ),
    )
      .then((entries) => {
        if (disposed) return;
        const images = Object.fromEntries(entries);
        const ctx = canvas.getContext('2d')!;
        ctx.scale(1.5, 1.5);
        const baseTiles = region.tiles.filter((t) => t.material === 'grass');
        for (const tile of baseTiles)
          ctx.drawImage(
            images.grass,
            (tile.frame % 8) * 128,
            Math.floor(tile.frame / 8) * 64,
            128,
            64,
            tile.x - 32,
            tile.y - 16,
            64.5,
            32.5,
          );
        // Reuse one offscreen layer for textured masks; no monolithic map asset.
        const layer = document.createElement('canvas');
        layer.width = region.width;
        layer.height = region.height;
        const paint = layer.getContext('2d')!;
        for (const material of ['forest', 'dirt', 'sand'] as const) {
          paint.clearRect(0, 0, layer.width, layer.height);
          paint.globalCompositeOperation = 'source-over';
          for (const tile of baseTiles)
            paint.drawImage(
              images[material],
              (tile.frame % 8) * 128,
              Math.floor(tile.frame / 8) * 64,
              128,
              64,
              tile.x - 32,
              tile.y - 16,
              64.5,
              32.5,
            );
          paint.globalCompositeOperation = 'destination-in';
          paint.save();
          paint.filter = material === 'forest' ? 'blur(20px)' : 'blur(5px)';
          paint.fillStyle = '#fff';
          paint.strokeStyle = '#fff';
          paint.beginPath();
          if (material === 'forest') {
            for (const tile of region.tiles.filter(
              (t) => t.material === 'forest',
            )) {
              paint.moveTo(tile.x, tile.y - 16);
              paint.lineTo(tile.x + 32, tile.y);
              paint.lineTo(tile.x, tile.y + 16);
              paint.lineTo(tile.x - 32, tile.y);
              paint.closePath();
            }
            paint.fill();
          } else if (material === 'dirt') {
            paint.scale(1, 0.5);
            paint.lineWidth = 72;
            paint.lineCap = 'round';
            paint.lineJoin = 'round';
            for (const points of campRoads) {
              paint.moveTo(points[0][0], points[0][1] * 2);
              for (let i = 1; i < points.length - 1; i++)
                paint.quadraticCurveTo(
                  points[i][0],
                  points[i][1] * 2,
                  (points[i][0] + points[i + 1][0]) / 2,
                  points[i][1] + points[i + 1][1],
                );
              const last = points.at(-1)!;
              paint.lineTo(last[0], last[1] * 2);
            }
            paint.stroke();
          } else {
            for (let i = 0; i <= 100; i++) {
              const a = (i * Math.PI * 2) / 100,
                r =
                  1.23 * (1 + 0.09 * Math.sin(a * 3) + 0.05 * Math.cos(a * 5));
              const x = lake.x + Math.cos(a) * lake.rx * r,
                y = lake.y + Math.sin(a) * lake.ry * r;
              if (i === 0) paint.moveTo(x, y);
              else paint.lineTo(x, y);
            }
            paint.closePath();
            paint.fill();
          }
          paint.restore();
          paint.globalCompositeOperation = 'source-over';
          ctx.drawImage(layer, 0, 0);
        }
        // Organic shoreline over the same sand atlas; seeded ripples, no external art.
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a = (i * Math.PI * 2) / 100,
            r = 1 + 0.09 * Math.sin(a * 3) + 0.05 * Math.cos(a * 5);
          const x = lake.x + Math.cos(a) * lake.rx * r,
            y = lake.y + Math.sin(a) * lake.ry * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.clip();
        const water = ctx.createLinearGradient(
          lake.x,
          lake.y - lake.ry,
          lake.x + 80,
          lake.y + lake.ry,
        );
        water.addColorStop(0, '#788d7b');
        water.addColorStop(0.2, '#4e7270');
        water.addColorStop(0.8, '#31565a');
        water.addColorStop(1, '#64847b');
        ctx.fillStyle = water;
        ctx.fillRect(lake.x - 230, lake.y - 130, 460, 260);
        let seed = 9137;
        const random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (let i = 0; i < 2000; i++) {
          const x = lake.x - 210 + random() * 420,
            y = lake.y - 120 + random() * 240;
          ctx.strokeStyle = i % 3 ? '#c7d9ba20' : '#183c3928';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 3 + (i % 9), y + 0.5);
          ctx.stroke();
          const r = lakeRadius(x, y);
          if (r > 0.86) {
            ctx.fillStyle = `rgba(170,179,139,${Math.max(0, (r - 0.86) * 0.8)})`;
            ctx.fillRect(x, y, 9, 2);
          }
        }
        ctx.restore();
        ready = true;
      })
      .catch(() => {
        if (!disposed) failed = true;
      });
    return () => {
      disposed = true;
    };
  });
</script>

<canvas
  bind:this={canvas}
  class="terrain-region"
  data-region={region.id}
  data-ready={ready}
  aria-hidden="true"
  width={region.width * 1.5}
  height={region.height * 1.5}
  style:width={`${region.width}px`}
  style:height={`${region.height}px`}
></canvas>
{#if failed}<p class="terrain-error" role="alert">
    Não foi possível carregar o terreno. Recarregue a prévia.
  </p>{/if}
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
  }
  .terrain-error {
    position: absolute;
    z-index: 2;
    background: #522;
    color: white;
    padding: 12px;
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
