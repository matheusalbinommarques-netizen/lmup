import {
  u as x,
  g as A,
  p as D,
  P as E,
  e as v,
  f as L,
  i as R,
  j as b,
  k as T,
  l as w,
  m as h,
  D as B,
  n as Y,
  o as M,
  q,
  S as K,
  L as N,
} from './Cowx68EC.js';
import { c as U } from './f0HoYL7i.js';
const $ = {
  get(e, r) {
    if (!e.exclude.includes(r)) return e.props[r];
  },
  set(e, r) {
    return !1;
  },
  getOwnPropertyDescriptor(e, r) {
    if (!e.exclude.includes(r) && r in e.props)
      return { enumerable: !0, configurable: !0, value: e.props[r] };
  },
  has(e, r) {
    return e.exclude.includes(r) ? !1 : r in e.props;
  },
  ownKeys(e) {
    return Reflect.ownKeys(e.props).filter((r) => !e.exclude.includes(r));
  },
};
function z(e, r, t) {
  return new Proxy({ props: e, exclude: r }, $);
}
function C(e, r, t, f) {
  var d = (t & M) !== 0,
    I = (t & Y) !== 0,
    _ = f,
    c = !0,
    P = () => (c && ((c = !1), (_ = I ? x(f) : f)), _),
    i;
  if (d) {
    var g = K in e || N in e;
    i = A(e, r)?.set ?? (g && r in e ? (n) => (e[r] = n) : void 0);
  }
  var a,
    p = !1;
  (d ? ([a, p] = U(() => e[r])) : (a = e[r]),
    a === void 0 && f !== void 0 && ((a = P()), i && (D(), i(a))));
  var u;
  if (
    ((u = () => {
      var n = e[r];
      return n === void 0 ? P() : ((c = !0), n);
    }),
    (t & E) === 0)
  )
    return u;
  if (i) {
    var m = e.$$legacy;
    return function (n, l) {
      return arguments.length > 0 ? ((!l || m || p) && i(l ? u() : n), n) : u();
    };
  }
  var o = !1,
    s = ((t & q) !== 0 ? L : R)(() => ((o = !1), u()));
  d && v(s);
  var O = h;
  return function (n, l) {
    if (arguments.length > 0) {
      const S = l ? v(s) : d ? b(n) : n;
      return (T(s, S), (o = !0), _ !== void 0 && (_ = S), n);
    }
    return (w && o) || (O.f & B) !== 0 ? s.v : v(s);
  };
}
export { C as p, z as r };
