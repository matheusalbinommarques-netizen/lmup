<!-- src/lib/SettingsManager.svelte -->
<script lang="ts">
  import { exportarDados, importarDados } from '../services/backupService.js';
  import BaseButton from './BaseButton.svelte';

  let fileInput: HTMLInputElement | null = null;

  // ações de backup
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

    // permite escolher o mesmo arquivo de novo
    target.value = '';
  }

  // “Encantamento sombrio” – por enquanto só visual
  let darkEnchant = $state(true);

  function toggleDarkEnchant() {
    darkEnchant = !darkEnchant;
  }
</script>

<section class="w-full py-8">
  <div class="mx-auto max-w-3xl px-4 pb-24">
    <div
      class={`relative overflow-hidden rounded-3xl border
        ${
          darkEnchant
            ? 'border-violet-600/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_70px_rgba(129,140,248,0.7)]'
            : 'border-amber-400/70 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-[0_0_70px_rgba(251,191,36,0.6)]'
        }`}
    >
      <!-- brilhos / moldura interna -->
      <div
        class="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      >
        <div
          class="absolute inset-[-40%] bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.85),_transparent_55%)]"
        ></div>
        <div
          class="absolute inset-[-40%] bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.35),_transparent_60%)]"
        ></div>
        <div
          class="absolute inset-[10px] rounded-3xl border border-violet-500/35"
        ></div>
      </div>

      <div class="relative px-6 py-6 md:px-8 md:py-8 space-y-7">
        <!-- título / header -->
        <header class="space-y-2 text-center md:text-left">
          <p
            class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-violet-300/80"
          >
            Cofre arcano
          </p>
          <h1
            class="text-2xl md:text-3xl font-extrabold text-slate-50 drop-shadow"
          >
            Configurações &amp; Backup
          </h1>
          <p class="mx-auto max-w-xl text-xs md:text-sm text-violet-100/85">
            Guarde seu progresso em segurança, restaure seus dados quando
            precisar e prepare-se para futuras melhorias mágicas.
          </p>
        </header>

        <!-- Encantamento sombrio (toggle visual) -->
        <div
          class="flex flex-col items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-black/30 px-4 py-3 sm:flex-row"
        >
          <div class="text-center sm:text-left">
            <div
              class="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-violet-200"
            >
              Encantamento sombrio
            </div>
            <p class="mt-1 text-xs text-violet-100/80 max-w-xs">
              Ajusta o brilho arcano deste cofre. (Somente visual por enquanto)
            </p>
          </div>

          <button
            type="button"
            class={`relative inline-flex h-8 w-14 items-center rounded-full border px-1 transition-all duration-300 ease-out
              ${
                darkEnchant
                  ? 'border-violet-300 bg-black/70 shadow-[0_0_18px_rgba(167,139,250,0.8)]'
                  : 'border-amber-200 bg-slate-800/70 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
              }`}
            role="switch"
            aria-checked={darkEnchant ? 'true' : 'false'}
            aria-label={darkEnchant
              ? 'Desativar encantamento sombrio'
              : 'Ativar encantamento sombrio'}
            onclick={toggleDarkEnchant}
          >
            <span
              class={`h-6 w-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_14px_rgba(251,191,36,0.9)] transition-transform duration-300 ease-out
                ${darkEnchant ? 'translate-x-6' : 'translate-x-0'}`}
            ></span>
          </button>
        </div>

        <!-- “slots” de itens / cartas -->
        <div class="space-y-4 pt-1">
          <!-- Grimório de backup (exportar) -->
          <div
            class="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-violet-500/40 bg-gradient-to-r from-slate-950/90 via-slate-900/95 to-slate-950/90 px-4 py-4"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 ring-2 ring-violet-400/70 shadow-[0_0_20px_rgba(129,140,248,0.9)]"
            >
              <span class="text-lg">📜</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 class="text-sm font-semibold text-slate-50">
                  Grimório de backup
                </h2>
                <span
                  class="rounded-full bg-violet-500/20 px-2 py-[1px] text-[0.65rem] font-medium uppercase tracking-[0.18em] text-violet-200"
                  >Raro</span
                >
              </div>
              <p class="mt-1 text-xs text-violet-100/85">
                Gera um arquivo <code>.json</code> com todas as suas áreas de foco,
                missões e progresso de XP.
              </p>
            </div>

            <BaseButton
              variant="primary"
              type="button"
              onclick={handleExportClick}
            >
              Exportar dados
            </BaseButton>
          </div>

          <!-- Ritual de restauração (importar) -->
          <div
            class="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-slate-950/95 via-slate-900 to-slate-950/90 px-4 py-4"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 ring-2 ring-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.9)]"
            >
              <span class="text-lg">🕯️</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 class="text-sm font-semibold text-slate-50">
                  Ritual de restauração
                </h2>
                <span
                  class="rounded-full bg-emerald-500/20 px-2 py-[1px] text-[0.65rem] font-medium uppercase tracking-[0.18em] text-emerald-200"
                  >Épico</span
                >
              </div>
              <p class="mt-1 text-xs text-emerald-100/85">
                Importe um arquivo <code>.json</code> criado pelo backup para trazer
                de volta suas áreas, missões e XP.
              </p>
            </div>

            <BaseButton
              variant="success"
              type="button"
              onclick={handleImportClick}
            >
              Importar backup
            </BaseButton>
          </div>

          <!-- Sincronia estelar (placeholder “em breve”) -->
          <div
            class="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-600/60 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 px-4 py-4 opacity-60"
          >
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 ring-2 ring-slate-500/80"
            >
              <span class="text-lg">☁️</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 class="text-sm font-semibold text-slate-200">
                  Sincronia estelar
                </h2>
                <span
                  class="rounded-full bg-slate-600/40 px-2 py-[1px] text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-200"
                  >Em breve</span
                >
              </div>
              <p class="mt-1 text-xs text-slate-300/80">
                Futuramente você poderá sincronizar seu progresso com a nuvem
                para nunca perder o seu reino de aprendizado.
              </p>
            </div>
          </div>
        </div>

        <!-- input de arquivo escondido (usado pelo importar) -->
        <input
          class="hidden"
          type="file"
          accept="application/json"
          bind:this={fileInput}
          onchange={handleFileChange}
        />
      </div>
    </div>
  </div>
</section>
