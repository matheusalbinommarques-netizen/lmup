<script lang="ts">
  import { FALLBACK_LINE_ICON, LINE_ICONS } from '$lib/content/lineIcons';
  let { name, size = 20 }: { name: string | null | undefined; size?: number } =
    $props();
  const body = $derived((name && LINE_ICONS[name]) || FALLBACK_LINE_ICON);
</script>

<svg
  class="line-icon"
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- static, bundled Lucide paths -->
  {@html body}
</svg>

<style>
  .line-icon {
    flex: none;
  }
</style>
