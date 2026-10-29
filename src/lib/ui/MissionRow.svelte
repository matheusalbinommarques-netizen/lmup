<script lang="ts">
  import Icon from './Icon.svelte';
  let {
    title,
    context,
    progress,
    done = false,
    onclick,
  }: {
    title: string;
    context: string;
    progress?: string;
    done?: boolean;
    onclick: () => void;
  } = $props();
</script>

<li class="lmu-mission-row">
  <button {onclick} class="lmu-row-button"
    ><span class:checked={done} class="lmu-row-mark"
      >{#if done}<Icon name="check" size={18} />{:else}<Icon
          name="arrow"
          size={18}
        />{/if}</span
    ><span class="lmu-row-copy"
      ><strong>{title}</strong><span class="lmu-muted">{context}</span></span
    >{#if progress}<span class="lmu-row-progress">{progress}</span>{/if}</button
  >
</li>
