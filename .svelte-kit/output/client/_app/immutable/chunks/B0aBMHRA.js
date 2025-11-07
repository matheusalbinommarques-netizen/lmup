import { f as X, a as O, s as ae, b as q } from './C1kyYzkI.js';
import {
  m as G,
  b as re,
  B as L,
  o as N,
  D as se,
  y as te,
  F as A,
  G as ne,
  z as le,
  H as ie,
  A as F,
  C as S,
  v as B,
  I as fe,
  J as ve,
  n as Z,
  x as oe,
  i as ue,
  K as de,
  L as he,
  M as P,
  N as ce,
  j as J,
  l as pe,
  O as _e,
  P as me,
  Q as V,
  R as K,
  k as Q,
  T as ge,
  U as xe,
  V as Ee,
  W as we,
  X as be,
  Y as Me,
  p as Te,
  a as Ce,
  c as H,
  r as y,
  s as Ae,
  t as Ie,
  Z as Ne,
} from './BOOFhtRP.js';
import { i as ye } from './Dt4_cxAB.js';
import { s as U, a as ke } from './5aiaHk4R.js';
import { p as De } from './DG4W8TUH.js';
function Re(l, r, e) {
  for (var i = l.items, o = [], f = r.length, v = 0; v < f; v++)
    xe(r[v].e, o, !0);
  var _ = f > 0 && o.length === 0 && e !== null;
  if (_) {
    var m = e.parentNode;
    (Ee(m), m.append(e), i.clear(), T(l, r[0].prev, r[f - 1].next));
  }
  we(o, () => {
    for (var u = 0; u < f; u++) {
      var c = r[u];
      (_ || (i.delete(c.k), T(l, c.prev, c.next)), Q(c.e, !_));
    }
  });
}
function Be(l, r, e, i, o, f = null) {
  var v = l,
    _ = { flags: r, items: new Map(), first: null };
  {
    var m = l;
    v = N ? L(se(m)) : m.appendChild(G());
  }
  N && te();
  var u = null,
    c = !1,
    w = new Map(),
    a = ne(() => {
      var n = e();
      return be(n) ? n : n == null ? [] : K(n);
    }),
    h,
    s;
  function t() {
    (He(s, h, _, w, v, o, r, i, e),
      f !== null &&
        (h.length === 0
          ? u
            ? J(u)
            : (u = Z(() => f(v)))
          : u !== null &&
            pe(u, () => {
              u = null;
            })));
  }
  (re(() => {
    ((s ??= Me), (h = A(a)));
    var n = h.length;
    if (c && n === 0) return;
    c = n === 0;
    let g = !1;
    if (N) {
      var x = le(v) === ie;
      x !== (n === 0) && ((v = F()), L(v), S(!1), (g = !0));
    }
    if (N) {
      for (var d = null, E, p = 0; p < n; p++) {
        if (B.nodeType === fe && B.data === ve) {
          ((v = B), (g = !0), S(!1));
          break;
        }
        var C = h[p],
          M = i(C, p);
        ((E = z(B, _, d, null, C, M, p, o, r, e)), _.items.set(M, E), (d = E));
      }
      n > 0 && L(F());
    }
    if (N) n === 0 && f && (u = Z(() => f(v)));
    else if (oe()) {
      var I = new Set(),
        b = ue;
      for (p = 0; p < n; p += 1) {
        ((C = h[p]), (M = i(C, p)));
        var k = _.items.get(M) ?? w.get(M);
        (k
          ? W(k, C, p)
          : ((E = z(null, _, null, null, C, M, p, o, r, e, !0)), w.set(M, E)),
          I.add(M));
      }
      for (const [D, R] of _.items) I.has(D) || b.skipped_effects.add(R.e);
      b.oncommit(t);
    } else t();
    (g && S(!0), A(a));
  }),
    N && (v = B));
}
function He(l, r, e, i, o, f, v, _, m) {
  var u = r.length,
    c = e.items,
    w = e.first,
    a = w,
    h,
    s = null,
    t = [],
    n = [],
    g,
    x,
    d,
    E;
  for (E = 0; E < u; E += 1) {
    if (((g = r[E]), (x = _(g, E)), (d = c.get(x)), d === void 0)) {
      var p = i.get(x);
      if (p !== void 0) {
        (i.delete(x), c.set(x, p));
        var C = s ? s.next : a;
        (T(e, s, p), T(e, p, C), Y(p, C, o), (s = p));
      } else {
        var M = a ? a.e.nodes_start : o;
        s = z(M, e, s, s === null ? e.first : s.next, g, x, E, f, v, m);
      }
      (c.set(x, s), (t = []), (n = []), (a = s.next));
      continue;
    }
    if ((W(d, g, E), (d.e.f & V) !== 0 && J(d.e), d !== a)) {
      if (h !== void 0 && h.has(d)) {
        if (t.length < n.length) {
          var I = n[0],
            b;
          s = I.prev;
          var k = t[0],
            D = t[t.length - 1];
          for (b = 0; b < t.length; b += 1) Y(t[b], I, o);
          for (b = 0; b < n.length; b += 1) h.delete(n[b]);
          (T(e, k.prev, D.next),
            T(e, s, k),
            T(e, D, I),
            (a = I),
            (s = D),
            (E -= 1),
            (t = []),
            (n = []));
        } else
          (h.delete(d),
            Y(d, a, o),
            T(e, d.prev, d.next),
            T(e, d, s === null ? e.first : s.next),
            T(e, s, d),
            (s = d));
        continue;
      }
      for (t = [], n = []; a !== null && a.k !== x; )
        ((a.e.f & V) === 0 && (h ??= new Set()).add(a),
          n.push(a),
          (a = a.next));
      if (a === null) continue;
      d = a;
    }
    (t.push(d), (s = d), (a = d.next));
  }
  if (a !== null || h !== void 0) {
    for (var R = h === void 0 ? [] : K(h); a !== null; )
      ((a.e.f & V) === 0 && R.push(a), (a = a.next));
    var $ = R.length;
    if ($ > 0) {
      var j = u === 0 ? o : null;
      Re(e, R, j);
    }
  }
  ((l.first = e.first && e.first.e), (l.last = s && s.e));
  for (var ee of i.values()) Q(ee.e);
  i.clear();
}
function W(l, r, e, i) {
  (de(l.v, r), (l.i = e));
}
function z(l, r, e, i, o, f, v, _, m, u, c) {
  var w = (m & _e) !== 0,
    a = (m & me) === 0,
    h = w ? (a ? he(o, !1, !1) : P(o)) : o,
    s = (m & ce) === 0 ? v : P(v),
    t = { i: s, v: h, k: f, a: null, e: null, prev: e, next: i };
  try {
    if (l === null) {
      var n = document.createDocumentFragment();
      n.append((l = G()));
    }
    return (
      (t.e = Z(() => _(l, h, s, u), N)),
      (t.e.prev = e && e.e),
      (t.e.next = i && i.e),
      e === null ? c || (r.first = t) : ((e.next = t), (e.e.next = t.e)),
      i !== null && ((i.prev = t), (i.e.prev = t.e)),
      t
    );
  } finally {
  }
}
function Y(l, r, e) {
  for (
    var i = l.next ? l.next.e.nodes_start : e,
      o = r ? r.e.nodes_start : e,
      f = l.e.nodes_start;
    f !== null && f !== i;

  ) {
    var v = ge(f);
    (o.before(f), (f = v));
  }
}
function T(l, r, e) {
  (r === null ? (l.first = e) : ((r.next = e), (r.e.next = e && e.e)),
    e !== null && ((e.prev = r), (e.e.prev = r && r.e)));
}
var Oe = q(
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5M5 10v10h14V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  ),
  Le = q(
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" stroke-width="2"></path><path d="M19.4 15a1 1 0 0 1 .2 1.1l-1.2 2a1 1 0 0 1-1.1.5l-2.2-.6a7.9 7.9 0 0 1-1.9 1.1l-.3 2.2a1 1 0 0 1-1 .9h-2.4a1 1 0 0 1-1-.9l-.3-2.2a7.9 7.9 0 0 1-1.9-1.1l-2.2.6a1 1 0 0 1-1.1-.5l-1.2-2a1 1 0 0 1 .2-1.1l1.7-1.5a8.4 8.4 0 0 1 0-2.3L2.9 9.7a1 1 0 0 1-.2-1.1l1.2-2a1 1 0 0 1 1.1-.5l2.2.6c.6-.4 1.2-.8 1.9-1.1l.3-2.2a1 1 0 0 1 1-.9h2.4a1 1 0 0 1 1 .9l.3 2.2c.7.3 1.3.7 1.9 1.1l2.2-.6a1 1 0 0 1 1.1.5l1.2 2a1 1 0 0 1-.2 1.1l-1.7 1.5c.1.8.1 1.5 0 2.3l1.7 1.5Z" stroke="currentColor" stroke-width="2"></path></svg>',
  ),
  Se = X(
    '<a class="flex flex-col items-center gap-1"><div><!></div> <span class="text-[11px] font-medium opacity-90"> </span></a>',
  ),
  Ve = X(
    '<nav class="nav-wood fixed bottom-0 inset-x-0 z-40"><div class="section"><div class="flex items-center justify-around py-3"></div></div></nav>',
  );
function Ue(l, r) {
  Te(r, !0);
  const e = Ne(() => De.url.pathname),
    i = [
      { href: '/', label: 'Progresso', icon: 'home' },
      { href: '/config', label: 'Configurações', icon: 'settings' },
    ],
    o = (m) => A(e) === m;
  var f = Ve(),
    v = H(f),
    _ = H(v);
  (Be(
    _,
    21,
    () => i,
    (m) => m.href,
    (m, u) => {
      var c = Se(),
        w = H(c),
        a = H(w);
      {
        var h = (g) => {
            var x = Oe();
            O(g, x);
          },
          s = (g) => {
            var x = Le();
            O(g, x);
          };
        ye(a, (g) => {
          A(u).icon === 'home' ? g(h) : g(s, !1);
        });
      }
      y(w);
      var t = Ae(w, 2),
        n = H(t, !0);
      (y(t),
        y(c),
        Ie(
          (g, x) => {
            (U(c, 'href', A(u).href),
              U(c, 'aria-current', g),
              ke(w, 1, `nav-btn ${x ?? ''}`),
              ae(n, A(u).label));
          },
          [
            () => (o(A(u).href) ? 'page' : void 0),
            () => (o(A(u).href) ? 'nav-active' : ''),
          ],
        ),
        O(m, c));
    },
  ),
    y(_),
    y(v),
    y(f),
    O(l, f),
    Ce());
}
export { Ue as B, Be as e };
