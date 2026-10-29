<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  const uid = $props.id();
  let {
    label,
    hint = '',
    error = '',
    value = $bindable(''),
    id = uid,
    class: className = '',
    ...rest
  }: HTMLInputAttributes & {
    label: string;
    hint?: string;
    error?: string;
    value?: string;
  } = $props();
</script>

<div class={`lmu-field ${className}`}>
  <label for={id}>{label}</label>
  <input
    {...rest}
    {id}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
  />
  {#if error}<p id={`${id}-error`} class="lmu-field-error" role="alert">
      {error}
    </p>{:else if hint}<p id={`${id}-hint`} class="lmu-hint">{hint}</p>{/if}
</div>
