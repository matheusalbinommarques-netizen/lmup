import {
  J as O,
  F as b,
  S as y,
  ai as D,
  U as L,
  V as B,
  W as N,
  P as Y,
  ag as m,
  O as E,
  aj as M,
  ak as x,
  al as F,
  g as h,
  c as U,
  b as q,
  af as w,
  am as C,
  an as $,
  T as j,
  ao as z,
  D as G,
  ap as H,
  aq as J,
  ar as V,
  ah as W,
  as as Z,
} from './C4tos-D-.js';
function Q(a, n, _ = !1) {
  b && y();
  var t = new m(a),
    u = _ ? D : 0;
  function c(e, i) {
    if (b) {
      const f = L(a) === B;
      if (e === f) {
        var s = N();
        (Y(s), (t.anchor = s), E(!1), t.ensure(e, i), E(!0));
        return;
      }
    }
    t.ensure(e, i);
  }
  O(() => {
    var e = !1;
    (n((i, s = !0) => {
      ((e = !0), c(s, i));
    }),
      e || c(!1, null));
  }, u);
}
let S = !1;
function k(a) {
  var n = S;
  try {
    return ((S = !1), [a(), S]);
  } finally {
    S = n;
  }
}
function X(a, n, _, t) {
  var u = (_ & z) !== 0,
    c = (_ & J) !== 0,
    e = t,
    i = !0,
    s = () => (i && ((i = !1), (e = c ? G(t) : t)), e),
    f;
  if (u) {
    var A = W in a || Z in a;
    f = M(a, n)?.set ?? (A && n in a ? (r) => (a[n] = r) : void 0);
  }
  var d,
    P = !1;
  (u ? ([d, P] = k(() => a[n])) : (d = a[n]),
    d === void 0 && t !== void 0 && ((d = s()), f && (x(), f(d))));
  var v;
  if (
    ((v = () => {
      var r = a[n];
      return r === void 0 ? s() : ((i = !0), r);
    }),
    (_ & F) === 0)
  )
    return v;
  if (f) {
    var I = a.$$legacy;
    return function (r, g) {
      return arguments.length > 0 ? ((!g || I || P) && f(g ? v() : r), r) : v();
    };
  }
  var o = !1,
    l = ((_ & H) !== 0 ? $ : j)(() => ((o = !1), v()));
  u && h(l);
  var R = w;
  return function (r, g) {
    if (arguments.length > 0) {
      const T = g ? h(l) : u ? U(r) : r;
      return (q(l, T), (o = !0), e !== void 0 && (e = T), r);
    }
    return (V && o) || (R.f & C) !== 0 ? l.v : h(l);
  };
}
export { Q as i, X as p };
