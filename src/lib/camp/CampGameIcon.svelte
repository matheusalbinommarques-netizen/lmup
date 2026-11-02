<script lang="ts">
  let {
    kind,
    size = 28,
  }: {
    kind:
      | 'wood'
      | 'stone'
      | 'iron'
      | 'gold'
      | 'mission'
      | 'inventory'
      | 'build'
      | 'move'
      | 'destroy';
    size?: number;
  } = $props();
  const positions = {
    wood: '0% 0%',
    stone: '50% 0%',
    iron: '100% 0%',
    gold: '0% 50%',
    mission: '50% 50%',
    inventory: '100% 50%',
    build: '0% 100%',
    move: '50% 100%',
    destroy: '100% 100%',
  };
</script>

<span
  class="game-icon"
  aria-hidden="true"
  style:width={`${size}px`}
  style:height={`${size}px`}
  style:background-position={positions[kind]}
></span>

<style>
  .game-icon {
    display: inline-block;
    flex-shrink: 0;
    background-image: url('/art/camp/ui-icons-prototype-ai.png');
    background-size: 300% 300%;
    background-repeat: no-repeat;
    vertical-align: middle;
  }
</style>
