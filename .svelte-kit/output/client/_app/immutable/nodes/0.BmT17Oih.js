import { f as b, a as u, s as x } from '../chunks/nF9ceomb.js';
import {
  ab as r,
  ac as a,
  ad as _,
  a9 as P,
  d as l,
} from '../chunks/Csv_Bl-6.js';
import { s as k, a as w } from '../chunks/CwhHgKCB.js';
import { e as j } from '../chunks/CqgaXDz6.js';
import { s as g } from '../chunks/DQS66_so.js';
import { p as z } from '../chunks/Bnrm6cmT.js';
import { b as h } from '../chunks/BO9mVFXQ.js';
const O = !0,
  G = Object.freeze(
    Object.defineProperty(
      { __proto__: null, prerender: O },
      Symbol.toStringTag,
      { value: 'Module' },
    ),
  );
var S = b('<li><a><span> </span> <span> </span></a></li>'),
  B =
    b(`<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/80 backdrop-blur
         supports-[backdrop-filter]:bg-card/60"><ul class="mx-auto max-w-3xl grid grid-cols-2"></ul></nav>`);
function C(p, c) {
  let t = z(c, 'currentPath', 3, '/');
  const e = [
    { path: '/', href: `${h}/`, label: 'Progresso', icon: '🏠' },
    {
      path: '/config',
      href: `${h}/config`,
      label: 'Configurações',
      icon: '⚙️',
    },
  ];
  var o = B(),
    i = r(o);
  (j(
    i,
    21,
    () => e,
    (f) => f.href,
    (f, s) => {
      var m = S(),
        n = r(m),
        d = r(n),
        y = r(d, !0);
      a(d);
      var v = _(d, 2),
        $ = r(v, !0);
      (a(v),
        a(n),
        a(m),
        P(() => {
          (g(n, 'href', l(s).href),
            g(n, 'aria-current', t() === l(s).path ? 'page' : void 0),
            k(
              n,
              1,
              `flex flex-col items-center gap-1 py-3 text-sm
                 ${t() === l(s).path ? 'text-primary font-semibold' : 'text-text-secondary'}`,
            ),
            x(y, l(s).icon),
            x($, l(s).label));
        }),
        u(f, m));
    },
  ),
    a(i),
    a(o),
    u(p, o));
}
var M = b(
  '<div class="min-h-screen flex flex-col bg-background text-text"><main class="flex-1 px-4 pt-8 pb-24 max-w-3xl mx-auto w-full"><!></main> <!></div>',
);
function H(p, c) {
  var t = M(),
    e = r(t),
    o = r(e);
  (w(o, () => c.children), a(e));
  var i = _(e, 2);
  (C(i, {}), a(t), u(p, t));
}
export { H as component, G as universal };
