<script lang="ts">
  type Align = 'left' | 'center';

  let {
    title,
    subtitle = '',
    iconSrc = '',
    iconAlt = '',
    align = 'left',
  } = $props<{
    title: string;
    subtitle?: string;
    iconSrc?: string;
    iconAlt?: string;
    align?: Align;
  }>();
</script>

<section class="w-full mb-6 flex justify-center">
  <div
    class="relative inline-block overflow-hidden rounded-2xl border border-amber-400/60
           bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950
           px-4 py-4 md:px-5 md:py-5
           shadow-[0_0_30px_rgba(251,191,36,0.35)]"
  >
    <!-- borda interna / glow -->
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden="true"
    >
      <div
        class="absolute inset-[8px] rounded-2xl border border-amber-300/25"
      ></div>
    </div>

    <!-- conteúdo -->
    <div
      class={`relative flex flex-col gap-2
              ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
    >
      <!-- TÍTULO -->
      <h1
        class="font-serif text-xl md:text-2xl font-extrabold
               bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400
               bg-clip-text text-transparent
               drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]"
      >
        {title}
      </h1>

      <!-- ÍCONE ENTRE TÍTULO E SUBTÍTULO -->
      {#if iconSrc}
        <div
          class="flex items-center justify-center rounded-full
                 border border-amber-400/60 bg-slate-950/80
                 shadow-[0_0_18px_rgba(251,191,36,0.6)] p-1.5"
        >
          <img
            src={iconSrc}
            alt={iconAlt || title}
            class="h-32 w-32 object-contain"
          />
        </div>
      {/if}

      <!-- SUBTÍTULO -->
      {#if subtitle}
        <p class="text-xs md:text-sm text-slate-300/85">
          {subtitle}
        </p>
      {/if}
    </div>
  </div>
</section>
