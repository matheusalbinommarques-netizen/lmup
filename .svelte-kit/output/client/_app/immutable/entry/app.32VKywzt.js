const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.BmT17Oih.js',
      '../chunks/nF9ceomb.js',
      '../chunks/Csv_Bl-6.js',
      '../chunks/CwhHgKCB.js',
      '../chunks/BSRLHI0b.js',
      '../chunks/DQS66_so.js',
      '../chunks/CqgaXDz6.js',
      '../chunks/Bnrm6cmT.js',
      '../chunks/BO9mVFXQ.js',
      '../assets/0.DOmFC8J6.css',
      '../nodes/1.VIYq_tZy.js',
      '../chunks/Ejg9LFgT.js',
      '../chunks/DcfkiRxm.js',
      '../nodes/2.DD7g9ghc.js',
      '../chunks/CSEja_gF.js',
      '../chunks/BwBkY9_K.js',
      '../nodes/3.CSpNr_ws.js',
      '../chunks/CoYf8t8d.js',
    ]),
) => i.map((i) => d[i]);
import { b as E, _ as v } from '../chunks/CoYf8t8d.js';
import {
  h as Y,
  a as G,
  b as J,
  J as Q,
  Q as y,
  Y as Z,
  d as u,
  ah as q,
  ai as z,
  p as H,
  a7 as K,
  aj as U,
  Z as W,
  ak as P,
  al as X,
  a8 as b,
  ad as $,
  aa as tt,
  ab as et,
  ac as rt,
  af as R,
  a9 as at,
} from '../chunks/Csv_Bl-6.js';
import {
  h as st,
  m as nt,
  u as ot,
  f as T,
  a as _,
  c as x,
  t as ct,
  s as it,
} from '../chunks/nF9ceomb.js';
import { o as ut } from '../chunks/DcfkiRxm.js';
import { i as O } from '../chunks/CSEja_gF.js';
import { B as mt } from '../chunks/BSRLHI0b.js';
import { p } from '../chunks/Bnrm6cmT.js';
function j(s, t, a) {
  Y && G();
  var o = new mt(s);
  J(() => {
    var n = t() ?? null;
    o.ensure(n, n && ((e) => a(e, n)));
  }, Q);
}
function dt(s) {
  return class extends ft {
    constructor(t) {
      super({ component: s, ...t });
    }
  };
}
class ft {
  #e;
  #t;
  constructor(t) {
    var a = new Map(),
      o = (e, r) => {
        var i = H(r, !1, !1);
        return (a.set(e, i), i);
      };
    const n = new Proxy(
      { ...(t.props || {}), $$events: {} },
      {
        get(e, r) {
          return u(a.get(r) ?? o(r, Reflect.get(e, r)));
        },
        has(e, r) {
          return r === Z
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
      (!t?.props?.$$host || t.sync === !1) && q(),
      (this.#e = n.$$events));
    for (const e of Object.keys(this.#t))
      e === '$set' ||
        e === '$destroy' ||
        e === '$on' ||
        z(this, e, {
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
var lt = T(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  _t = T('<!> <!>', 1);
function ht(s, t) {
  K(t, !0);
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
          (f, l) => {
            E(
              l(f, {
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
          (f, l) => {
            E(
              l(f, {
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
      var m = lt(),
        d = et(m);
      {
        var h = (f) => {
          var l = ct();
          (at(() => it(l, u(i))), _(f, l));
        };
        O(d, (f) => {
          u(r) && f(h);
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
        () => import('../nodes/0.BmT17Oih.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/1.VIYq_tZy.js'),
        __vite__mapDeps([10, 1, 2, 11, 8, 12]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/2.DD7g9ghc.js'),
        __vite__mapDeps([13, 1, 2, 14, 4, 6, 5, 15, 12]),
        import.meta.url,
      ),
    () =>
      v(
        () => import('../nodes/3.CSpNr_ws.js'),
        __vite__mapDeps([16, 1, 2, 17, 15, 3, 4, 5, 14]),
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
