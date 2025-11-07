import {
  aa as z,
  k as Y,
  U as q,
  v as G,
  u as K,
  w as B,
  ab as H,
  f as c,
  h as _,
  a3 as b,
  G as Q,
  H as Z,
  Q as P,
  K as J,
  e as d,
  ac as T,
  p as O,
  b as j,
  ad as N,
  ae as y,
  af as I,
  ag as X,
  ah as D,
  y as U,
  m as tt,
  T as et,
  d as A,
  O as S,
  a4 as st,
  M as rt,
  ai as L,
  aj as it,
  ak as nt,
  al as at,
  am as ht,
  an as ot,
  i as lt,
  ao as F,
  a5 as ft,
  ap as ut,
  _ as dt,
  aq as C,
  P as w,
  ar as ct,
  a0 as _t,
  Z as pt,
  as as gt,
  z as vt,
  R as yt,
  at as mt,
  C as bt,
} from './B9t7ERLA.js';
import { b as Et } from './CTOClj_W.js';
function Tt(e) {
  let t = 0,
    r = q(0),
    i;
  return () => {
    z() &&
      (Y(r),
      G(
        () => (
          t === 0 && (i = K(() => e(() => H(r)))),
          (t += 1),
          () => {
            B(() => {
              ((t -= 1), t === 0 && (i?.(), (i = void 0), H(r)));
            });
          }
        ),
      ));
  };
}
var wt = nt | at | ht;
function Rt(e, t, r) {
  new Nt(e, t, r);
}
class Nt {
  parent;
  #s = !1;
  #e;
  #g = _ ? c : null;
  #i;
  #u;
  #n;
  #r = null;
  #t = null;
  #a = null;
  #h = null;
  #o = null;
  #d = 0;
  #l = 0;
  #c = !1;
  #f = null;
  #m = Tt(
    () => (
      (this.#f = q(this.#d)),
      () => {
        this.#f = null;
      }
    ),
  );
  constructor(t, r, i) {
    ((this.#e = t),
      (this.#i = r),
      (this.#u = i),
      (this.parent = b.b),
      (this.#s = !!this.#i.pending),
      (this.#n = Q(() => {
        if (((b.b = this), _)) {
          const s = this.#g;
          (Z(), s.nodeType === P && s.data === J ? this.#E() : this.#b());
        } else {
          var a = this.#v();
          try {
            this.#r = d(() => i(a));
          } catch (s) {
            this.error(s);
          }
          this.#l > 0 ? this.#p() : (this.#s = !1);
        }
        return () => {
          this.#o?.remove();
        };
      }, wt)),
      _ && (this.#e = c));
  }
  #b() {
    try {
      this.#r = d(() => this.#u(this.#e));
    } catch (t) {
      this.error(t);
    }
    this.#s = !1;
  }
  #E() {
    const t = this.#i.pending;
    t &&
      ((this.#t = d(() => t(this.#e))),
      T.enqueue(() => {
        var r = this.#v();
        ((this.#r = this.#_(() => (T.ensure(), d(() => this.#u(r))))),
          this.#l > 0
            ? this.#p()
            : (O(this.#t, () => {
                this.#t = null;
              }),
              (this.#s = !1)));
      }));
  }
  #v() {
    var t = this.#e;
    return (
      this.#s && ((this.#o = j()), this.#e.before(this.#o), (t = this.#o)),
      t
    );
  }
  is_pending() {
    return this.#s || (!!this.parent && this.parent.is_pending());
  }
  has_pending_snippet() {
    return !!this.#i.pending;
  }
  #_(t) {
    var r = b,
      i = D,
      a = U;
    (N(this.#n), y(this.#n), I(this.#n.ctx));
    try {
      return t();
    } catch (s) {
      return (X(s), null);
    } finally {
      (N(r), y(i), I(a));
    }
  }
  #p() {
    const t = this.#i.pending;
    (this.#r !== null &&
      ((this.#h = document.createDocumentFragment()),
      this.#h.append(this.#o),
      tt(this.#r, this.#h)),
      this.#t === null && (this.#t = d(() => t(this.#e))));
  }
  #y(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t);
      return;
    }
    ((this.#l += t),
      this.#l === 0 &&
        ((this.#s = !1),
        this.#t &&
          O(this.#t, () => {
            this.#t = null;
          }),
        this.#h && (this.#e.before(this.#h), (this.#h = null))));
  }
  update_pending_count(t) {
    (this.#y(t), (this.#d += t), this.#f && et(this.#f, this.#d));
  }
  get_effect_pending() {
    return (this.#m(), Y(this.#f));
  }
  error(t) {
    var r = this.#i.onerror;
    let i = this.#i.failed;
    if (this.#c || (!r && !i)) throw t;
    (this.#r && (A(this.#r), (this.#r = null)),
      this.#t && (A(this.#t), (this.#t = null)),
      this.#a && (A(this.#a), (this.#a = null)),
      _ && (S(this.#g), st(), S(rt())));
    var a = !1,
      s = !1;
    const o = () => {
      if (a) {
        ot();
        return;
      }
      ((a = !0),
        s && it(),
        T.ensure(),
        (this.#d = 0),
        this.#a !== null &&
          O(this.#a, () => {
            this.#a = null;
          }),
        (this.#s = this.has_pending_snippet()),
        (this.#r = this.#_(() => ((this.#c = !1), d(() => this.#u(this.#e))))),
        this.#l > 0 ? this.#p() : (this.#s = !1));
    };
    var f = D;
    try {
      (y(null), (s = !0), r?.(t, o), (s = !1));
    } catch (l) {
      L(l, this.#n && this.#n.parent);
    } finally {
      y(f);
    }
    i &&
      B(() => {
        this.#a = this.#_(() => {
          (T.ensure(), (this.#c = !0));
          try {
            return d(() => {
              i(
                this.#e,
                () => t,
                () => o,
              );
            });
          } catch (l) {
            return (L(l, this.#n.parent), null);
          } finally {
            this.#c = !1;
          }
        });
      });
  }
}
const St = ['touchstart', 'touchmove'];
function kt(e) {
  return St.includes(e);
}
const W = new Set(),
  x = new Set();
function Ft(e) {
  for (var t = 0; t < e.length; t++) W.add(e[t]);
  for (var r of x) r(e);
}
let V = null;
function R(e) {
  var t = this,
    r = t.ownerDocument,
    i = e.type,
    a = e.composedPath?.() || [],
    s = a[0] || e.target;
  V = e;
  var o = 0,
    f = V === e && e.__root;
  if (f) {
    var l = a.indexOf(f);
    if (l !== -1 && (t === document || t === window)) {
      e.__root = t;
      return;
    }
    var p = a.indexOf(t);
    if (p === -1) return;
    l <= p && (o = l);
  }
  if (((s = a[o] || e.target), s !== t)) {
    lt(e, 'currentTarget', {
      configurable: !0,
      get() {
        return s || r;
      },
    });
    var k = D,
      u = b;
    (y(null), N(null));
    try {
      for (var n, h = []; s !== null; ) {
        var g = s.assignedSlot || s.parentNode || s.host || null;
        try {
          var m = s['__' + i];
          m != null && (!s.disabled || e.target === s) && m.call(s, e);
        } catch (E) {
          n ? h.push(E) : (n = E);
        }
        if (e.cancelBubble || g === t || g === null) break;
        s = g;
      }
      if (n) {
        for (let E of h)
          queueMicrotask(() => {
            throw E;
          });
        throw n;
      }
    } finally {
      ((e.__root = t), delete e.currentTarget, y(k), N(u));
    }
  }
}
function Ct(e, t) {
  var r = t == null ? '' : typeof t == 'object' ? t + '' : t;
  r !== (e.__t ??= e.nodeValue) && ((e.__t = r), (e.nodeValue = r + ''));
}
function Ot(e, t) {
  return $(e, t);
}
function xt(e, t) {
  (F(), (t.intro = t.intro ?? !1));
  const r = t.target,
    i = _,
    a = c;
  try {
    for (var s = ft(r); s && (s.nodeType !== P || s.data !== ut); ) s = dt(s);
    if (!s) throw C;
    (w(!0), S(s));
    const o = $(e, { ...t, anchor: s });
    return (w(!1), o);
  } catch (o) {
    if (
      o instanceof Error &&
      o.message
        .split(
          `
`,
        )
        .some((f) => f.startsWith('https://svelte.dev/e/'))
    )
      throw o;
    return (
      o !== C && console.warn('Failed to hydrate: ', o),
      t.recover === !1 && ct(),
      F(),
      _t(r),
      w(!1),
      Ot(e, t)
    );
  } finally {
    (w(i), S(a));
  }
}
const v = new Map();
function $(
  e,
  { target: t, anchor: r, props: i = {}, events: a, context: s, intro: o = !0 },
) {
  F();
  var f = new Set(),
    l = (u) => {
      for (var n = 0; n < u.length; n++) {
        var h = u[n];
        if (!f.has(h)) {
          f.add(h);
          var g = kt(h);
          t.addEventListener(h, R, { passive: g });
          var m = v.get(h);
          m === void 0
            ? (document.addEventListener(h, R, { passive: g }), v.set(h, 1))
            : v.set(h, m + 1);
        }
      }
    };
  (l(pt(W)), x.add(l));
  var p = void 0,
    k = gt(() => {
      var u = r ?? t.appendChild(j());
      return (
        Rt(u, { pending: () => {} }, (n) => {
          if (s) {
            vt({});
            var h = U;
            h.c = s;
          }
          if (
            (a && (i.$$events = a),
            _ && Et(n, null),
            (p = e(n, i) || {}),
            _ &&
              ((b.nodes_end = c),
              c === null || c.nodeType !== P || c.data !== yt))
          )
            throw (mt(), C);
          s && bt();
        }),
        () => {
          for (var n of f) {
            t.removeEventListener(n, R);
            var h = v.get(n);
            --h === 0
              ? (document.removeEventListener(n, R), v.delete(n))
              : v.set(n, h);
          }
          (x.delete(l), u !== r && u.parentNode?.removeChild(u));
        }
      );
    });
  return (M.set(p, k), p);
}
let M = new WeakMap();
function Mt(e, t) {
  const r = M.get(e);
  return r ? (M.delete(e), r(t)) : Promise.resolve();
}
export { Ft as d, xt as h, Ot as m, Ct as s, Mt as u };
