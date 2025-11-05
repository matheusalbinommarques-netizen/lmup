const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.BtFbn3m1.js',
      '../chunks/BuOzf4wU.js',
      '../chunks/nNZc3isi.js',
      '../chunks/B68RJgVf.js',
      '../chunks/Av5441iL.js',
      '../chunks/CV21HSfW.js',
      '../chunks/C4GIgfFI.js',
      '../chunks/A-ufohnU.js',
      '../chunks/0WT7qgch.js',
      '../chunks/D5tPhTvi.js',
      '../assets/0.BNaBjhY0.css',
      '../nodes/1.BM1SeEqY.js',
      '../nodes/2.CO5McPJ1.js',
      '../chunks/DMVQG7PD.js',
      '../chunks/BwBkY9_K.js',
      '../nodes/3.Cdz5sLsJ.js',
      '../chunks/_anJIlvJ.js',
    ]),
) => i.map((i) => d[i]);
import { b as E, _ as v } from '../chunks/_anJIlvJ.js';
import {
  h as Y,
  a as G,
  b as J,
  J as Z,
  R as y,
  Y as q,
  d as u,
  ai as z,
  aj as H,
  p as K,
  a7 as Q,
  ak as U,
  Z as W,
  ae as P,
  al as X,
  a8 as b,
  ad as $,
  aa as tt,
  ab as et,
  ac as rt,
  ag as R,
  a9 as at,
} from '../chunks/nNZc3isi.js';
import {
  h as st,
  m as nt,
  u as ot,
  f as T,
  a as _,
  c as x,
  t as ct,
  s as it,
} from '../chunks/BuOzf4wU.js';
import { o as ut } from '../chunks/D5tPhTvi.js';
import { i as O } from '../chunks/DMVQG7PD.js';
import { B as mt } from '../chunks/Av5441iL.js';
import { p } from '../chunks/A-ufohnU.js';
function j(s, t, a) {
  Y && G();
  var o = new mt(s);
  J(() => {
    var n = t() ?? null;
    o.ensure(n, n && ((e) => a(e, n)));
  }, Z);
}
function dt(s) {
  return class extends lt {
    constructor(t) {
      super({ component: s, ...t });
    }
  };
}
class lt {
  #e;
  #t;
  constructor(t) {
    var a = new Map(),
      o = (e, r) => {
        var i = K(r, !1, !1);
        return (a.set(e, i), i);
      };
    const n = new Proxy(
      { ...(t.props || {}), $$events: {} },
      {
        get(e, r) {
          return u(a.get(r) ?? o(r, Reflect.get(e, r)));
        },
        has(e, r) {
          return r === q
            ? !0
            : (u(a.get(r) ?? o(r, Reflect.get(e, r))), Reflect.has(e, r));
        },
        set(e, r, i) {
          return (y(a.get(r) ?? o(r, i), i), Reflect.set(e, r, i));
        },
      },
    );
    ((this.#t = (t.hydrate ? st : nt)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: n,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover,
    })),
      (!t?.props?.$$host || t.sync === !1) && z(),
      (this.#e = n.$$events));
    for (const e of Object.keys(this.#t))
      e === '$set' ||
        e === '$destroy' ||
        e === '$on' ||
        H(this, e, {
          get() {
            return this.#t[e];
          },
          set(r) {
            this.#t[e] = r;
          },
          enumerable: !0,
        });
    ((this.#t.$set = (e) => {
      Object.assign(n, e);
    }),
      (this.#t.$destroy = () => {
        ot(this.#t);
      }));
  }
  $set(t) {
    this.#t.$set(t);
  }
  $on(t, a) {
    this.#e[t] = this.#e[t] || [];
    const o = (...n) => a.call(this, ...n);
    return (
      this.#e[t].push(o),
      () => {
        this.#e[t] = this.#e[t].filter((n) => n !== o);
      }
    );
  }
  $destroy() {
    this.#t.$destroy();
  }
}
const pt = {};
var ft = T(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  _t = T('<!> <!>', 1);
function ht(s, t) {
  Q(t, !0);
  let a = p(t, 'components', 23, () => []),
    o = p(t, 'data_0', 3, null),
    n = p(t, 'data_1', 3, null);
  (U(() => t.stores.page.set(t.page)),
    W(() => {
      (t.stores,
        t.page,
        t.constructors,
        a(),
        t.form,
        o(),
        n(),
        t.stores.page.notify());
    }));
  let e = P(!1),
    r = P(!1),
    i = P(null);
  ut(() => {
    const c = t.stores.page.subscribe(() => {
      u(e) &&
        (y(r, !0),
        X().then(() => {
          y(i, document.title || 'untitled page', !0);
        }));
    });
    return (y(e, !0), c);
  });
  const L = R(() => t.constructors[1]);
  var k = _t(),
    w = b(k);
  {
    var D = (c) => {
        const m = R(() => t.constructors[0]);
        var d = x(),
          h = b(d);
        (j(
          h,
          () => u(m),
          (l, f) => {
            E(
              f(l, {
                get data() {
                  return o();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
                children: (g, vt) => {
                  var A = x(),
                    M = b(A);
                  (j(
                    M,
                    () => u(L),
                    (B, F) => {
                      E(
                        F(B, {
                          get data() {
                            return n();
                          },
                          get form() {
                            return t.form;
                          },
                          get params() {
                            return t.page.params;
                          },
                        }),
                        (N) => (a()[1] = N),
                        () => a()?.[1],
                      );
                    },
                  ),
                    _(g, A));
                },
                $$slots: { default: !0 },
              }),
              (g) => (a()[0] = g),
              () => a()?.[0],
            );
          },
        ),
          _(c, d));
      },
      I = (c) => {
        const m = R(() => t.constructors[0]);
        var d = x(),
          h = b(d);
        (j(
          h,
          () => u(m),
          (l, f) => {
            E(
              f(l, {
                get data() {
                  return o();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
              }),
              (g) => (a()[0] = g),
              () => a()?.[0],
            );
          },
        ),
          _(c, d));
      };
    O(w, (c) => {
      t.constructors[1] ? c(D) : c(I, !1);
    });
  }
  var S = $(w, 2);
  {
    var V = (c) => {
      var m = ft(),
        d = et(m);
      {
        var h = (l) => {
          var f = ct();
          (at(() => it(f, u(i))), _(l, f));
        };
        O(d, (l) => {
          u(r) && l(h);
        });
      }
      (rt(m), _(c, m));
    };
    O(S, (c) => {
      u(e) && c(V);
    });
  }
  (_(s, k), tt());
}
const jt = dt(ht),
  kt = [
    () =>
      v(
        () => import('../nodes/0.BtFbn3m1.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/1.BM1SeEqY.js'),
        __vite__mapDeps([11, 1, 2, 8, 9]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/2.CO5McPJ1.js'),
        __vite__mapDeps([12, 1, 2, 13, 4, 6, 5, 14, 9]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/3.Cdz5sLsJ.js'),
        __vite__mapDeps([15, 1, 2, 16, 14, 3, 4, 5, 13]),
        import.meta.url,
      ),
  ],
  wt = [],
  At = { '/': [2], '/config': [3] },
  C = {
    handleError: ({ error: s }) => {
      console.error(s);
    },
    reroute: () => {},
    transport: {},
  },
  gt = Object.fromEntries(
    Object.entries(C.transport).map(([s, t]) => [s, t.decode]),
  ),
  Tt = Object.fromEntries(
    Object.entries(C.transport).map(([s, t]) => [s, t.encode]),
  ),
  Ct = !1,
  Lt = (s, t) => gt[s](t);
export {
  Lt as decode,
  gt as decoders,
  At as dictionary,
  Tt as encoders,
  Ct as hash,
  C as hooks,
  pt as matchers,
  kt as nodes,
  jt as root,
  wt as server_loads,
};
