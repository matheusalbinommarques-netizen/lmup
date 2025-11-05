<!-- src/routes/config/+page.svelte -->
<script lang="ts">
  import SettingsManager from '$lib/SettingsManager.svelte';
</script>

<svelte:head>
  <title>Configurações • Level Me Up!</title>
</svelte:head>

<main class="min-h-screen bg-background text-text">
  <div class="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-10 pb-8">
    <SettingsManager />
  </div>
</main>
