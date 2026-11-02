<script lang="ts">
  import { approvedIconPath } from '$lib/content/visualAssets';
  let {
    name = 'missions',
    size = 32,
  }: { name?: string | null; size?: number } = $props();
  let failed = $state(false);
  const path = $derived(approvedIconPath(name));
  $effect(() => {
    if (path) failed = false;
  });
</script>

<span
  class="approved-icon"
  style:width={`${size}px`}
  style:height={`${size}px`}
  aria-hidden="true"
>
  {#if failed}<img
      src={approvedIconPath('missions')}
      alt=""
      width={size}
      height={size}
    />{:else}
    <img
      src={path}
      srcset={`${path} 64w, ${approvedIconPath(name, 128)} 128w`}
      sizes={`${size}px`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      onerror={() => (failed = true)}
    />
  {/if}
</span>

<style>
  .approved-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    vertical-align: middle;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
