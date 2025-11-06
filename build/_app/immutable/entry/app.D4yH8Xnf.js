const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.MfPg2JXm.js',
      '../chunks/SxYe2BIq.js',
      '../chunks/BPaWsL2e.js',
      '../chunks/ng_QQE3h.js',
      '../chunks/C1WXZ3Vt.js',
      '../chunks/CtSESMLm.js',
      '../chunks/DrxTEHBA.js',
      '../chunks/DEeyeSJ_.js',
      '../assets/0.Bj2VYEzb.css',
      '../nodes/1.D9FnGhPL.js',
      '../nodes/2.CRFw2mkM.js',
      '../chunks/xkCiEyuq.js',
      '../chunks/BwBkY9_K.js',
      '../nodes/3.BuNgSWVE.js',
      '../chunks/fHmphQVd.js',
    ]),
) => i.map((i) => d[i]);
import { b as x, _ as S } from '../chunks/fHmphQVd.js';
import {
  h as q,
  d as z,
  b as G,
  E as Q,
  a7 as X,
  a8 as H,
  a9 as J,
  m as _,
  aa as K,
  n as W,
  ab as p,
  _ as E,
  ac as $,
  Q as ee,
  ad as te,
  ae as re,
  X as ae,
  af as se,
  ag as ne,
  Y as ie,
  ah as Y,
  ai as oe,
  aj as ce,
  y as ue,
  p as fe,
  ak as de,
  al as _e,
  Z as le,
  $ as L,
  am as me,
  f as A,
  s as ve,
  a as he,
  c as ge,
  r as be,
  a6 as D,
  t as ye,
} from '../chunks/BPaWsL2e.js';
import {
  h as Ee,
  m as Pe,
  u as Oe,
  f as N,
  a as b,
  c as w,
  t as Re,
  s as Se,
} from '../chunks/SxYe2BIq.js';
import { i as j } from '../chunks/xkCiEyuq.js';
import { B as Ae } from '../chunks/ng_QQE3h.js';
function B(t, e, s) {
  q && z();
  var i = new Ae(t);
  G(() => {
    var n = e() ?? null;
    i.ensure(n, n && ((r) => s(r, n)));
  }, Q);
}
let I = !1;
function Ie(t) {
  var e = I;
  try {
    return ((I = !1), [t(), I]);
  } finally {
    I = e;
  }
}
function M(t, e, s, i) {
  var n = (s & re) !== 0,
    r = (s & ne) !== 0,
    a = i,
    u = !0,
    P = () => (u && ((u = !1), (a = r ? ae(i) : i)), a),
    v;
  if (n) {
    var O = ie in t || Y in t;
    v = X(t, e)?.set ?? (O && e in t ? (o) => (t[e] = o) : void 0);
  }
  var h,
    R = !1;
  (n ? ([h, R] = Ie(() => t[e])) : (h = t[e]),
    h === void 0 && i !== void 0 && ((h = P()), v && (H(), v(h))));
  var g;
  if (
    ((g = () => {
      var o = t[e];
      return o === void 0 ? P() : ((u = !0), o);
    }),
    (s & J) === 0)
  )
    return g;
  if (v) {
    var T = t.$$legacy;
    return function (o, d) {
      return arguments.length > 0 ? ((!d || T || R) && v(d ? g() : o), o) : g();
    };
  }
  var c = !1,
    f = ((s & se) !== 0 ? K : W)(() => ((c = !1), g()));
  n && _(f);
  var l = ee;
  return function (o, d) {
    if (arguments.length > 0) {
      const m = d ? _(f) : n ? p(o) : o;
      return (E(f, m), (c = !0), a !== void 0 && (a = m), o);
    }
    return ($ && c) || (l.f & te) !== 0 ? f.v : _(f);
  };
}
function Te(t) {
  return class extends xe {
    constructor(e) {
      super({ component: t, ...e });
    }
  };
}
class xe {
  #t;
  #e;
  constructor(e) {
    var s = new Map(),
      i = (r, a) => {
        var u = ue(a, !1, !1);
        return (s.set(r, u), u);
      };
    const n = new Proxy(
      { ...(e.props || {}), $$events: {} },
      {
        get(r, a) {
          return _(s.get(a) ?? i(a, Reflect.get(r, a)));
        },
        has(r, a) {
          return a === Y
            ? !0
            : (_(s.get(a) ?? i(a, Reflect.get(r, a))), Reflect.has(r, a));
        },
        set(r, a, u) {
          return (E(s.get(a) ?? i(a, u), u), Reflect.set(r, a, u));
        },
      },
    );
    ((this.#e = (e.hydrate ? Ee : Pe)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: n,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
    })),
      (!e?.props?.$$host || e.sync === !1) && oe(),
      (this.#t = n.$$events));
    for (const r of Object.keys(this.#e))
      r === '$set' ||
        r === '$destroy' ||
        r === '$on' ||
        ce(this, r, {
          get() {
            return this.#e[r];
          },
          set(a) {
            this.#e[r] = a;
          },
          enumerable: !0,
        });
    ((this.#e.$set = (r) => {
      Object.assign(n, r);
    }),
      (this.#e.$destroy = () => {
        Oe(this.#e);
      }));
  }
  $set(e) {
    this.#e.$set(e);
  }
  $on(e, s) {
    this.#t[e] = this.#t[e] || [];
    const i = (...n) => s.call(this, ...n);
    return (
      this.#t[e].push(i),
      () => {
        this.#t[e] = this.#t[e].filter((n) => n !== i);
      }
    );
  }
  $destroy() {
    this.#e.$destroy();
  }
}
const ke = {};
var Le = N(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  De = N('<!> <!>', 1);
function we(t, e) {
  fe(e, !0);
  let s = M(e, 'components', 23, () => []),
    i = M(e, 'data_0', 3, null),
    n = M(e, 'data_1', 3, null);
  (de(() => e.stores.page.set(e.page)),
    _e(() => {
      (e.stores,
        e.page,
        e.constructors,
        s(),
        e.form,
        i(),
        n(),
        e.stores.page.notify());
    }));
  let r = L(!1),
    a = L(!1),
    u = L(null);
  le(() => {
    const c = e.stores.page.subscribe(() => {
      _(r) &&
        (E(a, !0),
        me().then(() => {
          E(u, document.title || 'untitled page', !0);
        }));
    });
    return (E(r, !0), c);
  });
  const P = D(() => e.constructors[1]);
  var v = De(),
    O = A(v);
  {
    var h = (c) => {
        const f = D(() => e.constructors[0]);
        var l = w(),
          o = A(l);
        (B(
          o,
          () => _(f),
          (d, m) => {
            x(
              m(d, {
                get data() {
                  return i();
                },
                get form() {
                  return e.form;
                },
                get params() {
                  return e.page.params;
                },
                children: (y, Be) => {
                  var C = w(),
                    k = A(C);
                  (B(
                    k,
                    () => _(P),
                    (F, U) => {
                      x(
                        U(F, {
                          get data() {
                            return n();
                          },
                          get form() {
                            return e.form;
                          },
                          get params() {
                            return e.page.params;
                          },
                        }),
                        (Z) => (s()[1] = Z),
                        () => s()?.[1],
                      );
                    },
                  ),
                    b(y, C));
                },
                $$slots: { default: !0 },
              }),
              (y) => (s()[0] = y),
              () => s()?.[0],
            );
          },
        ),
          b(c, l));
      },
      R = (c) => {
        const f = D(() => e.constructors[0]);
        var l = w(),
          o = A(l);
        (B(
          o,
          () => _(f),
          (d, m) => {
            x(
              m(d, {
                get data() {
                  return i();
                },
                get form() {
                  return e.form;
                },
                get params() {
                  return e.page.params;
                },
              }),
              (y) => (s()[0] = y),
              () => s()?.[0],
            );
          },
        ),
          b(c, l));
      };
    j(O, (c) => {
      e.constructors[1] ? c(h) : c(R, !1);
    });
  }
  var g = ve(O, 2);
  {
    var T = (c) => {
      var f = Le(),
        l = ge(f);
      {
        var o = (d) => {
          var m = Re();
          (ye(() => Se(m, _(u))), b(d, m));
        };
        j(l, (d) => {
          _(a) && d(o);
        });
      }
      (be(f), b(c, f));
    };
    j(g, (c) => {
      _(r) && c(T);
    });
  }
  (b(t, v), he());
}
const Fe = Te(we),
  Ue = [
    () =>
      S(
        () => import('../nodes/0.MfPg2JXm.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/1.D9FnGhPL.js'),
        __vite__mapDeps([9, 1, 2, 6, 7]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/2.CRFw2mkM.js'),
        __vite__mapDeps([10, 1, 2, 5, 11, 3, 4, 12]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/3.BuNgSWVE.js'),
        __vite__mapDeps([13, 1, 2, 5, 14, 12]),
        import.meta.url,
      ),
  ],
  Ze = [],
  qe = { '/': [2], '/config': [3] },
  V = {
    handleError: ({ error: t }) => {
      console.error(t);
    },
    reroute: () => {},
    transport: {},
  },
  je = Object.fromEntries(
    Object.entries(V.transport).map(([t, e]) => [t, e.decode]),
  ),
  ze = Object.fromEntries(
    Object.entries(V.transport).map(([t, e]) => [t, e.encode]),
  ),
  Ge = !1,
  Qe = (t, e) => je[t](e);
export {
  Qe as decode,
  je as decoders,
  qe as dictionary,
  ze as encoders,
  Ge as hash,
  V as hooks,
  ke as matchers,
  Ue as nodes,
  Fe as root,
  Ze as server_loads,
};
