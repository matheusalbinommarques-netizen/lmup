<script lang="ts">
  import { exportarDados, importarDados } from '../services/backupService.js';
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';
</script>

<BaseCard>
  <h2 class="text-2xl font-semibold text-center text-text mb-6">
    Configurações
  </h2>

  <div class="space-y-6">
    <div class="setting-item p-4 bg-background border border-border rounded-lg">
      <div class="text-lg font-semibold text-text-secondary">
        Backup e Restauração
      </div>
      <p class="text-sm text-text-secondary mt-1 mb-4">
        Exporte seus dados (áreas, itens, XP) como um arquivo JSON. Você pode
        importá-lo de volta mais tarde ou em outro dispositivo.
      </p>

      <div class="actions flex flex-col md:flex-row gap-4">
        <BaseButton onclick={exportarDados} variant="primary">
          Exportar Dados (JSON)
        </BaseButton>

        <BaseButton onclick={importarDados} variant="danger">
          Importar Dados (JSON)
        </BaseButton>
      </div>
    </div>
  </div>
</BaseCard>
