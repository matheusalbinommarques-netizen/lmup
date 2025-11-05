import {
  w as l,
  x as m,
  y as h,
  z as v,
  A as b,
  B as p,
  h as g,
  C as y,
  F as k,
  G as M,
  I as w,
  J as x,
  K as _,
  M as A,
  N as B,
  O as D,
  e as F,
  k as N,
} from './Cowx68EC.js';
class I {
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
            (k(n, u),
              u.append(b()),
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
          n = b();
        (a.append(n), this.#e.set(s, { effect: p(() => t(n)), fragment: a }));
      } else
        this.#t.set(
          s,
          p(() => t(this.anchor)),
        );
    if ((this.#s.set(e, s), i)) {
      for (const [f, c] of this.#t)
        f === s ? e.skipped_effects.delete(c) : e.skipped_effects.add(c);
      for (const [f, c] of this.#e)
        f === s
          ? e.skipped_effects.delete(c.effect)
          : e.skipped_effects.add(c.effect);
      (e.oncommit(this.#i), e.ondiscard(this.#a));
    } else (g && (this.anchor = y), this.#i());
  }
}
let o = !1,
  d = Symbol();
function O(r, s, t) {
  const e = (t[s] ??= { store: null, source: A(void 0), unsubscribe: _ });
  if (e.store !== r && !(d in t))
    if ((e.unsubscribe(), (e.store = r ?? null), r == null))
      ((e.source.v = void 0), (e.unsubscribe = _));
    else {
      var i = !0;
      ((e.unsubscribe = B(r, (a) => {
        i ? (e.source.v = a) : N(e.source, a);
      })),
        (i = !1));
    }
  return r && d in t ? D(r) : F(e.source);
}
function S() {
  const r = {};
  function s() {
    w(() => {
      for (var t in r) r[t].unsubscribe();
      x(r, d, { enumerable: !1, value: !0 });
    });
  }
  return [r, s];
}
function U(r) {
  var s = o;
  try {
    return ((o = !1), [r(), o]);
  } finally {
    o = s;
  }
}
export { I as B, O as a, U as c, S as s };
