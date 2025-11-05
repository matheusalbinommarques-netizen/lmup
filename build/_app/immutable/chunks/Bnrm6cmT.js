import {
  L as R,
  M as T,
  P as b,
  d as P,
  N as D,
  e as Y,
  O as B,
  Q as M,
  R as m,
  G as N,
  S as U,
  T as h,
  U as x,
  V as y,
  W as G,
  X as $,
  Y as q,
} from './Csv_Bl-6.js';
let l = !1;
function w(e) {
  var n = l;
  try {
    return ((l = !1), [e(), l]);
  } finally {
    l = n;
  }
}
function C(e, n, s, _) {
  var u = (s & h) !== 0,
    O = (s & G) !== 0,
    d = _,
    c = !0,
    g = () => (c && ((c = !1), (d = O ? x(_) : _)), d),
    a;
  if (u) {
    var A = $ in e || q in e;
    a = R(e, n)?.set ?? (A && n in e ? (r) => (e[n] = r) : void 0);
  }
  var i,
    o = !1;
  (u ? ([i, o] = w(() => e[n])) : (i = e[n]),
    i === void 0 && _ !== void 0 && ((i = g()), a && (T(), a(i))));
  var t;
  if (
    ((t = () => {
      var r = e[n];
      return r === void 0 ? g() : ((c = !0), r);
    }),
    (s & b) === 0)
  )
    return t;
  if (a) {
    var E = e.$$legacy;
    return function (r, v) {
      return arguments.length > 0 ? ((!v || E || o) && a(v ? t() : r), r) : t();
    };
  }
  var S = !1,
    f = ((s & y) !== 0 ? D : Y)(() => ((S = !1), t()));
  u && P(f);
  var L = N;
  return function (r, v) {
    if (arguments.length > 0) {
      const I = v ? P(f) : u ? B(r) : r;
      return (M(f, I), (S = !0), d !== void 0 && (d = I), r);
    }
    return (m && S) || (L.f & U) !== 0 ? f.v : P(f);
  };
}
export { C as p };
