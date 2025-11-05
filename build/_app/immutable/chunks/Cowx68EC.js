var qt = Array.isArray,
  Yt = Array.prototype.indexOf,
  Sn = Array.from,
  On = Object.defineProperty,
  oe = Object.getOwnPropertyDescriptor,
  Nn = Object.getOwnPropertyDescriptors,
  Ht = Object.prototype,
  Ut = Array.prototype,
  Bt = Object.getPrototypeOf,
  Je = Object.isExtensible;
const we = () => {};
function Vt(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function it() {
  var e,
    t,
    n = new Promise((r, s) => {
      ((e = r), (t = s));
    });
  return { promise: n, resolve: e, reject: t };
}
const y = 2,
  Re = 4,
  Se = 8,
  F = 16,
  L = 32,
  ee = 64,
  Ye = 128,
  b = 1024,
  T = 2048,
  j = 4096,
  D = 8192,
  H = 16384,
  He = 32768,
  Ee = 65536,
  Ie = 1 << 17,
  at = 1 << 18,
  he = 1 << 19,
  lt = 1 << 20,
  R = 256,
  ye = 512,
  me = 32768,
  Ce = 1 << 21,
  Ue = 1 << 22,
  U = 1 << 23,
  ce = Symbol('$state'),
  Dn = Symbol('legacy props'),
  Pn = Symbol(''),
  ne = new (class extends Error {
    name = 'StaleReactionError';
    message =
      'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  Be = 3,
  ut = 8;
function Kt() {
  throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function zt(e) {
  throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Gt() {
  throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function Wt(e) {
  throw new Error('https://svelte.dev/e/effect_orphan');
}
function Xt() {
  throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function $t() {
  throw new Error('https://svelte.dev/e/experimental_async_fork');
}
function Zt() {
  throw new Error('https://svelte.dev/e/fork_discarded');
}
function Jt() {
  throw new Error('https://svelte.dev/e/fork_timing');
}
function Cn() {
  throw new Error('https://svelte.dev/e/hydration_failed');
}
function Mn(e) {
  throw new Error('https://svelte.dev/e/props_invalid_value');
}
function Qt() {
  throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function en() {
  throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function tn() {
  throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function Fn() {
  throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const Ln = 1,
  jn = 2,
  qn = 16,
  Yn = 1,
  Hn = 4,
  Un = 8,
  Bn = 16,
  Vn = 1,
  Kn = 2,
  nn = '[',
  rn = '[!',
  sn = ']',
  Ve = {},
  m = Symbol(),
  zn = 'http://www.w3.org/1999/xhtml',
  Gn = '@attach';
function Ke(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function Wn() {
  console.warn('https://svelte.dev/e/select_multiple_invalid_value');
}
function Xn() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let Z = !1;
function $n(e) {
  Z = e;
}
let k;
function se(e) {
  if (e === null) throw (Ke(), Ve);
  return (k = e);
}
function Zn() {
  return se(z(k));
}
function Jn(e) {
  if (Z) {
    if (z(k) !== null) throw (Ke(), Ve);
    k = e;
  }
}
function Qn(e = 1) {
  if (Z) {
    for (var t = e, n = k; t--; ) n = z(n);
    k = n;
  }
}
function er(e = !0) {
  for (var t = 0, n = k; ; ) {
    if (n.nodeType === ut) {
      var r = n.data;
      if (r === sn) {
        if (t === 0) return n;
        t -= 1;
      } else (r === nn || r === rn) && (t += 1);
    }
    var s = z(n);
    (e && n.remove(), (n = s));
  }
}
function tr(e) {
  if (!e || e.nodeType !== ut) throw (Ke(), Ve);
  return e.data;
}
function ot(e) {
  return e === this.v;
}
function ct(e, t) {
  return e != e
    ? t == t
    : e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function _t(e) {
  return !ct(e, this.v);
}
let P = null;
function be(e) {
  P = e;
}
function nr(e, t = !1, n) {
  P = { p: P, i: !1, c: null, e: null, s: e, x: null, l: null };
}
function rr(e) {
  var t = P,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) Rt(r);
  }
  return ((t.i = !0), (P = t.p), {});
}
function vt() {
  return !0;
}
let W = [];
function dt() {
  var e = W;
  ((W = []), Vt(e));
}
function ht(e) {
  if (W.length === 0 && !_e) {
    var t = W;
    queueMicrotask(() => {
      t === W && dt();
    });
  }
  W.push(e);
}
function fn() {
  for (; W.length > 0; ) dt();
}
function an(e) {
  var t = v;
  if (t === null) return ((c.f |= U), e);
  if ((t.f & He) === 0) {
    if ((t.f & Ye) === 0) throw e;
    t.b.error(e);
  } else ge(e, t);
}
function ge(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ye) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e;
}
const X = new Set();
let w = null,
  De = null,
  S = null,
  N = [],
  Oe = null,
  Me = !1,
  _e = !1;
class V {
  committed = !1;
  current = new Map();
  previous = new Map();
  #r = new Set();
  #s = new Set();
  #t = 0;
  #n = 0;
  #a = null;
  #f = [];
  #i = [];
  skipped_effects = new Set();
  is_fork = !1;
  process(t) {
    ((N = []), (De = null), this.apply());
    var n = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: [],
      block_effects: [],
    };
    for (const r of t) this.#l(r, n);
    (this.is_fork || this.#u(),
      this.#n > 0 || this.is_fork
        ? (this.#e(n.effects),
          this.#e(n.render_effects),
          this.#e(n.block_effects))
        : ((De = this),
          (w = null),
          Qe(n.render_effects),
          Qe(n.effects),
          (De = null),
          this.#a?.resolve()),
      (S = null));
  }
  #l(t, n) {
    t.f ^= b;
    for (var r = t.first; r !== null; ) {
      var s = r.f,
        i = (s & (L | ee)) !== 0,
        l = i && (s & b) !== 0,
        u = l || (s & D) !== 0 || this.skipped_effects.has(r);
      if (
        ((r.f & Ye) !== 0 &&
          r.b?.is_pending() &&
          (n = {
            parent: n,
            effect: r,
            effects: [],
            render_effects: [],
            block_effects: [],
          }),
        !u && r.fn !== null)
      ) {
        i
          ? (r.f ^= b)
          : (s & Re) !== 0
            ? n.effects.push(r)
            : pe(r) && ((r.f & F) !== 0 && n.block_effects.push(r), de(r));
        var a = r.first;
        if (a !== null) {
          r = a;
          continue;
        }
      }
      var f = r.parent;
      for (r = r.next; r === null && f !== null; )
        (f === n.effect &&
          (this.#e(n.effects),
          this.#e(n.render_effects),
          this.#e(n.block_effects),
          (n = n.parent)),
          (r = f.next),
          (f = f.parent));
    }
  }
  #e(t) {
    for (const n of t) (((n.f & T) !== 0 ? this.#f : this.#i).push(n), E(n, b));
  }
  capture(t, n) {
    (this.previous.has(t) || this.previous.set(t, n),
      (t.f & U) === 0 && (this.current.set(t, t.v), S?.set(t, t.v)));
  }
  activate() {
    ((w = this), this.apply());
  }
  deactivate() {
    ((w = null), (S = null));
  }
  flush() {
    if ((this.activate(), N.length > 0)) {
      if ((Le(), w !== null && w !== this)) return;
    } else this.#t === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#s) t(this);
    this.#s.clear();
  }
  #u() {
    if (this.#n === 0) {
      for (const t of this.#r) t();
      this.#r.clear();
    }
    this.#t === 0 && this.#o();
  }
  #o() {
    if (X.size > 1) {
      this.previous.clear();
      var t = S,
        n = !0,
        r = {
          parent: null,
          effect: null,
          effects: [],
          render_effects: [],
          block_effects: [],
        };
      for (const s of X) {
        if (s === this) {
          n = !1;
          continue;
        }
        const i = [];
        for (const [u, a] of this.current) {
          if (s.current.has(u))
            if (n && a !== s.current.get(u)) s.current.set(u, a);
            else continue;
          i.push(u);
        }
        if (i.length === 0) continue;
        const l = [...s.current.keys()].filter((u) => !this.current.has(u));
        if (l.length > 0) {
          const u = new Set(),
            a = new Map();
          for (const f of i) pt(f, l, u, a);
          if (N.length > 0) {
            ((w = s), s.apply());
            for (const f of N) s.#l(f, r);
            ((N = []), s.deactivate());
          }
        }
      }
      ((w = null), (S = t));
    }
    ((this.committed = !0), X.delete(this));
  }
  increment(t) {
    ((this.#t += 1), t && (this.#n += 1));
  }
  decrement(t) {
    ((this.#t -= 1), t && (this.#n -= 1), this.revive());
  }
  revive() {
    for (const t of this.#f) (E(t, T), J(t));
    for (const t of this.#i) (E(t, j), J(t));
    ((this.#f = []), (this.#i = []), this.flush());
  }
  oncommit(t) {
    this.#r.add(t);
  }
  ondiscard(t) {
    this.#s.add(t);
  }
  settled() {
    return (this.#a ??= it()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = (w = new V());
      (X.add(w),
        _e ||
          V.enqueue(() => {
            w === t && t.flush();
          }));
    }
    return w;
  }
  static enqueue(t) {
    ht(t);
  }
  apply() {}
}
function Fe(e) {
  var t = _e;
  _e = !0;
  try {
    var n;
    for (e && (w !== null && Le(), (n = e())); ; ) {
      if ((fn(), N.length === 0 && (w?.flush(), N.length === 0)))
        return ((Oe = null), n);
      Le();
    }
  } finally {
    _e = t;
  }
}
function Le() {
  var e = re;
  Me = !0;
  try {
    var t = 0;
    for (rt(!0); N.length > 0; ) {
      var n = V.ensure();
      if (t++ > 1e3) {
        var r, s;
        ln();
      }
      (n.process(N), B.clear());
    }
  } finally {
    ((Me = !1), rt(e), (Oe = null));
  }
}
function ln() {
  try {
    Xt();
  } catch (e) {
    ge(e, Oe);
  }
}
let C = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        (r.f & (H | D)) === 0 &&
        pe(r) &&
        ((C = new Set()),
        de(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null && r.ac === null ? Nt(r) : (r.fn = null)),
        C?.size > 0)
      ) {
        B.clear();
        for (const s of C) {
          if ((s.f & (H | D)) !== 0) continue;
          const i = [s];
          let l = s.parent;
          for (; l !== null; )
            (C.has(l) && (C.delete(l), i.push(l)), (l = l.parent));
          for (let u = i.length - 1; u >= 0; u--) {
            const a = i[u];
            (a.f & (H | D)) === 0 && de(a);
          }
        }
        C.clear();
      }
    }
    C = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & y) !== 0
        ? pt(s, t, n, r)
        : (i & (Ue | F)) !== 0 &&
          (i & T) === 0 &&
          Et(s, t, r) &&
          (E(s, T), J(s));
    }
}
function wt(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      (r & y) !== 0 ? wt(n, t) : (r & Ie) !== 0 && (E(n, T), t.add(n));
    }
}
function Et(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (t.includes(s)) return !0;
      if ((s.f & y) !== 0 && Et(s, t, n)) return (n.set(s, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function J(e) {
  for (var t = (Oe = e); t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Me && t === v && (n & F) !== 0 && (n & at) === 0) return;
    if ((n & (ee | L)) !== 0) {
      if ((n & b) === 0) return;
      t.f ^= b;
    }
  }
  N.push(t);
}
function sr(e) {
  ($t(), w !== null && Jt());
  var t = V.ensure();
  t.is_fork = !0;
  var n = !1,
    r = t.settled();
  Fe(e);
  for (var [s, i] of t.previous) s.v = i;
  return {
    commit: async () => {
      if (n) {
        await r;
        return;
      }
      (X.has(t) || Zt(), (n = !0), (t.is_fork = !1));
      for (var [l, u] of t.current) l.v = u;
      (Fe(() => {
        var a = new Set();
        for (var f of t.current.keys()) wt(f, a);
        (vn(a), gt());
      }),
        t.revive(),
        await r);
    },
    discard: () => {
      !n && X.has(t) && (X.delete(t), t.discard());
    },
  };
}
function un(e, t, n, r) {
  const s = ze;
  if (n.length === 0 && e.length === 0) {
    r(t.map(s));
    return;
  }
  var i = w,
    l = v,
    u = on();
  function a() {
    Promise.all(n.map((f) => cn(f)))
      .then((f) => {
        u();
        try {
          r([...t.map(s), ...f]);
        } catch (o) {
          (l.f & H) === 0 && ge(o, l);
        }
        (i?.deactivate(), Te());
      })
      .catch((f) => {
        ge(f, l);
      });
  }
  e.length > 0
    ? Promise.all(e).then(() => {
        u();
        try {
          return a();
        } finally {
          (i?.deactivate(), Te());
        }
      })
    : a();
}
function on() {
  var e = v,
    t = c,
    n = P,
    r = w;
  return function (i = !0) {
    (fe(e), K(t), be(n), i && r?.activate());
  };
}
function Te() {
  (fe(null), K(null), be(null));
}
function ze(e) {
  var t = y | T,
    n = c !== null && (c.f & y) !== 0 ? c : null;
  return (
    v === null || (n !== null && (n.f & R) !== 0) ? (t |= R) : (v.f |= he),
    {
      ctx: P,
      deps: null,
      effects: null,
      equals: ot,
      f: t,
      fn: e,
      reactions: null,
      rv: 0,
      v: m,
      wv: 0,
      parent: n ?? v,
      ac: null,
    }
  );
}
function cn(e, t) {
  let n = v;
  n === null && Kt();
  var r = n.b,
    s = void 0,
    i = We(m),
    l = !c,
    u = new Map();
  return (
    En(() => {
      var a = it();
      s = a.promise;
      try {
        Promise.resolve(e())
          .then(a.resolve, a.reject)
          .then(() => {
            (f === w && f.committed && f.deactivate(), Te());
          });
      } catch (p) {
        (a.reject(p), Te());
      }
      var f = w;
      if (l) {
        var o = !r.is_pending();
        (r.update_pending_count(1),
          f.increment(o),
          u.get(f)?.reject(ne),
          u.delete(f),
          u.set(f, a));
      }
      const _ = (p, d = void 0) => {
        if ((f.activate(), d)) d !== ne && ((i.f |= U), je(i, d));
        else {
          ((i.f & U) !== 0 && (i.f ^= U), je(i, p));
          for (const [h, ae] of u) {
            if ((u.delete(h), h === f)) break;
            ae.reject(ne);
          }
        }
        l && (r.update_pending_count(-1), f.decrement(o));
      };
      a.promise.then(_, (p) => _(null, p || 'unknown'));
    }),
    wn(() => {
      for (const a of u.values()) a.reject(ne);
    }),
    new Promise((a) => {
      function f(o) {
        function _() {
          o === s ? a(i) : f(s);
        }
        o.then(_, _);
      }
      f(s);
    })
  );
}
function fr(e) {
  const t = ze(e);
  return (It(t), t);
}
function ir(e) {
  const t = ze(e);
  return ((t.equals = _t), t);
}
function yt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) Q(t[n]);
  }
}
function _n(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0) return t;
    t = t.parent;
  }
  return null;
}
function Ge(e) {
  var t,
    n = v;
  fe(_n(e));
  try {
    ((e.f &= ~me), yt(e), (t = Lt(e)));
  } finally {
    fe(n);
  }
  return t;
}
function mt(e) {
  var t = Ge(e);
  if ((e.equals(t) || ((e.v = t), (e.wv = Mt())), !ie))
    if (S !== null) S.set(e, e.v);
    else {
      var n = (Y || (e.f & R) !== 0) && e.deps !== null ? j : b;
      E(e, n);
    }
}
let Ae = new Set();
const B = new Map();
function vn(e) {
  Ae = e;
}
let bt = !1;
function We(e, t) {
  var n = { f: 0, v: e, reactions: null, equals: ot, rv: 0, wv: 0 };
  return n;
}
function q(e, t) {
  const n = We(e);
  return (It(n), n);
}
function ar(e, t = !1, n = !0) {
  const r = We(e);
  return (t || (r.equals = _t), r);
}
function G(e, t, n = !1) {
  c !== null &&
    (!O || (c.f & Ie) !== 0) &&
    vt() &&
    (c.f & (y | F | Ue | Ie)) !== 0 &&
    !M?.includes(e) &&
    tn();
  let r = n ? le(t) : t;
  return je(e, r);
}
function je(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    (ie ? B.set(e, t) : B.set(e, n), (e.v = t));
    var r = V.ensure();
    (r.capture(e, n),
      (e.f & y) !== 0 &&
        ((e.f & T) !== 0 && Ge(e), E(e, (e.f & R) === 0 ? b : j)),
      (e.wv = Mt()),
      Tt(e, T),
      v !== null &&
        (v.f & b) !== 0 &&
        (v.f & (L | ee)) === 0 &&
        (x === null ? Tn([e]) : x.push(e)),
      !r.is_fork && Ae.size > 0 && !bt && gt());
  }
  return t;
}
function gt() {
  bt = !1;
  const e = Array.from(Ae);
  for (const t of e) ((t.f & b) !== 0 && E(t, j), pe(t) && de(t));
  Ae.clear();
}
function Pe(e) {
  G(e, e.v + 1);
}
function Tt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s],
        l = i.f,
        u = (l & T) === 0;
      (u && E(i, t),
        (l & y) !== 0
          ? (l & me) === 0 && ((i.f |= me), Tt(i, j))
          : u && ((l & F) !== 0 && C !== null && C.add(i), J(i)));
    }
}
function le(e) {
  if (typeof e != 'object' || e === null || ce in e) return e;
  const t = Bt(e);
  if (t !== Ht && t !== Ut) return e;
  var n = new Map(),
    r = qt(e),
    s = q(0),
    i = $,
    l = (u) => {
      if ($ === i) return u();
      var a = c,
        f = $;
      (K(null), ft(i));
      var o = u();
      return (K(a), ft(f), o);
    };
  return (
    r && n.set('length', q(e.length)),
    new Proxy(e, {
      defineProperty(u, a, f) {
        (!('value' in f) ||
          f.configurable === !1 ||
          f.enumerable === !1 ||
          f.writable === !1) &&
          Qt();
        var o = n.get(a);
        return (
          o === void 0
            ? (o = l(() => {
                var _ = q(f.value);
                return (n.set(a, _), _);
              }))
            : G(o, f.value, !0),
          !0
        );
      },
      deleteProperty(u, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in u) {
            const o = l(() => q(m));
            (n.set(a, o), Pe(s));
          }
        } else (G(f, m), Pe(s));
        return !0;
      },
      get(u, a, f) {
        if (a === ce) return e;
        var o = n.get(a),
          _ = a in u;
        if (
          (o === void 0 &&
            (!_ || oe(u, a)?.writable) &&
            ((o = l(() => {
              var d = le(_ ? u[a] : m),
                h = q(d);
              return h;
            })),
            n.set(a, o)),
          o !== void 0)
        ) {
          var p = ue(o);
          return p === m ? void 0 : p;
        }
        return Reflect.get(u, a, f);
      },
      getOwnPropertyDescriptor(u, a) {
        var f = Reflect.getOwnPropertyDescriptor(u, a);
        if (f && 'value' in f) {
          var o = n.get(a);
          o && (f.value = ue(o));
        } else if (f === void 0) {
          var _ = n.get(a),
            p = _?.v;
          if (_ !== void 0 && p !== m)
            return { enumerable: !0, configurable: !0, value: p, writable: !0 };
        }
        return f;
      },
      has(u, a) {
        if (a === ce) return !0;
        var f = n.get(a),
          o = (f !== void 0 && f.v !== m) || Reflect.has(u, a);
        if (f !== void 0 || (v !== null && (!o || oe(u, a)?.writable))) {
          f === void 0 &&
            ((f = l(() => {
              var p = o ? le(u[a]) : m,
                d = q(p);
              return d;
            })),
            n.set(a, f));
          var _ = ue(f);
          if (_ === m) return !1;
        }
        return o;
      },
      set(u, a, f, o) {
        var _ = n.get(a),
          p = a in u;
        if (r && a === 'length')
          for (var d = f; d < _.v; d += 1) {
            var h = n.get(d + '');
            h !== void 0
              ? G(h, m)
              : d in u && ((h = l(() => q(m))), n.set(d + '', h));
          }
        if (_ === void 0)
          (!p || oe(u, a)?.writable) &&
            ((_ = l(() => q(void 0))), G(_, le(f)), n.set(a, _));
        else {
          p = _.v !== m;
          var ae = l(() => le(f));
          G(_, ae);
        }
        var $e = Reflect.getOwnPropertyDescriptor(u, a);
        if (($e?.set && $e.set.call(o, f), !p)) {
          if (r && typeof a == 'string') {
            var Ze = n.get('length'),
              Ne = Number(a);
            Number.isInteger(Ne) && Ne >= Ze.v && G(Ze, Ne + 1);
          }
          Pe(s);
        }
        return !0;
      },
      ownKeys(u) {
        ue(s);
        var a = Reflect.ownKeys(u).filter((_) => {
          var p = n.get(_);
          return p === void 0 || p.v !== m;
        });
        for (var [f, o] of n) o.v !== m && !(f in u) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        en();
      },
    })
  );
}
function et(e) {
  try {
    if (e !== null && typeof e == 'object' && ce in e) return e[ce];
  } catch {}
  return e;
}
function lr(e, t) {
  return Object.is(et(e), et(t));
}
var tt, dn, At, kt;
function ur() {
  if (tt === void 0) {
    ((tt = window), (dn = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((At = oe(t, 'firstChild').get),
      (kt = oe(t, 'nextSibling').get),
      Je(e) &&
        ((e.__click = void 0),
        (e.__className = void 0),
        (e.__attributes = null),
        (e.__style = void 0),
        (e.__e = void 0)),
      Je(n) && (n.__t = void 0));
  }
}
function ke(e = '') {
  return document.createTextNode(e);
}
function qe(e) {
  return At.call(e);
}
function z(e) {
  return kt.call(e);
}
function or(e, t) {
  if (!Z) return qe(e);
  var n = qe(k);
  if (n === null) n = k.appendChild(ke());
  else if (t && n.nodeType !== Be) {
    var r = ke();
    return (n?.before(r), se(r), r);
  }
  return (se(n), n);
}
function cr(e, t = !1) {
  if (!Z) {
    var n = qe(e);
    return n instanceof Comment && n.data === '' ? z(n) : n;
  }
  if (t && k?.nodeType !== Be) {
    var r = ke();
    return (k?.before(r), se(r), r);
  }
  return k;
}
function _r(e, t = 1, n = !1) {
  let r = Z ? k : e;
  for (var s; t--; ) ((s = r), (r = z(r)));
  if (!Z) return r;
  if (n && r?.nodeType !== Be) {
    var i = ke();
    return (r === null ? s?.after(i) : r.before(i), se(i), i);
  }
  return (se(r), r);
}
function vr(e) {
  e.textContent = '';
}
function dr() {
  return !1;
}
function hr(e, t) {
  if (t) {
    const n = document.body;
    ((e.autofocus = !0),
      ht(() => {
        document.activeElement === n && e.focus();
      }));
  }
}
let nt = !1;
function hn() {
  nt ||
    ((nt = !0),
    document.addEventListener(
      'reset',
      (e) => {
        Promise.resolve().then(() => {
          if (!e.defaultPrevented)
            for (const t of e.target.elements) t.__on_r?.();
        });
      },
      { capture: !0 },
    ));
}
function Xe(e) {
  var t = c,
    n = v;
  (K(null), fe(null));
  try {
    return e();
  } finally {
    (K(t), fe(n));
  }
}
function pr(e, t, n, r = n) {
  e.addEventListener(t, () => Xe(n));
  const s = e.__on_r;
  (s
    ? (e.__on_r = () => {
        (s(), r(!0));
      })
    : (e.__on_r = () => r(!0)),
    hn());
}
function xt(e) {
  (v === null && c === null && Wt(),
    c !== null && (c.f & R) !== 0 && v === null && Gt(),
    ie && zt());
}
function pn(e, t) {
  var n = t.last;
  n === null
    ? (t.last = t.first = e)
    : ((n.next = e), (e.prev = n), (t.last = e));
}
function I(e, t, n, r = !0) {
  var s = v;
  s !== null && (s.f & D) !== 0 && (e |= D);
  var i = {
    ctx: P,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | T,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: s,
    b: s && s.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null,
  };
  if (n)
    try {
      (de(i), (i.f |= He));
    } catch (a) {
      throw (Q(i), a);
    }
  else t !== null && J(i);
  if (r) {
    var l = i;
    if (
      (n &&
        l.deps === null &&
        l.teardown === null &&
        l.nodes_start === null &&
        l.first === l.last &&
        (l.f & he) === 0 &&
        ((l = l.first),
        (e & F) !== 0 && (e & Ee) !== 0 && l !== null && (l.f |= Ee)),
      l !== null &&
        ((l.parent = s),
        s !== null && pn(l, s),
        c !== null && (c.f & y) !== 0 && (e & ee) === 0))
    ) {
      var u = c;
      (u.effects ??= []).push(l);
    }
  }
  return i;
}
function wr() {
  return c !== null && !O;
}
function wn(e) {
  const t = I(Se, null, !1);
  return (E(t, b), (t.teardown = e), t);
}
function Er(e) {
  xt();
  var t = v.f,
    n = !c && (t & L) !== 0 && (t & He) === 0;
  if (n) {
    var r = P;
    (r.e ??= []).push(e);
  } else return Rt(e);
}
function Rt(e) {
  return I(Re | lt, e, !1);
}
function yr(e) {
  return (xt(), I(Se | lt, e, !0));
}
function mr(e) {
  V.ensure();
  const t = I(ee | he, e, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? bn(t, () => {
            (Q(t), r(void 0));
          })
        : (Q(t), r(void 0));
    });
}
function br(e) {
  return I(Re, e, !1);
}
function En(e) {
  return I(Ue | he, e, !0);
}
function gr(e, t = 0) {
  return I(Se | t, e, !0);
}
function Tr(e, t = [], n = [], r = [], s = !1) {
  un(r, t, n, (i) => {
    I(s ? Re : Se, () => e(...i.map(ue)), !0);
  });
}
function Ar(e, t = 0) {
  var n = I(F | t, e, !0);
  return n;
}
function kr(e, t = !0) {
  return I(L | he, e, !0, t);
}
function St(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie,
      r = c;
    (st(!0), K(null));
    try {
      t.call(null);
    } finally {
      (st(n), K(r));
    }
  }
}
function Ot(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null &&
      Xe(() => {
        s.abort(ne);
      });
    var r = n.next;
    ((n.f & ee) !== 0 ? (n.parent = null) : Q(n, t), (n = r));
  }
}
function yn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    ((t.f & L) === 0 && Q(t), (t = n));
  }
}
function Q(e, t = !0) {
  var n = !1;
  ((t || (e.f & at) !== 0) &&
    e.nodes_start !== null &&
    e.nodes_end !== null &&
    (mn(e.nodes_start, e.nodes_end), (n = !0)),
    Ot(e, t && !n),
    xe(e, 0),
    E(e, H));
  var r = e.transitions;
  if (r !== null) for (const i of r) i.stop();
  St(e);
  var s = e.parent;
  (s !== null && s.first !== null && Nt(e),
    (e.next =
      e.prev =
      e.teardown =
      e.ctx =
      e.deps =
      e.fn =
      e.nodes_start =
      e.nodes_end =
      e.ac =
        null));
}
function mn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : z(e);
    (e.remove(), (e = n));
  }
}
function Nt(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null &&
      (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function bn(e, t, n = !0) {
  var r = [];
  (Dt(e, r, !0),
    gn(r, () => {
      (n && Q(e), t && t());
    }));
}
function gn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e) s.out(r);
  } else t();
}
function Dt(e, t, n) {
  if ((e.f & D) === 0) {
    if (((e.f ^= D), e.transitions !== null))
      for (const l of e.transitions) (l.is_global || n) && t.push(l);
    for (var r = e.first; r !== null; ) {
      var s = r.next,
        i = (r.f & Ee) !== 0 || ((r.f & L) !== 0 && (e.f & F) !== 0);
      (Dt(r, t, i ? n : !1), (r = s));
    }
  }
}
function xr(e) {
  Pt(e, !0);
}
function Pt(e, t) {
  if ((e.f & D) !== 0) {
    ((e.f ^= D), (e.f & b) === 0 && (E(e, T), J(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next,
        s = (n.f & Ee) !== 0 || (n.f & L) !== 0;
      (Pt(n, s ? t : !1), (n = r));
    }
    if (e.transitions !== null)
      for (const i of e.transitions) (i.is_global || t) && i.in();
  }
}
function Rr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : z(n);
    (t.append(n), (n = s));
  }
}
let re = !1;
function rt(e) {
  re = e;
}
let ie = !1;
function st(e) {
  ie = e;
}
let c = null,
  O = !1;
function K(e) {
  c = e;
}
let v = null;
function fe(e) {
  v = e;
}
let M = null;
function It(e) {
  c !== null && (M === null ? (M = [e]) : M.push(e));
}
let g = null,
  A = 0,
  x = null;
function Tn(e) {
  x = e;
}
let Ct = 1,
  ve = 0,
  $ = ve;
function ft(e) {
  $ = e;
}
let Y = !1;
function Mt() {
  return ++Ct;
}
function pe(e) {
  var t = e.f;
  if ((t & T) !== 0) return !0;
  if ((t & j) !== 0) {
    var n = e.deps,
      r = (t & R) !== 0;
    if ((t & y && (e.f &= ~me), n !== null)) {
      var s,
        i,
        l = (t & ye) !== 0,
        u = r && v !== null && !Y,
        a = n.length;
      if ((l || u) && (v === null || (v.f & H) === 0)) {
        var f = e,
          o = f.parent;
        for (s = 0; s < a; s++)
          ((i = n[s]),
            (l || !i?.reactions?.includes(f)) && (i.reactions ??= []).push(f));
        (l && (f.f ^= ye), u && o !== null && (o.f & R) === 0 && (f.f ^= R));
      }
      for (s = 0; s < a; s++)
        if (((i = n[s]), pe(i) && mt(i), i.wv > e.wv)) return !0;
    }
    (!r || (v !== null && !Y)) && E(e, b);
  }
  return !1;
}
function Ft(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !M?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & y) !== 0
        ? Ft(i, t, !1)
        : t === i && (n ? E(i, T) : (i.f & b) !== 0 && E(i, j), J(i));
    }
}
function Lt(e) {
  var t = g,
    n = A,
    r = x,
    s = c,
    i = Y,
    l = M,
    u = P,
    a = O,
    f = $,
    o = e.f;
  ((g = null),
    (A = 0),
    (x = null),
    (Y = (o & R) !== 0 && (O || !re || c === null)),
    (c = (o & (L | ee)) === 0 ? e : null),
    (M = null),
    be(e.ctx),
    (O = !1),
    ($ = ++ve),
    e.ac !== null &&
      (Xe(() => {
        e.ac.abort(ne);
      }),
      (e.ac = null)));
  try {
    e.f |= Ce;
    var _ = e.fn,
      p = _(),
      d = e.deps;
    if (g !== null) {
      var h;
      if ((xe(e, A), d !== null && A > 0))
        for (d.length = A + g.length, h = 0; h < g.length; h++) d[A + h] = g[h];
      else e.deps = d = g;
      if (!Y || ((o & y) !== 0 && e.reactions !== null))
        for (h = A; h < d.length; h++) (d[h].reactions ??= []).push(e);
    } else d !== null && A < d.length && (xe(e, A), (d.length = A));
    if (vt() && x !== null && !O && d !== null && (e.f & (y | j | T)) === 0)
      for (h = 0; h < x.length; h++) Ft(x[h], e);
    return (
      s !== null &&
        s !== e &&
        (ve++, x !== null && (r === null ? (r = x) : r.push(...x))),
      (e.f & U) !== 0 && (e.f ^= U),
      p
    );
  } catch (ae) {
    return an(ae);
  } finally {
    ((e.f ^= Ce),
      (g = t),
      (A = n),
      (x = r),
      (c = s),
      (Y = i),
      (M = l),
      be(u),
      (O = a),
      ($ = f));
  }
}
function An(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Yt.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
    }
  }
  n === null &&
    (t.f & y) !== 0 &&
    (g === null || !g.includes(t)) &&
    (E(t, j), (t.f & (R | ye)) === 0 && (t.f ^= ye), yt(t), xe(t, 0));
}
function xe(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) An(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & H) === 0) {
    E(e, b);
    var n = v,
      r = re;
    ((v = e), (re = !0));
    try {
      ((t & F) !== 0 ? yn(e) : Ot(e), St(e));
      var s = Lt(e);
      ((e.teardown = typeof s == 'function' ? s : null), (e.wv = Ct));
      var i;
    } finally {
      ((re = r), (v = n));
    }
  }
}
async function Sr() {
  (await Promise.resolve(), Fe());
}
function Or() {
  return V.ensure().settled();
}
function ue(e) {
  var t = e.f,
    n = (t & y) !== 0;
  if (c !== null && !O) {
    var r = v !== null && (v.f & H) !== 0;
    if (!r && !M?.includes(e)) {
      var s = c.deps;
      if ((c.f & Ce) !== 0)
        e.rv < ve &&
          ((e.rv = ve),
          g === null && s !== null && s[A] === e
            ? A++
            : g === null
              ? (g = [e])
              : (!Y || !g.includes(e)) && g.push(e));
      else {
        (c.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? (e.reactions = [c]) : i.includes(c) || i.push(c);
      }
    }
  } else if (n && e.deps === null && e.effects === null) {
    var l = e,
      u = l.parent;
    u !== null && (u.f & R) === 0 && (l.f ^= R);
  }
  if (ie) {
    if (B.has(e)) return B.get(e);
    if (n) {
      l = e;
      var a = l.v;
      return (
        (((l.f & b) === 0 && l.reactions !== null) || jt(l)) && (a = Ge(l)),
        B.set(l, a),
        a
      );
    }
  } else if (n) {
    if (((l = e), S?.has(l))) return S.get(l);
    pe(l) && mt(l);
  }
  if (S?.has(e)) return S.get(e);
  if ((e.f & U) !== 0) throw e.v;
  return e.v;
}
function jt(e) {
  if (e.v === m) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps) if (B.has(t) || ((t.f & y) !== 0 && jt(t))) return !0;
  return !1;
}
function kn(e) {
  var t = O;
  try {
    return ((O = !0), e());
  } finally {
    O = t;
  }
}
const xn = -7169;
function E(e, t) {
  e.f = (e.f & xn) | t;
}
function Rn(e, t, n) {
  if (e == null) return (t(void 0), we);
  const r = kn(() => e.subscribe(t, n));
  return r.unsubscribe ? () => r.unsubscribe() : r;
}
const te = [];
function Nr(e, t = we) {
  let n = null;
  const r = new Set();
  function s(u) {
    if (ct(e, u) && ((e = u), n)) {
      const a = !te.length;
      for (const f of r) (f[1](), te.push(f, e));
      if (a) {
        for (let f = 0; f < te.length; f += 2) te[f][0](te[f + 1]);
        te.length = 0;
      }
    }
  }
  function i(u) {
    s(u(e));
  }
  function l(u, a = we) {
    const f = [u, a];
    return (
      r.add(f),
      r.size === 1 && (n = t(s, i) || we),
      u(e),
      () => {
        (r.delete(f), r.size === 0 && n && (n(), (n = null)));
      }
    );
  }
  return { set: s, update: i, subscribe: l };
}
function Dr(e) {
  let t;
  return (Rn(e, (n) => (t = n))(), t);
}
export {
  Pe as $,
  ke as A,
  kr as B,
  k as C,
  H as D,
  Ee as E,
  Rr as F,
  dr as G,
  rn as H,
  wn as I,
  On as J,
  we as K,
  Dn as L,
  ar as M,
  Rn as N,
  Dr as O,
  Hn as P,
  nr as Q,
  cr as R,
  ce as S,
  Tr as T,
  rr as U,
  or as V,
  Jn as W,
  _r as X,
  wr as Y,
  We as Z,
  gr as _,
  Zn as a,
  ht as a0,
  ut as a1,
  V as a2,
  fe as a3,
  K as a4,
  be as a5,
  an as a6,
  c as a7,
  je as a8,
  Qn as a9,
  fr as aA,
  qt as aB,
  Wn as aC,
  lr as aD,
  un as aE,
  Gn as aF,
  hr as aG,
  m as aH,
  hn as aI,
  zn as aJ,
  Bt as aK,
  Pn as aL,
  Nn as aM,
  jn as aN,
  D as aO,
  Ln as aP,
  qn as aQ,
  Dt as aR,
  gn as aS,
  pr as aT,
  De as aU,
  Nr as aV,
  sr as aW,
  Or as aX,
  ge as aa,
  Fn as ab,
  he as ac,
  Ye as ad,
  Xn as ae,
  ur as af,
  qe as ag,
  nn as ah,
  z as ai,
  Ve as aj,
  Cn as ak,
  vr as al,
  Sn as am,
  mr as an,
  sn as ao,
  Ke as ap,
  Xe as aq,
  dn as ar,
  Vn as as,
  Kn as at,
  Be as au,
  br as av,
  Fe as aw,
  yr as ax,
  q as ay,
  Sr as az,
  Ar as b,
  se as c,
  $n as d,
  ue as e,
  ze as f,
  oe as g,
  Z as h,
  ir as i,
  le as j,
  G as k,
  ie as l,
  v as m,
  Bn as n,
  Un as o,
  Mn as p,
  Yn as q,
  tr as r,
  er as s,
  Er as t,
  kn as u,
  P as v,
  w,
  xr as x,
  Q as y,
  bn as z,
};
