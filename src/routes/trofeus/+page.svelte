<!-- src/routes/trofeus/+page.svelte -->
<script lang="ts">
  import AvatarAchievementsPanel from '$lib/AvatarAchievementsPanel.svelte';
  import AchievementsPanel from '$lib/AchievementsPanel.svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
</script>

<svelte:head>
  <title>Sala de Troféus • Level Me Up</title>
</svelte:head>

<main class="min-h-full">
  <!-- Cabeçalho da página -->
  <section class="mx-auto max-w-5xl px-6 pt-10 pb-8 text-center md:px-10">
    <PageTitleCard
      title="Sala de Troféus"
      subtitle="Celebre suas conquistas e observe o poder das suas vitórias!"
      align="center"
    />
  </section>

  <!-- Conquistas em destaque (avatar) -->
  <section class="mx-auto mb-10 max-w-6xl px-6 md:px-10">
    <AvatarAchievementsPanel />
  </section>

  <!-- Mapa de conquistas -->
  <section class="mx-auto mb-12 max-w-6xl px-6 md:px-10">
    <AchievementsPanel />
  </section>
</main>
