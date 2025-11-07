import {
  c as l,
  r as m,
  d as h,
  p as v,
  b as p,
  e as b,
  h as g,
  f as k,
  m as y,
  s as M,
  t as w,
  i as D,
  n as _,
  j as x,
  k as A,
  l as B,
} from './B9t7ERLA.js';
import { s as F, g as N } from './B0vhlS2c.js';
class j {
  anchor;
  #s = new Map();
  #t = new Map();
  #e = new Map();
  #r = !0;
  constructor(s, t = !0) {
    ((this.anchor = s), (this.#r = t));
  }
  #i = () => {
    var s = l;
    if (this.#s.has(s)) {
      var t = this.#s.get(s),
        e = this.#t.get(t);
      if (e) m(e);
      else {
        var i = this.#e.get(t);
        i &&
          (this.#t.set(t, i.effect),
          this.#e.delete(t),
          i.fragment.lastChild.remove(),
          this.anchor.before(i.fragment),
          (e = i.effect));
      }
      for (const [a, n] of this.#s) {
        if ((this.#s.delete(a), a === s)) break;
        const f = this.#e.get(n);
        f && (h(f.effect), this.#e.delete(n));
      }
      for (const [a, n] of this.#t) {
        if (a === t) continue;
        const f = () => {
          if (Array.from(this.#s.values()).includes(a)) {
            var u = document.createDocumentFragment();
            (y(n, u),
              u.append(p()),
              this.#e.set(a, { effect: n, fragment: u }));
          } else h(n);
          this.#t.delete(a);
        };
        this.#r || !e ? v(n, f, !1) : f();
      }
    }
  };
  #a = (s) => {
    this.#s.delete(s);
    const t = Array.from(this.#s.values());
    for (const [e, i] of this.#e)
      t.includes(e) || (h(i.effect), this.#e.delete(e));
  };
  ensure(s, t) {
    var e = l,
      i = M();
    if (t && !this.#t.has(s) && !this.#e.has(s))
      if (i) {
        var a = document.createDocumentFragment(),
          n = p();
        (a.append(n), this.#e.set(s, { effect: b(() => t(n)), fragment: a }));
      } else
        this.#t.set(
          s,
          b(() => t(this.anchor)),
        );
    if ((this.#s.set(e, s), i)) {
      for (const [f, c] of this.#t)
        f === s ? e.skipped_effects.delete(c) : e.skipped_effects.add(c);
      for (const [f, c] of this.#e)
        f === s
          ? e.skipped_effects.delete(c.effect)
          : e.skipped_effects.add(c.effect);
      (e.oncommit(this.#i), e.ondiscard(this.#a));
    } else (g && (this.anchor = k), this.#i());
  }
}
let o = !1,
  d = Symbol();
function C(r, s, t) {
  const e = (t[s] ??= { store: null, source: x(void 0), unsubscribe: _ });
  if (e.store !== r && !(d in t))
    if ((e.unsubscribe(), (e.store = r ?? null), r == null))
      ((e.source.v = void 0), (e.unsubscribe = _));
    else {
      var i = !0;
      ((e.unsubscribe = F(r, (a) => {
        i ? (e.source.v = a) : B(e.source, a);
      })),
        (i = !1));
    }
  return r && d in t ? N(r) : A(e.source);
}
function E() {
  const r = {};
  function s() {
    w(() => {
      for (var t in r) r[t].unsubscribe();
      D(r, d, { enumerable: !1, value: !0 });
    });
  }
  return [r, s];
}
function I(r) {
  var s = o;
  try {
    return ((o = !1), [r(), o]);
  } finally {
    o = s;
  }
}
export { j as B, C as a, I as c, E as s };
