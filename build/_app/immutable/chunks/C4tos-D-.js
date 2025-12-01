var bt = Array.isArray,
  wn = Array.prototype.indexOf,
  mn = Array.from,
  yn = Object.defineProperty,
  be = Object.getOwnPropertyDescriptor,
  Hr = Object.getOwnPropertyDescriptors,
  En = Object.prototype,
  bn = Array.prototype,
  Tn = Object.getPrototypeOf,
  ht = Object.isExtensible;
const Yr = () => {};
function xn(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function Tt() {
  var e,
    t,
    n = new Promise((r, s) => {
      ((e = r), (t = s));
    });
  return { promise: n, resolve: e, reject: t };
}
const b = 2,
  He = 4,
  Ye = 8,
  G = 16,
  K = 32,
  ue = 64,
  Be = 128,
  x = 1024,
  S = 2048,
  z = 4096,
  Y = 8192,
  Q = 16384,
  it = 32768,
  he = 65536,
  Je = 1 << 17,
  xt = 1 << 18,
  ge = 1 << 19,
  kt = 1 << 20,
  P = 256,
  Pe = 512,
  Ie = 32768,
  Qe = 1 << 21,
  ft = 1 << 22,
  ee = 1 << 23,
  Te = Symbol('$state'),
  Br = Symbol('legacy props'),
  Ur = Symbol(''),
  ce = new (class extends Error {
    name = 'StaleReactionError';
    message =
      'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  Ue = 3,
  Ce = 8;
function we(e) {
  throw new Error('https://svelte.dev/e/lifecycle_outside_component');
}
function kn() {
  throw new Error('https://svelte.dev/e/missing_context');
}
function An() {
  throw new Error('https://svelte.dev/e/async_derived_orphan');
}
function Sn(e) {
  throw new Error('https://svelte.dev/e/effect_in_teardown');
}
function Rn() {
  throw new Error('https://svelte.dev/e/effect_in_unowned_derived');
}
function Cn(e) {
  throw new Error('https://svelte.dev/e/effect_orphan');
}
function On() {
  throw new Error('https://svelte.dev/e/effect_update_depth_exceeded');
}
function Dn() {
  throw new Error('https://svelte.dev/e/experimental_async_fork');
}
function Nn() {
  throw new Error('https://svelte.dev/e/fork_discarded');
}
function Pn() {
  throw new Error('https://svelte.dev/e/fork_timing');
}
function In() {
  throw new Error('https://svelte.dev/e/get_abort_signal_outside_reaction');
}
function Mn() {
  throw new Error('https://svelte.dev/e/hydration_failed');
}
function At(e) {
  throw new Error('https://svelte.dev/e/lifecycle_legacy_only');
}
function $r(e) {
  throw new Error('https://svelte.dev/e/props_invalid_value');
}
function Fn() {
  throw new Error('https://svelte.dev/e/state_descriptors_fixed');
}
function Ln() {
  throw new Error('https://svelte.dev/e/state_prototype_fixed');
}
function jn() {
  throw new Error('https://svelte.dev/e/state_unsafe_mutation');
}
function qn() {
  throw new Error('https://svelte.dev/e/svelte_boundary_reset_onerror');
}
const Wr = 1,
  Gr = 2,
  Kr = 4,
  zr = 8,
  Xr = 16,
  Zr = 1,
  Jr = 4,
  Qr = 8,
  es = 16,
  St = 1,
  Hn = 2,
  Rt = '[',
  Ct = '[!',
  Ot = ']',
  ve = {},
  T = Symbol(),
  ts = 'http://www.w3.org/1999/xhtml';
function Ve(e) {
  console.warn('https://svelte.dev/e/hydration_mismatch');
}
function ns() {
  console.warn('https://svelte.dev/e/select_multiple_invalid_value');
}
function Yn() {
  console.warn('https://svelte.dev/e/svelte_boundary_reset_noop');
}
let m = !1;
function Ne(e) {
  m = e;
}
let g;
function j(e) {
  if (e === null) throw (Ve(), ve);
  return (g = e);
}
function at() {
  return j(X(g));
}
function rs(e) {
  if (m) {
    if (X(g) !== null) throw (Ve(), ve);
    g = e;
  }
}
function Bn(e = 1) {
  if (m) {
    for (var t = e, n = g; t--; ) n = X(n);
    g = n;
  }
}
function Un(e = !0) {
  for (var t = 0, n = g; ; ) {
    if (n.nodeType === Ce) {
      var r = n.data;
      if (r === Ot) {
        if (t === 0) return n;
        t -= 1;
      } else (r === Rt || r === Ct) && (t += 1);
    }
    var s = X(n);
    (e && n.remove(), (n = s));
  }
}
function ss(e) {
  if (!e || e.nodeType !== Ce) throw (Ve(), ve);
  return e.data;
}
function Dt(e) {
  return e === this.v;
}
function Vn(e, t) {
  return e != e
    ? t == t
    : e !== t || (e !== null && typeof e == 'object') || typeof e == 'function';
}
function Nt(e) {
  return !Vn(e, this.v);
}
let w = null;
function de(e) {
  w = e;
}
function $n() {
  const e = {};
  return [() => (Mt(e) || kn(), Pt(e)), (t) => It(e, t)];
}
function Pt(e) {
  return $e().get(e);
}
function It(e, t) {
  return ($e().set(e, t), t);
}
function Mt(e) {
  return $e().has(e);
}
function Wn() {
  return $e();
}
function Gn(e, t = !1, n) {
  w = { p: w, i: !1, c: null, e: null, s: e, x: null, l: null };
}
function Kn(e) {
  var t = w,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) Jt(r);
  }
  return ((t.i = !0), (w = t.p), {});
}
function Ft() {
  return !0;
}
function $e(e) {
  return (w === null && we(), (w.c ??= new Map(zn(w) || void 0)));
}
function zn(e) {
  let t = e.p;
  for (; t !== null; ) {
    const n = t.c;
    if (n !== null) return n;
    t = t.p;
  }
  return null;
}
let se = [];
function Lt() {
  var e = se;
  ((se = []), xn(e));
}
function We(e) {
  if (se.length === 0 && !xe) {
    var t = se;
    queueMicrotask(() => {
      t === se && Lt();
    });
  }
  se.push(e);
}
function Xn() {
  for (; se.length > 0; ) Lt();
}
function jt(e) {
  var t = d;
  if (t === null) return ((v.f |= ee), e);
  if ((t.f & it) === 0) {
    if ((t.f & Be) === 0) throw e;
    t.b.error(e);
  } else pe(e, t);
}
function pe(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0)
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
const ie = new Set();
let y = null,
  Ze = null,
  F = null,
  H = [],
  Ge = null,
  et = !1,
  xe = !1;
class N {
  committed = !1;
  current = new Map();
  previous = new Map();
  #e = new Set();
  #t = new Set();
  #n = 0;
  #r = 0;
  #l = null;
  #f = [];
  #a = [];
  skipped_effects = new Set();
  is_fork = !1;
  process(t) {
    ((H = []), (Ze = null), this.apply());
    var n = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: [],
      block_effects: [],
    };
    for (const r of t) this.#s(r, n);
    (this.is_fork || this.#u(),
      this.#r > 0 || this.is_fork
        ? (this.#i(n.effects),
          this.#i(n.render_effects),
          this.#i(n.block_effects))
        : ((Ze = this),
          (y = null),
          vt(n.render_effects),
          vt(n.effects),
          (Ze = null),
          this.#l?.resolve()),
      (F = null));
  }
  #s(t, n) {
    t.f ^= x;
    for (var r = t.first; r !== null; ) {
      var s = r.f,
        i = (s & (K | ue)) !== 0,
        f = i && (s & x) !== 0,
        l = f || (s & Y) !== 0 || this.skipped_effects.has(r);
      if (
        ((r.f & Be) !== 0 &&
          r.b?.is_pending() &&
          (n = {
            parent: n,
            effect: r,
            effects: [],
            render_effects: [],
            block_effects: [],
          }),
        !l && r.fn !== null)
      ) {
        i
          ? (r.f ^= x)
          : (s & He) !== 0
            ? n.effects.push(r)
            : De(r) && ((r.f & G) !== 0 && n.block_effects.push(r), Re(r));
        var a = r.first;
        if (a !== null) {
          r = a;
          continue;
        }
      }
      var u = r.parent;
      for (r = r.next; r === null && u !== null; )
        (u === n.effect &&
          (this.#i(n.effects),
          this.#i(n.render_effects),
          this.#i(n.block_effects),
          (n = n.parent)),
          (r = u.next),
          (u = u.parent));
    }
  }
  #i(t) {
    for (const n of t) (((n.f & S) !== 0 ? this.#f : this.#a).push(n), E(n, x));
  }
  capture(t, n) {
    (this.previous.has(t) || this.previous.set(t, n),
      (t.f & ee) === 0 && (this.current.set(t, t.v), F?.set(t, t.v)));
  }
  activate() {
    ((y = this), this.apply());
  }
  deactivate() {
    ((y = null), (F = null));
  }
  flush() {
    if ((this.activate(), H.length > 0)) {
      if ((tt(), y !== null && y !== this)) return;
    } else this.#n === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #u() {
    if (this.#r === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#n === 0 && this.#o();
  }
  #o() {
    if (ie.size > 1) {
      this.previous.clear();
      var t = F,
        n = !0,
        r = {
          parent: null,
          effect: null,
          effects: [],
          render_effects: [],
          block_effects: [],
        };
      for (const s of ie) {
        if (s === this) {
          n = !1;
          continue;
        }
        const i = [];
        for (const [l, a] of this.current) {
          if (s.current.has(l))
            if (n && a !== s.current.get(l)) s.current.set(l, a);
            else continue;
          i.push(l);
        }
        if (i.length === 0) continue;
        const f = [...s.current.keys()].filter((l) => !this.current.has(l));
        if (f.length > 0) {
          const l = new Set(),
            a = new Map();
          for (const u of i) qt(u, f, l, a);
          if (H.length > 0) {
            ((y = s), s.apply());
            for (const u of H) s.#s(u, r);
            ((H = []), s.deactivate());
          }
        }
      }
      ((y = null), (F = t));
    }
    ((this.committed = !0), ie.delete(this));
  }
  increment(t) {
    ((this.#n += 1), t && (this.#r += 1));
  }
  decrement(t) {
    ((this.#n -= 1), t && (this.#r -= 1), this.revive());
  }
  revive() {
    for (const t of this.#f) (E(t, S), le(t));
    for (const t of this.#a) (E(t, z), le(t));
    ((this.#f = []), (this.#a = []), this.flush());
  }
  oncommit(t) {
    this.#e.add(t);
  }
  ondiscard(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#l ??= Tt()).promise;
  }
  static ensure() {
    if (y === null) {
      const t = (y = new N());
      (ie.add(y),
        xe ||
          N.enqueue(() => {
            y === t && t.flush();
          }));
    }
    return y;
  }
  static enqueue(t) {
    We(t);
  }
  apply() {}
}
function Me(e) {
  var t = xe;
  xe = !0;
  try {
    var n;
    for (e && (y !== null && tt(), (n = e())); ; ) {
      if ((Xn(), H.length === 0 && (y?.flush(), H.length === 0)))
        return ((Ge = null), n);
      tt();
    }
  } finally {
    xe = t;
  }
}
function tt() {
  var e = _e;
  et = !0;
  try {
    var t = 0;
    for (wt(!0); H.length > 0; ) {
      var n = N.ensure();
      if (t++ > 1e3) {
        var r, s;
        Zn();
      }
      (n.process(H), te.clear());
    }
  } finally {
    ((et = !1), wt(e), (Ge = null));
  }
}
function Zn() {
  try {
    On();
  } catch (e) {
    pe(e, Ge);
  }
}
let V = null;
function vt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (
        (r.f & (Q | Y)) === 0 &&
        De(r) &&
        ((V = new Set()),
        Re(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null && r.ac === null ? nn(r) : (r.fn = null)),
        V?.size > 0)
      ) {
        te.clear();
        for (const s of V) {
          if ((s.f & (Q | Y)) !== 0) continue;
          const i = [s];
          let f = s.parent;
          for (; f !== null; )
            (V.has(f) && (V.delete(f), i.push(f)), (f = f.parent));
          for (let l = i.length - 1; l >= 0; l--) {
            const a = i[l];
            (a.f & (Q | Y)) === 0 && Re(a);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function qt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & b) !== 0
        ? qt(s, t, n, r)
        : (i & (ft | G)) !== 0 &&
          (i & S) === 0 &&
          Yt(s, t, r) &&
          (E(s, S), le(s));
    }
}
function Ht(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      (r & b) !== 0 ? Ht(n, t) : (r & Je) !== 0 && (E(n, S), t.add(n));
    }
}
function Yt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (t.includes(s)) return !0;
      if ((s.f & b) !== 0 && Yt(s, t, n)) return (n.set(s, !0), !0);
    }
  return (n.set(e, !1), !1);
}
function le(e) {
  for (var t = (Ge = e); t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (et && t === d && (n & G) !== 0 && (n & xt) === 0) return;
    if ((n & (ue | K)) !== 0) {
      if ((n & x) === 0) return;
      t.f ^= x;
    }
  }
  H.push(t);
}
function Jn(e) {
  (Dn(), y !== null && Pn());
  var t = N.ensure();
  t.is_fork = !0;
  var n = !1,
    r = t.settled();
  Me(e);
  for (var [s, i] of t.previous) s.v = i;
  return {
    commit: async () => {
      if (n) {
        await r;
        return;
      }
      (ie.has(t) || Nn(), (n = !0), (t.is_fork = !1));
      for (var [f, l] of t.current) f.v = l;
      (Me(() => {
        var a = new Set();
        for (var u of t.current.keys()) Ht(u, a);
        (ar(a), $t());
      }),
        t.revive(),
        await r);
    },
    discard: () => {
      !n && ie.has(t) && (ie.delete(t), t.discard());
    },
  };
}
function Qn(e) {
  let t = 0,
    n = Oe(0),
    r;
  return () => {
    _r() &&
      (fe(n),
      pr(
        () => (
          t === 0 && (r = ze(() => e(() => ke(n)))),
          (t += 1),
          () => {
            We(() => {
              ((t -= 1), t === 0 && (r?.(), (r = void 0), ke(n)));
            });
          }
        ),
      ));
  };
}
var er = he | ge | Be;
function tr(e, t, n) {
  new nr(e, t, n);
}
class nr {
  parent;
  #e = !1;
  #t;
  #n = m ? g : null;
  #r;
  #l;
  #f;
  #a = null;
  #s = null;
  #i = null;
  #u = null;
  #o = null;
  #h = 0;
  #c = 0;
  #v = !1;
  #_ = null;
  #m = Qn(
    () => (
      (this.#_ = Oe(this.#h)),
      () => {
        this.#_ = null;
      }
    ),
  );
  constructor(t, n, r) {
    ((this.#t = t),
      (this.#r = n),
      (this.#l = r),
      (this.parent = d.b),
      (this.#e = !!this.#r.pending),
      (this.#f = Qt(() => {
        if (((d.b = this), m)) {
          const i = this.#n;
          (at(), i.nodeType === Ce && i.data === Ct ? this.#E() : this.#y());
        } else {
          var s = this.#g();
          try {
            this.#a = $(() => r(s));
          } catch (i) {
            this.error(i);
          }
          this.#c > 0 ? this.#p() : (this.#e = !1);
        }
        return () => {
          this.#o?.remove();
        };
      }, er)),
      m && (this.#t = g));
  }
  #y() {
    try {
      this.#a = $(() => this.#l(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #E() {
    const t = this.#r.pending;
    t &&
      ((this.#s = $(() => t(this.#t))),
      N.enqueue(() => {
        var n = this.#g();
        ((this.#a = this.#d(() => (N.ensure(), $(() => this.#l(n))))),
          this.#c > 0
            ? this.#p()
            : (Ae(this.#s, () => {
                this.#s = null;
              }),
              (this.#e = !1)));
      }));
  }
  #g() {
    var t = this.#t;
    return (
      this.#e && ((this.#o = q()), this.#t.before(this.#o), (t = this.#o)),
      t
    );
  }
  is_pending() {
    return this.#e || (!!this.parent && this.parent.is_pending());
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
  #d(t) {
    var n = d,
      r = v,
      s = w;
    (B(this.#f), A(this.#f), de(this.#f.ctx));
    try {
      return t();
    } catch (i) {
      return (jt(i), null);
    } finally {
      (B(n), A(r), de(s));
    }
  }
  #p() {
    const t = this.#r.pending;
    (this.#a !== null &&
      ((this.#u = document.createDocumentFragment()),
      this.#u.append(this.#o),
      fn(this.#a, this.#u)),
      this.#s === null && (this.#s = $(() => t(this.#t))));
  }
  #w(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#w(t);
      return;
    }
    ((this.#c += t),
      this.#c === 0 &&
        ((this.#e = !1),
        this.#s &&
          Ae(this.#s, () => {
            this.#s = null;
          }),
        this.#u && (this.#t.before(this.#u), (this.#u = null))));
  }
  update_pending_count(t) {
    (this.#w(t), (this.#h += t), this.#_ && je(this.#_, this.#h));
  }
  get_effect_pending() {
    return (this.#m(), fe(this.#_));
  }
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (this.#v || (!n && !r)) throw t;
    (this.#a && (O(this.#a), (this.#a = null)),
      this.#s && (O(this.#s), (this.#s = null)),
      this.#i && (O(this.#i), (this.#i = null)),
      m && (j(this.#n), Bn(), j(Un())));
    var s = !1,
      i = !1;
    const f = () => {
      if (s) {
        Yn();
        return;
      }
      ((s = !0),
        i && qn(),
        N.ensure(),
        (this.#h = 0),
        this.#i !== null &&
          Ae(this.#i, () => {
            this.#i = null;
          }),
        (this.#e = this.has_pending_snippet()),
        (this.#a = this.#d(() => ((this.#v = !1), $(() => this.#l(this.#t))))),
        this.#c > 0 ? this.#p() : (this.#e = !1));
    };
    var l = v;
    try {
      (A(null), (i = !0), n?.(t, f), (i = !1));
    } catch (a) {
      pe(a, this.#f && this.#f.parent);
    } finally {
      A(l);
    }
    r &&
      We(() => {
        this.#i = this.#d(() => {
          (N.ensure(), (this.#v = !0));
          try {
            return $(() => {
              r(
                this.#t,
                () => t,
                () => f,
              );
            });
          } catch (a) {
            return (pe(a, this.#f.parent), null);
          } finally {
            this.#v = !1;
          }
        });
      });
  }
}
function rr(e, t, n, r) {
  const s = lt;
  if (n.length === 0 && e.length === 0) {
    r(t.map(s));
    return;
  }
  var i = y,
    f = d,
    l = sr();
  function a() {
    Promise.all(n.map((u) => ir(u)))
      .then((u) => {
        l();
        try {
          r([...t.map(s), ...u]);
        } catch (o) {
          (f.f & Q) === 0 && pe(o, f);
        }
        (i?.deactivate(), Fe());
      })
      .catch((u) => {
        pe(u, f);
      });
  }
  e.length > 0
    ? Promise.all(e).then(() => {
        l();
        try {
          return a();
        } finally {
          (i?.deactivate(), Fe());
        }
      })
    : a();
}
function sr() {
  var e = d,
    t = v,
    n = w,
    r = y;
  return function (i = !0) {
    (B(e), A(t), de(n), i && r?.activate());
  };
}
function Fe() {
  (B(null), A(null), de(null));
}
function lt(e) {
  var t = b | S,
    n = v !== null && (v.f & b) !== 0 ? v : null;
  return (
    d === null || (n !== null && (n.f & P) !== 0) ? (t |= P) : (d.f |= ge),
    {
      ctx: w,
      deps: null,
      effects: null,
      equals: Dt,
      f: t,
      fn: e,
      reactions: null,
      rv: 0,
      v: T,
      wv: 0,
      parent: n ?? d,
      ac: null,
    }
  );
}
function ir(e, t) {
  let n = d;
  n === null && An();
  var r = n.b,
    s = void 0,
    i = Oe(T),
    f = !v,
    l = new Map();
  return (
    dr(() => {
      var a = Tt();
      s = a.promise;
      try {
        Promise.resolve(e())
          .then(a.resolve, a.reject)
          .then(() => {
            (u === y && u.committed && u.deactivate(), Fe());
          });
      } catch (h) {
        (a.reject(h), Fe());
      }
      var u = y;
      if (f) {
        var o = !r.is_pending();
        (r.update_pending_count(1),
          u.increment(o),
          l.get(u)?.reject(ce),
          l.delete(u),
          l.set(u, a));
      }
      const _ = (h, c = void 0) => {
        if ((u.activate(), c)) c !== ce && ((i.f |= ee), je(i, c));
        else {
          ((i.f & ee) !== 0 && (i.f ^= ee), je(i, h));
          for (const [p, M] of l) {
            if ((l.delete(p), p === u)) break;
            M.reject(ce);
          }
        }
        f && (r.update_pending_count(-1), u.decrement(o));
      };
      a.promise.then(_, (h) => _(null, h || 'unknown'));
    }),
    ot(() => {
      for (const a of l.values()) a.reject(ce);
    }),
    new Promise((a) => {
      function u(o) {
        function _() {
          o === s ? a(i) : u(s);
        }
        o.then(_, _);
      }
      u(s);
    })
  );
}
function is(e) {
  const t = lt(e);
  return (an(t), t);
}
function fs(e) {
  const t = lt(e);
  return ((t.equals = Nt), t);
}
function Bt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) O(t[n]);
  }
}
function fr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0) return t;
    t = t.parent;
  }
  return null;
}
function ut(e) {
  var t,
    n = d;
  B(fr(e));
  try {
    ((e.f &= ~Ie), Bt(e), (t = cn(e)));
  } finally {
    B(n);
  }
  return t;
}
function Ut(e) {
  var t = ut(e);
  if ((e.equals(t) || ((e.v = t), (e.wv = un())), !me))
    if (F !== null) F.set(e, e.v);
    else {
      var n = (J || (e.f & P) !== 0) && e.deps !== null ? z : x;
      E(e, n);
    }
}
let Le = new Set();
const te = new Map();
function ar(e) {
  Le = e;
}
let Vt = !1;
function Oe(e, t) {
  var n = { f: 0, v: e, reactions: null, equals: Dt, rv: 0, wv: 0 };
  return n;
}
function Z(e, t) {
  const n = Oe(e);
  return (an(n), n);
}
function as(e, t = !1, n = !0) {
  const r = Oe(e);
  return (t || (r.equals = Nt), r);
}
function re(e, t, n = !1) {
  v !== null &&
    (!L || (v.f & Je) !== 0) &&
    Ft() &&
    (v.f & (b | G | ft | Je)) !== 0 &&
    !W?.includes(e) &&
    jn();
  let r = n ? ye(t) : t;
  return je(e, r);
}
function je(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    (me ? te.set(e, t) : te.set(e, n), (e.v = t));
    var r = N.ensure();
    (r.capture(e, n),
      (e.f & b) !== 0 &&
        ((e.f & S) !== 0 && ut(e), E(e, (e.f & P) === 0 ? x : z)),
      (e.wv = un()),
      Wt(e, S),
      d !== null &&
        (d.f & x) !== 0 &&
        (d.f & (K | ue)) === 0 &&
        (D === null ? Er([e]) : D.push(e)),
      !r.is_fork && Le.size > 0 && !Vt && $t());
  }
  return t;
}
function $t() {
  Vt = !1;
  const e = Array.from(Le);
  for (const t of e) ((t.f & x) !== 0 && E(t, z), De(t) && Re(t));
  Le.clear();
}
function ke(e) {
  re(e, e.v + 1);
}
function Wt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = n.length, s = 0; s < r; s++) {
      var i = n[s],
        f = i.f,
        l = (f & S) === 0;
      (l && E(i, t),
        (f & b) !== 0
          ? (f & Ie) === 0 && ((i.f |= Ie), Wt(i, z))
          : l && ((f & G) !== 0 && V !== null && V.add(i), le(i)));
    }
}
function ye(e) {
  if (typeof e != 'object' || e === null || Te in e) return e;
  const t = Tn(e);
  if (t !== En && t !== bn) return e;
  var n = new Map(),
    r = bt(e),
    s = Z(0),
    i = ae,
    f = (l) => {
      if (ae === i) return l();
      var a = v,
        u = ae;
      (A(null), yt(i));
      var o = l();
      return (A(a), yt(u), o);
    };
  return (
    r && n.set('length', Z(e.length)),
    new Proxy(e, {
      defineProperty(l, a, u) {
        (!('value' in u) ||
          u.configurable === !1 ||
          u.enumerable === !1 ||
          u.writable === !1) &&
          Fn();
        var o = n.get(a);
        return (
          o === void 0
            ? (o = f(() => {
                var _ = Z(u.value);
                return (n.set(a, _), _);
              }))
            : re(o, u.value, !0),
          !0
        );
      },
      deleteProperty(l, a) {
        var u = n.get(a);
        if (u === void 0) {
          if (a in l) {
            const o = f(() => Z(T));
            (n.set(a, o), ke(s));
          }
        } else (re(u, T), ke(s));
        return !0;
      },
      get(l, a, u) {
        if (a === Te) return e;
        var o = n.get(a),
          _ = a in l;
        if (
          (o === void 0 &&
            (!_ || be(l, a)?.writable) &&
            ((o = f(() => {
              var c = ye(_ ? l[a] : T),
                p = Z(c);
              return p;
            })),
            n.set(a, o)),
          o !== void 0)
        ) {
          var h = fe(o);
          return h === T ? void 0 : h;
        }
        return Reflect.get(l, a, u);
      },
      getOwnPropertyDescriptor(l, a) {
        var u = Reflect.getOwnPropertyDescriptor(l, a);
        if (u && 'value' in u) {
          var o = n.get(a);
          o && (u.value = fe(o));
        } else if (u === void 0) {
          var _ = n.get(a),
            h = _?.v;
          if (_ !== void 0 && h !== T)
            return { enumerable: !0, configurable: !0, value: h, writable: !0 };
        }
        return u;
      },
      has(l, a) {
        if (a === Te) return !0;
        var u = n.get(a),
          o = (u !== void 0 && u.v !== T) || Reflect.has(l, a);
        if (u !== void 0 || (d !== null && (!o || be(l, a)?.writable))) {
          u === void 0 &&
            ((u = f(() => {
              var h = o ? ye(l[a]) : T,
                c = Z(h);
              return c;
            })),
            n.set(a, u));
          var _ = fe(u);
          if (_ === T) return !1;
        }
        return o;
      },
      set(l, a, u, o) {
        var _ = n.get(a),
          h = a in l;
        if (r && a === 'length')
          for (var c = u; c < _.v; c += 1) {
            var p = n.get(c + '');
            p !== void 0
              ? re(p, T)
              : c in l && ((p = f(() => Z(T))), n.set(c + '', p));
          }
        if (_ === void 0)
          (!h || be(l, a)?.writable) &&
            ((_ = f(() => Z(void 0))), re(_, ye(u)), n.set(a, _));
        else {
          h = _.v !== T;
          var M = f(() => ye(u));
          re(_, M);
        }
        var ne = Reflect.getOwnPropertyDescriptor(l, a);
        if ((ne?.set && ne.set.call(o, u), !h)) {
          if (r && typeof a == 'string') {
            var _t = n.get('length'),
              Xe = Number(a);
            Number.isInteger(Xe) && Xe >= _t.v && re(_t, Xe + 1);
          }
          ke(s);
        }
        return !0;
      },
      ownKeys(l) {
        fe(s);
        var a = Reflect.ownKeys(l).filter((_) => {
          var h = n.get(_);
          return h === void 0 || h.v !== T;
        });
        for (var [u, o] of n) o.v !== T && !(u in l) && a.push(u);
        return a;
      },
      setPrototypeOf() {
        Ln();
      },
    })
  );
}
function dt(e) {
  try {
    if (e !== null && typeof e == 'object' && Te in e) return e[Te];
  } catch {}
  return e;
}
function ls(e, t) {
  return Object.is(dt(e), dt(t));
}
var pt, lr, Gt, Kt, zt;
function nt() {
  if (pt === void 0) {
    ((pt = window),
      (lr = document),
      (Gt = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((Kt = be(t, 'firstChild').get),
      (zt = be(t, 'nextSibling').get),
      ht(e) &&
        ((e.__click = void 0),
        (e.__className = void 0),
        (e.__attributes = null),
        (e.__style = void 0),
        (e.__e = void 0)),
      ht(n) && (n.__t = void 0));
  }
}
function q(e = '') {
  return document.createTextNode(e);
}
function C(e) {
  return Kt.call(e);
}
function X(e) {
  return zt.call(e);
}
function us(e, t) {
  if (!m) return C(e);
  var n = C(g);
  if (n === null) n = g.appendChild(q());
  else if (t && n.nodeType !== Ue) {
    var r = q();
    return (n?.before(r), j(r), r);
  }
  return (j(n), n);
}
function os(e, t = !1) {
  if (!m) {
    var n = C(e);
    return n instanceof Comment && n.data === '' ? X(n) : n;
  }
  if (t && g?.nodeType !== Ue) {
    var r = q();
    return (g?.before(r), j(r), r);
  }
  return g;
}
function cs(e, t = 1, n = !1) {
  let r = m ? g : e;
  for (var s; t--; ) ((s = r), (r = X(r)));
  if (!m) return r;
  if (n && r?.nodeType !== Ue) {
    var i = q();
    return (r === null ? s?.after(i) : r.before(i), j(i), i);
  }
  return (j(r), r);
}
function Xt(e) {
  e.textContent = '';
}
function ur() {
  return !1;
}
function _s(e) {
  m && C(e) !== null && Xt(e);
}
let gt = !1;
function or() {
  gt ||
    ((gt = !0),
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
function Ke(e) {
  var t = v,
    n = d;
  (A(null), B(null));
  try {
    return e();
  } finally {
    (A(t), B(n));
  }
}
function hs(e, t, n, r = n) {
  e.addEventListener(t, () => Ke(n));
  const s = e.__on_r;
  (s
    ? (e.__on_r = () => {
        (s(), r(!0));
      })
    : (e.__on_r = () => r(!0)),
    or());
}
function Zt(e) {
  (d === null && v === null && Cn(),
    v !== null && (v.f & P) !== 0 && d === null && Rn(),
    me && Sn());
}
function cr(e, t) {
  var n = t.last;
  n === null
    ? (t.last = t.first = e)
    : ((n.next = e), (e.prev = n), (t.last = e));
}
function U(e, t, n, r = !0) {
  var s = d;
  s !== null && (s.f & Y) !== 0 && (e |= Y);
  var i = {
    ctx: w,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | S,
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
      (Re(i), (i.f |= it));
    } catch (a) {
      throw (O(i), a);
    }
  else t !== null && le(i);
  if (r) {
    var f = i;
    if (
      (n &&
        f.deps === null &&
        f.teardown === null &&
        f.nodes_start === null &&
        f.first === f.last &&
        (f.f & ge) === 0 &&
        ((f = f.first),
        (e & G) !== 0 && (e & he) !== 0 && f !== null && (f.f |= he)),
      f !== null &&
        ((f.parent = s),
        s !== null && cr(f, s),
        v !== null && (v.f & b) !== 0 && (e & ue) === 0))
    ) {
      var l = v;
      (l.effects ??= []).push(f);
    }
  }
  return i;
}
function _r() {
  return v !== null && !L;
}
function ot(e) {
  const t = U(Ye, null, !1);
  return (E(t, x), (t.teardown = e), t);
}
function hr(e) {
  Zt();
  var t = d.f,
    n = !v && (t & K) !== 0 && (t & it) === 0;
  if (n) {
    var r = w;
    (r.e ??= []).push(e);
  } else return Jt(e);
}
function Jt(e) {
  return U(He | kt, e, !1);
}
function vs(e) {
  return (Zt(), U(Ye | kt, e, !0));
}
function vr(e) {
  N.ensure();
  const t = U(ue | ge, e, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? Ae(t, () => {
            (O(t), r(void 0));
          })
        : (O(t), r(void 0));
    });
}
function ds(e) {
  return U(He, e, !1);
}
function dr(e) {
  return U(ft | ge, e, !0);
}
function pr(e, t = 0) {
  return U(Ye | t, e, !0);
}
function ps(e, t = [], n = [], r = [], s = !1) {
  rr(r, t, n, (i) => {
    U(s ? He : Ye, () => e(...i.map(fe)), !0);
  });
}
function Qt(e, t = 0) {
  var n = U(G | t, e, !0);
  return n;
}
function $(e, t = !0) {
  return U(K | ge, e, !0, t);
}
function en(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = me,
      r = v;
    (mt(!0), A(null));
    try {
      t.call(null);
    } finally {
      (mt(n), A(r));
    }
  }
}
function tn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null &&
      Ke(() => {
        s.abort(ce);
      });
    var r = n.next;
    ((n.f & ue) !== 0 ? (n.parent = null) : O(n, t), (n = r));
  }
}
function gr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    ((t.f & K) === 0 && O(t), (t = n));
  }
}
function O(e, t = !0) {
  var n = !1;
  ((t || (e.f & xt) !== 0) &&
    e.nodes_start !== null &&
    e.nodes_end !== null &&
    (wr(e.nodes_start, e.nodes_end), (n = !0)),
    tn(e, t && !n),
    qe(e, 0),
    E(e, Q));
  var r = e.transitions;
  if (r !== null) for (const i of r) i.stop();
  en(e);
  var s = e.parent;
  (s !== null && s.first !== null && nn(e),
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
function wr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : X(e);
    (e.remove(), (e = n));
  }
}
function nn(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null &&
      (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function Ae(e, t, n = !0) {
  var r = [];
  (rn(e, r, !0),
    mr(r, () => {
      (n && O(e), t && t());
    }));
}
function mr(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e) s.out(r);
  } else t();
}
function rn(e, t, n) {
  if ((e.f & Y) === 0) {
    if (((e.f ^= Y), e.transitions !== null))
      for (const f of e.transitions) (f.is_global || n) && t.push(f);
    for (var r = e.first; r !== null; ) {
      var s = r.next,
        i = (r.f & he) !== 0 || ((r.f & K) !== 0 && (e.f & G) !== 0);
      (rn(r, t, i ? n : !1), (r = s));
    }
  }
}
function yr(e) {
  sn(e, !0);
}
function sn(e, t) {
  if ((e.f & Y) !== 0) {
    ((e.f ^= Y), (e.f & x) === 0 && (E(e, S), le(e)));
    for (var n = e.first; n !== null; ) {
      var r = n.next,
        s = (n.f & he) !== 0 || (n.f & K) !== 0;
      (sn(n, s ? t : !1), (n = r));
    }
    if (e.transitions !== null)
      for (const i of e.transitions) (i.is_global || t) && i.in();
  }
}
function fn(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : X(n);
    (t.append(n), (n = s));
  }
}
let _e = !1;
function wt(e) {
  _e = e;
}
let me = !1;
function mt(e) {
  me = e;
}
let v = null,
  L = !1;
function A(e) {
  v = e;
}
let d = null;
function B(e) {
  d = e;
}
let W = null;
function an(e) {
  v !== null && (W === null ? (W = [e]) : W.push(e));
}
let k = null,
  R = 0,
  D = null;
function Er(e) {
  D = e;
}
let ln = 1,
  Se = 0,
  ae = Se;
function yt(e) {
  ae = e;
}
let J = !1;
function un() {
  return ++ln;
}
function De(e) {
  var t = e.f;
  if ((t & S) !== 0) return !0;
  if ((t & z) !== 0) {
    var n = e.deps,
      r = (t & P) !== 0;
    if ((t & b && (e.f &= ~Ie), n !== null)) {
      var s,
        i,
        f = (t & Pe) !== 0,
        l = r && d !== null && !J,
        a = n.length;
      if ((f || l) && (d === null || (d.f & Q) === 0)) {
        var u = e,
          o = u.parent;
        for (s = 0; s < a; s++)
          ((i = n[s]),
            (f || !i?.reactions?.includes(u)) && (i.reactions ??= []).push(u));
        (f && (u.f ^= Pe), l && o !== null && (o.f & P) === 0 && (u.f ^= P));
      }
      for (s = 0; s < a; s++)
        if (((i = n[s]), De(i) && Ut(i), i.wv > e.wv)) return !0;
    }
    (!r || (d !== null && !J)) && E(e, x);
  }
  return !1;
}
function on(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !W?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & b) !== 0
        ? on(i, t, !1)
        : t === i && (n ? E(i, S) : (i.f & x) !== 0 && E(i, z), le(i));
    }
}
function cn(e) {
  var t = k,
    n = R,
    r = D,
    s = v,
    i = J,
    f = W,
    l = w,
    a = L,
    u = ae,
    o = e.f;
  ((k = null),
    (R = 0),
    (D = null),
    (J = (o & P) !== 0 && (L || !_e || v === null)),
    (v = (o & (K | ue)) === 0 ? e : null),
    (W = null),
    de(e.ctx),
    (L = !1),
    (ae = ++Se),
    e.ac !== null &&
      (Ke(() => {
        e.ac.abort(ce);
      }),
      (e.ac = null)));
  try {
    e.f |= Qe;
    var _ = e.fn,
      h = _(),
      c = e.deps;
    if (k !== null) {
      var p;
      if ((qe(e, R), c !== null && R > 0))
        for (c.length = R + k.length, p = 0; p < k.length; p++) c[R + p] = k[p];
      else e.deps = c = k;
      if (!J || ((o & b) !== 0 && e.reactions !== null))
        for (p = R; p < c.length; p++) (c[p].reactions ??= []).push(e);
    } else c !== null && R < c.length && (qe(e, R), (c.length = R));
    if (Ft() && D !== null && !L && c !== null && (e.f & (b | z | S)) === 0)
      for (p = 0; p < D.length; p++) on(D[p], e);
    return (
      s !== null &&
        s !== e &&
        (Se++, D !== null && (r === null ? (r = D) : r.push(...D))),
      (e.f & ee) !== 0 && (e.f ^= ee),
      h
    );
  } catch (M) {
    return jt(M);
  } finally {
    ((e.f ^= Qe),
      (k = t),
      (R = n),
      (D = r),
      (v = s),
      (J = i),
      (W = f),
      de(l),
      (L = a),
      (ae = u));
  }
}
function br(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = wn.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? (n = t.reactions = null) : ((n[r] = n[s]), n.pop());
    }
  }
  n === null &&
    (t.f & b) !== 0 &&
    (k === null || !k.includes(t)) &&
    (E(t, z), (t.f & (P | Pe)) === 0 && (t.f ^= Pe), Bt(t), qe(t, 0));
}
function qe(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) br(e, n[r]);
}
function Re(e) {
  var t = e.f;
  if ((t & Q) === 0) {
    E(e, x);
    var n = d,
      r = _e;
    ((d = e), (_e = !0));
    try {
      ((t & G) !== 0 ? gr(e) : tn(e), en(e));
      var s = cn(e);
      ((e.teardown = typeof s == 'function' ? s : null), (e.wv = ln));
      var i;
    } finally {
      ((_e = r), (d = n));
    }
  }
}
async function Tr() {
  (await Promise.resolve(), Me());
}
function xr() {
  return N.ensure().settled();
}
function fe(e) {
  var t = e.f,
    n = (t & b) !== 0;
  if (v !== null && !L) {
    var r = d !== null && (d.f & Q) !== 0;
    if (!r && !W?.includes(e)) {
      var s = v.deps;
      if ((v.f & Qe) !== 0)
        e.rv < Se &&
          ((e.rv = Se),
          k === null && s !== null && s[R] === e
            ? R++
            : k === null
              ? (k = [e])
              : (!J || !k.includes(e)) && k.push(e));
      else {
        (v.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? (e.reactions = [v]) : i.includes(v) || i.push(v);
      }
    }
  } else if (n && e.deps === null && e.effects === null) {
    var f = e,
      l = f.parent;
    l !== null && (l.f & P) === 0 && (f.f ^= P);
  }
  if (me) {
    if (te.has(e)) return te.get(e);
    if (n) {
      f = e;
      var a = f.v;
      return (
        (((f.f & x) === 0 && f.reactions !== null) || _n(f)) && (a = ut(f)),
        te.set(f, a),
        a
      );
    }
  } else if (n) {
    if (((f = e), F?.has(f))) return F.get(f);
    De(f) && Ut(f);
  }
  if (F?.has(e)) return F.get(e);
  if ((e.f & ee) !== 0) throw e.v;
  return e.v;
}
function _n(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (te.has(t) || ((t.f & b) !== 0 && _n(t))) return !0;
  return !1;
}
function ze(e) {
  var t = L;
  try {
    return ((L = !0), e());
  } finally {
    L = t;
  }
}
const kr = -7169;
function E(e, t) {
  e.f = (e.f & kr) | t;
}
const Ar = ['touchstart', 'touchmove'];
function Sr(e) {
  return Ar.includes(e);
}
const hn = new Set(),
  rt = new Set();
function Rr(e, t, n, r = {}) {
  function s(i) {
    if ((r.capture || Ee.call(t, i), !i.cancelBubble))
      return Ke(() => n?.call(this, i));
  }
  return (
    e.startsWith('pointer') || e.startsWith('touch') || e === 'wheel'
      ? We(() => {
          t.addEventListener(e, s, r);
        })
      : t.addEventListener(e, s, r),
    s
  );
}
function gs(e, t, n, r, s) {
  var i = { capture: r, passive: s },
    f = Rr(e, t, n, i);
  (t === document.body ||
    t === window ||
    t === document ||
    t instanceof HTMLMediaElement) &&
    ot(() => {
      t.removeEventListener(e, f, i);
    });
}
function ws(e) {
  for (var t = 0; t < e.length; t++) hn.add(e[t]);
  for (var n of rt) n(e);
}
let Et = null;
function Ee(e) {
  var t = this,
    n = t.ownerDocument,
    r = e.type,
    s = e.composedPath?.() || [],
    i = s[0] || e.target;
  Et = e;
  var f = 0,
    l = Et === e && e.__root;
  if (l) {
    var a = s.indexOf(l);
    if (a !== -1 && (t === document || t === window)) {
      e.__root = t;
      return;
    }
    var u = s.indexOf(t);
    if (u === -1) return;
    a <= u && (f = a);
  }
  if (((i = s[f] || e.target), i !== t)) {
    yn(e, 'currentTarget', {
      configurable: !0,
      get() {
        return i || n;
      },
    });
    var o = v,
      _ = d;
    (A(null), B(null));
    try {
      for (var h, c = []; i !== null; ) {
        var p = i.assignedSlot || i.parentNode || i.host || null;
        try {
          var M = i['__' + r];
          M != null && (!i.disabled || e.target === i) && M.call(i, e);
        } catch (ne) {
          h ? c.push(ne) : (h = ne);
        }
        if (e.cancelBubble || p === t || p === null) break;
        i = p;
      }
      if (h) {
        for (let ne of c)
          queueMicrotask(() => {
            throw ne;
          });
        throw h;
      }
    } finally {
      ((e.__root = t), delete e.currentTarget, A(o), B(_));
    }
  }
}
function ct(e) {
  var t = document.createElement('template');
  return ((t.innerHTML = e.replaceAll('<!>', '<!---->')), t.content);
}
function I(e, t) {
  var n = d;
  n.nodes_start === null && ((n.nodes_start = e), (n.nodes_end = t));
}
function ms(e, t) {
  var n = (t & St) !== 0,
    r = (t & Hn) !== 0,
    s,
    i = !e.startsWith('<!>');
  return () => {
    if (m) return (I(g, null), g);
    s === void 0 && ((s = ct(i ? e : '<!>' + e)), n || (s = C(s)));
    var f = r || Gt ? document.importNode(s, !0) : s.cloneNode(!0);
    if (n) {
      var l = C(f),
        a = f.lastChild;
      I(l, a);
    } else I(f, f);
    return f;
  };
}
function Cr(e, t, n = 'svg') {
  var r = !e.startsWith('<!>'),
    s = (t & St) !== 0,
    i = `<${n}>${r ? e : '<!>' + e}</${n}>`,
    f;
  return () => {
    if (m) return (I(g, null), g);
    if (!f) {
      var l = ct(i),
        a = C(l);
      if (s)
        for (f = document.createDocumentFragment(); C(a); ) f.appendChild(C(a));
      else f = C(a);
    }
    var u = f.cloneNode(!0);
    if (s) {
      var o = C(u),
        _ = u.lastChild;
      I(o, _);
    } else I(u, u);
    return u;
  };
}
function ys(e, t) {
  return Cr(e, t, 'svg');
}
function Es(e = '') {
  if (!m) {
    var t = q(e + '');
    return (I(t, t), t);
  }
  var n = g;
  return (n.nodeType !== Ue && (n.before((n = q())), j(n)), I(n, n), n);
}
function bs() {
  if (m) return (I(g, null), g);
  var e = document.createDocumentFragment(),
    t = document.createComment(''),
    n = q();
  return (e.append(t, n), I(t, n), e);
}
function Ts(e, t) {
  if (m) {
    ((d.nodes_end = g), at());
    return;
  }
  e !== null && e.before(t);
}
function xs(e, t) {
  var n = t == null ? '' : typeof t == 'object' ? t + '' : t;
  n !== (e.__t ??= e.nodeValue) && ((e.__t = n), (e.nodeValue = n + ''));
}
function vn(e, t) {
  return dn(e, t);
}
function Or(e, t) {
  (nt(), (t.intro = t.intro ?? !1));
  const n = t.target,
    r = m,
    s = g;
  try {
    for (var i = C(n); i && (i.nodeType !== Ce || i.data !== Rt); ) i = X(i);
    if (!i) throw ve;
    (Ne(!0), j(i));
    const f = dn(e, { ...t, anchor: i });
    return (Ne(!1), f);
  } catch (f) {
    if (
      f instanceof Error &&
      f.message
        .split(
          `
`,
        )
        .some((l) => l.startsWith('https://svelte.dev/e/'))
    )
      throw f;
    return (
      f !== ve && console.warn('Failed to hydrate: ', f),
      t.recover === !1 && Mn(),
      nt(),
      Xt(n),
      Ne(!1),
      vn(e, t)
    );
  } finally {
    (Ne(r), j(s));
  }
}
const oe = new Map();
function dn(
  e,
  { target: t, anchor: n, props: r = {}, events: s, context: i, intro: f = !0 },
) {
  nt();
  var l = new Set(),
    a = (_) => {
      for (var h = 0; h < _.length; h++) {
        var c = _[h];
        if (!l.has(c)) {
          l.add(c);
          var p = Sr(c);
          t.addEventListener(c, Ee, { passive: p });
          var M = oe.get(c);
          M === void 0
            ? (document.addEventListener(c, Ee, { passive: p }), oe.set(c, 1))
            : oe.set(c, M + 1);
        }
      }
    };
  (a(mn(hn)), rt.add(a));
  var u = void 0,
    o = vr(() => {
      var _ = n ?? t.appendChild(q());
      return (
        tr(_, { pending: () => {} }, (h) => {
          if (i) {
            Gn({});
            var c = w;
            c.c = i;
          }
          if (
            (s && (r.$$events = s),
            m && I(h, null),
            (u = e(h, r) || {}),
            m &&
              ((d.nodes_end = g),
              g === null || g.nodeType !== Ce || g.data !== Ot))
          )
            throw (Ve(), ve);
          i && Kn();
        }),
        () => {
          for (var h of l) {
            t.removeEventListener(h, Ee);
            var c = oe.get(h);
            --c === 0
              ? (document.removeEventListener(h, Ee), oe.delete(h))
              : oe.set(h, c);
          }
          (rt.delete(a), _ !== n && _.parentNode?.removeChild(_));
        }
      );
    });
  return (st.set(u, o), u);
}
let st = new WeakMap();
function Dr(e, t) {
  const n = st.get(e);
  return n ? (st.delete(e), n(t)) : Promise.resolve();
}
class Nr {
  anchor;
  #e = new Map();
  #t = new Map();
  #n = new Map();
  #r = !0;
  constructor(t, n = !0) {
    ((this.anchor = t), (this.#r = n));
  }
  #l = () => {
    var t = y;
    if (this.#e.has(t)) {
      var n = this.#e.get(t),
        r = this.#t.get(n);
      if (r) yr(r);
      else {
        var s = this.#n.get(n);
        s &&
          (this.#t.set(n, s.effect),
          this.#n.delete(n),
          s.fragment.lastChild.remove(),
          this.anchor.before(s.fragment),
          (r = s.effect));
      }
      for (const [i, f] of this.#e) {
        if ((this.#e.delete(i), i === t)) break;
        const l = this.#n.get(f);
        l && (O(l.effect), this.#n.delete(f));
      }
      for (const [i, f] of this.#t) {
        if (i === n) continue;
        const l = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var u = document.createDocumentFragment();
            (fn(f, u),
              u.append(q()),
              this.#n.set(i, { effect: f, fragment: u }));
          } else O(f);
          this.#t.delete(i);
        };
        this.#r || !r ? Ae(f, l, !1) : l();
      }
    }
  };
  #f = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, s] of this.#n)
      n.includes(r) || (O(s.effect), this.#n.delete(r));
  };
  ensure(t, n) {
    var r = y,
      s = ur();
    if (n && !this.#t.has(t) && !this.#n.has(t))
      if (s) {
        var i = document.createDocumentFragment(),
          f = q();
        (i.append(f), this.#n.set(t, { effect: $(() => n(f)), fragment: i }));
      } else
        this.#t.set(
          t,
          $(() => n(this.anchor)),
        );
    if ((this.#e.set(r, t), s)) {
      for (const [l, a] of this.#t)
        l === t ? r.skipped_effects.delete(a) : r.skipped_effects.add(a);
      for (const [l, a] of this.#n)
        l === t
          ? r.skipped_effects.delete(a.effect)
          : r.skipped_effects.add(a.effect);
      (r.oncommit(this.#l), r.ondiscard(this.#f));
    } else (m && (this.anchor = g), this.#l());
  }
}
function ks(e, t, ...n) {
  var r = new Nr(e);
  Qt(() => {
    const s = t() ?? null;
    r.ensure(s, s && ((i) => s(i, ...n)));
  }, he);
}
function Pr(e) {
  return (t, ...n) => {
    var r = e(...n),
      s;
    if (m) ((s = g), at());
    else {
      var i = r.render().trim(),
        f = ct(i);
      ((s = C(f)), t.before(s));
    }
    const l = r.setup?.(s);
    (I(s, s), typeof l == 'function' && ot(l));
  };
}
function Ir() {
  return (v === null && In(), (v.ac ??= new AbortController()).signal);
}
function pn(e) {
  (w === null && we(),
    hr(() => {
      const t = ze(e);
      if (typeof t == 'function') return t;
    }));
}
function Mr(e) {
  (w === null && we(), pn(() => () => ze(e)));
}
function Fr(e, t, { bubbles: n = !1, cancelable: r = !1 } = {}) {
  return new CustomEvent(e, { detail: t, bubbles: n, cancelable: r });
}
function Lr() {
  const e = w;
  return (
    e === null && we(),
    (t, n, r) => {
      const s = e.s.$$events?.[t];
      if (s) {
        const i = bt(s) ? s.slice() : [s],
          f = Fr(t, n, r);
        for (const l of i) l.call(e.x, f);
        return !f.defaultPrevented;
      }
      return !0;
    }
  );
}
function jr(e) {
  (w === null && we(), w.l === null && At(), gn(w).b.push(e));
}
function qr(e) {
  (w === null && we(), w.l === null && At(), gn(w).a.push(e));
}
function gn(e) {
  var t = e.l;
  return (t.u ??= { a: [], b: [], m: [] });
}
const As = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      afterUpdate: qr,
      beforeUpdate: jr,
      createContext: $n,
      createEventDispatcher: Lr,
      createRawSnippet: Pr,
      flushSync: Me,
      fork: Jn,
      getAbortSignal: Ir,
      getAllContexts: Wn,
      getContext: Pt,
      hasContext: Mt,
      hydrate: Or,
      mount: vn,
      onDestroy: Mr,
      onMount: pn,
      setContext: It,
      settled: xr,
      tick: Tr,
      unmount: Dr,
      untrack: ze,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);
export {
  pt as $,
  _s as A,
  hs as B,
  Tr as C,
  ze as D,
  pr as E,
  m as F,
  y as G,
  Ze as H,
  q as I,
  Qt as J,
  xt as K,
  C as L,
  Ce as M,
  X as N,
  Ne as O,
  j as P,
  g as Q,
  Kr as R,
  at as S,
  fs as T,
  ss as U,
  Ct as V,
  Un as W,
  Ot as X,
  $ as Y,
  ur as Z,
  Wr as _,
  Oe as a,
  Gr as a0,
  je as a1,
  as as a2,
  mn as a3,
  bt as a4,
  yr as a5,
  Ae as a6,
  Xr as a7,
  Y as a8,
  We as a9,
  vn as aA,
  Me as aB,
  yn as aC,
  Dr as aD,
  vs as aE,
  Mr as aF,
  ks as aG,
  ns as aH,
  ls as aI,
  ot as aJ,
  ys as aK,
  Yr as aL,
  Vn as aM,
  Jn as aN,
  xr as aO,
  As as aP,
  O as aa,
  zr as ab,
  rn as ac,
  Xt as ad,
  mr as ae,
  d as af,
  Nr as ag,
  Te as ah,
  he as ai,
  be as aj,
  $r as ak,
  Jr as al,
  Q as am,
  lt as an,
  Qr as ao,
  Zr as ap,
  es as aq,
  me as ar,
  Br as as,
  hr as at,
  Ur as au,
  ts as av,
  Tn as aw,
  Hr as ax,
  or as ay,
  Or as az,
  re as b,
  ye as c,
  Ts as d,
  Kn as e,
  ms as f,
  fe as g,
  us as h,
  ke as i,
  cs as j,
  is as k,
  xs as l,
  os as m,
  Bn as n,
  pn as o,
  Gn as p,
  bs as q,
  rs as r,
  Z as s,
  ps as t,
  ae as u,
  ws as v,
  Es as w,
  gs as x,
  ds as y,
  lr as z,
};
