<!-- src/routes/+page.svelte -->
<script lang="ts">
  import StatsManager from '$lib/StatsManager.svelte';
  import AreaManager from '$lib/AreaManager.svelte';
</script>

<svelte:head>
  <title>Level Me Up!</title>
</svelte:head>

<main class="min-h-screen bg-background text-text">
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-10 pb-8">
    <!-- Card épico de nível / XP / streak -->
    <StatsManager />

    <!-- Missões ativas (áreas + itens) -->
    <AreaManager />
  </div>
</main>
