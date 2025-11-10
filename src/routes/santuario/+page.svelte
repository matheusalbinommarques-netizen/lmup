<script lang="ts">
  // Importa o painel que já tem a lógica e o visual
  import EcoPanel from '$lib/EcoPanel.svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';
</script>

<div class="flex flex-col gap-6">
  <PageTitleCard
    title="Santuário da Natureza"
    subtitle="Conclua missões e ganhe experiência, e seu santuário florescerá para uma floresta vigorosa!"
    align="center"
  />

  <EcoPanel />
</div>
