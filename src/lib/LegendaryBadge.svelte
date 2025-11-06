<!-- src/lib/LegendaryBadge.svelte -->
<script lang="ts">
  // Props no estilo Svelte 5 / runes
  let {
    label = 'Insígnia lendária',
    subtitle = 'Conquista reservada aos heróis mais dedicados',
    size = 80, // tamanho em px da arte
  } = $props();
</script>

<section class="w-full">
  <div
    class="relative mx-auto flex max-w-sm items-center gap-4 overflow-hidden rounded-3xl border border-amber-400/60 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(251,191,36,0.55)]"
  >
    <!-- Glow dourado adicional -->
    <div
      class="pointer-events-none absolute -inset-10 opacity-40"
      aria-hidden="true"
    >
      <div
        class="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.45),_transparent_65%)]"
      ></div>
    </div>

    <!-- Ícone / arte da insígnia -->
    <div
      class="relative flex shrink-0 items-center justify-center rounded-2xl bg-slate-950/90 ring-2 ring-amber-300/80"
      style={`width:${size}px;height:${size}px;`}
    >
      <img
        src="/art/badges/badge-legendary.png"
        alt="Insígnia lendária"
        class="h-[80%] w-[80%] object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.9)]"
        loading="lazy"
      />
    </div>

    <!-- Texto -->
    <div class="relative min-w-0 flex-1">
      <p
        class="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-200/90"
      >
        Lendário
      </p>
      <h3 class="text-sm font-semibold text-amber-50">
        {label}
      </h3>
      <p class="mt-1 text-[0.7rem] text-amber-100/80">
        {subtitle}
      </p>
    </div>
  </div>
</section>
