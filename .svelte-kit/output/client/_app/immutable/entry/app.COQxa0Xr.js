const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.BDbb4ClV.js',
      '../chunks/DsnmJJEf.js',
      '../chunks/C4tos-D-.js',
      '../chunks/BYKdWbGi.js',
      '../chunks/B28y5Mvi.js',
      '../chunks/BzcctPJO.js',
      '../assets/0.CEYHGvux.css',
      '../nodes/1.9VMlEJ-7.js',
      '../nodes/2.BFRHdi1P.js',
      '../chunks/D7NEdK74.js',
      '../chunks/B0IkYSzE.js',
      '../chunks/CUrLQr9X.js',
      '../chunks/DbSmc52O.js',
      '../chunks/BNQQrpbk.js',
      '../chunks/Beyb9IEN.js',
      '../chunks/Cxxjmckw.js',
      '../chunks/BijEeDuW.js',
      '../chunks/CpUvk0iO.js',
      '../nodes/3.-xvFBicV.js',
      '../nodes/4.r0vXU7Cx.js',
      '../nodes/5.DCC6_dOJ.js',
      '../chunks/CAyjdqEO.js',
      '../nodes/6.Dn3yo94r.js',
      '../nodes/7.ab6o557I.js',
      '../nodes/8.CKSVriuX.js',
      '../chunks/CPixY0QB.js',
      '../assets/8.LvpZ3PuW.css',
      '../nodes/9.C8P72N_T.js',
      '../chunks/BYYbvhAJ.js',
      '../nodes/10.DgGqdxdW.js',
      '../nodes/11.JYY59zBI.js',
      '../nodes/12.DuHpcy4V.js',
    ]),
) => i.map((i) => d[i]);
import { b, _ as n } from '../chunks/CAyjdqEO.js';
import {
  F as q,
  S as z,
  J as G,
  ai as J,
  ag as Y,
  b as p,
  as as H,
  g as u,
  az as K,
  aA as Q,
  aB as U,
  aC as W,
  aD as X,
  a2 as Z,
  p as $,
  aE as tt,
  at as et,
  o as rt,
  s as P,
  C as at,
  f as V,
  m as E,
  j as st,
  d as h,
  e as ot,
  q as R,
  h as nt,
  r as it,
  k as y,
  w as _t,
  t as ct,
  l as ut,
} from '../chunks/C4tos-D-.js';
import '../chunks/DsnmJJEf.js';
import { p as O, i as A } from '../chunks/D7NEdK74.js';
function T(s, t, a) {
  q && z();
  var i = new Y(s);
  G(() => {
    var o = t() ?? null;
    i.ensure(o, o && ((e) => a(e, o)));
  }, J);
}
function mt(s) {
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
      i = (e, r) => {
        var c = Z(r, !1, !1);
        return (a.set(e, c), c);
      };
    const o = new Proxy(
      { ...(t.props || {}), $$events: {} },
      {
        get(e, r) {
          return u(a.get(r) ?? i(r, Reflect.get(e, r)));
        },
        has(e, r) {
          return r === H
            ? !0
            : (u(a.get(r) ?? i(r, Reflect.get(e, r))), Reflect.has(e, r));
        },
        set(e, r, c) {
          return (p(a.get(r) ?? i(r, c), c), Reflect.set(e, r, c));
        },
      },
    );
    ((this.#t = (t.hydrate ? K : Q)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: o,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover,
    })),
      (!t?.props?.$$host || t.sync === !1) && U(),
      (this.#e = o.$$events));
    for (const e of Object.keys(this.#t))
      e === '$set' ||
        e === '$destroy' ||
        e === '$on' ||
        W(this, e, {
          get() {
            return this.#t[e];
          },
          set(r) {
            this.#t[e] = r;
          },
          enumerable: !0,
        });
    ((this.#t.$set = (e) => {
      Object.assign(o, e);
    }),
      (this.#t.$destroy = () => {
        X(this.#t);
      }));
  }
  $set(t) {
    this.#t.$set(t);
  }
  $on(t, a) {
    this.#e[t] = this.#e[t] || [];
    const i = (...o) => a.call(this, ...o);
    return (
      this.#e[t].push(i),
      () => {
        this.#e[t] = this.#e[t].filter((o) => o !== i);
      }
    );
  }
  $destroy() {
    this.#t.$destroy();
  }
}
const Rt = {};
var dt = V(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  ft = V('<!> <!>', 1);
function ht(s, t) {
  $(t, !0);
  let a = O(t, 'components', 23, () => []),
    i = O(t, 'data_0', 3, null),
    o = O(t, 'data_1', 3, null);
  (tt(() => t.stores.page.set(t.page)),
    et(() => {
      (t.stores,
        t.page,
        t.constructors,
        a(),
        t.form,
        i(),
        o(),
        t.stores.page.notify());
    }));
  let e = P(!1),
    r = P(!1),
    c = P(null);
  rt(() => {
    const _ = t.stores.page.subscribe(() => {
      u(e) &&
        (p(r, !0),
        at().then(() => {
          p(c, document.title || 'untitled page', !0);
        }));
    });
    return (p(e, !0), _);
  });
  const j = y(() => t.constructors[1]);
  var D = ft(),
    L = E(D);
  {
    var w = (_) => {
        const m = y(() => t.constructors[0]);
        var l = R(),
          v = E(l);
        (T(
          v,
          () => u(m),
          (d, f) => {
            b(
              f(d, {
                get data() {
                  return i();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
                children: (g, gt) => {
                  var I = R(),
                    F = E(I);
                  (T(
                    F,
                    () => u(j),
                    (M, B) => {
                      b(
                        B(M, {
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
                        (N) => (a()[1] = N),
                        () => a()?.[1],
                      );
                    },
                  ),
                    h(g, I));
                },
                $$slots: { default: !0 },
              }),
              (g) => (a()[0] = g),
              () => a()?.[0],
            );
          },
        ),
          h(_, l));
      },
      k = (_) => {
        const m = y(() => t.constructors[0]);
        var l = R(),
          v = E(l);
        (T(
          v,
          () => u(m),
          (d, f) => {
            b(
              f(d, {
                get data() {
                  return i();
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
          h(_, l));
      };
    A(L, (_) => {
      t.constructors[1] ? _(w) : _(k, !1);
    });
  }
  var C = st(L, 2);
  {
    var S = (_) => {
      var m = dt(),
        l = nt(m);
      {
        var v = (d) => {
          var f = _t();
          (ct(() => ut(f, u(c))), h(d, f));
        };
        A(l, (d) => {
          u(r) && d(v);
        });
      }
      (it(m), h(_, m));
    };
    A(C, (_) => {
      u(e) && _(S);
    });
  }
  (h(s, D), ot());
}
const yt = mt(ht),
  Ot = [
    () =>
      n(
        () => import('../nodes/0.BDbb4ClV.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/1.9VMlEJ-7.js'),
        __vite__mapDeps([7, 1, 2, 5]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/2.BFRHdi1P.js'),
        __vite__mapDeps([8, 1, 2, 9, 4, 10, 11, 12, 13, 14, 15, 3, 16, 17]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/3.-xvFBicV.js'),
        __vite__mapDeps([18, 1, 2, 9, 3, 4, 10, 11, 17, 16]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/4.r0vXU7Cx.js'),
        __vite__mapDeps([19, 1, 2, 9, 3, 4, 11, 17]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/5.DCC6_dOJ.js'),
        __vite__mapDeps([20, 21, 2, 1, 4]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/6.Dn3yo94r.js'),
        __vite__mapDeps([22, 1, 2, 9, 3, 4, 11, 17, 15]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/7.ab6o557I.js'),
        __vite__mapDeps([23, 1, 2, 9, 3, 4, 15, 11, 17]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/8.CKSVriuX.js'),
        __vite__mapDeps([
          24, 1, 2, 9, 3, 4, 11, 13, 14, 15, 25, 12, 10, 17, 26,
        ]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/9.C8P72N_T.js'),
        __vite__mapDeps([
          27, 1, 2, 9, 3, 28, 4, 10, 12, 11, 17, 25, 13, 14, 15,
        ]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/10.DgGqdxdW.js'),
        __vite__mapDeps([29, 1, 2, 9, 3, 28, 4, 10, 11, 17, 25, 13, 14, 15]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/11.JYY59zBI.js'),
        __vite__mapDeps([30, 1, 2, 9, 3, 4, 10, 11, 14, 15, 17]),
        import.meta.url,
      ),
    () =>
      n(
        () => import('../nodes/12.DuHpcy4V.js'),
        __vite__mapDeps([31, 1, 2, 28, 9, 3, 4, 11, 13, 14, 15, 17]),
        import.meta.url,
      ),
  ],
  At = [],
  Tt = {
    '/': [2],
    '/bestiario': [3],
    '/cla': [4],
    '/config': [5],
    '/inventario': [6],
    '/loja': [7],
    '/missoes': [8],
    '/projetos': [9],
    '/projetos/[id]': [10],
    '/santuario': [11],
    '/trofeus': [12],
  },
  x = {
    handleError: ({ error: s }) => {
      console.error(s);
    },
    reroute: () => {},
    transport: {},
  },
  vt = Object.fromEntries(
    Object.entries(x.transport).map(([s, t]) => [s, t.decode]),
  ),
  Dt = Object.fromEntries(
    Object.entries(x.transport).map(([s, t]) => [s, t.encode]),
  ),
  Lt = !1,
  It = (s, t) => vt[s](t);
export {
  It as decode,
  vt as decoders,
  Tt as dictionary,
  Dt as encoders,
  Lt as hash,
  x as hooks,
  Rt as matchers,
  Ot as nodes,
  yt as root,
  At as server_loads,
};
