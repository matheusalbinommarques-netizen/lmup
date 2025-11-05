import {
  c as z,
  b as W,
  s as b,
  h as N,
  g as Z,
  a as $,
  d as L,
  e as k,
  r as j,
  H as ee,
  f as V,
  i as O,
  j as R,
  C as ae,
  k as re,
  l as B,
  m as ne,
  n as le,
  o as se,
  p as fe,
  q as Y,
  E as te,
  t as G,
  u as ie,
  v as ue,
  w as ve,
  I as S,
  x as U,
  y as X,
  z as de,
  A as _e,
  B as oe,
  D as he,
  F as ce,
  G as pe,
} from './Csv_Bl-6.js';
function Ee(f, r, e) {
  for (var t = f.items, v = [], d = r.length, u = 0; u < d; u++)
    _e(r[u].e, v, !0);
  var c = d > 0 && v.length === 0 && e !== null;
  if (c) {
    var m = e.parentNode;
    (oe(m), m.append(e), t.clear(), I(f, r[0].prev, r[d - 1].next));
  }
  he(v, () => {
    for (var h = 0; h < d; h++) {
      var E = r[h];
      (c || (t.delete(E.k), I(f, E.prev, E.next)), X(E.e, !c));
    }
  });
}
function ge(f, r, e, t, v, d = null) {
  var u = f,
    c = { flags: r, items: new Map(), first: null };
  {
    var m = f;
    u = N ? b(Z(m)) : m.appendChild(z());
  }
  N && $();
  var h = null,
    E = !1,
    C = new Map(),
    a = k(() => {
      var s = e();
      return ce(s) ? s : s == null ? [] : U(s);
    }),
    o,
    n;
  function l() {
    (me(n, o, c, C, u, v, r, t, e),
      d !== null &&
        (o.length === 0
          ? h
            ? G(h)
            : (h = B(() => d(u)))
          : h !== null &&
            ie(h, () => {
              h = null;
            })));
  }
  (W(() => {
    ((n ??= pe), (o = L(a)));
    var s = o.length;
    if (E && s === 0) return;
    E = s === 0;
    let x = !1;
    if (N) {
      var g = j(u) === ee;
      g !== (s === 0) && ((u = V()), b(u), O(!1), (x = !0));
    }
    if (N) {
      for (var i = null, p, _ = 0; _ < s; _++) {
        if (R.nodeType === ae && R.data === re) {
          ((u = R), (x = !0), O(!1));
          break;
        }
        var w = o[_],
          A = t(w, _);
        ((p = F(R, c, i, null, w, A, _, v, r, e)), c.items.set(A, p), (i = p));
      }
      s > 0 && b(V());
    }
    if (N) s === 0 && d && (h = B(() => d(u)));
    else if (ne()) {
      var M = new Set(),
        T = le;
      for (_ = 0; _ < s; _ += 1) {
        ((w = o[_]), (A = t(w, _)));
        var D = c.items.get(A) ?? C.get(A);
        (D
          ? J(D, w, _)
          : ((p = F(null, c, null, null, w, A, _, v, r, e, !0)), C.set(A, p)),
          M.add(A));
      }
      for (const [y, H] of c.items) M.has(y) || T.skipped_effects.add(H.e);
      T.oncommit(l);
    } else l();
    (x && O(!0), L(a));
  }),
    N && (u = R));
}
function me(f, r, e, t, v, d, u, c, m) {
  var h = r.length,
    E = e.items,
    C = e.first,
    a = C,
    o,
    n = null,
    l = [],
    s = [],
    x,
    g,
    i,
    p;
  for (p = 0; p < h; p += 1) {
    if (((x = r[p]), (g = c(x, p)), (i = E.get(g)), i === void 0)) {
      var _ = t.get(g);
      if (_ !== void 0) {
        (t.delete(g), E.set(g, _));
        var w = n ? n.next : a;
        (I(e, n, _), I(e, _, w), q(_, w, v), (n = _));
      } else {
        var A = a ? a.e.nodes_start : v;
        n = F(A, e, n, n === null ? e.first : n.next, x, g, p, d, u, m);
      }
      (E.set(g, n), (l = []), (s = []), (a = n.next));
      continue;
    }
    if ((J(i, x, p), (i.e.f & S) !== 0 && G(i.e), i !== a)) {
      if (o !== void 0 && o.has(i)) {
        if (l.length < s.length) {
          var M = s[0],
            T;
          n = M.prev;
          var D = l[0],
            y = l[l.length - 1];
          for (T = 0; T < l.length; T += 1) q(l[T], M, v);
          for (T = 0; T < s.length; T += 1) o.delete(s[T]);
          (I(e, D.prev, y.next),
            I(e, n, D),
            I(e, y, M),
            (a = M),
            (n = y),
            (p -= 1),
            (l = []),
            (s = []));
        } else
          (o.delete(i),
            q(i, a, v),
            I(e, i.prev, i.next),
            I(e, i, n === null ? e.first : n.next),
            I(e, n, i),
            (n = i));
        continue;
      }
      for (l = [], s = []; a !== null && a.k !== g; )
        ((a.e.f & S) === 0 && (o ??= new Set()).add(a),
          s.push(a),
          (a = a.next));
      if (a === null) continue;
      i = a;
    }
    (l.push(i), (n = i), (a = i.next));
  }
  if (a !== null || o !== void 0) {
    for (var H = o === void 0 ? [] : U(o); a !== null; )
      ((a.e.f & S) === 0 && H.push(a), (a = a.next));
    var K = H.length;
    if (K > 0) {
      var P = h === 0 ? v : null;
      Ee(e, H, P);
    }
  }
  ((f.first = e.first && e.first.e), (f.last = n && n.e));
  for (var Q of t.values()) X(Q.e);
  t.clear();
}
function J(f, r, e, t) {
  (se(f.v, r), (f.i = e));
}
function F(f, r, e, t, v, d, u, c, m, h, E) {
  var C = (m & ue) !== 0,
    a = (m & ve) === 0,
    o = C ? (a ? fe(v, !1, !1) : Y(v)) : v,
    n = (m & te) === 0 ? u : Y(u),
    l = { i: n, v: o, k: d, a: null, e: null, prev: e, next: t };
  try {
    if (f === null) {
      var s = document.createDocumentFragment();
      s.append((f = z()));
    }
    return (
      (l.e = B(() => c(f, o, n, h), N)),
      (l.e.prev = e && e.e),
      (l.e.next = t && t.e),
      e === null ? E || (r.first = l) : ((e.next = l), (e.e.next = l.e)),
      t !== null && ((t.prev = l), (t.e.prev = l.e)),
      l
    );
  } finally {
  }
}
function q(f, r, e) {
  for (
    var t = f.next ? f.next.e.nodes_start : e,
      v = r ? r.e.nodes_start : e,
      d = f.e.nodes_start;
    d !== null && d !== t;

  ) {
    var u = de(d);
    (v.before(d), (d = u));
  }
}
function I(f, r, e) {
  (r === null ? (f.first = e) : ((r.next = e), (r.e.next = e && e.e)),
    e !== null && ((e.prev = r), (e.e.prev = r && r.e)));
}
export { ge as e };
