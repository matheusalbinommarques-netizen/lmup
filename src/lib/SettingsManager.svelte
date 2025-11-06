<!-- src/lib/SettingsManager.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { exportarDados, importarDados } from '../services/backupService.js';

  type NeuroPrefs = {
    focusMode: boolean;
    largeText: boolean;
    lowStimulus: boolean;
  };

  const NEURO_KEY = 'lmup:neuro-prefs';

  // estados locais (runes)
  let isExporting = $state(false);
  let isImporting = $state(false);

  // Encantamento sombrio – por enquanto só visual (não mexe em CSS global)
  let darkEnchantment = $state(false);

  // Modos de neurodiversidade
  let focusMode = $state(false);
  let largeText = $state(false);
  let lowStimulus = $state(false);

  let fileInput: HTMLInputElement | null = null;

  // ---------- helpers de neurodiversidade ----------

  function getNeuroPrefs(): NeuroPrefs {
    return {
      focusMode,
      largeText,
      lowStimulus,
    };
  }

  function applyNeuroPrefs(prefs: NeuroPrefs) {
    if (!browser) return;
    const root = document.documentElement;

    root.dataset.neuroFocus = prefs.focusMode ? 'true' : 'false';
    root.dataset.neuroLargeText = prefs.largeText ? 'true' : 'false';
    root.dataset.neuroLowStimulus = prefs.lowStimulus ? 'true' : 'false';
  }

  function saveNeuroPrefs(prefs: NeuroPrefs) {
    if (!browser) return;
    localStorage.setItem(NEURO_KEY, JSON.stringify(prefs));
  }

  onMount(() => {
    if (!browser) return;

    const raw = localStorage.getItem(NEURO_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw) as Partial<NeuroPrefs>;
        focusMode = !!stored.focusMode;
        largeText = !!stored.largeText;
        lowStimulus = !!stored.lowStimulus;
      } catch {
        // se der ruim no parse, ignora e usa defaults
      }
    }

    applyNeuroPrefs(getNeuroPrefs());
  });

  function toggleFocusMode() {
    focusMode = !focusMode;
    const prefs = getNeuroPrefs();
    applyNeuroPrefs(prefs);
    saveNeuroPrefs(prefs);
  }

  function toggleLargeText() {
    largeText = !largeText;
    const prefs = getNeuroPrefs();
    applyNeuroPrefs(prefs);
    saveNeuroPrefs(prefs);
  }

  function toggleLowStimulus() {
    lowStimulus = !lowStimulus;
    const prefs = getNeuroPrefs();
    applyNeuroPrefs(prefs);
    saveNeuroPrefs(prefs);
  }

  // ---------- backup / restore ----------

  async function handleExport() {
    if (isExporting) return;
    isExporting = true;
    try {
      // exportarDados já cuida de gerar o arquivo .json
      await exportarDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      isExporting = false;
    }
  }

  function openImportDialog() {
    if (isImporting || !browser) return;
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  async function handleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    isImporting = true;

    try {
      // importarDados espera um File, então passamos o File direto
      await importarDados(file);
      input.value = '';
      alert(
        'Backup importado com sucesso! Recarregue a página para ver as mudanças.',
      );
    } catch (err) {
      console.error(err);
      alert(
        'Erro ao importar backup. Verifique o arquivo .json e tente novamente.',
      );
    } finally {
      isImporting = false;
    }
  }

  // switch genérico para reuso
  function switchClasses(enabled: boolean) {
    return enabled
      ? 'inline-flex h-7 w-12 items-center rounded-full bg-emerald-400/90 px-1 transition-colors'
      : 'inline-flex h-7 w-12 items-center rounded-full bg-slate-700/80 px-1 transition-colors';
  }

  function knobClasses(enabled: boolean) {
    return enabled
      ? 'h-5 w-5 translate-x-5 rounded-full bg-slate-950 shadow transition-transform'
      : 'h-5 w-5 translate-x-0 rounded-full bg-slate-300 shadow transition-transform';
  }
</script>

<section class="w-full mb-8">
  <div class="config-card mx-auto max-w-3xl overflow-hidden relative">
    <!-- brilho roxo externo -->
    <div
      class="pointer-events-none absolute -inset-px bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_transparent_60%)] opacity-70"
      aria-hidden="true"
    ></div>

    <div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8">
      <!-- Cabeçalho das configurações dentro de card azul (estilo Sincronia) -->
      <header class="mb-6">
        <div
          class="settings-subcard rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 text-center shadow-[0_0_40px_rgba(56,189,248,0.55)]"
        >
          <h2 class="text-2xl md:text-3xl font-extrabold text-sky-50">
            Configurações &amp; Backup
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-xs text-slate-200/85">
            Guarde seu progresso em segurança, restaure seus dados quando
            precisar e ative encantamentos para deixar a experiência mais
            confortável.
          </p>
        </div>
      </header>

      <!-- Encantamento sombrio -->
      <div
        class="settings-subcard mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/25 text-violet-100"
          >
            🕯️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-white">
                Encantamento sombrio
              </p>
              <span
                class="rounded-full border border-violet-300/70 bg-violet-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-100"
              >
                Em breve
              </span>
            </div>
            <p class="text-xs text-slate-300/80 max-w-md">
              Encanta o seu reino com as trevas ou com a luz. Use com cuidado.
            </p>
          </div>
        </div>

        <button
          type="button"
          class={switchClasses(darkEnchantment)}
          role="switch"
          aria-checked={darkEnchantment}
          aria-label="Ativar ou desativar encantamento sombrio"
          onclick={() => (darkEnchantment = !darkEnchantment)}
        >
          <span class={knobClasses(darkEnchantment)}></span>
        </button>
      </div>

      <!-- Linha 1: Grimório de backup -->
      <div class="space-y-3">
        <div
          class="settings-subcard flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200"
            >
              📜
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-white">
                  Grimório de backup
                </p>
                <span
                  class="rounded-full border border-violet-400/60 bg-violet-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-200"
                >
                  Raro
                </span>
              </div>
              <p class="text-xs text-slate-300/80 max-w-md">
                Aprisiona as memórias do seu reino num grimório em <code
                  >.json</code
                >, para que possa levar e restaurar em qualquer lugar.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-400 disabled:opacity-60"
            onclick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Gerando...' : 'Exportar dados'}
          </button>
        </div>

        <!-- Linha 2: Ritual de restauração -->
        <div
          class="settings-subcard flex flex-col gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(16,185,129,0.55)] md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200"
            >
              🧪
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-white">
                  Ritual de restauração
                </p>
                <span
                  class="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-emerald-200"
                >
                  Épico
                </span>
              </div>
              <p class="text-xs text-slate-300/80 max-w-md">
                Importe um grimório em <code>.json</code> criado por um herói, para
                trazer de volta as memórias de seu reino, com suas áreas, missões
                e XP.
              </p>
              <p class="mt-1 text-[0.65rem] text-amber-200/80">
                Atenção: este ritual substituirá o reino atual pelo do grimório
                utilizado. E este será jogado em trevas sombrias e ranger de
                dentes!.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-60"
            onclick={openImportDialog}
            disabled={isImporting}
          >
            {isImporting ? 'Importando...' : 'Importar backup'}
          </button>

          <input
            bind:this={fileInput}
            type="file"
            accept="application/json"
            class="hidden"
            onchange={handleFileSelected}
          />
        </div>

        <!-- Linha 3: Sincronia estelar (placeholder + botão Sincronizar) -->
        <div
          class="settings-subcard flex flex-col gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/25 text-sky-200"
            >
              ☁️
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-white">
                  Sincronia estelar
                </p>
                <span
                  class="rounded-full border border-sky-400/60 bg-sky-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-sky-200"
                >
                  Em breve
                </span>
              </div>
              <p class="text-xs text-slate-200/85 max-w-md">
                Futuramente você poderá sincronizar seu reino com as estrelas e
                o cosmos, para nunca perder o seu reino e legado de aprendizado
                e desenvolvimento.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-60"
            disabled
            title="Sincronização com a nuvem será habilitada em breve"
          >
            Sincronizar
          </button>
        </div>
      </div>

      <!-- Divider entre Configurações e Neurodiversidade -->
      <div
        class="my-6 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"
      ></div>

      <!-- Neurodiversidade -->
      <div class="space-y-4">
        <!-- Card verde do título Neurodiversidade -->
        <div
          class="rounded-2xl border border-emerald-500/70 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 px-4 py-4 text-center shadow-[0_0_45px_rgba(16,185,129,0.85)]"
        >
          <h2 class="text-2xl md:text-3xl font-extrabold text-emerald-100">
            Neurodiversidade
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-xs text-emerald-50/80">
            Ajustes suaves para foco, legibilidade e redução de estímulos
            visuais. Pense nisso como encantamentos opcionais para o seu
            cérebro.
          </p>
        </div>

        <!-- Card 1: Modo foco -->
        <div
          class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold text-white">Modo foco</p>
            <p class="text-xs text-slate-300/80 max-w-md">
              Reduz brilhos e sombras intensas para diminuir distrações visuais.
            </p>
          </div>

          <button
            type="button"
            class={switchClasses(focusMode)}
            role="switch"
            aria-checked={focusMode}
            aria-label="Ativar ou desativar modo foco"
            onclick={toggleFocusMode}
          >
            <span class={knobClasses(focusMode)}></span>
          </button>
        </div>

        <!-- Card 2: Texto maior -->
        <div
          class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold text-white">Texto maior</p>
            <p class="text-xs text-slate-300/80 max-w-md">
              Aumenta levemente o tamanho base das fontes para leitura mais
              confortável.
            </p>
          </div>

          <button
            type="button"
            class={switchClasses(largeText)}
            role="switch"
            aria-checked={largeText}
            aria-label="Ativar ou desativar texto maior"
            onclick={toggleLargeText}
          >
            <span class={knobClasses(largeText)}></span>
          </button>
        </div>

        <!-- Card 3: Estímulos suaves -->
        <div
          class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold text-white">Estímulos suaves</p>
            <p class="text-xs text-slate-300/80 max-w-md">
              Encurta animações e transições para que nada fique piscando por
              muito tempo na tela.
            </p>
          </div>

          <button
            type="button"
            class={switchClasses(lowStimulus)}
            role="switch"
            aria-checked={lowStimulus}
            aria-label="Ativar ou desativar estímulos suaves"
            onclick={toggleLowStimulus}
          >
            <span class={knobClasses(lowStimulus)}></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
