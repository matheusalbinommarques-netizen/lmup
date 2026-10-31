<script lang="ts">
  import type { Snippet } from 'svelte';
  import RpgTrim from '$lib/ui/RpgTrim.svelte';
  import Artwork from '$lib/ui/Artwork.svelte';
  import Icon, { type IconName } from '$lib/ui/Icon.svelte';
  let {
    title,
    icon,
    image,
    alt = '',
    detail,
    href,
    action,
    children,
    id,
  }: {
    title: string;
    icon: IconName;
    image: string;
    alt?: string;
    detail: string;
    href: string;
    action: string;
    children?: Snippet;
    id?: string;
  } = $props();
</script>

<section
  class="rpg-destination rpg-frame rpg-frame--secondary"
  data-destination={icon}
  aria-label={title}
  {id}
>
  <RpgTrim />
  <header>
    <Icon name={icon} size={26} />
    <h2>{title}</h2>
  </header>
  <div class="rpg-destination-art lmu-decorative">
    <Artwork src={image} {alt} sizes="(max-width: 600px) 100vw, 350px" />
  </div>
  <div class="rpg-destination-copy">
    <p>{detail}</p>
    {#if children}{@render children()}{/if}
  </div>
  <a class="rpg-destination-action" {href}
    >{action}<Icon name="arrow" size={15} /></a
  >
</section>
