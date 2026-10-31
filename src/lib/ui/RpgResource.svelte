<script lang="ts">
  import Icon, { type IconName } from './Icon.svelte';
  let { value, label, icon }: { value: number; label: string; icon: IconName } =
    $props();
</script>

<span class="rpg-resource"
  ><Icon name={icon} size={21} /><span><strong>{value}</strong> {label}</span
  ></span
>

<style>
  .rpg-resource {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-variant-numeric: tabular-nums;
  }
  strong {
    font-weight: 500;
    color: var(--rpg-gold, #dbbe83);
  }
</style>
