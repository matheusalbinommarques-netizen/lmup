<script lang="ts">
  import SettingsManager from '$lib/SettingsManager.svelte';

  async function handleClearData() {
    if (
      !confirm(
        'TEM CERTEZA? Isso apagará TODO o seu progresso deste navegador para sempre!',
      )
    ) {
      return;
    }

    try {
      const { clearAllData } = await import('$services/backupService');
      await clearAllData();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Erro ao apagar os dados. Tente novamente.');
    }
  }
</script>

<section class="space-y-4">
  <!-- Painel principal de configurações & neurodiversidade -->
  <SettingsManager />

  <!-- Zona proibida (reset total) -->
  <section
    class="mt-4 rounded-2xl border border-red-900/60 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-2xl"
  >
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p
          class="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-red-400/80"
        >
          Zona proibida
        </p>
        <p class="mt-1 text-[0.8rem] text-slate-200/90">
          Este ritual apaga <strong>todo</strong> o progresso salvo neste navegador
          (perfil, áreas, missões, streak… tudo). Use apenas se quiser recomeçar
          o reino do zero.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-full border border-red-500/70 bg-red-600 px-4 py-2 text-[0.8rem] font-semibold text-slate-50 shadow-lg shadow-red-900/40 transition hover:bg-red-500 hover:shadow-red-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        onclick={handleClearData}
      >
        🔥 Resetar tudo
      </button>
    </div>
  </section>
</section>
