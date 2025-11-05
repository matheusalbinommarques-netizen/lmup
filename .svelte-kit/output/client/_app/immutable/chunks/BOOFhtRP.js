var Ct = Array.isArray,
  Ft = Array.prototype.indexOf,
  Tn = Array.from,
  An = Object.defineProperty,
  ue = Object.getOwnPropertyDescriptor,
  kn = Object.getOwnPropertyDescriptors,
  Mt = Object.prototype,
  Lt = Array.prototype,
  jt = Object.getPrototypeOf,
  Ze = Object.isExtensible;
const xn = () => {};
function qt(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function rt() {
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
  je = 128,
  g = 1024,
  T = 2048,
  j = 4096,
  N = 8192,
  H = 16384,
  qe = 32768,
  he = 65536,
  Ne = 1 << 17,
  st = 1 << 18,
  ve = 1 << 19,
  ft = 1 << 20,
  R = 256,
  pe = 512,
  we = 32768,
  Pe = 1 << 21,
  Ye = 1 << 22,
  U = 1 << 23,
  Se = Symbol('$state'),
  Rn = Symbol('legacy props'),
  Sn = Symbol(''),
  te = new (class extends Error {
    name = 'StaleReactionError';
    message =
      'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  He = 3,
  it = 8;
function Yt() {
  throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function Ht(e) {
  throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Ut() {
  throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function Bt(e) {
  throw new Error('https://svelte.dev/e/effect_orphan');
}
function Vt() {
  throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function Gt() {
  throw new Error('https://svelte.dev/e/experimental_async_fork');
}
function Kt() {
  throw new Error('https://svelte.dev/e/fork_discarded');
}
function zt() {
  throw new Error('https://svelte.dev/e/fork_timing');
}
function Dn() {
  throw new Error('https://svelte.dev/e/hydration_failed');
}
function Nn(e) {
  throw new Error('https://svelte.dev/e/props_invalid_value');
}
function Wt() {
  throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function Xt() {
  throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function Zt() {
  throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function Pn() {
  throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const In = 1,
  Cn = 2,
  Fn = 16,
  Mn = 1,
  Ln = 4,
  jn = 8,
  qn = 16,
  Yn = 1,
  Hn = 2,
  $t = '[',
  Jt = '[!',
  Qt = ']',
  Ue = {},
  m = Symbol(),
  Un = 'http://www.w3.org/1999/xhtml';
function Be(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function Bn() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let $ = !1;
function Vn(e) {
  $ = e;
}
let k;
function re(e) {
  if (e === null) throw (Be(), Ue);
  return (k = e);
}
function Gn() {
  return re(K(k));
}
function Kn(e) {
  if ($) {
    if (K(k) !== null) throw (Be(), Ue);
    k = e;
  }
}
function zn(e = 1) {
  if ($) {
    for (var t = e, n = k; t--; ) n = K(n);
    k = n;
  }
}
function Wn(e = !0) {
  for (var t = 0, n = k; ; ) {
    if (n.nodeType === it) {
      var r = n.data;
      if (r === Qt) {
        if (t === 0) return n;
        t -= 1;
      } else (r === $t || r === Jt) && (t += 1);
    }
    var s = K(n);
    (e && n.remove(), (n = s));
  }
}
function Xn(e) {
  if (!e || e.nodeType !== it) throw (Be(), Ue);
  return e.data;
}
function at(e) {
  return e === this.v;
}
function en(e, t) {
  return e != e
    ? t == t
    : e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function lt(e) {
  return !en(e, this.v);
}
let P = null;
function Ee(e) {
  P = e;
}
function Zn(e, t = !1, n) {
  P = { p: P, i: !1, c: null, e: null, s: e, x: null, l: null };
}
function $n(e) {
  var t = P,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) bt(r);
  }
  return ((t.i = !0), (P = t.p), {});
}
function ut() {
  return !0;
}
let W = [];
function ot() {
  var e = W;
  ((W = []), qt(e));
}
function tn(e) {
  if (W.length === 0 && !oe) {
    var t = W;
    queueMicrotask(() => {
      t === W && ot();
    });
  }
  W.push(e);
}
function nn() {
  for (; W.length > 0; ) ot();
}
function rn(e) {
  var t = v;
  if (t === null) return ((c.f |= U), e);
  if ((t.f & qe) === 0) {
    if ((t.f & je) === 0) throw e;
    t.b.error(e);
  } else ye(e, t);
}
function ye(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0)
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
  Oe = null,
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
    ((D = []), (Oe = null), this.apply());
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
        : ((Oe = this),
          (w = null),
          $e(n.render_effects),
          $e(n.effects),
          (Oe = null),
          this.#a?.resolve()),
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
        ((r.f & je) !== 0 &&
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
            : de(r) && ((r.f & M) !== 0 && n.block_effects.push(r), _e(r));
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
      if ((Fe(), w !== null && w !== this)) return;
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
          for (const a of f) ct(a, l, u, i);
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
    return (this.#a ??= rt()).promise;
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
    tn(t);
  }
  apply() {}
}
function Ce(e) {
  var t = oe;
  oe = !0;
  try {
    var n;
    for (e && (w !== null && Fe(), (n = e())); ; ) {
      if ((nn(), D.length === 0 && (w?.flush(), D.length === 0)))
        return ((xe = null), n);
      Fe();
    }
  } finally {
    oe = t;
  }
}
function Fe() {
  var e = ne;
  Ie = !0;
  try {
    var t = 0;
    for (et(!0); D.length > 0; ) {
      var n = V.ensure();
      if (t++ > 1e3) {
        var r, s;
        sn();
      }
      (n.process(D), B.clear());
    }
  } finally {
    ((Ie = !1), et(e), (xe = null));
  }
}
function sn() {
  try {
    Vt();
  } catch (e) {
    ye(e, xe);
  }
}
let C = null;
function $e(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        (r.f & (H | N)) === 0 &&
        de(r) &&
        ((C = new Set()),
        _e(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null && r.ac === null ? kt(r) : (r.fn = null)),
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
function ct(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const f = s.f;
      (f & y) !== 0
        ? ct(s, t, n, r)
        : (f & (Ye | M)) !== 0 &&
          (f & T) === 0 &&
          vt(s, t, r) &&
          (E(s, T), J(s));
    }
}
function _t(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      (r & y) !== 0 ? _t(n, t) : (r & Ne) !== 0 && (E(n, T), t.add(n));
    }
}
function vt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (t.includes(s)) return !0;
      if ((s.f & y) !== 0 && vt(s, t, n)) return (n.set(s, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function J(e) {
  for (var t = (xe = e); t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Ie && t === v && (n & M) !== 0 && (n & st) === 0) return;
    if ((n & (ee | L)) !== 0) {
      if ((n & g) === 0) return;
      t.f ^= g;
    }
  }
  D.push(t);
}
function Jn(e) {
  (Gt(), w !== null && zt());
  var t = V.ensure();
  t.is_fork = !0;
  var n = !1,
    r = t.settled();
  Ce(e);
  for (var [s, f] of t.previous) s.v = f;
  return {
    commit: async () => {
      if (n) {
        await r;
        return;
      }
      (X.has(t) || Kt(), (n = !0), (t.is_fork = !1));
      for (var [l, u] of t.current) l.v = u;
      (Ce(() => {
        var i = new Set();
        for (var a of t.current.keys()) _t(a, i);
        (on(i), wt());
      }),
        t.revive(),
        await r);
    },
    discard: () => {
      !n && X.has(t) && (X.delete(t), t.discard());
    },
  };
}
function fn(e, t, n, r) {
  const s = Ve;
  if (n.length === 0 && e.length === 0) {
    r(t.map(s));
    return;
  }
  var f = w,
    l = v,
    u = an();
  function i() {
    Promise.all(n.map((a) => ln(a)))
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
function an() {
  var e = v,
    t = c,
    n = P,
    r = w;
  return function (f = !0) {
    (se(e), G(t), Ee(n), f && r?.activate());
  };
}
function me() {
  (se(null), G(null), Ee(null));
}
function Ve(e) {
  var t = y | T,
    n = c !== null && (c.f & y) !== 0 ? c : null;
  return (
    v === null || (n !== null && (n.f & R) !== 0) ? (t |= R) : (v.f |= ve),
    {
      ctx: P,
      deps: null,
      effects: null,
      equals: at,
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
function ln(e, t) {
  let n = v;
  n === null && Yt();
  var r = n.b,
    s = void 0,
    f = Ke(m),
    l = !c,
    u = new Map();
  return (
    hn(() => {
      var i = rt();
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
      const _ = (p, d = void 0) => {
        if ((a.activate(), d)) d !== te && ((f.f |= U), Me(f, d));
        else {
          ((f.f & U) !== 0 && (f.f ^= U), Me(f, p));
          for (const [h, ie] of u) {
            if ((u.delete(h), h === a)) break;
            ie.reject(te);
          }
        }
        l && (r.update_pending_count(-1), a.decrement(o));
      };
      i.promise.then(_, (p) => _(null, p || 'unknown'));
    }),
    dn(() => {
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
function Qn(e) {
  const t = Ve(e);
  return (St(t), t);
}
function er(e) {
  const t = Ve(e);
  return ((t.equals = lt), t);
}
function dt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) Q(t[n]);
  }
}
function un(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0) return t;
    t = t.parent;
  }
  return null;
}
function Ge(e) {
  var t,
    n = v;
  se(un(e));
  try {
    ((e.f &= ~we), dt(e), (t = Pt(e)));
  } finally {
    se(n);
  }
  return t;
}
function ht(e) {
  var t = Ge(e);
  if ((e.equals(t) || ((e.v = t), (e.wv = Dt())), !fe))
    if (S !== null) S.set(e, e.v);
    else {
      var n = (Y || (e.f & R) !== 0) && e.deps !== null ? j : g;
      E(e, n);
    }
}
let ge = new Set();
const B = new Map();
function on(e) {
  ge = e;
}
let pt = !1;
function Ke(e, t) {
  var n = { f: 0, v: e, reactions: null, equals: at, rv: 0, wv: 0 };
  return n;
}
function q(e, t) {
  const n = Ke(e);
  return (St(n), n);
}
function tr(e, t = !1, n = !0) {
  const r = Ke(e);
  return (t || (r.equals = lt), r);
}
function z(e, t, n = !1) {
  c !== null &&
    (!O || (c.f & Ne) !== 0) &&
    ut() &&
    (c.f & (y | M | Ye | Ne)) !== 0 &&
    !F?.includes(e) &&
    Zt();
  let r = n ? ae(t) : t;
  return Me(e, r);
}
function Me(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    (fe ? B.set(e, t) : B.set(e, n), (e.v = t));
    var r = V.ensure();
    (r.capture(e, n),
      (e.f & y) !== 0 &&
        ((e.f & T) !== 0 && Ge(e), E(e, (e.f & R) === 0 ? g : j)),
      (e.wv = Dt()),
      Et(e, T),
      v !== null &&
        (v.f & g) !== 0 &&
        (v.f & (L | ee)) === 0 &&
        (x === null ? mn([e]) : x.push(e)),
      !r.is_fork && ge.size > 0 && !pt && wt());
  }
  return t;
}
function wt() {
  pt = !1;
  const e = Array.from(ge);
  for (const t of e) ((t.f & g) !== 0 && E(t, j), de(t) && _e(t));
  ge.clear();
}
function De(e) {
  z(e, e.v + 1);
}
function Et(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var f = n[s],
        l = f.f,
        u = (l & T) === 0;
      (u && E(f, t),
        (l & y) !== 0
          ? (l & we) === 0 && ((f.f |= we), Et(f, j))
          : u && ((l & M) !== 0 && C !== null && C.add(f), J(f)));
    }
}
function ae(e) {
  if (typeof e != 'object' || e === null || Se in e) return e;
  const t = jt(e);
  if (t !== Mt && t !== Lt) return e;
  var n = new Map(),
    r = Ct(e),
    s = q(0),
    f = Z,
    l = (u) => {
      if (Z === f) return u();
      var i = c,
        a = Z;
      (G(null), nt(f));
      var o = u();
      return (G(i), nt(a), o);
    };
  return (
    r && n.set('length', q(e.length)),
    new Proxy(e, {
      defineProperty(u, i, a) {
        (!('value' in a) ||
          a.configurable === !1 ||
          a.enumerable === !1 ||
          a.writable === !1) &&
          Wt();
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
            (n.set(i, o), De(s));
          }
        } else (z(a, m), De(s));
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
              var d = ae(_ ? u[i] : m),
                h = q(d);
              return h;
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
                d = q(p);
              return d;
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
          for (var d = a; d < _.v; d += 1) {
            var h = n.get(d + '');
            h !== void 0
              ? z(h, m)
              : d in u && ((h = l(() => q(m))), n.set(d + '', h));
          }
        if (_ === void 0)
          (!p || ue(u, i)?.writable) &&
            ((_ = l(() => q(void 0))), z(_, ae(a)), n.set(i, _));
        else {
          p = _.v !== m;
          var ie = l(() => ae(a));
          z(_, ie);
        }
        var We = Reflect.getOwnPropertyDescriptor(u, i);
        if ((We?.set && We.set.call(o, a), !p)) {
          if (r && typeof i == 'string') {
            var Xe = n.get('length'),
              Re = Number(i);
            Number.isInteger(Re) && Re >= Xe.v && z(Xe, Re + 1);
          }
          De(s);
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
        Xt();
      },
    })
  );
}
var Je, cn, yt, mt;
function nr() {
  if (Je === void 0) {
    ((Je = window), (cn = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((yt = ue(t, 'firstChild').get),
      (mt = ue(t, 'nextSibling').get),
      Ze(e) &&
        ((e.__click = void 0),
        (e.__className = void 0),
        (e.__attributes = null),
        (e.__style = void 0),
        (e.__e = void 0)),
      Ze(n) && (n.__t = void 0));
  }
}
function be(e = '') {
  return document.createTextNode(e);
}
function Le(e) {
  return yt.call(e);
}
function K(e) {
  return mt.call(e);
}
function rr(e, t) {
  if (!$) return Le(e);
  var n = Le(k);
  if (n === null) n = k.appendChild(be());
  else if (t && n.nodeType !== He) {
    var r = be();
    return (n?.before(r), re(r), r);
  }
  return (re(n), n);
}
function sr(e, t = !1) {
  if (!$) {
    var n = Le(e);
    return n instanceof Comment && n.data === '' ? K(n) : n;
  }
  if (t && k?.nodeType !== He) {
    var r = be();
    return (k?.before(r), re(r), r);
  }
  return k;
}
function fr(e, t = 1, n = !1) {
  let r = $ ? k : e;
  for (var s; t--; ) ((s = r), (r = K(r)));
  if (!$) return r;
  if (n && r?.nodeType !== He) {
    var f = be();
    return (r === null ? s?.after(f) : r.before(f), re(f), f);
  }
  return (re(r), r);
}
function ir(e) {
  e.textContent = '';
}
function ar() {
  return !1;
}
let Qe = !1;
function _n() {
  Qe ||
    ((Qe = !0),
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
function ze(e) {
  var t = c,
    n = v;
  (G(null), se(null));
  try {
    return e();
  } finally {
    (G(t), se(n));
  }
}
function lr(e, t, n, r = n) {
  e.addEventListener(t, () => ze(n));
  const s = e.__on_r;
  (s
    ? (e.__on_r = () => {
        (s(), r(!0));
      })
    : (e.__on_r = () => r(!0)),
    _n());
}
function gt(e) {
  (v === null && c === null && Bt(),
    c !== null && (c.f & R) !== 0 && v === null && Ut(),
    fe && Ht());
}
function vn(e, t) {
  var n = t.last;
  n === null
    ? (t.last = t.first = e)
    : ((n.next = e), (e.prev = n), (t.last = e));
}
function I(e, t, n, r = !0) {
  var s = v;
  s !== null && (s.f & N) !== 0 && (e |= N);
  var f = {
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
      (_e(f), (f.f |= qe));
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
        (e & M) !== 0 && (e & he) !== 0 && l !== null && (l.f |= he)),
      l !== null &&
        ((l.parent = s),
        s !== null && vn(l, s),
        c !== null && (c.f & y) !== 0 && (e & ee) === 0))
    ) {
      var u = c;
      (u.effects ??= []).push(l);
    }
  }
  return f;
}
function ur() {
  return c !== null && !O;
}
function dn(e) {
  const t = I(ke, null, !1);
  return (E(t, g), (t.teardown = e), t);
}
function or(e) {
  gt();
  var t = v.f,
    n = !c && (t & L) !== 0 && (t & qe) === 0;
  if (n) {
    var r = P;
    (r.e ??= []).push(e);
  } else return bt(e);
}
function bt(e) {
  return I(Ae | ft, e, !1);
}
function cr(e) {
  return (gt(), I(ke | ft, e, !0));
}
function _r(e) {
  V.ensure();
  const t = I(ee | ve, e, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? En(t, () => {
            (Q(t), r(void 0));
          })
        : (Q(t), r(void 0));
    });
}
function vr(e) {
  return I(Ae, e, !1);
}
function hn(e) {
  return I(Ye | ve, e, !0);
}
function dr(e, t = 0) {
  return I(ke | t, e, !0);
}
function hr(e, t = [], n = [], r = [], s = !1) {
  fn(r, t, n, (f) => {
    I(s ? Ae : ke, () => e(...f.map(le)), !0);
  });
}
function pr(e, t = 0) {
  var n = I(M | t, e, !0);
  return n;
}
function wr(e, t = !0) {
  return I(L | ve, e, !0, t);
}
function Tt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = fe,
      r = c;
    (tt(!0), G(null));
    try {
      t.call(null);
    } finally {
      (tt(n), G(r));
    }
  }
}
function At(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null &&
      ze(() => {
        s.abort(te);
      });
    var r = n.next;
    ((n.f & ee) !== 0 ? (n.parent = null) : Q(n, t), (n = r));
  }
}
function pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    ((t.f & L) === 0 && Q(t), (t = n));
  }
}
function Q(e, t = !0) {
  var n = !1;
  ((t || (e.f & st) !== 0) &&
    e.nodes_start !== null &&
    e.nodes_end !== null &&
    (wn(e.nodes_start, e.nodes_end), (n = !0)),
    At(e, t && !n),
    Te(e, 0),
    E(e, H));
  var r = e.transitions;
  if (r !== null) for (const f of r) f.stop();
  Tt(e);
  var s = e.parent;
  (s !== null && s.first !== null && kt(e),
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
function wn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : K(e);
    (e.remove(), (e = n));
  }
}
function kt(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null &&
      (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function En(e, t, n = !0) {
  var r = [];
  (xt(e, r, !0),
    yn(r, () => {
      (n && Q(e), t && t());
    }));
}
function yn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e) s.out(r);
  } else t();
}
function xt(e, t, n) {
  if ((e.f & N) === 0) {
    if (((e.f ^= N), e.transitions !== null))
      for (const l of e.transitions) (l.is_global || n) && t.push(l);
    for (var r = e.first; r !== null; ) {
      var s = r.next,
        f = (r.f & he) !== 0 || ((r.f & L) !== 0 && (e.f & M) !== 0);
      (xt(r, t, f ? n : !1), (r = s));
    }
  }
}
function Er(e) {
  Rt(e, !0);
}
function Rt(e, t) {
  if ((e.f & N) !== 0) {
    ((e.f ^= N), (e.f & g) === 0 && (E(e, T), J(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next,
        s = (n.f & he) !== 0 || (n.f & L) !== 0;
      (Rt(n, s ? t : !1), (n = r));
    }
    if (e.transitions !== null)
      for (const f of e.transitions) (f.is_global || t) && f.in();
  }
}
function yr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : K(n);
    (t.append(n), (n = s));
  }
}
let ne = !1;
function et(e) {
  ne = e;
}
let fe = !1;
function tt(e) {
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
function St(e) {
  c !== null && (F === null ? (F = [e]) : F.push(e));
}
let b = null,
  A = 0,
  x = null;
function mn(e) {
  x = e;
}
let Ot = 1,
  ce = 0,
  Z = ce;
function nt(e) {
  Z = e;
}
let Y = !1;
function Dt() {
  return ++Ot;
}
function de(e) {
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
        if (((f = n[s]), de(f) && ht(f), f.wv > e.wv)) return !0;
    }
    (!r || (v !== null && !Y)) && E(e, g);
  }
  return !1;
}
function Nt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !F?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var f = r[s];
      (f.f & y) !== 0
        ? Nt(f, t, !1)
        : t === f && (n ? E(f, T) : (f.f & g) !== 0 && E(f, j), J(f));
    }
}
function Pt(e) {
  var t = b,
    n = A,
    r = x,
    s = c,
    f = Y,
    l = F,
    u = P,
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
      (ze(() => {
        e.ac.abort(te);
      }),
      (e.ac = null)));
  try {
    e.f |= Pe;
    var _ = e.fn,
      p = _(),
      d = e.deps;
    if (b !== null) {
      var h;
      if ((Te(e, A), d !== null && A > 0))
        for (d.length = A + b.length, h = 0; h < b.length; h++) d[A + h] = b[h];
      else e.deps = d = b;
      if (!Y || ((o & y) !== 0 && e.reactions !== null))
        for (h = A; h < d.length; h++) (d[h].reactions ??= []).push(e);
    } else d !== null && A < d.length && (Te(e, A), (d.length = A));
    if (ut() && x !== null && !O && d !== null && (e.f & (y | j | T)) === 0)
      for (h = 0; h < x.length; h++) Nt(x[h], e);
    return (
      s !== null &&
        s !== e &&
        (ce++, x !== null && (r === null ? (r = x) : r.push(...x))),
      (e.f & U) !== 0 && (e.f ^= U),
      p
    );
  } catch (ie) {
    return rn(ie);
  } finally {
    ((e.f ^= Pe),
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
function gn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ft.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
    }
  }
  n === null &&
    (t.f & y) !== 0 &&
    (b === null || !b.includes(t)) &&
    (E(t, j), (t.f & (R | pe)) === 0 && (t.f ^= pe), dt(t), Te(t, 0));
}
function Te(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) gn(e, n[r]);
}
function _e(e) {
  var t = e.f;
  if ((t & H) === 0) {
    E(e, g);
    var n = v,
      r = ne;
    ((v = e), (ne = !0));
    try {
      ((t & M) !== 0 ? pn(e) : At(e), Tt(e));
      var s = Pt(e);
      ((e.teardown = typeof s == 'function' ? s : null), (e.wv = Ot));
      var f;
    } finally {
      ((ne = r), (v = n));
    }
  }
}
async function mr() {
  (await Promise.resolve(), Ce());
}
function gr() {
  return V.ensure().settled();
}
function le(e) {
  var t = e.f,
    n = (t & y) !== 0;
  if (c !== null && !O) {
    var r = v !== null && (v.f & H) !== 0;
    if (!r && !F?.includes(e)) {
      var s = c.deps;
      if ((c.f & Pe) !== 0)
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
        (((l.f & g) === 0 && l.reactions !== null) || It(l)) && (i = Ge(l)),
        B.set(l, i),
        i
      );
    }
  } else if (n) {
    if (((l = e), S?.has(l))) return S.get(l);
    de(l) && ht(l);
  }
  if (S?.has(e)) return S.get(e);
  if ((e.f & U) !== 0) throw e.v;
  return e.v;
}
function It(e) {
  if (e.v === m) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps) if (B.has(t) || ((t.f & y) !== 0 && It(t))) return !0;
  return !1;
}
function br(e) {
  var t = O;
  try {
    return ((O = !0), e());
  } finally {
    O = t;
  }
}
const bn = -7169;
function E(e, t) {
  e.f = (e.f & bn) | t;
}
export {
  Sn as $,
  Wn as A,
  re as B,
  Vn as C,
  Le as D,
  he as E,
  le as F,
  er as G,
  Jt as H,
  it as I,
  Qt as J,
  Me as K,
  tr as L,
  Ke as M,
  Cn as N,
  In as O,
  Fn as P,
  N as Q,
  Tn as R,
  Se as S,
  K as T,
  xt as U,
  ir as V,
  yn as W,
  Ct as X,
  v as Y,
  Qn as Z,
  _n as _,
  $n as a,
  Un as a0,
  jt as a1,
  kn as a2,
  xn as a3,
  zn as a4,
  ue as a5,
  Nn as a6,
  Ln as a7,
  Ve as a8,
  ae as a9,
  Yn as aA,
  Hn as aB,
  He as aC,
  nr as aD,
  $t as aE,
  Ue as aF,
  Dn as aG,
  _r as aH,
  Be as aI,
  lr as aJ,
  Oe as aK,
  en as aL,
  Jn as aM,
  gr as aN,
  z as aa,
  fe as ab,
  H as ac,
  jn as ad,
  Mn as ae,
  qn as af,
  Rn as ag,
  Ce as ah,
  An as ai,
  cr as aj,
  q as ak,
  mr as al,
  ur as am,
  De as an,
  V as ao,
  se as ap,
  G as aq,
  Ee as ar,
  rn as as,
  c as at,
  ye as au,
  Pn as av,
  ve as aw,
  je as ax,
  Bn as ay,
  cn as az,
  pr as b,
  rr as c,
  P as d,
  br as e,
  sr as f,
  vr as g,
  dr as h,
  w as i,
  Er as j,
  Q as k,
  En as l,
  be as m,
  wr as n,
  $ as o,
  Zn as p,
  tn as q,
  Kn as r,
  fr as s,
  hr as t,
  or as u,
  k as v,
  yr as w,
  ar as x,
  Gn as y,
  Xn as z,
};
