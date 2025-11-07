<script lang="ts">
  import { page } from '$app/stores';

  let currentPath = $derived($page.url.pathname);

  const mainLinks = [
    { href: '/', label: 'Taverna', icon: '/art/icones/icon-taverna.png' },
    {
      href: '/missoes',
      label: 'Missões',
      icon: '/art/icones/icon-missoes.png',
    },
    { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
  ];
</script>

<aside
  class="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4"
>
  <div class="flex items-center gap-3 px-4 py-6 mb-6">
    <img
      src="/art/icones/logo lmu.png"
      alt="Logo"
      class="w-12 h-12 drop-shadow-lg filter brightness-110"
    />
    <div>
      <h1 class="font-bold text-slate-100 leading-tight">Level Me Up</h1>
      <p class="text-xs text-slate-400">Painel do Herói</p>
    </div>
  </div>

  <nav class="flex flex-col gap-2 flex-1">
    {#each mainLinks as link (link.href)}
      {@const active = currentPath === link.href}
      <a
        href={link.href}
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                       {active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}"
      >
        <img
          src={link.icon}
          alt={link.label}
          class="w-8 h-8 transition-transform duration-200 group-hover:scale-110
                           {active
            ? 'filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
            : 'opacity-80 grayscale-[30%]'}"
        />
        <span class="font-medium">{link.label}</span>
        {#if active}
          <div
            class="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--primary)]"
          ></div>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="mt-auto pt-4 border-t border-slate-800/50">
    <a
      href="/config"
      class="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                   {currentPath === '/config'
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}"
    >
      <img
        src="/art/icones/icon-config.png"
        alt="Configurações"
        class="w-8 h-8 transition-transform duration-200 group-hover:scale-110
                       {currentPath === '/config'
          ? 'filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
          : 'opacity-80 grayscale-[30%]'}"
      />
      <span class="font-medium">Configurações</span>
    </a>
  </div>

  <div class="text-xs text-slate-600 px-4 pt-4 text-center">v0.2.0 Alpha</div>
</aside>
