import '../chunks/DsnmJJEf.js';
import {
  p as j,
  o as M,
  f as h,
  d as m,
  e as $,
  h as i,
  r as o,
  b as N,
  s as C,
  j as x,
  t as L,
  g as a,
  l as P,
  aF as A,
  aG as T,
} from '../chunks/C4tos-D-.js';
import { e as S } from '../chunks/BYKdWbGi.js';
import { s as p, a as z } from '../chunks/B28y5Mvi.js';
import { a as U, s as D } from '../chunks/BzcctPJO.js';
const H = () => ({}),
  Y = Object.freeze(
    Object.defineProperty({ __proto__: null, load: H }, Symbol.toStringTag, {
      value: 'Module',
    }),
  );
var O = h('<a><img class="h-6 w-6"/> <span> </span></a>'),
  W = h(
    '<nav class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/70 bg-slate-900/95 backdrop-blur" aria-label="Navegação inferior"><div class="bottom-nav-inner"></div></nav>',
  );
function B(s, u) {
  j(u, !0);
  let n = C('/');
  function c() {
    N(n, typeof window < 'u' ? window.location.pathname : '/', !0);
  }
  M(() => {
    (c(), U(() => c()));
  });
  const v = [
    { href: '/', label: 'Taverna', icon: '/art/icones/icon-taverna.png' },
    {
      href: '/missoes',
      label: 'Missões',
      icon: '/art/icones/icon-missoes.png',
    },
    {
      href: '/projetos',
      label: 'Projetos',
      icon: '/art/icones/icon-projetos.png',
    },
    { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
    { href: '/config', label: 'Config.', icon: '/art/icones/icon-config.png' },
  ];
  function d(e) {
    return a(n) === e || (e !== '/' && a(n).startsWith(e + '/'));
  }
  var l = W(),
    f = i(l);
  (S(
    f,
    21,
    () => v,
    (e) => e.href,
    (e, r) => {
      var t = O(),
        b = i(t),
        g = x(b, 2),
        _ = i(g, !0);
      (o(g),
        o(t),
        L(
          (w, y) => {
            (p(t, 'href', a(r).href),
              z(t, 1, w),
              p(t, 'aria-current', y),
              p(b, 'src', a(r).icon),
              p(b, 'alt', a(r).label),
              P(_, a(r).label));
          },
          [
            () =>
              `flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[0.65rem] font-medium transition-colors ${d(a(r).href) ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]' : 'text-slate-400 hover:text-slate-100'}`,
            () => (d(a(r).href) ? 'page' : void 0),
          ],
        ),
        m(e, t));
    },
  ),
    o(f),
    o(l),
    m(s, l),
    $());
}
const F = () => {
    const s = D;
    return {
      page: { subscribe: s.page.subscribe },
      navigating: { subscribe: s.navigating.subscribe },
      updated: s.updated,
    };
  },
  G = {
    subscribe(s) {
      return F().page.subscribe(s);
    },
  };
var Q = h('<a><img class="h-5 w-5"/> <span> </span></a>'),
  q = h(
    '<aside class="hidden w-64 flex-col gap-6 border-r border-slate-800/50 bg-slate-900/80 p-4 md:flex"><a href="/" class="flex items-center gap-3 px-2 group"><img src="/art/icones/logo lmu.png" alt="Logo LMU" class="h-12 w-12 drop-shadow-[0_0_18px_rgba(251,191,36,0.45)]" decoding="async"/> <div class="flex flex-col leading-tight"><span class="relative inline-block font-serif text-lg md:text-xl font-extrabold"><span class="absolute inset-0 text-amber-300 blur opacity-80 group-hover:blur-xl group-hover:opacity-100 transition-all duration-300" aria-hidden="true">Level Me Up!</span> <span class="relative text-amber-100">Level Me Up!</span></span></div></a> <nav class="flex flex-1 flex-col gap-1" aria-label="Navegação lateral"></nav></aside>',
  );
function E(s, u) {
  j(u, !0);
  let n = C('/'),
    c = null;
  (M(() => {
    c = G.subscribe((e) => {
      N(n, e.url.pathname, !0);
    });
  }),
    A(() => {
      c?.();
    }));
  const v = [
    {
      href: '/',
      label: 'Taverna do Herói',
      icon: '/art/icones/icon-taverna.png',
    },
    {
      href: '/missoes',
      label: 'Quadro de Missões',
      icon: '/art/icones/icon-missoes.png',
    },
    {
      href: '/projetos',
      label: 'Projetos do Herói',
      icon: '/art/icones/icon-projetos.png',
    },
    { href: '/cla', label: 'Clã', icon: '/art/icones/icon-cla.png' },
    {
      href: '/santuario',
      label: 'Santuário',
      icon: '/art/icones/icon-leaf-eco.png',
    },
    {
      href: '/config',
      label: 'Cofre Arcano',
      icon: '/art/icones/icon-config.png',
    },
  ];
  function d(e) {
    return a(n) === e || (e !== '/' && a(n).startsWith(e + '/'));
  }
  var l = q(),
    f = x(i(l), 2);
  (S(
    f,
    21,
    () => v,
    (e) => e.href,
    (e, r) => {
      var t = Q(),
        b = i(t),
        g = x(b, 2),
        _ = i(g, !0);
      (o(g),
        o(t),
        L(
          (w, y) => {
            (p(t, 'href', a(r).href),
              z(t, 1, w),
              p(t, 'aria-current', y),
              p(b, 'src', a(r).icon),
              p(b, 'alt', a(r).label),
              P(_, a(r).label));
          },
          [
            () =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${d(a(r).href) ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/60 shadow-[0_0_18px_rgba(52,211,153,0.65)]' : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'}`,
            () => (d(a(r).href) ? 'page' : void 0),
          ],
        ),
        m(e, t));
    },
  ),
    o(f),
    o(l),
    m(s, l),
    $());
}
var I = h(
  '<div class="min-h-dvh bg-slate-950 text-slate-200 md:flex"><!> <div class="flex-1 min-w-0 relative flex flex-col"><main class="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth pb-[100px] md:pb-8"><div class="mx-auto w-full max-w-5xl"><!></div></main></div> <div class="md:hidden fixed bottom-0 left-0 right-0 z-50"><!></div></div>',
);
function Z(s, u) {
  var n = I(),
    c = i(n);
  E(c, {});
  var v = x(c, 2),
    d = i(v),
    l = i(d),
    f = i(l);
  (T(f, () => u.children), o(l), o(d), o(v));
  var e = x(v, 2),
    r = i(e);
  (B(r, {}), o(e), o(n), m(s, n));
}
export { Z as component, Y as universal };
