import { f as F, t as ae, a as T, c as Ie } from '../chunks/DzhFJs4K.js';
import {
  h as X,
  a as Ke,
  b as Qe,
  e as x,
  i as We,
  r as Ge,
  H as Ze,
  s as we,
  c as Se,
  d as Z,
  C as H,
  a5 as Je,
  ap as er,
  B as oe,
  G as rr,
  w as B,
  an as Ce,
  aB as tr,
  A as nr,
  M as ar,
  a2 as Ee,
  a9 as or,
  x as Me,
  z as sr,
  aN as ir,
  aO as J,
  y as Ne,
  aP as lr,
  aQ as ur,
  aj as cr,
  aR as fr,
  am as vr,
  aS as dr,
  m as pr,
  aT as hr,
  az as br,
  u as mr,
  a3 as yr,
  aU as _r,
  W as be,
  ay as U,
  j as me,
  t as je,
  k as M,
  X as q,
  _ as w,
  $ as S,
  a0 as P,
  aa as se,
  Y as ie,
  Z as ye,
  aA as xr,
} from '../chunks/dJOEbL3k.js';
import { f as $e } from '../chunks/hCnymrOV.js';
import { i as Re } from '../chunks/2eUCvS7o.js';
import {
  l as K,
  d as E,
  B as gr,
  r as Xe,
  a as le,
  s as wr,
} from '../chunks/CJ3v3E5z.js';
import { s as D } from '../chunks/CyGDRoYz.js';
import { o as Sr } from '../chunks/Hfb5b_gR.js';
function Er(t, r, e) {
  for (var n = t.items, a = [], o = r.length, s = 0; s < o; s++)
    fr(r[s].e, a, !0);
  var l = o > 0 && a.length === 0 && e !== null;
  if (l) {
    var f = e.parentNode;
    (vr(f), f.append(e), n.clear(), C(t, r[0].prev, r[o - 1].next));
  }
  dr(a, () => {
    for (var p = 0; p < o; p++) {
      var b = r[p];
      (l || (n.delete(b.k), C(t, b.prev, b.next)), Ne(b.e, !l));
    }
  });
}
function De(t, r, e, n, a, o = null) {
  var s = t,
    l = { flags: r, items: new Map(), first: null };
  X && Ke();
  var f = null,
    p = !1,
    b = new Map(),
    g = We(() => {
      var i = e();
      return tr(i) ? i : i == null ? [] : Ce(i);
    }),
    u,
    v;
  function c() {
    (Ar(v, u, l, b, s, a, r, n, e),
      o !== null &&
        (u.length === 0
          ? f
            ? Me(f)
            : (f = oe(() => o(s)))
          : f !== null &&
            sr(f, () => {
              f = null;
            })));
  }
  (Qe(() => {
    ((v ??= pr), (u = x(g)));
    var i = u.length;
    if (p && i === 0) return;
    p = i === 0;
    let y = !1;
    if (X) {
      var k = Ge(s) === Ze;
      k !== (i === 0) && ((s = we()), Se(s), Z(!1), (y = !0));
    }
    if (X) {
      for (var m = null, d, h = 0; h < i; h++) {
        if (H.nodeType === Je && H.data === er) {
          ((s = H), (y = !0), Z(!1));
          break;
        }
        var _ = u[h],
          A = n(_, h);
        ((d = ue(H, l, m, null, _, A, h, a, r, e)), l.items.set(A, d), (m = d));
      }
      i > 0 && Se(we());
    }
    if (X) i === 0 && o && (f = oe(() => o(s)));
    else if (rr()) {
      var j = new Set(),
        I = B;
      for (h = 0; h < i; h += 1) {
        ((_ = u[h]), (A = n(_, h)));
        var O = l.items.get(A) ?? b.get(A);
        (O
          ? Fe(O, _, h)
          : ((d = ue(null, l, null, null, _, A, h, a, r, e, !0)), b.set(A, d)),
          j.add(A));
      }
      for (const [$, R] of l.items) j.has($) || I.skipped_effects.add(R.e);
      I.oncommit(c);
    } else c();
    (y && Z(!0), x(g));
  }),
    X && (s = H));
}
function Ar(t, r, e, n, a, o, s, l, f) {
  var p = r.length,
    b = e.items,
    g = e.first,
    u = g,
    v,
    c = null,
    i = [],
    y = [],
    k,
    m,
    d,
    h;
  for (h = 0; h < p; h += 1) {
    if (((k = r[h]), (m = l(k, h)), (d = b.get(m)), d === void 0)) {
      var _ = n.get(m);
      if (_ !== void 0) {
        (n.delete(m), b.set(m, _));
        var A = c ? c.next : u;
        (C(e, c, _), C(e, _, A), ee(_, A, a), (c = _));
      } else {
        var j = u ? u.e.nodes_start : a;
        c = ue(j, e, c, c === null ? e.first : c.next, k, m, h, o, s, f);
      }
      (b.set(m, c), (i = []), (y = []), (u = c.next));
      continue;
    }
    if ((Fe(d, k, h), (d.e.f & J) !== 0 && Me(d.e), d !== u)) {
      if (v !== void 0 && v.has(d)) {
        if (i.length < y.length) {
          var I = y[0],
            O;
          c = I.prev;
          var $ = i[0],
            R = i[i.length - 1];
          for (O = 0; O < i.length; O += 1) ee(i[O], I, a);
          for (O = 0; O < y.length; O += 1) v.delete(y[O]);
          (C(e, $.prev, R.next),
            C(e, c, $),
            C(e, R, I),
            (u = I),
            (c = R),
            (h -= 1),
            (i = []),
            (y = []));
        } else
          (v.delete(d),
            ee(d, u, a),
            C(e, d.prev, d.next),
            C(e, d, c === null ? e.first : c.next),
            C(e, c, d),
            (c = d));
        continue;
      }
      for (i = [], y = []; u !== null && u.k !== m; )
        ((u.e.f & J) === 0 && (v ??= new Set()).add(u),
          y.push(u),
          (u = u.next));
      if (u === null) continue;
      d = u;
    }
    (i.push(d), (c = d), (u = d.next));
  }
  if (u !== null || v !== void 0) {
    for (var V = v === void 0 ? [] : Ce(v); u !== null; )
      ((u.e.f & J) === 0 && V.push(u), (u = u.next));
    var W = V.length;
    if (W > 0) {
      var ge = null;
      Er(e, V, ge);
    }
  }
  ((t.first = e.first && e.first.e), (t.last = c && c.e));
  for (var G of n.values()) Ne(G.e);
  n.clear();
}
function Fe(t, r, e, n) {
  (or(t.v, r), (t.i = e));
}
function ue(t, r, e, n, a, o, s, l, f, p, b) {
  var g = (f & lr) !== 0,
    u = (f & ur) === 0,
    v = g ? (u ? ar(a, !1, !1) : Ee(a)) : a,
    c = (f & ir) === 0 ? s : Ee(s),
    i = { i: c, v, k: o, a: null, e: null, prev: e, next: n };
  try {
    if (t === null) {
      var y = document.createDocumentFragment();
      y.append((t = nr()));
    }
    return (
      (i.e = oe(() => l(t, v, c, p), X)),
      (i.e.prev = e && e.e),
      (i.e.next = n && n.e),
      e === null ? b || (r.first = i) : ((e.next = i), (e.e.next = i.e)),
      n !== null && ((n.prev = i), (n.e.prev = i.e)),
      i
    );
  } finally {
  }
}
function ee(t, r, e) {
  for (
    var n = t.next ? t.next.e.nodes_start : e,
      a = r ? r.e.nodes_start : e,
      o = t.e.nodes_start;
    o !== null && o !== n;

  ) {
    var s = cr(o);
    (a.before(o), (o = s));
  }
}
function C(t, r, e) {
  (r === null ? (t.first = e) : ((r.next = e), (r.e.next = e && e.e)),
    e !== null && ((e.prev = r), (e.e.prev = r && r.e)));
}
function Be(t, r, e = r) {
  var n = new WeakSet();
  (hr(t, 'input', async (a) => {
    var o = a ? t.defaultValue : t.value;
    if (
      ((o = re(t) ? te(o) : o),
      e(o),
      B !== null && n.add(B),
      await br(),
      o !== (o = r()))
    ) {
      var s = t.selectionStart,
        l = t.selectionEnd,
        f = t.value.length;
      if (((t.value = o ?? ''), l !== null)) {
        var p = t.value.length;
        s === l && l === f && p > f
          ? ((t.selectionStart = p), (t.selectionEnd = p))
          : ((t.selectionStart = s), (t.selectionEnd = Math.min(l, p)));
      }
    }
  }),
    ((X && t.defaultValue !== t.value) || (mr(r) == null && t.value)) &&
      (e(re(t) ? te(t.value) : t.value), B !== null && n.add(B)),
    yr(() => {
      var a = r();
      if (t === document.activeElement) {
        var o = _r ?? B;
        if (n.has(o)) return;
      }
      (re(t) && a === te(t.value)) ||
        (t.type === 'date' && !a && !t.value) ||
        (a !== t.value && (t.value = a ?? ''));
    }));
}
function re(t) {
  var r = t.type;
  return r === 'number' || r === 'range';
}
function te(t) {
  return t === '' ? null : +t;
}
var ce = function (t, r) {
  return (
    (ce =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, n) {
          e.__proto__ = n;
        }) ||
      function (e, n) {
        for (var a in n)
          Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
      }),
    ce(t, r)
  );
};
function Y(t, r) {
  if (typeof r != 'function' && r !== null)
    throw new TypeError(
      'Class extends value ' + String(r) + ' is not a constructor or null',
    );
  ce(t, r);
  function e() {
    this.constructor = t;
  }
  t.prototype =
    r === null ? Object.create(r) : ((e.prototype = r.prototype), new e());
}
function fe(t) {
  var r = typeof Symbol == 'function' && Symbol.iterator,
    e = r && t[r],
    n = 0;
  if (e) return e.call(t);
  if (t && typeof t.length == 'number')
    return {
      next: function () {
        return (
          t && n >= t.length && (t = void 0),
          { value: t && t[n++], done: !t }
        );
      },
    };
  throw new TypeError(
    r ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
  );
}
function ve(t, r) {
  var e = typeof Symbol == 'function' && t[Symbol.iterator];
  if (!e) return t;
  var n = e.call(t),
    a,
    o = [],
    s;
  try {
    for (; (r === void 0 || r-- > 0) && !(a = n.next()).done; ) o.push(a.value);
  } catch (l) {
    s = { error: l };
  } finally {
    try {
      a && !a.done && (e = n.return) && e.call(n);
    } finally {
      if (s) throw s.error;
    }
  }
  return o;
}
function de(t, r, e) {
  if (e || arguments.length === 2)
    for (var n = 0, a = r.length, o; n < a; n++)
      (o || !(n in r)) &&
        (o || (o = Array.prototype.slice.call(r, 0, n)), (o[n] = r[n]));
  return t.concat(o || Array.prototype.slice.call(r));
}
function N(t) {
  return typeof t == 'function';
}
function Ue(t) {
  var r = function (n) {
      (Error.call(n), (n.stack = new Error().stack));
    },
    e = t(r);
  return (
    (e.prototype = Object.create(Error.prototype)),
    (e.prototype.constructor = e),
    e
  );
}
var ne = Ue(function (t) {
  return function (e) {
    (t(this),
      (this.message = e
        ? e.length +
          ` errors occurred during unsubscription:
` +
          e.map(function (n, a) {
            return a + 1 + ') ' + n.toString();
          }).join(`
  `)
        : ''),
      (this.name = 'UnsubscriptionError'),
      (this.errors = e));
  };
});
function pe(t, r) {
  if (t) {
    var e = t.indexOf(r);
    0 <= e && t.splice(e, 1);
  }
}
var Q = (function () {
    function t(r) {
      ((this.initialTeardown = r),
        (this.closed = !1),
        (this._parentage = null),
        (this._finalizers = null));
    }
    return (
      (t.prototype.unsubscribe = function () {
        var r, e, n, a, o;
        if (!this.closed) {
          this.closed = !0;
          var s = this._parentage;
          if (s)
            if (((this._parentage = null), Array.isArray(s)))
              try {
                for (var l = fe(s), f = l.next(); !f.done; f = l.next()) {
                  var p = f.value;
                  p.remove(this);
                }
              } catch (i) {
                r = { error: i };
              } finally {
                try {
                  f && !f.done && (e = l.return) && e.call(l);
                } finally {
                  if (r) throw r.error;
                }
              }
            else s.remove(this);
          var b = this.initialTeardown;
          if (N(b))
            try {
              b();
            } catch (i) {
              o = i instanceof ne ? i.errors : [i];
            }
          var g = this._finalizers;
          if (g) {
            this._finalizers = null;
            try {
              for (var u = fe(g), v = u.next(); !v.done; v = u.next()) {
                var c = v.value;
                try {
                  Ae(c);
                } catch (i) {
                  ((o = o ?? []),
                    i instanceof ne
                      ? (o = de(de([], ve(o)), ve(i.errors)))
                      : o.push(i));
                }
              }
            } catch (i) {
              n = { error: i };
            } finally {
              try {
                v && !v.done && (a = u.return) && a.call(u);
              } finally {
                if (n) throw n.error;
              }
            }
          }
          if (o) throw new ne(o);
        }
      }),
      (t.prototype.add = function (r) {
        var e;
        if (r && r !== this)
          if (this.closed) Ae(r);
          else {
            if (r instanceof t) {
              if (r.closed || r._hasParent(this)) return;
              r._addParent(this);
            }
            (this._finalizers =
              (e = this._finalizers) !== null && e !== void 0 ? e : []).push(r);
          }
      }),
      (t.prototype._hasParent = function (r) {
        var e = this._parentage;
        return e === r || (Array.isArray(e) && e.includes(r));
      }),
      (t.prototype._addParent = function (r) {
        var e = this._parentage;
        this._parentage = Array.isArray(e) ? (e.push(r), e) : e ? [e, r] : r;
      }),
      (t.prototype._removeParent = function (r) {
        var e = this._parentage;
        e === r ? (this._parentage = null) : Array.isArray(e) && pe(e, r);
      }),
      (t.prototype.remove = function (r) {
        var e = this._finalizers;
        (e && pe(e, r), r instanceof t && r._removeParent(this));
      }),
      (t.EMPTY = (function () {
        var r = new t();
        return ((r.closed = !0), r);
      })()),
      t
    );
  })(),
  Ve = Q.EMPTY;
function He(t) {
  return (
    t instanceof Q ||
    (t && 'closed' in t && N(t.remove) && N(t.add) && N(t.unsubscribe))
  );
}
function Ae(t) {
  N(t) ? t() : t.unsubscribe();
}
var Or = { Promise: void 0 },
  Pr = {
    setTimeout: function (t, r) {
      for (var e = [], n = 2; n < arguments.length; n++)
        e[n - 2] = arguments[n];
      return setTimeout.apply(void 0, de([t, r], ve(e)));
    },
    clearTimeout: function (t) {
      return clearTimeout(t);
    },
    delegate: void 0,
  };
function kr(t) {
  Pr.setTimeout(function () {
    throw t;
  });
}
function Oe() {}
function z(t) {
  t();
}
var Ye = (function (t) {
    Y(r, t);
    function r(e) {
      var n = t.call(this) || this;
      return (
        (n.isStopped = !1),
        e ? ((n.destination = e), He(e) && e.add(n)) : (n.destination = Cr),
        n
      );
    }
    return (
      (r.create = function (e, n, a) {
        return new he(e, n, a);
      }),
      (r.prototype.next = function (e) {
        this.isStopped || this._next(e);
      }),
      (r.prototype.error = function (e) {
        this.isStopped || ((this.isStopped = !0), this._error(e));
      }),
      (r.prototype.complete = function () {
        this.isStopped || ((this.isStopped = !0), this._complete());
      }),
      (r.prototype.unsubscribe = function () {
        this.closed ||
          ((this.isStopped = !0),
          t.prototype.unsubscribe.call(this),
          (this.destination = null));
      }),
      (r.prototype._next = function (e) {
        this.destination.next(e);
      }),
      (r.prototype._error = function (e) {
        try {
          this.destination.error(e);
        } finally {
          this.unsubscribe();
        }
      }),
      (r.prototype._complete = function () {
        try {
          this.destination.complete();
        } finally {
          this.unsubscribe();
        }
      }),
      r
    );
  })(Q),
  Tr = (function () {
    function t(r) {
      this.partialObserver = r;
    }
    return (
      (t.prototype.next = function (r) {
        var e = this.partialObserver;
        if (e.next)
          try {
            e.next(r);
          } catch (n) {
            L(n);
          }
      }),
      (t.prototype.error = function (r) {
        var e = this.partialObserver;
        if (e.error)
          try {
            e.error(r);
          } catch (n) {
            L(n);
          }
        else L(r);
      }),
      (t.prototype.complete = function () {
        var r = this.partialObserver;
        if (r.complete)
          try {
            r.complete();
          } catch (e) {
            L(e);
          }
      }),
      t
    );
  })(),
  he = (function (t) {
    Y(r, t);
    function r(e, n, a) {
      var o = t.call(this) || this,
        s;
      return (
        N(e) || !e
          ? (s = {
              next: e ?? void 0,
              error: n ?? void 0,
              complete: a ?? void 0,
            })
          : (s = e),
        (o.destination = new Tr(s)),
        o
      );
    }
    return r;
  })(Ye);
function L(t) {
  kr(t);
}
function Ir(t) {
  throw t;
}
var Cr = { closed: !0, next: Oe, error: Ir, complete: Oe },
  Mr = (function () {
    return (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
  })();
function Nr(t) {
  return t;
}
function jr(t) {
  return t.length === 0
    ? Nr
    : t.length === 1
      ? t[0]
      : function (e) {
          return t.reduce(function (n, a) {
            return a(n);
          }, e);
        };
}
var Pe = (function () {
  function t(r) {
    r && (this._subscribe = r);
  }
  return (
    (t.prototype.lift = function (r) {
      var e = new t();
      return ((e.source = this), (e.operator = r), e);
    }),
    (t.prototype.subscribe = function (r, e, n) {
      var a = this,
        o = Rr(r) ? r : new he(r, e, n);
      return (
        z(function () {
          var s = a,
            l = s.operator,
            f = s.source;
          o.add(l ? l.call(o, f) : f ? a._subscribe(o) : a._trySubscribe(o));
        }),
        o
      );
    }),
    (t.prototype._trySubscribe = function (r) {
      try {
        return this._subscribe(r);
      } catch (e) {
        r.error(e);
      }
    }),
    (t.prototype.forEach = function (r, e) {
      var n = this;
      return (
        (e = ke(e)),
        new e(function (a, o) {
          var s = new he({
            next: function (l) {
              try {
                r(l);
              } catch (f) {
                (o(f), s.unsubscribe());
              }
            },
            error: o,
            complete: a,
          });
          n.subscribe(s);
        })
      );
    }),
    (t.prototype._subscribe = function (r) {
      var e;
      return (e = this.source) === null || e === void 0
        ? void 0
        : e.subscribe(r);
    }),
    (t.prototype[Mr] = function () {
      return this;
    }),
    (t.prototype.pipe = function () {
      for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
      return jr(r)(this);
    }),
    (t.prototype.toPromise = function (r) {
      var e = this;
      return (
        (r = ke(r)),
        new r(function (n, a) {
          var o;
          e.subscribe(
            function (s) {
              return (o = s);
            },
            function (s) {
              return a(s);
            },
            function () {
              return n(o);
            },
          );
        })
      );
    }),
    (t.create = function (r) {
      return new t(r);
    }),
    t
  );
})();
function ke(t) {
  var r;
  return (r = t ?? Or.Promise) !== null && r !== void 0 ? r : Promise;
}
function $r(t) {
  return t && N(t.next) && N(t.error) && N(t.complete);
}
function Rr(t) {
  return (t && t instanceof Ye) || ($r(t) && He(t));
}
var Xr = Ue(function (t) {
    return function () {
      (t(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed'));
    };
  }),
  Le = (function (t) {
    Y(r, t);
    function r() {
      var e = t.call(this) || this;
      return (
        (e.closed = !1),
        (e.currentObservers = null),
        (e.observers = []),
        (e.isStopped = !1),
        (e.hasError = !1),
        (e.thrownError = null),
        e
      );
    }
    return (
      (r.prototype.lift = function (e) {
        var n = new Te(this, this);
        return ((n.operator = e), n);
      }),
      (r.prototype._throwIfClosed = function () {
        if (this.closed) throw new Xr();
      }),
      (r.prototype.next = function (e) {
        var n = this;
        z(function () {
          var a, o;
          if ((n._throwIfClosed(), !n.isStopped)) {
            n.currentObservers ||
              (n.currentObservers = Array.from(n.observers));
            try {
              for (
                var s = fe(n.currentObservers), l = s.next();
                !l.done;
                l = s.next()
              ) {
                var f = l.value;
                f.next(e);
              }
            } catch (p) {
              a = { error: p };
            } finally {
              try {
                l && !l.done && (o = s.return) && o.call(s);
              } finally {
                if (a) throw a.error;
              }
            }
          }
        });
      }),
      (r.prototype.error = function (e) {
        var n = this;
        z(function () {
          if ((n._throwIfClosed(), !n.isStopped)) {
            ((n.hasError = n.isStopped = !0), (n.thrownError = e));
            for (var a = n.observers; a.length; ) a.shift().error(e);
          }
        });
      }),
      (r.prototype.complete = function () {
        var e = this;
        z(function () {
          if ((e._throwIfClosed(), !e.isStopped)) {
            e.isStopped = !0;
            for (var n = e.observers; n.length; ) n.shift().complete();
          }
        });
      }),
      (r.prototype.unsubscribe = function () {
        ((this.isStopped = this.closed = !0),
          (this.observers = this.currentObservers = null));
      }),
      Object.defineProperty(r.prototype, 'observed', {
        get: function () {
          var e;
          return (
            ((e = this.observers) === null || e === void 0
              ? void 0
              : e.length) > 0
          );
        },
        enumerable: !1,
        configurable: !0,
      }),
      (r.prototype._trySubscribe = function (e) {
        return (this._throwIfClosed(), t.prototype._trySubscribe.call(this, e));
      }),
      (r.prototype._subscribe = function (e) {
        return (
          this._throwIfClosed(),
          this._checkFinalizedStatuses(e),
          this._innerSubscribe(e)
        );
      }),
      (r.prototype._innerSubscribe = function (e) {
        var n = this,
          a = this,
          o = a.hasError,
          s = a.isStopped,
          l = a.observers;
        return o || s
          ? Ve
          : ((this.currentObservers = null),
            l.push(e),
            new Q(function () {
              ((n.currentObservers = null), pe(l, e));
            }));
      }),
      (r.prototype._checkFinalizedStatuses = function (e) {
        var n = this,
          a = n.hasError,
          o = n.thrownError,
          s = n.isStopped;
        a ? e.error(o) : s && e.complete();
      }),
      (r.prototype.asObservable = function () {
        var e = new Pe();
        return ((e.source = this), e);
      }),
      (r.create = function (e, n) {
        return new Te(e, n);
      }),
      r
    );
  })(Pe),
  Te = (function (t) {
    Y(r, t);
    function r(e, n) {
      var a = t.call(this) || this;
      return ((a.destination = e), (a.source = n), a);
    }
    return (
      (r.prototype.next = function (e) {
        var n, a;
        (a =
          (n = this.destination) === null || n === void 0 ? void 0 : n.next) ===
          null ||
          a === void 0 ||
          a.call(n, e);
      }),
      (r.prototype.error = function (e) {
        var n, a;
        (a =
          (n = this.destination) === null || n === void 0
            ? void 0
            : n.error) === null ||
          a === void 0 ||
          a.call(n, e);
      }),
      (r.prototype.complete = function () {
        var e, n;
        (n =
          (e = this.destination) === null || e === void 0
            ? void 0
            : e.complete) === null ||
          n === void 0 ||
          n.call(e);
      }),
      (r.prototype._subscribe = function (e) {
        var n, a;
        return (a =
          (n = this.source) === null || n === void 0
            ? void 0
            : n.subscribe(e)) !== null && a !== void 0
          ? a
          : Ve;
      }),
      r
    );
  })(Le),
  ze = (function (t) {
    Y(r, t);
    function r(e) {
      var n = t.call(this) || this;
      return ((n._value = e), n);
    }
    return (
      Object.defineProperty(r.prototype, 'value', {
        get: function () {
          return this.getValue();
        },
        enumerable: !1,
        configurable: !0,
      }),
      (r.prototype._subscribe = function (e) {
        var n = t.prototype._subscribe.call(this, e);
        return (!n.closed && e.next(this._value), n);
      }),
      (r.prototype.getValue = function () {
        var e = this,
          n = e.hasError,
          a = e.thrownError,
          o = e._value;
        if (n) throw a;
        return (this._throwIfClosed(), o);
      }),
      (r.prototype.next = function (e) {
        t.prototype.next.call(this, (this._value = e));
      }),
      r
    );
  })(Le);
const Dr = 100,
  Fr = 1.5,
  _e = new ze(0),
  xe = new ze({ count: 0, lastCheckin: null });
{
  const t = async () => {
    try {
      await E.meta.bulkPut([
        { key: 'totalXp', value: (await E.meta.get('totalXp'))?.value || 0 },
        {
          key: 'streak',
          value: (await E.meta.get('streak'))?.value || {
            count: 0,
            lastCheckin: null,
          },
        },
      ]);
    } catch (r) {
      console.error('Falha ao inicializar a store meta:', r);
    }
  };
  (K(() => E.meta.get('totalXp')).subscribe((r) => {
    _e.next(r?.value || 0);
  }),
    K(() => E.meta.get('streak')).subscribe((r) => {
      xe.next(r?.value || { count: 0, lastCheckin: null });
    }),
    t().catch(console.error));
}
function Br() {
  return _e.asObservable();
}
function Ur() {
  return xe.asObservable();
}
async function Vr(t) {
  try {
    (await E.meta.put({ key: 'totalXp', value: _e.value + t }), await qe(!0));
  } catch (r) {
    console.error('Falha ao adicionar XP:', r);
  }
}
async function qe(t = !1) {
  const r = new Date().toDateString(),
    { count: e, lastCheckin: n } = xe.value;
  if (n === r && !t) return;
  const a = new Date(Date.now() - 864e5).toDateString();
  let o = { count: 1, lastCheckin: r };
  n === r && t
    ? (o = { count: e, lastCheckin: n })
    : n === a && (o = { count: e + 1, lastCheckin: r });
  try {
    await E.meta.put({ key: 'streak', value: o });
  } catch (s) {
    console.error('Falha ao atualizar o streak:', s);
  }
}
function Hr(t) {
  let r = 0,
    e = Dr,
    n = 0;
  for (; t >= n + e; ) ((n += e), r++, (e = Math.floor(e * Fr)));
  const a = t - n,
    o = (a / e) * 100;
  return {
    nivel: r,
    progresso: o,
    xpAtualNesteNivel: a,
    xpParaProximoNivel: e,
  };
}
var Yr = F(
    '<div class="item flex justify-between items-center p-3 bg-background rounded-md border border-border"><span class="text-text"> <span class="text-sm text-text-secondary ml-2"> </span></span> <!></div>',
  ),
  Lr = F(
    '<p class="empty-message text-center text-text-secondary p-4">Nenhum item cadastrado para esta área.</p>',
  ),
  zr = F(
    '<h3 class="text-xl font-semibold text-center text-text mb-4"> </h3> <form class="flex gap-2 mb-4"><input type="text" placeholder="Nome do novo item (ex: Estudar Svelte 5)" class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"/> <!></form> <div class="item-list flex flex-col gap-3"><!></div>',
    1,
  );
function qr(t, r) {
  be(r, !0);
  let e = U(''),
    n = U(me([]));
  je(() => {
    if (!r.area) {
      M(n, [], !0);
      return;
    }
    const l = K(() =>
      E.itens.where('areaId').equals(r.area.id).toArray(),
    ).subscribe((f) => {
      M(n, f, !0);
    });
    return () => l.unsubscribe();
  });
  async function a(s) {
    s.preventDefault();
    const l = x(e).trim();
    if (!(!l || !E))
      try {
        (await E.itens.add({
          nome: l,
          areaId: r.area.id,
          xp: 10,
          tipo: 'task',
        }),
          M(e, ''));
      } catch (f) {
        console.error('Falha ao adicionar item:', f);
      }
  }
  async function o(s) {
    if (E)
      try {
        await E.transaction('rw', E.itens, E.meta, async () => {
          (await Vr(s.xp), await qe(), await E.itens.delete(s.id));
        });
      } catch (l) {
        console.error('Falha ao completar item:', l);
      }
  }
  (gr(t, {
    children: (s, l) => {
      var f = zr(),
        p = q(f),
        b = w(p, !0);
      S(p);
      var g = P(p, 2),
        u = w(g);
      Xe(u);
      var v = P(u, 2);
      (le(v, {
        type: 'submit',
        variant: 'primary',
        children: (m, d) => {
          se();
          var h = ae('Adicionar Item');
          T(m, h);
        },
        $$slots: { default: !0 },
      }),
        S(g));
      var c = P(g, 2),
        i = w(c);
      {
        var y = (m) => {
            var d = Ie(),
              h = q(d);
            (De(
              h,
              17,
              () => x(n),
              (_) => _.id,
              (_, A) => {
                var j = Yr(),
                  I = w(j),
                  O = w(I),
                  $ = P(O),
                  R = w($);
                (S($), S(I));
                var V = P(I, 2);
                (le(V, {
                  onclick: () => o(x(A)),
                  variant: 'success',
                  class: 'py-1 px-3 text-sm',
                  children: (W, ge) => {
                    se();
                    var G = ae('Completar');
                    T(W, G);
                  },
                  $$slots: { default: !0 },
                }),
                  S(j),
                  ie(() => {
                    (D(O, `${x(A).nome ?? ''} `),
                      D(R, `(+${x(A).xp ?? ''} XP)`));
                  }),
                  T(_, j));
              },
            ),
              T(m, d));
          },
          k = (m) => {
            var d = Lr();
            T(m, d);
          };
        Re(i, (m) => {
          x(n).length > 0 ? m(y) : m(k, !1);
        });
      }
      (S(c),
        ie(() => D(b, r.area.nome)),
        $e('submit', g, a),
        Be(
          u,
          () => x(e),
          (m) => M(e, m),
        ),
        T(s, f));
    },
    $$slots: { default: !0 },
  }),
    ye());
}
var Kr = F(
    '<p class="empty-message text-center text-text-secondary p-6">Nenhuma área de foco cadastrada. Crie uma acima para começar!</p>',
  ),
  Qr = F(
    '<div class="area-manager"><form class="add-form flex gap-2 mb-6 p-4 bg-card border border-border rounded-lg shadow"><input type="text" placeholder="Nome da nova área (ex: SvelteKit, Finanças)" class="flex-grow bg-background border border-border text-text rounded-md p-2 focus:ring-2 focus:ring-primary focus:outline-none"/> <!></form> <div class="area-list flex flex-col gap-6"><!></div></div>',
  );
function Wr(t, r) {
  be(r, !0);
  let e = U(''),
    n = U(me([]));
  je(() => {
    const c = K(() => E.areas.toArray()).subscribe((i) => {
      M(n, i, !0);
    });
    return () => c.unsubscribe();
  });
  async function a(v) {
    v.preventDefault();
    const c = x(e).trim();
    if (!(!c || !E))
      try {
        (await E.areas.add({ nome: c }), M(e, ''));
      } catch (i) {
        console.error('Falha ao adicionar área:', i);
      }
  }
  var o = Qr(),
    s = w(o),
    l = w(s);
  Xe(l);
  var f = P(l, 2);
  (le(f, {
    type: 'submit',
    variant: 'primary',
    children: (v, c) => {
      se();
      var i = ae('Adicionar Área');
      T(v, i);
    },
    $$slots: { default: !0 },
  }),
    S(s));
  var p = P(s, 2),
    b = w(p);
  {
    var g = (v) => {
        var c = Ie(),
          i = q(c);
        (De(
          i,
          17,
          () => x(n),
          (y) => y.id,
          (y, k) => {
            qr(y, {
              get area() {
                return x(k);
              },
            });
          },
        ),
          T(v, c));
      },
      u = (v) => {
        var c = Kr();
        T(v, c);
      };
    Re(b, (v) => {
      x(n).length > 0 ? v(g) : v(u, !1);
    });
  }
  (S(p),
    S(o),
    $e('submit', s, a),
    Be(
      l,
      () => x(e),
      (v) => M(e, v),
    ),
    T(t, o),
    ye());
}
var Gr = F(
  '<div class="stats-manager bg-card border border-border rounded-lg p-4 md:p-6 shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4"><div class="stat-item flex flex-col items-center min-w-[80px]"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1">NÍVEL</span> <span class="value text-3xl font-bold text-primary"> </span></div> <div class="xp-bar-container w-full flex-grow flex flex-col items-center"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1"> </span> <div class="xp-bar w-full h-3 bg-background border border-border rounded-full overflow-hidden mb-1"><div class="xp-progress h-full bg-success transition-all duration-300 ease-out"></div></div> <span class="progress-label text-xs text-text-secondary font-medium"> </span></div> <div class="stat-item flex flex-col items-center min-w-[80px]"><span class="label text-xs font-semibold text-text-secondary uppercase mb-1">STREAK</span> <span class="value text-3xl font-bold text-danger"> </span></div></div>',
);
function Zr(t, r) {
  be(r, !0);
  let e = U(0),
    n = U(me({ count: 0 }));
  Sr(() => {
    const d = Br().subscribe((_) => {
        M(e, _, !0);
      }),
      h = Ur().subscribe((_) => {
        M(n, _, !0);
      });
    return () => {
      (d.unsubscribe(), h.unsubscribe());
    };
  });
  let a = xr(() => Hr(x(e)));
  var o = Gr(),
    s = w(o),
    l = P(w(s), 2),
    f = w(l, !0);
  (S(l), S(s));
  var p = P(s, 2),
    b = w(p),
    g = w(b);
  S(b);
  var u = P(b, 2),
    v = w(u);
  S(u);
  var c = P(u, 2),
    i = w(c);
  (S(c), S(p));
  var y = P(p, 2),
    k = P(w(y), 2),
    m = w(k);
  (S(k),
    S(y),
    S(o),
    ie(() => {
      (D(f, x(a).nivel),
        D(g, `XP TOTAL: ${x(e) ?? ''}`),
        wr(v, `width: ${x(a).progresso ?? ''}%;`),
        D(
          i,
          `${x(a).xpAtualNesteNivel ?? ''} / ${x(a).xpParaProximoNivel ?? ''} XP`,
        ),
        D(m, `🔥 ${x(n).count ?? ''}`));
    }),
    T(t, o),
    ye());
}
var Jr = F('<!> <!>', 1);
function it(t) {
  var r = Jr(),
    e = q(r);
  Zr(e, {});
  var n = P(e, 2);
  (Wr(n, {}), T(t, r));
}
export { it as component };
