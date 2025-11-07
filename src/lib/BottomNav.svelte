<script lang="ts">
  import { page } from '$app/stores';

  function isActive(path: string): boolean {
    return ($page.url.pathname as string) === path;
  }
</script>

<!-- 
    - h-[80px]: Uma altura fixa menor.
    - bg-cover: Faz a imagem cobrir a área sem distorcer (pode cortar um pouco, o que é melhor).
    - bg-bottom: Garante que a parte de baixo (curvada) da madeira apareça.
    - items-center: Centraliza os ícones verticalmente na div.
-->
<nav
  class="relative w-full h-[80x] bg-[url('/art/nav-wood-bar.png')] bg-cover bg-bottom bg-no-repeat
               flex justify-evenly items-center px-4 z-30 shrink-0"
>
  <!-- Início -->
  <a
    href="/"
    class="flex flex-col items-center justify-center group"
    aria-label="Início"
  >
    <div
      class="transition-all duration-200 {isActive('/')
        ? 'scale-110 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]'
        : 'opacity-90 hover:scale-105'}"
    >
      <img
        src="/art/icones/icon-taverna.png"
        alt="Início"
        class="w-[60px] h-[60px]"
      />
    </div>
  </a>

  <!-- Missões -->
  <a
    href="/missoes"
    class="flex flex-col items-center justify-center group"
    aria-label="Missões"
  >
    <div
      class="transition-all duration-200 {isActive('/missoes')
        ? 'scale-110 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]'
        : 'opacity-90 hover:scale-105'}"
    >
      <img
        src="/art/icones/icon-missoes.png"
        alt="Missões"
        class="w-[60px] h-[60px]"
      />
    </div>
  </a>

  <!-- Clã -->
  <a
    href="/cla"
    class="flex flex-col items-center justify-center group"
    aria-label="Clã"
  >
    <div
      class="transition-all duration-200 {isActive('/cla')
        ? 'scale-110 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]'
        : 'opacity-90 hover:scale-105'}"
    >
      <img src="/art/icones/icon-cla.png" alt="Clã" class="w-[60px] h-[60px]" />
    </div>
  </a>
</nav>
