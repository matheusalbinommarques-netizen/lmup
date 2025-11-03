<script>
  import BaseCard from './BaseCard.svelte';
  import BaseButton from './BaseButton.svelte';
  import { exportData, importData } from '../services/backupService.js';

  let exportJson = $state('');
  let importError = $state('');
  let importSuccess = $state(false);

  // --- EXPORTAR ---
  async function handleExport() {
    try {
      exportJson = await exportData();
    } catch (e) {
      // Usamos alert porque não estamos usando um modal customizado (melhor prática para PWAs)
      alert(e.message);
    }
  }

  // --- IMPORTAR ---
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      //
      // CORREÇÃO DE ERRO DE TIPO ANTERIORMENTE RESOLVIDO
      //
      const result = e.target.result;

      if (typeof result !== 'string') {
        importError =
          'Resultado do arquivo inválido. Certifique-se de ser um arquivo .json de texto.';
        importSuccess = false;
        return;
      }

      const jsonString = result;

      try {
        await importData(jsonString);
        importError = '';
        importSuccess = true;

        alert('Dados restaurados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (e) {
        importError = e.message;
        importSuccess = false;
      }
    };

    reader.onerror = () => {
      importError = 'Erro ao ler o arquivo.';
      importSuccess = false;
    };

    // Lemos como texto, o que garante que o result seja uma string.
    reader.readAsText(file);
  }
</script>

<!-- 
  CORREÇÃO: Envolvemos todo o conteúdo com <BaseCard>.
  O BaseCard é o que define o fundo AZUL.
-->
<BaseCard>
  <h2>Configurações e Backup</h2>

  <!-- Seção de Exportação -->
  <div class="setting-section">
    <h3>1. Exportar Dados (Fazer Backup)</h3>
    <p>
      Salve o seu progresso em um arquivo de texto. Copie o texto abaixo e salve
      em um arquivo .json.
    </p>

    <BaseButton onclick={handleExport} variant="primary">
      Gerar Dados de Backup
    </BaseButton>

    {#if exportJson}
      <textarea readonly bind:value={exportJson} rows="10"></textarea>
    {/if}
  </div>

  <!-- Seção de Importação -->
  <div class="setting-section">
    <h3>2. Importar Dados (Restaurar)</h3>
    <p>
      Restaure seu progresso de um arquivo .json.
      <strong>Atenção:</strong> Isso substituirá todos os seus dados atuais.
    </p>

    <label class="import-label" for="file-import">
      Clique para selecionar seu arquivo .json
    </label>
    <input
      id="file-import"
      type="file"
      accept=".json"
      onchange={handleFileSelect}
    />

    {#if importError}
      <p class="message error">{importError}</p>
    {/if}
    {#if importSuccess}
      <p class="message success">Dados importados! Recarregando...</p>
    {/if}
  </div>
</BaseCard>

<style>
  /* Título principal (branco sobre o card azul) */
  h2 {
    color: white;
    text-align: center;
    margin-bottom: var(--espacamento-lg);
  }

  /* Seção "ilha" (branca) */
  .setting-section {
    background-color: var(--cor-fundo-card);
    border: 1px solid var(--cor-borda);
    border-radius: var(--raio-borda-md);
    padding: var(--espacamento-lg);
    margin-bottom: var(--espacamento-lg);
  }

  /* Títulos (pretos) dentro da ilha branca */
  .setting-section h3 {
    color: var(--cor-texto-primario);
    border-bottom: 1px solid var(--cor-borda);
    padding-bottom: var(--espacamento-sm);
    margin-bottom: var(--espacamento-md);
  }

  /* Texto (cinza) dentro da ilha branca */
  .setting-section p {
    color: var(--cor-texto-secundario);
    margin-bottom: var(--espacamento-md);
  }

  textarea {
    width: 100%;
    margin-top: var(--espacamento-md);
    font-family: monospace;
    font-size: 0.8rem;
    padding: var(--espacamento-sm);
    border-radius: var(--raio-borda-sm);
    border: 1px solid var(--cor-borda);
  }

  /* Esconde o input de arquivo padrão */
  input[type='file'] {
    display: none;
  }

  /* Estiliza o 'label' para parecer um botão (verde) */
  .import-label {
    display: inline-block;
    padding: var(--espacamento-sm) var(--espacamento-md);
    background-color: var(--cor-sucesso);
    color: white;
    font-weight: 600;
    border-radius: var(--raio-borda-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .import-label:hover {
    opacity: 0.85;
  }

  .message {
    font-weight: 600;
    margin-top: var(--espacamento-md);
  }
  .error {
    color: var(--cor-perigo);
  }
  .success {
    color: var(--cor-sucesso);
  }
</style>
