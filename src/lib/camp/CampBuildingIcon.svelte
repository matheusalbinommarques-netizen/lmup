<script lang="ts">
  import type { campSprites } from './campSprites';
  let { kind }: { kind: keyof typeof campSprites } = $props();
</script>

<svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if kind === 'hall'}
    <path
      d="M4 21V9l8-6 8 6v12H4ZM2 9l10-7 10 7M9 21v-7h6v7M7 10h2m6 0h2M12 2v-1"
    />
  {:else if kind === 'store'}
    <path d="M3 10h18v11H3zM2 10l10-8 10 8M7 21v-7h10v7M7 14l10 7m0-7L7 21" />
  {:else if kind === 'forge'}
    <path
      d="M3 12h18l-4 4H9l-5-2v-2Zm6 4v4m7-4v4M6 21h13M11 8c-3-3 3-3 0-6m5 6c-2-2 2-3 0-5"
    />
  {:else if kind === 'sawmill'}
    <path
      d="M3 16h15a4 4 0 0 1 0 8H3a4 4 0 0 1 0-8Z"
      transform="translate(2 -4)"
    />
    <ellipse cx="5" cy="16" rx="3" ry="4" /><path
      d="m8 9 7-7 6 6-7 7M13 4l2 2m1 1 2 2m1 1 1 1M11 17h8"
    />
  {:else if kind === 'quarry'}
    <path
      d="m3 20 3-10 9-3 6 8-3 6H3ZM6 10l6 5 9 0m-9 0 6 6M2 4l5-2 8 3m-8-3L4 8"
    />
  {:else}
    <path
      d="M3 21V10l9-7 9 7v11M7 21V11l5-4 5 4v10M7 17h10M7 13h10M2 21h20m-12-4 4 4m0-4-4 4"
    />
  {/if}
</svg>
