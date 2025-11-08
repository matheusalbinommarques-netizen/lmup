<script lang="ts">
  // Importa o painel que já tem a lógica e o visual
  import EcoPanel from '$lib/EcoPanel.svelte';
</script>

<div class="flex flex-col gap-6">
  <header class="mb-2">
    <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
      Santuário da Natureza
    </h1>
    <p class="text-slate-400">Seu progresso total cultiva esta floresta.</p>
  </header>

  <EcoPanel />
</div>
