<script lang="ts">
  let nivel = 5;
  let xpAtual = 750;
  let xpProximoNivel = 1000;
  let progressoXP = (xpAtual / xpProximoNivel) * 100;

  // Dados atualizados conforme o Mockup
  let missoes = [
    {
      id: 1,
      titulo: 'Programação',
      raridade: 'legendary',
      bg: '/art/tasks/card-mission-legendary.png',
    },
    {
      id: 2,
      titulo: 'Marketing',
      raridade: 'epic',
      bg: '/art/tasks/card-mission-epic.png',
    },
    {
      id: 3,
      titulo: 'História',
      raridade: 'common',
      bg: '/art/tasks/card-mission-common.png',
    },
  ];
</script>

<div class="flex flex-col items-center w-full h-full space-y-6 px-4">
  <section class="flex flex-col items-center space-y-2 mt-8">
    <div class="relative">
      <img
        src="/art/hero-avatar-default.png"
        alt="Avatar"
        class="w-36 h-36 rounded-full border-[6px] border-[#1a1a1a] shadow-2xl relative z-10"
      />
      <div class="absolute -bottom-3 w-full flex justify-center z-20">
        <span
          class="bg-[#3a2f25] text-[#ffb74d] px-5 py-1 rounded-full text-base font-bold border-2 border-[#1a1a1a] shadow-lg"
        >
          Lvl {nivel}
        </span>
      </div>
    </div>
    <div class="w-[220px] flex flex-col items-center space-y-1 mt-6">
      <div
        class="w-full h-5 bg-black/60 rounded-full overflow-hidden border-2 border-[#3a2f25]/50 shadow-inner"
      >
        <div
          class="h-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"
          style="width: {progressoXP}%"
        ></div>
      </div>
      <span
        class="text-sm text-[#eec39a] font-semibold tracking-wider drop-shadow-sm"
        >{xpAtual} / {xpProximoNivel} XP</span
      >
    </div>
  </section>

  <div
    class="relative w-full max-w-[380px] flex justify-center items-center py-4 shrink-0"
  >
    <img
      src="/art/banner-missions-title.png"
      alt="Banner"
      class="w-[95%] object-contain drop-shadow-lg opacity-90"
    />
    <span
      class="absolute text-[#3a2f25] font-serif font-bold text-lg tracking-[0.15em] pt-1 opacity-80"
    >
      MISSÕES ATIVAS
    </span>
  </div>

  <section
    class="w-full flex flex-row flex-nowrap overflow-x-auto space-x-5 pl-2 pr-4 py-2 snap-x snap-mandatory no-scrollbar mask-fade-sides h-[140px] shrink-0"
  >
    {#each missoes as missao (missao.id)}
      <div
        class="relative flex-shrink-0 w-[200px] h-[120px] snap-center transition-transform active:scale-95 group"
      >
        <img
          src={missao.bg}
          alt="Fundo missão"
          class="absolute inset-0 w-full h-full object-contain drop-shadow-xl"
        />

        <div
          class="absolute inset-0 flex flex-col items-center justify-center pt-4 pb-2 px-6"
        >
          <h3
            class="text-[#3e2723] font-extrabold text-lg leading-tight w-full text-center mb-1"
          >
            {missao.titulo}
          </h3>
          <span
            class="text-[#5d4037] text-xs font-bold uppercase tracking-wider border-b border-[#5d4037]/50 opacity-70 group-hover:opacity-100 transition-opacity"
          >
            Ver missão
          </span>
        </div>
      </div>
    {/each}
    <div class="flex-shrink-0 w-4"></div>
  </section>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .mask-fade-sides {
    mask-image: linear-gradient(
      to right,
      transparent,
      black 5%,
      black 95%,
      transparent
    );
  }
</style>
