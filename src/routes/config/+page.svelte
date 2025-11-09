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

<div class="min-h-full lmup-bg-config bg-slate-950/60">
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
            Deletar Progresso
          </p>
          <p class="mt-1 text-[0.8rem] text-slate-200/90">
            Aqui você joga <strong>todo</strong> o progresso salvo neste navegador
            (perfil, áreas, missões, streak… tudo) na lata do lixo. Use apenas se
            quiser recomeçar o seu reino do zero.
          </p>
        </div>

        <button type="button" onclick={handleClearData}>
          <img
            src="art/icones/trash-icon.png"
            alt="Lata de Lixo"
            class="h-20 w-20 object-contain"
          />
        </button>
      </div>
    </section>
  </section>
</div>
