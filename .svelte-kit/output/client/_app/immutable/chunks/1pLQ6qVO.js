import { f as yo, a as bo } from './CTOClj_W.js';
import { o as go } from './CFHu8sXB.js';
import {
  z as wo,
  l as ve,
  D as se,
  k as z,
  B as _o,
  C as xo,
  aH as xt,
  E as ee,
  F as te,
  a4 as ko,
} from './B9t7ERLA.js';
import { d as Oo, s as Mr } from './v1vEHNqM.js';
import { s as fn } from './CmYDCv5e.js';
import { s as Ye } from './E1N5lFGC.js';
import { c as We } from './DYDdMpkw.js';
import { _ as Po, b as Eo } from './CrojtzO5.js';
var So =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
function Ko(ne) {
  return ne &&
    ne.__esModule &&
    Object.prototype.hasOwnProperty.call(ne, 'default')
    ? ne.default
    : ne;
}
var dn = { exports: {} },
  Ao = dn.exports,
  Nr;
function jo() {
  return (
    Nr ||
      ((Nr = 1),
      (function (ne, at) {
        (function (re, C) {
          ne.exports = C();
        })(Ao, function () {
          var re = function (e, t) {
              return (re =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (n, r) {
                    n.__proto__ = r;
                  }) ||
                function (n, r) {
                  for (var o in r)
                    Object.prototype.hasOwnProperty.call(r, o) && (n[o] = r[o]);
                })(e, t);
            },
            C = function () {
              return (C =
                Object.assign ||
                function (e) {
                  for (var t, n = 1, r = arguments.length; n < r; n++)
                    for (var o in (t = arguments[n]))
                      Object.prototype.hasOwnProperty.call(t, o) &&
                        (e[o] = t[o]);
                  return e;
                }).apply(this, arguments);
            };
          function H(e, t, n) {
            for (var r, o = 0, i = t.length; o < i; o++)
              (!r && o in t) ||
                ((r = r || Array.prototype.slice.call(t, 0, o))[o] = t[o]);
            return e.concat(r || Array.prototype.slice.call(t));
          }
          var N =
              typeof globalThis < 'u'
                ? globalThis
                : typeof self < 'u'
                  ? self
                  : typeof window < 'u'
                    ? window
                    : So,
            L = Object.keys,
            M = Array.isArray;
          function Y(e, t) {
            return (
              typeof t != 'object' ||
                L(t).forEach(function (n) {
                  e[n] = t[n];
                }),
              e
            );
          }
          typeof Promise > 'u' || N.Promise || (N.Promise = Promise);
          var de = Object.getPrototypeOf,
            ut = {}.hasOwnProperty;
          function G(e, t) {
            return ut.call(e, t);
          }
          function ye(e, t) {
            (typeof t == 'function' && (t = t(de(e))),
              (typeof Reflect > 'u' ? L : Reflect.ownKeys)(t).forEach(
                function (n) {
                  be(e, n, t[n]);
                },
              ));
          }
          var Bt = Object.defineProperty;
          function be(e, t, n, r) {
            Bt(
              e,
              t,
              Y(
                n && G(n, 'get') && typeof n.get == 'function'
                  ? { get: n.get, set: n.set, configurable: !0 }
                  : { value: n, configurable: !0, writable: !0 },
                r,
              ),
            );
          }
          function qe(e) {
            return {
              from: function (t) {
                return (
                  (e.prototype = Object.create(t.prototype)),
                  be(e.prototype, 'constructor', e),
                  { extend: ye.bind(null, e.prototype) }
                );
              },
            };
          }
          var pn = Object.getOwnPropertyDescriptor,
            mn = [].slice;
          function st(e, t, n) {
            return mn.call(e, t, n);
          }
          function $e(e, t) {
            return t(e);
          }
          function ge(e) {
            if (!e) throw new Error('Assertion Failed');
          }
          function ct(e) {
            N.setImmediate ? setImmediate(e) : setTimeout(e, 0);
          }
          function he(e, t) {
            if (typeof t == 'string' && G(e, t)) return e[t];
            if (!t) return e;
            if (typeof t != 'string') {
              for (var n = [], r = 0, o = t.length; r < o; ++r) {
                var i = he(e, t[r]);
                n.push(i);
              }
              return n;
            }
            var a = t.indexOf('.');
            if (a !== -1) {
              var u = e[t.substr(0, a)];
              return u == null ? void 0 : he(u, t.substr(a + 1));
            }
          }
          function J(e, t, n) {
            if (
              e &&
              t !== void 0 &&
              !('isFrozen' in Object && Object.isFrozen(e))
            )
              if (typeof t != 'string' && 'length' in t) {
                ge(typeof n != 'string' && 'length' in n);
                for (var r = 0, o = t.length; r < o; ++r) J(e, t[r], n[r]);
              } else {
                var i,
                  a,
                  u = t.indexOf('.');
                u !== -1
                  ? ((i = t.substr(0, u)),
                    (a = t.substr(u + 1)) === ''
                      ? n === void 0
                        ? M(e) && !isNaN(parseInt(i))
                          ? e.splice(i, 1)
                          : delete e[i]
                        : (e[i] = n)
                      : J(
                          (u = !(u = e[i]) || !G(e, i) ? (e[i] = {}) : u),
                          a,
                          n,
                        ))
                  : n === void 0
                    ? M(e) && !isNaN(parseInt(t))
                      ? e.splice(t, 1)
                      : delete e[t]
                    : (e[t] = n);
              }
          }
          function lt(e) {
            var t,
              n = {};
            for (t in e) G(e, t) && (n[t] = e[t]);
            return n;
          }
          var Ge = [].concat;
          function Rt(e) {
            return Ge.apply([], e);
          }
          var Xe =
              'BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey'
                .split(',')
                .concat(
                  Rt(
                    [8, 16, 32, 64].map(function (e) {
                      return ['Int', 'Uint', 'Float'].map(function (t) {
                        return t + e + 'Array';
                      });
                    }),
                  ),
                )
                .filter(function (e) {
                  return N[e];
                }),
            ft = new Set(
              Xe.map(function (e) {
                return N[e];
              }),
            ),
            Pe = null;
          function pe(e) {
            return (
              (Pe = new WeakMap()),
              (e = (function t(n) {
                if (!n || typeof n != 'object') return n;
                var r = Pe.get(n);
                if (r) return r;
                if (M(n)) {
                  ((r = []), Pe.set(n, r));
                  for (var o = 0, i = n.length; o < i; ++o) r.push(t(n[o]));
                } else if (ft.has(n.constructor)) r = n;
                else {
                  var a,
                    u = de(n);
                  for (a in ((r =
                    u === Object.prototype ? {} : Object.create(u)),
                  Pe.set(n, r),
                  n))
                    G(n, a) && (r[a] = t(n[a]));
                }
                return r;
              })(e)),
              (Pe = null),
              e
            );
          }
          var vn = {}.toString;
          function dt(e) {
            return vn.call(e).slice(8, -1);
          }
          var Ee = typeof Symbol < 'u' ? Symbol.iterator : '@@iterator',
            yn =
              typeof Ee == 'symbol'
                ? function (e) {
                    var t;
                    return e != null && (t = e[Ee]) && t.apply(e);
                  }
                : function () {
                    return null;
                  };
          function we(e, t) {
            return ((t = e.indexOf(t)), 0 <= t && e.splice(t, 1), 0 <= t);
          }
          var Se = {};
          function ce(e) {
            var t, n, r, o;
            if (arguments.length === 1) {
              if (M(e)) return e.slice();
              if (this === Se && typeof e == 'string') return [e];
              if ((o = yn(e))) {
                for (n = []; !(r = o.next()).done; ) n.push(r.value);
                return n;
              }
              if (e == null) return [e];
              if (typeof (t = e.length) != 'number') return [e];
              for (n = new Array(t); t--; ) n[t] = e[t];
              return n;
            }
            for (t = arguments.length, n = new Array(t); t--; )
              n[t] = arguments[t];
            return n;
          }
          var Ke =
              typeof Symbol < 'u'
                ? function (e) {
                    return e[Symbol.toStringTag] === 'AsyncFunction';
                  }
                : function () {
                    return !1;
                  },
            Ot = [
              'Unknown',
              'Constraint',
              'Data',
              'TransactionInactive',
              'ReadOnly',
              'Version',
              'NotFound',
              'InvalidState',
              'InvalidAccess',
              'Abort',
              'Timeout',
              'QuotaExceeded',
              'Syntax',
              'DataClone',
            ],
            me = [
              'Modify',
              'Bulk',
              'OpenFailed',
              'VersionChange',
              'Schema',
              'Upgrade',
              'InvalidTable',
              'MissingAPI',
              'NoSuchDatabase',
              'InvalidArgument',
              'SubTransaction',
              'Unsupported',
              'Internal',
              'DatabaseClosed',
              'PrematureCommit',
              'ForeignAwait',
            ].concat(Ot),
            bn = {
              VersionChanged:
                'Database version changed by other database connection',
              DatabaseClosed: 'Database has been closed',
              Abort: 'Transaction aborted',
              TransactionInactive:
                'Transaction has already completed or failed',
              MissingAPI:
                'IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb',
            };
          function _e(e, t) {
            ((this.name = e), (this.message = t));
          }
          function Be(e, t) {
            return (
              e +
              '. Errors: ' +
              Object.keys(t)
                .map(function (n) {
                  return t[n].toString();
                })
                .filter(function (n, r, o) {
                  return o.indexOf(n) === r;
                }).join(`
`)
            );
          }
          function ht(e, t, n, r) {
            ((this.failures = t),
              (this.failedKeys = r),
              (this.successCount = n),
              (this.message = Be(e, t)));
          }
          function Ae(e, t) {
            ((this.name = 'BulkError'),
              (this.failures = Object.keys(t).map(function (n) {
                return t[n];
              })),
              (this.failuresByPos = t),
              (this.message = Be(e, this.failures)));
          }
          (qe(_e)
            .from(Error)
            .extend({
              toString: function () {
                return this.name + ': ' + this.message;
              },
            }),
            qe(ht).from(_e),
            qe(Ae).from(_e));
          var je = me.reduce(function (e, t) {
              return ((e[t] = t + 'Error'), e);
            }, {}),
            gn = _e,
            k = me.reduce(function (e, t) {
              var n = t + 'Error';
              function r(o, i) {
                ((this.name = n),
                  o
                    ? typeof o == 'string'
                      ? ((this.message = ''.concat(o).concat(
                          i
                            ? `
 ` + i
                            : '',
                        )),
                        (this.inner = i || null))
                      : typeof o == 'object' &&
                        ((this.message = ''
                          .concat(o.name, ' ')
                          .concat(o.message)),
                        (this.inner = o))
                    : ((this.message = bn[t] || n), (this.inner = null)));
              }
              return (qe(r).from(gn), (e[t] = r), e);
            }, {});
          ((k.Syntax = SyntaxError),
            (k.Type = TypeError),
            (k.Range = RangeError));
          var Z = Ot.reduce(function (e, t) {
              return ((e[t + 'Error'] = k[t]), e);
            }, {}),
            Re = me.reduce(function (e, t) {
              return (
                ['Syntax', 'Type', 'Range'].indexOf(t) === -1 &&
                  (e[t + 'Error'] = k[t]),
                e
              );
            }, {});
          function R() {}
          function Qe(e) {
            return e;
          }
          function wn(e, t) {
            return e == null || e === Qe
              ? t
              : function (n) {
                  return t(e(n));
                };
          }
          function Ce(e, t) {
            return function () {
              (e.apply(this, arguments), t.apply(this, arguments));
            };
          }
          function _n(e, t) {
            return e === R
              ? t
              : function () {
                  var n = e.apply(this, arguments);
                  n !== void 0 && (arguments[0] = n);
                  var r = this.onsuccess,
                    o = this.onerror;
                  ((this.onsuccess = null), (this.onerror = null));
                  var i = t.apply(this, arguments);
                  return (
                    r &&
                      (this.onsuccess = this.onsuccess
                        ? Ce(r, this.onsuccess)
                        : r),
                    o &&
                      (this.onerror = this.onerror ? Ce(o, this.onerror) : o),
                    i !== void 0 ? i : n
                  );
                };
          }
          function Ur(e, t) {
            return e === R
              ? t
              : function () {
                  e.apply(this, arguments);
                  var n = this.onsuccess,
                    r = this.onerror;
                  ((this.onsuccess = this.onerror = null),
                    t.apply(this, arguments),
                    n &&
                      (this.onsuccess = this.onsuccess
                        ? Ce(n, this.onsuccess)
                        : n),
                    r &&
                      (this.onerror = this.onerror ? Ce(r, this.onerror) : r));
                };
          }
          function zr(e, t) {
            return e === R
              ? t
              : function (n) {
                  var r = e.apply(this, arguments);
                  Y(n, r);
                  var o = this.onsuccess,
                    i = this.onerror;
                  return (
                    (this.onsuccess = null),
                    (this.onerror = null),
                    (n = t.apply(this, arguments)),
                    o &&
                      (this.onsuccess = this.onsuccess
                        ? Ce(o, this.onsuccess)
                        : o),
                    i &&
                      (this.onerror = this.onerror ? Ce(i, this.onerror) : i),
                    r === void 0 ? (n === void 0 ? void 0 : n) : Y(r, n)
                  );
                };
          }
          function Vr(e, t) {
            return e === R
              ? t
              : function () {
                  return (
                    t.apply(this, arguments) !== !1 && e.apply(this, arguments)
                  );
                };
          }
          function xn(e, t) {
            return e === R
              ? t
              : function () {
                  var n = e.apply(this, arguments);
                  if (n && typeof n.then == 'function') {
                    for (
                      var r = this, o = arguments.length, i = new Array(o);
                      o--;

                    )
                      i[o] = arguments[o];
                    return n.then(function () {
                      return t.apply(r, i);
                    });
                  }
                  return t.apply(this, arguments);
                };
          }
          ((Re.ModifyError = ht), (Re.DexieError = _e), (Re.BulkError = Ae));
          var xe =
            typeof location < 'u' &&
            /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
          function or(e) {
            xe = e;
          }
          var kt = {},
            ir = 100,
            Xe =
              typeof Promise > 'u'
                ? []
                : (function () {
                    var e = Promise.resolve();
                    if (typeof crypto > 'u' || !crypto.subtle)
                      return [e, de(e), e];
                    var t = crypto.subtle.digest(
                      'SHA-512',
                      new Uint8Array([0]),
                    );
                    return [t, de(t), e];
                  })(),
            Ot = Xe[0],
            me = Xe[1],
            Xe = Xe[2],
            me = me && me.then,
            He = Ot && Ot.constructor,
            kn = !!Xe,
            Pt = function (e, t) {
              (Et.push([e, t]), Ft && (queueMicrotask(Wr), (Ft = !1)));
            },
            On = !0,
            Ft = !0,
            Je = [],
            Mt = [],
            Pn = Qe,
            Fe = {
              id: 'global',
              global: !0,
              ref: 0,
              unhandleds: [],
              onunhandled: R,
              pgp: !1,
              env: {},
              finalize: R,
            },
            j = Fe,
            Et = [],
            Ze = 0,
            Nt = [];
          function K(e) {
            if (typeof this != 'object')
              throw new TypeError('Promises must be constructed via new');
            ((this._listeners = []), (this._lib = !1));
            var t = (this._PSD = j);
            if (typeof e != 'function') {
              if (e !== kt) throw new TypeError('Not a function');
              return (
                (this._state = arguments[1]),
                (this._value = arguments[2]),
                void (this._state === !1 && Sn(this, this._value))
              );
            }
            ((this._state = null),
              (this._value = null),
              ++t.ref,
              (function n(r, o) {
                try {
                  o(
                    function (i) {
                      if (r._state === null) {
                        if (i === r)
                          throw new TypeError(
                            'A promise cannot be resolved with itself.',
                          );
                        var a = r._lib && pt();
                        (i && typeof i.then == 'function'
                          ? n(r, function (u, c) {
                              i instanceof K ? i._then(u, c) : i.then(u, c);
                            })
                          : ((r._state = !0), (r._value = i), ur(r)),
                          a && mt());
                      }
                    },
                    Sn.bind(null, r),
                  );
                } catch (i) {
                  Sn(r, i);
                }
              })(this, e));
          }
          var En = {
            get: function () {
              var e = j,
                t = Vt;
              function n(r, o) {
                var i = this,
                  a = !e.global && (e !== j || t !== Vt),
                  u = a && !Ne(),
                  c = new K(function (l, p) {
                    Kn(i, new ar(cr(r, e, a, u), cr(o, e, a, u), l, p, e));
                  });
                return (
                  this._consoleTask && (c._consoleTask = this._consoleTask),
                  c
                );
              }
              return ((n.prototype = kt), n);
            },
            set: function (e) {
              be(
                this,
                'then',
                e && e.prototype === kt
                  ? En
                  : {
                      get: function () {
                        return e;
                      },
                      set: En.set,
                    },
              );
            },
          };
          function ar(e, t, n, r, o) {
            ((this.onFulfilled = typeof e == 'function' ? e : null),
              (this.onRejected = typeof t == 'function' ? t : null),
              (this.resolve = n),
              (this.reject = r),
              (this.psd = o));
          }
          function Sn(e, t) {
            var n, r;
            (Mt.push(t),
              e._state === null &&
                ((n = e._lib && pt()),
                (t = Pn(t)),
                (e._state = !1),
                (e._value = t),
                (r = e),
                Je.some(function (o) {
                  return o._value === r._value;
                }) || Je.push(r),
                ur(e),
                n && mt()));
          }
          function ur(e) {
            var t = e._listeners;
            e._listeners = [];
            for (var n = 0, r = t.length; n < r; ++n) Kn(e, t[n]);
            var o = e._PSD;
            (--o.ref || o.finalize(),
              Ze === 0 &&
                (++Ze,
                Pt(function () {
                  --Ze == 0 && An();
                }, [])));
          }
          function Kn(e, t) {
            if (e._state !== null) {
              var n = e._state ? t.onFulfilled : t.onRejected;
              if (n === null)
                return (e._state ? t.resolve : t.reject)(e._value);
              (++t.psd.ref, ++Ze, Pt(Yr, [n, e, t]));
            } else e._listeners.push(t);
          }
          function Yr(e, t, n) {
            try {
              var r,
                o = t._value;
              (!t._state && Mt.length && (Mt = []),
                (r =
                  xe && t._consoleTask
                    ? t._consoleTask.run(function () {
                        return e(o);
                      })
                    : e(o)),
                t._state ||
                  Mt.indexOf(o) !== -1 ||
                  (function (i) {
                    for (var a = Je.length; a; )
                      if (Je[--a]._value === i._value) return Je.splice(a, 1);
                  })(t),
                n.resolve(r));
            } catch (i) {
              n.reject(i);
            } finally {
              (--Ze == 0 && An(), --n.psd.ref || n.psd.finalize());
            }
          }
          function Wr() {
            et(Fe, function () {
              pt() && mt();
            });
          }
          function pt() {
            var e = On;
            return ((Ft = On = !1), e);
          }
          function mt() {
            var e, t, n;
            do
              for (; 0 < Et.length; )
                for (e = Et, Et = [], n = e.length, t = 0; t < n; ++t) {
                  var r = e[t];
                  r[0].apply(null, r[1]);
                }
            while (0 < Et.length);
            Ft = On = !0;
          }
          function An() {
            var e = Je;
            ((Je = []),
              e.forEach(function (r) {
                r._PSD.onunhandled.call(null, r._value, r);
              }));
            for (var t = Nt.slice(0), n = t.length; n; ) t[--n]();
          }
          function Lt(e) {
            return new K(kt, !1, e);
          }
          function V(e, t) {
            var n = j;
            return function () {
              var r = pt(),
                o = j;
              try {
                return (Le(n, !0), e.apply(this, arguments));
              } catch (i) {
                t && t(i);
              } finally {
                (Le(o, !1), r && mt());
              }
            };
          }
          (ye(K.prototype, {
            then: En,
            _then: function (e, t) {
              Kn(this, new ar(null, null, e, t, j));
            },
            catch: function (e) {
              if (arguments.length === 1) return this.then(null, e);
              var t = e,
                n = arguments[1];
              return typeof t == 'function'
                ? this.then(null, function (r) {
                    return (r instanceof t ? n : Lt)(r);
                  })
                : this.then(null, function (r) {
                    return (r && r.name === t ? n : Lt)(r);
                  });
            },
            finally: function (e) {
              return this.then(
                function (t) {
                  return K.resolve(e()).then(function () {
                    return t;
                  });
                },
                function (t) {
                  return K.resolve(e()).then(function () {
                    return Lt(t);
                  });
                },
              );
            },
            timeout: function (e, t) {
              var n = this;
              return e < 1 / 0
                ? new K(function (r, o) {
                    var i = setTimeout(function () {
                      return o(new k.Timeout(t));
                    }, e);
                    n.then(r, o).finally(clearTimeout.bind(null, i));
                  })
                : this;
            },
          }),
            typeof Symbol < 'u' &&
              Symbol.toStringTag &&
              be(K.prototype, Symbol.toStringTag, 'Dexie.Promise'),
            (Fe.env = sr()),
            ye(K, {
              all: function () {
                var e = ce.apply(null, arguments).map(Yt);
                return new K(function (t, n) {
                  e.length === 0 && t([]);
                  var r = e.length;
                  e.forEach(function (o, i) {
                    return K.resolve(o).then(function (a) {
                      ((e[i] = a), --r || t(e));
                    }, n);
                  });
                });
              },
              resolve: function (e) {
                return e instanceof K
                  ? e
                  : e && typeof e.then == 'function'
                    ? new K(function (t, n) {
                        e.then(t, n);
                      })
                    : new K(kt, !0, e);
              },
              reject: Lt,
              race: function () {
                var e = ce.apply(null, arguments).map(Yt);
                return new K(function (t, n) {
                  e.map(function (r) {
                    return K.resolve(r).then(t, n);
                  });
                });
              },
              PSD: {
                get: function () {
                  return j;
                },
                set: function (e) {
                  return (j = e);
                },
              },
              totalEchoes: {
                get: function () {
                  return Vt;
                },
              },
              newPSD: Me,
              usePSD: et,
              scheduler: {
                get: function () {
                  return Pt;
                },
                set: function (e) {
                  Pt = e;
                },
              },
              rejectionMapper: {
                get: function () {
                  return Pn;
                },
                set: function (e) {
                  Pn = e;
                },
              },
              follow: function (e, t) {
                return new K(function (n, r) {
                  return Me(
                    function (o, i) {
                      var a = j;
                      ((a.unhandleds = []),
                        (a.onunhandled = i),
                        (a.finalize = Ce(function () {
                          var u,
                            c = this;
                          ((u = function () {
                            c.unhandleds.length === 0
                              ? o()
                              : i(c.unhandleds[0]);
                          }),
                            Nt.push(function l() {
                              (u(), Nt.splice(Nt.indexOf(l), 1));
                            }),
                            ++Ze,
                            Pt(function () {
                              --Ze == 0 && An();
                            }, []));
                        }, a.finalize)),
                        e());
                    },
                    t,
                    n,
                    r,
                  );
                });
              },
            }),
            He &&
              (He.allSettled &&
                be(K, 'allSettled', function () {
                  var e = ce.apply(null, arguments).map(Yt);
                  return new K(function (t) {
                    e.length === 0 && t([]);
                    var n = e.length,
                      r = new Array(n);
                    e.forEach(function (o, i) {
                      return K.resolve(o)
                        .then(
                          function (a) {
                            return (r[i] = { status: 'fulfilled', value: a });
                          },
                          function (a) {
                            return (r[i] = { status: 'rejected', reason: a });
                          },
                        )
                        .then(function () {
                          return --n || t(r);
                        });
                    });
                  });
                }),
              He.any &&
                typeof AggregateError < 'u' &&
                be(K, 'any', function () {
                  var e = ce.apply(null, arguments).map(Yt);
                  return new K(function (t, n) {
                    e.length === 0 && n(new AggregateError([]));
                    var r = e.length,
                      o = new Array(r);
                    e.forEach(function (i, a) {
                      return K.resolve(i).then(
                        function (u) {
                          return t(u);
                        },
                        function (u) {
                          ((o[a] = u), --r || n(new AggregateError(o)));
                        },
                      );
                    });
                  });
                }),
              He.withResolvers && (K.withResolvers = He.withResolvers)));
          var Q = { awaits: 0, echoes: 0, id: 0 },
            $r = 0,
            Ut = [],
            zt = 0,
            Vt = 0,
            Gr = 0;
          function Me(e, t, n, r) {
            var o = j,
              i = Object.create(o);
            return (
              (i.parent = o),
              (i.ref = 0),
              (i.global = !1),
              (i.id = ++Gr),
              Fe.env,
              (i.env = kn
                ? {
                    Promise: K,
                    PromiseProp: { value: K, configurable: !0, writable: !0 },
                    all: K.all,
                    race: K.race,
                    allSettled: K.allSettled,
                    any: K.any,
                    resolve: K.resolve,
                    reject: K.reject,
                  }
                : {}),
              t && Y(i, t),
              ++o.ref,
              (i.finalize = function () {
                --this.parent.ref || this.parent.finalize();
              }),
              (r = et(i, e, n, r)),
              i.ref === 0 && i.finalize(),
              r
            );
          }
          function vt() {
            return (Q.id || (Q.id = ++$r), ++Q.awaits, (Q.echoes += ir), Q.id);
          }
          function Ne() {
            return (
              !!Q.awaits &&
              (--Q.awaits == 0 && (Q.id = 0), (Q.echoes = Q.awaits * ir), !0)
            );
          }
          function Yt(e) {
            return Q.echoes && e && e.constructor === He
              ? (vt(),
                e.then(
                  function (t) {
                    return (Ne(), t);
                  },
                  function (t) {
                    return (Ne(), W(t));
                  },
                ))
              : e;
          }
          function Qr() {
            var e = Ut[Ut.length - 1];
            (Ut.pop(), Le(e, !1));
          }
          function Le(e, t) {
            var n,
              r = j;
            ((t ? !Q.echoes || (zt++ && e === j) : !zt || (--zt && e === j)) ||
              queueMicrotask(
                t
                  ? function (o) {
                      (++Vt,
                        (Q.echoes && --Q.echoes != 0) ||
                          (Q.echoes = Q.awaits = Q.id = 0),
                        Ut.push(j),
                        Le(o, !0));
                    }.bind(null, e)
                  : Qr,
              ),
              e !== j &&
                ((j = e),
                r === Fe && (Fe.env = sr()),
                kn &&
                  ((n = Fe.env.Promise),
                  (t = e.env),
                  (r.global || e.global) &&
                    (Object.defineProperty(N, 'Promise', t.PromiseProp),
                    (n.all = t.all),
                    (n.race = t.race),
                    (n.resolve = t.resolve),
                    (n.reject = t.reject),
                    t.allSettled && (n.allSettled = t.allSettled),
                    t.any && (n.any = t.any)))));
          }
          function sr() {
            var e = N.Promise;
            return kn
              ? {
                  Promise: e,
                  PromiseProp: Object.getOwnPropertyDescriptor(N, 'Promise'),
                  all: e.all,
                  race: e.race,
                  allSettled: e.allSettled,
                  any: e.any,
                  resolve: e.resolve,
                  reject: e.reject,
                }
              : {};
          }
          function et(e, t, n, r, o) {
            var i = j;
            try {
              return (Le(e, !0), t(n, r, o));
            } finally {
              Le(i, !1);
            }
          }
          function cr(e, t, n, r) {
            return typeof e != 'function'
              ? e
              : function () {
                  var o = j;
                  (n && vt(), Le(t, !0));
                  try {
                    return e.apply(this, arguments);
                  } finally {
                    (Le(o, !1), r && queueMicrotask(Ne));
                  }
                };
          }
          function jn(e) {
            Promise === He && Q.echoes === 0
              ? zt === 0
                ? e()
                : enqueueNativeMicroTask(e)
              : setTimeout(e, 0);
          }
          ('' + me).indexOf('[native code]') === -1 && (vt = Ne = R);
          var W = K.reject,
            tt = '￿',
            Te =
              'Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.',
            lr = 'String expected.',
            yt = [],
            Wt = '__dbnames',
            Cn = 'readonly',
            Tn = 'readwrite';
          function nt(e, t) {
            return e
              ? t
                ? function () {
                    return e.apply(this, arguments) && t.apply(this, arguments);
                  }
                : e
              : t;
          }
          var fr = {
            type: 3,
            lower: -1 / 0,
            lowerOpen: !1,
            upper: [[]],
            upperOpen: !1,
          };
          function $t(e) {
            return typeof e != 'string' || /\./.test(e)
              ? function (t) {
                  return t;
                }
              : function (t) {
                  return (
                    t[e] === void 0 && e in t && delete (t = pe(t))[e],
                    t
                  );
                };
          }
          function dr() {
            throw k.Type(
              'Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.',
            );
          }
          function B(e, t) {
            try {
              var n = hr(e),
                r = hr(t);
              if (n !== r)
                return n === 'Array'
                  ? 1
                  : r === 'Array'
                    ? -1
                    : n === 'binary'
                      ? 1
                      : r === 'binary'
                        ? -1
                        : n === 'string'
                          ? 1
                          : r === 'string'
                            ? -1
                            : n === 'Date'
                              ? 1
                              : r !== 'Date'
                                ? NaN
                                : -1;
              switch (n) {
                case 'number':
                case 'Date':
                case 'string':
                  return t < e ? 1 : e < t ? -1 : 0;
                case 'binary':
                  return (function (o, i) {
                    for (
                      var a = o.length, u = i.length, c = a < u ? a : u, l = 0;
                      l < c;
                      ++l
                    )
                      if (o[l] !== i[l]) return o[l] < i[l] ? -1 : 1;
                    return a === u ? 0 : a < u ? -1 : 1;
                  })(pr(e), pr(t));
                case 'Array':
                  return (function (o, i) {
                    for (
                      var a = o.length, u = i.length, c = a < u ? a : u, l = 0;
                      l < c;
                      ++l
                    ) {
                      var p = B(o[l], i[l]);
                      if (p !== 0) return p;
                    }
                    return a === u ? 0 : a < u ? -1 : 1;
                  })(e, t);
              }
            } catch {}
            return NaN;
          }
          function hr(e) {
            var t = typeof e;
            return t != 'object'
              ? t
              : ArrayBuffer.isView(e)
                ? 'binary'
                : ((e = dt(e)), e === 'ArrayBuffer' ? 'binary' : e);
          }
          function pr(e) {
            return e instanceof Uint8Array
              ? e
              : ArrayBuffer.isView(e)
                ? new Uint8Array(e.buffer, e.byteOffset, e.byteLength)
                : new Uint8Array(e);
          }
          function Gt(e, t, n) {
            var r = e.schema.yProps;
            return r
              ? (t &&
                  0 < n.numFailures &&
                  (t = t.filter(function (o, i) {
                    return !n.failures[i];
                  })),
                Promise.all(
                  r.map(function (o) {
                    return (
                      (o = o.updatesTable),
                      t
                        ? e.db.table(o).where('k').anyOf(t).delete()
                        : e.db.table(o).clear()
                    );
                  }),
                ).then(function () {
                  return n;
                }))
              : n;
          }
          var St =
            ((mr.prototype.execute = function (e) {
              var t = this['@@propmod'];
              if (t.add !== void 0) {
                var n = t.add;
                if (M(n)) return H(H([], M(e) ? e : [], !0), n).sort();
                if (typeof n == 'number') return (Number(e) || 0) + n;
                if (typeof n == 'bigint')
                  try {
                    return BigInt(e) + n;
                  } catch {
                    return BigInt(0) + n;
                  }
                throw new TypeError('Invalid term '.concat(n));
              }
              if (t.remove !== void 0) {
                var r = t.remove;
                if (M(r))
                  return M(e)
                    ? e
                        .filter(function (o) {
                          return !r.includes(o);
                        })
                        .sort()
                    : [];
                if (typeof r == 'number') return Number(e) - r;
                if (typeof r == 'bigint')
                  try {
                    return BigInt(e) - r;
                  } catch {
                    return BigInt(0) - r;
                  }
                throw new TypeError('Invalid subtrahend '.concat(r));
              }
              return (
                (n =
                  (n = t.replacePrefix) === null || n === void 0
                    ? void 0
                    : n[0]),
                n && typeof e == 'string' && e.startsWith(n)
                  ? t.replacePrefix[1] + e.substring(n.length)
                  : e
              );
            }),
            mr);
          function mr(e) {
            this['@@propmod'] = e;
          }
          function vr(e, t) {
            for (var n = L(t), r = n.length, o = !1, i = 0; i < r; ++i) {
              var a = n[i],
                u = t[a],
                c = he(e, a);
              u instanceof St
                ? (J(e, a, u.execute(c)), (o = !0))
                : c !== u && (J(e, a, u), (o = !0));
            }
            return o;
          }
          var yr =
            ((U.prototype._trans = function (e, t, n) {
              var r = this._tx || j.trans,
                o = this.name,
                i =
                  xe &&
                  typeof console < 'u' &&
                  console.createTask &&
                  console.createTask(
                    'Dexie: '
                      .concat(e === 'readonly' ? 'read' : 'write', ' ')
                      .concat(this.name),
                  );
              function a(l, p, s) {
                if (!s.schema[o])
                  throw new k.NotFound(
                    'Table ' + o + ' not part of transaction',
                  );
                return t(s.idbtrans, s);
              }
              var u = pt();
              try {
                var c =
                  r && r.db._novip === this.db._novip
                    ? r === j.trans
                      ? r._promise(e, a, n)
                      : Me(
                          function () {
                            return r._promise(e, a, n);
                          },
                          { trans: r, transless: j.transless || j },
                        )
                    : (function l(p, s, v, f) {
                        if (
                          p.idbdb &&
                          (p._state.openComplete || j.letThrough || p._vip)
                        ) {
                          var d = p._createTransaction(s, v, p._dbSchema);
                          try {
                            (d.create(), (p._state.PR1398_maxLoop = 3));
                          } catch (h) {
                            return h.name === je.InvalidState &&
                              p.isOpen() &&
                              0 < --p._state.PR1398_maxLoop
                              ? (console.warn('Dexie: Need to reopen db'),
                                p.close({ disableAutoOpen: !1 }),
                                p.open().then(function () {
                                  return l(p, s, v, f);
                                }))
                              : W(h);
                          }
                          return d
                            ._promise(s, function (h, m) {
                              return Me(function () {
                                return ((j.trans = d), f(h, m, d));
                              });
                            })
                            .then(function (h) {
                              if (s === 'readwrite')
                                try {
                                  d.idbtrans.commit();
                                } catch {}
                              return s === 'readonly'
                                ? h
                                : d._completion.then(function () {
                                    return h;
                                  });
                            });
                        }
                        if (p._state.openComplete)
                          return W(new k.DatabaseClosed(p._state.dbOpenError));
                        if (!p._state.isBeingOpened) {
                          if (!p._state.autoOpen)
                            return W(new k.DatabaseClosed());
                          p.open().catch(R);
                        }
                        return p._state.dbReadyPromise.then(function () {
                          return l(p, s, v, f);
                        });
                      })(this.db, e, [this.name], a);
                return (
                  i &&
                    ((c._consoleTask = i),
                    (c = c.catch(function (l) {
                      return (console.trace(l), W(l));
                    }))),
                  c
                );
              } finally {
                u && mt();
              }
            }),
            (U.prototype.get = function (e, t) {
              var n = this;
              return e && e.constructor === Object
                ? this.where(e).first(t)
                : e == null
                  ? W(new k.Type('Invalid argument to Table.get()'))
                  : this._trans('readonly', function (r) {
                      return n.core
                        .get({ trans: r, key: e })
                        .then(function (o) {
                          return n.hook.reading.fire(o);
                        });
                    }).then(t);
            }),
            (U.prototype.where = function (e) {
              if (typeof e == 'string') return new this.db.WhereClause(this, e);
              if (M(e))
                return new this.db.WhereClause(
                  this,
                  '['.concat(e.join('+'), ']'),
                );
              var t = L(e);
              if (t.length === 1) return this.where(t[0]).equals(e[t[0]]);
              var n = this.schema.indexes
                .concat(this.schema.primKey)
                .filter(function (u) {
                  if (
                    u.compound &&
                    t.every(function (l) {
                      return 0 <= u.keyPath.indexOf(l);
                    })
                  ) {
                    for (var c = 0; c < t.length; ++c)
                      if (t.indexOf(u.keyPath[c]) === -1) return !1;
                    return !0;
                  }
                  return !1;
                })
                .sort(function (u, c) {
                  return u.keyPath.length - c.keyPath.length;
                })[0];
              if (n && this.db._maxKey !== tt) {
                var i = n.keyPath.slice(0, t.length);
                return this.where(i).equals(
                  i.map(function (c) {
                    return e[c];
                  }),
                );
              }
              !n &&
                xe &&
                console.warn(
                  'The query '
                    .concat(JSON.stringify(e), ' on ')
                    .concat(this.name, ' would benefit from a ') +
                    'compound index ['.concat(t.join('+'), ']'),
                );
              var r = this.schema.idxByName;
              function o(u, c) {
                return B(u, c) === 0;
              }
              var a = t.reduce(
                  function (s, c) {
                    var l = s[0],
                      p = s[1],
                      s = r[c],
                      v = e[c];
                    return [
                      l || s,
                      l || !s
                        ? nt(
                            p,
                            s && s.multi
                              ? function (f) {
                                  return (
                                    (f = he(f, c)),
                                    M(f) &&
                                      f.some(function (d) {
                                        return o(v, d);
                                      })
                                  );
                                }
                              : function (f) {
                                  return o(v, he(f, c));
                                },
                          )
                        : p,
                    ];
                  },
                  [null, null],
                ),
                i = a[0],
                a = a[1];
              return i
                ? this.where(i.name).equals(e[i.keyPath]).filter(a)
                : n
                  ? this.filter(a)
                  : this.where(t).equals('');
            }),
            (U.prototype.filter = function (e) {
              return this.toCollection().and(e);
            }),
            (U.prototype.count = function (e) {
              return this.toCollection().count(e);
            }),
            (U.prototype.offset = function (e) {
              return this.toCollection().offset(e);
            }),
            (U.prototype.limit = function (e) {
              return this.toCollection().limit(e);
            }),
            (U.prototype.each = function (e) {
              return this.toCollection().each(e);
            }),
            (U.prototype.toArray = function (e) {
              return this.toCollection().toArray(e);
            }),
            (U.prototype.toCollection = function () {
              return new this.db.Collection(new this.db.WhereClause(this));
            }),
            (U.prototype.orderBy = function (e) {
              return new this.db.Collection(
                new this.db.WhereClause(
                  this,
                  M(e) ? '['.concat(e.join('+'), ']') : e,
                ),
              );
            }),
            (U.prototype.reverse = function () {
              return this.toCollection().reverse();
            }),
            (U.prototype.mapToClass = function (e) {
              var t,
                n = this.db,
                r = this.name;
              function o() {
                return (t !== null && t.apply(this, arguments)) || this;
              }
              (this.schema.mappedClass = e).prototype instanceof dr &&
                ((function (c, l) {
                  if (typeof l != 'function' && l !== null)
                    throw new TypeError(
                      'Class extends value ' +
                        String(l) +
                        ' is not a constructor or null',
                    );
                  function p() {
                    this.constructor = c;
                  }
                  (re(c, l),
                    (c.prototype =
                      l === null
                        ? Object.create(l)
                        : ((p.prototype = l.prototype), new p())));
                })(o, (t = e)),
                Object.defineProperty(o.prototype, 'db', {
                  get: function () {
                    return n;
                  },
                  enumerable: !1,
                  configurable: !0,
                }),
                (o.prototype.table = function () {
                  return r;
                }),
                (e = o));
              for (var i = new Set(), a = e.prototype; a; a = de(a))
                Object.getOwnPropertyNames(a).forEach(function (c) {
                  return i.add(c);
                });
              function u(c) {
                if (!c) return c;
                var l,
                  p = Object.create(e.prototype);
                for (l in c)
                  if (!i.has(l))
                    try {
                      p[l] = c[l];
                    } catch {}
                return p;
              }
              return (
                this.schema.readHook &&
                  this.hook.reading.unsubscribe(this.schema.readHook),
                (this.schema.readHook = u),
                this.hook('reading', u),
                e
              );
            }),
            (U.prototype.defineClass = function () {
              return this.mapToClass(function (e) {
                Y(this, e);
              });
            }),
            (U.prototype.add = function (e, t) {
              var n = this,
                r = this.schema.primKey,
                o = r.auto,
                i = r.keyPath,
                a = e;
              return (
                i && o && (a = $t(i)(e)),
                this._trans('readwrite', function (u) {
                  return n.core.mutate({
                    trans: u,
                    type: 'add',
                    keys: t != null ? [t] : null,
                    values: [a],
                  });
                })
                  .then(function (u) {
                    return u.numFailures
                      ? K.reject(u.failures[0])
                      : u.lastResult;
                  })
                  .then(function (u) {
                    if (i)
                      try {
                        J(e, i, u);
                      } catch {}
                    return u;
                  })
              );
            }),
            (U.prototype.upsert = function (e, t) {
              var n = this,
                r = this.schema.primKey.keyPath;
              return this._trans('readwrite', function (o) {
                return n.core.get({ trans: o, key: e }).then(function (i) {
                  var a = i ?? {};
                  return (
                    vr(a, t),
                    r && J(a, r, e),
                    n.core
                      .mutate({
                        trans: o,
                        type: 'put',
                        values: [a],
                        keys: [e],
                        upsert: !0,
                        updates: { keys: [e], changeSpecs: [t] },
                      })
                      .then(function (u) {
                        return u.numFailures ? K.reject(u.failures[0]) : !!i;
                      })
                  );
                });
              });
            }),
            (U.prototype.update = function (e, t) {
              return typeof e != 'object' || M(e)
                ? this.where(':id').equals(e).modify(t)
                : ((e = he(e, this.schema.primKey.keyPath)),
                  e === void 0
                    ? W(
                        new k.InvalidArgument(
                          'Given object does not contain its primary key',
                        ),
                      )
                    : this.where(':id').equals(e).modify(t));
            }),
            (U.prototype.put = function (e, t) {
              var n = this,
                r = this.schema.primKey,
                o = r.auto,
                i = r.keyPath,
                a = e;
              return (
                i && o && (a = $t(i)(e)),
                this._trans('readwrite', function (u) {
                  return n.core.mutate({
                    trans: u,
                    type: 'put',
                    values: [a],
                    keys: t != null ? [t] : null,
                  });
                })
                  .then(function (u) {
                    return u.numFailures
                      ? K.reject(u.failures[0])
                      : u.lastResult;
                  })
                  .then(function (u) {
                    if (i)
                      try {
                        J(e, i, u);
                      } catch {}
                    return u;
                  })
              );
            }),
            (U.prototype.delete = function (e) {
              var t = this;
              return this._trans('readwrite', function (n) {
                return t.core
                  .mutate({ trans: n, type: 'delete', keys: [e] })
                  .then(function (r) {
                    return Gt(t, [e], r);
                  })
                  .then(function (r) {
                    return r.numFailures ? K.reject(r.failures[0]) : void 0;
                  });
              });
            }),
            (U.prototype.clear = function () {
              var e = this;
              return this._trans('readwrite', function (t) {
                return e.core
                  .mutate({ trans: t, type: 'deleteRange', range: fr })
                  .then(function (n) {
                    return Gt(e, null, n);
                  });
              }).then(function (t) {
                return t.numFailures ? K.reject(t.failures[0]) : void 0;
              });
            }),
            (U.prototype.bulkGet = function (e) {
              var t = this;
              return this._trans('readonly', function (n) {
                return t.core.getMany({ keys: e, trans: n }).then(function (r) {
                  return r.map(function (o) {
                    return t.hook.reading.fire(o);
                  });
                });
              });
            }),
            (U.prototype.bulkAdd = function (e, t, n) {
              var r = this,
                o = Array.isArray(t) ? t : void 0,
                i = (n = n || (o ? void 0 : t)) ? n.allKeys : void 0;
              return this._trans('readwrite', function (a) {
                var l = r.schema.primKey,
                  u = l.auto,
                  l = l.keyPath;
                if (l && o)
                  throw new k.InvalidArgument(
                    'bulkAdd(): keys argument invalid on tables with inbound keys',
                  );
                if (o && o.length !== e.length)
                  throw new k.InvalidArgument(
                    'Arguments objects and keys must have the same length',
                  );
                var c = e.length,
                  l = l && u ? e.map($t(l)) : e;
                return r.core
                  .mutate({
                    trans: a,
                    type: 'add',
                    keys: o,
                    values: l,
                    wantResults: i,
                  })
                  .then(function (d) {
                    var s = d.numFailures,
                      v = d.results,
                      f = d.lastResult,
                      d = d.failures;
                    if (s === 0) return i ? v : f;
                    throw new Ae(
                      ''
                        .concat(r.name, '.bulkAdd(): ')
                        .concat(s, ' of ')
                        .concat(c, ' operations failed'),
                      d,
                    );
                  });
              });
            }),
            (U.prototype.bulkPut = function (e, t, n) {
              var r = this,
                o = Array.isArray(t) ? t : void 0,
                i = (n = n || (o ? void 0 : t)) ? n.allKeys : void 0;
              return this._trans('readwrite', function (a) {
                var l = r.schema.primKey,
                  u = l.auto,
                  l = l.keyPath;
                if (l && o)
                  throw new k.InvalidArgument(
                    'bulkPut(): keys argument invalid on tables with inbound keys',
                  );
                if (o && o.length !== e.length)
                  throw new k.InvalidArgument(
                    'Arguments objects and keys must have the same length',
                  );
                var c = e.length,
                  l = l && u ? e.map($t(l)) : e;
                return r.core
                  .mutate({
                    trans: a,
                    type: 'put',
                    keys: o,
                    values: l,
                    wantResults: i,
                  })
                  .then(function (d) {
                    var s = d.numFailures,
                      v = d.results,
                      f = d.lastResult,
                      d = d.failures;
                    if (s === 0) return i ? v : f;
                    throw new Ae(
                      ''
                        .concat(r.name, '.bulkPut(): ')
                        .concat(s, ' of ')
                        .concat(c, ' operations failed'),
                      d,
                    );
                  });
              });
            }),
            (U.prototype.bulkUpdate = function (e) {
              var t = this,
                n = this.core,
                r = e.map(function (a) {
                  return a.key;
                }),
                o = e.map(function (a) {
                  return a.changes;
                }),
                i = [];
              return this._trans('readwrite', function (a) {
                return n
                  .getMany({ trans: a, keys: r, cache: 'clone' })
                  .then(function (u) {
                    var c = [],
                      l = [];
                    e.forEach(function (s, v) {
                      var f = s.key,
                        d = s.changes,
                        h = u[v];
                      if (h) {
                        for (var m = 0, y = Object.keys(d); m < y.length; m++) {
                          var b = y[m],
                            g = d[b];
                          if (b === t.schema.primKey.keyPath) {
                            if (B(g, f) !== 0)
                              throw new k.Constraint(
                                'Cannot update primary key in bulkUpdate()',
                              );
                          } else J(h, b, g);
                        }
                        (i.push(v), c.push(f), l.push(h));
                      }
                    });
                    var p = c.length;
                    return n
                      .mutate({
                        trans: a,
                        type: 'put',
                        keys: c,
                        values: l,
                        updates: { keys: r, changeSpecs: o },
                      })
                      .then(function (s) {
                        var v = s.numFailures,
                          f = s.failures;
                        if (v === 0) return p;
                        for (var d = 0, h = Object.keys(f); d < h.length; d++) {
                          var m,
                            y = h[d],
                            b = i[Number(y)];
                          b != null && ((m = f[y]), delete f[y], (f[b] = m));
                        }
                        throw new Ae(
                          ''
                            .concat(t.name, '.bulkUpdate(): ')
                            .concat(v, ' of ')
                            .concat(p, ' operations failed'),
                          f,
                        );
                      });
                  });
              });
            }),
            (U.prototype.bulkDelete = function (e) {
              var t = this,
                n = e.length;
              return this._trans('readwrite', function (r) {
                return t.core
                  .mutate({ trans: r, type: 'delete', keys: e })
                  .then(function (o) {
                    return Gt(t, e, o);
                  });
              }).then(function (a) {
                var o = a.numFailures,
                  i = a.lastResult,
                  a = a.failures;
                if (o === 0) return i;
                throw new Ae(
                  ''
                    .concat(t.name, '.bulkDelete(): ')
                    .concat(o, ' of ')
                    .concat(n, ' operations failed'),
                  a,
                );
              });
            }),
            U);
          function U() {}
          function Kt(e) {
            function t(a, u) {
              if (u) {
                for (var c = arguments.length, l = new Array(c - 1); --c; )
                  l[c - 1] = arguments[c];
                return (n[a].subscribe.apply(null, l), e);
              }
              if (typeof a == 'string') return n[a];
            }
            var n = {};
            t.addEventType = i;
            for (var r = 1, o = arguments.length; r < o; ++r) i(arguments[r]);
            return t;
            function i(a, u, c) {
              if (typeof a != 'object') {
                var l;
                u = u || Vr;
                var p = {
                  subscribers: [],
                  fire: (c = c || R),
                  subscribe: function (s) {
                    p.subscribers.indexOf(s) === -1 &&
                      (p.subscribers.push(s), (p.fire = u(p.fire, s)));
                  },
                  unsubscribe: function (s) {
                    ((p.subscribers = p.subscribers.filter(function (v) {
                      return v !== s;
                    })),
                      (p.fire = p.subscribers.reduce(u, c)));
                  },
                };
                return (n[a] = t[a] = p);
              }
              L((l = a)).forEach(function (s) {
                var v = l[s];
                if (M(v)) i(s, l[s][0], l[s][1]);
                else {
                  if (v !== 'asap')
                    throw new k.InvalidArgument('Invalid event config');
                  var f = i(s, Qe, function () {
                    for (var d = arguments.length, h = new Array(d); d--; )
                      h[d] = arguments[d];
                    f.subscribers.forEach(function (m) {
                      ct(function () {
                        m.apply(null, h);
                      });
                    });
                  });
                }
              });
            }
          }
          function At(e, t) {
            return (qe(t).from({ prototype: e }), t);
          }
          function bt(e, t) {
            return (
              !(e.filter || e.algorithm || e.or) &&
              (t ? e.justLimit : !e.replayFilter)
            );
          }
          function Dn(e, t) {
            e.filter = nt(e.filter, t);
          }
          function In(e, t, n) {
            var r = e.replayFilter;
            ((e.replayFilter = r
              ? function () {
                  return nt(r(), t());
                }
              : t),
              (e.justLimit = n && !r));
          }
          function Qt(e, t) {
            if (e.isPrimKey) return t.primaryKey;
            var n = t.getIndexByKeyPath(e.index);
            if (!n)
              throw new k.Schema(
                'KeyPath ' +
                  e.index +
                  ' on object store ' +
                  t.name +
                  ' is not indexed',
              );
            return n;
          }
          function br(e, t, n) {
            var r = Qt(e, t.schema);
            return t.openCursor({
              trans: n,
              values: !e.keysOnly,
              reverse: e.dir === 'prev',
              unique: !!e.unique,
              query: { index: r, range: e.range },
            });
          }
          function Xt(e, t, n, r) {
            var o = e.replayFilter ? nt(e.filter, e.replayFilter()) : e.filter;
            if (e.or) {
              var i = {},
                a = function (u, c, l) {
                  var p, s;
                  (o &&
                    !o(
                      c,
                      l,
                      function (v) {
                        return c.stop(v);
                      },
                      function (v) {
                        return c.fail(v);
                      },
                    )) ||
                    ((s = '' + (p = c.primaryKey)) == '[object ArrayBuffer]' &&
                      (s = '' + new Uint8Array(p)),
                    G(i, s) || ((i[s] = !0), t(u, c, l)));
                };
              return Promise.all([
                e.or._iterate(a, n),
                gr(br(e, r, n), e.algorithm, a, !e.keysOnly && e.valueMapper),
              ]);
            }
            return gr(
              br(e, r, n),
              nt(e.algorithm, o),
              t,
              !e.keysOnly && e.valueMapper,
            );
          }
          function gr(e, t, n, r) {
            var o = V(
              r
                ? function (i, a, u) {
                    return n(r(i), a, u);
                  }
                : n,
            );
            return e.then(function (i) {
              if (i)
                return i.start(function () {
                  var a = function () {
                    return i.continue();
                  };
                  ((t &&
                    !t(
                      i,
                      function (u) {
                        return (a = u);
                      },
                      function (u) {
                        (i.stop(u), (a = R));
                      },
                      function (u) {
                        (i.fail(u), (a = R));
                      },
                    )) ||
                    o(i.value, i, function (u) {
                      return (a = u);
                    }),
                    a());
                });
            });
          }
          var Xr =
            ((F.prototype._read = function (e, t) {
              var n = this._ctx;
              return n.error
                ? n.table._trans(null, W.bind(null, n.error))
                : n.table._trans('readonly', e).then(t);
            }),
            (F.prototype._write = function (e) {
              var t = this._ctx;
              return t.error
                ? t.table._trans(null, W.bind(null, t.error))
                : t.table._trans('readwrite', e, 'locked');
            }),
            (F.prototype._addAlgorithm = function (e) {
              var t = this._ctx;
              t.algorithm = nt(t.algorithm, e);
            }),
            (F.prototype._iterate = function (e, t) {
              return Xt(this._ctx, e, t, this._ctx.table.core);
            }),
            (F.prototype.clone = function (e) {
              var t = Object.create(this.constructor.prototype),
                n = Object.create(this._ctx);
              return (e && Y(n, e), (t._ctx = n), t);
            }),
            (F.prototype.raw = function () {
              return ((this._ctx.valueMapper = null), this);
            }),
            (F.prototype.each = function (e) {
              var t = this._ctx;
              return this._read(function (n) {
                return Xt(t, e, n, t.table.core);
              });
            }),
            (F.prototype.count = function (e) {
              var t = this;
              return this._read(function (n) {
                var r = t._ctx,
                  o = r.table.core;
                if (bt(r, !0))
                  return o
                    .count({
                      trans: n,
                      query: { index: Qt(r, o.schema), range: r.range },
                    })
                    .then(function (a) {
                      return Math.min(a, r.limit);
                    });
                var i = 0;
                return Xt(
                  r,
                  function () {
                    return (++i, !1);
                  },
                  n,
                  o,
                ).then(function () {
                  return i;
                });
              }).then(e);
            }),
            (F.prototype.sortBy = function (e, t) {
              var n = e.split('.').reverse(),
                r = n[0],
                o = n.length - 1;
              function i(c, l) {
                return l ? i(c[n[l]], l - 1) : c[r];
              }
              var a = this._ctx.dir === 'next' ? 1 : -1;
              function u(c, l) {
                return B(i(c, o), i(l, o)) * a;
              }
              return this.toArray(function (c) {
                return c.sort(u);
              }).then(t);
            }),
            (F.prototype.toArray = function (e) {
              var t = this;
              return this._read(function (n) {
                var r = t._ctx;
                if (r.dir === 'next' && bt(r, !0) && 0 < r.limit) {
                  var o = r.valueMapper,
                    i = Qt(r, r.table.core.schema);
                  return r.table.core
                    .query({
                      trans: n,
                      limit: r.limit,
                      values: !0,
                      query: { index: i, range: r.range },
                    })
                    .then(function (u) {
                      return ((u = u.result), o ? u.map(o) : u);
                    });
                }
                var a = [];
                return Xt(
                  r,
                  function (u) {
                    return a.push(u);
                  },
                  n,
                  r.table.core,
                ).then(function () {
                  return a;
                });
              }, e);
            }),
            (F.prototype.offset = function (e) {
              var t = this._ctx;
              return (
                e <= 0 ||
                  ((t.offset += e),
                  bt(t)
                    ? In(t, function () {
                        var n = e;
                        return function (r, o) {
                          return (
                            n === 0 ||
                            (n === 1
                              ? --n
                              : o(function () {
                                  (r.advance(n), (n = 0));
                                }),
                            !1)
                          );
                        };
                      })
                    : In(t, function () {
                        var n = e;
                        return function () {
                          return --n < 0;
                        };
                      })),
                this
              );
            }),
            (F.prototype.limit = function (e) {
              return (
                (this._ctx.limit = Math.min(this._ctx.limit, e)),
                In(
                  this._ctx,
                  function () {
                    var t = e;
                    return function (n, r, o) {
                      return (--t <= 0 && r(o), 0 <= t);
                    };
                  },
                  !0,
                ),
                this
              );
            }),
            (F.prototype.until = function (e, t) {
              return (
                Dn(this._ctx, function (n, r, o) {
                  return !e(n.value) || (r(o), t);
                }),
                this
              );
            }),
            (F.prototype.first = function (e) {
              return this.limit(1)
                .toArray(function (t) {
                  return t[0];
                })
                .then(e);
            }),
            (F.prototype.last = function (e) {
              return this.reverse().first(e);
            }),
            (F.prototype.filter = function (e) {
              var t;
              return (
                Dn(this._ctx, function (n) {
                  return e(n.value);
                }),
                ((t = this._ctx).isMatch = nt(t.isMatch, e)),
                this
              );
            }),
            (F.prototype.and = function (e) {
              return this.filter(e);
            }),
            (F.prototype.or = function (e) {
              return new this.db.WhereClause(this._ctx.table, e, this);
            }),
            (F.prototype.reverse = function () {
              return (
                (this._ctx.dir = this._ctx.dir === 'prev' ? 'next' : 'prev'),
                this._ondirectionchange &&
                  this._ondirectionchange(this._ctx.dir),
                this
              );
            }),
            (F.prototype.desc = function () {
              return this.reverse();
            }),
            (F.prototype.eachKey = function (e) {
              var t = this._ctx;
              return (
                (t.keysOnly = !t.isMatch),
                this.each(function (n, r) {
                  e(r.key, r);
                })
              );
            }),
            (F.prototype.eachUniqueKey = function (e) {
              return ((this._ctx.unique = 'unique'), this.eachKey(e));
            }),
            (F.prototype.eachPrimaryKey = function (e) {
              var t = this._ctx;
              return (
                (t.keysOnly = !t.isMatch),
                this.each(function (n, r) {
                  e(r.primaryKey, r);
                })
              );
            }),
            (F.prototype.keys = function (e) {
              var t = this._ctx;
              t.keysOnly = !t.isMatch;
              var n = [];
              return this.each(function (r, o) {
                n.push(o.key);
              })
                .then(function () {
                  return n;
                })
                .then(e);
            }),
            (F.prototype.primaryKeys = function (e) {
              var t = this._ctx;
              if (t.dir === 'next' && bt(t, !0) && 0 < t.limit)
                return this._read(function (r) {
                  var o = Qt(t, t.table.core.schema);
                  return t.table.core.query({
                    trans: r,
                    values: !1,
                    limit: t.limit,
                    query: { index: o, range: t.range },
                  });
                })
                  .then(function (r) {
                    return r.result;
                  })
                  .then(e);
              t.keysOnly = !t.isMatch;
              var n = [];
              return this.each(function (r, o) {
                n.push(o.primaryKey);
              })
                .then(function () {
                  return n;
                })
                .then(e);
            }),
            (F.prototype.uniqueKeys = function (e) {
              return ((this._ctx.unique = 'unique'), this.keys(e));
            }),
            (F.prototype.firstKey = function (e) {
              return this.limit(1)
                .keys(function (t) {
                  return t[0];
                })
                .then(e);
            }),
            (F.prototype.lastKey = function (e) {
              return this.reverse().firstKey(e);
            }),
            (F.prototype.distinct = function () {
              var e = this._ctx,
                e = e.index && e.table.schema.idxByName[e.index];
              if (!e || !e.multi) return this;
              var t = {};
              return (
                Dn(this._ctx, function (o) {
                  var r = o.primaryKey.toString(),
                    o = G(t, r);
                  return ((t[r] = !0), !o);
                }),
                this
              );
            }),
            (F.prototype.modify = function (e) {
              var t = this,
                n = this._ctx;
              return this._write(function (r) {
                var o =
                    typeof e == 'function'
                      ? e
                      : function (h) {
                          return vr(h, e);
                        },
                  i = n.table.core,
                  l = i.schema.primaryKey,
                  a = l.outbound,
                  u = l.extractKey,
                  c = 200,
                  l = t.db._options.modifyChunkSize;
                l &&
                  (c = typeof l == 'object' ? l[i.name] || l['*'] || 200 : l);
                function p(h, b) {
                  var y = b.failures,
                    b = b.numFailures;
                  v += h - b;
                  for (var g = 0, w = L(y); g < w.length; g++) {
                    var x = w[g];
                    s.push(y[x]);
                  }
                }
                var s = [],
                  v = 0,
                  f = [],
                  d = e === wr;
                return t
                  .clone()
                  .primaryKeys()
                  .then(function (h) {
                    function m(b) {
                      var g = Math.min(c, h.length - b),
                        w = h.slice(b, b + g);
                      return (
                        d
                          ? Promise.resolve([])
                          : i.getMany({ trans: r, keys: w, cache: 'immutable' })
                      ).then(function (x) {
                        var E = [],
                          _ = [],
                          O = a ? [] : null,
                          S = d ? w : [];
                        if (!d)
                          for (var P = 0; P < g; ++P) {
                            var A = x[P],
                              D = { value: pe(A), primKey: h[b + P] };
                            o.call(D, D.value, D) !== !1 &&
                              (D.value == null
                                ? S.push(h[b + P])
                                : a || B(u(A), u(D.value)) === 0
                                  ? (_.push(D.value), a && O.push(h[b + P]))
                                  : (S.push(h[b + P]), E.push(D.value)));
                          }
                        return Promise.resolve(
                          0 < E.length &&
                            i
                              .mutate({ trans: r, type: 'add', values: E })
                              .then(function (I) {
                                for (var q in I.failures)
                                  S.splice(parseInt(q), 1);
                                p(E.length, I);
                              }),
                        )
                          .then(function () {
                            return (
                              (0 < _.length || (y && typeof e == 'object')) &&
                              i
                                .mutate({
                                  trans: r,
                                  type: 'put',
                                  keys: O,
                                  values: _,
                                  criteria: y,
                                  changeSpec: typeof e != 'function' && e,
                                  isAdditionalChunk: 0 < b,
                                })
                                .then(function (I) {
                                  return p(_.length, I);
                                })
                            );
                          })
                          .then(function () {
                            return (
                              (0 < S.length || (y && d)) &&
                              i
                                .mutate({
                                  trans: r,
                                  type: 'delete',
                                  keys: S,
                                  criteria: y,
                                  isAdditionalChunk: 0 < b,
                                })
                                .then(function (I) {
                                  return Gt(n.table, S, I);
                                })
                                .then(function (I) {
                                  return p(S.length, I);
                                })
                            );
                          })
                          .then(function () {
                            return h.length > b + g && m(b + c);
                          });
                      });
                    }
                    var y = bt(n) &&
                      n.limit === 1 / 0 &&
                      (typeof e != 'function' || d) && {
                        index: n.index,
                        range: n.range,
                      };
                    return m(0).then(function () {
                      if (0 < s.length)
                        throw new ht(
                          'Error modifying one or more objects',
                          s,
                          v,
                          f,
                        );
                      return h.length;
                    });
                  });
              });
            }),
            (F.prototype.delete = function () {
              var e = this._ctx,
                t = e.range;
              return !bt(e) ||
                e.table.schema.yProps ||
                (!e.isPrimKey && t.type !== 3)
                ? this.modify(wr)
                : this._write(function (n) {
                    var r = e.table.core.schema.primaryKey,
                      o = t;
                    return e.table.core
                      .count({ trans: n, query: { index: r, range: o } })
                      .then(function (i) {
                        return e.table.core
                          .mutate({ trans: n, type: 'deleteRange', range: o })
                          .then(function (c) {
                            var u = c.failures,
                              c = c.numFailures;
                            if (c)
                              throw new ht(
                                'Could not delete some values',
                                Object.keys(u).map(function (l) {
                                  return u[l];
                                }),
                                i - c,
                              );
                            return i - c;
                          });
                      });
                  });
            }),
            F);
          function F() {}
          var wr = function (e, t) {
            return (t.value = null);
          };
          function Hr(e, t) {
            return e < t ? -1 : e === t ? 0 : 1;
          }
          function Jr(e, t) {
            return t < e ? -1 : e === t ? 0 : 1;
          }
          function le(e, t, n) {
            return (
              (e = e instanceof xr ? new e.Collection(e) : e),
              (e._ctx.error = new (n || TypeError)(t)),
              e
            );
          }
          function gt(e) {
            return new e.Collection(e, function () {
              return _r('');
            }).limit(0);
          }
          function Ht(e, t, n, r) {
            var o,
              i,
              a,
              u,
              c,
              l,
              p,
              s = n.length;
            if (
              !n.every(function (d) {
                return typeof d == 'string';
              })
            )
              return le(e, lr);
            function v(d) {
              ((o =
                d === 'next'
                  ? function (m) {
                      return m.toUpperCase();
                    }
                  : function (m) {
                      return m.toLowerCase();
                    }),
                (i =
                  d === 'next'
                    ? function (m) {
                        return m.toLowerCase();
                      }
                    : function (m) {
                        return m.toUpperCase();
                      }),
                (a = d === 'next' ? Hr : Jr));
              var h = n
                .map(function (m) {
                  return { lower: i(m), upper: o(m) };
                })
                .sort(function (m, y) {
                  return a(m.lower, y.lower);
                });
              ((u = h.map(function (m) {
                return m.upper;
              })),
                (c = h.map(function (m) {
                  return m.lower;
                })),
                (p = (l = d) === 'next' ? '' : r));
            }
            (v('next'),
              (e = new e.Collection(e, function () {
                return Ue(u[0], c[s - 1] + r);
              })),
              (e._ondirectionchange = function (d) {
                v(d);
              }));
            var f = 0;
            return (
              e._addAlgorithm(function (d, h, m) {
                var y = d.key;
                if (typeof y != 'string') return !1;
                var b = i(y);
                if (t(b, c, f)) return !0;
                for (var g = null, w = f; w < s; ++w) {
                  var x = (function (E, _, O, S, P, A) {
                    for (
                      var D = Math.min(E.length, S.length), I = -1, q = 0;
                      q < D;
                      ++q
                    ) {
                      var fe = _[q];
                      if (fe !== S[q])
                        return P(E[q], O[q]) < 0
                          ? E.substr(0, q) + O[q] + O.substr(q + 1)
                          : P(E[q], S[q]) < 0
                            ? E.substr(0, q) + S[q] + O.substr(q + 1)
                            : 0 <= I
                              ? E.substr(0, I) + _[I] + O.substr(I + 1)
                              : null;
                      P(E[q], fe) < 0 && (I = q);
                    }
                    return D < S.length && A === 'next'
                      ? E + O.substr(E.length)
                      : D < E.length && A === 'prev'
                        ? E.substr(0, O.length)
                        : I < 0
                          ? null
                          : E.substr(0, I) + S[I] + O.substr(I + 1);
                  })(y, b, u[w], c[w], a, l);
                  x === null && g === null
                    ? (f = w + 1)
                    : (g === null || 0 < a(g, x)) && (g = x);
                }
                return (
                  h(
                    g !== null
                      ? function () {
                          d.continue(g + p);
                        }
                      : m,
                  ),
                  !1
                );
              }),
              e
            );
          }
          function Ue(e, t, n, r) {
            return { type: 2, lower: e, upper: t, lowerOpen: n, upperOpen: r };
          }
          function _r(e) {
            return { type: 1, lower: e, upper: e };
          }
          var xr =
            (Object.defineProperty(X.prototype, 'Collection', {
              get: function () {
                return this._ctx.table.db.Collection;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (X.prototype.between = function (e, t, n, r) {
              ((n = n !== !1), (r = r === !0));
              try {
                return 0 < this._cmp(e, t) ||
                  (this._cmp(e, t) === 0 && (n || r) && (!n || !r))
                  ? gt(this)
                  : new this.Collection(this, function () {
                      return Ue(e, t, !n, !r);
                    });
              } catch {
                return le(this, Te);
              }
            }),
            (X.prototype.equals = function (e) {
              return e == null
                ? le(this, Te)
                : new this.Collection(this, function () {
                    return _r(e);
                  });
            }),
            (X.prototype.above = function (e) {
              return e == null
                ? le(this, Te)
                : new this.Collection(this, function () {
                    return Ue(e, void 0, !0);
                  });
            }),
            (X.prototype.aboveOrEqual = function (e) {
              return e == null
                ? le(this, Te)
                : new this.Collection(this, function () {
                    return Ue(e, void 0, !1);
                  });
            }),
            (X.prototype.below = function (e) {
              return e == null
                ? le(this, Te)
                : new this.Collection(this, function () {
                    return Ue(void 0, e, !1, !0);
                  });
            }),
            (X.prototype.belowOrEqual = function (e) {
              return e == null
                ? le(this, Te)
                : new this.Collection(this, function () {
                    return Ue(void 0, e);
                  });
            }),
            (X.prototype.startsWith = function (e) {
              return typeof e != 'string'
                ? le(this, lr)
                : this.between(e, e + tt, !0, !0);
            }),
            (X.prototype.startsWithIgnoreCase = function (e) {
              return e === ''
                ? this.startsWith(e)
                : Ht(
                    this,
                    function (t, n) {
                      return t.indexOf(n[0]) === 0;
                    },
                    [e],
                    tt,
                  );
            }),
            (X.prototype.equalsIgnoreCase = function (e) {
              return Ht(
                this,
                function (t, n) {
                  return t === n[0];
                },
                [e],
                '',
              );
            }),
            (X.prototype.anyOfIgnoreCase = function () {
              var e = ce.apply(Se, arguments);
              return e.length === 0
                ? gt(this)
                : Ht(
                    this,
                    function (t, n) {
                      return n.indexOf(t) !== -1;
                    },
                    e,
                    '',
                  );
            }),
            (X.prototype.startsWithAnyOfIgnoreCase = function () {
              var e = ce.apply(Se, arguments);
              return e.length === 0
                ? gt(this)
                : Ht(
                    this,
                    function (t, n) {
                      return n.some(function (r) {
                        return t.indexOf(r) === 0;
                      });
                    },
                    e,
                    tt,
                  );
            }),
            (X.prototype.anyOf = function () {
              var e = this,
                t = ce.apply(Se, arguments),
                n = this._cmp;
              try {
                t.sort(n);
              } catch {
                return le(this, Te);
              }
              if (t.length === 0) return gt(this);
              var r = new this.Collection(this, function () {
                return Ue(t[0], t[t.length - 1]);
              });
              r._ondirectionchange = function (i) {
                ((n = i === 'next' ? e._ascending : e._descending), t.sort(n));
              };
              var o = 0;
              return (
                r._addAlgorithm(function (i, a, u) {
                  for (var c = i.key; 0 < n(c, t[o]); )
                    if (++o === t.length) return (a(u), !1);
                  return (
                    n(c, t[o]) === 0 ||
                    (a(function () {
                      i.continue(t[o]);
                    }),
                    !1)
                  );
                }),
                r
              );
            }),
            (X.prototype.notEqual = function (e) {
              return this.inAnyRange(
                [
                  [-1 / 0, e],
                  [e, this.db._maxKey],
                ],
                { includeLowers: !1, includeUppers: !1 },
              );
            }),
            (X.prototype.noneOf = function () {
              var e = ce.apply(Se, arguments);
              if (e.length === 0) return new this.Collection(this);
              try {
                e.sort(this._ascending);
              } catch {
                return le(this, Te);
              }
              var t = e.reduce(function (n, r) {
                return n ? n.concat([[n[n.length - 1][1], r]]) : [[-1 / 0, r]];
              }, null);
              return (
                t.push([e[e.length - 1], this.db._maxKey]),
                this.inAnyRange(t, { includeLowers: !1, includeUppers: !1 })
              );
            }),
            (X.prototype.inAnyRange = function (y, t) {
              var n = this,
                r = this._cmp,
                o = this._ascending,
                i = this._descending,
                a = this._min,
                u = this._max;
              if (y.length === 0) return gt(this);
              if (
                !y.every(function (b) {
                  return (
                    b[0] !== void 0 && b[1] !== void 0 && o(b[0], b[1]) <= 0
                  );
                })
              )
                return le(
                  this,
                  'First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower',
                  k.InvalidArgument,
                );
              var c = !t || t.includeLowers !== !1,
                l = t && t.includeUppers === !0,
                p,
                s = o;
              function v(b, g) {
                return s(b[0], g[0]);
              }
              try {
                (p = y.reduce(function (b, g) {
                  for (var w = 0, x = b.length; w < x; ++w) {
                    var E = b[w];
                    if (r(g[0], E[1]) < 0 && 0 < r(g[1], E[0])) {
                      ((E[0] = a(E[0], g[0])), (E[1] = u(E[1], g[1])));
                      break;
                    }
                  }
                  return (w === x && b.push(g), b);
                }, [])).sort(v);
              } catch {
                return le(this, Te);
              }
              var f = 0,
                d = l
                  ? function (b) {
                      return 0 < o(b, p[f][1]);
                    }
                  : function (b) {
                      return 0 <= o(b, p[f][1]);
                    },
                h = c
                  ? function (b) {
                      return 0 < i(b, p[f][0]);
                    }
                  : function (b) {
                      return 0 <= i(b, p[f][0]);
                    },
                m = d,
                y = new this.Collection(this, function () {
                  return Ue(p[0][0], p[p.length - 1][1], !c, !l);
                });
              return (
                (y._ondirectionchange = function (b) {
                  ((s = b === 'next' ? ((m = d), o) : ((m = h), i)), p.sort(v));
                }),
                y._addAlgorithm(function (b, g, w) {
                  for (var x, E = b.key; m(E); )
                    if (++f === p.length) return (g(w), !1);
                  return (
                    (!d((x = E)) && !h(x)) ||
                    (n._cmp(E, p[f][1]) === 0 ||
                      n._cmp(E, p[f][0]) === 0 ||
                      g(function () {
                        s === o ? b.continue(p[f][0]) : b.continue(p[f][1]);
                      }),
                    !1)
                  );
                }),
                y
              );
            }),
            (X.prototype.startsWithAnyOf = function () {
              var e = ce.apply(Se, arguments);
              return e.every(function (t) {
                return typeof t == 'string';
              })
                ? e.length === 0
                  ? gt(this)
                  : this.inAnyRange(
                      e.map(function (t) {
                        return [t, t + tt];
                      }),
                    )
                : le(this, 'startsWithAnyOf() only works with strings');
            }),
            X);
          function X() {}
          function ke(e) {
            return V(function (t) {
              return (jt(t), e(t.target.error), !1);
            });
          }
          function jt(e) {
            (e.stopPropagation && e.stopPropagation(),
              e.preventDefault && e.preventDefault());
          }
          var Ct = 'storagemutated',
            qn = 'x-storagemutated-1',
            ze = Kt(null, Ct),
            Zr =
              ((Oe.prototype._lock = function () {
                return (
                  ge(!j.global),
                  ++this._reculock,
                  this._reculock !== 1 || j.global || (j.lockOwnerFor = this),
                  this
                );
              }),
              (Oe.prototype._unlock = function () {
                if ((ge(!j.global), --this._reculock == 0))
                  for (
                    j.global || (j.lockOwnerFor = null);
                    0 < this._blockedFuncs.length && !this._locked();

                  ) {
                    var e = this._blockedFuncs.shift();
                    try {
                      et(e[1], e[0]);
                    } catch {}
                  }
                return this;
              }),
              (Oe.prototype._locked = function () {
                return this._reculock && j.lockOwnerFor !== this;
              }),
              (Oe.prototype.create = function (e) {
                var t = this;
                if (!this.mode) return this;
                var n = this.db.idbdb,
                  r = this.db._state.dbOpenError;
                if ((ge(!this.idbtrans), !e && !n))
                  switch (r && r.name) {
                    case 'DatabaseClosedError':
                      throw new k.DatabaseClosed(r);
                    case 'MissingAPIError':
                      throw new k.MissingAPI(r.message, r);
                    default:
                      throw new k.OpenFailed(r);
                  }
                if (!this.active) throw new k.TransactionInactive();
                return (
                  ge(this._completion._state === null),
                  ((e = this.idbtrans =
                    e ||
                    (this.db.core || n).transaction(
                      this.storeNames,
                      this.mode,
                      { durability: this.chromeTransactionDurability },
                    )).onerror = V(function (o) {
                    (jt(o), t._reject(e.error));
                  })),
                  (e.onabort = V(function (o) {
                    (jt(o),
                      t.active && t._reject(new k.Abort(e.error)),
                      (t.active = !1),
                      t.on('abort').fire(o));
                  })),
                  (e.oncomplete = V(function () {
                    ((t.active = !1),
                      t._resolve(),
                      'mutatedParts' in e &&
                        ze.storagemutated.fire(e.mutatedParts));
                  })),
                  this
                );
              }),
              (Oe.prototype._promise = function (e, t, n) {
                var r = this;
                if (e === 'readwrite' && this.mode !== 'readwrite')
                  return W(new k.ReadOnly('Transaction is readonly'));
                if (!this.active) return W(new k.TransactionInactive());
                if (this._locked())
                  return new K(function (i, a) {
                    r._blockedFuncs.push([
                      function () {
                        r._promise(e, t, n).then(i, a);
                      },
                      j,
                    ]);
                  });
                if (n)
                  return Me(function () {
                    var i = new K(function (a, u) {
                      r._lock();
                      var c = t(a, u, r);
                      c && c.then && c.then(a, u);
                    });
                    return (
                      i.finally(function () {
                        return r._unlock();
                      }),
                      (i._lib = !0),
                      i
                    );
                  });
                var o = new K(function (i, a) {
                  var u = t(i, a, r);
                  u && u.then && u.then(i, a);
                });
                return ((o._lib = !0), o);
              }),
              (Oe.prototype._root = function () {
                return this.parent ? this.parent._root() : this;
              }),
              (Oe.prototype.waitFor = function (e) {
                var t,
                  n = this._root(),
                  r = K.resolve(e);
                n._waitingFor
                  ? (n._waitingFor = n._waitingFor.then(function () {
                      return r;
                    }))
                  : ((n._waitingFor = r),
                    (n._waitingQueue = []),
                    (t = n.idbtrans.objectStore(n.storeNames[0])),
                    (function i() {
                      for (++n._spinCount; n._waitingQueue.length; )
                        n._waitingQueue.shift()();
                      n._waitingFor && (t.get(-1 / 0).onsuccess = i);
                    })());
                var o = n._waitingFor;
                return new K(function (i, a) {
                  r.then(
                    function (u) {
                      return n._waitingQueue.push(V(i.bind(null, u)));
                    },
                    function (u) {
                      return n._waitingQueue.push(V(a.bind(null, u)));
                    },
                  ).finally(function () {
                    n._waitingFor === o && (n._waitingFor = null);
                  });
                });
              }),
              (Oe.prototype.abort = function () {
                this.active &&
                  ((this.active = !1),
                  this.idbtrans && this.idbtrans.abort(),
                  this._reject(new k.Abort()));
              }),
              (Oe.prototype.table = function (e) {
                var t = this._memoizedTables || (this._memoizedTables = {});
                if (G(t, e)) return t[e];
                var n = this.schema[e];
                if (!n)
                  throw new k.NotFound(
                    'Table ' + e + ' not part of transaction',
                  );
                return (
                  (n = new this.db.Table(e, n, this)),
                  (n.core = this.db.core.table(e)),
                  (t[e] = n)
                );
              }),
              Oe);
          function Oe() {}
          function Bn(e, t, n, r, o, i, a, u) {
            return {
              name: e,
              keyPath: t,
              unique: n,
              multi: r,
              auto: o,
              compound: i,
              src:
                (n && !a ? '&' : '') + (r ? '*' : '') + (o ? '++' : '') + kr(t),
              type: u,
            };
          }
          function kr(e) {
            return typeof e == 'string'
              ? e
              : e
                ? '[' + [].join.call(e, '+') + ']'
                : '';
          }
          function Rn(e, t, n) {
            return {
              name: e,
              primKey: t,
              indexes: n,
              mappedClass: null,
              idxByName:
                ((r = function (o) {
                  return [o.name, o];
                }),
                n.reduce(function (o, i, a) {
                  return ((a = r(i, a)), a && (o[a[0]] = a[1]), o);
                }, {})),
            };
            var r;
          }
          var Tt = function (e) {
            try {
              return (
                e.only([[]]),
                (Tt = function () {
                  return [[]];
                }),
                [[]]
              );
            } catch {
              return (
                (Tt = function () {
                  return tt;
                }),
                tt
              );
            }
          };
          function Fn(e) {
            return e == null
              ? function () {}
              : typeof e == 'string'
                ? (t = e).split('.').length === 1
                  ? function (n) {
                      return n[t];
                    }
                  : function (n) {
                      return he(n, t);
                    }
                : function (n) {
                    return he(n, e);
                  };
            var t;
          }
          function Or(e) {
            return [].slice.call(e);
          }
          var eo = 0;
          function Dt(e) {
            return e == null
              ? ':id'
              : typeof e == 'string'
                ? e
                : '['.concat(e.join('+'), ']');
          }
          function to(e, t, c) {
            function r(m) {
              if (m.type === 3) return null;
              if (m.type === 4)
                throw new Error('Cannot convert never type to IDBKeyRange');
              var f = m.lower,
                d = m.upper,
                h = m.lowerOpen,
                m = m.upperOpen;
              return f === void 0
                ? d === void 0
                  ? null
                  : t.upperBound(d, !!m)
                : d === void 0
                  ? t.lowerBound(f, !!h)
                  : t.bound(f, d, !!h, !!m);
            }
            function o(v) {
              var f,
                d = v.name;
              return {
                name: d,
                schema: v,
                mutate: function (h) {
                  var m = h.trans,
                    y = h.type,
                    b = h.keys,
                    g = h.values,
                    w = h.range;
                  return new Promise(function (x, E) {
                    x = V(x);
                    var _ = m.objectStore(d),
                      O = _.keyPath == null,
                      S = y === 'put' || y === 'add';
                    if (!S && y !== 'delete' && y !== 'deleteRange')
                      throw new Error('Invalid operation type: ' + y);
                    var P,
                      A = (b || g || { length: 1 }).length;
                    if (b && g && b.length !== g.length)
                      throw new Error(
                        'Given keys array must have same length as given values array.',
                      );
                    if (A === 0)
                      return x({
                        numFailures: 0,
                        failures: {},
                        results: [],
                        lastResult: void 0,
                      });
                    function D(ue) {
                      (++fe, jt(ue));
                    }
                    var I = [],
                      q = [],
                      fe = 0;
                    if (y === 'deleteRange') {
                      if (w.type === 4)
                        return x({
                          numFailures: fe,
                          failures: q,
                          results: [],
                          lastResult: void 0,
                        });
                      w.type === 3
                        ? I.push((P = _.clear()))
                        : I.push((P = _.delete(r(w))));
                    } else {
                      var O = S ? (O ? [g, b] : [g, null]) : [b, null],
                        T = O[0],
                        ie = O[1];
                      if (S)
                        for (var ae = 0; ae < A; ++ae)
                          (I.push(
                            (P =
                              ie && ie[ae] !== void 0
                                ? _[y](T[ae], ie[ae])
                                : _[y](T[ae])),
                          ),
                            (P.onerror = D));
                      else
                        for (ae = 0; ae < A; ++ae)
                          (I.push((P = _[y](T[ae]))), (P.onerror = D));
                    }
                    function ln(ue) {
                      ((ue = ue.target.result),
                        I.forEach(function (it, nr) {
                          return it.error != null && (q[nr] = it.error);
                        }),
                        x({
                          numFailures: fe,
                          failures: q,
                          results:
                            y === 'delete'
                              ? b
                              : I.map(function (it) {
                                  return it.result;
                                }),
                          lastResult: ue,
                        }));
                    }
                    ((P.onerror = function (ue) {
                      (D(ue), ln(ue));
                    }),
                      (P.onsuccess = ln));
                  });
                },
                getMany: function (h) {
                  var m = h.trans,
                    y = h.keys;
                  return new Promise(function (b, g) {
                    b = V(b);
                    for (
                      var w,
                        x = m.objectStore(d),
                        E = y.length,
                        _ = new Array(E),
                        O = 0,
                        S = 0,
                        P = function (I) {
                          ((I = I.target),
                            (_[I._pos] = I.result),
                            ++S === O && b(_));
                        },
                        A = ke(g),
                        D = 0;
                      D < E;
                      ++D
                    )
                      y[D] != null &&
                        (((w = x.get(y[D]))._pos = D),
                        (w.onsuccess = P),
                        (w.onerror = A),
                        ++O);
                    O === 0 && b(_);
                  });
                },
                get: function (h) {
                  var m = h.trans,
                    y = h.key;
                  return new Promise(function (b, g) {
                    b = V(b);
                    var w = m.objectStore(d).get(y);
                    ((w.onsuccess = function (x) {
                      return b(x.target.result);
                    }),
                      (w.onerror = ke(g)));
                  });
                },
                query:
                  ((f = l),
                  function (h) {
                    return new Promise(function (m, y) {
                      m = V(m);
                      var b,
                        g,
                        w,
                        O = h.trans,
                        x = h.values,
                        E = h.limit,
                        P = h.query,
                        _ = E === 1 / 0 ? void 0 : E,
                        S = P.index,
                        P = P.range,
                        O = O.objectStore(d),
                        S = S.isPrimaryKey ? O : O.index(S.name),
                        P = r(P);
                      if (E === 0) return m({ result: [] });
                      f
                        ? (((_ = x
                            ? S.getAll(P, _)
                            : S.getAllKeys(P, _)).onsuccess = function (A) {
                            return m({ result: A.target.result });
                          }),
                          (_.onerror = ke(y)))
                        : ((b = 0),
                          (g =
                            !x && 'openKeyCursor' in S
                              ? S.openKeyCursor(P)
                              : S.openCursor(P)),
                          (w = []),
                          (g.onsuccess = function (A) {
                            var D = g.result;
                            return D
                              ? (w.push(x ? D.value : D.primaryKey),
                                ++b === E
                                  ? m({ result: w })
                                  : void D.continue())
                              : m({ result: w });
                          }),
                          (g.onerror = ke(y)));
                    });
                  }),
                openCursor: function (h) {
                  var m = h.trans,
                    y = h.values,
                    b = h.query,
                    g = h.reverse,
                    w = h.unique;
                  return new Promise(function (x, E) {
                    x = V(x);
                    var S = b.index,
                      _ = b.range,
                      O = m.objectStore(d),
                      O = S.isPrimaryKey ? O : O.index(S.name),
                      S = g
                        ? w
                          ? 'prevunique'
                          : 'prev'
                        : w
                          ? 'nextunique'
                          : 'next',
                      P =
                        !y && 'openKeyCursor' in O
                          ? O.openKeyCursor(r(_), S)
                          : O.openCursor(r(_), S);
                    ((P.onerror = ke(E)),
                      (P.onsuccess = V(function (A) {
                        var D,
                          I,
                          q,
                          fe,
                          T = P.result;
                        T
                          ? ((T.___id = ++eo),
                            (T.done = !1),
                            (D = T.continue.bind(T)),
                            (I = (I = T.continuePrimaryKey) && I.bind(T)),
                            (q = T.advance.bind(T)),
                            (fe = function () {
                              throw new Error('Cursor not stopped');
                            }),
                            (T.trans = m),
                            (T.stop =
                              T.continue =
                              T.continuePrimaryKey =
                              T.advance =
                                function () {
                                  throw new Error('Cursor not started');
                                }),
                            (T.fail = V(E)),
                            (T.next = function () {
                              var ie = this,
                                ae = 1;
                              return this.start(function () {
                                return ae-- ? ie.continue() : ie.stop();
                              }).then(function () {
                                return ie;
                              });
                            }),
                            (T.start = function (ie) {
                              function ae() {
                                if (P.result)
                                  try {
                                    ie();
                                  } catch (ue) {
                                    T.fail(ue);
                                  }
                                else
                                  ((T.done = !0),
                                    (T.start = function () {
                                      throw new Error(
                                        'Cursor behind last entry',
                                      );
                                    }),
                                    T.stop());
                              }
                              var ln = new Promise(function (ue, it) {
                                ((ue = V(ue)),
                                  (P.onerror = ke(it)),
                                  (T.fail = it),
                                  (T.stop = function (nr) {
                                    ((T.stop =
                                      T.continue =
                                      T.continuePrimaryKey =
                                      T.advance =
                                        fe),
                                      ue(nr));
                                  }));
                              });
                              return (
                                (P.onsuccess = V(function (ue) {
                                  ((P.onsuccess = ae), ae());
                                })),
                                (T.continue = D),
                                (T.continuePrimaryKey = I),
                                (T.advance = q),
                                ae(),
                                ln
                              );
                            }),
                            x(T))
                          : x(null);
                      }, E)));
                  });
                },
                count: function (h) {
                  var m = h.query,
                    y = h.trans,
                    b = m.index,
                    g = m.range;
                  return new Promise(function (w, x) {
                    var E = y.objectStore(d),
                      _ = b.isPrimaryKey ? E : E.index(b.name),
                      E = r(g),
                      _ = E ? _.count(E) : _.count();
                    ((_.onsuccess = V(function (O) {
                      return w(O.target.result);
                    })),
                      (_.onerror = ke(x)));
                  });
                },
              };
            }
            var i,
              a,
              u,
              p =
                ((a = c),
                (u = Or((i = e).objectStoreNames)),
                {
                  schema: {
                    name: i.name,
                    tables: u
                      .map(function (v) {
                        return a.objectStore(v);
                      })
                      .map(function (v) {
                        var f = v.keyPath,
                          m = v.autoIncrement,
                          d = M(f),
                          h = {},
                          m = {
                            name: v.name,
                            primaryKey: {
                              name: null,
                              isPrimaryKey: !0,
                              outbound: f == null,
                              compound: d,
                              keyPath: f,
                              autoIncrement: m,
                              unique: !0,
                              extractKey: Fn(f),
                            },
                            indexes: Or(v.indexNames)
                              .map(function (y) {
                                return v.index(y);
                              })
                              .map(function (w) {
                                var b = w.name,
                                  g = w.unique,
                                  x = w.multiEntry,
                                  w = w.keyPath,
                                  x = {
                                    name: b,
                                    compound: M(w),
                                    keyPath: w,
                                    unique: g,
                                    multiEntry: x,
                                    extractKey: Fn(w),
                                  };
                                return (h[Dt(w)] = x);
                              }),
                            getIndexByKeyPath: function (y) {
                              return h[Dt(y)];
                            },
                          };
                        return (
                          (h[':id'] = m.primaryKey),
                          f != null && (h[Dt(f)] = m.primaryKey),
                          m
                        );
                      }),
                  },
                  hasGetAll:
                    0 < u.length &&
                    'getAll' in a.objectStore(u[0]) &&
                    !(
                      typeof navigator < 'u' &&
                      /Safari/.test(navigator.userAgent) &&
                      !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                      [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] <
                        604
                    ),
                }),
              c = p.schema,
              l = p.hasGetAll,
              p = c.tables.map(o),
              s = {};
            return (
              p.forEach(function (v) {
                return (s[v.name] = v);
              }),
              {
                stack: 'dbcore',
                transaction: e.transaction.bind(e),
                table: function (v) {
                  if (!s[v])
                    throw new Error("Table '".concat(v, "' not found"));
                  return s[v];
                },
                MIN_KEY: -1 / 0,
                MAX_KEY: Tt(t),
                schema: c,
              }
            );
          }
          function no(e, t, n, r) {
            var o = n.IDBKeyRange;
            return (
              n.indexedDB,
              {
                dbcore:
                  ((r = to(t, o, r)),
                  e.dbcore.reduce(function (i, a) {
                    return ((a = a.create), C(C({}, i), a(i)));
                  }, r)),
              }
            );
          }
          function Jt(e, r) {
            var n = r.db,
              r = no(e._middlewares, n, e._deps, r);
            ((e.core = r.dbcore),
              e.tables.forEach(function (o) {
                var i = o.name;
                e.core.schema.tables.some(function (a) {
                  return a.name === i;
                }) &&
                  ((o.core = e.core.table(i)),
                  e[i] instanceof e.Table && (e[i].core = o.core));
              }));
          }
          function Zt(e, t, n, r) {
            n.forEach(function (o) {
              var i = r[o];
              t.forEach(function (a) {
                var u = (function c(l, p) {
                  return pn(l, p) || ((l = de(l)) && c(l, p));
                })(a, o);
                (!u || ('value' in u && u.value === void 0)) &&
                  (a === e.Transaction.prototype || a instanceof e.Transaction
                    ? be(a, o, {
                        get: function () {
                          return this.table(o);
                        },
                        set: function (c) {
                          Bt(this, o, {
                            value: c,
                            writable: !0,
                            configurable: !0,
                            enumerable: !0,
                          });
                        },
                      })
                    : (a[o] = new e.Table(o, i)));
              });
            });
          }
          function Mn(e, t) {
            t.forEach(function (n) {
              for (var r in n) n[r] instanceof e.Table && delete n[r];
            });
          }
          function ro(e, t) {
            return e._cfg.version - t._cfg.version;
          }
          function oo(e, t, n, r) {
            var o = e._dbSchema;
            n.objectStoreNames.contains('$meta') &&
              !o.$meta &&
              ((o.$meta = Rn('$meta', Er('')[0], [])),
              e._storeNames.push('$meta'));
            var i = e._createTransaction('readwrite', e._storeNames, o);
            (i.create(n), i._completion.catch(r));
            var a = i._reject.bind(i),
              u = j.transless || j;
            Me(function () {
              return (
                (j.trans = i),
                (j.transless = u),
                t !== 0
                  ? (Jt(e, n),
                    (l = t),
                    ((c = i).storeNames.includes('$meta')
                      ? c
                          .table('$meta')
                          .get('version')
                          .then(function (p) {
                            return p ?? l;
                          })
                      : K.resolve(l)
                    )
                      .then(function (p) {
                        return (
                          (v = p),
                          (f = i),
                          (d = n),
                          (h = []),
                          (p = (s = e)._versions),
                          (m = s._dbSchema = tn(0, s.idbdb, d)),
                          (p = p.filter(function (y) {
                            return y._cfg.version >= v;
                          })).length !== 0
                            ? (p.forEach(function (y) {
                                (h.push(function () {
                                  var b = m,
                                    g = y._cfg.dbschema;
                                  (nn(s, b, d),
                                    nn(s, g, d),
                                    (m = s._dbSchema = g));
                                  var w = Nn(b, g);
                                  (w.add.forEach(function (S) {
                                    Ln(d, S[0], S[1].primKey, S[1].indexes);
                                  }),
                                    w.change.forEach(function (S) {
                                      if (S.recreate)
                                        throw new k.Upgrade(
                                          'Not yet support for changing primary key',
                                        );
                                      var P = d.objectStore(S.name);
                                      (S.add.forEach(function (A) {
                                        return en(P, A);
                                      }),
                                        S.change.forEach(function (A) {
                                          (P.deleteIndex(A.name), en(P, A));
                                        }),
                                        S.del.forEach(function (A) {
                                          return P.deleteIndex(A);
                                        }));
                                    }));
                                  var x = y._cfg.contentUpgrade;
                                  if (x && y._cfg.version > v) {
                                    (Jt(s, d), (f._memoizedTables = {}));
                                    var E = lt(g);
                                    (w.del.forEach(function (S) {
                                      E[S] = b[S];
                                    }),
                                      Mn(s, [s.Transaction.prototype]),
                                      Zt(s, [s.Transaction.prototype], L(E), E),
                                      (f.schema = E));
                                    var _,
                                      O = Ke(x);
                                    return (
                                      O && vt(),
                                      (w = K.follow(function () {
                                        var S;
                                        (_ = x(f)) &&
                                          O &&
                                          ((S = Ne.bind(null, null)),
                                          _.then(S, S));
                                      })),
                                      _ && typeof _.then == 'function'
                                        ? K.resolve(_)
                                        : w.then(function () {
                                            return _;
                                          })
                                    );
                                  }
                                }),
                                  h.push(function (b) {
                                    var g,
                                      w,
                                      x = y._cfg.dbschema;
                                    ((g = x),
                                      (w = b),
                                      [].slice
                                        .call(w.db.objectStoreNames)
                                        .forEach(function (E) {
                                          return (
                                            g[E] == null &&
                                            w.db.deleteObjectStore(E)
                                          );
                                        }),
                                      Mn(s, [s.Transaction.prototype]),
                                      Zt(
                                        s,
                                        [s.Transaction.prototype],
                                        s._storeNames,
                                        s._dbSchema,
                                      ),
                                      (f.schema = s._dbSchema));
                                  }),
                                  h.push(function (b) {
                                    s.idbdb.objectStoreNames.contains(
                                      '$meta',
                                    ) &&
                                      (Math.ceil(s.idbdb.version / 10) ===
                                      y._cfg.version
                                        ? (s.idbdb.deleteObjectStore('$meta'),
                                          delete s._dbSchema.$meta,
                                          (s._storeNames = s._storeNames.filter(
                                            function (g) {
                                              return g !== '$meta';
                                            },
                                          )))
                                        : b
                                            .objectStore('$meta')
                                            .put(y._cfg.version, 'version'));
                                  }));
                              }),
                              (function y() {
                                return h.length
                                  ? K.resolve(h.shift()(f.idbtrans)).then(y)
                                  : K.resolve();
                              })().then(function () {
                                Pr(m, d);
                              }))
                            : K.resolve()
                        );
                        var s, v, f, d, h, m;
                      })
                      .catch(a))
                  : (L(o).forEach(function (p) {
                      Ln(n, p, o[p].primKey, o[p].indexes);
                    }),
                    Jt(e, n),
                    void K.follow(function () {
                      return e.on.populate.fire(i);
                    }).catch(a))
              );
              var c, l;
            });
          }
          function io(e, t) {
            (Pr(e._dbSchema, t),
              t.db.version % 10 != 0 ||
                t.objectStoreNames.contains('$meta') ||
                t.db
                  .createObjectStore('$meta')
                  .add(Math.ceil(t.db.version / 10 - 1), 'version'));
            var n = tn(0, e.idbdb, t);
            nn(e, e._dbSchema, t);
            for (var r = 0, o = Nn(n, e._dbSchema).change; r < o.length; r++) {
              var i = (function (a) {
                if (a.change.length || a.recreate)
                  return (
                    console.warn(
                      'Unable to patch indexes of table '.concat(
                        a.name,
                        ' because it has changes on the type of index or primary key.',
                      ),
                    ),
                    { value: void 0 }
                  );
                var u = t.objectStore(a.name);
                a.add.forEach(function (c) {
                  (xe &&
                    console.debug(
                      'Dexie upgrade patch: Creating missing index '
                        .concat(a.name, '.')
                        .concat(c.src),
                    ),
                    en(u, c));
                });
              })(o[r]);
              if (typeof i == 'object') return i.value;
            }
          }
          function Nn(e, t) {
            var n,
              r = { del: [], add: [], change: [] };
            for (n in e) t[n] || r.del.push(n);
            for (n in t) {
              var o = e[n],
                i = t[n];
              if (o) {
                var a = {
                  name: n,
                  def: i,
                  recreate: !1,
                  del: [],
                  add: [],
                  change: [],
                };
                if (
                  '' + (o.primKey.keyPath || '') !=
                    '' + (i.primKey.keyPath || '') ||
                  o.primKey.auto !== i.primKey.auto
                )
                  ((a.recreate = !0), r.change.push(a));
                else {
                  var u = o.idxByName,
                    c = i.idxByName,
                    l = void 0;
                  for (l in u) c[l] || a.del.push(l);
                  for (l in c) {
                    var p = u[l],
                      s = c[l];
                    p ? p.src !== s.src && a.change.push(s) : a.add.push(s);
                  }
                  (0 < a.del.length ||
                    0 < a.add.length ||
                    0 < a.change.length) &&
                    r.change.push(a);
                }
              } else r.add.push([n, i]);
            }
            return r;
          }
          function Ln(e, t, n, r) {
            var o = e.db.createObjectStore(
              t,
              n.keyPath
                ? { keyPath: n.keyPath, autoIncrement: n.auto }
                : { autoIncrement: n.auto },
            );
            return (
              r.forEach(function (i) {
                return en(o, i);
              }),
              o
            );
          }
          function Pr(e, t) {
            L(e).forEach(function (n) {
              t.db.objectStoreNames.contains(n) ||
                (xe && console.debug('Dexie: Creating missing table', n),
                Ln(t, n, e[n].primKey, e[n].indexes));
            });
          }
          function en(e, t) {
            e.createIndex(t.name, t.keyPath, {
              unique: t.unique,
              multiEntry: t.multi,
            });
          }
          function tn(e, t, n) {
            var r = {};
            return (
              st(t.objectStoreNames, 0).forEach(function (o) {
                for (
                  var i = n.objectStore(o),
                    a = Bn(
                      kr((l = i.keyPath)),
                      l || '',
                      !0,
                      !1,
                      !!i.autoIncrement,
                      l && typeof l != 'string',
                      !0,
                    ),
                    u = [],
                    c = 0;
                  c < i.indexNames.length;
                  ++c
                ) {
                  var p = i.index(i.indexNames[c]),
                    l = p.keyPath,
                    p = Bn(
                      p.name,
                      l,
                      !!p.unique,
                      !!p.multiEntry,
                      !1,
                      l && typeof l != 'string',
                      !1,
                    );
                  u.push(p);
                }
                r[o] = Rn(o, a, u);
              }),
              r
            );
          }
          function nn(e, t, n) {
            for (var r = n.db.objectStoreNames, o = 0; o < r.length; ++o) {
              var i = r[o],
                a = n.objectStore(i);
              e._hasGetAll = 'getAll' in a;
              for (var u = 0; u < a.indexNames.length; ++u) {
                var c = a.indexNames[u],
                  l = a.index(c).keyPath,
                  p = typeof l == 'string' ? l : '[' + st(l).join('+') + ']';
                !t[i] ||
                  ((l = t[i].idxByName[p]) &&
                    ((l.name = c),
                    delete t[i].idxByName[p],
                    (t[i].idxByName[c] = l)));
              }
            }
            typeof navigator < 'u' &&
              /Safari/.test(navigator.userAgent) &&
              !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
              N.WorkerGlobalScope &&
              N instanceof N.WorkerGlobalScope &&
              [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 &&
              (e._hasGetAll = !1);
          }
          function Er(e) {
            return e.split(',').map(function (t, n) {
              var i = t.split(':'),
                r = (o = i[1]) === null || o === void 0 ? void 0 : o.trim(),
                o = (t = i[0].trim()).replace(/([&*]|\+\+)/g, ''),
                i = /^\[/.test(o) ? o.match(/^\[(.*)\]$/)[1].split('+') : o;
              return Bn(
                o,
                i || null,
                /\&/.test(t),
                /\*/.test(t),
                /\+\+/.test(t),
                M(i),
                n === 0,
                r,
              );
            });
          }
          var ao =
            ((wt.prototype._createTableSchema = Rn),
            (wt.prototype._parseIndexSyntax = Er),
            (wt.prototype._parseStoresSpec = function (e, t) {
              var n = this;
              L(e).forEach(function (r) {
                if (e[r] !== null) {
                  var o = n._parseIndexSyntax(e[r]),
                    i = o.shift();
                  if (!i)
                    throw new k.Schema(
                      'Invalid schema for table ' + r + ': ' + e[r],
                    );
                  if (((i.unique = !0), i.multi))
                    throw new k.Schema('Primary key cannot be multiEntry*');
                  (o.forEach(function (a) {
                    if (a.auto)
                      throw new k.Schema(
                        'Only primary key can be marked as autoIncrement (++)',
                      );
                    if (!a.keyPath)
                      throw new k.Schema(
                        'Index must have a name and cannot be an empty string',
                      );
                  }),
                    (o = n._createTableSchema(r, i, o)),
                    (t[r] = o));
                }
              });
            }),
            (wt.prototype.stores = function (n) {
              var t = this.db;
              this._cfg.storesSource = this._cfg.storesSource
                ? Y(this._cfg.storesSource, n)
                : n;
              var n = t._versions,
                r = {},
                o = {};
              return (
                n.forEach(function (i) {
                  (Y(r, i._cfg.storesSource),
                    (o = i._cfg.dbschema = {}),
                    i._parseStoresSpec(r, o));
                }),
                (t._dbSchema = o),
                Mn(t, [t._allTables, t, t.Transaction.prototype]),
                Zt(
                  t,
                  [t._allTables, t, t.Transaction.prototype, this._cfg.tables],
                  L(o),
                  o,
                ),
                (t._storeNames = L(o)),
                this
              );
            }),
            (wt.prototype.upgrade = function (e) {
              return (
                (this._cfg.contentUpgrade = xn(
                  this._cfg.contentUpgrade || R,
                  e,
                )),
                this
              );
            }),
            wt);
          function wt() {}
          function Un(e, t) {
            var n = e._dbNamesDB;
            return (
              n ||
                (n = e._dbNamesDB =
                  new De(Wt, { addons: [], indexedDB: e, IDBKeyRange: t }))
                  .version(1)
                  .stores({ dbnames: 'name' }),
              n.table('dbnames')
            );
          }
          function zn(e) {
            return e && typeof e.databases == 'function';
          }
          function Vn(e) {
            return Me(function () {
              return ((j.letThrough = !0), e());
            });
          }
          function Yn(e) {
            return !('from' in e);
          }
          var oe = function (e, t) {
            if (!this) {
              var n = new oe();
              return (e && 'd' in e && Y(n, e), n);
            }
            Y(
              this,
              arguments.length
                ? { d: 1, from: e, to: 1 < arguments.length ? t : e }
                : { d: 0 },
            );
          };
          function It(e, t, n) {
            var r = B(t, n);
            if (!isNaN(r)) {
              if (0 < r) throw RangeError();
              if (Yn(e)) return Y(e, { from: t, to: n, d: 1 });
              var o = e.l,
                r = e.r;
              if (B(n, e.from) < 0)
                return (
                  o
                    ? It(o, t, n)
                    : (e.l = { from: t, to: n, d: 1, l: null, r: null }),
                  Kr(e)
                );
              if (0 < B(t, e.to))
                return (
                  r
                    ? It(r, t, n)
                    : (e.r = { from: t, to: n, d: 1, l: null, r: null }),
                  Kr(e)
                );
              (B(t, e.from) < 0 &&
                ((e.from = t), (e.l = null), (e.d = r ? r.d + 1 : 1)),
                0 < B(n, e.to) &&
                  ((e.to = n), (e.r = null), (e.d = e.l ? e.l.d + 1 : 1)),
                (n = !e.r),
                o && !e.l && qt(e, o),
                r && n && qt(e, r));
            }
          }
          function qt(e, t) {
            Yn(t) ||
              (function n(r, c) {
                var i = c.from,
                  a = c.to,
                  u = c.l,
                  c = c.r;
                (It(r, i, a), u && n(r, u), c && n(r, c));
              })(e, t);
          }
          function Sr(e, t) {
            var n = rn(t),
              r = n.next();
            if (r.done) return !1;
            for (
              var o = r.value, i = rn(e), a = i.next(o.from), u = a.value;
              !r.done && !a.done;

            ) {
              if (B(u.from, o.to) <= 0 && 0 <= B(u.to, o.from)) return !0;
              B(o.from, u.from) < 0
                ? (o = (r = n.next(u.from)).value)
                : (u = (a = i.next(o.from)).value);
            }
            return !1;
          }
          function rn(e) {
            var t = Yn(e) ? null : { s: 0, n: e };
            return {
              next: function (n) {
                for (var r = 0 < arguments.length; t; )
                  switch (t.s) {
                    case 0:
                      if (((t.s = 1), r))
                        for (; t.n.l && B(n, t.n.from) < 0; )
                          t = { up: t, n: t.n.l, s: 1 };
                      else for (; t.n.l; ) t = { up: t, n: t.n.l, s: 1 };
                    case 1:
                      if (((t.s = 2), !r || B(n, t.n.to) <= 0))
                        return { value: t.n, done: !1 };
                    case 2:
                      if (t.n.r) {
                        ((t.s = 3), (t = { up: t, n: t.n.r, s: 0 }));
                        continue;
                      }
                    case 3:
                      t = t.up;
                  }
                return { done: !0 };
              },
            };
          }
          function Kr(e) {
            var t,
              n,
              r =
                (((t = e.r) === null || t === void 0 ? void 0 : t.d) || 0) -
                (((n = e.l) === null || n === void 0 ? void 0 : n.d) || 0),
              o = 1 < r ? 'r' : r < -1 ? 'l' : '';
            (o &&
              ((t = o == 'r' ? 'l' : 'r'),
              (n = C({}, e)),
              (r = e[o]),
              (e.from = r.from),
              (e.to = r.to),
              (e[o] = r[o]),
              (n[o] = r[t]),
              ((e[t] = n).d = Ar(n))),
              (e.d = Ar(e)));
          }
          function Ar(n) {
            var t = n.r,
              n = n.l;
            return (t ? (n ? Math.max(t.d, n.d) : t.d) : n ? n.d : 0) + 1;
          }
          function on(e, t) {
            return (
              L(t).forEach(function (n) {
                e[n]
                  ? qt(e[n], t[n])
                  : (e[n] = (function r(o) {
                      var i,
                        a,
                        u = {};
                      for (i in o)
                        G(o, i) &&
                          ((a = o[i]),
                          (u[i] =
                            !a || typeof a != 'object' || ft.has(a.constructor)
                              ? a
                              : r(a)));
                      return u;
                    })(t[n]));
              }),
              e
            );
          }
          function Wn(e, t) {
            return (
              e.all ||
              t.all ||
              Object.keys(e).some(function (n) {
                return t[n] && Sr(t[n], e[n]);
              })
            );
          }
          ye(
            oe.prototype,
            (((me = {
              add: function (e) {
                return (qt(this, e), this);
              },
              addKey: function (e) {
                return (It(this, e, e), this);
              },
              addKeys: function (e) {
                var t = this;
                return (
                  e.forEach(function (n) {
                    return It(t, n, n);
                  }),
                  this
                );
              },
              hasKey: function (e) {
                var t = rn(this).next(e).value;
                return t && B(t.from, e) <= 0 && 0 <= B(t.to, e);
              },
            })[Ee] = function () {
              return rn(this);
            }),
            me),
          );
          var rt = {},
            $n = {},
            Gn = !1;
          function an(e) {
            (on($n, e),
              Gn ||
                ((Gn = !0),
                setTimeout(function () {
                  ((Gn = !1), Qn($n, !($n = {})));
                }, 0)));
          }
          function Qn(e, t) {
            t === void 0 && (t = !1);
            var n = new Set();
            if (e.all)
              for (var r = 0, o = Object.values(rt); r < o.length; r++)
                jr((a = o[r]), e, n, t);
            else
              for (var i in e) {
                var a,
                  u = /^idb\:\/\/(.*)\/(.*)\//.exec(i);
                u &&
                  ((i = u[1]),
                  (u = u[2]),
                  (a = rt['idb://'.concat(i, '/').concat(u)]) &&
                    jr(a, e, n, t));
              }
            n.forEach(function (c) {
              return c();
            });
          }
          function jr(e, t, n, r) {
            for (
              var o = [], i = 0, a = Object.entries(e.queries.query);
              i < a.length;
              i++
            ) {
              for (
                var u = a[i], c = u[0], l = [], p = 0, s = u[1];
                p < s.length;
                p++
              ) {
                var v = s[p];
                Wn(t, v.obsSet)
                  ? v.subscribers.forEach(function (m) {
                      return n.add(m);
                    })
                  : r && l.push(v);
              }
              r && o.push([c, l]);
            }
            if (r)
              for (var f = 0, d = o; f < d.length; f++) {
                var h = d[f],
                  c = h[0],
                  l = h[1];
                e.queries.query[c] = l;
              }
          }
          function uo(e) {
            var t = e._state,
              n = e._deps.indexedDB;
            if (t.isBeingOpened || e.idbdb)
              return t.dbReadyPromise.then(function () {
                return t.dbOpenError ? W(t.dbOpenError) : e;
              });
            ((t.isBeingOpened = !0),
              (t.dbOpenError = null),
              (t.openComplete = !1));
            var r = t.openCanceller,
              o = Math.round(10 * e.verno),
              i = !1;
            function a() {
              if (t.openCanceller !== r)
                throw new k.DatabaseClosed('db.open() was cancelled');
            }
            function u() {
              return new K(function (v, f) {
                if ((a(), !n)) throw new k.MissingAPI();
                var d = e.name,
                  h = t.autoSchema || !o ? n.open(d) : n.open(d, o);
                if (!h) throw new k.MissingAPI();
                ((h.onerror = ke(f)),
                  (h.onblocked = V(e._fireOnBlocked)),
                  (h.onupgradeneeded = V(function (m) {
                    var y;
                    ((p = h.transaction),
                      t.autoSchema && !e._options.allowEmptyDB
                        ? ((h.onerror = jt),
                          p.abort(),
                          h.result.close(),
                          ((y = n.deleteDatabase(d)).onsuccess = y.onerror =
                            V(function () {
                              f(
                                new k.NoSuchDatabase(
                                  'Database '.concat(d, ' doesnt exist'),
                                ),
                              );
                            })))
                        : ((p.onerror = ke(f)),
                          (m =
                            m.oldVersion > Math.pow(2, 62) ? 0 : m.oldVersion),
                          (s = m < 1),
                          (e.idbdb = h.result),
                          i && io(e, p),
                          oo(e, m / 10, p, f)));
                  }, f)),
                  (h.onsuccess = V(function () {
                    p = null;
                    var m,
                      y,
                      b,
                      g,
                      w,
                      x = (e.idbdb = h.result),
                      E = st(x.objectStoreNames);
                    if (0 < E.length)
                      try {
                        var _ = x.transaction(
                          (g = E).length === 1 ? g[0] : g,
                          'readonly',
                        );
                        if (t.autoSchema)
                          ((y = x),
                            (b = _),
                            ((m = e).verno = y.version / 10),
                            (b = m._dbSchema = tn(0, y, b)),
                            (m._storeNames = st(y.objectStoreNames, 0)),
                            Zt(m, [m._allTables], L(b), b));
                        else if (
                          (nn(e, e._dbSchema, _),
                          ((w = Nn(tn(0, (w = e).idbdb, _), w._dbSchema)).add
                            .length ||
                            w.change.some(function (O) {
                              return O.add.length || O.change.length;
                            })) &&
                            !i)
                        )
                          return (
                            console.warn(
                              'Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.',
                            ),
                            x.close(),
                            (o = x.version + 1),
                            (i = !0),
                            v(u())
                          );
                        Jt(e, _);
                      } catch {}
                    (yt.push(e),
                      (x.onversionchange = V(function (O) {
                        ((t.vcFired = !0), e.on('versionchange').fire(O));
                      })),
                      (x.onclose = V(function () {
                        e.close({ disableAutoOpen: !1 });
                      })),
                      s &&
                        ((w = e._deps),
                        (_ = d),
                        (x = w.indexedDB),
                        (w = w.IDBKeyRange),
                        zn(x) ||
                          _ === Wt ||
                          Un(x, w).put({ name: _ }).catch(R)),
                      v());
                  }, f)));
              }).catch(function (v) {
                switch (v?.name) {
                  case 'UnknownError':
                    if (0 < t.PR1398_maxLoop)
                      return (
                        t.PR1398_maxLoop--,
                        console.warn(
                          'Dexie: Workaround for Chrome UnknownError on open()',
                        ),
                        u()
                      );
                    break;
                  case 'VersionError':
                    if (0 < o) return ((o = 0), u());
                }
                return K.reject(v);
              });
            }
            var c,
              l = t.dbReadyResolve,
              p = null,
              s = !1;
            return K.race([
              r,
              (typeof navigator > 'u'
                ? K.resolve()
                : !navigator.userAgentData &&
                    /Safari\//.test(navigator.userAgent) &&
                    !/Chrom(e|ium)\//.test(navigator.userAgent) &&
                    indexedDB.databases
                  ? new Promise(function (v) {
                      function f() {
                        return indexedDB.databases().finally(v);
                      }
                      ((c = setInterval(f, 100)), f());
                    }).finally(function () {
                      return clearInterval(c);
                    })
                  : Promise.resolve()
              ).then(u),
            ])
              .then(function () {
                return (
                  a(),
                  (t.onReadyBeingFired = []),
                  K.resolve(
                    Vn(function () {
                      return e.on.ready.fire(e.vip);
                    }),
                  ).then(function v() {
                    if (0 < t.onReadyBeingFired.length) {
                      var f = t.onReadyBeingFired.reduce(xn, R);
                      return (
                        (t.onReadyBeingFired = []),
                        K.resolve(
                          Vn(function () {
                            return f(e.vip);
                          }),
                        ).then(v)
                      );
                    }
                  })
                );
              })
              .finally(function () {
                t.openCanceller === r &&
                  ((t.onReadyBeingFired = null), (t.isBeingOpened = !1));
              })
              .catch(function (v) {
                t.dbOpenError = v;
                try {
                  p && p.abort();
                } catch {}
                return (r === t.openCanceller && e._close(), W(v));
              })
              .finally(function () {
                ((t.openComplete = !0), l());
              })
              .then(function () {
                var v;
                return (
                  s &&
                    ((v = {}),
                    e.tables.forEach(function (f) {
                      (f.schema.indexes.forEach(function (d) {
                        d.name &&
                          (v[
                            'idb://'
                              .concat(e.name, '/')
                              .concat(f.name, '/')
                              .concat(d.name)
                          ] = new oe(-1 / 0, [[[]]]));
                      }),
                        (v['idb://'.concat(e.name, '/').concat(f.name, '/')] =
                          v[
                            'idb://'
                              .concat(e.name, '/')
                              .concat(f.name, '/:dels')
                          ] =
                            new oe(-1 / 0, [[[]]])));
                    }),
                    ze(Ct).fire(v),
                    Qn(v, !0)),
                  e
                );
              });
          }
          function Xn(e) {
            function t(i) {
              return e.next(i);
            }
            var n = o(t),
              r = o(function (i) {
                return e.throw(i);
              });
            function o(i) {
              return function (c) {
                var u = i(c),
                  c = u.value;
                return u.done
                  ? c
                  : c && typeof c.then == 'function'
                    ? c.then(n, r)
                    : M(c)
                      ? Promise.all(c).then(n, r)
                      : n(c);
              };
            }
            return o(t)();
          }
          function un(e, t, n) {
            for (var r = M(e) ? e.slice() : [e], o = 0; o < n; ++o) r.push(t);
            return r;
          }
          var so = {
            stack: 'dbcore',
            name: 'VirtualIndexMiddleware',
            level: 1,
            create: function (e) {
              return C(C({}, e), {
                table: function (t) {
                  var n = e.table(t),
                    r = n.schema,
                    o = {},
                    i = [];
                  function a(s, v, f) {
                    var d = Dt(s),
                      h = (o[d] = o[d] || []),
                      m = s == null ? 0 : typeof s == 'string' ? 1 : s.length,
                      y = 0 < v,
                      y = C(C({}, f), {
                        name: y
                          ? ''.concat(d, '(virtual-from:').concat(f.name, ')')
                          : f.name,
                        lowLevelIndex: f,
                        isVirtual: y,
                        keyTail: v,
                        keyLength: m,
                        extractKey: Fn(s),
                        unique: !y && f.unique,
                      });
                    return (
                      h.push(y),
                      y.isPrimaryKey || i.push(y),
                      1 < m && a(m === 2 ? s[0] : s.slice(0, m - 1), v + 1, f),
                      h.sort(function (b, g) {
                        return b.keyTail - g.keyTail;
                      }),
                      y
                    );
                  }
                  ((t = a(r.primaryKey.keyPath, 0, r.primaryKey)),
                    (o[':id'] = [t]));
                  for (var u = 0, c = r.indexes; u < c.length; u++) {
                    var l = c[u];
                    a(l.keyPath, 0, l);
                  }
                  function p(s) {
                    var v,
                      f = s.query.index;
                    return f.isVirtual
                      ? C(C({}, s), {
                          query: {
                            index: f.lowLevelIndex,
                            range:
                              ((v = s.query.range),
                              (f = f.keyTail),
                              {
                                type: v.type === 1 ? 2 : v.type,
                                lower: un(
                                  v.lower,
                                  v.lowerOpen ? e.MAX_KEY : e.MIN_KEY,
                                  f,
                                ),
                                lowerOpen: !0,
                                upper: un(
                                  v.upper,
                                  v.upperOpen ? e.MIN_KEY : e.MAX_KEY,
                                  f,
                                ),
                                upperOpen: !0,
                              }),
                          },
                        })
                      : s;
                  }
                  return C(C({}, n), {
                    schema: C(C({}, r), {
                      primaryKey: t,
                      indexes: i,
                      getIndexByKeyPath: function (s) {
                        return (s = o[Dt(s)]) && s[0];
                      },
                    }),
                    count: function (s) {
                      return n.count(p(s));
                    },
                    query: function (s) {
                      return n.query(p(s));
                    },
                    openCursor: function (s) {
                      var v = s.query.index,
                        f = v.keyTail,
                        d = v.isVirtual,
                        h = v.keyLength;
                      return d
                        ? n.openCursor(p(s)).then(function (y) {
                            return y && m(y);
                          })
                        : n.openCursor(s);
                      function m(y) {
                        return Object.create(y, {
                          continue: {
                            value: function (b) {
                              b != null
                                ? y.continue(
                                    un(b, s.reverse ? e.MAX_KEY : e.MIN_KEY, f),
                                  )
                                : s.unique
                                  ? y.continue(
                                      y.key
                                        .slice(0, h)
                                        .concat(
                                          s.reverse ? e.MIN_KEY : e.MAX_KEY,
                                          f,
                                        ),
                                    )
                                  : y.continue();
                            },
                          },
                          continuePrimaryKey: {
                            value: function (b, g) {
                              y.continuePrimaryKey(un(b, e.MAX_KEY, f), g);
                            },
                          },
                          primaryKey: {
                            get: function () {
                              return y.primaryKey;
                            },
                          },
                          key: {
                            get: function () {
                              var b = y.key;
                              return h === 1 ? b[0] : b.slice(0, h);
                            },
                          },
                          value: {
                            get: function () {
                              return y.value;
                            },
                          },
                        });
                      }
                    },
                  });
                },
              });
            },
          };
          function Hn(e, t, n, r) {
            return (
              (n = n || {}),
              (r = r || ''),
              L(e).forEach(function (o) {
                var i, a, u;
                G(t, o)
                  ? ((i = e[o]),
                    (a = t[o]),
                    typeof i == 'object' && typeof a == 'object' && i && a
                      ? (u = dt(i)) !== dt(a)
                        ? (n[r + o] = t[o])
                        : u === 'Object'
                          ? Hn(i, a, n, r + o + '.')
                          : i !== a && (n[r + o] = t[o])
                      : i !== a && (n[r + o] = t[o]))
                  : (n[r + o] = void 0);
              }),
              L(t).forEach(function (o) {
                G(e, o) || (n[r + o] = t[o]);
              }),
              n
            );
          }
          function Jn(e, t) {
            return t.type === 'delete'
              ? t.keys
              : t.keys || t.values.map(e.extractKey);
          }
          var co = {
            stack: 'dbcore',
            name: 'HooksMiddleware',
            level: 2,
            create: function (e) {
              return C(C({}, e), {
                table: function (t) {
                  var n = e.table(t),
                    r = n.schema.primaryKey;
                  return C(C({}, n), {
                    mutate: function (o) {
                      var i = j.trans,
                        a = i.table(t).hook,
                        u = a.deleting,
                        c = a.creating,
                        l = a.updating;
                      switch (o.type) {
                        case 'add':
                          if (c.fire === R) break;
                          return i._promise(
                            'readwrite',
                            function () {
                              return p(o);
                            },
                            !0,
                          );
                        case 'put':
                          if (c.fire === R && l.fire === R) break;
                          return i._promise(
                            'readwrite',
                            function () {
                              return p(o);
                            },
                            !0,
                          );
                        case 'delete':
                          if (u.fire === R) break;
                          return i._promise(
                            'readwrite',
                            function () {
                              return p(o);
                            },
                            !0,
                          );
                        case 'deleteRange':
                          if (u.fire === R) break;
                          return i._promise(
                            'readwrite',
                            function () {
                              return (function s(v, f, d) {
                                return n
                                  .query({
                                    trans: v,
                                    values: !1,
                                    query: { index: r, range: f },
                                    limit: d,
                                  })
                                  .then(function (h) {
                                    var m = h.result;
                                    return p({
                                      type: 'delete',
                                      keys: m,
                                      trans: v,
                                    }).then(function (y) {
                                      return 0 < y.numFailures
                                        ? Promise.reject(y.failures[0])
                                        : m.length < d
                                          ? {
                                              failures: [],
                                              numFailures: 0,
                                              lastResult: void 0,
                                            }
                                          : s(
                                              v,
                                              C(C({}, f), {
                                                lower: m[m.length - 1],
                                                lowerOpen: !0,
                                              }),
                                              d,
                                            );
                                    });
                                  });
                              })(o.trans, o.range, 1e4);
                            },
                            !0,
                          );
                      }
                      return n.mutate(o);
                      function p(s) {
                        var v,
                          f,
                          d,
                          h = j.trans,
                          m = s.keys || Jn(r, s);
                        if (!m) throw new Error('Keys missing');
                        return (
                          (s =
                            s.type === 'add' || s.type === 'put'
                              ? C(C({}, s), { keys: m })
                              : C({}, s)).type !== 'delete' &&
                            (s.values = H([], s.values)),
                          s.keys && (s.keys = H([], s.keys)),
                          (v = n),
                          (d = m),
                          ((f = s).type === 'add'
                            ? Promise.resolve([])
                            : v.getMany({
                                trans: f.trans,
                                keys: d,
                                cache: 'immutable',
                              })
                          ).then(function (y) {
                            var b = m.map(function (g, w) {
                              var x,
                                E,
                                _,
                                O = y[w],
                                S = { onerror: null, onsuccess: null };
                              return (
                                s.type === 'delete'
                                  ? u.fire.call(S, g, O, h)
                                  : s.type === 'add' || O === void 0
                                    ? ((x = c.fire.call(S, g, s.values[w], h)),
                                      g == null &&
                                        x != null &&
                                        ((s.keys[w] = g = x),
                                        r.outbound ||
                                          J(s.values[w], r.keyPath, g)))
                                    : ((x = Hn(O, s.values[w])),
                                      (E = l.fire.call(S, x, g, O, h)) &&
                                        ((_ = s.values[w]),
                                        Object.keys(E).forEach(function (P) {
                                          G(_, P)
                                            ? (_[P] = E[P])
                                            : J(_, P, E[P]);
                                        }))),
                                S
                              );
                            });
                            return n
                              .mutate(s)
                              .then(function (g) {
                                for (
                                  var w = g.failures,
                                    x = g.results,
                                    E = g.numFailures,
                                    g = g.lastResult,
                                    _ = 0;
                                  _ < m.length;
                                  ++_
                                ) {
                                  var O = (x || m)[_],
                                    S = b[_];
                                  O == null
                                    ? S.onerror && S.onerror(w[_])
                                    : S.onsuccess &&
                                      S.onsuccess(
                                        s.type === 'put' && y[_]
                                          ? s.values[_]
                                          : O,
                                      );
                                }
                                return {
                                  failures: w,
                                  results: x,
                                  numFailures: E,
                                  lastResult: g,
                                };
                              })
                              .catch(function (g) {
                                return (
                                  b.forEach(function (w) {
                                    return w.onerror && w.onerror(g);
                                  }),
                                  Promise.reject(g)
                                );
                              });
                          })
                        );
                      }
                    },
                  });
                },
              });
            },
          };
          function Cr(e, t, n) {
            try {
              if (!t || t.keys.length < e.length) return null;
              for (
                var r = [], o = 0, i = 0;
                o < t.keys.length && i < e.length;
                ++o
              )
                B(t.keys[o], e[i]) === 0 &&
                  (r.push(n ? pe(t.values[o]) : t.values[o]), ++i);
              return r.length === e.length ? r : null;
            } catch {
              return null;
            }
          }
          var lo = {
            stack: 'dbcore',
            level: -1,
            create: function (e) {
              return {
                table: function (t) {
                  var n = e.table(t);
                  return C(C({}, n), {
                    getMany: function (r) {
                      if (!r.cache) return n.getMany(r);
                      var o = Cr(r.keys, r.trans._cache, r.cache === 'clone');
                      return o
                        ? K.resolve(o)
                        : n.getMany(r).then(function (i) {
                            return (
                              (r.trans._cache = {
                                keys: r.keys,
                                values: r.cache === 'clone' ? pe(i) : i,
                              }),
                              i
                            );
                          });
                    },
                    mutate: function (r) {
                      return (
                        r.type !== 'add' && (r.trans._cache = null),
                        n.mutate(r)
                      );
                    },
                  });
                },
              };
            },
          };
          function Tr(e, t) {
            return (
              e.trans.mode === 'readonly' &&
              !!e.subscr &&
              !e.trans.explicit &&
              e.trans.db._options.cache !== 'disabled' &&
              !t.schema.primaryKey.outbound
            );
          }
          function Dr(e, t) {
            switch (e) {
              case 'query':
                return t.values && !t.unique;
              case 'get':
              case 'getMany':
              case 'count':
              case 'openCursor':
                return !1;
            }
          }
          var fo = {
            stack: 'dbcore',
            level: 0,
            name: 'Observability',
            create: function (e) {
              var t = e.schema.name,
                n = new oe(e.MIN_KEY, e.MAX_KEY);
              return C(C({}, e), {
                transaction: function (r, o, i) {
                  if (j.subscr && o !== 'readonly')
                    throw new k.ReadOnly(
                      'Readwrite transaction in liveQuery context. Querier source: '.concat(
                        j.querier,
                      ),
                    );
                  return e.transaction(r, o, i);
                },
                table: function (r) {
                  var o = e.table(r),
                    i = o.schema,
                    a = i.primaryKey,
                    s = i.indexes,
                    u = a.extractKey,
                    c = a.outbound,
                    l =
                      a.autoIncrement &&
                      s.filter(function (f) {
                        return f.compound && f.keyPath.includes(a.keyPath);
                      }),
                    p = C(C({}, o), {
                      mutate: function (f) {
                        function d(P) {
                          return (
                            (P = 'idb://'
                              .concat(t, '/')
                              .concat(r, '/')
                              .concat(P)),
                            g[P] || (g[P] = new oe())
                          );
                        }
                        var h,
                          m,
                          y,
                          b = f.trans,
                          g = f.mutatedParts || (f.mutatedParts = {}),
                          w = d(''),
                          x = d(':dels'),
                          E = f.type,
                          S =
                            f.type === 'deleteRange'
                              ? [f.range]
                              : f.type === 'delete'
                                ? [f.keys]
                                : f.values.length < 50
                                  ? [
                                      Jn(a, f).filter(function (P) {
                                        return P;
                                      }),
                                      f.values,
                                    ]
                                  : [],
                          _ = S[0],
                          O = S[1],
                          S = f.trans._cache;
                        return (
                          M(_)
                            ? (w.addKeys(_),
                              (S =
                                E === 'delete' || _.length === O.length
                                  ? Cr(_, S)
                                  : null) || x.addKeys(_),
                              (S || O) &&
                                ((h = d),
                                (m = S),
                                (y = O),
                                i.indexes.forEach(function (P) {
                                  var A = h(P.name || '');
                                  function D(q) {
                                    return q != null ? P.extractKey(q) : null;
                                  }
                                  function I(q) {
                                    return P.multiEntry && M(q)
                                      ? q.forEach(function (fe) {
                                          return A.addKey(fe);
                                        })
                                      : A.addKey(q);
                                  }
                                  (m || y).forEach(function (q, ie) {
                                    var T = m && D(m[ie]),
                                      ie = y && D(y[ie]);
                                    B(T, ie) !== 0 &&
                                      (T != null && I(T), ie != null && I(ie));
                                  });
                                })))
                            : _
                              ? ((O = {
                                  from:
                                    (O = _.lower) !== null && O !== void 0
                                      ? O
                                      : e.MIN_KEY,
                                  to:
                                    (O = _.upper) !== null && O !== void 0
                                      ? O
                                      : e.MAX_KEY,
                                }),
                                x.add(O),
                                w.add(O))
                              : (w.add(n),
                                x.add(n),
                                i.indexes.forEach(function (P) {
                                  return d(P.name).add(n);
                                })),
                          o.mutate(f).then(function (P) {
                            return (
                              !_ ||
                                (f.type !== 'add' && f.type !== 'put') ||
                                (w.addKeys(P.results),
                                l &&
                                  l.forEach(function (A) {
                                    for (
                                      var D = f.values.map(function (T) {
                                          return A.extractKey(T);
                                        }),
                                        I = A.keyPath.findIndex(function (T) {
                                          return T === a.keyPath;
                                        }),
                                        q = 0,
                                        fe = P.results.length;
                                      q < fe;
                                      ++q
                                    )
                                      D[q][I] = P.results[q];
                                    d(A.name).addKeys(D);
                                  })),
                              (b.mutatedParts = on(b.mutatedParts || {}, g)),
                              P
                            );
                          })
                        );
                      },
                    }),
                    s = function (d) {
                      var h = d.query,
                        d = h.index,
                        h = h.range;
                      return [
                        d,
                        new oe(
                          (d = h.lower) !== null && d !== void 0
                            ? d
                            : e.MIN_KEY,
                          (h = h.upper) !== null && h !== void 0
                            ? h
                            : e.MAX_KEY,
                        ),
                      ];
                    },
                    v = {
                      get: function (f) {
                        return [a, new oe(f.key)];
                      },
                      getMany: function (f) {
                        return [a, new oe().addKeys(f.keys)];
                      },
                      count: s,
                      query: s,
                      openCursor: s,
                    };
                  return (
                    L(v).forEach(function (f) {
                      p[f] = function (d) {
                        var h = j.subscr,
                          m = !!h,
                          y = Tr(j, o) && Dr(f, d) ? (d.obsSet = {}) : h;
                        if (m) {
                          var b = function (O) {
                              return (
                                (O = 'idb://'
                                  .concat(t, '/')
                                  .concat(r, '/')
                                  .concat(O)),
                                y[O] || (y[O] = new oe())
                              );
                            },
                            g = b(''),
                            w = b(':dels'),
                            h = v[f](d),
                            m = h[0],
                            h = h[1];
                          if (
                            ((f === 'query' && m.isPrimaryKey && !d.values
                              ? w
                              : b(m.name || '')
                            ).add(h),
                            !m.isPrimaryKey)
                          ) {
                            if (f !== 'count') {
                              var x =
                                f === 'query' &&
                                c &&
                                d.values &&
                                o.query(C(C({}, d), { values: !1 }));
                              return o[f]
                                .apply(this, arguments)
                                .then(function (O) {
                                  if (f === 'query') {
                                    if (c && d.values)
                                      return x.then(function (D) {
                                        return (
                                          (D = D.result),
                                          g.addKeys(D),
                                          O
                                        );
                                      });
                                    var S = d.values
                                      ? O.result.map(u)
                                      : O.result;
                                    (d.values ? g : w).addKeys(S);
                                  } else if (f === 'openCursor') {
                                    var P = O,
                                      A = d.values;
                                    return (
                                      P &&
                                      Object.create(P, {
                                        key: {
                                          get: function () {
                                            return (
                                              w.addKey(P.primaryKey),
                                              P.key
                                            );
                                          },
                                        },
                                        primaryKey: {
                                          get: function () {
                                            var D = P.primaryKey;
                                            return (w.addKey(D), D);
                                          },
                                        },
                                        value: {
                                          get: function () {
                                            return (
                                              A && g.addKey(P.primaryKey),
                                              P.value
                                            );
                                          },
                                        },
                                      })
                                    );
                                  }
                                  return O;
                                });
                            }
                            w.add(n);
                          }
                        }
                        return o[f].apply(this, arguments);
                      };
                    }),
                    p
                  );
                },
              });
            },
          };
          function Ir(e, t, n) {
            if (n.numFailures === 0) return t;
            if (t.type === 'deleteRange') return null;
            var r = t.keys
              ? t.keys.length
              : 'values' in t && t.values
                ? t.values.length
                : 1;
            return n.numFailures === r
              ? null
              : ((t = C({}, t)),
                M(t.keys) &&
                  (t.keys = t.keys.filter(function (o, i) {
                    return !(i in n.failures);
                  })),
                'values' in t &&
                  M(t.values) &&
                  (t.values = t.values.filter(function (o, i) {
                    return !(i in n.failures);
                  })),
                t);
          }
          function Zn(e, t) {
            return (
              (n = e),
              ((r = t).lower === void 0 ||
                (r.lowerOpen ? 0 < B(n, r.lower) : 0 <= B(n, r.lower))) &&
                ((e = e),
                (t = t).upper === void 0 ||
                  (t.upperOpen ? B(e, t.upper) < 0 : B(e, t.upper) <= 0))
            );
            var n, r;
          }
          function qr(e, t, v, r, o, i) {
            if (!v || v.length === 0) return e;
            var a = t.query.index,
              u = a.multiEntry,
              c = t.query.range,
              l = r.schema.primaryKey.extractKey,
              p = a.extractKey,
              s = (a.lowLevelIndex || a).extractKey,
              v = v.reduce(function (f, d) {
                var h = f,
                  m = [];
                if (d.type === 'add' || d.type === 'put')
                  for (var y = new oe(), b = d.values.length - 1; 0 <= b; --b) {
                    var g,
                      w = d.values[b],
                      x = l(w);
                    y.hasKey(x) ||
                      ((g = p(w)),
                      (u && M(g)
                        ? g.some(function (P) {
                            return Zn(P, c);
                          })
                        : Zn(g, c)) && (y.addKey(x), m.push(w)));
                  }
                switch (d.type) {
                  case 'add':
                    var E = new oe().addKeys(
                        t.values
                          ? f.map(function (A) {
                              return l(A);
                            })
                          : f,
                      ),
                      h = f.concat(
                        t.values
                          ? m.filter(function (A) {
                              return (
                                (A = l(A)),
                                !E.hasKey(A) && (E.addKey(A), !0)
                              );
                            })
                          : m
                              .map(function (A) {
                                return l(A);
                              })
                              .filter(function (A) {
                                return !E.hasKey(A) && (E.addKey(A), !0);
                              }),
                      );
                    break;
                  case 'put':
                    var _ = new oe().addKeys(
                      d.values.map(function (A) {
                        return l(A);
                      }),
                    );
                    h = f
                      .filter(function (A) {
                        return !_.hasKey(t.values ? l(A) : A);
                      })
                      .concat(
                        t.values
                          ? m
                          : m.map(function (A) {
                              return l(A);
                            }),
                      );
                    break;
                  case 'delete':
                    var O = new oe().addKeys(d.keys);
                    h = f.filter(function (A) {
                      return !O.hasKey(t.values ? l(A) : A);
                    });
                    break;
                  case 'deleteRange':
                    var S = d.range;
                    h = f.filter(function (A) {
                      return !Zn(l(A), S);
                    });
                }
                return h;
              }, e);
            return v === e
              ? e
              : (v.sort(function (f, d) {
                  return B(s(f), s(d)) || B(l(f), l(d));
                }),
                t.limit &&
                  t.limit < 1 / 0 &&
                  (v.length > t.limit
                    ? (v.length = t.limit)
                    : e.length === t.limit &&
                      v.length < t.limit &&
                      (o.dirty = !0)),
                i ? Object.freeze(v) : v);
          }
          function Br(e, t) {
            return (
              B(e.lower, t.lower) === 0 &&
              B(e.upper, t.upper) === 0 &&
              !!e.lowerOpen == !!t.lowerOpen &&
              !!e.upperOpen == !!t.upperOpen
            );
          }
          function ho(e, t) {
            return (
              (function (n, r, o, i) {
                if (n === void 0) return r !== void 0 ? -1 : 0;
                if (r === void 0) return 1;
                if ((r = B(n, r)) === 0) {
                  if (o && i) return 0;
                  if (o) return 1;
                  if (i) return -1;
                }
                return r;
              })(e.lower, t.lower, e.lowerOpen, t.lowerOpen) <= 0 &&
              0 <=
                (function (n, r, o, i) {
                  if (n === void 0) return r !== void 0 ? 1 : 0;
                  if (r === void 0) return -1;
                  if ((r = B(n, r)) === 0) {
                    if (o && i) return 0;
                    if (o) return -1;
                    if (i) return 1;
                  }
                  return r;
                })(e.upper, t.upper, e.upperOpen, t.upperOpen)
            );
          }
          function po(e, t, n, r) {
            (e.subscribers.add(n),
              r.addEventListener('abort', function () {
                var o, i;
                (e.subscribers.delete(n),
                  e.subscribers.size === 0 &&
                    ((o = e),
                    (i = t),
                    setTimeout(function () {
                      o.subscribers.size === 0 && we(i, o);
                    }, 3e3)));
              }));
          }
          var mo = {
            stack: 'dbcore',
            level: 0,
            name: 'Cache',
            create: function (e) {
              var t = e.schema.name;
              return C(C({}, e), {
                transaction: function (n, r, o) {
                  var i,
                    a,
                    u = e.transaction(n, r, o);
                  return (
                    r === 'readwrite' &&
                      ((a = (i = new AbortController()).signal),
                      (o = function (c) {
                        return function () {
                          if ((i.abort(), r === 'readwrite')) {
                            for (
                              var l = new Set(), p = 0, s = n;
                              p < s.length;
                              p++
                            ) {
                              var v = s[p],
                                f = rt['idb://'.concat(t, '/').concat(v)];
                              if (f) {
                                var d = e.table(v),
                                  h = f.optimisticOps.filter(function (A) {
                                    return A.trans === u;
                                  });
                                if (u._explicit && c && u.mutatedParts)
                                  for (
                                    var m = 0,
                                      y = Object.values(f.queries.query);
                                    m < y.length;
                                    m++
                                  )
                                    for (
                                      var b = 0, g = (E = y[m]).slice();
                                      b < g.length;
                                      b++
                                    )
                                      Wn((_ = g[b]).obsSet, u.mutatedParts) &&
                                        (we(E, _),
                                        _.subscribers.forEach(function (A) {
                                          return l.add(A);
                                        }));
                                else if (0 < h.length) {
                                  f.optimisticOps = f.optimisticOps.filter(
                                    function (A) {
                                      return A.trans !== u;
                                    },
                                  );
                                  for (
                                    var w = 0,
                                      x = Object.values(f.queries.query);
                                    w < x.length;
                                    w++
                                  )
                                    for (
                                      var E,
                                        _,
                                        O,
                                        S = 0,
                                        P = (E = x[w]).slice();
                                      S < P.length;
                                      S++
                                    )
                                      (_ = P[S]).res != null &&
                                        u.mutatedParts &&
                                        (c && !_.dirty
                                          ? ((O = Object.isFrozen(_.res)),
                                            (O = qr(_.res, _.req, h, d, _, O)),
                                            _.dirty
                                              ? (we(E, _),
                                                _.subscribers.forEach(
                                                  function (A) {
                                                    return l.add(A);
                                                  },
                                                ))
                                              : O !== _.res &&
                                                ((_.res = O),
                                                (_.promise = K.resolve({
                                                  result: O,
                                                }))))
                                          : (_.dirty && we(E, _),
                                            _.subscribers.forEach(function (A) {
                                              return l.add(A);
                                            })));
                                }
                              }
                            }
                            l.forEach(function (A) {
                              return A();
                            });
                          }
                        };
                      }),
                      u.addEventListener('abort', o(!1), { signal: a }),
                      u.addEventListener('error', o(!1), { signal: a }),
                      u.addEventListener('complete', o(!0), { signal: a })),
                    u
                  );
                },
                table: function (n) {
                  var r = e.table(n),
                    o = r.schema.primaryKey;
                  return C(C({}, r), {
                    mutate: function (i) {
                      var a = j.trans;
                      if (
                        o.outbound ||
                        a.db._options.cache === 'disabled' ||
                        a.explicit ||
                        a.idbtrans.mode !== 'readwrite'
                      )
                        return r.mutate(i);
                      var u = rt['idb://'.concat(t, '/').concat(n)];
                      return u
                        ? ((a = r.mutate(i)),
                          (i.type !== 'add' && i.type !== 'put') ||
                          !(
                            50 <= i.values.length ||
                            Jn(o, i).some(function (c) {
                              return c == null;
                            })
                          )
                            ? (u.optimisticOps.push(i),
                              i.mutatedParts && an(i.mutatedParts),
                              a.then(function (c) {
                                0 < c.numFailures &&
                                  (we(u.optimisticOps, i),
                                  (c = Ir(0, i, c)) && u.optimisticOps.push(c),
                                  i.mutatedParts && an(i.mutatedParts));
                              }),
                              a.catch(function () {
                                (we(u.optimisticOps, i),
                                  i.mutatedParts && an(i.mutatedParts));
                              }))
                            : a.then(function (c) {
                                var l = Ir(
                                  0,
                                  C(C({}, i), {
                                    values: i.values.map(function (p, s) {
                                      var v;
                                      return c.failures[s]
                                        ? p
                                        : ((p =
                                            (v = o.keyPath) !== null &&
                                            v !== void 0 &&
                                            v.includes('.')
                                              ? pe(p)
                                              : C({}, p)),
                                          J(p, o.keyPath, c.results[s]),
                                          p);
                                    }),
                                  }),
                                  c,
                                );
                                (u.optimisticOps.push(l),
                                  queueMicrotask(function () {
                                    return i.mutatedParts && an(i.mutatedParts);
                                  }));
                              }),
                          a)
                        : r.mutate(i);
                    },
                    query: function (i) {
                      if (!Tr(j, r) || !Dr('query', i)) return r.query(i);
                      var a =
                          ((l = j.trans) === null || l === void 0
                            ? void 0
                            : l.db._options.cache) === 'immutable',
                        s = j,
                        u = s.requery,
                        c = s.signal,
                        l = (function (d, h, m, y) {
                          var b = rt['idb://'.concat(d, '/').concat(h)];
                          if (!b) return [];
                          if (!(h = b.queries[m])) return [null, !1, b, null];
                          var g =
                            h[(y.query ? y.query.index.name : null) || ''];
                          if (!g) return [null, !1, b, null];
                          switch (m) {
                            case 'query':
                              var w = g.find(function (x) {
                                return (
                                  x.req.limit === y.limit &&
                                  x.req.values === y.values &&
                                  Br(x.req.query.range, y.query.range)
                                );
                              });
                              return w
                                ? [w, !0, b, g]
                                : [
                                    g.find(function (x) {
                                      return (
                                        ('limit' in x.req
                                          ? x.req.limit
                                          : 1 / 0) >= y.limit &&
                                        (!y.values || x.req.values) &&
                                        ho(x.req.query.range, y.query.range)
                                      );
                                    }),
                                    !1,
                                    b,
                                    g,
                                  ];
                            case 'count':
                              return (
                                (w = g.find(function (x) {
                                  return Br(x.req.query.range, y.query.range);
                                })),
                                [w, !!w, b, g]
                              );
                          }
                        })(t, n, 'query', i),
                        p = l[0],
                        s = l[1],
                        v = l[2],
                        f = l[3];
                      return (
                        p && s
                          ? (p.obsSet = i.obsSet)
                          : ((s = r
                              .query(i)
                              .then(function (d) {
                                var h = d.result;
                                if ((p && (p.res = h), a)) {
                                  for (var m = 0, y = h.length; m < y; ++m)
                                    Object.freeze(h[m]);
                                  Object.freeze(h);
                                } else d.result = pe(h);
                                return d;
                              })
                              .catch(function (d) {
                                return (f && p && we(f, p), Promise.reject(d));
                              })),
                            (p = {
                              obsSet: i.obsSet,
                              promise: s,
                              subscribers: new Set(),
                              type: 'query',
                              req: i,
                              dirty: !1,
                            }),
                            f
                              ? f.push(p)
                              : ((f = [p]),
                                ((v =
                                  v ||
                                  (rt['idb://'.concat(t, '/').concat(n)] = {
                                    queries: { query: {}, count: {} },
                                    objs: new Map(),
                                    optimisticOps: [],
                                    unsignaledParts: {},
                                  })).queries.query[i.query.index.name || ''] =
                                  f))),
                        po(p, f, u, c),
                        p.promise.then(function (d) {
                          return {
                            result: qr(d.result, i, v?.optimisticOps, r, p, a),
                          };
                        })
                      );
                    },
                  });
                },
              });
            },
          };
          function sn(e, t) {
            return new Proxy(e, {
              get: function (n, r, o) {
                return r === 'db' ? t : Reflect.get(n, r, o);
              },
            });
          }
          var De =
            (($.prototype.version = function (e) {
              if (isNaN(e) || e < 0.1)
                throw new k.Type('Given version is not a positive number');
              if (
                ((e = Math.round(10 * e) / 10),
                this.idbdb || this._state.isBeingOpened)
              )
                throw new k.Schema('Cannot add version when database is open');
              this.verno = Math.max(this.verno, e);
              var t = this._versions,
                n = t.filter(function (r) {
                  return r._cfg.version === e;
                })[0];
              return (
                n ||
                ((n = new this.Version(e)),
                t.push(n),
                t.sort(ro),
                n.stores({}),
                (this._state.autoSchema = !1),
                n)
              );
            }),
            ($.prototype._whenReady = function (e) {
              var t = this;
              return this.idbdb &&
                (this._state.openComplete || j.letThrough || this._vip)
                ? e()
                : new K(function (n, r) {
                    if (t._state.openComplete)
                      return r(new k.DatabaseClosed(t._state.dbOpenError));
                    if (!t._state.isBeingOpened) {
                      if (!t._state.autoOpen)
                        return void r(new k.DatabaseClosed());
                      t.open().catch(R);
                    }
                    t._state.dbReadyPromise.then(n, r);
                  }).then(e);
            }),
            ($.prototype.use = function (e) {
              var t = e.stack,
                n = e.create,
                r = e.level,
                o = e.name;
              return (
                o && this.unuse({ stack: t, name: o }),
                (e = this._middlewares[t] || (this._middlewares[t] = [])),
                e.push({ stack: t, create: n, level: r ?? 10, name: o }),
                e.sort(function (i, a) {
                  return i.level - a.level;
                }),
                this
              );
            }),
            ($.prototype.unuse = function (e) {
              var t = e.stack,
                n = e.name,
                r = e.create;
              return (
                t &&
                  this._middlewares[t] &&
                  (this._middlewares[t] = this._middlewares[t].filter(
                    function (o) {
                      return r ? o.create !== r : !!n && o.name !== n;
                    },
                  )),
                this
              );
            }),
            ($.prototype.open = function () {
              var e = this;
              return et(Fe, function () {
                return uo(e);
              });
            }),
            ($.prototype._close = function () {
              this.on.close.fire(new CustomEvent('close'));
              var e = this._state,
                t = yt.indexOf(this);
              if ((0 <= t && yt.splice(t, 1), this.idbdb)) {
                try {
                  this.idbdb.close();
                } catch {}
                this.idbdb = null;
              }
              e.isBeingOpened ||
                ((e.dbReadyPromise = new K(function (n) {
                  e.dbReadyResolve = n;
                })),
                (e.openCanceller = new K(function (n, r) {
                  e.cancelOpen = r;
                })));
            }),
            ($.prototype.close = function (n) {
              var t = (n === void 0 ? { disableAutoOpen: !0 } : n)
                  .disableAutoOpen,
                n = this._state;
              t
                ? (n.isBeingOpened && n.cancelOpen(new k.DatabaseClosed()),
                  this._close(),
                  (n.autoOpen = !1),
                  (n.dbOpenError = new k.DatabaseClosed()))
                : (this._close(),
                  (n.autoOpen = this._options.autoOpen || n.isBeingOpened),
                  (n.openComplete = !1),
                  (n.dbOpenError = null));
            }),
            ($.prototype.delete = function (e) {
              var t = this;
              e === void 0 && (e = { disableAutoOpen: !0 });
              var n = 0 < arguments.length && typeof arguments[0] != 'object',
                r = this._state;
              return new K(function (o, i) {
                function a() {
                  t.close(e);
                  var u = t._deps.indexedDB.deleteDatabase(t.name);
                  ((u.onsuccess = V(function () {
                    var c, l, p;
                    ((c = t._deps),
                      (l = t.name),
                      (p = c.indexedDB),
                      (c = c.IDBKeyRange),
                      zn(p) || l === Wt || Un(p, c).delete(l).catch(R),
                      o());
                  })),
                    (u.onerror = ke(i)),
                    (u.onblocked = t._fireOnBlocked));
                }
                if (n)
                  throw new k.InvalidArgument(
                    'Invalid closeOptions argument to db.delete()',
                  );
                r.isBeingOpened ? r.dbReadyPromise.then(a) : a();
              });
            }),
            ($.prototype.backendDB = function () {
              return this.idbdb;
            }),
            ($.prototype.isOpen = function () {
              return this.idbdb !== null;
            }),
            ($.prototype.hasBeenClosed = function () {
              var e = this._state.dbOpenError;
              return e && e.name === 'DatabaseClosed';
            }),
            ($.prototype.hasFailed = function () {
              return this._state.dbOpenError !== null;
            }),
            ($.prototype.dynamicallyOpened = function () {
              return this._state.autoSchema;
            }),
            Object.defineProperty($.prototype, 'tables', {
              get: function () {
                var e = this;
                return L(this._allTables).map(function (t) {
                  return e._allTables[t];
                });
              },
              enumerable: !1,
              configurable: !0,
            }),
            ($.prototype.transaction = function () {
              var e = function (t, n, r) {
                var o = arguments.length;
                if (o < 2) throw new k.InvalidArgument('Too few arguments');
                for (var i = new Array(o - 1); --o; ) i[o - 1] = arguments[o];
                return ((r = i.pop()), [t, Rt(i), r]);
              }.apply(this, arguments);
              return this._transaction.apply(this, e);
            }),
            ($.prototype._transaction = function (e, t, n) {
              var r = this,
                o = j.trans;
              (o && o.db === this && e.indexOf('!') === -1) || (o = null);
              var i,
                a,
                u = e.indexOf('?') !== -1;
              e = e.replace('!', '').replace('?', '');
              try {
                if (
                  ((a = t.map(function (l) {
                    if (
                      ((l = l instanceof r.Table ? l.name : l),
                      typeof l != 'string')
                    )
                      throw new TypeError(
                        'Invalid table argument to Dexie.transaction(). Only Table or String are allowed',
                      );
                    return l;
                  })),
                  e == 'r' || e === Cn)
                )
                  i = Cn;
                else {
                  if (e != 'rw' && e != Tn)
                    throw new k.InvalidArgument(
                      'Invalid transaction mode: ' + e,
                    );
                  i = Tn;
                }
                if (o) {
                  if (o.mode === Cn && i === Tn) {
                    if (!u)
                      throw new k.SubTransaction(
                        'Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY',
                      );
                    o = null;
                  }
                  (o &&
                    a.forEach(function (l) {
                      if (o && o.storeNames.indexOf(l) === -1) {
                        if (!u)
                          throw new k.SubTransaction(
                            'Table ' +
                              l +
                              ' not included in parent transaction.',
                          );
                        o = null;
                      }
                    }),
                    u && o && !o.active && (o = null));
                }
              } catch (l) {
                return o
                  ? o._promise(null, function (p, s) {
                      s(l);
                    })
                  : W(l);
              }
              var c = function l(p, s, v, f, d) {
                return K.resolve().then(function () {
                  var h = j.transless || j,
                    m = p._createTransaction(s, v, p._dbSchema, f);
                  if (((m.explicit = !0), (h = { trans: m, transless: h }), f))
                    m.idbtrans = f.idbtrans;
                  else
                    try {
                      (m.create(),
                        (m.idbtrans._explicit = !0),
                        (p._state.PR1398_maxLoop = 3));
                    } catch (g) {
                      return g.name === je.InvalidState &&
                        p.isOpen() &&
                        0 < --p._state.PR1398_maxLoop
                        ? (console.warn('Dexie: Need to reopen db'),
                          p.close({ disableAutoOpen: !1 }),
                          p.open().then(function () {
                            return l(p, s, v, null, d);
                          }))
                        : W(g);
                    }
                  var y,
                    b = Ke(d);
                  return (
                    b && vt(),
                    (h = K.follow(function () {
                      var g;
                      (y = d.call(m, m)) &&
                        (b
                          ? ((g = Ne.bind(null, null)), y.then(g, g))
                          : typeof y.next == 'function' &&
                            typeof y.throw == 'function' &&
                            (y = Xn(y)));
                    }, h)),
                    (y && typeof y.then == 'function'
                      ? K.resolve(y).then(function (g) {
                          return m.active
                            ? g
                            : W(
                                new k.PrematureCommit(
                                  'Transaction committed too early. See http://bit.ly/2kdckMn',
                                ),
                              );
                        })
                      : h.then(function () {
                          return y;
                        })
                    )
                      .then(function (g) {
                        return (
                          f && m._resolve(),
                          m._completion.then(function () {
                            return g;
                          })
                        );
                      })
                      .catch(function (g) {
                        return (m._reject(g), W(g));
                      })
                  );
                });
              }.bind(null, this, i, a, o, n);
              return o
                ? o._promise(i, c, 'lock')
                : j.trans
                  ? et(j.transless, function () {
                      return r._whenReady(c);
                    })
                  : this._whenReady(c);
            }),
            ($.prototype.table = function (e) {
              if (!G(this._allTables, e))
                throw new k.InvalidTable('Table '.concat(e, ' does not exist'));
              return this._allTables[e];
            }),
            $);
          function $(e, t) {
            var n = this;
            ((this._middlewares = {}), (this.verno = 0));
            var r = $.dependencies;
            ((this._options = t =
              C(
                {
                  addons: $.addons,
                  autoOpen: !0,
                  indexedDB: r.indexedDB,
                  IDBKeyRange: r.IDBKeyRange,
                  cache: 'cloned',
                },
                t,
              )),
              (this._deps = {
                indexedDB: t.indexedDB,
                IDBKeyRange: t.IDBKeyRange,
              }),
              (r = t.addons),
              (this._dbSchema = {}),
              (this._versions = []),
              (this._storeNames = []),
              (this._allTables = {}),
              (this.idbdb = null),
              (this._novip = this));
            var o,
              i,
              a,
              u,
              c,
              l = {
                dbOpenError: null,
                isBeingOpened: !1,
                onReadyBeingFired: null,
                openComplete: !1,
                dbReadyResolve: R,
                dbReadyPromise: null,
                cancelOpen: R,
                openCanceller: null,
                autoSchema: !0,
                PR1398_maxLoop: 3,
                autoOpen: t.autoOpen,
              };
            ((l.dbReadyPromise = new K(function (s) {
              l.dbReadyResolve = s;
            })),
              (l.openCanceller = new K(function (s, v) {
                l.cancelOpen = v;
              })),
              (this._state = l),
              (this.name = e),
              (this.on = Kt(
                this,
                'populate',
                'blocked',
                'versionchange',
                'close',
                { ready: [xn, R] },
              )),
              (this.once = function (s, v) {
                var f = function () {
                  for (var d = [], h = 0; h < arguments.length; h++)
                    d[h] = arguments[h];
                  (n.on(s).unsubscribe(f), v.apply(n, d));
                };
                return n.on(s, f);
              }),
              (this.on.ready.subscribe = $e(
                this.on.ready.subscribe,
                function (s) {
                  return function (v, f) {
                    $.vip(function () {
                      var d,
                        h = n._state;
                      h.openComplete
                        ? (h.dbOpenError || K.resolve().then(v), f && s(v))
                        : h.onReadyBeingFired
                          ? (h.onReadyBeingFired.push(v), f && s(v))
                          : (s(v),
                            (d = n),
                            f ||
                              s(function m() {
                                (d.on.ready.unsubscribe(v),
                                  d.on.ready.unsubscribe(m));
                              }));
                    });
                  };
                },
              )),
              (this.Collection =
                ((o = this),
                At(Xr.prototype, function (y, m) {
                  this.db = o;
                  var f = fr,
                    d = null;
                  if (m)
                    try {
                      f = m();
                    } catch (b) {
                      d = b;
                    }
                  var h = y._ctx,
                    m = h.table,
                    y = m.hook.reading.fire;
                  this._ctx = {
                    table: m,
                    index: h.index,
                    isPrimKey:
                      !h.index ||
                      (m.schema.primKey.keyPath &&
                        h.index === m.schema.primKey.name),
                    range: f,
                    keysOnly: !1,
                    dir: 'next',
                    unique: '',
                    algorithm: null,
                    filter: null,
                    replayFilter: null,
                    justLimit: !0,
                    isMatch: null,
                    offset: 0,
                    limit: 1 / 0,
                    error: d,
                    or: h.or,
                    valueMapper: y !== Qe ? y : null,
                  };
                }))),
              (this.Table =
                ((i = this),
                At(yr.prototype, function (s, v, f) {
                  ((this.db = i),
                    (this._tx = f),
                    (this.name = s),
                    (this.schema = v),
                    (this.hook = i._allTables[s]
                      ? i._allTables[s].hook
                      : Kt(null, {
                          creating: [_n, R],
                          reading: [wn, Qe],
                          updating: [zr, R],
                          deleting: [Ur, R],
                        })));
                }))),
              (this.Transaction =
                ((a = this),
                At(Zr.prototype, function (s, v, f, d, h) {
                  var m = this;
                  (s !== 'readonly' &&
                    v.forEach(function (y) {
                      ((y =
                        (y = f[y]) === null || y === void 0
                          ? void 0
                          : y.yProps),
                        y &&
                          (v = v.concat(
                            y.map(function (b) {
                              return b.updatesTable;
                            }),
                          )));
                    }),
                    (this.db = a),
                    (this.mode = s),
                    (this.storeNames = v),
                    (this.schema = f),
                    (this.chromeTransactionDurability = d),
                    (this.idbtrans = null),
                    (this.on = Kt(this, 'complete', 'error', 'abort')),
                    (this.parent = h || null),
                    (this.active = !0),
                    (this._reculock = 0),
                    (this._blockedFuncs = []),
                    (this._resolve = null),
                    (this._reject = null),
                    (this._waitingFor = null),
                    (this._waitingQueue = null),
                    (this._spinCount = 0),
                    (this._completion = new K(function (y, b) {
                      ((m._resolve = y), (m._reject = b));
                    })),
                    this._completion.then(
                      function () {
                        ((m.active = !1), m.on.complete.fire());
                      },
                      function (y) {
                        var b = m.active;
                        return (
                          (m.active = !1),
                          m.on.error.fire(y),
                          m.parent
                            ? m.parent._reject(y)
                            : b && m.idbtrans && m.idbtrans.abort(),
                          W(y)
                        );
                      },
                    ));
                }))),
              (this.Version =
                ((u = this),
                At(ao.prototype, function (s) {
                  ((this.db = u),
                    (this._cfg = {
                      version: s,
                      storesSource: null,
                      dbschema: {},
                      tables: {},
                      contentUpgrade: null,
                    }));
                }))),
              (this.WhereClause =
                ((c = this),
                At(xr.prototype, function (s, v, f) {
                  if (
                    ((this.db = c),
                    (this._ctx = {
                      table: s,
                      index: v === ':id' ? null : v,
                      or: f,
                    }),
                    (this._cmp = this._ascending = B),
                    (this._descending = function (d, h) {
                      return B(h, d);
                    }),
                    (this._max = function (d, h) {
                      return 0 < B(d, h) ? d : h;
                    }),
                    (this._min = function (d, h) {
                      return B(d, h) < 0 ? d : h;
                    }),
                    (this._IDBKeyRange = c._deps.IDBKeyRange),
                    !this._IDBKeyRange)
                  )
                    throw new k.MissingAPI();
                }))),
              this.on('versionchange', function (s) {
                (0 < s.newVersion
                  ? console.warn(
                      "Another connection wants to upgrade database '".concat(
                        n.name,
                        "'. Closing db now to resume the upgrade.",
                      ),
                    )
                  : console.warn(
                      "Another connection wants to delete database '".concat(
                        n.name,
                        "'. Closing db now to resume the delete request.",
                      ),
                    ),
                  n.close({ disableAutoOpen: !1 }));
              }),
              this.on('blocked', function (s) {
                !s.newVersion || s.newVersion < s.oldVersion
                  ? console.warn(
                      "Dexie.delete('".concat(n.name, "') was blocked"),
                    )
                  : console.warn(
                      "Upgrade '"
                        .concat(
                          n.name,
                          "' blocked by other connection holding version ",
                        )
                        .concat(s.oldVersion / 10),
                    );
              }),
              (this._maxKey = Tt(t.IDBKeyRange)),
              (this._createTransaction = function (s, v, f, d) {
                return new n.Transaction(
                  s,
                  v,
                  f,
                  n._options.chromeTransactionDurability,
                  d,
                );
              }),
              (this._fireOnBlocked = function (s) {
                (n.on('blocked').fire(s),
                  yt
                    .filter(function (v) {
                      return v.name === n.name && v !== n && !v._state.vcFired;
                    })
                    .map(function (v) {
                      return v.on('versionchange').fire(s);
                    }));
              }),
              this.use(lo),
              this.use(mo),
              this.use(fo),
              this.use(so),
              this.use(co));
            var p = new Proxy(this, {
              get: function (s, v, f) {
                if (v === '_vip') return !0;
                if (v === 'table')
                  return function (h) {
                    return sn(n.table(h), p);
                  };
                var d = Reflect.get(s, v, f);
                return d instanceof yr
                  ? sn(d, p)
                  : v === 'tables'
                    ? d.map(function (h) {
                        return sn(h, p);
                      })
                    : v === '_createTransaction'
                      ? function () {
                          return sn(d.apply(this, arguments), p);
                        }
                      : d;
              },
            });
            ((this.vip = p),
              r.forEach(function (s) {
                return s(n);
              }));
          }
          var cn,
            me =
              typeof Symbol < 'u' && 'observable' in Symbol
                ? Symbol.observable
                : '@@observable',
            vo =
              ((er.prototype.subscribe = function (e, t, n) {
                return this._subscribe(
                  e && typeof e != 'function'
                    ? e
                    : { next: e, error: t, complete: n },
                );
              }),
              (er.prototype[me] = function () {
                return this;
              }),
              er);
          function er(e) {
            this._subscribe = e;
          }
          try {
            cn = {
              indexedDB:
                N.indexedDB ||
                N.mozIndexedDB ||
                N.webkitIndexedDB ||
                N.msIndexedDB,
              IDBKeyRange: N.IDBKeyRange || N.webkitIDBKeyRange,
            };
          } catch {
            cn = { indexedDB: null, IDBKeyRange: null };
          }
          function Rr(e) {
            var t,
              n = !1,
              r = new vo(function (o) {
                var i = Ke(e),
                  a,
                  u = !1,
                  c = {},
                  l = {},
                  p = {
                    get closed() {
                      return u;
                    },
                    unsubscribe: function () {
                      u ||
                        ((u = !0),
                        a && a.abort(),
                        s && ze.storagemutated.unsubscribe(f));
                    },
                  };
                o.start && o.start(p);
                var s = !1,
                  v = function () {
                    return jn(d);
                  },
                  f = function (h) {
                    (on(c, h), Wn(l, c) && v());
                  },
                  d = function () {
                    var h, m, y;
                    !u &&
                      cn.indexedDB &&
                      ((c = {}),
                      (h = {}),
                      a && a.abort(),
                      (a = new AbortController()),
                      (y = (function (b) {
                        var g = pt();
                        try {
                          i && vt();
                          var w = Me(e, b);
                          return (w = i ? w.finally(Ne) : w);
                        } finally {
                          g && mt();
                        }
                      })(
                        (m = {
                          subscr: h,
                          signal: a.signal,
                          requery: v,
                          querier: e,
                          trans: null,
                        }),
                      )),
                      Promise.resolve(y).then(
                        function (b) {
                          ((n = !0),
                            (t = b),
                            u ||
                              m.signal.aborted ||
                              ((c = {}),
                              (function (g) {
                                for (var w in g) if (G(g, w)) return;
                                return 1;
                              })((l = h)) ||
                                s ||
                                (ze(Ct, f), (s = !0)),
                              jn(function () {
                                return !u && o.next && o.next(b);
                              })));
                        },
                        function (b) {
                          ((n = !1),
                            ['DatabaseClosedError', 'AbortError'].includes(
                              b?.name,
                            ) ||
                              u ||
                              jn(function () {
                                u || (o.error && o.error(b));
                              }));
                        },
                      ));
                  };
                return (setTimeout(v, 0), p);
              });
            return (
              (r.hasValue = function () {
                return n;
              }),
              (r.getValue = function () {
                return t;
              }),
              r
            );
          }
          var ot = De;
          function tr(e) {
            var t = Ve;
            try {
              ((Ve = !0), ze.storagemutated.fire(e), Qn(e, !0));
            } finally {
              Ve = t;
            }
          }
          (ye(
            ot,
            C(C({}, Re), {
              delete: function (e) {
                return new ot(e, { addons: [] }).delete();
              },
              exists: function (e) {
                return new ot(e, { addons: [] })
                  .open()
                  .then(function (t) {
                    return (t.close(), !0);
                  })
                  .catch('NoSuchDatabaseError', function () {
                    return !1;
                  });
              },
              getDatabaseNames: function (e) {
                try {
                  return (
                    (t = ot.dependencies),
                    (n = t.indexedDB),
                    (t = t.IDBKeyRange),
                    (zn(n)
                      ? Promise.resolve(n.databases()).then(function (r) {
                          return r
                            .map(function (o) {
                              return o.name;
                            })
                            .filter(function (o) {
                              return o !== Wt;
                            });
                        })
                      : Un(n, t).toCollection().primaryKeys()
                    ).then(e)
                  );
                } catch {
                  return W(new k.MissingAPI());
                }
                var t, n;
              },
              defineClass: function () {
                return function (e) {
                  Y(this, e);
                };
              },
              ignoreTransaction: function (e) {
                return j.trans ? et(j.transless, e) : e();
              },
              vip: Vn,
              async: function (e) {
                return function () {
                  try {
                    var t = Xn(e.apply(this, arguments));
                    return t && typeof t.then == 'function' ? t : K.resolve(t);
                  } catch (n) {
                    return W(n);
                  }
                };
              },
              spawn: function (e, t, n) {
                try {
                  var r = Xn(e.apply(n, t || []));
                  return r && typeof r.then == 'function' ? r : K.resolve(r);
                } catch (o) {
                  return W(o);
                }
              },
              currentTransaction: {
                get: function () {
                  return j.trans || null;
                },
              },
              waitFor: function (e, t) {
                return (
                  (t = K.resolve(
                    typeof e == 'function' ? ot.ignoreTransaction(e) : e,
                  ).timeout(t || 6e4)),
                  j.trans ? j.trans.waitFor(t) : t
                );
              },
              Promise: K,
              debug: {
                get: function () {
                  return xe;
                },
                set: function (e) {
                  or(e);
                },
              },
              derive: qe,
              extend: Y,
              props: ye,
              override: $e,
              Events: Kt,
              on: ze,
              liveQuery: Rr,
              extendObservabilitySet: on,
              getByKeyPath: he,
              setByKeyPath: J,
              delByKeyPath: function (e, t) {
                typeof t == 'string'
                  ? J(e, t, void 0)
                  : 'length' in t &&
                    [].map.call(t, function (n) {
                      J(e, n, void 0);
                    });
              },
              shallowClone: lt,
              deepClone: pe,
              getObjectDiff: Hn,
              cmp: B,
              asap: ct,
              minKey: -1 / 0,
              addons: [],
              connections: yt,
              errnames: je,
              dependencies: cn,
              cache: rt,
              semVer: '4.2.1',
              version: '4.2.1'
                .split('.')
                .map(function (e) {
                  return parseInt(e);
                })
                .reduce(function (e, t, n) {
                  return e + t / Math.pow(10, 2 * n);
                }),
            }),
          ),
            (ot.maxKey = Tt(ot.dependencies.IDBKeyRange)),
            typeof dispatchEvent < 'u' &&
              typeof addEventListener < 'u' &&
              (ze(Ct, function (e) {
                Ve ||
                  ((e = new CustomEvent(qn, { detail: e })),
                  (Ve = !0),
                  dispatchEvent(e),
                  (Ve = !1));
              }),
              addEventListener(qn, function (e) {
                ((e = e.detail), Ve || tr(e));
              })));
          var _t,
            Ve = !1,
            Fr = function () {};
          return (
            typeof BroadcastChannel < 'u' &&
              ((Fr = function () {
                (_t = new BroadcastChannel(qn)).onmessage = function (e) {
                  return e.data && tr(e.data);
                };
              })(),
              typeof _t.unref == 'function' && _t.unref(),
              ze(Ct, function (e) {
                Ve || _t.postMessage(e);
              })),
            typeof addEventListener < 'u' &&
              (addEventListener('pagehide', function (e) {
                if (!De.disableBfCache && e.persisted) {
                  (xe && console.debug('Dexie: handling persisted pagehide'),
                    _t?.close());
                  for (var t = 0, n = yt; t < n.length; t++)
                    n[t].close({ disableAutoOpen: !1 });
                }
              }),
              addEventListener('pageshow', function (e) {
                !De.disableBfCache &&
                  e.persisted &&
                  (xe && console.debug('Dexie: handling persisted pageshow'),
                  Fr(),
                  tr({ all: new oe(-1 / 0, [[]]) }));
              })),
            (K.rejectionMapper = function (e, t) {
              return !e ||
                e instanceof _e ||
                e instanceof TypeError ||
                e instanceof SyntaxError ||
                !e.name ||
                !Z[e.name]
                ? e
                : ((t = new Z[e.name](t || e.message, e)),
                  'stack' in e &&
                    be(t, 'stack', {
                      get: function () {
                        return this.inner.stack;
                      },
                    }),
                  t);
            }),
            or(xe),
            C(
              De,
              Object.freeze({
                __proto__: null,
                Dexie: De,
                liveQuery: Rr,
                Entity: dr,
                cmp: B,
                PropModification: St,
                replacePrefix: function (e, t) {
                  return new St({ replacePrefix: [e, t] });
                },
                add: function (e) {
                  return new St({ add: e });
                },
                remove: function (e) {
                  return new St({ remove: e });
                },
                default: De,
                RangeSet: oe,
                mergeRanges: qt,
                rangesOverlap: Sr,
              }),
              { default: De },
            ),
            De
          );
        });
      })(dn)),
    dn.exports
  );
}
var Co = jo();
const rr = Ko(Co),
  Lr = Symbol.for('Dexie'),
  hn = globalThis[Lr] || (globalThis[Lr] = rr);
if (rr.semVer !== hn.semVer)
  throw new Error(
    `Two different versions of Dexie loaded in the same app: ${rr.semVer} and ${hn.semVer}`,
  );
const {
  liveQuery: Yo,
  mergeRanges: Wo,
  rangesOverlap: $o,
  RangeSet: Go,
  cmp: Qo,
  Entity: Xo,
  PropModification: Ho,
  replacePrefix: Jo,
  add: Zo,
  remove: ei,
  DexieYProvider: ti,
} = hn;
class To extends hn {
  areas;
  items;
  constructor() {
    (super('lmup'),
      this.version(1).stores({
        areas: '++id, nome',
        items: '++id, areaId, nome, xp, done',
      }));
  }
}
const Ie = new To();
async function Do() {
  const [ne, at] = await Promise.all([Ie.areas.toArray(), Ie.items.toArray()]),
    re = {
      version: 1,
      exportedAt: new Date().toISOString(),
      areas: ne,
      items: at,
    },
    C = new Blob([JSON.stringify(re, null, 2)], {
      type: 'application/json;charset=utf-8',
    }),
    H = await Po(
      () => import('./B5L0ib5B.js').then((L) => L.F),
      [],
      import.meta.url,
    ),
    N = H.saveAs || (H.default && H.default.saveAs);
  if (!N) {
    console.error('Não foi possível carregar saveAs de file-saver');
    return;
  }
  N(C, 'lmup-backup.json');
}
async function Io(ne) {
  const at = await ne.text();
  let re;
  try {
    re = JSON.parse(at);
  } catch (N) {
    throw (
      console.error('Erro ao parsear backup:', N),
      new Error('Arquivo de backup inválido')
    );
  }
  if (!re || typeof re != 'object')
    throw new Error('Arquivo de backup inválido');
  const C = Array.isArray(re.areas) ? re.areas : [],
    H = Array.isArray(re.items) ? re.items : [];
  await Ie.transaction('rw', Ie.areas, Ie.items, async () => {
    (await Promise.all([Ie.areas.clear(), Ie.items.clear()]),
      C.length && (await Ie.areas.bulkAdd(C)),
      H.length && (await Ie.items.bulkAdd(H)));
  });
}
var qo =
  yo(`<section class="w-full mb-8"><div class="config-card mx-auto max-w-3xl overflow-hidden relative"><div class="pointer-events-none absolute -inset-px bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_transparent_60%)] opacity-70" aria-hidden="true"></div> <div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><header class="mb-6"><div class="settings-subcard rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 text-center shadow-[0_0_40px_rgba(56,189,248,0.55)]"><h2 class="text-2xl md:text-3xl font-extrabold text-sky-50">Configurações &amp; Backup</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-slate-200/85">Guarde seu progresso em segurança, restaure seus dados quando
            precisar e ative encantamentos para deixar a experiência mais
            confortável.</p></div></header> <div class="settings-subcard mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/25 text-violet-100">🕯️</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Encantamento sombrio</p> <span class="rounded-full border border-violet-300/70 bg-violet-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-100">Em breve</span></div> <p class="text-xs text-slate-300/80 max-w-md">Encanta o seu reino com as trevas ou com a luz. Use com cuidado.</p></div></div> <button type="button" role="switch" aria-label="Ativar ou desativar encantamento sombrio"><span></span></button></div> <div class="space-y-3"><div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">📜</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Grimório de backup</p> <span class="rounded-full border border-violet-400/60 bg-violet-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-200">Raro</span></div> <p class="text-xs text-slate-300/80 max-w-md">Aprisiona as memórias do seu reino num grimório em <code>.json</code>, para que possa levar e restaurar em qualquer lugar.</p></div></div> <button type="button" class="rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-400 disabled:opacity-60"> </button></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(16,185,129,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">🧪</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Ritual de restauração</p> <span class="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-emerald-200">Épico</span></div> <p class="text-xs text-slate-300/80 max-w-md">Importe um grimório em <code>.json</code> criado por um herói, para
                trazer de volta as memórias de seu reino, com suas áreas, missões
                e XP.</p> <p class="mt-1 text-[0.65rem] text-amber-200/80">Atenção: este ritual substituirá o reino atual pelo do grimório
                utilizado. E este será jogado em trevas sombrias e ranger de
                dentes!.</p></div></div> <button type="button" class="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-60"> </button> <input type="file" accept="application/json" class="hidden"/></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/25 text-sky-200">☁️</div> <div class="flex-1"><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Sincronia estelar</p> <span class="rounded-full border border-sky-400/60 bg-sky-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-sky-200">Em breve</span></div> <p class="text-xs text-slate-200/85 max-w-md">Futuramente você poderá sincronizar seu reino com as estrelas e
                o cosmos, para nunca perder o seu reino e legado de aprendizado
                e desenvolvimento.</p></div></div> <button type="button" class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-60" disabled title="Sincronização com a nuvem será habilitada em breve">Sincronizar</button></div></div> <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"></div> <div class="space-y-4"><div class="rounded-2xl border border-emerald-500/70 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 px-4 py-4 text-center shadow-[0_0_45px_rgba(16,185,129,0.85)]"><h2 class="text-2xl md:text-3xl font-extrabold text-emerald-100">Neurodiversidade</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-emerald-50/80">Ajustes suaves para foco, legibilidade e redução de estímulos
            visuais. Pense nisso como encantamentos opcionais para o seu
            cérebro.</p></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Modo foco</p> <p class="text-xs text-slate-300/80 max-w-md">Reduz brilhos e sombras intensas para diminuir distrações visuais.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar modo foco"><span></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Texto maior</p> <p class="text-xs text-slate-300/80 max-w-md">Aumenta levemente o tamanho base das fontes para leitura mais
              confortável.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar texto maior"><span></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Estímulos suaves</p> <p class="text-xs text-slate-300/80 max-w-md">Encurta animações e transições para que nada fique piscando por
              muito tempo na tela.</p></div> <button type="button" role="switch" aria-label="Ativar ou desativar estímulos suaves"><span></span></button></div></div></div></div></section>`);
function Bo(ne, at) {
  wo(at, !0);
  const re = 'lmup:neuro-prefs';
  let C = xt(!1),
    H = xt(!1),
    N = xt(!1),
    L = xt(!1),
    M = xt(!1),
    Y = xt(!1),
    de = null;
  function ut() {
    return { focusMode: z(L), largeText: z(M), lowStimulus: z(Y) };
  }
  function G(k) {
    const Z = document.documentElement;
    ((Z.dataset.neuroFocus = k.focusMode ? 'true' : 'false'),
      (Z.dataset.neuroLargeText = k.largeText ? 'true' : 'false'),
      (Z.dataset.neuroLowStimulus = k.lowStimulus ? 'true' : 'false'));
  }
  function ye(k) {
    localStorage.setItem(re, JSON.stringify(k));
  }
  go(() => {
    const k = localStorage.getItem(re);
    if (k)
      try {
        const Z = JSON.parse(k);
        (ve(L, !!Z.focusMode), ve(M, !!Z.largeText), ve(Y, !!Z.lowStimulus));
      } catch {}
    G(ut());
  });
  function Bt() {
    ve(L, !z(L));
    const k = ut();
    (G(k), ye(k));
  }
  function be() {
    ve(M, !z(M));
    const k = ut();
    (G(k), ye(k));
  }
  function qe() {
    ve(Y, !z(Y));
    const k = ut();
    (G(k), ye(k));
  }
  async function pn() {
    if (!z(C)) {
      ve(C, !0);
      try {
        await Do();
      } catch (k) {
        (console.error(k), alert('Erro ao exportar dados. Tente novamente.'));
      } finally {
        ve(C, !1);
      }
    }
  }
  function mn() {
    z(H) || (de && ((de.value = ''), de.click()));
  }
  async function st(k) {
    const Z = k.target;
    if (!Z.files || Z.files.length === 0) return;
    const Re = Z.files[0];
    ve(H, !0);
    try {
      (await Io(Re),
        (Z.value = ''),
        alert(
          'Backup importado com sucesso! Recarregue a página para ver as mudanças.',
        ));
    } catch (R) {
      (console.error(R),
        alert(
          'Erro ao importar backup. Verifique o arquivo .json e tente novamente.',
        ));
    } finally {
      ve(H, !1);
    }
  }
  function $e(k) {
    return k
      ? 'inline-flex h-7 w-12 items-center rounded-full bg-emerald-400/90 px-1 transition-colors'
      : 'inline-flex h-7 w-12 items-center rounded-full bg-slate-700/80 px-1 transition-colors';
  }
  function ge(k) {
    return k
      ? 'h-5 w-5 translate-x-5 rounded-full bg-slate-950 shadow transition-transform'
      : 'h-5 w-5 translate-x-0 rounded-full bg-slate-300 shadow transition-transform';
  }
  var ct = qo(),
    he = ee(ct),
    J = se(ee(he), 2),
    lt = se(ee(J), 2),
    Ge = se(ee(lt), 2);
  Ge.__click = () => ve(N, !z(N));
  var Rt = ee(Ge);
  (te(Ge), te(lt));
  var ft = se(lt, 2),
    Pe = ee(ft),
    pe = se(ee(Pe), 2);
  pe.__click = pn;
  var vn = ee(pe, !0);
  (te(pe), te(Pe));
  var dt = se(Pe, 2),
    Ee = se(ee(dt), 2);
  Ee.__click = mn;
  var yn = ee(Ee, !0);
  te(Ee);
  var we = se(Ee, 2);
  ((we.__change = st),
    Eo(
      we,
      (k) => (de = k),
      () => de,
    ),
    te(dt),
    ko(2),
    te(ft));
  var Se = se(ft, 4),
    ce = se(ee(Se), 2),
    Ke = se(ee(ce), 2);
  Ke.__click = Bt;
  var bn = ee(Ke);
  (te(Ke), te(ce));
  var _e = se(ce, 2),
    Be = se(ee(_e), 2);
  Be.__click = be;
  var ht = ee(Be);
  (te(Be), te(_e));
  var Ae = se(_e, 2),
    je = se(ee(Ae), 2);
  je.__click = qe;
  var gn = ee(je);
  (te(je),
    te(Ae),
    te(Se),
    te(J),
    te(he),
    te(ct),
    _o(
      (k, Z, Re, R, Qe, wn, Ce, _n) => {
        (Ye(Ge, 1, k),
          fn(Ge, 'aria-checked', z(N)),
          Ye(Rt, 1, Z),
          (pe.disabled = z(C)),
          Mr(vn, z(C) ? 'Gerando...' : 'Exportar dados'),
          (Ee.disabled = z(H)),
          Mr(yn, z(H) ? 'Importando...' : 'Importar backup'),
          Ye(Ke, 1, Re),
          fn(Ke, 'aria-checked', z(L)),
          Ye(bn, 1, R),
          Ye(Be, 1, Qe),
          fn(Be, 'aria-checked', z(M)),
          Ye(ht, 1, wn),
          Ye(je, 1, Ce),
          fn(je, 'aria-checked', z(Y)),
          Ye(gn, 1, _n));
      },
      [
        () => We($e(z(N))),
        () => We(ge(z(N))),
        () => We($e(z(L))),
        () => We(ge(z(L))),
        () => We($e(z(M))),
        () => We(ge(z(M))),
        () => We($e(z(Y))),
        () => We(ge(z(Y))),
      ],
    ),
    bo(ne, ct),
    xo());
}
Oo(['click', 'change']);
function ni(ne) {
  Bo(ne, {});
}
export { ni as _, So as c, Ko as g };
