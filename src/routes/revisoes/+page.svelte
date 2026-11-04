<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    void goto('/missoes?view=history', { replaceState: true });
  });
</script>

<p>
  O histórico foi preservado. <a href="/missoes?view=history"
    >Abrir histórico de missões</a
  >
</p>
