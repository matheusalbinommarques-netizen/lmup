<script lang="ts">
  // Svelte 5: Usando a rune $props() para definir props
  let { nomeUsuario = 'Matheus' } = $props();
</script>

<header
  class="relative w-full h-[70px] flex items-center px-6 pt-6 z-30 shrink-0"
>
  <div
    class="absolute left-1/2 -translate-x-1/2 pt-6 text-center w-full pointer-events-none"
  >
    <h1
      class="text-[#eec39a] font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-serif tracking-wider"
      style="text-shadow: 0px 0px 8px rgba(0,0,0,0.8);"
    >
      Reino do {nomeUsuario}
    </h1>
  </div>

  <a
    href="/config"
    aria-label="Configurações"
    class="absolute right-8 pt-6 opacity-80 hover:opacity-100 transition-opacity active:scale-95 z-40"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-7 w-7 text-[#eec39a] drop-shadow-lg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  </a>
</header>
