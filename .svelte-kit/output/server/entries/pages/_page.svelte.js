import {
  Y as attr_style,
  Z as ensure_array_like,
  _ as attr,
  V as stringify,
} from '../../chunks/index2.js';
import { e as escape_html } from '../../chunks/context.js';
function _page($$renderer) {
  let xpAtual = 750;
  let xpProximoNivel = 1e3;
  let progressoXP = (xpAtual / xpProximoNivel) * 100;
  let missoes = [
    {
      id: 1,
      titulo: 'Derrotar o Dragão Vermelho Ancião',
      raridade: 'legendary',
      bg: '/art/tasks/card-mission-legendary.png',
    },
    {
      id: 2,
      titulo: 'Encontrar a Espada Perdida',
      raridade: 'epic',
      bg: '/art/tasks/card-mission-epic.png',
    },
    {
      id: 3,
      titulo: 'Coletar 10 Ervas Medicinais na Floresta',
      raridade: 'common',
      bg: '/art/tasks/card-mission-common.png',
    },
    {
      id: 4,
      titulo: 'Falar com o Estalajadeiro',
      raridade: 'common',
      bg: '/art/tasks/card-mission-common.png',
    },
  ];
  $$renderer.push(
    `<div class="flex flex-col items-center w-full space-y-4"><section class="flex flex-col items-center space-y-2 mt-6"><div class="relative"><div class="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div> <img src="/art/hero-avatar-default.png" alt="Avatar" class="w-32 h-32 rounded-full border-[5px] border-[#1a1a1a] shadow-2xl relative z-10"/> <div class="absolute -bottom-3 w-full flex justify-center z-20"><span class="bg-[#3a2f25] text-[#ffb74d] px-4 py-1 rounded-full text-sm font-bold border-2 border-[#1a1a1a] shadow-lg">Lvl 5</span></div></div> <div class="w-[200px] flex flex-col items-center space-y-1 mt-5"><div class="w-full h-4 bg-black/60 rounded-full overflow-hidden border-2 border-[#3a2f25]/50"><div class="h-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"${attr_style(`width: ${stringify(progressoXP)}%`)}></div></div> <span class="text-xs text-gray-400 font-semibold tracking-wider">750 / 1000 XP</span></div></section> <div class="w-full max-w-[380px] flex justify-center py-2"><img src="/art/banner-missions-title.png" alt="Missões Ativas" class="w-[95%] object-contain drop-shadow-lg opacity-90"/></div> <section class="w-full flex flex-row flex-nowrap overflow-x-auto space-x-4 pl-4 pr-4 py-2 snap-x snap-mandatory no-scrollbar mask-fade-sides svelte-1uha8ag"><!--[-->`,
  );
  const each_array = ensure_array_like(missoes);
  for (
    let $$index = 0, $$length = each_array.length;
    $$index < $$length;
    $$index++
  ) {
    let missao = each_array[$$index];
    $$renderer.push(
      `<div class="relative flex-shrink-0 w-[240px] h-[100px] snap-center transition-transform active:scale-95"><img${attr('src', missao.bg)} alt="Fundo missão" class="absolute inset-0 w-full h-full object-contain drop-shadow-md"/> <div class="absolute inset-0 flex items-center pr-4 pl-10 pb-3"><p class="text-[#3e2723] font-bold text-sm leading-tight w-full text-center line-clamp-2"${attr('title', missao.titulo)}>${escape_html(missao.titulo)}</p></div></div>`,
    );
  }
  $$renderer.push(
    `<!--]--> <div class="flex-shrink-0 w-2"></div></section></div>`,
  );
}
export { _page as default };
