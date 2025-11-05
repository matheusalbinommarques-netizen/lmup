import {
  am as K,
  d as j,
  q as G,
  a0 as X,
  L as Q,
  an as H,
  a1 as U,
  j as l,
  h as d,
  G as v,
  b as Z,
  a as W,
  C as B,
  H as ee,
  l as p,
  ao as R,
  u as k,
  c as b,
  ap as D,
  aq as E,
  ar as V,
  as as te,
  at as F,
  _ as z,
  K as re,
  o as se,
  y as C,
  s as w,
  ah as ne,
  f as ie,
  au as q,
  av as ae,
  J as oe,
  aw as fe,
  ax as he,
  ay as le,
  aj as ue,
  g as x,
  az as de,
  aA as ce,
  aB as _e,
  aC as pe,
  aD as L,
  aE as ve,
  z as ge,
  aF as M,
  i as S,
  aG as me,
  B as ye,
  x as Ee,
  aH as Te,
  a7 as be,
  k as we,
  aI as Ne,
  aa as Re,
} from './nNZc3isi.js';
function Se(t) {
  let e = 0,
    r = G(0),
    i;
  return () => {
    K() &&
      (j(r),
      X(
        () => (
          e === 0 && (i = Q(() => t(() => H(r)))),
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
var Ae = oe | fe | he;
function De(t, e, r) {
  new Oe(t, e, r);
}
class Oe {
  parent;
  #r = !1;
  #t;
  #v = d ? l : null;
  #n;
  #u;
  #i;
  #s = null;
  #e = null;
  #a = null;
  #o = null;
  #f = null;
  #d = 0;
  #h = 0;
  #c = !1;
  #l = null;
  #y = Se(
    () => (
      (this.#l = G(this.#d)),
      () => {
        this.#l = null;
      }
    ),
  );
  constructor(e, r, i) {
    ((this.#t = e),
      (this.#n = r),
      (this.#u = i),
      (this.parent = v.b),
      (this.#r = !!this.#n.pending),
      (this.#i = Z(() => {
        if (((v.b = this), d)) {
          const s = this.#v;
          (W(), s.nodeType === B && s.data === ee ? this.#T() : this.#E());
        } else {
          var n = this.#g();
          try {
            this.#s = p(() => i(n));
          } catch (s) {
            this.error(s);
          }
          this.#h > 0 ? this.#p() : (this.#r = !1);
        }
        return () => {
          this.#f?.remove();
        };
      }, Ae)),
      d && (this.#t = l));
  }
  #E() {
    try {
      this.#s = p(() => this.#u(this.#t));
    } catch (e) {
      this.error(e);
    }
    this.#r = !1;
  }
  #T() {
    const e = this.#n.pending;
    e &&
      ((this.#e = p(() => e(this.#t))),
      R.enqueue(() => {
        var r = this.#g();
        ((this.#s = this.#_(() => (R.ensure(), p(() => this.#u(r))))),
          this.#h > 0
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
      i = F,
      n = z;
    (D(this.#i), E(this.#i), V(this.#i.ctx));
    try {
      return e();
    } catch (s) {
      return (te(s), null);
    } finally {
      (D(r), E(i), V(n));
    }
  }
  #p() {
    const e = this.#n.pending;
    (this.#s !== null &&
      ((this.#o = document.createDocumentFragment()),
      this.#o.append(this.#f),
      re(this.#s, this.#o)),
      this.#e === null && (this.#e = p(() => e(this.#t))));
  }
  #m(e) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(e);
      return;
    }
    ((this.#h += e),
      this.#h === 0 &&
        ((this.#r = !1),
        this.#e &&
          k(this.#e, () => {
            this.#e = null;
          }),
        this.#o && (this.#t.before(this.#o), (this.#o = null))));
  }
  update_pending_count(e) {
    (this.#m(e), (this.#d += e), this.#l && se(this.#l, this.#d));
  }
  get_effect_pending() {
    return (this.#y(), j(this.#l));
  }
  error(e) {
    var r = this.#n.onerror;
    let i = this.#n.failed;
    if (this.#c || (!r && !i)) throw e;
    (this.#s && (C(this.#s), (this.#s = null)),
      this.#e && (C(this.#e), (this.#e = null)),
      this.#a && (C(this.#a), (this.#a = null)),
      d && (w(this.#v), ne(), w(ie())));
    var n = !1,
      s = !1;
    const a = () => {
      if (n) {
        le();
        return;
      }
      ((n = !0),
        s && ae(),
        R.ensure(),
        (this.#d = 0),
        this.#a !== null &&
          k(this.#a, () => {
            this.#a = null;
          }),
        (this.#r = this.has_pending_snippet()),
        (this.#s = this.#_(() => ((this.#c = !1), p(() => this.#u(this.#t))))),
        this.#h > 0 ? this.#p() : (this.#r = !1));
    };
    var u = F;
    try {
      (E(null), (s = !0), r?.(e, a), (s = !1));
    } catch (h) {
      q(h, this.#i && this.#i.parent);
    } finally {
      E(u);
    }
    i &&
      U(() => {
        this.#a = this.#_(() => {
          (R.ensure(), (this.#c = !0));
          try {
            return p(() => {
              i(
                this.#t,
                () => e,
                () => a,
              );
            });
          } catch (h) {
            return (q(h, this.#i.parent), null);
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
const $ = new Set(),
  I = new Set();
function Ie(t) {
  for (var e = 0; e < t.length; e++) $.add(t[e]);
  for (var r of I) r(t);
}
let Y = null;
function A(t) {
  var e = this,
    r = e.ownerDocument,
    i = t.type,
    n = t.composedPath?.() || [],
    s = n[0] || t.target;
  Y = t;
  var a = 0,
    u = Y === t && t.__root;
  if (u) {
    var h = n.indexOf(u);
    if (h !== -1 && (e === document || e === window)) {
      t.__root = e;
      return;
    }
    var g = n.indexOf(e);
    if (g === -1) return;
    h <= g && (a = h);
  }
  if (((s = n[a] || t.target), s !== e)) {
    ue(t, 'currentTarget', {
      configurable: !0,
      get() {
        return s || r;
      },
    });
    var O = F,
      c = v;
    (E(null), D(null));
    try {
      for (var o, f = []; s !== null; ) {
        var m = s.assignedSlot || s.parentNode || s.host || null;
        try {
          var T = s['__' + i];
          T != null && (!s.disabled || t.target === s) && T.call(s, t);
        } catch (N) {
          o ? f.push(N) : (o = N);
        }
        if (t.cancelBubble || m === e || m === null) break;
        s = m;
      }
      if (o) {
        for (let N of f)
          queueMicrotask(() => {
            throw N;
          });
        throw o;
      }
    } finally {
      ((t.__root = e), delete t.currentTarget, E(O), D(c));
    }
  }
}
function Fe(t) {
  var e = document.createElement('template');
  return ((e.innerHTML = t.replaceAll('<!>', '<!---->')), e.content);
}
function _(t, e) {
  var r = v;
  r.nodes_start === null && ((r.nodes_start = t), (r.nodes_end = e));
}
function Pe(t, e) {
  var r = (e & ce) !== 0,
    i = (e & _e) !== 0,
    n,
    s = !t.startsWith('<!>');
  return () => {
    if (d) return (_(l, null), l);
    n === void 0 && ((n = Fe(s ? t : '<!>' + t)), r || (n = x(n)));
    var a = i || de ? document.importNode(n, !0) : n.cloneNode(!0);
    if (r) {
      var u = x(a),
        h = a.lastChild;
      _(u, h);
    } else _(a, a);
    return a;
  };
}
function Be(t = '') {
  if (!d) {
    var e = b(t + '');
    return (_(e, e), e);
  }
  var r = l;
  return (r.nodeType !== pe && (r.before((r = b())), w(r)), _(r, r), r);
}
function He() {
  if (d) return (_(l, null), l);
  var t = document.createDocumentFragment(),
    e = document.createComment(''),
    r = b();
  return (t.append(e, r), _(e, r), t);
}
function Ve(t, e) {
  if (d) {
    ((v.nodes_end = l), W());
    return;
  }
  t !== null && t.before(e);
}
function qe(t, e) {
  var r = e == null ? '' : typeof e == 'object' ? e + '' : e;
  r !== (t.__t ??= t.nodeValue) && ((t.__t = r), (t.nodeValue = r + ''));
}
function xe(t, e) {
  return J(t, e);
}
function Ye(t, e) {
  (L(), (e.intro = e.intro ?? !1));
  const r = e.target,
    i = d,
    n = l;
  try {
    for (var s = x(r); s && (s.nodeType !== B || s.data !== ve); ) s = ge(s);
    if (!s) throw M;
    (S(!0), w(s));
    const a = J(t, { ...e, anchor: s });
    return (S(!1), a);
  } catch (a) {
    if (
      a instanceof Error &&
      a.message
        .split(
          `
`,
        )
        .some((u) => u.startsWith('https://svelte.dev/e/'))
    )
      throw a;
    return (
      a !== M && console.warn('Failed to hydrate: ', a),
      e.recover === !1 && me(),
      L(),
      ye(r),
      S(!1),
      xe(t, e)
    );
  } finally {
    (S(i), w(n));
  }
}
const y = new Map();
function J(
  t,
  { target: e, anchor: r, props: i = {}, events: n, context: s, intro: a = !0 },
) {
  L();
  var u = new Set(),
    h = (c) => {
      for (var o = 0; o < c.length; o++) {
        var f = c[o];
        if (!u.has(f)) {
          u.add(f);
          var m = Ce(f);
          e.addEventListener(f, A, { passive: m });
          var T = y.get(f);
          T === void 0
            ? (document.addEventListener(f, A, { passive: m }), y.set(f, 1))
            : y.set(f, T + 1);
        }
      }
    };
  (h(Ee($)), I.add(h));
  var g = void 0,
    O = Te(() => {
      var c = r ?? e.appendChild(b());
      return (
        De(c, { pending: () => {} }, (o) => {
          if (s) {
            be({});
            var f = z;
            f.c = s;
          }
          if (
            (n && (i.$$events = n),
            d && _(o, null),
            (g = t(o, i) || {}),
            d &&
              ((v.nodes_end = l),
              l === null || l.nodeType !== B || l.data !== we))
          )
            throw (Ne(), M);
          s && Re();
        }),
        () => {
          for (var o of u) {
            e.removeEventListener(o, A);
            var f = y.get(o);
            --f === 0
              ? (document.removeEventListener(o, A), y.delete(o))
              : y.set(o, f);
          }
          (I.delete(h), c !== r && c.parentNode?.removeChild(c));
        }
      );
    });
  return (P.set(g, O), g);
}
let P = new WeakMap();
function je(t, e) {
  const r = P.get(t);
  return r ? (P.delete(t), r(e)) : Promise.resolve();
}
const Le = '5';
typeof window < 'u' && ((window.__svelte ??= {}).v ??= new Set()).add(Le);
export {
  Ve as a,
  He as c,
  Ie as d,
  Pe as f,
  Ye as h,
  xe as m,
  qe as s,
  Be as t,
  je as u,
};
