<script lang="ts">
  import { locations, worldArt, type LocationId } from './content';
  import type { WorldState } from './worldState';
  let {
    world,
    selected = $bindable<LocationId>('oasis'),
  }: { world: WorldState; selected?: LocationId } = $props();
  function focusNeighbour(event: KeyboardEvent, id: LocationId) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const index = locations.findIndex((place) => place.id === id),
      next = locations[(index + step + locations.length) % locations.length];
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelector<HTMLButtonElement>(`[data-location="${next.id}"]`)
      ?.focus();
  }
</script>

<section id="mapa" class="region-map" aria-label="Mapa dos Ermos Centrais">
  <div class="map-top">
    <div>
      <p class="lmu-eyebrow">Sua região</p>
      <h2>Ermos Centrais</h2>
    </div>
  </div>
  <div class="viewport" role="group" aria-label="Pintura e localidades">
    <div class="map-art">
      <img
        src={worldArt + 'mapa-ermos-centrais.webp'}
        alt="Região árida com o Oásis em construção, montanhas, entreposto e ruínas"
        draggable="false"
      />
      <svg
        class="routes"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
        ><path
          class:known={world.discovered.includes('variel')}
          d="M350 430 C310 580 250 640 190 760"
        /><path
          d="M350 430 Q350 220 400 140 M350 430 Q600 480 790 280 M350 430 Q670 520 840 680"
        /></svg
      >
      {#each locations as place (place.id)}<button
          class="map-marker"
          data-location={place.id}
          onkeydown={(event) => focusNeighbour(event, place.id)}
          class:current={place.id === 'oasis'}
          class:selected={selected === place.id}
          class:unknown={!world.discovered.includes(place.id)}
          style:left={place.x + '%'}
          style:top={place.y + '%'}
          aria-label={place.name +
            ' · ' +
            (place.id === 'oasis'
              ? 'local atual'
              : world.discovered.includes(place.id)
                ? 'conhecido, acesso indisponível nesta etapa'
                : 'não descoberto, acesso indisponível nesta etapa')}
          aria-pressed={selected === place.id}
          onclick={() => (selected = place.id)}
          ><span class="pin" aria-hidden="true"
            >{place.id === 'oasis' ? '✦' : '•'}</span
          ><span class="marker-label">{place.name}</span
          >{#if place.id !== 'oasis'}<span
              class="unavailable"
              aria-hidden="true">⊘</span
            >{/if}</button
        >{/each}
    </div>
  </div>
  <p class="legend">
    <span>✦ Local atual</span><span>● Conhecido</span><span
      >◌ Não descoberto</span
    ><span>⊘ Acesso indisponível nesta etapa</span>
  </p>
  <p class="map-hint">
    Selecione um ponto do mapa para ver os detalhes do local.
  </p>
</section>

<style>
  .region-map {
    border: 1px solid #8c744a;
    border-radius: 14px;
    overflow: hidden;
    background: #0a1b1d;
  }
  .map-top {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .map-top h2 {
    margin: 0;
    font: 600 1.8rem var(--lmu-display);
    color: #f2dfb8;
  }
  .map-top p {
    margin: 0 0 4px;
  }
  .viewport {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    touch-action: manipulation;
    background: #101b1d;
  }
  .map-art {
    position: absolute;
    inset: 0;
  }
  .map-art > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }
  .routes {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .routes path {
    fill: none;
    stroke: #eee2c7;
    stroke-width: 2;
    stroke-dasharray: 5 6;
    opacity: 0.18;
  }
  .routes .known {
    opacity: 0.7;
    stroke: #f7d48d;
  }
  .map-marker {
    position: absolute;
    transform: translate(-50%, -30%);
    border: 0;
    background: none;
    display: grid;
    justify-items: center;
    gap: 3px;
    color: #ffebba;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    max-width: 30%;
    font: 600 0.86rem var(--lmu-display);
  }
  .pin {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 2px solid #e6c778;
    border-radius: 50%;
    background: #102025;
    font-size: 27px;
    line-height: 1;
    box-shadow: 0 2px 8px #000;
  }
  .current .pin {
    background: #986519;
    color: #fff8d8;
    box-shadow: 0 0 18px #ffc44f;
  }
  .unknown .pin {
    border-style: dashed;
    color: #b5b4a6;
    border-color: #a4a89e;
    background: #172222;
  }
  .unavailable {
    position: absolute;
    top: -5px;
    left: calc(50% + 8px);
    background: #172222;
    color: #d9cba9;
    border: 1px solid #8c744a;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    line-height: 16px;
    font-size: 15px;
  }
  .marker-label {
    border: 1px solid #a38348;
    border-radius: 5px;
    background: #071519ed;
    padding: 3px 8px;
    text-shadow: 0 1px #000;
  }
  .selected .marker-label {
    border-color: #f8d077;
    box-shadow: 0 0 9px #e2ad3766;
  }
  .map-marker:focus-visible {
    outline: 3px solid #fff4d3;
    outline-offset: 5px;
    border-radius: 6px;
    z-index: 2;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    padding: 0 16px;
    font-size: 0.78rem;
    color: #d7d6c6;
  }
  .map-hint {
    font-size: 0.76rem;
    color: #b4c4bb;
    padding: 0 16px 10px;
    margin-top: 12px;
  }
  @media (max-width: 600px) {
    .map-top {
      padding: 12px;
    }
    .map-top h2 {
      font-size: 1.4rem;
    }
    .marker-label {
      display: block;
      position: absolute;
      top: 38px;
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      max-width: 140px;
      font-size: 0.72rem;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .map-marker:hover .marker-label,
    .map-marker:focus-visible .marker-label,
    .map-marker.selected .marker-label {
      opacity: 1;
      visibility: visible;
    }
    .map-marker[data-location='stone'] .marker-label,
    .map-marker[data-location='sareth'] .marker-label {
      left: auto;
      right: 0;
      transform: none;
    }
    .map-marker[data-location='variel'] .marker-label {
      left: 0;
      transform: none;
    }
    .map-marker {
      font-size: 1rem;
    }
    .pin {
      width: 24px;
      height: 24px;
      font-size: 22px;
    }
    .legend {
      gap: 9px;
      font-size: 0.7rem;
    }
  }
</style>
