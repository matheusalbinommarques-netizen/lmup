const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.LNoU-XZ0.js',
      '../chunks/BYSpO852.js',
      '../chunks/Cowx68EC.js',
      '../chunks/DJoSvvfp.js',
      '../chunks/f0HoYL7i.js',
      '../chunks/qHFclJgu.js',
      '../chunks/vGAHndma.js',
      '../assets/0.AIJQZlMW.css',
      '../nodes/1.DCuDBtxX.js',
      '../chunks/ViNRIw49.js',
      '../nodes/2.iN65js4Z.js',
      '../chunks/DQqdkiKC.js',
      '../chunks/-JVijWqR.js',
      '../chunks/DgxGOAFj.js',
      '../nodes/3.BRLvbiP7.js',
      '../chunks/PPVm8Dsz.js',
    ]),
) => i.map((i) => d[i]);
import { _ as g } from '../chunks/PPVm8Dsz.js';
import {
  h as q,
  a as z,
  b as G,
  E as J,
  av as Q,
  _ as U,
  u as W,
  a0 as X,
  S as H,
  k as b,
  L as K,
  e as u,
  aw as Z,
  J as $,
  M as tt,
  Q as et,
  ax as rt,
  t as at,
  ay as E,
  az as st,
  R as y,
  X as nt,
  U as ot,
  V as it,
  W as ct,
  aA as P,
  T as ut,
} from '../chunks/Cowx68EC.js';
import { h as ft, m as dt, u as mt, s as lt } from '../chunks/ViNRIw49.js';
import { f as j, a as _, d as R, t as _t } from '../chunks/BYSpO852.js';
import { o as ht } from '../chunks/vGAHndma.js';
import { i as x } from '../chunks/DQqdkiKC.js';
import { B as vt } from '../chunks/f0HoYL7i.js';
import { p as O } from '../chunks/DgxGOAFj.js';
function T(r, t, a) {
  q && z();
  var o = new vt(r);
  G(() => {
    var n = t() ?? null;
    o.ensure(n, n && ((e) => a(e, n)));
  }, J);
}
function S(r, t) {
  return r === t || r?.[H] === t;
}
function k(r = {}, t, a, o) {
  return (
    Q(() => {
      var n, e;
      return (
        U(() => {
          ((n = e),
            (e = []),
            W(() => {
              r !== a(...e) &&
                (t(r, ...e), n && S(a(...n), r) && t(null, ...n));
            }));
        }),
        () => {
          X(() => {
            e && S(a(...e), r) && t(null, ...e);
          });
        }
      );
    }),
    r
  );
}
function gt(r) {
  return class extends yt {
    constructor(t) {
      super({ component: r, ...t });
    }
  };
}
class yt {
  #e;
  #t;
  constructor(t) {
    var a = new Map(),
      o = (e, s) => {
        var c = tt(s, !1, !1);
        return (a.set(e, c), c);
      };
    const n = new Proxy(
      { ...(t.props || {}), $$events: {} },
      {
        get(e, s) {
          return u(a.get(s) ?? o(s, Reflect.get(e, s)));
        },
        has(e, s) {
          return s === K
            ? !0
            : (u(a.get(s) ?? o(s, Reflect.get(e, s))), Reflect.has(e, s));
        },
        set(e, s, c) {
          return (b(a.get(s) ?? o(s, c), c), Reflect.set(e, s, c));
        },
      },
    );
    ((this.#t = (t.hydrate ? ft : dt)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: n,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover,
    })),
      (!t?.props?.$$host || t.sync === !1) && Z(),
      (this.#e = n.$$events));
    for (const e of Object.keys(this.#t))
      e === '$set' ||
        e === '$destroy' ||
        e === '$on' ||
        $(this, e, {
          get() {
            return this.#t[e];
          },
          set(s) {
            this.#t[e] = s;
          },
          enumerable: !0,
        });
    ((this.#t.$set = (e) => {
      Object.assign(n, e);
    }),
      (this.#t.$destroy = () => {
        mt(this.#t);
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
const Ct = {};
var bt = j(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  Et = j('<!> <!>', 1);
function Pt(r, t) {
  et(t, !0);
  let a = O(t, 'components', 23, () => []),
    o = O(t, 'data_0', 3, null),
    n = O(t, 'data_1', 3, null);
  (rt(() => t.stores.page.set(t.page)),
    at(() => {
      (t.stores,
        t.page,
        t.constructors,
        a(),
        t.form,
        o(),
        n(),
        t.stores.page.notify());
    }));
  let e = E(!1),
    s = E(!1),
    c = E(null);
  ht(() => {
    const i = t.stores.page.subscribe(() => {
      u(e) &&
        (b(s, !0),
        st().then(() => {
          b(c, document.title || 'untitled page', !0);
        }));
    });
    return (b(e, !0), i);
  });
  const M = P(() => t.constructors[1]);
  var A = Et(),
    w = y(A);
  {
    var V = (i) => {
        const f = P(() => t.constructors[0]);
        var d = R(),
          h = y(d);
        (T(
          h,
          () => u(f),
          (m, l) => {
            k(
              l(m, {
                get data() {
                  return o();
                },
                get form() {
                  return t.form;
                },
                get params() {
                  return t.page.params;
                },
                children: (v, xt) => {
                  var L = R(),
                    B = y(L);
                  (T(
                    B,
                    () => u(M),
                    (F, N) => {
                      k(
                        N(F, {
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
                        (Y) => (a()[1] = Y),
                        () => a()?.[1],
                      );
                    },
                  ),
                    _(v, L));
                },
                $$slots: { default: !0 },
              }),
              (v) => (a()[0] = v),
              () => a()?.[0],
            );
          },
        ),
          _(i, d));
      },
      p = (i) => {
        const f = P(() => t.constructors[0]);
        var d = R(),
          h = y(d);
        (T(
          h,
          () => u(f),
          (m, l) => {
            k(
              l(m, {
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
              (v) => (a()[0] = v),
              () => a()?.[0],
            );
          },
        ),
          _(i, d));
      };
    x(w, (i) => {
      t.constructors[1] ? i(V) : i(p, !1);
    });
  }
  var D = nt(w, 2);
  {
    var I = (i) => {
      var f = bt(),
        d = it(f);
      {
        var h = (m) => {
          var l = _t();
          (ut(() => lt(l, u(c))), _(m, l));
        };
        x(d, (m) => {
          u(s) && m(h);
        });
      }
      (ct(f), _(i, f));
    };
    x(D, (i) => {
      u(e) && i(I);
    });
  }
  (_(r, A), ot());
}
const Mt = gt(Pt),
  Vt = [
    () =>
      g(
        () => import('../nodes/0.LNoU-XZ0.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7]),
        import.meta.url,
      ),
    () =>
      g(
        () => import('../nodes/1.DCuDBtxX.js'),
        __vite__mapDeps([8, 1, 2, 9, 5, 6]),
        import.meta.url,
      ),
    () =>
      g(
        () => import('../nodes/2.iN65js4Z.js'),
        __vite__mapDeps([10, 1, 2, 11, 4, 3, 12, 13, 9, 6]),
        import.meta.url,
      ),
    () =>
      g(
        () => import('../nodes/3.BRLvbiP7.js'),
        __vite__mapDeps([14, 1, 2, 15, 12, 3, 4, 13]),
        import.meta.url,
      ),
  ],
  pt = [],
  Dt = { '/': [2], '/config': [3] },
  C = {
    handleError: ({ error: r }) => {
      console.error(r);
    },
    reroute: () => {},
    transport: {},
  },
  Rt = Object.fromEntries(
    Object.entries(C.transport).map(([r, t]) => [r, t.decode]),
  ),
  It = Object.fromEntries(
    Object.entries(C.transport).map(([r, t]) => [r, t.encode]),
  ),
  Bt = !1,
  Ft = (r, t) => Rt[r](t);
export {
  Ft as decode,
  Rt as decoders,
  Dt as dictionary,
  It as encoders,
  Bt as hash,
  C as hooks,
  Ct as matchers,
  Vt as nodes,
  Mt as root,
  pt as server_loads,
};
