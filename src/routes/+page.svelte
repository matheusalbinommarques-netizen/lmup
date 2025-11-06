<!-- src/routes/+page.svelte -->
<script lang="ts">
  import StatsManager from '$lib/StatsManager.svelte';
  import AreaManager from '$lib/AreaManager.svelte';
  import AvatarAchievementsPanel from '$lib/AvatarAchievementsPanel.svelte';
  import EcoGamificationPanel from '$lib/EcoGamificationPanel.svelte';
  import XpByAreaPanel from '$lib/XpByAreaPanel.svelte';
</script>

<main class="mx-auto max-w-5xl px-4 pb-28 pt-8">
  <!-- Hero / card principal de progresso -->
  <StatsManager />

  <!-- Seção de painéis acima das missões -->
  <div class="mt-6 space-y-6">
    <!-- Avatar + medalhas -->
    <AvatarAchievementsPanel />

    <!-- Eco-gamificação / jardim -->
    <EcoGamificationPanel />

    <!-- Novo painel: gráficos de XP por área -->
    <XpByAreaPanel />
  </div>

  <!-- Missões ativas (áreas + itens) -->
  <div class="mt-8">
    <AreaManager />
  </div>
</main>
