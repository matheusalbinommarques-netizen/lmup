import { f as h, a as m } from '../chunks/CTOClj_W.js';
import {
  G as _,
  ak as z,
  z as j,
  B as k,
  C as $,
  D as l,
  E as a,
  F as t,
  a4 as C,
} from '../chunks/B9t7ERLA.js';
import { B, s as M, a as T } from '../chunks/bGr8mffb.js';
import { s as b } from '../chunks/E1N5lFGC.js';
import { s as E } from '../chunks/CKhwVIJ_.js';
function F(e, s, ...r) {
  var c = new B(e);
  _(() => {
    const o = s() ?? null;
    c.ensure(o, o && ((n) => o(n, ...r)));
  }, z);
}
const S = !0,
  L = Object.freeze(
    Object.defineProperty(
      { __proto__: null, prerender: S },
      Symbol.toStringTag,
      { value: 'Module' },
    ),
  ),
  A = () => {
    const e = E;
    return {
      page: { subscribe: e.page.subscribe },
      navigating: { subscribe: e.navigating.subscribe },
      updated: e.updated,
    };
  },
  N = {
    subscribe(e) {
      return A().page.subscribe(e);
    },
  };
var R = h(
  `<nav class="w-full h-[100px] bg-[url('/art/nav-wood-bar.png')] bg-contain bg-bottom bg-no-repeat flex justify-evenly items-end pb-6 px-6 drop-shadow-2xl"><a href="/" class="flex flex-col items-center justify-center w-20 group mb-2"><div><img src="/art/icones/icon-taverna.png" alt="Início" class="w-12 h-12"/></div></a> <a href="/missoes" class="flex flex-col items-center justify-center w-20 group mb-2"><div><img src="/art/icones/icon-missoes.png" alt="Missões" class="w-12 h-12"/></div></a> <a href="/cla" class="flex flex-col items-center justify-center w-20 group mb-2"><div><img src="/art/icones/icon-cla.png" alt="Clã" class="w-12 h-12"/></div></a></nav>`,
);
function D(e, s) {
  j(s, !0);
  const r = () => T(N, '$page', c),
    [c, o] = M();
  function n(g) {
    return r().url.pathname === g;
  }
  var i = R(),
    v = a(i),
    d = a(v);
  t(v);
  var p = l(v, 2),
    f = a(p);
  t(p);
  var u = l(p, 2),
    w = a(u);
  (t(u),
    t(i),
    k(
      (g, x, y) => {
        (b(
          d,
          1,
          `transition-transform duration-200 group-active:scale-95 ${g ?? ''}`,
          'svelte-1azti6v',
        ),
          b(
            f,
            1,
            `transition-transform duration-200 group-active:scale-95 ${x ?? ''}`,
            'svelte-1azti6v',
          ),
          b(
            w,
            1,
            `transition-transform duration-200 group-active:scale-95 ${y ?? ''}`,
            'svelte-1azti6v',
          ));
      },
      [
        () =>
          n('/')
            ? '-translate-y-4 scale-110 filter drop-shadow-glow'
            : 'opacity-90 hover:-translate-y-1',
        () =>
          n('/missoes')
            ? '-translate-y-4 scale-110 filter drop-shadow-glow'
            : 'opacity-90 hover:-translate-y-1',
        () =>
          n('/cla')
            ? '-translate-y-4 scale-110 filter drop-shadow-glow'
            : 'opacity-90 hover:-translate-y-1',
      ],
    ),
    m(e, i),
    $(),
    o());
}
var O = h(
  '<header class="w-full h-[60px] flex items-center justify-between px-4 pt-4 z-20"><div class="w-8"></div> <h1 class="text-white font-bold text-lg drop-shadow-md font-serif tracking-wider"></h1> <a href="/config" aria-label="Configurações" title="Configurações" class="w-8 h-8 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-sm border border-white/10 transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></a></header>',
);
function P(e) {
  var s = O(),
    r = l(a(s), 2);
  ((r.textContent = 'Reino de Matheus'), C(2), t(s), m(e, s));
}
var q = h(
  `<div class="fixed inset-0 bg-[url('/art/bg/bg-taverna.png')] bg-cover bg-center flex items-center justify-center overflow-hidden"><div class="relative h-[95vh] max-h-[900px] aspect-[9/19] max-w-[500px] flex items-center justify-center filter drop-shadow-2xl"><img src="/art/bg/bg-main-shell.webp" alt="Device Frame" class="absolute inset-0 w-full h-full object-contain z-50 pointer-events-none select-none"/> <div class="relative z-10 w-[92%] h-[97%] bg-black rounded-[55px] overflow-hidden flex flex-col"><div class="absolute inset-0 bg-[url('/art/bg/bg-global-dungeon.webp')] bg-cover bg-center opacity-100 z-0"></div> <div class="relative z-20 w-full h-full flex flex-col"><div class="flex-none z-30"><!></div> <main class="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth py-4 no-scrollbar svelte-12qhfyh"><!></main> <div class="flex-none z-30"><!></div></div></div></div></div>`,
);
function Q(e, s) {
  var r = q(),
    c = a(r),
    o = l(a(c), 2),
    n = l(a(o), 2),
    i = a(n),
    v = a(i);
  (P(v), t(i));
  var d = l(i, 2),
    p = a(d);
  (F(p, () => s.children), t(d));
  var f = l(d, 2),
    u = a(f);
  (D(u, {}), t(f), t(n), t(o), t(c), t(r), m(e, r));
}
export { Q as component, L as universal };
