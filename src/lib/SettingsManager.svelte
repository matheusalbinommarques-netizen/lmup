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

    // Esses data-* batem com o que está no app.css
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

  // ---------- helper visual: botões com ícone oneoff ----------

  function toggleButtonClasses(on: boolean): string {
    return [
      'inline-flex items-center justify-center',
      'h-9 w-9 rounded-full',
      'transition-colors border',
      on
        ? 'bg-emerald-400/90 border-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.7)]'
        : 'bg-slate-800 border-slate-600 hover:bg-slate-700',
    ].join(' ');
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
      <!-- Cabeçalho das configurações (Cofre Arcano) -->
      <header class="mb-6">
        <div
          class="relative rounded-2xl border border-violet-700/70
                 bg-gradient-to-r from-black via-slate-950 to-violet-950
                 px-4 py-4 md:px-6 md:py-5
                 shadow-[0_0_40px_rgba(76,29,149,0.85)]"
        >
          <!-- moldura interna / brilho arcano -->
          <div
            class="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden="true"
          >
            <div
              class="absolute inset-[10px] rounded-2xl border border-violet-500/35"
            ></div>
            <div
              class="absolute -top-10 left-1/3 h-28 w-28 rounded-full bg-violet-500/18 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-12 right-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl"
            ></div>
          </div>

          <div class="relative space-y-3 text-center">
            <h2
              class="font-serif text-2xl md:text-3xl font-extrabold
           bg-gradient-to-r from-violet-100 via-violet-300 to-emerald-300
           bg-clip-text text-transparent
           drop-shadow-[0_0_22px_rgba(129,140,248,0.95)]"
            >
              Cofre Arcano
            </h2>

            <!-- Ícone exatamente do tamanho dele -->
            <div class="flex justify-center">
              <img
                src="/art/icones/icon-config.png"
                alt="Configurações"
                class="h-36 w-36 object-contain drop-shadow-[0_0_26px_rgba(139,92,246,0.9)]"
              />
            </div>

            <p class="mx-auto mt-1 max-w-xl text-xs text-slate-200/85">
              Guarde seu progresso em segurança, restaure seus dados quando
              precisar e ative encantamentos para deixar a experiência mais
              confortável — mesmo nas noites mais sombrias.
            </p>
          </div>
        </div>
      </header>

      <!-- Encantamento sombrio -->
      <div
        class="settings-subcard mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-200"
          >
            <img
              src="/art/icones/encantamento-sombrio.png"
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
          class={toggleButtonClasses(darkEnchantment)}
          onclick={() => (darkEnchantment = !darkEnchantment)}
          aria-pressed={darkEnchantment}
        >
          <img
            src="/art/icones/oneoff.png"
            alt="Alternar encantamento sombrio"
            class="h-16 w-16 object-contain"
          />
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
              class="mt-0.5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-200"
            >
              <img
                src="/art/icones/grimorio-backup.png"
                alt="Grimório de backup"
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
              class="mt-0.5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200"
            >
              <img
                src="/art/icones/ritual-restauracao.png"
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
              class="mt-0.5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/25 text-sky-200"
            >
              <img
                src="/art/icones/sincronia-estelar.png"
                alt="Sincronia estelar"
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
        <!-- Título estilizado -->
        <div
          class="relative rounded-2xl border border-emerald-500/70
                 bg-gradient-to-r from-black via-emerald-950 to-slate-950
                 px-4 py-3 md:px-6 md:py-4
                 shadow-[0_0_32px_rgba(16,185,129,0.65)]"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          >
            <div
              class="absolute inset-[8px] rounded-2xl border border-emerald-400/30"
            ></div>
            <div
              class="absolute -top-8 left-1/4 h-20 w-20 rounded-full bg-emerald-400/15 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-10 right-4 h-20 w-20 rounded-full bg-lime-300/10 blur-3xl"
            ></div>
          </div>

          <div class="relative space-y-1 text-center">
            <h3
              class="font-serif text-lg md:text-xl font-extrabold
                     bg-gradient-to-r from-emerald-100 via-emerald-300 to-lime-300
                     bg-clip-text text-transparent
                     drop-shadow-[0_0_18px_rgba(16,185,129,0.9)]"
            >
              Neurodiversidade
            </h3>

            <p class="text-[0.7rem] text-slate-200/85">
              Ative modos especiais para reduzir estímulos, aumentar a
              legibilidade e moldar o reino ao seu jeito.
            </p>
          </div>
        </div>

        <!-- Cards -->
        <div class="space-y-3">
          <!-- Modo foco -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p
                class="text-[1rem] font-semibold uppercase tracking-[0.18em]
                   bg-gradient-to-r from-emerald-100 via-emerald-300 to-lime-200
                   bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              >
                Modo foco
              </p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Reduz distrações e animações, deixando a interface mais calma
                para longas sessões.
              </p>
            </div>
            <button
              type="button"
              class={toggleButtonClasses(focusMode)}
              onclick={toggleFocusMode}
              aria-pressed={focusMode}
            >
              <img
                src="/art/icones/oneoff.png"
                alt="Alternar modo foco"
                class="h-20 w-20 object-contain"
              />
              <span class="sr-only">Alternar modo foco</span>
            </button>
          </div>

          <!-- Texto maior -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p
                class="text-[1rem] font-semibold uppercase tracking-[0.18em]
                   bg-gradient-to-r from-sky-100 via-sky-300 to-cyan-200
                   bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]"
              >
                Texto maior
              </p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Aumenta a legibilidade dos textos principais e labels
                importantes pelo reino.
              </p>
            </div>
            <button
              type="button"
              class={toggleButtonClasses(largeText)}
              onclick={toggleLargeText}
              aria-pressed={largeText}
            >
              <img
                src="/art/icones/oneoff.png"
                alt="Alternar texto maior"
                class="h-20 w-20 object-contain"
              />
              <span class="sr-only">Alternar texto maior</span>
            </button>
          </div>

          <!-- Estímulos suaves -->
          <div
            class="settings-subcard flex items-center justify-between gap-3 rounded-2xl border border-purple-500/60 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 px-4 py-3"
          >
            <div class="space-y-1">
              <p
                class="text-[1rem] font-semibold uppercase tracking-[0.18em]
                   bg-gradient-to-r from-fuchsia-100 via-fuchsia-300 to-purple-200
                   bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]"
              >
                Estímulos suaves
              </p>
              <p class="text-xs text-slate-300/90 max-w-xs">
                Diminui brilhos e efeitos mais intensos, deixando o reino mais
                gentil aos sentidos.
              </p>
            </div>
            <button
              type="button"
              class={toggleButtonClasses(lowStimulus)}
              onclick={toggleLowStimulus}
              aria-pressed={lowStimulus}
            >
              <img
                src="/art/icones/oneoff.png"
                alt="Alternar estímulos suaves"
                class="h-20 w-20 object-contain"
              />
              <span class="sr-only">Alternar estímulos suaves</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
