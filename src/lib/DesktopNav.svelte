<script lang="ts">
  import { page } from '$app/stores';
  // CORREÇÃO: Usar '$page' para ler o valor do store
  let pathname = $derived($page.url.pathname);
</script>

<aside
  class="w-64 bg-slate-900/80 border-r border-slate-800/50 p-4 flex-col gap-6 hidden md:flex"
>
  <a href="/" class="flex items-center gap-3 px-2">
    <img src="/art/icones/logo lmu.png" alt="Logo LMU" class="w-12 h-12" />
    <span class="text-xl font-bold text-slate-200 font-serif">Level Me Up</span>
  </a>

  <nav class="flex flex-col gap-2">
    <a
      href="/"
      class="flex items-center gap-3 p-3 rounded-lg {pathname === '/'
        ? 'bg-primary/20 text-primary'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} transition-colors"
    >
      <img src="/art/icones/icon-taverna.png" alt="Taverna" class="w-6 h-6" />
      <span class="font-medium">Taverna</span>
    </a>
    <a
      href="/missoes"
      class="flex items-center gap-3 p-3 rounded-lg {pathname === '/missoes'
        ? 'bg-primary/20 text-primary'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} transition-colors"
    >
      <img src="/art/icones/icon-missoes.png" alt="Missões" class="w-6 h-6" />
      <span class="font-medium">Missões</span>
    </a>

    <a
      href="/santuario"
      class="flex items-center gap-3 p-3 rounded-lg {pathname === '/santuario'
        ? 'bg-primary/20 text-primary'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} transition-colors"
    >
      <img
        src="/art/icones/icon-leaf-eco.png"
        alt="Santuário"
        class="w-6 h-6"
      />
      <span class="font-medium">Santuário</span>
    </a>
    <a
      href="/config"
      class="flex items-center gap-3 p-3 rounded-lg {pathname === '/config'
        ? 'bg-primary/20 text-primary'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} transition-colors"
    >
      <img src="/art/icones/icon-config.png" alt="Config." class="w-6 h-6" />
      <span class="font-medium">Configurações</span>
    </a>
  </nav>

  <div class="mt-auto text-center p-2">
    <span class="text-xs text-slate-600">v0.0.0 - Alpha</span>
  </div>
</aside>
