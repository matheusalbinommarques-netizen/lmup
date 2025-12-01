import './DsnmJJEf.js';
import {
  f as m,
  t as c,
  d as v,
  h as a,
  j as b,
  r as i,
  l as g,
} from './C4tos-D-.js';
import { p as l, i as u } from './D7NEdK74.js';
import { a as C, s as h } from './B28y5Mvi.js';
var T = m(`<div class="flex items-center justify-center rounded-full
                 border border-amber-400/60 bg-slate-950/80
                 shadow-[0_0_18px_rgba(251,191,36,0.6)] p-1.5"><img class="h-32 w-32 object-contain"/></div>`),
  q = m('<p class="text-xs md:text-sm text-slate-300/85"> </p>'),
  z =
    m(`<section class="w-full mb-6 flex justify-center"><div class="relative inline-block overflow-hidden rounded-2xl border border-amber-400/60
           bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950
           px-4 py-4 md:px-5 md:py-5
           shadow-[0_0_30px_rgba(251,191,36,0.35)]"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="absolute inset-[8px] rounded-2xl border border-amber-300/25"></div></div> <div><h1 class="font-serif text-xl md:text-2xl font-extrabold
               bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400
               bg-clip-text text-transparent
               drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]"> </h1> <!> <!></div></div></section>`);
function G(w, r) {
  let x = l(r, 'subtitle', 3, ''),
    f = l(r, 'iconSrc', 3, ''),
    y = l(r, 'iconAlt', 3, ''),
    j = l(r, 'align', 3, 'left');
  var o = z(),
    _ = a(o),
    d = b(a(_), 2),
    n = a(d),
    k = a(n, !0);
  i(n);
  var p = b(n, 2);
  {
    var A = (t) => {
      var e = T(),
        s = a(e);
      (i(e),
        c(() => {
          (h(s, 'src', f()), h(s, 'alt', y() || r.title));
        }),
        v(t, e));
    };
    u(p, (t) => {
      f() && t(A);
    });
  }
  var P = b(p, 2);
  {
    var S = (t) => {
      var e = q(),
        s = a(e, !0);
      (i(e), c(() => g(s, x())), v(t, e));
    };
    u(P, (t) => {
      x() && t(S);
    });
  }
  (i(d),
    i(_),
    i(o),
    c(() => {
      (C(
        d,
        1,
        `relative flex flex-col gap-2
              ${j() === 'center' ? 'items-center text-center' : 'items-start text-left'}`,
      ),
        g(k, r.title));
    }),
    v(w, o));
}
export { G as P };
