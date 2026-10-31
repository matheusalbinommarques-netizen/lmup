<script lang="ts">
  import Icon from '$lib/ui/Icon.svelte';
  let { before, after }: { before: number; after: number } = $props();
</script>

<section class="level-milestone" aria-label="Subida de nível">
  <h2>Novo nível!</h2>
  <div class="evolution">
    <span class="badge old"
      ><Icon name="spark" size={26} /><small>Nível {before}</small></span
    >
    <Icon name="arrow" size={24} />
    <span class="badge new"
      ><Icon name="today" size={38} /><strong>Nível {after}</strong></span
    >
  </div>
  <p>Seu esforço abriu um novo horizonte.</p>
</section>

<style>
  .level-milestone {
    padding: 0.8rem;
    background: radial-gradient(ellipse, #bc842126, transparent 70%);
  }
  h2 {
    color: var(--rpg-gold);
    margin: 0 0 0.6rem;
    font: 600 1.9rem var(--lmu-display);
  }
  .evolution {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.4rem;
    color: var(--rpg-gold);
  }
  .badge {
    display: grid;
    justify-items: center;
    gap: 0.25rem;
    padding: 0.65rem 1rem;
    border: 1px solid;
    border-radius: 45% 45% 38% 38%;
  }
  .old {
    color: #a8bcc5;
    background: #102630;
  }
  .new {
    background: linear-gradient(135deg, #70511d, #181914);
    box-shadow:
      0 0 24px #edb84d33,
      inset 0 0 0 3px #efc57726;
  }
  p {
    margin: 0.6rem 0 0;
    color: #c5cdc6;
    font-size: 0.85rem;
  }
</style>
