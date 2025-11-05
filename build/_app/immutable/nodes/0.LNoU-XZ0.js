import { f as y, a as _ } from '../chunks/BYSpO852.js';
import {
  Q as $,
  V as p,
  T as S,
  U as j,
  W as i,
  X as l,
  K as C,
} from '../chunks/Cowx68EC.js';
import { s as M, a as u, b as d } from '../chunks/DJoSvvfp.js';
import { s as O, a as P } from '../chunks/f0HoYL7i.js';
import { s as T, b as x } from '../chunks/qHFclJgu.js';
const U = !0,
  k = Object.freeze(
    Object.defineProperty(
      { __proto__: null, prerender: U },
      Symbol.toStringTag,
      { value: 'Module' },
    ),
  ),
  w = () => {
    const e = T;
    return {
      page: { subscribe: e.page.subscribe },
      navigating: { subscribe: e.navigating.subscribe },
      updated: e.updated,
    };
  },
  z = {
    subscribe(e) {
      return w().page.subscribe(e);
    },
  };
var K = y(
  '<main class="max-w-3xl mx-auto p-4 md:p-6 pb-16"><header class="text-center py-6"><h1 class="text-primary text-4xl font-bold"></h1></header> <nav class="flex mb-6 border-b-2 border-border"><a>Progresso</a> <a>Configurações</a></nav> <!></main>',
);
function q(e, r) {
  $(r, !0);
  const t = () => P(z, '$page', f),
    [f, g] = O();
  var a = K(),
    s = p(a),
    h = p(s);
  ((h.textContent = 'Level Me Up!'), i(s));
  var o = l(s, 2),
    n = p(o);
  let b;
  var c = l(n, 2);
  let m;
  i(o);
  var v = l(o, 2);
  (M(v, () => r.children ?? C),
    i(a),
    S(() => {
      (u(n, 'href', `${x}/`),
        (b = d(
          n,
          1,
          'text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150 hover:text-text',
          null,
          b,
          {
            'text-primary': t().url.pathname === '/',
            'border-primary': t().url.pathname === '/',
          },
        )),
        u(c, 'href', `${x}/config`),
        (m = d(
          c,
          1,
          'text-lg font-semibold py-2 px-4 text-text-secondary border-b-2 border-transparent -mb-0.5 transition-colors duration-150 hover:text-text',
          null,
          m,
          {
            'text-primary': t().url.pathname === '/config',
            'border-primary': t().url.pathname === '/config',
          },
        )));
    }),
    _(e, a),
    j(),
    g());
}
export { q as component, k as universal };
