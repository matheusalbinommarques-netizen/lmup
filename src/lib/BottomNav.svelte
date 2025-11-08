<script lang="ts">
  import { page } from '$app/stores';
  // CORREÇÃO: Usar '$page' para ler o valor do store
  let pathname = $derived($page.url.pathname);
</script>

<nav
  class="bg-slate-900 border-t border-slate-800/50 p-2 flex justify-around items-center"
>
  <a
    href="/"
    class="flex flex-col items-center p-2 rounded-lg {pathname === '/'
      ? 'text-primary'
      : 'text-slate-400'}"
  >
    <img src="/art/icones/icon-taverna.png" alt="Taverna" class="w-6 h-6" />
    <span class="text-xs font-medium">Taverna</span>
  </a>
  <a
    href="/missoes"
    class="flex flex-col items-center p-2 rounded-lg {pathname === '/missoes'
      ? 'text-primary'
      : 'text-slate-400'}"
  >
    <img src="/art/icones/icon-missoes.png" alt="Missões" class="w-6 h-6" />
    <span class="text-xs font-medium">Missões</span>
  </a>

  <a
    href="/santuario"
    class="flex flex-col items-center p-2 rounded-lg {pathname === '/santuario'
      ? 'text-primary'
      : 'text-slate-400'}"
  >
    <img src="/art/icones/icon-leaf-eco.png" alt="Santuário" class="w-6 h-6" />
    <span class="text-xs font-medium">Santuário</span>
  </a>
  <a
    href="/config"
    class="flex flex-col items-center p-2 rounded-lg {pathname === '/config'
      ? 'text-primary'
      : 'text-slate-400'}"
  >
    <img src="/art/icones/icon-config.png" alt="Config." class="w-6 h-6" />
    <span class="text-xs font-medium">Config.</span>
  </a>
</nav>
