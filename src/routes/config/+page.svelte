<script lang="ts">
  // Importações dinâmicas para evitar erro 500 (SSR)
  // (A linha 'import type' foi removida daqui)

  let reducedMotion = $state(false);
  let highContrast = $state(false);
  let focusMode = $state(false);

  async function handleBackup() {
    try {
      const { exportData } = await import('$services/backupService');
      await exportData();
      alert('Memórias guardadas com sucesso no pergaminho (arquivo JSON)!');
    } catch (error) {
      alert('Falha ao criar o pergaminho de backup.');
      console.error(error);
    }
  }

  async function handleRestore() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const { importData } = await import('$services/backupService');
          await importData(file);

          alert(
            'Memórias restauradas! Recarregue a taverna para ver as mudanças.',
          );
          window.location.reload();
        } catch (error) {
          alert('Este pergaminho parece corrompido (Erro ao restaurar).');
          console.error(error);
        }
      }
    };
    input.click();
  }

  async function handleClearData() {
    if (
      confirm(
        'TEM CERTEZA? Isso apagará todo o seu progresso deste navegador para sempre!',
      )
    ) {
      try {
        const { clearAllData } = await import('$services/backupService');
        await clearAllData();
        window.location.reload();
      } catch (error) {
        alert('Erro ao apagar os dados.');
        console.error(error);
      }
    }
  }
</script>

<div class="flex flex-col gap-8 pb-8">
  <header>
    <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
      Cofre Arcano
    </h1>
    <p class="text-slate-400">
      Gerencie seus dados e ajuste sua experiência mágica.
    </p>
  </header>

  <section
    class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-md"
  >
    <h2
      class="flex items-center gap-3 text-xl font-bold text-slate-200 mb-6 pb-4 border-b border-slate-800/50"
    >
      <span class="text-2xl">👁️</span> Grimório Visual
    </h2>

    <div class="flex flex-col gap-4">
      <label
        class="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg cursor-pointer hover:bg-slate-900/80 transition-colors"
      >
        <div>
          <span class="font-medium text-slate-300">Reduzir Movimento</span>
          <p class="text-xs text-slate-500">
            Diminui animações para maior conforto.
          </p>
        </div>
        <input
          type="checkbox"
          bind:checked={reducedMotion}
          class="w-5 h-5 accent-primary rounded cursor-pointer"
        />
      </label>
      <label
        class="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg cursor-pointer hover:bg-slate-900/80 transition-colors"
      >
        <div>
          <span class="font-medium text-slate-300">Alto Contraste</span>
          <p class="text-xs text-slate-500">
            Melhora a legibilidade dos textos mágicos.
          </p>
        </div>
        <input
          type="checkbox"
          bind:checked={highContrast}
          class="w-5 h-5 accent-primary rounded cursor-pointer"
        />
      </label>
      <label
        class="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg cursor-pointer hover:bg-slate-900/80 transition-colors"
      >
        <div>
          <span class="font-medium text-slate-300">Modo Foco</span>
          <p class="text-xs text-slate-500">
            Esconde elementos decorativos da taverna.
          </p>
        </div>
        <input
          type="checkbox"
          bind:checked={focusMode}
          class="w-5 h-5 accent-primary rounded cursor-pointer"
        />
      </label>
    </div>
  </section>

  <section
    class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-md"
  >
    <h2
      class="flex items-center gap-3 text-xl font-bold text-slate-200 mb-6 pb-4 border-b border-slate-800/50"
    >
      <span class="text-2xl">📜</span> Cofre de Memórias
    </h2>

    <p
      class="text-sm text-slate-400 mb-6 bg-blue-900/20 p-4 rounded-lg border border-blue-500/20"
    >
      <strong>Nota do Mago:</strong> Seus dados vivem apenas neste navegador. Faça
      backups regulares se for trocar de dispositivo!
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onclick={handleBackup}
        class="flex items-center justify-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all active:scale-95"
      >
        <span>📥</span> Fazer Backup (Exportar)
      </button>

      <button
        onclick={handleRestore}
        class="flex items-center justify-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all active:scale-95"
      >
        <span>📤</span> Restaurar (Importar)
      </button>
    </div>
  </section>

  <section
    class="mt-8 pt-8 border-t border-red-900/30 opacity-80 hover:opacity-100 transition-opacity"
  >
    <h3 class="text-red-500 font-bold mb-4 uppercase text-sm tracking-wider">
      Zona Proibida
    </h3>
    <button
      onclick={handleClearData}
      class="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-950/30 rounded-lg transition-colors"
    >
      🗑️ Apagar todo o progresso
    </button>
  </section>
</div>
