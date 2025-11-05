import {
  L as R,
  M as T,
  N as b,
  P as D,
  d as P,
  O as Y,
  e as B,
  Q as M,
  R as m,
  S as N,
  G as U,
  T as h,
  U as x,
  V as y,
  W as G,
  X as $,
  Y as q,
} from './nNZc3isi.js';
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
  var u = (s & y) !== 0,
    O = (s & x) !== 0,
    d = _,
    c = !0,
    g = () => (c && ((c = !1), (d = O ? R(_) : _)), d),
    a;
  if (u) {
    var A = $ in e || q in e;
    a = T(e, n)?.set ?? (A && n in e ? (r) => (e[n] = r) : void 0);
  }
  var i,
    o = !1;
  (u ? ([i, o] = w(() => e[n])) : (i = e[n]),
    i === void 0 && _ !== void 0 && ((i = g()), a && (b(), a(i))));
  var t;
  if (
    ((t = () => {
      var r = e[n];
      return r === void 0 ? g() : ((c = !0), r);
    }),
    (s & D) === 0)
  )
    return t;
  if (a) {
    var E = e.$$legacy;
    return function (r, v) {
      return arguments.length > 0 ? ((!v || E || o) && a(v ? t() : r), r) : t();
    };
  }
  var S = !1,
    f = ((s & G) !== 0 ? Y : B)(() => ((S = !1), t()));
  u && P(f);
  var L = U;
  return function (r, v) {
    if (arguments.length > 0) {
      const I = v ? P(f) : u ? M(r) : r;
      return (m(f, I), (S = !0), d !== void 0 && (d = I), r);
    }
    return (N && S) || (L.f & h) !== 0 ? f.v : P(f);
  };
}
export { C as p };
