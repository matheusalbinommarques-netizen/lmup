import { d as we, f as k, a as O, s as j } from '../chunks/BuOzf4wU.js';
import {
  h as Q,
  aJ as Ee,
  al as Oe,
  L as ke,
  a0 as Ae,
  n as P,
  aK as Pe,
  a7 as ue,
  ae as E,
  Q as je,
  R as x,
  Z as Te,
  ad as h,
  d as v,
  aa as ce,
  ab as f,
  ac as l,
  a9 as le,
  ag as Ce,
  a8 as Ie,
} from '../chunks/nNZc3isi.js';
import { i as Xe } from '../chunks/DMVQG7PD.js';
import { e as Fe } from '../chunks/C4GIgfFI.js';
import { a as Le, r as Ue } from '../chunks/CV21HSfW.js';
import { l as Me, d as V } from '../chunks/BwBkY9_K.js';
import { a as Re } from '../chunks/D5tPhTvi.js';
function Ne(t, r, e, n) {
  var o = t.__style;
  if (Q || o !== r) {
    var i = Le(r);
    ((!Q || i !== t.getAttribute('style')) &&
      (i == null ? t.removeAttribute('style') : (t.style.cssText = i)),
      (t.__style = r));
  }
  return n;
}
function Ve(t, r, e = r) {
  var n = new WeakSet();
  (Ee(t, 'input', async (o) => {
    var i = o ? t.defaultValue : t.value;
    if (
      ((i = Y(t) ? $(i) : i),
      e(i),
      P !== null && n.add(P),
      await Oe(),
      i !== (i = r()))
    ) {
      var s = t.selectionStart,
        a = t.selectionEnd,
        c = t.value.length;
      if (((t.value = i ?? ''), a !== null)) {
        var d = t.value.length;
        s === a && a === c && d > c
          ? ((t.selectionStart = d), (t.selectionEnd = d))
          : ((t.selectionStart = s), (t.selectionEnd = Math.min(a, d)));
      }
    }
  }),
    ((Q && t.defaultValue !== t.value) || (ke(r) == null && t.value)) &&
      (e(Y(t) ? $(t.value) : t.value), P !== null && n.add(P)),
    Ae(() => {
      var o = r();
      if (t === document.activeElement) {
        var i = Pe ?? P;
        if (n.has(i)) return;
      }
      (Y(t) && o === $(t.value)) ||
        (t.type === 'date' && !o && !t.value) ||
        (o !== t.value && (t.value = o ?? ''));
    }));
}
function Y(t) {
  var r = t.type;
  return r === 'number' || r === 'range';
}
function $(t) {
  return t === '' ? null : +t;
}
var Ye = k('<p class="text-sm opacity-70">Nenhuma área cadastrada ainda.</p>'),
  $e = k(
    '<li class="rounded-md border p-3 flex items-center justify-between"><span class="font-medium"> </span> <button class="text-sm text-red-500">remover</button></li>',
  ),
  Be = k('<ul class="space-y-2"></ul>'),
  Ke = k(
    '<section class="space-y-4"><div class="flex gap-2"><input class="w-full rounded-md border bg-transparent px-3 py-2" placeholder="Nome da nova área (ex: SvelteKit, Finanças)"/> <button class="px-4 py-2 rounded-md bg-blue-600 text-white">Adicionar Área</button></div> <!></section>',
  );
function Ge(t, r) {
  ue(r, !0);
  let e = E(je([])),
    n = E('');
  {
    const u = Me(() => V.areas.toArray()).subscribe((b) => {
      x(e, b, !0);
    });
    Te(() => () => u.unsubscribe());
  }
  async function o() {
    const u = v(n).trim();
    u && (await V.areas.add({ nome: u }), x(n, ''));
  }
  async function i(u) {
    await V.areas.delete(u);
  }
  var s = Ke(),
    a = f(s),
    c = f(a);
  Ue(c);
  var d = h(c, 2);
  ((d.__click = o), l(a));
  var S = h(a, 2);
  {
    var _ = (u) => {
        var b = Ye();
        O(u, b);
      },
      y = (u) => {
        var b = Be();
        (Fe(
          b,
          21,
          () => v(e),
          (p) => p.id,
          (p, A) => {
            var g = $e(),
              w = f(g),
              U = f(w, !0);
            l(w);
            var C = h(w, 2);
            ((C.__click = () => i(v(A).id)),
              l(g),
              le(() => j(U, v(A).nome)),
              O(p, g));
          },
        ),
          l(b),
          O(u, b));
      };
    Xe(S, (u) => {
      v(e).length === 0 ? u(_) : u(y, !1);
    });
  }
  (l(s),
    Ve(
      c,
      () => v(n),
      (u) => x(n, u),
    ),
    O(t, s),
    ce());
}
we(['click']);
var D = function (t, r) {
  return (
    (D =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, n) {
          e.__proto__ = n;
        }) ||
      function (e, n) {
        for (var o in n)
          Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
      }),
    D(t, r)
  );
};
function T(t, r) {
  if (typeof r != 'function' && r !== null)
    throw new TypeError(
      'Class extends value ' + String(r) + ' is not a constructor or null',
    );
  D(t, r);
  function e() {
    this.constructor = t;
  }
  t.prototype =
    r === null ? Object.create(r) : ((e.prototype = r.prototype), new e());
}
function H(t) {
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
function J(t, r) {
  var e = typeof Symbol == 'function' && t[Symbol.iterator];
  if (!e) return t;
  var n = e.call(t),
    o,
    i = [],
    s;
  try {
    for (; (r === void 0 || r-- > 0) && !(o = n.next()).done; ) i.push(o.value);
  } catch (a) {
    s = { error: a };
  } finally {
    try {
      o && !o.done && (e = n.return) && e.call(n);
    } finally {
      if (s) throw s.error;
    }
  }
  return i;
}
function W(t, r, e) {
  if (e || arguments.length === 2)
    for (var n = 0, o = r.length, i; n < o; n++)
      (i || !(n in r)) &&
        (i || (i = Array.prototype.slice.call(r, 0, n)), (i[n] = r[n]));
  return t.concat(i || Array.prototype.slice.call(r));
}
function m(t) {
  return typeof t == 'function';
}
function fe(t) {
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
var B = fe(function (t) {
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
function Z(t, r) {
  if (t) {
    var e = t.indexOf(r);
    0 <= e && t.splice(e, 1);
  }
}
var L = (function () {
    function t(r) {
      ((this.initialTeardown = r),
        (this.closed = !1),
        (this._parentage = null),
        (this._finalizers = null));
    }
    return (
      (t.prototype.unsubscribe = function () {
        var r, e, n, o, i;
        if (!this.closed) {
          this.closed = !0;
          var s = this._parentage;
          if (s)
            if (((this._parentage = null), Array.isArray(s)))
              try {
                for (var a = H(s), c = a.next(); !c.done; c = a.next()) {
                  var d = c.value;
                  d.remove(this);
                }
              } catch (p) {
                r = { error: p };
              } finally {
                try {
                  c && !c.done && (e = a.return) && e.call(a);
                } finally {
                  if (r) throw r.error;
                }
              }
            else s.remove(this);
          var S = this.initialTeardown;
          if (m(S))
            try {
              S();
            } catch (p) {
              i = p instanceof B ? p.errors : [p];
            }
          var _ = this._finalizers;
          if (_) {
            this._finalizers = null;
            try {
              for (var y = H(_), u = y.next(); !u.done; u = y.next()) {
                var b = u.value;
                try {
                  ne(b);
                } catch (p) {
                  ((i = i ?? []),
                    p instanceof B
                      ? (i = W(W([], J(i)), J(p.errors)))
                      : i.push(p));
                }
              }
            } catch (p) {
              n = { error: p };
            } finally {
              try {
                u && !u.done && (o = y.return) && o.call(y);
              } finally {
                if (n) throw n.error;
              }
            }
          }
          if (i) throw new B(i);
        }
      }),
      (t.prototype.add = function (r) {
        var e;
        if (r && r !== this)
          if (this.closed) ne(r);
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
        e === r ? (this._parentage = null) : Array.isArray(e) && Z(e, r);
      }),
      (t.prototype.remove = function (r) {
        var e = this._finalizers;
        (e && Z(e, r), r instanceof t && r._removeParent(this));
      }),
      (t.EMPTY = (function () {
        var r = new t();
        return ((r.closed = !0), r);
      })()),
      t
    );
  })(),
  pe = L.EMPTY;
function ve(t) {
  return (
    t instanceof L ||
    (t && 'closed' in t && m(t.remove) && m(t.add) && m(t.unsubscribe))
  );
}
function ne(t) {
  m(t) ? t() : t.unsubscribe();
}
var Qe = { Promise: void 0 },
  De = {
    setTimeout: function (t, r) {
      for (var e = [], n = 2; n < arguments.length; n++)
        e[n - 2] = arguments[n];
      return setTimeout.apply(void 0, W([t, r], J(e)));
    },
    clearTimeout: function (t) {
      return clearTimeout(t);
    },
    delegate: void 0,
  };
function He(t) {
  De.setTimeout(function () {
    throw t;
  });
}
function oe() {}
function F(t) {
  t();
}
var de = (function (t) {
    T(r, t);
    function r(e) {
      var n = t.call(this) || this;
      return (
        (n.isStopped = !1),
        e ? ((n.destination = e), ve(e) && e.add(n)) : (n.destination = Ze),
        n
      );
    }
    return (
      (r.create = function (e, n, o) {
        return new q(e, n, o);
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
  })(L),
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
            X(n);
          }
      }),
      (t.prototype.error = function (r) {
        var e = this.partialObserver;
        if (e.error)
          try {
            e.error(r);
          } catch (n) {
            X(n);
          }
        else X(r);
      }),
      (t.prototype.complete = function () {
        var r = this.partialObserver;
        if (r.complete)
          try {
            r.complete();
          } catch (e) {
            X(e);
          }
      }),
      t
    );
  })(),
  q = (function (t) {
    T(r, t);
    function r(e, n, o) {
      var i = t.call(this) || this,
        s;
      return (
        m(e) || !e
          ? (s = {
              next: e ?? void 0,
              error: n ?? void 0,
              complete: o ?? void 0,
            })
          : (s = e),
        (i.destination = new Je(s)),
        i
      );
    }
    return r;
  })(de);
function X(t) {
  He(t);
}
function We(t) {
  throw t;
}
var Ze = { closed: !0, next: oe, error: We, complete: oe },
  qe = (function () {
    return (typeof Symbol == 'function' && Symbol.observable) || '@@observable';
  })();
function ze(t) {
  return t;
}
function et(t) {
  return t.length === 0
    ? ze
    : t.length === 1
      ? t[0]
      : function (e) {
          return t.reduce(function (n, o) {
            return o(n);
          }, e);
        };
}
var ie = (function () {
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
        i = rt(r) ? r : new q(r, e, n);
      return (
        F(function () {
          var s = o,
            a = s.operator,
            c = s.source;
          i.add(a ? a.call(i, c) : c ? o._subscribe(i) : o._trySubscribe(i));
        }),
        i
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
        (e = se(e)),
        new e(function (o, i) {
          var s = new q({
            next: function (a) {
              try {
                r(a);
              } catch (c) {
                (i(c), s.unsubscribe());
              }
            },
            error: i,
            complete: o,
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
    (t.prototype[qe] = function () {
      return this;
    }),
    (t.prototype.pipe = function () {
      for (var r = [], e = 0; e < arguments.length; e++) r[e] = arguments[e];
      return et(r)(this);
    }),
    (t.prototype.toPromise = function (r) {
      var e = this;
      return (
        (r = se(r)),
        new r(function (n, o) {
          var i;
          e.subscribe(
            function (s) {
              return (i = s);
            },
            function (s) {
              return o(s);
            },
            function () {
              return n(i);
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
function se(t) {
  var r;
  return (r = t ?? Qe.Promise) !== null && r !== void 0 ? r : Promise;
}
function tt(t) {
  return t && m(t.next) && m(t.error) && m(t.complete);
}
function rt(t) {
  return (t && t instanceof de) || (tt(t) && ve(t));
}
var nt = fe(function (t) {
    return function () {
      (t(this),
        (this.name = 'ObjectUnsubscribedError'),
        (this.message = 'object unsubscribed'));
    };
  }),
  he = (function (t) {
    T(r, t);
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
        var n = new ae(this, this);
        return ((n.operator = e), n);
      }),
      (r.prototype._throwIfClosed = function () {
        if (this.closed) throw new nt();
      }),
      (r.prototype.next = function (e) {
        var n = this;
        F(function () {
          var o, i;
          if ((n._throwIfClosed(), !n.isStopped)) {
            n.currentObservers ||
              (n.currentObservers = Array.from(n.observers));
            try {
              for (
                var s = H(n.currentObservers), a = s.next();
                !a.done;
                a = s.next()
              ) {
                var c = a.value;
                c.next(e);
              }
            } catch (d) {
              o = { error: d };
            } finally {
              try {
                a && !a.done && (i = s.return) && i.call(s);
              } finally {
                if (o) throw o.error;
              }
            }
          }
        });
      }),
      (r.prototype.error = function (e) {
        var n = this;
        F(function () {
          if ((n._throwIfClosed(), !n.isStopped)) {
            ((n.hasError = n.isStopped = !0), (n.thrownError = e));
            for (var o = n.observers; o.length; ) o.shift().error(e);
          }
        });
      }),
      (r.prototype.complete = function () {
        var e = this;
        F(function () {
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
          i = o.hasError,
          s = o.isStopped,
          a = o.observers;
        return i || s
          ? pe
          : ((this.currentObservers = null),
            a.push(e),
            new L(function () {
              ((n.currentObservers = null), Z(a, e));
            }));
      }),
      (r.prototype._checkFinalizedStatuses = function (e) {
        var n = this,
          o = n.hasError,
          i = n.thrownError,
          s = n.isStopped;
        o ? e.error(i) : s && e.complete();
      }),
      (r.prototype.asObservable = function () {
        var e = new ie();
        return ((e.source = this), e);
      }),
      (r.create = function (e, n) {
        return new ae(e, n);
      }),
      r
    );
  })(ie),
  ae = (function (t) {
    T(r, t);
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
          : pe;
      }),
      r
    );
  })(he),
  be = (function (t) {
    T(r, t);
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
          i = e._value;
        if (n) throw o;
        return (this._throwIfClosed(), i);
      }),
      (r.prototype.next = function (e) {
        t.prototype.next.call(this, (this._value = e));
      }),
      r
    );
  })(he);
const K = {
    totalXp: 'lmup:totalXp',
    streak: 'lmup:streak',
    lastCheckin: 'lmup:lastCheckin',
  },
  ye = new be(0),
  me = new be({ count: 0, lastCheckin: null });
function G(t) {
  if (typeof window > 'u') return null;
  try {
    return window.localStorage.getItem(t);
  } catch {
    return null;
  }
}
function ot() {
  const t = Number(G(K.totalXp) ?? '0'),
    r = Number(G(K.streak) ?? '0'),
    e = G(K.lastCheckin);
  (ye.next(Number.isFinite(t) ? t : 0),
    me.next({ count: Number.isFinite(r) ? r : 0, lastCheckin: e }));
}
typeof window < 'u' && ot();
function it() {
  return ye.asObservable();
}
function st() {
  return me.asObservable();
}
function at(t) {
  let r = 1,
    e = t,
    n = 100;
  for (; e >= n; ) ((e -= n), (r += 1), (n = 100 + (r - 1) * 50));
  return { level: r, currentLevelXp: e, xpToNextLevel: n };
}
var ut = k(
  '<section class="w-full"><div class="mx-auto max-w-3xl rounded-xl bg-surface shadow-md p-6 flex flex-col gap-4 border border-border"><header class="flex items-center justify-between"><div><h1 class="text-2xl font-bold text-primary">Level Me Up!</h1> <p class="text-sm text-text-secondary">Seu progresso geral</p></div> <div class="text-right"><div class="text-xs uppercase tracking-wide text-text-secondary">STREAK</div> <div class="mt-1 flex items-center justify-end gap-1"><span class="text-2xl">🔥</span> <span class="text-xl font-semibold"> </span></div></div></header> <div class="grid gap-4 md:grid-cols-[auto,1fr] items-center"><div class="flex flex-col gap-1"><span class="text-xs uppercase tracking-wide text-text-secondary">Nível</span> <span class="text-4xl font-bold text-accent"> </span> <span class="text-xs text-text-secondary">XP total: <span class="font-semibold"> </span></span></div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between text-xs text-text-secondary"><span>Progresso do nível</span> <span> </span></div> <div class="h-2 rounded-full bg-surface-elevated overflow-hidden"><div class="h-full bg-green-500 transition-[width] duration-300 ease-out"></div></div></div></div></div></section>',
);
function ct(t, r) {
  ue(r, !0);
  let e = E(0),
    n = E(1),
    o = E(0),
    i = E(100),
    s = E(0),
    a = [];
  if (typeof window < 'u') {
    const R = it().subscribe((I) => {
        x(e, I, !0);
        const N = at(I);
        (x(n, N.level, !0),
          x(o, N.currentLevelXp, !0),
          x(i, N.xpToNextLevel, !0));
      }),
      ge = st().subscribe(({ count: I }) => {
        x(s, I, !0);
      });
    a = [() => R.unsubscribe(), () => ge.unsubscribe()];
  }
  Re(() => {
    for (const R of a) R();
  });
  const c = Ce(() => (v(i) > 0 ? Math.min(100, (v(o) / v(i)) * 100) : 0));
  var d = ut(),
    S = f(d),
    _ = f(S),
    y = h(f(_), 2),
    u = h(f(y), 2),
    b = h(f(u), 2),
    p = f(b, !0);
  (l(b), l(u), l(y), l(_));
  var A = h(_, 2),
    g = f(A),
    w = h(f(g), 2),
    U = f(w, !0);
  l(w);
  var C = h(w, 2),
    z = h(f(C)),
    _e = f(z, !0);
  (l(z), l(C), l(g));
  var ee = h(g, 2),
    M = f(ee),
    te = h(f(M), 2),
    xe = f(te);
  (l(te), l(M));
  var re = h(M, 2),
    Se = f(re);
  (l(re),
    l(ee),
    l(A),
    l(S),
    l(d),
    le(() => {
      (j(p, v(s)),
        j(U, v(n)),
        j(_e, v(e)),
        j(xe, `${v(o) ?? ''} / ${v(i) ?? ''} XP`),
        Ne(Se, `width: ${v(c)}%;`));
    }),
    O(t, d),
    ce());
}
var lt = k('<!> <!>', 1);
function mt(t) {
  var r = lt(),
    e = Ie(r);
  ct(e, {});
  var n = h(e, 2);
  (Ge(n, {}), O(t, r));
}
export { mt as component };
