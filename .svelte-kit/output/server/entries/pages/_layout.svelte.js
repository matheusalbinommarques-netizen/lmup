import 'clsx';
import {
  U as attr_class,
  V as stringify,
  W as unsubscribe_stores,
  X as store_get,
} from '../../chunks/index2.js';
import { g as getContext } from '../../chunks/context.js';
import '@sveltejs/kit/internal';
import '../../chunks/exports.js';
import '../../chunks/utils.js';
import '@sveltejs/kit/internal/server';
import '../../chunks/state.svelte.js';
const getStores = () => {
  const stores$1 = getContext('__svelte__');
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe,
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe,
    },
    /** @type {typeof updated} */
    updated: stores$1.updated,
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  },
};
function BottomNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    function isActive(path) {
      return (
        store_get(($$store_subs ??= {}), '$page', page).url.pathname === path
      );
    }
    $$renderer2.push(
      `<nav class="w-full h-[100px] bg-[url('/art/nav-wood-bar.png')] bg-contain bg-bottom bg-no-repeat flex justify-evenly items-end pb-6 px-6 drop-shadow-2xl"><a href="/" class="flex flex-col items-center justify-center w-20 group mb-2"><div${attr_class(
        `transition-transform duration-200 group-active:scale-95 ${stringify(isActive('/') ? '-translate-y-4 scale-110 filter drop-shadow-glow' : 'opacity-90 hover:-translate-y-1')}`,
        'svelte-1azti6v',
      )}><img src="/art/icones/icon-taverna.png" alt="Início" class="w-12 h-12"/></div></a> <a href="/missoes" class="flex flex-col items-center justify-center w-20 group mb-2"><div${attr_class(
        `transition-transform duration-200 group-active:scale-95 ${stringify(isActive('/missoes') ? '-translate-y-4 scale-110 filter drop-shadow-glow' : 'opacity-90 hover:-translate-y-1')}`,
        'svelte-1azti6v',
      )}><img src="/art/icones/icon-missoes.png" alt="Missões" class="w-12 h-12"/></div></a> <a href="/cla" class="flex flex-col items-center justify-center w-20 group mb-2"><div${attr_class(
        `transition-transform duration-200 group-active:scale-95 ${stringify(isActive('/cla') ? '-translate-y-4 scale-110 filter drop-shadow-glow' : 'opacity-90 hover:-translate-y-1')}`,
        'svelte-1azti6v',
      )}><img src="/art/icones/icon-cla.png" alt="Clã" class="w-12 h-12"/></div></a></nav>`,
    );
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function TopBar($$renderer) {
  $$renderer.push(
    `<header class="w-full h-[60px] flex items-center justify-between px-4 pt-4 z-20"><div class="w-8"></div> <h1 class="text-white font-bold text-lg drop-shadow-md font-serif tracking-wider">Reino de Matheus</h1> <a href="/config" aria-label="Configurações" title="Configurações" class="w-8 h-8 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-sm border border-white/10 transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></a></header>`,
  );
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(
    `<div class="fixed inset-0 bg-[url('/art/bg/bg-taverna.png')] bg-cover bg-center flex items-center justify-center overflow-hidden"><div class="relative h-[95vh] max-h-[900px] aspect-[9/19] max-w-[500px] flex items-center justify-center filter drop-shadow-2xl"><img src="/art/bg/bg-main-shell.webp" alt="Device Frame" class="absolute inset-0 w-full h-full object-contain z-50 pointer-events-none select-none"/> <div class="relative z-10 w-[92%] h-[97%] bg-black rounded-[55px] overflow-hidden flex flex-col"><div class="absolute inset-0 bg-[url('/art/bg/bg-global-dungeon.webp')] bg-cover bg-center opacity-100 z-0"></div> <div class="relative z-20 w-full h-full flex flex-col"><div class="flex-none z-30">`,
  );
  TopBar($$renderer);
  $$renderer.push(
    `<!----></div> <main class="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth py-4 no-scrollbar svelte-12qhfyh">`,
  );
  children($$renderer);
  $$renderer.push(`<!----></main> <div class="flex-none z-30">`);
  BottomNav($$renderer);
  $$renderer.push(`<!----></div></div></div></div></div>`);
}
export { _layout as default };
