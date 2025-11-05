import { d as ke, f as O, a as k, s as V } from '../chunks/nF9ceomb.js';
import {
  h as se,
  aJ as Le,
  al as Ve,
  U as De,
  a0 as Re,
  n as K,
  aK as Ye,
  a7 as he,
  ak as I,
  O as Oe,
  Q as g,
  Z as Pe,
  ab as c,
  ad as f,
  ac as l,
  d as u,
  a9 as J,
  af as ae,
  aa as me,
  ag as Ie,
  a8 as Be,
} from '../chunks/Csv_Bl-6.js';
import { i as $ } from '../chunks/CSEja_gF.js';
import { e as Ae } from '../chunks/CqgaXDz6.js';
import { a as Ke, r as ie, s as H } from '../chunks/DQS66_so.js';
import { l as je, d as D } from '../chunks/BwBkY9_K.js';
import { a as Ge } from '../chunks/DcfkiRxm.js';
function He(t, r, e, n) {
  var o = t.__style;
  if (se || o !== r) {
    var s = Ke(r);
    ((!se || s !== t.getAttribute('style')) &&
      (s == null ? t.removeAttribute('style') : (t.style.cssText = s)),
      (t.__style = r));
  }
  return n;
}
function le(t, r, e = r) {
  var n = new WeakSet();
  (Le(t, 'input', async (o) => {
    var s = o ? t.defaultValue : t.value;
    if (
      ((s = te(t) ? re(s) : s),
      e(s),
      K !== null && n.add(K),
      await Ve(),
      s !== (s = r()))
    ) {
      var a = t.selectionStart,
        i = t.selectionEnd,
        v = t.value.length;
      if (((t.value = s ?? ''), i !== null)) {
        var h = t.value.length;
        a === i && i === v && h > v
          ? ((t.selectionStart = h), (t.selectionEnd = h))
          : ((t.selectionStart = a), (t.selectionEnd = Math.min(i, h)));
      }
    }
  }),
    ((se && t.defaultValue !== t.value) || (De(r) == null && t.value)) &&
      (e(te(t) ? re(t.value) : t.value), K !== null && n.add(K)),
    Re(() => {
      var o = r();
      if (t === document.activeElement) {
        var s = Ye ?? K;
        if (n.has(s)) return;
      }
      (te(t) && o === re(t.value)) ||
        (t.type === 'date' && !o && !t.value) ||
        (o !== t.value && (t.value = o ?? ''));
    }));
}
function te(t) {
  var r = t.type;
  return r === 'number' || r === 'range';
}
function re(t) {
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
        for (var o in n)
          Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
      }),
    ce(t, r)
  );
};
function G(t, r) {
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
function ue(t) {
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
function de(t, r) {
  var e = typeof Symbol == 'function' && t[Symbol.iterator];
  if (!e) return t;
  var n = e.call(t),
    o,
    s = [],
    a;
  try {
    for (; (r === void 0 || r-- > 0) && !(o = n.next()).done; ) s.push(o.value);
  } catch (i) {
    a = { error: i };
  } finally {
    try {
      o && !o.done && (e = n.return) && e.call(n);
    } finally {
      if (a) throw a.error;
    }
  }
  return s;
}
function fe(t, r, e) {
  if (e || arguments.length === 2)
    for (var n = 0, o = r.length, s; n < o; n++)
      (s || !(n in r)) &&
        (s || (s = Array.prototype.slice.call(r, 0, n)), (s[n] = r[n]));
  return t.concat(s || Array.prototype.slice.call(r));
}
function X(t) {
  return typeof t == 'function';
}
function Ce(t) {
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
var ne = Ce(function (t) {
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
var z = (function () {
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
                for (var i = ue(a), v = i.next(); !v.done; v = i.next()) {
                  var h = v.value;
                  h.remove(this);
                }
              } catch (b) {
                r = { error: b };
              } finally {
                try {
                  v && !v.done && (e = i.return) && e.call(i);
                } finally {
                  if (r) throw r.error;
                }
              }
            else a.remove(this);
          var w = this.initialTeardown;
          if (X(w))
            try {
              w();
            } catch (b) {
              s = b instanceof ne ? b.errors : [b];
            }
          var S = this._finalizers;
          if (S) {
            this._finalizers = null;
            try {
              for (var m = ue(S), y = m.next(); !y.done; y = m.next()) {
                var p = y.value;
                try {
                  _e(p);
                } catch (b) {
                  ((s = s ?? []),
                    b instanceof ne
                      ? (s = fe(fe([], de(s)), de(b.errors)))
                      : s.push(b));
                }
              }
            } catch (b) {
              n = { error: b };
            } finally {
              try {
                y && !y.done && (o = m.return) && o.call(m);
              } finally {
                if (n) throw n.error;
              }
            }
          }
          if (s) throw new ne(s);
        }
      }),
      (t.prototype.add = function (r) {
        var e;
        if (r && r !== this)
          if (this.closed) _e(r);
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
  Te = z.EMPTY;
function Xe(t) {
  return (
    t instanceof z ||
    (t && 'closed' in t && X(t.remove) && X(t.add) && X(t.unsubscribe))
  );
}
function _e(t) {
  X(t) ? t() : t.unsubscribe();
}
var Qe = { Promise: void 0 },
  $e = {
    setTimeout: function (t, r) {
      for (var e = [], n = 2; n < arguments.length; n++)
        e[n - 2] = arguments[n];
      return setTimeout.apply(void 0, fe([t, r], de(e)));
    },
    clearTimeout: function (t) {
      return clearTimeout(t);
    },
    delegate: void 0,
  };
function qe(t) {
  $e.setTimeout(function () {
    throw t;
  });
}
function ge() {}
function q(t) {
  t();
}
var Me = (function (t) {
    G(r, t);
    function r(e) {
      var n = t.call(this) || this;
      return (
        (n.isStopped = !1),
        e ? ((n.destination = e), Xe(e) && e.add(n)) : (n.destination = Ze),
        n
      );
    }
    return (
      (r.create = function (e, n, o) {
        return new pe(e, n, o);
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
  })(z),
  Je = (function () {
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
            Q(n);
          }
      }),
      (t.prototype.error = function (r) {
        var e = this.partialObserver;
        if (e.error)
          try {
            e.error(r);
          } catch (n) {
            Q(n);
          }
        else Q(r);
      }),
      (t.prototype.complete = function () {
        var r = this.partialObserver;
        if (r.complete)
          try {
            r.complete();
          } catch (e) {
            Q(e);
          }
      }),
      t
    );
  })(),
  pe = (function (t) {
    G(r, t);
    function r(e, n, o) {
      var s = t.call(this) || this,
        a;
      return (
        X(e) || !e
          ? (a = {
              next: e ?? void 0,
              error: n ?? void 0,
              complete: o ?? void 0,
            })
          : (a = e),
        (s.destination = new Je(a)),
        s
      );
    }
    return r;
  })(Me);
function Q(t) {
  qe(t);
}
function We(t) {
  throw t;
}
var Ze = { closed: !0, next: ge, error: We, complete: ge },
  ze = (function () {
    return (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
  })();
function et(t) {
  return t;
}
function tt(t) {
  return t.length === 0
    ? et
    : t.length === 1
      ? t[0]
      : function (e) {
          return t.reduce(function (n, o) {
            return o(n);
          }, e);
        };
}
var we = (function () {
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
        s = nt(r) ? r : new pe(r, e, n);
      return (
        q(function () {
          var a = o,
            i = a.operator,
            v = a.source;
          s.add(i ? i.call(s, v) : v ? o._subscribe(s) : o._trySubscribe(s));
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
        (e = Se(e)),
        new e(function (o, s) {
          var a = new pe({
            next: function (i) {
              try {
                r(i);
              } catch (v) {
                (s(v), a.unsubscribe());
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
    (t.prototype[ze] = function () {
      return this;
    }),
    (t.prototype.pipe = function () {
      for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
      return tt(r)(this);
    }),
    (t.prototype.toPromise = function (r) {
      var e = this;
      return (
        (r = Se(r)),
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
function Se(t) {
  var r;
  return (r = t ?? Qe.Promise) !== null && r !== void 0 ? r : Promise;
}
function rt(t) {
  return t && X(t.next) && X(t.error) && X(t.complete);
}
function nt(t) {
  return (t && t instanceof Me) || (rt(t) && Xe(t));
}
var ot = Ce(function (t) {
    return function () {
      (t(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed'));
    };
  }),
  Fe = (function (t) {
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
        var n = new Ee(this, this);
        return ((n.operator = e), n);
      }),
      (r.prototype._throwIfClosed = function () {
        if (this.closed) throw new ot();
      }),
      (r.prototype.next = function (e) {
        var n = this;
        q(function () {
          var o, s;
          if ((n._throwIfClosed(), !n.isStopped)) {
            n.currentObservers ||
              (n.currentObservers = Array.from(n.observers));
            try {
              for (
                var a = ue(n.currentObservers), i = a.next();
                !i.done;
                i = a.next()
              ) {
                var v = i.value;
                v.next(e);
              }
            } catch (h) {
              o = { error: h };
            } finally {
              try {
                i && !i.done && (s = a.return) && s.call(a);
              } finally {
                if (o) throw o.error;
              }
            }
          }
        });
      }),
      (r.prototype.error = function (e) {
        var n = this;
        q(function () {
          if ((n._throwIfClosed(), !n.isStopped)) {
            ((n.hasError = n.isStopped = !0), (n.thrownError = e));
            for (var o = n.observers; o.length; ) o.shift().error(e);
          }
        });
      }),
      (r.prototype.complete = function () {
        var e = this;
        q(function () {
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
          i = o.observers;
        return s || a
          ? Te
          : ((this.currentObservers = null),
            i.push(e),
            new z(function () {
              ((n.currentObservers = null), ve(i, e));
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
        var e = new we();
        return ((e.source = this), e);
      }),
      (r.create = function (e, n) {
        return new Ee(e, n);
      }),
      r
    );
  })(we),
  Ee = (function (t) {
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
          : Te;
      }),
      r
    );
  })(Fe),
  Ne = (function (t) {
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
  })(Fe);
const R = {
    totalXp: 'lmup:totalXp',
    streak: 'lmup:streak',
    lastCheckin: 'lmup:lastCheckin',
  },
  W = new Ne(0),
  Z = new Ne({ count: 0, lastCheckin: null });
function oe(t) {
  if (typeof window > 'u') return null;
  try {
    return window.localStorage.getItem(t);
  } catch {
    return null;
  }
}
function be(t, r) {
  if (!(typeof window > 'u'))
    try {
      window.localStorage.setItem(t, r);
    } catch {}
}
function st() {
  const t = Number(oe(R.totalXp) ?? '0'),
    r = Number(oe(R.streak) ?? '0'),
    e = oe(R.lastCheckin);
  (W.next(Number.isFinite(t) ? t : 0),
    Z.next({ count: Number.isFinite(r) ? r : 0, lastCheckin: e }));
}
typeof window < 'u' && st();
async function at(t) {
  if (typeof window > 'u') return;
  const e = W.getValue() + t;
  (W.next(e), be(R.totalXp, String(e)));
}
async function it() {
  if (typeof window > 'u') return;
  const t = new Date().toISOString().slice(0, 10),
    r = Z.getValue(),
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
  (Z.next({ count: n, lastCheckin: t }),
    be(R.streak, String(n)),
    be(R.lastCheckin, t));
}
function lt() {
  return W.asObservable();
}
function ct() {
  return Z.asObservable();
}
function ut(t) {
  let r = 1,
    e = t,
    n = 100;
  for (; e >= n; ) ((e -= n), (r += 1), (n = 100 + (r - 1) * 50));
  return { level: r, currentLevelXp: e, xpToNextLevel: n };
}
var dt = O(
    '<li class="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-sm shadow-sm"><div class="flex items-center gap-2"><span class="text-text"> </span> <span class="ml-1 text-xs text-text-secondary"> </span></div> <div class="flex gap-2 text-xs"><button class="font-semibold text-emerald-400 hover:text-emerald-300">concluir</button> <button class="font-semibold text-red-400 hover:text-red-300">remover</button></div></li>',
  ),
  ft = O('<ul class="space-y-2"></ul>'),
  vt = O(
    '<p class="text-xs text-text-secondary">Nenhum item cadastrado para esta área.</p>',
  ),
  pt = O(
    '<section class="space-y-4"><div class="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-3 md:flex-row md:items-end md:gap-4"><div class="flex-1 space-y-1"><label class="text-xs font-medium text-text">Nova missão</label> <input class="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome do novo item (ex: Estudar Svelte 5)"/></div> <div class="flex items-end gap-2"><div class="space-y-1"><label class="text-xs font-medium text-text">XP</label> <input class="w-20 rounded-lg border border-border bg-card/70 px-2 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/70" type="number" min="1"/></div> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duração-150 ease-in-out hover:bg-primary/90">Adicionar</button></div></div> <!></section>',
  );
function bt(t, r) {
  he(r, !0);
  let e = I(Oe([])),
    n = I(''),
    o = I(10);
  {
    const d = je(() =>
      D.items.where('areaId').equals(r.areaId).toArray(),
    ).subscribe((x) => {
      g(e, x, !0);
    });
    Pe(() => () => d.unsubscribe());
  }
  async function s() {
    const d = u(n).trim(),
      x = Number(u(o)) || 0;
    !d ||
      x <= 0 ||
      (await D.items.add({ areaId: r.areaId, nome: d, xp: x, done: !1 }),
      g(n, ''),
      g(o, 10));
  }
  async function a(d) {
    (await at(d.xp), it(), await D.items.delete(d.id));
  }
  async function i(d) {
    await D.items.delete(d.id);
  }
  const v = ae(() => `nova-missao-${r.areaId}`),
    h = ae(() => `xp-missao-${r.areaId}`);
  var w = pt(),
    S = c(w),
    m = c(S),
    y = c(m),
    p = f(y, 2);
  (ie(p), l(m));
  var b = f(m, 2),
    P = c(b),
    E = c(P),
    A = f(E, 2);
  (ie(A), l(P));
  var j = f(P, 2);
  ((j.__click = s), l(b), l(S));
  var C = f(S, 2);
  {
    var N = (d) => {
        var x = ft();
        (Ae(
          x,
          21,
          () => u(e),
          (M) => M.id,
          (M, T) => {
            var _ = dt(),
              F = c(_),
              U = c(F),
              ee = c(U, !0);
            l(U);
            var L = f(U, 2),
              B = c(L);
            (l(L), l(F));
            var ye = f(F, 2),
              xe = c(ye);
            xe.__click = () => a(u(T));
            var Ue = f(xe, 2);
            ((Ue.__click = () => i(u(T))),
              l(ye),
              l(_),
              J(() => {
                (V(ee, u(T).nome), V(B, `(+${u(T).xp ?? ''} XP)`));
              }),
              k(M, _));
          },
        ),
          l(x),
          k(d, x));
      },
      Y = (d) => {
        var x = vt();
        k(d, x);
      };
    $(C, (d) => {
      u(e).length > 0 ? d(N) : d(Y, !1);
    });
  }
  (l(w),
    J(() => {
      (H(y, 'for', u(v)),
        H(p, 'id', u(v)),
        H(E, 'for', u(h)),
        H(A, 'id', u(h)));
    }),
    le(
      p,
      () => u(n),
      (d) => g(n, d),
    ),
    le(
      A,
      () => u(o),
      (d) => g(o, d),
    ),
    k(t, w),
    me());
}
ke(['click']);
var ht = O(
    '<p class="text-sm text-text-secondary">Nenhuma área cadastrada ainda. Comece criando uma área acima, como <span class="font-semibold text-primary">"Programação"</span> ou <span class="font-semibold text-primary">"Hábitos"</span>.</p>',
  ),
  mt = O(
    '<button class="text-xs font-medium text-red-400 underline-offset-2 hover:underline">remover área</button>',
  ),
  yt = O(
    '<article class="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-md"><div class="mb-3 flex items-center justify-between gap-3"><div><h3 class="text-lg font-semibold text-text"> </h3> <p class="text-xs text-text-secondary">Adicione missões rápidas abaixo para ganhar XP.</p></div> <!></div> <!></article>',
  ),
  xt = O('<div class="space-y-4"></div>'),
  _t =
    O(`<section class="w-full space-y-6"><header class="space-y-1"><h2 class="text-xl font-semibold text-primary">Missões ativas</h2> <p class="text-sm text-text-secondary">Crie áreas de foco (como "Programação" ou "Finanças") e depois adicione
      missões dentro de cada uma.</p></header> <div class="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-md md:flex-row md:items-center md:gap-4"><div class="flex-1 space-y-1"><p class="text-sm font-medium text-text">Nova área de foco</p> <input class="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/70" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"/></div> <button class="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-150 ease-in-out hover:bg-primary/90 md:mt-6">Adicionar área</button></div> <!></section>`);
function gt(t, r) {
  he(r, !0);
  let e = I(Oe([])),
    n = I('');
  {
    const p = je(() => D.areas.toArray()).subscribe((b) => {
      g(e, b, !0);
    });
    Pe(() => () => p.unsubscribe());
  }
  async function o() {
    const p = u(n).trim();
    p && (await D.areas.add({ nome: p }), g(n, ''));
  }
  async function s(p) {
    await D.areas.delete(p);
  }
  var a = _t(),
    i = f(c(a), 2),
    v = c(i),
    h = f(c(v), 2);
  (ie(h), l(v));
  var w = f(v, 2);
  ((w.__click = o), l(i));
  var S = f(i, 2);
  {
    var m = (p) => {
        var b = ht();
        k(p, b);
      },
      y = (p) => {
        var b = xt();
        (Ae(
          b,
          21,
          () => u(e),
          (P) => P.id,
          (P, E) => {
            var A = yt(),
              j = c(A),
              C = c(j),
              N = c(C),
              Y = c(N, !0);
            (l(N), Ie(2), l(C));
            var d = f(C, 2);
            {
              var x = (_) => {
                var F = mt();
                ((F.__click = () => s(u(E).id)), k(_, F));
              };
              $(d, (_) => {
                u(E).id && _(x);
              });
            }
            l(j);
            var M = f(j, 2);
            {
              var T = (_) => {
                bt(_, {
                  get areaId() {
                    return u(E).id;
                  },
                });
              };
              $(M, (_) => {
                u(E).id && _(T);
              });
            }
            (l(A), J(() => V(Y, u(E).nome)), k(P, A));
          },
        ),
          l(b),
          k(p, b));
      };
    $(S, (p) => {
      u(e).length === 0 ? p(m) : p(y, !1);
    });
  }
  (l(a),
    le(
      h,
      () => u(n),
      (p) => g(n, p),
    ),
    k(t, a),
    me());
}
ke(['click']);
var wt =
  O(`<section class="w-full mb-8"><div class="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl"><div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true"><div class="h-full w-full bg-[radial-gradient(circle_at_top,_#3b82f6_0,_transparent_55%)]"></div></div> <div class="relative flex flex-col items-center gap-3 text-center"><p class="text-[0.65rem] uppercase tracking-[0.25em] text-primary/70">Reino do aprendizado</p> <h1 class="text-3xl font-extrabold text-primary drop-shadow">Level Me Up!</h1> <p class="max-w-md text-xs text-text-secondary">Complete missões todos os dias para evoluir de nível e manter sua
          chama de foco acesa.</p></div> <div class="relative mt-6 flex flex-col items-center gap-4"><div class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-slate-950/90 shadow-[0_0_40px_rgba(251,191,36,0.7)]"><span class="text-3xl">🛡️</span></div> <div class="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1"><span class="text-[0.65rem] uppercase tracking-widest text-text-secondary">Nível</span> <span class="text-2xl font-bold text-white"> </span></div> <div class="text-xs text-text-secondary">XP total: <span class="font-semibold text-primary"> </span></div></div> <div class="relative mt-6 w-full space-y-2"><div class="flex items-center justify-between text-[0.7rem] text-text-secondary"><span>Progresso até o próximo nível</span> <span> </span></div> <div class="h-3 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900"><div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-[width] duration-500 ease-out"></div></div></div> <div class="relative mt-6 flex flex-col gap-3 border-t border-white/5 pt-4 text-xs text-text-secondary md:flex-row md:items-center md:justify-between"><div class="flex items-center gap-2"><span class="text-xl">🔥</span> <div><div class="font-semibold text-text">Streak de dias</div> <div class="text-[0.7rem]">Faça pelo menos uma missão por dia para manter a chama acesa.</div></div></div> <div class="flex items-baseline justify-end gap-1"><span class="text-3xl font-bold text-primary"> </span> <span class="text-[0.7rem] uppercase tracking-[0.2em] text-text-secondary">dias</span></div></div></div></div></section>`);
function St(t, r) {
  he(r, !0);
  let e = I(0),
    n = I(1),
    o = I(0),
    s = I(100),
    a = I(0),
    i = [];
  if (typeof window < 'u') {
    const U = lt().subscribe((L) => {
        g(e, L, !0);
        const B = ut(L);
        (g(n, B.level, !0),
          g(o, B.currentLevelXp, !0),
          g(s, B.xpToNextLevel, !0));
      }),
      ee = ct().subscribe(({ count: L }) => {
        g(a, L, !0);
      });
    i = [() => U.unsubscribe(), () => ee.unsubscribe()];
  }
  Ge(() => {
    for (const U of i) U();
  });
  const v = ae(() => (u(s) > 0 ? Math.min(100, (u(o) / u(s)) * 100) : 0));
  var h = wt(),
    w = c(h),
    S = c(w),
    m = f(c(S), 4),
    y = f(c(m), 2),
    p = f(c(y), 2),
    b = c(p, !0);
  (l(p), l(y));
  var P = f(y, 2),
    E = f(c(P)),
    A = c(E, !0);
  (l(E), l(P), l(m));
  var j = f(m, 2),
    C = c(j),
    N = f(c(C), 2),
    Y = c(N);
  (l(N), l(C));
  var d = f(C, 2),
    x = c(d);
  (l(d), l(j));
  var M = f(j, 2),
    T = f(c(M), 2),
    _ = c(T),
    F = c(_, !0);
  (l(_),
    Ie(2),
    l(T),
    l(M),
    l(S),
    l(w),
    l(h),
    J(() => {
      (V(b, u(n)),
        V(A, u(e)),
        V(Y, `${u(o) ?? ''} / ${u(s) ?? ''} XP`),
        He(x, `width: ${u(v)}%;`),
        V(F, u(a)));
    }),
    k(t, h),
    me());
}
var Et = O('<!> <!>', 1);
function Tt(t) {
  var r = Et(),
    e = Be(r);
  St(e, {});
  var n = f(e, 2);
  (gt(n, {}), k(t, r));
}
export { Tt as component };
