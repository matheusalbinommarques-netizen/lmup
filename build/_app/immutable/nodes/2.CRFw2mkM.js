import {
  f as U,
  a as S,
  s as I,
  d as Qe,
  t as ve,
  c as ke,
  b as nt,
} from '../chunks/SxYe2BIq.js';
import {
  h as Oe,
  aL as lt,
  am as dt,
  X as ct,
  W as ut,
  w as pe,
  aM as vt,
  p as de,
  Z as pt,
  t as H,
  a as ce,
  _ as B,
  $ as V,
  c as n,
  s as u,
  r as o,
  a0 as Le,
  m as i,
  a6 as Y,
  ab as De,
  al as Ze,
  aN as Be,
  f as Pe,
} from '../chunks/BPaWsL2e.js';
import { t as ft, r as je, a as oe, s as ne } from '../chunks/CtSESMLm.js';
import { i as K } from '../chunks/xkCiEyuq.js';
import { e as fe } from '../chunks/C1WXZ3Vt.js';
import { l as Ve, d as Z } from '../chunks/BwBkY9_K.js';
function he(t, r, e, a) {
  var s = t.__style;
  if (Oe || s !== r) {
    var l = ft(r);
    ((!Oe || l !== t.getAttribute('style')) &&
      (l == null ? t.removeAttribute('style') : (t.style.cssText = l)),
      (t.__style = r));
  }
  return a;
}
function Ce(t, r, e = r) {
  var a = new WeakSet();
  (lt(t, 'input', async (s) => {
    var l = s ? t.defaultValue : t.value;
    if (
      ((l = Xe(t) ? Ee(l) : l),
      e(l),
      pe !== null && a.add(pe),
      await dt(),
      l !== (l = r()))
    ) {
      var d = t.selectionStart,
        f = t.selectionEnd,
        m = t.value.length;
      if (((t.value = l ?? ''), f !== null)) {
        var A = t.value.length;
        d === f && f === m && A > m
          ? ((t.selectionStart = A), (t.selectionEnd = A))
          : ((t.selectionStart = d), (t.selectionEnd = Math.min(f, A)));
      }
    }
  }),
    ((Oe && t.defaultValue !== t.value) || (ct(r) == null && t.value)) &&
      (e(Xe(t) ? Ee(t.value) : t.value), pe !== null && a.add(pe)),
    ut(() => {
      var s = r();
      if (t === document.activeElement) {
        var l = vt ?? pe;
        if (a.has(l)) return;
      }
      (Xe(t) && s === Ee(t.value)) ||
        (t.type === 'date' && !s && !t.value) ||
        (s !== t.value && (t.value = s ?? ''));
    }));
}
function Xe(t) {
  var r = t.type;
  return r === 'number' || r === 'range';
}
function Ee(t) {
  return t === '' ? null : +t;
}
var Me = function (t, r) {
  return (
    (Me =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, a) {
          e.__proto__ = a;
        }) ||
      function (e, a) {
        for (var s in a)
          Object.prototype.hasOwnProperty.call(a, s) && (e[s] = a[s]);
      }),
    Me(t, r)
  );
};
function me(t, r) {
  if (typeof r != 'function' && r !== null)
    throw new TypeError(
      'Class extends value ' + String(r) + ' is not a constructor or null',
    );
  Me(t, r);
  function e() {
    this.constructor = t;
  }
  t.prototype =
    r === null ? Object.create(r) : ((e.prototype = r.prototype), new e());
}
function $e(t) {
  var r = typeof Symbol == 'function' && Symbol.iterator,
    e = r && t[r],
    a = 0;
  if (e) return e.call(t);
  if (t && typeof t.length == 'number')
    return {
      next: function () {
        return (
          t && a >= t.length && (t = void 0),
          { value: t && t[a++], done: !t }
        );
      },
    };
  throw new TypeError(
    r ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
  );
}
function Te(t, r) {
  var e = typeof Symbol == 'function' && t[Symbol.iterator];
  if (!e) return t;
  var a = e.call(t),
    s,
    l = [],
    d;
  try {
    for (; (r === void 0 || r-- > 0) && !(s = a.next()).done; ) l.push(s.value);
  } catch (f) {
    d = { error: f };
  } finally {
    try {
      s && !s.done && (e = a.return) && e.call(a);
    } finally {
      if (d) throw d.error;
    }
  }
  return l;
}
function Ne(t, r, e) {
  if (e || arguments.length === 2)
    for (var a = 0, s = r.length, l; a < s; a++)
      (l || !(a in r)) &&
        (l || (l = Array.prototype.slice.call(r, 0, a)), (l[a] = r[a]));
  return t.concat(l || Array.prototype.slice.call(r));
}
function J(t) {
  return typeof t == 'function';
}
function Je(t) {
  var r = function (a) {
      (Error.call(a), (a.stack = new Error().stack));
    },
    e = t(r);
  return (
    (e.prototype = Object.create(Error.prototype)),
    (e.prototype.constructor = e),
    e
  );
}
var Ae = Je(function (t) {
  return function (e) {
    (t(this),
      (this.message = e
        ? e.length +
          ` errors occurred during unsubscription:
` +
          e.map(function (a, s) {
            return s + 1 + ') ' + a.toString();
          }).join(`
  `)
        : ''),
      (this.name = 'UnsubscriptionError'),
      (this.errors = e));
  };
});
function Ue(t, r) {
  if (t) {
    var e = t.indexOf(r);
    0 <= e && t.splice(e, 1);
  }
}
var ge = (function () {
    function t(r) {
      ((this.initialTeardown = r),
        (this.closed = !1),
        (this._parentage = null),
        (this._finalizers = null));
    }
    return (
      (t.prototype.unsubscribe = function () {
        var r, e, a, s, l;
        if (!this.closed) {
          this.closed = !0;
          var d = this._parentage;
          if (d)
            if (((this._parentage = null), Array.isArray(d)))
              try {
                for (var f = $e(d), m = f.next(); !m.done; m = f.next()) {
                  var A = m.value;
                  A.remove(this);
                }
              } catch (y) {
                r = { error: y };
              } finally {
                try {
                  m && !m.done && (e = f.return) && e.call(f);
                } finally {
                  if (r) throw r.error;
                }
              }
            else d.remove(this);
          var M = this.initialTeardown;
          if (J(M))
            try {
              M();
            } catch (y) {
              l = y instanceof Ae ? y.errors : [y];
            }
          var $ = this._finalizers;
          if ($) {
            this._finalizers = null;
            try {
              for (var O = $e($), T = O.next(); !T.done; T = O.next()) {
                var g = T.value;
                try {
                  Ge(g);
                } catch (y) {
                  ((l = l ?? []),
                    y instanceof Ae
                      ? (l = Ne(Ne([], Te(l)), Te(y.errors)))
                      : l.push(y));
                }
              }
            } catch (y) {
              a = { error: y };
            } finally {
              try {
                T && !T.done && (s = O.return) && s.call(O);
              } finally {
                if (a) throw a.error;
              }
            }
          }
          if (l) throw new Ae(l);
        }
      }),
      (t.prototype.add = function (r) {
        var e;
        if (r && r !== this)
          if (this.closed) Ge(r);
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
        e === r ? (this._parentage = null) : Array.isArray(e) && Ue(e, r);
      }),
      (t.prototype.remove = function (r) {
        var e = this._finalizers;
        (e && Ue(e, r), r instanceof t && r._removeParent(this));
      }),
      (t.EMPTY = (function () {
        var r = new t();
        return ((r.closed = !0), r);
      })()),
      t
    );
  })(),
  et = ge.EMPTY;
function tt(t) {
  return (
    t instanceof ge ||
    (t && 'closed' in t && J(t.remove) && J(t.add) && J(t.unsubscribe))
  );
}
function Ge(t) {
  J(t) ? t() : t.unsubscribe();
}
var mt = { Promise: void 0 },
  bt = {
    setTimeout: function (t, r) {
      for (var e = [], a = 2; a < arguments.length; a++)
        e[a - 2] = arguments[a];
      return setTimeout.apply(void 0, Ne([t, r], Te(e)));
    },
    clearTimeout: function (t) {
      return clearTimeout(t);
    },
    delegate: void 0,
  };
function xt(t) {
  bt.setTimeout(function () {
    throw t;
  });
}
function Ye() {}
function xe(t) {
  t();
}
var rt = (function (t) {
    me(r, t);
    function r(e) {
      var a = t.call(this) || this;
      return (
        (a.isStopped = !1),
        e ? ((a.destination = e), tt(e) && e.add(a)) : (a.destination = _t),
        a
      );
    }
    return (
      (r.create = function (e, a, s) {
        return new Fe(e, a, s);
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
  })(ge),
  ht = (function () {
    function t(r) {
      this.partialObserver = r;
    }
    return (
      (t.prototype.next = function (r) {
        var e = this.partialObserver;
        if (e.next)
          try {
            e.next(r);
          } catch (a) {
            be(a);
          }
      }),
      (t.prototype.error = function (r) {
        var e = this.partialObserver;
        if (e.error)
          try {
            e.error(r);
          } catch (a) {
            be(a);
          }
        else be(r);
      }),
      (t.prototype.complete = function () {
        var r = this.partialObserver;
        if (r.complete)
          try {
            r.complete();
          } catch (e) {
            be(e);
          }
      }),
      t
    );
  })(),
  Fe = (function (t) {
    me(r, t);
    function r(e, a, s) {
      var l = t.call(this) || this,
        d;
      return (
        J(e) || !e
          ? (d = {
              next: e ?? void 0,
              error: a ?? void 0,
              complete: s ?? void 0,
            })
          : (d = e),
        (l.destination = new ht(d)),
        l
      );
    }
    return r;
  })(rt);
function be(t) {
  xt(t);
}
function yt(t) {
  throw t;
}
var _t = { closed: !0, next: Ye, error: yt, complete: Ye },
  gt = (function () {
    return (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
  })();
function wt(t) {
  return t;
}
function St(t) {
  return t.length === 0
    ? wt
    : t.length === 1
      ? t[0]
      : function (e) {
          return t.reduce(function (a, s) {
            return s(a);
          }, e);
        };
}
var He = (function () {
  function t(r) {
    r && (this._subscribe = r);
  }
  return (
    (t.prototype.lift = function (r) {
      var e = new t();
      return ((e.source = this), (e.operator = r), e);
    }),
    (t.prototype.subscribe = function (r, e, a) {
      var s = this,
        l = Pt(r) ? r : new Fe(r, e, a);
      return (
        xe(function () {
          var d = s,
            f = d.operator,
            m = d.source;
          l.add(f ? f.call(l, m) : m ? s._subscribe(l) : s._trySubscribe(l));
        }),
        l
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
      var a = this;
      return (
        (e = We(e)),
        new e(function (s, l) {
          var d = new Fe({
            next: function (f) {
              try {
                r(f);
              } catch (m) {
                (l(m), d.unsubscribe());
              }
            },
            error: l,
            complete: s,
          });
          a.subscribe(d);
        })
      );
    }),
    (t.prototype._subscribe = function (r) {
      var e;
      return (e = this.source) === null || e === void 0
        ? void 0
        : e.subscribe(r);
    }),
    (t.prototype[gt] = function () {
      return this;
    }),
    (t.prototype.pipe = function () {
      for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
      return St(r)(this);
    }),
    (t.prototype.toPromise = function (r) {
      var e = this;
      return (
        (r = We(r)),
        new r(function (a, s) {
          var l;
          e.subscribe(
            function (d) {
              return (l = d);
            },
            function (d) {
              return s(d);
            },
            function () {
              return a(l);
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
function We(t) {
  var r;
  return (r = t ?? mt.Promise) !== null && r !== void 0 ? r : Promise;
}
function kt(t) {
  return t && J(t.next) && J(t.error) && J(t.complete);
}
function Pt(t) {
  return (t && t instanceof rt) || (kt(t) && tt(t));
}
var Xt = Je(function (t) {
    return function () {
      (t(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed'));
    };
  }),
  at = (function (t) {
    me(r, t);
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
        var a = new Ke(this, this);
        return ((a.operator = e), a);
      }),
      (r.prototype._throwIfClosed = function () {
        if (this.closed) throw new Xt();
      }),
      (r.prototype.next = function (e) {
        var a = this;
        xe(function () {
          var s, l;
          if ((a._throwIfClosed(), !a.isStopped)) {
            a.currentObservers ||
              (a.currentObservers = Array.from(a.observers));
            try {
              for (
                var d = $e(a.currentObservers), f = d.next();
                !f.done;
                f = d.next()
              ) {
                var m = f.value;
                m.next(e);
              }
            } catch (A) {
              s = { error: A };
            } finally {
              try {
                f && !f.done && (l = d.return) && l.call(d);
              } finally {
                if (s) throw s.error;
              }
            }
          }
        });
      }),
      (r.prototype.error = function (e) {
        var a = this;
        xe(function () {
          if ((a._throwIfClosed(), !a.isStopped)) {
            ((a.hasError = a.isStopped = !0), (a.thrownError = e));
            for (var s = a.observers; s.length; ) s.shift().error(e);
          }
        });
      }),
      (r.prototype.complete = function () {
        var e = this;
        xe(function () {
          if ((e._throwIfClosed(), !e.isStopped)) {
            e.isStopped = !0;
            for (var a = e.observers; a.length; ) a.shift().complete();
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
        var a = this,
          s = this,
          l = s.hasError,
          d = s.isStopped,
          f = s.observers;
        return l || d
          ? et
          : ((this.currentObservers = null),
            f.push(e),
            new ge(function () {
              ((a.currentObservers = null), Ue(f, e));
            }));
      }),
      (r.prototype._checkFinalizedStatuses = function (e) {
        var a = this,
          s = a.hasError,
          l = a.thrownError,
          d = a.isStopped;
        s ? e.error(l) : d && e.complete();
      }),
      (r.prototype.asObservable = function () {
        var e = new He();
        return ((e.source = this), e);
      }),
      (r.create = function (e, a) {
        return new Ke(e, a);
      }),
      r
    );
  })(He),
  Ke = (function (t) {
    me(r, t);
    function r(e, a) {
      var s = t.call(this) || this;
      return ((s.destination = e), (s.source = a), s);
    }
    return (
      (r.prototype.next = function (e) {
        var a, s;
        (s =
          (a = this.destination) === null || a === void 0 ? void 0 : a.next) ===
          null ||
          s === void 0 ||
          s.call(a, e);
      }),
      (r.prototype.error = function (e) {
        var a, s;
        (s =
          (a = this.destination) === null || a === void 0
            ? void 0
            : a.error) === null ||
          s === void 0 ||
          s.call(a, e);
      }),
      (r.prototype.complete = function () {
        var e, a;
        (a =
          (e = this.destination) === null || e === void 0
            ? void 0
            : e.complete) === null ||
          a === void 0 ||
          a.call(e);
      }),
      (r.prototype._subscribe = function (e) {
        var a, s;
        return (s =
          (a = this.source) === null || a === void 0
            ? void 0
            : a.subscribe(e)) !== null && s !== void 0
          ? s
          : et;
      }),
      r
    );
  })(at),
  st = (function (t) {
    me(r, t);
    function r(e) {
      var a = t.call(this) || this;
      return ((a._value = e), a);
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
        var a = t.prototype._subscribe.call(this, e);
        return (!a.closed && e.next(this._value), a);
      }),
      (r.prototype.getValue = function () {
        var e = this,
          a = e.hasError,
          s = e.thrownError,
          l = e._value;
        if (a) throw s;
        return (this._throwIfClosed(), l);
      }),
      (r.prototype.next = function (e) {
        t.prototype.next.call(this, (this._value = e));
      }),
      r
    );
  })(at);
const le = {
    totalXp: 'lmup:totalXp',
    streak: 'lmup:streak',
    lastCheckin: 'lmup:lastCheckin',
  },
  ye = new st(0),
  _e = new st({ count: 0, lastCheckin: null });
function Ie(t) {
  if (typeof window > 'u') return null;
  try {
    return window.localStorage.getItem(t);
  } catch {
    return null;
  }
}
function Re(t, r) {
  if (!(typeof window > 'u'))
    try {
      window.localStorage.setItem(t, r);
    } catch {}
}
function Et() {
  const t = Number(Ie(le.totalXp) ?? '0'),
    r = Number(Ie(le.streak) ?? '0'),
    e = Ie(le.lastCheckin);
  (ye.next(Number.isFinite(t) ? t : 0),
    _e.next({ count: Number.isFinite(r) ? r : 0, lastCheckin: e }));
}
typeof window < 'u' && Et();
async function At(t) {
  if (typeof window > 'u') return;
  const e = ye.getValue() + t;
  (ye.next(e), Re(le.totalXp, String(e)));
}
async function It() {
  if (typeof window > 'u') return;
  const t = new Date().toISOString().slice(0, 10),
    r = _e.getValue(),
    e = r.lastCheckin;
  let a = r.count;
  if (!e) a = 1;
  else {
    const s = new Date(e),
      l = new Date(t).getTime() - s.getTime(),
      d = Math.floor(l / 864e5);
    if (d === 0) return;
    d === 1 ? (a += 1) : (a = 1);
  }
  (_e.next({ count: a, lastCheckin: t }),
    Re(le.streak, String(a)),
    Re(le.lastCheckin, t));
}
function qe() {
  return ye.asObservable();
}
function ze() {
  return _e.asObservable();
}
function it(t) {
  let r = 1,
    e = t,
    a = 100;
  for (; e >= a; ) ((e -= a), (r += 1), (a = 100 + (r - 1) * 50));
  return { level: r, currentLevelXp: e, xpToNextLevel: a };
}
var Ot =
  U(`<section class="w-full mb-8"><div class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl"><div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]"></div></div> <div class="relative flex flex-col items-center gap-3 text-center"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70">Reino do aprendizado</p> <h1 class="text-3xl font-extrabold text-primary drop-shadow">Level Me Up!</h1> <p class="max-w-md text-xs text-text-secondary">Complete missões todos os dias para evoluir de nível e manter sua
          chama de foco acesa.</p></div> <div class="relative mt-6 flex flex-col items-center gap-4"><div class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-950/90 shadow-[0_0_40px_rgba(251,191,36,0.7)]"><span class="text-3xl">🛡️</span></div> <div class="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"><span class="text-[0.65rem] uppercase tracking-widest text-text-secondary">Nível</span> <span class="text-2xl font-bold text-white"> </span></div> <div class="text-xs text-text-secondary">XP total: <span class="font-semibold text-primary"> </span></div></div> <div class="relative mt-6 w-full space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-text-secondary"><span>Progresso até o próximo nível</span> <span> </span></div> <div class="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"></div></div></div> <div class="relative mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 text-xs text-text-secondary md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-2"><span class="text-xl">🔥</span> <div><div class="font-semibold text-text">Streak de dias</div> <div class="text-[0.7rem]">Faça pelo menos uma missão por dia para manter a chama acesa.</div></div></div> <div class="flex items-baseline justify-end gap-1"><span class="text-3xl font-bold text-primary"> </span> <span class="text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">dias</span></div></div></div></div></section>`);
function jt(t, r) {
  de(r, !0);
  let e = V(0),
    a = V(1),
    s = V(0),
    l = V(100),
    d = V(0);
  const f = Y(() => (i(l) > 0 ? Math.min(100, (i(s) / i(l)) * 100) : 0));
  pt(() => {
    const _ = qe().subscribe((N) => {
        B(e, N, !0);
        const R = it(N);
        (B(a, R.level, !0),
          B(s, R.currentLevelXp, !0),
          B(l, R.xpToNextLevel, !0));
      }),
      q = ze().subscribe(({ count: N }) => {
        B(d, N, !0);
      });
    return () => {
      (_.unsubscribe(), q.unsubscribe());
    };
  });
  var m = Ot(),
    A = n(m),
    M = n(A),
    $ = u(n(M), 4),
    O = u(n($), 2),
    T = u(n(O), 2),
    g = n(T, !0);
  (o(T), o(O));
  var y = u(O, 2),
    F = u(n(y)),
    b = n(F, !0);
  (o(F), o(y), o($));
  var c = u($, 2),
    p = n(c),
    x = u(n(p), 2),
    h = n(x);
  (o(x), o(p));
  var k = u(p, 2),
    X = n(k);
  (o(k), o(c));
  var E = u(c, 2),
    j = u(n(E), 2),
    C = n(j),
    v = n(C, !0);
  (o(C),
    Le(2),
    o(j),
    o(E),
    o(M),
    o(A),
    o(m),
    H(() => {
      (I(g, i(a)),
        I(b, i(e)),
        I(h, `${i(s) ?? ''} / ${i(l) ?? ''} XP`),
        he(X, `width: ${i(f)}%;`),
        I(v, i(d)));
    }),
    S(t, m),
    ce());
}
var Ct = U(
    '<li><div class="mission-card-inner flex items-start justify-between gap-3"><div class="space-y-1"><div class="flex items-center gap-2"><span> </span> <span class="text-[0.7rem] text-slate-700/80"> </span></div> <p class="text-sm font-semibold text-slate-900"> </p></div> <div class="flex flex-col gap-1 text-xs"><button class="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-emerald-50 shadow hover:bg-emerald-500">Concluir</button> <button class="rounded-full bg-red-600/90 px-3 py-1 font-semibold text-red-50 shadow hover:bg-red-500">Remover</button></div></div></li>',
  ),
  Mt = U('<ul class="space-y-3"></ul>'),
  $t = U(
    '<p class="text-xs text-text-secondary">Nenhum item cadastrado para esta área.</p>',
  ),
  Tt = U(
    '<section class="space-y-4"><div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3 md:flex-row md:items-end md:gap-4"><div class="flex-1 space-y-1"><label class="text-xs font-medium text-text">Nova missão</label> <input class="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome do novo item (ex: Estudar Svelte 5)"/></div> <div class="flex items-end gap-2"><div class="space-y-1"><label class="text-xs font-medium text-text">XP</label> <input class="w-20 rounded-lg border border-border bg-card/70 px-2 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/70" type="number" min="1"/></div> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90">Adicionar</button></div></div> <!></section>',
  );
function Nt(t, r) {
  de(r, !0);
  let e = V(De([])),
    a = V(''),
    s = V(10);
  {
    const v = Ve(() =>
      Z.items.where('areaId').equals(r.areaId).toArray(),
    ).subscribe((_) => {
      B(e, _, !0);
    });
    Ze(() => () => v.unsubscribe());
  }
  async function l() {
    const v = i(a).trim(),
      _ = Number(i(s)) || 0;
    !v ||
      _ <= 0 ||
      (await Z.items.add({ areaId: r.areaId, nome: v, xp: _, done: !1 }),
      B(a, ''),
      B(s, 10));
  }
  async function d(v) {
    (await At(v.xp), It(), await Z.items.delete(v.id));
  }
  async function f(v) {
    await Z.items.delete(v.id);
  }
  const m = Y(() => `nova-missao-${r.areaId}`),
    A = Y(() => `xp-missao-${r.areaId}`);
  function M(v) {
    return v >= 100 ? 'legendary' : v >= 40 ? 'epic' : 'common';
  }
  function $(v) {
    const _ = M(v);
    return _ === 'legendary'
      ? 'mission-card--legendary'
      : _ === 'epic'
        ? 'mission-card--epic'
        : 'mission-card--common';
  }
  function O(v) {
    const _ = M(v);
    return _ === 'legendary' ? 'Lendária' : _ === 'epic' ? 'Épica' : 'Comum';
  }
  function T(v) {
    const _ = M(v);
    return _ === 'legendary'
      ? 'border-violet-300/70 bg-violet-900/90 text-violet-100'
      : _ === 'epic'
        ? 'border-amber-300/70 bg-amber-900/90 text-amber-100'
        : 'border-slate-300/70 bg-slate-900/90 text-slate-100';
  }
  var g = Tt(),
    y = n(g),
    F = n(y),
    b = n(F),
    c = u(b, 2);
  (je(c), o(F));
  var p = u(F, 2),
    x = n(p),
    h = n(x),
    k = u(h, 2);
  (je(k), o(x));
  var X = u(x, 2);
  ((X.__click = l), o(p), o(y));
  var E = u(y, 2);
  {
    var j = (v) => {
        var _ = Mt();
        (fe(
          _,
          21,
          () => i(e),
          (q) => q.id,
          (q, N) => {
            var R = Ct(),
              ee = n(R),
              L = n(ee),
              z = n(L),
              G = n(z),
              te = n(G, !0);
            o(G);
            var re = u(G, 2),
              W = n(re);
            (o(re), o(z));
            var Q = u(z, 2),
              ae = n(Q, !0);
            (o(Q), o(L));
            var se = u(L, 2),
              w = n(se);
            w.__click = () => d(i(N));
            var P = u(w, 2);
            ((P.__click = () => f(i(N))),
              o(se),
              o(ee),
              o(R),
              H(
                (D, ue, we) => {
                  (ne(R, 1, D),
                    ne(G, 1, ue),
                    I(te, we),
                    I(W, `+${i(N).xp ?? ''} XP`),
                    I(ae, i(N).nome));
                },
                [
                  () =>
                    `mission-card-frame ${$(i(N).xp)} shadow-xl shadow-black/60`,
                  () =>
                    `inline-flex items-center rounded-full border px-2 py-[1px] text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${T(i(N).xp)}`,
                  () => O(i(N).xp),
                ],
              ),
              S(q, R));
          },
        ),
          o(_),
          S(v, _));
      },
      C = (v) => {
        var _ = $t();
        S(v, _);
      };
    K(E, (v) => {
      i(e).length > 0 ? v(j) : v(C, !1);
    });
  }
  (o(g),
    H(() => {
      (oe(b, 'for', i(m)),
        oe(c, 'id', i(m)),
        oe(h, 'for', i(A)),
        oe(k, 'id', i(A)));
    }),
    Ce(
      c,
      () => i(a),
      (v) => B(a, v),
    ),
    Ce(
      k,
      () => i(s),
      (v) => B(s, v),
    ),
    S(t, g),
    ce());
}
Qe(['click']);
var Ut = U(
    '<p class="text-sm text-text-secondary">Nenhuma área cadastrada ainda. Comece criando uma área acima, como <span class="font-semibold text-primary">"Programação"</span> ou <span class="font-semibold text-primary">"Hábitos"</span>.</p>',
  ),
  Ft = U(
    '<button class="text-xs font-medium text-red-400 underline-offset-2 hover:underline">remover área</button>',
  ),
  Rt = U(
    '<article class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-md"><div class="mb-3 flex items-center justify-between gap-3"><div><h3 class="text-lg font-semibold text-text"> </h3> <p class="text-xs text-text-secondary">Adicione missões rápidas abaixo para ganhar XP.</p></div> <!></div> <!></article>',
  ),
  Lt = U('<div class="space-y-4"></div>'),
  Dt =
    U(`<section class="w-full space-y-6"><header class="space-y-1"><h2 class="text-xl font-semibold text-primary">Missões ativas</h2> <p class="text-sm text-text-secondary">Crie áreas de foco (como "Programação" ou "Finanças") e depois adicione
      missões dentro de cada uma.</p></header> <div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-md md:flex-row md:items-center md:gap-4"><div class="flex-1 space-y-1"><p class="text-sm font-medium text-text">Nova área de foco</p> <input class="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"/></div> <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90 md:mt-6">Adicionar área</button></div> <!></section>`);
function Bt(t, r) {
  de(r, !0);
  let e = V(De([])),
    a = V('');
  {
    const g = Ve(() => Z.areas.toArray()).subscribe((y) => {
      B(e, y, !0);
    });
    Ze(() => () => g.unsubscribe());
  }
  async function s() {
    const g = i(a).trim();
    g && (await Z.areas.add({ nome: g }), B(a, ''));
  }
  async function l(g) {
    await Z.areas.delete(g);
  }
  var d = Dt(),
    f = u(n(d), 2),
    m = n(f),
    A = u(n(m), 2);
  (je(A), o(m));
  var M = u(m, 2);
  ((M.__click = s), o(f));
  var $ = u(f, 2);
  {
    var O = (g) => {
        var y = Ut();
        S(g, y);
      },
      T = (g) => {
        var y = Lt();
        (fe(
          y,
          21,
          () => i(e),
          (F) => F.id,
          (F, b) => {
            var c = Rt(),
              p = n(c),
              x = n(p),
              h = n(x),
              k = n(h, !0);
            (o(h), Le(2), o(x));
            var X = u(x, 2);
            {
              var E = (v) => {
                var _ = Ft();
                ((_.__click = () => l(i(b).id)), S(v, _));
              };
              K(X, (v) => {
                i(b).id && v(E);
              });
            }
            o(p);
            var j = u(p, 2);
            {
              var C = (v) => {
                Nt(v, {
                  get areaId() {
                    return i(b).id;
                  },
                });
              };
              K(j, (v) => {
                i(b).id && v(C);
              });
            }
            (o(c), H(() => I(k, i(b).nome)), S(F, c));
          },
        ),
          o(y),
          S(g, y));
      };
    K($, (g) => {
      i(e).length === 0 ? g(O) : g(T, !1);
    });
  }
  (o(d),
    Ce(
      A,
      () => i(a),
      (g) => B(a, g),
    ),
    S(t, d),
    ce());
}
Qe(['click']);
var Vt = U(
    '<article><div><!></div> <div class="flex-1"><div class="flex items-center gap-2"><h3> </h3> <span> </span></div> <p class="mt-1 text-[0.7rem] text-slate-300/85"> </p></div></article>',
  ),
  qt = U(
    '<section class="w-full"><div class="mx-auto max-w-4xl rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(56,189,248,0.15)] md:px-8 md:py-7"><div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.65rem] uppercase tracking-[0.25em] text-cyan-400/80">Avatar &amp; conquistas</p> <h2 class="text-xl font-bold text-white md:text-2xl">Conquistas do reino</h2> <p class="text-xs text-slate-300/80">Desbloqueie medalhas ao acumular XP e manter sua chama de foco acesa.</p></div> <div class="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2"><div class="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/70 bg-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.5)]"><span class="text-xl">🛡️</span></div> <div class="text-xs"><div class="text-slate-300/90">Nível do avatar</div> <div class="text-sm font-semibold text-cyan-300"> </div></div></div></div> <div class="grid gap-3 md:grid-cols-2"></div></div></section>',
  );
function zt(t, r) {
  de(r, !0);
  const e = [
    {
      id: 'primeira-centelha',
      title: 'Primeira centelha',
      rarity: 'COMUM',
      description: 'Ganhe pelo menos 10 XP.',
      isUnlocked: ({ xp: c }) => c >= 10,
    },
    {
      id: 'aprendiz-dedicado',
      title: 'Aprendiz dedicado',
      rarity: 'RARO',
      description: 'Alcance 100 XP totais.',
      isUnlocked: ({ xp: c }) => c >= 100,
    },
    {
      id: 'chama-constante',
      title: 'Chama constante',
      rarity: 'RARO',
      description: 'Mantenha um streak de 3 dias.',
      isUnlocked: ({ streak: c }) => c >= 3,
    },
    {
      id: 'guardiao-habito',
      title: 'Guardião do hábito',
      rarity: 'ÉPICO',
      description: 'Mantenha um streak de 7 dias.',
      isUnlocked: ({ streak: c }) => c >= 7,
    },
    {
      id: 'sabio-reino',
      title: 'Sábio do reino',
      rarity: 'LENDÁRIO',
      description: 'Acumule 500 XP totais.',
      isUnlocked: ({ xp: c }) => c >= 500,
    },
  ];
  let a = V(0),
    s = V(0);
  const l = Y(() => it(i(a))),
    d = Y(() => i(l).level),
    f = Y(() =>
      e.map((c) => ({
        ...c,
        unlocked: c.isUnlocked({ xp: i(a), streak: i(s) }),
      })),
    );
  let m = [];
  if (typeof window < 'u') {
    const c = qe().subscribe((x) => {
        B(a, x, !0);
      }),
      p = ze().subscribe(({ count: x }) => {
        B(s, x, !0);
      });
    m = [() => c.unsubscribe(), () => p.unsubscribe()];
  }
  Be(() => {
    for (const c of m) c();
  });
  function A(c) {
    switch (c) {
      case 'COMUM':
        return 'bg-slate-700/80 text-slate-100';
      case 'RARO':
        return 'bg-indigo-600/80 text-indigo-50';
      case 'ÉPICO':
        return 'bg-fuchsia-600/80 text-fuchsia-50';
      case 'LENDÁRIO':
        return 'bg-amber-500/90 text-amber-900';
      default:
        return 'bg-slate-700/80 text-slate-100';
    }
  }
  var M = qt(),
    $ = n(M),
    O = n($),
    T = u(n(O), 2),
    g = u(n(T), 2),
    y = u(n(g), 2),
    F = n(y);
  (o(y), o(g), o(T), o(O));
  var b = u(O, 2);
  (fe(
    b,
    21,
    () => i(f),
    (c) => c.id,
    (c, p) => {
      var x = Vt(),
        h = n(x),
        k = n(h);
      {
        var X = (L) => {
            var z = ve('✨');
            S(L, z);
          },
          E = (L) => {
            var z = ke(),
              G = Pe(z);
            {
              var te = (W) => {
                  var Q = ve('📘');
                  S(W, Q);
                },
                re = (W) => {
                  var Q = ke(),
                    ae = Pe(Q);
                  {
                    var se = (P) => {
                        var D = ve('🔥');
                        S(P, D);
                      },
                      w = (P) => {
                        var D = ke(),
                          ue = Pe(D);
                        {
                          var we = (ie) => {
                              var Se = ve('🛡️');
                              S(ie, Se);
                            },
                            ot = (ie) => {
                              var Se = ve('👑');
                              S(ie, Se);
                            };
                          K(
                            ue,
                            (ie) => {
                              i(p).id === 'guardiao-habito'
                                ? ie(we)
                                : ie(ot, !1);
                            },
                            !0,
                          );
                        }
                        S(P, D);
                      };
                    K(
                      ae,
                      (P) => {
                        i(p).id === 'chama-constante' ? P(se) : P(w, !1);
                      },
                      !0,
                    );
                  }
                  S(W, Q);
                };
              K(
                G,
                (W) => {
                  i(p).id === 'aprendiz-dedicado' ? W(te) : W(re, !1);
                },
                !0,
              );
            }
            S(L, z);
          };
        K(k, (L) => {
          i(p).id === 'primeira-centelha' ? L(X) : L(E, !1);
        });
      }
      o(h);
      var j = u(h, 2),
        C = n(j),
        v = n(C),
        _ = n(v, !0);
      o(v);
      var q = u(v, 2),
        N = n(q, !0);
      (o(q), o(C));
      var R = u(C, 2),
        ee = n(R);
      (o(R),
        o(j),
        o(x),
        H(
          (L) => {
            (ne(
              x,
              1,
              `flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs transition-all duration-300 ${i(p).unlocked ? 'border-cyan-400/70 bg-slate-900/80 shadow-[0_0_25px_rgba(34,211,238,0.35)]' : 'border-slate-800/80 bg-slate-950/80 opacity-70'}`,
            ),
              ne(
                h,
                1,
                `flex h-9 w-9 items-center justify-center rounded-full border text-base ${i(p).unlocked ? 'border-cyan-400/90 text-cyan-300 bg-slate-950' : 'border-slate-700 text-slate-400 bg-slate-950'}`,
              ),
              ne(
                v,
                1,
                `text-[0.78rem] font-semibold ${i(p).unlocked ? 'text-slate-50' : 'text-slate-300/90'}`,
              ),
              I(_, i(p).title),
              ne(q, 1, L),
              I(N, i(p).rarity),
              I(
                ee,
                `${i(p).unlocked ? 'Desbloqueada • ' : 'Bloqueada • '}${i(p).description ?? ''}`,
              ));
          },
          [
            () =>
              `rounded-full px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.15em] ${A(i(p).rarity)}`,
          ],
        ),
        S(c, x));
    },
  ),
    o(b),
    o($),
    o(M),
    H(() => I(F, `${i(d) ?? ''} • ${i(a) ?? ''} XP`)),
    S(t, M),
    ce());
}
var Gt = U('<span> </span>'),
  Yt = U('<span> </span>'),
  Ht =
    U(`<section class="w-full mb-8"><div class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.6)]"><div class="relative px-6 py-6 md:px-8 md:py-7"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="absolute inset-[10px] rounded-3xl border border-emerald-400/40"></div></div> <div class="relative space-y-5"><header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p class="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-emerald-300/80">Eco-gamificação</p> <h2 class="text-xl md:text-2xl font-extrabold text-slate-50">Jardim do foco</h2></div> <p class="max-w-sm text-[0.7rem] text-emerald-100/85">Cada missão concluída alimenta o seu jardim. Mantenha o streak para
            que sua floresta nunca murche.</p></header> <div class="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"><div class="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/40 bg-slate-950/80 px-5 py-4"><div class="relative flex items-center justify-center"><div class="h-24 w-24 rounded-full bg-gradient-to-b from-emerald-400/40 via-emerald-500/10 to-emerald-900/60 shadow-[0_0_35px_rgba(16,185,129,0.8)] flex items-center justify-center"><span class="text-4xl"> </span></div></div> <div class="text-center space-y-1"><p class="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-emerald-200"> </p> <p class="text-[0.75rem] text-emerald-100/90"> </p></div> <div class="w-full space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-emerald-100/90"><span>Progresso até o próximo estágio</span> <!></div> <div class="h-2.5 w-full overflow-hidden rounded-full border border-emerald-900 bg-slate-950"><div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-300 transition-[width] duration-500 ease-out"></div></div></div></div> <div class="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-slate-950/80 px-5 py-4"><div class="space-y-1"><p class="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">Saúde da floresta</p> <p class="text-[0.75rem] text-emerald-100/90">Baseada no seu streak de dias com missões concluídas.</p></div> <div class="space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-emerald-100/90"><span>Streak atual</span> <span> </span></div> <div class="h-2.5 w-full overflow-hidden rounded-full border border-emerald-900 bg-slate-950"><div class="h-full bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 transition-[width] duration-500 ease-out"></div></div> <p class="text-[0.7rem] text-emerald-100/85"> </p></div> <div class="mt-1 space-y-1"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">Marcos ecológicos</p> <ul class="space-y-1.5 text-[0.7rem] text-emerald-100/85"><li>• 10 XP: o primeiro broto aparece.</li> <li>• 50 XP: o arbusto de foco ganha forma.</li> <li>• 150 XP: nasce a árvore do hábito.</li> <li>• 400 XP: você protege uma floresta inteira.</li></ul></div></div></div></div></div></div></section>`);
function Wt(t, r) {
  de(r, !0);
  const e = [
    {
      id: 'solo',
      name: 'Solo adormecido',
      description: 'Comece suas missões para acordar a primeira semente.',
      icon: '🌑',
      minXp: 0,
    },
    {
      id: 'broto',
      name: 'Primeiro broto',
      description: 'As primeiras missões já fizeram uma semente acordar.',
      icon: '🌱',
      minXp: 10,
    },
    {
      id: 'arbusto',
      name: 'Arbusto de foco',
      description: 'Seu hábito está criando raízes fortes.',
      icon: '🌿',
      minXp: 50,
    },
    {
      id: 'arvore',
      name: 'Árvore do hábito',
      description: 'Uma árvore inteira cresceu com sua consistência.',
      icon: '🌳',
      minXp: 150,
    },
    {
      id: 'floresta',
      name: 'Guardião da floresta',
      description: 'Sua rotina alimentou uma floresta inteira de foco.',
      icon: '🌲',
      minXp: 400,
    },
  ];
  let a = V(0),
    s = V(0),
    l = [];
  if (typeof window < 'u') {
    const w = qe().subscribe((D) => {
        B(a, D, !0);
      }),
      P = ze().subscribe(({ count: D }) => {
        B(s, D, !0);
      });
    l = [() => w.unsubscribe(), () => P.unsubscribe()];
  }
  Be(() => {
    for (const w of l) w();
  });
  const d = Y(() =>
      (() => {
        let w = e[0];
        for (const P of e) i(a) >= P.minXp && P.minXp >= w.minXp && (w = P);
        return w;
      })(),
    ),
    f = Y(() =>
      (() => {
        const w = e.findIndex((D) => D.id === i(d).id);
        return w < 0 || w === e.length - 1 ? null : e[w + 1];
      })(),
    ),
    m = Y(() =>
      (() => {
        if (!i(f)) return 100;
        const w = i(d).minXp,
          P = i(f).minXp,
          D = Math.max(1, P - w),
          ue = Math.min(Math.max(i(a), w), P);
        return Math.round(((ue - w) / D) * 100);
      })(),
    ),
    A = Y(() =>
      (() => {
        const w = Math.min(i(s), 7);
        return Math.round((w / 7) * 100);
      })(),
    ),
    M = Y(() =>
      i(s) === 0
        ? 'Solo frio — comece hoje mesmo.'
        : i(s) < 3
          ? 'A chama está acendendo, continue!'
          : i(s) < 7
            ? 'A floresta está ganhando vida.'
            : 'Floresta vibrante — seu hábito está fortíssimo!',
    );
  var $ = Ht(),
    O = n($),
    T = n(O),
    g = u(n(T), 2),
    y = u(n(g), 2),
    F = n(y),
    b = n(F),
    c = n(b),
    p = n(c),
    x = n(p, !0);
  (o(p), o(c), o(b));
  var h = u(b, 2),
    k = n(h),
    X = n(k, !0);
  o(k);
  var E = u(k, 2),
    j = n(E, !0);
  (o(E), o(h));
  var C = u(h, 2),
    v = n(C),
    _ = u(n(v), 2);
  {
    var q = (w) => {
        var P = Gt(),
          D = n(P);
        (o(P),
          H(() => I(D, `${i(a) ?? ''} / ${i(f).minXp ?? ''} XP`)),
          S(w, P));
      },
      N = (w) => {
        var P = Yt(),
          D = n(P);
        (o(P), H(() => I(D, `${i(a) ?? ''} XP — floresta máxima`)), S(w, P));
      };
    K(_, (w) => {
      i(f) ? w(q) : w(N, !1);
    });
  }
  o(v);
  var R = u(v, 2),
    ee = n(R);
  (o(R), o(C), o(F));
  var L = u(F, 2),
    z = u(n(L), 2),
    G = n(z),
    te = u(n(G), 2),
    re = n(te);
  (o(te), o(G));
  var W = u(G, 2),
    Q = n(W);
  o(W);
  var ae = u(W, 2),
    se = n(ae, !0);
  (o(ae),
    o(z),
    Le(2),
    o(L),
    o(y),
    o(g),
    o(T),
    o(O),
    o($),
    H(() => {
      (I(x, i(d).icon),
        I(X, i(d).name),
        I(j, i(d).description),
        he(ee, `width: ${i(m)}%;`),
        I(re, `${i(s) ?? ''} ${i(s) === 1 ? 'dia' : 'dias'}`),
        he(Q, `width: ${i(A)}%;`),
        I(se, i(M)));
    }),
    S(t, $),
    ce());
}
var Kt =
    U(`<div class="mt-2 rounded-2xl border border-dashed border-emerald-700/70 bg-slate-950/80 px-4 py-3 text-xs text-emerald-100/80">Nenhuma área de foco ainda. Crie áreas e missões para ver o mapa de XP
        do seu reino.</div>`),
  Qt = nt('<path fill-opacity="0.9"></path>'),
  Zt = U(
    '<div class="flex items-center gap-3 rounded-xl border border-emerald-900/80 bg-slate-950/90 px-3 py-2 text-xs text-emerald-50/90"><span class="h-3 w-3 rounded-full"></span> <div class="flex-1"><div class="flex items-center justify-between gap-2"><span class="text-[0.8rem] font-semibold"> </span> <span class="text-[0.7rem] text-emerald-300/90"> </span></div> <div class="text-[0.7rem] text-emerald-200/80"> </div></div></div>',
  ),
  Jt = U(
    '<div class="mt-2 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"><div class="flex items-center justify-center"><svg viewBox="0 0 120 120" class="h-52 w-52 md:h-60 md:w-60" aria-label="Distribuição de XP por área"><circle cx="60" cy="60" r="52" fill="#022c22" opacity="0.6"></circle><!><circle cx="60" cy="60" r="30" fill="#020617"></circle><text x="60" y="56" text-anchor="middle" class="fill-emerald-100" style="font-size: 10px; font-weight: 600;">XP nas áreas</text><text x="60" y="70" text-anchor="middle" class="fill-emerald-300" style="font-size: 11px; font-weight: 700;"> </text></svg></div> <div class="space-y-2"></div></div>',
  ),
  er =
    U(`<section class="w-full"><div class="mx-auto max-w-4xl rounded-3xl border border-emerald-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-6 shadow-[0_0_40px_rgba(16,185,129,0.25)] md:px-8 md:py-7"><div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p class="text-[0.65rem] uppercase tracking-[0.25em] text-emerald-400/80">Foco do herói</p> <h2 class="text-xl font-bold text-white md:text-2xl">XP por área de foco</h2> <p class="text-xs text-emerald-50/80">Veja onde está concentrado seu XP potencial nas missões que você
          criou.</p></div> <div class="text-right text-xs text-emerald-100/80"><div class="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-400/90">XP total nas áreas</div> <div class="text-base font-semibold text-emerald-200"> </div></div></div> <!></div></section>`);
function tr(t, r) {
  de(r, !0);
  let e = V(De([]));
  const a = Y(() => i(e).reduce((b, c) => b + c.xp, 0)),
    s = Y(() =>
      (() => {
        if (i(a) <= 0) return [];
        const b = [
          '#22c55e',
          '#0ea5e9',
          '#a855f7',
          '#f97316',
          '#eab308',
          '#22d3ee',
        ];
        let c = 0;
        const p = [];
        for (let x = 0; x < i(e).length; x += 1) {
          const h = i(e)[x];
          if (h.xp <= 0) continue;
          const k = h.xp / i(a),
            X = k * 360;
          (p.push({
            areaId: h.areaId,
            nome: h.nome,
            xp: h.xp,
            percent: Math.round(k * 100),
            startAngle: c,
            endAngle: c + X,
            color: b[x % b.length],
          }),
            (c += X));
        }
        return p;
      })(),
    );
  let l = null;
  if (typeof window < 'u') {
    const c = Ve(async () => {
      const [p, x] = await Promise.all([Z.areas.toArray(), Z.items.toArray()]),
        h = {};
      for (const X of x) {
        const E = Number(X.areaId),
          j = Number(X.xp) || 0;
        Number.isFinite(E) && (h[E] = (h[E] ?? 0) + j);
      }
      const k = p.map((X) => {
        const E = Number(X.id);
        return { areaId: E, nome: X.nome ?? 'Área sem nome', xp: h[E] ?? 0 };
      });
      return (k.sort((X, E) => E.xp - X.xp), k);
    }).subscribe({
      next(p) {
        B(e, p, !0);
      },
      error(p) {
        console.error('[XpByAreaPanel] erro no liveQuery:', p);
      },
    });
    l = () => c.unsubscribe();
  }
  Be(() => {
    l?.();
  });
  function d(b, c, p, x) {
    const h = ((x - 90) * Math.PI) / 180;
    return { x: b + p * Math.cos(h), y: c + p * Math.sin(h) };
  }
  function f(b, c, p, x, h) {
    const k = d(b, c, p, h),
      X = d(b, c, p, x),
      E = h - x <= 180 ? 0 : 1;
    return [
      `M ${b} ${c}`,
      `L ${k.x} ${k.y}`,
      `A ${p} ${p} 0 ${E} 0 ${X.x} ${X.y}`,
      'Z',
    ].join(' ');
  }
  var m = er(),
    A = n(m),
    M = n(A),
    $ = u(n(M), 2),
    O = u(n($), 2),
    T = n(O);
  (o(O), o($), o(M));
  var g = u(M, 2);
  {
    var y = (b) => {
        var c = Kt();
        S(b, c);
      },
      F = (b) => {
        var c = Jt(),
          p = n(c),
          x = n(p),
          h = u(n(x));
        fe(
          h,
          17,
          () => i(s),
          (j) => j.areaId,
          (j, C) => {
            var v = Qt();
            (H(
              (_) => {
                (oe(v, 'd', _), oe(v, 'fill', i(C).color));
              },
              [() => f(60, 60, 52, i(C).startAngle, i(C).endAngle)],
            ),
              S(j, v));
          },
        );
        var k = u(h, 3),
          X = n(k);
        (o(k), o(x), o(p));
        var E = u(p, 2);
        (fe(
          E,
          21,
          () => i(s),
          (j) => j.areaId,
          (j, C) => {
            var v = Zt(),
              _ = n(v),
              q = u(_, 2),
              N = n(q),
              R = n(N),
              ee = n(R, !0);
            o(R);
            var L = u(R, 2),
              z = n(L);
            (o(L), o(N));
            var G = u(N, 2),
              te = n(G);
            (o(G),
              o(q),
              o(v),
              H(() => {
                (he(_, `background-color: ${i(C).color};`),
                  I(ee, i(C).nome),
                  I(z, `${i(C).percent ?? ''}%`),
                  I(te, `${i(C).xp ?? ''} XP disponíveis`));
              }),
              S(j, v));
          },
        ),
          o(E),
          o(c),
          H(() => I(X, `${i(a) ?? ''} XP`)),
          S(b, c));
      };
    K(g, (b) => {
      i(a) <= 0 || i(s).length === 0 ? b(y) : b(F, !1);
    });
  }
  (o(A), o(m), H(() => I(T, `${i(a) ?? ''} XP`)), S(t, m), ce());
}
var rr = U(
  '<main class="mx-auto max-w-5xl px-4 pb-28 pt-8"><!> <div class="mt-6 space-y-6"><!> <!> <!></div> <div class="mt-8"><!></div></main>',
);
function dr(t) {
  var r = rr(),
    e = n(r);
  jt(e, {});
  var a = u(e, 2),
    s = n(a);
  zt(s, {});
  var l = u(s, 2);
  Wt(l, {});
  var d = u(l, 2);
  (tr(d, {}), o(a));
  var f = u(a, 2),
    m = n(f);
  (Bt(m, {}), o(f), o(r), S(t, r));
}
export { dr as component };
