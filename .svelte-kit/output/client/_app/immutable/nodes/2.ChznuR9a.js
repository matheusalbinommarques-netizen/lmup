import { f as O, a as k, s as N, d as Ee } from '../chunks/C1kyYzkI.js';
import {
  o as oe,
  aJ as Le,
  al as Ve,
  e as Be,
  h as Re,
  i as K,
  aK as De,
  p as be,
  t as J,
  a as he,
  aa as g,
  ak as A,
  c as l,
  s as v,
  r as i,
  a4 as ke,
  F as u,
  Z as se,
  a9 as Oe,
  u as Pe,
  f as Ye,
} from '../chunks/BOOFhtRP.js';
import { o as Ke } from '../chunks/DXa1qAe1.js';
import { t as Ge, r as ae, s as H } from '../chunks/5aiaHk4R.js';
import { i as q } from '../chunks/Dt4_cxAB.js';
import { e as Ie, B as He } from '../chunks/B0aBMHRA.js';
import { l as Ae, d as U } from '../chunks/BwBkY9_K.js';
function $e(t, r, e, n) {
  var o = t.__style;
  if (oe || o !== r) {
    var s = Ge(r);
    ((!oe || s !== t.getAttribute('style')) &&
      (s == null ? t.removeAttribute('style') : (t.style.cssText = s)),
      (t.__style = r));
  }
  return n;
}
function ie(t, r, e = r) {
  var n = new WeakSet();
  (Le(t, 'input', async (o) => {
    var s = o ? t.defaultValue : t.value;
    if (
      ((s = ee(t) ? te(s) : s),
      e(s),
      K !== null && n.add(K),
      await Ve(),
      s !== (s = r()))
    ) {
      var a = t.selectionStart,
        c = t.selectionEnd,
        d = t.value.length;
      if (((t.value = s ?? ''), c !== null)) {
        var h = t.value.length;
        a === c && c === d && h > d
          ? ((t.selectionStart = h), (t.selectionEnd = h))
          : ((t.selectionStart = a), (t.selectionEnd = Math.min(c, h)));
      }
    }
  }),
    ((oe && t.defaultValue !== t.value) || (Be(r) == null && t.value)) &&
      (e(ee(t) ? te(t.value) : t.value), K !== null && n.add(K)),
    Re(() => {
      var o = r();
      if (t === document.activeElement) {
        var s = De ?? K;
        if (n.has(s)) return;
      }
      (ee(t) && o === te(t.value)) ||
        (t.type === 'date' && !o && !t.value) ||
        (o !== t.value && (t.value = o ?? ''));
    }));
}
function ee(t) {
  var r = t.type;
  return r === 'number' || r === 'range';
}
function te(t) {
  return t === '' ? null : +t;
}
var le = function (t, r) {
  return (
    (le =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, n) {
          e.__proto__ = n;
        }) ||
      function (e, n) {
        for (var o in n)
          Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
      }),
    le(t, r)
  );
};
function G(t, r) {
  if (typeof r != 'function' && r !== null)
    throw new TypeError(
      'Class extends value ' + String(r) + ' is not a constructor or null',
    );
  le(t, r);
  function e() {
    this.constructor = t;
  }
  t.prototype =
    r === null ? Object.create(r) : ((e.prototype = r.prototype), new e());
}
function ce(t) {
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
function ue(t, r) {
  var e = typeof Symbol == 'function' && t[Symbol.iterator];
  if (!e) return t;
  var n = e.call(t),
    o,
    s = [],
    a;
  try {
    for (; (r === void 0 || r-- > 0) && !(o = n.next()).done; ) s.push(o.value);
  } catch (c) {
    a = { error: c };
  } finally {
    try {
      o && !o.done && (e = n.return) && e.call(n);
    } finally {
      if (a) throw a.error;
    }
  }
  return s;
}
function de(t, r, e) {
  if (e || arguments.length === 2)
    for (var n = 0, o = r.length, s; n < o; n++)
      (s || !(n in r)) &&
        (s || (s = Array.prototype.slice.call(r, 0, n)), (s[n] = r[n]));
  return t.concat(s || Array.prototype.slice.call(r));
}
function T(t) {
  return typeof t == 'function';
}
function je(t) {
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
var re = je(function (t) {
  return function (e) {
    (t(this),
      (this.message = e
        ? e.length +
          ` errors occurred during unsubscription:
` +
          e.map(function (n, o) {
            return o + 1 + ') ' + n.toString();
          }).join(`
  `)
        : ''),
      (this.name = 'UnsubscriptionError'),
      (this.errors = e));
  };
});
function ve(t, r) {
  if (t) {
    var e = t.indexOf(r);
    0 <= e && t.splice(e, 1);
  }
}
var Z = (function () {
    function t(r) {
      ((this.initialTeardown = r),
        (this.closed = !1),
        (this._parentage = null),
        (this._finalizers = null));
    }
    return (
      (t.prototype.unsubscribe = function () {
        var r, e, n, o, s;
        if (!this.closed) {
          this.closed = !0;
          var a = this._parentage;
          if (a)
            if (((this._parentage = null), Array.isArray(a)))
              try {
                for (var c = ce(a), d = c.next(); !d.done; d = c.next()) {
                  var h = d.value;
                  h.remove(this);
                }
              } catch (f) {
                r = { error: f };
              } finally {
                try {
                  d && !d.done && (e = c.return) && e.call(c);
                } finally {
                  if (r) throw r.error;
                }
              }
            else a.remove(this);
          var S = this.initialTeardown;
          if (T(S))
            try {
              S();
            } catch (f) {
              s = f instanceof re ? f.errors : [f];
            }
          var w = this._finalizers;
          if (w) {
            this._finalizers = null;
            try {
              for (var y = ce(w), x = y.next(); !x.done; x = y.next()) {
                var b = x.value;
                try {
                  xe(b);
                } catch (f) {
                  ((s = s ?? []),
                    f instanceof re
                      ? (s = de(de([], ue(s)), ue(f.errors)))
                      : s.push(f));
                }
              }
            } catch (f) {
              n = { error: f };
            } finally {
              try {
                x && !x.done && (o = y.return) && o.call(y);
              } finally {
                if (n) throw n.error;
              }
            }
          }
          if (s) throw new re(s);
        }
      }),
      (t.prototype.add = function (r) {
        var e;
        if (r && r !== this)
          if (this.closed) xe(r);
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
        e === r ? (this._parentage = null) : Array.isArray(e) && ve(e, r);
      }),
      (t.prototype.remove = function (r) {
        var e = this._finalizers;
        (e && ve(e, r), r instanceof t && r._removeParent(this));
      }),
      (t.EMPTY = (function () {
        var r = new t();
        return ((r.closed = !0), r);
      })()),
      t
    );
  })(),
  Ce = Z.EMPTY;
function Te(t) {
  return (
    t instanceof Z ||
    (t && 'closed' in t && T(t.remove) && T(t.add) && T(t.unsubscribe))
  );
}
function xe(t) {
  T(t) ? t() : t.unsubscribe();
}
var qe = { Promise: void 0 },
  ze = {
    setTimeout: function (t, r) {
      for (var e = [], n = 2; n < arguments.length; n++)
        e[n - 2] = arguments[n];
      return setTimeout.apply(void 0, de([t, r], ue(e)));
    },
    clearTimeout: function (t) {
      return clearTimeout(t);
    },
    delegate: void 0,
  };
function Je(t) {
  ze.setTimeout(function () {
    throw t;
  });
}
function _e() {}
function z(t) {
  t();
}
var Xe = (function (t) {
    G(r, t);
    function r(e) {
      var n = t.call(this) || this;
      return (
        (n.isStopped = !1),
        e ? ((n.destination = e), Te(e) && e.add(n)) : (n.destination = Ze),
        n
      );
    }
    return (
      (r.create = function (e, n, o) {
        return new fe(e, n, o);
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
  })(Z),
  Qe = (function () {
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
            $(n);
          }
      }),
      (t.prototype.error = function (r) {
        var e = this.partialObserver;
        if (e.error)
          try {
            e.error(r);
          } catch (n) {
            $(n);
          }
        else $(r);
      }),
      (t.prototype.complete = function () {
        var r = this.partialObserver;
        if (r.complete)
          try {
            r.complete();
          } catch (e) {
            $(e);
          }
      }),
      t
    );
  })(),
  fe = (function (t) {
    G(r, t);
    function r(e, n, o) {
      var s = t.call(this) || this,
        a;
      return (
        T(e) || !e
          ? (a = {
              next: e ?? void 0,
              error: n ?? void 0,
              complete: o ?? void 0,
            })
          : (a = e),
        (s.destination = new Qe(a)),
        s
      );
    }
    return r;
  })(Xe);
function $(t) {
  Je(t);
}
function We(t) {
  throw t;
}
var Ze = { closed: !0, next: _e, error: We, complete: _e },
  et = (function () {
    return (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
  })();
function tt(t) {
  return t;
}
function rt(t) {
  return t.length === 0
    ? tt
    : t.length === 1
      ? t[0]
      : function (e) {
          return t.reduce(function (n, o) {
            return o(n);
          }, e);
        };
}
var ge = (function () {
  function t(r) {
    r && (this._subscribe = r);
  }
  return (
    (t.prototype.lift = function (r) {
      var e = new t();
      return ((e.source = this), (e.operator = r), e);
    }),
    (t.prototype.subscribe = function (r, e, n) {
      var o = this,
        s = ot(r) ? r : new fe(r, e, n);
      return (
        z(function () {
          var a = o,
            c = a.operator,
            d = a.source;
          s.add(c ? c.call(s, d) : d ? o._subscribe(s) : o._trySubscribe(s));
        }),
        s
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
        (e = we(e)),
        new e(function (o, s) {
          var a = new fe({
            next: function (c) {
              try {
                r(c);
              } catch (d) {
                (s(d), a.unsubscribe());
              }
            },
            error: s,
            complete: o,
          });
          n.subscribe(a);
        })
      );
    }),
    (t.prototype._subscribe = function (r) {
      var e;
      return (e = this.source) === null || e === void 0
        ? void 0
        : e.subscribe(r);
    }),
    (t.prototype[et] = function () {
      return this;
    }),
    (t.prototype.pipe = function () {
      for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
      return rt(r)(this);
    }),
    (t.prototype.toPromise = function (r) {
      var e = this;
      return (
        (r = we(r)),
        new r(function (n, o) {
          var s;
          e.subscribe(
            function (a) {
              return (s = a);
            },
            function (a) {
              return o(a);
            },
            function () {
              return n(s);
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
function we(t) {
  var r;
  return (r = t ?? qe.Promise) !== null && r !== void 0 ? r : Promise;
}
function nt(t) {
  return t && T(t.next) && T(t.error) && T(t.complete);
}
function ot(t) {
  return (t && t instanceof Xe) || (nt(t) && Te(t));
}
var st = je(function (t) {
    return function () {
      (t(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed'));
    };
  }),
  Me = (function (t) {
    G(r, t);
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
        var n = new Se(this, this);
        return ((n.operator = e), n);
      }),
      (r.prototype._throwIfClosed = function () {
        if (this.closed) throw new st();
      }),
      (r.prototype.next = function (e) {
        var n = this;
        z(function () {
          var o, s;
          if ((n._throwIfClosed(), !n.isStopped)) {
            n.currentObservers ||
              (n.currentObservers = Array.from(n.observers));
            try {
              for (
                var a = ce(n.currentObservers), c = a.next();
                !c.done;
                c = a.next()
              ) {
                var d = c.value;
                d.next(e);
              }
            } catch (h) {
              o = { error: h };
            } finally {
              try {
                c && !c.done && (s = a.return) && s.call(a);
              } finally {
                if (o) throw o.error;
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
            for (var o = n.observers; o.length; ) o.shift().error(e);
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
          o = this,
          s = o.hasError,
          a = o.isStopped,
          c = o.observers;
        return s || a
          ? Ce
          : ((this.currentObservers = null),
            c.push(e),
            new Z(function () {
              ((n.currentObservers = null), ve(c, e));
            }));
      }),
      (r.prototype._checkFinalizedStatuses = function (e) {
        var n = this,
          o = n.hasError,
          s = n.thrownError,
          a = n.isStopped;
        o ? e.error(s) : a && e.complete();
      }),
      (r.prototype.asObservable = function () {
        var e = new ge();
        return ((e.source = this), e);
      }),
      (r.create = function (e, n) {
        return new Se(e, n);
      }),
      r
    );
  })(ge),
  Se = (function (t) {
    G(r, t);
    function r(e, n) {
      var o = t.call(this) || this;
      return ((o.destination = e), (o.source = n), o);
    }
    return (
      (r.prototype.next = function (e) {
        var n, o;
        (o =
          (n = this.destination) === null || n === void 0 ? void 0 : n.next) ===
          null ||
          o === void 0 ||
          o.call(n, e);
      }),
      (r.prototype.error = function (e) {
        var n, o;
        (o =
          (n = this.destination) === null || n === void 0
            ? void 0
            : n.error) === null ||
          o === void 0 ||
          o.call(n, e);
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
        var n, o;
        return (o =
          (n = this.source) === null || n === void 0
            ? void 0
            : n.subscribe(e)) !== null && o !== void 0
          ? o
          : Ce;
      }),
      r
    );
  })(Me),
  Fe = (function (t) {
    G(r, t);
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
          o = e.thrownError,
          s = e._value;
        if (n) throw o;
        return (this._throwIfClosed(), s);
      }),
      (r.prototype.next = function (e) {
        t.prototype.next.call(this, (this._value = e));
      }),
      r
    );
  })(Me);
const D = {
    totalXp: 'lmup:totalXp',
    streak: 'lmup:streak',
    lastCheckin: 'lmup:lastCheckin',
  },
  Q = new Fe(0),
  W = new Fe({ count: 0, lastCheckin: null });
function ne(t) {
  if (typeof window > 'u') return null;
  try {
    return window.localStorage.getItem(t);
  } catch {
    return null;
  }
}
function pe(t, r) {
  if (!(typeof window > 'u'))
    try {
      window.localStorage.setItem(t, r);
    } catch {}
}
function at() {
  const t = Number(ne(D.totalXp) ?? '0'),
    r = Number(ne(D.streak) ?? '0'),
    e = ne(D.lastCheckin);
  (Q.next(Number.isFinite(t) ? t : 0),
    W.next({ count: Number.isFinite(r) ? r : 0, lastCheckin: e }));
}
typeof window < 'u' && at();
async function it(t) {
  if (typeof window > 'u') return;
  const e = Q.getValue() + t;
  (Q.next(e), pe(D.totalXp, String(e)));
}
async function lt() {
  if (typeof window > 'u') return;
  const t = new Date().toISOString().slice(0, 10),
    r = W.getValue(),
    e = r.lastCheckin;
  let n = r.count;
  if (!e) n = 1;
  else {
    const o = new Date(e),
      s = new Date(t).getTime() - o.getTime(),
      a = Math.floor(s / 864e5);
    if (a === 0) return;
    a === 1 ? (n += 1) : (n = 1);
  }
  (W.next({ count: n, lastCheckin: t }),
    pe(D.streak, String(n)),
    pe(D.lastCheckin, t));
}
function ct() {
  return Q.asObservable();
}
function ut() {
  return W.asObservable();
}
function dt(t) {
  let r = 1,
    e = t,
    n = 100;
  for (; e >= n; ) ((e -= n), (r += 1), (n = 100 + (r - 1) * 50));
  return { level: r, currentLevelXp: e, xpToNextLevel: n };
}
var vt =
  O(`<section class="w-full mb-8"><div class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl"><div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]"></div></div> <div class="relative flex flex-col items-center gap-3 text-center"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70">Reino do aprendizado</p> <h1 class="text-3xl font-extrabold text-primary drop-shadow">Level Me Up!</h1> <p class="max-w-md text-xs text-text-secondary">Complete missões todos os dias para evoluir de nível e manter sua
          chama de foco acesa.</p></div> <div class="relative mt-6 flex flex-col items-center gap-4"><div class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-950/90 shadow-[0_0_40px_rgba(251,191,36,0.7)]"><span class="text-3xl">🛡️</span></div> <div class="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"><span class="text-[0.65rem] uppercase tracking-widest text-text-secondary">Nível</span> <span class="text-2xl font-bold text-white"> </span></div> <div class="text-xs text-text-secondary">XP total: <span class="font-semibold text-primary"> </span></div></div> <div class="relative mt-6 w-full space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-text-secondary"><span>Progresso até o próximo nível</span> <span> </span></div> <div class="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"></div></div></div> <div class="relative mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 text-xs text-text-secondary md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-2"><span class="text-xl">🔥</span> <div><div class="font-semibold text-text">Streak de dias</div> <div class="text-[0.7rem]">Faça pelo menos uma missão por dia para manter a chama acesa.</div></div></div> <div class="flex items-baseline justify-end gap-1"><span class="text-3xl font-bold text-primary"> </span> <span class="text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">dias</span></div></div></div></div></section>`);
function ft(t, r) {
  be(r, !0);
  let e = A(0),
    n = A(1),
    o = A(0),
    s = A(100),
    a = A(0);
  const c = se(() => (u(s) > 0 ? Math.min(100, (u(o) / u(s)) * 100) : 0));
  Ke(() => {
    const F = ct().subscribe((B) => {
        g(e, B, !0);
        const R = dt(B);
        (g(n, R.level, !0),
          g(o, R.currentLevelXp, !0),
          g(s, R.xpToNextLevel, !0));
      }),
      Y = ut().subscribe(({ count: B }) => {
        g(a, B, !0);
      });
    return () => {
      (F.unsubscribe(), Y.unsubscribe());
    };
  });
  var d = vt(),
    h = l(d),
    S = l(h),
    w = v(l(S), 4),
    y = v(l(w), 2),
    x = v(l(y), 2),
    b = l(x, !0);
  (i(x), i(y));
  var f = v(y, 2),
    P = v(l(f)),
    I = l(P, !0);
  (i(P), i(f), i(w));
  var E = v(w, 2),
    j = l(E),
    X = v(l(j), 2),
    L = l(X);
  (i(X), i(j));
  var V = v(j, 2),
    p = l(V);
  (i(V), i(E));
  var m = v(E, 2),
    M = v(l(m), 2),
    C = l(M),
    _ = l(C, !0);
  (i(C),
    ke(2),
    i(M),
    i(m),
    i(S),
    i(h),
    i(d),
    J(() => {
      (N(b, u(n)),
        N(I, u(e)),
        N(L, `${u(o) ?? ''} / ${u(s) ?? ''} XP`),
        $e(p, `width: ${u(c)}%;`),
        N(_, u(a)));
    }),
    k(t, d),
    he());
}
var pt = O(
    '<li class="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm shadow-sm"><div class="flex items-center gap-2"><span class="text-text"> </span> <span class="ml-1 text-xs text-text-secondary"> </span></div> <div class="flex gap-2 text-xs"><button class="font-semibold text-emerald-400 hover:text-emerald-300">concluir</button> <button class="font-semibold text-red-400 hover:text-red-300">remover</button></div></li>',
  ),
  bt = O('<ul class="space-y-2"></ul>'),
  ht = O(
    '<p class="text-xs text-text-secondary">Nenhum item cadastrado para esta área.</p>',
  ),
  mt = O(
    '<section class="space-y-4"><div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3 md:flex-row md:items-end md:gap-4"><div class="flex-1 space-y-1"><label class="text-xs font-medium text-text">Nova missão</label> <input class="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome do novo item (ex: Estudar Svelte 5)"/></div> <div class="flex items-end gap-2"><div class="space-y-1"><label class="text-xs font-medium text-text">XP</label> <input class="w-20 rounded-lg border border-border bg-card/70 px-2 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/70" type="number" min="1"/></div> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duração-150 ease-in-out hover:bg-primary/90">Adicionar</button></div></div> <!></section>',
  );
function yt(t, r) {
  be(r, !0);
  let e = A(Oe([])),
    n = A(''),
    o = A(10);
  {
    const p = Ae(() =>
      U.items.where('areaId').equals(r.areaId).toArray(),
    ).subscribe((m) => {
      g(e, m, !0);
    });
    Pe(() => () => p.unsubscribe());
  }
  async function s() {
    const p = u(n).trim(),
      m = Number(u(o)) || 0;
    !p ||
      m <= 0 ||
      (await U.items.add({ areaId: r.areaId, nome: p, xp: m, done: !1 }),
      g(n, ''),
      g(o, 10));
  }
  async function a(p) {
    (await it(p.xp), lt(), await U.items.delete(p.id));
  }
  async function c(p) {
    await U.items.delete(p.id);
  }
  const d = se(() => `nova-missao-${r.areaId}`),
    h = se(() => `xp-missao-${r.areaId}`);
  var S = mt(),
    w = l(S),
    y = l(w),
    x = l(y),
    b = v(x, 2);
  (ae(b), i(y));
  var f = v(y, 2),
    P = l(f),
    I = l(P),
    E = v(I, 2);
  (ae(E), i(P));
  var j = v(P, 2);
  ((j.__click = s), i(f), i(w));
  var X = v(w, 2);
  {
    var L = (p) => {
        var m = bt();
        (Ie(
          m,
          21,
          () => u(e),
          (M) => M.id,
          (M, C) => {
            var _ = pt(),
              F = l(_),
              Y = l(F),
              B = l(Y, !0);
            i(Y);
            var R = v(Y, 2),
              Ne = l(R);
            (i(R), i(F));
            var me = v(F, 2),
              ye = l(me);
            ye.__click = () => a(u(C));
            var Ue = v(ye, 2);
            ((Ue.__click = () => c(u(C))),
              i(me),
              i(_),
              J(() => {
                (N(B, u(C).nome), N(Ne, `(+${u(C).xp ?? ''} XP)`));
              }),
              k(M, _));
          },
        ),
          i(m),
          k(p, m));
      },
      V = (p) => {
        var m = ht();
        k(p, m);
      };
    q(X, (p) => {
      u(e).length > 0 ? p(L) : p(V, !1);
    });
  }
  (i(S),
    J(() => {
      (H(x, 'for', u(d)),
        H(b, 'id', u(d)),
        H(I, 'for', u(h)),
        H(E, 'id', u(h)));
    }),
    ie(
      b,
      () => u(n),
      (p) => g(n, p),
    ),
    ie(
      E,
      () => u(o),
      (p) => g(o, p),
    ),
    k(t, S),
    he());
}
Ee(['click']);
var xt = O(
    '<p class="text-sm text-text-secondary">Nenhuma área cadastrada ainda. Comece criando uma área acima, como <span class="font-semibold text-primary">"Programação"</span> ou <span class="font-semibold text-primary">"Hábitos"</span>.</p>',
  ),
  _t = O(
    '<button class="text-xs font-medium text-red-400 underline-offset-2 hover:underline">remover área</button>',
  ),
  gt = O(
    '<article class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-md"><div class="mb-3 flex items-center justify-between gap-3"><div><h3 class="text-lg font-semibold text-text"> </h3> <p class="text-xs text-text-secondary">Adicione missões rápidas abaixo para ganhar XP.</p></div> <!></div> <!></article>',
  ),
  wt = O('<div class="space-y-4"></div>'),
  St =
    O(`<section class="w-full space-y-6"><header class="space-y-1"><h2 class="text-xl font-semibold text-primary">Missões ativas</h2> <p class="text-sm text-text-secondary">Crie áreas de foco (como "Programação" ou "Finanças") e depois adicione
      missões dentro de cada uma.</p></header> <div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-md md:flex-row md:items-center md:gap-4"><div class="flex-1 space-y-1"><p class="text-sm font-medium text-text">Nova área de foco</p> <input class="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"/></div> <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90 md:mt-6">Adicionar área</button></div> <!></section>`);
function Et(t, r) {
  be(r, !0);
  let e = A(Oe([])),
    n = A('');
  {
    const b = Ae(() => U.areas.toArray()).subscribe((f) => {
      g(e, f, !0);
    });
    Pe(() => () => b.unsubscribe());
  }
  async function o() {
    const b = u(n).trim();
    b && (await U.areas.add({ nome: b }), g(n, ''));
  }
  async function s(b) {
    await U.areas.delete(b);
  }
  var a = St(),
    c = v(l(a), 2),
    d = l(c),
    h = v(l(d), 2);
  (ae(h), i(d));
  var S = v(d, 2);
  ((S.__click = o), i(c));
  var w = v(c, 2);
  {
    var y = (b) => {
        var f = xt();
        k(b, f);
      },
      x = (b) => {
        var f = wt();
        (Ie(
          f,
          21,
          () => u(e),
          (P) => P.id,
          (P, I) => {
            var E = gt(),
              j = l(E),
              X = l(j),
              L = l(X),
              V = l(L, !0);
            (i(L), ke(2), i(X));
            var p = v(X, 2);
            {
              var m = (_) => {
                var F = _t();
                ((F.__click = () => s(u(I).id)), k(_, F));
              };
              q(p, (_) => {
                u(I).id && _(m);
              });
            }
            i(j);
            var M = v(j, 2);
            {
              var C = (_) => {
                yt(_, {
                  get areaId() {
                    return u(I).id;
                  },
                });
              };
              q(M, (_) => {
                u(I).id && _(C);
              });
            }
            (i(E), J(() => N(V, u(I).nome)), k(P, E));
          },
        ),
          i(f),
          k(b, f));
      };
    q(w, (b) => {
      u(e).length === 0 ? b(y) : b(x, !1);
    });
  }
  (i(a),
    ie(
      h,
      () => u(n),
      (b) => g(n, b),
    ),
    k(t, a),
    he());
}
Ee(['click']);
var kt = O(
  '<section class="section pt-10 pb-6"><!></section> <section class="section space-y-6 pb-28"><div class="parchment p-5 sm:p-6"><h2 class="h-title text-lg sm:text-xl mb-1">Missões ativas</h2> <p class="text-sm text-zinc-700 mb-4">Crie áreas de foco (ex: “Programação”, “Finanças”) e adicione missões rápidas.</p> <div class="mt-2"><!></div></div></section> <!>',
  1,
);
function Xt(t) {
  var r = kt(),
    e = Ye(r),
    n = l(e);
  (ft(n, {}), i(e));
  var o = v(e, 2),
    s = l(o),
    a = v(l(s), 4),
    c = l(a);
  (Et(c, {}), i(a), i(s), i(o));
  var d = v(o, 2);
  (He(d, {}), k(t, r));
}
export { Xt as component };
