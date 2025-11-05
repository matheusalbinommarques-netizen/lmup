const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.zmJcXg7n.js',
      '../chunks/C1kyYzkI.js',
      '../chunks/BOOFhtRP.js',
      '../chunks/B0kYkVBN.js',
      '../chunks/Dt4_cxAB.js',
      '../chunks/B0aBMHRA.js',
      '../chunks/5aiaHk4R.js',
      '../chunks/DG4W8TUH.js',
      '../chunks/CUIkxFFA.js',
      '../chunks/DXa1qAe1.js',
      '../assets/BottomNav.tn0RQdqM.css',
      '../assets/0.Ca4sUYCK.css',
      '../nodes/1.D8QpRbdO.js',
      '../nodes/2.ChznuR9a.js',
      '../chunks/BwBkY9_K.js',
      '../nodes/3.CW7qXNoq.js',
      '../chunks/BO-jLNdh.js',
    ]),
) => i.map((i) => d[i]);
import { b as x, _ as S } from '../chunks/BO-jLNdh.js';
import {
  o as Z,
  y as q,
  b as z,
  E as H,
  a5 as J,
  a6 as K,
  a7 as Q,
  F as _,
  a8 as W,
  G as X,
  a9 as p,
  aa as E,
  ab as $,
  Y as ee,
  ac as te,
  ad as re,
  e as ae,
  ae as se,
  af as ne,
  S as ie,
  ag as Y,
  ah as oe,
  ai as ce,
  L as ue,
  p as fe,
  aj as de,
  u as _e,
  ak as L,
  al as le,
  f as A,
  s as me,
  a as ve,
  c as he,
  r as ge,
  Z as D,
  t as be,
} from '../chunks/BOOFhtRP.js';
import {
  h as ye,
  m as Ee,
  u as Pe,
  f as N,
  a as b,
  c as w,
  t as Oe,
  s as Re,
} from '../chunks/C1kyYzkI.js';
import { o as Se } from '../chunks/DXa1qAe1.js';
import { B as Ae, i as j } from '../chunks/Dt4_cxAB.js';
function B(t, e, s) {
  Z && q();
  var i = new Ae(t);
  z(() => {
    var n = e() ?? null;
    i.ensure(n, n && ((r) => s(r, n)));
  }, H);
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
    v = J(t, e)?.set ?? (O && e in t ? (o) => (t[e] = o) : void 0);
  }
  var h,
    R = !1;
  (n ? ([h, R] = Ie(() => t[e])) : (h = t[e]),
    h === void 0 && i !== void 0 && ((h = P()), v && (K(), v(h))));
  var g;
  if (
    ((g = () => {
      var o = t[e];
      return o === void 0 ? P() : ((u = !0), o);
    }),
    (s & Q) === 0)
  )
    return g;
  if (v) {
    var T = t.$$legacy;
    return function (o, d) {
      return arguments.length > 0 ? ((!d || T || R) && v(d ? g() : o), o) : g();
    };
  }
  var c = !1,
    f = ((s & se) !== 0 ? W : X)(() => ((c = !1), g()));
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
    ((this.#e = (e.hydrate ? ye : Ee)(e.component, {
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
        Pe(this.#e);
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
  Se(() => {
    const c = e.stores.page.subscribe(() => {
      _(r) &&
        (E(a, !0),
        le().then(() => {
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
                    (F, G) => {
                      x(
                        G(F, {
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
                        (U) => (s()[1] = U),
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
  var g = me(O, 2);
  {
    var T = (c) => {
      var f = Le(),
        l = he(f);
      {
        var o = (d) => {
          var m = Oe();
          (be(() => Re(m, _(u))), b(d, m));
        };
        j(l, (d) => {
          _(a) && d(o);
        });
      }
      (ge(f), b(c, f));
    };
    j(g, (c) => {
      _(r) && c(T);
    });
  }
  (b(t, v), ve());
}
const Fe = Te(we),
  Ge = [
    () =>
      S(
        () => import('../nodes/0.zmJcXg7n.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/1.D8QpRbdO.js'),
        __vite__mapDeps([12, 1, 2, 7, 8, 9]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/2.ChznuR9a.js'),
        __vite__mapDeps([13, 1, 2, 9, 6, 4, 5, 7, 8, 10, 14]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/3.CW7qXNoq.js'),
        __vite__mapDeps([15, 1, 2, 16, 14, 3, 4, 6]),
        import.meta.url,
      ),
  ],
  Ue = [],
  Ze = { '/': [2], '/config': [3] },
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
  qe = Object.fromEntries(
    Object.entries(V.transport).map(([t, e]) => [t, e.encode]),
  ),
  ze = !1,
  He = (t, e) => je[t](e);
export {
  He as decode,
  je as decoders,
  Ze as dictionary,
  qe as encoders,
  ze as hash,
  V as hooks,
  ke as matchers,
  Ge as nodes,
  Fe as root,
  Ue as server_loads,
};
