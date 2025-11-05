import { f, a as g } from '../chunks/DzhFJs4K.js';
import {
  W as v,
  _ as o,
  Y as h,
  Z as y,
  $ as n,
  a0 as p,
  K as _,
} from '../chunks/dJOEbL3k.js';
import { s as $, a as c } from '../chunks/Ca0y2NF9.js';
import { s as S, a as j } from '../chunks/DVr_F4gB.js';
import { s as C } from '../chunks/BKBiTo-U.js';
const M = !0,
  W = Object.freeze(
    Object.defineProperty(
      { __proto__: null, prerender: M },
      Symbol.toStringTag,
      { value: 'Module' },
    ),
  ),
  O = () => {
    const e = C;
    return {
      page: { subscribe: e.page.subscribe },
      navigating: { subscribe: e.navigating.subscribe },
      updated: e.updated,
    };
  },
  P = {
    subscribe(e) {
      return O().page.subscribe(e);
    },
  };
var w = f(
  '<main class="max-w-3xl mx-auto p-4 md:p-6"><header class="text-center py-6"><h1 class="text-primary text-4xl font-bold"></h1></header> <nav class="flex mb-6 border-b-2 border-border"><a href="/">Progresso</a> <a href="/config">Configurações</a></nav> <!></main>',
);
function Y(e, r) {
  v(r, !0);
  const i = () => j(P, '$page', m),
    [m, l] = S();
  var t = w(),
    a = o(t),
    d = o(a);
  ((d.textContent = 'Level Me Up!'), n(a));
  var s = p(a, 2),
    b = o(s),
    u = p(b, 2);
  n(s);
  var x = p(s, 2);
  ($(x, () => r.children ?? _),
    n(t),
    h(() => {
      (c(
        b,
        1,
        `text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150
        hover:text-text
        ${i().url.pathname === '/' ? 'text-primary border-primary' : ''}`,
      ),
        c(
          u,
          1,
          `text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duração-150
        hover:text-text
        ${i().url.pathname === '/config' ? 'text-primary border-primary' : ''}`,
        ));
    }),
    g(e, t),
    y(),
    l());
}
export { Y as component, W as universal };
