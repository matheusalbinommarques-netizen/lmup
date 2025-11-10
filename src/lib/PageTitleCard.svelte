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

<section class="w-full mb-6">
  <div
    class="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-amber-400/60
           bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950
           px-4 py-4 md:px-5 md:py-5
           shadow-[0_0_30px_rgba(251,191,36,0.35)]"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden="true"
    >
      <div
        class="absolute inset-[8px] rounded-2xl border border-amber-300/25"
      ></div>
    </div>

    <div
      class={`relative flex gap-3 md:gap-4 ${
        align === 'center'
          ? 'flex-col items-center text-center'
          : 'items-center'
      }`}
    >
      {#if iconSrc}
        <div
          class={`flex h-11 w-11 items-center justify-center rounded-xl
                   bg-slate-950/80 border border-amber-400/60
                   shadow-[0_0_18px_rgba(251,191,36,0.6)]
                   ${align === 'center' ? 'mb-1' : ''}`}
        >
          <img
            src={iconSrc}
            alt={iconAlt || title}
            class="h-7 w-7 object-contain"
          />
        </div>
      {/if}

      <div class={`space-y-1 ${align === 'center' ? '' : 'flex-1'}`}>
        <h1
          class="font-serif text-xl md:text-2xl font-extrabold
                 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400
                 bg-clip-text text-transparent
                 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]"
        >
          {title}
        </h1>

        {#if subtitle}
          <p class="text-xs md:text-sm text-slate-300/85">
            {subtitle}
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
