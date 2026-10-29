<script lang="ts">
  import Icon from './Icon.svelte';
  let {
    src,
    alt,
    class: className = '',
    eager = false,
    sizes = '(max-width: 760px) 100vw, 450px',
  }: {
    src: string;
    alt: string;
    class?: string;
    eager?: boolean;
    sizes?: string;
  } = $props();
  let failedSource = $state('');
</script>

{#if failedSource === src}
  <div class={`lmu-art-fallback ${className}`} role="img" aria-label={alt}>
    <Icon name="world" size={48} />
  </div>
{:else}
  <img
    {src}
    {alt}
    srcset={src.includes('/scene-')
      ? `${src.replace('.webp', '-small.webp')} 600w, ${src} 1200w`
      : undefined}
    {sizes}
    class={className}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onerror={() => {
      failedSource = src;
    }}
  />
{/if}
