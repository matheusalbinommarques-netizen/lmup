import {
  a1 as j,
  e as B,
  a2 as I,
  a3 as U,
  u as $,
  a4 as C,
  Q as M,
  C as u,
  h as c,
  m as b,
  b as z,
  a as Q,
  a5 as D,
  H as Z,
  B as _,
  a6 as g,
  z as R,
  A as V,
  U as S,
  T as v,
  a7 as x,
  a8 as G,
  V as H,
  v as q,
  F as J,
  a9 as K,
  y as w,
  c as E,
  aa as X,
  s as ee,
  ab as L,
  ac as te,
  E as se,
  ad as ie,
  ae as ne,
  af as re,
  ag as N,
  ah as ae,
  ai as he,
  aj as oe,
  ak as A,
  d as y,
  al as fe,
  am as le,
  an as de,
  ao as _e,
  W as ue,
  ap as ce,
  aq as pe,
  Z as ge,
} from './dJOEbL3k.js';
import { a as ve, r as Y, h as m, i as ye } from './hCnymrOV.js';
import { b as me } from './DzhFJs4K.js';
function be(i) {
  let e = 0,
    t = I(0),
    n;
  return () => {
    j() &&
      (B(t),
      U(
        () => (
          e === 0 && (n = $(() => i(() => C(t)))),
          (e += 1),
          () => {
            M(() => {
              ((e -= 1), e === 0 && (n?.(), (n = void 0), C(t)));
            });
          }
        ),
      ));
  };
}
var Ee = se | ie | ne;
function Te(i, e, t) {
  new Re(i, e, t);
}
class Re {
  parent;
  #s = !1;
  #t;
  #g = c ? u : null;
  #n;
  #d;
  #r;
  #i = null;
  #e = null;
  #a = null;
  #h = null;
  #o = null;
  #_ = 0;
  #f = 0;
  #u = !1;
  #l = null;
  #m = be(
    () => (
      (this.#l = I(this.#_)),
      () => {
        this.#l = null;
      }
    ),
  );
  constructor(e, t, n) {
    ((this.#t = e),
      (this.#n = t),
      (this.#d = n),
      (this.parent = b.b),
      (this.#s = !!this.#n.pending),
      (this.#r = z(() => {
        if (((b.b = this), c)) {
          const s = this.#g;
          (Q(), s.nodeType === D && s.data === Z ? this.#E() : this.#b());
        } else {
          var o = this.#v();
          try {
            this.#i = _(() => n(o));
          } catch (s) {
            this.error(s);
          }
          this.#f > 0 ? this.#p() : (this.#s = !1);
        }
        return () => {
          this.#o?.remove();
        };
      }, Ee)),
      c && (this.#t = u));
  }
  #b() {
    try {
      this.#i = _(() => this.#d(this.#t));
    } catch (e) {
      this.error(e);
    }
    this.#s = !1;
  }
  #E() {
    const e = this.#n.pending;
    e &&
      ((this.#e = _(() => e(this.#t))),
      g.enqueue(() => {
        var t = this.#v();
        ((this.#i = this.#c(() => (g.ensure(), _(() => this.#d(t))))),
          this.#f > 0
            ? this.#p()
            : (R(this.#e, () => {
                this.#e = null;
              }),
              (this.#s = !1)));
      }));
  }
  #v() {
    var e = this.#t;
    return (
      this.#s && ((this.#o = V()), this.#t.before(this.#o), (e = this.#o)),
      e
    );
  }
  is_pending() {
    return this.#s || (!!this.parent && this.parent.is_pending());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  #c(e) {
    var t = b,
      n = H,
      o = q;
    (S(this.#r), v(this.#r), x(this.#r.ctx));
    try {
      return e();
    } catch (s) {
      return (G(s), null);
    } finally {
      (S(t), v(n), x(o));
    }
  }
  #p() {
    const e = this.#n.pending;
    (this.#i !== null &&
      ((this.#h = document.createDocumentFragment()),
      this.#h.append(this.#o),
      J(this.#i, this.#h)),
      this.#e === null && (this.#e = _(() => e(this.#t))));
  }
  #y(e) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(e);
      return;
    }
    ((this.#f += e),
      this.#f === 0 &&
        ((this.#s = !1),
        this.#e &&
          R(this.#e, () => {
            this.#e = null;
          }),
        this.#h && (this.#t.before(this.#h), (this.#h = null))));
  }
  update_pending_count(e) {
    (this.#y(e), (this.#_ += e), this.#l && K(this.#l, this.#_));
  }
  get_effect_pending() {
    return (this.#m(), B(this.#l));
  }
  error(e) {
    var t = this.#n.onerror;
    let n = this.#n.failed;
    if (this.#u || (!t && !n)) throw e;
    (this.#i && (w(this.#i), (this.#i = null)),
      this.#e && (w(this.#e), (this.#e = null)),
      this.#a && (w(this.#a), (this.#a = null)),
      c && (E(this.#g), X(), E(ee())));
    var o = !1,
      s = !1;
    const a = () => {
      if (o) {
        re();
        return;
      }
      ((o = !0),
        s && te(),
        g.ensure(),
        (this.#_ = 0),
        this.#a !== null &&
          R(this.#a, () => {
            this.#a = null;
          }),
        (this.#s = this.has_pending_snippet()),
        (this.#i = this.#c(() => ((this.#u = !1), _(() => this.#d(this.#t))))),
        this.#f > 0 ? this.#p() : (this.#s = !1));
    };
    var f = H;
    try {
      (v(null), (s = !0), t?.(e, a), (s = !1));
    } catch (l) {
      L(l, this.#r && this.#r.parent);
    } finally {
      v(f);
    }
    n &&
      M(() => {
        this.#a = this.#c(() => {
          (g.ensure(), (this.#u = !0));
          try {
            return _(() => {
              n(
                this.#t,
                () => e,
                () => a,
              );
            });
          } catch (l) {
            return (L(l, this.#r.parent), null);
          } finally {
            this.#u = !1;
          }
        });
      });
  }
}
function De(i, e) {
  var t = e == null ? '' : typeof e == 'object' ? e + '' : e;
  t !== (i.__t ??= i.nodeValue) && ((i.__t = t), (i.nodeValue = t + ''));
}
function we(i, e) {
  return P(i, e);
}
function Fe(i, e) {
  (N(), (e.intro = e.intro ?? !1));
  const t = e.target,
    n = c,
    o = u;
  try {
    for (var s = ae(t); s && (s.nodeType !== D || s.data !== he); ) s = oe(s);
    if (!s) throw A;
    (y(!0), E(s));
    const a = P(i, { ...e, anchor: s });
    return (y(!1), a);
  } catch (a) {
    if (
      a instanceof Error &&
      a.message
        .split(
          `
`,
        )
        .some((f) => f.startsWith('https://svelte.dev/e/'))
    )
      throw a;
    return (
      a !== A && console.warn('Failed to hydrate: ', a),
      e.recover === !1 && fe(),
      N(),
      le(t),
      y(!1),
      we(i, e)
    );
  } finally {
    (y(n), E(o));
  }
}
const p = new Map();
function P(
  i,
  { target: e, anchor: t, props: n = {}, events: o, context: s, intro: a = !0 },
) {
  N();
  var f = new Set(),
    l = (d) => {
      for (var h = 0; h < d.length; h++) {
        var r = d[h];
        if (!f.has(r)) {
          f.add(r);
          var F = ye(r);
          e.addEventListener(r, m, { passive: F });
          var O = p.get(r);
          O === void 0
            ? (document.addEventListener(r, m, { passive: F }), p.set(r, 1))
            : p.set(r, O + 1);
        }
      }
    };
  (l(de(ve)), Y.add(l));
  var T = void 0,
    W = _e(() => {
      var d = t ?? e.appendChild(V());
      return (
        Te(d, { pending: () => {} }, (h) => {
          if (s) {
            ue({});
            var r = q;
            r.c = s;
          }
          if (
            (o && (n.$$events = o),
            c && me(h, null),
            (T = i(h, n) || {}),
            c &&
              ((b.nodes_end = u),
              u === null || u.nodeType !== D || u.data !== ce))
          )
            throw (pe(), A);
          s && ge();
        }),
        () => {
          for (var h of f) {
            e.removeEventListener(h, m);
            var r = p.get(h);
            --r === 0
              ? (document.removeEventListener(h, m), p.delete(h))
              : p.set(h, r);
          }
          (Y.delete(l), d !== t && d.parentNode?.removeChild(d));
        }
      );
    });
  return (k.set(T, W), T);
}
let k = new WeakMap();
function Oe(i, e) {
  const t = k.get(i);
  return t ? (k.delete(i), t(e)) : Promise.resolve();
}
export { Fe as h, we as m, De as s, Oe as u };
