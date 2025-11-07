const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      '../nodes/0.BIzLJ6Uh.js',
      '../chunks/CTOClj_W.js',
      '../chunks/B9t7ERLA.js',
      '../chunks/bGr8mffb.js',
      '../chunks/B0vhlS2c.js',
      '../chunks/E1N5lFGC.js',
      '../chunks/DYDdMpkw.js',
      '../chunks/CKhwVIJ_.js',
      '../chunks/CFHu8sXB.js',
      '../assets/0.Bj5vy2FL.css',
      '../nodes/1.BnHWND9x.js',
      '../chunks/v1vEHNqM.js',
      '../nodes/2.Bysll3dT.js',
      '../chunks/CmYDCv5e.js',
      '../assets/2.rdC8a2QM.css',
      '../nodes/3.Diz163We.js',
      '../chunks/1pLQ6qVO.js',
      '../chunks/CrojtzO5.js',
    ]),
) => i.map((i) => d[i]);
import { b as T, _ as S } from '../chunks/CrojtzO5.js';
import {
  h as C,
  H as N,
  G as Y,
  ak as F,
  J as Z,
  K as Q,
  M as W,
  O as X,
  P as k,
  au as p,
  av as $,
  aw as ee,
  k as d,
  ax as te,
  I as re,
  ay as ae,
  l as P,
  az as se,
  a3 as ne,
  aA as ie,
  aB as oe,
  u as ue,
  aC as ce,
  aD as fe,
  S as _e,
  aE as V,
  aF as de,
  i as le,
  j as me,
  z as ve,
  aG as he,
  x as ge,
  aH as x,
  aI as be,
  A,
  D as Ee,
  C as ye,
  E as Pe,
  F as Oe,
  aJ as D,
  B as Re,
} from '../chunks/B9t7ERLA.js';
import { h as Se, m as Ae, u as Ie, s as Te } from '../chunks/v1vEHNqM.js';
import { f as z, a as E, c as L, t as xe } from '../chunks/CTOClj_W.js';
import { o as De } from '../chunks/CFHu8sXB.js';
import { B as G, c as Le } from '../chunks/bGr8mffb.js';
function w(a, e, s = !1) {
  C && N();
  var n = new G(a),
    i = s ? F : 0;
  function r(t, o) {
    if (C) {
      const l = Z(a) === Q;
      if (t === l) {
        var m = W();
        (X(m), (n.anchor = m), k(!1), n.ensure(t, o), k(!0));
        return;
      }
    }
    n.ensure(t, o);
  }
  Y(() => {
    var t = !1;
    (e((o, m = !0) => {
      ((t = !0), r(m, o));
    }),
      t || r(!1, null));
  }, i);
}
function B(a, e, s) {
  C && N();
  var n = new G(a);
  Y(() => {
    var i = e() ?? null;
    n.ensure(i, i && ((r) => s(r, i)));
  }, F);
}
function j(a, e, s, n) {
  var i = (s & oe) !== 0,
    r = (s & fe) !== 0,
    t = n,
    o = !0,
    m = () => (o && ((o = !1), (t = r ? ue(n) : n)), t),
    l;
  if (i) {
    var O = _e in a || V in a;
    l = p(a, e)?.set ?? (O && e in a ? (u) => (a[e] = u) : void 0);
  }
  var g,
    R = !1;
  (i ? ([g, R] = Le(() => a[e])) : (g = a[e]),
    g === void 0 && n !== void 0 && ((g = m()), l && ($(), l(g))));
  var b;
  if (
    ((b = () => {
      var u = a[e];
      return u === void 0 ? m() : ((o = !0), u);
    }),
    (s & ee) === 0)
  )
    return b;
  if (l) {
    var I = a.$$legacy;
    return function (u, _) {
      return arguments.length > 0 ? ((!_ || I || R) && l(_ ? b() : u), u) : b();
    };
  }
  var c = !1,
    f = ((s & ce) !== 0 ? te : re)(() => ((c = !1), b()));
  i && d(f);
  var v = ne;
  return function (u, _) {
    if (arguments.length > 0) {
      const h = _ ? d(f) : i ? ae(u) : u;
      return (P(f, h), (c = !0), t !== void 0 && (t = h), u);
    }
    return (se && c) || (v.f & ie) !== 0 ? f.v : d(f);
  };
}
function we(a) {
  return class extends Be {
    constructor(e) {
      super({ component: a, ...e });
    }
  };
}
class Be {
  #t;
  #e;
  constructor(e) {
    var s = new Map(),
      n = (r, t) => {
        var o = me(t, !1, !1);
        return (s.set(r, o), o);
      };
    const i = new Proxy(
      { ...(e.props || {}), $$events: {} },
      {
        get(r, t) {
          return d(s.get(t) ?? n(t, Reflect.get(r, t)));
        },
        has(r, t) {
          return t === V
            ? !0
            : (d(s.get(t) ?? n(t, Reflect.get(r, t))), Reflect.has(r, t));
        },
        set(r, t, o) {
          return (P(s.get(t) ?? n(t, o), o), Reflect.set(r, t, o));
        },
      },
    );
    ((this.#e = (e.hydrate ? Se : Ae)(e.component, {
      target: e.target,
      anchor: e.anchor,
      props: i,
      context: e.context,
      intro: e.intro ?? !1,
      recover: e.recover,
    })),
      (!e?.props?.$$host || e.sync === !1) && de(),
      (this.#t = i.$$events));
    for (const r of Object.keys(this.#e))
      r === '$set' ||
        r === '$destroy' ||
        r === '$on' ||
        le(this, r, {
          get() {
            return this.#e[r];
          },
          set(t) {
            this.#e[r] = t;
          },
          enumerable: !0,
        });
    ((this.#e.$set = (r) => {
      Object.assign(i, r);
    }),
      (this.#e.$destroy = () => {
        Ie(this.#e);
      }));
  }
  $set(e) {
    this.#e.$set(e);
  }
  $on(e, s) {
    this.#t[e] = this.#t[e] || [];
    const n = (...i) => s.call(this, ...i);
    return (
      this.#t[e].push(n),
      () => {
        this.#t[e] = this.#t[e].filter((i) => i !== n);
      }
    );
  }
  $destroy() {
    this.#e.$destroy();
  }
}
const Je = {};
var je = z(
    '<div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px"><!></div>',
  ),
  Ce = z('<!> <!>', 1);
function Me(a, e) {
  ve(e, !0);
  let s = j(e, 'components', 23, () => []),
    n = j(e, 'data_0', 3, null),
    i = j(e, 'data_1', 3, null);
  (he(() => e.stores.page.set(e.page)),
    ge(() => {
      (e.stores,
        e.page,
        e.constructors,
        s(),
        e.form,
        n(),
        i(),
        e.stores.page.notify());
    }));
  let r = x(!1),
    t = x(!1),
    o = x(null);
  De(() => {
    const c = e.stores.page.subscribe(() => {
      d(r) &&
        (P(t, !0),
        be().then(() => {
          P(o, document.title || 'untitled page', !0);
        }));
    });
    return (P(r, !0), c);
  });
  const m = D(() => e.constructors[1]);
  var l = Ce(),
    O = A(l);
  {
    var g = (c) => {
        const f = D(() => e.constructors[0]);
        var v = L(),
          u = A(v);
        (B(
          u,
          () => d(f),
          (_, h) => {
            T(
              h(_, {
                get data() {
                  return n();
                },
                get form() {
                  return e.form;
                },
                get params() {
                  return e.page.params;
                },
                children: (y, Ne) => {
                  var M = L(),
                    J = A(M);
                  (B(
                    J,
                    () => d(m),
                    (U, q) => {
                      T(
                        q(U, {
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
                        (K) => (s()[1] = K),
                        () => s()?.[1],
                      );
                    },
                  ),
                    E(y, M));
                },
                $$slots: { default: !0 },
              }),
              (y) => (s()[0] = y),
              () => s()?.[0],
            );
          },
        ),
          E(c, v));
      },
      R = (c) => {
        const f = D(() => e.constructors[0]);
        var v = L(),
          u = A(v);
        (B(
          u,
          () => d(f),
          (_, h) => {
            T(
              h(_, {
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
              (y) => (s()[0] = y),
              () => s()?.[0],
            );
          },
        ),
          E(c, v));
      };
    w(O, (c) => {
      e.constructors[1] ? c(g) : c(R, !1);
    });
  }
  var b = Ee(O, 2);
  {
    var I = (c) => {
      var f = je(),
        v = Pe(f);
      {
        var u = (_) => {
          var h = xe();
          (Re(() => Te(h, d(o))), E(_, h));
        };
        w(v, (_) => {
          d(t) && _(u);
        });
      }
      (Oe(f), E(c, f));
    };
    w(b, (c) => {
      d(r) && c(I);
    });
  }
  (E(a, l), ye());
}
const Ue = we(Me),
  qe = [
    () =>
      S(
        () => import('../nodes/0.BIzLJ6Uh.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/1.BnHWND9x.js'),
        __vite__mapDeps([10, 1, 2, 11, 7, 4, 8]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/2.Bysll3dT.js'),
        __vite__mapDeps([12, 1, 2, 11, 13, 6, 14]),
        import.meta.url,
      ),
    () =>
      S(
        () => import('../nodes/3.Diz163We.js'),
        __vite__mapDeps([15, 16, 1, 2, 8, 11, 13, 5, 6, 17]),
        import.meta.url,
      ),
  ],
  Ke = [],
  Ze = { '/': [2], '/config': [3] },
  H = {
    handleError: ({ error: a }) => {
      console.error(a);
    },
    reroute: () => {},
    transport: {},
  },
  ke = Object.fromEntries(
    Object.entries(H.transport).map(([a, e]) => [a, e.decode]),
  ),
  Qe = Object.fromEntries(
    Object.entries(H.transport).map(([a, e]) => [a, e.encode]),
  ),
  We = !1,
  Xe = (a, e) => ke[a](e);
export {
  Xe as decode,
  ke as decoders,
  Ze as dictionary,
  Qe as encoders,
  We as hash,
  H as hooks,
  Je as matchers,
  qe as nodes,
  Ue as root,
  Ke as server_loads,
};
