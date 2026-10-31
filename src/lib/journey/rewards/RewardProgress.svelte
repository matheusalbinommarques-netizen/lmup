<script lang="ts">
  let {
    label,
    before,
    after,
    from,
    to,
    animate = false,
    crossed = false,
  }: {
    label: string;
    before: string;
    after: string;
    from: number;
    to: number;
    animate?: boolean;
    crossed?: boolean;
  } = $props();
</script>

<div class="reward-progress">
  <div class="labels"><strong>{label}</strong><span>{after}</span></div>
  <div
    class="track"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(to)}
    aria-valuetext={after}
  >
    <span
      class:animate
      class:crossed
      style={`--from:${from / 100};--to:${to / 100}`}
    ></span>
  </div>
  <small>Antes: {before}</small>
</div>

<style>
  .reward-progress {
    text-align: left;
    min-width: 0;
  }
  .labels {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.3rem 1rem;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  strong {
    color: #f2dfb7;
    font-weight: 500;
  }
  .track {
    height: 10px;
    overflow: hidden;
    border: 1px solid #b28b4b80;
    border-radius: 20px;
    background: #020b0f;
    box-shadow: inset 0 2px 4px #000;
  }
  .track span {
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: left;
    transform: scaleX(var(--to));
    background: var(--rpg-xp);
    box-shadow: 0 0 14px #f0b74f80;
    border-radius: inherit;
  }
  .animate {
    animation: fill 850ms 200ms both ease-out;
  }
  .animate.crossed {
    animation-name: cross;
  }
  @keyframes cross {
    0% {
      transform: scaleX(var(--from));
    }
    40%,
    45% {
      transform: scaleX(1);
    }
    46% {
      transform: scaleX(0);
    }
    100% {
      transform: scaleX(var(--to));
    }
  }
  small {
    display: block;
    color: #aebdb7;
    margin-top: 0.35rem;
    font-size: 0.75rem;
  }
  @keyframes fill {
    from {
      transform: scaleX(var(--from));
    }
    to {
      transform: scaleX(var(--to));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .animate,
    .animate.crossed {
      animation: none;
    }
  }
</style>
