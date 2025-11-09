<!-- src/lib/SettingsManager.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

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

    // esses data-* batem com o que já está no app.css
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

  // ---------- backup / restore (via import dinâmico pra não quebrar SSR) ----------

  async function handleExport() {
    if (isExporting || !browser) return;
    isExporting = true;

    try {
      const { exportData } = await import('$services/backupService');
      await exportData();
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
    if (!browser) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    isImporting = true;

    try {
      const { importData } = await import('$services/backupService');
      await importData(file);
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

  // ---------- helpers visuais dos switches ----------

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
            class="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 text-violet-200"
          >
            <img
              src="art/icones/encantamento-sombrio.png"
              alt="Encantamento sombrio"
              class="h-20 w-20 object-contain"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-white">
                Encantamento sombrio
              </p>
              <span
                class="rounded-full border border-violet-400/60 bg-violet-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-200"
              >
                Visual
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-300/80 max-w-md">
              Uma camada extra de magia estética, deixando o reino ainda mais
              imersivo. Por enquanto é apenas um encantamento visual interno.
            </p>
          </div>
        </div>

        <button
          type="button"
          class={switchClasses(darkEnchantment)}
          onclick={() => (darkEnchantment = !darkEnchantment)}
        >
          <span class={knobClasses(darkEnchantment)} aria-hidden="true"></span>
          <span class="sr-only">Alternar encantamento sombrio</span>
        </button>
      </div>

      <!-- Seção de backup -->
      <div class="space-y-4">
        <!-- Linha 1: Grimório de backup -->
        <div
          class="settings-subcard flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 text-violet-200"
            >
              <img
                src="art/icones/grimorio-backup.png"
                alt="Encantamento sombrio"
                class="h-20 w-20 object-contain"
              />
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
                Aprisiona as memórias do seu reino num grimório em
                <code>.json</code>, para que possa levar e restaurar em qualquer
                lugar.
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
              class="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200"
            >
              <img
                src="art/icones/ritual-restauracao.png"
                alt="Ritual de restauração"
                class="h-20 w-20 object-contain"
              />
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
              class="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/25 text-sky-200"
            >
              <img
                src="art/icones/sincronia-estelar.png"
                alt="Encantamento sombrio"
                class="h-20 w-20 object-contain"
              />
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

      <!-- Seção de neurodiversidade -->
      <div class="mt-8 space-y-4">
        <h3
          class="text-sm font-semibold text-slate-200 flex items-center gap-2"
        >
          <span class="text-base">🧠</span>
          Neurodiversidade
        </h3>

        <div class="grid gap-3 md:grid-cols-3">
          <!-- Modo foco -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-100">Modo foco</p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Reduz distrações e animações, deixando a interface mais calma
                para longas sessões.
              </p>
            </div>
            <button
              type="button"
              class={switchClasses(focusMode)}
              onclick={toggleFocusMode}
            >
              <span class={knobClasses(focusMode)} aria-hidden="true"></span>
              <span class="sr-only">Alternar modo foco</span>
            </button>
          </div>

          <!-- Texto maior -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-100">Texto maior</p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Aumenta a legibilidade dos textos principais e labels
                importantes pelo reino.
              </p>
            </div>
            <button
              type="button"
              class={switchClasses(largeText)}
              onclick={toggleLargeText}
            >
              <span class={knobClasses(largeText)} aria-hidden="true"></span>
              <span class="sr-only">Alternar texto maior</span>
            </button>
          </div>

          <!-- Estímulos suaves -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-purple-500/60 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-xs font-semibold text-slate-100">
                Estímulos suaves
              </p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Diminui brilhos e efeitos mais intensos, deixando o reino mais
                gentil aos sentidos.
              </p>
            </div>
            <button
              type="button"
              class={switchClasses(lowStimulus)}
              onclick={toggleLowStimulus}
            >
              <span class={knobClasses(lowStimulus)} aria-hidden="true"></span>
              <span class="sr-only">Alternar estímulos suaves</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
