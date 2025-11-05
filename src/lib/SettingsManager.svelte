<script lang="ts">
  import { exportarDados, importarDados } from '../services/backupService.js';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';

  let fileInput: HTMLInputElement | null = null;

  async function handleExportClick() {
    await exportarDados();
  }

  function handleImportClick() {
    fileInput?.click();
  }

  async function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    await importarDados(file);

    // permite escolher o mesmo arquivo de novo, se quiser
    target.value = '';
  }
</script>

<BaseCard title="Configurações & Backup">
  <div class="space-y-6">
    <section class="space-y-2">
      <h3 class="text-lg font-semibold text-text">Backup de dados</h3>
      <p class="text-sm text-text-secondary">
        Exporte seus dados para um arquivo JSON ou importe um backup existente.
      </p>

      <div class="flex flex-wrap gap-3">
        <BaseButton variant="secondary" onclick={handleExportClick}>
          Exportar dados
        </BaseButton>

        <BaseButton variant="secondary" onclick={handleImportClick}>
          Importar backup
        </BaseButton>

        <input
          bind:this={fileInput}
          type="file"
          accept="application/json"
          class="hidden"
          onchange={handleFileChange}
        />
      </div>
    </section>
  </div>
</BaseCard>
