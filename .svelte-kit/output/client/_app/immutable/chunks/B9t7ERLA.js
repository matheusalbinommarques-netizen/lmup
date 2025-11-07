var It = Array.isArray,
  Pt = Array.prototype.indexOf,
  mn = Array.from,
  gn = Object.defineProperty,
  ue = Object.getOwnPropertyDescriptor,
  bn = Object.getOwnPropertyDescriptors,
  Ct = Object.prototype,
  Ft = Array.prototype,
  Mt = Object.getPrototypeOf,
  We = Object.isExtensible;
const Tn = () => {};
function Lt(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function et() {
  var e,
    t,
    n = new Promise((r, s) => {
      ((e = r), (t = s));
    });
  return { promise: n, resolve: e, reject: t };
}
const y = 2,
  Ae = 4,
  ke = 8,
  M = 16,
  L = 32,
  ee = 64,
  Le = 128,
  g = 1024,
  T = 2048,
  j = 4096,
  N = 8192,
  H = 16384,
  je = 32768,
  de = 65536,
  De = 1 << 17,
  tt = 1 << 18,
  ve = 1 << 19,
  nt = 1 << 20,
  R = 256,
  pe = 512,
  we = 32768,
  Ne = 1 << 21,
  qe = 1 << 22,
  U = 1 << 23,
  Se = Symbol('$state'),
  An = Symbol('legacy props'),
  kn = Symbol(''),
  te = new (class extends Error {
    name = 'StaleReactionError';
    message =
      'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  Ye = 3,
  rt = 8;
function jt() {
  throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function qt(e) {
  throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Yt() {
  throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function Ht(e) {
  throw new Error('https://svelte.dev/e/effect_orphan');
}
function Ut() {
  throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function Bt() {
  throw new Error('https://svelte.dev/e/experimental_async_fork');
}
function Vt() {
  throw new Error('https://svelte.dev/e/fork_discarded');
}
function Gt() {
  throw new Error('https://svelte.dev/e/fork_timing');
}
function Rn() {
  throw new Error('https://svelte.dev/e/hydration_failed');
}
function Sn(e) {
  throw new Error('https://svelte.dev/e/props_invalid_value');
}
function Kt() {
  throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function zt() {
  throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function Wt() {
  throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function On() {
  throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const Dn = 1,
  Nn = 2,
  In = 16,
  Pn = 1,
  Cn = 4,
  Fn = 8,
  Mn = 16,
  Ln = 1,
  jn = 2,
  Xt = '[',
  Zt = '[!',
  $t = ']',
  He = {},
  m = Symbol(),
  qn = 'http://www.w3.org/1999/xhtml';
function Ue(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function Yn() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let $ = !1;
function Hn(e) {
  $ = e;
}
let k;
function re(e) {
  if (e === null) throw (Ue(), He);
  return (k = e);
}
function Un() {
  return re(K(k));
}
function Bn(e) {
  if ($) {
    if (K(k) !== null) throw (Ue(), He);
    k = e;
  }
}
function Vn(e = 1) {
  if ($) {
    for (var t = e, n = k; t--; ) n = K(n);
    k = n;
  }
}
function Gn(e = !0) {
  for (var t = 0, n = k; ; ) {
    if (n.nodeType === rt) {
      var r = n.data;
      if (r === $t) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Xt || r === Zt) && (t += 1);
    }
    var s = K(n);
    (e && n.remove(), (n = s));
  }
}
function Kn(e) {
  if (!e || e.nodeType !== rt) throw (Ue(), He);
  return e.data;
}
function st(e) {
  return e === this.v;
}
function Jt(e, t) {
  return e != e
    ? t == t
    : e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function ft(e) {
  return !Jt(e, this.v);
}
let I = null;
function Ee(e) {
  I = e;
}
function zn(e, t = !1, n) {
  I = { p: I, i: !1, c: null, e: null, s: e, x: null, l: null };
}
function Wn(e) {
  var t = I,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) mt(r);
  }
  return ((t.i = !0), (I = t.p), {});
}
function it() {
  return !0;
}
let W = [];
function at() {
  var e = W;
  ((W = []), Lt(e));
}
function Qt(e) {
  if (W.length === 0 && !oe) {
    var t = W;
    queueMicrotask(() => {
      t === W && at();
    });
  }
  W.push(e);
}
function en() {
  for (; W.length > 0; ) at();
}
function tn(e) {
  var t = v;
  if (t === null) return ((c.f |= U), e);
  if ((t.f & je) === 0) {
    if ((t.f & Le) === 0) throw e;
    t.b.error(e);
  } else ye(e, t);
}
function ye(e, t) {
  for (; t !== null; ) {
    if ((t.f & Le) !== 0)
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
  S = null,
  D = [],
  xe = null,
  Ie = !1,
  oe = !1;
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
    ((D = []), this.apply());
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
        : ((w = null), Xe(n.render_effects), Xe(n.effects), this.#a?.resolve()),
      (S = null));
  }
  #l(t, n) {
    t.f ^= g;
    for (var r = t.first; r !== null; ) {
      var s = r.f,
        f = (s & (L | ee)) !== 0,
        l = f && (s & g) !== 0,
        u = l || (s & N) !== 0 || this.skipped_effects.has(r);
      if (
        ((r.f & Le) !== 0 &&
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
        f
          ? (r.f ^= g)
          : (s & Ae) !== 0
            ? n.effects.push(r)
            : he(r) && ((r.f & M) !== 0 && n.block_effects.push(r), _e(r));
        var i = r.first;
        if (i !== null) {
          r = i;
          continue;
        }
      }
      var a = r.parent;
      for (r = r.next; r === null && a !== null; )
        (a === n.effect &&
          (this.#e(n.effects),
          this.#e(n.render_effects),
          this.#e(n.block_effects),
          (n = n.parent)),
          (r = a.next),
          (a = a.parent));
    }
  }
  #e(t) {
    for (const n of t) (((n.f & T) !== 0 ? this.#f : this.#i).push(n), E(n, g));
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
    if ((this.activate(), D.length > 0)) {
      if ((Ce(), w !== null && w !== this)) return;
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
        const f = [];
        for (const [u, i] of this.current) {
          if (s.current.has(u))
            if (n && i !== s.current.get(u)) s.current.set(u, i);
            else continue;
          f.push(u);
        }
        if (f.length === 0) continue;
        const l = [...s.current.keys()].filter((u) => !this.current.has(u));
        if (l.length > 0) {
          const u = new Set(),
            i = new Map();
          for (const a of f) lt(a, l, u, i);
          if (D.length > 0) {
            ((w = s), s.apply());
            for (const a of D) s.#l(a, r);
            ((D = []), s.deactivate());
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
    return (this.#a ??= et()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = (w = new V());
      (X.add(w),
        oe ||
          V.enqueue(() => {
            w === t && t.flush();
          }));
    }
    return w;
  }
  static enqueue(t) {
    Qt(t);
  }
  apply() {}
}
function Pe(e) {
  var t = oe;
  oe = !0;
  try {
    var n;
    for (e && (w !== null && Ce(), (n = e())); ; ) {
      if ((en(), D.length === 0 && (w?.flush(), D.length === 0)))
        return ((xe = null), n);
      Ce();
    }
  } finally {
    oe = t;
  }
}
function Ce() {
  var e = ne;
  Ie = !0;
  try {
    var t = 0;
    for ($e(!0); D.length > 0; ) {
      var n = V.ensure();
      if (t++ > 1e3) {
        var r, s;
        nn();
      }
      (n.process(D), B.clear());
    }
  } finally {
    ((Ie = !1), $e(e), (xe = null));
  }
}
function nn() {
  try {
    Ut();
  } catch (e) {
    ye(e, xe);
  }
}
let C = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        (r.f & (H | N)) === 0 &&
        he(r) &&
        ((C = new Set()),
        _e(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null && r.ac === null ? Tt(r) : (r.fn = null)),
        C?.size > 0)
      ) {
        B.clear();
        for (const s of C) {
          if ((s.f & (H | N)) !== 0) continue;
          const f = [s];
          let l = s.parent;
          for (; l !== null; )
            (C.has(l) && (C.delete(l), f.push(l)), (l = l.parent));
          for (let u = f.length - 1; u >= 0; u--) {
            const i = f[u];
            (i.f & (H | N)) === 0 && _e(i);
          }
        }
        C.clear();
      }
    }
    C = null;
  }
}
function lt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const f = s.f;
      (f & y) !== 0
        ? lt(s, t, n, r)
        : (f & (qe | M)) !== 0 &&
          (f & T) === 0 &&
          ot(s, t, r) &&
          (E(s, T), J(s));
    }
}
function ut(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      (r & y) !== 0 ? ut(n, t) : (r & De) !== 0 && (E(n, T), t.add(n));
    }
}
function ot(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (t.includes(s)) return !0;
      if ((s.f & y) !== 0 && ot(s, t, n)) return (n.set(s, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function J(e) {
  for (var t = (xe = e); t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Ie && t === v && (n & M) !== 0 && (n & tt) === 0) return;
    if ((n & (ee | L)) !== 0) {
      if ((n & g) === 0) return;
      t.f ^= g;
    }
  }
  D.push(t);
}
function Xn(e) {
  (Bt(), w !== null && Gt());
  var t = V.ensure();
  t.is_fork = !0;
  var n = !1,
    r = t.settled();
  Pe(e);
  for (var [s, f] of t.previous) s.v = f;
  return {
    commit: async () => {
      if (n) {
        await r;
        return;
      }
      (X.has(t) || Vt(), (n = !0), (t.is_fork = !1));
      for (var [l, u] of t.current) l.v = u;
      (Pe(() => {
        var i = new Set();
        for (var a of t.current.keys()) ut(a, i);
        (ln(i), ht());
      }),
        t.revive(),
        await r);
    },
    discard: () => {
      !n && X.has(t) && (X.delete(t), t.discard());
    },
  };
}
function rn(e, t, n, r) {
  const s = Be;
  if (n.length === 0 && e.length === 0) {
    r(t.map(s));
    return;
  }
  var f = w,
    l = v,
    u = sn();
  function i() {
    Promise.all(n.map((a) => fn(a)))
      .then((a) => {
        u();
        try {
          r([...t.map(s), ...a]);
        } catch (o) {
          (l.f & H) === 0 && ye(o, l);
        }
        (f?.deactivate(), me());
      })
      .catch((a) => {
        ye(a, l);
      });
  }
  e.length > 0
    ? Promise.all(e).then(() => {
        u();
        try {
          return i();
        } finally {
          (f?.deactivate(), me());
        }
      })
    : i();
}
function sn() {
  var e = v,
    t = c,
    n = I,
    r = w;
  return function (f = !0) {
    (se(e), G(t), Ee(n), f && r?.activate());
  };
}
function me() {
  (se(null), G(null), Ee(null));
}
function Be(e) {
  var t = y | T,
    n = c !== null && (c.f & y) !== 0 ? c : null;
  return (
    v === null || (n !== null && (n.f & R) !== 0) ? (t |= R) : (v.f |= ve),
    {
      ctx: I,
      deps: null,
      effects: null,
      equals: st,
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
function fn(e, t) {
  let n = v;
  n === null && jt();
  var r = n.b,
    s = void 0,
    f = Ge(m),
    l = !c,
    u = new Map();
  return (
    _n(() => {
      var i = et();
      s = i.promise;
      try {
        Promise.resolve(e())
          .then(i.resolve, i.reject)
          .then(() => {
            (a === w && a.committed && a.deactivate(), me());
          });
      } catch (p) {
        (i.reject(p), me());
      }
      var a = w;
      if (l) {
        var o = !r.is_pending();
        (r.update_pending_count(1),
          a.increment(o),
          u.get(a)?.reject(te),
          u.delete(a),
          u.set(a, i));
      }
      const _ = (p, h = void 0) => {
        if ((a.activate(), h)) h !== te && ((f.f |= U), Fe(f, h));
        else {
          ((f.f & U) !== 0 && (f.f ^= U), Fe(f, p));
          for (const [d, ie] of u) {
            if ((u.delete(d), d === a)) break;
            ie.reject(te);
          }
        }
        l && (r.update_pending_count(-1), a.decrement(o));
      };
      i.promise.then(_, (p) => _(null, p || 'unknown'));
    }),
    cn(() => {
      for (const i of u.values()) i.reject(te);
    }),
    new Promise((i) => {
      function a(o) {
        function _() {
          o === s ? i(f) : a(s);
        }
        o.then(_, _);
      }
      a(s);
    })
  );
}
function Zn(e) {
  const t = Be(e);
  return (xt(t), t);
}
function $n(e) {
  const t = Be(e);
  return ((t.equals = ft), t);
}
function ct(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) Q(t[n]);
  }
}
function an(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0) return t;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t,
    n = v;
  se(an(e));
  try {
    ((e.f &= ~we), ct(e), (t = Dt(e)));
  } finally {
    se(n);
  }
  return t;
}
function _t(e) {
  var t = Ve(e);
  if ((e.equals(t) || ((e.v = t), (e.wv = St())), !fe))
    if (S !== null) S.set(e, e.v);
    else {
      var n = (Y || (e.f & R) !== 0) && e.deps !== null ? j : g;
      E(e, n);
    }
}
let ge = new Set();
const B = new Map();
function ln(e) {
  ge = e;
}
let vt = !1;
function Ge(e, t) {
  var n = { f: 0, v: e, reactions: null, equals: st, rv: 0, wv: 0 };
  return n;
}
function q(e, t) {
  const n = Ge(e);
  return (xt(n), n);
}
function Jn(e, t = !1, n = !0) {
  const r = Ge(e);
  return (t || (r.equals = ft), r);
}
function z(e, t, n = !1) {
  c !== null &&
    (!O || (c.f & De) !== 0) &&
    it() &&
    (c.f & (y | M | qe | De)) !== 0 &&
    !F?.includes(e) &&
    Wt();
  let r = n ? ae(t) : t;
  return Fe(e, r);
}
function Fe(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    (fe ? B.set(e, t) : B.set(e, n), (e.v = t));
    var r = V.ensure();
    (r.capture(e, n),
      (e.f & y) !== 0 &&
        ((e.f & T) !== 0 && Ve(e), E(e, (e.f & R) === 0 ? g : j)),
      (e.wv = St()),
      dt(e, T),
      v !== null &&
        (v.f & g) !== 0 &&
        (v.f & (L | ee)) === 0 &&
        (x === null ? wn([e]) : x.push(e)),
      !r.is_fork && ge.size > 0 && !vt && ht());
  }
  return t;
}
function ht() {
  vt = !1;
  const e = Array.from(ge);
  for (const t of e) ((t.f & g) !== 0 && E(t, j), he(t) && _e(t));
  ge.clear();
}
function Oe(e) {
  z(e, e.v + 1);
}
function dt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var f = n[s],
        l = f.f,
        u = (l & T) === 0;
      (u && E(f, t),
        (l & y) !== 0
          ? (l & we) === 0 && ((f.f |= we), dt(f, j))
          : u && ((l & M) !== 0 && C !== null && C.add(f), J(f)));
    }
}
function ae(e) {
  if (typeof e != 'object' || e === null || Se in e) return e;
  const t = Mt(e);
  if (t !== Ct && t !== Ft) return e;
  var n = new Map(),
    r = It(e),
    s = q(0),
    f = Z,
    l = (u) => {
      if (Z === f) return u();
      var i = c,
        a = Z;
      (G(null), Qe(f));
      var o = u();
      return (G(i), Qe(a), o);
    };
  return (
    r && n.set('length', q(e.length)),
    new Proxy(e, {
      defineProperty(u, i, a) {
        (!('value' in a) ||
          a.configurable === !1 ||
          a.enumerable === !1 ||
          a.writable === !1) &&
          Kt();
        var o = n.get(i);
        return (
          o === void 0
            ? (o = l(() => {
                var _ = q(a.value);
                return (n.set(i, _), _);
              }))
            : z(o, a.value, !0),
          !0
        );
      },
      deleteProperty(u, i) {
        var a = n.get(i);
        if (a === void 0) {
          if (i in u) {
            const o = l(() => q(m));
            (n.set(i, o), Oe(s));
          }
        } else (z(a, m), Oe(s));
        return !0;
      },
      get(u, i, a) {
        if (i === Se) return e;
        var o = n.get(i),
          _ = i in u;
        if (
          (o === void 0 &&
            (!_ || ue(u, i)?.writable) &&
            ((o = l(() => {
              var h = ae(_ ? u[i] : m),
                d = q(h);
              return d;
            })),
            n.set(i, o)),
          o !== void 0)
        ) {
          var p = le(o);
          return p === m ? void 0 : p;
        }
        return Reflect.get(u, i, a);
      },
      getOwnPropertyDescriptor(u, i) {
        var a = Reflect.getOwnPropertyDescriptor(u, i);
        if (a && 'value' in a) {
          var o = n.get(i);
          o && (a.value = le(o));
        } else if (a === void 0) {
          var _ = n.get(i),
            p = _?.v;
          if (_ !== void 0 && p !== m)
            return { enumerable: !0, configurable: !0, value: p, writable: !0 };
        }
        return a;
      },
      has(u, i) {
        if (i === Se) return !0;
        var a = n.get(i),
          o = (a !== void 0 && a.v !== m) || Reflect.has(u, i);
        if (a !== void 0 || (v !== null && (!o || ue(u, i)?.writable))) {
          a === void 0 &&
            ((a = l(() => {
              var p = o ? ae(u[i]) : m,
                h = q(p);
              return h;
            })),
            n.set(i, a));
          var _ = le(a);
          if (_ === m) return !1;
        }
        return o;
      },
      set(u, i, a, o) {
        var _ = n.get(i),
          p = i in u;
        if (r && i === 'length')
          for (var h = a; h < _.v; h += 1) {
            var d = n.get(h + '');
            d !== void 0
              ? z(d, m)
              : h in u && ((d = l(() => q(m))), n.set(h + '', d));
          }
        if (_ === void 0)
          (!p || ue(u, i)?.writable) &&
            ((_ = l(() => q(void 0))), z(_, ae(a)), n.set(i, _));
        else {
          p = _.v !== m;
          var ie = l(() => ae(a));
          z(_, ie);
        }
        var Ke = Reflect.getOwnPropertyDescriptor(u, i);
        if ((Ke?.set && Ke.set.call(o, a), !p)) {
          if (r && typeof i == 'string') {
            var ze = n.get('length'),
              Re = Number(i);
            Number.isInteger(Re) && Re >= ze.v && z(ze, Re + 1);
          }
          Oe(s);
        }
        return !0;
      },
      ownKeys(u) {
        le(s);
        var i = Reflect.ownKeys(u).filter((_) => {
          var p = n.get(_);
          return p === void 0 || p.v !== m;
        });
        for (var [a, o] of n) o.v !== m && !(a in u) && i.push(a);
        return i;
      },
      setPrototypeOf() {
        zt();
      },
    })
  );
}
var Ze, un, pt, wt;
function Qn() {
  if (Ze === void 0) {
    ((Ze = window), (un = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((pt = ue(t, 'firstChild').get),
      (wt = ue(t, 'nextSibling').get),
      We(e) &&
        ((e.__click = void 0),
        (e.__className = void 0),
        (e.__attributes = null),
        (e.__style = void 0),
        (e.__e = void 0)),
      We(n) && (n.__t = void 0));
  }
}
function be(e = '') {
  return document.createTextNode(e);
}
function Me(e) {
  return pt.call(e);
}
function K(e) {
  return wt.call(e);
}
function er(e, t) {
  if (!$) return Me(e);
  var n = Me(k);
  if (n === null) n = k.appendChild(be());
  else if (t && n.nodeType !== Ye) {
    var r = be();
    return (n?.before(r), re(r), r);
  }
  return (re(n), n);
}
function tr(e, t = !1) {
  if (!$) {
    var n = Me(e);
    return n instanceof Comment && n.data === '' ? K(n) : n;
  }
  if (t && k?.nodeType !== Ye) {
    var r = be();
    return (k?.before(r), re(r), r);
  }
  return k;
}
function nr(e, t = 1, n = !1) {
  let r = $ ? k : e;
  for (var s; t--; ) ((s = r), (r = K(r)));
  if (!$) return r;
  if (n && r?.nodeType !== Ye) {
    var f = be();
    return (r === null ? s?.after(f) : r.before(f), re(f), f);
  }
  return (re(r), r);
}
function rr(e) {
  e.textContent = '';
}
function sr() {
  return !1;
}
function Et(e) {
  var t = c,
    n = v;
  (G(null), se(null));
  try {
    return e();
  } finally {
    (G(t), se(n));
  }
}
function yt(e) {
  (v === null && c === null && Ht(),
    c !== null && (c.f & R) !== 0 && v === null && Yt(),
    fe && qt());
}
function on(e, t) {
  var n = t.last;
  n === null
    ? (t.last = t.first = e)
    : ((n.next = e), (e.prev = n), (t.last = e));
}
function P(e, t, n, r = !0) {
  var s = v;
  s !== null && (s.f & N) !== 0 && (e |= N);
  var f = {
    ctx: I,
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
      (_e(f), (f.f |= je));
    } catch (i) {
      throw (Q(f), i);
    }
  else t !== null && J(f);
  if (r) {
    var l = f;
    if (
      (n &&
        l.deps === null &&
        l.teardown === null &&
        l.nodes_start === null &&
        l.first === l.last &&
        (l.f & ve) === 0 &&
        ((l = l.first),
        (e & M) !== 0 && (e & de) !== 0 && l !== null && (l.f |= de)),
      l !== null &&
        ((l.parent = s),
        s !== null && on(l, s),
        c !== null && (c.f & y) !== 0 && (e & ee) === 0))
    ) {
      var u = c;
      (u.effects ??= []).push(l);
    }
  }
  return f;
}
function fr() {
  return c !== null && !O;
}
function cn(e) {
  const t = P(ke, null, !1);
  return (E(t, g), (t.teardown = e), t);
}
function ir(e) {
  yt();
  var t = v.f,
    n = !c && (t & L) !== 0 && (t & je) === 0;
  if (n) {
    var r = I;
    (r.e ??= []).push(e);
  } else return mt(e);
}
function mt(e) {
  return P(Ae | nt, e, !1);
}
function ar(e) {
  return (yt(), P(ke | nt, e, !0));
}
function lr(e) {
  V.ensure();
  const t = P(ee | ve, e, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? dn(t, () => {
            (Q(t), r(void 0));
          })
        : (Q(t), r(void 0));
    });
}
function ur(e) {
  return P(Ae, e, !1);
}
function _n(e) {
  return P(qe | ve, e, !0);
}
function or(e, t = 0) {
  return P(ke | t, e, !0);
}
function cr(e, t = [], n = [], r = [], s = !1) {
  rn(r, t, n, (f) => {
    P(s ? Ae : ke, () => e(...f.map(le)), !0);
  });
}
function _r(e, t = 0) {
  var n = P(M | t, e, !0);
  return n;
}
function vr(e, t = !0) {
  return P(L | ve, e, !0, t);
}
function gt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = fe,
      r = c;
    (Je(!0), G(null));
    try {
      t.call(null);
    } finally {
      (Je(n), G(r));
    }
  }
}
function bt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null &&
      Et(() => {
        s.abort(te);
      });
    var r = n.next;
    ((n.f & ee) !== 0 ? (n.parent = null) : Q(n, t), (n = r));
  }
}
function vn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    ((t.f & L) === 0 && Q(t), (t = n));
  }
}
function Q(e, t = !0) {
  var n = !1;
  ((t || (e.f & tt) !== 0) &&
    e.nodes_start !== null &&
    e.nodes_end !== null &&
    (hn(e.nodes_start, e.nodes_end), (n = !0)),
    bt(e, t && !n),
    Te(e, 0),
    E(e, H));
  var r = e.transitions;
  if (r !== null) for (const f of r) f.stop();
  gt(e);
  var s = e.parent;
  (s !== null && s.first !== null && Tt(e),
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
function hn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : K(e);
    (e.remove(), (e = n));
  }
}
function Tt(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null &&
      (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function dn(e, t, n = !0) {
  var r = [];
  (At(e, r, !0),
    pn(r, () => {
      (n && Q(e), t && t());
    }));
}
function pn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e) s.out(r);
  } else t();
}
function At(e, t, n) {
  if ((e.f & N) === 0) {
    if (((e.f ^= N), e.transitions !== null))
      for (const l of e.transitions) (l.is_global || n) && t.push(l);
    for (var r = e.first; r !== null; ) {
      var s = r.next,
        f = (r.f & de) !== 0 || ((r.f & L) !== 0 && (e.f & M) !== 0);
      (At(r, t, f ? n : !1), (r = s));
    }
  }
}
function hr(e) {
  kt(e, !0);
}
function kt(e, t) {
  if ((e.f & N) !== 0) {
    ((e.f ^= N), (e.f & g) === 0 && (E(e, T), J(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next,
        s = (n.f & de) !== 0 || (n.f & L) !== 0;
      (kt(n, s ? t : !1), (n = r));
    }
    if (e.transitions !== null)
      for (const f of e.transitions) (f.is_global || t) && f.in();
  }
}
function dr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : K(n);
    (t.append(n), (n = s));
  }
}
let ne = !1;
function $e(e) {
  ne = e;
}
let fe = !1;
function Je(e) {
  fe = e;
}
let c = null,
  O = !1;
function G(e) {
  c = e;
}
let v = null;
function se(e) {
  v = e;
}
let F = null;
function xt(e) {
  c !== null && (F === null ? (F = [e]) : F.push(e));
}
let b = null,
  A = 0,
  x = null;
function wn(e) {
  x = e;
}
let Rt = 1,
  ce = 0,
  Z = ce;
function Qe(e) {
  Z = e;
}
let Y = !1;
function St() {
  return ++Rt;
}
function he(e) {
  var t = e.f;
  if ((t & T) !== 0) return !0;
  if ((t & j) !== 0) {
    var n = e.deps,
      r = (t & R) !== 0;
    if ((t & y && (e.f &= ~we), n !== null)) {
      var s,
        f,
        l = (t & pe) !== 0,
        u = r && v !== null && !Y,
        i = n.length;
      if ((l || u) && (v === null || (v.f & H) === 0)) {
        var a = e,
          o = a.parent;
        for (s = 0; s < i; s++)
          ((f = n[s]),
            (l || !f?.reactions?.includes(a)) && (f.reactions ??= []).push(a));
        (l && (a.f ^= pe), u && o !== null && (o.f & R) === 0 && (a.f ^= R));
      }
      for (s = 0; s < i; s++)
        if (((f = n[s]), he(f) && _t(f), f.wv > e.wv)) return !0;
    }
    (!r || (v !== null && !Y)) && E(e, g);
  }
  return !1;
}
function Ot(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !F?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var f = r[s];
      (f.f & y) !== 0
        ? Ot(f, t, !1)
        : t === f && (n ? E(f, T) : (f.f & g) !== 0 && E(f, j), J(f));
    }
}
function Dt(e) {
  var t = b,
    n = A,
    r = x,
    s = c,
    f = Y,
    l = F,
    u = I,
    i = O,
    a = Z,
    o = e.f;
  ((b = null),
    (A = 0),
    (x = null),
    (Y = (o & R) !== 0 && (O || !ne || c === null)),
    (c = (o & (L | ee)) === 0 ? e : null),
    (F = null),
    Ee(e.ctx),
    (O = !1),
    (Z = ++ce),
    e.ac !== null &&
      (Et(() => {
        e.ac.abort(te);
      }),
      (e.ac = null)));
  try {
    e.f |= Ne;
    var _ = e.fn,
      p = _(),
      h = e.deps;
    if (b !== null) {
      var d;
      if ((Te(e, A), h !== null && A > 0))
        for (h.length = A + b.length, d = 0; d < b.length; d++) h[A + d] = b[d];
      else e.deps = h = b;
      if (!Y || ((o & y) !== 0 && e.reactions !== null))
        for (d = A; d < h.length; d++) (h[d].reactions ??= []).push(e);
    } else h !== null && A < h.length && (Te(e, A), (h.length = A));
    if (it() && x !== null && !O && h !== null && (e.f & (y | j | T)) === 0)
      for (d = 0; d < x.length; d++) Ot(x[d], e);
    return (
      s !== null &&
        s !== e &&
        (ce++, x !== null && (r === null ? (r = x) : r.push(...x))),
      (e.f & U) !== 0 && (e.f ^= U),
      p
    );
  } catch (ie) {
    return tn(ie);
  } finally {
    ((e.f ^= Ne),
      (b = t),
      (A = n),
      (x = r),
      (c = s),
      (Y = f),
      (F = l),
      Ee(u),
      (O = i),
      (Z = a));
  }
}
function En(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Pt.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
    }
  }
  n === null &&
    (t.f & y) !== 0 &&
    (b === null || !b.includes(t)) &&
    (E(t, j), (t.f & (R | pe)) === 0 && (t.f ^= pe), ct(t), Te(t, 0));
}
function Te(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) En(e, n[r]);
}
function _e(e) {
  var t = e.f;
  if ((t & H) === 0) {
    E(e, g);
    var n = v,
      r = ne;
    ((v = e), (ne = !0));
    try {
      ((t & M) !== 0 ? vn(e) : bt(e), gt(e));
      var s = Dt(e);
      ((e.teardown = typeof s == 'function' ? s : null), (e.wv = Rt));
      var f;
    } finally {
      ((ne = r), (v = n));
    }
  }
}
async function pr() {
  (await Promise.resolve(), Pe());
}
function wr() {
  return V.ensure().settled();
}
function le(e) {
  var t = e.f,
    n = (t & y) !== 0;
  if (c !== null && !O) {
    var r = v !== null && (v.f & H) !== 0;
    if (!r && !F?.includes(e)) {
      var s = c.deps;
      if ((c.f & Ne) !== 0)
        e.rv < ce &&
          ((e.rv = ce),
          b === null && s !== null && s[A] === e
            ? A++
            : b === null
              ? (b = [e])
              : (!Y || !b.includes(e)) && b.push(e));
      else {
        (c.deps ??= []).push(e);
        var f = e.reactions;
        f === null ? (e.reactions = [c]) : f.includes(c) || f.push(c);
      }
    }
  } else if (n && e.deps === null && e.effects === null) {
    var l = e,
      u = l.parent;
    u !== null && (u.f & R) === 0 && (l.f ^= R);
  }
  if (fe) {
    if (B.has(e)) return B.get(e);
    if (n) {
      l = e;
      var i = l.v;
      return (
        (((l.f & g) === 0 && l.reactions !== null) || Nt(l)) && (i = Ve(l)),
        B.set(l, i),
        i
      );
    }
  } else if (n) {
    if (((l = e), S?.has(l))) return S.get(l);
    he(l) && _t(l);
  }
  if (S?.has(e)) return S.get(e);
  if ((e.f & U) !== 0) throw e.v;
  return e.v;
}
function Nt(e) {
  if (e.v === m) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps) if (B.has(t) || ((t.f & y) !== 0 && Nt(t))) return !0;
  return !1;
}
function Er(e) {
  var t = O;
  try {
    return ((O = !0), e());
  } finally {
    O = t;
  }
}
const yn = -7169;
function E(e, t) {
  e.f = (e.f & yn) | t;
}
export {
  At as $,
  tr as A,
  cr as B,
  Wn as C,
  nr as D,
  er as E,
  Bn as F,
  _r as G,
  Un as H,
  $n as I,
  Kn as J,
  Zt as K,
  kn as L,
  Gn as M,
  qn as N,
  re as O,
  Hn as P,
  rt as Q,
  $t as R,
  Se as S,
  Fe as T,
  Ge as U,
  Nn as V,
  Dn as W,
  In as X,
  N as Y,
  mn as Z,
  K as _,
  bn as a,
  rr as a0,
  pn as a1,
  It as a2,
  v as a3,
  Vn as a4,
  Me as a5,
  un as a6,
  Ln as a7,
  jn as a8,
  Ye as a9,
  H as aA,
  Fn as aB,
  Pn as aC,
  Mn as aD,
  An as aE,
  Pe as aF,
  ar as aG,
  q as aH,
  pr as aI,
  Zn as aJ,
  Xn as aK,
  wr as aL,
  fr as aa,
  Oe as ab,
  V as ac,
  se as ad,
  G as ae,
  Ee as af,
  tn as ag,
  c as ah,
  ye as ai,
  On as aj,
  de as ak,
  ve as al,
  Le as am,
  Yn as an,
  Qn as ao,
  Xt as ap,
  He as aq,
  Rn as ar,
  lr as as,
  Ue as at,
  ue as au,
  Sn as av,
  Cn as aw,
  Be as ax,
  ae as ay,
  fe as az,
  be as b,
  w as c,
  Q as d,
  vr as e,
  k as f,
  Mt as g,
  $ as h,
  gn as i,
  Jn as j,
  le as k,
  z as l,
  dr as m,
  Tn as n,
  Jt as o,
  dn as p,
  ur as q,
  hr as r,
  sr as s,
  cn as t,
  Er as u,
  or as v,
  Qt as w,
  ir as x,
  I as y,
  zn as z,
};
