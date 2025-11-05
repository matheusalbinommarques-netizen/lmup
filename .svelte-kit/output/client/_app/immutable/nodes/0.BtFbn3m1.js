import { f as _, a as v, s as $ } from '../chunks/BuOzf4wU.js';
import {
  ab as p,
  ac as e,
  ad as u,
  a9 as P,
  d as t,
  a7 as j,
  Z as k,
  R as w,
  a8 as z,
  aa as C,
  ae as M,
  af as O,
} from '../chunks/nNZc3isi.js';
import { s as h, a as B } from '../chunks/B68RJgVf.js';
import { s as m } from '../chunks/CV21HSfW.js';
import { e as L } from '../chunks/C4GIgfFI.js';
import { p as N } from '../chunks/A-ufohnU.js';
import { b as g, s as R } from '../chunks/0WT7qgch.js';
const T = !0,
  V = Object.freeze(
    Object.defineProperty(
      { __proto__: null, prerender: T },
      Symbol.toStringTag,
      { value: 'Module' },
    ),
  );
var U = _('<li><a><span> </span> <span> </span></a></li>'),
  Z =
    _(`<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 backdrop-blur
         supports-[backdrop-filter]:bg-card/60"><ul class="mx-auto max-w-3xl grid grid-cols-2"></ul></nav>`);
function q(r, b) {
  let s = N(b, 'currentPath', 3, '/');
  const d = [
    { path: '/', href: `${g}/`, label: 'Progresso', icon: '🏠' },
    {
      path: '/config',
      href: `${g}/config`,
      label: 'Configurações',
      icon: '⚙️',
    },
  ];
  var o = Z(),
    c = p(o);
  (L(
    c,
    21,
    () => d,
    (n) => n.href,
    (n, a) => {
      var l = U(),
        i = p(l),
        f = p(i),
        x = p(f, !0);
      e(f);
      var y = u(f, 2),
        S = p(y, !0);
      (e(y),
        e(i),
        e(l),
        P(() => {
          (m(i, 'href', t(a).href),
            m(i, 'aria-current', s() === t(a).path ? 'page' : void 0),
            h(
              i,
              1,
              `flex flex-col items-center gap-1 py-3 text-sm
                 ${s() === t(a).path ? 'text-primary font-semibold' : 'text-text-secondary'}`,
            ),
            $(x, t(a).icon),
            $(S, t(a).label));
        }),
        v(n, l));
    },
  ),
    e(c),
    e(o),
    v(r, o));
}
const A = () => {
    const r = R;
    return {
      page: { subscribe: r.page.subscribe },
      navigating: { subscribe: r.navigating.subscribe },
      updated: r.updated,
    };
  },
  D = {
    subscribe(r) {
      return A().page.subscribe(r);
    },
  };
var E = _(
  '<main class="max-w-3xl mx-auto p-4 md:p-6 pb-24"><header class="text-center py-6"><h1 class="text-primary text-4xl font-bold">Level Me Up!</h1></header> <nav class="flex gap-6 mb-6 border-b-2 border-border"><a>Progresso</a> <a>Configurações</a></nav> <!></main> <!>',
  1,
);
function W(r, b) {
  j(b, !0);
  let s = M('/');
  k(() =>
    D.subscribe((x) => {
      w(s, x.url.pathname, !0);
    }),
  );
  var d = E(),
    o = z(d),
    c = u(p(o), 2),
    n = p(c),
    a = u(n, 2);
  e(c);
  var l = u(c, 2);
  (B(l, () => b.children ?? O), e(o));
  var i = u(o, 2);
  (q(i, {
    get currentPath() {
      return t(s);
    },
  }),
    P(() => {
      (m(n, 'href', `${g}/`),
        h(
          n,
          1,
          `py-2 text-lg font-semibold
        ${t(s) === '/' ? 'text-primary border-b-2 border-primary -mb-0.5' : 'text-text-secondary'}`,
        ),
        m(a, 'href', `${g}/config`),
        h(
          a,
          1,
          `py-2 text-lg font-semibold
        ${t(s) === '/config' ? 'text-primary border-b-2 border-primary -mb-0.5' : 'text-text-secondary'}`,
        ));
    }),
    v(r, d),
    C());
}
export { W as component, V as universal };
