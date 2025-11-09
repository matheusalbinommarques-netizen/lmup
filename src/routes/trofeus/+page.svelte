<!-- src/routes/trofeus/+page.svelte -->
<script lang="ts">
  import AvatarAchievementsPanel from '$lib/AvatarAchievementsPanel.svelte';
  import AchievementsPanel from '$lib/AchievementsPanel.svelte';
</script>

<svelte:head>
  <title>Sala de Troféus • Level Me Up</title>
</svelte:head>

<main class="min-h-full">
  <!-- Cabeçalho da página -->
  <section class="mx-auto max-w-5xl px-6 pt-10 pb-8 text-center md:px-10">
    <h1 class="font-serif text-3xl font-extrabold text-amber-300 md:text-4xl">
      Sala de Troféus
    </h1>
    <p class="mt-2 text-sm text-slate-300 md:text-base">
      Veja os marcos da sua jornada: streaks, níveis, áreas e companheiros.
    </p>
    <p class="mt-1 text-xs text-slate-500 md:text-sm">
      Você não precisa &quot;farmar troféus&quot; separado — as conquistas
      surgem naturalmente enquanto você usa o app.
    </p>
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
