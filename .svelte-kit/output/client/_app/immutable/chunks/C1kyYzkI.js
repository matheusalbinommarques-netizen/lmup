import {
  am as X,
  F as $,
  M as W,
  h as Q,
  e as Z,
  an as H,
  q as U,
  v as u,
  o as d,
  Y as v,
  b as ee,
  y as G,
  I as B,
  H as te,
  n as p,
  ao as A,
  l as k,
  m as b,
  ap as O,
  aq as E,
  ar as V,
  as as re,
  at as M,
  d as j,
  w as se,
  K as ne,
  k as C,
  B as w,
  a4 as ie,
  A as ae,
  au as Y,
  av as oe,
  E as fe,
  aw as le,
  ax as ue,
  ay as he,
  ai as de,
  D as N,
  az as ce,
  aA as _e,
  aB as pe,
  aC as ve,
  aD as I,
  aE as ge,
  T as me,
  aF as x,
  C as S,
  aG as ye,
  V as Ee,
  R as Te,
  aH as be,
  p as we,
  J as Ne,
  aI as Re,
  a as Ae,
} from './BOOFhtRP.js';
function Se(t) {
  let e = 0,
    r = W(0),
    i;
  return () => {
    X() &&
      ($(r),
      Q(
        () => (
          e === 0 && (i = Z(() => t(() => H(r)))),
          (e += 1),
          () => {
            U(() => {
              ((e -= 1), e === 0 && (i?.(), (i = void 0), H(r)));
            });
          }
        ),
      ));
  };
}
var De = fe | le | ue;
function Oe(t, e, r) {
  new Fe(t, e, r);
}
class Fe {
  parent;
  #r = !1;
  #t;
  #v = d ? u : null;
  #n;
  #h;
  #i;
  #s = null;
  #e = null;
  #a = null;
  #o = null;
  #f = null;
  #d = 0;
  #l = 0;
  #c = !1;
  #u = null;
  #y = Se(
    () => (
      (this.#u = W(this.#d)),
      () => {
        this.#u = null;
      }
    ),
  );
  constructor(e, r, i) {
    ((this.#t = e),
      (this.#n = r),
      (this.#h = i),
      (this.parent = v.b),
      (this.#r = !!this.#n.pending),
      (this.#i = ee(() => {
        if (((v.b = this), d)) {
          const s = this.#v;
          (G(), s.nodeType === B && s.data === te ? this.#T() : this.#E());
        } else {
          var n = this.#g();
          try {
            this.#s = p(() => i(n));
          } catch (s) {
            this.error(s);
          }
          this.#l > 0 ? this.#p() : (this.#r = !1);
        }
        return () => {
          this.#f?.remove();
        };
      }, De)),
      d && (this.#t = u));
  }
  #E() {
    try {
      this.#s = p(() => this.#h(this.#t));
    } catch (e) {
      this.error(e);
    }
    this.#r = !1;
  }
  #T() {
    const e = this.#n.pending;
    e &&
      ((this.#e = p(() => e(this.#t))),
      A.enqueue(() => {
        var r = this.#g();
        ((this.#s = this.#_(() => (A.ensure(), p(() => this.#h(r))))),
          this.#l > 0
            ? this.#p()
            : (k(this.#e, () => {
                this.#e = null;
              }),
              (this.#r = !1)));
      }));
  }
  #g() {
    var e = this.#t;
    return (
      this.#r && ((this.#f = b()), this.#t.before(this.#f), (e = this.#f)),
      e
    );
  }
  is_pending() {
    return this.#r || (!!this.parent && this.parent.is_pending());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  #_(e) {
    var r = v,
      i = M,
      n = j;
    (O(this.#i), E(this.#i), V(this.#i.ctx));
    try {
      return e();
    } catch (s) {
      return (re(s), null);
    } finally {
      (O(r), E(i), V(n));
    }
  }
  #p() {
    const e = this.#n.pending;
    (this.#s !== null &&
      ((this.#o = document.createDocumentFragment()),
      this.#o.append(this.#f),
      se(this.#s, this.#o)),
      this.#e === null && (this.#e = p(() => e(this.#t))));
  }
  #m(e) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(e);
      return;
    }
    ((this.#l += e),
      this.#l === 0 &&
        ((this.#r = !1),
        this.#e &&
          k(this.#e, () => {
            this.#e = null;
          }),
        this.#o && (this.#t.before(this.#o), (this.#o = null))));
  }
  update_pending_count(e) {
    (this.#m(e), (this.#d += e), this.#u && ne(this.#u, this.#d));
  }
  get_effect_pending() {
    return (this.#y(), $(this.#u));
  }
  error(e) {
    var r = this.#n.onerror;
    let i = this.#n.failed;
    if (this.#c || (!r && !i)) throw e;
    (this.#s && (C(this.#s), (this.#s = null)),
      this.#e && (C(this.#e), (this.#e = null)),
      this.#a && (C(this.#a), (this.#a = null)),
      d && (w(this.#v), ie(), w(ae())));
    var n = !1,
      s = !1;
    const a = () => {
      if (n) {
        he();
        return;
      }
      ((n = !0),
        s && oe(),
        A.ensure(),
        (this.#d = 0),
        this.#a !== null &&
          k(this.#a, () => {
            this.#a = null;
          }),
        (this.#r = this.has_pending_snippet()),
        (this.#s = this.#_(() => ((this.#c = !1), p(() => this.#h(this.#t))))),
        this.#l > 0 ? this.#p() : (this.#r = !1));
    };
    var h = M;
    try {
      (E(null), (s = !0), r?.(e, a), (s = !1));
    } catch (o) {
      Y(o, this.#i && this.#i.parent);
    } finally {
      E(h);
    }
    i &&
      U(() => {
        this.#a = this.#_(() => {
          (A.ensure(), (this.#c = !0));
          try {
            return p(() => {
              i(
                this.#t,
                () => e,
                () => a,
              );
            });
          } catch (o) {
            return (Y(o, this.#i.parent), null);
          } finally {
            this.#c = !1;
          }
        });
      });
  }
}
const ke = ['touchstart', 'touchmove'];
function Ce(t) {
  return ke.includes(t);
}
const z = new Set(),
  L = new Set();
function Pe(t) {
  for (var e = 0; e < t.length; e++) z.add(t[e]);
  for (var r of L) r(t);
}
let q = null;
function D(t) {
  var e = this,
    r = e.ownerDocument,
    i = t.type,
    n = t.composedPath?.() || [],
    s = n[0] || t.target;
  q = t;
  var a = 0,
    h = q === t && t.__root;
  if (h) {
    var o = n.indexOf(h);
    if (o !== -1 && (e === document || e === window)) {
      t.__root = e;
      return;
    }
    var g = n.indexOf(e);
    if (g === -1) return;
    o <= g && (a = o);
  }
  if (((s = n[a] || t.target), s !== e)) {
    de(t, 'currentTarget', {
      configurable: !0,
      get() {
        return s || r;
      },
    });
    var F = M,
      _ = v;
    (E(null), O(null));
    try {
      for (var f, l = []; s !== null; ) {
        var m = s.assignedSlot || s.parentNode || s.host || null;
        try {
          var T = s['__' + i];
          T != null && (!s.disabled || t.target === s) && T.call(s, t);
        } catch (R) {
          f ? l.push(R) : (f = R);
        }
        if (t.cancelBubble || m === e || m === null) break;
        s = m;
      }
      if (f) {
        for (let R of l)
          queueMicrotask(() => {
            throw R;
          });
        throw f;
      }
    } finally {
      ((t.__root = e), delete t.currentTarget, E(F), O(_));
    }
  }
}
function J(t) {
  var e = document.createElement('template');
  return ((e.innerHTML = t.replaceAll('<!>', '<!---->')), e.content);
}
function c(t, e) {
  var r = v;
  r.nodes_start === null && ((r.nodes_start = t), (r.nodes_end = e));
}
function Be(t, e) {
  var r = (e & _e) !== 0,
    i = (e & pe) !== 0,
    n,
    s = !t.startsWith('<!>');
  return () => {
    if (d) return (c(u, null), u);
    n === void 0 && ((n = J(s ? t : '<!>' + t)), r || (n = N(n)));
    var a = i || ce ? document.importNode(n, !0) : n.cloneNode(!0);
    if (r) {
      var h = N(a),
        o = a.lastChild;
      c(h, o);
    } else c(a, a);
    return a;
  };
}
function Me(t, e, r = 'svg') {
  var i = !t.startsWith('<!>'),
    n = `<${r}>${i ? t : '<!>' + t}</${r}>`,
    s;
  return () => {
    if (d) return (c(u, null), u);
    if (!s) {
      var a = J(n),
        h = N(a);
      s = N(h);
    }
    var o = s.cloneNode(!0);
    return (c(o, o), o);
  };
}
function He(t, e) {
  return Me(t, e, 'svg');
}
function Ve(t = '') {
  if (!d) {
    var e = b(t + '');
    return (c(e, e), e);
  }
  var r = u;
  return (r.nodeType !== ve && (r.before((r = b())), w(r)), c(r, r), r);
}
function Ye() {
  if (d) return (c(u, null), u);
  var t = document.createDocumentFragment(),
    e = document.createComment(''),
    r = b();
  return (t.append(e, r), c(e, r), t);
}
function qe(t, e) {
  if (d) {
    ((v.nodes_end = u), G());
    return;
  }
  t !== null && t.before(e);
}
function $e(t, e) {
  var r = e == null ? '' : typeof e == 'object' ? e + '' : e;
  r !== (t.__t ??= t.nodeValue) && ((t.__t = r), (t.nodeValue = r + ''));
}
function Ie(t, e) {
  return K(t, e);
}
function We(t, e) {
  (I(), (e.intro = e.intro ?? !1));
  const r = e.target,
    i = d,
    n = u;
  try {
    for (var s = N(r); s && (s.nodeType !== B || s.data !== ge); ) s = me(s);
    if (!s) throw x;
    (S(!0), w(s));
    const a = K(t, { ...e, anchor: s });
    return (S(!1), a);
  } catch (a) {
    if (
      a instanceof Error &&
      a.message
        .split(
          `
`,
        )
        .some((h) => h.startsWith('https://svelte.dev/e/'))
    )
      throw a;
    return (
      a !== x && console.warn('Failed to hydrate: ', a),
      e.recover === !1 && ye(),
      I(),
      Ee(r),
      S(!1),
      Ie(t, e)
    );
  } finally {
    (S(i), w(n));
  }
}
const y = new Map();
function K(
  t,
  { target: e, anchor: r, props: i = {}, events: n, context: s, intro: a = !0 },
) {
  I();
  var h = new Set(),
    o = (_) => {
      for (var f = 0; f < _.length; f++) {
        var l = _[f];
        if (!h.has(l)) {
          h.add(l);
          var m = Ce(l);
          e.addEventListener(l, D, { passive: m });
          var T = y.get(l);
          T === void 0
            ? (document.addEventListener(l, D, { passive: m }), y.set(l, 1))
            : y.set(l, T + 1);
        }
      }
    };
  (o(Te(z)), L.add(o));
  var g = void 0,
    F = be(() => {
      var _ = r ?? e.appendChild(b());
      return (
        Oe(_, { pending: () => {} }, (f) => {
          if (s) {
            we({});
            var l = j;
            l.c = s;
          }
          if (
            (n && (i.$$events = n),
            d && c(f, null),
            (g = t(f, i) || {}),
            d &&
              ((v.nodes_end = u),
              u === null || u.nodeType !== B || u.data !== Ne))
          )
            throw (Re(), x);
          s && Ae();
        }),
        () => {
          for (var f of h) {
            e.removeEventListener(f, D);
            var l = y.get(f);
            --l === 0
              ? (document.removeEventListener(f, D), y.delete(f))
              : y.set(f, l);
          }
          (L.delete(o), _ !== r && _.parentNode?.removeChild(_));
        }
      );
    });
  return (P.set(g, F), g);
}
let P = new WeakMap();
function Ue(t, e) {
  const r = P.get(t);
  return r ? (P.delete(t), r(e)) : Promise.resolve();
}
const xe = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(xe);
export {
  qe as a,
  He as b,
  Ye as c,
  Pe as d,
  Be as f,
  We as h,
  Ie as m,
  $e as s,
  Ve as t,
  Ue as u,
};
