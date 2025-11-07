import { f as G, a as Y } from '../chunks/CTOClj_W.js';
import {
  G as ee,
  h as I,
  H as ae,
  k as R,
  I as re,
  J as te,
  K as se,
  M as z,
  O as B,
  P as S,
  f as k,
  Q as le,
  R as ie,
  e as P,
  s as ne,
  c as oe,
  T as fe,
  b as de,
  j as ve,
  U,
  V as ue,
  r as J,
  p as ce,
  W as pe,
  X as me,
  Y as V,
  Z as K,
  d as Q,
  _ as _e,
  $ as he,
  a0 as xe,
  a1 as ge,
  a2 as be,
  a3 as we,
  E as y,
  D as N,
  F as E,
  a4 as ye,
  B as Ee,
} from '../chunks/B9t7ERLA.js';
import { s as Ae } from '../chunks/v1vEHNqM.js';
import { s as q } from '../chunks/CmYDCv5e.js';
import { a as Te } from '../chunks/DYDdMpkw.js';
function Me(l, t, e) {
  for (var i = l.items, f = [], n = t.length, d = 0; d < n; d++)
    he(t[d].e, f, !0);
  var p = n > 0 && f.length === 0 && e !== null;
  if (p) {
    var u = e.parentNode;
    (xe(u), u.append(e), i.clear(), A(l, t[0].prev, t[n - 1].next));
  }
  ge(f, () => {
    for (var g = 0; g < n; g++) {
      var _ = t[g];
      (p || (i.delete(_.k), A(l, _.prev, _.next)), Q(_.e, !p));
    }
  });
}
function Ie(l, t, e, i, f, n = null) {
  var d = l,
    p = { flags: t, items: new Map(), first: null };
  I && ae();
  var u = null,
    g = !1,
    _ = new Map(),
    T = re(() => {
      var a = e();
      return be(a) ? a : a == null ? [] : K(a);
    }),
    r,
    c;
  function s() {
    (Ce(c, r, p, _, d, f, t, i, e),
      n !== null &&
        (r.length === 0
          ? u
            ? J(u)
            : (u = P(() => n(d)))
          : u !== null &&
            ce(u, () => {
              u = null;
            })));
  }
  (ee(() => {
    ((c ??= we), (r = R(T)));
    var a = r.length;
    if (g && a === 0) return;
    g = a === 0;
    let m = !1;
    if (I) {
      var M = te(d) === se;
      M !== (a === 0) && ((d = z()), B(d), S(!1), (m = !0));
    }
    if (I) {
      for (var h = null, o, v = 0; v < a; v++) {
        if (k.nodeType === le && k.data === ie) {
          ((d = k), (m = !0), S(!1));
          break;
        }
        var x = r[v],
          b = i(x, v);
        ((o = X(k, p, h, null, x, b, v, f, t, e)), p.items.set(b, o), (h = o));
      }
      a > 0 && B(z());
    }
    if (I) a === 0 && n && (u = P(() => n(d)));
    else if (ne()) {
      var H = new Set(),
        C = oe;
      for (v = 0; v < a; v += 1) {
        ((x = r[v]), (b = i(x, v)));
        var w = p.items.get(b) ?? _.get(b);
        (w
          ? W(w, x, v)
          : ((o = X(null, p, null, null, x, b, v, f, t, e, !0)), _.set(b, o)),
          H.add(b));
      }
      for (const [F, D] of p.items) H.has(F) || C.skipped_effects.add(D.e);
      C.oncommit(s);
    } else s();
    (m && S(!0), R(T));
  }),
    I && (d = k));
}
function Ce(l, t, e, i, f, n, d, p, u) {
  var g = t.length,
    _ = e.items,
    T = e.first,
    r = T,
    c,
    s = null,
    a = [],
    m = [],
    M,
    h,
    o,
    v;
  for (v = 0; v < g; v += 1) {
    if (((M = t[v]), (h = p(M, v)), (o = _.get(h)), o === void 0)) {
      var x = i.get(h);
      if (x !== void 0) {
        (i.delete(h), _.set(h, x));
        var b = s ? s.next : r;
        (A(e, s, x), A(e, x, b), L(x, b, f), (s = x));
      } else {
        var H = r ? r.e.nodes_start : f;
        s = X(H, e, s, s === null ? e.first : s.next, M, h, v, n, d, u);
      }
      (_.set(h, s), (a = []), (m = []), (r = s.next));
      continue;
    }
    if ((W(o, M, v), (o.e.f & V) !== 0 && J(o.e), o !== r)) {
      if (c !== void 0 && c.has(o)) {
        if (a.length < m.length) {
          var C = m[0],
            w;
          s = C.prev;
          var F = a[0],
            D = a[a.length - 1];
          for (w = 0; w < a.length; w += 1) L(a[w], C, f);
          for (w = 0; w < m.length; w += 1) c.delete(m[w]);
          (A(e, F.prev, D.next),
            A(e, s, F),
            A(e, D, C),
            (r = C),
            (s = D),
            (v -= 1),
            (a = []),
            (m = []));
        } else
          (c.delete(o),
            L(o, r, f),
            A(e, o.prev, o.next),
            A(e, o, s === null ? e.first : s.next),
            A(e, s, o),
            (s = o));
        continue;
      }
      for (a = [], m = []; r !== null && r.k !== h; )
        ((r.e.f & V) === 0 && (c ??= new Set()).add(r),
          m.push(r),
          (r = r.next));
      if (r === null) continue;
      o = r;
    }
    (a.push(o), (s = o), (r = o.next));
  }
  if (r !== null || c !== void 0) {
    for (var O = c === void 0 ? [] : K(c); r !== null; )
      ((r.e.f & V) === 0 && O.push(r), (r = r.next));
    var Z = O.length;
    if (Z > 0) {
      var $ = null;
      Me(e, O, $);
    }
  }
  ((l.first = e.first && e.first.e), (l.last = s && s.e));
  for (var j of i.values()) Q(j.e);
  i.clear();
}
function W(l, t, e, i) {
  (fe(l.v, t), (l.i = e));
}
function X(l, t, e, i, f, n, d, p, u, g, _) {
  var T = (u & pe) !== 0,
    r = (u & me) === 0,
    c = T ? (r ? ve(f, !1, !1) : U(f)) : f,
    s = (u & ue) === 0 ? d : U(d),
    a = { i: s, v: c, k: n, a: null, e: null, prev: e, next: i };
  try {
    if (l === null) {
      var m = document.createDocumentFragment();
      m.append((l = de()));
    }
    return (
      (a.e = P(() => p(l, c, s, g), I)),
      (a.e.prev = e && e.e),
      (a.e.next = i && i.e),
      e === null ? _ || (t.first = a) : ((e.next = a), (e.e.next = a.e)),
      i !== null && ((i.prev = a), (i.e.prev = a.e)),
      a
    );
  } finally {
  }
}
function L(l, t, e) {
  for (
    var i = l.next ? l.next.e.nodes_start : e,
      f = t ? t.e.nodes_start : e,
      n = l.e.nodes_start;
    n !== null && n !== i;

  ) {
    var d = _e(n);
    (f.before(n), (n = d));
  }
}
function A(l, t, e) {
  (t === null ? (l.first = e) : ((t.next = e), (t.e.next = e && e.e)),
    e !== null && ((e.prev = t), (e.e.prev = t && t.e)));
}
function De(l, t, e, i) {
  var f = l.__style;
  if (I || f !== t) {
    var n = Te(t);
    ((!I || n !== l.getAttribute('style')) &&
      (n == null ? l.removeAttribute('style') : (l.style.cssText = n)),
      (l.__style = t));
  }
  return i;
}
var ke = G(
    '<div class="relative flex-shrink-0 w-[240px] h-[100px] snap-center transition-transform active:scale-95"><img alt="Fundo missão" class="absolute inset-0 w-full h-full object-contain drop-shadow-md"/> <div class="absolute inset-0 flex items-center pr-4 pl-10 pb-3"><p class="text-[#3e2723] font-bold text-sm leading-tight w-full text-center line-clamp-2"> </p></div></div>',
  ),
  Ne = G(
    '<div class="flex flex-col items-center w-full space-y-4"><section class="flex flex-col items-center space-y-2 mt-6"><div class="relative"><div class="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div> <img src="/art/hero-avatar-default.png" alt="Avatar" class="w-32 h-32 rounded-full border-[5px] border-[#1a1a1a] shadow-2xl relative z-10"/> <div class="absolute -bottom-3 w-full flex justify-center z-20"><span class="bg-[#3a2f25] text-[#ffb74d] px-4 py-1 rounded-full text-sm font-bold border-2 border-[#1a1a1a] shadow-lg"></span></div></div> <div class="w-[200px] flex flex-col items-center space-y-1 mt-5"><div class="w-full h-4 bg-black/60 rounded-full overflow-hidden border-2 border-[#3a2f25]/50"><div class="h-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div></div> <span class="text-xs text-gray-400 font-semibold tracking-wider"></span></div></section> <div class="w-full max-w-[380px] flex justify-center py-2"><img src="/art/banner-missions-title.png" alt="Missões Ativas" class="w-[95%] object-contain drop-shadow-lg opacity-90"/></div> <section class="w-full flex flex-row flex-nowrap overflow-x-auto space-x-4 pl-4 pr-4 py-2 snap-x snap-mandatory no-scrollbar mask-fade-sides svelte-1uha8ag"><!> <div class="flex-shrink-0 w-2"></div></section></div>',
  );
function Ve(l) {
  let t = [
    {
      id: 1,
      titulo: 'Derrotar o Dragão Vermelho Ancião',
      raridade: 'legendary',
      bg: '/art/tasks/card-mission-legendary.png',
    },
    {
      id: 2,
      titulo: 'Encontrar a Espada Perdida',
      raridade: 'epic',
      bg: '/art/tasks/card-mission-epic.png',
    },
    {
      id: 3,
      titulo: 'Coletar 10 Ervas Medicinais na Floresta',
      raridade: 'common',
      bg: '/art/tasks/card-mission-common.png',
    },
    {
      id: 4,
      titulo: 'Falar com o Estalajadeiro',
      raridade: 'common',
      bg: '/art/tasks/card-mission-common.png',
    },
  ];
  var e = Ne(),
    i = y(e),
    f = y(i),
    n = N(y(f), 4),
    d = y(n);
  ((d.textContent = 'Lvl 5'), E(n), E(f));
  var p = N(f, 2),
    u = y(p),
    g = y(u);
  (De(g, 'width: 75%'), E(u));
  var _ = N(u, 2);
  ((_.textContent = '750 / 1000 XP'), E(p), E(i));
  var T = N(i, 4),
    r = y(T);
  (Ie(
    r,
    17,
    () => t,
    (c) => c.id,
    (c, s) => {
      var a = ke(),
        m = y(a),
        M = N(m, 2),
        h = y(M),
        o = y(h, !0);
      (E(h),
        E(M),
        E(a),
        Ee(() => {
          (q(m, 'src', R(s).bg),
            q(h, 'title', R(s).titulo),
            Ae(o, R(s).titulo));
        }),
        Y(c, a));
    },
  ),
    ye(2),
    E(T),
    E(e),
    Y(l, e));
}
export { Ve as component };
